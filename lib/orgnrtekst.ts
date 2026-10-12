import type { Ordbok } from "@/lib/sprak/felles";

/**
 * validerOrgnr gir en nøkkel, ikke ferdig tekst — modulen brukes både på
 * server og klient, og en fast norsk setning der ville stått på norsk midt
 * i et engelsk skjema. Her slås nøkkelen opp.
 */
export function orgnrFeil(t: Ordbok, nokkel: string): string {
  const kart: Record<string, string> = {
    orgnrNiSiffer: t.internt.orgnrNiSiffer,
    orgnrUgyldig: t.internt.orgnrUgyldig,
    orgnrKontrollsiffer: t.internt.orgnrKontrollsiffer,
  };
  return kart[nokkel] ?? nokkel;
}

/**
 * Samme grep for oppslaget mot Enhetsregisteret. slaOppEnhet gir en nøkkel
 * fordi modulen også importeres av veiviseren, som er en klientkomponent.
 * «brregSvarte:503» bærer statuskoden med seg i nøkkelen.
 */
export function brregFeil(t: Ordbok, nokkel: string): string {
  if (nokkel.startsWith("brregSvarte:"))
    return t.feil.brregSvarte.replace("{status}", nokkel.slice("brregSvarte:".length));
  const kart: Record<string, string> = {
    brregIngenKontakt: t.feil.brregIngenKontakt,
    brregUleselig: t.feil.brregUleselig,
  };
  return kart[nokkel] ?? nokkel;
}
