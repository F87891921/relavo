"use client";

import { useEffect, useState, useTransition } from "react";
import { useOrd } from "@/components/Sprakgiver";
import { bestill } from "./handlinger";
import { BEDRIFT, kr, mndBedrift } from "@/lib/priser";

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
  const kortTillatt = ["engangs", "start", "vekst", "bygg"].includes(plan);
  const [intervall, setIntervall] = useState<"month" | "year">("month");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const t = o.landing.priser;

  // Nivået følger med fra prisfinneren på forsiden.
  useEffect(() => {
    const fra = new URLSearchParams(window.location.search).get("plan");
    if (fra && PLANER.some((x) => x.verdi === fra)) setPlan(fra);
  }, []);

  const erSelskap = (v: string) => ["start", "vekst", "bygg"].includes(v);
  const [maltype, setMaltype] = useState<"kommune" | "selskap">("kommune");
  useEffect(() => {
    const fra = new URLSearchParams(window.location.search).get("plan");
    if (fra && erSelskap(fra)) setMaltype("selskap");
  }, []);
  // Selskap som betaler med kort ser prisen for valgt trekkintervall.
  const visPris = (rad: { verdi: string; pris: string; selskap?: boolean }) => {
    const b = BEDRIFT.find((x) => x.id === rad.verdi);
    if (!b || mate !== "kort") return rad.pris;
    const m = mndBedrift(b, intervall === "month" ? 1 : 12);
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
          tekst={!kortTillatt ? o.betaling.kortIkkeKommune : kortMulig ? (plan === "engangs" ? o.betaling.kortTekst : o.betaling.kortAbonnement) : o.betaling.kortAv}
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
            const r = await bestill(plan, mate, intervall);
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
