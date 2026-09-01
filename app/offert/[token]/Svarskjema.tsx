"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { FELT_FULL } from "@/components/ui/felt";
import { svarPaOffert } from "./handlinger";

type Valg = "akseptert" | "endring" | "avslatt";

/**
 * Tre svar, ikke to.
 *
 * «Prisen ligger over rammen vår, kom tilbake med to år i stedet» er ikke
 * det samme som «vi går videre med noen andre» — men begge havnet på nei og
 * låste tilbudet. Den første er en åpning, og skal ikke se ut som en dør som
 * er lukket.
 *
 * Både endring og nei krever noen ord. Uten dem er det ingenting å gjøre
 * noe med, og det er hele grunnen til at vi spør.
 */
export function Svarskjema({ token }: { token: string }) {
  const o = useOrd().offertsvar;
  const felles = useOrd().felles;
  const [valg, setValg] = useState<Valg | null>(null);
  const [navn, setNavn] = useState("");
  const [kommentar, setKommentar] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const KNAPP =
    "text-sm font-semibold px-5 py-2.5 rounded-xl transition active:scale-[0.97] disabled:opacity-50";

  if (!valg)
    return (
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setValg("akseptert")}
          className={`${KNAPP} bg-accent hover:bg-accent-hover text-white`}
        >
          {o.godtaTilbudet}
        </button>
        <button
          type="button"
          onClick={() => setValg("endring")}
          className={`${KNAPP} bg-surface border border-border hover:border-border-strong`}
        >
          {o.beOmEndring}
        </button>
        <button
          type="button"
          onClick={() => setValg("avslatt")}
          className={`${KNAPP} text-dim hover:text-ink`}
        >
          {o.ikkeAktuelt}
        </button>
      </div>
    );

  const merke =
    valg === "endring"
      ? o.hvaSkalEndres
      : valg === "avslatt"
        ? o.hvaPassetIkke
        : o.noeViBorVite;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setFeil("");
        start(async () => {
          const r = await svarPaOffert(token, valg, kommentar, navn);
          if (!r.ok) setFeil(r.feil);
        });
      }}
    >
      <div className="mb-3.5">
        <label htmlFor="navn" className="block text-xs font-semibold mb-1.5">
          {o.navnetDitt}
        </label>
        <input
          id="navn"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          required
          placeholder="Marit Aasen"
          className={FELT_FULL}
        />
      </div>

      <div className="mb-3.5">
        <label htmlFor="kommentar" className="block text-xs font-semibold mb-1.5">
          {merke}
          {valg === "akseptert" && (
            <span className="text-faint font-normal"> — {o.valgfritt}</span>
          )}
        </label>
        <textarea
          id="kommentar"
          rows={4}
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          required={valg !== "akseptert"}
          className={`${FELT_FULL} max-w-none resize-y`}
        />
        {valg !== "akseptert" && (
          <p className="text-[11.5px] text-faint mt-1.5 leading-relaxed max-w-[62ch]">
            {valg === "endring" ? o.endringHjelp : o.avslagHjelp}
          </p>
        )}
      </div>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">
          {feil}
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={venter}
          className={`${KNAPP} ${
            valg === "avslatt"
              ? "bg-ink hover:opacity-90 text-white"
              : "bg-accent hover:bg-accent-hover text-white"
          }`}
        >
          {venter
            ? felles.sender
            : valg === "akseptert"
              ? o.bekreftGodta
              : valg === "endring"
                ? o.sendOnsket
                : o.sendSvaret}
        </button>
        <button
          type="button"
          onClick={() => {
            setValg(null);
            setFeil("");
          }}
          className="text-sm text-dim hover:text-ink px-3 py-2.5 transition"
        >
          {felles.tilbake}
        </button>
      </div>
    </form>
  );
}
