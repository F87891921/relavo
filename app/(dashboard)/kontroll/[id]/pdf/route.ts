import { krevProfil } from "@/lib/tilgang";
import { hentKontrollrapport } from "@/lib/kontrollrapport";
import { kontrollrapportPdf } from "@/lib/kontrollpdf";

export const runtime = "nodejs";

/**
 * Rapporten som fil. Ikke «skriv ut siden» — en PDF som kan legges ved en
 * sak og ligge i arkivet med samme innhold om fem år, uavhengig av hvilken
 * nettleser som sto for utskriften.
 *
 * Filnavnet er organisasjonsnummer og dato. Det er det en saksbehandler
 * leter etter i en mappe, ikke en uuid.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { supabase } = await krevProfil();

  const rapport = await hentKontrollrapport(supabase, params.id);
  if (!rapport) return new Response("Fant ikke kontrollen.", { status: 404 });

  // Blob, ikke Uint8Array rått: TypeScripts BodyInit godtar ikke en
  // typet tabell som er bundet til en generisk buffer.
  const fil = new Blob([kontrollrapportPdf(rapport)], { type: "application/pdf" });
  const dato = rapport.utfort.slice(0, 10);

  return new Response(fil, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        `inline; filename="leverandorkontroll-${rapport.leverandor.orgNr}-${dato}.pdf"`,
      // Innholdet endrer seg ikke: kontrollen er et tidspunkt, ikke en
      // tilstand. Men den hører til én organisasjon, så den skal ikke
      // ligge i en delt mellomlagring.
      "Cache-Control": "private, max-age=3600",
    },
  });
}
