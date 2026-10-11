-- ============================================================================
-- Relavo — løpende overvåking
--
-- Standardplanen selger «daglig overvåking». Fram til nå fantes det ingen
-- planlegger i prosjektet i det hele tatt, så vi tok betalt for noe som
-- ikke skjedde.
--
-- Overvåking er ikke å kjøre kontrollen på nytt. Det er å se etter at noe
-- har ENDRET SEG siden sist, og si fra om nettopp det. En kunde som får
-- den samme rapporten hver dag slutter å lese den etter uke to. Derfor
-- lagres siste kjente tilstand per leverandør, og det som skrives er
-- differansen.
-- ============================================================================

alter table leverandorer
  add column if not exists overvaket timestamptz,
  add column if not exists tilstand jsonb;

create index if not exists leverandorer_overvaket
  on leverandorer (overvaket nulls first);

create table if not exists overvakning_hendelser (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  leverandor_id uuid not null references leverandorer(id) on delete cascade,
  slag text not null check (slag in (
    'konkurs', 'under_avvikling', 'tvangsavvikling',
    'navneendring', 'ny_daglig_leder', 'styreendring',
    'renhold_mistet_godkjenning', 'renhold_godkjent',
    'nytt_regnskap', 'slettet_fra_register'
  )),
  alvor text not null check (alvor in ('kritisk', 'advarsel', 'info')),
  fra text,
  til text,
  oppdaget timestamptz not null default now(),
  lest timestamptz,
  varslet timestamptz
);

create index if not exists hendelser_org
  on overvakning_hendelser (organisasjon_id, oppdaget desc);
create index if not exists hendelser_ulest
  on overvakning_hendelser (organisasjon_id) where lest is null;

alter table overvakning_hendelser enable row level security;

create policy "Egen organisasjons hendelser" on overvakning_hendelser
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

create policy "Personal ser alle hendelser" on overvakning_hendelser
  for select using (er_ansatt());

insert into integrasjoner (navn) values ('overvaking')
on conflict (navn) do nothing;
