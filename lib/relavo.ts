/**
 * Selskapet bak Relavo, ett sted.
 *
 * Relavo er produktnavnet. Avtaleparten er et annet navn, og det er den
 * forskjellen som gjør at dette må stå ett sted og ikke tre: et tilbud, en
 * avtale og en personvernerklæring som oppgir hver sin part, er tre
 * dokumenter en motpart kan bestride.
 *
 * Opplysningene er hentet fra firmaattesten (Brønnøysund, 9. oktober 2026).
 *
 * Et NUF er en filial, ikke et eget rettssubjekt. Rettssubjektet er det
 * svenske aksjebolaget; NUF-et er dets norske avdeling. Derfor oppgis
 * begge der det har rettslig betydning — avtalepart, behandlingsansvarlig
 * og fakturautsteder — og bare det korte navnet der det bare skal stå hvem
 * som sender noe.
 */
export const RELAVO = {
  /** Produktet. Ikke et selskapsnavn. */
  produkt: "Relavo",

  /** Den norske avdelingen. Det er denne som står i norske registre. */
  navn: "LOD TECH AB NUF",
  orgNr: "938518858",

  /** Rettssubjektet. Svensk aksjebolag, registrert hos Bolagsverket. */
  morNavn: "LOD TECH AB",
  morOrgNr: "559471-0419",

  adresse: "Tomtbergavägen 82, SE-145 75 Norsborg, Sverige",
  epost: process.env.NEXT_PUBLIC_RELAVO_EPOST?.trim() || "post@relavo.no",
  nett: "relavo.no",

  /** Signaturrett og daglig leder, ifølge firmaattesten. */
  signatur: "Milad Yalda Korkis",
} as const;

/** 938 518 858 — lesbart, slik det står i registeret. */
export const relavoOrgNr = () =>
  RELAVO.orgNr.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

/**
 * Hele avtaleparten, slik den skal stå i et dokument som binder noen.
 * Både filialen og rettssubjektet, fordi det er filialen som er registrert
 * i Norge og aksjebolaget som faktisk er part.
 */
export const avtalepart = () =>
  `${RELAVO.navn}, org.nr ${relavoOrgNr()}, norsk avdeling av ` +
  `${RELAVO.morNavn}, org.nr ${RELAVO.morOrgNr}, ${RELAVO.adresse}`;
