import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntLeadsSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Leads">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Leads</h1>
        <p className="text-sm text-dim mb-6">Intresserade som inte blivit kunder än.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Organisation, kontaktperson och var de kom ifrån",
            "Var i processen de står, och nästa steg",
            "Leads som legat stilla för länge",
          ]}
        />
      </div>
    </StaffShell>
  );
}
