import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntMarginalSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Marginal">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Marginal</h1>
        <p className="text-sm text-dim mb-6">Vad varje konto kostar oss mot vad det ger.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Intäkt per konto mot kostnad för registeruppslag",
            "Marginal per plan, och konton som går med förlust",
            "Uppslagsvolym som driver kostnaden",
          ]}
        />
      </div>
    </StaffShell>
  );
}
