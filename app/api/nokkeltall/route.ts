import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validerOrgnr } from "@/lib/orgnr";
import { slaOppEnhet } from "@/lib/brreg";
import { hentRegnskap } from "@/lib/regnskap";
import { lagNokkeltall } from "@/lib/nokkeltall";

/**
 * Nøkkeltall til veiviseren, vist med en gang selskapet er slått opp.
 * Kommer fra det åpne Regnskapsregisteret og koster ingenting; kreditt og
 * compliance (som koster per søk) hentes først når kontrollen kjøres.
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 });

  const v = validerOrgnr(request.nextUrl.searchParams.get("orgnr") ?? "");
  if (!v.ok) return NextResponse.json({ feil: "Ugyldig organisasjonsnummer" }, { status: 400 });

  const [oppslag, regnskap] = await Promise.all([slaOppEnhet(v.orgnr), hentRegnskap(v.orgnr).catch(() => [])]);
  const ansatte = oppslag.status === "funnet" ? oppslag.enhet.ansatte : null;
  return NextResponse.json({ nokkeltall: lagNokkeltall(regnskap, ansatte) });
}
