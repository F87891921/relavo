import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK, type Tone } from "@/components/ui";
import { FAKTUROR, FAKT_STATUS, KONTON } from "@/lib/demo/staff";

const TONE: Record<string, Tone> = {
  obetald: "advarsel",
  forfallen: "brudd",
  betald: "god",
  kreditnota: "noytral",
};

const kontoNamn = (id: string) => KONTON.find((k) => k.id === id)?.namn ?? id;

export default async function InterntFaktureringSide() {
  await krevAnsatt();

  const utestaende = FAKTUROR.filter(
    (f) => f.status === "obetald" || f.status === "forfallen",
  );
  const forfallna = FAKTUROR.filter((f) => f.status === "forfallen");

  return (
    <StaffShell aktivtSteg="Fakturering">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Fakturering"
          tekst="Fakturor per konto, med förfallodatum och status. Förfallna står rött och hamnar också under Att göra."
        />

        <Rad>
          <Tall verdi={String(FAKTUROR.length)} merke="fakturor" />
          <Tall
            verdi={`${NOK(utestaende.reduce((s, f) => s + f.belopp, 0))} kr`}
            merke="utestående"
          />
          <Tall
            verdi={String(forfallna.length)}
            merke="förfallna"
            tone={forfallna.length ? "brudd" : undefined}
          />
          <Tall
            verdi={`${NOK(FAKTUROR.filter((f) => f.status === "betald").reduce((s, f) => s + f.belopp, 0))} kr`}
            merke="betalt"
          />
        </Rad>

        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Fakturanr", "Konto", "Belopp", "Förfaller", "Status"]}
            rader={FAKTUROR.map((f) => [
              <span key="n" className="font-mono text-[12px] text-accent">{f.nr}</span>,
              <span key="k" className="font-semibold whitespace-nowrap">{kontoNamn(f.konto)}</span>,
              <span key="b" className="tabular-nums whitespace-nowrap">{NOK(f.belopp)} kr</span>,
              <span
                key="f"
                className={`whitespace-nowrap ${f.status === "forfallen" ? "text-bad font-semibold" : "text-dim"}`}
              >
                {f.forfall}
              </span>,
              <Merke key="s" tone={TONE[f.status] ?? "noytral"}>
                {FAKT_STATUS[f.status as keyof typeof FAKT_STATUS] ?? f.status}
              </Merke>,
            ])}
          />
        </Kort>
      </div>
    </StaffShell>
  );
}
