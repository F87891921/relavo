import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { krevAnsatt } from "@/lib/tilgang-ansatt";

/**
 * Starter koblingen til Fortnox. Bare ansatte; selve innloggingen skjer hos
 * Fortnox. State ligger i en httpOnly-kapsel og sjekkes i callbacken, så
 * ingen kan lure en ansatt til å koble en annens Fortnox-konto.
 */
export async function GET() {
  await krevAnsatt();

  const id = process.env.FORTNOX_CLIENT_ID;
  if (!id) return NextResponse.json({ feil: "FORTNOX_CLIENT_ID mangler." }, { status: 500 });

  const state = randomBytes(24).toString("hex");
  const url = new URL("https://apps.fortnox.se/oauth-v1/auth");
  url.searchParams.set("client_id", id);
  url.searchParams.set("redirect_uri", process.env.FORTNOX_REDIRECT_URI ?? "https://www.relavo.no/api/fortnox/callback");
  url.searchParams.set("scope", "invoice customer article");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("response_type", "code");

  const svar = NextResponse.redirect(url);
  svar.cookies.set("fortnox_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/api/fortnox",
  });
  return svar;
}
