import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, type Tone } from "@/components/ui";
import { ARENDEN, ARENDE_STATUS, KONTON } from "@/lib/demo/staff";

const TONE: Record<string, Tone> = {
  obesvarad: "brudd",
  oppna: "advarsel",
  besvarad: "god",
  lukket: "noytral",
};

const kontoNamn = (id: string) => KONTON.find((k) => k.id === id)?.namn ?? id;

export default async function InterntSupportSide() {
  await krevAnsatt();

  const obesvarade = ARENDEN.filter((a) => a.status === "obesvarad");

  return (
    <StaffShell aktivtSteg="Support">
      <Side>
        <Sidehode
          tittel="Support"
          tekst="Ärenden från alla konton. Kolumnen väntat räknar dagar sedan kunden senast hörde något från oss."
        />

        <Rad>
          <Tall verdi={String(ARENDEN.length)} merke="ärenden totalt" />
          <Tall
            verdi={String(obesvarade.length)}
            merke="obesvarade"
            tone={obesvarade.length ? "brudd" : undefined}
          />
          <Tall
            verdi={String(Math.max(0, ...ARENDEN.map((a) => a.vantat)))}
            merke="längst väntetid, dagar"
          />
          <Tall
            verdi={String(ARENDEN.filter((a) => a.innsyn).length)}
            merke="med insyn i kunddata"
          />
        </Rad>

        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Ärende", "Konto", "Kategori", "Ämne", "Insyn", "Väntat", "Ansvarig", "Status"]}
            rader={ARENDEN.map((a) => [
              <span key="i" className="font-mono text-[12px] text-accent">{a.id}</span>,
              <span key="k" className="whitespace-nowrap">{kontoNamn(a.konto)}</span>,
              <span key="ka" className="text-dim">{a.kategori}</span>,
              <div key="e">
                <div className="font-semibold">{a.emne}</div>
                {a.sista && (
                  <div className="text-[11.5px] text-faint mt-0.5 max-w-[42ch]">
                    {a.sista}
                  </div>
                )}
              </div>,
              a.innsyn ? <Merke key="in" tone="aksent">Ja</Merke> : <span key="in" className="text-faint">Nej</span>,
              <span key="v" className={`tabular-nums ${a.vantat > 2 ? "text-bad font-semibold" : "text-dim"}`}>
                {a.vantat} d
              </span>,
              <span key="an" className="text-dim">{a.ansvarig || "—"}</span>,
              <Merke key="s" tone={TONE[a.status] ?? "noytral"}>
                {ARENDE_STATUS[a.status as keyof typeof ARENDE_STATUS] ?? a.status}
              </Merke>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
