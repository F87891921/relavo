import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bekreftMedToken } from "@/lib/epostbekreftelse";

/**
 * Lenken fra bekreftelses-e-posten. Virker også når den åpnes på en annen
 * enhet enn den som registrerte seg: da er det ingen økt, og man sendes til
 * innlogging i stedet.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const u = searchParams.get("u") ?? "";
  const token = searchParams.get("token") ?? "";

  if (!/^[0-9a-f-]{36}$/i.test(u) || !/^[0-9a-f]{64}$/.test(token))
    return NextResponse.redirect(`${origin}/logg-inn?feil=ugyldig-lenke`);

  const ok = await bekreftMedToken(u, token);
  if (!ok) return NextResponse.redirect(`${origin}/logg-inn?feil=utlopt-lenke`);

  const {
    data: { user },
  } = await createClient().auth.getUser();
  return NextResponse.redirect(user?.id === u ? `${origin}/betaling` : `${origin}/logg-inn?bekreftet=1`);
}
