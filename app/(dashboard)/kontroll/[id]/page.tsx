import Link from "next/link";
import { notFound } from "next/navigation";
import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Kort, Merke, type Tone } from "@/components/ui";
import { RelavoLogo } from "@/components/RelavoLogo";
import { RELAVO, relavoOrgNr } from "@/lib/relavo";
import {
  hentKontrollrapport,
  antallBrudd,
  antallUkontrollert,
} from "@/lib/kontrollrapport";

/**
 * Kontrollen hentet fram igjen.
 *
 * Fram til nå ble en kontroll lagret og aldri vist. Det er en merkelig
 * mangel i et produkt som selges på at kontrollen skal kunne vises fram —
 * og den gjorde også at tabellradene ingen steder førte.
 *
 * Siden er bygget som et dokument, ikke som et dashbord: kravene i
 * rekkefølge etter alvor, kildene med tidspunkt, og til slutt forbeholdet.
 * Det som ikke ble kontrollert står like tydelig som det som ble det.
 */

const KRAVTONE: Record<string, Tone> = { ok: "god", no: "brudd", na: "advarsel" };
const KILDETONE: Record<string, Tone> = {
  svar: "god", vedlegg: "god", ikke: "advarsel",
};
const RISIKOTONE: Record<string, Tone> = {
  lav: "god", middels: "advarsel", hoy: "brudd",
};

const REKKEFOLGE: Record<string, number> = { no: 0, na: 1, ok: 2 };

