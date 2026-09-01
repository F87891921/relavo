import { krevSuperadmin } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK } from "@/components/ui";
import { KONTON, PLANER, KALLOR } from "@/lib/demo/staff";

/**
 * Marginalen per konto. Kostnaden är summan av uppslagen kontot gjort,
 * prissatt per källa. Källor som inte kostar något (Enhetsregisteret) drar
 * ner styckkostnaden, och det är hela poängen med att visa den här.
 */
const KOSTNAD_PER_UPPSLAG =
  KALLOR.reduce((s, k) => s + k.kostnad, 0) / Math.max(1, KALLOR.length);

export default async function InterntMarginalSide() {
  const { t } = await krevSuperadmin();

  const rader = KONTON.map((k) => {
    const plan = PLANER[k.plan as keyof typeof PLANER];
    const intakt = plan?.pris ?? 0;
    const kostnad = Math.round(k.anvant * KOSTNAD_PER_UPPSLAG);
    const marginal = intakt - kostnad;
    const andel = intakt ? Math.round((marginal / intakt) * 100) : 0;
    return { ...k, plan, intakt, kostnad, marginal, andel };
  });

  const sumIntakt = rader.reduce((s, r) => s + r.intakt, 0);
  const sumKostnad = rader.reduce((s, r) => s + r.kostnad, 0);

  return (
    <StaffShell aktivtSteg="marginal">
      <Side>
        <Sidehode
          tittel={t.ansattsider.marginal.tittel}
          tekst={t.ansattsider.marginal.tekst}
        />

        <Rad>
          <Tall verdi={`${NOK(sumIntakt)} kr`} merke="intäkt per månad" />
          <Tall verdi={`${NOK(sumKostnad)} kr`} merke="uppslagskostnad" />
          <Tall verdi={`${NOK(sumIntakt - sumKostnad)} kr`} merke="marginal" />
          <Tall
            verdi={`${Math.round(((sumIntakt - sumKostnad) / Math.max(1, sumIntakt)) * 100)} %`}
            merke="marginal i procent"
          />
        </Rad>

        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Konto", "Plan", "Uppslag", "Intäkt", "Kostnad", "Marginal", ""]}
            rader={rader.map((r) => [
              <span key="n" className="font-semibold">{r.namn}</span>,
              <Merke key="p" tone={r.plan?.namn === "Enterprise" ? "aksent" : "noytral"}>
                {r.plan?.namn ?? "—"}
              </Merke>,
              <span key="u" className="tabular-nums">{r.anvant}</span>,
              <span key="i" className="tabular-nums whitespace-nowrap">{NOK(r.intakt)}</span>,
              <span key="k" className="tabular-nums whitespace-nowrap text-dim">{NOK(r.kostnad)}</span>,
              <span
                key="m"
                className={`tabular-nums whitespace-nowrap font-semibold ${r.marginal < 0 ? "text-bad" : ""}`}
              >
                {NOK(r.marginal)}
              </span>,
              <Merke key="a" tone={r.andel < 0 ? "brudd" : r.andel < 40 ? "advarsel" : "god"}>
                {r.andel} %
              </Merke>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
