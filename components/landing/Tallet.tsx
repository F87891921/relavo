"use client";

import { useEffect, useRef, useState } from "react";
import { useOrd } from "@/components/Sprakgiver";

/**
 * Det ene tallet på forsiden.
 *
 * 3 254 av 8 019 renholdsvirksomheter i Arbeidstilsynets register er ikke
 * godkjent. Tallet sier hva som står på spill om man leser registeret
 * feil: en treff betyr ikke godkjent, og et verktøy som tror det
 * grønnmerker selskaper det har vært ulovlig å kjøpe renhold av siden
 * 2012.
 *
 * Tallet telles opp. Det er den eneste animasjonen på siden som gjør noe
 * annet enn å tone inn, og den er her fordi tallet ER poenget. Ett tall,
 * én gang.
 *
 * To ting avgjør om en opptelling ser dyr eller billig ut, og begge er
 * valg:
 *
 * Sifrene står i tabellbredde, og plassen til det ferdige tallet er satt
 * av på forhånd. Uten begge deler hopper setningen under mens det telles,
 * og da ser det ut som siden laster, ikke som at den teller.
 *
 * Fargen er blekk, ikke rødt. Rødt er sidens varselsignal og hører til
 * brudd i en kontroll — brukes det på en statistikk, betyr det mindre
 * neste gang det står ved et faktisk avvik.
 */
export function Tallet({
  ikkeGodkjente,
  totalt,
  hentet,
}: {
  ikkeGodkjente: number;
  totalt: number;
  hentet: string | null;
}) {
  const t = useOrd().landing.tallet;
  const ref = useRef<HTMLParagraphElement>(null);
  const [vist, setVist] = useState(0);

  const tall = (n: number) => n.toLocaleString("nb-NO").replace(/ /g, " ");
  const ferdig = tall(ikkeGodkjente);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const roligere = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (roligere || typeof IntersectionObserver === "undefined") {
      setVist(ikkeGodkjente);
      return;
    }

    let ramme = 0;
    const obs = new IntersectionObserver(
      (poster) => {
        if (!poster.some((p) => p.isIntersecting)) return;
        obs.disconnect();

        // requestAnimationFrame står stille i en fane som ikke vises. Blir
        // seksjonen sett mens fanen er skjult, ville tallet blitt stående
        // på null — og null er det motsatte av det tallet sier.
        if (document.hidden) {
          setVist(ikkeGodkjente);
          return;
        }

        const start = performance.now();
        const lengde = 1400;

        const steg = (naa: number) => {
          const andel = Math.min(1, (naa - start) / lengde);
          // Bremser mot slutten. Et lineært tall ser ut som en teller som
          // stopper fordi den tok slutt, ikke fordi den kom fram.
          const lett = 1 - Math.pow(1 - andel, 4);
          setVist(Math.round(ikkeGodkjente * lett));
          if (andel < 1) ramme = requestAnimationFrame(steg);
        };
        ramme = requestAnimationFrame(steg);
      },
      { threshold: 0.5 },
    );
    obs.observe(node);

    return () => {
      cancelAnimationFrame(ramme);
      obs.disconnect();
    };
  }, [ikkeGodkjente]);

  return (
    <section className="tallet" data-avsloj>
      <div className="tallet-in">
        {/* aria-label bærer det ferdige tallet: en skjermleser skal ikke
            lese opp hvert mellomsteg i opptellingen. */}
        <p ref={ref} className="tallet-n" aria-label={ferdig}>
          <span
            className="tallet-siffer"
            aria-hidden="true"
            style={{ minWidth: `${ferdig.length}ch` }}
          >
            {tall(vist)}
          </span>
        </p>

        <p className="tallet-l">
          {t.av} {tall(totalt)} {t.setning}
        </p>

        <p className="tallet-d">{t.poeng}</p>

        <p className="tallet-k">
          {hentet && (
            <>
              {t.hentet} {new Date(hentet).toLocaleDateString("nb-NO")}
            </>
          )}
        </p>
      </div>
    </section>
  );
}
