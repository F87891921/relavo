-- ============================================================================
-- Kontooversikten for personalen
--
-- Interntsidene har vist en fast liste med oppdiktede kunder. De ekte
-- kontoene finnes i organisasjoner, men radnivåsikkerheten gir en ansatt
-- bare sin egen — og det er riktig: en policy som lot personalet lese
-- organisasjoner fritt ville også åpnet leverandorer og kontroller, og da
-- ser Relavo hvem hver kommune handler med.
--
-- Derfor en funksjon som bare gir tall. Hvor mange leverandører en kunde
-- har sier hva de betaler for. Hvilke leverandører det er, angår ikke oss.
-- ============================================================================
drop function if exists kontooversikt();

create or replace function kontooversikt()
returns table (
  id uuid,
  navn text,
  org_nr text,
  plan text,
  status text,
  betalingsmate text,
  opprettet timestamptz,
  antall_brukere bigint,
  antall_leverandorer bigint,
  antall_kontroller bigint,
  kontroller_30d bigint,
  sist_aktiv timestamptz,
  kontakt_navn text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Funksjonen går utenom radnivåsikkerheten, så den må selv avgjøre hvem
  -- som spør. Uten denne linja ville enhver innlogget kunde kunne lese hvor
  -- mange leverandører hver annen kommune har.
  if not er_ansatt() then
    raise exception 'Bare ansatte.' using errcode = '42501';
  end if;

  return query
  select
    o.id, o.navn, o.org_nr, o.plan, o.status, o.betalingsmate, o.opprettet,
    (select count(*) from profiler p where p.organisasjon_id = o.id),
    (select count(*) from leverandorer l where l.organisasjon_id = o.id),
    (select count(*) from kontroller k where k.organisasjon_id = o.id),
    (select count(*) from kontroller k
      where k.organisasjon_id = o.id and k.utfort > now() - interval '30 days'),
    (select max(k.utfort) from kontroller k where k.organisasjon_id = o.id),
    -- Administratoren som ble opprettet først er den vi har hatt kontakt
    -- med. Finnes ingen administrator, tas den eldste brukeren.
    (select p.navn from profiler p
      where p.organisasjon_id = o.id
      order by (p.rolle = 'administrator') desc, p.opprettet
      limit 1)
  from organisasjoner o
  -- Relavos egen organisasjon er ikke en kunde.
  where not exists (
    select 1 from profiler p where p.organisasjon_id = o.id and p.ansatt
  )
  order by o.opprettet desc;
end;
$$;

grant execute on function kontooversikt() to authenticated;
revoke execute on function kontooversikt() from anon;
