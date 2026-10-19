import type { Indikator } from "@/lib/indikatorer";

/**
 * Proff Premium Credit API: kredittrating og betalingsanmerkninger.
 *
 * Nøkkelen (PROFF_CREDIT_TOKEN) ligger bare i miljøet. Er den ikke satt, eller
 * svarer Proff med feil, kommer det ingen indikasjoner herfra. Rapporten skal
 * da ikke late som den har sjekket noe, så vi legger heller ingen «ok»-linje.
 *
 * Dataene kommer fra Proff, ikke fra et offentlig register, og står merket slik.
 * Resultatet lagres i kontrollen (Supabase, eu-central-1), som Proffs vilkår
 * krever for lagring innenfor EU/EØS.
 */
const BASE = "https://ppc.proff.no";

type Rating = {
  rating?: string;
  ratingScore?: number;
  creditLimit?: number;
  probabilityOfBankruptcy?: number;
  updated?: string;
  paymentRemarks?: { hasRemarks?: boolean; hasVoluntaryMortgages?: boolean; hasCompulsoryMortgages?: boolean };
};

async function hent<T>(sti: string, nokkel: string): Promise<T | null> {
  try {
    const r = await fetch(`${BASE}${sti}`, {
      headers: { Authorization: `Token ${nokkel}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const proffOppsatt = () => Boolean(process.env.PROFF_CREDIT_TOKEN);

/** Indikasjoner fra Proff for et organisasjonsnummer. Tom liste hvis ikke hentet. */
export async function proffIndikatorer(orgnr: string): Promise<Indikator[]> {
  const nokkel = process.env.PROFF_CREDIT_TOKEN;
  if (!nokkel) return [];

  const r = await hent<Rating>(`/CreditRating/${orgnr}`, nokkel);
  if (!r) return [];

  const ut: Indikator[] = [];
  const dato = r.updated ? new Date(r.updated).toLocaleDateString("nb-NO") : null;

  if (r.rating)
    ut.push({
      id: "proff-rating",
      niva: "info",
      tittel: `Kredittrating hos Proff: ${r.rating}`,
      tekst:
        `Proff vurderer selskapet til ${r.rating}` +
        (r.ratingScore != null ? ` (score ${r.ratingScore})` : "") +
        (r.probabilityOfBankruptcy != null
          ? `, konkurssannsynlighet ${(r.probabilityOfBankruptcy * 100).toFixed(1)} %`
          : "") +
        `. Kilde: Proff${dato ? `, oppdatert ${dato}` : ""}. Dette er en vurdering fra et kredittbyrå, ikke en offentlig kilde.`,
    });

  const p = r.paymentRemarks;
  if (p?.hasRemarks)
    ut.push({
      id: "proff-betalingsanmerkninger",
      niva: "varsel",
      tittel: "Betalingsanmerkninger registrert",
      tekst: `Proff har registrert betalingsanmerkninger på selskapet. Kilde: Proff${dato ? `, ${dato}` : ""}.`,
    });
  if (p?.hasCompulsoryMortgages)
    ut.push({
      id: "proff-tvangspant",
      niva: "varsel",
      tittel: "Tvangspant registrert",
      tekst: `Proff har registrert pant ved tvang (for eksempel utlegg). Kilde: Proff${dato ? `, ${dato}` : ""}.`,
    });

  return ut;
}
