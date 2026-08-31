import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { UnderArbeid } from "@/components/UnderArbeid";

export default async function InterntTeamSide() {
  await krevAnsatt();

  return (
    <StaffShell aktivtSteg="Team och behörighet">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Team och behörighet</h1>
        <p className="text-sm text-dim mb-6">Vilka vi är och vad var och en får se.</p>
        <UnderArbeid
          kilde="relavo-staff.html"
          punkter={[
            "Anställda, roll och behörighetsnivå",
            "Vem som har åtkomst till kunddata och vem som inte har",
            "Ändringar i behörighet, med vem som gjorde dem",
          ]}
        />
      </div>
    </StaffShell>
  );
}
