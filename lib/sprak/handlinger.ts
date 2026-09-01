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

  cookies().set(KAPSEL_SPRAK, sprak, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) await supabase.from("profiler").update({ sprak }).eq("id", user.id);

  revalidatePath("/", "layout");
}
