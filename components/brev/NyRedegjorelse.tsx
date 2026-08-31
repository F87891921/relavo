"use client";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { lagreRedegjorelse } from "@/app/(dashboard)/tilbud/handlinger";

/**
 * Utkastet til § 24-9-kravet, klart til å lagres. Først når det er lagret
 * kan sending, svar og vurdering følges — og det er den kjeden som skal
 * kunne vises fram i anskaffelsesprotokollen.
 */
export function NyRedegjorelse(o: {
  leverandor: string;
  anskaffelseRef: string;
  anskaffelseNavn: string;
  tilbudssum: number;
  median: number;
  avvik: number;
  frist: string;
  utkast: string;
}) {
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  return (
    <div className="bg-surface rounded-card border border-border shadow-card p-6 mb-5">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h2 className="text-[15px] font-semibold">Krav om redegjørelse</h2>
        <span className="text-[11.5px] text-faint">§ 24-9</span>
      </div>
      <p className="text-[12.5px] text-dim leading-relaxed mb-4 max-w-[70ch]">
        Til <b className="text-ink">{o.leverandor}</b>. Kravet må være konkret
        om hva som skal forklares — et generelt spørsmål om prisen oppfyller
        ikke plikten.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await lagreRedegjorelse(fd);
            if (!res.ok) setFeil(res.feil);
          });
        }}
      >
        <input type="hidden" name="leverandor_navn" value={o.leverandor} />
        <input type="hidden" name="anskaffelse_ref" value={o.anskaffelseRef} />
        <input type="hidden" name="anskaffelse_navn" value={o.anskaffelseNavn} />
        <input type="hidden" name="tilbudssum" value={o.tilbudssum} />
        <input type="hidden" name="median" value={o.median} />
        <input type="hidden" name="avvik_prosent" value={o.avvik} />

        <div className="grid sm:grid-cols-2 gap-x-4">
          <div className="mb-3.5">
            <label htmlFor="epost" className="block text-xs font-semibold mb-1.5">
              Leverandørens e-post
            </label>
            <input
              id="epost"
              name="leverandor_epost"
              type="email"
              placeholder="post@leverandor.no"
              className={FELT_FULL}
            />
          </div>
          <div className="mb-3.5">
            <label htmlFor="frist" className="block text-xs font-semibold mb-1.5">
              Frist for svar
            </label>
            <input
              id="frist"
              name="frist"
              type="date"
              defaultValue={o.frist}
              className={FELT_FULL}
            />
            <div className="text-[11.5px] text-faint mt-1.5">
              Ti virkedager fram er vanlig.
            </div>
          </div>
        </div>

        <label htmlFor="utkast" className="block text-xs font-semibold mb-1.5">
          Utkast
        </label>
        <textarea
          id="utkast"
          name="utkast"
          rows={14}
          defaultValue={o.utkast}
          className={`${FELT_FULL} max-w-none resize-y text-[12.5px] leading-relaxed`}
        />

        {feil && (
          <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-3">
            {feil}
          </div>
        )}

        <button
          type="submit"
          disabled={venter}
          className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl mt-4 disabled:opacity-50"
        >
          {venter ? "Lagrer …" : "Lagre utkastet"}
        </button>
      </form>
    </div>
  );
}
