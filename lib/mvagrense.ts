import { admin } from "@/lib/supabase/admin";

/**
 * Omsetning de siste 12 månedene mot mva-grensen.
 *
 * Under 50 000 kr på 12 måneder må vi ikke være momsregistrert, og tar
 * ikke ut mva. Passerer vi, må vi registrere oss, så grensen vaktes her.
 * Tallene er netto (uten mva) og består av kortbetalinger fra Stripe og
 * fakturaene våre. Dette er en varsellampe, ikke regnskap: revisoren
 * avgjør hva som teller i avgiftspliktig omsetning.
 */
export const MVA_GRENSE = 50_000;
export const MVA_VARSEL = 40_000;

export type Omsetning = { stripe: number; faktura: number; totalt: number; grense: number };

export async function omsetning12Maneder(): Promise<Omsetning> {
  const db = admin();
  const fra = new Date(Date.now() - 365 * 86_400_000).toISOString();

  const [{ data: kort }, { data: fakt }] = await Promise.all([
    db.from("omsetning").select("belop_ore").gte("tidspunkt", fra),
    db.from("fakturaer").select("belopp, status, opprettet").gte("opprettet", fra),
  ]);

  const stripe = Math.round((kort ?? []).reduce((a, r) => a + Number(r.belop_ore), 0) / 100);
  const faktura = (fakt ?? [])
    .filter((f) => f.status !== "kreditnota")
    .reduce((a, f) => a + Number(f.belopp ?? 0), 0);

  return { stripe, faktura, totalt: stripe + faktura, grense: MVA_GRENSE };
}
