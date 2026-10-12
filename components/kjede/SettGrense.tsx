"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useOrd } from "@/components/Sprakgiver";
import { FELT_FULL } from "@/components/ui/felt";
import { settKjedegrense } from "@/app/(dashboard)/kjede/handlinger";

/** Selskap kan sette sin egen grense for hvor dypt en kjede får gå. Uten grense flagges ingenting. */
export function SettGrense({ grense }: { grense: number | null }) {
  const k = useOrd().kjede;
  const router = useRouter();
  const [verdi, setVerdi] = useState(grense ? String(grense) : "");
  const [venter, start] = useTransition();
  return (
    <div className="bg-surface rounded-card shadow-card px-4 sm:px-5 py-4 mb-4 flex flex-wrap items-end gap-3">
      <div className="max-w-[56ch] flex-1 min-w-[240px]">
        <div className="text-[13px] font-semibold mb-0.5">{k.egenGrenseTittel}</div>
        <p className="text-[12px] text-dim leading-relaxed">{k.egenGrenseTekst}</p>
      </div>
      <input inputMode="numeric" value={verdi} onChange={(e) => setVerdi(e.target.value)} placeholder="–" className={`${FELT_FULL} w-[80px]`} />
      <button
        type="button"
        disabled={venter}
        onClick={() => start(async () => { await settKjedegrense(verdi ? Number(verdi) : null); router.refresh(); })}
        className="text-[12.5px] font-semibold px-3.5 py-2.5 rounded-lg bg-surface border border-border hover:border-border-strong disabled:opacity-50"
      >
        {k.lagre}
      </button>
    </div>
  );
}
