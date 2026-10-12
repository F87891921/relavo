import type { SupabaseClient } from "@supabase/supabase-js";
import type { Enhet } from "@/lib/brreg";
import { erRenholdsbransje } from "@/lib/renhold";
import { screenSanksjoner } from "@/lib/screening";

/** Kommuner har lovens grense (§ 5k): hovedleverandør pluss høyst to ledd. Selskap har ingen, med mindre de setter en egen. */
const KOMMUNEPLANER = ["liten", "kommune", "medelstor", "stor"];
export const grenseFor = (plan: string | null | undefined, egen: number | null | undefined): number | null =>
  KOMMUNEPLANER.includes(plan ?? "") ? 2 : (egen ?? null);

/**
 * Hvert ledd i kjeden kontrolleres. Å telle kan en kunde gjøre i hodet; det
 * de ikke kan gjøre i hodet er å vite at ett av leddene er konkurs eller mangler
 * renholdsgodkjenning. Svarene lagres som korte koder på leddet.
 */
export async function kontrollerLedd(db: SupabaseClient, e: Enhet): Promise<string[]> {
  const m: string[] = [];
  if (e.konkurs) m.push("konkurs");
  if (e.underTvangsavvikling) m.push("tvangsavvikling");
  if (e.underAvvikling) m.push("avvikling");
  if (erRenholdsbransje(e.bransje)) {
    const { data: r } = await db.from("renholdsvirksomheter").select("godkjent").eq("org_nr", e.orgnr).maybeSingle();
    if (!r?.godkjent) m.push("renhold_ikke_godkjent");
  }
  const s = await screenSanksjoner(db, { navn: e.navn, orgnr: e.orgnr }).catch(() => null);
  if (s?.treff.length) m.push("mulig_sanksjon");
  if (!s?.kjort) m.push("sanksjon_ikke_sjekket");
  return m;
}

/** Går leddet dypere enn organisasjonens grense? Kommuner har lovens (2), selskap bare sin egen. */
export async function erOverGrense(db: SupabaseClient, organisasjonId: string, niva: number): Promise<boolean> {
  const { data: o } = await db.from("organisasjoner").select("plan, kjede_grense").eq("id", organisasjonId).maybeSingle();
  const g = grenseFor(o?.plan, o?.kjede_grense);
  return g !== null && niva > g;
}
