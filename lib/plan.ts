/**
 * Hva hver plan gir. Antallet speiler maks_brukere() i 0024 — endres den
 * ene må den andre følge med. Grensen håndheves i basen, ikke bare her.
 *
 * Prisene kommer fra lib/priser.ts. «standard» og «enterprise» er de gamle
 * planene; kontoer som allerede har dem beholder dem.
 */
import { NIVAER } from "@/lib/priser";

const nivaPlan = (id: string, navn: string) => {
  const n = NIVAER.find((x) => x.id === id)!;
  return {
    navn,
    brukere: 1000,
    pris: n.mnd ? `${n.mnd.toLocaleString("nb-NO").replace(/\u00a0/g, " ")} NOK/mnd` : "Etter offert",
    manedspris: n.mnd ?? 0,
  };
};

export const PLANER = {
  engangs: { navn: "Enkeltkontroll", brukere: 1, pris: "890 NOK per kontroll", manedspris: 0 },
  liten: nivaPlan("liten", "Liten"),
  kommune: nivaPlan("kommune", "Kommune"),
  medelstor: nivaPlan("medelstor", "Medelstor"),
  stor: nivaPlan("stor", "Stor"),
  start: { navn: "Start", brukere: 1000, pris: "2 900 NOK/mnd", manedspris: 2900 },
  vekst: { navn: "Vekst", brukere: 1000, pris: "5 900 NOK/mnd", manedspris: 5900 },
  bygg: { navn: "Bygg", brukere: 1000, pris: "11 900 NOK/mnd", manedspris: 11900 },
  standard: { navn: "Standard", brukere: 3, pris: "6 900 NOK/mnd", manedspris: 6900 },
  enterprise: { navn: "Enterprise", brukere: 10, pris: "12 900 NOK/mnd", manedspris: 12900 },
} as const;

export type PlanId = keyof typeof PLANER;

export function planFor(id: string | null | undefined) {
  return PLANER[(id ?? "kommune") as PlanId] ?? PLANER.kommune;
}
