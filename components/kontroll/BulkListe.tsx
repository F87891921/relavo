"use client";

import { useState } from "react";
import { validerOrgnr, formaterOrgnr } from "@/lib/orgnr";
import { Merke, Tabell } from "@/components/ui";
import { INPUT } from "./Steg";

/**
 * Bulkkontroll. Nummerne valideres med modulus 11 med én gang, før noe
 * sendes noe sted — det er billigere å fange tastefeil her enn å oppdage
 * dem som «fant ingen treff» etter hundre oppslag.
 *
 * Selve kjøringen er ikke koblet på ennå; den trenger en kø, siden hundre
 * oppslag mot Enhetsregisteret ikke kan gjøres i én request.
 */
export function BulkListe() {
  const [tekst, setTekst] = useState("");

  const linjer = tekst
    .split(/[\s,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sjekket = linjer.map((l) => ({ rå: l, res: validerOrgnr(l) }));
  const gyldige = sjekket.filter((s) => s.res.ok);
  const ugyldige = sjekket.filter((s) => !s.res.ok);

  return (
    <>
      <div className="bg-surface rounded-card shadow-card p-6 mb-5">
        <label htmlFor="bulk" className="block text-xs font-semibold mb-1.5">
          Organisasjonsnumre
        </label>
        <textarea
          id="bulk"
          rows={7}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder={"924118504\n913550870\n918774203"}
          className={`${INPUT} font-mono resize-y`}
        />
        <div className="text-[11.5px] text-faint mt-1.5">
          Ett nummer per linje, eller skilt med komma. Kontrollsifferet
          valideres med modulus 11 mens du skriver.
        </div>

        {linjer.length > 0 && (
          <div className="flex gap-2.5 mt-4">
            <Merke tone="god">{gyldige.length} gyldige</Merke>
            {ugyldige.length > 0 && (
              <Merke tone="brudd">{ugyldige.length} ugyldige</Merke>
            )}
          </div>
        )}

        <button
          type="button"
          disabled
          className="mt-5 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl opacity-40 pointer-events-none"
        >
          Kjør {gyldige.length || ""} kontroller
        </button>
        <div className="text-[11.5px] text-faint mt-2">
          Kjøringen krever en kø i bakgrunnen — hundre oppslag kan ikke gjøres
          i én forespørsel. Ikke koblet på ennå.
        </div>
      </div>

      {linjer.length > 0 && (
        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <Tabell
            kolonner={["Nummer", "Status"]}
            rader={sjekket.map((s) => [
              <span key="n" className="font-mono text-[12.5px]">
                {s.res.ok ? formaterOrgnr(s.res.orgnr) : s.rå}
              </span>,
              s.res.ok ? (
                <Merke key="s" tone="god">Klar for oppslag</Merke>
              ) : (
                <span key="s" className="text-bad text-[12.5px]">{s.res.feil}</span>
              ),
            ])}
          />
        </div>
      )}
    </>
  );
}
