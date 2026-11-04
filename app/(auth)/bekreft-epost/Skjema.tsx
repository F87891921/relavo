"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { LoggUt } from "@/components/LoggUt";
import { sendPaNytt } from "./handlinger";

export function Skjema() {
  const o = useOrd();
  const t = o.bekreft;
  const [melding, setMelding] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={venter}
        onClick={() => {
          setMelding("");
          setFeil("");
          start(async () => {
            const r = await sendPaNytt();
            if (r.ok) setMelding(t.sendtNy);
            else setFeil(r.feil === "vent" ? t.ventLitt : t.sendingFeilet);
          });
        }}
        className="w-full bg-accent hover:bg-accent-hover active:scale-[0.99] transition text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60"
      >
        {venter ? o.felles.sender : t.sendPaNytt}
      </button>
      {melding && <p className="text-[12.5px] text-good bg-good-bg rounded-xl px-3.5 py-2.5 mt-3">{melding}</p>}
      {feil && <p className="text-[12.5px] text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-3">{feil}</p>}
      <div className="mt-4 text-center">
        <LoggUt tekst={t.feilAdresse} venterTekst={o.felles.sender} />
      </div>
    </div>
  );
}
