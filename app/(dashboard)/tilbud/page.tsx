import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function TilbudSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Unormalt lave tilbud" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Unormalt lave tilbud</h1>
        <p className="text-sm text-dim mb-6">Regn ut avviket og få utkast til redegjørelseskravet.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Innkomne tilbud på anskaffelsen, med avvik mot de øvrige",
            "Terskelen som utløser undersøkelsesplikten etter § 24-9",
            "Utkast til redegjørelseskravet som skal sendes tilbyderen",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
