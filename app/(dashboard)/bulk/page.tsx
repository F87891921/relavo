import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function BulkSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Bulkkontroll" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Bulkkontroll</h1>
        <p className="text-sm text-dim mb-6">Kontroller mange leverandører i én kjøring.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Lim inn eller last opp en liste med organisasjonsnumre",
            "Kjøring i kø med framdrift per selskap",
            "Samlet rapport, og avvikene skilt ut for seg",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
