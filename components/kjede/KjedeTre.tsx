"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Merke } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { useOrd } from "@/components/Sprakgiver";
import { leggTilLedd, fjernLedd, beOmKjede } from "@/app/(dashboard)/kjede/handlinger";

export type Ledd = {
  id: string;
  forelderId: string | null;
  niva: number;
  navn: string;
  org: string;
  merknader: string[];
  kartlegging: "ukjent" | "venter" | "besvart" | "ingen" | "ikke_svart";
};

export type Kjede = { kontrollId: string; navn: string; org: string; ledd: Ledd[] };

/** Dypeste gren, regnet fra hovedleverandøren (niva 0). */
export const dybde = (ledd: Ledd[]) => ledd.reduce((m, l) => Math.max(m, l.niva), 0);

/**
 * Leverandørkjeden som et tre. Hovedleverandøren er roten, og hvert ledd kan
 * ha flere underleverandører. Grensen (§ 5k for kommuner, eller selskapets
 * egen) gjelder dybden, ikke antallet selskaper, og leddene under grensen
 * tegnes røde.
 */
export function KjedeTre({ kjede, grense }: { kjede: Kjede; grense: number | null }) {
  const k = useOrd().kjede;
  const d = dybde(kjede.ledd);
  const over = grense !== null && d > grense;
  const barn = (id: string | null) => kjede.ledd.filter((l) => l.forelderId === id);
  const rot = kjede.ledd.find((l) => l.niva === 0);

  return (
    <div className="bg-surface rounded-card shadow-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-border">
        <span className="text-[13.5px] font-semibold">{kjede.navn}</span>
        <span className="flex items-center gap-2">
          <Merke tone={over ? "brudd" : "god"}>
            {d} {k.ledd}
            {grense !== null && ` · ${k.grensenEr} ${grense}`}
          </Merke>
          <span className="text-[11.5px] text-faint">{kjede.ledd.length - 1} {k.selskaper}</span>
        </span>
      </div>
      <div className="px-4 sm:px-5 py-5 overflow-x-auto">
        {rot ? <Node l={rot} kjede={kjede} grense={grense} barn={barn} /> : <Tom kontrollId={kjede.kontrollId} />}
        {over && (
          <div className="bg-bad-bg text-bad rounded-xl px-3.5 py-3 text-[12.5px] leading-relaxed mt-5">
            <b>{k.bruddTittel}</b> {k.kjedenHar} {d} {k.grensenEr} {grense}. {k.bruddTekst}
          </div>
        )}
      </div>
    </div>
  );
}

function Tom({ kontrollId }: { kontrollId: string }) {
  return <div className="text-[13px] text-dim">—<LeggTil kontrollId={kontrollId} forelderId={null} /></div>;
}

