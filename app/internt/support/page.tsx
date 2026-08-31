import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Tall, Rad } from "@/components/ui";
import { SakKort, type Sak } from "@/components/sak/SakTrad";

export default async function InterntSupportSide() {
  const { supabase } = await krevAnsatt();

  const { data: saker } = await supabase
    .from("saker")
    .select(
      "id, kategori, emne, status, varsle_epost, opprettet, oppdatert, organisasjoner(navn), sak_svar(id, fra_relavo, forfatter_navn, tekst, opprettet)",
    )
    .order("oppdatert", { ascending: false });

  const alle = (saker ?? []) as unknown as Sak[];
  for (const s of alle)
    s.sak_svar?.sort((a, b) => a.opprettet.localeCompare(b.opprettet));

  const venterPaOss = alle.filter((s) => s.status === "venter_oss");

  return (
    <StaffShell aktivtSteg="Support">
      <Side>
        <Sidehode
          tittel="Support"
          tekst="Ärenden från alla konton. Svarar du här går svaret direkt till kunden, och ärendet flyttas till Väntar på kunden."
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke="ärenden totalt" />
          <Tall
            verdi={String(venterPaOss.length)}
            merke="väntar på oss"
            tone={venterPaOss.length ? "brudd" : undefined}
          />
          <Tall
            verdi={String(alle.filter((s) => s.status === "venter_kunde").length)}
            merke="väntar på kunden"
          />
          <Tall
            verdi={String(alle.filter((s) => s.status === "lukket").length)}
            merke="stängda"
          />
        </Rad>

        <div className="space-y-3">
          {alle.length === 0 && (
            <div className="bg-surface rounded-card border border-border shadow-card px-5 py-10 text-center text-dim text-sm">
              Inga ärenden ännu.
            </div>
          )}
          {alle.map((s) => (
            <SakKort key={s.id} sak={s} somRelavo />
          ))}
        </div>
      </Side>
    </StaffShell>
  );
}
