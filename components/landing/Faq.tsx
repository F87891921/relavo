"use client";

import { useState } from "react";

/**
 * Spørsmålene folk faktisk stiller først. Ett åpent om gangen — å klikke
 * det åpne lukker det igjen.
 */
const SPORSMAL = [
  {
    q: "Sjekker dere om noen er straffedømt?",
    a: "Nei, og ingen kommersiell aktør kan. Behandling av opplysninger om straffedommer er etter personopplysningsloven § 11 i praksis forbeholdt offentlige myndigheter, og Lovdata gir ikke maskinell tilgang til rettsavgjørelser. Vi kontrollerer selskaper, ikke enkeltpersoner. Den delen av kvalifikasjonsvurderingen dekkes av leverandørens ESPD-egenerklæring, som lagres som vedlegg til kontrollen.",
  },
  {
    q: "Kommer det tillegg utover abonnementet?",
    a: "Nei. Prisen dekker den ferdige rapporten, uansett hvor mange registre den bygger på. Du kjøper vurderingen og dokumentasjonen, ikke enkeltoppslag, og fakturaen ser lik ut hver måned.",
  },
  {
    q: "Holder rapporten som dokumentasjon etter § 5i?",
    a: "Hver kjøring lagres uendret med tidspunkt, kilde og resultat på hver enkelt linje, og kan hentes fram i ettertid. Kilder vi ikke har svar fra står oppført som ikke kontrollert i stedet for å utelates — en rapport som tier om hullene sine er verre enn ingen rapport.",
  },
  {
    q: "Vi holder til i Sverige. Fungerer det?",
    a: "Relavo er bygget for norske organisasjonsnumre og norsk regelverk. Kjernen i vurderingen følger det samme EU-direktivet i hele EØS, men datakildene og paragrafene er norske.",
  },
];

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

export function Faq() {
  const [apen, setApen] = useState<number | null>(null);

  return (
    <section className="sec sec-alt" id="faq">
      <div className="wrap">
        <div className="sec-head center">
          <div className="eyebrow">Spørsmål</div>
          <h2 className="statement">Det folk spør om først.</h2>
        </div>
        <div className="faq">
          {SPORSMAL.map((item, i) => (
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
