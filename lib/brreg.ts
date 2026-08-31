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
      melding: "Fikk ikke kontakt med Enhetsregisteret.",
    };
  }

  if (svar.status === 404) return { status: "ikke-funnet" };
  if (!svar.ok) {
    return {
      status: "feil",
      melding: `Enhetsregisteret svarte ${svar.status}.`,
    };
  }

  let j: Record<string, unknown>;
  try {
    j = await svar.json();
  } catch {
    return { status: "feil", melding: "Uleselig svar fra Enhetsregisteret." };
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
