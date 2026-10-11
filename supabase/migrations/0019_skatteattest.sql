-- ============================================================================
-- Skatteattest
--
-- § 5i krever at oppdragsgiver kontrollerer at leverandøren har betalt skatt
-- og avgift. Kontrollen har hittil stått som «ikke sjekket» på hver eneste
-- rapport, fordi ingen kunne levere attesten noe sted.
--
-- Vi henter den ikke fra Skatteetaten. Attesten utleveres til selskapet
-- selv, ikke til hvem som helst som spør — og norsk praksis er at
-- leverandøren legger den ved tilbudet. Maskinporten-veien ville tatt
-- måneder og gitt det samme svaret som en PDF leverandøren uansett har.
--
-- Attesten ligger på leverandøren, ikke på én forespørsel: den er gyldig i
-- seks måneder og gjelder på tvers av anskaffelser. Derfor en egen tabell
-- og ikke flere kolonner på espd_erklaringer.
-- ============================================================================

create table skatteattester (
  id uuid primary key default gen_random_uuid(),
  organisasjon_id uuid not null references organisasjoner(id) on delete cascade,
  leverandor_id uuid not null references leverandorer(id) on delete cascade,
  -- Datoen attesten ble utstedt av Skatteetaten. Den avgjør om den er
  -- gyldig, ikke når den ble lastet opp — en seks måneder gammel attest
  -- lastet opp i dag er fortsatt seks måneder gammel.
  utstedt date not null,
  filsti text not null,
  filnavn text not null,
  levert_av_navn text,
  levert_av_rolle text,
  mottatt timestamptz not null default now()
);

create index on skatteattester (leverandor_id, utstedt desc);

alter table skatteattester enable row level security;

create policy "Full tilgang til egne skatteattester" on skatteattester
  for all using (organisasjon_id = min_organisasjon())
  with check (organisasjon_id = min_organisasjon());

-- Samme lukkede bøtte-mønster som for egenerklæringene: ingen policy for
-- anon eller authenticated, så filene nås bare gjennom service_role på
-- serveren, som lager en signert lenke som varer i et minutt.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'skatteattest', 'skatteattest', false, 15728640,
  array['application/pdf','image/png','image/jpeg']
)
on conflict (id) do nothing;

-- Føres inn med service_role etter at serveren har sett på filen, på
-- samme måte som espd_lever. Den står ikke i grant-lista nedenfor.
create or replace function skatteattest_lever(
  t uuid, p_utstedt date, p_filsti text, p_filnavn text,
  p_navn text, p_rolle text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rad record;
begin
  -- Leverandøren og organisasjonen hentes fra ESPD-forespørselen tokenet
  -- hører til. Da kan ikke et token brukes til å legge en attest på en
  -- annen leverandør enn den lenken gjelder.
  select e.leverandor_id, e.organisasjon_id into rad
    from espd_erklaringer e
   where e.token = t;

  if rad is null then
    return false;
  end if;

  insert into skatteattester (
    organisasjon_id, leverandor_id, utstedt, filsti, filnavn,
    levert_av_navn, levert_av_rolle
  )
  values (
    rad.organisasjon_id, rad.leverandor_id, p_utstedt, p_filsti, p_filnavn,
    p_navn, p_rolle
  );

  return true;
end;
$$;

revoke execute on function skatteattest_lever(uuid, date, text, text, text, text)
  from anon, authenticated;
