"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { settPlanStatus } from "@/app/internt/handlinger";

/** Rask markering av en rad i fakturaplanen: fakturert, så betalt. */
export function PlanKnapp({ id, status }: { id: string; status: string }) {
  const t = useOrd().fakturaplan;
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState("");
  const neste = status === "planlagt" ? "fakturert" : status === "fakturert" ? "betalt" : null;
  if (!neste) return <span />;
  return (
    <span>
      <button
        type="button"
        disabled={venter}
        onClick={() =>
          start(async () => {
            const r = await settPlanStatus(id, neste);
            if (!r.ok) setFeil(r.feil);
          })
        }
        className="text-[12.5px] font-semibold text-accent hover:underline disabled:opacity-50 whitespace-nowrap"
      >
        {neste === "fakturert" ? t.markerFakturert : t.markerBetalt}
      </button>
      {feil && <div className="text-[11px] text-bad">{feil}</div>}
    </span>
  );
}
