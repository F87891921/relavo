"use client";

import { useOrd } from "@/components/Sprakgiver";

import { useState, useTransition } from "react";
import { Merke } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { mailtoLenke } from "@/lib/brev";
import {
  markerSendt,
  lagreSvar,
  vurderSvar,
} from "@/app/(dashboard)/tilbud/handlinger";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";
const KNAPP_LYS =
  "text-sm font-semibold px-4 py-2.5 rounded-xl bg-canvas border border-border hover:border-border-strong active:scale-[0.97] transition inline-block";

export type Redegjorelse = {
  id: string;
  leverandor_navn: string;
  leverandor_epost: string | null;
  anskaffelse_ref: string | null;
  anskaffelse_navn: string | null;
  avvik_prosent: number | null;
  utkast: string;
  frist: string | null;
  sendt: string | null;
  svar: string | null;
  svar_mottatt: string | null;
  vurdering: string | null;
  vurdering_begrunnelse: string | null;
};

/**
 * Kravet etter § 24-9, fra utkast til ferdig vurdering.
 *
 * Knappen åpner kundens egen e-postklient. Relavo sender ikke brevet:
 * kommunen er journalføringspliktig, og et brev sendt herfra havner aldri i
 * deres arkiv. Svaret ville også kommet til oss i stedet for til dem.
 */
export function RedegjorelseKort({ r }: { r: Redegjorelse }) {
  const o = useOrd();
  const [apen, setApen] = useState(!r.sendt);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const emne = `Krav om redegjørelse etter § 24-9 — ${r.anskaffelse_ref ?? ""}`.trim();

  const steg = r.vurdering
    ? { tekst: o.brev.vurdert, tone: "god" as const }
    : r.svar
      ? { tekst: o.brev.svarIkkeVurdert, tone: "advarsel" as const }
      : r.sendt
        ? { tekst: o.brev.sendtVenter, tone: "advarsel" as const }
        : { tekst: o.brev.utkast, tone: "noytral" as const };

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setApen(!apen)}
        aria-expanded={apen}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-canvas transition"
      >
        <span className="flex items-center gap-2.5 flex-wrap min-w-0">
          <span className="text-[14px] font-semibold">{r.leverandor_navn}</span>
          <Merke tone={steg.tone}>{steg.tekst}</Merke>
          {r.avvik_prosent !== null && (
            <span className="text-[12px] text-bad font-semibold">
              {r.avvik_prosent} %
            </span>
          )}
          {r.frist && (
            <span className="text-[11.5px] text-faint">frist {r.frist}</span>
          )}
        </span>
        <span className="text-[11.5px] text-faint shrink-0">
          {apen ? o.felles.skjul : o.felles.vis}
        </span>
      </button>

      {apen && (
        <div className="border-t border-border px-5 py-5 space-y-5">
          {/* Steg 1 — brevet */}
          <div>
            <div className="text-[12px] font-semibold mb-2">{o.brev.brevet}</div>
            <div className="bg-canvas rounded-xl px-4 py-3.5 text-[12.5px] leading-relaxed text-dim whitespace-pre-line">
              {r.utkast}
            </div>

            {!r.sendt && (
              <div className="flex flex-wrap gap-2.5 mt-3">
                <a
                  href={mailtoLenke({
                    til: r.leverandor_epost,
                    emne,
                    tekst: r.utkast,
                  })}
                  className={KNAPP_LYS}
                >
                  {o.brev.apneIEpost}
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(r.utkast)}
                  className={KNAPP_LYS}
                >
                  {o.brev.kopierTeksten}
                </button>
                <button
                  type="button"
                  disabled={venter}
                  onClick={() =>
                    start(async () => {
                      const res = await markerSendt(r.id);
                      if (!res.ok) setFeil(res.feil);
                    })
                  }
                  className={KNAPP}
                >
                  {o.brev.markerSendt}
                </button>
              </div>
            )}

            <p className="text-[11.5px] text-faint mt-2.5 leading-relaxed max-w-[70ch]">
              Brevet sendes fra deres egen e-post, ikke fra Relavo. Da går det
              ut fra kommunen og kan journalføres som ethvert annet utgående
              saksdokument — og svaret kommer til dere.
            </p>
          </div>

          {/* Steg 2 — svaret */}
          {r.sendt && (
            <div className="border-t border-border pt-5">
              <div className="text-[12px] font-semibold mb-2">
                {o.brev.svarFraLeverandoren}
              </div>
              {r.svar ? (
                <div className="bg-canvas rounded-xl px-4 py-3.5 text-[12.5px] leading-relaxed whitespace-pre-line">
                  {r.svar}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    start(async () => {
                      const res = await lagreSvar(fd);
                      if (!res.ok) setFeil(res.feil);
                    });
                  }}
                >
                  <input type="hidden" name="id" value={r.id} />
                  <textarea
                    name="svar"
                    rows={4}
                    required
                    placeholder={o.brev.limInnSvaret}
                    className={`${FELT_FULL} max-w-none resize-y`}
                  />
                  <button type="submit" disabled={venter} className={`${KNAPP} mt-3`}>
                    {o.brev.lagreSvaret}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Steg 3 — vurderingen */}
          {r.svar && (
            <div className="border-t border-border pt-5">
              <div className="text-[12px] font-semibold mb-1">{o.brev.vurdering}</div>
              <p className="text-[11.5px] text-faint mb-3 leading-relaxed max-w-[70ch]">
                § 24-9 krever at dere tar stilling til om forklaringen holder,
                og at vurderingen kan dokumenteres i anskaffelsesprotokollen.
              </p>

              {r.vurdering ? (
                <div>
                  <Merke tone={r.vurdering === "tilstrekkelig" ? "god" : "brudd"}>
                    {r.vurdering === "tilstrekkelig"
                      ? o.brev.tilstrekkelig
                      : o.brev.utilstrekkelig}
                  </Merke>
                  <p className="text-[12.5px] text-dim mt-2 leading-relaxed whitespace-pre-line">
                    {r.vurdering_begrunnelse}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    start(async () => {
                      const res = await vurderSvar(fd);
                      if (!res.ok) setFeil(res.feil);
                    });
                  }}
                >
                  <input type="hidden" name="id" value={r.id} />
                  <select name="vurdering" defaultValue="" className={`${FELT_FULL} mb-3`}>
                    <option value="">{o.veiviser.velg}</option>
                    <option value="tilstrekkelig">{o.brev.tilstrekkelig}</option>
                    <option value="utilstrekkelig">
                      {o.brev.utilstrekkelig}
                    </option>
                  </select>
                  <textarea
                    name="begrunnelse"
                    rows={3}
                    required
                    placeholder={o.brev.hvorforHolder}
                    className={`${FELT_FULL} max-w-none resize-y`}
                  />
                  <button type="submit" disabled={venter} className={`${KNAPP} mt-3`}>
                    {o.brev.lagreVurderingen}
                  </button>
                </form>
              )}
            </div>
          )}

          {feil && (
            <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5">
              {feil}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
