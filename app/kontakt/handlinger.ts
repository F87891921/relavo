"use server";

import { createClient } from "@/lib/supabase/server";

export type Svar = { ok: true } | { ok: false; feil: string };

const t = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

/**
 * Kontaktskjemaet på forsiden. Skrives av folk som ikke er logget inn, så
 * det går gjennom anon-nøkkelen — policyen i 0008 tillater innsetting og
 * ingenting annet. Ingen kan lese hva andre har sendt inn.
 */
export async function sendHenvendelse(fd: FormData): Promise<Svar> {
  const navn = t(fd, "navn");
  const epost = t(fd, "epost");
  const melding = t(fd, "melding");

  if (!navn) return { ok: false, feil: "Skriv navnet ditt." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(epost))
    return { ok: false, feil: "Skriv en gyldig e-postadresse." };
  if (melding.length < 10)
    return { ok: false, feil: "Skriv litt mer om hva det gjelder." };

  // Enkel sperre mot skjemaroboter: et felt mennesker ikke ser og derfor
  // aldri fyller ut.
  if (t(fd, "nettsted")) return { ok: true };

  const supabase = createClient();

  const { error } = await supabase.from("kontakt_henvendelser").insert({
    navn,
    epost,
    organisasjon: t(fd, "organisasjon") || null,
    telefon: t(fd, "telefon") || null,
    kategori: t(fd, "kategori") || "annet",
    melding,
  });

  if (error) return { ok: false, feil: "Kunne ikke sende inn. Prøv igjen." };
  return { ok: true };
}
