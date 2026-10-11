/**
 * Hva hver plan gir. Antallet speiler maks_brukere() i 0005 — endres den
 * ene må den andre følge med. Grensen håndheves i basen, ikke bare her.
 */
export const PLANER = {
  engangs: {
    navn: "Leverandørkontroll",
    brukere: 1,
    pris: "590 NOK per kontroll",
    /** Null fordi den ikke har noen. Den skal ikke telle i månedsinntekten. */
    manedspris: 0,
  },
  standard: { navn: "Standard", brukere: 3, pris: "6 900 NOK/mnd", manedspris: 6900 },
  enterprise: { navn: "Enterprise", brukere: 10, pris: "12 900 NOK/mnd", manedspris: 12900 },
} as const;

export type PlanId = keyof typeof PLANER;

export function planFor(id: string | null | undefined) {
  return PLANER[(id ?? "standard") as PlanId] ?? PLANER.standard;
}
