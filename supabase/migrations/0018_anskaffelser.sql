-- ============================================================================
-- Anskaffelser og tilbud
--
-- To sider har stått på demodata fordi det ikke fantes noe sted å legge inn
-- en anskaffelse: /anskaffelser viste en fast liste, og vurderingen av
-- unormalt lave tilbud regnet på fire hardkodede summer.
--
-- Beregningen er ikke det som manglet — medianen og avviket er riktig
-- regnet. Det som manglet var tallene å regne på.
-- ============================================================================

create table anskaffelser (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  -- Saksnummeret er kundens eget. Det er dette de kjenner anskaffelsen på,
  -- og det som skal stå i brevet til leverandøren.
  saksnummer text not null,
  navn text not null,
  konkurranseform text,
  -- Verdien som tekst: kunden skriver «4,2 mill. NOK / 4 år» like ofte som
  -- et tall, og et beløpsfelt ville tvunget fram en presisjon som ikke
  -- finnes på dette stadiet.
  verdi text,
  periode text,
  opprettet timestamptz not null default now(),
  unique (organisasjon_id, saksnummer)
);

create table tilbud (
  id uuid primary key default gen_random_uuid(),
  anskaffelse_id uuid not null references anskaffelser(id) on delete cascade,
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  leverandor_navn text not null,
  leverandor_epost text,
  -- Summen må være et tall. Den skal sammenlignes, ikke vises.
  sum numeric(14, 2) not null check (sum >= 0),
  opprettet timestamptz not null default now()
);

create index on anskaffelser (organisasjon_id, opprettet desc);
create index on tilbud (anskaffelse_id);

alter table anskaffelser enable row level security;
alter table tilbud       enable row level security;

create policy "Full tilgang til egne anskaffelser" on anskaffelser
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

create policy "Full tilgang til egne tilbud" on tilbud
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());
