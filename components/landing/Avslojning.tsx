"use client";

import { useEffect } from "react";

/**
 * Innhold som trer fram når man ruller ned til det.
 *
 * To ting avgjør om dette føles dyrt eller billig:
 *
 *   Det må aldri skjule noe permanent. Klassen som skjuler settes av
 *   skriptet selv, på <html>. Kjører ikke JavaScript, finnes ikke klassen,
 *   og alt står synlig fra start. En landingsside som er tom uten JS er
 *   ikke en animasjon, det er en feil.
 *
 *   Det må skje én gang. En seksjon som tones ut igjen når man ruller
 *   forbi, og inn på nytt når man ruller tilbake, blir trøttende på andre
 *   gjennomlesning. Observatøren slutter å følge et element når det først
 *   har vist seg.
 *
 * Respekterer prefers-reduced-motion ved å ikke slå seg på i det hele tatt.
 */
export function Avslojning() {
  useEffect(() => {
    const rot = document.documentElement;

    const roligere =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (roligere || typeof IntersectionObserver === "undefined") return;

    rot.classList.add("avsloj-pa");

    const mal = Array.from(document.querySelectorAll<HTMLElement>("[data-avsloj]"));

    const obs = new IntersectionObserver(
      (poster) => {
        for (const p of poster) {
          if (!p.isIntersecting) continue;
          p.target.classList.add("inne");
          obs.unobserve(p.target);
        }
      },
      // Litt før elementet er helt framme: da er bevegelsen ferdig omtrent
      // når man faktisk ser på det, i stedet for å starte etterpå.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    for (const m of mal) obs.observe(m);
    return () => obs.disconnect();
  }, []);

  return null;
}
