/**
 * Demodata fra prototypen, uendret. Skjermbildene er portet med det samme
 * innholdet så de kan sammenlignes side ved side med relavo-app.html.
 *
 * MERK: dette er ikke ekte data. Etter hvert som hver skjerm får sin egen
 * tabell i Postgres, byttes importen her ut med et spørring — slik
 * leverandørsiden og Ny kontroll allerede er gjort.
 */

export const SUPPLIERS = [
  {
    "org": "924118504",
    "name": "Nordvik Bygg AS",
    "risk": "hoy",
    "bransje": "Bygg og anlegg",
    "last": "12. aug 2026",
    "form": "AS",
    "ansatte": 64,
    "stiftet": "2011",
    "omsetning": "118,4 mill",
    "ek": "9,2 mill",
    "sted": "Bergen",
    "lonn": 38.2,
    "kontrakt": 96,
    "kjede": [
      "924118504",
      "918774203",
      "927331659",
      "931208446"
    ],
    "krav": [
      {
        "ref": "§ 5k",
        "s": "no",
        "t": "Tre ledd underleverandører i kontrakt K-2026-118",
        "n": "Loven tillater to. Kjeden må kortes ned før neste avrop."
      },
      {
        "ref": "§ 5g",
        "s": "ok",
        "t": "Lønn utbetales via bank",
        "n": "Bekreftet i egenerklæring 12. aug 2026"
      },
      {
        "ref": "§ 5h",
        "s": "ok",
        "t": "Lærlingekrav oppfylt",
        "n": "4 løpende lærlingkontrakter"
      },
      {
        "ref": "§ 5e",
        "s": "ok",
        "t": "Ingen restanser på skatt og merverdiavgift",
        "n": "Skatteattest 8 dager gammel"
      }
    ]
  },
  {
    "org": "918774203",
    "name": "Bergvik Anlegg AS",
    "risk": "middels",
    "bransje": "Bygg og anlegg",
    "last": "12. aug 2026",
    "form": "AS",
    "ansatte": 31,
    "stiftet": "2017",
    "omsetning": "46,1 mill",
    "ek": "3,8 mill",
    "sted": "Askøy",
    "lonn": 19.4,
    "kontrakt": 31,
    "kjede": [
      "918774203",
      "927331659",
      "915662110"
    ],
    "krav": [
      {
        "ref": "§ 5e",
        "s": "no",
        "t": "Betalingsanmerkning registrert",
        "n": "To anmerkninger, samlet 214 000 kr, siste fra juni 2026"
      },
      {
        "ref": "§ 5k",
        "s": "ok",
        "t": "To ledd underleverandører",
        "n": "Innenfor grensen"
      },
      {
        "ref": "§ 5g",
        "s": "ok",
        "t": "Lønn utbetales via bank",
        "n": "Bekreftet 12. aug 2026"
      },
      {
        "ref": "§ 5h",
        "s": "na",
        "t": "Lærlingekrav ikke aktuelt",
        "n": "Kontraktsverdi under terskel"
      }
    ]
  },
  {
    "org": "913550870",
    "name": "Solstrand Renhold AS",
    "risk": "hoy",
    "bransje": "Renhold",
    "last": "4. jul 2026",
    "form": "AS",
    "ansatte": 88,
    "stiftet": "2009",
    "omsetning": "52,7 mill",
    "ek": "1,1 mill",
    "sted": "Bergen",
    "lonn": 14.1,
    "kontrakt": 44,
    "kjede": [
      "913550870",
      "922401772",
      "929118308",
      "932774011"
    ],
    "krav": [
      {
        "ref": "§ 5k",
        "s": "no",
        "t": "Tre ledd underleverandører i renholdskontrakt",
        "n": "Renhold er omfattet av leddbegrensningen."
      },
      {
        "ref": "§ 5g",
        "s": "no",
        "t": "Lønnsutbetaling ikke dokumentert",
        "n": "Egenerklæring mangler for ledd 2 og 3"
      },
      {
        "ref": "§ 5e",
        "s": "ok",
        "t": "Ingen restanser på skatt og merverdiavgift",
        "n": "Skatteattest 4. jul 2026"
      },
      {
        "ref": "§ 5f",
        "s": "ok",
        "t": "Registrert i Arbeidstilsynets renholdsregister",
        "n": "Gyldig godkjenning"
      }
    ]
  },
  {
    "org": "916204337",
    "name": "Fjellheim Entreprenør AS",
    "risk": "lav",
    "bransje": "Bygg og anlegg",
    "last": "26. aug 2026",
    "form": "AS",
    "ansatte": 142,
    "stiftet": "2003",
    "omsetning": "287,3 mill",
    "ek": "41,6 mill",
    "sted": "Voss",
    "lonn": 94.2,
    "kontrakt": 180,
    "kjede": [
      "916204337",
      "919887249"
    ],
    "krav": [
      {
        "ref": "§ 5e",
        "s": "ok",
        "t": "Ingen restanser på skatt og merverdiavgift",
        "n": "Skatteattest 26. aug 2026"
      },
      {
        "ref": "§ 5g",
        "s": "ok",
        "t": "Lønn utbetales via bank",
        "n": "Bekreftet 26. aug 2026"
      },
      {
        "ref": "§ 5h",
        "s": "ok",
        "t": "Lærlingekrav oppfylt",
        "n": "11 løpende lærlingkontrakter"
      },
      {
        "ref": "§ 5k",
        "s": "ok",
        "t": "Ett ledd underleverandører",
        "n": "God margin til grensen"
      }
    ]
  },
  {
    "org": "927331659",
    "name": "Fossen Grunn AS",
    "risk": "middels",
    "bransje": "Grunnarbeid",
    "last": "19. aug 2026",
    "form": "AS",
    "ansatte": 19,
    "stiftet": "2021",
    "omsetning": "22,9 mill",
    "ek": "1,9 mill",
    "sted": "Os",
    "lonn": 11.8,
    "kontrakt": 18.5,
    "kjede": [
      "927331659",
      "915662110",
      "919661232"
    ],
    "krav": [
      {
        "ref": "§ 5e",
        "s": "ok",
        "t": "Ingen restanser på skatt og merverdiavgift",
        "n": "Skatteattest 19. aug 2026"
      },
      {
        "ref": "§ 5g",
        "s": "ok",
        "t": "Lønn utbetales via bank",
        "n": "Bekreftet 19. aug 2026"
      },
      {
        "ref": "§ 5h",
        "s": "no",
        "t": "Lærlingekrav ikke oppfylt",
        "n": "Ingen registrerte lærlingkontrakter i kontrakt over terskel"
      },
      {
        "ref": "§ 5k",
        "s": "ok",
        "t": "To ledd underleverandører",
        "n": "Innenfor grensen, men uten margin"
      }
    ]
  },
  {
    "org": "911776049",
    "name": "Hardanger Elektro AS",
    "risk": "lav",
    "bransje": "Elektro",
    "last": "21. aug 2026",
    "form": "AS",
    "ansatte": 57,
    "stiftet": "1998",
    "omsetning": "94,8 mill",
    "ek": "22,4 mill",
    "sted": "Odda",
    "lonn": 38.9,
    "kontrakt": 62,
    "kjede": [
      "911776049",
      "923118667"
    ],
    "krav": [
      {
        "ref": "§ 5e",
        "s": "ok",
        "t": "Ingen restanser på skatt og merverdiavgift",
        "n": "Skatteattest 21. aug 2026"
      },
      {
        "ref": "§ 5g",
        "s": "ok",
        "t": "Lønn utbetales via bank",
        "n": "Bekreftet 21. aug 2026"
      },
      {
        "ref": "§ 5h",
        "s": "ok",
        "t": "Lærlingekrav oppfylt",
        "n": "6 løpende lærlingkontrakter"
      },
      {
        "ref": "§ 5k",
        "s": "ok",
        "t": "Ett ledd underleverandører",
        "n": "God margin til grensen"
      }
    ]
  },
  {
    "org": "922401772",
    "name": "Clean Nord AS",
    "risk": "middels",
    "bransje": "Renhold",
    "last": "2. mai 2026",
    "form": "AS",
    "ansatte": 203,
    "stiftet": "2014",
    "omsetning": "141,2 mill",
    "ek": "12,7 mill",
    "sted": "Bergen",
    "lonn": 71.5,
    "kontrakt": 118,
    "kjede": [
      "922401772",
      "929118308",
      "932774011"
    ],
    "krav": [
      {
        "ref": "§ 5f",
        "s": "ok",
        "t": "Registrert i Arbeidstilsynets renholdsregister",
        "n": "Gyldig godkjenning"
      },
      {
        "ref": "§ 5e",
        "s": "ok",
        "t": "Ingen restanser på skatt og merverdiavgift",
        "n": "Skatteattest 2. mai 2026 — over 90 dager gammel"
      },
      {
        "ref": "§ 5g",
        "s": "ok",
        "t": "Lønn utbetales via bank",
        "n": "Bekreftet 2. mai 2026"
      },
      {
        "ref": "§ 5k",
        "s": "ok",
        "t": "To ledd underleverandører",
        "n": "Innenfor grensen"
      }
    ]
  },
  {
    "org": "930662119",
    "name": "Sotra Ventilasjon AS",
    "risk": "lav",
    "bransje": "VVS",
    "last": "27. aug 2026",
    "form": "AS",
    "ansatte": 24,
    "stiftet": "2019",
    "omsetning": "31,6 mill",
    "ek": "5,4 mill",
    "sted": "Straume",
    "lonn": 14.9,
    "kontrakt": 22,
    "kjede": [
      "930662119"
    ],
    "krav": [
      {
        "ref": "§ 5e",
        "s": "ok",
        "t": "Ingen restanser på skatt og merverdiavgift",
        "n": "Skatteattest 27. aug 2026"
      },
      {
        "ref": "§ 5g",
        "s": "ok",
        "t": "Lønn utbetales via bank",
        "n": "Bekreftet 27. aug 2026"
      },
      {
        "ref": "§ 5k",
        "s": "ok",
        "t": "Ingen underleverandører",
        "n": "Utfører hele kontrakten selv"
      },
      {
        "ref": "§ 5h",
        "s": "na",
        "t": "Lærlingekrav ikke aktuelt",
        "n": "Kontraktsverdi under terskel"
      }
    ]
  }
] as const;

