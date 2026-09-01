"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SPRAK, type Sprak } from "@/lib/sprak/felles";
import { settSprak } from "@/lib/sprak/handlinger";

/**
 * Språkvelgeren.
 *
 * Samme komponent på landingssiden, i kundedelen og i kontopanelet — tre
 * nesten like velgere ville blitt tre steder å glemme et språk.
 *
 * Valget lagres i en kapsel med én gang, og på profilen hvis man er logget
 * inn. Derfor virker den også for den som ennå ikke har en konto, som er
 * hele poenget med å ha den på landingssiden.
 */
export function Sprakvelger({
  na,
  variant = "lys",
  retning = "opp",
}: {
  na: Sprak;
  /** mork for kontopanelets svarte sidemeny, minimal for landingssiden. */
  variant?: "lys" | "mork" | "minimal";
  /** Sidemenyen står nederst, så der må lista opp. I toppen skal den ned. */
  retning?: "opp" | "ned";
}) {
  const [apen, setApen] = useState(false);
  const [venter, start] = useTransition();
  const boks = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!apen) return;
    const lukk = (e: MouseEvent) => {
      if (!boks.current?.contains(e.target as Node)) setApen(false);
    };
    const tast = (e: KeyboardEvent) => e.key === "Escape" && setApen(false);
    document.addEventListener("mousedown", lukk);
    window.addEventListener("keydown", tast);
    return () => {
      document.removeEventListener("mousedown", lukk);
      window.removeEventListener("keydown", tast);
    };
  }, [apen]);

  const naa = SPRAK.find((s) => s.kode === na) ?? SPRAK[0];

  const knapp =
    variant === "mork"
      ? "text-white/60 hover:bg-white/10 hover:text-white"
      : variant === "minimal"
        ? "text-[var(--text-dim)] hover:text-[var(--text)]"
        : "text-dim hover:bg-canvas hover:text-ink";

  function velg(kode: Sprak) {
    setApen(false);
    if (kode === na) return;
    start(async () => {
      await settSprak(kode);
      router.refresh();
    });
  }

  return (
    <div ref={boks} className="relative">
      <button
        type="button"
        onClick={() => setApen(!apen)}
        disabled={venter}
        aria-haspopup="listbox"
        aria-expanded={apen}
        aria-label={`Språk: ${naa.navn}`}
        className={`flex items-center gap-1.5 text-[12.5px] font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 ${knapp}`}
      >
        {/* Kloden, ikke et flagg. Et flagg står for et land, og norsk er
            ikke det samme som Norge — svensker leser norsk hver dag. */}
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
          <g fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="8" cy="8" r="6.2" />
            <ellipse cx="8" cy="8" rx="2.6" ry="6.2" />
            <path d="M1.9 6h12.2M1.9 10h12.2" />
          </g>
        </svg>
        {naa.kort}
      </button>

      {apen && (
        <ul
          role="listbox"
          className={`absolute right-0 z-50 min-w-[136px] bg-surface rounded-xl border border-border shadow-lift py-1.5 overflow-hidden ${
            retning === "opp" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {SPRAK.map((s) => (
            <li key={s.kode}>
              <button
                type="button"
                role="option"
                aria-selected={s.kode === na}
                onClick={() => velg(s.kode)}
                className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] transition hover:bg-canvas ${
                  s.kode === na ? "font-semibold text-ink" : "text-dim"
                }`}
              >
                {s.navn}
                {s.kode === na && (
                  <span className="ml-auto text-accent text-[13px] leading-none">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
