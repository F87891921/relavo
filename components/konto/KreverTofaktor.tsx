"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { settKreverTofaktor } from "@/app/(dashboard)/konto/tofaktor";

/** Administratorens bryter: krev tofaktor for alle i organisasjonen. */
export function KreverTofaktor({ pa }: { pa: boolean }) {
  const t = useOrd().tofaktorKrav;
  const [verdi, setVerdi] = useState(pa);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  return (
    <div className="mt-5 pt-5 border-t border-border">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={verdi}
          disabled={venter}
          onChange={(e) => {
            const ny = e.target.checked;
            setVerdi(ny);
            setFeil("");
            start(async () => {
              const r = await settKreverTofaktor(ny);
              if (!r.ok) {
                setVerdi(!ny);
                setFeil(r.feil);
              }
            });
          }}
          className="mt-1 accent-[#654b70]"
        />
        <span>
          <span className="block text-[13.5px] font-semibold">{t.tittel}</span>
          <span className="block text-[12.5px] text-dim leading-relaxed mt-0.5">{t.tekst}</span>
        </span>
      </label>
      {feil && <div className="text-xs text-bad mt-2">{feil}</div>}
    </div>
  );
}
