import type { Arsregnskap } from "@/lib/regnskap";

/**
 * Nøkkeltall for en leverandør, fra innleverte årsregnskap i Regnskapsregisteret.
 *
 * Lagres i kontrollen som et øyeblikksbilde, så rapporten viser det som var
 * kjent da den ble kjørt. Ingenting her er en vurdering: tallene vises som de
 * er, og kvotene er enkel aritmetikk av dem.
 */
export type NokkeltallAr = {
  aar: number;
  omsetning: number | null;
  driftsresultat: number | null;
  aarsresultat: number | null;
  egenkapital: number | null;
  gjeld: number | null;
  eiendeler: number | null;
  /** Prosent, én desimal. Null når grunnlaget mangler. */
  vekst: number | null;
  driftsmargin: number | null;
  egenkapitalandel: number | null;
};

export type Nokkeltall = {
  kilde: string;
  hentet: string;
  ansatte: number | null;
  omsetningPerAnsatt: number | null;
  ar: NokkeltallAr[];
};

const pst = (a: number | null, b: number | null) =>
  a == null || b == null || b === 0 ? null : Math.round((a / b) * 1000) / 10;

export function lagNokkeltall(regnskap: Arsregnskap[], ansatte: number | null, na = new Date()): Nokkeltall {
  const kilde = "Regnskapsregisteret (Brønnøysundregistrene), innleverte årsregnskap";
  if (!regnskap.length)
    return { kilde, hentet: na.toISOString(), ansatte, omsetningPerAnsatt: null, ar: [] };

  const sortert = [...regnskap].sort((a, b) => b.aar - a.aar).slice(0, 4);
  const ar: NokkeltallAr[] = sortert.map((r, i) => {
    const forrige = sortert[i + 1]?.aar === r.aar - 1 ? sortert[i + 1] : null;
    const vekst =
      r.driftsinntekter != null && forrige?.driftsinntekter
        ? Math.round(((r.driftsinntekter - forrige.driftsinntekter) / Math.abs(forrige.driftsinntekter)) * 1000) / 10
        : null;
    return {
      aar: r.aar,
      omsetning: r.driftsinntekter,
      driftsresultat: r.driftsresultat,
      aarsresultat: r.aarsresultat,
      egenkapital: r.egenkapital,
      gjeld: r.gjeld,
      eiendeler: r.eiendeler,
      vekst,
      driftsmargin: pst(r.driftsresultat, r.driftsinntekter),
      egenkapitalandel: pst(r.egenkapital, r.eiendeler),
    };
  });

  const nyeste = ar[0];
  return {
    kilde,
    hentet: na.toISOString(),
    ansatte,
    omsetningPerAnsatt:
      ansatte && nyeste.omsetning != null ? Math.round(nyeste.omsetning / ansatte) : null,
    ar,
  };
}
