/**
 * Regnskapsregisteret — https://data.brreg.no/regnskapsregisteret
 * Åpent og gratis, som Enhetsregisteret. Gir innleverte årsregnskap.
 *
 * Ikke alle enheter har regnskap her: enkeltpersonforetak under terskelen,
 * kommuner og nystiftede selskaper mangler ofte. Det er ikke en feil, og
 * skal ikke framstilles som en — det står som «ikke levert» i vurderingen.
 */
export type Arsregnskap = {
  aar: number;
  valuta: string;
  driftsinntekter: number | null;
  driftsresultat: number | null;
  aarsresultat: number | null;
  egenkapital: number | null;
  gjeld: number | null;
  eiendeler: number | null;
};

const tall = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

export async function hentRegnskap(orgnr: string): Promise<Arsregnskap[]> {
  let svar: Response;
  try {
    svar = await fetch(
      `https://data.brreg.no/regnskapsregisteret/regnskap/${orgnr}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 3600 } },
    );
  } catch {
    return [];
  }
  if (!svar.ok) return [];

  let j: unknown;
  try {
    j = await svar.json();
  } catch {
    return [];
  }
  if (!Array.isArray(j)) return [];

  return j
    .map((r: Record<string, any>) => ({
      aar: Number(String(r?.regnskapsperiode?.fraDato ?? "").slice(0, 4)) || 0,
      valuta: String(r?.valuta ?? "NOK"),
      driftsinntekter: tall(
        r?.resultatregnskapResultat?.driftsresultat?.driftsinntekter
          ?.sumDriftsinntekter,
      ),
      driftsresultat: tall(
        r?.resultatregnskapResultat?.driftsresultat?.driftsresultat,
      ),
      aarsresultat: tall(r?.resultatregnskapResultat?.aarsresultat),
      egenkapital: tall(r?.egenkapitalGjeld?.egenkapital?.sumEgenkapital),
      gjeld: tall(r?.egenkapitalGjeld?.gjeldOversikt?.sumGjeld),
      eiendeler: tall(r?.eiendeler?.sumEiendeler),
    }))
    .filter((r) => r.aar > 0)
    .sort((a, b) => b.aar - a.aar);
}
