"use client";

import { useEffect, useRef, useState } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { formaterOrgnr } from "@/lib/orgnr";
import { sokKunder, type Kundetreff } from "@/app/internt/handlinger";

/**
 * Söker bland befintliga konton och leads medan man skriver. Väljer man ett
 * träff fylls organisationsnummer och kontaktuppgifter i automatiskt — de
 * finns redan, och att skriva in dem på nytt är både långsamt och en chans
 * att skriva fel.
 */
export function KundeSok({
  navn = "kund",
  merke = "Kund",
  standard = "",
  onValgt,
}: {
  navn?: string;
  merke?: string;
  standard?: string;
  onValgt?: (t: Kundetreff) => void;
}) {
  const [tekst, setTekst] = useState(standard);
  const [treff, setTreff] = useState<Kundetreff[]>([]);
  const [apen, setApen] = useState(false);
  const [valgt, setValgt] = useState<Kundetreff | null>(null);
  const boks = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (valgt?.navn === tekst || tekst.trim().length < 2) {
      setTreff([]);
      return;
    }
    // Vänta tills man slutat skriva, annars en fråga per tangenttryck.
    const t = setTimeout(async () => {
      setTreff(await sokKunder(tekst));
      setApen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [tekst, valgt]);

  useEffect(() => {
    const ute = (e: MouseEvent) => {
      if (boks.current && !boks.current.contains(e.target as Node)) setApen(false);
    };
    document.addEventListener("mousedown", ute);
    return () => document.removeEventListener("mousedown", ute);
  }, []);

  return (
    <div className="mb-3.5 relative" ref={boks}>
      <label htmlFor={navn} className="block text-xs font-semibold mb-1.5">
        {merke}
      </label>
      <input
        id={navn}
        name={navn}
        required
        autoComplete="off"
        value={tekst}
        onChange={(e) => {
          setTekst(e.target.value);
          setValgt(null);
        }}
        onFocus={() => treff.length && setApen(true)}
        placeholder="Börja skriv namnet …"
        className={FELT_FULL}
      />

      {valgt && (
        <div className="text-[11.5px] text-faint mt-1.5">
          {valgt.kilde === "kunde" ? "Befintligt konto" : "Lead"}
          {valgt.org_nr && ` · ${formaterOrgnr(valgt.org_nr)}`}
        </div>
      )}

      {apen && treff.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-surface border border-border-strong rounded-xl shadow-lift overflow-hidden max-h-64 overflow-y-auto">
          {treff.map((t) => (
            <li key={`${t.kilde}-${t.navn}`}>
              <button
                type="button"
                onClick={() => {
                  setTekst(t.navn);
                  setValgt(t);
                  setApen(false);
                  onValgt?.(t);
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-canvas transition"
              >
                <span className="block text-[13px] font-semibold">{t.navn}</span>
                <span className="block text-[11.5px] text-faint">
                  {t.kilde === "kunde" ? "Konto" : "Lead"}
                  {t.org_nr && ` · ${formaterOrgnr(t.org_nr)}`}
                  {t.kontaktperson && ` · ${t.kontaktperson}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
