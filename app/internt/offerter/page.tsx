import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK, type Tone } from "@/components/ui";
import { OFFERTER, STATUSTEXT, PLANER } from "@/lib/demo/staff";

const TONE: Record<string, Tone> = {
  utkast: "noytral",
  skickad: "advarsel",
  akseptert: "god",
  utgatt: "brudd",
};

export default async function InterntOfferterSide() {
  await krevAnsatt();

  const rader = OFFERTER.map((o) => {
    const plan = PLANER[o.plan as keyof typeof PLANER];
    const arsvarde = (plan?.pris ?? 0) * 12 * (1 - o.rabatt / 100);
    return { ...o, plan, arsvarde, totalt: arsvarde * o.ar };
  });

  return (
    <StaffShell aktivtSteg="Offerter">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Offerter"
          tekst="Skickade offerter, vad de är värda och när de går ut. Kontraktsvärdet är årspriset efter rabatt gånger antal år."
        />

        <Rad>
          <Tall verdi={String(OFFERTER.length)} merke="offerter" />
          <Tall
            verdi={String(OFFERTER.filter((o) => o.status === "skickad").length)}
            merke="väntar på svar"
          />
          <Tall
            verdi={`${NOK(Math.round(rader.reduce((s, r) => s + r.totalt, 0)))} kr`}
            merke="samlat kontraktsvärde"
          />
          <Tall
            verdi={String(OFFERTER.filter((o) => o.status === "akseptert").length)}
            merke="accepterade"
          />
        </Rad>

        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Ref", "Kund", "Plan", "Löptid", "Rabatt", "Årsvärde", "Kontraktsvärde", "Giltig t.o.m.", "Status"]}
            rader={rader.map((o) => [
              <span key="i" className="font-mono text-[12px] text-accent">{o.id}</span>,
              <span key="k" className="font-semibold whitespace-nowrap">{o.kund}</span>,
              <Merke key="p" tone={o.plan?.namn === "Enterprise" ? "aksent" : "noytral"}>
                {o.plan?.namn ?? o.plan}
              </Merke>,
              <span key="a" className="text-dim whitespace-nowrap">{o.ar} år</span>,
              <span key="r" className="tabular-nums text-dim">{o.rabatt} %</span>,
              <span key="v" className="tabular-nums whitespace-nowrap">{NOK(Math.round(o.arsvarde))}</span>,
              <span key="t" className="tabular-nums whitespace-nowrap font-semibold">{NOK(Math.round(o.totalt))}</span>,
              <span key="g" className="text-dim whitespace-nowrap">{o.giltigTil}</span>,
              <Merke key="s" tone={TONE[o.status] ?? "noytral"}>
                {STATUSTEXT[o.status as keyof typeof STATUSTEXT] ?? o.status}
              </Merke>,
            ])}
          />
        </Kort>
      </div>
    </StaffShell>
  );
}
