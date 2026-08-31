import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntFaktureringSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Fakturering">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Fakturering</h1>
        <p className="text-sm text-dim mb-6">Fakturor, förfall och påminnelser.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Fakturor per konto med belopp och förfallodatum",
            "Obetalda och förfallna, med hur många dagar",
            "Underlag för nästa faktureringskörning",
          ]}
        />
      </div>
    </StaffShell>
  );
}
