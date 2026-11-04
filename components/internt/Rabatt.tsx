"use client";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { Merke } from "@/components/ui";
import { lagRabattkode, slaAvRabattkode } from "@/app/internt/handlinger";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50";

export function RabattSkjema() {
  const [type, setType] = useState<"prosent" | "belop">("prosent");
  const [varighet, setVarighet] = useState<"once" | "repeating" | "forever">("once");
  const [feil, setFeil] = useState("");
  const [ok, setOk] = useState("");
  const [venter, start] = useTransition();

  return (
    <form
      className="grid sm:grid-cols-2 gap-x-4"
      onSubmit={(e) => {
        e.preventDefault();
        setFeil("");
        setOk("");
        const skjema = e.currentTarget;
        const fd = new FormData(skjema);
        start(async () => {
          const r = await lagRabattkode(fd);
          if (r.ok) {
            setOk("Koden er laget. Kunden skriver den inn på Stripes betalingsside.");
            skjema.reset();
            setType("prosent");
            setVarighet("once");
          } else setFeil(r.feil);
        });
      }}
    >
      <div className="mb-3.5">
        <label className="block text-xs font-semibold mb-1.5">Kode</label>
        <input name="kode" className={FELT_FULL} placeholder="VELKOMMEN20" autoComplete="off" required />
      </div>
      <div className="mb-3.5">
        <label className="block text-xs font-semibold mb-1.5">Rabatt</label>
        <div className="flex gap-2">
          <input name="verdi" className={FELT_FULL} inputMode="decimal" placeholder={type === "prosent" ? "20" : "500"} required />
          <select name="type" value={type} onChange={(e) => setType(e.target.value as "prosent" | "belop")} className={FELT_FULL + " max-w-[110px]"}>
            <option value="prosent">%</option>
            <option value="belop">kr</option>
          </select>
        </div>
      </div>
      <div className="mb-3.5">
        <label className="block text-xs font-semibold mb-1.5">Hvor lenge</label>
        <select name="varighet" value={varighet} onChange={(e) => setVarighet(e.target.value as "once" | "repeating" | "forever")} className={FELT_FULL}>
          <option value="once">Første betaling</option>
          <option value="repeating">Et antall måneder</option>
          <option value="forever">Hele avtalen</option>
        </select>
      </div>
      <div className="mb-3.5">
        <label className="block text-xs font-semibold mb-1.5">Måneder (bare ved «et antall måneder»)</label>
        <input name="maneder" className={FELT_FULL} inputMode="numeric" placeholder="12" disabled={varighet !== "repeating"} />
      </div>
      <div className="mb-3.5">
        <label className="block text-xs font-semibold mb-1.5">Maks antall bruk (valgfritt)</label>
        <input name="maks" className={FELT_FULL} inputMode="numeric" placeholder="10" />
      </div>
      <div className="mb-3.5">
        <label className="block text-xs font-semibold mb-1.5">Utløper (valgfritt)</label>
        <input name="utloper" type="date" className={FELT_FULL} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={venter} className={KNAPP}>
          {venter ? "Lager …" : "Lag rabattkode"}
        </button>
        <p className="text-[11.5px] text-faint mt-2 leading-relaxed max-w-[70ch]">
          Koden virker på kortbetaling (selskap). Kommuner betaler med faktura, og får rabatten som et lavere
          pris på tilbudet.
        </p>
        {ok && <div className="text-[12.5px] text-good bg-good-bg rounded-xl px-3.5 py-2.5 mt-3">{ok}</div>}
        {feil && <div className="text-[12.5px] text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-3">{feil}</div>}
      </div>
    </form>
  );
}

export function SlaAv({ id }: { id: string }) {
  const [venter, start] = useTransition();
  return (
    <button
      type="button"
      disabled={venter}
      onClick={() => start(async () => void (await slaAvRabattkode(id)))}
      className="text-[12px] text-dim hover:text-bad transition disabled:opacity-50"
    >
      {venter ? "…" : "Slå av"}
    </button>
  );
}

export function Aktiv({ aktiv }: { aktiv: boolean }) {
  return <Merke tone={aktiv ? "god" : "noytral"}>{aktiv ? "Aktiv" : "Av"}</Merke>;
}
