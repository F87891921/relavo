import type { MetadataRoute } from "next";

/**
 * Forsiden og de juridiske sidene skal kunne finnes. Alt bak innlogging, alle
 * API-ruter og de personlige lenkene (tilbud, ettersending, underleverandør)
 * skal ikke indekseres.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/juridisk", "/kontakt"],
        disallow: [
          "/api/",
          "/internt",
          "/oversikt",
          "/ny-kontroll",
          "/kontroll/",
          "/leverandorer",
          "/kjede",
          "/tilbud",
          "/konto",
          "/support",
          "/betaling",
          "/offert/",
          "/ettersending/",
          "/underleverandorer/",
          "/port",
        ],
      },
    ],
    sitemap: "https://relavo.no/sitemap.xml",
  };
}
