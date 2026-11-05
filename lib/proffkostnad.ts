import { admin } from "@/lib/supabase/admin";
import { PROFF_PRIS } from "@/lib/proffpris";

/**
 * Proff-kostnaden de siste 12 månedene: det oppslagene faktisk kostet
 * (lagret per kontroll) pluss årslisensene. Kontroller fra før kostnaden
 * ble lagret har ingen verdi og teller ikke med i den rørlige delen.
 */
export async function proffKostnad12Maneder() {
  const fra = new Date(Date.now() - 365 * 86_400_000).toISOString();
  const { data } = await admin().from("kontroller").select("proff_kostnad").gte("utfort", fra);
  const rader = (data ?? []).filter((r) => r.proff_kostnad != null);
  const rorlig = rader.reduce((a, r) => a + Number(r.proff_kostnad), 0);
  return {
    antall: rader.length,
    rorlig,
    snitt: rader.length ? rorlig / rader.length : 0,
    fast: PROFF_PRIS.fastAar,
    totalt: rorlig + PROFF_PRIS.fastAar,
  };
}
