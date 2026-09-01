/**
 * Norsk er kilden. De andre ordbøkene skal ha nøyaktig de samme nøklene —
 * TypeScript ser etter det, siden Ordbok er `typeof no`.
 *
 * Det som IKKE ligger her, og aldri skal gjøre det:
 *
 *   Paragrafhenvisninger og navnene på norske registre og forskrifter.
 *   «anskaffelsesforskriften § 24-9» er navnet på en norsk forskrift, ikke
 *   en frase. Oversettes den, kan ikke leseren slå den opp — og det er hele
 *   poenget med å sitere den.
 *
 *   Brevene og dokumentene. Tilbud, § 24-9-krav og ESPD-forespørsler går
 *   til norske leverandører fra norske oppdragsgivere og skal journalføres
 *   i norske arkiver. De er alltid på norsk, uansett hva grensesnittet står
 *   på. Det samme gjelder vilkårene: en oversatt avtaletekst er en ny
 *   avtaletekst.
 */
export const no = {
  sprak: { velg: "Språk", norsk: "Norsk", svensk: "Svensk", engelsk: "Engelsk" },

  meny: {
    oversikt: "Oversikt",
    nyKontroll: "Ny kontroll",
    bulk: "Bulkkontroll",
    kjede: "Leverandørkjede",
    tilbud: "Unormalt lave tilbud",
    anskaffelser: "Anskaffelser",
    leverandorer: "Leverandører",
    jav: "Interessekonflikt",
    espd: "ESPD",
    support: "Brukerstøtte",
    konto: "Konto",
  },

  ansattmeny: {
    konton: "Kontoer",
    attgora: "Å gjøre",
    support: "Brukerstøtte",
    kontakt: "Kontakt",
    leads: "Leads",
    offerter: "Tilbud",
    fakturering: "Fakturering",
    onboarding: "Oppstart",
    kreditt: "Kredittkontroll",
    kallor: "Kildehelse",
    marginal: "Margin",
    logg: "Tilgangslogg",
    team: "Team og tilgang",
  },

  skall: {
    kontoenDin: "Kontoen din",
    loggUt: "Logg ut",
    loggerUt: "Logger ut …",
    relavoInternt: "Relavo internt →",
    tilbakeTilKunde: "← Tilbake til kundevisningen",
    internt: "Internt",
    apneMenyen: "Åpne menyen",
    lukkMenyen: "Lukk menyen",
    personal: "Ansatt",
    superadmin: "Superadmin",
  },

  felles: {
    lagre: "Lagre",
    lagrer: "Lagrer …",
    avbryt: "Avbryt",
    tilbake: "Tilbake",
    neste: "Neste",
    hoppOver: "Hopp over",
    sok: "Søk",
    vis: "Vis",
    skjul: "Skjul",
    apne: "Åpne",
    sender: "Sender …",
    henter: "Henter …",
    valgfritt: "valgfritt",
    ingenting: "Ingenting her ennå.",
    status: "Status",
    endreStatus: "Klikk for å endre status",
  },

  sider: {
    oversikt: {
      tittel: "Oversikt",
      tekst: "Status på kontrollplikten, og det som krever noe av deg i dag.",
    },
    nyKontroll: {
      tittel: "Ny kontroll",
      tekst:
        "Seks steg, hvorav tre er valgfrie. Resultatet lagres uendret som dokumentasjon på oppfylt kontrollplikt etter anskaffelsesloven § 5i.",
    },
    bulk: {
      tittel: "Bulkkontroll",
      tekst:
        "Lim inn organisasjonsnumrene til hele porteføljen og kjør kontroll på alle i én omgang.",
    },
    kjede: {
      tittel: "Leverandørkjede",
      tekst:
        "§ 5k tillater høyst to ledd underleverandører i bygg, anlegg og renhold. Overskridelser flagges — og de to lovlige utveiene er å kutte leddet eller søke dispensasjon hos oppdragsgiver.",
    },
    tilbud: {
      tittel: "Unormalt lave tilbud",
      tekst:
        "Avviket regnes mot medianen av de øvrige tilbudene. Er et tilbud unormalt lavt, plikter dere etter § 24-9 å be tilbyderen redegjøre skriftlig før tilbudet eventuelt avvises.",
    },
    anskaffelser: {
      tittel: "Anskaffelser",
      tekst:
        "Avtalene kontrollene henger på. Saksnummeret her er det samme du fører i anskaffelsesprotokollen.",
    },
    leverandorer: {
      tittel: "Leverandører",
      tekst: "Alle leverandører dere har kontrollert, med siste kjente status.",
    },
    jav: {
      tittel: "Interessekonflikt",
      tekst:
        "Styremedlemmer hos leverandøren krysses mot dem som deltar i anskaffelsen. Treff er et varsel om mulig inhabilitet etter forvaltningsloven § 6, ikke en konklusjon.",
    },
    espd: {
      tittel: "ESPD og egenerklæringer",
      tekst:
        "Egenerklæringene dekker den delen av kvalifikasjonsvurderingen registrene ikke kan svare på. Mangler en, kan den kreves ettersendt etter § 23-5 — og fristen følges opp her.",
    },
    support: {
      tittel: "Brukerstøtte",
      tekst:
        "Meld inn en sak og følg svaret her. Velger du varsling, får du e-post når saken får svar eller endrer status.",
    },
    konto: {
      tittel: "Kontoinnstillinger",
      tekst:
        "Dine egne opplysninger, organisasjonen du hører til, og hvem som har tilgang.",
    },
  },

  ansattsider: {
    konton: {
      tittel: "Kontoer",
      tekst: "Alle kundekontoer, hvilken plan de ligger på og hvor mye av kvoten de har brukt.",
    },
    attgora: {
      tittel: "Å gjøre",
      tekst:
        "Det som krever et menneske i dag, hentet fra fakturaer, tilbud, leads og kildehelse. Rødt haster.",
    },
    support: {
      tittel: "Brukerstøtte",
      tekst:
        "Saker fra alle kontoer. Svarer du her, går svaret rett til kunden, og saken flyttes til Venter på kunden.",
    },
    kontakt: {
      tittel: "Kontakt",
      tekst:
        "Meldinger fra kontaktskjemaet på landingssiden. Merk som behandlet når noen har svart.",
    },
    leads: {
      tittel: "Leads",
      tekst:
        "Interesserte som ennå ikke er kunder. Kolonnen neste steg er den som avgjør om noe faller mellom stolene.",
    },
    offerter: {
      tittel: "Tilbud",
      tekst:
        "Sendte tilbud, hva de er verdt og når de går ut. Søk på kundens navn, så fylles organisasjonsnummer og kontaktopplysninger inn automatisk.",
    },
    fakturering: {
      tittel: "Fakturering",
      tekst:
        "Fakturaer per konto, med forfallsdato og status. Fakturanummeret settes automatisk som løpenummer per år.",
    },
    onboarding: {
      tittel: "Oppstart",
      tekst:
        "Hvor i oppstarten hver kunde står. En konto regnes som i gang først når den har kjørt sin første kontroll, ikke når avtalen er signert.",
    },
    kreditt: {
      tittel: "Kredittkontroll",
      tekst:
        "Kontroll av kunder og kommende kunder før vi fakturerer. Hver kjøring lagres uendret med tidspunkt, så den kan hentes fram i ettertid.",
    },
    kallor: {
      tittel: "Kildehelse",
      tekst:
        "Svartider, feilfrekvens og kostnad per register. Ligger en kilde nede, skal kundens rapport si det, ikke tie om det.",
    },
    marginal: {
      tittel: "Margin",
      tekst:
        "Hva hver konto gir mot hva registeroppslagene koster oss. Kontoer som går med tap står rødt.",
    },
    logg: {
      tittel: "Tilgangslogg",
      tekst:
        "Hvem hos oss har åpnet hvilken kundes data, og hvorfor. Loggen skal kunne vises fram for kunden uten at vi først må rydde i den.",
    },
    team: {
      tittel: "Team og tilgang",
      tekst:
        "Hvem som jobber hos oss og hva hver enkelt får se. Tilgang til å lese kundedata er skilt fra tilgang til å endre innstillinger — den ene følger ikke av den andre.",
    },
  },

  landing: {
    nav: { plattform: "Plattform", regelverk: "Regelverk", priser: "Priser", sporsmal: "Spørsmål", loggInn: "Logg inn", komIGang: "Kom i gang" },
    hero: {
      nytt: "Nytt",
      pille: "gjelder fra 1. juli 2026 →",
      tittel: "Kontrollen du må gjøre. Beviset du må ha.",
      lead: "Relavo henter selskapsdata, skatterestanser og betalingsanmerkninger, kartlegger hvor dyp leverandørkjeden faktisk er, og lagrer resultatet som dokumentasjon på kontrollplikten i § 5i.",
      sePriser: "Se priser",
      note: "Fra 590 NOK per kontroll. Ingen bindingstid.",
    },
    kilder: { byggerPa: "Bygger på" },
    regelverk: {
      eyebrow: "Regelverk",
      tittel: "Én lovendring, fire tall som betyr noe.",
      undertittel: "Fra 1. juli 2026 er kontrollplikten uttrykkelig.",
      tall: [
        "ledd underleverandører er taket i bygg, anlegg og renhold etter § 5k",
        "medianen på et oppslag mot Enhetsregisteret",
        "registre samlet i én rapport, med kilde og dato på hver linje",
        "krever at kontrollen kan dokumenteres i ettertid, ikke bare utføres",
      ],
    },
    plattform: {
      eyebrow: "Flere funksjoner",
      raskt: "Svaret kommer før du rekker å åpne neste fane.",
      kjede: "Leverandørkjeden, hele veien ned",
      krav: "Hvert krav som en kryssbar linje",
      laveTilbud: "Unormalt lave tilbud",
      overvaking: "Løpende overvåking",
      tittel: "Én kontroll, alle registre.",
      kjedeD: "§ 5k tillater høyst to ledd underleverandører i bygg, anlegg og renhold. Legg inn kjeden du har, så flagges overskridelsen med en gang — og du får de to vanlige utveiene.",
      kravD: "Rapporten følger loven punkt for punkt, med samme paragrafhenvisning du siterer i anskaffelsesprotokollen.",
      laveTilbudD: "Avviket beregnes mot de øvrige tilbudene, og du får et utkast til redegjørelseskravet § 24-9 pålegger deg å sende.",
      overvakingD: "Konkurs, tvangsavvikling og nye anmerkninger fanges opp samme dag de registreres, ikke ved neste kontroll.",
      rapportD: "Hver kjøring lagres uendret med kilde og dato på hver linje. Det som ikke er kontrollert står oppført som ikke kontrollert.",
      rapport: "Rapport som holder",
    },
    priser: {
      eyebrow: "Priser",
      tittel: "Én pris, hele rapporten.",
      undertittel: "Ingen tillegg per oppslag og ingen overraskelser på fakturaen.",
      vanligst: "Vanligst",
      planer: [
        { navn: "Leverandørkontroll", enhet: "NOK", beskrivelse: "Én kontroll, full rapport som PDF. Uten abonnement.", knapp: "Kjør én kontroll", punkter: ["Selskapsdata og roller", "Skatt, avgift og anmerkninger", "Kjedekontroll mot § 5k", "Rapport som PDF"] },
        { navn: "Standard", enhet: "NOK/mnd", beskrivelse: "Løpende overvåking av leverandørene i porteføljen.", knapp: "Start Standard", punkter: ["Alt i enkeltkontroll", "Alle kilder i hver kontroll", "Daglig overvåking", "Bulkkontroll og anskaffelser", "Vurdering av lave tilbud"] },
        { navn: "Enterprise", enhet: "NOK/mnd", beskrivelse: "Flere enheter under samme avtale, med API.", knapp: "Start Enterprise", punkter: ["Alt i Standard", "Flere enheter og arbeidsområder", "API-tilgang", "Egen kontaktperson", "Databehandleravtale"] },
      ],
    },
    faq: {
      eyebrow: "Spørsmål",
      tittel: "Det folk spør om først.",
      sporsmal: [
        { q: "Sjekker dere om noen er straffedømt?", a: "Nei, og ingen kommersiell aktør kan. Behandling av opplysninger om straffedommer er etter personopplysningsloven § 11 i praksis forbeholdt offentlige myndigheter, og Lovdata gir ikke maskinell tilgang til rettsavgjørelser. Vi kontrollerer selskaper, ikke enkeltpersoner. Den delen av kvalifikasjonsvurderingen dekkes av leverandørens ESPD-egenerklæring, som lagres som vedlegg til kontrollen." },
        { q: "Kommer det tillegg utover abonnementet?", a: "Nei. Prisen dekker den ferdige rapporten, uansett hvor mange registre den bygger på. Du kjøper vurderingen og dokumentasjonen, ikke enkeltoppslag, og fakturaen ser lik ut hver måned." },
        { q: "Holder rapporten som dokumentasjon etter § 5i?", a: "Hver kjøring lagres uendret med tidspunkt, kilde og resultat på hver enkelt linje, og kan hentes fram i ettertid. Kilder vi ikke har svar fra står oppført som ikke kontrollert i stedet for å utelates — en rapport som tier om hullene sine er verre enn ingen rapport." },
        { q: "Vi holder til i Sverige. Fungerer det?", a: "Relavo er bygget for norske organisasjonsnumre og norsk regelverk. Kjernen i vurderingen følger det samme EU-direktivet i hele EØS, men datakildene og paragrafene er norske." },
      ],
    },
    close: {
      tittel: "Hvor dyp er kjeden i din største kontrakt?",
      tekst: "Kjør én kontroll og se svaret. Du trenger ikke abonnement for å prøve.",
      snakkMedOss: "Snakk med oss",
    },
    foot: {
      tekst: "Relavo kontrollerer selskaper, ikke enkeltpersoner. Opplysninger om straffedommer behandles ikke.",
      vilkar: "Vilkår",
      personvern: "Personvern",
      cookies: "Cookies",
      kontakt: "Kontakt",
    },
  },
  ui: {
    selskap: "Selskap", leverandor: "Leverandør", bransje: "Bransje",
    risiko: "Risiko", sistKontrollert: "Sist kontrollert", aldri: "Aldri",
    saksnummer: "Saksnummer", anskaffelse: "Anskaffelse",
    konkurranseform: "Konkurranseform", avtaleverdi: "Avtaleverdi",
    periode: "Periode", kontroller: "Kontroller",
    navn: "Navn", rolle: "Rolle", lagtTil: "Lagt til",
    opplysning: "Opplysning", verdi: "Verdi",
    hva: "Hva", nar: "Når", tidspunkt: "Tidspunkt", utlostAv: "Utløst av",
    resultat: "Resultat", demodata: "fra prototypens demodata",
  },
  risiko: { lav: "Lav", middels: "Middels", hoy: "Høy" },
  oversikt: {
    iPortefoljen: "leverandører i porteføljen",
    kontrollerKjort: "kontroller kjørt",
    medHoyRisiko: "med høy risiko",
    dokumentert: "dokumentert etter § 5i",
    frister: "Frister som løper.",
    espdEn: "ESPD-erklæring er over fristen.",
    espdFlere: "ESPD-erklæringer er over fristen.",
    seDem: "Se dem",
    kravVenter: "krav om redegjørelse venter på vurdering.",
    kontrollplikt: "Kontrollplikt § 5i",
    avDokumentert: "leverandører dokumentert",
    forklaring:
      "Kontrollen må kunne dokumenteres i ettertid, ikke bare utføres. Leverandører uten lagret kontroll teller ikke med.",
    kjorEnKontroll: "Kjør en kontroll →",
    kreverNoe: "Krever noe av deg",
    sisteKjoringer: "Siste kjøringer",
  },
  leverandorer: {
    seKoblingene: "Se koblingene",
    kunneIkkeHente: "Kunne ikke hente leverandører:",
    ingenEnna: "Ingen leverandører ennå. Kjør din første kontroll for å komme i gang.",
    styretDeltakere: "personer i styret som også står registrert som deltakere i anskaffelsen.",
    muligKonfliktKort: "Mulig interessekonflikt",
    muligKonflikt: "Mulig interessekonflikt.",
    harEn: "leverandør har",
    harFlere: "leverandører har",
  },
  jav: {
    eiersiden:
      "Eiersiden er ikke kontrollert. Aksjonærregisteret publiseres av Skatteetaten som en årlig fil, ikke som oppslag, så eierskap kan ikke krysses automatisk ennå.",
    utenDeltakere:
      "Uten dem finnes det ingenting å krysse styret mot, og kontrollen er ikke utført — ikke bestått.",
    kunneIkkeHente: "Kunne ikke hente treff:",
    funnet: "Funnet",
    ingenFunnet: "Ingen mulige interessekonflikter funnet.",
    identiskNavnMerke: "Identisk navn",
    tegnsAvvik: "tegns avvik",
    fodt: "f.",
    styre: "Styre", dagligLeder: "Daglig leder", eier: "Eier",
    naerRelasjon: "Nær relasjon",
    muligeKoblinger: "mulige koblinger",
    identiskNavn: "med identisk navn",
    skrivevariasjon: "med liten skrivevariasjon",
    deltakere: "deltakere registrert",
    ingenDeltakere: "Ingen prosjektdeltakere er registrert.",
    hosLeverandoren: "Hos leverandøren",
    hosDere: "Hos dere",
    kobling: "Kobling",
    sikkerhet: "Sikkerhet",
  },
  bulk: {
    lastOpp: "Last opp en liste",
    velgFil: "Velg fil",
    leserFilen: "Leser filen …",
    filhjelp: "Excel, CSV eller tekst. Filen leses her i nettleseren og sendes ikke noe sted.",
    numre: "numre",
    ellerLimInn: "eller lim inn",
    organisasjonsnumre: "Organisasjonsnumre",
    limhjelp: "Ett nummer per linje, eller skilt med komma. Kontrollsifferet valideres med modulus 11 mens du skriver.",
    gyldige: "gyldige",
    ugyldige: "ugyldige",
    tomLista: "Tøm lista",
    kjor: "Kjør",
    kontroller: "kontroller",
    koHjelp: "Kjøringen krever en kø i bakgrunnen — hundre oppslag kan ikke gjøres i én forespørsel. Ikke koblet på ennå.",
    nummer: "Nummer",
    klarForOppslag: "Klar for oppslag",
    ingenTall: "Fant ingen nisifrede tall i filen. Er organisasjonsnumrene delt over flere kolonner?",
    kunneIkkeLese: "Kunne ikke lese filen. Er den skadet, eller passordbeskyttet?",
  },
  kjede: {
    alle: "Alle",
    overGrensen: "Over grensen",
    bareOver: "Viser bare kjeder med flere enn to ledd.",
    klikkForAFolde: "Klikk en kjede for å folde den sammen.",
    ledd: "ledd",
    hovedleverandor: "Hovedleverandør",
    leddNr: "Ledd",
    bruddTittel: "Brudd på § 5k.",
    bruddTekst:
      "Enten kuttes det nederste leddet, eller så må oppdragsgiver gi dispensasjon og begrunne den i anskaffelsesprotokollen.",
    kjedenHar: "Kjeden har",
    grensenEr: "ledd, grensen er",
    innenfor: "Innenfor grensen i § 5k",
  },
  konto: {
    lagret: "Lagret.",
    lagreNavn: "Lagre navn",
    nyttPassord: "Nytt passord",
    gjentaPassordet: "Gjenta passordet",
    byttPassord: "Bytt passord",
    navnPaOrganisasjonen: "Navn på organisasjonen",
    organisasjonsnummer: "Organisasjonsnummer",
    planStyres: "Planen styres av abonnementet og kan ikke endres her.",
    nyBruker: "Ny bruker",
    opprett: "Opprett",
    midlertidigPassord: "Midlertidig passord",
    bruker: "Bruker",
    administrator: "Administrator",
    passordHjelp:
      "Brukeren logger inn med dette passordet og bør bytte det selv under Kontoinnstillinger.",
    deg: "— deg",
    tofaktorPa: "Slått på",
    tofaktorAv: "Ikke satt opp",
    tofaktorForklaring:
      "En engangskode fra mobilen i tillegg til passordet. Frivillig, men anbefalt — kontoen gir tilgang til leverandørdata og kontrollhistorikk.",
    settOpp: "Sett opp tofaktor",
    slaAv: "Slå av",
    autentiseringsapp: "Autentiseringsapp",
    skannKoden:
      "Skann koden med Google Authenticator, 1Password, Aegis eller en annen autentiseringsapp.",
    fikkIkkeSkannet: "Får du ikke skannet? Skriv inn nøkkelen manuelt",
    skrivKoden: "Skriv inn koden appen viser",
    slattPa: "Tofaktor er slått på.",
    slattAv: "Tofaktor er slått av.",
    qrAlt: "QR-kode for tofaktor",
  },
  sak: {
    nySak: "Ny sak",
    hvaGjelderDet: "Hva gjelder det?",
    beskrivSaken: "Beskriv saken",
    emneEksempel: "Feil risikonivå på Solstrand Renhold",
    meldingEksempel: "Hva skjedde, og hva forventet du i stedet?",
    varsleValg: "Send meg e-post når saken får svar eller endrer status.",
    sendInn: "Send inn",
    varsleMeg: "Varsle meg på e-post",
    sendSvar: "Send svar",
    meldinger: "meldinger",
  },
  veiviser: {
    steg: ["Selskap", "Anskaffelse", "Saksopplysninger", "Tariff og HMS", "Egenerklæring", "Oppsummering"],
    orgnummer: "Organisasjonsnummer",
    hintNiSiffer: "Ni siffer. Kontrollsifferet valideres med modulus 11 før oppslag.",
    hintKlar: "Ni siffer, kontrollsifferet stemmer. Klar for oppslag.",
    slaOpp: "Slå opp i Enhetsregisteret",
    slaarOpp: "Slår opp …",
    oppslagFeilet: "Oppslaget mislyktes.",
    ingenKontakt: "Fikk ikke kontakt med Enhetsregisteret.",
    offentligJa: "Ja, offentlig anskaffelse",
    offentligJaTekst: "Full kontroll mot avvisningsgrunner, skatteattest, leddbegrensning og lærlingekrav.",
    offentligNei: "Nei, privat innkjøp",
    offentligNeiTekst: "Kontrollerer selskapsdata, økonomi og sanksjonslister. Ingen paragrafvurdering.",
    velg: "Velg …",
    saksnummer: "Saksnummer", bestiller: "Bestiller", saksbehandler: "Saksbehandler",
    konkurranseform: "Konkurranseform", avtaleFra: "Avtale fra", avtaleTil: "Avtale til",
    avtaleverdi: "Avtaleverdi (NOK)", opsjon: "Opsjon", ingenOpsjon: "Ingen opsjon",
    tariffTittel: "Tariffavtale, HMS-kort og lønnsvilkår",
    kryssAv: "Kryss av det du har bekreftet",
    espdOffentlig: "ESPD-egenerklæringen dekker den delen av kvalifikasjonsvurderingen vi ikke kan kontrollere mot registrene.",
    espdPrivat: "Ved private innkjøp er egenerklæring frivillig, men den lagres som vedlegg hvis den finnes.",
    espdLevert: "Levert med tilbudet",
    espdLevertTekst: "Hentes fra anskaffelsen og sammenlignes med registrene. Motstrid flagges som avvisningsgrunn etter § 24-2 tredje ledd.",
    espdMangler: "Ikke levert — be om ettersending",
    espdManglerTekst: "Manglende egenerklæring er normalt en mangel som kan repareres etter § 23-5, i motsetning til innholdet i tilbudet.",
    fristEttersending: "Frist for ettersending",
    tiVirkedager: "Ti virkedager er vanlig.",
    kjorKontrollen: "Kjør kontrollen",
    kjorer: "Kjører …",
    organisasjonsform: "Organisasjonsform", ansatte: "Ansatte", registrert: "Registrert",
    konkurs: "Konkurs", underTvangsavvikling: "Under tvangsavvikling", underAvvikling: "Under avvikling",
    ingenKonkurs: "Ingen konkurs eller avvikling registrert",
    avvisningsgrunn: "Avvisningsgrunn etter § 24-2:",
    typeInnkjop: "Type innkjøp",
    offentligAnskaffelse: "Offentlig anskaffelse", privatInnkjop: "Privat innkjøp",
    feltUtfylt: "felt utfylt", hoppetOver: "Hoppet over",
    bekreftet: "bekreftet", ingenBekreftet: "Ingen bekreftet",
    av: "av",
  },
  auth: {
    feilInnlogging: "Feil e-post eller passord.",
    microsoftAv: "Innlogging med Microsoft er ikke slått på ennå. Bruk e-post og passord så lenge.",
    microsoftFeil: "Fikk ikke kontakt med Microsoft. Prøv igjen.",
    senderTilMicrosoft: "Sender deg til Microsoft …",
    engangskodeTittel: "Engangskode",
    kodenStemmerIkke: "Koden stemmer ikke. Prøv den som vises nå.",
    fortsett: "Fortsett",
    feilPassord: "Feil passord.",
    slippMegInn: "Slipp meg inn",
    underUtvikling: "Siden er under utvikling og ikke åpen ennå.",
    loggInn: "Logg inn",
    undertittel: "Leverandørkontroll for offentlige anskaffelser",
    epost: "E-post",
    passord: "Passord",
    eller: "eller",
    medMicrosoft: "Logg inn med Microsoft",
    kommer: "kommer",
    loggerInn: "Logger inn …",
    tofaktor: "Tofaktor",
    engangskode: "Skriv inn koden appen viser",
    bekreft: "Bekreft",
    bekrefter: "Bekrefter …",
  },
};
