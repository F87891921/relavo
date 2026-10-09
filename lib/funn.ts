import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Hvor mange funn det er av hver type.
 *
 * Tallene står på fanene, og de hentes i ett kall så fanene ikke koster
 * tre spørringer per sidevisning.
 */
export const funnAntall = cache(async () => {
  const supabase = createClient();
  const [{ count: jav }, { count: espd }, { count: kjede }] = await Promise.all([
    supabase.from("jav_treff").select("id", { count: "exact", head: true }),
    supabase
      .from("espd_erklaringer")
      .select("id", { count: "exact", head: true })
      .in("status", ["mangler", "sendt", "motstrid", "utlopt"]),
    supabase
      .from("leverandorer")
      .select("id", { count: "exact", head: true })
      .eq("risiko", "hoy"),
  ]);
  return { jav: jav ?? 0, espd: espd ?? 0, kjede: kjede ?? 0 };
});
