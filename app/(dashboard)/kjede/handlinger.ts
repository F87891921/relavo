"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { validerOrgnr } from "@/lib/orgnr";
import { slaOppEnhet } from "@/lib/brreg";
import { orgnrFeil } from "@/lib/orgnrtekst";
import { ord } from "@/lib/sprak";

export type Svar = { ok: true } | { ok: false; feil: string };

/** § 5k: hovedleverandøren er ledd 0, og høyst to ledd under den er lov. */
const GRENSE = 2;

/**
 * Legger det neste leddet til kjeden på en kontroll.
 *
 * Registrene viser ikke hvem en leverandør bruker som underleverandør, så
 * leddene må legges inn av den som kjenner kjeden. Det vi gjør er å slå opp
 * selskapet, ta navnet fra Enhetsregisteret og telle: ledd over grensen i
 * § 5k flagges. Kjeden er lineær (ledd 1 under hovedleverandøren, ledd 2
 * under ledd 1 og så videre), så et nytt ledd havner alltid nederst.
 */
export async function leggTilLedd(kontrollId: string, orgnr: string): Promise<Svar> {
  const { supabase } = await krevProfil();

  const v = validerOrgnr(orgnr);
  if (!v.ok) return { ok: false, feil: orgnrFeil(ord(), v.feil) };

  // Radnivåsikkerheten gjør at en kontroll fra en annen organisasjon ikke finnes.
  const { data: kontroll } = await supabase
    .from("kontroller")
    .select("id, leverandor_id, leverandorer(navn, org_nr)")
    .eq("id", kontrollId)
    .maybeSingle();
  if (!kontroll) return { ok: false, feil: ord().kjede.fantIkkeKontroll };

  const { data: eksisterende } = await supabase
    .from("kjede_ledd")
    .select("niva, org_nr")
    .eq("kontroll_id", kontrollId)
    .order("niva");

  if ((eksisterende ?? []).some((l) => l.org_nr === v.orgnr))
    return { ok: false, feil: ord().kjede.alleredeMed };

  const oppslag = await slaOppEnhet(v.orgnr);
  if (oppslag.status === "ikke-funnet") return { ok: false, feil: ord().kjede.ukjentOrg };
  if (oppslag.status === "feil") return { ok: false, feil: oppslag.melding };

  const rader: { kontroll_id: string; niva: number; navn: string; org_nr: string; over_grense: boolean }[] = [];

  // Hovedleverandøren legges inn første gang, så leddene har noe å henge på.
  if (!eksisterende?.length) {
    const lev = kontroll.leverandorer as unknown as { navn: string; org_nr: string } | null;
    rader.push({ kontroll_id: kontrollId, niva: 0, navn: lev?.navn ?? "", org_nr: lev?.org_nr ?? "", over_grense: false });
  }

  const neste = eksisterende?.length ? Math.max(...eksisterende.map((l) => l.niva)) + 1 : 1;
  rader.push({ kontroll_id: kontrollId, niva: neste, navn: oppslag.enhet.navn, org_nr: v.orgnr, over_grense: neste > GRENSE });

  const { error } = await supabase.from("kjede_ledd").insert(rader);
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/kjede");
  return { ok: true };
}

/** Fjerner det nederste leddet. Midt i kjeden kan man ikke fjerne, da blir ledd-numrene feil. */
export async function fjernSisteLedd(kontrollId: string): Promise<Svar> {
  const { supabase } = await krevProfil();
  const { data: ledd } = await supabase
    .from("kjede_ledd")
    .select("id, niva")
    .eq("kontroll_id", kontrollId)
    .order("niva", { ascending: false })
    .limit(1);
  const siste = ledd?.[0];
  if (!siste || siste.niva === 0) return { ok: false, feil: ord().kjede.ingenLedd };
  const { error } = await supabase.from("kjede_ledd").delete().eq("id", siste.id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/kjede");
  return { ok: true };
}
