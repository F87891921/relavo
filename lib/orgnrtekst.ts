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
