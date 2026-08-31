"use server";

import { revalidatePath } from "next/cache";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { validerOrgnr } from "@/lib/orgnr";
import { kredittvurder } from "@/lib/kreditt";

export type Svar = { ok: true } | { ok: false; feil: string };

const tekst = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

/* ---------------------------------------------------------------- Leads */

export async function nyttLead(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevAnsatt();

  const bolag = tekst(fd, "bolag");
  if (!bolag) return { ok: false, feil: "Bolagsnamn saknas." };

  const { error } = await supabase.from("leads").insert({
    bolag,
    kontakt: tekst(fd, "kontakt") || null,
    epost: tekst(fd, "epost") || null,
    kalla: tekst(fd, "kalla") || null,
    status: tekst(fd, "status") || "ny",
    nasta: tekst(fd, "nasta") || null,
    notis: tekst(fd, "notis") || null,
    opprettet_av: user.id,
  });

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/leads");
  revalidatePath("/internt/attgora");
  return { ok: true };
}

export async function settLeadStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/leads");
  return { ok: true };
}

/* ------------------------------------------------------------- Offerter */

export async function nyOfferte(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevAnsatt();

  const kund = tekst(fd, "kund");
  if (!kund) return { ok: false, feil: "Kund saknas." };

  const { error } = await supabase.from("offerter").insert({
    kund,
    lead_id: tekst(fd, "lead_id") || null,
    plan: tekst(fd, "plan") || "standard",
    ar: Number(tekst(fd, "ar")) || 1,
    rabatt: Number(tekst(fd, "rabatt")) || 0,
    giltig_til: tekst(fd, "giltig_til") || null,
    status: tekst(fd, "status") || "utkast",
    opprettet_av: user.id,
  });

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/offerter");
  return { ok: true };
}

export async function settOffertStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase.from("offerter").update({ status }).eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/offerter");
  return { ok: true };
}

/* ----------------------------------------------------------- Fakturaer */

export async function nyFaktura(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevAnsatt();

  const kunde = tekst(fd, "kunde_navn");
  const belopp = Number(tekst(fd, "belopp").replace(/\s/g, ""));
  const forfall = tekst(fd, "forfall");

  if (!kunde) return { ok: false, feil: "Kund saknas." };
  if (!Number.isFinite(belopp) || belopp < 0)
    return { ok: false, feil: "Beloppet är inte ett giltigt tal." };
  if (!forfall) return { ok: false, feil: "Förfallodatum saknas." };

  // Løpenummer per år. Krasjer to samtidige mot unique-regelen, feiler den
  // ene høyt i stedet for å skrive to fakturaer med samme nummer.
  const aar = new Date().getFullYear();
  const { count } = await supabase
    .from("fakturaer")
    .select("id", { count: "exact", head: true })
    .like("nummer", `${aar}-%`);

  const nummer = `${aar}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { error } = await supabase.from("fakturaer").insert({
    kunde_navn: kunde,
    organisasjon_id: tekst(fd, "organisasjon_id") || null,
    nummer,
    belopp,
    forfall,
    status: tekst(fd, "status") || "obetald",
    opprettet_av: user.id,
  });

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/fakturering");
  revalidatePath("/internt/attgora");
  return { ok: true };
}

export async function settFakturaStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase.from("fakturaer").update({ status }).eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/fakturering");
  revalidatePath("/internt/attgora");
  return { ok: true };
}

/* -------------------------------------------------------- Kredittsjekk */

export type KredittResultat =
  | { ok: true; id: string; vurdering: string }
  | { ok: false; feil: string };

export async function kjorKredittsjekk(fd: FormData): Promise<KredittResultat> {
  const { supabase, user } = await krevAnsatt();

  const validering = validerOrgnr(tekst(fd, "orgnr"));
  if (!validering.ok) return { ok: false, feil: validering.feil };

  const svar = await kredittvurder(validering.orgnr);
  if (!svar.ok) return { ok: false, feil: svar.feil };

  const { data, error } = await supabase
    .from("kredittsjekker")
    .insert({
      org_nr: validering.orgnr,
      navn: svar.enhet.navn,
      vurdering: svar.vurdering,
      begrunnelse: svar.begrunnelse,
      registerdata: { enhet: svar.enhet, regnskap: svar.regnskap },
      utfort_av: user.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/internt/kreditt");
  return { ok: true, id: data.id, vurdering: svar.vurdering };
}
