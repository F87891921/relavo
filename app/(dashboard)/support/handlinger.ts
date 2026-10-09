"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { varsleKundeOmSvar, varsleOssOmSak } from "@/lib/varsling";

export type Svar = { ok: true; id?: string } | { ok: false; feil: string };

const t = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

export async function nySak(fd: FormData): Promise<Svar> {
  const { supabase, user, profil, organisasjonNavn } = await krevProfil();

  const emne = t(fd, "emne");
  const melding = t(fd, "melding");
  if (!emne) return { ok: false, feil: "Saken må ha et emne." };
  if (!melding) return { ok: false, feil: "Skriv hva saken gjelder." };

  const { data: sak, error } = await supabase
    .from("saker")
    .insert({
      organisasjon_id: profil.organisasjon_id,
      opprettet_av: user.id,
      kategori: t(fd, "kategori") || "annet",
      emne,
      status: "venter_oss",
      varsle_epost: fd.get("varsle_epost") === "on",
    })
    .select("id")
    .single();

  if (error) return { ok: false, feil: error.message };

  const { error: svarFeil } = await supabase.from("sak_svar").insert({
    sak_id: sak.id,
    forfatter_id: user.id,
    fra_relavo: false,
    forfatter_navn: profil.navn ?? user.email ?? "Kunden",
    tekst: melding,
  });

  if (svarFeil) return { ok: false, feil: svarFeil.message };

  // Varselet sendes etter at saken er lagret, ikke før. Går det ikke
  // fram, er saken fortsatt opprettet.
  await varsleOssOmSak({
    emne,
    organisasjon: organisasjonNavn,
    tekst: melding,
    nySak: true,
  });

  revalidatePath("/support");
  revalidatePath("/internt/support");
  return { ok: true, id: sak.id };
}

export async function svarPaSak(fd: FormData): Promise<Svar> {
  const { supabase, user, profil, organisasjonNavn } = await krevProfil();

  const sakId = t(fd, "sak_id");
  const tekst = t(fd, "tekst");
  if (!sakId || !tekst) return { ok: false, feil: "Skriv et svar først." };

  const fraRelavo = profil.ansatt === true;

  const { error } = await supabase.from("sak_svar").insert({
    sak_id: sakId,
    forfatter_id: user.id,
    fra_relavo: fraRelavo,
    forfatter_navn: profil.navn ?? user.email ?? "Ukjent",
    tekst,
  });

  if (error) return { ok: false, feil: error.message };

  // Svarer Relavo, venter vi på kunden. Svarer kunden, venter det på oss.
  await supabase
    .from("saker")
    .update({
      status: fraRelavo ? "venter_kunde" : "venter_oss",
      oppdatert: new Date().toISOString(),
    })
    .eq("id", sakId);

  const { data: sak } = await supabase
    .from("saker")
    .select("emne, varsle_epost, opprettet_av")
    .eq("id", sakId)
    .maybeSingle();

  if (sak) {
    if (fraRelavo) {
      // Bare hvis kunden har bedt om varsling, og aldri til den som nettopp
      // skrev svaret selv.
      if (sak.varsle_epost && sak.opprettet_av && sak.opprettet_av !== user.id)
        await varsleKundeOmSvar({
          tilBrukerId: sak.opprettet_av,
          emne: sak.emne,
          svarFra: profil.navn ?? "Relavo",
          tekst,
        });
    } else {
      await varsleOssOmSak({
        emne: sak.emne,
        organisasjon: organisasjonNavn,
        tekst,
        nySak: false,
      });
    }
  }

  revalidatePath("/support");
  revalidatePath("/internt/support");
  return { ok: true };
}

export async function settSakStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevProfil();
  const { error } = await supabase
    .from("saker")
    .update({ status, oppdatert: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/support");
  revalidatePath("/internt/support");
  return { ok: true };
}

export async function settVarsling(id: string, pa: boolean): Promise<Svar> {
  const { supabase } = await krevProfil();
  const { error } = await supabase
    .from("saker")
    .update({ varsle_epost: pa })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/support");
  return { ok: true };
}