export const ANSKAFFELSER = [
  {
    "id": "K-2026-118",
    "navn": "Rehabilitering Nygård skole",
    "type": "Åpen anbudskonkurranse",
    "verdi": "96 000 000",
    "periode": "2026–2029",
    "kontroller": 6
  },
  {
    "id": "K-2026-091",
    "navn": "Rammeavtale renhold",
    "type": "Åpen tilbudskonkurranse",
    "verdi": "44 000 000",
    "periode": "2026–2029",
    "kontroller": 4
  },
  {
    "id": "K-2026-064",
    "navn": "Elektroarbeid kommunale bygg",
    "type": "Begrenset tilbudskonkurranse",
    "verdi": "62 000 000",
    "periode": "2026–2028",
    "kontroller": 3
  },
  {
    "id": "K-2026-032",
    "navn": "Vinterdrift og brøyting sone 3",
    "type": "Åpen tilbudskonkurranse",
    "verdi": "18 500 000",
    "periode": "2026–2031",
    "kontroller": 2
  }
] as const;

export const KILDER = [
  {
    "n": "Brønnøysundregistrene",
    "d": "Enhetsregisteret — selskapsdata, roller, regnskap",
    "s": "ok",
    "w": "Svarte for 3 minutter siden"
  },
  {
    "n": "Skatteetaten",
    "d": "Skatte- og avgiftsrestanser, skatteattest",
    "s": "ok",
    "w": "Svarte for 12 minutter siden"
  },
  {
    "n": "Creditsafe Norge",
    "d": "Kreditt, betalingsanmerkninger, PEP og sanksjoner",
    "s": "ok",
    "w": "Svarte for 3 minutter siden"
  },
  {
    "n": "Arbeidstilsynet",
    "d": "Renholdsregisteret og bemanningsforetaksregisteret",
    "s": "ok",
    "w": "Svarte for 1 time siden"
  },
  {
    "n": "StartBANK",
    "d": "Prekvalifiseringsstatus bygg, anlegg og eiendom",
    "s": "ok",
    "w": "Svarte i natt"
  },
  {
    "n": "Lovdata",
    "d": "Lovtekst og forskrifter. Rettsavgjørelser er ikke API-tilgjengelig.",
    "s": "delvis",
    "w": "Synkronisert i natt"
  },
  {
    "n": "ESPD-egenerklæring",
    "d": "Leverandørens egen erklæring, inkludert straffedomsdelen",
    "s": "manuell",
    "w": "Lastes opp per anskaffelse"
  }
] as const;

