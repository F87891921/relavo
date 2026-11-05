"use client";

import { useEffect, useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { bestill, sjekkRabatt, type RabattSvar } from "./handlinger";
import { BEDRIFT, NIVAER, kr, mndBedrift, mndFor, type Lopetid } from "@/lib/priser";

const PLANER = [
  { verdi: "liten", pris: "3 900", enhet: "NOK/mnd" },
  { verdi: "kommune", pris: "7 900", enhet: "NOK/mnd", anbefalt: true },
  { verdi: "medelstor", pris: "12 900", enhet: "NOK/mnd" },
  { verdi: "engangs", pris: "890", enhet: "NOK" },
  { verdi: "start", pris: "2 900", enhet: "NOK/mnd", selskap: true },
  { verdi: "vekst", pris: "5 900", enhet: "NOK/mnd", selskap: true },
  { verdi: "bygg", pris: "11 900", enhet: "NOK/mnd", selskap: true },
];

/**
 * Plan og betalingsmåte i ett steg.
 *
 * Faktura står først og er forhåndsvalgt. Det er ikke tilfeldig: kundene er
 * norske kommuner, og offentlig sektor betaler mot faktura — EHF er
 * lovpålagt for leverandører til det offentlige. Kort er unntaket, for de
 * private kundene på engangsplanen.
 *
 * Er Stripe ikke koblet på, vises kortvalget som avslått med grunn i stedet
 * for å ligge der og se ut som om det virker.
 */
export function Valg({ kortMulig }: { kortMulig: boolean }) {
  const o = useOrd();
  const [plan, setPlan] = useState("kommune");
  const [mate, setMate] = useState<"kort" | "faktura">("faktura");
  // Kommuner betaler alltid mot faktura; kort er for selskap og enkeltkontroll.
  const [binding, setBinding] = useState(12);
  // Flerårsavtaler faktureres; kort er månedlig eller ett år om gangen.
  const kortTillatt = ["engangs", "start", "vekst", "bygg"].includes(plan) && binding < 24;
  const [intervall, setIntervall] = useState<"month" | "year">("month");
  const [feil, setFeil] = useState("");
  const [kode, setKode] = useState("");
  // Rabatten kunden har fått bekreftet. Gjelder bare for plan og intervall den ble
  // sjekket mot; endres de, nullstilles den så beløpet aldri står feil.
  const [rabatt, setRabatt] = useState<(RabattSvar & { ok: true }) | null>(null);
  const [kodeFeil, setKodeFeil] = useState("");
  const [sjekker, sjekk] = useTransition();
  useEffect(() => {
    setRabatt(null);
    setKodeFeil("");
  }, [plan, intervall, mate]);
  const [venter, start] = useTransition();

  const t = o.landing.priser;

  // Nivået følger med fra prisfinneren på forsiden.
  useEffect(() => {
    const fra = new URLSearchParams(window.location.search).get("plan");
    if (fra && PLANER.some((x) => x.verdi === fra)) setPlan(fra);
    const mnd = Number(new URLSearchParams(window.location.search).get("mnd"));
    if ([1, 12, 24, 36].includes(mnd)) setBinding(mnd);
    if (mnd === 1) {
      setMate("kort");
      setIntervall("month");
    }
  }, []);

  const erSelskap = (v: string) => ["start", "vekst", "bygg"].includes(v);
  const [maltype, setMaltype] = useState<"kommune" | "selskap">("kommune");
  useEffect(() => {
    const fra = new URLSearchParams(window.location.search).get("plan");
    if (fra && erSelskap(fra)) setMaltype("selskap");
  }, []);
  // Selskap som betaler med kort ser prisen for valgt trekkintervall.
  // Kroner per måned for raden ved valgt avtaletid. Før viste kortene alltid
  // 12-månedersprisen, også når kunden hadde valgt 24 eller 36 måneder.
  const prisM = (rad: { verdi: string }): number | null => {
    if (rad.verdi === "engangs") return null;
    const b = BEDRIFT.find((x) => x.id === rad.verdi);
    if (b) {
      if (mate === "kort") return mndBedrift(b, intervall === "month" ? 1 : 12);
      return mndBedrift(b, binding as 1 | 12 | 24 | 36);
    }
    const n = NIVAER.find((x) => x.id === rad.verdi);
    return n ? mndFor(n, (binding === 1 ? 12 : binding) as Lopetid) : null;
  };
  const visPris = (rad: { verdi: string; pris: string; selskap?: boolean }) => {
    const m = prisM(rad);
    return m === null ? rad.pris : kr(m);
  };

  const navn = (v: string) =>
    v === "engangs"
      ? t.enkelt.navn
      : erSelskap(v)
        ? t.bedrift.nivaer[v as "start" | "vekst" | "bygg"].navn
        : t.nivaer[v as "liten" | "kommune" | "medelstor"].navn;
  const spenn = (v: string) =>
    v === "engangs"
      ? t.enkelt.tekst
      : erSelskap(v)
        ? t.bedrift.nivaer[v as "start" | "vekst" | "bygg"].spenn
        : t.nivaer[v as "liten" | "kommune" | "medelstor"].spenn;

  return (
    <>
      <div className="flex gap-2 mb-3" role="group">
        {(["kommune", "selskap"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={maltype === m}
            onClick={() => {
              setMaltype(m);
              setPlan(m === "kommune" ? "kommune" : "vekst");
            }}
            className={`text-[13px] font-semibold px-4 py-1.5 rounded-xl border transition ${
              maltype === m ? "border-accent bg-accent-light text-accent" : "border-border text-dim hover:border-border-strong"
            }`}
          >
            {t.maltype[m]}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {PLANER.filter((r) => r.verdi === "engangs" || Boolean((r as { selskap?: boolean }).selskap) === (maltype === "selskap")).map((rad) => {
          const valgt = plan === rad.verdi;
          return (
            <button
              key={rad.verdi}
              type="button"
              onClick={() => setPlan(rad.verdi)}
              aria-pressed={valgt}
              className={`text-left rounded-card border px-4 py-4 transition ${
                valgt
                  ? "border-accent ring-[3px] ring-accent-light bg-surface"
                  : "border-border hover:border-border-strong bg-surface"
              }`}
            >
              <div className="text-[14px] font-semibold">{navn(rad.verdi)}</div>
              <div className="text-[19px] font-bold tracking-tight mt-1">
                {visPris(rad)}{" "}
                <span className="text-[12px] font-medium text-dim">{rad.enhet}</span>
              </div>
              <div className="text-[10.5px] text-faint mt-0.5">
                {o.internt.eksMva}
              </div>
              {prisM(rad) !== null && (
                <div className="text-[12px] text-dim mt-1">
                  {kr(prisM(rad)! * 12)} NOK {t.sok.perAr}
                  {binding > 12 && !(mate === "kort") && (
                    <> · {t.sok.totalt.replace("{mnd}", String(binding)).replace("{sum}", kr(prisM(rad)! * binding))}</>
                  )}
                </div>
              )}
              <p className="text-[12px] text-dim leading-snug mt-2">
                {spenn(rad.verdi)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5 mb-6">
        <Mate
          valgt={mate === "faktura"}
          onVelg={() => setMate("faktura")}
          tittel={o.betaling.faktura}
          tekst={o.betaling.fakturaTekst}
        />
        <Mate
          valgt={mate === "kort"}
          onVelg={() => kortMulig && kortTillatt && setMate("kort")}
          av={!kortMulig || !kortTillatt}
          tittel={o.betaling.kort}
          tekst={!kortTillatt ? (binding >= 24 && erSelskap(plan) ? o.betaling.kortIkkeFlerar : o.betaling.kortIkkeKommune) : kortMulig ? (plan === "engangs" ? o.betaling.kortTekst : o.betaling.kortAbonnement) : o.betaling.kortAv}
        />
      </div>

      {mate === "kort" && kortTillatt && plan !== "engangs" && (
        <div className="mb-6">
          <div className="text-xs font-semibold mb-2">{o.betaling.intervallTittel}</div>
          <div className="flex gap-2">
            {(["month", "year"] as const).map((i) => (
              <button
                key={i}
                type="button"
                aria-pressed={intervall === i}
                onClick={() => setIntervall(i)}
                className={`flex-1 text-[13px] font-semibold py-2.5 rounded-xl border transition ${
                  intervall === i ? "border-accent bg-accent-light text-accent" : "border-border text-dim hover:border-border-strong"
                }`}
              >
                {i === "month" ? o.betaling.intervallManad : o.betaling.intervallAr}
              </button>
            ))}
          </div>
        </div>
      )}

      {mate === "kort" && (
        <div className="mb-5">
          <label htmlFor="rabattkode" className="block text-xs font-semibold mb-1.5">
            {o.betaling.rabattkode}
          </label>
          <div className="flex gap-2 max-w-[360px]">
            <input
              id="rabattkode"
              value={kode}
              onChange={(e) => {
                setKode(e.target.value);
                setRabatt(null);
                setKodeFeil("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.nextElementSibling instanceof HTMLButtonElement && e.currentTarget.nextElementSibling.click();
                }
              }}
              autoComplete="off"
              className="flex-1 min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm uppercase tracking-wide"
            />
            <button
              type="button"
              disabled={sjekker || kode.trim().length < 3}
              onClick={() =>
                sjekk(async () => {
                  setKodeFeil("");
                  const r = await sjekkRabatt(plan, intervall, kode);
                  if (r.ok) setRabatt(r);
                  else {
                    setRabatt(null);
                    setKodeFeil(o.betaling.ugyldigKode);
                  }
                })
              }
              className="shrink-0 rounded-xl border border-border-strong px-4 py-2.5 text-[13px] font-semibold hover:bg-accent-light disabled:opacity-50"
            >
              {sjekker ? o.felles.sender : o.betaling.bruk}
            </button>
          </div>
          {kodeFeil && <p className="text-xs text-bad mt-2">{kodeFeil}</p>}
          {rabatt && (
            <div className="mt-3 max-w-[360px] rounded-xl border border-border bg-accent-light px-3.5 py-3 text-[13px]" role="status">
              <div className="font-semibold text-accent mb-1.5">{o.betaling.kodeBrukt}</div>
              <div className="flex justify-between text-dim">
                <span>{o.betaling.kodeFor}</span>
                <span className="line-through">{kr(rabatt.for)} NOK</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>
                  {rabatt.prosent != null
                    ? o.betaling.kodeProsent.replace("{p}", String(rabatt.prosent))
                    : o.betaling.kodeFast}
                  {" · "}
                  {o.betaling.kodeEtter}
                </span>
                <span>{kr(rabatt.etter)} NOK</span>
              </div>
              <div className="text-[11.5px] text-faint mt-1.5">
                {rabatt.varighet === "forever"
                  ? o.betaling.kodeAlltid
                  : rabatt.varighet === "repeating" && rabatt.maneder
                    ? o.betaling.kodeMaaneder.replace("{n}", String(rabatt.maneder))
                    : o.betaling.kodeEnGang}{" "}
                {o.betaling.kodeEksMva}
              </div>
            </div>
          )}
        </div>
      )}

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-4">
          {feil}
        </div>
      )}

      <button
        type="button"
        disabled={venter}
        onClick={() => {
          setFeil("");
          start(async () => {
            const r = await bestill(plan, mate, intervall, kode);
            if (!r.ok) setFeil(r.feil);
            else window.location.href = "/venter";
          });
        }}
        className="w-full bg-accent hover:bg-accent-hover active:scale-[0.99] transition text-white text-sm font-semibold px-5 py-3 rounded-xl disabled:opacity-50"
      >
        {venter
          ? o.felles.sender
          : mate === "kort"
            ? o.betaling.tilBetaling
            : o.betaling.bestillFaktura}
      </button>

      <p className="text-[11.5px] text-faint text-center mt-3 leading-relaxed">
        {mate === "kort" ? o.betaling.stripeNote : o.betaling.fakturaNote}
      </p>
    </>
  );
}

function Mate({
  valgt,
  onVelg,
  tittel,
  tekst,
  av = false,
}: {
  valgt: boolean;
  onVelg: () => void;
  tittel: string;
  tekst: string;
  av?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onVelg}
      disabled={av}
      aria-pressed={valgt}
      className={`w-full text-left flex items-start gap-3 rounded-card border px-4 py-3.5 transition ${
        av
          ? "border-border bg-canvas opacity-60 cursor-not-allowed"
          : valgt
            ? "border-accent ring-[3px] ring-accent-light bg-surface"
            : "border-border hover:border-border-strong bg-surface"
      }`}
    >
      <span
        className={`mt-0.5 w-4 h-4 rounded-full border-[1.5px] shrink-0 ${
          valgt ? "border-accent bg-accent" : "border-border-strong"
        }`}
      />
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold">{tittel}</span>
        <span className="block text-[12px] text-dim leading-snug mt-0.5">
          {tekst}
        </span>
      </span>
    </button>
  );
}
