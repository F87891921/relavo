/**
 * Roller fra Enhetsregisteret — styre, daglig leder, revisor.
 * https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}/roller
 * Åpent og gratis, som resten av registeret.
 *
 * Eiere finnes IKKE her. Aksjonærregisteret publiseres av Skatteetaten som
 * en årlig fil, ikke som oppslag. Derfor dekker denne kontrollen styre og
 * daglig leder, og sier fra om at eiersiden ikke er sjekket.
 */
export type Rolleperson = {
  navn: string;
  rolle: string;
  /** 'styre' | 'daglig_leder' — det vi kan koble jav mot. */
  kobling: "styre" | "daglig_leder";
  fodselsdato: string | null;
};

export type Rollesvar =
  | { status: "ok"; personer: Rolleperson[] }
  | { status: "ingen" }
  | { status: "feil"; melding: string };

/** Rollegrupper vi bryr oss om. Revisor og regnskapsfører utløser ikke jav. */
const RELEVANTE: Record<string, "styre" | "daglig_leder"> = {
  STYR: "styre",
  LEDE: "daglig_leder",
  DAGL: "daglig_leder",
};

export async function hentRoller(orgnr: string): Promise<Rollesvar> {
  let svar: Response;
  try {
    svar = await fetch(
      `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}/roller`,
      { headers: { Accept: "application/json" }, next: { revalidate: 3600 } },
    );
  } catch {
    return { status: "feil", melding: "Fikk ikke kontakt med Enhetsregisteret." };
  }

  if (svar.status === 404) return { status: "ingen" };
  if (!svar.ok)
    return { status: "feil", melding: `Enhetsregisteret svarte ${svar.status}.` };

  let j: any;
  try {
    j = await svar.json();
  } catch {
    return { status: "feil", melding: "Uleselig svar fra Enhetsregisteret." };
  }

  const personer: Rolleperson[] = [];

  for (const gruppe of j?.rollegrupper ?? []) {
    const kobling = RELEVANTE[gruppe?.type?.kode];
    if (!kobling) continue;

    for (const r of gruppe?.roller ?? []) {
      // Roller kan innehas av et selskap i stedet for en person. Et selskap
      // kan ikke være inhabilt på samme måte, så de hoppes over.
      const p = r?.person;
      if (!p) continue;

      const navn = [p?.navn?.fornavn, p?.navn?.mellomnavn, p?.navn?.etternavn]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (!navn) continue;

      personer.push({
        navn,
        rolle: r?.type?.beskrivelse ?? gruppe?.type?.beskrivelse ?? "Rolle",
        kobling,
        fodselsdato: p?.fodselsdato ?? null,
      });
    }
  }

  return personer.length ? { status: "ok", personer } : { status: "ingen" };
}
