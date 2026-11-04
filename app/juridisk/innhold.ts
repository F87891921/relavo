/**
 * Innholdet i de juridiske sidene, portet ordentlig fra
 * relavo-juridisk.html. Teksten er uendret — den er skrevet for å stå seg
 * juridisk, og skal ikke omformuleres uten at noen med ansvar har lest den.
 *
 * Avtaleparten settes fra lib/relavo.ts, ikke som fast tekst. Den sto før
 * som «Relavo AS, org.nr FYLLES UT» — og Relavo AS finnes ikke. Relavo er
 * produktnavnet; selskapet er LOD TECH AB NUF, den norske filialen av
 * svenske LOD TECH AB. En avtale som oppgir et selskap som ikke er
 * registrert, er en avtale motparten kan bestride.
 *
 * MERK: to kommersielle valg står igjen og er markert nedenfor —
 * oppsigelsesfristen og vernetinget. Begge er satt til et rimelig
 * utgangspunkt og bør bekreftes av noen med ansvar.
 */
import { avtalepart } from "@/lib/relavo";

export type Blokk =
  | { t: "p" | "h3"; v: string }
  | { t: "liste"; v: string[] };

export type Seksjon = { id: string; tittel: string; blokker: Blokk[] };

export const JURIDISK: Seksjon[] = [
  {
    "id": "vilkar",
    "tittel": "Brukervilkår",
    "blokker": [
      {
        "t": "p",
        "v": `Disse vilkårene gjelder mellom ${avtalepart()} («Relavo», «vi»), og virksomheten som har inngått avtale om bruk av tjenesten («kunden», «du»). Relavo er et produktnavn; avtaleparten er selskapet nevnt over.`
      },
      {
        "t": "h3",
        "v": "1.1 Hva tjenesten er"
      },
      {
        "t": "p",
        "v": "Relavo er et verktøy for leverandørkontroll i offentlige og private anskaffelser. Tjenesten henter opplysninger fra offentlige registre og kommersielle datakilder, sammenstiller dem i en rapport, og lagrer rapporten som dokumentasjon."
      },
      {
        "t": "p",
        "v": "Kredittrating, betalingsanmerkninger og pant, søk mot sanksjonslister og lister over politisk eksponerte personer (PEP), og opplysninger om roller i virksomheten hentes fra Proff AS. Kilden oppgis i rapporten. Opplysningene fra Proff er kommersielle vurderinger og søk på navn, og kan inneholde feil eller treff som gjelder en annen person eller et annet selskap. Kunden bruker dem i sin egen anskaffelse og kan ikke videreselge eller dele dem med andre."
      },
      {
        "t": "p",
        "v": "Relavo treffer ingen beslutninger. Vurderingen av om en leverandør skal avvises, kvalifiseres eller tildeles kontrakt tas av kunden. Risikonivåer, flagg og anbefalinger i tjenesten er beslutningsstøtte, ikke konklusjoner. Relavo er et beslutningsstøtteverktøy: den endelige vurderingen, og ansvaret for den, ligger hos kunden. Kunden må selv se over rapportens innhold og kilder, og vurdere dem opp mot anskaffelsen, før den legges til grunn for en beslutning eller føres inn i anskaffelsesprotokollen."
      },
      {
        "t": "h3",
        "v": "1.2 Hva tjenesten ikke er"
      },
      {
        "t": "liste",
        "v": [
          "Relavo kontrollerer virksomheter. For å søke mot sanksjons- og PEP-lister søker vi i tillegg på navn og fødselsdato til personene i styre, ledelse og med signaturrett eller prokura i virksomheten (se punkt 2.3). Vi behandler ikke opplysninger om straffedommer eller lovovertredelser. Se punkt 2.4.",
          "Relavo er ikke juridisk rådgivning. Paragrafhenvisninger i tjenesten er veiledende og fritar ikke kunden fra å vurdere regelverket selv.",
          "Relavo garanterer ikke at opplysninger i offentlige registre er korrekte eller oppdaterte. Vi videreformidler det kildene oppgir, med kilde og tidspunkt."
        ]
      },
      {
        "t": "h3",
        "v": "1.3 Kundens ansvar"
      },
      {
        "t": "liste",
        "v": [
          "Å ha et selvstendig behandlingsgrunnlag for kontrollene som gjennomføres.",
          "Å foreta den endelige vurderingen av hver leverandør selv. Rapporter og flagg fra Relavo er beslutningsstøtte og erstatter ikke kundens egen vurdering, og kunden svarer for beslutningene som tas.",
          "Å kontrollere et mulig treff på en sanksjons- eller PEP-liste selv før det legges til grunn. Et treff på navn er ikke en bekreftelse, mange har samme navn, og en PEP-status er i seg selv ikke noe galt.",
          "Å sørge for at brukere hos kunden har den tilgangen de skal ha, og ikke mer.",
          "Å ikke bruke tjenesten til å kontrollere virksomheter uten saklig grunn knyttet til en anskaffelse, et kontraktsforhold eller en forestående inngåelse av et slikt forhold."
        ]
      },
      {
        "t": "h3",
        "v": "1.4 Priser og fakturering"
      },
      {
        "t": "p",
        "v": "Priser fremgår av prislisten og av avtalen. Prisen for abonnement følger kommunens innbyggertall (SSB) og oppgis per måned. Abonnement har tolv måneders bindingstid og faktureres årlig forskuddsvis. Avtaler som betales mot faktura fornyes ikke automatisk. Selskap som betaler med kort velger å betale månedlig eller årlig, og abonnementet fornyes automatisk for en måned eller ett år av gangen til kunden sier det opp i betalingsportalen. Oppsigelse gjelder ut den perioden som er betalt, og betalt periode refunderes ikke. Kommuner betaler alltid mot faktura. Enkeltkontroller faktureres etterskuddsvis. Alle priser er oppgitt eksklusive merverdiavgift."
      },
      {
        "t": "p",
        "v": "Prisen dekker den ferdige rapporten uavhengig av hvor mange kilder den bygger på. Kvoten i abonnementet gjelder antall kontroller, ikke antall oppslag bak hver kontroll."
      },
      {
        "t": "h3",
        "v": "1.5 Varighet og oppsigelse"
      },
      {
        "t": "p",
        "v": "Avtalen løper til den sies opp av en av partene med tre måneders varsel før utløpet av avtaleperioden. Ved oppsigelse beholder kunden tilgang ut den betalte perioden."
      },
      {
        "t": "p",
        "v": "Kunden kan når som helst eksportere alle sine data som en fil fra kontosiden, og enkeltrapporter som PDF. Etter avtaleslutt slettes kundens data innen 90 dager, med mindre kunden ber om sletting tidligere eller lovpålagt oppbevaring krever noe annet."
      },
      {
        "t": "h3",
        "v": "1.6 Ansvarsbegrensning"
      },
      {
        "t": "p",
        "v": "Relavos samlede erstatningsansvar er begrenset til det kunden har betalt de siste tolv månedene før kravet oppsto. Vi er ikke ansvarlige for indirekte tap, herunder tapt fortjeneste, tapte kontrakter eller krav fra tredjepart som følge av kundens beslutninger."
      },
      {
        "t": "p",
        "v": "Begrensningen gjelder ikke ved forsett eller grov uaktsomhet."
      },
      {
        "t": "h3",
        "v": "1.7 Tilgjengelighet"
      },
      {
        "t": "p",
        "v": "Vi tilstreber 99,5 % oppetid målt per måned, utenom varslet vedlikehold. Tjenesten er avhengig av eksterne registre. Nedetid hos Brønnøysundregistrene, Skatteetaten eller kredittopplysningsleverandør regnes ikke som nedetid hos oss, men vi viser alltid hvilke kilder som ikke svarte i den enkelte rapporten."
      },
      {
        "t": "h3",
        "v": "1.8 Endringer"
      },
      {
        "t": "p",
        "v": "Vi kan endre vilkårene med 30 dagers varsel. Vesentlige endringer varsles på e-post til kundens kontaktperson. Fortsatt bruk etter varselfristen regnes som aksept."
      },
      {
        "t": "h3",
        "v": "1.9 Lovvalg og verneting"
      },
      {
        "t": "p",
        "v": "Avtalen reguleres av norsk rett. Tvister søkes løst i minnelighet. Verneting er Oslo tingrett."
      }
    ]
  },
  {
    "id": "personvern",
    "tittel": "Personvernerklæring",
    "blokker": [
      {
        "t": "p",
        "v": "Denne erklæringen gjelder Relavos behandling av personopplysninger, både på nettstedet og i tjenesten."
      },
      {
        "t": "h3",
        "v": "2.1 Behandlingsansvarlig"
      },
      {
        "t": "p",
        "v": `${avtalepart()} er behandlingsansvarlig for opplysninger om brukerne av tjenesten og besøkende på nettstedet.`
      },
      {
        "t": "p",
        "v": "For opplysninger kunden legger inn eller genererer i tjenesten er kunden behandlingsansvarlig og Relavo databehandler. Se punkt 3."
      },
      {
        "t": "h3",
        "v": "2.2 Hva vi behandler om brukere"
      },
      {
        "t": "h3",
        "v": "2.3 Opplysninger om personer i kontrollerte virksomheter"
      },
      {
        "t": "p",
        "v": "I tre tilfeller behandler vi navn på personer knyttet til virksomhetene som kontrolleres:"
      },
      {
        "t": "liste",
        "v": [
          "Signaturrett. Ved forespørsel om egenerklæring henter vi navn og rolle på dem som står med signaturrett eller prokura i Foretaksregisteret. Formålet er å vite hvem som kan binde selskapet. Vi lagrer ikke fødselsnummer.",
          "Signatur. Når en egenerklæring signeres med BankID lagrer vi navn, rolle, tidspunkt og delvis maskert fødselsdato. Fullt fødselsnummer lagres ikke.",
          "Sanksjons- og PEP-søk. Ved en kontroll søker vi hos Proff AS på navn og fødselsdato til personene i styre, ledelse, signatur og prokura i virksomheten, mot sanksjonslister (EU, FN, USA og Storbritannia) og lister over politisk eksponerte personer i Norden. Vi sender navn og fødselsdato til Proff for å få svaret, og lagrer dem ikke selv. Gir søket et mulig treff, lagrer vi personens navn, hvilken liste det gjelder og tidspunktet som et flagg i rapporten. Gir søket ikke treff, lagrer vi ingen navn. Behandlingsgrunnlaget er berettiget interesse (personvernforordningen art. 6 nr. 1 bokstav f) i å kunne dokumentere at leverandørkontrollen er gjort."
        ]
      },
      {
        "t": "p",
        "v": "Vi gjør ingen vurdering av personene som sådan. For signatur er formålet avgrenset til å fastslå fullmakt og signaturens gyldighet. Ved sanksjons- og PEP-søk er et mulig treff navnelikhet og ikke en konklusjon om personen, og må kontrolleres av kunden."
      },
      {
        "t": "h3",
        "v": "2.4 Det vi bevisst ikke behandler"
      },
      {
        "t": "p",
        "v": "Opplysninger om straffedommer og lovovertredelser. Behandling av slike opplysninger er etter personopplysningsloven § 11 i praksis forbeholdt offentlige myndigheter under offentlig myndighets kontroll. Relavo henter dem ikke, verken maskinelt eller manuelt. Den delen av kvalifikasjonsvurderingen dekkes av leverandørens egen ESPD-erklæring, som leverandøren avgir under ansvar og som vi bare oppbevarer. Sanksjonslistene vi søker mot er forvaltningsrettslige restriksjoner og ikke straffedommer. Vi lagrer ikke detaljer om hvorfor en person står på en liste, bare at navnet ga et mulig treff."
      },
      {
        "t": "h3",
        "v": "2.5 Hvem vi deler med"
      },
      {
        "t": "p",
        "v": "Vi selger ikke personopplysninger og bruker dem ikke til markedsføring mot tredjepart. Vi bruker underleverandører for drift, se punkt 3.3. Alle underleverandører er bundet av databehandleravtale. Vi sender organisasjonsnummer og, for sanksjons- og PEP-søk, navn og fødselsdato til personer i roller til Proff AS (se punkt 2.3)."
      },
      {
        "t": "h3",
        "v": "2.6 Overføring ut av EØS"
      },
      {
        "t": "p",
        "v": "Tjenesten driftes innenfor EØS. Skjer overføring ut av EØS, skjer det på grunnlag av EU-kommisjonens standardvilkår eller tilstrekkelighetsbeslutning. Gjeldende oversikt finnes i punkt 3.3."
      },
      {
        "t": "h3",
        "v": "2.7 Dine rettigheter"
      },
      {
        "t": "liste",
        "v": [
          "Innsyn i hvilke opplysninger vi har om deg",
          "Retting av uriktige opplysninger",
          "Sletting, når vi ikke har plikt eller grunnlag til å beholde dem",
          "Begrensning av behandlingen og innsigelse mot behandling basert på berettiget interesse",
          "Dataportabilitet for opplysninger du selv har gitt oss"
        ]
      },
      {
        "t": "p",
        "v": "Henvendelser rettes til personvern@relavo.no. Vi svarer innen 30 dager. Du kan klage til Datatilsynet om du mener behandlingen er ulovlig."
      },
      {
        "t": "h3",
        "v": "2.8 Sikkerhet"
      },
      {
        "t": "p",
        "v": "Data krypteres i transitt og i ro. Tilgang internt er rollestyrt og logges. Ansatte hos Relavo kan ikke åpne en kundes rapporter uten at kunden har aktivert innsyn, og all slik tilgang vises i kundens egen logg."
      }
    ]
  },
  {
    "id": "databehandler",
    "tittel": "Databehandleravtale",
    "blokker": [
      {
        "t": "p",
        "v": "Denne avtalen inngår som en del av kundeavtalen og regulerer Relavos behandling av personopplysninger på vegne av kunden."
      },
      {
        "t": "h3",
        "v": "3.1 Roller"
      },
      {
        "t": "p",
        "v": "Kunden er behandlingsansvarlig. Relavo er databehandler og behandler opplysninger kun etter dokumenterte instrukser fra kunden, slik de fremgår av kundeavtalen og bruken av tjenesten."
      },
      {
        "t": "h3",
        "v": "3.2 Behandlingens omfang"
      },
      {
        "t": "liste",
        "v": [
          "Formål: å utføre leverandørkontroller for kunden og lagre dem som dokumentasjon.",
          "Registrerte: brukere hos kunden, og personer i styre, ledelse, signatur og prokura i de virksomhetene kunden kontrollerer.",
          "Opplysninger: for brukere navn, e-postadresse, rolle og innloggingsdata. For personer i roller: navn, rolle og fødselsdato i søket mot sanksjons- og PEP-lister, og navn som flagg når søket gir et mulig treff.",
          "Varighet: så lenge avtalen løper. Data slettes innen 90 dager etter avtaleslutt, med mindre kunden ber om sletting tidligere."
        ]
      },
      {
        "t": "h3",
        "v": "3.3 Underleverandører"
      },
      {
        "t": "p",
        "v": "Kunden gir generelt samtykke til bruk av underleverandører. Endringer varsles med 30 dagers frist, og kunden kan innvende."
      },
      {
        "t": "p",
        "v": "Brønnøysundregistrene, Skatteetaten og Lovdata er ikke underleverandører. Vi henter opplysninger fra dem, men de behandler ingenting på våre vegne."
      },
      {
        "t": "p",
        "v": "Kredittrating, betalingsanmerkninger, sanksjons- og PEP-søk og roller hentes fra Proff AS (Oslo), en kredittopplysningsleverandør. Proff er en datakilde og ikke en underleverandør som behandler kundens opplysninger på våre vegne. Vi sender organisasjonsnummeret til selskapet som kontrolleres og, for sanksjons- og PEP-søk, navn og fødselsdato til personer i roller. Proffs egen behandling styres av Proffs vilkår. Vi lagrer svaret i kontrollen innenfor EØS, og lagrer personnavn bare når søket gir et mulig treff."
      },
      {
        "t": "h3",
        "v": "3.4 Sikkerhet og avvik"
      },
      {
        "t": "p",
        "v": "Relavo varsler kunden uten ugrunnet opphold, og senest innen 24 timer, ved brudd på personopplysningssikkerheten som berører kundens data. Varselet inneholder det kunden trenger for å melde til Datatilsynet innen 72 timer."
      },
      {
        "t": "h3",
        "v": "3.5 Revisjon"
      },
      {
        "t": "p",
        "v": "Kunden kan én gang i året kreve dokumentasjon på at avtalen etterleves. Kunden dekker egne kostnader ved slik gjennomgang."
      },
      {
        "t": "h3",
        "v": "3.6 Sletting og tilbakelevering"
      },
      {
        "t": "p",
        "v": "Administratoren kan selv slette kontoen fra kontosiden. Kontoen stenges da med en gang, og dataene slettes etter 14 dagers angrefrist. Fakturaer beholdes som regnskapsmateriale i den tiden loven krever. Ved avtaleslutt uten at kunden har slettet selv sletter Relavo kundens personopplysninger innen 90 dager, med mindre kunden ber om utlevering først eller lovpålagt oppbevaring krever noe annet. Sikkerhetskopier slettes i tråd med ordinær rotasjon, senest innen 180 dager."
      }
    ]
  },
  {
    "id": "cookies",
    "tittel": "Informasjonskapsler",
    "blokker": [
      {
        "t": "p",
        "v": "Vi bruker informasjonskapsler som er nødvendige for at tjenesten skal fungere, og — med ditt samtykke — kapsler for analyse. Vi bruker ingen kapsler for markedsføring eller sporing mot tredjepart."
      },
      {
        "t": "p",
        "v": "Bruk av informasjonskapsler reguleres av ekomloven § 2-7 b. Nødvendige kapsler krever ikke samtykke. Alle andre gjør det, og samtykket kan trekkes tilbake når som helst."
      },
      {
        "t": "h3",
        "v": "4.1 Endre samtykke"
      },
      {
        "t": "p",
        "v": "Du kan endre eller trekke tilbake samtykket ditt når som helst. Du kan også slette kapsler i nettleseren din — da mister du innloggingen, men ingenting annet går tapt."
      },
      {
        "t": "p",
        "v": "Endre samtykke til informasjonskapsler"
      }
    ]
  },
  {
    "id": "kontakt",
    "tittel": "Kontakt",
    "blokker": [
      {
        "t": "p",
        "v": "Vi svarer på norsk, svensk og engelsk."
      },
      {
        "t": "p",
        "v": "Er du innlogget, opprett heller en sak under Brukerstøtte i appen. Da følger kontonavn, plan og hvilken kontroll det gjelder automatisk med, og saken kan følges av begge parter."
      }
    ]
  }
];
