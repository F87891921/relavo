import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode } from "@/components/ui";
import { KjedeListe, type Kjede } from "@/components/kjede/KjedeListe";
import { SUPPLIERS } from "@/lib/demo/app";
import { formaterOrgnr } from "@/lib/orgnr";

// Kjedene i demodataen når lenger ned enn leverandørlista. Da vises
// nummeret i lesbar form heller enn å skjule at vi ikke har navnet.
const navnFor = (org: string) =>
  SUPPLIERS.find((s) => s.org === org)?.name ?? formaterOrgnr(org);

export default async function KjedeSide() {
  await krevProfil();

  const kjeder: Kjede[] = SUPPLIERS.filter((s) => s.kjede && s.kjede.length > 1).map(
    (s) => ({
      org: s.org,
      navn: s.name,
      ledd: s.kjede.map((o) => ({ org: o, navn: navnFor(o) })),
    }),
  );

  return (
    <DashboardShell aktivtSteg="Leverandørkjede">
      <Side>
        <Sidehode
          tittel="Leverandørkjede"
          tekst="§ 5k tillater høyst to ledd underleverandører i bygg, anlegg og renhold. Overskridelser flagges — og de to lovlige utveiene er å kutte leddet eller søke dispensasjon hos oppdragsgiver."
        />
        <KjedeListe kjeder={kjeder} />
      </Side>
    </DashboardShell>
  );
}
