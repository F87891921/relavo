"use client";

import { useEffect } from "react";

/**
 * Navigasjonen trekker seg sammen når man har rullet forbi heroen.
 *
 * Grunnen er ikke pynt: på toppen av siden skal logoen og lenkene ha luft,
 * men lenger ned konkurrerer de med innholdet. Den blir lavere og tettere
 * i stedet for å bli værende like høy hele veien.
 *
 * Terskelen har hysterese — på ved 60 piksler, av først ved 20. Uten det
 * vipper klassen av og på når noen ruller sakte akkurat på grensen.
 */
export function Rullenav() {
  useEffect(() => {
    const nav = document.querySelector(".nav");
    if (!nav) return;

    let kompakt = false;
    let ventende = false;

    const sjekk = () => {
      ventende = false;
      const y = window.scrollY;
      if (!kompakt && y > 60) {
        kompakt = true;
        nav.classList.add("kompakt");
      } else if (kompakt && y < 20) {
        kompakt = false;
        nav.classList.remove("kompakt");
      }
    };

    const ved = () => {
      if (ventende) return;
      ventende = true;
      requestAnimationFrame(sjekk);
    };

    sjekk();
    window.addEventListener("scroll", ved, { passive: true });
    return () => window.removeEventListener("scroll", ved);
  }, []);

  return null;
}
