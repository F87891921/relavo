import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, Stripe, NOK } from "@/components/ui";
import { KONTON, PLANER } from "@/lib/demo/staff";

export default async function InterntKontonSide() {
  const { t } = await krevAnsatt();

  const mrr = KONTON.reduce(
    (s, k) => s + (PLANER[k.plan as keyof typeof PLANER]?.pris ?? 0),
    0,
  );

  return (
    <StaffShell aktivtSteg="konton">
      <Side>
        <Sidehode
          tittel={t.ansattsider.konton.tittel}
          tekst={t.ansattsider.konton.tekst}
        />

        <Rad>
          <Tall verdi={String(KONTON.length)} merke="aktiva konton" />
          <Tall verdi={`${NOK(mrr)} kr`} merke="månadsintäkt" />
          <Tall
            verdi={String(KONTON.reduce((s, k) => s + k.lev, 0))}
            merke="leverantörer under kontroll"
          />
          <Tall
            verdi={String(KONTON.reduce((s, k) => s + k.overvak, 0))}
            merke="under löpande övervakning"
          />
        </Rad>

        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Konto", "Enhet", "Plan", "Förbrukning", "Leverantörer", "Kontakt", "Avtal t.o.m.", "Senast"]}
            rader={KONTON.map((k) => {
              const plan = PLANER[k.plan as keyof typeof PLANER];
              const andel = plan ? Math.round((k.anvant / plan.kvot) * 100) : 0;
              return [
                <span key="n" className="font-semibold">{k.namn}</span>,
                <span key="e" className="text-dim">{k.enhet}</span>,
                <Merke key="p" tone={k.plan === "enterprise" ? "aksent" : "noytral"}>
                  {plan?.namn ?? k.plan}
                </Merke>,
                <div key="f" className="w-32">
                  <div className="flex justify-between text-[11.5px] mb-1">
                    <span className="tabular-nums">{k.anvant}</span>
                    <span className="text-faint tabular-nums">/ {plan?.kvot}</span>
                  </div>
                  <Stripe andel={andel} tone={andel > 90 ? "brudd" : andel > 75 ? "advarsel" : "aksent"} />
                </div>,
                <span key="l" className="tabular-nums">{k.lev}</span>,
                <div key="k">
                  <div>{k.kontakt}</div>
                  <div className="text-[11.5px] text-faint">{k.epost}</div>
                </div>,
                <span key="a" className="text-dim whitespace-nowrap">{k.avtal}</span>,
                <span key="s" className="text-faint whitespace-nowrap">{k.sist}</span>,
              ];
            })}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
