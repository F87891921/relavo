import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntLoggSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Åtkomstlogg">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Åtkomstlogg</h1>
        <p className="text-sm text-dim mb-6">Vem har sett vilken kunds data.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Uppslag gjorda av anställda, med tidpunkt och konto",
            "Sökningar mot register, spårade till den som gjorde dem",
            "Underlag vid granskning — loggen ska kunna visas upp",
          ]}
        />
      </div>
    </StaffShell>
  );
}