export const ESPD = [
  {
    "id": "E-104",
    "fase": "tilbud",
    "org": "924118504",
    "ansk": "K-2026-118",
    "plattform": "Mercell",
    "mottatt": "14. aug 2026",
    "tilbudssum": "96 400 000",
    "status": "motstrid",
    "avvik": [],
    "signering": {
      "metode": "BankID",
      "navn": "Marte Nordvik",
      "fodt": "1981-04-**",
      "tid": "14. aug 2026, 09:12",
      "rolle": "Daglig leder",
      "signaturrett": true,
      "kilde": "Foretaksregisteret",
      "sikkerhetsniva": "Høyt (eIDAS)"
    },
    "motstrid": [
      {
        "punkt": "Underleverandører",
        "erklart": "Oppgir to ledd underleverandører",
        "register": "Kontraktsdataene viser tre ledd",
        "kilde": "Kontraktsdata · § 5k"
      }
    ]
  },
  {
    "id": "E-103",
    "fase": "tilbud",
    "org": "913550870",
    "ansk": "K-2026-091",
    "plattform": "Mercell",
    "mottatt": "6. jul 2026",
    "tilbudssum": "21 400 000",
    "status": "motstrid",
    "avvik": [
      "Alvorlige eller gjentatte brudd på bestemmelser om miljø, arbeidsforhold og sosiale forhold"
    ],
    "signering": {
      "metode": "BankID",
      "navn": "Ola Solstrand",
      "fodt": "1969-11-**",
      "tid": "6. jul 2026, 15:40",
      "rolle": "Styreleder",
      "signaturrett": true,
      "kilde": "Foretaksregisteret",
      "sikkerhetsniva": "Høyt (eIDAS)"
    },
    "motstrid": [
      {
        "punkt": "Lønn via bank",
        "erklart": "Bekrefter at lønn utbetales via bank i hele kjeden",
        "register": "Egenerklæring mangler for ledd 2 og 3",
        "kilde": "Kontraktsdata · § 5g"
      },
      {
        "punkt": "Underleverandører",
        "erklart": "Oppgir ett ledd",
        "register": "Kjeden har tre ledd",
        "kilde": "Kontraktsdata · § 5k"
      }
    ]
  },
  {
    "id": "E-102",
    "fase": "tilbud",
    "org": "918774203",
    "ansk": "K-2026-118",
    "plattform": "Mercell",
    "mottatt": "14. aug 2026",
    "tilbudssum": "88 900 000",
    "status": "mottatt",
    "avvik": [],
    "signering": {
      "metode": "BankID",
      "navn": "Hanne Bergvik",
      "fodt": "1974-07-**",
      "tid": "14. aug 2026, 08:31",
      "rolle": "Daglig leder",
      "signaturrett": true,
      "kilde": "Foretaksregisteret",
      "sikkerhetsniva": "Høyt (eIDAS)"
    },
    "motstrid": []
  },
  {
    "id": "E-101",
    "fase": "tilbud",
    "org": "922401772",
    "ansk": "K-2026-091",
    "plattform": "EU-Supply",
    "mottatt": "6. jul 2026",
    "tilbudssum": "33 800 000",
    "status": "mottatt",
    "avvik": [],
    "signering": {
      "metode": "BankID",
      "navn": "Trine Nord",
      "fodt": "1985-01-**",
      "tid": "6. jul 2026, 11:05",
      "rolle": "Daglig leder",
      "signaturrett": true,
      "kilde": "Foretaksregisteret",
      "sikkerhetsniva": "Høyt (eIDAS)"
    },
    "motstrid": []
  },
  {
    "id": "E-099",
    "fase": "tilbud",
    "org": "927331659",
    "ansk": "K-2026-032",
    "plattform": "Manuell opplasting",
    "mottatt": "18. aug 2026",
    "tilbudssum": "18 200 000",
    "status": "motstrid",
    "avvik": [],
    "signering": {
      "metode": "BankID",
      "navn": "Kjell Fossen",
      "fodt": "1977-02-**",
      "tid": "18. aug 2026, 16:31",
      "rolle": "Prosjektleder",
      "signaturrett": false,
      "kilde": "Foretaksregisteret",
      "sikkerhetsniva": "Høyt (eIDAS)"
    },
    "motstrid": [
      {
        "punkt": "Signatur",
        "erklart": "Signert av prosjektleder",
        "register": "Ikke registrert med signaturrett",
        "kilde": "Foretaksregisteret"
      }
    ]
  },
  {
    "id": "E-105",
    "fase": "lopende",
    "org": "922401772",
    "ansk": "K-2026-091",
    "plattform": "Relavo",
    "mottatt": "",
    "frist": "10. sep 2026",
    "tilbudssum": "—",
    "status": "sendt",
    "avvik": [],
    "signering": null,
    "motstrid": [],
    "utloser": "Erklæringen er eldre enn tolv måneder"
  },
  {
    "id": "E-100",
    "fase": "tilbud",
    "org": "916204337",
    "ansk": "K-2026-064",
    "plattform": "Mercell",
    "mottatt": "",
    "tilbudssum": "59 800 000",
    "status": "mangler",
    "avvik": [],
    "signering": null,
    "motstrid": []
  }
] as const;

