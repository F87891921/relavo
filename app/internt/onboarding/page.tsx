import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntOnboardingSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Onboarding">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Onboarding</h1>
        <p className="text-sm text-dim mb-6">Nya kunder på väg in.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Var i uppstarten varje ny kund står",
            "Vad som återstår innan de kan köra sin första kontroll",
            "Kunder som fastnat i uppstarten",
          ]}
        />
      </div>
    </StaffShell>
  );
}
