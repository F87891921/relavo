"use client";

import { useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { FELT_FULL as INPUT } from "@/components/ui/felt";
import { Merke, Tabell, NOK } from "@/components/ui";
import {
  nyAnskaffelse,
  fjernAnskaffelse,
  nyttTilbud,
  fjernTilbud,
  type Svar,
} from "@/app/(dashboard)/anskaffelser/handlinger";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";
const KNAPP_MILD =
  "border border-border hover:border-border-strong hover:bg-canvas active:scale-[0.97] transition text-[13px] font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";

export type Anskaffelse = {
  id: string;
  saksnummer: string;
  navn: string;
  konkurranseform: string | null;
  verdi: string | null;
  periode: string | null;
  tilbud: { id: string; leverandor_navn: string; sum: number }[];
};

export function Anskaffelser({ anskaffelser }: { anskaffelser: Anskaffelse[] }) {
  const ordbok = useOrd();
  const t = ordbok.anskaffelse;

  const [nytt, setNytt] = useState(false);
  const [apen, setApen] = useState<string | null>(null);
  const [feil, setFeil] = useState("");
  const [kvittering, setKvittering] = useState("");
  const [venter, start] = useTransition();

  const kjor = (handling: () => Promise<Svar>, skjema?: HTMLFormElement) =>
    start(async () => {
      const res = await handling();
      if (res.ok) {
        setFeil("");
        setKvittering(res.melding ?? "");
        skjema?.reset();
      } else {
        setKvittering("");
        setFeil(res.feil);
      }
    });

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <p className="text-[12.5px] text-dim leading-relaxed max-w-[64ch]">
          {t.forklaring}
        </p>
        <button
          type="button"
          className={nytt ? KNAPP_MILD : KNAPP}
          onClick={() => setNytt(!nytt)}
        >
          {nytt ? ordbok.felles.avbryt : t.nyAnskaffelse}
        </button>
      </div>

      {nytt && (
        <div className="bg-surface rounded-card border border-border shadow-card p-5 mb-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const skjema = e.currentTarget;
              const fd = new FormData(skjema);
              kjor(() => nyAnskaffelse(fd), skjema);
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3.5 mb-4">
              <Felt navn="saksnummer" merke={t.saksnummer} krav plassholder="K-2026-118" />
              <Felt navn="navn" merke={t.navn} krav plassholder={t.navnPlassholder} />
              <Felt navn="konkurranseform" merke={t.konkurranseform} plassholder={t.formPlassholder} />
              <Felt navn="verdi" merke={t.verdi} plassholder="4,2 mill. NOK" />
              <Felt navn="periode" merke={t.periode} plassholder="2026–2030" />
            </div>
            <button type="submit" disabled={venter} className={KNAPP}>
              {venter ? ordbok.felles.lagrer : ordbok.felles.lagre}
            </button>
          </form>
        </div>
      )}

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">{feil}</div>
      )}
      {kvittering && (
        <div className="text-xs text-good bg-good-bg rounded-xl px-3.5 py-2.5 mb-3">
          {kvittering}
        </div>
      )}

      {anskaffelser.length === 0 ? (
        <div className="bg-surface rounded-card border border-border shadow-card px-5 py-12 text-center">
          <p className="text-sm text-dim">{t.ingenEnna}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anskaffelser.map((a) => {
            const apenNa = apen === a.id;
            return (
              <div
                key={a.id}
                className="bg-surface rounded-card border border-border shadow-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setApen(apenNa ? null : a.id)}
                  aria-expanded={apenNa}
                  className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-canvas transition"
                >
                  <span className="min-w-0">
                    <span className="font-mono text-[12px] text-accent">{a.saksnummer}</span>
                    <span className="block text-[13.5px] font-semibold truncate">{a.navn}</span>
                    <span className="block text-[11.5px] text-faint">
                      {[a.konkurranseform, a.verdi, a.periode].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <Merke tone={a.tilbud.length ? "aksent" : "noytral"}>
                      {a.tilbud.length} {a.tilbud.length === 1 ? t.etTilbud : t.flereTilbud}
                    </Merke>
                    <span className="text-[11.5px] text-faint">
                      {apenNa ? ordbok.felles.skjul : ordbok.felles.vis}
                    </span>
                  </span>
                </button>

                {apenNa && (
                  <div className="px-5 py-5 border-t border-border">
                    {a.tilbud.length > 0 && (
                      <div className="mb-4">
                        <Tabell
                          kolonner={[t.tilbyder, t.sum, ""]}
                          rader={[...a.tilbud]
                            .sort((x, y) => x.sum - y.sum)
                            .map((b) => [
                              <span key="n" className="text-[13px] font-semibold">
                                {b.leverandor_navn}
                              </span>,
                              <span key="s" className="tabular-nums whitespace-nowrap">
                                {NOK(b.sum)}
                              </span>,
                              <button
                                key="f"
                                type="button"
                                disabled={venter}
                                onClick={() => kjor(() => fjernTilbud(b.id))}
                                className="text-[12px] text-faint hover:text-bad transition disabled:opacity-40"
                              >
                                {ordbok.felles.fjern}
                              </button>,
                            ])}
                        />
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const skjema = e.currentTarget;
                        const fd = new FormData(skjema);
                        fd.set("anskaffelse_id", a.id);
                        kjor(() => nyttTilbud(fd), skjema);
                      }}
                    >
                      <div className="flex gap-3 flex-wrap items-end">
                        <div className="flex-1 min-w-[170px]">
                          <label className="block text-xs font-semibold mb-1.5">
                            {t.tilbyder}
                          </label>
                          <input name="leverandor_navn" required className={INPUT} />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-xs font-semibold mb-1.5">
                            {t.sum}
                          </label>
                          <input
                            name="sum"
                            required
                            inputMode="decimal"
                            placeholder="21 400 000"
                            className={`${INPUT} tabular-nums`}
                          />
                        </div>
                        <div className="flex-1 min-w-[170px]">
                          <label className="block text-xs font-semibold mb-1.5">
                            {t.epost} <span className="text-faint font-normal">({ordbok.felles.valgfritt})</span>
                          </label>
                          <input name="leverandor_epost" type="email" className={INPUT} />
                        </div>
                        <button type="submit" disabled={venter} className={KNAPP}>
                          {venter ? ordbok.felles.lagrer : t.leggTilTilbud}
                        </button>
                      </div>
                    </form>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-4 flex-wrap">
                      <p className="text-[11.5px] text-faint max-w-[54ch] leading-relaxed">
                        {t.medianForklaring}
                      </p>
                      <button
                        type="button"
                        disabled={venter}
                        onClick={() => kjor(() => fjernAnskaffelse(a.id))}
                        className="text-[12px] text-faint hover:text-bad transition disabled:opacity-40"
                      >
                        {t.fjernAnskaffelse}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Felt({
  navn, merke, krav = false, plassholder,
}: {
  navn: string; merke: string; krav?: boolean; plassholder?: string;
}) {
  return (
    <div>
      <label htmlFor={navn} className="block text-xs font-semibold mb-1.5">
        {merke}
      </label>
      <input
        id={navn}
        name={navn}
        required={krav}
        placeholder={plassholder}
        className={`${INPUT} max-w-none`}
      />
    </div>
  );
}
