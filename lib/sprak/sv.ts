import type { Ordbok } from "./felles";

/**
 * Svenska. Paragrafhänvisningar och namnen på norska register och
 * förordningar står kvar på norska — «anskaffelsesforskriften § 24-9» är
 * namnet på en norsk förordning, inte en fras. Översätts den går den inte
 * att slå upp, och då är citatet meningslöst.
 */
export const sv: Ordbok = {
  sprak: { velg: "Språk", norsk: "Norska", svensk: "Svenska", engelsk: "Engelska" },

  meny: {
    oversikt: "Översikt",
    nyKontroll: "Ny kontroll",
    bulk: "Bulkkontroll",
    kjede: "Leverantörskedja",
    tilbud: "Onormalt låga anbud",
    anskaffelser: "Upphandlingar",
    leverandorer: "Leverantörer",
    jav: "Intressekonflikt",
    espd: "ESPD",
    support: "Kundtjänst",
    konto: "Konto",
  },

  ansattmeny: {
    konton: "Konton",
    attgora: "Att göra",
    support: "Support",
    kontakt: "Kontakt",
    leads: "Leads",
    offerter: "Offerter",
    fakturering: "Fakturering",
    onboarding: "Onboarding",
    kreditt: "Kreditkontroll",
    kallor: "Källhälsa",
    marginal: "Marginal",
    logg: "Åtkomstlogg",
    team: "Team och behörighet",
  },

  skall: {
    kontoenDin: "Ditt konto",
    loggUt: "Logga ut",
    loggerUt: "Loggar ut …",
    relavoInternt: "Relavo internt →",
    tilbakeTilKunde: "← Tillbaka till kundvyn",
    internt: "Internt",
    apneMenyen: "Öppna menyn",
    lukkMenyen: "Stäng menyn",
    personal: "Personal",
    superadmin: "Superadmin",
  },

  felles: {
    lagre: "Spara",
    lagrer: "Sparar …",
    avbryt: "Avbryt",
    tilbake: "Tillbaka",
    neste: "Nästa",
    hoppOver: "Hoppa över",
    sok: "Sök",
    vis: "Visa",
    skjul: "Dölj",
    apne: "Öppna",
    sender: "Skickar …",
    henter: "Hämtar …",
    valgfritt: "valfritt",
    ingenting: "Inget här ännu.",
    status: "Status",
    endreStatus: "Klicka för att ändra status",
  },

  sider: {
    oversikt: {
      tittel: "Översikt",
      tekst: "Status på kontrollplikten, och det som kräver något av dig i dag.",
    },
    nyKontroll: {
      tittel: "Ny kontroll",
      tekst:
        "Sex steg, varav tre är valfria. Resultatet sparas oförändrat som dokumentation på uppfylld kontrollplikt enligt anskaffelsesloven § 5i.",
    },
    bulk: {
      tittel: "Bulkkontroll",
      tekst:
        "Klistra in organisationsnumren för hela portföljen och kör kontroll på alla på en gång.",
    },
    kjede: {
      tittel: "Leverantörskedja",
      tekst:
        "§ 5k tillåter högst två led underleverantörer i bygg, anläggning och städ. Överskridanden flaggas — och de två lagliga vägarna ut är att kapa ledet eller söka dispens hos den upphandlande myndigheten.",
    },
    tilbud: {
      tittel: "Onormalt låga anbud",
      tekst:
        "Avvikelsen räknas mot medianen av de övriga anbuden. Är ett anbud onormalt lågt är ni enligt § 24-9 skyldiga att be anbudsgivaren redogöra skriftligt innan anbudet eventuellt förkastas.",
    },
    anskaffelser: {
      tittel: "Upphandlingar",
      tekst:
        "Avtalen som kontrollerna hänger på. Ärendenumret här är detsamma som ni för in i anskaffelsesprotokollen.",
    },
    leverandorer: {
      tittel: "Leverantörer",
      tekst: "Alla leverantörer ni har kontrollerat, med senast kända status.",
    },
    jav: {
      tittel: "Intressekonflikt",
      tekst:
        "Styrelseledamöter hos leverantören korsas mot dem som deltar i upphandlingen. En träff är en varning om möjligt jäv enligt forvaltningsloven § 6, inte en slutsats.",
    },
    espd: {
      tittel: "ESPD och egenförsäkran",
      tekst:
        "Egenförsäkran täcker den del av kvalificeringen som registren inte kan svara på. Saknas en kan den krävas in i efterhand enligt § 23-5 — och fristen följs upp här.",
    },
    support: {
      tittel: "Kundtjänst",
      tekst:
        "Anmäl ett ärende och följ svaret här. Väljer du avisering får du e-post när ärendet får svar eller byter status.",
    },
    konto: {
      tittel: "Kontoinställningar",
      tekst:
        "Dina egna uppgifter, organisationen du tillhör och vilka som har åtkomst.",
    },
  },

  ansattsider: {
    konton: {
      tittel: "Konton",
      tekst: "Alla kundkonton, vilken plan de ligger på och hur mycket av kvoten de använt.",
    },
    attgora: {
      tittel: "Att göra",
      tekst:
        "Det som kräver en människa i dag, hämtat från fakturor, offerter, leads och källhälsa. Rött hastar.",
    },
    support: {
      tittel: "Support",
      tekst:
        "Ärenden från alla konton. Svarar du här går svaret direkt till kunden, och ärendet flyttas till Väntar på kunden.",
    },
    kontakt: {
      tittel: "Kontakt",
      tekst:
        "Meddelanden från kontaktformuläret på landningssidan. Markera som behandlad när någon har svarat.",
    },
    leads: {
      tittel: "Leads",
      tekst:
        "Intresserade som ännu inte är kunder. Kolumnen nästa steg är den som avgör om något faller mellan stolarna.",
    },
    offerter: {
      tittel: "Offerter",
      tekst:
        "Skickade offerter, vad de är värda och när de går ut. Sök på kundens namn så fylls organisationsnummer och kontaktuppgifter i automatiskt.",
    },
    fakturering: {
      tittel: "Fakturering",
      tekst:
        "Fakturor per konto, med förfallodatum och status. Fakturanumret sätts automatiskt som löpnummer per år.",
    },
    onboarding: {
      tittel: "Onboarding",
      tekst:
        "Var i uppstarten varje kund står. Ett konto räknas som igång först när det kört sin första kontroll, inte när avtalet är påskrivet.",
    },
    kreditt: {
      tittel: "Kreditkontroll",
      tekst:
        "Kontroll av kunder och blivande kunder innan vi fakturerar. Varje körning sparas oförändrad med tidpunkt, så den kan hämtas fram i efterhand.",
    },
    kallor: {
      tittel: "Källhälsa",
      tekst:
        "Svarstider, felfrekvens och kostnad per register. Ligger en källa nere ska kundens rapport säga det, inte tiga om det.",
    },
    marginal: {
      tittel: "Marginal",
      tekst:
        "Vad varje konto ger mot vad registeruppslagen kostar oss. Konton som går med förlust står rött.",
    },
    logg: {
      tittel: "Åtkomstlogg",
      tekst:
        "Vem hos oss har öppnat vilken kunds data, och varför. Loggen ska kunna visas upp för kunden utan att vi först måste städa i den.",
    },
    team: {
      tittel: "Team och behörighet",
      tekst:
        "Vilka som jobbar hos oss och vad var och en får se. Behörighet att läsa kunddata är skild från behörighet att ändra inställningar — den ena följer inte av den andra.",
    },
  },

  landing: {
    nav: { plattform: "Plattform", regelverk: "Regelverk", priser: "Priser", sporsmal: "Frågor", loggInn: "Logga in", komIGang: "Kom igång" },
    hero: {
      nytt: "Nytt",
      pille: "gäller från 1 juli 2026 →",
      tittel: "Kontrollen du måste göra. Beviset du måste ha.",
      lead: "Relavo hämtar bolagsdata, skatteskulder och betalningsanmärkningar, kartlägger hur djup leverantörskedjan faktiskt är, och sparar resultatet som dokumentation på kontrollplikten i § 5i.",
      sePriser: "Se priser",
      note: "Från 590 NOK per kontroll. Ingen bindningstid.",
    },
    kilder: { byggerPa: "Bygger på" },
    regelverk: {
      eyebrow: "Regelverk",
      tittel: "En lagändring, fyra tal som betyder något.",
      undertittel: "Från 1 juli 2026 är kontrollplikten uttrycklig.",
      tall: [
        "led underleverantörer är taket i bygg, anläggning och städ enligt § 5k",
        "medianen på ett uppslag mot Enhetsregisteret",
        "register samlade i en rapport, med källa och datum på varje rad",
        "kräver att kontrollen kan dokumenteras i efterhand, inte bara utföras",
      ],
    },
    plattform: {
      eyebrow: "Fler funktioner",
      raskt: "Svaret kommer innan du hinner öppna nästa flik.",
      kjede: "Leverantörskedjan, hela vägen ner",
      krav: "Varje krav som en bockbar rad",
      laveTilbud: "Onormalt låga anbud",
      overvaking: "Löpande bevakning",
      tittel: "En kontroll, alla register.",
      kjedeD: "§ 5k tillåter högst två led underleverantörer i bygg, anläggning och städ. Lägg in kedjan du har, så flaggas överskridandet direkt — och du får de två vanliga vägarna ut.",
      kravD: "Rapporten följer lagen punkt för punkt, med samma paragrafhänvisning som du citerar i anskaffelsesprotokollen.",
      laveTilbudD: "Avvikelsen beräknas mot de övriga anbuden, och du får ett utkast till det redogörelsekrav som § 24-9 ålägger dig att skicka.",
      overvakingD: "Konkurs, tvångslikvidation och nya anmärkningar fångas upp samma dag de registreras, inte vid nästa kontroll.",
      rapportD: "Varje körning sparas oförändrad med källa och datum på varje rad. Det som inte är kontrollerat står som ej kontrollerat.",
      rapport: "Rapport som håller",
    },
    priser: {
      eyebrow: "Priser",
      tittel: "Ett pris, hela rapporten.",
      undertittel: "Inga tillägg per uppslag och inga överraskningar på fakturan.",
      vanligst: "Vanligast",
      planer: [
        { navn: "Leverantörskontroll", enhet: "NOK", beskrivelse: "En kontroll, full rapport som PDF. Utan abonnemang.", knapp: "Kör en kontroll", punkter: ["Bolagsdata och roller", "Skatt, moms och anmärkningar", "Kedjekontroll mot § 5k", "Rapport som PDF"] },
        { navn: "Standard", enhet: "NOK/mån", beskrivelse: "Löpande bevakning av leverantörerna i portföljen.", knapp: "Starta Standard", punkter: ["Allt i enkelkontroll", "Alla källor i varje kontroll", "Daglig bevakning", "Bulkkontroll och upphandlingar", "Bedömning av låga anbud"] },
        { navn: "Enterprise", enhet: "NOK/mån", beskrivelse: "Flera enheter under samma avtal, med API.", knapp: "Starta Enterprise", punkter: ["Allt i Standard", "Flera enheter och arbetsytor", "API-åtkomst", "Egen kontaktperson", "Personuppgiftsbiträdesavtal"] },
      ],
    },
    faq: {
      eyebrow: "Frågor",
      tittel: "Det folk frågar om först.",
      sporsmal: [
        { q: "Kollar ni om någon är dömd för brott?", a: "Nej, och ingen kommersiell aktör kan. Behandling av uppgifter om brottmålsdomar är enligt personopplysningsloven § 11 i praktiken förbehållen offentliga myndigheter, och Lovdata ger ingen maskinell åtkomst till rättsavgöranden. Vi kontrollerar bolag, inte enskilda personer. Den delen av kvalificeringen täcks av leverantörens ESPD-egenförsäkran, som sparas som bilaga till kontrollen." },
        { q: "Tillkommer det avgifter utöver abonnemanget?", a: "Nej. Priset täcker den färdiga rapporten, oavsett hur många register den bygger på. Du köper bedömningen och dokumentationen, inte enskilda uppslag, och fakturan ser likadan ut varje månad." },
        { q: "Håller rapporten som dokumentation enligt § 5i?", a: "Varje körning sparas oförändrad med tidpunkt, källa och resultat på varje enskild rad, och kan hämtas fram i efterhand. Källor vi inte fått svar från står som ej kontrollerade i stället för att utelämnas — en rapport som tiger om sina luckor är sämre än ingen rapport." },
        { q: "Vi finns i Sverige. Fungerar det?", a: "Relavo är byggt för norska organisationsnummer och norskt regelverk. Kärnan i bedömningen följer samma EU-direktiv i hela EES, men datakällorna och paragraferna är norska." },
      ],
    },
    close: {
      tittel: "Hur djup är kedjan i ditt största kontrakt?",
      tekst: "Kör en kontroll och se svaret. Du behöver inget abonnemang för att prova.",
      snakkMedOss: "Prata med oss",
    },
    foot: {
      tekst: "Relavo kontrollerar bolag, inte enskilda personer. Uppgifter om brottmålsdomar behandlas inte.",
      vilkar: "Villkor",
      personvern: "Integritet",
      cookies: "Cookies",
      kontakt: "Kontakt",
    },
  },
  ui: {
    selskap: "Bolag", leverandor: "Leverantör", bransje: "Bransch",
    risiko: "Risk", sistKontrollert: "Senast kontrollerad", aldri: "Aldrig",
    saksnummer: "Ärendenummer", anskaffelse: "Upphandling",
    konkurranseform: "Förfarande", avtaleverdi: "Avtalsvärde",
    periode: "Period", kontroller: "Kontroller",
    navn: "Namn", rolle: "Roll", lagtTil: "Tillagd",
    opplysning: "Uppgift", verdi: "Värde",
    hva: "Vad", nar: "När", tidspunkt: "Tidpunkt", utlostAv: "Utlöst av",
    resultat: "Resultat", demodata: "från prototypens demodata",
  },
  risiko: { lav: "Låg", middels: "Medel", hoy: "Hög" },
  oversikt: {
    iPortefoljen: "leverantörer i portföljen",
    kontrollerKjort: "kontroller körda",
    medHoyRisiko: "med hög risk",
    dokumentert: "dokumenterat enligt § 5i",
    frister: "Frister som löper.",
    espdEn: "ESPD-försäkran är över fristen.",
    espdFlere: "ESPD-försäkringar är över fristen.",
    seDem: "Se dem",
    kravVenter: "krav om redogörelse väntar på bedömning.",
    kontrollplikt: "Kontrollplikt § 5i",
    avDokumentert: "leverantörer dokumenterade",
    forklaring:
      "Kontrollen måste kunna dokumenteras i efterhand, inte bara utföras. Leverantörer utan sparad kontroll räknas inte med.",
    kjorEnKontroll: "Kör en kontroll →",
    kreverNoe: "Kräver något av dig",
    sisteKjoringer: "Senaste körningar",
  },
  leverandorer: {
    seKoblingene: "Se kopplingarna",
    kunneIkkeHente: "Kunde inte hämta leverantörer:",
    ingenEnna: "Inga leverantörer ännu. Kör din första kontroll för att komma igång.",
    styretDeltakere: "personer i styrelsen som också står registrerade som deltagare i upphandlingen.",
    muligKonfliktKort: "Möjlig intressekonflikt",
    muligKonflikt: "Möjlig intressekonflikt.",
    harEn: "leverantör har",
    harFlere: "leverantörer har",
  },
  jav: {
    eiersiden:
      "Ägarsidan är inte kontrollerad. Aksjonærregisteret publiceras av Skatteetaten som en årlig fil, inte som uppslag, så ägande kan ännu inte korsas automatiskt.",
    utenDeltakere:
      "Utan dem finns det inget att korsa styrelsen mot, och kontrollen är inte utförd — inte godkänd.",
    kunneIkkeHente: "Kunde inte hämta träffar:",
    funnet: "Hittad",
    ingenFunnet: "Inga möjliga intressekonflikter hittade.",
    identiskNavnMerke: "Identiskt namn",
    tegnsAvvik: "teckens avvikelse",
    fodt: "f.",
    styre: "Styrelse", dagligLeder: "Verkställande direktör", eier: "Ägare",
    naerRelasjon: "Nära relation",
    muligeKoblinger: "möjliga kopplingar",
    identiskNavn: "med identiskt namn",
    skrivevariasjon: "med liten stavningsvariation",
    deltakere: "deltagare registrerade",
    ingenDeltakere: "Inga projektdeltagare är registrerade.",
    hosLeverandoren: "Hos leverantören",
    hosDere: "Hos er",
    kobling: "Koppling",
    sikkerhet: "Säkerhet",
  },
  bulk: {
    lastOpp: "Ladda upp en lista",
    velgFil: "Välj fil",
    leserFilen: "Läser filen …",
    filhjelp: "Excel, CSV eller text. Filen läses här i webbläsaren och skickas ingenstans.",
    numre: "nummer",
    ellerLimInn: "eller klistra in",
    organisasjonsnumre: "Organisationsnummer",
    limhjelp: "Ett nummer per rad, eller åtskilda med komma. Kontrollsiffran valideras med modulus 11 medan du skriver.",
    gyldige: "giltiga",
    ugyldige: "ogiltiga",
    tomLista: "Töm listan",
    kjor: "Kör",
    kontroller: "kontroller",
    koHjelp: "Körningen kräver en kö i bakgrunden — hundra uppslag kan inte göras i en förfrågan. Inte inkopplat ännu.",
    nummer: "Nummer",
    klarForOppslag: "Klar för uppslag",
    ingenTall: "Hittade inga niosiffriga tal i filen. Är organisationsnumren uppdelade över flera kolumner?",
    kunneIkkeLese: "Kunde inte läsa filen. Är den skadad, eller lösenordsskyddad?",
  },
  kjede: {
    alle: "Alla",
    overGrensen: "Över gränsen",
    bareOver: "Visar bara kedjor med fler än två led.",
    klikkForAFolde: "Klicka på en kedja för att fälla ihop den.",
    ledd: "led",
    hovedleverandor: "Huvudleverantör",
    leddNr: "Led",
    bruddTittel: "Brott mot § 5k.",
    bruddTekst:
      "Antingen kapas det understa ledet, eller så måste den upphandlande myndigheten ge dispens och motivera den i anskaffelsesprotokollen.",
    kjedenHar: "Kedjan har",
    grensenEr: "led, gränsen är",
    innenfor: "Inom gränsen i § 5k",
  },
  konto: {
    lagret: "Sparat.",
    lagreNavn: "Spara namn",
    nyttPassord: "Nytt lösenord",
    gjentaPassordet: "Upprepa lösenordet",
    byttPassord: "Byt lösenord",
    navnPaOrganisasjonen: "Organisationens namn",
    organisasjonsnummer: "Organisationsnummer",
    planStyres: "Planen styrs av abonnemanget och kan inte ändras här.",
    nyBruker: "Ny användare",
    opprett: "Skapa",
    midlertidigPassord: "Tillfälligt lösenord",
    bruker: "Användare",
    administrator: "Administratör",
    passordHjelp:
      "Användaren loggar in med det här lösenordet och bör byta det själv under Kontoinställningar.",
    deg: "— du",
    tofaktorPa: "Påslagen",
    tofaktorAv: "Inte uppsatt",
    tofaktorForklaring:
      "En engångskod från mobilen utöver lösenordet. Frivilligt, men rekommenderat — kontot ger åtkomst till leverantörsdata och kontrollhistorik.",
    settOpp: "Sätt upp tvåfaktor",
    slaAv: "Stäng av",
    autentiseringsapp: "Autentiseringsapp",
    skannKoden:
      "Skanna koden med Google Authenticator, 1Password, Aegis eller en annan autentiseringsapp.",
    fikkIkkeSkannet: "Kan du inte skanna? Skriv in nyckeln manuellt",
    skrivKoden: "Skriv in koden som appen visar",
    slattPa: "Tvåfaktor är påslagen.",
    slattAv: "Tvåfaktor är avstängd.",
    qrAlt: "QR-kod för tvåfaktor",
  },
  sak: {
    nySak: "Nytt ärende",
    hvaGjelderDet: "Vad gäller det?",
    beskrivSaken: "Beskriv ärendet",
    emneEksempel: "Fel risknivå på Solstrand Renhold",
    meldingEksempel: "Vad hände, och vad förväntade du dig i stället?",
    varsleValg: "Skicka e-post till mig när ärendet får svar eller byter status.",
    sendInn: "Skicka in",
    varsleMeg: "Avisera mig via e-post",
    sendSvar: "Skicka svar",
    meldinger: "meddelanden",
  },
  veiviser: {
    steg: ["Bolag", "Upphandling", "Ärendeuppgifter", "Kollektivavtal och HMS", "Egenförsäkran", "Sammanfattning"],
    orgnummer: "Organisationsnummer",
    hintNiSiffer: "Nio siffror. Kontrollsiffran valideras med modulus 11 före uppslag.",
    hintKlar: "Nio siffror, kontrollsiffran stämmer. Klar för uppslag.",
    slaOpp: "Slå upp i Enhetsregisteret",
    slaarOpp: "Slår upp …",
    oppslagFeilet: "Uppslaget misslyckades.",
    ingenKontakt: "Fick ingen kontakt med Enhetsregisteret.",
    offentligJa: "Ja, offentlig upphandling",
    offentligJaTekst: "Full kontroll mot uteslutningsgrunder, skatteintyg, ledbegränsning och lärlingskrav.",
    offentligNei: "Nej, privat inköp",
    offentligNeiTekst: "Kontrollerar bolagsdata, ekonomi och sanktionslistor. Ingen paragrafbedömning.",
    velg: "Välj …",
    saksnummer: "Ärendenummer", bestiller: "Beställare", saksbehandler: "Handläggare",
    konkurranseform: "Förfarande", avtaleFra: "Avtal från", avtaleTil: "Avtal till",
    avtaleverdi: "Avtalsvärde (NOK)", opsjon: "Option", ingenOpsjon: "Ingen option",
    tariffTittel: "Kollektivavtal, HMS-kort och lönevillkor",
    kryssAv: "Kryssa i det du har bekräftat",
    espdOffentlig: "ESPD-egenförsäkran täcker den del av kvalificeringen vi inte kan kontrollera mot registren.",
    espdPrivat: "Vid privata inköp är egenförsäkran frivillig, men den sparas som bilaga om den finns.",
    espdLevert: "Lämnad med anbudet",
    espdLevertTekst: "Hämtas från upphandlingen och jämförs med registren. Motstridighet flaggas som uteslutningsgrund enligt § 24-2 tredje ledd.",
    espdMangler: "Inte lämnad — begär in i efterhand",
    espdManglerTekst: "Saknad egenförsäkran är normalt en brist som kan rättas enligt § 23-5, till skillnad från innehållet i anbudet.",
    fristEttersending: "Frist för insändning",
    tiVirkedager: "Tio arbetsdagar är vanligt.",
    kjorKontrollen: "Kör kontrollen",
    kjorer: "Kör …",
    organisasjonsform: "Bolagsform", ansatte: "Anställda", registrert: "Registrerad",
    konkurs: "Konkurs", underTvangsavvikling: "Under tvångslikvidation", underAvvikling: "Under likvidation",
    ingenKonkurs: "Ingen konkurs eller likvidation registrerad",
    avvisningsgrunn: "Uteslutningsgrund enligt § 24-2:",
    typeInnkjop: "Typ av inköp",
    offentligAnskaffelse: "Offentlig upphandling", privatInnkjop: "Privat inköp",
    feltUtfylt: "fält ifyllda", hoppetOver: "Överhoppat",
    bekreftet: "bekräftade", ingenBekreftet: "Inga bekräftade",
    av: "av",
  },
  auth: {
    feilInnlogging: "Fel e-post eller lösenord.",
    microsoftAv: "Inloggning med Microsoft är inte påslagen ännu. Använd e-post och lösenord så länge.",
    microsoftFeil: "Fick ingen kontakt med Microsoft. Försök igen.",
    senderTilMicrosoft: "Skickar dig till Microsoft …",
    engangskodeTittel: "Engångskod",
    kodenStemmerIkke: "Koden stämmer inte. Prova den som visas nu.",
    fortsett: "Fortsätt",
    feilPassord: "Fel lösenord.",
    slippMegInn: "Släpp in mig",
    underUtvikling: "Sidan är under utveckling och inte öppen ännu.",
    loggInn: "Logga in",
    undertittel: "Leverantörskontroll för offentlig upphandling",
    epost: "E-post",
    passord: "Lösenord",
    eller: "eller",
    medMicrosoft: "Logga in med Microsoft",
    kommer: "kommer",
    loggerInn: "Loggar in …",
    tofaktor: "Tvåfaktor",
    engangskode: "Skriv in koden som appen visar",
    bekreft: "Bekräfta",
    bekrefter: "Bekräftar …",
  },
};
