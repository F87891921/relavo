"use client";

import { useOrd } from "@/components/Sprakgiver";

import { useState, useTransition } from "react";
import { Merke, type Tone } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { espdBrev, mailtoLenke, virkedagerFram, somDato, dagerIgjen } from "@/lib/brev";
import {
  etterspErESPD,
  markerESPDSendt,
  settESPDStatus,
  lagreESPDUtkast,
  espdVedlegg,
} from "@/app/(dashboard)/tilbud/handlinger";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50";
const KNAPP_LYS =
  "text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-canvas border border-border hover:border-border-strong transition inline-block";

const STATUSTONE: Record<string, Tone> = {
  mottatt: "god",
  motstrid: "brudd",
  mangler: "brudd",
  sendt: "advarsel",
  utlopt: "brudd",
};

const statusTekst = (o: ReturnType<typeof useOrd>, v: string) =>
  ({
    mottatt: o.brev.utenMerknad,
    motstrid: o.brev.motstrid,
    mangler: o.brev.ikkeLevert,
    sendt: o.brev.venterPaSvar,
    utlopt: o.brev.fristenUte,
  })[v] ?? v;

export type Espd = {
  id: string;
  status: string;
  fase: string;
  anskaffelse_ref: string | null;
  frist: string | null;
  etterspurt: string | null;
  mottaker_navn: string | null;
  mottaker_epost: string | null;
  utkast: string | null;
  token: string | null;
  levert: string | null;
  levert_filnavn: string | null;
  signert_navn: string | null;
  signert_rolle: string | null;
  leverandorer: { navn: string; org_nr: string } | null;
};

