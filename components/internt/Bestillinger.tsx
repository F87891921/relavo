"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { Merke } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { formaterOrgnr } from "@/lib/orgnr";
import {
  godkjennKonto,
  krevForskudd,
  betalingMottatt,
  avslaKonto,
} from "@/app/internt/handlinger";

export type Bestilling = {
  id: string;
  navn: string;
  org_nr: string | null;
  plan: string;
  status: string;
  betalingsmate: string | null;
  forskuddsbetaling: boolean;
  bestilt: string | null;
};

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50";
const KNAPP_LYS =
  "text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-border-strong transition disabled:opacity-50";

/**
 * Kontoer som venter på oss.
 *
 * Kredittkontrollen ligger på sin egen side og kjøres på organisasjons-
 * nummeret. Her tas beslutningen, og de tre utfallene står ved siden av
 * hverandre: åpne nå, krev pengene først, eller avslå med begrunnelse.
 */
export function Bestillinger({ rader }: { rader: Bestilling[] }) {
  const o = useOrd();
  const [venter, start] = useTransition();
  const [avslar, setAvslar] = useState<string | null>(null);
  const [grunn, setGrunn] = useState("");
  const [feil, setFeil] = useState("");

  if (!rader.length)
    return (
      <div className="bg-surface rounded-card border border-border shadow-card px-5 py-10 text-center text-dim text-sm mb-5">
        {o.betaling.ingenVenter}
      </div>
    );

  return (
    <div className="bg-surface rounded-card border border-accent/30 shadow-card overflow-hidden mb-5">
      <div className="px-4 sm:px-5 py-3 border-b border-border bg-surface2">
        <span className="text-[13.5px] font-semibold text-accent">
          {rader.length} {o.betaling.nyeBestillinger.toLowerCase()}
        </span>
      </div>

      <ul>
        {rader.map((r) => (
          <li key={r.id} className="px-4 sm:px-5 py-4 border-b border-border last:border-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="text-[14px] font-semibold">{r.navn}</div>
                <div className="text-[11.5px] text-faint mt-0.5">
                  {r.org_nr && (
                    <span className="font-mono">{formaterOrgnr(r.org_nr)}</span>
                  )}
                  {r.org_nr && " · "}
                  {r.plan}
                  {" · "}
                  {r.betalingsmate === "kort" ? o.betaling.kort : o.betaling.faktura}
                  {r.bestilt &&
                    ` · ${o.betaling.bestiltDen} ${new Date(r.bestilt).toLocaleDateString("sv-SE")}`}
                </div>
              </div>
              <Merke tone={r.status === "venter_betaling" ? "advarsel" : "aksent"}>
                {r.status === "venter_betaling"
                  ? r.forskuddsbetaling
                    ? o.betaling.forskudd
                    : o.betaling.venterBetaling
                  : o.betaling.venterKreditt}
              </Merke>
            </div>

            {avslar === r.id ? (
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  {o.betaling.avslagGrunn}
                </label>
                <textarea
                  rows={2}
                  value={grunn}
                  onChange={(e) => setGrunn(e.target.value)}
                  className={`${FELT_FULL} max-w-none resize-y mb-2.5`}
                />
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    disabled={venter}
                    onClick={() =>
                      start(async () => {
                        const res = await avslaKonto(r.id, grunn);
                        if (res.ok) {
                          setAvslar(null);
                          setGrunn("");
                        } else setFeil(res.feil);
                      })
                    }
                    className={KNAPP}
                  >
                    {o.betaling.avslaa}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvslar(null)}
                    className="text-[12.5px] text-dim hover:text-ink px-2 transition"
                  >
                    {o.felles.avbryt}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={venter}
                  onClick={() =>
                    start(async () => {
                      const res = await godkjennKonto(r.id);
                      if (!res.ok) setFeil(res.feil);
                    })
                  }
                  className={KNAPP}
                >
                  {r.forskuddsbetaling
                    ? o.betaling.betalingMottatt
                    : o.betaling.godkjennOgApne}
                </button>

                {!r.forskuddsbetaling && r.betalingsmate === "faktura" && (
                  <button
                    type="button"
                    disabled={venter}
                    onClick={() =>
                      start(async () => {
                        const res = await krevForskudd(r.id);
                        if (!res.ok) setFeil(res.feil);
                      })
                    }
                    className={KNAPP_LYS}
                  >
                    {o.betaling.kreverForskudd}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAvslar(r.id)}
                  className="text-[12.5px] text-bad hover:underline px-2"
                >
                  {o.betaling.avslaa}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg px-4 sm:px-5 py-2.5">{feil}</div>
      )}
    </div>
  );
}
