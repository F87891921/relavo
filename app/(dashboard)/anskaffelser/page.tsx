import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke } from "@/components/ui";
import { ANSKAFFELSER } from "@/lib/demo/app";

export default async function AnskaffelserSide() {
  const { profil, t } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="anskaffelser">
      <Side>
        <Sidehode
          tittel={t.sider.anskaffelser.tittel}
          tekst={t.sider.anskaffelser.tekst}
        />
        <Kort note={t.ui.demodata}>
          <Tabell
            kolonner={[
              t.ui.saksnummer,
              t.ui.anskaffelse,
              t.ui.konkurranseform,
              t.ui.avtaleverdi,
              t.ui.periode,
              t.ui.kontroller,
            ]}
            rader={ANSKAFFELSER.map((a) => [
              <span key="i" className="font-mono text-[12px] text-accent">{a.id}</span>,
              <span key="n" className="font-semibold">{a.navn}</span>,
              <span key="t" className="text-dim">{a.type}</span>,
              <span key="v" className="tabular-nums whitespace-nowrap">{a.verdi}</span>,
              <span key="p" className="text-dim whitespace-nowrap">{a.periode}</span>,
              <Merke key="k" tone="aksent">{a.kontroller}</Merke>,
            ])}
          />
        </Kort>
      </Side>
    </DashboardShell>
  );
}
