import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Lenken fra «glemt passord»-e-posten. Tokenet byttes mot en økt her, uten
 * PKCE-kode, slik at lenken virker også når e-posten åpnes på en annen
 * enhet enn den som ba om den.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token_hash");

  if (!token || searchParams.get("type") !== "recovery")
    return NextResponse.redirect(`${origin}/logg-inn?feil=mangler-kode`);

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: token });
  if (error) return NextResponse.redirect(`${origin}/logg-inn?feil=utlopt-lenke`);

  return NextResponse.redirect(`${origin}/nytt-passord`);
}
