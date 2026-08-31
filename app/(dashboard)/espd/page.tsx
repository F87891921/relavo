import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function EspdSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="ESPD" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">ESPD og egenerklæringer</h1>
        <p className="text-sm text-dim mb-6">Egenerklæringene, og hva registrene sier.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Tilbyder, anskaffelse og hvordan erklæringen kom inn",
            "Tilbudssum sammenholdt med kontrollen mot registrene",
            "Både tilbudsfasen og løpende erklæringer i kontraktsperioden",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
