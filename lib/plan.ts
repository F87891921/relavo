/**
 * Hva hver plan gir. Antallet speiler maks_brukere() i 0005 — endres den
 * ene må den andre følge med. Grensen håndheves i basen, ikke bare her.
 */
export const PLANER = {
  engangs: { navn: "Leverandørkontroll", brukere: 1, pris: "590 NOK per kontroll" },
  standard: { navn: "Standard", brukere: 3, pris: "6 900 NOK/mnd" },
  enterprise: { navn: "Enterprise", brukere: 10, pris: "12 900 NOK/mnd" },
} as const;

export type PlanId = keyof typeof PLANER;

export function planFor(id: string | null | undefined) {
  return PLANER[(id ?? "standard") as PlanId] ?? PLANER.standard;
}
