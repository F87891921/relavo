/**
 * Innholdet i de juridiske sidene, portet ordentlig fra
 * relavo-juridisk.html. Teksten er uendret — den er skrevet for å stå seg
 * juridisk, og skal ikke omformuleres uten at noen med ansvar har lest den.
 *
 * MERK: teksten inneholder «org.nr FYLLES UT». Den må fylles inn før
 * sidene kan brukes mot ekte kunder.
 */
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
        "v": "Disse vilkårene gjelder mellom Relavo AS, org.nr FYLLES UT («Relavo», «vi»), og virksomheten som har inngått avtale om bruk av tjenesten («kunden», «du»)."
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
        "v": "Relavo treffer ingen beslutninger. Vurderingen av om en leverandør skal avvises, kvalifiseres eller tildeles kontrakt tas av kunden. Risikonivåer, flagg og anbefalinger i tjenesten er beslutningsstøtte, ikke konklusjoner."
      },
      {
        "t": "h3",
        "v": "1.2 Hva tjenesten ikke er"
      },
      {
        "t": "liste",
        "v": [
          "Relavo kontrollerer virksomheter, ikke enkeltpersoner. Vi behandler ikke opplysninger om straffedommer eller lovovertredelser. Se punkt 2.4.",
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
        "v": "Priser fremgår av prislisten og av avtalen. Abonnement faktureres forskuddsvis månedlig/årlig. Enkeltkontroller faktureres etterskuddsvis. Alle priser er oppgitt eksklusive merverdiavgift."
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
        "v": "Avtalen løper til den sies opp av en av partene med FYLLES UT måneders varsel før utløpet av avtaleperioden. Ved oppsigelse beholder kunden tilgang ut den betalte perioden."
      },
      {
        "t": "p",
        "v": "Kunden kan når som helst eksportere sine rapporter. Etter avtaleslutt slettes kundens data innen 90 dager, med mindre kunden ber om sletting tidligere eller lovpålagt oppbevaring krever noe annet."
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
        "v": "Avtalen reguleres av norsk rett. Tvister søkes løst i minnelighet. Verneting er FYLLES UT tingrett."
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
        "v": "Relavo AS, org.nr FYLLES UT, adresse, er behandlingsansvarlig for opplysninger om brukerne av tjenesten og besøkende på nettstedet."
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
        "v": "I to tilfeller behandler vi navn på personer knyttet til virksomhetene som kontrolleres:"
      },
      {
        "t": "liste",
        "v": [
          "Signaturrett. Ved forespørsel om egenerklæring henter vi navn og rolle på dem som står med signaturrett eller prokura i Foretaksregisteret. Formålet er å vite hvem som kan binde selskapet. Vi lagrer ikke fødselsnummer.",
          "Signatur. Når en egenerklæring signeres med BankID lagrer vi navn, rolle, tidspunkt og delvis maskert fødselsdato. Fullt fødselsnummer lagres ikke."
        ]
      },
      {
        "t": "p",
        "v": "Vi gjør ingen vurdering av personene som sådan. Formålet er avgrenset til å fastslå fullmakt og signaturens gyldighet."
      },
      {
        "t": "h3",
        "v": "2.4 Det vi bevisst ikke behandler"
      },
      {
        "t": "p",
        "v": "Opplysninger om straffedommer og lovovertredelser. Behandling av slike opplysninger er etter personopplysningsloven § 11 i praksis forbeholdt offentlige myndigheter under offentlig myndighets kontroll. Relavo henter dem ikke, verken maskinelt eller manuelt. Den delen av kvalifikasjonsvurderingen dekkes av leverandørens egen ESPD-erklæring, som leverandøren avgir under ansvar og som vi bare oppbevarer."
      },
      {
        "t": "h3",
        "v": "2.5 Hvem vi deler med"
      },
      {
        "t": "p",
        "v": "Vi selger ikke personopplysninger og bruker dem ikke til markedsføring mot tredjepart. Vi bruker underleverandører for drift, se punkt 3.3. Alle underleverandører er bundet av databehandleravtale."
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
        "v": "Ved avtaleslutt sletter Relavo kundens personopplysninger innen 90 dager, med mindre kunden ber om utlevering først eller lovpålagt oppbevaring krever noe annet. Sikkerhetskopier slettes i tråd med ordinær rotasjon, senest innen 180 dager."
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
