"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { KAPSEL_SPRAK, erSprak, type Sprak } from "./felles";

/**
 * Bytt språk.
 *
 * Kapselen settes alltid — også for den som ikke er logget inn, som er
 * hele poenget på landingssiden. Er man logget inn, lagres det i tillegg på
 * profilen, slik at valget følger med til neste maskin.
 */
export async function settSprak(sprak: Sprak): Promise<void> {
  if (!erSprak(sprak)) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kundene ser bare norsk. Svensk og engelsk kan velges av ansatte som er
  // innlogget; alt annet blir norsk, også om noen kaller handlingen direkte.
  let valgt: Sprak = "no";
  if (sprak !== "no" && user) {
    const { data } = await supabase.from("profiler").select("ansatt").eq("id", user.id).maybeSingle();
    if (data?.ansatt) valgt = sprak;
  }

  cookies().set(KAPSEL_SPRAK, valgt, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  if (user) await supabase.from("profiler").update({ sprak: valgt }).eq("id", user.id);

  revalidatePath("/", "layout");
}
