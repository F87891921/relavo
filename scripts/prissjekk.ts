import { BEDRIFT, BEDRIFT_LOPETIDER, ENKELTKONTROLL, mndBedrift } from "../lib/priser";

/**
 * Prisreglene for selskap, kjørt mot lib/priser.ts:
 *  1. Prenumerasjonen er billigere enn enkeltkontroller per leverandør, også
 *     når planen er full og man betaler månedlig.
 *  2. Det lønner seg å gå opp et nivå: prisen per leverandør faller for hvert
 *     nivå, for hver bindingstid.
 */
let feil = 0;
const nivaer = BEDRIFT.filter((b) => b.maks !== null);

for (const b of nivaer) {
  for (const l of BEDRIFT_LOPETIDER) {
    const m = mndBedrift(b, l)!;
    const per = (m * 12) / b.maks!;
    const ok = per < ENKELTKONTROLL;
    if (!ok) feil++;
    console.log(`${b.id.padEnd(6)} ${String(l).padStart(2)} mnd  ${String(m).padStart(6)}/mnd  ${per.toFixed(0).padStart(4)}/lev/år  ${ok ? "ok" : "DYRERE ENN ENKELTKONTROLL"}`);
  }
}

for (const l of BEDRIFT_LOPETIDER) {
  for (let i = 1; i < nivaer.length; i++) {
    const a = nivaer[i - 1], b = nivaer[i];
    const pa = mndBedrift(a, l)! / a.maks!;
    const pb = mndBedrift(b, l)! / b.maks!;
    if (!(pb < pa)) {
      feil++;
      console.log(`${l} mnd: ${b.id} (${pb.toFixed(1)}/lev) er ikke billigere per leverandør enn ${a.id} (${pa.toFixed(1)}/lev)`);
    }
  }
}
console.log(feil ? `${feil} feil` : "alle regler holder");
process.exit(feil ? 1 : 0);
