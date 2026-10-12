/**
 * Kommunene og innbyggertallene deres, fra SSB.
 *
 * Tabell 06913 er åpen og gratis. Tallet hentes, det skrives ikke inn: en
 * hardkodet liste er riktig den dagen den skrives og feil resten av året,
 * og en kommune som sammenligner med naboen ser det med en gang.
 *
 * Hele listen hentes i ett kall og holdes i minnet i et døgn. Uten det ville
 * hvert tastetrykk i søkefeltet på forsiden gå mot SSB.
 *
 * Tabellen inneholder også kommuner som er nedlagt (Halden (2020-2023) og
 * liknende). De står der med verdien 0, og uten filteret ville «Larvik»
 * truffet en gammel post først. Derfor filtreres alt uten innbyggere, og alt
 * med årstall i parentes, bort.
 */
const TABELL = "https://data.ssb.no/api/v0/no/table/06913";
const DOGN = 24 * 60 * 60 * 1000;

export type Kommune = {
  kode: string;
  navn: string;
  innbyggere: number;
  /** Året tallet gjelder, slik SSB oppgir det. */
  ar: string;
  /** Normalisert søketekst, med samisk navn og alt. */
  sok: string;
};

let minne: { t: number; liste: Kommune[] } | null = null;

/** «Bodø» → «bodo», «Kárášjohka» → «karasjohka». Søk skal ikke kreve riktig tegn. */
export const normaliser = (s: string) =>
  s
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/[øö]/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

async function hentFraSSB(): Promise<Kommune[]> {
  const metaRes = await fetch(TABELL, { next: { revalidate: 86_400 } });
  if (!metaRes.ok) throw new Error(`SSB metadata ${metaRes.status}`);
  const meta = await metaRes.json();

  const region = meta.variables.find((v: { code: string }) => v.code === "Region");
  const tid = meta.variables.find((v: { code: string }) => v.code === "Tid");
  const koder: string[] = region.values;
  const tekster: string[] = region.valueTexts;

  // Fire sifre er kommuner. To er fylker, seks er bydeler.
  const kommunekoder = koder.filter((k) => /^\d{4}$/.test(k));

  // Det nyeste året kan stå tomt en stund etter årsskiftet. Prøv to.
  const aar: string[] = [...tid.values].slice(-2).reverse();

  for (const ar of aar) {
    const res = await fetch(TABELL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: [
          { code: "Region", selection: { filter: "item", values: kommunekoder } },
          { code: "ContentsCode", selection: { filter: "item", values: ["Folkemengde"] } },
          { code: "Tid", selection: { filter: "item", values: [ar] } },
        ],
        response: { format: "json-stat2" },
      }),
    });
    if (!res.ok) continue;

    const d = await res.json();
    const verdier: (number | null)[] = d.value;
    const indeks: Record<string, number> = d.dimension.Region.category.index;
    const etikett: Record<string, string> = d.dimension.Region.category.label;

    const liste: Kommune[] = [];
    for (const kode of Object.keys(indeks)) {
      const innbyggere = verdier[indeks[kode]];
      const tekst = etikett[kode] ?? tekster[koder.indexOf(kode)] ?? "";
      if (!innbyggere || innbyggere <= 0) continue; // nedlagt eller uten tall
      if (/\(/.test(tekst)) continue; // «Halden (2020-2023)»
      liste.push({
        kode,
        // «Oslo - Oslove» og «Karasjok - Kárášjohka»: vis det norske navnet,
        // men la det samiske være søkbart.
        navn: tekst.split(" - ")[0].trim(),
        innbyggere,
        ar,
        sok: normaliser(tekst),
      });
    }
    if (liste.length > 300) return liste;
  }
  throw new Error("SSB ga ingen kommuner");
}

export async function kommuner(): Promise<Kommune[]> {
  if (minne && Date.now() - minne.t < DOGN) return minne.liste;
  try {
    const liste = await hentFraSSB();
    minne = { t: Date.now(), liste };
    return liste;
  } catch (e) {
    // Gammel liste er bedre enn ingen. Tallene endrer seg én gang i året.
    if (minne) return minne.liste;
    throw e;
  }
}

export async function sokKommune(q: string, maks = 6): Promise<Kommune[]> {
  const n = normaliser(q);
  if (n.length < 2) return [];
  const alle = await kommuner();

  const treff = alle.filter((k) => k.sok.includes(n));
  // Det som begynner med søket kommer først. «Os» skal gi Os før Moss.
  treff.sort((a, b) => {
    const sa = a.sok.startsWith(n) ? 0 : 1;
    const sb = b.sok.startsWith(n) ? 0 : 1;
    return sa - sb || a.navn.localeCompare(b.navn, "nb");
  });
  return treff.slice(0, maks);
}
