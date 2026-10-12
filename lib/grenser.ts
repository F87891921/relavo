import type { SupabaseClient } from "@supabase/supabase-js";
import type { Ordbok } from "@/lib/sprak/felles";
import { maksLeverandorer } from "@/lib/plan";

export type Grenser = {
  plan: string | null;
  levN: number | null;
  levMaks: number | null;
  /** Bare for enkeltkontroll. Null for alle andre planer. */
  kontrollerIgjen: number | null;
};

/** Hva planen tillater og hvor mye som er brukt. Håndheves i basen; dette er for visning. */
export async function hentGrenser(supabase: SupabaseClient, orgId: string): Promise<Grenser> {
  const { data: org } = await supabase
    .from("organisasjoner")
    .select("plan, kontroller_kjopt")
    .eq("id", orgId)
    .maybeSingle();

  const levMaks = maksLeverandorer(org?.plan);
  let levN: number | null = null;
  let kontrollerIgjen: number | null = null;

  if (levMaks !== null) {
    const { count } = await supabase.from("leverandorer").select("id", { count: "exact", head: true });
    levN = count ?? 0;
  }
  if (org?.plan === "engangs") {
    const { count } = await supabase.from("kontroller").select("id", { count: "exact", head: true });
    kontrollerIgjen = Math.max(0, (org.kontroller_kjopt ?? 0) - (count ?? 0));
  }
  return { plan: org?.plan ?? null, levN, levMaks, kontrollerIgjen };
}

/** Gjør databasens grensefeil om til en melding kunden forstår. Andre feil går uendret videre. */
export function grenseFeil(melding: string, t: Ordbok): string {
  const m = melding.match(/Leverandørgrensen er nådd \((\d+)\)/);
  if (m) return t.grenser.feilLev.replace("{maks}", m[1]);
  if (/Ingen kontroller igjen/.test(melding)) return t.grenser.feilKontroll;
  return melding;
}