function Node({ l, kjede, grense, barn }: { l: Ledd; kjede: Kjede; grense: number | null; barn: (id: string | null) => Ledd[] }) {
  const k = useOrd().kjede;
  const router = useRouter();
  const [apen, setApen] = useState<"ingen" | "legg" | "be">("ingen");
  const [epost, setEpost] = useState("");
  const [lenke, setLenke] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();
  const under = grense !== null && l.niva > grense;
  const barna = barn(l.id);
  const status: Record<Ledd["kartlegging"], { tekst: string; tone: "noytral" | "advarsel" | "god" | "brudd" }> = {
    ukjent: { tekst: k.statusUkjent, tone: "noytral" },
    venter: { tekst: k.statusVenter, tone: "advarsel" },
    besvart: { tekst: k.statusBesvart, tone: "god" },
    ingen: { tekst: k.statusIngen, tone: "god" },
    ikke_svart: { tekst: k.statusIkkeSvart, tone: "brudd" },
  };
  const s = status[l.kartlegging];

  return (
    <div>
      <div
        className={`inline-block max-w-full rounded-xl px-3.5 py-2.5 align-top ${
          under ? "border-[1.5px] border-dashed border-bad bg-bad-bg" : l.niva === 0 ? "bg-surface shadow-card ring-[1.5px] ring-accent" : "bg-canvas border border-border"
        }`}
      >
        <div className={`text-[9px] font-bold uppercase tracking-wide ${under ? "text-bad" : l.niva === 0 ? "text-accent" : "text-faint"}`}>
          {l.niva === 0 ? k.hovedleverandor : `${k.leddNr} ${l.niva}`}
        </div>
        <div className="text-[12.5px] font-semibold mt-0.5 leading-tight">{l.navn}</div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {l.merknader
            .filter((m) => m !== "sanksjon_ikke_sjekket")
            .map((m) => (
              <Merke key={m} tone="brudd">{(k.merknad as Record<string, string>)[m] ?? m}</Merke>
            ))}
          {l.kartlegging !== "ukjent" || l.niva > 0 || barna.length === 0 ? <Merke tone={s.tone}>{s.tekst}</Merke> : null}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11.5px]">
          <button type="button" onClick={() => setApen(apen === "legg" ? "ingen" : "legg")} className="text-accent font-semibold hover:underline">
            + {k.underleverandor}
          </button>
          {l.kartlegging === "ukjent" || l.kartlegging === "ikke_svart" ? (
            <button type="button" onClick={() => setApen(apen === "be" ? "ingen" : "be")} className="text-accent font-semibold hover:underline">
              {k.beOm}
            </button>
          ) : null}
          {l.niva > 0 && (
            <button
              type="button"
              disabled={venter}
              onClick={() => start(async () => { const r = await fjernLedd(l.id); if (!r.ok) setFeil(r.feil); else router.refresh(); })}
              className="text-dim hover:underline"
            >
              {k.fjern}
            </button>
          )}
        </div>

        {apen === "legg" && <LeggTil kontrollId={kjede.kontrollId} forelderId={l.id} onFerdig={() => setApen("ingen")} />}

        {apen === "be" && (
          <div className="mt-3 pt-3 border-t border-border max-w-[320px]">
            <label className="block text-[11.5px] font-semibold mb-1">{k.beOmEpost}</label>
            <input value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="post@selskap.no" className={`${FELT_FULL} max-w-none mb-2`} />
            <button
              type="button"
              disabled={venter}
              onClick={() =>
                start(async () => {
                  setFeil("");
                  const r = await beOmKjede(l.id, epost);
                  if (!r.ok) return setFeil(r.feil);
                  setLenke(r.lenke ?? "");
                  setApen("ingen");
                  router.refresh();
                })
              }
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-accent text-white disabled:opacity-40"
            >
              {epost ? k.sendForesporsel : k.lagLenke}
            </button>
          </div>
        )}
        {lenke && (
          <div className="mt-2 text-[11.5px] break-all bg-surface rounded-lg px-2.5 py-2 border border-border">
            {k.lenkeTekst} <span className="font-mono">{lenke}</span>
          </div>
        )}
        {feil && <div className="text-[11.5px] text-bad mt-2">{feil}</div>}
      </div>

      {barna.length > 0 && (
        <div className="ml-4 sm:ml-6 mt-2 pl-4 sm:pl-5 border-l-[1.5px] border-border-strong space-y-2.5">
          {barna.map((b) => (
            <Node key={b.id} l={b} kjede={kjede} grense={grense} barn={barn} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeggTil({ kontrollId, forelderId, onFerdig }: { kontrollId: string; forelderId: string | null; onFerdig?: () => void }) {
  const k = useOrd().kjede;
  const router = useRouter();
  const [orgnr, setOrgnr] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();
  return (
    <div className="mt-3 pt-3 border-t border-border max-w-[320px]">
      <label className="block text-[11.5px] font-semibold mb-1">{k.neste}</label>
      <div className="flex gap-2">
        <input inputMode="numeric" value={orgnr} placeholder={k.orgnrPlassholder} onChange={(e) => setOrgnr(e.target.value)} className={`${FELT_FULL} max-w-none`} />
        <button
          type="button"
          disabled={venter || orgnr.replace(/\D/g, "").length < 9}
          onClick={() =>
            start(async () => {
              setFeil("");
              const r = await leggTilLedd(kontrollId, forelderId, orgnr);
              if (!r.ok) return setFeil(r.feil);
              setOrgnr("");
              onFerdig?.();
              router.refresh();
            })
          }
          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-accent text-white disabled:opacity-40 whitespace-nowrap"
        >
          {k.leggTil}
        </button>
      </div>
      {feil && <div className="text-[11.5px] text-bad mt-1.5">{feil}</div>}
    </div>
  );
}

/** Velg en leverandør du har kontrollert og begynn kjeden. */
export function NyKjede({ leverandorer }: { leverandorer: { kontrollId: string; navn: string }[] }) {
  const k = useOrd().kjede;
  const [valgt, setValgt] = useState(leverandorer[0]?.kontrollId ?? "");
  if (!leverandorer.length) return null;
  return (
    <div className="bg-surface rounded-card shadow-card px-4 sm:px-5 py-5 mb-5">
      <h2 className="text-[14px] font-semibold mb-1">{k.nyTittel}</h2>
      <p className="text-[12.5px] text-dim leading-relaxed mb-4 max-w-[70ch]">{k.forklaring}</p>
      <label className="block text-[11.5px] font-semibold mb-1">{k.velgLeverandor}</label>
      <select value={valgt} onChange={(e) => setValgt(e.target.value)} className={`${FELT_FULL} max-w-[420px] mb-1`}>
        {leverandorer.map((l) => (
          <option key={l.kontrollId} value={l.kontrollId}>{l.navn}</option>
        ))}
      </select>
      <LeggTil key={valgt} kontrollId={valgt} forelderId={null} />
    </div>
  );
}
