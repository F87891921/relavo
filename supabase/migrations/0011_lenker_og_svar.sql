-- ============================================================================
-- Relavo — delbare lenker: ESPD-ettersending og tilbud
--
-- To motparter skal kunne gjøre noe uten å ha en konto hos oss: leverandøren
-- som skal ettersende en egenerklæring, og kunden som skal ta stilling til et
-- tilbud. Begge får en lenke med et tilfeldig token.
--
-- Token er nøkkelen. Derfor går ingen av de to sidene gjennom Row Level
-- Security med en innlogget bruker — de kaller security definer-funksjoner
-- som tar token som argument og ikke kan lekke noe annet. Uten token finnes
-- det ingen vei inn, og med feil token finnes det ingen rad.
--
-- Merk at dette flytter en grense: alt annet i Relavo krever innlogging.
-- Disse to sidene må også unntas fra passordsperren i middleware, ellers
-- møter mottakeren en passordrute i stedet for det de ble bedt om.
-- ============================================================================

-- ---------------------------------------------------------------- ESPD ----

alter table espd_erklaringer
  -- Brevet slik det faktisk ble sendt. Kunden kan skrive om utkastet, og da
  -- er det den teksten som gjelder — ikke malen, som kan endres senere.
  add column if not exists utkast text,
  add column if not exists token uuid unique default gen_random_uuid(),
  add column if not exists levert timestamptz,
  add column if not exists levert_filsti text,
  add column if not exists levert_filnavn text,
  add column if not exists signert_navn text,
  add column if not exists signert_rolle text,
  add column if not exists signert_bekreftet boolean not null default false;

-- Rader som fantes før denne migrasjonen har ingen token.
update espd_erklaringer set token = gen_random_uuid() where token is null;

comment on column espd_erklaringer.signert_bekreftet is
  'Leverandøren har krysset av for at opplysningene er riktige. Ikke en '
  'digital signatur med sertifikat — det gjør konkurransegjennomføringen. '
  'Dette er en bekreftelse med navn, rolle og tidspunkt, som dokumenterer '
  'hvem som sto bak innsendingen.';

-- ------------------------------------------------------------- Offerter ----

alter table offerter
  add column if not exists token uuid unique default gen_random_uuid(),
  add column if not exists sendt timestamptz,
  add column if not exists sendt_av uuid references profiler(id),
  add column if not exists sett timestamptz,
  add column if not exists svar text check (svar in ('akseptert', 'avslatt')),
  add column if not exists svar_kommentar text,
  add column if not exists svar_navn text,
  add column if not exists svar_tid timestamptz;

update offerter set token = gen_random_uuid() where token is null;

-- --------------------------------------------------------------- Varsler ---
-- Personalen skal få vite når en kunde svarer, uten å måtte gå inn og se
-- etter. Varselet peker på siden der man gjør noe med det.
create table if not exists interne_varsler (
  id uuid primary key default gen_random_uuid(),
  slag text not null,
  tittel text not null,
  tekst text,
  lenke text,
  lest timestamptz,
  opprettet timestamptz not null default now()
);

create index if not exists interne_varsler_ulest
  on interne_varsler (opprettet desc) where lest is null;

alter table interne_varsler enable row level security;

create policy "Personal ser varsler" on interne_varsler
  for all using (er_ansatt()) with check (er_ansatt());

-- ---------------------------------------------------------------- Lager ----
-- Egenerklæringene lastes opp hit. Bøtta er lukket: ingen policy for anon
-- eller authenticated, så filene nås bare gjennom service_role på serveren,
-- som lager en signert lenke som varer i et minutt.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'espd', 'espd', false, 15728640,
  array['application/pdf','application/xml','text/xml',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png','image/jpeg']
)
on conflict (id) do nothing;

-- =========================================================== Token-veien ===
-- Alle fire kjører som eier og går utenom RLS. Det er trygt fordi de bare
-- ser på én rad, funnet på et token som ikke lar seg gjette.

