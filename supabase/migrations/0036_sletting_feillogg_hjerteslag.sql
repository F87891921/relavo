-- Sletting av konto (14 dagers angrefrist), feillogg og hjerteslag fra de daglige jobbene.
alter table organisasjoner add column if not exists slettes_den timestamptz;

create table if not exists feillogg (
  id uuid primary key default gen_random_uuid(),
  opprettet timestamptz not null default now(),
  kilde text not null check (kilde in ('klient', 'server', 'jobb')),
  melding text not null,
  side text,
  detaljer text,
  noekkel text
);
create index if not exists feillogg_opprettet on feillogg (opprettet desc);
alter table feillogg enable row level security;
create policy "Ansatte leser feillogg" on feillogg for select using (er_ansatt());

create table if not exists jobbhjerteslag (
  jobb text primary key,
  sist_ok timestamptz not null default now(),
  sist_feil text
);
alter table jobbhjerteslag enable row level security;
create policy "Ansatte leser hjerteslag" on jobbhjerteslag for select using (er_ansatt());

-- vern_organisasjonsfelt(): slettes_den kan ikke endres av kunden. Se 0030 for resten av funksjonen.
