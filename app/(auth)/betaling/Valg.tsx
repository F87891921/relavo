"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { bestill } from "./handlinger";

const PLANER = [
  { verdi: "engangs", pris: "590", enhet: "NOK" },
  { verdi: "standard", pris: "6 900", enhet: "NOK/mnd", anbefalt: true },
  { verdi: "enterprise", pris: "12 900", enhet: "NOK/mnd" },
];

/**
 * Plan og betalingsmåte i ett steg.
 *
 * Faktura står først og er forhåndsvalgt. Det er ikke tilfeldig: kundene er
 * norske kommuner, og offentlig sektor betaler mot faktura — EHF er
 * lovpålagt for leverandører til det offentlige. Kort er unntaket, for de
 * private kundene på engangsplanen.
 *
 * Er Stripe ikke koblet på, vises kortvalget som avslått med grunn i stedet
 * for å ligge der og se ut som om det virker.
 */
export function Valg({ kortMulig }: { kortMulig: boolean }) {
  const o = useOrd();
  const [plan, setPlan] = useState("standard");
  const [mate, setMate] = useState<"kort" | "faktura">("faktura");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const p = o.landing.priser.planer;

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {PLANER.map((rad, i) => {
          const valgt = plan === rad.verdi;
          return (
            <button
              key={rad.verdi}
              type="button"
              onClick={() => setPlan(rad.verdi)}
              aria-pressed={valgt}
              className={`text-left rounded-card border px-4 py-4 transition ${
                valgt
                  ? "border-accent ring-[3px] ring-accent-light bg-surface"
                  : "border-border hover:border-border-strong bg-surface"
              }`}
            >
              {rad.anbefalt && (
                <span className="inline-block text-[10.5px] font-bold uppercase tracking-wide text-accent mb-1.5">
                  {o.landing.priser.vanligst}
                </span>
              )}
              <div className="text-[14px] font-semibold">{p[i].navn}</div>
              <div className="text-[19px] font-bold tracking-tight mt-1">
                {rad.pris}{" "}
                <span className="text-[12px] font-medium text-dim">{p[i].enhet}</span>
              </div>
              <div className="text-[10.5px] text-faint mt-0.5">
                {o.internt.eksMva}
              </div>
              <p className="text-[12px] text-dim leading-snug mt-2">
                {p[i].beskrivelse}
              </p>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5 mb-6">
        <Mate
          valgt={mate === "faktura"}
          onVelg={() => setMate("faktura")}
          tittel={o.betaling.faktura}
          tekst={o.betaling.fakturaTekst}
        />
        <Mate
          valgt={mate === "kort"}
          onVelg={() => kortMulig && setMate("kort")}
          av={!kortMulig}
          tittel={o.betaling.kort}
          tekst={kortMulig ? o.betaling.kortTekst : o.betaling.kortAv}
        />
      </div>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-4">
          {feil}
        </div>
      )}

      <button
        type="button"
        disabled={venter}
        onClick={() => {
          setFeil("");
          start(async () => {
            const r = await bestill(plan, mate);
            if (!r.ok) setFeil(r.feil);
            else window.location.href = "/venter";
          });
        }}
        className="w-full bg-accent hover:bg-accent-hover active:scale-[0.99] transition text-white text-sm font-semibold px-5 py-3 rounded-xl disabled:opacity-50"
      >
        {venter
          ? o.felles.sender
          : mate === "kort"
            ? o.betaling.tilBetaling
            : o.betaling.bestillFaktura}
      </button>

      <p className="text-[11.5px] text-faint text-center mt-3 leading-relaxed">
        {mate === "kort" ? o.betaling.stripeNote : o.betaling.fakturaNote}
      </p>
    </>
  );
}

function Mate({
  valgt,
  onVelg,
  tittel,
  tekst,
  av = false,
}: {
  valgt: boolean;
  onVelg: () => void;
  tittel: string;
  tekst: string;
  av?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onVelg}
      disabled={av}
      aria-pressed={valgt}
      className={`w-full text-left flex items-start gap-3 rounded-card border px-4 py-3.5 transition ${
        av
          ? "border-border bg-canvas opacity-60 cursor-not-allowed"
          : valgt
            ? "border-accent ring-[3px] ring-accent-light bg-surface"
            : "border-border hover:border-border-strong bg-surface"
      }`}
    >
      <span
        className={`mt-0.5 w-4 h-4 rounded-full border-[1.5px] shrink-0 ${
          valgt ? "border-accent bg-accent" : "border-border-strong"
        }`}
      />
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold">{tittel}</span>
        <span className="block text-[12px] text-dim leading-snug mt-0.5">
          {tekst}
        </span>
      </span>
    </button>
  );
}
