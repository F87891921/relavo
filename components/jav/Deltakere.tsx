"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { FELT_FULL as INPUT } from "@/components/ui/felt";
import {
  nyDeltaker,
  limInnDeltakere,
  fjernDeltaker,
  kjorJavPaNytt,
  type Svar,
} from "@/app/(dashboard)/jav/handlinger";

export type Deltaker = { id: string; navn: string; rolle: string };

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";
const KNAPP_MILD =
  "border border-border hover:border-border-strong hover:bg-canvas active:scale-[0.97] transition text-[13px] font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";

/**
 * Rollene er forslag, ikke en lukket liste. Hvem som er inhabil avgjøres av
 * forvaltningsloven § 6 og av hva personen faktisk gjorde i saken, ikke av
 * hvilken tittel som sto i en nedtrekksmeny. Feltet er derfor fritekst med
 * forslagene tilgjengelige.
 */
const ROLLEFORSLAG = [
  "Saksbehandler",
  "Innkjøpsansvarlig",
  "Medlem av evalueringskomiteen",
  "Bestiller",
  "Avdelingsleder",
  "Kontraktsansvarlig",
];

export function Deltakere({ deltakere }: { deltakere: Deltaker[] }) {
  const ordbok = useOrd();
  const t = ordbok.jav;

  const [liste, setListe] = useState(false);
  const [feil, setFeil] = useState("");
  const [kvittering, setKvittering] = useState("");
  const [venter, start] = useTransition();

  const kjor = (handling: () => Promise<Svar>, skjema?: HTMLFormElement) =>
    start(async () => {
      const res = await handling();
      if (res.ok) {
        setFeil("");
        setKvittering(res.melding ?? ordbok.felles.lagre);
        skjema?.reset();
      } else {
        setKvittering("");
        setFeil(res.feil);
      }
    });

  return (
    <div className="px-5 py-5">
      <p className="text-[12.5px] text-dim leading-relaxed mb-4 max-w-[68ch]">
        {t.deltakereForklaring}
      </p>

      {liste ? (
        <form
          className="mb-5"
          onSubmit={(e) => {
            e.preventDefault();
            const skjema = e.currentTarget;
            const fd = new FormData(skjema);
            kjor(() => limInnDeltakere(fd), skjema);
          }}
        >
          <label htmlFor="liste" className="block text-xs font-semibold mb-1.5">
            {t.limInn}
          </label>
          <textarea
            id="liste"
            name="liste"
            rows={6}
            required
            placeholder={t.limInnPlassholder}
            className={`${INPUT} max-w-none font-mono text-[12.5px] leading-relaxed`}
          />
          <div className="mt-3 mb-3">
            <label
              htmlFor="standardrolle"
              className="block text-xs font-semibold mb-1.5"
            >
              {t.standardrolle}
            </label>
            <input
              id="standardrolle"
              name="standardrolle"
              list="rolleforslag"
              placeholder={ROLLEFORSLAG[2]}
              className={INPUT}
            />
          </div>
          <div className="flex gap-2.5 items-center flex-wrap">
            <button type="submit" disabled={venter} className={KNAPP}>
              {venter ? ordbok.felles.lagrer : t.leggTilAlle}
            </button>
            <button
              type="button"
              className={KNAPP_MILD}
              onClick={() => setListe(false)}
            >
              {t.enOmGangen}
            </button>
          </div>
        </form>
      ) : (
        <form
          className="mb-5"
          onSubmit={(e) => {
            e.preventDefault();
            const skjema = e.currentTarget;
            const fd = new FormData(skjema);
            kjor(() => nyDeltaker(fd), skjema);
          }}
        >
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="navn" className="block text-xs font-semibold mb-1.5">
                {ordbok.ui.navn}
              </label>
              <input id="navn" name="navn" required className={INPUT} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="rolle" className="block text-xs font-semibold mb-1.5">
                {ordbok.ui.rolle}
              </label>
              <input
                id="rolle"
                name="rolle"
                required
                list="rolleforslag"
                placeholder={ROLLEFORSLAG[0]}
                className={INPUT}
              />
            </div>
            <button type="submit" disabled={venter} className={KNAPP}>
              {venter ? ordbok.felles.lagrer : t.leggTilDeltaker}
            </button>
          </div>
          <button
            type="button"
            className="text-[12.5px] text-accent hover:underline mt-3"
            onClick={() => setListe(true)}
          >
            {t.limInnFlere}
          </button>
        </form>
      )}

      <datalist id="rolleforslag">
        {ROLLEFORSLAG.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">
          {feil}
        </div>
      )}
      {kvittering && (
        <div className="text-xs text-good bg-good-bg rounded-xl px-3.5 py-2.5 mb-3">
          {kvittering}
        </div>
      )}

      {deltakere.length > 0 && (
        <>
          <ul className="flex flex-wrap gap-2 mb-4">
            {deltakere.map((d) => (
              <li
                key={d.id}
                className="group flex items-center gap-2 bg-canvas border border-border rounded-xl pl-3 pr-1.5 py-1.5"
              >
                <span className="text-[13px] font-semibold">{d.navn}</span>
                <span className="text-[11.5px] text-dim">{d.rolle}</span>
                <button
                  type="button"
                  aria-label={`${ordbok.felles.fjern} ${d.navn}`}
                  disabled={venter}
                  onClick={() => kjor(() => fjernDeltaker(d.id))}
                  className="text-faint hover:text-bad hover:bg-bad-bg rounded-lg w-6 h-6 leading-none transition disabled:opacity-40"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {/*
            Uten denne knappen gjør en ny deltaker ingenting for leverandører
            som allerede er kontrollert — jav kjører ellers bare i det
            øyeblikket en kontroll utføres. Lista ville sett vedlikeholdt ut
            og tabellen vært like tom.
          */}
          <div className="border-t border-border pt-4 flex items-start justify-between gap-4 flex-wrap">
            <p className="text-[12.5px] text-dim leading-relaxed max-w-[52ch]">
              {t.kjorPaNyttForklaring}
            </p>
            <button
              type="button"
              disabled={venter}
              onClick={() => kjor(kjorJavPaNytt)}
              className={KNAPP_MILD}
            >
              {venter ? ordbok.felles.henter : t.kjorPaNytt}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
