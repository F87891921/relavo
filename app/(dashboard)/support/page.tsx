import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Tall, Rad } from "@/components/ui";
import { NySak, SakKort, type Sak } from "@/components/sak/SakTrad";

export default async function SupportSide() {
  const { supabase, t } = await krevProfil();

  const { data: saker } = await supabase
    .from("saker")
    .select(
      "id, kategori, emne, status, varsle_epost, opprettet, oppdatert, sak_svar(id, fra_relavo, forfatter_navn, tekst, opprettet)",
    )
    .order("oppdatert", { ascending: false });

  const alle = (saker ?? []) as unknown as Sak[];
  // Nyeste melding nederst i hver tråd, uansett hva basen returnerte.
  for (const s of alle)
    s.sak_svar?.sort((a, b) => a.opprettet.localeCompare(b.opprettet));

  const apne = alle.filter((s) => s.status !== "lukket");

  return (
    <DashboardShell aktivtSteg="support">
      <Side smal>
        <Sidehode
          tittel={t.sider.support.tittel}
          tekst={t.sider.support.tekst}
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke="saker totalt" />
          <Tall verdi={String(apne.length)} merke="åpne" />
          <Tall
            verdi={String(alle.filter((s) => s.status === "venter_oss").length)}
            merke="venter på oss"
          />
          <Tall
            verdi={String(alle.filter((s) => s.status === "venter_kunde").length)}
            merke="venter på deg"
            tone={alle.some((s) => s.status === "venter_kunde") ? "advarsel" : undefined}
          />
        </Rad>

        <NySak />

        <div className="space-y-3">
          {alle.length === 0 && (
            <div className="bg-surface rounded-card border border-border shadow-card px-5 py-10 text-center text-dim text-sm">
              Ingen saker ennå. Meld inn en med knappen over.
            </div>
          )}
          {alle.map((s) => (
            <SakKort key={s.id} sak={s} />
          ))}
        </div>
      </Side>
    </DashboardShell>
  );
}
