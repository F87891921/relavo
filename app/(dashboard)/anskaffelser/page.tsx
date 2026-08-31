import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke } from "@/components/ui";
import { ANSKAFFELSER } from "@/lib/demo/app";

export default async function AnskaffelserSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Anskaffelser">
      <Side>
        <Sidehode
          tittel="Anskaffelser"
          tekst="Avtalene kontrollene henger på. Saksnummeret her er det samme du fører i anskaffelsesprotokollen."
        />
        <Kort note="fra prototypens demodata">
          <Tabell
            kolonner={["Saksnummer", "Anskaffelse", "Konkurranseform", "Avtaleverdi", "Periode", "Kontroller"]}
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
