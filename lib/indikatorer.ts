import type { Enhet } from "@/lib/brreg";
import type { Arsregnskap } from "@/lib/regnskap";
import { erRenholdsbransje } from "@/lib/renhold";

/**
 * Indikasjoner, ikke krav. De sier at noe er verdt et spørsmål, og er aldri
 * et brudd. Tersklene er grove tommelfingerregler for å fange det
 * uvanlige, ikke en bransjestatistikk: en kunde skal se tallet og tolke det.
 */
export type Indikator = { id: string; niva: "info" | "varsel"; tittel: string; tekst: string };

const MNOK = (n: number) => `${(n / 1_000_000).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} mill. kr`;
const BYGG = /bygg|anlegg|oppføring|elektrisk|rørlegg|maler|tømrer|tak|installasjon|betong|grave/i;

export function lagIndikatorer(e: Enhet, regnskap: Arsregnskap[], na = new Date()): Indikator[] {
  const ut: Indikator[] = [];
  const siste = regnskap.find((r) => r.driftsinntekter !== null);
  const ansatte = e.ansatte ?? 0;

  if (siste && siste.driftsinntekter !== null) {
    const ins = siste.driftsinntekter;

    if (ansatte > 0) {
      const per = ins / ansatte;
      const terskel = erRenholdsbransje(e.bransje) ? 1_500_000 : BYGG.test(e.bransje ?? "") ? 6_000_000 : 8_000_000;
      ut.push({
        id: "omsetning_per_ansatt",
        niva: per > terskel ? "varsel" : "info",
        tittel: `Omsetning per ansatt: ${MNOK(per)}`,
        tekst:
          per > terskel
            ? `Det ligger høyt for bransjen (${siste.aar}). Det kan bety at en stor del av arbeidet utføres av andre enn de ansatte. Be om en oversikt over underleverandører.`
            : `Regnskapet for ${siste.aar} viser ${MNOK(ins)} i driftsinntekter med ${ansatte} ansatte.`,
      });
    } else if (ins >= 5_000_000) {
      ut.push({
        id: "ingen_ansatte",
        niva: "varsel",
        tittel: "Omsetning uten registrerte ansatte",
        tekst: `Regnskapet for ${siste.aar} viser ${MNOK(ins)} i driftsinntekter, men selskapet har ingen registrerte ansatte. Arbeidet utføres trolig av andre. Be om en oversikt over underleverandører.`,
      });
    }

    const forrige = regnskap.find((r) => r.aar === siste.aar - 1 && r.driftsinntekter);
    if (forrige?.driftsinntekter && ins > forrige.driftsinntekter * 2 && ins >= 5_000_000)
      ut.push({
        id: "sterk_vekst",
        niva: "info",
        tittel: "Kraftig vekst i omsetningen",
        tekst: `Driftsinntektene mer enn doblet seg fra ${forrige.aar} til ${siste.aar} (${MNOK(forrige.driftsinntekter)} til ${MNOK(ins)}).`,
      });
  }

  if (siste?.egenkapital !== null && siste?.egenkapital !== undefined && siste.egenkapital < 0)
    ut.push({
      id: "negativ_egenkapital",
      niva: "varsel",
      tittel: "Negativ egenkapital",
      tekst: `Egenkapitalen var ${MNOK(siste.egenkapital)} i ${siste.aar}. Det er et tegn på svak økonomi.`,
    });

  const reg = e.registrert ? new Date(e.registrert) : null;
  const manader = reg ? (na.getTime() - reg.getTime()) / (30.4 * 86_400_000) : null;
  if (manader !== null && manader < 24)
    ut.push({ id: "nystiftet", niva: "info", tittel: "Nystiftet selskap", tekst: `Registrert for ${Math.max(1, Math.round(manader))} måneder siden. Det er lite historikk å vurdere.` });
  else if (!regnskap.length && manader !== null && manader >= 18)
    ut.push({ id: "ingen_regnskap", niva: "info", tittel: "Regnskap ikke funnet", tekst: "Det ligger ikke noe innlevert årsregnskap i Regnskapsregisteret." });

  return ut;
}
