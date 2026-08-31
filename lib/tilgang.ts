import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Samme dør inn til alle kundesidene: må være innlogget, og må høre til en
 * organisasjon. Uten profil slipper Row Level Security ingenting gjennom,
 * så da sendes folk til å opprette selskapet sitt i stedet for å møte en
 * tom side de ikke skjønner.
 */
export async function krevProfil() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const { data: profil } = await supabase
    .from("profiler")
    .select("organisasjon_id, navn, rolle, ansatt")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) redirect("/betaling");

  return { supabase, user, profil };
}
