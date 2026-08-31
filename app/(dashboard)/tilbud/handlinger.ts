"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";

export type Svar = { ok: true; id?: string } | { ok: false; feil: string };

const t = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();
const tall = (fd: FormData, n: string) => {
  const v = Number(t(fd, n).replace(/\s/g, ""));
  return Number.isFinite(v) ? v : null;
};

/** Lagrer utkastet. Sendingen skjer fra kundens eget system. */
export async function lagreRedegjorelse(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const utkast = t(fd, "utkast");
  const leverandor = t(fd, "leverandor_navn");
  if (!utkast || !leverandor)
    return { ok: false, feil: "Utkastet eller leverandøren mangler." };

  const { data, error } = await supabase
    .from("redegjorelser")
    .insert({
      organisasjon_id: profil.organisasjon_id,
      leverandor_navn: leverandor,
      leverandor_epost: t(fd, "leverandor_epost") || null,
      anskaffelse_ref: t(fd, "anskaffelse_ref") || null,
      anskaffelse_navn: t(fd, "anskaffelse_navn") || null,
      tilbudssum: tall(fd, "tilbudssum"),
      median: tall(fd, "median"),
      avvik_prosent: tall(fd, "avvik_prosent"),
      utkast,
      frist: t(fd, "frist") || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/tilbud");
  return { ok: true, id: data.id };
}

/**
 * Markerer at brevet faktisk ble sendt. Vi kan ikke vite det selv — det
 * gikk fra kundens egen e-post — så det er saksbehandleren som bekrefter.
 */
export async function markerSendt(id: string): Promise<Svar> {
  const { supabase, user } = await krevProfil();
  const { error } = await supabase
    .from("redegjorelser")
    .update({ sendt: new Date().toISOString(), sendt_av: user.id })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/tilbud");
  return { ok: true };
}

export async function lagreSvar(fd: FormData): Promise<Svar> {
  const { supabase } = await krevProfil();
  const id = t(fd, "id");
  const svar = t(fd, "svar");
  if (!svar) return { ok: false, feil: "Lim inn svaret fra leverandøren." };

  const { error } = await supabase
    .from("redegjorelser")
    .update({ svar, svar_mottatt: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/tilbud");
  return { ok: true };
}

/**
 * § 24-9 krever at oppdragsgiver tar stilling til om forklaringen holder,
 * og at vurderingen kan dokumenteres. Begrunnelsen er derfor påkrevd —
 * en avkrysning uten ord er ikke en vurdering.
 */
export async function vurderSvar(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevProfil();

  const id = t(fd, "id");
  const vurdering = t(fd, "vurdering");
  const begrunnelse = t(fd, "begrunnelse");

  if (!["tilstrekkelig", "utilstrekkelig"].includes(vurdering))
    return { ok: false, feil: "Velg om forklaringen er tilstrekkelig." };
  if (begrunnelse.length < 15)
    return {
      ok: false,
      feil: "Skriv en begrunnelse. Den skal kunne føres i anskaffelsesprotokollen.",
    };

  const { error } = await supabase
    .from("redegjorelser")
    .update({
      vurdering,
      vurdering_begrunnelse: begrunnelse,
      vurdert: new Date().toISOString(),
      vurdert_av: user.id,
    })
    .eq("id", id);

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/tilbud");
  return { ok: true };
}

/* ------------------------------------------------------------------ ESPD */

export async function etterspErESPD(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const id = t(fd, "id");
  const { error } = await supabase
    .from("espd_erklaringer")
    .update({
      status: "sendt",
      frist: t(fd, "frist") || null,
      mottaker_navn: t(fd, "mottaker_navn") || null,
      mottaker_epost: t(fd, "mottaker_epost") || null,
      notat: t(fd, "notat") || null,
    })
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/espd");
  return { ok: true };
}

export async function markerESPDSendt(id: string): Promise<Svar> {
  const { supabase, user } = await krevProfil();
  const { error } = await supabase
    .from("espd_erklaringer")
    .update({ etterspurt: new Date().toISOString(), etterspurt_av: user.id })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/espd");
  return { ok: true };
}

export async function settESPDStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevProfil();
  const { error } = await supabase
    .from("espd_erklaringer")
    .update({
      status,
      mottatt: status === "mottatt" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/espd");
  revalidatePath("/oversikt");
  return { ok: true };
}
