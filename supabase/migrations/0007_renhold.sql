-- ============================================================================
-- Relavo — Arbeidstilsynets renholdsregister
--
-- Siden 2012 er det ulovlig for norske virksomheter å kjøpe renholdstjenester
-- fra selskaper som ikke er godkjent i dette registeret.
--
-- Registeret inneholder BÅDE godkjente og ikke-godkjente selskaper: av 7 779
-- oppføringer står 3 000 som «Ikke godkjent». Å finne selskapet i registeret
-- er derfor ikke det samme som at det er godkjent, og de to må aldri slås
-- sammen til ett svar.
--
-- Kilde: https://registerdata.arbeidstilsynet.no/renhold_register.xml
-- Lisens: NLOD 2.0. Åpen, ingen nøkkel. Oppdateres hver morgen.
-- ============================================================================

create table renholdsvirksomheter (
  org_nr text primary key,
  navn text not null,
  organisasjonsform text,
  status text not null,
  -- Utledet av status, men lagret: spørringene skal ikke måtte kjenne
  -- Arbeidstilsynets ordlyd for å svare på det eneste som betyr noe.
  godkjent boolean not null,
  poststed text,
  kommune text,
  oppdatert timestamptz not null default now()
);

create index on renholdsvirksomheter (godkjent);

-- Offentlige data, likt for alle kunder. Alle innloggede kan lese;
-- ingen kan skrive gjennom appen — synkroniseringen går via service_role.
alter table renholdsvirksomheter enable row level security;

create policy "Alle innloggede kan lese renholdsregisteret"
  on renholdsvirksomheter for select
  using (auth.uid() is not null);

-- Når registeret sist ble hentet. Én rad, så en kontroll kan si hvor
-- ferskt svaret er i stedet for bare å påstå det.
create table registersynk (
  register text primary key,
  sist_hentet timestamptz not null default now(),
  antall integer not null default 0
);

alter table registersynk enable row level security;

create policy "Alle innloggede kan lese synkstatus"
  on registersynk for select
  using (auth.uid() is not null);
