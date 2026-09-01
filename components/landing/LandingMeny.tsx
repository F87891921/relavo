"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sprakvelger } from "@/components/Sprakvelger";
import type { Sprak } from "@/lib/sprak/felles";

type Lenke = { href: string; tekst: string };

/**
 * Landingssidens meny på små skjermer.
 *
 * Før lå seksjonslenkene i en egen rad under logolinjen. Det ga to rader
 * som ikke hørte sammen — logo, språk, «Logg inn» og «Kom i gang» presset
 * mot hverandre øverst, og fire lenker klistret under. På en telefon er det
 * for mange ting i en topplinje som skal være ett blikk.
 *
 * Nå: logo til venstre, én knapp og en meny til høyre. Resten ligger bak
 * knappen — også språkvalget, som ikke er noe man trykker på ofte.
 */
export function LandingMeny({
  lenker,
  loggInn,
  sprak,
  merke,
}: {
  lenker: Lenke[];
  loggInn: string;
  sprak: Sprak;
  merke: string;
}) {
  const [apen, setApen] = useState(false);

  useEffect(() => {
    if (!apen) return;
    const tast = (e: KeyboardEvent) => e.key === "Escape" && setApen(false);
    window.addEventListener("keydown", tast);
    return () => window.removeEventListener("keydown", tast);
  }, [apen]);

  return (
    <>
      <button
        type="button"
        className="nav-burger"
        aria-label={merke}
        aria-expanded={apen}
        onClick={() => setApen(!apen)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            {apen ? (
              <>
                <path d="M5 5l10 10" />
                <path d="M15 5L5 15" />
              </>
            ) : (
              <>
                <path d="M3 6h14" />
                <path d="M3 10h14" />
                <path d="M3 14h14" />
              </>
            )}
          </g>
        </svg>
      </button>

      {apen && (
        <div className="nav-skuff">
          {lenker.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setApen(false)}>
              {l.tekst}
            </a>
          ))}
          <div className="nav-skuff-bunn">
            <Link href="/logg-inn" onClick={() => setApen(false)}>
              {loggInn}
            </Link>
            <Sprakvelger na={sprak} variant="minimal" retning="opp" />
          </div>
        </div>
      )}
    </>
  );
}
