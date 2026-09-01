"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import type { Tone } from "@/components/ui";

type Svar = { ok: true } | { ok: false; feil: string };
export type StatusVal = { verdi: string; tekst: string; tone?: Tone };

const TONER: Record<Tone, string> = {
  god: "bg-good-bg text-good",
  advarsel: "bg-warn-bg text-warn",
  brudd: "bg-bad-bg text-bad",
  noytral: "bg-canvas text-dim",
  aksent: "bg-surface2 text-accent",
};

// Prikken i menyen tar fargen, ikke den lyse bakgrunnen — 10 % opasitet på
// en hvit flate er ingen prikk.
const PRIKK: Record<Tone, string> = {
  god: "bg-good",
  advarsel: "bg-warn",
  brudd: "bg-bad",
  noytral: "bg-border-strong",
  aksent: "bg-accent",
};

/**
 * Status som merke man trykker på.
 *
 * Før sto merket og en nedtrekksliste ved siden av hverandre: to ting som
 * viser det samme, der bare den ene lar seg endre. Nå er merket knappen.
 *
 * Menyen legges i en portal, ikke i tabellcellen. Tabeller ruller vannrett,
 * og en overflow på én akse gjør begge til «auto» — en meny inni cellen
 * ville blitt klippet av kanten på raden i stedet for å legge seg over.
 */
export function StatusMerke({
  id,
  verdi,
  val,
  handling,
  laast = false,
}: {
  id: string;
  verdi: string;
  val: StatusVal[];
  handling: (id: string, status: string) => Promise<Svar>;
  /** For statuser satt av noen andre enn oss — da er merket bare et merke. */
  laast?: boolean;
}) {
  const [apen, setApen] = useState(false);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();
  const knapp = useRef<HTMLButtonElement>(null);
  const [rute, setRute] = useState<{ x: number; y: number; b: number } | null>(null);

  const na = val.find((v) => v.verdi === verdi);
  const tone = na?.tone ?? "noytral";

  useEffect(() => {
    if (!apen) return;
    const lukk = (e: MouseEvent) => {
      if (!knapp.current?.contains(e.target as Node)) setApen(false);
    };
    const tast = (e: KeyboardEvent) => e.key === "Escape" && setApen(false);
    // Ruller siden, følger ikke menyen med — da er det riktigere å lukke den
    // enn å la den bli stående over feil rad.
    const rull = () => setApen(false);
    document.addEventListener("mousedown", lukk);
    window.addEventListener("keydown", tast);
    window.addEventListener("scroll", rull, true);
    window.addEventListener("resize", rull);
    return () => {
      document.removeEventListener("mousedown", lukk);
      window.removeEventListener("keydown", tast);
      window.removeEventListener("scroll", rull, true);
      window.removeEventListener("resize", rull);
    };
  }, [apen]);

  function apne() {
    const r = knapp.current?.getBoundingClientRect();
    if (r) setRute({ x: r.left, y: r.bottom + 6, b: r.width });
    setApen((a) => !a);
  }

  function velg(ny: string) {
    setApen(false);
    if (ny === verdi) return;
    setFeil("");
    start(async () => {
      const res = await handling(id, ny);
      if (!res.ok) setFeil(res.feil);
    });
  }

  if (laast)
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${TONER[tone]}`}
      >
        {na?.tekst ?? verdi}
      </span>
    );

  return (
    <>
      <button
        ref={knapp}
        type="button"
        onClick={apne}
        disabled={venter}
        aria-haspopup="listbox"
        aria-expanded={apen}
        title="Klicka för att ändra status"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition
          hover:brightness-[0.96] active:scale-[0.97] disabled:opacity-50
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${TONER[tone]}`}
      >
        {venter ? "Sparar …" : (na?.tekst ?? verdi)}
        <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden="true" className="opacity-60">
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {apen &&
        rute &&
        createPortal(
          <div
            role="listbox"
            style={{ position: "fixed", left: rute.x, top: rute.y, minWidth: Math.max(rute.b, 172) }}
            className="z-50 bg-surface rounded-xl border border-border shadow-lift py-1.5 overflow-hidden"
          >
            {val.map((v) => (
              <button
                key={v.verdi}
                type="button"
                role="option"
                aria-selected={v.verdi === verdi}
                onClick={() => velg(v.verdi)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] transition hover:bg-canvas ${
                  v.verdi === verdi ? "font-semibold" : "text-dim"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${PRIKK[v.tone ?? "noytral"]}`}
                />
                {v.tekst}
                {v.verdi === verdi && (
                  <span className="ml-auto text-accent text-[13px] leading-none">✓</span>
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}

      {feil && <span className="block text-[11px] text-bad mt-1">{feil}</span>}
    </>
  );
}
