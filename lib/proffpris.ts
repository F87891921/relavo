/**
 * Prisene i avtalen med Proff (Annex 3), kr uten mva.
 * Fastbeløpet er årslisensene: Proff API 12 000, Credit API 6 000, Compliance API 8 000.
 * Oppdateres når Proff justerer prisene (KPI hvert år).
 */
export const PROFF_PRIS = {
  rating: 5,
  betalingsanmerkninger: 20,
  sanksjon: 5,
  pep: 5,
  fastAar: 26_000,
};

/** Antall vellykkede, fakturerbare anrop i en kontroll. */
export type Proffbruk = { kredit: number; sanksjon: number; pep: number };

export const nyBruk = (): Proffbruk => ({ kredit: 0, sanksjon: 0, pep: 0 });

export const proffKostnad = (b: Proffbruk) =>
  b.kredit * (PROFF_PRIS.rating + PROFF_PRIS.betalingsanmerkninger) +
  b.sanksjon * PROFF_PRIS.sanksjon +
  b.pep * PROFF_PRIS.pep;
