import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode } from "@/components/ui";
import { Flikar } from "@/components/ui/Flikar";
import { Anskaffelser, type Anskaffelse } from "@/components/anskaffelse/Anskaffelser";

export default async function AnskaffelserSide() {
  const { supabase, t } = await krevProfil();

  const [{ data: anskaffelser }, { data: tilbud }] = await Promise.all([
    supabase
      .from("anskaffelser")
      .select("id, saksnummer, navn, konkurranseform, verdi, periode")
      .order("opprettet", { ascending: false }),
    supabase
      .from("tilbud")
      .select("id, anskaffelse_id, leverandor_navn, sum")
      .order("sum"),
  ]);

  const perAnskaffelse = new Map<string, Anskaffelse["tilbud"]>();
  for (const b of tilbud ?? []) {
    const liste = perAnskaffelse.get(b.anskaffelse_id) ?? [];
    liste.push({ id: b.id, leverandor_navn: b.leverandor_navn, sum: Number(b.sum) });
    perAnskaffelse.set(b.anskaffelse_id, liste);
  }

  const liste: Anskaffelse[] = (anskaffelser ?? []).map((a) => ({
    ...a,
    tilbud: perAnskaffelse.get(a.id) ?? [],
  }));

  return (
    <DashboardShell aktivtSteg="anskaffelser">
      <Side>
        <Sidehode
          tittel={t.sider.anskaffelser.tittel}
          tekst={t.sider.anskaffelser.tekst}
        />

        <Flikar
          flikar={[
            { navn: t.meny.leverandorer, href: "/leverandorer", aktiv: false },
            { navn: t.meny.anskaffelser, href: "/anskaffelser", aktiv: true },
          ]}
        />

        <Anskaffelser anskaffelser={liste} />
      </Side>
    </DashboardShell>
  );
}
