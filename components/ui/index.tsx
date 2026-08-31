import type { ReactNode } from "react";

/** Sidetittel med undertekst. Samme oppsett på alle skjermbilder. */
export function Sidehode({ tittel, tekst }: { tittel: string; tekst: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">{tittel}</h1>
      <p className="text-sm text-dim max-w-[68ch] leading-relaxed">{tekst}</p>
    </div>
  );
}

export function Kort({
  tittel,
  note,
  children,
  className = "",
}: {
  tittel?: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface rounded-card border border-border shadow-card overflow-hidden ${className}`}>
      {tittel && (
        <div className="flex items-baseline justify-between gap-4 px-5 py-3.5 border-b border-border">
          <span className="text-[13.5px] font-semibold">{tittel}</span>
          {note && <span className="text-[11.5px] text-faint">{note}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Tabell med samme kolonneoppsett overalt. Kolonner uten data viser «—». */
export function Tabell({
  kolonner,
  rader,
  tom = "Ingenting her ennå.",
}: {
  kolonner: string[];
  rader: ReactNode[][];
  tom?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-faint border-b border-border">
            {/* Indeks som nøkkel, ikke teksten: flere tabeller har to tomme
                kolonneoverskrifter, og da kolliderer nøklene. */}
            {kolonner.map((k, i) => (
              <th key={i} className="px-5 py-3 font-semibold whitespace-nowrap">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rader.length ? (
            rader.map((rad, i) => (
              <tr key={i} className="border-b border-border last:border-0 align-top">
                {rad.map((celle, j) => (
                  <td key={j} className="px-5 py-3.5">
                    {celle ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={kolonner.length}
                className="px-5 py-10 text-center text-dim text-sm"
              >
                {tom}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export type Tone = "god" | "advarsel" | "brudd" | "noytral" | "aksent";

const TONER: Record<Tone, string> = {
  god: "bg-good-bg text-good",
  advarsel: "bg-warn-bg text-warn",
  brudd: "bg-bad-bg text-bad",
  noytral: "bg-canvas text-dim",
  aksent: "bg-surface2 text-accent",
};

export function Merke({ tone = "noytral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${TONER[tone]}`}
    >
      {children}
    </span>
  );
}

/** Stort tall med etikett under. Brukes i topplinjene. */
export function Tall({
  verdi,
  merke,
  tone,
}: {
  verdi: string;
  merke: string;
  tone?: Tone;
}) {
  return (
    <div className="bg-surface rounded-card border border-border shadow-card px-5 py-4">
      <div
        className={`text-[26px] font-bold tracking-tight leading-none ${
          tone === "brudd" ? "text-bad" : tone === "advarsel" ? "text-warn" : ""
        }`}
      >
        {verdi}
      </div>
      <div className="text-[12px] text-dim mt-2 leading-snug">{merke}</div>
    </div>
  );
}

export function Rad({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">{children}</div>;
}

/** Framdriftsstripe. Brukes for kontrollplikt og forbruk mot kvote. */
export function Stripe({ andel, tone = "aksent" }: { andel: number; tone?: Tone }) {
  const farge =
    tone === "brudd" ? "bg-bad" : tone === "advarsel" ? "bg-warn" : "bg-accent";
  return (
    <div className="h-2 rounded-full bg-surface2 overflow-hidden">
      <div
        className={`h-full rounded-full ${farge}`}
        style={{ width: `${Math.max(0, Math.min(100, andel))}%` }}
      />
    </div>
  );
}

export const NOK = (n: number) =>
  new Intl.NumberFormat("nb-NO").format(n).replace(/ /g, " ");
