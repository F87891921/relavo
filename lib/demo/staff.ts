/**
 * Demodata fra prototypen, uendret. Skjermbildene er portet med det samme
 * innholdet så de kan sammenlignes side ved side med relavo-staff.html.
 *
 * MERK: dette er ikke ekte data. Etter hvert som hver skjerm får sin egen
 * tabell i Postgres, byttes importen her ut med et spørring — slik
 * leverandørsiden og Ny kontroll allerede er gjort.
 */

export const KONTON = [
  {
    "id": "bergen",
    "namn": "Bergen kommune",
    "enhet": "Innkjøp og anskaffelser",
    "plan": "enterprise",
    "anvant": 312,
    "lev": 148,
    "sist": "för 12 min sedan",
    "avtal": "2027-06-30",
    "overvak": 148,
    "kontakt": "Marit Aasen",
    "epost": "marit.aasen@bergen.kommune.no"
  },
  {
    "id": "vestland",
    "namn": "Vestland fylkeskommune",
    "enhet": "Innkjøpsseksjonen",
    "plan": "enterprise",
    "anvant": 381,
    "lev": 203,
    "sist": "för 2 tim sedan",
    "avtal": "2027-03-31",
    "overvak": 203,
    "kontakt": "Jon Rivedal",
    "epost": "jon.rivedal@vlfk.no"
  },
  {
    "id": "nordvest",
    "namn": "Nordvest Entreprenør AS",
    "enhet": "Innkjøp",
    "plan": "standard",
    "anvant": 94,
    "lev": 61,
    "sist": "igår",
    "avtal": "2027-01-31",
    "overvak": 61,
    "kontakt": "Silje Hauge",
    "epost": "silje@nordvest.no"
  },
  {
    "id": "askoy",
    "namn": "Askøy kommune",
    "enhet": "Økonomiavdelingen",
    "plan": "standard",
    "anvant": 38,
    "lev": 44,
    "sist": "för 3 dagar sedan",
    "avtal": "2026-12-31",
    "overvak": 44,
    "kontakt": "Terje Lien",
    "epost": "terje.lien@askoy.kommune.no"
  },
  {
    "id": "voss",
    "namn": "Voss herad",
    "enhet": "Innkjøp",
    "plan": "standard",
    "anvant": 11,
    "lev": 19,
    "sist": "för 3 veckor sedan",
    "avtal": "2027-02-28",
    "overvak": 19,
    "kontakt": "Ingrid Mo",
    "epost": "ingrid.mo@voss.herad.no"
  },
  {
    "id": "sotra",
    "namn": "Øygarden kommune",
    "enhet": "Anskaffelser",
    "plan": "standard",
    "anvant": 0,
    "lev": 0,
    "sist": "aldrig",
    "avtal": "2027-04-30",
    "overvak": 0,
    "kontakt": "Bjørn Sæle",
    "epost": "bjorn.sale@oygarden.kommune.no"
  }
] as const;

export const KALLOR = [
  {
    "n": "Brønnøysundregistrene",
    "d": "Enhetsregisteret",
    "anrop": 14208,
    "fel": 0.1,
    "svar": 340,
    "kostnad": 0,
    "status": "ok"
  },
  {
    "n": "Skatteetaten",
    "d": "Skatteattest",
    "anrop": 3104,
    "fel": 0.4,
    "svar": 920,
    "kostnad": 0,
    "status": "ok"
  },
  {
    "n": "Creditsafe Norge",
    "d": "Kredit, PEP",
    "anrop": 836,
    "fel": 6.2,
    "svar": 2840,
    "kostnad": 8,
    "status": "dalig"
  },
  {
    "n": "Arbeidstilsynet",
    "d": "Bransjeregistre",
    "anrop": 412,
    "fel": 1.1,
    "svar": 1210,
    "kostnad": 0,
    "status": "ok"
  },
  {
    "n": "StartBANK",
    "d": "Prekvalificering",
    "anrop": 298,
    "fel": 0.7,
    "svar": 660,
    "kostnad": 0,
    "status": "ok"
  }
] as const;

