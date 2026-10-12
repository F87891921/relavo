"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrd } from "@/components/Sprakgiver";
import { RelavoMark } from "@/components/RelavoMark";
import { FELT_FULL } from "@/components/ui/felt";
import { KRAV } from "@/lib/passord";
import { BEDRIFT, kr } from "@/lib/priser";
import { opprettKonto } from "./handlinger";

type Treff = { kode: string; navn: string; innbyggere: number; niva: "liten" | "kommune" | "medelstor" | "stor"; mnd: number | null };
type Selskapsplan = "start" | "vekst" | "bygg";

/**
 * Registreringen som tre steg: hvem, om dem, og til slutt kontoen.
 *
 * Kontoen kommer sist. Det vi trenger for å regne ut prisen — kommune eller
 * selskap og hvor stort — spør vi om først, så man ser hva det koster før
 * man har oppgitt e-post. Hele skjemaet sendes samlet til serveren først i
 * siste steg; ingenting lagres før det.
 */
export function Veiviser({ forvalgt }: { forvalgt?: string }) {
  const o = useOrd();
  const v = o.registreringsveiviser;
  const t = o.landing.priser;
  const router = useRouter();

  const erSelskapPlan = forvalgt === "start" || forvalgt === "vekst" || forvalgt === "bygg";
  const erEngangs = forvalgt === "engangs";
  const [steg, setSteg] = useState(erSelskapPlan || erEngangs ? 2 : 1);
  const [type, setType] = useState<"kommune" | "selskap" | "engangs">(erSelskapPlan ? "selskap" : erEngangs ? "engangs" : "kommune");

  const [q, setQ] = useState("");
  const [treff, setTreff] = useState<Treff[]>([]);
  const [kommune, setKommune] = useState<Treff | null>(null);
  const teller = useRef(0);

  const [selskap, setSelskap] = useState("");
  const [orgnr, setOrgnr] = useState("");
  const [plan, setPlan] = useState<Selskapsplan>(erSelskapPlan ? (forvalgt as Selskapsplan) : "vekst");

  const [person, setPerson] = useState("");
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  useEffect(() => {
    if (type !== "kommune" || (kommune && q === kommune.navn)) return;
    if (q.trim().length < 2) return setTreff([]);
    const mitt = ++teller.current;
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/kommune?q=${encodeURIComponent(q)}`);
        if (r.ok && mitt === teller.current) setTreff((await r.json()).treff);
      } catch {}
    }, 220);
    return () => clearTimeout(id);
  }, [q, type, kommune]);

  const status = KRAV.map((k) => ({ ...k, ok: k.oppfylt(passord, epost) }));
  const kontoKlar = person.trim() && epost.includes("@") && passord.length > 0 && status.every((k) => k.ok);
  const detaljerKlar =
    type === "kommune" ? Boolean(kommune && kommune.niva !== "stor") : selskap.trim().length > 1;
  const stor = type === "kommune" && kommune?.niva === "stor";

  const niva = kommune ? t.nivaer[kommune.niva] : null;
  const sammendrag =
    type === "kommune" && kommune && niva && kommune.mnd !== null
      ? v.sammendragKommune
          .replace("{navn}", /kommune/i.test(kommune.navn) ? kommune.navn : `${kommune.navn} kommune`)
          .replace("{niva}", niva.navn)
          .replace("{pris}", kr(kommune.mnd))
      : type === "engangs"
        ? v.sammendragEngangs
        : type === "selskap"
        ? v.sammendragSelskap
            .replace("{niva}", t.bedrift.nivaer[plan].navn)
            .replace("{pris}", kr(BEDRIFT.find((b) => b.id === plan)!.mnd!))
        : "";

  function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeil("");
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await opprettKonto(fd);
      if (!r.ok) return setFeil(r.feil);
      router.push(r.neste);
      router.refresh();
    });
  }

  const knapp =
    "w-full bg-accent hover:bg-accent-hover active:scale-[0.99] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40";
  const valg = (på: boolean) =>
    `w-full text-left rounded-card border px-4 py-3.5 transition ${
      på ? "border-accent ring-[3px] ring-accent-light bg-surface" : "border-border hover:border-border-strong bg-surface"
    }`;

  return (
    <div className="min-h-screen bg-surface px-4 py-[8vh]">
      <div className="w-full max-w-[440px] mx-auto">
        <div className="text-center mb-6">
          <RelavoMark className="w-11 h-auto mx-auto mb-3 text-accent" />
          <ol className="flex justify-center gap-2 text-[11.5px] font-semibold mb-4">
            {v.steg.map((s, i) => (
              <li
                key={s}
                className={`px-2.5 py-1 rounded-full ${
                  i + 1 === steg ? "bg-accent-light text-accent" : i + 1 < steg ? "text-good" : "text-faint"
                }`}
              >
                {i + 1 < steg ? "✓ " : `${i + 1}. `}
                {s}
              </li>
            ))}
          </ol>
        </div>

        <form className="bg-surface rounded-2xl shadow-lift px-6 py-6" onSubmit={send}>
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="plan" value={type === "engangs" ? "engangs" : plan} />
          <input type="hidden" name="kommunekode" value={kommune?.kode ?? ""} />
          <input type="hidden" name="orgnavn" value={selskap} />
          <input type="hidden" name="orgnr" value={orgnr} />
          <input type="hidden" name="person" value={person} />

          {steg === 1 && (
            <>
              <h1 className="text-[19px] font-semibold tracking-tight mb-4 text-center">{v.hvem}</h1>
              <div className="space-y-2.5 mb-5">
                {(["kommune", "selskap", "engangs"] as const).map((m) => (
                  <button key={m} type="button" className={valg(type === m)} onClick={() => setType(m)}>
                    <span className="block text-[14px] font-semibold">{m === "kommune" ? v.kommuneT : m === "selskap" ? v.selskapT : v.engangsT}</span>
                    <span className="block text-[12.5px] text-dim mt-0.5">{m === "kommune" ? v.kommuneB : m === "selskap" ? v.selskapB : v.engangsB}</span>
                  </button>
                ))}
              </div>
              <button type="button" className={knapp} onClick={() => setSteg(2)}>
                {v.fortsett}
              </button>
            </>
          )}

          {steg === 2 && type === "kommune" && (
            <>
              <label htmlFor="vk" className="block text-[15px] font-semibold mb-1">{v.finnKommune}</label>
              <p className="text-[12.5px] text-dim mb-3">{v.kommuneHjelp}</p>
              <input
                id="vk"
                autoComplete="off"
                value={q}
                placeholder={t.sok.plassholder}
                onChange={(e) => {
                  setQ(e.target.value);
                  setKommune(null);
                }}
                className={`${FELT_FULL} max-w-none`}
              />
              {treff.length > 0 && !kommune && (
                <ul className="mt-2 border border-border rounded-xl overflow-hidden">
                  {treff.map((k) => (
                    <li key={k.kode}>
                      <button
                        type="button"
                        className="w-full flex justify-between gap-3 px-3.5 py-2.5 text-[13.5px] hover:bg-canvas text-left"
                        onClick={() => {
                          setKommune(k);
                          setQ(k.navn);
                          setTreff([]);
                        }}
                      >
                        <span>{k.navn}</span>
                        <span className="text-faint text-[12.5px]">
                          {kr(k.innbyggere)} {t.sok.innbyggere}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {kommune && niva && (
                <div className="mt-3 rounded-xl bg-canvas px-4 py-3 text-[13px]">
                  <b>{niva.navn}</b> · {niva.spenn}
                  {kommune.mnd !== null && (
                    <div className="mt-0.5 text-dim">
                      {kr(kommune.mnd)} NOK {t.sok.perMnd}
                    </div>
                  )}
                </div>
              )}
              {stor ? (
                <div className="mt-3 text-[12.5px] text-dim leading-relaxed">
                  {v.stor}{" "}
                  <Link href={`/kontakt?om=priser&kommune=${encodeURIComponent(kommune!.navn)}`} className="text-accent font-semibold">
                    {v.storKnapp}
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-faint leading-relaxed">{v.faktura}</p>
              )}
              <div className="flex gap-2 mt-5">
                <button type="button" className="px-4 text-[13px] font-semibold text-dim" onClick={() => setSteg(1)}>
                  {v.tilbake}
                </button>
                <button type="button" className={knapp} disabled={!detaljerKlar} onClick={() => setSteg(3)}>
                  {v.fortsett}
                </button>
              </div>
            </>
          )}

          {steg === 2 && type !== "kommune" && (
            <>
              <h1 className="text-[15px] font-semibold mb-3">{v.omSelskapet}</h1>
              <label htmlFor="vs" className="block text-xs font-semibold mb-1.5">{v.selskapsnavn}</label>
              <input id="vs" value={selskap} onChange={(e) => setSelskap(e.target.value)} className={`${FELT_FULL} max-w-none mb-3.5`} />
              <label htmlFor="vo" className="block text-xs font-semibold mb-1.5">{v.orgnrValg}</label>
              <input id="vo" inputMode="numeric" value={orgnr} onChange={(e) => setOrgnr(e.target.value)} placeholder="964 338 531" className={`${FELT_FULL} max-w-none mb-5`} />
              {type === "selskap" && <div className="text-xs font-semibold mb-2">{v.levSpm}</div>}
              {type === "selskap" && <div className="space-y-2 mb-5">
                {BEDRIFT.filter((b) => b.mnd !== null).map((b) => (
                  <button key={b.id} type="button" className={valg(plan === b.id)} onClick={() => setPlan(b.id as Selskapsplan)}>
                    <span className="flex justify-between gap-3 text-[13.5px]">
                      <span>
                        <b>{t.bedrift.nivaer[b.id].navn}</b> · {t.bedrift.nivaer[b.id].spenn}
                      </span>
                      <span className="font-semibold">{kr(b.mnd!)} {v.perMnd}</span>
                    </span>
                  </button>
                ))}
              </div>}
              <div className="flex gap-2">
                <button type="button" className="px-4 text-[13px] font-semibold text-dim" onClick={() => setSteg(1)}>
                  {v.tilbake}
                </button>
                <button type="button" className={knapp} disabled={!detaljerKlar} onClick={() => setSteg(3)}>
                  {v.fortsett}
                </button>
              </div>
            </>
          )}

          {steg === 3 && (
            <>
              <h1 className="text-[15px] font-semibold mb-1">{v.opprettKonto}</h1>
              {sammendrag && <p className="text-[12.5px] text-dim mb-4">{v.sammendrag}: {sammendrag}</p>}
              <label htmlFor="vp" className="block text-xs font-semibold mb-1.5">{v.ditt}</label>
              <input id="vp" value={person} onChange={(e) => setPerson(e.target.value)} autoComplete="name" className={`${FELT_FULL} max-w-none mb-3.5`} />

              <label htmlFor="epost" className="block text-xs font-semibold mb-1.5">{o.auth.epost}</label>
              <input id="epost" name="epost" type="email" required autoComplete="email" value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="navn@firma.no" className={`${FELT_FULL} max-w-none mb-3.5`} />

              <label htmlFor="passord" className="block text-xs font-semibold mb-1.5">{o.auth.passord}</label>
              <input id="passord" name="passord" type="password" required autoComplete="new-password" value={passord} onChange={(e) => setPassord(e.target.value)} className={`${FELT_FULL} max-w-none`} />
              <ul className="mt-3 mb-4 space-y-1">
                {status.map((k) => (
                  <li key={k.id} className={`text-[11.5px] flex items-center gap-1.5 transition ${k.ok ? "text-good" : "text-faint"}`}>
                    <span className="w-3 shrink-0 text-center">{k.ok ? "✓" : "·"}</span>
                    {k.tekst}
                  </li>
                ))}
              </ul>

              {feil && <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3 leading-relaxed">{feil}</div>}

              <div className="flex gap-2">
                <button type="button" className="px-4 text-[13px] font-semibold text-dim" onClick={() => setSteg(2)}>
                  {v.tilbake}
                </button>
                <button type="submit" disabled={venter || !kontoKlar} className={knapp}>
                  {venter ? o.felles.sender : type === "kommune" ? v.knappKommune : v.knappSelskap}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-[12.5px] text-dim text-center mt-4">
          {o.registrering.harKonto}{" "}
          <Link href="/logg-inn" className="text-accent hover:underline">{o.auth.loggInn}</Link>
        </p>
      </div>
    </div>
  );
}
