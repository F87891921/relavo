-- ============================================================================
-- Relavo — la nye kunder opprette sin egen organisasjon
--
-- 0001 ga bare SELECT-regler. Ingen kunne dermed opprette en organisasjon
-- eller sin egen profil, og en fersk innlogging endte i et tomt dashbord
-- uten vei videre.
--
-- Å åpne INSERT på profiler ville vært galt: da kunne hvem som helst legge
-- seg selv inn i en hvilken som helst organisasjon og lese kundens data.
-- I stedet gjøres begge innleggene av én funksjon som kjører med utvidede
-- rettigheter, og som bare gjør jobben for en bruker uten profil fra før.
-- ============================================================================

create or replace function opprett_organisasjon(
  p_navn        text,
  p_brukernavn  text,
  p_org_nr      text default null,
  p_plan        text default 'standard'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bruker uuid := auth.uid();
  v_org    uuid;
begin
  if v_bruker is null then
    raise exception 'Ikke innlogget';
  end if;

  if btrim(coalesce(p_navn, '')) = '' then
    raise exception 'Organisasjonen må ha et navn';
  end if;

  if btrim(coalesce(p_brukernavn, '')) = '' then
    raise exception 'Du må oppgi ditt eget navn';
  end if;

  -- Én organisasjon per bruker. Uten denne sperren kunne den samme kontoen
  -- opprette organisasjoner i det uendelige, og bytte hvilken den tilhører.
  if exists (select 1 from profiler where id = v_bruker) then
    raise exception 'Kontoen hører allerede til en organisasjon';
  end if;

  insert into organisasjoner (navn, org_nr, plan)
  values (btrim(p_navn), nullif(btrim(coalesce(p_org_nr, '')), ''), p_plan)
  returning id into v_org;

  -- Den som oppretter organisasjonen blir administrator for den. Kolleger
  -- som kommer til senere legges inn som 'bruker' av en administrator.
  insert into profiler (id, organisasjon_id, navn, rolle)
  values (v_bruker, v_org, btrim(p_brukernavn), 'administrator');

  return v_org;
end;
$$;

-- Bare innloggede kan kalle den. anon skal ikke kunne opprette noe.
revoke execute on function opprett_organisasjon(text, text, text, text) from public, anon;
grant  execute on function opprett_organisasjon(text, text, text, text) to authenticated;
