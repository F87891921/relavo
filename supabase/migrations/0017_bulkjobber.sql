-- ============================================================================
-- Bulkkontroll som faktisk kjører
--
-- Knappen har stått deaktivert siden siden ble laget: validering, fillesing
-- og telling fungerte, men ingenting ble kontrollert. Det som manglet var
-- ikke logikken — kontrollen finnes — men et sted å legge arbeidet mens det
-- pågår.
--
-- Hvorfor en tabell og ikke bare en løkke i en serverhandling: hundre
-- oppslag mot Enhetsregisteret tar lengre tid enn en forespørsel får lov
-- til å leve. Uten noe som husker hvor langt den kom, er en avbrutt
-- kjøring ikke bare uferdig — den er umulig å skille fra en ferdig.
-- ============================================================================

create table bulkjobber (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  startet_av uuid references profiler(id),
  opprettet timestamptz not null default now(),
  ferdig timestamptz
);

create table bulkoppgaver (
  id uuid primary key default gen_random_uuid(),
  jobb_id uuid not null references bulkjobber(id) on delete cascade,
  -- organisasjon_id ligger på raden, ikke utledet gjennom jobb_id. Samme
  -- begrunnelse som i 0006: en policy som må slå opp i en annen tabell for
  -- hver rad er både tregere og lettere å ta feil av.
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  org_nr text not null,
  status text not null default 'venter'
    check (status in ('venter', 'kjorer', 'ferdig', 'feilet')),
  kontroll_id uuid references kontroller(id) on delete set null,
  risiko text check (risiko in ('lav', 'middels', 'hoy')),
  navn text,
  feil text,
  behandlet timestamptz,
  unique (jobb_id, org_nr)
);

create index on bulkjobber (organisasjon_id, opprettet desc);
create index on bulkoppgaver (jobb_id, status);

alter table bulkjobber   enable row level security;
alter table bulkoppgaver enable row level security;

create policy "Full tilgang til egne bulkjobber" on bulkjobber
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

create policy "Full tilgang til egne bulkoppgaver" on bulkoppgaver
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

-- ---------------------------------------------------------------------------
-- Å ta neste bit av køen
--
-- Dette må være én operasjon. Leser man først og skriver etterpå, kan to
-- faner — eller en fane og nattjobben — få de samme radene og kontrollere
-- det samme selskapet to ganger. «for update skip locked» gjør at den andre
-- hopper videre til rader ingen har tatt, i stedet for å vente.
-- ---------------------------------------------------------------------------
create or replace function ta_bulkoppgaver(p_jobb uuid, p_antall integer)
returns setof bulkoppgaver
language sql volatile security invoker
set search_path = public
as $$
  update bulkoppgaver
     set status = 'kjorer'
   where id in (
     select id from bulkoppgaver
      where jobb_id = p_jobb and status = 'venter'
      order by org_nr
      limit p_antall
      for update skip locked
   )
  returning *;
$$;
