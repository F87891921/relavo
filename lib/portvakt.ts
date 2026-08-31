/**
 * Enkel portvakt foran hele siden. Dette er ikke innlogging — det er en
 * sperre som holder tilfeldig forbipasserende ute mens prototypen ligger
 * på et offentlig domene. Den ekte innloggingen mot Supabase ligger bak
 * denne, uendret.
 *
 * Passordet leses fra SIDE_PASSORD på serveren og sendes aldri til
 * nettleseren. Informasjonskapselen inneholder ikke passordet, men et
 * avtrykk av det — får noen tak i kapselen, får de ikke passordet.
 */
export const KAPSEL = "relavo_port";

/** SHA-256 via Web Crypto. Finnes både i middleware (Edge) og i Node. */
export async function avtrykk(passord: string): Promise<string> {
  const data = new TextEncoder().encode(`relavo:${passord}`);
  const sum = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(sum))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Sammenligner uten å avsløre hvor langt inn i strengen de skiller seg.
 * Overkill for en prototypsperre, men det koster ingenting å gjøre riktig.
 */
export function likeStrenger(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let ulikt = 0;
  for (let i = 0; i < a.length; i++) ulikt |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return ulikt === 0;
}
