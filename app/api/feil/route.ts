import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { meldFeil } from "@/lib/feil";

export const runtime = "nodejs";

/**
 * Nettleseren melder en feil den ikke klarte å vise (global-error.tsx).
 *
 * Åpen for alle, siden feil skjer før innlogging også. Derfor små grenser:
 * korte felt, og når det har kommet mer enn femti meldinger siste minutt
 * svarer vi bare ok og skriver ikke mer.
 */
export async function POST(req: NextRequest) {
  let body: { melding?: string; side?: string; detaljer?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (!body.melding || typeof body.melding !== "string") return NextResponse.json({ ok: true });

  const { count } = await admin()
    .from("feillogg")
    .select("id", { count: "exact", head: true })
    .gte("opprettet", new Date(Date.now() - 60_000).toISOString());
  if ((count ?? 0) > 50) return NextResponse.json({ ok: true });

  await meldFeil({
    kilde: "klient",
    melding: body.melding,
    side: typeof body.side === "string" ? body.side : null,
    detaljer: typeof body.detaljer === "string" ? body.detaljer : null,
  });
  return NextResponse.json({ ok: true });
}
