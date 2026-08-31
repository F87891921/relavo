-- ============================================================================
-- Relavo — superadmin forvalter hvem som er ansatt
--
-- 0005 lot administrator endre profiler i sin egen organisasjon. Det dekker
-- ikke dette: ansatt-flagget avgjør hvem som ser andre kunders data, og skal
-- bare kunne settes av superadmin.
-- ============================================================================

create policy "Superadmin endrer ansattflagg" on profiler
  for update
  using (er_superadmin())
  with check (er_superadmin());

create policy "Superadmin ser alle profiler" on profiler
  for select
  using (er_superadmin());
