import { NextRequest, NextResponse } from "next/server";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { admin } from "@/lib/supabase/admin";

const TOKEN_URL = "https://apps.fortnox.se/oauth-v1/token";

/** Tar imot koden fra Fortnox, bytter den mot tokens og lagrer dem. */
export async function GET(req: NextRequest) {
  await krevAnsatt();

  const tilbake = (m: string) => {
    const u = new URL("/internt/fakturering", req.url);
    u.searchParams.set("fortnox", m);
    return NextResponse.redirect(u);
  };

  const p = req.nextUrl.searchParams;
  const kode = p.get("code");
  const state = p.get("state");
  const forventet = req.cookies.get("fortnox_state")?.value;

  if (p.get("error")) return tilbake(`avvist: ${p.get("error_description") ?? p.get("error")}`);
  if (!kode || !state || !forventet || state !== forventet) return tilbake("ugyldig state");

  const id = process.env.FORTNOX_CLIENT_ID;
  const hemmelighet = process.env.FORTNOX_CLIENT_SECRET;
  if (!id || !hemmelighet) return tilbake("FORTNOX_CLIENT_ID/SECRET mangler");

  const svar = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${hemmelighet}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: kode,
      redirect_uri: `${req.nextUrl.origin}/api/fortnox/callback`,
    }),
  });
  const d = await svar.json().catch(() => ({}));
  if (!svar.ok) return tilbake(d?.error_description ?? `Fortnox svarte ${svar.status}`);

  const { error } = await admin()
    .from("integrasjoner")
    .upsert({
      navn: "fortnox",
      tilgangstoken: d.access_token,
      fornyelsestoken: d.refresh_token,
      utloper: new Date(Date.now() + (d.expires_in ?? 3600) * 1000).toISOString(),
      sist_feil: null,
      oppdatert: new Date().toISOString(),
    });
  if (error) return tilbake(error.message);

  const ut = tilbake("koblet");
  ut.cookies.delete({ name: "fortnox_state", path: "/api/fortnox" });
  return ut;
}
