import type { Nokkeltall } from "@/lib/nokkeltall";

/** Etikettene kommer fra ordboka (kontroll.nokkeltall). */
export type NokkeltallEtiketter = {
  ar: string;
  omsetning: string;
  vekst: string;
  driftsresultat: string;
  driftsmargin: string;
  aarsresultat: string;
  egenkapital: string;
  egenkapitalandel: string;
  gjeld: string;
  eiendeler: string;
  ansatte: string;
  perAnsatt: string;
  ingen: string;
  kilde: string;
  visAlle?: string;
};

/** Beløp i kroner: mill. kr fra en million, ellers hele kroner. Prosent med én desimal. */
export function visTall(v: number | null, type: "kr" | "pst"): string {
  if (v == null) return "–";
  if (type === "pst") return `${v.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
  return Math.abs(v) >= 1_000_000
    ? `${(v / 1_000_000).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} mill. kr`
    : `${v.toLocaleString("nb-NO")} kr`;
}

const RADER = [
  ["omsetning", "kr"],
  ["vekst", "pst"],
  ["driftsresultat", "kr"],
  ["driftsmargin", "pst"],
  ["aarsresultat", "kr"],
  ["egenkapital", "kr"],
  ["egenkapitalandel", "pst"],
  ["gjeld", "kr"],
  ["eiendeler", "kr"],
] as const;

/** Nøkkeltallene som tabell: ett år per kolonne. Brukes i veiviseren og i rapporten. */
export function NokkeltallTabell({
  n,
  t,
  kompakt = false,
  visAlleAr = "",
}: {
  n: Nokkeltall;
  t: NokkeltallEtiketter;
  /** Fire rutor for siste år, og hele tabellen bak en «vis alle år»-knapp. */
  kompakt?: boolean;
  visAlleAr?: string;
}) {
  const sist = n.ar[0];
  if (kompakt && sist) {
    const ruter: { merke: string; verdi: string; under: string | null }[] = [
      { merke: t.omsetning, verdi: visTall(sist.omsetning, "kr"), under: sist.vekst != null ? `${t.vekst} ${visTall(sist.vekst, "pst")}` : null },
      { merke: t.driftsresultat, verdi: visTall(sist.driftsresultat, "kr"), under: sist.driftsmargin != null ? `${t.driftsmargin} ${visTall(sist.driftsmargin, "pst")}` : null },
      { merke: t.egenkapital, verdi: visTall(sist.egenkapital, "kr"), under: sist.egenkapitalandel != null ? `${t.egenkapitalandel} ${visTall(sist.egenkapitalandel, "pst")}` : null },
      { merke: t.aarsresultat, verdi: visTall(sist.aarsresultat, "kr"), under: n.ansatte != null ? `${t.ansatte}: ${n.ansatte}` : null },
    ];
    return (
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ruter.map((r) => (
            <div key={r.merke} className="bg-canvas rounded-xl px-3.5 py-3">
              <div className="text-[11px] uppercase tracking-wide text-faint">{r.merke} {sist.aar}</div>
              <div className="text-[17px] font-semibold tracking-tight tabular-nums mt-0.5">{r.verdi}</div>
              {r.under && <div className="text-[11.5px] text-dim mt-0.5">{r.under}</div>}
            </div>
          ))}
        </div>
        {n.ar.length > 1 && (
          <details className="mt-3 group">
            <summary className="text-[12.5px] font-semibold text-accent cursor-pointer select-none list-none">
              <span className="group-open:hidden">{visAlleAr} ({n.ar.length}) ↓</span>
              <span className="hidden group-open:inline">{visAlleAr} ↑</span>
            </summary>
            <div className="-mx-5 sm:-mx-6 mt-2 border-t border-border">
              <NokkeltallTabell n={n} t={t} />
            </div>
          </details>
        )}
        <p className="text-[11.5px] text-faint mt-3">
          {t.kilde}: {n.kilde} · {new Date(n.hentet).toLocaleDateString("nb-NO")}
        </p>
      </div>
    );
  }

  return (
    <>
      {n.ar.length === 0 ? (
        <p className="px-5 py-4 text-[12.5px] text-dim leading-relaxed">{t.ingen}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-faint">
                <th className="px-5 py-2.5 font-semibold">{t.ar}</th>
                {n.ar.map((a) => (
                  <th key={a.aar} className="px-4 py-2.5 font-semibold text-right tabular-nums">{a.aar}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RADER.map(([felt, type]) => (
                <tr key={felt}>
                  <td className="px-5 py-2.5 text-dim">{t[felt]}</td>
                  {n.ar.map((a) => (
                    <td key={a.aar} className="px-4 py-2.5 text-right tabular-nums">{visTall(a[felt], type)}</td>
                  ))}
                </tr>
              ))}
              {n.ansatte != null && (
                <tr>
                  <td className="px-5 py-2.5 text-dim">{t.ansatte}</td>
                  <td colSpan={n.ar.length} className="px-4 py-2.5 text-right tabular-nums">{n.ansatte}</td>
                </tr>
              )}
              {n.omsetningPerAnsatt != null && (
                <tr>
                  <td className="px-5 py-2.5 text-dim">{t.perAnsatt}</td>
                  <td colSpan={n.ar.length} className="px-4 py-2.5 text-right tabular-nums">{visTall(n.omsetningPerAnsatt, "kr")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="px-5 py-3 text-[11.5px] text-faint border-t border-border">
        {t.kilde}: {n.kilde} · {new Date(n.hentet).toLocaleDateString("nb-NO")}
      </p>
    </>
  );
}
