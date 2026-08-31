import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Sidehode, Kort, Merke } from "@/components/ui";
import { SUPPLIERS } from "@/lib/demo/app";
import { formaterOrgnr } from "@/lib/orgnr";

// Kjedene i demodataen når lenger ned enn leverandørlista. Da vises
// nummeret i lesbar form heller enn å skjule at vi ikke har navnet.
const navnFor = (org: string) =>
  SUPPLIERS.find((s) => s.org === org)?.name ?? formaterOrgnr(org);

/**
 * § 5k tillater høyst to ledd underleverandører i bygg, anlegg og renhold.
 * Hovedleverandøren er ledd 0 — det tredje leddet under den er brudd.
 */
const GRENSE = 2;

export default async function KjedeSide() {
  const { profil } = await krevProfil();

  const kjeder = SUPPLIERS.filter((s) => s.kjede && s.kjede.length > 1);

  return (
    <DashboardShell aktivtSteg="Leverandørkjede" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <Sidehode
          tittel="Leverandørkjede"
          tekst="§ 5k tillater høyst to ledd underleverandører i bygg, anlegg og renhold. Overskridelser flagges — og de to lovlige utveiene er å kutte leddet eller søke dispensasjon hos oppdragsgiver."
        />

        <div className="space-y-4">
          {kjeder.map((s) => {
            const brudd = s.kjede.length - 1 > GRENSE;
            return (
              <Kort
                key={s.org}
                tittel={s.name}
                note={`${s.kjede.length - 1} ledd under hovedleverandøren`}
              >
                <div className="px-5 py-5">
                  <div className="flex flex-wrap items-stretch gap-0">
                    {s.kjede.map((org, i) => {
                      const over = i > GRENSE;
                      return (
                        <div key={org} className="flex items-center">
                          {i > 0 && (
                            <div
                              className={`w-6 h-[1.5px] rounded ${
                                i === GRENSE + 1 ? "bg-bad" : "bg-border-strong"
                              }`}
                            />
                          )}
                          <div
                            className={`rounded-xl px-3.5 py-2.5 text-center min-w-[132px] ${
                              over
                                ? "border-[1.5px] border-dashed border-bad bg-bad-bg"
                                : i === 0
                                  ? "shadow-[0_0_0_1.5px_var(--tw-shadow-color)] shadow-accent bg-surface"
                                  : "bg-surface shadow-card"
                            }`}
                          >
                            <div
                              className={`text-[9px] font-bold uppercase tracking-wide ${
                                over ? "text-bad" : i === 0 ? "text-accent" : "text-faint"
                              }`}
                            >
                              {i === 0 ? "Hovedleverandør" : `Ledd ${i}`}
                            </div>
                            <div className="text-[11.5px] font-semibold mt-1 leading-tight">
                              {navnFor(org)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    {brudd ? (
                      <div className="bg-bad-bg text-bad rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed">
                        <b>Brudd på § 5k.</b> Kjeden har{" "}
                        {s.kjede.length - 1} ledd, grensen er {GRENSE}. Enten
                        kuttes det nederste leddet, eller så må oppdragsgiver gi
                        dispensasjon og begrunne den i anskaffelsesprotokollen.
                      </div>
                    ) : (
                      <Merke tone="god">Innenfor grensen i § 5k</Merke>
                    )}
                  </div>
                </div>
              </Kort>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
