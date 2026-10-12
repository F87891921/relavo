-- ============================================================================
-- Leverandørgrense, kontrollkvote, betalingsregistrering og tofaktor-krav
-- ============================================================================

alter table organisasjoner
  add column if not exists kontroller_kjopt integer not null default 0 check (kontroller_kjopt >= 0),
  add column if not exists krever_tofaktor boolean not null default false;

-- Eksisterende enkeltkontroll-kunder mister ikke tilgang: de får minst én.
update organisasjoner o
   set kontroller_kjopt = greatest(1, (select count(*) from kontroller k where k.organisasjon_id = o.id))
 where plan = 'engangs' and status = 'aktiv';

-- Kommuner krever tofaktor som utgangspunkt. Administratoren kan slå det av.
update organisasjoner set krever_tofaktor = true
 where plan in ('liten', 'kommune', 'medelstor', 'stor');

-- ---------- Leverandørgrense (selskapsnivåene) ----------
create or replace function maks_leverandorer(p_plan text)
returns integer language sql immutable as $$
  select case p_plan when 'start' then 25 when 'vekst' then 100 when 'bygg' then 300 else null end
$$;

create or replace function begrens_leverandorer()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_plan text; v_maks integer; v_n integer;
begin
  select plan into v_plan from organisasjoner where id = new.organisasjon_id;
  v_maks := maks_leverandorer(v_plan);
  if v_maks is null then return new; end if;
  select count(*) into v_n from leverandorer where organisasjon_id = new.organisasjon_id;
  if v_n >= v_maks then
    raise exception 'Leverandørgrensen er nådd (%).', v_maks using hint = 'leverandorgrense';
  end if;
  return new;
end $$;

drop trigger if exists begrens_leverandorer on leverandorer;
create trigger begrens_leverandorer before insert on leverandorer
  for each row execute function begrens_leverandorer();

-- ---------- Kontrollkvote (enkeltkontroll) ----------
create or replace function begrens_kontroller()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_plan text; v_kjopt integer; v_n integer;
begin
  select plan, kontroller_kjopt into v_plan, v_kjopt from organisasjoner where id = new.organisasjon_id;
  if v_plan is distinct from 'engangs' then return new; end if;
  select count(*) into v_n from kontroller where organisasjon_id = new.organisasjon_id;
  if v_n >= coalesce(v_kjopt, 0) then
    raise exception 'Ingen kontroller igjen.' using hint = 'kontrollkvote';
  end if;
  return new;
end $$;

drop trigger if exists begrens_kontroller on kontroller;
create trigger begrens_kontroller before insert on kontroller
  for each row execute function begrens_kontroller();

-- ---------- Betalinger fra Stripe ----------
-- Én rad per Checkout-økt. Webhooken og «takk»-siden kan begge melde samme
-- betaling; bare den første teller.
create table if not exists stripe_hendelser (
  okt text primary key,
  opprettet timestamptz not null default now()
);
alter table stripe_hendelser enable row level security;

create or replace function registrer_betaling(p_okt text, p_org uuid, p_kunde text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_rader integer;
begin
  insert into stripe_hendelser (okt) values (p_okt) on conflict (okt) do nothing;
  get diagnostics v_rader = row_count;
  if v_rader = 0 then return false; end if;

  update organisasjoner
     set aktivert = case when status = 'venter_betaling' then now() else aktivert end,
         status = case when status = 'venter_betaling' then 'aktiv' else status end,
         stripe_okt_id = p_okt,
         stripe_kunde_id = coalesce(p_kunde, stripe_kunde_id),
         kontroller_kjopt = kontroller_kjopt + case when plan = 'engangs' then 1 else 0 end
   where id = p_org;
  return true;
end $$;

revoke execute on function registrer_betaling(text, uuid, text) from public, anon, authenticated;
grant execute on function registrer_betaling(text, uuid, text) to service_role;

-- ---------- Reservekoder for tofaktor ----------
-- Bare hasher lagres. Ingen policyer: tabellen leses og skrives av serveren.
create table if not exists tofaktor_reservekoder (
  id uuid primary key default gen_random_uuid(),
  bruker_id uuid not null references auth.users(id) on delete cascade,
  kode_hash text not null,
  brukt timestamptz,
  opprettet timestamptz not null default now()
);
create index if not exists tofaktor_reservekoder_bruker on tofaktor_reservekoder (bruker_id);
alter table tofaktor_reservekoder enable row level security;

-- Kunden skal ikke kunne gi seg selv flere kontroller.
create or replace function vern_organisasjonsfelt()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if current_user not in ('authenticated', 'anon') then return new; end if;
  if er_ansatt() then return new; end if;

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
  or new.kontroller_kjopt  is distinct from old.kontroller_kjopt
  then
    raise exception 'Plan og kontostatus endres ikke herfra.' using errcode = '42501';
  end if;
  return new;
end $$;
