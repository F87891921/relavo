"use client";

import { useState, useTransition } from "react";
import { Merke, type Tone } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { espdBrev, mailtoLenke, virkedagerFram, somDato, dagerIgjen } from "@/lib/brev";
import {
  etterspErESPD,
  markerESPDSendt,
  settESPDStatus,
} from "@/app/(dashboard)/tilbud/handlinger";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50";
const KNAPP_LYS =
  "text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-canvas border border-border hover:border-border-strong transition inline-block";

const STATUS: Record<string, { tekst: string; tone: Tone }> = {
  mottatt: { tekst: "Uten merknad", tone: "god" },
  motstrid: { tekst: "Motstrid mot registrene", tone: "brudd" },
  mangler: { tekst: "Ikke levert", tone: "brudd" },
  sendt: { tekst: "Venter på svar", tone: "advarsel" },
  utlopt: { tekst: "Fristen er ute", tone: "brudd" },
};

export type Espd = {
  id: string;
  status: string;
  fase: string;
  anskaffelse_ref: string | null;
  frist: string | null;
  etterspurt: string | null;
  mottaker_navn: string | null;
  mottaker_epost: string | null;
  leverandorer: { navn: string; org_nr: string } | null;
};

export function EspdRad({ e }: { e: Espd }) {
  const [apen, setApen] = useState(false);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const s = STATUS[e.status] ?? { tekst: e.status, tone: "noytral" as Tone };
  const igjen = dagerIgjen(e.frist);
  const forfalt = e.status === "sendt" && igjen !== null && igjen < 0;
  const naerFrist = e.status === "sendt" && igjen !== null && igjen >= 0 && igjen <= 3;

  const brev = espdBrev({
    leverandor: e.leverandorer?.navn ?? "",
    anskaffelseRef: e.anskaffelse_ref ?? "",
    frist: e.frist ?? somDato(virkedagerFram(10)),
  });

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setApen(!apen)}
        aria-expanded={apen}
        className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-canvas transition"
      >
        <span className="flex items-center gap-2.5 flex-wrap min-w-0">
          <span className="text-[13.5px] font-semibold">
            {e.leverandorer?.navn ?? "—"}
          </span>
          <Merke tone={forfalt ? "brudd" : s.tone}>
            {forfalt ? "Fristen er ute" : s.tekst}
          </Merke>
          {e.anskaffelse_ref && (
            <span className="font-mono text-[11.5px] text-faint">
              {e.anskaffelse_ref}
            </span>
          )}
          {e.status === "sendt" && igjen !== null && (
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
          {apen ? "Skjul" : "Vis"}
        </span>
      </button>

      {apen && (
        <div className="border-t border-border px-5 py-5">
          {e.status === "mangler" && !e.etterspurt && (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                const fd = new FormData(ev.currentTarget);
                start(async () => {
                  const res = await etterspErESPD(fd);
                  if (!res.ok) setFeil(res.feil);
                });
              }}
            >
              <input type="hidden" name="id" value={e.id} />
              <div className="grid sm:grid-cols-2 gap-x-4">
                <div className="mb-3.5">
                  <label className="block text-xs font-semibold mb-1.5">
                    Mottakerens e-post
                  </label>
                  <input
                    name="mottaker_epost"
                    type="email"
                    placeholder="post@leverandor.no"
                    className={FELT_FULL}
                  />
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-semibold mb-1.5">
                    Frist for ettersending
                  </label>
                  <input
                    name="frist"
                    type="date"
                    defaultValue={somDato(virkedagerFram(10))}
                    className={FELT_FULL}
                  />
                </div>
              </div>
              <button type="submit" disabled={venter} className={KNAPP}>
                {venter ? "Lagrer …" : "Be om ettersending"}
              </button>
              <p className="text-[11.5px] text-faint mt-2.5 leading-relaxed max-w-[70ch]">
                Manglende egenerklæring er normalt en mangel som kan rettes
                etter § 23-5, i motsetning til innholdet i selve tilbudet.
              </p>
            </form>
          )}

          {(e.status === "sendt" || e.etterspurt) && (
            <>
              <div className="text-[12px] font-semibold mb-2">Forespørselen</div>
              <div className="bg-canvas rounded-xl px-4 py-3.5 text-[12.5px] leading-relaxed text-dim whitespace-pre-line mb-3">
                {brev}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href={mailtoLenke({
                    til: e.mottaker_epost,
                    emne: `Ettersending av ESPD-egenerklæring — ${e.anskaffelse_ref ?? ""}`.trim(),
                    tekst: brev,
                  })}
                  className={KNAPP_LYS}
                >
                  Åpne i e-post
                </a>
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
                    Marker som sendt
                  </button>
                )}
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
                  Erklæringen er mottatt
                </button>
              </div>

              {e.etterspurt && (
                <p className="text-[11.5px] text-faint mt-2.5">
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
        </div>
      )}
    </div>
  );
}
