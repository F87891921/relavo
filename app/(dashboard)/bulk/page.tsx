import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Sidehode } from "@/components/ui";
import { BulkListe } from "@/components/kontroll/BulkListe";

export default async function BulkSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Bulkkontroll">
      <div className="px-8 py-6 max-w-[760px]">
        <Sidehode
          tittel="Bulkkontroll"
          tekst="Lim inn organisasjonsnumrene til hele porteføljen og kjør kontroll på alle i én omgang."
        />
        <BulkListe />
      </div>
    </DashboardShell>
  );
}
