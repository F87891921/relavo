"use client";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { svarForesporsel } from "./handlinger";

export function Skjema({ token }: { token: string }) {
  const [rader, setRader] = useState(["", ""]);
  const [ingen, setIngen] = useState(false);
  const [feil, setFeil] = useState("");
  const [ferdig, setFerdig] = useState(false);
  const [venter, start] = useTransition();

  if (ferdig)
    return (
      <div className="bg-good-bg text-good rounded-xl px-5 py-4">
        <div className="text-[14px] font-semibold mb-1">Takk, svaret er mottatt</div>
        <p className="text-[12.5px] leading-relaxed">Vi har gitt beskjed. Du kan lukke siden.</p>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("token", token);
        setFeil("");
        start(async () => {
          const r = await svarForesporsel(fd);
          if (r.ok) setFerdig(true);
          else setFeil(r.feil);
        });
      }}
    >
      <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
        <input type="checkbox" name="ingen" checked={ingen} onChange={(e) => setIngen(e.target.checked)} className="mt-1 accent-[#654b70]" />
        <span className="text-[13.5px]">Vi bruker ingen underleverandører på dette oppdraget.</span>
      </label>

      {!ingen && (
        <div className="mb-5">
          <div className="text-xs font-semibold mb-2">Organisasjonsnumre til underleverandørene</div>
          <div className="space-y-2">
            {rader.map((r, i) => (
              <input
                key={i}
                name="orgnr"
                inputMode="numeric"
                value={r}
                placeholder="9 siffer"
                onChange={(e) => setRader(rader.map((x, j) => (j === i ? e.target.value : x)))}
                className={`${FELT_FULL} max-w-[260px]`}
              />
            ))}
          </div>
          <button type="button" onClick={() => setRader([...rader, ""])} className="text-[12.5px] font-semibold text-accent hover:underline mt-2">
            + Legg til flere
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-4 mb-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Ditt navn</label>
          <input name="navn" required className={`${FELT_FULL} max-w-none mb-3`} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Din rolle</label>
          <input name="rolle" required placeholder="Daglig leder" className={`${FELT_FULL} max-w-none mb-3`} />
        </div>
      </div>
      <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
        <input type="checkbox" name="bekreftet" className="mt-1 accent-[#654b70]" />
        <span className="text-[12.5px] text-dim">Jeg bekrefter at opplysningene er riktige så langt jeg kjenner til.</span>
      </label>
      {feil && <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">{feil}</div>}
      <button disabled={venter} className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
        {venter ? "Sender …" : "Send svar"}
      </button>
    </form>
  );
}
