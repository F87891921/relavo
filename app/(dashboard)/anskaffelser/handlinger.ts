"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";

export type Svar = { ok: true; melding?: string } | { ok: false; feil: string };

const f = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

export async function nyAnskaffelse(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const saksnummer = f(fd, "saksnummer");
  const navn = f(fd, "navn");

  if (!saksnummer) return { ok: false, feil: "Saksnummeret må fylles ut." };
  if (!navn) return { ok: false, feil: "Anskaffelsen må ha et navn." };

  const { error } = await supabase.from("anskaffelser").insert({
    organisasjon_id: profil.organisasjon_id,
    saksnummer,
    navn,
    konkurranseform: f(fd, "konkurranseform") || null,
    verdi: f(fd, "verdi") || null,
    periode: f(fd, "periode") || null,
  });

  if (error)
    return {
      ok: false,
      // Unikhetsregelen er på (organisasjon_id, saksnummer). Den feilen er
      // ikke en databasefeil for brukeren, den er «den finnes allerede».
      feil: error.code === "23505"
        ? `${saksnummer} er allerede registrert.`
        : error.message,
    };

  revalidatePath("/anskaffelser");
  revalidatePath("/tilbud");
  return { ok: true, melding: `${saksnummer} er lagt til.` };
}

export async function fjernAnskaffelse(id: string): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  // Redegjørelsene peker på saksnummeret som tekst, ikke med fremmednøkkel,
  // så de ville blitt stående igjen uten noe å høre til. Er det sendt brev
  // i saken, skal saken bli stående.
  const { data: ansk } = await supabase
    .from("anskaffelser")
    .select("saksnummer")
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id)
    .maybeSingle();

  if (!ansk) return { ok: false, feil: "Fant ikke anskaffelsen." };

  const { count } = await supabase
    .from("redegjorelser")
    .select("id", { count: "exact", head: true })
    .eq("anskaffelse_ref", ansk.saksnummer);

  if (count)
    return {
      ok: false,
      feil: `Det er sendt ${count} ${count === 1 ? "brev" : "brev"} i ${ansk.saksnummer}. Saken kan ikke fjernes.`,
    };

  const { error } = await supabase
    .from("anskaffelser")
    .delete()
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/anskaffelser");
  revalidatePath("/tilbud");
  return { ok: true, melding: `${ansk.saksnummer} er fjernet.` };
}

/**
 * Tilbudene i en anskaffelse. Summen er det som avgjør om § 24-9 slår inn,
 * så den må leses strengt: «21 400 000» og «21.400.000,50» skal begge bli
 * tall, men «ca. 21 mill» skal avvises og ikke bli til 21.
 */
export async function nyttTilbud(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const anskaffelseId = f(fd, "anskaffelse_id");
  const navn = f(fd, "leverandor_navn");
  const rå = f(fd, "sum");

  if (!anskaffelseId) return { ok: false, feil: "Velg en anskaffelse." };
  if (!navn) return { ok: false, feil: "Tilbyderen må ha et navn." };

  // Mellomrom og hardt mellomrom er tusenskille. Komma er desimaltegn på
  // norsk; punktum kan være begge deler, så det tolkes som tusenskille når
  // det ikke står tre siffer igjen etter det.
  const renset = rå
    .replace(/[\s ]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");

  if (!/^\d+(\.\d+)?$/.test(renset))
    return { ok: false, feil: `«${rå}» er ikke et beløp.` };

  const sum = Number(renset);
  if (!Number.isFinite(sum) || sum < 0)
    return { ok: false, feil: "Summen må være et positivt tall." };

  const { error } = await supabase.from("tilbud").insert({
    anskaffelse_id: anskaffelseId,
    organisasjon_id: profil.organisasjon_id,
    leverandor_navn: navn,
    leverandor_epost: f(fd, "leverandor_epost") || null,
    sum,
  });

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/anskaffelser");
  revalidatePath("/tilbud");
  return { ok: true, melding: `${navn} er lagt til.` };
}

export async function fjernTilbud(id: string): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const { error } = await supabase
    .from("tilbud")
    .delete()
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/anskaffelser");
  revalidatePath("/tilbud");
  return { ok: true };
}
