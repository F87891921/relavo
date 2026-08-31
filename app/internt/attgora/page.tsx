import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntAttgoraSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Att göra">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Att göra</h1>
        <p className="text-sm text-dim mb-6">Det som kräver en människa i dag.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Ärenden som väntar på oss, sorterade efter hur länge",
            "Konton som behöver kontaktas",
            "Misslyckade körningar som inte löst sig själva",
          ]}
        />
      </div>
    </StaffShell>
  );
}
