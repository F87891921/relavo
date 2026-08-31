import { redirect } from "next/navigation";
import { krevProfil } from "@/lib/tilgang";

/**
 * Døren inn til kontopanelet. Krever ansatt-flagget i profiler, ikke
 * rolle = 'administrator' — det siste betyr administrator hos kunden, og
 * skal ikke gi innsyn i marginer, fakturering eller andre kunders data.
 *
 * Flagget kan bare settes direkte i databasen. Det finnes ingen vei til å
 * skru det på gjennom appen.
 */
export async function krevAnsatt() {
  const kontekst = await krevProfil();
  if (!kontekst.profil.ansatt) redirect("/oversikt");
  return kontekst;
}
