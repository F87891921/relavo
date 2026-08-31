-- ============================================================================
-- Relavo — ESPD-forespørsler med frist, og dokumentasjon av § 24-9
--
-- Felles for begge: Relavo sender ingenting til leverandøren. Kommunen er
-- journalføringspliktig — hvert utgående saksdokument skal journalføres i
-- deres eget arkiv. Et brev sendt fra relavo.no havner aldri der, og finnes
-- da ikke ved en innsynsbegjæring eller en KOFA-klage.
--
-- Det Relavo gjør er å skrive utkastet, holde styr på fristen, og lagre hva
-- som ble spurt om og hva som kom tilbake. Det er den delen som mangler i
-- anskaffelsesprotokollene i dag.
-- ============================================================================

alter table espd_erklaringer
  add column if not exists frist date,
  add column if not exists etterspurt timestamptz,
  add column if not exists etterspurt_av uuid references profiler(id),
  add column if not exists mottaker_navn text,
  add column if not exists mottaker_epost text,
  add column if not exists notat text;

comment on column espd_erklaringer.frist is
  'Frist for ettersending etter § 23-5. Ti virkedager er vanlig.';
comment on column espd_erklaringer.etterspurt is
  'Når kunden markerte at forespørselen faktisk ble sendt fra deres eget system.';

-- ---------- § 24-9 ----------
-- Ett krav om redegjørelse per tilbud som er unormalt lavt.
create table redegjorelser (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  leverandor_navn text not null,
  leverandor_epost text,
  anskaffelse_ref text,
  anskaffelse_navn text,
  tilbudssum bigint,
  median bigint,
  avvik_prosent integer,

  -- Selve brevet, slik det sto da det ble sendt. Endres malen senere, skal
  -- det fortsatt være mulig å vise hva leverandøren faktisk mottok.
  utkast text not null,

  frist date,
  sendt timestamptz,
  sendt_av uuid references profiler(id),

  svar_mottatt timestamptz,
  svar text,

  -- § 24-9 krever at oppdragsgiver tar stilling til om forklaringen holder.
  vurdering text check (vurdering in ('tilstrekkelig', 'utilstrekkelig')),
  vurdering_begrunnelse text,
  vurdert timestamptz,
  vurdert_av uuid references profiler(id),

  opprettet timestamptz not null default now()
);

create index on redegjorelser (organisasjon_id, opprettet desc);
create index on espd_erklaringer (organisasjon_id, frist);

alter table redegjorelser enable row level security;

create policy "Full tilgang til egne redegjørelser" on redegjorelser
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());
