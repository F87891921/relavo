/**
 * Veiledningssidene: én side per spørsmål en innkjøper søker på.
 *
 * Reglene for teksten er de samme som for resten av Relavo:
 *  - Vi sier bare det tjenesten faktisk gjør. Det som er leverandørens egen
 *    bekreftelse heter egenerklæring, ikke «kontrollert».
 *  - Ingen tall, frister eller beløp fra regelverket som ikke allerede står i
 *    appen. Paragrafhenvisningene er de samme som i kontrollrapporten.
 *  - Ingen løfter om utfallet av en anskaffelse. Vurderingen og ansvaret
 *    ligger hos oppdragsgiver.
 *
 * Teksten er skrevet for å kunne leses av en jurist, men er ikke juridisk
 * rådgivning og bør leses gjennom av noen med ansvar før den står lenge.
 */

export type Status =
  | "Kontrollert mot register"
  | "Mottatt fra leverandør"
  | "Egenerklæring"
  | "Ikke kontrollert";

export type Seksjon = {
  h2: string;
  avsnitt: string[];
  liste?: string[];
};

export type Veiledning = {
  slug: string;
  /** H1 og tittel i søkeresultatet. */
  tittel: string;
  /** Meta description, ca. 150 tegn. */
  beskrivelse: string;
  kicker: string;
  ingress: string;
  seksjoner: Seksjon[];
  /** Hva Relavo gjør og hva status er, linje for linje. */
  tabell?: { krav: string; vi: string; status: Status }[];
  faq: { q: string; a: string }[];
  relaterte: string[];
};

/** Dato for siste innholdsendring. Settes for hånd, ikke fra byggedatoen. */
export const OPPDATERT = "2026-11-06";

export const ANSVAR =
  "Dette er en veiledning, ikke juridisk rådgivning. Vurderingen av en leverandør, og ansvaret for den, ligger hos oppdragsgiver. Relavo er beslutningsstøtte.";

