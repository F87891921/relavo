import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntSupportSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Support">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Support</h1>
        <p className="text-sm text-dim mb-6">Supportärenden från alla konton.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Ärende, konto, kategori och status",
            "Svarstid och vem som väntar på vem",
            "Återkommande problem värda att åtgärda i produkten",
          ]}
        />
      </div>
    </StaffShell>
  );
}
