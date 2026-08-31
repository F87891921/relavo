-- ============================================================================
-- Relavo — tabeller for kontopanelet
--
-- Alt her er Relavos egne data på tvers av kunder: leads, tilbud, fakturaer
-- og kredittsjekker. Derfor er reglene motsatt av resten av basen — de
-- knytter seg ikke til en organisasjon, men til om brukeren er ansatt.
-- ============================================================================

-- Samme mønster som min_organisasjon(): slås opp én gang, security definer
-- så policyen ikke trenger lesetilgang til profiler for å sjekke seg selv.
create or replace function er_ansatt()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select ansatt from profiler where id = auth.uid()), false)
$$;

-- ---------- Leads ----------
create table leads (
  id uuid primary key default gen_random_uuid(),
  bolag text not null,
  kontakt text,
  epost text,
  kalla text,
  status text not null default 'ny'
    check (status in ('ny','kontaktad','demo','offert','vunnen','forlorad')),
  nasta date,                                -- neste steg, ikke en frist
  notis text,
  opprettet timestamptz not null default now(),
  opprettet_av uuid references profiler(id)
);

-- ---------- Tilbud ----------
create table offerter (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  kund text not null,
  plan text not null default 'standard'
    check (plan in ('engangs','standard','enterprise')),
  ar integer not null default 1 check (ar between 1 and 10),
  rabatt integer not null default 0 check (rabatt between 0 and 100),
  giltig_til date,
  status text not null default 'utkast'
    check (status in ('utkast','skickad','akseptert','utgatt','forlorad')),
  opprettet timestamptz not null default now(),
  opprettet_av uuid references profiler(id)
);

-- ---------- Fakturaer ----------
-- organisasjon_id er valgfri: en faktura kan sendes til noen som ennå ikke
-- er blitt en organisasjon i basen. Da står navnet fritt i kunde_navn.
create table fakturaer (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid references organisasjoner(id) on delete set null,
  kunde_navn text not null,
  nummer text not null unique,
  belopp integer not null check (belopp >= 0),
  forfall date not null,
  status text not null default 'obetald'
    check (status in ('obetald','betald','forfallen','kreditnota')),
  opprettet timestamptz not null default now(),
  opprettet_av uuid references profiler(id)
);

-- ---------- Kredittsjekker ----------
-- Lagres uendret med tidspunkt, slik kontrollene gjør. En vurdering som
-- ikke kan hentes fram igjen er ikke en vurdering.
create table kredittsjekker (
  id uuid primary key default gen_random_uuid(),
  org_nr text not null,
  navn text not null,
  vurdering text not null check (vurdering in ('lav','middels','hoy')),
  begrunnelse jsonb not null default '[]',   -- [{ punkt, status, tekst }]
  registerdata jsonb not null default '{}',  -- rådata fra Enhets- og Regnskapsregisteret
  utfort timestamptz not null default now(),
  utfort_av uuid references profiler(id)
);

create index on leads (status);
create index on offerter (status);
create index on fakturaer (status, forfall);
create index on kredittsjekker (org_nr, utfort desc);

-- ---------- Regler ----------
alter table leads          enable row level security;
alter table offerter       enable row level security;
alter table fakturaer      enable row level security;
alter table kredittsjekker enable row level security;

create policy "Ansatte ser og endrer leads" on leads
  for all using (er_ansatt()) with check (er_ansatt());

create policy "Ansatte ser og endrer offerter" on offerter
  for all using (er_ansatt()) with check (er_ansatt());

create policy "Ansatte ser og endrer fakturaer" on fakturaer
  for all using (er_ansatt()) with check (er_ansatt());

create policy "Ansatte ser og endrer kredittsjekker" on kredittsjekker
  for all using (er_ansatt()) with check (er_ansatt());
