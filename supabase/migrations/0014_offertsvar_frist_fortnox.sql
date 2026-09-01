-- ============================================================================
-- Relavo — tre svar på et tilbud, betalingsfrist, og fakturaer fra Fortnox
--
-- Et nei er ikke ett nei. «Prisen ligger over rammen vår, kom tilbake med to
-- år i stedet» er ikke det samme som «vi går videre med noen andre», men
-- begge havnet på forlorad og låste tilbudet. Den første er en åpning, og
-- den skal ikke se ut som en dør som er lukket.
--
-- Derfor tre utfall: akseptert, endring, avslatt. Bare det siste er tapt;
-- «endring» lar tilbudet stå som sendt, fordi ballen da er hos oss.
-- ============================================================================

alter table offerter drop constraint if exists offerter_svar_check;
alter table offerter
  add constraint offerter_svar_check
  check (svar in ('akseptert', 'endring', 'avslatt'));

alter table offerter
  -- 30 dager er vanlig mot det offentlige, men ikke alltid riktig: for en ny
  -- privat kunde vil man gjerne ha 10 eller 14.
  add column if not exists betalingsfrist integer not null default 30
    check (betalingsfrist between 0 and 90),
  add column if not exists erstatter uuid references offerter(id);

alter table fakturaer
  add column if not exists fortnox_id text,
  add column if not exists fortnox_synk timestamptz,
  add column if not exists betalingsfrist integer;

create unique index if not exists fakturaer_fortnox on fakturaer (fortnox_id)
  where fortnox_id is not null;

-- Tokens for eksterne tjenester. Ingen RLS-policy med vilje: bare
-- service_role kommer til. Fortnox bytter fornyelsestokenet hver time, så
-- det kan ikke ligge i en miljøvariabel som må endres for hånd.
create table if not exists integrasjoner (
  navn text primary key,
  tilgangstoken text,
  fornyelsestoken text,
  utloper timestamptz,
  sist_synk timestamptz,
  sist_feil text,
  oppdatert timestamptz not null default now()
);
alter table integrasjoner enable row level security;

create or replace function integrasjonsstatus(p_navn text)
returns table (koblet boolean, sist_synk timestamptz, sist_feil text, utloper timestamptz)
language sql security definer set search_path = public as $$
  select (i.tilgangstoken is not null), i.sist_synk, i.sist_feil, i.utloper
  from integrasjoner i where i.navn = p_navn and er_ansatt();
$$;
grant execute on function integrasjonsstatus(text) to authenticated;

-- Svaret fra kunden, nå med tre utfall.
create or replace function offert_svar(t uuid, p_svar text, p_kommentar text, p_navn text)
returns boolean language plpgsql security definer set search_path = public as $$
declare rad offerter%rowtype;
begin
  if p_svar not in ('akseptert', 'endring', 'avslatt') then return false; end if;
  -- Både «ønsker endring» og «nei» krever noen ord. Uten dem er det
  -- ingenting å gjøre noe med, og det er derfor vi spør.
  if p_svar <> 'akseptert' and coalesce(trim(p_kommentar), '') = '' then return false; end if;

  update offerter
     set svar = p_svar,
         svar_kommentar = nullif(trim(p_kommentar), ''),
         svar_navn = nullif(trim(p_navn), ''),
         svar_tid = now(),
         status = case
                    when p_svar = 'akseptert' then 'akseptert'
                    when p_svar = 'avslatt' then 'forlorad'
                    else 'skickad'
                  end
   where token = t and sendt is not null and svar is null
   returning * into rad;

  if rad.id is null then return false; end if;

  insert into interne_varsler (slag, tittel, tekst, lenke)
  values (
    case when p_svar = 'endring' then 'offert_endring' else 'offert_svar' end,
    case
      when p_svar = 'akseptert' then rad.kund || ' har accepterat offerten'
      when p_svar = 'endring' then rad.kund || ' vill ha en ändring i offerten'
      else rad.kund || ' har tackat nej till offerten'
    end,
    coalesce(nullif(trim(p_kommentar), ''), null),
    '/internt/offerter/' || rad.id
  );
  return true;
end; $$;

grant execute on function offert_svar(uuid, text, text, text) to anon, authenticated;
