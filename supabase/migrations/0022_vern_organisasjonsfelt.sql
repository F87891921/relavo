-- ============================================================================
-- Kunden kunne åpne sin egen konto
--
-- Policyen «Administrator endrer egen organisasjon» lot en kundeadministrator
-- oppdatere sin egen rad. Den var ment for navn og organisasjonsnummer på
-- kontosiden, men en policy gjelder raden, ikke kolonnene — så den samme
-- veien kunne brukes til å sette status = 'aktiv' og plan = 'enterprise' med
-- ett kall mot REST-grensesnittet, uten kredittsjekk og uten betaling.
--
-- Funnet ved å kjøre betalingsflyten som en ekte kunde mot de ekte
-- funksjonene. Bygget, typene og alle sidene var grønne hele veien; bare et
-- kall kunden faktisk kan gjøre viser dette.
--
-- Radnivåsikkerhet kan ikke skille på kolonner, og kolonnerettigheter kan
-- ikke skille på hvem som spør — personalet er «authenticated» på samme måte
-- som kunden. Derfor en utløser.
--
-- Den må være security invoker. Som definer kjører den som sin egen eier, og
-- da er current_user aldri 'authenticated' — sjekken slipper alt gjennom,
-- inkludert kunden den er der for å stoppe. Som invoker arver den rollen til
-- den som oppdaterer: 'authenticated' rett fra REST, eieren inne i en
-- security definer-funksjon som bestill_plan. er_ansatt() er selv definer og
-- virker like fullt herfra.
-- ============================================================================
create or replace function vern_organisasjonsfelt()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if er_ansatt() then
    return new;
  end if;

  -- Kunden får endre navn og organisasjonsnummer. Alt annet på raden
  -- bestemmer hva de har tilgang til og hva de betaler.
  if new.status            is distinct from old.status
  or new.plan              is distinct from old.plan
  or new.betalingsmate     is distinct from old.betalingsmate
  or new.forskuddsbetaling is distinct from old.forskuddsbetaling
  or new.aktivert          is distinct from old.aktivert
  or new.aktivert_av       is distinct from old.aktivert_av
  or new.avslag_grunn      is distinct from old.avslag_grunn
  or new.stripe_kunde_id   is distinct from old.stripe_kunde_id
  or new.stripe_okt_id     is distinct from old.stripe_okt_id
  or new.bestilt           is distinct from old.bestilt
  then
    raise exception 'Plan og kontostatus endres ikke herfra.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists vern_organisasjonsfelt on organisasjoner;

create trigger vern_organisasjonsfelt
  before update on organisasjoner
  for each row
  execute function vern_organisasjonsfelt();
