import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntOfferterSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Offerter">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Offerter</h1>
        <p className="text-sm text-dim mb-6">Skickade offerter och utfall.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Offert, mottagare, belopp och giltighetstid",
            "Status: skickad, under förhandling, vunnen eller förlorad",
            "Orsak när en offert föll",
          ]}
        />
      </div>
    </StaffShell>
  );
}
