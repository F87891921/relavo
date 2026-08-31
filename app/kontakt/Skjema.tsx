"use client";

import { useState, useTransition } from "react";
import { KONTAKT_KATEGORIER } from "@/lib/sak";
import { sendHenvendelse } from "./handlinger";

const FELT =
  "w-full text-[14px] px-3.5 py-3 rounded-xl bg-canvas border border-border transition placeholder:text-faint focus:outline-none focus:bg-surface focus:border-accent focus:ring-[3px] focus:ring-accent-light hover:border-border-strong";

export function KontaktSkjema({ forvalgt }: { forvalgt?: string }) {
  const [sendt, setSendt] = useState(false);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  if (sendt)
    return (
      <div className="bg-good-bg text-good rounded-2xl px-6 py-8 text-center">
        <div className="text-[17px] font-semibold mb-2">Takk — vi har fått den.</div>
        <p className="text-[13.5px] leading-relaxed">
          Vi svarer normalt innen én virkedag, på adressen du oppga.
        </p>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await sendHenvendelse(fd);
          if (res.ok) setSendt(true);
          else setFeil(res.feil);
        });
      }}
      className="bg-surface rounded-2xl border border-border shadow-card p-7"
    >
      <div className="grid sm:grid-cols-2 gap-x-4">
        <div className="mb-4">
          <label htmlFor="navn" className="block text-xs font-semibold mb-1.5">
            Navn
          </label>
          <input id="navn" name="navn" required className={FELT} />
        </div>
        <div className="mb-4">
          <label htmlFor="epost" className="block text-xs font-semibold mb-1.5">
            E-post
          </label>
          <input id="epost" name="epost" type="email" required className={FELT} />
        </div>
        <div className="mb-4">
          <label htmlFor="organisasjon" className="block text-xs font-semibold mb-1.5">
            Organisasjon <span className="text-faint font-normal">— valgfritt</span>
          </label>
          <input
            id="organisasjon"
            name="organisasjon"
            placeholder="Bergen kommune"
            className={FELT}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="telefon" className="block text-xs font-semibold mb-1.5">
            Telefon <span className="text-faint font-normal">— valgfritt</span>
          </label>
          <input id="telefon" name="telefon" className={FELT} />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="kategori" className="block text-xs font-semibold mb-1.5">
          Hva gjelder det?
        </label>
        <select
          id="kategori"
          name="kategori"
          defaultValue={forvalgt ?? "demo"}
          className={FELT}
        >
          {KONTAKT_KATEGORIER.map((k) => (
            <option key={k.verdi} value={k.verdi}>
              {k.tekst}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="melding" className="block text-xs font-semibold mb-1.5">
          Melding
        </label>
        <textarea
          id="melding"
          name="melding"
          required
          rows={6}
          className={`${FELT} resize-y`}
        />
      </div>

      {/* Skjult for mennesker, synlig for roboter. Fylles den ut, later vi
          som alt gikk bra og lagrer ingenting. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="nettsted">Nettsted</label>
        <input id="nettsted" name="nettsted" tabIndex={-1} autoComplete="off" />
      </div>

      {feil && (
        <div className="text-[13px] text-bad bg-bad-bg rounded-xl px-4 py-3 mb-4">
          {feil}
        </div>
      )}

      <button
        type="submit"
        disabled={venter}
        className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[14px] font-semibold px-6 py-3 rounded-xl disabled:opacity-50"
      >
        {venter ? "Sender …" : "Send melding"}
      </button>

      <p className="text-[12px] text-faint mt-4 leading-relaxed">
        Vi bruker opplysningene til å svare deg, og ingenting annet. Se{" "}
        <a href="/juridisk#personvern" className="underline">
          personvernerklæringen
        </a>
        .
      </p>
    </form>
  );
}
