/**
 * Prisene, ett sted.
 *
 * Prisen følger kommunens innbyggertall. Ikke antall brukere, ikke antall
 * kontroller: en kommune kan ikke prises per ansatt slik et vanlig selskap
 * kan, og å ta betalt per kontroll straffer akkurat den atferden produktet
 * finnes for. Kontrollplikten gjelder alle avtaler, så hver ny leverandør
 * skal ikke koste mer.
 *
 * Innbyggertallet er det eneste tallet som er offentlig, som ikke kan
 * tøyes, og som kommunen kan budsjettere mot før de har snakket med oss.
 *
 * Nivåene er satt slik at en 12-måneders avtale holder seg under
 * innslagspunktet i anskaffelsesloven (500 000 kr eksl. mva.), også med
 * 36 måneder på det dyreste listeprisede nivået: 12 900 × 36 × 0,85 ≈ 396 000.
 * Det er hele poenget med å ha listepriser — kommunen kan føre dem rett inn
 * som anslag på avtalens verdi. «Stor» har ikke listepris fordi 12 måneder
 * til den prisen ligger nær grensen og bør settes av oss, i en offert, ikke
 * leses av en tabell.
 *
 * Avtalen er tolv måneder fast uten automatisk fornyelse og uten optioner.
 * Optioner teller med i verdien, og tidsubegrensede avtaler regnes som
 * månedsverdi × 48 (forskriften § 5-4). Skriv aldri «løpende» på en pris.
 */
export type NivaId = "liten" | "kommune" | "medelstor" | "stor";

export type Niva = {
  id: NivaId;
  /** Fra og med. */
  fra: number;
  /** Til, ikke inkludert. Null betyr ingen øvre grense. */
  til: number | null;
  /** Kroner per måned eksl. mva. ved 12 måneder. Null: offert. */
  mnd: number | null;
};

export const NIVAER: Niva[] = [
  { id: "liten", fra: 0, til: 10_000, mnd: 3_900 },
  { id: "kommune", fra: 10_000, til: 25_000, mnd: 7_900 },
  { id: "medelstor", fra: 25_000, til: 50_000, mnd: 12_900 },
  { id: "stor", fra: 50_000, til: null, mnd: null },
];

/** Rabatt for 36 måneder. Gjelder ikke «stor», som er offert. */
export const RABATT_36 = 0.15;

/** Avtaletid kunden kan velge, og rabatten for hver. 24 er satt midt imellom. */
export const LOPETIDER = [12, 24, 36] as const;
export type Lopetid = (typeof LOPETIDER)[number];
export const RABATT: Record<Lopetid, number> = { 12: 0, 24: 0.08, 36: RABATT_36 };

/** Månedspris ved valgt avtaletid, rundet til nærmeste hundrelapp. Null: offert. */
export function mndFor(n: { mnd: number | null }, lopetid: Lopetid): number | null {
  if (n.mnd === null) return null;
  return Math.round((n.mnd * (1 - RABATT[lopetid])) / 100) * 100;
}

/** Enkeltkontroll, kroner eksl. mva. Ingen abonnement. */
export const ENKELTKONTROLL = 890;

export function nivaFor(innbyggere: number): Niva {
  return (
    NIVAER.find((n) => innbyggere >= n.fra && (n.til === null || innbyggere < n.til)) ??
    NIVAER[NIVAER.length - 1]
  );
}

/** Månedspris ved 36 måneder, rundet til nærmeste hundrelapp. */
export function mnd36(n: Niva): number | null {
  if (n.mnd === null) return null;
  return Math.round((n.mnd * (1 - RABATT_36)) / 100) * 100;
}

/** 12 900 → «12 900». Vanlig mellomrom, så det kopieres rent. */
export const kr = (n: number) =>
  n.toLocaleString("nb-NO").replace(/ /g, " ");

/**
 * Selskap som ikke er kommune. Innbyggertall finnes ikke, så prisen følger
 * antall leverandører de følger — det er det som gir dem kostnad og nytte.
 * Foreløpige priser: de skal justeres når vi kjenner kostnaden for
 * kredittdata. Selvbetjent bestilling venter på at grensen håndheves, så
 * foreløpig går de via tilbud.
 */
export type BedriftId = "start" | "vekst" | "bygg" | "stor";
export const BEDRIFT: { id: BedriftId; maks: number | null; mnd: number | null }[] = [
  { id: "start", maks: 25, mnd: 2_000 },
  { id: "vekst", maks: 100, mnd: 5_900 },
  { id: "bygg", maks: 300, mnd: 11_900 },
  { id: "stor", maks: null, mnd: null },
];

/**
 * Selskap kan også betale måned for måned, uten binding. Det er dyrest: den som
 * binder seg lenger betaler mindre per måned (12 → 24 → 36), og den som ikke
 * binder seg betaler et påslag. Kommuner har ikke månedspris — de kjøper
 * alltid minst tolv måneder.
 */
export const BEDRIFT_LOPETIDER = [1, 12, 24, 36] as const;
export type BedriftLopetid = (typeof BEDRIFT_LOPETIDER)[number];
export const MND_PAASLAG = 0.15;

export function mndBedrift(b: { mnd: number | null }, l: BedriftLopetid): number | null {
  if (b.mnd === null) return null;
  if (l === 1) return Math.round((b.mnd * (1 + MND_PAASLAG)) / 100) * 100;
  return mndFor(b, l);
}
