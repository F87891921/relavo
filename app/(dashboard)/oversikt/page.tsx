import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function OversiktSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Oversikt" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Oversikt</h1>
        <p className="text-sm text-dim mb-6">Status på kontrollplikten og det som haster.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Framdrift mot § 5i for hele leverandørporteføljen",
            "Kontroller som nærmer seg frist eller mangler dokumentasjon",
            "Siste hendelser fra den løpende overvåkingen",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
