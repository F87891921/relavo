-- ============================================================================
-- Tallet landingssiden viser
--
-- Hele poenget med renholdsregisteret er at en treff i det ikke betyr
-- godkjent: det inneholder både godkjente og ikke godkjente, og to av fem
-- er ikke godkjente. Det tallet er sidens sterkeste argument, og det er
-- vårt eget — vi har hele registeret, ikke et utsnitt.
--
-- Derfor hentes det fra basen i stedet for å skrives inn i teksten. Et tall
-- som står i en setning blir feil den dagen registeret endrer seg, og da
-- står det en påstand på forsiden som ikke stemmer.
--
-- Funksjonen gir bare tre tall. Selve registeret er fortsatt lukket for den
-- som ikke er innlogget — ingen kan bruke forsiden til å slå opp om et
-- bestemt selskap er godkjent.
-- ============================================================================
-- Datoen hører med i det samme svaret. Forsiden kan ikke lese registersynk
-- selv — den tabellen er lukket for den som ikke er innlogget, og da faller
-- datoen bort nettopp der tallet trenger den mest. Et tall uten dato er en
-- påstand; et tall med dato er en måling.
create or replace function renholdstall()
returns table (
  totalt bigint,
  godkjente bigint,
  ikke_godkjente bigint,
  sist_hentet timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select count(*),
         count(*) filter (where godkjent),
         count(*) filter (where not godkjent),
         (select r.sist_hentet from registersynk r where r.register = 'renhold')
    from renholdsvirksomheter;
$$;

grant execute on function renholdstall() to anon, authenticated;
