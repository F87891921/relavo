/**
 * EUs konsoliderte sanksjonsliste.
 *
 * Fila ligger åpent med et fast, offentlig token — det er slik EU
 * publiserer den, ikke en nøkkel vi har fått.
 *
 * Lista identifiserer med navn, ikke med organisasjonsnummer. Alt dette
 * kan gi er en screening: et navn som ligner nok til at et menneske bør se
 * på det. Et selskap som feilaktig merkes som sanksjonert er rammet hardt
 * og urettmessig, så ordene rundt treffet er like viktige som treffet.
 */
export const SANKSJON_URL =
  "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw";

export type Oppforing = {
  navn: string;
  slag: "person" | "enhet";
  program: string | null;
  referanse: string | null;
};

/**
 * Plukker navn ut av XML-en med regex.
 *
 * Fila er 25 MB. En full parser ville holdt hele treet i minnet for å
 * hente to attributter per rad — her trengs bare wholeName og hvilken
 * enhet det hører til, og strukturen er flat nok til at det holder.
 */
export function parseSanksjoner(xml: string): {
  generert: string | null;
  oppforinger: Oppforing[];
} {
  const generert =
    /generationDate="([^"]+)"/.exec(xml)?.[1] ?? null;

  const ut: Oppforing[] = [];
  const sett = new Set<string>();

  // Hver <sanctionEntity> har én subjectType og mange <nameAlias>.
  const biter = xml.split("<sanctionEntity");
  for (const bit of biter.slice(1)) {
    const slag =
      /<subjectType[^>]*code="person"/.test(bit) ? "person" : "enhet";
    const referanse = /euReferenceNumber="([^"]*)"/.exec(bit)?.[1] || null;
    const program = /programme="([^"]*)"/.exec(bit)?.[1] || null;

    for (const m of bit.matchAll(/wholeName="([^"]+)"/g)) {
      const navn = m[1]
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();

      // Ett tegn eller to er ikke et navn, det er støy som ville truffet alt.
      if (navn.length < 4) continue;

      const nokkel = `${slag}|${navn.toLowerCase()}`;
      if (sett.has(nokkel)) continue;
      sett.add(nokkel);

      ut.push({ navn, slag, program, referanse });
    }
  }

  return { generert, oppforinger: ut };
}
