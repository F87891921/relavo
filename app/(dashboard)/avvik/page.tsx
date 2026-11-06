import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode } from "@/components/ui";
import { AvvikListe, type Avvik, type Medlem } from "@/components/avvik/AvvikListe";

/**
 * Avvik fra den daglige overvåkingen, med status, ansvarlig og kommentar.
 * Hendelsene skrives av overvåkingen; her tar kunden tak i dem og kan vise
 * hva som ble gjort.
 */
export default async function AvvikSide() {
  const { supabase, t, profil } = await krevProfil();

  const [{ data: hendelser }, { data: folk }] = await Promise.all([
    supabase
      .from("overvakning_hendelser")
      .select("id, slag, alvor, fra, til, oppdaget, status, ansvarlig, kommentar, behandlet, behandlet_av, leverandorer(navn)")
      .order("oppdaget", { ascending: false })
      .limit(200),
    supabase.from("profiler").select("id, navn").eq("organisasjon_id", profil.organisasjon_id),
  ]);

  const medlemmer: Medlem[] = (folk ?? []).map((p) => ({ id: p.id, navn: p.navn ?? "—" }));
  const avvik: Avvik[] = (hendelser ?? []).map((h) => ({
    id: h.id,
    leverandor: (h.leverandorer as unknown as { navn: string } | null)?.navn ?? "—",
    slag: h.slag,
    alvor: h.alvor as Avvik["alvor"],
    fra: h.fra,
    til: h.til,
    oppdaget: h.oppdaget,
    status: h.status as Avvik["status"],
    ansvarlig: h.ansvarlig,
    kommentar: h.kommentar,
    behandlet: h.behandlet,
    behandletAv: h.behandlet_av,
  }));

  return (
    <DashboardShell aktivtSteg="avvik">
      <Side>
        <Sidehode tittel={t.sider.avvik.tittel} tekst={t.sider.avvik.tekst} />
        <AvvikListe avvik={avvik} medlemmer={medlemmer} />
      </Side>
    </DashboardShell>
  );
}
