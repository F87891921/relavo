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
    // Kjedetallet skal være kjeder over grensen i § 5k, ikke leverandører
    // med høy risiko. Det var det før, og da sto det et tall på fanen som
    // ikke hadde noe med det fanen viser å gjøre.
    supabase
      .from("kjede_ledd")
      .select("id", { count: "exact", head: true })
      .eq("over_grense", true),
  ]);
  return { jav: jav ?? 0, espd: espd ?? 0, kjede: kjede ?? 0 };
});
