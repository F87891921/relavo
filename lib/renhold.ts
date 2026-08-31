/**
 * Arbeidstilsynets renholdsregister.
 * https://registerdata.arbeidstilsynet.no/renhold_register.xml — NLOD 2.0,
 * åpent uten nøkkel, oppdateres hver morgen.
 *
 * Siden 2012 er det ulovlig å kjøpe renholdstjenester fra selskaper som ikke
 * står som godkjent her. Registeret inneholder også de som IKKE er godkjent,
 * så et treff må aldri leses som en godkjenning.
 */
export const RENHOLD_URL =
  "https://registerdata.arbeidstilsynet.no/renhold_register.xml";

export type Renholdsstatus =
  | { status: "godkjent"; tekst: string; navn: string }
  | { status: "ikke_godkjent"; tekst: string; navn: string }
  | { status: "under_behandling"; tekst: string; navn: string }
  | { status: "ikke_i_registeret" };

/** Ordlyden fra Arbeidstilsynet, oversatt til det ene som betyr noe. */
export function tolkStatus(tekst: string): "godkjent" | "ikke_godkjent" | "under_behandling" {
  const t = tekst.toLowerCase();
  if (t.startsWith("godkjent")) return "godkjent";
  if (t.includes("under behandling")) return "under_behandling";
  return "ikke_godkjent";
}

export type Virksomhet = {
  org_nr: string;
  navn: string;
  organisasjonsform: string | null;
  status: string;
  godkjent: boolean;
  poststed: string | null;
  kommune: string | null;
};

/**
 * Plukker feltene ut av XML-en med regex i stedet for en parser.
 *
 * Filen er 22 MB og strukturen er flat og forutsigbar — én <Virksomhet> med
 * én <Hovedenhet>, ingen nøsting av samme navn. Å dra inn en XML-parser for
 * seks felt ville vært en avhengighet uten dekning i behovet.
 */
export function parseRenhold(xml: string): Virksomhet[] {
  const ut: Virksomhet[] = [];

  const felt = (blokk: string, navn: string): string | null => {
    const m = blokk.match(new RegExp(`<${navn}>([^<]*)</${navn}>`));
    const v = m?.[1]?.trim();
    return v ? v : null;
  };

  const blokker = xml.split("<Virksomhet>").slice(1);

  for (const rå of blokker) {
    const blokk = rå.split("</Virksomhet>")[0];

    const orgNr = felt(blokk, "Organisasjonsnummer");
    const navn = felt(blokk, "Navn");
    const status = felt(blokk, "Godkjenningsstatus");
    if (!orgNr || !navn || !status) continue;

    // Forretningsadressen står etter postadressen, som ofte er tom. Vi tar
    // det siste ikke-tomme treffet, ellers blir stedet stående blankt.
    const steder = [...blokk.matchAll(/<Poststed>([^<]*)<\/Poststed>/g)]
      .map((m) => m[1].trim())
      .filter(Boolean);
    const kommuner = [...blokk.matchAll(/<Kommunenavn>([^<]*)<\/Kommunenavn>/g)]
      .map((m) => m[1].trim())
      .filter(Boolean);

    ut.push({
      org_nr: orgNr,
      navn,
      organisasjonsform: felt(blokk, "Organisasjonsform"),
      status,
      godkjent: tolkStatus(status) === "godkjent",
      poststed: steder.at(-1) ?? null,
      kommune: kommuner.at(-1) ?? null,
    });
  }

  return ut;
}

/** Næringskodene registeret selv filtrerer på. */
export function erRenholdsbransje(bransje: string | null | undefined): boolean {
  if (!bransje) return false;
  const b = bransje.toLowerCase();
  return b.includes("rengjøring") || b.includes("renhold");
}
