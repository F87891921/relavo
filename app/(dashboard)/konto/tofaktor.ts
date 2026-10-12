"use server";

import { createHash, randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { admin } from "@/lib/supabase/admin";
import { ord } from "@/lib/sprak";

export type Svar = { ok: true; melding?: string } | { ok: false; feil: string };

/** Uten tegn som forveksles (0/O, 1/I). Koden skal kunne leses opp over telefon. */
const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const hashKode = (kode: string) =>
  createHash("sha256").update(kode.toUpperCase().replace(/[^A-Z0-9]/g, "")).digest("hex");

function nyKode() {
  const tegn = Array.from({ length: 8 }, () => ALFABET[randomInt(ALFABET.length)]);
  return `${tegn.slice(0, 4).join("")}-${tegn.slice(4).join("")}`;
}

/**
 * Nye reservekoder. De gamle ugyldiggjøres. Kodene vises i klartekst én gang,
 * her i svaret; i basen ligger bare hasher.
 */
export async function lagReservekoder(): Promise<{ ok: true; koder: string[] } | { ok: false; feil: string }> {
  const { supabase, user } = await krevProfil();

  const { data } = await supabase.auth.mfa.listFactors();
  if (!(data?.totp ?? []).some((f) => f.status === "verified"))
    return { ok: false, feil: ord().feil.tofaktorIkkePa };

  const koder = Array.from({ length: 8 }, nyKode);
  const db = admin();
  await db.from("tofaktor_reservekoder").delete().eq("bruker_id", user.id);
  const { error } = await db
    .from("tofaktor_reservekoder")
    .insert(koder.map((k) => ({ bruker_id: user.id, kode_hash: hashKode(k) })));
  if (error) return { ok: false, feil: error.message };
  return { ok: true, koder };
}

/** Administratoren slår «krev tofaktor» på eller av for hele organisasjonen. */
export async function settKreverTofaktor(verdi: boolean): Promise<Svar> {
  const { supabase, profil } = await krevProfil();
  if (profil.rolle !== "administrator") return { ok: false, feil: ord().feil.bareAdministrator };
  const { error } = await supabase
    .from("organisasjoner")
    .update({ krever_tofaktor: verdi })
    .eq("id", profil.organisasjon_id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/konto");
  return { ok: true };
}

/**
 * Administratoren nullstiller tofaktor for en kollega som har mistet telefonen
 * og ikke har reservekoder. Kollegaen setter det opp på nytt ved neste
 * innlogging hvis organisasjonen krever det.
 */
export async function nullstillKollegaTofaktor(brukerId: string): Promise<Svar> {
  const { supabase, user, profil } = await krevProfil();
  if (profil.rolle !== "administrator") return { ok: false, feil: ord().feil.bareAdministrator };
  if (brukerId === user.id) return { ok: false, feil: ord().feil.ikkeDegSelv };

  // RLS: finner bare brukere i samme organisasjon.
  const { data: mal } = await supabase.from("profiler").select("id").eq("id", brukerId).maybeSingle();
  if (!mal) return { ok: false, feil: ord().feil.fantIkkeBrukeren };

  const db = admin();
  const { data } = await db.auth.admin.mfa.listFactors({ userId: brukerId });
  for (const f of data?.factors ?? []) await db.auth.admin.mfa.deleteFactor({ id: f.id, userId: brukerId });
  await db.from("tofaktor_reservekoder").delete().eq("bruker_id", brukerId);

  revalidatePath("/konto");
  return { ok: true, melding: ord().tofaktorKrav.nullstilt };
}
