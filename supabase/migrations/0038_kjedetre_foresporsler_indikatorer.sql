-- Leverandørkjeden som tre, forespørsler til leverandøren om underleverandører,
-- indikatorer på kontrollen og en valgfri egen kjedegrense for selskap.
alter table kjede_ledd
  add column if not exists forelder_id uuid references kjede_ledd(id) on delete cascade,
  add column if not exists kartlegging text not null default 'ukjent'
    check (kartlegging in ('ukjent', 'venter', 'besvart', 'ingen', 'ikke_svart')),
  add column if not exists opprettet timestamptz not null default now();

update kjede_ledd c
   set forelder_id = (select p.id from kjede_ledd p where p.kontroll_id = c.kontroll_id and p.niva = c.niva - 1 limit 1)
 where c.niva > 0 and c.forelder_id is null;

alter table kontroller add column if not exists indikatorer jsonb not null default '[]';
alter table organisasjoner add column if not exists kjede_grense integer check (kjede_grense between 1 and 10);

create table if not exists kjede_foresporsler (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  ledd_id uuid not null references kjede_ledd(id) on delete cascade,
  mottaker_epost text,
  sendt timestamptz not null default now(),
  purringer integer not null default 0,
  frist date not null,
  status text not null default 'venter' check (status in ('venter', 'besvart', 'utlopt')),
  svart timestamptz,
  svart_navn text,
  svart_rolle text,
  ingen boolean not null default false,
  opprettet_av uuid references profiler(id)
);
create index if not exists kjede_foresporsler_ledd on kjede_foresporsler (ledd_id);
alter table kjede_foresporsler enable row level security;
create policy "Egne kjedeforespørsler" on kjede_foresporsler for all
  using (organisasjon_id = min_organisasjon()) with check (organisasjon_id = min_organisasjon());
