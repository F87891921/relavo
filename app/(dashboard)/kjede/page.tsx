import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode } from "@/components/ui";
import { Flikar } from "@/components/ui/Flikar";
import { funnAntall } from "@/lib/funn";
import { KjedeListe, type Kjede } from "@/components/kjede/KjedeListe";
import { formaterOrgnr } from "@/lib/orgnr";
import { NyKjede } from "@/components/kjede/KjedeRedigering";

/**
 * Leverandørkjedene, slik kontrollene har kartlagt dem.
 *
 * Leddene ligger på kontrollen, ikke på leverandøren: kjeden er noe som så
 * sånn ut den dagen den ble kartlagt. Derfor vises siste kontroll per
 * leverandør, ikke alle kontroller — ellers står samme kjede flere ganger
 * med en dags mellomrom.
 */
export default async function KjedeSide() {
  const { supabase, t } = await krevProfil();
  const antall = await funnAntall();

  // Nyest først, så den første kontrollen vi møter per leverandør er den
  // som gjelder.
  const { data: kontroller } = await supabase
    .from("kontroller")
    .select("id, utfort, leverandor_id, leverandorer(navn, org_nr)")
    .order("utfort", { ascending: false });

  const siste = new Map<string, { id: string; navn: string; org: string }>();
  for (const k of kontroller ?? []) {
    if (siste.has(k.leverandor_id)) continue;
    const lev = k.leverandorer as unknown as { navn: string; org_nr: string } | null;
    siste.set(k.leverandor_id, {
      id: k.id,
      navn: lev?.navn ?? "—",
      org: lev?.org_nr ?? k.leverandor_id,
    });
  }

  const { data: ledd } = await supabase
    .from("kjede_ledd")
    .select("kontroll_id, niva, navn, org_nr")
    .in("kontroll_id", [...siste.values()].map((v) => v.id))
    .order("niva");

  const perKontroll = new Map<string, { org: string; navn: string }[]>();
  const leverandorerListe = [...siste.values()].map((v) => ({ kontrollId: v.id, navn: v.navn }));
  for (const l of ledd ?? []) {
    const liste = perKontroll.get(l.kontroll_id) ?? [];
    liste.push({ org: l.org_nr, navn: l.navn || formaterOrgnr(l.org_nr) });
    perKontroll.set(l.kontroll_id, liste);
  }

  // En kjede med bare hovedleverandøren er ikke en kjede. Den sier ingenting
  // om § 5k, og en liste full av enkeltledd skjuler de som faktisk har en.
  const kjeder: Kjede[] = [...siste.values()]
    .map((lev) => ({
      org: lev.org,
      navn: lev.navn,
      kontrollId: lev.id,
      ledd: perKontroll.get(lev.id) ?? [],
    }))
    .filter((k) => k.ledd.length > 1);

  return (
    <DashboardShell aktivtSteg="kjede">
      <Side>
        <Sidehode
          tittel={t.sider.kjede.tittel}
          tekst={t.sider.kjede.tekst}
        />

        <Flikar
          flikar={[
            { navn: t.meny.kjede, href: "/kjede", aktiv: true, antall: antall.kjede },
            { navn: t.meny.jav, href: "/jav", aktiv: false, antall: antall.jav },
            { navn: t.meny.espd, href: "/espd", aktiv: false, antall: antall.espd },
          ]}
        />

        <NyKjede leverandorer={leverandorerListe} />
        <KjedeListe kjeder={kjeder} />
      </Side>
    </DashboardShell>
  );
}
