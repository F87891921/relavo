"use client";

import { useState } from "react";
import Link from "next/link";
import { RelavoMark } from "@/components/RelavoMark";

/**
 * PLASSHOLDER. Viser hvordan betalingssteget skal se ut, men tar ikke imot
 * betaling og sender ingenting noe sted. Kortfeltene er bevisst deaktivert
 * — en skjermbildekopi som ser ekte ut, men ikke er det, er verre enn ingen
 * skjerm i det hele tatt.
 *
 * Når Stripe (eller tilsvarende) kobles på: bytt <fieldset disabled> mot
 * Stripe Elements, og la «Fortsett» gå via en Checkout Session som først
 * sender kunden hit tilbake ved vellykket betaling.
 */
const PLANER = [
  {
    verdi: "engangs",
    navn: "Leverandørkontroll",
    pris: "590",
    enhet: "NOK",
    beskrivelse: "Én kontroll, full rapport som PDF. Uten abonnement.",
  },
  {
    verdi: "standard",
    navn: "Standard",
    pris: "6 900",
    enhet: "NOK/mnd",
    beskrivelse: "Løpende overvåking av leverandørene i porteføljen.",
    anbefalt: true,
  },
  {
    verdi: "enterprise",
    navn: "Enterprise",
    pris: "12 900",
    enhet: "NOK/mnd",
    beskrivelse: "Flere enheter under samme avtale, med API.",
  },
];

export default function BetalingSide() {
  const [valgt, setValgt] = useState("standard");
  const plan = PLANER.find((p) => p.verdi === valgt)!;

  return (
    <div className="min-h-screen bg-canvas px-4 py-[7vh]">
      <div className="w-full max-w-[720px] mx-auto">
        <div className="text-center mb-7">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[22px] font-semibold tracking-tight">Velg plan</h1>
          <p className="text-[13px] text-dim mt-2">
            Du kan bytte eller si opp når som helst.
          </p>
        </div>

        <div className="bg-warn-bg text-warn text-[12.5px] rounded-xl px-4 py-3 mb-6 leading-relaxed">
          <b>Ikke i drift ennå.</b> Denne siden viser hvordan betalingen skal se
          ut. Ingen betaling gjennomføres, og kortfeltene under er slått av.
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-7">
          {PLANER.map((p) => {
            const aktiv = p.verdi === valgt;
            return (
              <button
                key={p.verdi}
                type="button"
                onClick={() => setValgt(p.verdi)}
                aria-pressed={aktiv}
                className={`text-left rounded-2xl p-5 bg-surface transition relative ${
                  aktiv
                    ? "ring-[1.5px] ring-accent shadow-card"
                    : "shadow-card hover:-translate-y-0.5"
                }`}
              >
                {p.anbefalt && (
                  <span className="absolute -top-2.5 left-5 bg-accent text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">
                    Vanligst
                  </span>
                )}
                <div className="text-[13.5px] font-semibold text-dim">{p.navn}</div>
                <div className="text-[26px] font-bold tracking-tight mt-2">
                  {p.pris}{" "}
                  <span className="text-[13px] font-medium text-dim">{p.enhet}</span>
                </div>
                <p className="text-[12.5px] text-dim mt-2 leading-snug">
                  {p.beskrivelse}
                </p>
              </button>
            );
          })}
        </div>

        <div className="bg-surface rounded-2xl shadow-card p-6">
          <h2 className="text-[15px] font-semibold mb-1">Betalingsdetaljer</h2>
          <p className="text-[12.5px] text-dim mb-5">
            Kobles til betalingsleverandør senere. Feltene er deaktivert.
          </p>

          <fieldset disabled className="opacity-45 pointer-events-none select-none">
            <div className="mb-3.5">
              <label className="block text-xs font-semibold mb-1.5">
                Kortnummer
              </label>
              <div className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-canvas text-faint">
                •••• •••• •••• ••••
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Utløper</label>
                <div className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-canvas text-faint">
                  MM / ÅÅ
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">CVC</label>
                <div className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-canvas text-faint">
                  •••
                </div>
              </div>
            </div>
          </fieldset>

          <div className="border-t border-border mt-6 pt-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[13px] text-dim">
              Valgt: <b className="text-ink">{plan.navn}</b> — {plan.pris}{" "}
              {plan.enhet}
            </div>
            <Link
              href={`/velkommen?plan=${plan.verdi}`}
              className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              Fortsett uten betaling
            </Link>
          </div>
        </div>

        <p className="text-center text-[12px] text-faint mt-5">
          Så lenge betalingen ikke er koblet på, går knappen rett videre til
          neste steg.
        </p>
      </div>
    </div>
  );
}
