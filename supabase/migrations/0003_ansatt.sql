-- ============================================================================
-- Relavo — skille mellom kundens administrator og Relavos egne ansatte
--
-- rolle = 'administrator' betyr administrator hos kunden: kan styre sin egen
-- organisasjon. Det gir ikke tilgang til kontopanelet, som viser marginer,
-- fakturering og alle kunders data på tvers.
--
-- Derfor et eget flagg. Det settes ikke av noen selv — det finnes ingen vei
-- til å skru det på gjennom appen, bare direkte i databasen.
-- ============================================================================

alter table profiler
  add column if not exists ansatt boolean not null default false;

comment on column profiler.ansatt is
  'Ansatt i Relavo. Gir tilgang til kontopanelet under /internt. Settes manuelt.';
