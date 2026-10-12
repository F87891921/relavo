import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validerOrgnr } from "@/lib/orgnr";
import { slaOppEnhet } from "@/lib/brreg";
import { orgnrFeil, brregFeil } from "@/lib/orgnrtekst";
import { ord } from "@/lib/sprak";

/**
 * Oppslag i Enhetsregisteret for veiviseren. Ruten går via serveren, ikke
 * rett fra nettleseren, av to grunner: den krever innlogging, og den
 * validerer nummeret før vi belaster registeret med søppel.
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ feil: "Ikke innlogget" }, { status: 401 });
  }

  const rå = request.nextUrl.searchParams.get("orgnr") ?? "";
  const validering = validerOrgnr(rå);
  if (!validering.ok) {
    return NextResponse.json(
      { feil: orgnrFeil(ord(), validering.feil) },
      { status: 400 },
    );
  }

  const oppslag = await slaOppEnhet(validering.orgnr);

  if (oppslag.status === "ikke-funnet") {
    return NextResponse.json(
      { feil: ord().feil.fantIngenEnhet },
      { status: 404 },
    );
  }
  if (oppslag.status === "feil") {
    return NextResponse.json(
      { feil: brregFeil(ord(), oppslag.melding) },
      { status: 502 },
    );
  }

  return NextResponse.json({ enhet: oppslag.enhet });
}
