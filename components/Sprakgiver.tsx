"use client";

import { createContext, useContext } from "react";
import type { Ordbok } from "@/lib/sprak/felles";

/**
 * Ordboka for klientkomponentene.
 *
 * De kan ikke lese kapselen selv — ord() bruker cookies(), som bare finnes
 * på serveren. Alternativet var å sende hver eneste tekst inn som en prop,
 * og skjemaer med tjue etiketter ville fått tjue props som noen glemmer én
 * av. Her sendes den aktive ordboka én gang fra rotoppsettet.
 *
 * Bare det valgte språket følger med, ikke alle tre.
 */
const Kontekst = createContext<Ordbok | null>(null);

export function Sprakgiver({
  ordbok,
  children,
}: {
  ordbok: Ordbok;
  children: React.ReactNode;
}) {
  return <Kontekst.Provider value={ordbok}>{children}</Kontekst.Provider>;
}

export function useOrd(): Ordbok {
  const o = useContext(Kontekst);
  if (!o) throw new Error("useOrd må brukes innenfor Sprakgiver");
  return o;
}
