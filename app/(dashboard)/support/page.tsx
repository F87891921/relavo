import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, type Tone } from "@/components/ui";
import { SAKER, SAK_STATUS } from "@/lib/demo/app";

const TONE: Record<string, Tone> = {
  apen: "aksent",
  venter: "advarsel",
  lukket: "noytral",
};

export default async function SupportSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Brukerstøtte">
      <Side>
        <Sidehode
          tittel="Brukerstøtte"
          tekst="Saker dere har meldt inn. Saker merket med innsyn betyr at dere har gitt Relavo lov til å se dataene saken gjelder."
        />
        <Kort note="fra prototypens demodata">
          <Tabell
            kolonner={["Sak", "Emne", "Kategori", "Innsyn", "Opprettet", "Sist oppdatert", "Status"]}
            rader={SAKER.map((s) => [
              <span key="i" className="font-mono text-[12px] text-accent">{s.id}</span>,
              <div key="e">
                <div className="font-semibold">{s.emne}</div>
                {s.svar?.length ? (
                  <div className="text-[11.5px] text-faint mt-0.5">
                    {s.svar.length} meldinger
                  </div>
                ) : null}
              </div>,
              <span key="k" className="text-dim">{s.kategori}</span>,
              s.innsyn ? (
                <Merke key="in" tone="aksent">Gitt</Merke>
              ) : (
                <span key="in" className="text-faint">Ikke gitt</span>
              ),
              <span key="o" className="text-dim whitespace-nowrap">{s.opprettet}</span>,
              <span key="u" className="text-dim whitespace-nowrap">{s.oppdatert}</span>,
              <Merke key="s" tone={TONE[s.status] ?? "noytral"}>
                {SAK_STATUS[s.status as keyof typeof SAK_STATUS] ?? s.status}
              </Merke>,
            ])}
          />
        </Kort>
      </Side>
    </DashboardShell>
  );
}