export const SAKER = [
  {
    "id": "S-2041",
    "kategori": "Data",
    "emne": "Feil risikonivå på Solstrand Renhold",
    "gjelder": "913550870",
    "innsyn": true,
    "status": "apen",
    "opprettet": "27. aug 2026",
    "oppdatert": "i dag 09:14",
    "svar": [
      {
        "fra": "kunde",
        "navn": "Marit Aasen",
        "tid": "27. aug 2026, 14:02",
        "tekst": "Rapporten viser høy risiko, men skatteattesten vi har fått fra leverandøren er ren. Kan dere se på det?"
      },
      {
        "fra": "relavo",
        "navn": "Fred Smith",
        "tid": "i dag 09:14",
        "tekst": "Risikonivået kommer ikke fra skatteattesten, men fra § 5k — kjeden har tre ledd. Skatteattesten er registrert som ren hos oss også. Vi har lagt inn en tydeligere begrunnelse i rapportens konklusjon."
      }
    ]
  },
  {
    "id": "S-2038",
    "kategori": "Regelverk",
    "emne": "Gjelder leddgrensen også ved rammeavtale?",
    "gjelder": "",
    "innsyn": false,
    "status": "apen",
    "opprettet": "25. aug 2026",
    "oppdatert": "26. aug 2026",
    "svar": [
      {
        "fra": "kunde",
        "navn": "Marit Aasen",
        "tid": "25. aug 2026, 10:40",
        "tekst": "Vi har en rammeavtale på renhold. Teller leddene per avrop eller for avtalen samlet?"
      },
      {
        "fra": "relavo",
        "navn": "Fred Smith",
        "tid": "26. aug 2026, 08:20",
        "tekst": "Vi kan ikke gi juridisk råd, men slik verktøyet regner: leddene telles per kontrakt, altså per avrop. Vi har lagt inn en lenke til DFØs veileder i rapporten. Ta det gjerne videre med egen jurist."
      }
    ]
  },
  {
    "id": "S-2030",
    "kategori": "Faktura",
    "emne": "Trenger fakturaen merket med rekvisisjonsnummer",
    "gjelder": "",
    "innsyn": false,
    "status": "lukket",
    "opprettet": "14. aug 2026",
    "oppdatert": "15. aug 2026",
    "svar": [
      {
        "fra": "kunde",
        "navn": "Marit Aasen",
        "tid": "14. aug 2026, 11:12",
        "tekst": "Kan dere legge inn rekvisisjonsnummer på fakturaene våre?"
      },
      {
        "fra": "relavo",
        "navn": "Milad",
        "tid": "15. aug 2026, 09:05",
        "tekst": "Lagt inn på kontoen. Gjelder fra neste faktura."
      }
    ]
  },
  {
    "id": "S-2022",
    "kategori": "Tilgang",
    "emne": "Ny saksbehandler trenger tilgang",
    "gjelder": "",
    "innsyn": false,
    "status": "lukket",
    "opprettet": "2. aug 2026",
    "oppdatert": "2. aug 2026",
    "svar": [
      {
        "fra": "kunde",
        "navn": "Marit Aasen",
        "tid": "2. aug 2026, 13:30",
        "tekst": "Kan dere opprette bruker for ny kollega?"
      },
      {
        "fra": "relavo",
        "navn": "Ibbe",
        "tid": "2. aug 2026, 15:11",
        "tekst": "Opprettet. Invitasjon er sendt."
      }
    ]
  }
] as const;

