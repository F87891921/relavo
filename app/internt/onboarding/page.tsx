import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Stripe } from "@/components/ui";
import { KONTON, PLANER } from "@/lib/demo/staff";

/**
 * Uppstarten, steg för steg. Ett konto räknas som igång först när det kört
 * sin första kontroll — inte när avtalet är påskrivet. Det är den enda
 * mätpunkten som säger något om kunden faktiskt kommit igång.
 */
const STEG = ["Avtal", "Konto skapat", "Användare inbjudna", "Leverantörer inlästa", "Första kontrollen"];

export default async function InterntOnboardingSide() {
  const { t } = await krevAnsatt();

  // Hur långt varje konto kommit utleds av demodatan: konton med
  // förbrukning har kört kontroller, konton med leverantörer har läst in dem.
  const rader = KONTON.map((k) => {
    let naddaSteg = 2;
    if (k.lev > 0) naddaSteg = 4;
    if (k.anvant > 0) naddaSteg = 5;
    return { ...k, naddaSteg, klar: naddaSteg === STEG.length };
  });

  return (
    <StaffShell aktivtSteg="onboarding">
      <Side>
        <Sidehode
          tittel={t.ansattsider.onboarding.tittel}
          tekst={t.ansattsider.onboarding.tekst}
        />
        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Konto", "Plan", "Framdrift", "Står på", "Kontakt", "Status"]}
            rader={rader.map((r) => [
              <span key="n" className="font-semibold whitespace-nowrap">{r.namn}</span>,
              <Merke key="p" tone={r.plan === "enterprise" ? "aksent" : "noytral"}>
                {PLANER[r.plan as keyof typeof PLANER]?.namn ?? r.plan}
              </Merke>,
              <div key="f" className="w-40">
                <div className="text-[11.5px] text-faint mb-1 tabular-nums">
                  {r.naddaSteg} av {STEG.length} steg
                </div>
                <Stripe
                  andel={(r.naddaSteg / STEG.length) * 100}
                  tone={r.klar ? "aksent" : "advarsel"}
                />
              </div>,
              <span key="s" className="text-dim whitespace-nowrap">
                {r.klar ? "—" : STEG[r.naddaSteg]}
              </span>,
              <span key="k" className="text-dim whitespace-nowrap">{r.kontakt}</span>,
              r.klar ? (
                <Merke key="st" tone="god">Igång</Merke>
              ) : (
                <Merke key="st" tone="advarsel">Under uppstart</Merke>
              ),
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
