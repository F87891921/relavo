"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { FELT_FULL } from "@/components/ui/felt";
import { loggKontakt } from "@/app/internt/handlinger";

/** To handlinger per kunde: skriv til dem, og logg at vi har gjort det. */
export function KundeKontakt({ id, epost, navn }: { id: string; epost: string | null; navn: string | null }) {
  const t = useOrd().aktivitetssider;
  const [apen, setApen] = useState(false);
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const mailto = epost
    ? `mailto:${epost}?subject=${encodeURIComponent(t.epostEmne)}&body=${encodeURIComponent(t.epostTekst.replace("{navn}", navn ?? ""))}`
    : null;

  return (
    <div className="whitespace-nowrap">
      {mailto && (
        <a href={mailto} className="text-[12.5px] font-semibold text-accent hover:underline mr-3">
          {t.skrivTil}
        </a>
      )}
      {!apen ? (
        <button type="button" onClick={() => setApen(true)} className="text-[12.5px] text-dim hover:underline">
          {t.loggKontakt}
        </button>
      ) : (
        <div className="mt-2 whitespace-normal min-w-[220px]">
          <label className="block text-[11.5px] font-semibold mb-1">{t.notat}</label>
          <textarea rows={2} value={notat} onChange={(e) => setNotat(e.target.value)} className={`${FELT_FULL} max-w-none resize-y mb-2`} />
          <button
            type="button"
            disabled={venter}
            onClick={() =>
              start(async () => {
                const r = await loggKontakt(id, notat);
                if (!r.ok) setFeil(r.feil);
                else {
                  setApen(false);
                  setNotat("");
                }
              })
            }
            className="text-[12.5px] font-semibold px-3 py-1.5 rounded-lg bg-accent text-white disabled:opacity-50"
          >
            {t.lagre}
          </button>
          {feil && <div className="text-[11px] text-bad mt-1">{feil}</div>}
        </div>
      )}
    </div>
  );
}