export const LOGG = [
  {
    "vem": "FS",
    "namn": "Fred Smith",
    "konto": "Askøy kommune",
    "vad": "öppnade leverantörsrapport",
    "ref": "Solstrand Renhold AS",
    "tid": "i dag 09:14",
    "varfor": "Supportärende #204 — kunden såg fel risknivå"
  },
  {
    "vem": "FS",
    "namn": "Fred Smith",
    "konto": "Voss herad",
    "vad": "öppnade kontoinställningar",
    "ref": "kvot",
    "tid": "i går 16:02",
    "varfor": "Kvothöjning efter begäran"
  },
  {
    "vem": "FS",
    "namn": "Fred Smith",
    "konto": "Bergen kommune",
    "vad": "körde diagnostik",
    "ref": "inga kunddata lästa",
    "tid": "i går 11:47",
    "varfor": "Kontroll av Creditsafe-timeouts"
  },
  {
    "vem": "FS",
    "namn": "Fred Smith",
    "konto": "Nordvest Entreprenør AS",
    "vad": "öppnade kontrollhistorik",
    "ref": "12 kontroller",
    "tid": "26 aug 14:20",
    "varfor": "Fakturafråga"
  }
] as const;

export const ARENDEN = [
  {
    "id": "S-2041",
    "konto": "bergen",
    "kategori": "Data",
    "emne": "Feil risikonivå på Solstrand Renhold",
    "innsyn": true,
    "status": "besvarad",
    "vantat": 0,
    "senast": "i dag 09:14",
    "ansvarig": "FS",
    "sista": "Risikonivået kommer fra § 5k, ikke skatteattesten. Lagt inn tydeligere begrunnelse."
  },
  {
    "id": "S-2038",
    "konto": "bergen",
    "kategori": "Regelverk",
    "emne": "Gjelder leddgrensen også ved rammeavtale?",
    "innsyn": false,
    "status": "besvarad",
    "vantat": 0,
    "senast": "26 aug 08:20",
    "ansvarig": "FS",
    "sista": "Leddene telles per avrop. Henvist til DFØs veileder."
  },
  {
    "id": "S-2045",
    "konto": "vestland",
    "kategori": "Faktura",
    "emne": "Kvoten tog slut mitt i en upphandling",
    "innsyn": false,
    "status": "obesvarad",
    "vantat": 2,
    "senast": "27 aug 16:40",
    "ansvarig": "",
    "sista": "Vi har 381 av 400 kontroller brukt og seks tilbydere igjen å kontrollere."
  },
  {
    "id": "S-2044",
    "konto": "nordvest",
    "kategori": "Data",
    "emne": "Creditsafe svarar inte",
    "innsyn": true,
    "status": "obesvarad",
    "vantat": 1,
    "senast": "28 aug 11:02",
    "ansvarig": "",
    "sista": "Kredittdelen står tom på tre kontroller i dag. Er det oss eller dere?"
  },
  {
    "id": "S-2043",
    "konto": "askoy",
    "kategori": "Tilgang",
    "emne": "Ny bruker får ikke logget inn",
    "innsyn": false,
    "status": "oppna",
    "vantat": 0,
    "senast": "i dag 08:05",
    "ansvarig": "FS",
    "sista": "Invitasjonen er sendt på nytt, venter på bekreftelse fra kunden."
  },
  {
    "id": "S-2030",
    "konto": "bergen",
    "kategori": "Faktura",
    "emne": "Rekvisisjonsnummer på faktura",
    "innsyn": false,
    "status": "lukket",
    "vantat": 0,
    "senast": "15 aug 09:05",
    "ansvarig": "FS",
    "sista": "Lagt inn på kontoen."
  }
] as const;

export const FAKTUROR = [
  {
    "nr": "2026-0141",
    "konto": "bergen",
    "belopp": 12900,
    "forfall": "2026-09-15",
    "status": "obetald"
  },
  {
    "nr": "2026-0140",
    "konto": "vestland",
    "belopp": 12900,
    "forfall": "2026-08-15",
    "status": "forfallen",
    "dagar": 14
  },
  {
    "nr": "2026-0139",
    "konto": "nordvest",
    "belopp": 6900,
    "forfall": "2026-09-01",
    "status": "obetald"
  },
  {
    "nr": "2026-0138",
    "konto": "askoy",
    "belopp": 6900,
    "forfall": "2026-08-20",
    "status": "betald"
  },
  {
    "nr": "2026-0137",
    "konto": "voss",
    "belopp": 6900,
    "forfall": "2026-08-20",
    "status": "betald"
  },
  {
    "nr": "2026-K012",
    "konto": "vestland",
    "belopp": -3450,
    "forfall": "2026-08-10",
    "status": "kreditnota"
  }
] as const;

