"use client";

import Link from "next/link";
import { useTransition } from "react";
import { markerVarselLest, markerAlleVarslerLest } from "@/app/internt/handlinger";

export type Varsel = {
  id: string;
  slag: string;
  tittel: string;
  tekst: string | null;
  lenke: string | null;
  opprettet: string;
};

/**
 * Notiser till personalen.
 *
 * Kommer när en kund gör något vi inte startade — accepterar eller nekar en
 * offert. Det som inte hör hemma här är sådant som ändå syns i listorna:
 * en notis per sak vi själva klickade fram är brus, inte information.
 */
export function Varsler({ varsler }: { varsler: Varsel[] }) {
  const [venter, start] = useTransition();

  if (!varsler.length) return null;

  return (
    <div className="bg-surface rounded-card border border-accent/30 shadow-card overflow-hidden mb-5">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3 border-b border-border bg-surface2">
        <span className="text-[13.5px] font-semibold text-accent">
          {varsler.length} {varsler.length === 1 ? "ny notis" : "nya notiser"}
        </span>
        <button
          type="button"
          disabled={venter}
          onClick={() => start(async () => void (await markerAlleVarslerLest()))}
          className="text-[12px] text-dim hover:text-ink transition disabled:opacity-50"
        >
          Markera alla som lästa
        </button>
      </div>

      <ul>
        {varsler.map((v) => (
          <li
            key={v.id}
            className="flex items-start justify-between gap-4 px-4 sm:px-5 py-3.5 border-b border-border last:border-0"
          >
            <div className="min-w-0">
              <div className="text-[13px] font-semibold">{v.tittel}</div>
              {v.tekst && (
                <div className="text-[12px] text-dim mt-1 italic leading-relaxed">
                  ”{v.tekst}”
                </div>
              )}
              <div className="text-[11px] text-faint mt-1">
                {new Date(v.opprettet).toLocaleString("sv-SE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {v.lenke && (
                <Link
                  href={v.lenke}
                  className="text-[12.5px] font-semibold text-accent hover:underline whitespace-nowrap"
                >
                  Öppna →
                </Link>
              )}
              <button
                type="button"
                disabled={venter}
                onClick={() => start(async () => void (await markerVarselLest(v.id)))}
                className="text-[12px] text-faint hover:text-ink transition disabled:opacity-50"
                title="Markera som läst"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
