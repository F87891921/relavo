import type { no } from "./no";

/**
 * Det klientkomponentene har lov til å importere.
 *
 * Ligger skilt fra index.ts fordi den leser cookies() og headers(), og alt
 * som importerer den blir dermed serverkode. Språkvelgeren er en knapp man
 * trykker på — den må kunne importere kodene uten å dra med seg halve
 * serveren inn i nettleserbunten.
 */
export type Sprak = "no" | "sv" | "en";
export type Ordbok = typeof no;

export const SPRAK: { kode: Sprak; navn: string; kort: string }[] = [
  { kode: "no", navn: "Norsk", kort: "NO" },
  { kode: "sv", navn: "Svenska", kort: "SV" },
  { kode: "en", navn: "English", kort: "EN" },
];

export const KAPSEL_SPRAK = "relavo_sprak";

export const erSprak = (v: unknown): v is Sprak =>
  v === "no" || v === "sv" || v === "en";
