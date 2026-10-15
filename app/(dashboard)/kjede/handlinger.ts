"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { validerOrgnr } from "@/lib/orgnr";
import { slaOppOrgEllerBedrift } from "@/lib/brreg";
import { orgnrFeil } from "@/lib/orgnrtekst";
import { ord } from "@/lib/sprak";
import { kontrollerLedd, erOverGrense } from "@/lib/kjede";
import { sendEpost } from "@/lib/epost";
import { grunnUrl } from "@/lib/url";
import { foresporselBrev } from "@/lib/epostbrev";

export type Svar = { ok: true; lenke?: string; epostSendt?: boolean } | { ok: false; feil: string };

/**
 * Legger en underleverandør under et ledd i kjeden. Kjeden er et tre:
 * hovedleverandøren er roten, og hvert ledd kan ha flere underleverandører.
 * Er `forelderId` null legges leddet rett under hovedleverandøren, som
 * opprettes første gang.
 */
export async function leggTilLedd(kontrollId: string, forelderId: string | null, orgnr: string): Promise<Svar> {
  const { supabase, profil } = await krevProfil();
  const o = ord();

  const v = validerOrgnr(orgnr);
  if (!v.ok) return { ok: false, feil: orgnrFeil(o, v.feil) };

  const { data: kontroll } = await supabase
    .from("kontroller")
    .select("id, leverandorer(navn, org_nr)")
    .eq("id", kontrollId)
    .maybeSingle();
  if (!kontroll) return { ok: false, feil: o.kjede.fantIkkeKontroll };

  // Roten opprettes første gang.
  let rot = (await supabase.from("kjede_ledd").select("id, niva").eq("kontroll_id", kontrollId).eq("niva", 0).maybeSingle()).data;
  if (!rot) {
    const lev = kontroll.leverandorer as unknown as { navn: string; org_nr: string } | null;
    const { data: ny } = await supabase
      .from("kjede_ledd")
      .insert({ kontroll_id: kontrollId, niva: 0, navn: lev?.navn ?? "", org_nr: lev?.org_nr ?? "", over_grense: false })
      .select("id, niva")
      .single();
    rot = ny;
  }
  if (!rot) return { ok: false, feil: o.kjede.fantIkkeKontroll };

  const forelder = forelderId
    ? (await supabase.from("kjede_ledd").select("id, niva").eq("id", forelderId).eq("kontroll_id", kontrollId).maybeSingle()).data
    : rot;
  if (!forelder) return { ok: false, feil: o.kjede.fantIkkeKontroll };

  const oppslag = await slaOppOrgEllerBedrift(v.orgnr);
  if (oppslag.status === "ikke-funnet") return { ok: false, feil: o.kjede.ukjentOrg };
  if (oppslag.status === "feil") return { ok: false, feil: oppslag.melding };

  // Et bedriftsnummer gir hovedenheten, og det er den som lagres.
  const nr = oppslag.enhet.orgnr;
  const { data: søsken } = await supabase.from("kjede_ledd").select("org_nr").eq("forelder_id", forelder.id);
  if ((søsken ?? []).some((s) => s.org_nr === nr)) return { ok: false, feil: o.kjede.alleredeMed };

  const niva = forelder.niva + 1;
  const { error } = await supabase.from("kjede_ledd").insert({
    kontroll_id: kontrollId,
    forelder_id: forelder.id,
    niva,
    navn: oppslag.enhet.navn,
    org_nr: nr,
    over_grense: await erOverGrense(supabase, profil.organisasjon_id, niva),
    merknader: await kontrollerLedd(supabase, oppslag.enhet),
  });
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/kjede");
  return { ok: true };
}

/** Fjerner et ledd og alt under det. */
export async function fjernLedd(leddId: string): Promise<Svar> {
  const { supabase } = await krevProfil();
  const { data: l } = await supabase.from("kjede_ledd").select("niva").eq("id", leddId).maybeSingle();
  if (!l || l.niva === 0) return { ok: false, feil: ord().kjede.ingenLedd };
  const { error } = await supabase.from("kjede_ledd").delete().eq("id", leddId);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/kjede");
  return { ok: true };
}

/**
 * Ber leverandøren (et ledd) oppgi sine egne underleverandører. Leverandøren
 * får en lenke uten innlogging. Er e-post oppgitt, sendes lenken; ellers vises
 * den så kunden kan sende den selv.
 */
export async function beOmKjede(leddId: string, epost: string): Promise<Svar> {
  const { supabase, user, profil } = await krevProfil();
  const o = ord();

  const { data: ledd } = await supabase.from("kjede_ledd").select("id, navn, niva").eq("id", leddId).maybeSingle();
  if (!ledd) return { ok: false, feil: o.kjede.fantIkkeKontroll };

  const adresse = epost.trim().toLowerCase();
  if (adresse && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adresse)) return { ok: false, feil: o.feil.ugyldigEpost };

  const frist = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
  const { data: f, error } = await supabase
    .from("kjede_foresporsler")
    .insert({
      organisasjon_id: profil.organisasjon_id,
      ledd_id: ledd.id,
      mottaker_epost: adresse || null,
      frist,
      opprettet_av: user.id,
    })
    .select("token")
    .single();
  if (error || !f) return { ok: false, feil: error?.message ?? o.kjede.fantIkkeKontroll };

  await supabase.from("kjede_ledd").update({ kartlegging: "venter" }).eq("id", ledd.id);

  const { data: org } = await supabase.from("organisasjoner").select("navn").eq("id", profil.organisasjon_id).maybeSingle();
  const lenke = `${grunnUrl()}/underleverandorer/${f.token}`;

  let epostSendt = false;
  if (adresse) {
    const brev = foresporselBrev({ kunde: org?.navn ?? "", leverandor: ledd.navn, lenke, frist, purring: 0 });
    const r = await sendEpost({ til: adresse, ...brev });
    epostSendt = r.ok;
  }

  revalidatePath("/kjede");
  return { ok: true, lenke, epostSendt };
}

/** Kundens egen grense (valgfri) for selskap. Kommuner har lovens grense og kan ikke endre den. */
export async function settKjedegrense(grense: number | null): Promise<Svar> {
  const { supabase, profil } = await krevProfil();
  if (profil.rolle !== "administrator") return { ok: false, feil: ord().feil.bareAdministrator };
  const g = grense && grense >= 1 && grense <= 10 ? Math.round(grense) : null;
  const { error } = await supabase.from("organisasjoner").update({ kjede_grense: g }).eq("id", profil.organisasjon_id);
  if (error) return { ok: false, feil: error.message };
  // Eksisterende ledd flagges på nytt mot den nye grensen.
  const { data: kontroller } = await supabase.from("kontroller").select("id");
  const ider = (kontroller ?? []).map((k) => k.id);
  if (ider.length) {
    await supabase.from("kjede_ledd").update({ over_grense: false }).in("kontroll_id", ider);
    if (g) await supabase.from("kjede_ledd").update({ over_grense: true }).in("kontroll_id", ider).gt("niva", g);
  }
  revalidatePath("/kjede");
  return { ok: true };
}
