import type { MetadataRoute } from "next";
import { OPPDATERT, VEILEDNINGER } from "./veiledning/innhold";

/**
 * lastModified for veiledningssidene er datoen innholdet sist ble endret
 * (OPPDATERT i innhold.ts), ikke tidspunktet sitemapen ble bygget. Et
 * sitemap som sier «endret nå» ved hvert bygg lærer Google å ignorere datoen.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const nå = new Date();
  const faste = ["", "/juridisk", "/kontakt"].map((sti) => ({
    url: `https://relavo.no${sti}`,
    lastModified: nå,
  }));
  const veiledning = [
    { url: "https://relavo.no/veiledning", lastModified: new Date(OPPDATERT) },
    ...VEILEDNINGER.map((v) => ({
      url: `https://relavo.no/veiledning/${v.slug}`,
      lastModified: new Date(OPPDATERT),
    })),
  ];
  return [...faste, ...veiledning];
}
