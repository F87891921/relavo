/**
 * Passordkravene, ett sted. Brukes både av skjemaet i nettleseren (så folk
 * ser hva som mangler mens de skriver) og av /api/opprett-konto (så kravene
 * faktisk håndheves, ikke bare vises). Validering som bare finnes i
 * nettleseren er en anbefaling, ikke et krav.
 */
export const MIN_LENGDE = 12;

export type Krav = {
  id: string;
  tekst: string;
  oppfylt: (passord: string, epost: string) => boolean;
};

export const KRAV: Krav[] = [
  {
    id: "lengde",
    tekst: `Minst ${MIN_LENGDE} tegn`,
    oppfylt: (p) => p.length >= MIN_LENGDE,
  },
  {
    id: "liten",
    tekst: "Minst én liten bokstav",
    oppfylt: (p) => /\p{Ll}/u.test(p),
  },
  {
    id: "stor",
    tekst: "Minst én stor bokstav",
    oppfylt: (p) => /\p{Lu}/u.test(p),
  },
  {
    id: "siffer",
    tekst: "Minst ett tall",
    oppfylt: (p) => /\d/.test(p),
  },
  {
    id: "spesial",
    tekst: "Minst ett spesialtegn (!?#$ …)",
    // Alt som verken er bokstav, tall eller mellomrom. Dekker også æøå-
    // tastaturets tegn, ikke bare den engelske ASCII-rekka.
    oppfylt: (p) => /[^\p{L}\p{N}\s]/u.test(p),
  },
  {
    id: "ikke-epost",
    tekst: "Kan ikke inneholde e-postadressen din",
    oppfylt: (p, epost) => {
      const navn = epost.split("@")[0]?.trim().toLowerCase();
      if (!navn || navn.length < 3) return true;
      return !p.toLowerCase().includes(navn);
    },
  },
];

/** Returnerer id-ene til kravene som ikke er oppfylt. Tom liste = godkjent. */
export function manglendeKrav(passord: string, epost: string): string[] {
  return KRAV.filter((k) => !k.oppfylt(passord, epost)).map((k) => k.id);
}

export function erGyldig(passord: string, epost: string): boolean {
  return manglendeKrav(passord, epost).length === 0;
}
