import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function NyKontrollSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Ny kontroll" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Ny kontroll</h1>
        <p className="text-sm text-dim mb-6">Kjør en kontroll mot registrene og lagre beviset.</p>
        <UnderArbeid
          kilde="relavo-app.html"
          punkter={[
            "Saksopplysninger: organisasjonsnummer og hvilken anskaffelse kontrollen hører til",
            "Oppslag mot Enhetsregisteret, Skatteetaten og Creditsafe",
            "Egenerklæring fra leverandøren, med frist for ettersending",
            "Oppsummering som lagres uendret som dokumentasjon",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
