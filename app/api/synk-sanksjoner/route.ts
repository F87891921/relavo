import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { parseSanksjoner, SANKSJON_URL } from "@/lib/sanksjoner";

/**
 * Henter EUs sanksjonsliste på nytt.
 *
 * Lista endres med uker, ikke timer, så dette kjøres ukentlig — utløst av
 * den daglige overvåkingen når den ser at det vi har er mer enn sju dager
 * gammelt. Egen rute fordi den tar lang tid og ikke skal stjele budsjettet
 * fra leverandørsjekkene.
 *
 * Hele tabellen byttes ut. Lista er en liste, ikke en historikk: står et
 * navn der ikke lenger, er sanksjonen opphevet, og da skal vi slutte å
 * flagge på det samme dag.
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const hemmelighet = process.env.CRON_SECRET;
  if (!hemmelighet)
    return NextResponse.json({ feil: "CRON_SECRET mangler" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${hemmelighet}`)
    return NextResponse.json({ feil: "Ikke autorisert" }, { status: 401 });

  const start = Date.now();
  const db = admin();

  let xml: string;
  try {
    const svar = await fetch(SANKSJON_URL, { cache: "no-store" });
    if (!svar.ok) throw new Error(`EU svarte ${svar.status}`);
    xml = await svar.text();
  } catch (e) {
    const feil = e instanceof Error ? e.message : "Ukjent feil";
    await db.from("integrasjoner").upsert({
      navn: "sanksjoner",
      sist_feil: feil,
      oppdatert: new Date().toISOString(),
    });
    return NextResponse.json({ feil }, { status: 502 });
  }

  const { generert, oppforinger } = parseSanksjoner(xml);

  // En tom eller halv fil skal ikke få tømme tabellen. Da er det bedre å
  // flagge mot gårsdagens liste enn mot ingenting.
  if (oppforinger.length < 5000) {
    const feil = `Fikk bare ${oppforinger.length} navn — ser ut som en halv fil. Beholder forrige liste.`;
    await db.from("integrasjoner").upsert({
      navn: "sanksjoner",
      sist_feil: feil,
      oppdatert: new Date().toISOString(),
    });
    return NextResponse.json({ feil }, { status: 502 });
  }

  await db.from("sanksjoner").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const kilde = generert ? new Date(generert).toISOString() : null;
  let lagt = 0;
  for (let i = 0; i < oppforinger.length; i += 1000) {
    const bit = oppforinger.slice(i, i + 1000).map((o) => ({ ...o, kilde_dato: kilde }));
    const { error } = await db.from("sanksjoner").insert(bit);
    if (error)
      return NextResponse.json({ feil: error.message, lagt }, { status: 500 });
    lagt += bit.length;
  }

  await db.from("integrasjoner").upsert({
    navn: "sanksjoner",
    sist_synk: new Date().toISOString(),
    sist_feil: null,
    oppdatert: new Date().toISOString(),
  });

  return NextResponse.json({ lagt, generert, ms: Date.now() - start });
}