export const UTLOSERE = [
  {
    "org": "924118504",
    "type": "rolle",
    "alvor": "hoy",
    "hva": "Ny daglig leder registrert i Foretaksregisteret",
    "nar": "24. aug 2026",
    "hvorfor": "Erklæringen fra 21. aug er signert av forrige daglig leder. Den binder ikke lenger selskapet."
  },
  {
    "org": "913550870",
    "type": "kjede",
    "alvor": "hoy",
    "hva": "Nytt ledd lagt til i leverandørkjeden",
    "nar": "27. aug 2026",
    "hvorfor": "Rein Service AS er ny i kjeden og har ingen egenerklæring. Kjeden er samtidig over grensen i § 5k."
  },
  {
    "org": "918774203",
    "type": "okonomi",
    "alvor": "middels",
    "hva": "Betalingsanmerkning registrert",
    "nar": "22. aug 2026",
    "hvorfor": "Forholdet kan berøre svarene på § 24-2 tredje ledd. Be om oppdatert erklæring."
  },
  {
    "org": "922401772",
    "type": "alder",
    "alvor": "middels",
    "hva": "Erklæringen er eldre enn tolv måneder",
    "nar": "2. sep 2026",
    "hvorfor": "Rutinemessig fornyelse. Ingen kjent endring i selskapet."
  },
  {
    "org": "916204337",
    "type": "tildeling",
    "alvor": "lav",
    "hva": "Tildeling forberedes i K-2026-064",
    "nar": "1. sep 2026",
    "hvorfor": "Fersk erklæring bør ligge til grunn for tildelingsbeslutningen."
  }
] as const;

