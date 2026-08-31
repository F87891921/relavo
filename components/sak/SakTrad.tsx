"use client";

import { useState, useTransition } from "react";
import { Merke, type Tone } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { KATEGORIER, STATUSER, kategoriTekst, statusTekst } from "@/lib/sak";
import {
  nySak,
  svarPaSak,
  settSakStatus,
  settVarsling,
} from "@/app/(dashboard)/support/handlinger";

const TONE: Record<string, Tone> = {
  apen: "aksent",
  venter_oss: "brudd",
  venter_kunde: "advarsel",
  lukket: "noytral",
};

export type SakSvar = {
  id: string;
  fra_relavo: boolean;
  forfatter_navn: string;
  tekst: string;
  opprettet: string;
};

export type Sak = {
  id: string;
  kategori: string;
  emne: string;
  status: string;
  varsle_epost: boolean;
  opprettet: string;
  oppdatert: string;
  sak_svar: SakSvar[];
  organisasjoner?: { navn: string } | null;
};

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";

/** Skjema for å melde inn en ny sak. Bare kundesiden viser dette. */
export function NySak() {
  const [apen, setApen] = useState(false);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  if (!apen)
    return (
      <button type="button" onClick={() => setApen(true)} className={`${KNAPP} mb-5`}>
        + Meld inn en sak
      </button>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const skjema = e.currentTarget;
        const fd = new FormData(skjema);
        start(async () => {
          const res = await nySak(fd);
          if (res.ok) {
            setApen(false);
            setFeil("");
            skjema.reset();
          } else setFeil(res.feil);
        });
      }}
      className="bg-surface rounded-card border border-border shadow-card p-6 mb-5"
    >
      <h2 className="text-[15px] font-semibold mb-4">Ny sak</h2>

      <div className="mb-3.5">
        <label htmlFor="kategori" className="block text-xs font-semibold mb-1.5">
          Hva gjelder det?
        </label>
        <select id="kategori" name="kategori" className={FELT_FULL} defaultValue="data">
          {KATEGORIER.map((k) => (
            <option key={k.verdi} value={k.verdi}>
              {k.tekst}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3.5">
        <label htmlFor="emne" className="block text-xs font-semibold mb-1.5">
          Emne
        </label>
        <input
          id="emne"
          name="emne"
          required
          placeholder="Feil risikonivå på Solstrand Renhold"
          className={FELT_FULL}
        />
      </div>

      <div className="mb-3.5">
        <label htmlFor="melding" className="block text-xs font-semibold mb-1.5">
          Beskriv saken
        </label>
        <textarea
          id="melding"
          name="melding"
          required
          rows={5}
          placeholder="Hva skjedde, og hva forventet du i stedet?"
          className={`${FELT_FULL} max-w-none resize-y`}
        />
      </div>

      <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
        <input
          type="checkbox"
          name="varsle_epost"
          defaultChecked
          className="mt-0.5 accent-[#654b70] w-4 h-4 shrink-0"
        />
        <span className="text-[12.5px] text-dim leading-snug">
          Send meg e-post når saken får svar eller endrer status.
        </span>
      </label>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">
          {feil}
        </div>
      )}

      <div className="flex gap-2.5">
        <button type="submit" disabled={venter} className={KNAPP}>
          {venter ? "Sender …" : "Send inn"}
        </button>
        <button
          type="button"
          onClick={() => setApen(false)}
          className="text-sm text-dim hover:text-ink px-3 py-2.5 transition"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

/** Én sak med hele samtalen, og et felt for å svare. */
export function SakKort({
  sak,
  somRelavo = false,
}: {
  sak: Sak;
  somRelavo?: boolean;
}) {
  const [apen, setApen] = useState(false);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const svar = sak.sak_svar ?? [];
  const siste = svar[svar.length - 1];

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setApen(!apen)}
        aria-expanded={apen}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-canvas transition"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[14px] font-semibold">{sak.emne}</span>
            <Merke tone={TONE[sak.status] ?? "noytral"}>
              {statusTekst(sak.status)}
            </Merke>
            <span className="text-[11.5px] text-faint">
              {kategoriTekst(sak.kategori)}
            </span>
            {somRelavo && sak.organisasjoner && (
              <Merke tone="aksent">{sak.organisasjoner.navn}</Merke>
            )}
          </span>
          {siste && !apen && (
            <span className="block text-[12.5px] text-dim mt-1 truncate max-w-[70ch]">
              {siste.fra_relavo ? "Relavo" : siste.forfatter_navn}: {siste.tekst}
            </span>
          )}
        </span>
        <span className="text-[11.5px] text-faint whitespace-nowrap shrink-0">
          {svar.length} {svar.length === 1 ? "melding" : "meldinger"}
        </span>
      </button>

      {apen && (
        <div className="border-t border-border">
          <div className="px-5 py-4 space-y-3">
            {svar.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl px-4 py-3 ${
                  s.fra_relavo ? "bg-surface2" : "bg-canvas"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-[12px] font-semibold">
                    {s.fra_relavo ? `${s.forfatter_navn} · Relavo` : s.forfatter_navn}
                  </span>
                  <span className="text-[11px] text-faint">
                    {new Date(s.opprettet).toLocaleString("nb-NO")}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed whitespace-pre-line">
                  {s.tekst}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const skjema = e.currentTarget;
              const fd = new FormData(skjema);
              start(async () => {
                const res = await svarPaSak(fd);
                if (res.ok) {
                  setFeil("");
                  skjema.reset();
                } else setFeil(res.feil);
              });
            }}
            className="px-5 pb-5"
          >
            <input type="hidden" name="sak_id" value={sak.id} />
            <textarea
              name="tekst"
              required
              rows={3}
              placeholder={somRelavo ? "Svar til kunden …" : "Skriv et svar …"}
              className={`${FELT_FULL} max-w-none resize-y`}
            />
            {feil && (
              <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-2">
                {feil}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button type="submit" disabled={venter} className={KNAPP}>
                {venter ? "Sender …" : "Send svar"}
              </button>
              <StatusVelger id={sak.id} status={sak.status} />
              {!somRelavo && <Varsling id={sak.id} pa={sak.varsle_epost} />}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusVelger({ id, status }: { id: string; status: string }) {
  const [venter, start] = useTransition();
  return (
    <select
      value={status}
      disabled={venter}
      onChange={(e) => {
        const ny = e.target.value;
        start(async () => {
          await settSakStatus(id, ny);
        });
      }}
      className="text-[12px] px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:border-border-strong transition disabled:opacity-50"
    >
      {STATUSER.map((s) => (
        <option key={s.verdi} value={s.verdi}>
          {s.tekst}
        </option>
      ))}
    </select>
  );
}

function Varsling({ id, pa }: { id: string; pa: boolean }) {
  const [venter, start] = useTransition();
  const [av, setAv] = useState(pa);
  return (
    <label className="flex items-center gap-2 text-[12px] text-dim cursor-pointer">
      <input
        type="checkbox"
        checked={av}
        disabled={venter}
        onChange={(e) => {
          const ny = e.target.checked;
          setAv(ny);
          start(async () => {
            await settVarsling(id, ny);
          });
        }}
        className="accent-[#654b70] w-4 h-4"
      />
      Varsle meg på e-post
    </label>
  );
}
