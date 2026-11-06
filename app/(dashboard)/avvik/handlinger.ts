"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { ord } from "@/lib/sprak";

export type Svar = { ok: true } | { ok: false; feil: string };

const STATUS = ["ny", "under_behandling", "avklart"] as const;
type Status = (typeof STATUS)[number];

/**
 * Setter status, ansvarlig og kommentar på et avvik fra overvåkingen.
 *
 * Det er dette som gjør et avvik til dokumentasjon: ikke bare at noe skjedde,
 * men hvem som tok det, når, og hva som ble gjort. Ansvarlig må høre til
 * samme organisasjon; ellers kunne en bruker plassere avvik hos en fremmed.
 */
export async function oppdaterAvvik(id: string, status: string, ansvarlig: string, kommentar: string): Promise<Svar> {
  const { supabase, user, profil } = await krevProfil();
  const o = ord().avvik;

  if (!STATUS.includes(status as Status)) return { ok: false, feil: o.ugyldig };
  const tekst = kommentar.trim().slice(0, 2000);

  let ansvarligId: string | null = null;
  if (ansvarlig) {
    const { data: p } = await supabase
      .from("profiler")
      .select("id")
      .eq("id", ansvarlig)
      .eq("organisasjon_id", profil.organisasjon_id)
      .maybeSingle();
    if (!p) return { ok: false, feil: o.ugyldig };
    ansvarligId = p.id;
  }

  const na = new Date().toISOString();
  const { data: eksisterende } = await supabase
    .from("overvakning_hendelser")
    .select("lest")
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id)
    .maybeSingle();
  if (!eksisterende) return { ok: false, feil: o.ugyldig };

  const { error } = await supabase
    .from("overvakning_hendelser")
    .update({
      status,
      ansvarlig: ansvarligId,
      kommentar: tekst || null,
      // Et avvik som er tatt tak i er sett. Da forsvinner det også fra «neste steg».
      lest: status === "ny" ? eksisterende.lest : (eksisterende.lest ?? na),
      behandlet: status === "avklart" ? na : null,
      behandlet_av: status === "avklart" ? user.id : null,
    })
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id);
  if (error) return { ok: false, feil: o.feil };

  revalidatePath("/avvik");
  revalidatePath("/oversikt");
  return { ok: true };
}
