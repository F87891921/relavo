-- ============================================================================
-- Relavo — administrator kan forvalte brukerne i sin egen organisasjon
--
-- 0001 ga bare SELECT på profiler. Den som opprettet organisasjonen ble
-- administrator, men kunne ikke gjøre noe med det — verken legge til
-- kolleger eller fjerne noen som har sluttet.
-- ============================================================================

create or replace function min_rolle()
returns text
language sql stable security definer
set search_path = public
as $$
  select rolle from profiler where id = auth.uid()
$$;

-- Antall brukere planen tillater. Ligger i basen og ikke bare i koden,
-- fordi grensen må kunne håndheves også når noe annet enn appen skriver.
create or replace function maks_brukere(p_plan text)
returns integer
language sql immutable
as $$
  select case p_plan
    when 'engangs'    then 1
    when 'standard'   then 3
    when 'enterprise' then 10
    else 1
  end
$$;

-- Administrator kan endre navn og rolle på folk i egen organisasjon, men
-- ikke flytte dem til en annen organisasjon — derfor sjekkes
-- organisasjon_id i både using og with check.
create policy "Administrator endrer profiler i egen organisasjon" on profiler
  for update
  using (organisasjon_id = min_organisasjon() and min_rolle() = 'administrator')
  with check (organisasjon_id = min_organisasjon());

create policy "Administrator fjerner profiler i egen organisasjon" on profiler
  for delete
  using (
    organisasjon_id = min_organisasjon()
    and min_rolle() = 'administrator'
    and id <> auth.uid()          -- ingen kan fjerne seg selv ved et uhell
  );

-- Administrator kan endre navn og org.nr på sin egen organisasjon.
-- Plan står bevisst utenfor: den styres av abonnementet, ikke av kunden.
create policy "Administrator endrer egen organisasjon" on organisasjoner
  for update
  using (id = min_organisasjon() and min_rolle() = 'administrator')
  with check (id = min_organisasjon());
