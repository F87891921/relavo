"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * De tre skjermbildene, ett om gangen.
 *
 * Tre valg som er verdt å nevne:
 *
 * Alle tre ligger i DOM-en hele tiden og krysstoner. Byttes de ut, må
 * nettleseren bygge opp et nytt bilde midt i overgangen, og da blinker
 * den. De er ren SVG, så det koster ingenting å la dem ligge.
 *
 * Spillet står stille til noen faktisk ser det, og stanser når fanen
 * skjules. Et bildespill som har gått fire runder før leseren kommer dit
 * viser et tilfeldig bilde når de først ser opp.
 *
 * Det stanser også når musa er over, og når noen har trykket seg fram
 * selv — har leseren valgt et bilde, skal det ikke forsvinne under dem.
 */
const INTERVALL = 5200;

export function Bildespill({
  bilder,
  navn,
}: {
  bilder: ReactNode[];
  navn: string[];
}) {
  const [na, setNa] = useState(0);
  const [stanset, setStanset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [sett, setSett] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setSett(true);
      return;
    }
    const obs = new IntersectionObserver(
      (poster) => setSett(poster.some((p) => p.isIntersecting)),
      { threshold: 0.25 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!sett || stanset) return;

    // Uten bevegelse bytter det ikke av seg selv. Prikkene står igjen,
    // så bildene er fortsatt tilgjengelige — de kommer bare når noen ber
    // om dem.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t = setInterval(() => {
      if (document.hidden) return;
      setNa((i) => (i + 1) % bilder.length);
    }, INTERVALL);
    return () => clearInterval(t);
  }, [sett, stanset, bilder.length]);

  return (
    <div
      ref={ref}
      className="spill"
      onMouseEnter={() => setStanset(true)}
      onMouseLeave={() => setStanset(false)}
    >
      <div className="spill-ramme">
        {bilder.map((b, i) => (
          <div
            key={i}
            className={i === na ? "spill-bilde pa" : "spill-bilde"}
            aria-hidden={i !== na}
          >
            {b}
          </div>
        ))}
      </div>

      <div className="spill-prikker" role="tablist" aria-label={navn[0]}>
        {bilder.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === na}
            aria-label={navn[i]}
            className={i === na ? "spill-prikk pa" : "spill-prikk"}
            onClick={() => {
              setNa(i);
              // Et trykk er et valg. Da slutter spillet å bytte selv.
              setStanset(true);
            }}
          >
            <span>{navn[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
