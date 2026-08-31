"use client";

import { useState, useTransition, type ReactNode } from "react";

type Svar = { ok: true } | { ok: false; feil: string };

/**
 * Skjema som viser seg selv bak en knapp. Feil fra serveren vises i
 * skjemaet, ikke som en side som forsvinner — den som fyller ut vil se
 * hva som var galt uten å måtte skrive alt på nytt.
 */
export function Skjema({
  knapp,
  tittel,
  handling,
  children,
}: {
  knapp: string;
  tittel: string;
  handling: (fd: FormData) => Promise<Svar>;
  children: ReactNode;
}) {
  const [apen, setApen] = useState(false);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  return (
    <div className="mb-5">
      {!apen ? (
        <button
          type="button"
          onClick={() => setApen(true)}
          className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
        >
          {knapp}
        </button>
      ) : (
        <form
          className="bg-surface rounded-card shadow-card p-6"
          action={(fd) =>
            start(async () => {
              const res = await handling(fd);
              if (res.ok) {
                setApen(false);
                setFeil("");
              } else {
                setFeil(res.feil);
              }
            })
          }
        >
          <h2 className="text-[15px] font-semibold mb-4">{tittel}</h2>
          <div className="grid sm:grid-cols-2 gap-x-4">{children}</div>

          {feil && (
            <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-1 mb-3">
              {feil}
            </div>
          )}

          <div className="flex gap-2.5 mt-2">
            <button
              type="submit"
              disabled={venter}
              className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
            >
              {venter ? "Sparar …" : "Spara"}
            </button>
            <button
              type="button"
              onClick={() => {
                setApen(false);
                setFeil("");
              }}
              className="text-sm text-dim hover:text-ink px-3 py-2.5 transition"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export const INPUT =
  "w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent";

export function Felt({
  navn,
  merke,
  type = "text",
  krav = false,
  plassholder,
  val,
  standard,
}: {
  navn: string;
  merke: string;
  type?: string;
  krav?: boolean;
  plassholder?: string;
  val?: { verdi: string; tekst: string }[];
  standard?: string;
}) {
  return (
    <div className="mb-3.5">
      <label htmlFor={navn} className="block text-xs font-semibold mb-1.5">
        {merke}
        {!krav && <span className="text-faint font-normal"> — valfritt</span>}
      </label>
      {val ? (
        <select id={navn} name={navn} defaultValue={standard} className={INPUT}>
          {val.map((v) => (
            <option key={v.verdi} value={v.verdi}>
              {v.tekst}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={navn}
          name={navn}
          type={type}
          required={krav}
          placeholder={plassholder}
          defaultValue={standard}
          className={INPUT}
        />
      )}
    </div>
  );
}

/** Statusbytte rett i tabellen, uten å åpne noe skjema. */
export function StatusVelger({
  id,
  status,
  val,
  handling,
}: {
  id: string;
  status: string;
  val: { verdi: string; tekst: string }[];
  handling: (id: string, status: string) => Promise<Svar>;
}) {
  const [venter, start] = useTransition();
  return (
    <select
      value={status}
      disabled={venter}
      onChange={(e) => {
        const ny = e.target.value;
        start(async () => {
          await handling(id, ny);
        });
      }}
      className="text-[12px] px-2 py-1 rounded-lg border border-border bg-surface hover:border-border-strong transition disabled:opacity-50"
    >
      {val.map((v) => (
        <option key={v.verdi} value={v.verdi}>
          {v.tekst}
        </option>
      ))}
    </select>
  );
}
