import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { NyKontrollVeiviser } from "@/components/kontroll/NyKontrollVeiviser";

export default async function NyKontrollSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Ny kontroll">
      <div className="px-8 py-6 max-w-[820px]">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Ny kontroll</h1>
        <p className="text-sm text-dim mb-7 max-w-[62ch] leading-relaxed">
          Seks steg, hvorav tre er valgfrie. Resultatet lagres uendret som
          dokumentasjon på oppfylt kontrollplikt etter anskaffelsesloven § 5i.
        </p>
        <NyKontrollVeiviser />
      </div>
    </DashboardShell>
  );
}
