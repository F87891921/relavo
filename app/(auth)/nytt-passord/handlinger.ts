"use server";

import { createClient } from "@/lib/supabase/server";
import { manglendeKrav, KRAV } from "@/lib/passord";
import { ord } from "@/lib/sprak";

export type Svar = { ok: true } | { ok: false; feil: string };

/** Samme krav som ved registrering, håndhevet her og ikke bare i skjemaet. */
export async function byttPassord(passord: string): Promise<Svar> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, feil: ord().glemt.utlopt };

  const mangler = manglendeKrav(passord, user.email ?? "");
  if (mangler.length) {
    const tekst = KRAV.filter((k) => mangler.includes(k.id))
      .map((k) => k.tekst.toLowerCase())
      .join(", ");
    return { ok: false, feil: ord().feil.passordMangler.replace("{krav}", tekst) };
  }

  const { error } = await supabase.auth.updateUser({ password: passord });
  if (error) return { ok: false, feil: error.message };
  return { ok: true };
}