create or replace function espd_ved_token(t uuid)
returns table (
  leverandor text,
  anskaffelse_ref text,
  oppdragsgiver text,
  frist date,
  brev text,
  levert timestamptz,
  levert_filnavn text,
  signert_navn text
)
language sql
security definer
set search_path = public
as $$
  select l.navn, e.anskaffelse_ref, o.navn, e.frist, e.utkast,
         e.levert, e.levert_filnavn, e.signert_navn
  from espd_erklaringer e
  join leverandorer l on l.id = e.leverandor_id
  join organisasjoner o on o.id = e.organisasjon_id
  where e.token = t;
$$;

-- Selve opplastingen gjøres av serveren med service_role, som validerer
-- filen først. Denne funksjonen fører bare inn at det er gjort.
create or replace function espd_lever(
  t uuid, p_filsti text, p_filnavn text,
  p_navn text, p_rolle text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  funnet uuid;
begin
  update espd_erklaringer
     set levert = now(),
         levert_filsti = p_filsti,
         levert_filnavn = p_filnavn,
         signert_navn = p_navn,
         signert_rolle = p_rolle,
         signert_bekreftet = true,
         status = 'mottatt',
         mottatt = now()
   where token = t and levert is null
   returning id into funnet;

  return funnet is not null;
end;
$$;

create or replace function offert_ved_token(t uuid)
returns table (
  id uuid, kund text, org_nr text, kontaktperson text,
  plan text, ar integer, rabatt integer, giltig_til date,
  fritt_antall integer, fritt_pris integer, notat text,
  status text, svar text, svar_kommentar text, svar_navn text,
  svar_tid timestamptz, opprettet timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.kund, o.org_nr, o.kontaktperson,
         o.plan, o.ar, o.rabatt, o.giltig_til,
         o.fritt_antall, o.fritt_pris, o.notat,
         o.status, o.svar, o.svar_kommentar, o.svar_navn,
         o.svar_tid, o.opprettet
  from offerter o
  where o.token = t and o.sendt is not null;
$$;

-- Svaret fra kunden. Legger samtidig et varsel til personalen — det er hele
-- poenget med at de kan svare selv.
create or replace function offert_svar(
  t uuid, p_svar text, p_kommentar text, p_navn text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rad offerter%rowtype;
begin
  if p_svar not in ('akseptert', 'avslatt') then
    return false;
  end if;

  -- Avslag uten begrunnelse er ikke til å følge opp. Det er derfor vi ber
  -- om den, og derfor den avvises her og ikke bare i skjemaet.
  if p_svar = 'avslatt' and coalesce(trim(p_kommentar), '') = '' then
    return false;
  end if;

  update offerter
     set svar = p_svar,
         svar_kommentar = nullif(trim(p_kommentar), ''),
         svar_navn = nullif(trim(p_navn), ''),
         svar_tid = now(),
         status = case when p_svar = 'akseptert' then 'akseptert' else 'forlorad' end
   where token = t and sendt is not null and svar is null
   returning * into rad;

  if rad.id is null then
    return false;
  end if;

  insert into interne_varsler (slag, tittel, tekst, lenke)
  values (
    'offert_svar',
    case when p_svar = 'akseptert'
         then rad.kund || ' har accepterat offerten'
         else rad.kund || ' har tackat nej till offerten' end,
    coalesce(nullif(trim(p_kommentar), ''), null),
    '/internt/offerter'
  );

  return true;
end;
$$;

create or replace function offert_sett(t uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update offerter set sett = coalesce(sett, now())
  where token = t and sendt is not null;
$$;

-- Anon skal kunne kalle nøyaktig disse fire, og ingenting annet.
grant execute on function espd_ved_token(uuid) to anon, authenticated;
grant execute on function offert_ved_token(uuid) to anon, authenticated;
grant execute on function offert_svar(uuid, text, text, text) to anon, authenticated;
grant execute on function offert_sett(uuid) to anon, authenticated;

-- espd_lever står med vilje ikke i lista. Den skriver inn en filsti som
-- peker inn i et lukket lager, og bare serveren vet hva som faktisk ble
-- lastet opp. Den kalles med service_role fra opplastingshandlingen, etter
-- at filen er sett på — ikke utenfra med et token og en oppdiktet sti.
revoke execute on function espd_lever(uuid, text, text, text, text) from anon, authenticated;
