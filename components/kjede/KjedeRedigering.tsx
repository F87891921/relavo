"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useOrd } from "@/components/Sprakgiver";
import { FELT_FULL } from "@/components/ui/felt";
import { leggTilLedd, fjernSisteLedd } from "@/app/(dashboard)/kjede/handlinger";

/** Neste ledd under en kjede. Selskapet slås opp i Enhetsregisteret når man lagrer. */
export function LeggTilLedd({ kontrollId, harLedd }: { kontrollId: string; harLedd: boolean }) {
  const k = useOrd().kjede;
  const router = useRouter();
  const [orgnr, setOrgnr] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="min-w-[200px]">
          <label className="block text-[11.5px] font-semibold mb-1">{k.neste}</label>
          <input
            inputMode="numeric"
            value={orgnr}
            placeholder={k.orgnrPlassholder}
            onChange={(e) => setOrgnr(e.target.value)}
            className={`${FELT_FULL} max-w-none`}
          />
        </div>
        <button
          type="button"
          disabled={venter || orgnr.replace(/\D/g, "").length < 9}
          onClick={() =>
            start(async () => {
              setFeil("");
              const r = await leggTilLedd(kontrollId, orgnr);
              if (!r.ok) return setFeil(r.feil);
              setOrgnr("");
              router.refresh();
            })
          }
          className="text-[12.5px] font-semibold px-3.5 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition disabled:opacity-40"
        >
          {k.leggTil}
        </button>
        {harLedd && (
          <button
            type="button"
            disabled={venter}
            onClick={() =>
              start(async () => {
                const r = await fjernSisteLedd(kontrollId);
                if (!r.ok) setFeil(r.feil);
                else router.refresh();
              })
            }
            className="text-[12.5px] text-dim hover:underline disabled:opacity-40"
          >
            {k.fjernSiste}
          </button>
        )}
      </div>
      {feil && <div className="text-xs text-bad mt-2">{feil}</div>}
    </div>
  );
}

/** Velg en leverandør du har kontrollert og legg inn første ledd under den. */
export function NyKjede({ leverandorer }: { leverandorer: { kontrollId: string; navn: string }[] }) {
  const k = useOrd().kjede;
  const [valgt, setValgt] = useState(leverandorer[0]?.kontrollId ?? "");
  if (!leverandorer.length) return null;
  return (
    <div className="bg-surface rounded-card shadow-card px-4 sm:px-5 py-5 mb-5">
      <h2 className="text-[14px] font-semibold mb-1">{k.nyTittel}</h2>
      <p className="text-[12.5px] text-dim leading-relaxed mb-4 max-w-[70ch]">{k.forklaring}</p>
      <label className="block text-[11.5px] font-semibold mb-1">{k.velgLeverandor}</label>
      <select value={valgt} onChange={(e) => setValgt(e.target.value)} className={`${FELT_FULL} max-w-[420px]`}>
        {leverandorer.map((l) => (
          <option key={l.kontrollId} value={l.kontrollId}>
            {l.navn}
          </option>
        ))}
      </select>
      <LeggTilLedd key={valgt} kontrollId={valgt} harLedd={false} />
    </div>
  );
}
