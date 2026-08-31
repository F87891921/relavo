import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function KilderSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Datakilder" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Datakilder</h1>
        <p className="text-sm text-dim mb-6">Hvilke registre som svarer, og hvor ferske svarene er.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Status per kilde: Enhetsregisteret, Skatteetaten, Creditsafe, Arbeidstilsynet, StartBANK",
            "Responstid og tidspunkt for siste vellykkede oppslag",
            "Kilder som ikke svarer, så en rapport aldri tier om hullene sine",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
