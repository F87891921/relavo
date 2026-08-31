import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function AnskaffelserSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Anskaffelser" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Anskaffelser</h1>
        <p className="text-sm text-dim mb-6">Avtalene kontrollene henger på.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Anskaffelse, type, avtaleverdi og avtaleperiode",
            "Hvilke kontroller som er kjørt på hver avtale",
            "Leverandørene knyttet til hver anskaffelse",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
