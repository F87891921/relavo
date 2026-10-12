"use server";

import { headers } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { sendEpost } from "@/lib/epost";
import { ord } from "@/lib/sprak";

/**
 * Send en lenke for å velge nytt passord.
 *
 * Lenken lages her og sendes fra vår egen avsender, ikke av Supabase. To
 * grunner: Supabases e-post er engelsk og kommer fra «Supabase Auth», og
 * den vanlige lenken (PKCE) virker bare i nettleseren som ba om den. Den som
 * ber om nytt passord på pc-en og åpner e-posten på mobilen ville fått en
 * feilmelding. Tokenet verifiseres i /auth/bekreft uten noen kode fra
 * nettleseren.
 *
 * Svaret til skjemaet er det samme om adressen har en konto eller ikke.
 * Ellers kunne hvem som helst kartlegge hvem som er kunde hos oss.
 */
export async function glemtPassord(epost: string): Promise<void> {
  const adresse = epost.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adresse)) return;

  const { data, error } = await admin().auth.admin.generateLink({
    type: "recovery",
    email: adresse,
  });
  const token = data?.properties?.hashed_token;
  if (error || !token) return;

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const lenke = `${proto}://${host}/auth/bekreft?token_hash=${encodeURIComponent(token)}&type=recovery`;

  const t = ord().glemt;
  const svar = await sendEpost({
    til: adresse,
    emne: t.epostEmne,
    tekst: t.epostTekst.replace("{lenke}", lenke),
  });
  // Skjemaet svarer likt uansett, så feilen må stå i loggen — ellers får ingen vite at utsendingen ikke virker.
  if (!svar.ok) console.error("glemt-passord: e-post ikke sendt:", svar.feil);
}
