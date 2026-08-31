"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  oppdaterEgetNavn,
  byttEgetPassord,
  oppdaterOrganisasjon,
  nyBruker,
  fjernBruker,
  settRolle,
  type Svar,
} from "@/app/(dashboard)/konto/handlinger";

const INPUT =
  "w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";

/** Felles skall: viser både feil og kvittering, så man ser at noe skjedde. */
function Form({
  handling,
  knapp,
  children,
  nullstill = false,
}: {
  handling: (fd: FormData) => Promise<Svar>;
  knapp: string;
  children: ReactNode;
  nullstill?: boolean;
}) {
  const [feil, setFeil] = useState("");
  const [kvittering, setKvittering] = useState("");
  const [venter, start] = useTransition();

  // onSubmit, ikke action-propen. action med en vanlig klientfunksjon blir
  // ikke fanget opp av React her — skjemaet gjorde en helt vanlig HTML-post
  // og navigerte bort fra siden i stedet for å kalle serverhandlingen.
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const skjema = e.currentTarget;
        const fd = new FormData(skjema);
        start(async () => {
          const res = await handling(fd);
          if (res.ok) {
            setFeil("");
            setKvittering(res.melding ?? "Lagret.");
            if (nullstill) skjema.reset();
          } else {
            setKvittering("");
            setFeil(res.feil);
          }
        });
      }}
    >
      {children}
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
      <button type="submit" disabled={venter} className={KNAPP}>
        {venter ? "Lagrer …" : knapp}
      </button>
    </form>
  );
}

function Felt({
  navn,
  merke,
  type = "text",
  standard,
  krav = false,
  plassholder,
}: {
  navn: string;
  merke: string;
  type?: string;
  standard?: string;
  krav?: boolean;
  plassholder?: string;
}) {
  return (
    <div className="mb-3.5">
      <label htmlFor={navn} className="block text-xs font-semibold mb-1.5">
        {merke}
      </label>
      <input
        id={navn}
        name={navn}
        type={type}
        required={krav}
        defaultValue={standard}
        placeholder={plassholder}
        className={INPUT}
      />
    </div>
  );
}

export function EgetNavn({ navn }: { navn: string }) {
  return (
    <Form handling={oppdaterEgetNavn} knapp="Lagre navn">
      <Felt navn="navn" merke="Navn" standard={navn} krav />
    </Form>
  );
}

export function EgetPassord() {
  return (
    <Form handling={byttEgetPassord} knapp="Bytt passord" nullstill>
      <Felt navn="nytt" merke="Nytt passord" type="password" krav />
      <Felt navn="gjenta" merke="Gjenta passordet" type="password" krav />
    </Form>
  );
}

export function Organisasjonen({ navn, orgNr }: { navn: string; orgNr: string }) {
  return (
    <Form handling={oppdaterOrganisasjon} knapp="Lagre">
      <Felt navn="navn" merke="Navn på organisasjonen" standard={navn} krav />
      <Felt
        navn="org_nr"
        merke="Organisasjonsnummer"
        standard={orgNr}
        plassholder="964 338 531"
      />
      <p className="text-[12px] text-faint mb-3.5 -mt-1">
        Planen styres av abonnementet og kan ikke endres her.
      </p>
    </Form>
  );
}

export function NyBrukerSkjema() {
  const [apen, setApen] = useState(false);

  if (!apen)
    return (
      <button type="button" onClick={() => setApen(true)} className={`${KNAPP} mb-5`}>
        + Legg til bruker
      </button>
    );

  return (
    <div className="bg-canvas rounded-xl p-5 mb-5">
      <h3 className="text-[14px] font-semibold mb-4">Ny bruker</h3>
      <Form handling={nyBruker} knapp="Opprett" nullstill>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Felt navn="navn" merke="Navn" krav plassholder="Marit Aasen" />
          <Felt
            navn="epost"
            merke="E-post"
            type="email"
            krav
            plassholder="navn@kommune.no"
          />
          <Felt navn="passord" merke="Midlertidig passord" type="password" krav />
          <div className="mb-3.5">
            <label htmlFor="rolle" className="block text-xs font-semibold mb-1.5">
              Rolle
            </label>
            <select id="rolle" name="rolle" defaultValue="bruker" className={INPUT}>
              <option value="bruker">Bruker</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
        </div>
        <p className="text-[12px] text-faint mb-3.5">
          Brukeren logger inn med dette passordet og bør bytte det selv under
          Kontoinnstillinger.
        </p>
      </Form>
      <button
        type="button"
        onClick={() => setApen(false)}
        className="text-sm text-dim hover:text-ink mt-2 transition"
      >
        Avbryt
      </button>
    </div>
  );
}

/** Rollebytte og fjerning, rett i tabellraden. */
export function BrukerRad({
  id,
  rolle,
  erDegSelv,
  kanEndre,
  felt,
}: {
  id: string;
  rolle: string;
  erDegSelv: boolean;
  kanEndre: boolean;
  felt: "rolle" | "fjern";
}) {
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState("");

  if (felt === "rolle") {
    if (!kanEndre || erDegSelv)
      return (
        <span className="text-[12.5px] text-dim">
          {rolle === "administrator" ? "Administrator" : "Bruker"}
        </span>
      );

    return (
      <select
        value={rolle}
        disabled={venter}
        onChange={(e) =>
          start(async () => {
            await settRolle(id, e.target.value);
          })
        }
        className="text-[12px] px-2 py-1 rounded-lg border border-border bg-surface hover:border-border-strong transition disabled:opacity-50"
      >
        <option value="bruker">Bruker</option>
        <option value="administrator">Administrator</option>
      </select>
    );
  }

  if (!kanEndre || erDegSelv) return <span />;

  return (
    <span>
      <button
        type="button"
        disabled={venter}
        onClick={() =>
          start(async () => {
            const res = await fjernBruker(id);
            if (!res.ok) setFeil(res.feil);
          })
        }
        className="text-[12.5px] text-bad hover:underline disabled:opacity-50"
      >
        {venter ? "Fjerner …" : "Fjern"}
      </button>
      {feil && <div className="text-[11px] text-bad mt-1">{feil}</div>}
    </span>
  );
}
