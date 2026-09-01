"use client";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { leverESPD } from "./handlinger";

/**
 * Opplasting og bekreftelse i ett.
 *
 * Bekreftelsen er ikke en digital signatur med sertifikat — den delen gjør
 * konkurransegjennomføringsverktøyet når tilbudet leveres. Dette er navn,
 * rolle og et avkryssingsfelt, lagret med tidspunkt. Det dokumenterer hvem
 * som sto bak innsendingen, og det er det § 23-5-ettersendingen trenger.
 */
export function Skjema({ token }: { token: string }) {
  const [feil, setFeil] = useState("");
  const [filnavn, setFilnavn] = useState("");
  const [venter, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setFeil("");
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await leverESPD(fd);
          if (!r.ok) setFeil(r.feil);
        });
      }}
    >
      <input type="hidden" name="token" value={token} />

      <div className="mb-4">
        <label htmlFor="fil" className="block text-xs font-semibold mb-1.5">
          Egenerklæringen
        </label>
        <input
          id="fil"
          name="fil"
          type="file"
          required
          accept=".pdf,.xml,.docx,.png,.jpg,.jpeg"
          onChange={(e) => setFilnavn(e.target.files?.[0]?.name ?? "")}
          className="block w-full text-[13px] text-dim file:mr-3 file:py-2 file:px-4 file:rounded-xl
            file:border-0 file:text-[13px] file:font-semibold file:bg-surface2 file:text-accent
            hover:file:bg-accent-light file:cursor-pointer cursor-pointer"
        />
        <p className="text-[11.5px] text-faint mt-1.5">
          PDF, XML fra ESPD-tjenesten, Word-fil eller bilde. Høyst 15 MB.
          {filnavn && <span className="block text-dim mt-1">Valgt: {filnavn}</span>}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <div className="mb-4">
          <label htmlFor="navn" className="block text-xs font-semibold mb-1.5">
            Navn
          </label>
          <input id="navn" name="navn" required placeholder="Kristian Holth" className={FELT_FULL} />
        </div>
        <div className="mb-4">
          <label htmlFor="rolle" className="block text-xs font-semibold mb-1.5">
            Rolle i selskapet
          </label>
          <input id="rolle" name="rolle" required placeholder="Daglig leder" className={FELT_FULL} />
        </div>
      </div>

      <label className="flex items-start gap-2.5 mb-4 cursor-pointer max-w-[70ch]">
        <input
          type="checkbox"
          name="bekreftet"
          required
          className="mt-0.5 accent-[#654b70] w-4 h-4 shrink-0"
        />
        <span className="text-[12.5px] leading-snug">
          Jeg bekrefter at opplysningene i egenerklæringen er riktige, og at
          jeg har fullmakt til å avgi den på vegne av selskapet.
        </span>
      </label>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">
          {feil}
        </div>
      )}

      <button
        type="submit"
        disabled={venter}
        className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
      >
        {venter ? "Sender …" : "Send inn erklæringen"}
      </button>
    </form>
  );
}
