import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { RENHOLD_URL, parseRenhold } from "@/lib/renhold";

export const maxDuration = 300;

/**
 * Henter renholdsregisteret og skriver det til basen.
 *
 * Kjøres av en ansatt, ikke automatisk. Filen er 22 MB og oppdateres én gang
 * i døgnet — å hente den ved hvert oppslag ville vært både tregt og unødig
 * belastning på Arbeidstilsynet.
 */
export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 });

  const { data: profil } = await supabase
    .from("profiler")
    .select("ansatt")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil?.ansatt)
    return NextResponse.json({ feil: "Krever ansatt" }, { status: 403 });

  let xml: string;
  try {
    const svar = await fetch(RENHOLD_URL, { cache: "no-store" });
    if (!svar.ok)
      return NextResponse.json(
        { feil: `Arbeidstilsynet svarte ${svar.status}.` },
        { status: 502 },
      );
    xml = await svar.text();
  } catch {
    return NextResponse.json(
      { feil: "Fikk ikke kontakt med Arbeidstilsynet." },
      { status: 502 },
    );
  }

  const virksomheter = parseRenhold(xml);
  if (!virksomheter.length)
    return NextResponse.json(
      { feil: "Fant ingen virksomheter i filen. Har formatet endret seg?" },
      { status: 502 },
    );

  const a = admin();

  // I bolker: 7 000+ rader i én forespørsel er over grensen.
  const BOLK = 500;
  for (let i = 0; i < virksomheter.length; i += BOLK) {
    const { error } = await a
      .from("renholdsvirksomheter")
      .upsert(
        virksomheter.slice(i, i + BOLK).map((v) => ({ ...v, oppdatert: new Date().toISOString() })),
        { onConflict: "org_nr" },
      );
    if (error)
      return NextResponse.json({ feil: error.message }, { status: 500 });
  }

  await a.from("registersynk").upsert(
    {
      register: "renhold",
      sist_hentet: new Date().toISOString(),
      antall: virksomheter.length,
    },
    { onConflict: "register" },
  );

  const godkjente = virksomheter.filter((v) => v.godkjent).length;

  return NextResponse.json({
    antall: virksomheter.length,
    godkjente,
    ikkeGodkjente: virksomheter.length - godkjente,
  });
}
