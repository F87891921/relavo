/**
 * Navnesammenligning for jav-kontrollen. Skrevet her i stedet for å hente
 * inn et bibliotek — det er tjue linjer, og et navnesøk som avgjør om noen
 * er inhabil bør være lesbart for den som skal etterprøve det.
 */

/**
 * Normaliserer bort det som ikke skiller personer fra hverandre: store og
 * små bokstaver, aksenter, bindestreker og doble mellomrom.
 *
 * æ, ø og å beholdes. De er egne bokstaver på norsk, ikke aksentvarianter,
 * og «Bjørn» og «Bjorn» kan være to forskjellige mennesker.
 */
export function normaliser(navn: string): string {
  return navn
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // fjerner aksenter, ikke æøå
    .replace(/[^a-zæøå\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Levenshtein-avstand: hvor mange enkelttegn som må settes inn, fjernes
 * eller byttes for å komme fra den ene strengen til den andre.
 *
 * To rader i stedet for hele matrisen — navn er korte, men det er unødig å
 * holde på rader vi er ferdige med.
 */
export function avstand(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let forrige = Array.from({ length: b.length + 1 }, (_, i) => i);
  let denne = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    denne[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const kostnad = a[i - 1] === b[j - 1] ? 0 : 1;
      denne[j] = Math.min(
        denne[j - 1] + 1,        // innsetting
        forrige[j] + 1,          // fjerning
        forrige[j - 1] + kostnad // bytte
      );
    }
    [forrige, denne] = [denne, forrige];
  }

  return forrige[b.length];
}

/**
 * Hvor mange tegns avvik som godtas per navneledd.
 *
 * Terskelen sto først på eksakt treff for navn til og med fem tegn. Da falt
 * «Holt» mot «Holth» utenfor — altså nettopp den skrivefeilen kontrollen
 * skal fange. For et varsel er en oversett kobling verre enn en ekstra å
 * granske, så fire tegn og oppover tåler nå ett avvik.
 *
 * Kravet om at hvert navneledd må finne sin make står igjen som sperre: to
 * ulike personer med samme etternavn gir fortsatt ikke treff.
 */
function toleranse(lengde: number): number {
  if (lengde <= 3) return 0;   // «Ola», «Nor» — for korte til å skille
  if (lengde <= 8) return 1;
  return 2;
}

export type Likhet =
  | { treff: false }
  | { treff: true; eksakt: boolean; avvik: number };

/**
 * Sammenligner to navn. Rekkefølgen på fornavn og etternavn ignoreres —
 * registrene skriver «Grongstad, Morten», folk skriver «Morten Grongstad».
 *
 * Krever at hvert ord finner sin make. Uten det ville «Anne Berg» og
 * «Anne Bergersen Lie» blitt regnet som samme person.
 */
export function liknerPa(a: string, b: string): Likhet {
  const ordA = normaliser(a).split(" ").filter(Boolean).sort();
  const ordB = normaliser(b).split(" ").filter(Boolean).sort();

  if (!ordA.length || !ordB.length) return { treff: false };
  if (ordA.length !== ordB.length) return { treff: false };

  let samletAvvik = 0;
  for (let i = 0; i < ordA.length; i++) {
    const d = avstand(ordA[i], ordB[i]);
    if (d > toleranse(Math.max(ordA[i].length, ordB[i].length)))
      return { treff: false };
    samletAvvik += d;
  }

  return { treff: true, eksakt: samletAvvik === 0, avvik: samletAvvik };
}
