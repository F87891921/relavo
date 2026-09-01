"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { Merke } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { synkFortnox, koblFortnox } from "@/app/internt/handlinger";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50";

/**
 * Fortnox-koblingen.
 *
 * Fakturaene skrives i Fortnox. Denne henter dem inn så de er synlige her
 * også — poenget er å slippe å føre dem to ganger, ikke å flytte
 * faktureringen hit.
 */
export function Fortnox({
  koblet,
  sistSynk,
  sistFeil,
}: {
  koblet: boolean;
  sistSynk: string | null;
  sistFeil: string | null;
}) {
  const o = useOrd();
  const [apen, setApen] = useState(false);
  const [melding, setMelding] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  return (
    <div className="bg-surface rounded-card border border-border shadow-card px-4 sm:px-5 py-4 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[13.5px] font-semibold">Fortnox</span>
            {koblet ? (
              <Merke tone="god">{o.internt.fortnoxKoblet}</Merke>
            ) : (
              <Merke tone="noytral">{o.internt.fortnoxIkkeKoblet}</Merke>
            )}
          </div>
          <p className="text-[11.5px] text-faint mt-1 leading-relaxed max-w-[70ch]">
            {o.internt.fortnoxHjelp}
            {sistSynk && (
              <>
                {" "}
                {o.internt.sistSynk}{" "}
                {new Date(sistSynk).toLocaleString("sv-SE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
                .
              </>
            )}
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          {koblet && (
            <button
              type="button"
              disabled={venter}
              onClick={() => {
                setFeil("");
                setMelding("");
                start(async () => {
                  const r = await synkFortnox();
                  if (r.ok)
                    setMelding(
                      `${r.nye} ${o.internt.nyeFakturaer}, ${r.oppdaterte} ${o.internt.oppdaterte}.`,
                    );
                  else setFeil(r.feil);
                });
              }}
              className={KNAPP}
            >
              {venter ? o.felles.henter : o.internt.hentFakturaer}
            </button>
          )}
          <button
            type="button"
            onClick={() => setApen(!apen)}
            className="text-[12.5px] text-dim hover:text-ink px-2 transition"
          >
            {koblet ? o.internt.byttTokens : o.internt.koblTil}
          </button>
        </div>
      </div>

      {apen && (
        <form
          className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-x-4"
          onSubmit={(e) => {
            e.preventDefault();
            setFeil("");
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const r = await koblFortnox(fd);
              if (r.ok) {
                setApen(false);
                setMelding(o.internt.fortnoxLagret);
              } else setFeil(r.feil);
            });
          }}
        >
          <div className="mb-3.5">
            <label className="block text-xs font-semibold mb-1.5">
              {o.internt.tilgangstoken}
            </label>
            <input name="tilgangstoken" className={FELT_FULL} autoComplete="off" />
          </div>
          <div className="mb-3.5">
            <label className="block text-xs font-semibold mb-1.5">
              {o.internt.fornyelsestoken}
            </label>
            <input name="fornyelsestoken" className={FELT_FULL} autoComplete="off" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={venter} className={KNAPP}>
              {venter ? o.felles.lagrer : o.felles.lagre}
            </button>
            <p className="text-[11.5px] text-faint mt-2 leading-relaxed max-w-[70ch]">
              {o.internt.tokenHjelp}
            </p>
          </div>
        </form>
      )}

      {melding && (
        <div className="text-[12.5px] text-good bg-good-bg rounded-xl px-3.5 py-2.5 mt-3">
          {melding}
        </div>
      )}
      {(feil || sistFeil) && (
        <div className="text-[12.5px] text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-3 leading-relaxed">
          {feil || sistFeil}
        </div>
      )}
    </div>
  );
}
