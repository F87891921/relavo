-- Selskap (ikke kommune) velger nivå etter antall leverandører de følger.
-- Nivåene er start (25), vekst (100) og bygg (300). Over 300 er offert.
-- Grensen på antall leverandører håndheves ikke ennå; nivået lagres så
-- fakturering og senere håndheving har noe å gå etter.
alter table organisasjoner drop constraint organisasjoner_plan_check;
alter table organisasjoner add constraint organisasjoner_plan_check
  check (plan in ('engangs', 'liten', 'kommune', 'medelstor', 'stor',
                  'start', 'vekst', 'bygg', 'standard', 'enterprise'));

create or replace function maks_brukere(p_plan text)
returns integer
language sql immutable
as $$
  select case p_plan
    when 'engangs'    then 1
    when 'standard'   then 3
    when 'enterprise' then 10
    when 'liten'      then 1000
    when 'kommune'    then 1000
    when 'medelstor'  then 1000
    when 'stor'       then 1000
    when 'start'      then 1000
    when 'vekst'      then 1000
    when 'bygg'       then 1000
    else 1
  end
$$;

create or replace function bestill_plan(p_plan text, p_betalingsmate text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org  uuid := min_organisasjon();
  v_rolle text := min_rolle();
  v_ny   text;
begin
  if v_org is null then
    raise exception 'Ingen organisasjon';
  end if;
  if v_rolle is distinct from 'administrator' then
    raise exception 'Bare administrator kan bestille';
  end if;

  -- «stor» står med vilje ikke i lista. Den har ingen listepris og skal
  -- ikke kunne bestilles av kunden selv: den settes etter en offert.
  if p_plan not in ('engangs', 'liten', 'kommune', 'medelstor',
                    'start', 'vekst', 'bygg', 'standard', 'enterprise') then
    raise exception 'Ukjent plan';
  end if;
  if p_betalingsmate not in ('kort', 'faktura') then
    raise exception 'Ukjent betalingsmåte';
  end if;

  -- Abonnement faktureres, ikke trekkes. Avtalen er tolv måneder fast uten
  -- automatisk fornyelse, og et kort som trekkes hver måned er akkurat den
  -- fornyelsen avtalen ikke har.
  if p_betalingsmate = 'kort' and p_plan <> 'engangs' then
    raise exception 'Abonnement faktureres';
  end if;

  -- Kort: kontoen står i venter_betaling til Stripe har bekreftet.
  -- Faktura: den står i venter_kreditt til noen hos oss har vurdert den.
  v_ny := case when p_betalingsmate = 'kort' then 'venter_betaling' else 'venter_kreditt' end;

  update organisasjoner
     set plan = p_plan,
         betalingsmate = p_betalingsmate,
         bestilt = now(),
         status = v_ny,
         avslag_grunn = null
   where id = v_org and status in ('venter_kreditt', 'venter_betaling', 'avslatt');

  -- Fakturabestillinger skal noen hos oss se med en gang.
  if p_betalingsmate = 'faktura' then
    insert into interne_varsler (slag, tittel, tekst, lenke)
    select 'ny_bestilling',
           o.navn || ' har bestilt ' || p_plan || ' mot faktura',
           'Venter på kredittkontroll.',
           '/internt/onboarding'
      from organisasjoner o where o.id = v_org;
  end if;

  return v_ny;
end;
$$;
