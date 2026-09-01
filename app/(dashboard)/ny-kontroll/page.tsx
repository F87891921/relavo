import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { NyKontrollVeiviser } from "@/components/kontroll/NyKontrollVeiviser";
import { Side } from "@/components/ui";

export default async function NyKontrollSide() {
  const { profil, t } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="nyKontroll">
      <Side smal>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">
          {t.sider.nyKontroll.tittel}
        </h1>
        <p className="text-sm text-dim mb-7 max-w-[62ch] leading-relaxed">
          {t.sider.nyKontroll.tekst}
        </p>
        <NyKontrollVeiviser />
      </Side>
    </DashboardShell>
  );
}
