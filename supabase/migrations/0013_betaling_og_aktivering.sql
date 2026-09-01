-- ============================================================================
-- Relavo — betaling og aktivering
--
-- To veier inn, og de er ikke like vanlige. Norsk offentlig sektor betaler
-- mot faktura; EHF er lovpålagt for leverandører til det offentlige. Kort er
-- for de private kundene på engangsplanen. Begge finnes, men fakturaveien er
-- den som må være hel.
--
-- Kortveien: Stripe Checkout. Betalingen skjer hos Stripe, kortnummeret tar
-- vi aldri imot, og kontoen åpnes når Stripe bekrefter at den er betalt.
--
-- Fakturaveien: kunden ber om faktura, vi kredittvurderer, og kontoen åpnes
-- ved godkjent kontroll — ikke ved mottatt betaling. En kommune er ingen
-- kredittrisiko, og fire ukers venting mister kunden.
--
-- Forskuddsfaktura finnes som eget steg for dem vi ikke vil ta sjansen på:
-- da settes forskuddsbetaling, og kontoen står i venter_betaling til noen
-- hos oss markerer at pengene er kommet.
--
-- MERK: aktivert_av lager en andre fremmednøkkel mellom organisasjoner og
-- profiler. Da vet ikke PostgREST lenger hvilken «organisasjoner(...)» en
-- embed fra profiler sikter til, og spørringen feiler. Alle slike spørringer
-- må navngi nøkkelen: organisasjoner!profiler_organisasjon_id_fkey(...).
-- ============================================================================

alter table organisasjoner
  add column if not exists status text not null default 'aktiv'
    check (status in ('venter_kreditt', 'venter_betaling', 'aktiv', 'avslatt', 'stengt')),
  add column if not exists betalingsmate text
    check (betalingsmate in ('kort', 'faktura')),
  add column if not exists forskuddsbetaling boolean not null default false,
  add column if not exists aktivert timestamptz,
  add column if not exists aktivert_av uuid references profiler(id),
  add column if not exists avslag_grunn text,
  add column if not exists stripe_kunde_id text,
  add column if not exists stripe_okt_id text,
  add column if not exists bestilt timestamptz;

comment on column organisasjoner.status is
  'aktiv er standard slik at organisasjoner opprettet før dette fortsetter å virke.';
comment on column organisasjoner.forskuddsbetaling is
  'Settes av oss når vi vil ha pengene før kontoen åpnes.';

create index if not exists organisasjoner_status on organisasjoner (status)
  where status <> 'aktiv';

drop policy if exists "Personal ser alle organisasjoner" on organisasjoner;
create policy "Personal ser alle organisasjoner" on organisasjoner
  for select using (er_ansatt());

drop policy if exists "Personal endrer organisasjoner" on organisasjoner;
create policy "Personal endrer organisasjoner" on organisasjoner
  for update using (er_ansatt()) with check (er_ansatt());

-- Nye organisasjoner starter uten bestilling.
create or replace function opprett_organisasjon(
  p_navn text, p_brukernavn text, p_org_nr text default null, p_plan text default 'standard'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_bruker uuid := auth.uid(); v_org uuid;
begin
  if v_bruker is null then raise exception 'Ikke innlogget'; end if;
  if btrim(coalesce(p_navn, '')) = '' then raise exception 'Organisasjonen må ha et navn'; end if;
  if btrim(coalesce(p_brukernavn, '')) = '' then raise exception 'Du må oppgi ditt eget navn'; end if;
  if exists (select 1 from profiler where id = v_bruker) then
    raise exception 'Kontoen hører allerede til en organisasjon';
  end if;

  insert into organisasjoner (navn, org_nr, plan, status)
  values (btrim(p_navn), nullif(btrim(coalesce(p_org_nr, '')), ''), p_plan, 'venter_kreditt')
  returning id into v_org;

  insert into profiler (id, organisasjon_id, navn, rolle)
  values (v_bruker, v_org, btrim(p_brukernavn), 'administrator');

  return v_org;
end; $$;

-- Kunden bestiller. Administratorkravet er ikke pynt: en vanlig bruker skal
-- ikke kunne binde organisasjonen til en avtale.
create or replace function bestill_plan(p_plan text, p_betalingsmate text)
returns text language plpgsql security definer set search_path = public as $$
declare v_org uuid := min_organisasjon(); v_rolle text := min_rolle(); v_ny text;
begin
  if v_org is null then raise exception 'Ingen organisasjon'; end if;
  if v_rolle is distinct from 'administrator' then raise exception 'Bare administrator kan bestille'; end if;
  if p_plan not in ('engangs', 'standard', 'enterprise') then raise exception 'Ukjent plan'; end if;
  if p_betalingsmate not in ('kort', 'faktura') then raise exception 'Ukjent betalingsmåte'; end if;

  v_ny := case when p_betalingsmate = 'kort' then 'venter_betaling' else 'venter_kreditt' end;

  update organisasjoner
     set plan = p_plan, betalingsmate = p_betalingsmate, bestilt = now(),
         status = v_ny, avslag_grunn = null
   where id = v_org and status in ('venter_kreditt', 'venter_betaling', 'avslatt');

  if p_betalingsmate = 'faktura' then
    insert into interne_varsler (slag, tittel, tekst, lenke)
    select 'ny_bestilling', o.navn || ' har bestilt ' || p_plan || ' mot faktura',
           'Venter på kredittkontroll.', '/internt/onboarding'
      from organisasjoner o where o.id = v_org;
  end if;

  return v_ny;
end; $$;

grant execute on function bestill_plan(text, text) to authenticated;
