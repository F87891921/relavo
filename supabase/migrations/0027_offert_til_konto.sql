-- Kunden som godtar et tilbud oppretter kontoen selv fra en lenke i tilbudet.
-- Det avtalte beløpet og løpetiden lagres på organisasjonen, slik at
-- fakturaen blir akkurat det som ble tilbudt — ikke listeprisen for planen.
--
-- avtalt_total er samlet sum eks. mva. over hele løpetiden. Den skrives bare
-- av serveren (service_role) og leses av oss.
alter table offerter
  add column if not exists organisasjon_id uuid references organisasjoner(id) on delete set null;

alter table organisasjoner
  add column if not exists offert_id uuid references offerter(id) on delete set null,
  add column if not exists avtalt_total integer check (avtalt_total >= 0),
  add column if not exists avtale_mnd integer check (avtale_mnd between 1 and 120);

-- Én konto per tilbud.
create unique index if not exists offerter_en_konto on offerter (organisasjon_id)
  where organisasjon_id is not null;

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
  or new.offert_id         is distinct from old.offert_id
  or new.avtalt_total      is distinct from old.avtalt_total
  or new.avtale_mnd        is distinct from old.avtale_mnd
  then
    raise exception 'Plan og kontostatus endres ikke herfra.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
