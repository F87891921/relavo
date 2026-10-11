-- ============================================================================
-- Relavo — EUs konsoliderte sanksjonsliste
--
-- Norge gjennomfører EUs restriktive tiltak gjennom sanksjonsloven. Å kjøpe
-- fra en sanksjonert aktør er ulovlig uansett hva anskaffelsesregelverket
-- sier, så dette hører hjemme i kontrollen.
--
-- MEN: lista identifiserer folk og selskaper med NAVN, ikke med norske
-- organisasjonsnumre. All kobling blir navnelikhet, og navnelikhet gir
-- falske treff. Et selskap som feilaktig merkes som sanksjonert er rammet
-- hardt og urettmessig. Derfor er dette en screening, aldri en konklusjon.
-- ============================================================================

create extension if not exists pg_trgm;

create table if not exists sanksjoner (
  id uuid primary key default gen_random_uuid(),
  navn text not null,
  slag text not null check (slag in ('person', 'enhet')),
  program text,
  referanse text,
  kilde_dato timestamptz,
  oppdatert timestamptz not null default now()
);

create index if not exists sanksjoner_navn_trgm
  on sanksjoner using gin (navn gin_trgm_ops);
create index if not exists sanksjoner_slag on sanksjoner (slag);

alter table sanksjoner enable row level security;

create policy "Alle innloggede kan lese sanksjonslista" on sanksjoner
  for select using (auth.uid() is not null);

-- Selskapsformen sier ingenting om hvem selskapet er, og drar
-- likhetsscoren ned på begge sider. Den fjernes før sammenligning.
create or replace function normaliser_selskapsnavn(p text)
returns text language sql immutable as $$
  select trim(regexp_replace(
    regexp_replace(
      lower(coalesce(p, '')),
      '\s+(as|asa|ans|ab|a/s|oy|llc|ltd|limited|inc|corp|plc|jsc|pjsc|ojsc|ooo|oao|zao|gmbh|sa|nv|bv|srl|spa)\.?$',
      '', 'g'),
    '[^a-z0-9æøåäöü ]+', ' ', 'g'));
$$;

/**
 * Screening av ett navn mot lista.
 *
 * similarity() alene duger ikke: similarity('Gazprom', 'Gazprom PMC') er
 * 0,67, så en faktisk sanksjonert aktør gikk rett gjennom en terskel på
 * 0,75. Trigramlikhet straffer lengdeforskjell — jo mer som står rundt
 * navnet i lista, jo lavere score, selv når navnet står der uendret.
 * word_similarity måler det vi faktisk spør om: finnes denne strengen inni
 * den andre.
 *
 * To regler i stedet for én terskel:
 *
 *   Ett ord   — minst seks tegn, og må stå der helt. «gazprom» slipper
 *               gjennom, «nord» faller på lengden. Et kort vanlig ord er
 *               ikke et navn, det er en stavelse som finnes inni hundrevis
 *               av lange selskapsnavn — «Nord AS» traff «Nord-Ouest».
 *   Flere ord — lavere krav, fordi to ord som begge passer er et signal i
 *               seg selv.
 */
create or replace function sanksjonstreff(
  p_navn text, p_slag text, p_terskel real default 0.60
)
returns table (navn text, program text, referanse text, likhet real, eksakt boolean)
language sql stable security definer set search_path = public as $$
  with sokt as (
    select normaliser_selskapsnavn(p_navn) as n,
           array_length(string_to_array(trim(normaliser_selskapsnavn(p_navn)), ' '), 1) as ord
  )
  select s.navn, s.program, s.referanse, m.likhet::real,
         normaliser_selskapsnavn(s.navn) = sokt.n as eksakt
  from sanksjoner s, sokt,
       lateral (select greatest(
         word_similarity(sokt.n, normaliser_selskapsnavn(s.navn)),
         similarity(sokt.n, normaliser_selskapsnavn(s.navn))) as likhet) m
  where s.slag = p_slag
    and length(sokt.n) >= 4
    and case when sokt.ord = 1 then length(sokt.n) >= 6 and m.likhet >= 0.95
             else m.likhet >= p_terskel end
  order by eksakt desc, m.likhet desc
  limit 10;
$$;

grant execute on function sanksjonstreff(text, text, real) to authenticated;
grant execute on function normaliser_selskapsnavn(text) to authenticated;

insert into integrasjoner (navn) values ('sanksjoner')
on conflict (navn) do nothing;