export const TEAM = [
  {
    "init": "FS",
    "namn": "Fred Smith",
    "roll": "Superadmin",
    "andra": true,
    "las": false,
    "aktiv": "för 12 min sedan"
  }
] as const;

export const REVISION = [
  {
    "vem": "FS",
    "vad": "ändrade kvot",
    "mal": "Voss herad",
    "detalj": "100 → 150",
    "tid": "i går 16:02"
  },
  {
    "vem": "FS",
    "vad": "skapade konto",
    "mal": "Øygarden kommune",
    "detalj": "Standard, 3 år",
    "tid": "24 aug 10:15"
  },
  {
    "vem": "FS",
    "vad": "skickade kreditnota",
    "mal": "Vestland fylkeskommune",
    "detalj": "K012, −3 450 NOK",
    "tid": "10 aug 13:22"
  },
  {
    "vem": "FS",
    "vad": "ändrade planpris",
    "mal": "Prislista",
    "detalj": "Standard 3 490 → 6 900",
    "tid": "8 aug 09:00"
  }
] as const;

export const NYCKLAR = [
  {
    "kalla": "Brønnøysundregistrene",
    "nyckel": "ingen nyckel kraves",
    "kvot": "obegränsad",
    "anvant": 14208,
    "styck": 0,
    "roterad": "—"
  },
  {
    "kalla": "Skatteetaten",
    "nyckel": "sk_live_••••4b21",
    "kvot": "50 000",
    "anvant": 3104,
    "styck": 0,
    "roterad": "12 feb 2026"
  },
  {
    "kalla": "Creditsafe Norge",
    "nyckel": "cs_live_••••9f07",
    "kvot": "2 000",
    "anvant": 836,
    "styck": 8,
    "roterad": "3 sep 2025"
  },
  {
    "kalla": "Arbeidstilsynet",
    "nyckel": "at_live_••••1c55",
    "kvot": "10 000",
    "anvant": 412,
    "styck": 0,
    "roterad": "20 jan 2026"
  },
  {
    "kalla": "StartBANK",
    "nyckel": "sb_live_••••7e33",
    "kvot": "5 000",
    "anvant": 298,
    "styck": 0,
    "roterad": "5 mar 2026"
  }
] as const;

export const LARM = [
  {
    "kalla": "Creditsafe Norge",
    "regel": "Felfrekvens över 5 % i 60 minuter",
    "status": "aktivt",
    "sedan": "i dag 07:20",
    "atgard": "Kontrollera om det är kvotbegränsning innan felsökning i kod"
  },
  {
    "kalla": "Creditsafe Norge",
    "regel": "Kvot över 80 % av månadstaket",
    "status": "vilande",
    "sedan": "—",
    "atgard": "Larmar vid 1 600 av 2 000 uppslag"
  },
  {
    "kalla": "Alla källor",
    "regel": "Median svarstid över 3 000 ms",
    "status": "vilande",
    "sedan": "—",
    "atgard": "Faller tillbaka på lokal data i kundappen om det slår till"
  }
] as const;

