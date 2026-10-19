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

type Svar<T> = { status: "ok"; data: T } | { status: "ingen" } | { status: "feil" };

async function hent<T>(sti: string, nokkel: string): Promise<Svar<T>> {
  try {
    const r = await fetch(`${BASE}${sti}`, {
      headers: { Authorization: `Token ${nokkel}`, Accept: "application/json" },
      cache: "no-store",
    });
    // 204: Proff har ingen rating, eller selskapet finnes ikke hos dem.
    if (r.status === 204) return { status: "ingen" };
    if (!r.ok) return { status: "feil" };
    return { status: "ok", data: (await r.json()) as T };
  } catch {
    return { status: "feil" };
  }
}

export const proffOppsatt = () => Boolean(process.env.PROFF_CREDIT_TOKEN);

/**
 * Indikasjoner fra Proff for et organisasjonsnummer.
 *
 * Kunden har betalt for rapporten, så den skal alltid si hva som skjedde:
 * hentet, ingen data hos Proff, eller kunne ikke hentes. Bare når nøkkelen
 * ikke er satt (funksjonen er ikke slått på) står det ingenting.
 */
export async function proffIndikatorer(orgnr: string): Promise<Indikator[]> {
  const nokkel = process.env.PROFF_CREDIT_TOKEN;
  if (!nokkel) return [];

  const svar = await hent<Rating>(`/CreditRating/${orgnr}`, nokkel);

  if (svar.status === "ingen")
    return [
      {
        id: "proff-ingen-data",
        niva: "info",
        tittel: "Ingen kredittrating registrert",
        tekst:
          "Kredittopplysningsleverandøren har ingen kredittrating eller betalingsanmerkninger registrert på dette selskapet. Det er vanlig for nye selskaper og de som er små. Det betyr at vi ikke kan si noe om kreditt fra denne kilden, ikke at selskapet har god eller dårlig kreditt.",
      },
    ];

  if (svar.status === "feil")
    return [
      {
        id: "proff-feil",
        niva: "info",
        tittel: "Kredittdata kunne ikke hentes",
        tekst:
          "Vi fikk ikke svar fra kredittopplysningsleverandøren da kontrollen ble kjørt. Resten av rapporten er ikke berørt. Kjør kontrollen på nytt senere for å få med kredittdata.",
      },
    ];

  const r = svar.data;
  const ut: Indikator[] = [];
  const dato = r.updated ? new Date(r.updated).toLocaleDateString("nb-NO") : null;

  if (r.rating)
    ut.push({
      id: "proff-rating",
      niva: "info",
      tittel: `Kredittrating: ${r.rating}`,
      tekst:
        `Kredittopplysningsleverandøren vurderer selskapet til ${r.rating}` +
        (r.ratingScore != null ? ` (score ${r.ratingScore})` : "") +
        (r.probabilityOfBankruptcy != null
          ? `, konkurssannsynlighet ${(r.probabilityOfBankruptcy * 100).toFixed(1)} %`
          : "") +
        `. Kilde: kredittopplysningsleverandør${dato ? `, oppdatert ${dato}` : ""}. Dette er en vurdering fra et kredittbyrå, ikke en offentlig kilde.`,
    });

  const p = r.paymentRemarks;
  if (p?.hasRemarks)
    ut.push({
      id: "proff-betalingsanmerkninger",
      niva: "varsel",
      tittel: "Betalingsanmerkninger registrert",
      tekst: `Det er registrert betalingsanmerkninger på selskapet. Kilde: kredittopplysningsleverandør${dato ? `, ${dato}` : ""}.`,
    });
  if (p && !p.hasRemarks && !p.hasCompulsoryMortgages)
    ut.push({
      id: "proff-ingen-anmerkninger",
      niva: "info",
      tittel: "Ingen betalingsanmerkninger registrert",
      tekst: `Det er ikke registrert betalingsanmerkninger eller tvangspant på selskapet. Kilde: kredittopplysningsleverandør${dato ? `, ${dato}` : ""}.`,
    });
  if (p?.hasCompulsoryMortgages)
    ut.push({
      id: "proff-tvangspant",
      niva: "varsel",
      tittel: "Tvangspant registrert",
      tekst: `Det er registrert pant ved tvang (for eksempel utlegg). Kilde: kredittopplysningsleverandør${dato ? `, ${dato}` : ""}.`,
    });

  return ut;
}
