import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode } from "@/components/ui";
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
        <BulkListe />
      </Side>
    </DashboardShell>
  );
}
