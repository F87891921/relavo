-- ============================================================================
-- Tilgangsloggen
--
-- Interntsiden har vist en logg med oppdiktede rader og påstått at hvert
-- oppslag krever en begrunnelse. Det var ikke sant: det fantes verken en
-- tabell eller et felt. En side som later som den dokumenterer noe er verre
-- enn ingen side — den er nettopp det som ville blitt lagt fram ved en
-- granskning.
--
-- Nå føres det som faktisk skjer: Relavo-ansattes inngrep i en kundekonto.
-- ============================================================================
create table tilgangslogg (
  id uuid primary key default gen_random_uuid(),
  -- Navnet lagres ved siden av id-en, så raden fortsatt sier noe hvis
  -- brukeren slettes senere.
  utfort_av uuid references profiler(id) on delete set null,
  utfort_av_navn text not null,
  organisasjon_id uuid references organisasjoner(id) on delete set null,
  organisasjon_navn text not null,
  handling text not null,
  -- not null med vilje. En rad uten begrunnelse er verdiløs ved en
  -- granskning, og da skal den ikke kunne skrives.
  begrunnelse text not null check (length(btrim(begrunnelse)) > 0),
  opprettet timestamptz not null default now()
);

create index on tilgangslogg (opprettet desc);

alter table tilgangslogg enable row level security;

-- Bare superadmin leser den. En tilgangslogg alle kan lese er ikke en
-- tilgangslogg — samme begrunnelse som står i tilgang-ansatt.ts.
create policy "Superadmin leser tilgangsloggen" on tilgangslogg
  for select using (
    exists (
      select 1 from profiler p
       where p.id = auth.uid() and p.ansatt and p.ansatt_rolle = 'superadmin'
    )
  );

-- Ingen insert-policy: en logg den loggede kan skrive i er ikke en logg.
create or replace function logg_tilgang(
  p_organisasjon uuid, p_handling text, p_begrunnelse text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  navn text;
  orgnavn text;
begin
  if not er_ansatt() then
    raise exception 'Bare ansatte.' using errcode = '42501';
  end if;

  select p.navn into navn from profiler p where p.id = auth.uid();
  select o.navn into orgnavn from organisasjoner o where o.id = p_organisasjon;

  insert into tilgangslogg (
    utfort_av, utfort_av_navn, organisasjon_id, organisasjon_navn,
    handling, begrunnelse
  )
  values (
    auth.uid(), coalesce(navn, 'Ukjent'), p_organisasjon,
    coalesce(orgnavn, 'Ukjent'), p_handling, p_begrunnelse
  );
end;
$$;

grant execute on function logg_tilgang(uuid, text, text) to authenticated;
