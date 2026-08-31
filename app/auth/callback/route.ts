import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landingspunktet OAuth-leverandørene sender brukeren tilbake til.
 * Supabase gir oss en engangskode i ?code=, som byttes mot en sesjon og
 * legges i auth-cookien. Uten denne ruten fullføres aldri innloggingen.
 *
 * Samme rute brukes av alle leverandører — Microsoft i dag, eventuelle
 * andre senere. Legges det til flere, trengs ingen endring her.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // next lar oss sende folk tilbake dit de faktisk skulle.
  const next = searchParams.get("next") ?? "/oversikt";

  // Avbrutt eller avvist innlogging kommer tilbake med ?error=, ikke ?code=.
  const feil = searchParams.get("error_description") ?? searchParams.get("error");
  if (feil) {
    return NextResponse.redirect(
      `${origin}/logg-inn?feil=${encodeURIComponent(feil)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/logg-inn?feil=mangler-kode`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/logg-inn?feil=${encodeURIComponent(error.message)}`,
    );
  }

  // Åpen redirect-vern: bare interne stier, aldri en absolutt URL utenfra.
  const trygg = next.startsWith("/") && !next.startsWith("//") ? next : "/leverandorer";
  return NextResponse.redirect(`${origin}${trygg}`);
}
