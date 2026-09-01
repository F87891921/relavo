"use client";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { sendOfferte } from "@/app/internt/handlinger";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[13px] font-semibold px-4 py-2 rounded-xl disabled:opacity-50";
const KNAPP_LYS =
  "text-[13px] font-semibold px-4 py-2 rounded-xl bg-surface border border-border hover:border-border-strong active:scale-[0.97] transition";

/**
 * Verktygsraden ovanför offerten. Ligger utanför själva dokumentet och
 * försvinner vid utskrift — knappar hör inte hemma i en PDF som kunden får.
 */
export function Verktyg({
  id,
  epost,
  redanSand,
  lenke,
}: {
  id: string;
  epost: string | null;
  redanSand: boolean;
  lenke: string;
}) {
  const [til, setTil] = useState(epost ?? "");
  const [svar, setSvar] = useState<{ bra: boolean; tekst: string } | null>(null);
  const [kopierad, setKopierad] = useState(false);
  const [venter, start] = useTransition();

  function skicka() {
    setSvar(null);
    start(async () => {
      const r = await sendOfferte(id, til);
      if (!r.ok) return setSvar({ bra: false, tekst: r.feil });
      setSvar(
        r.epostSendt
          ? { bra: true, tekst: `Offerten är mejlad till ${til}.` }
          : {
              bra: false,
              tekst: `Offerten är markerad som skickad, men inget mejl gick ut. ${r.grunn ?? ""}`,
            },
      );
    });
  }

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(lenke);
      setKopierad(true);
      setTimeout(() => setKopierad(false), 2000);
    } catch {
      setSvar({ bra: false, tekst: "Kunde inte kopiera. Markera länken nedan." });
    }
  }

  return (
    <div className="skjul-i-utskrift bg-canvas rounded-card border border-border p-4 mb-5">
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="grow min-w-[220px]">
          <label htmlFor="til" className="block text-xs font-semibold mb-1.5">
            Skicka till
          </label>
          <input
            id="til"
            type="email"
            value={til}
            onChange={(e) => setTil(e.target.value)}
            placeholder="kontakt@kommune.no"
            className={FELT_FULL}
          />
        </div>
        <button type="button" onClick={skicka} disabled={venter} className={`${KNAPP} mb-[1px]`}>
          {venter ? "Skickar …" : redanSand ? "Skicka igen" : "Skicka offerten"}
        </button>
        <button type="button" onClick={() => window.print()} className={`${KNAPP_LYS} mb-[1px]`}>
          Skriv ut / spara PDF
        </button>
        <button type="button" onClick={kopiera} className={`${KNAPP_LYS} mb-[1px]`}>
          {kopierad ? "Kopierad ✓" : "Kopiera länk"}
        </button>
      </div>

      <p className="text-[11.5px] text-faint mt-2.5 leading-relaxed max-w-[74ch]">
        Kunden får en länk, inte en bilaga. Då kan de svara där de läser
        offerten — och vi ser att den är läst, vad de svarade och varför.
      </p>

      {redanSand && (
        <div className="mt-2.5 font-mono text-[11px] text-dim break-all bg-surface rounded-lg px-3 py-2 border border-border">
          {lenke}
        </div>
      )}

      {svar && (
        <div
          className={`text-[12.5px] rounded-xl px-3.5 py-2.5 mt-3 leading-relaxed ${
            svar.bra ? "bg-good-bg text-good" : "bg-warn-bg text-warn"
          }`}
        >
          {svar.tekst}
        </div>
      )}
    </div>
  );
}
