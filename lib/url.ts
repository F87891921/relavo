import { headers } from "next/headers";

/**
 * Adressen siden faktisk kjører på, hentet fra forespørselen.
 *
 * Lenkene vi sender ut må peke på riktig sted uansett om det er relavo.no,
 * en forhåndsvisning på vercel.app eller localhost — og en miljøvariabel til
 * som kan bli stående feil er en miljøvariabel for mye.
 */
export function grunnUrl(): string {
  const h = headers();
  const vert = h.get("host") ?? "relavo.no";
  const protokoll =
    h.get("x-forwarded-proto") ?? (vert.startsWith("localhost") ? "http" : "https");
  return `${protokoll}://${vert}`;
}
