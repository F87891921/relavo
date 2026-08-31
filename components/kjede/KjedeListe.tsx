"use client";

import { useState } from "react";
import { Merke } from "@/components/ui";

/**
 * § 5k tillater høyst to ledd underleverandører i bygg, anlegg og renhold.
 * Hovedleverandøren er ledd 0 — det tredje leddet under den er brudd.
 */
const GRENSE = 2;

export type Kjede = {
  org: string;
  navn: string;
  ledd: { org: string; navn: string }[];
};

export function KjedeListe({ kjeder }: { kjeder: Kjede[] }) {
  const [bareBrudd, setBareBrudd] = useState(false);
  const [apne, setApne] = useState<Record<string, boolean>>({});

  const medStatus = kjeder.map((k) => ({
    ...k,
    antall: k.ledd.length - 1,
    brudd: k.ledd.length - 1 > GRENSE,
  }));

  const brudd = medStatus.filter((k) => k.brudd);
  const vist = bareBrudd ? brudd : medStatus;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="inline-flex rounded-xl bg-surface2 p-0.5">
          <button
            type="button"
            onClick={() => setBareBrudd(false)}
            className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-[10px] transition ${
              !bareBrudd ? "bg-surface shadow-card" : "text-dim hover:text-ink"
            }`}
          >
            Alle ({medStatus.length})
          </button>
          <button
            type="button"
            onClick={() => setBareBrudd(true)}
            className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-[10px] transition ${
              bareBrudd ? "bg-surface shadow-card text-bad" : "text-dim hover:text-ink"
            }`}
          >
            Over grensen ({brudd.length})
          </button>
        </div>

        <span className="text-[12px] text-faint">
          {bareBrudd
            ? "Viser bare kjeder med flere enn to ledd."
            : "Klikk en kjede for å folde den sammen."}
        </span>
      </div>

      <div className="space-y-3">
        {vist.length === 0 && (
          <div className="bg-surface rounded-card shadow-card px-5 py-10 text-center text-dim text-sm">
            Ingen kjeder over grensen i § 5k.
          </div>
        )}

        {vist.map((k) => {
          const foldet = apne[k.org] === false;
          return (
            <div key={k.org} className="bg-surface rounded-card shadow-card overflow-hidden">
              <button
                type="button"
                onClick={() => setApne({ ...apne, [k.org]: foldet })}
                aria-expanded={!foldet}
                className="w-full flex items-center justify-between gap-4 px-5 py-3.5 border-b border-border text-left hover:bg-canvas transition"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="text-[13.5px] font-semibold truncate">{k.navn}</span>
                  {k.brudd ? (
                    <Merke tone="brudd">{k.antall} ledd</Merke>
                  ) : (
                    <Merke tone="god">{k.antall} ledd</Merke>
                  )}
                </span>
                <span className="text-[11.5px] text-faint shrink-0">
                  {foldet ? "Vis" : "Skjul"}
                </span>
              </button>

              {!foldet && (
                <div className="px-5 py-5">
                  <div className="flex flex-wrap items-stretch gap-0">
                    {k.ledd.map((l, i) => {
                      const over = i > GRENSE;
                      return (
                        <div key={l.org} className="flex items-center">
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
                                  ? "bg-surface shadow-card ring-[1.5px] ring-accent"
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
                              {l.navn}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    {k.brudd ? (
                      <div className="bg-bad-bg text-bad rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed">
                        <b>Brudd på § 5k.</b> Kjeden har {k.antall} ledd, grensen
                        er {GRENSE}. Enten kuttes det nederste leddet, eller så
                        må oppdragsgiver gi dispensasjon og begrunne den i
                        anskaffelsesprotokollen.
                      </div>
                    ) : (
                      <Merke tone="god">Innenfor grensen i § 5k</Merke>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
