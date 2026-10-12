import { NextResponse } from "next/server";
import { krevProfil } from "@/lib/tilgang";
import { admin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Alt organisasjonen har hos oss, som én JSON-fil.
 *
 * Bare administratoren, og bare egen organisasjon: radnivåsikkerheten
 * avgjør hvilke rader som kommer med, så ruten kan ikke gi ut noe en annen
 * kunde eier. Filene i lageret (skatteattester, ESPD) kommer som lenker som
 * virker i sju dager.
 */
const TABELLER = [
  "leverandorer",
  "kontroller",
  "espd_erklaringer",
  "skatteattester",
  "anskaffelser",
  "tilbud",
  "redegjorelser",
  "jav_treff",
  "prosjektdeltakere",
  "overvakning_hendelser",
  "saker",
  "bulkjobber",
  "bulkoppgaver",
] as const;

export async function GET() {
  const { supabase, user, profil } = await krevProfil();
  if (profil.rolle !== "administrator")
    return NextResponse.json({ feil: "Bare administrator kan eksportere." }, { status: 403 });

  const org = profil.organisasjon_id;
  const ut: Record<string, unknown> = {
    eksportert: new Date().toISOString(),
    eksportert_av: user.email,
    om: "Alle data Relavo har lagret for organisasjonen. Fakturaer ligger hos Relavo som regnskapsmateriale og er ikke med.",
  };

  const { data: organisasjon } = await supabase
    .from("organisasjoner")
    .select("navn, org_nr, plan, status, opprettet, aktivert")
    .eq("id", org)
    .maybeSingle();
  ut.organisasjon = organisasjon;

  const { data: brukere } = await supabase.from("profiler").select("id, navn, rolle, opprettet, sprak").eq("organisasjon_id", org);
  const db = admin();
  ut.brukere = await Promise.all(
    (brukere ?? []).map(async (b) => {
      const { data } = await db.auth.admin.getUserById(b.id);
      return { navn: b.navn, rolle: b.rolle, opprettet: b.opprettet, sprak: b.sprak, epost: data.user?.email ?? null };
    }),
  );

  for (const t of TABELLER) {
    const { data } = await supabase.from(t).select("*").eq("organisasjon_id", org);
    ut[t] = data ?? [];
  }

  // Kjedeleddene hører til kontrollene, ikke til organisasjonen.
  const kontrollIder = ((ut.kontroller as { id: string }[]) ?? []).map((k) => k.id);
  if (kontrollIder.length) {
    const { data } = await supabase.from("kjede_ledd").select("*").in("kontroll_id", kontrollIder);
    ut.kjede_ledd = data ?? [];
  }

  const filer: { bucket: string; navn: string; lenke: string }[] = [];
  for (const [bucket, tabell, sti, navn] of [
    ["skatteattest", "skatteattester", "filsti", "filnavn"],
    ["espd", "espd_erklaringer", "levert_filsti", "levert_filnavn"],
  ] as const) {
    for (const rad of ((ut[tabell] as Record<string, string | null>[]) ?? [])) {
      const s = rad[sti];
      if (!s) continue;
      const { data } = await db.storage.from(bucket).createSignedUrl(s, 7 * 86_400);
      if (data?.signedUrl) filer.push({ bucket, navn: rad[navn] ?? s, lenke: data.signedUrl });
    }
  }
  ut.filer = filer;

  const filnavn = `relavo-eksport-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(ut, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filnavn}"`,
      "Cache-Control": "no-store",
    },
  });
}
