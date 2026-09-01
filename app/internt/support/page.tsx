import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Tall, Rad } from "@/components/ui";
import { SakKort, type Sak } from "@/components/sak/SakTrad";

export default async function InterntSupportSide() {
  const { supabase, t } = await krevAnsatt();

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
    <StaffShell aktivtSteg="support">
      <Side>
        <Sidehode
          tittel={t.ansattsider.support.tittel}
          tekst={t.ansattsider.support.tekst}
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke={t.internt.sakerTotalt} />
          <Tall
            verdi={String(venterPaOss.length)}
            merke={t.internt.venterPaOss}
            tone={venterPaOss.length ? "brudd" : undefined}
          />
          <Tall
            verdi={String(alle.filter((s) => s.status === "venter_kunde").length)}
            merke={t.internt.venterPaKunden}
          />
          <Tall
            verdi={String(alle.filter((s) => s.status === "lukket").length)}
            merke="stängda"
          />
        </Rad>

        <div className="space-y-3">
          {alle.length === 0 && (
            <div className="bg-surface rounded-card border border-border shadow-card px-5 py-10 text-center text-dim text-sm">
              {t.internt.ingenSaker}
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
