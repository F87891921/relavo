/**
 * Kildene kontrollen faktisk bruker.
 *
 * Lista har vært demodata med anropstall, svartider og feilprosenter. Vi
 * måler ingen av delene — det fantes ingen telemetri bak tallene, og en
 * driftsside som finner på sine egne målinger er verre enn ingen
 * driftsside: den ser ut som et varsel som ville kommet hvis noe var galt.
 *
 * Det vi vet er hvilke kilder vi bruker, hvordan de nås, hva de koster, og
 * for de som synkroniseres: når de sist ble hentet. Resten står som ikke
 * målt.
 */
export type Kilde = {
  navn: string;
  gir: string;
  /** Hvordan vi når den. Det er dette som avgjør hva som kan gå galt. */
  vei: "oppslag" | "synk" | "leverandor" | "mangler";
  /** NOK per oppslag. 0 er gratis, null er ukjent fordi vi ikke har avtale. */
  kostnad: number | null;
  /** Raden i integrasjoner eller registersynk, når den finnes. */
  synknavn?: string;
  merknad?: string;
};

export const KILDER: Kilde[] = [
  {
    navn: "Enhetsregisteret",
    gir: "Selskapsdata, konkurs, avvikling",
    vei: "oppslag",
    kostnad: 0,
    merknad: "Åpent API hos Brønnøysundregistrene. Slås opp per kontroll.",
  },
  {
    navn: "Enhetsregisteret — roller",
    gir: "Styre og daglig leder",
    vei: "oppslag",
    kostnad: 0,
    merknad: "Grunnlaget for jav-kontrollen og for rollescreeningen mot sanksjonslista.",
  },
  {
    navn: "Arbeidstilsynets renholdsregister",
    gir: "Godkjenning for renhold",
    vei: "synk",
    kostnad: 0,
    synknavn: "renhold",
    merknad:
      "Publiseres bare som samlefil på 22 MB; den regenereres 02.00 hver natt, så en daglig kopi er likt med kilden.",
  },
  {
    navn: "DiBK sentral godkjenning",
    gir: "Godkjenningsområder, lærebedrift",
    vei: "oppslag",
    kostnad: 0,
    merknad:
      "Ordningen er frivillig siden 2016. Å ikke stå der er ikke et avvik.",
  },
  {
    navn: "EUs sanksjonsliste",
    gir: "Treff på selskap og roller",
    vei: "synk",
    kostnad: 0,
    synknavn: "sanksjoner",
    merknad: "Konsolidert liste, 25,8 MB XML. Synkes ukentlig.",
  },
  {
    navn: "Skatteattest",
    gir: "Skatt og merverdiavgift, § 5i",
    vei: "leverandor",
    kostnad: 0,
    merknad:
      "Utleveres til selskapet selv, ikke til oss. Leverandøren laster den opp på ettersendingssiden.",
  },
  {
    navn: "Aksjonærregisteret",
    gir: "Eiere, til jav-kontrollen",
    vei: "mangler",
    kostnad: null,
    merknad:
      "Skatteetaten utleverer det som årlig fil etter søknad, med nedlastingslenke som varer i én uke. Brønnøysunds register over reelle rettighetshavere krever Maskinporten-scope som tildeles offentlige myndigheter, media, sivilsamfunn og høyere utdanning.",
  },
  {
    navn: "Creditsafe",
    gir: "Kredittvurdering, PEP",
    vei: "mangler",
    kostnad: null,
    merknad: "Tilbud ikke mottatt. Står som ikke hentet på hver rapport.",
  },
  {
    navn: "StartBANK",
    gir: "Prekvalifisering",
    vei: "mangler",
    kostnad: null,
    merknad: "Ingen avtale. Står som ikke hentet på hver rapport.",
  },
];
