"use client";

import { useState } from "react";

/**
 * Spørsmålene folk faktisk stiller først. Ett åpent om gangen — å klikke
 * det åpne lukker det igjen.
 */

function Chevron() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Faq({
  eyebrow,
  tittel,
  sporsmal,
}: {
  eyebrow: string;
  tittel: string;
  sporsmal: { q: string; a: string }[];
}) {
  const [apen, setApen] = useState<number | null>(null);

  return (
    <section className="sec sec-alt" id="faq">
      <div className="wrap">
        <div className="sec-head center">
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="statement">{tittel}</h2>
        </div>
        <div className="faq">
          {sporsmal.map((item, i) => (
            <div key={item.q} className={apen === i ? "faq-i on" : "faq-i"}>
              <button
                className="faq-q"
                type="button"
                aria-expanded={apen === i}
                onClick={() => setApen(apen === i ? null : i)}
              >
                {item.q}
                <Chevron />
              </button>
              <div className="faq-a">
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
