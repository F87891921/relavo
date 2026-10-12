"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Send en lenke for å velge nytt passord.
 *
 * Svaret er det samme om adressen har en konto eller ikke. Ellers kunne
 * hvem som helst kartlegge hvem som er kunde hos oss ved å prøve adresser.
 */
export async function glemtPassord(epost: string): Promise<void> {
  const adresse = epost.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adresse)) return;

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = `${proto}://${host}`;

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(adresse, {
    redirectTo: `${origin}/auth/callback?next=/nytt-passord`,
  });
}
