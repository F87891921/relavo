import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntKontonSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Konton">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Konton</h1>
        <p className="text-sm text-dim mb-6">Alla kundkonton, plan och status.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Kund, plan, antal användare och kontraktsvärde",
            "Förbrukning mot planen, och konton som växt ur den",
            "Konton med utestående betalning eller nära uppsägning",
          ]}
        />
      </div>
    </StaffShell>
  );
}
