import { BEDRIFT, BEDRIFT_LOPETIDER, ENKELTKONTROLL, mndBedrift } from "../lib/priser";
let feil = 0;
for (const b of BEDRIFT) {
  if (b.maks === null) continue;
  for (const l of BEDRIFT_LOPETIDER) {
    const m = mndBedrift(b, l)!;
    const perLeverandor = (m * 12) / b.maks;
    const ok = perLeverandor < ENKELTKONTROLL;
    if (!ok) feil++;
    console.log(`${b.id.padEnd(6)} ${String(l).padStart(2)} mnd  ${String(m).padStart(6)}/mnd  ${perLeverandor.toFixed(0).padStart(4)} per leverandør/år  ${ok ? "ok" : "DYRERE ENN ENKELTKONTROLL"}`);
  }
}
process.exit(feil ? 1 : 0);
