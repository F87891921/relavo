import { NextResponse, type NextRequest } from "next/server";
import { sokKommune } from "@/lib/kommuner";
import { nivaFor, mnd36 } from "@/lib/priser";

export const runtime = "nodejs";

/**
 * Søk på kommunenavn fra forsiden. Gir innbyggertall, nivå og pris.
 *
 * Åpen, uten innlogging: den som vurderer Relavo skal kunne se prisen før
 * de har gitt oss noe. Den gir bare det SSB allerede publiserer, så det
 * er ingenting her å beskytte — men søket er begrenset til 40 tegn og seks
 * treff, så ruten ikke kan brukes til å tømme tabellen.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 40);
  if (q.trim().length < 2) return NextResponse.json({ treff: [] });

  try {
    const funnet = await sokKommune(q);
    return NextResponse.json({
      treff: funnet.map((k) => {
        const niva = nivaFor(k.innbyggere);
        return {
          kode: k.kode,
          navn: k.navn,
          innbyggere: k.innbyggere,
          ar: k.ar,
          niva: niva.id,
          mnd: niva.mnd,
          mnd36: mnd36(niva),
        };
      }),
    });
  } catch {
    // 503, ikke tomt svar: «ingen treff» ville sagt at kommunen ikke finnes.
    return NextResponse.json({ feil: "utilgjengelig" }, { status: 503 });
  }
}
