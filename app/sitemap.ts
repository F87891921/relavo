import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const nå = new Date();
  return ["", "/juridisk", "/kontakt"].map((sti) => ({
    url: `https://relavo.no${sti}`,
    lastModified: nå,
  }));
}