export const VEILEDNINGER: Veiledning[] = [
  {
    slug: "leverandorkontroll-offentlige-anskaffelser",
    tittel: "Leverandørkontroll i offentlige anskaffelser",
    beskrivelse:
      "Hva leverandørkontroll er, hva som kan kontrolleres mot offentlige registre, og hva som bare kan dokumenteres som egenerklæring.",
    kicker: "Veiledning",
    ingress:
      "Leverandørkontroll betyr at oppdragsgiver sjekker at leverandøren oppfyller kravene før og under kontrakten, og kan vise at kontrollen er gjort. Her er hva som lar seg kontrollere mot et register, og hva som ikke gjør det.",
    seksjoner: [
      {
        h2: "Kontrollere er ikke det samme som å kunne dokumentere",
        avsnitt: [
          "Kontrollplikten etter anskaffelsesloven § 5i handler om to ting: at kontrollen gjøres, og at den kan dokumenteres i ettertid. En kontroll som ikke kan vises fram er i praksis en kontroll som ikke er gjort.",
          "Derfor lagrer Relavo hver kjøring uendret, med tidspunkt og kilde på hver enkelt linje. Rapporten kan hentes fram igjen når anskaffelsesprotokollen skal fylles ut, eller når noen spør.",
        ],
      },
      {
        h2: "Fire typer svar, og de må ikke blandes",
        avsnitt: [
          "En ærlig leverandørkontroll skiller mellom det som er slått opp i et register, det leverandøren selv har levert, det leverandøren bare har bekreftet, og det som ikke er sjekket i det hele tatt.",
        ],
        liste: [
          "Kontrollert mot register: selskapsdata, konkurs og avvikling i Enhetsregisteret, godkjenning i Arbeidstilsynets renholdsregister, treff på EUs sanksjonsliste og kredittopplysninger fra Proff.",
          "Mottatt fra leverandør: dokumenter selskapet selv får utlevert, for eksempel skatteattest. Relavo registrerer om den er mottatt og lagrer den som vedlegg.",
          "Egenerklæring: leverandørens egen bekreftelse, for eksempel om HMS-kort, lønn via bank og tariffavtale. Det er ikke en kontroll mot et register.",
          "Ikke kontrollert: en kilde vi ikke har svar fra. Den står oppført som ikke kontrollert i rapporten, i stedet for å utelates.",
        ],
      },
      {
        h2: "Hva en kontroll i Relavo omfatter",
        avsnitt: [
          "Du legger inn organisasjonsnummeret. Relavo henter selskapsdata og roller, kontrollerer mot sanksjonslister, henter kredittopplysninger og viser renholdsgodkjenning og sentral godkjenning der det er relevant. Skatteattest og kjede hentes inn fra leverandøren via en egen lenke.",
          "Relavo kontrollerer selskaper, ikke enkeltpersoner. Opplysninger om straffedommer behandles ikke. Den delen av vurderingen dekkes av leverandørens ESPD-egenerklæring, som kan lagres som vedlegg.",
        ],
      },
    ],
    tabell: [
      { krav: "Selskapsdata, konkurs, avvikling", vi: "Oppslag i Enhetsregisteret", status: "Kontrollert mot register" },
      { krav: "Renholdsgodkjenning", vi: "Daglig kopi av Arbeidstilsynets register, statusfeltet leses", status: "Kontrollert mot register" },
      { krav: "Sanksjons- og PEP-treff", vi: "EUs sanksjonsliste og søk hos Proff på selskap og personer i roller", status: "Kontrollert mot register" },
      { krav: "Kredittrating og betalingsanmerkninger", vi: "Oppslag hos Proff", status: "Kontrollert mot register" },
      { krav: "Skatteattest (§ 5i)", vi: "Leverandøren laster den opp. Vi registrerer at den er mottatt.", status: "Mottatt fra leverandør" },
      { krav: "HMS-kort, lønn via bank, tariffavtale", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
      { krav: "Straffedommer", vi: "Behandles ikke. Dekkes av ESPD-egenerklæring.", status: "Ikke kontrollert" },
    ],
    faq: [
      {
        q: "Hva er forskjellen på kontroll og egenerklæring?",
        a: "En kontroll er et oppslag mot et register eller en kilde. En egenerklæring er leverandørens egen bekreftelse. Begge kan dokumenteres, men de sier ulike ting, og Relavo merker dem ulikt i rapporten.",
      },
      {
        q: "Holder rapporten som dokumentasjon?",
        a: "Hver kjøring lagres uendret med tidspunkt, kilde og resultat på hver linje. Om den er nok i en konkret anskaffelse vurderer oppdragsgiver selv.",
      },
      {
        q: "Kan Relavo avgjøre om en leverandør skal avvises?",
        a: "Nei. Risikonivåer og flagg er beslutningsstøtte. Avgjørelsen tas av oppdragsgiver.",
      },
    ],
    relaterte: [
      "seriositetskrav-leverandor",
      "kjedeansvar-underleverandorer",
      "sanksjon-og-pep-sjekk-leverandor",
    ],
  },

  {
    slug: "seriositetskrav-leverandor",
    tittel: "Seriøsitetskrav til leverandører: hva kan kontrolleres?",
    beskrivelse:
      "Oversikt over seriøsitetskravene i §§ 5e–5k, og hva en innkjøper kan kontrollere mot register, hente fra leverandøren eller bare få som egenerklæring.",
    kicker: "Veiledning",
    ingress:
      "Seriøsitetskravene skal hindre sosial dumping og arbeidslivskriminalitet i offentlige kontrakter. Ikke alle kravene kan sjekkes i et register. Her er kravene Relavo følger, og hvordan hvert av dem blir behandlet.",
    seksjoner: [
      {
        h2: "Kravene Relavo følger punkt for punkt",
        avsnitt: [
          "Kontrollrapporten er bygd opp etter paragrafene, med samme henvisning du siterer i anskaffelsesprotokollen. Hvert krav har sin egen linje, og hver linje viser hvor svaret kommer fra.",
        ],
        liste: [
          "§ 5g: leverandøren bekrefter at lønn utbetales via bank.",
          "§ 5h: lærlingekravet vurderes for kontrakten.",
          "§ 5i: skatt og merverdiavgift dokumenteres med skatteattest, og kontrollen lagres som dokumentasjon.",
          "§ 5j: lønns- og arbeidsvilkår følger landsomfattende tariffavtale, der det gjelder.",
          "§ 5k: antall ledd underleverandører kartlegges og dokumenteres. I bygg, anlegg og renhold er taket to ledd.",
        ],
      },
      {
        h2: "Hva som kan slås opp, og hva som ikke kan",
        avsnitt: [
          "Det finnes ikke ett register som svarer ja eller nei på om en leverandør er seriøs. Noen krav kan kontrolleres mot register, for eksempel skatteattest som leverandøren selv får utlevert. Andre krav, som HMS-kort for alle ansatte eller at lønn utbetales via bank, bygger på leverandørens egen bekreftelse.",
          "Relavo skiller derfor tydelig mellom disse i rapporten. En egenerklæring står som egenerklæring, ikke som godkjent. Hvis du trenger sikkerhet utover leverandørens ord, må du be om dokumentasjon eller gjøre stikkprøver.",
        ],
      },
      {
        h2: "Slik gjør du det i praksis",
        avsnitt: [
          "Kjør kontrollen på organisasjonsnummeret. Be leverandøren åpne lenken for å laste opp skatteattest og fylle inn kjeden og bekreftelsene. Rapporten samler alt med tidspunkt, og kan lagres som PDF til anskaffelsesprotokollen.",
        ],
      },
    ],
    tabell: [
      { krav: "§ 5g Lønn via bank", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
      { krav: "§ 5h Lærlinger", vi: "Vurderingen for kontrakten lagres", status: "Egenerklæring" },
      { krav: "§ 5i Skatt og merverdiavgift", vi: "Leverandøren laster opp skatteattest", status: "Mottatt fra leverandør" },
      { krav: "§ 5j Tariffavtale", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
      { krav: "§ 5k Ledd underleverandører", vi: "Kjeden kartlegges og flagges ved overskridelse", status: "Mottatt fra leverandør" },
    ],
    faq: [
      {
        q: "Kan Relavo bekrefte at en leverandør er seriøs?",
        a: "Nei. Relavo kontrollerer det som kan slås opp, henter inn det leverandøren selv skal levere, og merker resten som egenerklæring eller ikke kontrollert. Om leverandøren er seriøs er oppdragsgivers vurdering.",
      },
      {
        q: "Hva er en egenerklæring i praksis?",
        a: "Leverandørens egen bekreftelse på at et krav er oppfylt. Den kan lagres som dokumentasjon, men er ikke en kontroll mot et register.",
      },
    ],
    relaterte: [
      "skatteattest-leverandor",
      "hms-kort-krav-leverandor",
      "tariffavtale-og-lonn-krav",
      "laerlingkrav-offentlig-anskaffelse",
    ],
  },

  {
    slug: "seriositetskontroll-byggeprosjekt",
    tittel: "Seriøsitetskontroll i byggeprosjekt: slik gjør du det",
    beskrivelse:
      "Slik kontrollerer du leverandør og underleverandører i et bygge- og anleggsprosjekt: kjeden, kravene i §§ 5e–5k, egenerklæringer og oppfølging mens prosjektet pågår.",
    kicker: "Veiledning",
    ingress:
      "I bygg og anlegg er det sjelden hovedleverandøren alene som utfører arbeidet. Kontrollen må derfor følge kjeden, og den må kunne vises i etterkant. Her er en praktisk rekkefølge, og hva Relavo gjør i hvert steg.",
    seksjoner: [
      {
        h2: "Hva som er annerledes i byggeprosjekt",
        avsnitt: [
          "I bygg, anlegg og renhold er taket to ledd underleverandører (§ 5k). Registrene viser ikke hvem som er underleverandør, så kjeden må kartlegges. Seriøsitetskravene i §§ 5e–5k gjelder hele kjeden, og ikke alle kan slås opp i et register.",
        ],
      },
      {
        h2: "Slik kan kontrollen gå, steg for steg",
        avsnitt: [],
        liste: [
          "Kjør kontrollen på hovedleverandørens organisasjonsnummer.",
          "Be leverandøren oppgi underleverandørene via en lenke. Hvert ledd slås opp i Enhetsregisteret og kontrolleres, også mot sanksjonslisten.",
          "Se kjeden ledd for ledd. Går den dypere enn taket, flagges det med en gang.",
          "Skill mellom det som er kontrollert mot register, det leverandøren har levert og det som bare er egenerklæring. Relavo merker hver linje.",
          "Last ned rapporten som PDF og legg den ved anskaffelsesprotokollen.",
          "Følg leverandørene mens prosjektet pågår. Endringer, som konkurs eller tapt godkjenning, kommer som avvik. Hvert avvik kan få status, ansvarlig og kommentar, så du kan vise hva som ble gjort.",
        ],
      },
      {
        h2: "Det som ikke kan kontrolleres i et register",
        avsnitt: [
          "HMS-kort for alle ansatte og at lønn utbetales via bank bygger på leverandørens egen bekreftelse. De står som egenerklæring i rapporten, ikke som godkjent. Trenger du mer sikkerhet, må du be om dokumentasjon eller gjøre stikkprøver på byggeplassen.",
        ],
      },
    ],
    tabell: [
      { krav: "Leverandør og underleverandører i Enhetsregisteret", vi: "Hvert ledd slås opp og kontrolleres", status: "Kontrollert mot register" },
      { krav: "§ 5k Ledd underleverandører", vi: "Kjeden kartlegges og flagges ved overskridelse", status: "Mottatt fra leverandør" },
      { krav: "Konkurs og avvikling", vi: "Kontrolleres, og følges videre mens prosjektet pågår", status: "Kontrollert mot register" },
      { krav: "HMS-kort", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
      { krav: "§ 5g Lønn via bank", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
    ],
    faq: [
      {
        q: "Kan Relavo kontrollere hva som skjer på byggeplassen?",
        a: "Nei. Relavo kontrollerer selskapene og kjeden, og følger dem mot registre. Hvem som faktisk er på byggeplassen, og om HMS-kort og lønnsvilkår følges, må du følge opp med egne rutiner og stikkprøver.",
      },
      {
        q: "Hva skjer hvis en underleverandør går konkurs midt i prosjektet?",
        a: "Den daglige overvåkingen fanger det opp og varsler deg. Avviket får en status, og du kan sette en ansvarlig og skrive hva som ble gjort.",
      },
    ],
    relaterte: [
      "kjedeansvar-underleverandorer",
      "seriositetskrav-leverandor",
      "hms-kort-krav-leverandor",
      "skatteattest-leverandor",
    ],
  },

  {
    slug: "kjedeansvar-underleverandorer",
    tittel: "Kjedeansvar og underleverandører: slik kontrollerer du leddene",
    beskrivelse:
      "Taket på to ledd underleverandører i bygg, anlegg og renhold (§ 5k), og hvordan du kartlegger og dokumenterer leverandørkjeden.",
    kicker: "Veiledning",
    ingress:
      "I bygg, anlegg og renhold kan leverandørkjeden bare ha to ledd underleverandører. Det betyr at du må vite hvem som faktisk utfører jobben, også når kontrakten er sub-sub-sub-lagt.",
    seksjoner: [
      {
        h2: "Hva § 5k sier i praksis",
        avsnitt: [
          "Etter § 5k tillates høyst to ledd underleverandører i bygg, anlegg og renhold. Kontrollplikten innebærer at antall ledd er kartlagt og dokumentert.",
          "Det er hovedleverandøren som kjenner kjeden. Oppdragsgiver må derfor be om den, og lagre svaret.",
        ],
      },
      {
        h2: "Slik kartlegger Relavo kjeden",
        avsnitt: [
          "Du sender hovedleverandøren en lenke. Der legger leverandøren inn underleverandørene og hvilket ledd hver av dem står i. Underleverandørene kan i sin tur få egne lenker for å fylle inn sine ledd.",
          "Relavo teller leddene og flagger med en gang hvis taket er overskredet. Du ser også de to vanlige løsningene: å la en underleverandør gå ut av kjeden, eller å la hovedleverandøren overta jobben selv.",
        ],
      },
      {
        h2: "Hva som kontrolleres, og hva som ikke gjør det",
        avsnitt: [
          "Kjeden er leverandørens opplysning. Relavo kan kontrollere hver enkelt virksomhet i kjeden mot registre, men kan ikke vite om kjeden er komplett. Det som ikke er oppgitt, er ikke kontrollert.",
        ],
        liste: [
          "Hver virksomhet i kjeden kan kjøres gjennom de samme registrene som hovedleverandøren.",
          "Antall ledd beregnes ut fra det leverandøren har lagt inn.",
          "Kjeden lagres sammen med kontrollen, med tidspunkt.",
        ],
      },
    ],
    tabell: [
      { krav: "Antall ledd", vi: "Beregnes ut fra kjeden leverandøren har lagt inn", status: "Mottatt fra leverandør" },
      { krav: "Hver virksomhet i kjeden", vi: "Kan kontrolleres mot de samme registrene", status: "Kontrollert mot register" },
      { krav: "At kjeden er komplett", vi: "Kan ikke kontrolleres utenfra", status: "Ikke kontrollert" },
    ],
    faq: [
      {
        q: "Hvor mange ledd tillates?",
        a: "Høyst to ledd underleverandører i bygg, anlegg og renhold etter § 5k.",
      },
      {
        q: "Kan Relavo finne underleverandører selv?",
        a: "Nei. Kjeden bygger på det leverandøren oppgir. Relavo kontrollerer hver virksomhet som er oppgitt, og viser at kjeden er det leverandøren har sagt.",
      },
    ],
    relaterte: ["leverandorkontroll-offentlige-anskaffelser", "seriositetskrav-leverandor"],
  },

  {
    slug: "skatteattest-leverandor",
    tittel: "Skatteattest fra leverandør: hva må du be om, og hva kan du kontrollere?",
    beskrivelse:
      "Skatteattest og kontrollplikten i § 5i: hvordan du ber leverandøren om den, hva Relavo registrerer, og hva som er leverandørens dokumentasjon.",
    kicker: "Veiledning",
    ingress:
      "Skatteattesten dokumenterer at leverandøren har orden på skatt og merverdiavgift. Den utleveres til selskapet selv, ikke til oppdragsgiver, så leverandøren må levere den.",
    seksjoner: [
      {
        h2: "Hvorfor skatteattesten kommer fra leverandøren",
        avsnitt: [
          "Skatteattest utleveres av Skatteetaten til selskapet selv. Det finnes ikke et åpent oppslag oppdragsgiver kan bruke, så leverandøren må laste den opp.",
          "Relavo gir leverandøren en lenke der attesten lastes opp. Kontrollen viser deretter om skatteattesten er mottatt eller ikke.",
        ],
      },
      {
        h2: "Hva Relavo gjør, og hva vi ikke gjør",
        avsnitt: [
          "Relavo registrerer at attesten er mottatt, og lagrer den som vedlegg til kontrollen. Hvis den ikke er mottatt, står det i rapporten som at skatteattest er bedt om, men ikke mottatt.",
          "Relavo leser ikke innholdet i attesten maskinelt og bekrefter ikke at den er riktig. Oppdragsgiver ser over attesten selv, og vurderer den mot kontrakten.",
        ],
      },
      {
        h2: "Slik gjør du det",
        avsnitt: [
          "Kjør kontrollen, send leverandøren lenken og følg med på om attesten kommer. Rapporten lagres med tidspunkt, slik at du kan vise hva du hadde da du tok beslutningen.",
        ],
      },
    ],
    tabell: [
      { krav: "Skatteattest", vi: "Leverandøren laster opp, vi registrerer at den er mottatt", status: "Mottatt fra leverandør" },
      { krav: "At innholdet i attesten er riktig", vi: "Leses ikke maskinelt. Oppdragsgiver ser over.", status: "Ikke kontrollert" },
    ],
    faq: [
      {
        q: "Kan Relavo hente skatteattesten selv?",
        a: "Nei. Den utleveres til selskapet selv. Leverandøren må laste den opp.",
      },
      {
        q: "Hva skjer hvis leverandøren ikke leverer?",
        a: "Rapporten viser at skatteattest er bedt om, men ikke mottatt. Hva du gjør med det er din vurdering.",
      },
    ],
    relaterte: ["seriositetskrav-leverandor", "leverandorkontroll-offentlige-anskaffelser"],
  },

  {
    slug: "hms-kort-krav-leverandor",
    tittel: "HMS-kort: hva kan du kreve, og kan det kontrolleres?",
    beskrivelse:
      "HMS-kort som krav til leverandører i bygg og anlegg, og hvorfor det i praksis dokumenteres som egenerklæring. Slik står det i Relavos rapport.",
    kicker: "Veiledning",
    ingress:
      "HMS-kort viser at en arbeidstaker er registrert og kan identifiseres på arbeidsplassen. Kortene er personlige. Det finnes ingen åpen tjeneste der en innkjøper kan sjekke om alle på en kontrakt har gyldig kort.",
    seksjoner: [
      {
        h2: "Hva Relavo gjør med HMS-kort",
        avsnitt: [
          "Rapporten har en egen linje der leverandøren bekrefter at alle arbeidstakere på kontrakten har gyldig HMS-kort. Bekreftelsen lagres med tidspunkt.",
          "Dette er en egenerklæring. Relavo kontrollerer ikke kortene mot noe register, og viser den ikke som godkjent.",
        ],
      },
      {
        h2: "Hvorfor det ikke kan sjekkes som et oppslag",
        avsnitt: [
          "Kortene hører til enkeltpersoner, og informasjon om hvem som har kort er personopplysninger. Relavo kontrollerer virksomheter, ikke enkeltpersoner.",
          "I praksis kontrolleres HMS-kort på byggeplassen, for eksempel ved adgangskontroll, og ved stikkprøver. Egenerklæringen i Relavo er dokumentasjon på at kravet er stilt og bekreftet, ikke bevis for at alle har kort.",
        ],
      },
      {
        h2: "Slik gjør du det",
        avsnitt: [
          "Be leverandøren fylle inn bekreftelsen via lenken. Planlegg i tillegg stikkprøver på byggeplassen, hvis kontrakten gir grunnlag for det.",
        ],
      },
    ],
    tabell: [
      { krav: "Gyldig HMS-kort for alle på kontrakten", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
    ],
    faq: [
      {
        q: "Kan Relavo sjekke om HMS-kortene er gyldige?",
        a: "Nei. Det er en egenerklæring fra leverandøren. Kortene er personlige, og Relavo kontrollerer virksomheter.",
      },
      {
        q: "Hvordan kontrolleres HMS-kort da?",
        a: "På byggeplassen og med stikkprøver. Relavo dokumenterer at kravet er stilt og bekreftet.",
      },
    ],
    relaterte: ["seriositetskrav-leverandor", "tariffavtale-og-lonn-krav"],
  },

  {
    slug: "tariffavtale-og-lonn-krav",
    tittel: "Tariffavtale og lønn via bank: slik dokumenterer du kravene",
    beskrivelse:
      "§ 5g og § 5j i praksis: lønn via bank og landsomfattende tariffavtale. Hva Relavo lagrer som egenerklæring, og hvorfor det ikke finnes et register å slå opp i.",
    kicker: "Veiledning",
    ingress:
      "Kravene om lønn via bank og om lønns- og arbeidsvilkår etter landsomfattende tariffavtale er seriøsitetskrav som oppdragsgiver må følge opp. Det finnes ikke et offentlig register som viser om en virksomhet følger en tariffavtale.",
    seksjoner: [
      {
        h2: "Lønn via bank (§ 5g)",
        avsnitt: [
          "Kravet er at lønn utbetales via bank. Relavo ber leverandøren bekrefte det i skjemaet. Bekreftelsen lagres med tidspunkt og står som egenerklæring i rapporten.",
        ],
      },
      {
        h2: "Tariffavtale og arbeidsvilkår (§ 5j)",
        avsnitt: [
          "Kravet er at lønns- og arbeidsvilkår følger landsomfattende tariffavtale der det gjelder. Det finnes ikke et åpent register som sier om en enkelt virksomhet følger en tariffavtale.",
          "Relavo lagrer derfor leverandørens bekreftelse og merker den som egenerklæring. Skal du ha mer enn leverandørens ord, må du be om dokumentasjon, for eksempel lønnsslipper eller bekreftelse fra organisasjonen, og vurdere den selv.",
        ],
      },
      {
        h2: "Hvordan du får mer enn en egenerklæring",
        avsnitt: [
          "Egenerklæringen er første ledd. Det neste leddet er å stille krav i kontrakten om at leverandøren på forespørsel skal dokumentere vilkårene, og å bruke retten til å be om det når noe ser rart ut. Relavo lagrer det som kommer inn.",
        ],
      },
    ],
    tabell: [
      { krav: "§ 5g Lønn via bank", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
      { krav: "§ 5j Landsomfattende tariffavtale", vi: "Leverandørens bekreftelse lagres", status: "Egenerklæring" },
    ],
    faq: [
      {
        q: "Finnes det et register over tariffavtaler?",
        a: "Ikke et åpent register der du kan slå opp en enkelt virksomhet. Derfor er dette en egenerklæring i Relavo.",
      },
      {
        q: "Hva gjør jeg hvis jeg tviler på egenerklæringen?",
        a: "Be om dokumentasjon fra leverandøren. Relavo lagrer det som kommer inn, med tidspunkt.",
      },
    ],
    relaterte: ["seriositetskrav-leverandor", "hms-kort-krav-leverandor"],
  },

  {
    slug: "laerlingkrav-offentlig-anskaffelse",
    tittel: "Lærlingekrav i offentlige anskaffelser (§ 5h)",
    beskrivelse:
      "Lærlingekravet i § 5h: hva oppdragsgiver må vurdere, og hvordan vurderingen dokumenteres i Relavo. Sentral godkjenning er frivillig og sier ikke alt.",
    kicker: "Veiledning",
    ingress:
      "Lærlingekravet gjelder bestemte kontrakter. Oppdragsgiver må vurdere om det gjelder for den aktuelle kontrakten, og kunne vise at vurderingen er gjort.",
    seksjoner: [
      {
        h2: "Hva Relavo lagrer",
        avsnitt: [
          "Rapporten har en linje som sier at lærlingekravet er vurdert for kontrakten. Vurderingen lagres med tidspunkt, slik at den kan vises fram i anskaffelsesprotokollen.",
        ],
      },
      {
        h2: "Sentral godkjenning og lærebedrift",
        avsnitt: [
          "Relavo slår opp i DiBKs sentrale godkjenning, som blant annet viser godkjenningsområder og om virksomheten er lærebedrift. Ordningen er frivillig siden 2016, så det er ikke et avvik å ikke stå der.",
          "At en virksomhet er godkjent lærebedrift viser at den kan ta lærlinger. Det viser ikke at kravet i din kontrakt er oppfylt.",
        ],
      },
      {
        h2: "Slik gjør du det",
        avsnitt: [
          "Vurder om kravet gjelder for kontrakten, og dokumenter vurderingen. Be leverandøren redegjøre for hvordan lærlinger skal inngå, og lagre svaret sammen med kontrollen.",
        ],
      },
    ],
    tabell: [
      { krav: "Lærlingekravet vurdert for kontrakten", vi: "Vurderingen lagres med tidspunkt", status: "Egenerklæring" },
      { krav: "Sentral godkjenning og lærebedrift", vi: "Oppslag hos DiBK", status: "Kontrollert mot register" },
    ],
    faq: [
      {
        q: "Betyr lærebedrift at kravet er oppfylt?",
        a: "Nei. Det viser at virksomheten kan ta lærlinger, ikke at kravet i kontrakten er oppfylt.",
      },
      {
        q: "Er sentral godkjenning obligatorisk?",
        a: "Ordningen er frivillig siden 2016. Å ikke stå der er ikke et avvik.",
      },
    ],
    relaterte: ["seriositetskrav-leverandor", "leverandorkontroll-offentlige-anskaffelser"],
  },

  {
    slug: "sanksjon-og-pep-sjekk-leverandor",
    tittel: "Sanksjons- og PEP-sjekk av leverandører",
    beskrivelse:
      "Hvordan du sjekker en leverandør og personene i styre og ledelse mot sanksjonslister og lister over politisk eksponerte personer, og hva et treff betyr.",
    kicker: "Veiledning",
    ingress:
      "En sanksjons- og PEP-sjekk søker på navn. Et treff betyr ikke at leverandøren er sanksjonert, bare at et navn ligner. Treffet må vurderes av et menneske.",
    seksjoner: [
      {
        h2: "Hva Relavo søker på",
        avsnitt: [
          "Relavo kjører søk mot EUs konsoliderte sanksjonsliste, som hentes hver natt, og søker i tillegg hos Proff på selskapet og på personene i styre, ledelse og med signaturrett eller prokura. Bare treff lagres.",
        ],
      },
      {
        h2: "Hva et treff betyr",
        avsnitt: [
          "Søkene er på navn og fødselsdato. Treff kan gjelde en annen person eller et annet selskap med samme navn. Rapporten viser derfor et mulig treff, og oppdragsgiver vurderer om det gjelder leverandøren.",
          "Et søk uten treff er et søk uten treff i de listene som er søkt. Det er ikke en garanti for at personen eller selskapet ikke står på noen liste i verden.",
        ],
      },
      {
        h2: "Personer og personvern",
        avsnitt: [
          "For å søke på personer sendes navn og fødselsdato til Proff. Relavo behandler ikke opplysninger om straffedommer. Den delen av kvalifikasjonsvurderingen dekkes av leverandørens ESPD-egenerklæring.",
        ],
      },
    ],
    tabell: [
      { krav: "Treff på EUs sanksjonsliste", vi: "Nattlig kopi av listen, søk på selskap og roller", status: "Kontrollert mot register" },
      { krav: "Sanksjons- og PEP-søk på personer i roller", vi: "Søk hos Proff, bare treff lagres", status: "Kontrollert mot register" },
      { krav: "Straffedommer", vi: "Behandles ikke", status: "Ikke kontrollert" },
    ],
    faq: [
      {
        q: "Betyr et treff at leverandøren er sanksjonert?",
        a: "Nei. Et treff er et mulig treff på navn. Oppdragsgiver må vurdere om det gjelder leverandøren.",
      },
      {
        q: "Sjekker dere om noen er straffedømt?",
        a: "Nei. Behandling av opplysninger om straffedommer er i praksis forbeholdt offentlige myndigheter. Relavo kontrollerer selskaper, ikke enkeltpersoner.",
      },
    ],
    relaterte: ["leverandorkontroll-offentlige-anskaffelser", "konkursrisiko-og-kreditt-leverandor"],
  },

  {
    slug: "konkursrisiko-og-kreditt-leverandor",
    tittel: "Konkursrisiko og kreditt: slik sjekker du en leverandørs økonomi",
    beskrivelse:
      "Konkurs, avvikling, kredittrating og betalingsanmerkninger: hva du kan slå opp om en leverandør før du inngår kontrakt, og hva tallene betyr.",
    kicker: "Veiledning",
    ingress:
      "Før du binder deg til en leverandør, bør du vite om den er under konkurs eller avvikling, og hvordan økonomien ser ut. Det kan slås opp.",
    seksjoner: [
      {
        h2: "Konkurs og avvikling",
        avsnitt: [
          "Relavo slår opp i Enhetsregisteret og viser konkurs, tvangsavvikling og avvikling. Samme oppslag gir selskapsdata og roller.",
          "I den daglige kjøringen fanges konkurs, tvangsavvikling og bytte av daglig leder opp også etter at kontrollen er gjort.",
        ],
      },
      {
        h2: "Kredittrating, anmerkninger og pant",
        avsnitt: [
          "Kredittrating, betalingsanmerkninger og pant hentes fra Proff, og kilden står i rapporten. Det er kommersielle vurderinger og kan inneholde feil. De sier noe om risiko, ikke om leverandøren er lovlig eller seriøs.",
        ],
      },
      {
        h2: "Hva du bruker det til",
        avsnitt: [
          "Opplysningene er beslutningsstøtte. En dårlig kredittrating er ikke i seg selv en avvisningsgrunn. Oppdragsgiver må vurdere det opp mot kontrakten og kvalifikasjonskravene som er satt.",
        ],
      },
    ],
    tabell: [
      { krav: "Konkurs, tvangsavvikling, avvikling", vi: "Oppslag i Enhetsregisteret", status: "Kontrollert mot register" },
      { krav: "Kredittrating, anmerkninger og pant", vi: "Oppslag hos Proff", status: "Kontrollert mot register" },
    ],
    faq: [
      {
        q: "Hvor ofte oppdateres opplysningene?",
        a: "Hver kjøring slår opp på nytt og lagres uendret. Konkurs, tvangsavvikling og bytte av daglig leder fanges også opp i den daglige kjøringen.",
      },
      {
        q: "Er en dårlig rating en avvisningsgrunn?",
        a: "Ikke i seg selv. Det er en kommersiell vurdering som oppdragsgiver må ta stilling til.",
      },
    ],
    relaterte: ["sanksjon-og-pep-sjekk-leverandor", "leverandorkontroll-offentlige-anskaffelser"],
  },

  {
    slug: "renholdsgodkjenning-leverandor",
    tittel: "Renholdsgodkjenning: sjekk at leverandøren er godkjent",
    beskrivelse:
      "Å kjøpe renholdstjenester av en virksomhet uten godkjenning har vært ulovlig siden 2012. Slik leser du statusfeltet i Arbeidstilsynets register.",
    kicker: "Veiledning",
    ingress:
      "Et treff i Arbeidstilsynets renholdsregister betyr ikke at virksomheten er godkjent. Registeret inneholder både godkjente og ikke godkjente virksomheter. Det avgjørende er statusfeltet.",
    seksjoner: [
      {
        h2: "Registeret og statusfeltet",
        avsnitt: [
          "Arbeidstilsynet fører et register over virksomheter som tilbyr renholdstjenester. Å kjøpe renholdstjenester av en virksomhet uten godkjenning har vært ulovlig siden 2012.",
          "Relavo leser statusfeltet, og viser om virksomheten er godkjent. At en virksomhet står i registeret er ikke nok.",
        ],
      },
      {
        h2: "Hvordan Relavo henter registeret",
        avsnitt: [
          "Registeret publiseres som en samlefil som oppdateres hver natt. Relavo henter en daglig kopi, så oppslaget er likt kilden. Tapt godkjenning fanges opp i den daglige kjøringen.",
        ],
      },
      {
        h2: "Hvorfor dette er viktig for innkjøpere",
        avsnitt: [
          "Renhold er blant de bransjene der to ledd underleverandører er taket, og der seriøsitetskravene gjelder fullt ut. Statusfeltet kan sjekkes på sekunder og dokumenteres.",
        ],
      },
    ],
    tabell: [
      { krav: "Godkjenning for renhold", vi: "Daglig kopi av Arbeidstilsynets register, statusfeltet leses", status: "Kontrollert mot register" },
    ],
    faq: [
      {
        q: "Betyr treff i registeret at virksomheten er godkjent?",
        a: "Nei. Registeret inneholder både godkjente og ikke godkjente virksomheter. Vi leser statusfeltet.",
      },
      {
        q: "Hva om en leverandør mister godkjenningen senere?",
        a: "Det fanges opp i den daglige kjøringen, ikke først ved neste kontroll.",
      },
    ],
    relaterte: ["kjedeansvar-underleverandorer", "leverandorkontroll-offentlige-anskaffelser"],
  },

  {
    slug: "unormalt-lave-tilbud",
    tittel: "Unormalt lave tilbud: slik vurderer og dokumenterer du (§ 24-9)",
    beskrivelse:
      "Hva du må gjøre når et tilbud er unormalt lavt: regn avviket mot de øvrige tilbudene, be om skriftlig redegjørelse og dokumenter vurderingen.",
    kicker: "Veiledning",
    ingress:
      "Er et tilbud unormalt lavt, plikter du å be tilbyderen redegjøre skriftlig før tilbudet eventuelt avvises. Først må du kunne vise at tilbudet er unormalt lavt.",
    seksjoner: [
      {
        h2: "Slik regner Relavo avviket",
        avsnitt: [
          "Avviket regnes mot medianen av de øvrige tilbudene. Du legger inn tilbudene, og Relavo viser hvor langt hvert tilbud ligger fra medianen.",
        ],
      },
      {
        h2: "Redegjørelsen",
        avsnitt: [
          "Etter anskaffelsesforskriften § 24-9 plikter du å be tilbyderen redegjøre skriftlig før tilbudet eventuelt avvises. Relavo lager et utkast til brevet, som du leser gjennom og sender selv.",
        ],
      },
      {
        h2: "Hva Relavo ikke avgjør",
        avsnitt: [
          "Hvor grensen for unormalt lavt går i din anskaffelse, og om tilbudet skal avvises, er din vurdering. Relavo regner avviket og dokumenterer forløpet.",
        ],
      },
    ],
    faq: [
      {
        q: "Hvor mye lavere enn de andre er unormalt lavt?",
        a: "Det avgjør oppdragsgiver ut fra anskaffelsen. Relavo viser avviket mot medianen av de øvrige tilbudene og lar deg dokumentere vurderingen.",
      },
      {
        q: "Må jeg be om redegjørelse?",
        a: "Ja, etter § 24-9 plikter du å be tilbyderen redegjøre skriftlig før tilbudet eventuelt avvises.",
      },
    ],
    relaterte: ["leverandorkontroll-offentlige-anskaffelser", "seriositetskrav-leverandor"],
  },
];

export function finnVeiledning(slug: string): Veiledning | undefined {
  return VEILEDNINGER.find((v) => v.slug === slug);
}