export const KJORINGER = [
  {
    "org": "930662119",
    "t": "27. aug 2026, 06:02",
    "how": "Automatisk, månedlig",
    "res": "lav"
  },
  {
    "org": "916204337",
    "t": "26. aug 2026, 06:02",
    "how": "Automatisk, månedlig",
    "res": "lav"
  },
  {
    "org": "911776049",
    "t": "21. aug 2026, 14:31",
    "how": "Manuell, Fred Smith",
    "res": "lav"
  },
  {
    "org": "927331659",
    "t": "19. aug 2026, 06:02",
    "how": "Automatisk, månedlig",
    "res": "middels"
  },
  {
    "org": "924118504",
    "t": "12. aug 2026, 09:47",
    "how": "Manuell, Fred Smith",
    "res": "hoy"
  }
] as const;

export const SAK_STATUS = {
  "apen": "Åpen",
  "venter": "Venter på deg",
  "lukket": "Lukket"
} as const;

export const ESPD_STATUS = {
  "mottatt": "Uten merknad",
  "motstrid": "Motstrid mot registrene",
  "mangler": "Ikke levert",
  "sendt": "Venter på svar",
  "utlopt": "Fristen er ute"
} as const;

export const ESPD_FASE = {
  "tilbud": "Med tilbudet",
  "lopende": "Etter signering"
} as const;

export const HANDLING = [
  {
    "org": "913550870",
    "sev": "red",
    "why": "Tre ledd underleverandører — brudd på § 5k",
    "when": "I dag"
  },
  {
    "org": "924118504",
    "sev": "red",
    "why": "Tre ledd underleverandører — brudd på § 5k",
    "when": "I dag"
  },
  {
    "org": "918774203",
    "sev": "yellow",
    "why": "Betalingsanmerkning registrert i juni",
    "when": "2 dager"
  },
  {
    "org": "927331659",
    "sev": "yellow",
    "why": "Lærlingekrav etter § 5h ikke oppfylt",
    "when": "4 dager"
  },
  {
    "org": "922401772",
    "sev": "yellow",
    "why": "Kontroll eldre enn 90 dager",
    "when": "1 uke"
  }
] as const;

export const KJOR_STEG = [
  "Enhetsregisteret, Brønnøysund",
  "Skatte- og avgiftsrestanser",
  "Kreditt og betalingsanmerkninger",
  "Sanksjons- og PEP-lister",
  "Leddkjede mot § 5k",
  "Avvisningsgrunner § 24-2"
] as const;