export default async function KontrollSide({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, t } = await krevProfil();
  const r = await hentKontrollrapport(supabase, params.id);
  if (!r) notFound();

  const brudd = antallBrudd(r.krav);
  const ukontrollert = antallUkontrollert(r.krav);
  const krav = [...r.krav].sort(
    (a, b) => (REKKEFOLGE[a.status] ?? 9) - (REKKEFOLGE[b.status] ?? 9),
  );

  const dato = new Date(r.utfort).toLocaleDateString("nb-NO", {
    day: "numeric", month: "long", year: "numeric",
  });
  const klokke = new Date(r.utfort).toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <DashboardShell aktivtSteg="leverandorer">
      <Side smal>
        <Link
          href="/leverandorer"
          className="skjul-i-utskrift text-[12.5px] text-dim hover:text-accent transition inline-block mb-3"
        >
          ← {t.meny.leverandorer}
        </Link>

        {/* Brevhodet. Siden er et dokument som skrives ut og legges ved en
            sak, og da skal den bære avsenderen — ikke bare ha logoen i en
            sidemeny som forsvinner i utskriften. */}
        <div className="flex items-end justify-between gap-4 pb-4 mb-5 border-b border-border">
          <RelavoLogo className="w-[96px] h-auto text-ink" />
          <p className="text-[11px] text-faint text-right leading-relaxed">
            {RELAVO.navn} · org.nr {relavoOrgNr()}
            <span className="block">{RELAVO.nett}</span>
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {r.leverandor.navn}
          </h1>
          {/* Lenke, ikke knapp: filen ligger på en adresse, og da skal den
              kunne åpnes i ny fane og lagres som alt annet på nettet. */}
          <a
            href={`/kontroll/${r.id}/pdf`}
            className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl"
          >
            {t.kontroll.lastNedPdf}
          </a>
        </div>

        <p className="text-sm text-dim mb-5">
          <span className="font-mono">{r.leverandor.orgNr}</span>
          {r.leverandor.bransje ? ` · ${r.leverandor.bransje}` : ""}
          {r.leverandor.sted ? ` · ${r.leverandor.sted}` : ""}
        </p>

        <Kort className="mb-4">
          <div className="px-5 py-5 flex items-start justify-between gap-5 flex-wrap">
            <div>
              <Merke tone={RISIKOTONE[r.risiko]}>
                {t.risiko[r.risiko as keyof typeof t.risiko] ?? r.risiko}
              </Merke>
              <p className="text-[13px] mt-2.5 leading-relaxed max-w-[52ch]">
                {brudd === 0 ? t.kontroll.ingenBrudd : `${brudd} ${t.kontroll.kravIkkeOppfylt}`}
                {ukontrollert > 0 && ` ${ukontrollert} ${t.kontroll.ikkeKontrollert}`}
              </p>
            </div>
            <dl className="text-[12.5px] space-y-1.5 min-w-[200px]">
              <div className="flex justify-between gap-5">
                <dt className="text-dim">{t.kontroll.utfort}</dt>
                <dd className="font-semibold">{dato}, {klokke}</dd>
              </div>
              <div className="flex justify-between gap-5">
                <dt className="text-dim">{t.kontroll.utfortAv}</dt>
                <dd className="font-semibold">{r.utfortAv ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-5">
                <dt className="text-dim">{t.kontroll.oppdragsgiver}</dt>
                <dd className="font-semibold">{r.organisasjon.navn}</dd>
              </div>
              <div className="flex justify-between gap-5">
                <dt className="text-dim">{t.kontroll.referanse}</dt>
                <dd className="font-mono text-[11px] text-faint">{r.id.slice(0, 8)}</dd>
              </div>
            </dl>
          </div>
        </Kort>

        <Kort tittel={t.kontroll.vurdering} className="mb-4">
          <ul className="divide-y divide-border">
            {krav.map((k, i) => (
              <li key={i} className="px-5 py-3.5 flex gap-4 items-start">
                <span className="shrink-0 w-[92px]">
                  <Merke tone={KRAVTONE[k.status] ?? "noytral"}>
                    {t.kontroll.kravstatus[k.status as "ok" | "no" | "na"]}
                  </Merke>
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold">{k.ref}</div>
                  <p className="text-[12.5px] text-dim leading-relaxed">
                    {[k.tekst, k.notat].filter(Boolean).join(" ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Kort>

        {r.indikatorer.length > 0 && (
          <Kort tittel={t.kontroll.indikasjoner} note={t.kontroll.indikasjonerNote} className="mb-4">
            <ul className="divide-y divide-border">
              {r.indikatorer.map((i) => (
                <li key={i.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <span className="text-[13px] font-semibold">{i.tittel}</span>
                    <Merke tone={i.niva === "varsel" ? "advarsel" : "noytral"}>{i.niva === "varsel" ? t.kontroll.varsel : t.kontroll.info}</Merke>
                  </div>
                  <p className="text-[12.5px] text-dim leading-relaxed">{i.tekst}</p>
                </li>
              ))}
            </ul>
          </Kort>
        )}

        <Kort tittel={t.kontroll.kilder} className="mb-4">
          <ul className="divide-y divide-border">
            {r.kilder.length ? (
              r.kilder.map((kilde, i) => (
                <li
                  key={i}
                  className="px-5 py-3 flex gap-4 items-center justify-between"
                >
                  <span className="text-[13px] font-semibold">{kilde.navn}</span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="text-[11.5px] text-faint">
                      {kilde.tidspunkt
                        ? new Date(kilde.tidspunkt).toLocaleDateString("nb-NO")
                        : "—"}
                    </span>
                    <Merke tone={KILDETONE[kilde.status] ?? "noytral"}>
                      {t.kontroll.kildestatus[kilde.status as "svar" | "vedlegg" | "ikke"]}
                    </Merke>
                  </span>
                </li>
              ))
            ) : (
              <li className="px-5 py-8 text-center text-dim text-sm">
                {t.kontroll.ingenKilder}
              </li>
            )}
          </ul>
        </Kort>

        {r.kjede.length > 0 && (
          <Kort tittel={t.kontroll.kjede} className="mb-4">
            <ul className="divide-y divide-border">
              {r.kjede.map((l, i) => (
                <li key={i} className="px-5 py-3 flex gap-4 items-center">
                  <span className="shrink-0 w-[72px] text-[11.5px] text-faint uppercase tracking-wide">
                    {l.niva === 0 ? t.kontroll.hoved : `${t.kontroll.ledd} ${l.niva}`}
                  </span>
                  <span className="text-[13px] font-semibold">{l.navn}</span>
                  <span className="text-[11.5px] text-faint font-mono">{l.org_nr}</span>
                  {l.over_grense && (
                    <span className="ml-auto">
                      <Merke tone="brudd">{t.kontroll.overGrense}</Merke>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Kort>
        )}

        <Kort tittel={t.kontroll.interessekonflikt} className="mb-4">
          <ul className="divide-y divide-border">
            {r.jav.length ? (
              r.jav.map((j, i) => (
                <li key={i} className="px-5 py-3.5 flex gap-4 items-start">
                  <span className="shrink-0 w-[92px]">
                    <Merke tone={j.eksakt ? "brudd" : "advarsel"}>
                      {j.eksakt
                        ? t.jav.identiskNavnMerke
                        : `${j.avvik} ${t.jav.tegnsAvvik}`}
                    </Merke>
                  </span>
                  <div className="min-w-0 text-[12.5px] leading-relaxed">
                    <b>{j.person_navn}</b> ({j.person_rolle}){" "}
                    <span className="text-dim">
                      {t.kontroll.lignerPa} <b>{j.deltaker_navn}</b> ({j.deltaker_rolle}).
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-5 py-8 text-center text-dim text-sm">
                {t.jav.ingenFunnet}
              </li>
            )}
          </ul>
        </Kort>

        <p className="text-[12px] text-faint leading-relaxed max-w-[70ch]">
          {t.kontroll.forbehold}
        </p>
      </Side>
    </DashboardShell>
  );
}
