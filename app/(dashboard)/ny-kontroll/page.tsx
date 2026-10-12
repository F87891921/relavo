import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { NyKontrollVeiviser } from "@/components/kontroll/NyKontrollVeiviser";
import { Side } from "@/components/ui";
import { Flikar } from "@/components/ui/Flikar";
import { GrenserBanner } from "@/components/GrenserBanner";
import { hentGrenser } from "@/lib/grenser";

export default async function NyKontrollSide() {
  const { supabase, profil, t } = await krevProfil();
  const grenser = await hentGrenser(supabase, profil.organisasjon_id);

  return (
    <DashboardShell aktivtSteg="nyKontroll">
      <Side smal>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">
          {t.sider.nyKontroll.tittel}
        </h1>
        <p className="text-sm text-dim mb-5 max-w-[62ch] leading-relaxed">
          {t.sider.nyKontroll.tekst}
        </p>
        <Flikar
          flikar={[
            { navn: t.meny.enKontroll, href: "/ny-kontroll", aktiv: true },
            { navn: t.meny.flereKontroller, href: "/bulk", aktiv: false },
          ]}
        />

        <GrenserBanner g={grenser} />
        <NyKontrollVeiviser />
      </Side>
    </DashboardShell>
  );
}
