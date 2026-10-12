/**
 * Roller fra Enhetsregisteret — styre, daglig leder, revisor.
 * https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}/roller
 * Åpent og gratis, som resten av registeret.
 *
 * Eiere finnes IKKE her, og de finnes ikke noe sted vi kommer til:
 * Aksjonærregisteret utleveres av Skatteetaten som en årlig fil etter
 * søknad, og Brønnøysunds register over reelle rettighetshavere ligger bak
 * et Maskinporten-scope som tildeles offentlige myndigheter, media,
 * sivilsamfunn og høyere utdanning — prøvd 11. oktober 2026, 401 på samtlige
 * endepunkter, også kodelistene som dokumentasjonen kaller åpne.
 *
 * Derfor dekker denne kontrollen styre og daglig leder, og sier fra om at
 * eiersiden ikke er sjekket.
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
  /** Enheten finnes, men har ingen roller vi kan krysse mot. */
  | { status: "ingen" }
  /** Enhetsregisteret kjenner ikke organisasjonsnummeret i det hele tatt. */
  | { status: "ukjent" }
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

  // 404 betyr at nummeret ikke finnes i registeret — ikke at selskapet
  // finnes uten styre. Slås de to sammen, svarer jav-kontrollen «ingen
  // roller registrert» på et feilskrevet eller slettet organisasjonsnummer,
  // og det leses som en bestått kontroll. Det er den verste måten å ta feil
  // på: kontrollen ser utført ut uten å ha vært det.
  if (svar.status === 404) return { status: "ukjent" };
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
