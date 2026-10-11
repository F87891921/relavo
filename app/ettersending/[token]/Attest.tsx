"use client";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { leverSkatteattest } from "./handlinger";

/**
 * Skatteattesten, i samme utsendelse som egenerklæringen.
 *
 * Den er valgfri her fordi oppdragsgiver ikke alltid har bedt om den på
 * dette tidspunktet, og fordi en obligatorisk attest ville blokkert
 * leveringen av erklæringen som faktisk har en frist.
 *
 * Datoen som spørres om er den som står på attesten, ikke dagen i dag.
 * § 5i-kontrollen avhenger av om attesten er fersk, og en attest lastet
 * opp i dag kan være et halvt år gammel.
 */
export function Attest({
  token,
  levert,
}: {
  token: string;
  levert: { filnavn: string; utstedt: string } | null;
}) {
  const [feil, setFeil] = useState("");
  const [klar, setKlar] = useState(false);
  const [filnavn, setFilnavn] = useState("");
  const [venter, start] = useTransition();

  if (levert || klar)
    return (
      <div className="bg-good-bg text-good rounded-xl px-5 py-4">
        <div className="text-[13.5px] font-semibold mb-1">Skatteattesten er mottatt</div>
        <p className="text-[12.5px] leading-relaxed">
          {levert
            ? `${levert.filnavn}, utstedt ${new Date(levert.utstedt).toLocaleDateString("nb-NO")}.`
            : "Takk. Oppdragsgiveren har fått den."}
        </p>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setFeil("");
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await leverSkatteattest(fd);
          if (r.ok) setKlar(true);
          else setFeil(r.feil);
        });
      }}
    >
      <input type="hidden" name="token" value={token} />

      <div className="mb-4">
        <label htmlFor="attest" className="block text-xs font-semibold mb-1.5">
          Skatteattesten
        </label>
        <input
          id="attest"
          name="attest"
          type="file"
          required
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFilnavn(e.target.files?.[0]?.name ?? "")}
          className="block w-full text-[13px] text-dim file:mr-3 file:py-2 file:px-4 file:rounded-xl
            file:border-0 file:text-[13px] file:font-semibold file:bg-surface2 file:text-accent
            hover:file:bg-accent-light file:cursor-pointer cursor-pointer"
        />
        <p className="text-[11.5px] text-faint mt-1.5">
          Attesten hentes i Altinn under «Skatteattest». PDF eller bilde, høyst
          15 MB.
          {filnavn && <span className="block text-dim mt-1">Valgt: {filnavn}</span>}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-x-4">
        <div className="mb-4">
          <label htmlFor="utstedt" className="block text-xs font-semibold mb-1.5">
            Utstedt
          </label>
          <input
            id="utstedt"
            name="utstedt"
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            className={FELT_FULL}
          />
          <p className="text-[11.5px] text-faint mt-1.5">
            Datoen som står på attesten.
          </p>
        </div>
        <div className="mb-4">
          <label htmlFor="attest_navn" className="block text-xs font-semibold mb-1.5">
            Navn
          </label>
          <input id="attest_navn" name="attest_navn" required className={FELT_FULL} />
        </div>
        <div className="mb-4">
          <label htmlFor="attest_rolle" className="block text-xs font-semibold mb-1.5">
            Rolle i selskapet
          </label>
          <input id="attest_rolle" name="attest_rolle" required className={FELT_FULL} />
        </div>
      </div>

      {feil && (
        <div className="text-[12.5px] text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-4">
          {feil}
        </div>
      )}

      <button
        type="submit"
        disabled={venter}
        className="bg-surface border border-border hover:border-border-strong active:scale-[0.97] transition text-[13.5px] font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
      >
        {venter ? "Sender …" : "Send skatteattesten"}
      </button>
    </form>
  );
}
