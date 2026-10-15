"use server";

import { admin } from "@/lib/supabase/admin";
import { validerOrgnr } from "@/lib/orgnr";
import { slaOppOrgEllerBedrift } from "@/lib/brreg";
import { kontrollerLedd, erOverGrense } from "@/lib/kjede";
import { sendEpost } from "@/lib/epost";
import { grunnUrl } from "@/lib/url";
import { foresporselSvartBrev } from "@/lib/epostbrev";

export type Svar = { ok: true } | { ok: false; feil: string };

const MAKS = 25;

/**
 * Leverandøren svarer på hvem som utfører arbeidet.
 *
 * Ingen innlogging: lenken med tokenet er nøkkelen, og den gjelder bare ett
 * ledd i én kunde sin kjede. Alt skrives herfra med service_role etter at
 * tokenet er funnet og organisasjonsnumrene er slått opp, på samme måte som
 * ESPD-opplastingen — leverandøren får ikke noe direkte skrivetilgang.
 */
export async function svarForesporsel(fd: FormData): Promise<Svar> {
  const token = String(fd.get("token") ?? "");
  const ingen = fd.get("ingen") === "on";
  const navn = String(fd.get("navn") ?? "").trim();
  const rolle = String(fd.get("rolle") ?? "").trim();
  const bekreftet = fd.get("bekreftet") === "on";
  const nummer = fd.getAll("orgnr").map((x) => String(x).trim()).filter(Boolean);

  if (!navn) return { ok: false, feil: "Skriv navnet ditt." };
  if (!rolle) return { ok: false, feil: "Skriv rollen din." };
  if (!bekreftet) return { ok: false, feil: "Bekreft at opplysningene er riktige." };
  if (!ingen && nummer.length === 0) return { ok: false, feil: "Legg inn minst ett organisasjonsnummer, eller kryss av for at dere ikke bruker underleverandører." };
  if (nummer.length > MAKS) return { ok: false, feil: `Maks ${MAKS} selskaper om gangen.` };

  const db = admin();
  const { data: f } = await db
    .from("kjede_foresporsler")
    .select("id, ledd_id, status, opprettet_av, organisasjon_id, kjede_ledd(id, niva, kontroll_id, navn)")
    .eq("token", token)
    .maybeSingle();
  if (!f) return { ok: false, feil: "Lenken er ugyldig." };
  if (f.status === "besvart") return { ok: false, feil: "Forespørselen er allerede besvart." };
  const ledd = f.kjede_ledd as unknown as { id: string; niva: number; kontroll_id: string; navn: string };

  // Oppslagene først. Feiler ett, skrives ingenting.
  const enheter = [];
  const sett = new Set<string>();
  for (const n of ingen ? [] : nummer) {
    const v = validerOrgnr(n);
    if (!v.ok) return { ok: false, feil: `«${n}» er ikke et gyldig organisasjonsnummer.` };
    if (sett.has(v.orgnr)) continue;
    sett.add(v.orgnr);
    const r = await slaOppOrgEllerBedrift(v.orgnr);
    if (r.status === "ikke-funnet") return { ok: false, feil: `Fant ikke ${n} i Enhetsregisteret.` };
    if (r.status === "feil") return { ok: false, feil: r.melding };
    enheter.push(r.enhet);
  }

  const eksisterende = new Set(((await db.from("kjede_ledd").select("org_nr").eq("forelder_id", ledd.id)).data ?? []).map((x) => x.org_nr));
  for (const e of enheter) {
    if (eksisterende.has(e.orgnr)) continue;
    await db.from("kjede_ledd").insert({
      kontroll_id: ledd.kontroll_id,
      forelder_id: ledd.id,
      niva: ledd.niva + 1,
      navn: e.navn,
      org_nr: e.orgnr,
      over_grense: await erOverGrense(db, f.organisasjon_id, ledd.niva + 1),
      merknader: await kontrollerLedd(db, e),
    });
  }

  await db.from("kjede_ledd").update({ kartlegging: ingen ? "ingen" : "besvart" }).eq("id", ledd.id);
  await db
    .from("kjede_foresporsler")
    .update({ status: "besvart", svart: new Date().toISOString(), svart_navn: navn, svart_rolle: rolle, ingen })
    .eq("id", f.id);

  // Kunden får beskjed.
  if (f.opprettet_av) {
    const { data } = await db.auth.admin.getUserById(f.opprettet_av);
    if (data.user?.email)
      await sendEpost({
        til: data.user.email,
        ...foresporselSvartBrev({ leverandor: ledd.navn, antall: enheter.length, ingen, lenke: `${grunnUrl()}/kjede` }),
      });
  }
  return { ok: true };
}
