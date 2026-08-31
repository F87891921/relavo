import Link from "next/link";
import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side } from "@/components/ui";

/**
 * Erstatter prototypens hardkodede SUPPLIERS-array med et ekte spørring mot
 * Postgres. Row Level Security i 0001_init.sql sørger for at spørringen bare
 * kan returnere rader som hører til brukerens egen organisasjon — det trengs
 * ingen "where organisasjon_id = ..." her, det håndheves i databasen uansett
 * hva koden gjør.
 */
export default async function LeverandorerSide() {
  const { supabase, profil } = await krevProfil();

  const { data: leverandorer, error } = await supabase
    .from("leverandorer")
    .select("id, navn, org_nr, bransje, risiko, sist_kontrollert")
    .order("navn");

  // Jav-treff per leverandør. Varselet hører hjemme her fordi dette er der
  // resultatet av en kontroll vises — en egen resultatside finnes ikke ennå.
  const { data: javTreff } = await supabase
    .from("jav_treff")
    .select("leverandor_id");

  const javPerLeverandor = new Map<string, number>();
  for (const t of javTreff ?? [])
    javPerLeverandor.set(
      t.leverandor_id,
      (javPerLeverandor.get(t.leverandor_id) ?? 0) + 1,
    );

  const risikoStil: Record<string, string> = {
    lav: "bg-good-bg text-good",
    middels: "bg-warn-bg text-warn",
    hoy: "bg-bad-bg text-bad",
  };
  const risikoTekst: Record<string, string> = {
    lav: "Lav",
    middels: "Middels",
    hoy: "Høy",
  };

  return (
    <DashboardShell aktivtSteg="Leverandører">
      <Side>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Leverandører</h1>
        <p className="text-sm text-dim mb-6">
          Alle selskaper knyttet til aktive kontrakter.
        </p>

        {javPerLeverandor.size > 0 && (
          <div className="bg-bad-bg text-bad rounded-xl px-4 py-3 mb-4 text-[12.5px] leading-relaxed">
            <b>Mulig interessekonflikt.</b> {javPerLeverandor.size}{" "}
            {javPerLeverandor.size === 1 ? "leverandør har" : "leverandører har"}{" "}
            personer i styret som også står registrert som deltakere i
            anskaffelsen.{" "}
            <Link href="/jav" className="underline">
              Se koblingene
            </Link>
          </div>
        )}

        {error && (
          <div className="text-sm text-bad bg-bad-bg rounded-xl px-4 py-3 mb-4">
            Kunne ikke hente leverandører: {error.message}
          </div>
        )}

        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-faint border-b border-border">
                <th className="px-5 py-3 font-semibold">Selskap</th>
                <th className="px-5 py-3 font-semibold">Bransje</th>
                <th className="px-5 py-3 font-semibold">Risiko</th>
                <th className="px-5 py-3 font-semibold">Sist kontrollert</th>
              </tr>
            </thead>
            <tbody>
              {leverandorer?.length ? (
                leverandorer.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold">{l.navn}</div>
                      <div className="text-xs text-faint font-mono">{l.org_nr}</div>
                      {javPerLeverandor.has(l.id) && (
                        <Link
                          href="/jav"
                          className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bad-bg text-bad hover:underline"
                        >
                          Mulig interessekonflikt
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-dim">{l.bransje ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      {l.risiko && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${risikoStil[l.risiko]}`}
                        >
                          {risikoTekst[l.risiko]}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-dim">
                      {l.sist_kontrollert
                        ? new Date(l.sist_kontrollert).toLocaleDateString("nb-NO")
                        : "Aldri"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-dim text-sm">
                    Ingen leverandører ennå. Kjør din første kontroll for å komme i gang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Side>
    </DashboardShell>
  );
}
