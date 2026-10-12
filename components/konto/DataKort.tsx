"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useOrd } from "@/components/Sprakgiver";
import { FELT_FULL } from "@/components/ui/felt";
import { bestillSletting } from "@/app/(dashboard)/konto/handlinger";

/** Last ned alt, eller slett kontoen. Bare for administrator. */
export function DataKort() {
  const t = useOrd().datakort;
  const router = useRouter();
  const [apen, setApen] = useState(false);
  const [navn, setNavn] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <p className="text-[12.5px] text-dim leading-relaxed max-w-[56ch]">
          {t.tekst}
          <br />
          <span className="text-faint">{t.eksportHjelp}</span>
        </p>
        <a
          href="/konto/eksport"
          className="text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-border-strong transition whitespace-nowrap"
        >
          {t.eksport}
        </a>
      </div>

      <div className="border-t border-border pt-5">
        <div className="text-[13.5px] font-semibold mb-1">{t.slettTittel}</div>
        <p className="text-[12.5px] text-dim leading-relaxed mb-3 max-w-[62ch]">{t.slettTekst}</p>
        {!apen ? (
          <button type="button" onClick={() => setApen(true)} className="text-[12.5px] font-semibold text-bad hover:underline">
            {t.slettKnapp}
          </button>
        ) : (
          <div className="max-w-[420px]">
            <label htmlFor="slett" className="block text-xs font-semibold mb-1.5">{t.slettBekreft}</label>
            <input id="slett" value={navn} onChange={(e) => setNavn(e.target.value)} className={`${FELT_FULL} max-w-none mb-2.5`} />
            {feil && <div className="text-xs text-bad mb-2">{feil}</div>}
            <button
              type="button"
              disabled={venter || navn.trim().length < 2}
              onClick={() =>
                start(async () => {
                  const r = await bestillSletting(navn);
                  if (!r.ok) return setFeil(r.feil);
                  router.push("/venter");
                  router.refresh();
                })
              }
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-bad text-white disabled:opacity-40"
            >
              {t.slettKnapp}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
