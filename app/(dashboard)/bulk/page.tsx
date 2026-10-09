import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode } from "@/components/ui";
import { Flikar } from "@/components/ui/Flikar";
import { BulkListe } from "@/components/kontroll/BulkListe";

export default async function BulkSide() {
  const { profil, t } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="bulk">
      <Side smal>
        <Sidehode
          tittel={t.sider.bulk.tittel}
          tekst={t.sider.bulk.tekst}
        />

        <Flikar
          flikar={[
            { navn: t.meny.enKontroll, href: "/ny-kontroll", aktiv: false },
            { navn: t.meny.flereKontroller, href: "/bulk", aktiv: true },
          ]}
        />

        <BulkListe />
      </Side>
    </DashboardShell>
  );
}
