"use client";

import { useState, useTransition } from "react";
import { settAnsatt } from "@/app/internt/handlinger";

const VAL = [
  { verdi: "kund", tekst: "Kund" },
  { verdi: "personal", tekst: "Personal" },
  { verdi: "superadmin", tekst: "Superadmin" },
];

export function PersonalVelger({
  id,
  ansatt,
  niva,
  erDegSelv,
}: {
  id: string;
  ansatt: boolean;
  niva: string | null;
  erDegSelv: boolean;
}) {
  const [valgt, setValgt] = useState(ansatt ? (niva ?? "personal") : "kund");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  // Ingen ändrar sin egen behörighet. Annars kan den siste superadmin ta
  // bort sig själv och låsa alla ute.
  if (erDegSelv)
    return <span className="text-[12px] text-faint whitespace-nowrap">—</span>;

  return (
    <span>
      <select
        value={valgt}
        disabled={venter}
        onChange={(e) => {
          const ny = e.target.value;
          const forrige = valgt;
          setValgt(ny);
          setFeil("");
          start(async () => {
            const res = await settAnsatt(
              id,
              ny !== "kund",
              ny === "kund" ? null : (ny as "superadmin" | "personal"),
            );
            if (!res.ok) {
              setValgt(forrige);
              setFeil(res.feil);
            }
          });
        }}
        className="text-[12px] px-2 py-1 rounded-lg border border-border bg-surface hover:border-border-strong transition disabled:opacity-50"
      >
        {VAL.map((v) => (
          <option key={v.verdi} value={v.verdi}>
            {v.tekst}
          </option>
        ))}
      </select>
      {feil && <div className="text-[11px] text-bad mt-1 max-w-[24ch]">{feil}</div>}
    </span>
  );
}
