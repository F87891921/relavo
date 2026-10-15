/**
 * Oppslag mot Enhetsregisteret. API-et er åpent, gratis og krever ingen
 * nøkkel — https://data.brreg.no/enhetsregisteret/api
 *
 * Vi henter bare det kontrollen faktisk bruker. Konkurs, avvikling og
 * tvangsavvikling er de tre flaggene som direkte utløser avvisningsgrunner
 * etter anskaffelsesforskriften § 24-2.
 */
export type Enhet = {
  orgnr: string;
  navn: string;
  form: string | null;
  bransje: string | null;
  sted: string | null;
  ansatte: number | null;
  registrert: string | null;
  konkurs: boolean;
  underAvvikling: boolean;
  underTvangsavvikling: boolean;
  /** Satt når det oppgitte nummeret var et bedriftsnummer (underenhet). */
  fraBedrift?: { nr: string; navn: string; sted: string | null } | null;
};

export type Oppslag =
  | { status: "funnet"; enhet: Enhet }
  | { status: "ikke-funnet" }
  | { status: "feil"; melding: string };

export async function slaOppEnhet(orgnr: string): Promise<Oppslag> {
  const url = `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`;

  let svar: Response;
  try {
    svar = await fetch(url, {
      headers: { Accept: "application/json" },
      // Registeret endrer seg sjelden, men en kontroll skal vise dagens
      // tilstand — derfor kort cache, ikke ingen.
      next: { revalidate: 300 },
    });
  } catch {
    return {
      status: "feil",
      // Nøkkel, ikke tekst. Modulen importeres også av en klientkomponent,
      // så den kan ikke slå opp i ordboka selv — da ville next/headers
      // havnet i nettleserbunten.
      melding: "brregIngenKontakt",
    };
  }

  if (svar.status === 404) return { status: "ikke-funnet" };
  if (!svar.ok) {
    return {
      status: "feil",
      melding: `brregSvarte:${svar.status}`,
    };
  }

  let j: Record<string, unknown>;
  try {
    j = await svar.json();
  } catch {
    return { status: "feil", melding: "brregUleselig" };
  }

  const hent = (o: unknown, n: string) =>
    o && typeof o === "object" ? ((o as Record<string, unknown>)[n] ?? null) : null;

  return {
    status: "funnet",
    enhet: {
      orgnr: String(j.organisasjonsnummer ?? orgnr),
      navn: String(j.navn ?? ""),
      form: (hent(j.organisasjonsform, "beskrivelse") as string) ?? null,
      bransje: (hent(j.naeringskode1, "beskrivelse") as string) ?? null,
      sted: (hent(j.forretningsadresse, "poststed") as string) ?? null,
      ansatte: typeof j.antallAnsatte === "number" ? j.antallAnsatte : null,
      registrert: (j.registreringsdatoEnhetsregisteret as string) ?? null,
      konkurs: j.konkurs === true,
      underAvvikling: j.underAvvikling === true,
      underTvangsavvikling: j.underTvangsavviklingEllerTvangsopplosning === true,
    },
  };
}

/**
 * Slår opp et nummer som organisasjonsnummer, og hvis det ikke finnes, som
 * bedriftsnummer (underenhet).
 *
 * En bedrift er en avdeling eller et sted en virksomhet driver fra, og den
 * har sitt eget nummer. Det er ikke den som er avtalepart eller kan gå
 * konkurs: kontrollen gjøres på hovedenheten (den juridiske enheten), og
 * bedriften det ble søkt på noteres på resultatet.
 */
export async function slaOppOrgEllerBedrift(nr: string): Promise<Oppslag> {
  const direkte = await slaOppEnhet(nr);
  if (direkte.status !== "ikke-funnet") return direkte;

  let svar: Response;
  try {
    svar = await fetch(`https://data.brreg.no/enhetsregisteret/api/underenheter/${nr}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
  } catch {
    return { status: "feil", melding: "brregIngenKontakt" };
  }
  if (svar.status === 404) return { status: "ikke-funnet" };
  if (!svar.ok) return { status: "feil", melding: `brregSvarte:${svar.status}` };

  const j = (await svar.json().catch(() => null)) as Record<string, unknown> | null;
  const overordnet = j && typeof j.overordnetEnhet === "string" ? j.overordnetEnhet : null;
  if (!j || !overordnet) return { status: "ikke-funnet" };

  const hoved = await slaOppEnhet(overordnet);
  if (hoved.status !== "funnet") return hoved;

  const adr = j.beliggenhetsadresse && typeof j.beliggenhetsadresse === "object" ? (j.beliggenhetsadresse as Record<string, unknown>) : null;
  return {
    status: "funnet",
    enhet: {
      ...hoved.enhet,
      fraBedrift: { nr, navn: String(j.navn ?? ""), sted: adr ? String(adr.poststed ?? "") || null : null },
    },
  };
}
