"use server";

import { headers } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { sendEpost } from "@/lib/epost";
import { ord, aktivtSprak } from "@/lib/sprak";
import { glemtPassordBrev } from "@/lib/epostbrev";

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
 * Skjemaet sier fra når adressen ikke har en konto. Det er et bevisst valg:
 * den som skrev feil adresse skal få vite det i stedet for å vente på et brev
 * som aldri kommer. Det betyr at man kan se om en adresse har konto.
 */
export type GlemtSvar = "sendt" | "ukjent" | "feil";

export async function glemtPassord(epost: string): Promise<GlemtSvar> {
  const adresse = epost.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adresse)) {
    console.warn("glemt-passord: ugyldig adresse, ingenting sendt");
    return "ukjent";
  }

  const { data, error } = await admin().auth.admin.generateLink({
    type: "recovery",
    email: adresse,
  });
  const token = data?.properties?.hashed_token;
  // Skjemaet svarer likt uansett. Her står det hvorfor ingenting ble sendt,
  // uten adressen: ukjent adresse er den vanligste grunnen (feil adresse skrevet).
  if (error || !token) {
    console.warn("glemt-passord: ingen lenke laget:", error?.message ?? "ingen token (ukjent adresse)");
    return /not found|no user/i.test(error?.message ?? "") || !error ? "ukjent" : "feil";
  }

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const lenke = `${proto}://${host}/auth/bekreft?token_hash=${encodeURIComponent(token)}&type=recovery`;

  const svar = await sendEpost({ til: adresse, ...glemtPassordBrev(ord().glemt, lenke, aktivtSprak()) });
  // Skjemaet svarer likt uansett, så feilen må stå i loggen — ellers får ingen vite at utsendingen ikke virker.
  if (!svar.ok) {
    console.error("glemt-passord: e-post ikke sendt:", svar.feil);
    return "feil";
  }
  console.info("glemt-passord: e-post sendt");
  return "sendt";
}
