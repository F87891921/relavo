-- ============================================================================
-- Relavo — første skjema
-- Kjør denne mot et nytt Supabase-prosjekt: Dashboard → SQL Editor → lim inn
-- og kjør, eller: npx supabase db push (hvis Supabase CLI er koblet til).
--
-- Modellen er hentet direkte fra prototypens demodata (Bergen kommune,
-- Nordvik Bygg AS osv.) — samme struktur, nå som ekte tabeller med
-- Row Level Security i stedet for en hardkodet JS-array.
-- ============================================================================

-- ---------- Organisasjoner (kundekontoer) ----------
create table organisasjoner (
  id uuid primary key default gen_random_uuid(),
  navn text not null,
  org_nr text,                              -- kundens eget org.nr, ikke leverandørens
  plan text not null default 'standard' check (plan in ('engangs', 'standard', 'enterprise')),
  opprettet timestamptz not null default now()
);

-- ---------- Brukere ----------
-- Kobles til Supabase sin innebygde auth.users via samme id.
create table profiler (
  id uuid primary key references auth.users(id) on delete cascade,
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  navn text not null,
  rolle text not null default 'bruker' check (rolle in ('bruker', 'administrator')),
  opprettet timestamptz not null default now()
);

-- ---------- Leverandører ----------
create table leverandorer (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  navn text not null,
  org_nr text not null,
  bransje text,
  sted text,
  ansatte integer,
  risiko text check (risiko in ('lav', 'middels', 'hoy')),
  sist_kontrollert timestamptz,
  opprettet timestamptz not null default now(),
  unique (organisasjon_id, org_nr)
);

-- ---------- Kontroller ----------
-- Én rad per kjøring — resultatet slik det vises på "Kontrollresultat"-siden.
create table kontroller (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  leverandor_id uuid not null references leverandorer(id) on delete cascade,
  utfort_av uuid references profiler(id),
  risiko text not null check (risiko in ('lav', 'middels', 'hoy')),
  krav jsonb not null default '[]',          -- [{ ref: "§ 5k", status: "ok"|"no"|"na", tekst, notat }]
  kilder jsonb not null default '[]',        -- [{ navn, status: "svar"|"vedlegg"|"ikke", tidspunkt }]
  utfort timestamptz not null default now()
);

-- ---------- Leverandørkjede (§ 5k) ----------
create table kjede_ledd (
  id uuid primary key default gen_random_uuid(),
  kontroll_id uuid not null references kontroller(id) on delete cascade,
  niva integer not null,                     -- 0 = hovedleverandør, 1 = ledd 1, osv.
  navn text not null,
  org_nr text not null,
  over_grense boolean not null default false
);

-- ---------- ESPD-erklæringer ----------
create table espd_erklaringer (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  leverandor_id uuid not null references leverandorer(id) on delete cascade,
  anskaffelse_ref text,
  fase text not null check (fase in ('tilbud', 'lopende')),
  status text not null check (status in ('mottatt', 'motstrid', 'mangler', 'sendt', 'utlopt')),
  motstrid jsonb not null default '[]',
  signatur jsonb,                            -- { navn, rolle, metode, tidspunkt, signaturrett }
  mottatt timestamptz
);

-- ============================================================================
-- Row Level Security — kjernen i hvorfor dette ikke er en delt Supabase-
-- database der alle ser alles data. Hver policy sjekker at raden hører til
-- SAMME organisasjon som den innloggede brukeren.
-- ============================================================================

alter table organisasjoner enable row level security;
alter table profiler enable row level security;
alter table leverandorer enable row level security;
alter table kontroller enable row level security;
alter table kjede_ledd enable row level security;
alter table espd_erklaringer enable row level security;

-- Hjelpefunksjon: hvilken organisasjon tilhører den innloggede brukeren.
create or replace function min_organisasjon()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select organisasjon_id from profiler where id = auth.uid()
$$;

create policy "Se egen organisasjon" on organisasjoner
  for select using (id = min_organisasjon());

create policy "Se profiler i egen organisasjon" on profiler
  for select using (organisasjon_id = min_organisasjon());

create policy "Full tilgang til egne leverandører" on leverandorer
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

create policy "Full tilgang til egne kontroller" on kontroller
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

create policy "Se leddene i egne kontroller" on kjede_ledd
  for all using (
    kontroll_id in (select id from kontroller where organisasjon_id = min_organisasjon())
  );

create policy "Full tilgang til egne ESPD-erklæringer" on espd_erklaringer
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

-- ============================================================================
-- Seed-data — samme demoselskap som i prototypen, så appen ikke starter tom.
-- Fjern dette blokket før dere onboarder en ekte kunde.
-- ============================================================================
insert into organisasjoner (id, navn, plan) values
  ('00000000-0000-0000-0000-000000000001', 'Bergen kommune', 'enterprise');

insert into leverandorer (organisasjon_id, navn, org_nr, bransje, sted, ansatte, risiko, sist_kontrollert) values
  ('00000000-0000-0000-0000-000000000001', 'Nordvik Bygg AS', '924118504', 'Bygg og anlegg', 'Bergen', 64, 'hoy', now()),
  ('00000000-0000-0000-0000-000000000001', 'Solstrand Renhold AS', '913550870', 'Renhold', 'Bergen', 22, 'hoy', now()),
  ('00000000-0000-0000-0000-000000000001', 'Bergvik Anlegg AS', '918774203', 'Bygg og anlegg', 'Bergen', 41, 'middels', now());
