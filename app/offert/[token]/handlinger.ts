"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Svar = { ok: true } | { ok: false; feil: string };

/**
 * Kundens svar på et tilbud.
 *
 * Går gjennom offert_svar(), som kjører som eier og finner raden på token.
 * Ingen innlogging, ingen organisasjon — token er nøkkelen, og funksjonen
 * kan ikke se på noen annen rad enn den ene.
 *
 * Funksjonen avviser også avslag uten begrunnelse. Den kontrollen ligger i
 * databasen og ikke bare her, fordi det er begrunnelsen som gjør at vi kan
 * komme tilbake med noe annet — uten den er et nei bare et nei.
 */
export async function svarPaOffert(
  token: string,
  svar: "akseptert" | "endring" | "avslatt",
  kommentar: string,
  navn: string,
): Promise<Svar> {
  if (svar !== "akseptert" && !kommentar.trim())
    return {
      ok: false,
      feil:
        svar === "endring"
          ? "Skriv kort hva som skal være annerledes, så kan vi gjøre noe med det."
          : "Skriv gjerne kort hva som ikke passet. Vi bruker det til å forstå hva som ikke traff.",
    };

  const supabase = createClient();
  const { data, error } = await supabase.rpc("offert_svar", {
    t: token,
    p_svar: svar,
    p_kommentar: kommentar,
    p_navn: navn,
  });

  if (error) return { ok: false, feil: error.message };
  if (data !== true)
    return {
      ok: false,
      feil: "Tilbudet er ikke lenger åpent for svar. Ta kontakt med oss, så ser vi på det.",
    };

  revalidatePath(`/offert/${token}`);
  return { ok: true };
}
