import type { StatusVal } from "@/components/ui/StatusMerke";

/**
 * Prisene og regnestykket bak et tilbud.
 *
 * Lå før i tre filer: tilbudslisten, tilbudsskjemaet og ingenting som
 * regnet ut totalen likt. Et tilbud og en oversikt som viser to ulike tall
 * for samme avtale er verre enn at ett av dem mangler.
 */
export const PRIS: Record<string, { navn: string; mnd: number }> = {
  engangs: { navn: "Leverandørkontroll", mnd: 0 },
  standard: { navn: "Standard", mnd: 6900 },
  enterprise: { navn: "Enterprise", mnd: 12900 },
};

export const OFFERTSTATUS: StatusVal[] = [
  { verdi: "utkast", tekst: "Utkast", tone: "noytral" },
  { verdi: "skickad", tekst: "Skickad", tone: "advarsel" },
  { verdi: "akseptert", tekst: "Accepterad", tone: "god" },
  { verdi: "utgatt", tekst: "Utgången", tone: "brudd" },
  { verdi: "forlorad", tekst: "Förlorad", tone: "brudd" },
];

export type Offertrad = {
  plan: string;
  ar: number;
  rabatt: number;
  fritt_antall: number | null;
  fritt_pris: number | null;
};

export function regnUt(o: Offertrad) {
  const fritt = Boolean(o.fritt_antall && o.fritt_pris);
  const p = PRIS[o.plan] ?? { navn: o.plan, mnd: 0 };

  // Fritt tilbud er én avtalt sum. Da gjelder verken månedspris, løpetid
  // eller rabatt — de skal ikke smitte inn i totalen.
  const listepris = p.mnd * 12;
  const arsverdi = fritt ? o.fritt_pris! : listepris * (1 - o.rabatt / 100);
  const totalt = fritt ? o.fritt_pris! : arsverdi * o.ar;

  return {
    fritt,
    planNavn: fritt ? "Fritt erbjudande" : p.navn,
    manedspris: p.mnd,
    listepris,
    arsverdi: Math.round(arsverdi),
    rabattBelop: Math.round(listepris * (o.rabatt / 100)),
    totalt: Math.round(totalt),
  };
}

/** Tilbudsnummer, kort og lesbart. Uuid-en er riktig, men ikke til å lese opp. */
export const offertnummer = (id: string, opprettet: string) =>
  `O-${new Date(opprettet).getFullYear()}-${id.slice(0, 4).toUpperCase()}`;
