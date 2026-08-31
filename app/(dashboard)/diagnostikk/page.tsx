import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function DiagnostikkSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Diagnostikk" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Diagnostikk</h1>
        <p className="text-sm text-dim mb-6">Teknisk status for kontoen.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Kjøringer som har feilet, og hvorfor",
            "Kø og ventetid på oppslag",
            "Informasjon støtte trenger når noe skal feilsøkes",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
