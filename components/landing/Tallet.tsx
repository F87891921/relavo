"use client";

import { useEffect, useRef, useState } from "react";
import { useOrd } from "@/components/Sprakgiver";

/**
 * Det ene tallet på forsiden.
 *
 * To av fem renholdsvirksomheter i Arbeidstilsynets register er ikke
 * godkjent. Det er sidens sterkeste argument, fordi det sier hva som står
 * på spill om man leser registeret feil: en treff betyr ikke godkjent, og
 * et verktøy som tror det grønnmerker selskaper det har vært ulovlig å
 * kjøpe renhold av siden 2012.
 *
 * Tallet telles opp. Det er den eneste animasjonen på siden som gjør noe
 * annet enn å tone inn — og den er her fordi tallet er poenget, ikke
 * pynt rundt det. Ett tall, én gang; teller alt på en side opp, er man
 * tilbake i 2013.
 *
 * Tallet kommer fra basen, ikke fra teksten. Derfor er det heller ikke
 * rundet til «2 av 5» i markupen: står det et tall på forsiden skal det
 * være det som faktisk ligger i registeret i dag.
 */
export function Tallet({
  ikkeGodkjente,
  totalt,
  andel,
  hentet,
}: {
  ikkeGodkjente: number;
  totalt: number;
  andel: number;
  hentet: string | null;
}) {
  const t = useOrd().landing.tallet;
  const ref = useRef<HTMLParagraphElement>(null);
  const [vist, setVist] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Uten bevegelse: tallet står ferdig. Det er informasjonen som
    // betyr noe, ikke opptellingen.
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
        // på null til nettleseren våkner — og null er det motsatte av det
        // tallet sier. Da hopper vi rett til det ferdige tallet.
        if (document.hidden) {
          setVist(ikkeGodkjente);
          return;
        }

        const start = performance.now();
        const lengde = 1100;

        const steg = (naa: number) => {
          const andel = Math.min(1, (naa - start) / lengde);
          // Bremser mot slutten. Et lineært tall ser ut som en teller
          // som stopper fordi den tok slutt, ikke fordi den kom fram.
          const lett = 1 - Math.pow(1 - andel, 3);
          setVist(Math.round(ikkeGodkjente * lett));
          if (andel < 1) ramme = requestAnimationFrame(steg);
        };
        ramme = requestAnimationFrame(steg);
      },
      { threshold: 0.6 },
    );
    obs.observe(node);

    return () => {
      cancelAnimationFrame(ramme);
      obs.disconnect();
    };
  }, [ikkeGodkjente]);

  const tall = (n: number) => n.toLocaleString("nb-NO").replace(/ /g, " ");

  return (
    <section className="tallet" data-avsloj>
      <div className="tallet-in">
        {/* aria-label bærer det ferdige tallet: en skjermleser skal ikke
            lese opp hvert mellomsteg i opptellingen. */}
        <p
          ref={ref}
          className="tallet-n"
          aria-label={`${tall(ikkeGodkjente)} ${t.av} ${tall(totalt)}`}
        >
          <span aria-hidden="true">{tall(vist)}</span>
        </p>
        <div className="tallet-t">
          <p className="tallet-l">
            {t.av} {tall(totalt)} {t.setning}
          </p>
          <p className="tallet-d">{t.poeng}</p>
          {hentet && (
            <p className="tallet-k">
              {t.hentet} {new Date(hentet).toLocaleDateString("nb-NO")} · {andel} %
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
