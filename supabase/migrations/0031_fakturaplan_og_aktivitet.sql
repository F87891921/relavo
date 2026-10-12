-- ============================================================================
-- Fakturaplan (årlig fakturering) og aktivitetsoversikt
-- ============================================================================

-- Varsler kan nå ha en nøkkel. Samme nøkkel gir aldri to varsler, slik at et
-- daglig jobb kan kjøre om og om igjen uten å fylle lista.
alter table interne_varsler add column if not exists noekkel text;
create unique index if not exists interne_varsler_noekkel on interne_varsler (noekkel) where noekkel is not null;

-- ---------- Fakturaplan ----------
create table if not exists fakturaplan (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  aar integer not null check (aar between 1 and 10),
  forfaller date not null,
  belopp integer not null check (belopp >= 0),
  status text not null default 'planlagt' check (status in ('planlagt', 'fakturert', 'betalt', 'avlyst')),
  fakturert timestamptz,
  opprettet timestamptz not null default now(),
  unique (organisasjon_id, aar)
);
alter table fakturaplan enable row level security;
create policy "Ansatte styrer fakturaplanen" on fakturaplan for all using (er_ansatt()) with check (er_ansatt());

-- Én rad per avtaleår. Beløpet er det som ble avtalt (tilbudet), ellers listeprisen × 12.
create or replace function lag_fakturaplan(p_org uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare o organisasjoner%rowtype; v_mnd integer; v_ar integer; v_belopp integer; v_start date; v_n integer := 0; v_rader integer;
begin
  if not er_ansatt() then raise exception 'Bare ansatte.' using errcode = '42501'; end if;
  select * into o from organisasjoner where id = p_org;
  if not found or o.betalingsmate is distinct from 'faktura' then return 0; end if;

  v_start := coalesce(o.aktivert, now())::date;

  if o.avtalt_total is not null and o.avtale_mnd is not null then
    v_ar := greatest(1, ceil(o.avtale_mnd / 12.0)::integer);
    v_belopp := round(o.avtalt_total::numeric / v_ar)::integer;
  else
    v_mnd := case o.plan
      when 'liten' then 3900 when 'kommune' then 7900 when 'medelstor' then 12900
      when 'start' then 2900 when 'vekst' then 5900 when 'bygg' then 11900
      when 'standard' then 6900 when 'enterprise' then 12900 else null end;
    if v_mnd is null then return 0; end if;
    v_ar := 1;
    v_belopp := v_mnd * 12;
  end if;

  for i in 1..v_ar loop
    insert into fakturaplan (organisasjon_id, aar, forfaller, belopp)
    values (p_org, i, (v_start + make_interval(years => i - 1))::date, v_belopp)
    on conflict (organisasjon_id, aar) do nothing;
    get diagnostics v_rader = row_count;
    v_n := v_n + v_rader;
  end loop;
  return v_n;
end $$;
grant execute on function lag_fakturaplan(uuid) to authenticated;
revoke execute on function lag_fakturaplan(uuid) from anon;

-- ---------- Kontakt med kunden ----------
create table if not exists kundekontakt (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  notat text not null,
  opprettet timestamptz not null default now(),
  opprettet_av uuid references profiler(id)
);
alter table kundekontakt enable row level security;
create policy "Ansatte styrer kundekontakt" on kundekontakt for all using (er_ansatt()) with check (er_ansatt());

-- ---------- Aktivitet per kunde ----------
-- aktivitet_data() har ingen tilgangskontroll og kalles bare av den daglige
-- jobben (service_role). aktivitet() er den samme med kontroll for ansatte.
create or replace function aktivitet_data()
returns table (
  id uuid, navn text, org_nr text, plan text, status text, opprettet timestamptz, aktivert timestamptz,
  antall_brukere bigint, antall_leverandorer bigint, antall_kontroller bigint,
  kontroller_30d bigint, kontroller_forrige_30d bigint, kontroller_90d bigint,
  sist_kontroll timestamptz, sist_innlogget timestamptz,
  kontakt_navn text, kontakt_epost text, sist_kontaktet timestamptz
)
language sql stable security definer set search_path = public as $$
  select
    o.id, o.navn, o.org_nr, o.plan, o.status, o.opprettet, o.aktivert,
    (select count(*) from profiler p where p.organisasjon_id = o.id),
    (select count(*) from leverandorer l where l.organisasjon_id = o.id),
    (select count(*) from kontroller k where k.organisasjon_id = o.id),
    (select count(*) from kontroller k where k.organisasjon_id = o.id and k.utfort > now() - interval '30 days'),
    (select count(*) from kontroller k where k.organisasjon_id = o.id and k.utfort <= now() - interval '30 days' and k.utfort > now() - interval '60 days'),
    (select count(*) from kontroller k where k.organisasjon_id = o.id and k.utfort > now() - interval '90 days'),
    (select max(k.utfort) from kontroller k where k.organisasjon_id = o.id),
    (select max(u.last_sign_in_at) from profiler p join auth.users u on u.id = p.id where p.organisasjon_id = o.id),
    (select p.navn from profiler p where p.organisasjon_id = o.id order by (p.rolle = 'administrator') desc, p.opprettet limit 1),
    (select u.email::text from profiler p join auth.users u on u.id = p.id where p.organisasjon_id = o.id order by (p.rolle = 'administrator') desc, p.opprettet limit 1),
    (select max(c.opprettet) from kundekontakt c where c.organisasjon_id = o.id)
  from organisasjoner o
  where not exists (select 1 from profiler p where p.organisasjon_id = o.id and p.ansatt)
  order by o.opprettet desc;
$$;
revoke execute on function aktivitet_data() from public, anon, authenticated;
grant execute on function aktivitet_data() to service_role;

create or replace function aktivitet()
returns table (
  id uuid, navn text, org_nr text, plan text, status text, opprettet timestamptz, aktivert timestamptz,
  antall_brukere bigint, antall_leverandorer bigint, antall_kontroller bigint,
  kontroller_30d bigint, kontroller_forrige_30d bigint, kontroller_90d bigint,
  sist_kontroll timestamptz, sist_innlogget timestamptz,
  kontakt_navn text, kontakt_epost text, sist_kontaktet timestamptz
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not er_ansatt() then raise exception 'Bare ansatte.' using errcode = '42501'; end if;
  return query select * from aktivitet_data();
end $$;
grant execute on function aktivitet() to authenticated;
revoke execute on function aktivitet() from anon;
