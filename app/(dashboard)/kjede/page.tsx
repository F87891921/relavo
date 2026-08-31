import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function KjedeSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Leverandørkjede" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Leverandørkjede</h1>
        <p className="text-sm text-dim mb-6">Kartlegg kjeden og se om § 5k brytes.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Bygg kjeden ledd for ledd under hovedleverandøren",
            "Kontraktstype avgjør om totaket på to ledd gjelder",
            "Overskridelser flagges, med de to lovlige utveiene",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
