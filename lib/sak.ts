export const KATEGORIER = [
  { verdi: "data", tekst: "Data i en rapport" },
  { verdi: "kontroll", tekst: "En kontroll som feilet" },
  { verdi: "faktura", tekst: "Faktura og abonnement" },
  { verdi: "teknisk", tekst: "Teknisk problem" },
  { verdi: "annet", tekst: "Annet" },
] as const;

export const STATUSER = [
  { verdi: "apen", tekst: "Åpen" },
  { verdi: "venter_oss", tekst: "Venter på oss" },
  { verdi: "venter_kunde", tekst: "Venter på kunden" },
  { verdi: "lukket", tekst: "Lukket" },
] as const;

export const KONTAKT_KATEGORIER = [
  { verdi: "demo", tekst: "Vil se en demo" },
  { verdi: "priser", tekst: "Spørsmål om priser" },
  { verdi: "teknisk", tekst: "Teknisk spørsmål" },
  { verdi: "personvern", tekst: "Personvern og databehandling" },
  { verdi: "annet", tekst: "Annet" },
] as const;

export const kategoriTekst = (v: string) =>
  KATEGORIER.find((k) => k.verdi === v)?.tekst ?? v;

export const statusTekst = (v: string) =>
  STATUSER.find((s) => s.verdi === v)?.tekst ?? v;

export const kontaktKategoriTekst = (v: string) =>
  KONTAKT_KATEGORIER.find((k) => k.verdi === v)?.tekst ?? v;
