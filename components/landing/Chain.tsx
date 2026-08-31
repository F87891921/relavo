"use client";

import { Fragment, useEffect, useRef, useState } from "react";

/**
 * Leverandørkjeden med § 5k-grensen. Kjeden er hel til leseren faktisk ser
 * den — først da ryker det siste leddet. Poenget er at bruddet skal
 * oppdages, ikke stå ferdig brutt før noen har sett hva som brytes.
 *
 * Respekterer prefers-reduced-motion: da vises bruddtilstanden med én gang.
 */

// ­ er myk bindestrek: «Hovedleverandør» deles bare når det trengs,
// og da på stavelsen — ikke midt i ordet slik overflow-wrap ville gjort.
const LEDD = [
  { label: "Hoved­leverandør", navn: "Nordvik Bygg", variant: "self" },
  { label: "Ledd 1", navn: "Bergvik Anlegg", variant: "" },
  { label: "Ledd 2", navn: "Fossen Grunn", variant: "" },
  { label: "Ledd 3", navn: "HK Fasade", variant: "over" },
];

export function Chain() {
  const ref = useRef<HTMLDivElement>(null);
  const [brutt, setBrutt] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const roligere = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (roligere || typeof IntersectionObserver === "undefined") {
      setBrutt(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const obs = new IntersectionObserver(
      (poster) => {
        poster.forEach((p) => {
          if (!p.isIntersecting) return;
          timer = setTimeout(() => setBrutt(true), 260);
          obs.disconnect();
        });
      },
      { threshold: 0.55 },
    );
    obs.observe(node);

    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={brutt ? "chain brutt" : "chain"}>
      {LEDD.map((ledd, i) => (
        <Fragment key={ledd.navn}>
          <div className="chain-n">
            <div className={`chain-box ${ledd.variant}`.trim()}>
              <div className="chain-l">{ledd.label}</div>
              <div className="chain-c">{ledd.navn}</div>
            </div>
          </div>
          {i < LEDD.length - 1 &&
            (LEDD[i + 1].variant === "over" ? (
              <span className="chain-k rev">
                <span>Grense § 5k</span>
              </span>
            ) : (
              <span className="chain-k" />
            ))}
        </Fragment>
      ))}
    </div>
  );
}