export function EspdRad({
  e,
  lenkebase,
  avsenderNavn,
  avsenderOrg,
}: {
  e: Espd;
  /** https://relavo.no — brukes til å bygge opplastingslenken i brevet. */
  lenkebase: string;
  avsenderNavn: string | null;
  avsenderOrg: string | null;
}) {
  const o = useOrd();
  const [apen, setApen] = useState(false);
  const [feil, setFeil] = useState("");
  const [kvittering, setKvittering] = useState("");
  const [venter, start] = useTransition();

  const s = {
    tekst: statusTekst(o, e.status),
    tone: STATUSTONE[e.status] ?? ("noytral" as Tone),
  };
  const igjen = dagerIgjen(e.frist);
  const forfalt = e.status === "sendt" && igjen !== null && igjen < 0;
  const naerFrist = e.status === "sendt" && igjen !== null && igjen >= 0 && igjen <= 3;

  const opplasting = e.token ? `${lenkebase}/ettersending/${e.token}` : null;

  // Malen. Er brevet allerede lagret, er det det som gjelder — kunden kan ha
  // skrevet om det, og da skal ikke malen overta igjen.
  const [navn, setNavn] = useState(e.mottaker_navn ?? "");
  const [frist, setFrist] = useState(e.frist ?? somDato(virkedagerFram(10)));

  const mal = espdBrev({
    leverandor: e.leverandorer?.navn ?? "",
    mottakerNavn: navn || e.mottaker_navn,
    anskaffelseRef: e.anskaffelse_ref ?? "",
    frist,
    lenke: opplasting,
    avsenderNavn,
    avsenderOrg,
  });

  const [brev, setBrev] = useState(e.utkast ?? mal);
  const lagretBrev = e.utkast ?? mal;

  // Feltene over brevet endrer malen. Har man ikke rørt teksten selv, skal
  // den følge med — har man det, skal den stå i fred.
  const [rort, setRort] = useState(false);
  const visBrev = rort ? brev : e.utkast ? brev : mal;

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setApen(!apen)}
        aria-expanded={apen}
        className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 text-left hover:bg-canvas transition"
      >
        <span className="flex items-center gap-2.5 flex-wrap min-w-0">
          <span className="text-[13.5px] font-semibold">
            {e.leverandorer?.navn ?? "—"}
          </span>
          <Merke tone={forfalt ? "brudd" : s.tone}>
            {forfalt ? o.brev.fristenUte : s.tekst}
          </Merke>
          {e.levert && <Merke tone="god">{o.brev.levert}</Merke>}
          {e.anskaffelse_ref && (
            <span className="font-mono text-[11.5px] text-faint">
              {e.anskaffelse_ref}
            </span>
          )}
          {e.status === "sendt" && igjen !== null && !e.levert && (
            <span
              className={`text-[11.5px] font-semibold ${
                forfalt ? "text-bad" : naerFrist ? "text-warn" : "text-faint"
              }`}
            >
              {forfalt
                ? `${Math.abs(igjen)} dager over fristen`
                : igjen === 0
                  ? "frist i dag"
                  : `${igjen} dager igjen`}
            </span>
          )}
        </span>
        <span className="text-[11.5px] text-faint shrink-0">
          {apen ? o.felles.skjul : o.felles.vis}
        </span>
      </button>

      {apen && (
        <div className="border-t border-border px-4 sm:px-5 py-5">
          {/* ---------------------------------------- Levert erklæring --- */}
          {e.levert && (
            <div className="bg-good-bg text-good rounded-xl px-4 py-3.5 mb-4 text-[12.5px] leading-relaxed">
              <b>{o.brev.erklaeringLevert}</b>{" "}
              {e.signert_navn && (
                <>
                  Bekreftet av {e.signert_navn}
                  {e.signert_rolle && `, ${e.signert_rolle}`},{" "}
                </>
              )}
              {new Date(e.levert).toLocaleDateString("nb-NO")}.
              <button
                type="button"
                disabled={venter}
                onClick={() =>
                  start(async () => {
                    const r = await espdVedlegg(e.id);
                    if (r.ok) window.open(r.url, "_blank", "noopener");
                    else setFeil(r.feil);
                  })
                }
                className="block mt-2 font-semibold underline underline-offset-2 hover:no-underline disabled:opacity-50"
              >
                Åpne {e.levert_filnavn ?? "vedlegget"} →
              </button>
            </div>
          )}

          {/* ------------------------------------------- Be om den her --- */}
          {e.status === "mangler" && !e.etterspurt && (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                const fd = new FormData(ev.currentTarget);
                fd.set("utkast", visBrev);
                start(async () => {
                  const res = await etterspErESPD(fd);
                  if (!res.ok) setFeil(res.feil);
                });
              }}
            >
              <input type="hidden" name="id" value={e.id} />
              <div className="grid sm:grid-cols-3 gap-x-4">
                <div className="mb-3.5">
                  <label className="block text-xs font-semibold mb-1.5">
                    Kontaktperson
                  </label>
                  <input
                    name="mottaker_navn"
                    value={navn}
                    onChange={(ev) => setNavn(ev.target.value)}
                    placeholder="Kristian Holth"
                    className={FELT_FULL}
                  />
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-semibold mb-1.5">
                    {o.brev.mottakerEpost}
                  </label>
                  <input
                    name="mottaker_epost"
                    type="email"
                    defaultValue={e.mottaker_epost ?? ""}
                    placeholder="post@leverandor.no"
                    className={FELT_FULL}
                  />
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-semibold mb-1.5">
                    {o.brev.fristEttersending}
                  </label>
                  <input
                    name="frist"
                    type="date"
                    value={frist}
                    onChange={(ev) => setFrist(ev.target.value)}
                    className={FELT_FULL}
                  />
                </div>
              </div>

              <Brevfelt
                verdi={visBrev}
                onEndre={(v) => {
                  setBrev(v);
                  setRort(true);
                }}
              />

              <button type="submit" disabled={venter} className={`${KNAPP} mt-3`}>
                {venter ? o.felles.lagrer : o.brev.beOmEttersending}
              </button>
              <p className="text-[11.5px] text-faint mt-2.5 leading-relaxed max-w-[70ch]">
                Navnet på kontaktpersonen brukes i hilsenen. Lenken i brevet
                går til en side der leverandøren laster opp erklæringen og
                bekrefter den med navn og rolle.
              </p>
            </form>
          )}

          {/* ------------------------------------------------ Sendt ------ */}
          {(e.status === "sendt" || e.etterspurt) && (
            <>
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <span className="text-[12px] font-semibold">{o.brev.forespørselen}</span>
                <span className="text-[11px] text-faint">
                  kan endres før den sendes
                </span>
              </div>

              <Brevfelt
                verdi={visBrev}
                onEndre={(v) => {
                  setBrev(v);
                  setRort(true);
                }}
              />

              <div className="flex flex-wrap gap-2.5 mt-3">
                <a
                  href={mailtoLenke({
                    til: e.mottaker_epost,
                    emne: `Ettersending av ESPD-egenerklæring — ${e.anskaffelse_ref ?? ""}`.trim(),
                    tekst: visBrev,
                  })}
                  className={KNAPP_LYS}
                >
                  {o.brev.apneIEpost}
                </a>

                {visBrev !== lagretBrev && (
                  <button
                    type="button"
                    disabled={venter}
                    onClick={() => {
                      const fd = new FormData();
                      fd.set("id", e.id);
                      fd.set("utkast", visBrev);
                      start(async () => {
                        const res = await lagreESPDUtkast(fd);
                        if (res.ok) setKvittering(o.brev.brevetLagret);
                        else setFeil(res.feil);
                      });
                    }}
                    className={KNAPP}
                  >
                    {o.brev.lagreEndringene}
                  </button>
                )}

                {!e.etterspurt && (
                  <button
                    type="button"
                    disabled={venter}
                    onClick={() =>
                      start(async () => {
                        const res = await markerESPDSendt(e.id);
                        if (!res.ok) setFeil(res.feil);
                      })
                    }
                    className={KNAPP}
                  >
                    {o.brev.markerSendt}
                  </button>
                )}

                {!e.levert && (
                  <button
                    type="button"
                    disabled={venter}
                    onClick={() =>
                      start(async () => {
                        const res = await settESPDStatus(e.id, "mottatt");
                        if (!res.ok) setFeil(res.feil);
                      })
                    }
                    className={KNAPP_LYS}
                  >
                    {o.brev.mottattAnnet}
                  </button>
                )}
              </div>

              {opplasting && !e.levert && (
                <p className="text-[11.5px] text-faint mt-2.5 leading-relaxed break-all">
                  Opplastingslenke:{" "}
                  <span className="font-mono text-dim">{opplasting}</span>
                </p>
              )}

              {e.etterspurt && (
                <p className="text-[11.5px] text-faint mt-1.5">
                  Sendt {new Date(e.etterspurt).toLocaleDateString("nb-NO")}
                  {e.frist && ` · frist ${e.frist}`}
                </p>
              )}
            </>
          )}

          {feil && (
            <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-3">
              {feil}
            </div>
          )}
          {kvittering && (
            <div className="text-xs text-good bg-good-bg rounded-xl px-3.5 py-2.5 mt-3">
              {kvittering}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Brevfelt({
  verdi,
  onEndre,
}: {
  verdi: string;
  onEndre: (v: string) => void;
}) {
  const o = useOrd();
  return (
    <textarea
      rows={16}
      value={verdi}
      onChange={(e) => onEndre(e.target.value)}
      aria-label={o.brev.brevetTil}
      className={`${FELT_FULL} max-w-none resize-y text-[12.5px] leading-relaxed font-sans`}
    />
  );
}
