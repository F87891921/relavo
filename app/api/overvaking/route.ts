import { hjerteslag, meldFeil, vaktJobb } from "@/lib/feil";
import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { sjekkLeverandor, sjekkRenhold, type Tilstand } from "@/lib/overvaking";
import { erRenholdsbransje, parseRenhold, RENHOLD_URL, tolkStatus } from "@/lib/renhold";
import { varsleOmHendelser } from "@/lib/varsling";

/**
 * Den daglige overvåkingen.
 *
 * Standardplanen selger «daglig overvåking», og fram til nå fantes det
 * ingen planlegger i prosjektet. Dette er den.
 *
 * Kjøres av Vercel Cron, som sender CRON_SECRET i Authorization. Uten det
 * svarer endepunktet 401 — den er åpen på nett, og en overvåking hvem som
 * helst kan utløse er en måte å brenne registerkvoten vår på.
 *
 * Den er bygget for å bli avbrutt. Funksjoner har en tidsgrense, og
 * registrene svarer når de svarer. Derfor:
 *
 *   – leverandørene tas i tur etter hvor lenge siden de sist ble sett på,
 *   – hver enkelt lagres med én gang den er ferdig, ikke til slutt,
 *   – og kjøringen stopper selv før tidsgrensen og lar resten vente til
 *     neste gang.
 *
 * Et avbrudd midt i koster da én leverandør, ikke hele kjøringen.
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Stopper her og lar resten vente. Lavere enn maxDuration med vilje. */
const TIDSBUDSJETT = 45_000;
const MAKS_PER_KJORING = 60;

export async function GET(req: NextRequest) {
  const hemmelighet = process.env.CRON_SECRET;
  if (!hemmelighet)
    return NextResponse.json({ feil: "CRON_SECRET mangler" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${hemmelighet}`)
    return NextResponse.json({ feil: "Ikke autorisert" }, { status: 401 });

  const start = Date.now();
  // Vakt: den andre daglige jobben skal ha meldt seg siste halvannet døgn.
  await vaktJobb("paminnelser", 36);
  const db = admin();

  const { data: leverandorer } = await db
    .from("leverandorer")
    .select("id, organisasjon_id, navn, org_nr, bransje, tilstand, overvaket")
    .order("overvaket", { ascending: true, nullsFirst: true })
    .limit(MAKS_PER_KJORING);

  const kø = leverandorer ?? [];

  // Renholdsregisteret er én fil på 22 MB. Den hentes én gang for hele
  // kjøringen, og bare hvis noen i køen faktisk driver med renhold.
  let renhold: Map<string, string> | null = null;
  if (kø.some((l) => erRenholdsbransje(l.bransje))) {
    try {
      const svar = await fetch(RENHOLD_URL, { cache: "no-store" });
      if (svar.ok) {
        renhold = new Map(
          parseRenhold(await svar.text()).map((v) => [v.org_nr, tolkStatus(v.status)]),
        );
      }
    } catch {
      // Registeret er nede. Resten av kjøringen er fortsatt verdt å gjøre.
    }
  }

  let sett = 0;
  let hendelser = 0;
  const feil: string[] = [];
  const perOrg = new Map<string, { navn: string; slag: string; alvor: string }[]>();

  for (const l of kø) {
    if (Date.now() - start > TIDSBUDSJETT) break;
    if (!l.org_nr) continue;

    try {
      const forrige = (l.tilstand ?? null) as Tilstand | null;
      const { tilstand, hendelser: nye } = await sjekkLeverandor(l.org_nr, forrige);

      const rStatus = renhold?.get(l.org_nr) ?? null;
      if (rStatus) {
        nye.push(...sjekkRenhold(forrige, rStatus));
        tilstand.renhold = rStatus;
      }

      if (nye.length) {
        await db.from("overvakning_hendelser").insert(
          nye.map((h) => ({
            organisasjon_id: l.organisasjon_id,
            leverandor_id: l.id,
            slag: h.slag,
            alvor: h.alvor,
            fra: h.fra,
            til: h.til,
          })),
        );
        hendelser += nye.length;

        const liste = perOrg.get(l.organisasjon_id) ?? [];
        for (const h of nye)
          liste.push({ navn: l.navn, slag: h.slag, alvor: h.alvor });
        perOrg.set(l.organisasjon_id, liste);
      }

      // Lagres per leverandør, ikke til slutt. Blir kjøringen avbrutt, er
      // alt fram hit allerede ført.
      await db
        .from("leverandorer")
        .update({ tilstand, overvaket: new Date().toISOString() })
        .eq("id", l.id);

      sett++;
    } catch (e) {
      feil.push(`${l.org_nr}: ${e instanceof Error ? e.message : "ukjent"}`);
      // Merk den som sett likevel, ellers blir den samme leverandøren
      // stående først i køen og blokkerer alle andre hver natt.
      await db
        .from("leverandorer")
        .update({ overvaket: new Date().toISOString() })
        .eq("id", l.id);
    }
  }

  for (const [orgId, liste] of perOrg) await varsleOmHendelser(orgId, liste);

  // Sanksjonslista endres med uker. Er den mer enn sju dager gammel,
  // settes den i gang i bakgrunnen — den skal ikke stjele tidsbudsjettet
  // fra leverandørsjekkene over.
  const base = req.nextUrl.origin;
  const settIGang = (sti: string) =>
    void fetch(`${base}${sti}`, {
      headers: { authorization: `Bearer ${hemmelighet}` },
    }).catch(() => {});

  const { data: sanksjonsstatus } = await db
    .from("integrasjoner")
    .select("sist_synk")
    .eq("navn", "sanksjoner")
    .maybeSingle();

  if (
    !sanksjonsstatus?.sist_synk ||
    Date.now() - new Date(sanksjonsstatus.sist_synk).getTime() > 7 * 86_400_000
  )
    settIGang("/api/synk-sanksjoner");

  // Renholdsregisteret oppdateres hver morgen hos Arbeidstilsynet. Vår kopi
  // sto stille fra første import til noen trykket på knappen, og hadde
  // kommet 153 selskaper på etterskudd.
  const { data: renholdstatus } = await db
    .from("registersynk")
    .select("sist_hentet")
    .eq("register", "renhold")
    .maybeSingle();

  if (
    !renholdstatus?.sist_hentet ||
    Date.now() - new Date(renholdstatus.sist_hentet).getTime() > 36 * 3_600_000
  )
    settIGang("/api/synk-renhold");

  await db.from("integrasjoner").upsert({
    navn: "overvaking",
    sist_synk: new Date().toISOString(),
    sist_feil: feil.length ? feil.slice(0, 5).join(" · ") : null,
    oppdatert: new Date().toISOString(),
  });

  await hjerteslag("overvaking");
  if (feil.length) await meldFeil({ kilde: "jobb", melding: `Overvåkingen fikk ${feil.length} feil`, detaljer: feil.slice(0, 3).join(" · ") });

  return NextResponse.json({
    sett,
    igjen: Math.max(0, kø.length - sett),
    hendelser,
    feil: feil.length,
    ms: Date.now() - start,
  });
}
