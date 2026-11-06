"use client";

import { useState, useTransition } from "react";
import { Merke } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { useOrd } from "@/components/Sprakgiver";
import { oppdaterAvvik } from "@/app/(dashboard)/avvik/handlinger";

export type Avvik = {
  id: string;
  leverandor: string;
  slag: string;
  alvor: "kritisk" | "advarsel" | "info";
  fra: string | null;
  til: string | null;
  oppdaget: string;
  status: "ny" | "under_behandling" | "avklart";
  ansvarlig: string | null;
  kommentar: string | null;
  behandlet: string | null;
  behandletAv: string | null;
};
export type Medlem = { id: string; navn: string };

const TONE = { kritisk: "brudd", advarsel: "advarsel", info: "noytral" } as const;

export function AvvikListe({ avvik, medlemmer }: { avvik: Avvik[]; medlemmer: Medlem[] }) {
  const o = useOrd();
  const t = o.avvik;
  const apne = avvik.filter((a) => a.status !== "avklart");
  const avklarte = avvik.filter((a) => a.status === "avklart");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[13px] font-semibold mb-3">{t.apne} ({apne.length})</h2>
        {apne.length === 0 ? (
          <div className="bg-surface rounded-card shadow-card px-5 py-8 text-center text-dim text-sm">{t.ingenApne}</div>
        ) : (
          <div className="space-y-3">
            {apne.map((a) => (
              <Rad key={a.id} a={a} medlemmer={medlemmer} />
            ))}
          </div>
        )}
      </section>

      {avklarte.length > 0 && (
        <section>
          <h2 className="text-[13px] font-semibold mb-3 text-dim">{t.avklarteTittel} ({avklarte.length})</h2>
          <div className="space-y-3">
            {avklarte.map((a) => (
              <Rad key={a.id} a={a} medlemmer={medlemmer} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Rad({ a, medlemmer }: { a: Avvik; medlemmer: Medlem[] }) {
  const o = useOrd();
  const t = o.avvik;
  const verb = (o.epost.overvaking.hendelser as Record<string, string>)[a.slag] ?? a.slag;
  const [status, setStatus] = useState(a.status);
  const [ansvarlig, setAnsvarlig] = useState(a.ansvarlig ?? "");
  const [kommentar, setKommentar] = useState(a.kommentar ?? "");
  const [melding, setMelding] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();
  const navnPa = (id: string | null) => medlemmer.find((m) => m.id === id)?.navn ?? "";
  const dato = (s: string) => new Date(s).toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" });

  const statusNavn: Record<Avvik["status"], string> = {
    ny: t.ny,
    under_behandling: t.underBehandling,
    avklart: t.avklart,
  };

  return (
    <div className="bg-surface rounded-card shadow-card px-4 sm:px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-[14px] font-semibold">{a.leverandor}</span>
        <Merke tone={TONE[a.alvor]}>{verb}</Merke>
        <span className="text-[12px] text-faint">{t.oppdaget} {dato(a.oppdaget)}</span>
      </div>
      {(a.fra || a.til) && (
        <p className="text-[12.5px] text-dim mt-1.5">
          {t.fraTil.replace("{fra}", a.fra ?? "—").replace("{til}", a.til ?? "—")}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <label className="block">
          <span className="block text-[11.5px] font-semibold mb-1">{t.status}</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Avvik["status"])} className={`${FELT_FULL} max-w-none`}>
            {(["ny", "under_behandling", "avklart"] as const).map((s) => (
              <option key={s} value={s}>{statusNavn[s]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11.5px] font-semibold mb-1">{t.ansvarlig}</span>
          <select value={ansvarlig} onChange={(e) => setAnsvarlig(e.target.value)} className={`${FELT_FULL} max-w-none`}>
            <option value="">{t.ingenAnsvarlig}</option>
            {medlemmer.map((m) => (
              <option key={m.id} value={m.id}>{m.navn}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block mt-3">
        <span className="block text-[11.5px] font-semibold mb-1">{t.kommentar}</span>
        <textarea
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder={t.kommentarHjelp}
          className={`${FELT_FULL} max-w-none resize-y`}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button
          type="button"
          disabled={venter}
          onClick={() =>
            start(async () => {
              setMelding("");
              setFeil("");
              const r = await oppdaterAvvik(a.id, status, ansvarlig, kommentar);
              if (r.ok) setMelding(t.lagret);
              else setFeil(r.feil);
            })
          }
          className="text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-accent text-white disabled:opacity-40"
        >
          {venter ? o.felles.sender : t.lagre}
        </button>
        {melding && <span className="text-[12px] text-good" role="status">{melding}</span>}
        {feil && <span className="text-[12px] text-bad">{feil}</span>}
        {a.behandlet && (
          <span className="text-[12px] text-faint">
            {t.avklartAv.replace("{dato}", dato(a.behandlet)).replace("{navn}", navnPa(a.behandletAv) || "—")}
          </span>
        )}
      </div>
    </div>
  );
}