export const LEADS = [
  {
    "id": "L-041",
    "bolag": "Stavanger kommune",
    "kontakt": "Ingvild Berge",
    "epost": "ingvild.berge@stavanger.kommune.no",
    "kalla": "Landningssida",
    "status": "offert",
    "skapad": "2026-08-14",
    "nasta": "2026-08-27",
    "notis": "Offert skickad, väntar på svar från innkjøpssjef."
  },
  {
    "id": "L-040",
    "bolag": "Trondheim kommune",
    "kontakt": "Ola Sundt",
    "epost": "ola.sundt@trondheim.kommune.no",
    "kalla": "Landningssida",
    "status": "demo",
    "skapad": "2026-08-20",
    "nasta": "2026-08-29",
    "notis": "Demo hållen 26 aug. Vill se § 5k-kedjan på egna kontrakt."
  },
  {
    "id": "L-039",
    "bolag": "Kristiansand kommune",
    "kontakt": "Hanne Vik",
    "epost": "hanne.vik@kristiansand.kommune.no",
    "kalla": "Referens",
    "status": "kontaktad",
    "skapad": "2026-08-22",
    "nasta": "2026-09-03",
    "notis": "Tipsad av Bergen. Har 200+ leverantörer i bygg."
  },
  {
    "id": "L-038",
    "bolag": "Bærum kommune",
    "kontakt": "Petter Aas",
    "epost": "petter.aas@baerum.kommune.no",
    "kalla": "Landningssida",
    "status": "ny",
    "skapad": "2026-08-28",
    "nasta": "2026-08-30",
    "notis": "Fyllde i kontaktformuläret. Inte kontaktad än."
  },
  {
    "id": "L-037",
    "bolag": "Veidekke Entreprenør AS",
    "kontakt": "Marte Lunde",
    "epost": "marte.lunde@veidekke.no",
    "kalla": "Mässa",
    "status": "ny",
    "skapad": "2026-08-26",
    "nasta": "2026-08-28",
    "notis": "Privat entreprenör. Vill kontrollera egna underleverantörer."
  },
  {
    "id": "L-036",
    "bolag": "Tromsø kommune",
    "kontakt": "Eirik Nordmo",
    "epost": "eirik.nordmo@tromso.kommune.no",
    "kalla": "Landningssida",
    "status": "vunnen",
    "skapad": "2026-07-11",
    "nasta": "",
    "notis": "Signerat Standard, 3 år. Onboarding i september."
  },
  {
    "id": "L-035",
    "bolag": "Sandnes kommune",
    "kontakt": "Liv Haaland",
    "epost": "liv.haaland@sandnes.kommune.no",
    "kalla": "Referens",
    "status": "forlorad",
    "skapad": "2026-06-30",
    "nasta": "",
    "notis": "Har redan StartBANK och såg inte skillnaden. Ta upp § 5k igen om ett halvår."
  }
] as const;

export const OFFERTER = [
  {
    "id": "O-018",
    "kund": "Stavanger kommune",
    "plan": "enterprise",
    "ar": 3,
    "rabatt": 0,
    "skickad": "2026-08-14",
    "giltigTil": "2026-09-13",
    "status": "skickad"
  },
  {
    "id": "O-017",
    "kund": "Trondheim kommune",
    "plan": "standard",
    "ar": 3,
    "rabatt": 20,
    "skickad": "2026-08-01",
    "giltigTil": "2026-08-31",
    "status": "skickad"
  },
  {
    "id": "O-016",
    "kund": "Tromsø kommune",
    "plan": "standard",
    "ar": 3,
    "rabatt": 40,
    "skickad": "2026-07-02",
    "giltigTil": "2026-08-01",
    "status": "akseptert"
  },
  {
    "id": "O-015",
    "kund": "Veidekke Entreprenør AS",
    "plan": "enterprise",
    "ar": 4,
    "rabatt": 0,
    "skickad": "",
    "giltigTil": "",
    "status": "utkast"
  }
] as const;

export const PLANER = {
  "standard": {
    "namn": "Standard",
    "pris": 6900,
    "kvot": 100
  },
  "enterprise": {
    "namn": "Enterprise",
    "pris": 12900,
    "kvot": 400
  }
} as const;

export const ARENDE_STATUS = {
  "obesvarad": "Obesvarad",
  "oppna": "Pågår",
  "besvarad": "Besvarad",
  "lukket": "Stängd"
} as const;

export const FAKT_STATUS = {
  "obetald": "Obetald",
  "forfallen": "Förfallen",
  "betald": "Betald",
  "kreditnota": "Kreditnota"
} as const;

export const STATUSTEXT = {
  "ny": "Ny",
  "kontaktad": "Kontaktad",
  "demo": "Demo",
  "offert": "Offert",
  "vunnen": "Vunnen",
  "forlorad": "Förlorad",
  "utkast": "Utkast",
  "skickad": "Skickad",
  "akseptert": "Accepterad",
  "utgatt": "Utgången"
} as const;
