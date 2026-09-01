"use client";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { svarPaOffert } from "./handlinger";

/**
 * Godta eller avslå.
 *
 * Avslag åpner et felt for begrunnelse, og det er obligatorisk. Det er ikke
 * for å gjøre det vanskelig å si nei — det er fordi et nei uten grunn ikke
 * går an å gjøre noe med, og fordi det som regel ikke er et nei til Relavo,
 * men til akkurat dette oppsettet.
 */
export function Svarskjema({ token }: { token: string }) {
  const [valg, setValg] = useState<"akseptert" | "avslatt" | null>(null);
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
          Godta tilbudet
        </button>
        <button
          type="button"
          onClick={() => setValg("avslatt")}
          className={`${KNAPP} bg-surface border border-border hover:border-border-strong`}
        >
          Takk, ikke nå
        </button>
      </div>
    );

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
          Navnet ditt
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
          {valg === "avslatt" ? "Hva passet ikke?" : "Noe vi bør vite?"}
          {valg === "akseptert" && (
            <span className="text-faint font-normal"> — valgfritt</span>
          )}
        </label>
        <textarea
          id="kommentar"
          rows={4}
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          required={valg === "avslatt"}
          placeholder={
            valg === "avslatt"
              ? "For eksempel: prisen ligger over rammen vår for i år, eller vi trenger flere brukere enn planen gir."
              : "Fakturareferanse, ønsket oppstart, eller noe annet."
          }
          className={`${FELT_FULL} max-w-none resize-y`}
        />
        {valg === "avslatt" && (
          <p className="text-[11.5px] text-faint mt-1.5 leading-relaxed">
            Vi bruker den til å komme tilbake med et annet oppsett — ikke til
            å overtale.
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
            valg === "akseptert"
              ? "bg-accent hover:bg-accent-hover text-white"
              : "bg-ink hover:opacity-90 text-white"
          }`}
        >
          {venter
            ? "Sender …"
            : valg === "akseptert"
              ? "Bekreft at dere godtar"
              : "Send svaret"}
        </button>
        <button
          type="button"
          onClick={() => {
            setValg(null);
            setFeil("");
          }}
          className="text-sm text-dim hover:text-ink px-3 py-2.5 transition"
        >
          Tilbake
        </button>
      </div>
    </form>
  );
}
