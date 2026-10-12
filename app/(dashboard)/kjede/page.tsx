import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode } from "@/components/ui";
import { Flikar } from "@/components/ui/Flikar";
import { funnAntall } from "@/lib/funn";
import { KjedeTre, NyKjede, dybde, type Kjede, type Ledd } from "@/components/kjede/KjedeTre";
import { grenseFor } from "@/lib/kjede";
import { SettGrense } from "@/components/kjede/SettGrense";
import { formaterOrgnr } from "@/lib/orgnr";

/**
 * Leverandørkjedene, slik kontrollene har kartlagt dem.
 *
 * Leddene ligger på kontrollen, ikke på leverandøren: kjeden er noe som så
 * sånn ut den dagen den ble kartlagt. Derfor vises siste kontroll per
 * leverandør, ikke alle kontroller — ellers står samme kjede flere ganger
 * med en dags mellomrom.
 */
export default async function KjedeSide() {
  const { supabase, t, profil } = await krevProfil();
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
    .select("id, forelder_id, kontroll_id, niva, navn, org_nr, merknader, kartlegging")
    .in("kontroll_id", [...siste.values()].map((v) => v.id))
    .order("niva");

  const perKontroll = new Map<string, Ledd[]>();
  for (const l of ledd ?? []) {
    const liste = perKontroll.get(l.kontroll_id) ?? [];
    liste.push({
      id: l.id,
      forelderId: l.forelder_id,
      niva: l.niva,
      navn: l.navn || formaterOrgnr(l.org_nr),
      org: l.org_nr,
      merknader: (l.merknader as string[] | null) ?? [],
      kartlegging: l.kartlegging as Ledd["kartlegging"],
    });
    perKontroll.set(l.kontroll_id, liste);
  }

  const leverandorerListe = [...siste.values()].map((v) => ({ kontrollId: v.id, navn: v.navn }));
  const kjeder: Kjede[] = [...siste.values()]
    .map((lev) => ({ kontrollId: lev.id, navn: lev.navn, org: lev.org, ledd: perKontroll.get(lev.id) ?? [] }))
    .filter((k) => k.ledd.length > 1)
    .sort((a, b) => dybde(b.ledd) - dybde(a.ledd));

  const { data: org } = await supabase
    .from("organisasjoner")
    .select("plan, kjede_grense")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();
  const grense = grenseFor(org?.plan, org?.kjede_grense);
  const erKommune = grenseFor(org?.plan, null) !== null;

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

        {!erKommune && profil.rolle === "administrator" && <SettGrense grense={org?.kjede_grense ?? null} />}
        <NyKjede leverandorer={leverandorerListe} />
        <div className="space-y-4">
          {kjeder.length === 0 && (
            <div className="bg-surface rounded-card shadow-card px-5 py-10 text-center text-dim text-sm">{t.kjede.ingenKjeder}</div>
          )}
          {kjeder.map((k) => (
            <KjedeTre key={k.kontrollId} kjede={k} grense={grense} />
          ))}
        </div>
      </Side>
    </DashboardShell>
  );
}
