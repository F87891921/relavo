-- ============================================================================
-- Relavo — automatisk jav-/interessekonfliktkontroll
--
-- Krysser styret hos leverandøren mot personer den innkjøpende
-- organisasjonen selv har registrert som deltakere i anskaffelsen.
--
-- Merk nummeret: oppgaven ba om 0002_jav.sql, men 0002 til 0005 er allerede
-- kjørt. En ny 0002 ville stått foran dem i filrekkefølge og blitt forsøkt
-- anvendt før tabellene den bygger på finnes.
-- ============================================================================

-- ---------- Deltakere i anskaffelsen ----------
-- Folk hos kunden som er inhabile hvis de sitter i leverandørens styre:
-- saksbehandlere, bestillere, medlemmer av evalueringskomiteen.
create table prosjektdeltakere (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  navn text not null,
  rolle text not null,
  opprettet timestamptz not null default now()
);

-- ---------- Treff ----------
-- organisasjon_id ligger direkte på raden, ikke utledet gjennom kontroll_id.
-- Policyen skal kunne avgjøres på raden selv; en policy som må slå opp i en
-- annen tabell for hver rad blir både treg og lettere å ta feil av.
create table jav_treff (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  kontroll_id uuid references kontroller(id) on delete cascade,
  deltaker_id uuid not null references prosjektdeltakere(id) on delete cascade,
  leverandor_id uuid not null references leverandorer(id) on delete cascade,
  type_kobling text not null
    check (type_kobling in ('styre', 'daglig_leder', 'eier', 'naer_relasjon')),
  detaljer jsonb not null default '{}',
  opprettet timestamptz not null default now()
);

create index on prosjektdeltakere (organisasjon_id);
create index on jav_treff (organisasjon_id, leverandor_id);
create index on jav_treff (kontroll_id);

alter table prosjektdeltakere enable row level security;
alter table jav_treff         enable row level security;

-- Samme mønster som resten av basen: min_organisasjon() fra 0001.
create policy "Full tilgang til egne prosjektdeltakere" on prosjektdeltakere
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

create policy "Full tilgang til egne jav-treff" on jav_treff
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());
