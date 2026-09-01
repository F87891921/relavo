-- ============================================================================
-- Relavo — språkvalg
--
-- Valget følger personen, ikke nettleseren. En innkjøpsleder som logger inn
-- hjemmefra skal møte det samme språket som på kontoret. Kapselen finnes i
-- tillegg, for den som ennå ikke har konto og velger på landingssiden.
--
-- Standard er norsk. Kundene er norske kommuner, og det er språket
-- regelverket og alle dokumentene er på. Ingen gjetning på Accept-Language:
-- en side som bytter språk av seg selv fordi noen har en engelsk nettleser
-- er verre enn en side som alltid er på norsk.
--
-- Dokumentene følger IKKE dette valget. Tilbud, § 24-9-krav, ESPD-
-- forespørsler og vilkårene er alltid på norsk — de går til norske
-- leverandører fra norske oppdragsgivere og skal journalføres i norske
-- arkiver. En oversatt avtaletekst er en ny avtaletekst.
-- ============================================================================

alter table profiler
  add column if not exists sprak text not null default 'no'
    check (sprak in ('no', 'sv', 'en'));

comment on column profiler.sprak is
  'Grensesnittspråk. Dokumentene er alltid på norsk uansett hva som står her.';

-- De ansatte er svensker, og kontopanelet ble skrevet på svensk med vilje.
-- Den avgjørelsen skal ikke falle bort fordi standarden nå er norsk.
update profiler set sprak = 'sv' where ansatt is true;
