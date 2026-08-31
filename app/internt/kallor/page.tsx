import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntKallorSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Källhälsa">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Källhälsa</h1>
        <p className="text-sm text-dim mb-6">Svarstider och fel per register.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Status per källa: Enhetsregisteret, Skatteetaten, Creditsafe, Arbeidstilsynet, StartBANK",
            "Svarstid, felfrekvens och senaste avbrott",
            "Vilka kunder som drabbades när en källa låg nere",
          ]}
        />
      </div>
    </StaffShell>
  );
}
