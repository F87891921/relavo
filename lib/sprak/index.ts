import { cookies, headers } from "next/headers";
import { no } from "./no";
import { sv } from "./sv";
import { en } from "./en";
import { KAPSEL_SPRAK, erSprak, type Sprak, type Ordbok } from "./felles";

export { SPRAK, KAPSEL_SPRAK, erSprak } from "./felles";
export type { Sprak, Ordbok } from "./felles";

const BOKER: Record<Sprak, Ordbok> = { no, sv, en };

/**
 * Hvilket språk siden skal vises på.
 *
 * Rekkefølgen er: det profilen har lagret, så kapselen, så norsk.
 *
 * Profilen først fordi valget skal følge personen og ikke nettleseren —
 * logger man inn hjemmefra, møter man det samme som på kontoret. Kapselen
 * finnes fordi den som ikke er logget inn også skal kunne velge, og fordi
 * den svarer uten et databasekall på hver eneste sidevisning.
 *
 * Ingen gjetning på Accept-Language. En side som bytter språk av seg selv
 * fordi nettleseren står på engelsk, er verre enn en som alltid er på norsk
 * — og kundene er norske kommuner.
 */
export function aktivtSprak(fraProfil?: string | null): Sprak {
  if (erSprak(fraProfil)) return fraProfil;
  const k = cookies().get(KAPSEL_SPRAK)?.value;
  if (erSprak(k)) return k;
  return "no";
}

/** Ordboka for gjeldende språk. */
export function ord(fraProfil?: string | null): Ordbok {
  return BOKER[aktivtSprak(fraProfil)];
}

export const ordbokFor = (s: Sprak): Ordbok => BOKER[s];

/**
 * Stien vi står på, videresendt som header fra middleware. Brukes av
 * språkvelgeren så man blir stående på samme side etter et bytte.
 */
export const naaSti = () => headers().get("x-sti") ?? "/";
