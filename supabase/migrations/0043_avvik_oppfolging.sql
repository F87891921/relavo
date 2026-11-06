-- Oppfølging av avvik.
--
-- Den daglige overvåkingen skriver hendelser (konkurs, tapt renholdsgodkjenning
-- osv.), men kunden kunne bare se dem i en e-post. Her får hver hendelse en
-- status, en ansvarlig og en kommentar, slik at kunden kan vise hva som ble
-- gjort. Det er det som gjør et avvik til dokumentasjon i etterkant.

alter table overvakning_hendelser
  add column if not exists status text not null default 'ny',
  add column if not exists ansvarlig uuid references profiler(id) on delete set null,
  add column if not exists kommentar text,
  add column if not exists behandlet timestamptz,
  add column if not exists behandlet_av uuid references profiler(id) on delete set null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'hendelser_status_gyldig') then
    alter table overvakning_hendelser
      add constraint hendelser_status_gyldig check (status in ('ny', 'under_behandling', 'avklart'));
  end if;
end $$;

create index if not exists hendelser_apne
  on overvakning_hendelser (organisasjon_id, oppdaget desc)
  where status <> 'avklart';
