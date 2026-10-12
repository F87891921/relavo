"use client";

import { useOrd } from "@/components/Sprakgiver";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Leverandørkjeden med § 5k-grensen, som en trapp.
 *
 * Hvert ledd trappes ned og inn. Dybden blir da noe leseren ser med en
 * gang, i stedet for noe de må telle seg fram til — og det er dybden hele
 * poenget handler om.
 *
 * Kjeden er hel til leseren faktisk ser den; først da ryker det siste
 * leddet. Bruddet skal oppdages, ikke stå ferdig brutt før noen har sett
 * hva som brytes.
 *
 * Respekterer prefers-reduced-motion: da vises bruddtilstanden med én gang.
 */
const SELSKAP = [
  { navn: "Demobygg", variant: "self" },
  { navn: "Demoanlegg", variant: "" },
  { navn: "Prøvegrunn", variant: "" },
  { navn: "Prøvefasade", variant: "over" },
];

export function Chain() {
  const s9 = useOrd().skjermbilde;

  // Selskapsnavnene er data og står som de er. Etikettene over dem er
  // grensesnitt, og følger språkvalget.
  const LEDD = SELSKAP.map((l, i) => ({
    ...l,
    label: i === 0 ? s9.hovedleverandor : `${s9.ledd} ${i}`,
  }));
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
          {/* Grensa står i flyten rett over leddet som bryter den, ikke på
              en avstand målt i piksler. En hardkodet topp ville flyttet seg
              av seg selv så snart et selskapsnavn ble to linjer. */}
          {ledd.variant === "over" && (
            <div className="chain-tak" aria-hidden="true">
              <span>{s9.grense5k}</span>
            </div>
          )}
          <div
            className={`chain-n ${ledd.variant}`.trim()}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="chain-p" />
            <div className="chain-box">
              <span className="chain-l">{ledd.label}</span>
              <span className="chain-c">{ledd.navn}</span>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
