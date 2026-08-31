-- ============================================================================
-- Relavo — brukerstøtte, kontaktskjema, personalroller og friere tilbud
-- ============================================================================

-- ---------- Personalroller ----------
-- ansatt sier at noen jobber i Relavo. Det sier ingenting om hvor mye de
-- skal se. Marginer per kunde og hvem som har åpnet hvilken kundes data er
-- ikke noe alle ansatte trenger.
alter table profiler
  add column if not exists ansatt_rolle text
  check (ansatt_rolle in ('superadmin', 'personal'));

comment on column profiler.ansatt_rolle is
  'Nivå innad i Relavo. superadmin ser marginer, team og åtkomstlogg. Settes manuelt.';

create or replace function er_superadmin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select ansatt and ansatt_rolle = 'superadmin' from profiler where id = auth.uid()),
    false)
$$;

-- ---------- Brukerstøtte ----------
create table saker (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  opprettet_av uuid references profiler(id) on delete set null,
  kategori text not null default 'annet'
    check (kategori in ('data', 'faktura', 'teknisk', 'kontroll', 'annet')),
  emne text not null,
  status text not null default 'apen'
    check (status in ('apen', 'venter_kunde', 'venter_oss', 'lukket')),
  -- Kunden velger selv om det skal komme e-post. Standard er ja: den som
  -- melder inn en sak vil normalt vite når noen har svart.
  varsle_epost boolean not null default true,
  opprettet timestamptz not null default now(),
  oppdatert timestamptz not null default now()
);

create table sak_svar (
  id uuid primary key default gen_random_uuid(),
  sak_id uuid not null references saker(id) on delete cascade,
  forfatter_id uuid references profiler(id) on delete set null,
  -- Lagres på raden i stedet for å utledes: den som svarte kan slutte, og
  -- da skal det fortsatt stå hvem sin side svaret kom fra.
  fra_relavo boolean not null,
  forfatter_navn text not null,
  tekst text not null,
  opprettet timestamptz not null default now()
);

create index on saker (organisasjon_id, oppdatert desc);
create index on sak_svar (sak_id, opprettet);

alter table saker    enable row level security;
alter table sak_svar enable row level security;

-- Kunden ser sine egne saker. Ansatte ser alle — ellers kan de ikke svare.
create policy "Kunden ser egne saker" on saker
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

create policy "Ansatte ser alle saker" on saker
  for all using (er_ansatt()) with check (er_ansatt());

create policy "Kunden ser svar på egne saker" on sak_svar
  for all using (
    sak_id in (select id from saker where organisasjon_id = min_organisasjon())
  )
  with check (
    sak_id in (select id from saker where organisasjon_id = min_organisasjon())
  );

create policy "Ansatte ser alle svar" on sak_svar
  for all using (er_ansatt()) with check (er_ansatt());

-- ---------- Kontaktskjema fra landingssiden ----------
-- Skrives av folk som ikke er logget inn. Derfor egen tabell, og en policy
-- som bare tillater innsetting — ingen anonym skal kunne lese hva andre har
-- sendt inn.
create table kontakt_henvendelser (
  id uuid primary key default gen_random_uuid(),
  navn text not null,
  epost text not null,
  organisasjon text,
  telefon text,
  kategori text not null default 'annet'
    check (kategori in ('demo', 'priser', 'teknisk', 'personvern', 'annet')),
  melding text not null,
  behandlet boolean not null default false,
  opprettet timestamptz not null default now()
);

alter table kontakt_henvendelser enable row level security;

create policy "Hvem som helst kan sende inn" on kontakt_henvendelser
  for insert to anon, authenticated with check (true);

create policy "Ansatte leser henvendelser" on kontakt_henvendelser
  for select using (er_ansatt());

create policy "Ansatte oppdaterer henvendelser" on kontakt_henvendelser
  for update using (er_ansatt()) with check (er_ansatt());

-- ---------- Friere tilbud ----------
-- Noen avtaler følger ikke planene. Da skal man kunne tilby et antall
-- kontroller til en avtalt pris uten å tvinge det inn i en plan.
alter table offerter
  add column if not exists org_nr text,
  add column if not exists fakturaadresse text,
  add column if not exists kontaktperson text,
  add column if not exists kontakt_epost text,
  add column if not exists fritt_antall integer check (fritt_antall > 0),
  add column if not exists fritt_pris integer check (fritt_pris >= 0),
  add column if not exists notat text;

comment on column offerter.fritt_antall is
  'Antall kontroller i et fritt tilbud. Er den satt, gjelder fritt_pris i stedet for planprisen.';

-- Fakturaer trenger de samme opplysningene
alter table fakturaer
  add column if not exists org_nr text,
  add column if not exists fakturaadresse text,
  add column if not exists referanse text;
