import { krevSuperadmin } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke } from "@/components/ui";
import { LOGG } from "@/lib/demo/staff";

export default async function InterntLoggSide() {
  const { t } = await krevSuperadmin();

  return (
    <StaffShell aktivtSteg="logg">
      <Side>
        <Sidehode
          tittel={t.ansattsider.logg.tittel}
          tekst={t.ansattsider.logg.tekst}
        />

        <div className="bg-surface2 text-accent text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
          Varje uppslag kräver en angiven anledning. Rader utan anledning
          hade varit värdelösa vid en granskning — därför finns fältet inte
          som valfritt.
        </div>

        <Kort note={t.internt.demodataStaff}>
          <Tabell
            kolonner={["Vem", t.internt.konto, t.internt.vad, t.internt.gjaldt, t.internt.begrunnelse, "Tid"]}
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
      </Side>
    </StaffShell>
  );
}
