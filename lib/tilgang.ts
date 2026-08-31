import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Samme dør inn til alle kundesidene: må være innlogget, og må høre til en
 * organisasjon. Uten profil slipper Row Level Security ingenting gjennom, så
 * da sendes folk til å velge plan og opprette selskapet sitt.
 *
 * cache() gjør at dette skjer én gang per forespørsel, ikke én gang per
 * kaller. Før dette kalte både siden og DashboardShell den hver for seg, og
 * hver sidevisning gjorde tre getUser og to profiler-spørringer i stedet for
 * én av hver. Organisasjonsnavnet hentes i samme spørring — det trengs på
 * hver eneste side uansett, i sidemenyen.
 */
export const krevProfil = cache(async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const { data: profil } = await supabase
    .from("profiler")
    .select("organisasjon_id, navn, rolle, ansatt, ansatt_rolle, organisasjoner(navn)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) redirect("/betaling");

  const org = profil.organisasjoner as unknown as { navn: string } | null;

  return {
    supabase,
    user,
    profil,
    organisasjonNavn: org?.navn ?? null,
  };
});
