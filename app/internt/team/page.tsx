import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke } from "@/components/ui";
import { TEAM, REVISION } from "@/lib/demo/staff";

export default async function InterntTeamSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Team och behörighet">
      <Side>
        <Sidehode
          tittel="Team och behörighet"
          tekst="Vilka vi är och vad var och en får se. Behörighet att läsa kunddata är skild från behörighet att ändra inställningar — den ena följer inte av den andra."
        />

        <Kort tittel="Anställda" className="mb-5">
          <Tabell
            kolonner={["", "Namn", "Roll", "Ändra inställningar", "Läsa kunddata", "Senast aktiv"]}
            rader={TEAM.map((t) => [
              <span
                key="i"
                className="w-7 h-7 rounded-lg bg-surface2 text-accent text-[10px] font-bold flex items-center justify-center"
              >
                {t.init}
              </span>,
              <span key="n" className="font-semibold whitespace-nowrap">{t.namn}</span>,
              <Merke key="r" tone="aksent">{t.roll}</Merke>,
              t.andra ? (
                <Merke key="a" tone="god">Ja</Merke>
              ) : (
                <span key="a" className="text-faint">Nej</span>
              ),
              t.las ? (
                <Merke key="l" tone="advarsel">Ja</Merke>
              ) : (
                <span key="l" className="text-faint">Nej</span>
              ),
              <span key="s" className="text-faint whitespace-nowrap">{t.aktiv}</span>,
            ])}
          />
        </Kort>

        <Kort tittel="Ändringar i behörighet och inställningar" note="revisionsspår">
          <Tabell
            kolonner={["Vem", "Vad", "Gällde", "Detalj", "Tid"]}
            rader={REVISION.map((r) => [
              <span
                key="v"
                className="w-7 h-7 rounded-lg bg-surface2 text-accent text-[10px] font-bold flex items-center justify-center"
              >
                {r.vem}
              </span>,
              <span key="w" className="font-semibold whitespace-nowrap">{r.vad}</span>,
              <span key="m" className="whitespace-nowrap">{r.mal}</span>,
              <span key="d" className="font-mono text-[12px] text-dim">{r.detalj}</span>,
              <span key="t" className="text-faint whitespace-nowrap">{r.tid}</span>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
