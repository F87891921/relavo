"use server";

import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { hashKode } from "@/app/(dashboard)/konto/tofaktor";
import { ord } from "@/lib/sprak";

export type Svar = { ok: true } | { ok: false; feil: string };

/**
 * Reservekode i stedet for engangskode, for den som har mistet telefonen.
 *
 * Koden fjerner tofaktor på kontoen (Supabase kan ikke heve en økt uten
 * faktoren), og brukeren setter den opp på nytt med en gang. Den som har
 * passordet og en reservekode kommer altså forbi den andre faktoren — det er
 * selve poenget med en reservekode, og grunnen til at de vises bare én gang
 * og bare brukes én gang.
 *
 * En feil kode koster et sekund, slik at ikke 40 bits kan prøves raskt.
 */
export async function brukReservekode(kode: string): Promise<Svar> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, feil: ord().tofaktorKrav.ugyldigKode };

  const db = admin();
  const { data: rad } = await db
    .from("tofaktor_reservekoder")
    .select("id")
    .eq("bruker_id", user.id)
    .eq("kode_hash", hashKode(kode))
    .is("brukt", null)
    .maybeSingle();

  if (!rad) {
    await new Promise((r) => setTimeout(r, 1000));
    return { ok: false, feil: ord().tofaktorKrav.ugyldigKode };
  }

  const { data } = await db.auth.admin.mfa.listFactors({ userId: user.id });
  for (const f of data?.factors ?? []) await db.auth.admin.mfa.deleteFactor({ id: f.id, userId: user.id });
  await db.from("tofaktor_reservekoder").delete().eq("bruker_id", user.id);
  return { ok: true };
}
