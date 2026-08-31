import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function SupportSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Brukerstøtte" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Brukerstøtte</h1>
        <p className="text-sm text-dim mb-6">Saker dere har meldt inn.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Sak, emne, kategori og status",
            "Sist oppdatert, og hvem som venter på hvem",
            "Opprett ny sak",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
