import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Sidehode, Kort, Tabell, Merke } from "@/components/ui";
import { LOGG } from "@/lib/demo/staff";

export default async function InterntLoggSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Åtkomstlogg">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Åtkomstlogg"
          tekst="Vem hos oss har öppnat vilken kunds data, och varför. Loggen ska kunna visas upp för kunden utan att vi först måste städa i den."
        />

        <div className="bg-surface2 text-accent text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
          Varje uppslag kräver en angiven anledning. Rader utan anledning
          hade varit värdelösa vid en granskning — därför finns fältet inte
          som valfritt.
        </div>

        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Vem", "Konto", "Vad", "Gällde", "Anledning", "Tid"]}
            rader={LOGG.map((l) => [
              <div key="v" className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-surface2 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">
                  {l.vem}
                </span>
                <span className="font-semibold whitespace-nowrap">{l.namn}</span>
              </div>,
              <Merke key="k" tone="aksent">{l.konto}</Merke>,
              <span key="w" className="text-dim">{l.vad}</span>,
              <span key="r" className="whitespace-nowrap">{l.ref}</span>,
              <span key="a" className="text-dim">{l.varfor}</span>,
              <span key="t" className="text-faint whitespace-nowrap">{l.tid}</span>,
            ])}
          />
        </Kort>
      </div>
    </StaffShell>
  );
}
