"use client";

import { useOrd } from "@/components/Sprakgiver";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RelavoMark } from "@/components/RelavoMark";
import { FELT_FULL } from "@/components/ui/felt";

/**
 * Første skjerm etter at en ny kunde har logget inn. Kontoen finnes i
 * Supabase Auth, men den hører ennå ikke til noe selskap — og uten et
 * selskap slipper Row Level Security ingenting gjennom.
 *
 * Selve innleggingen gjøres av opprett_organisasjon() i 0002. Den kjører
 * med utvidede rettigheter og nekter å gjøre jobben to ganger for samme
 * bruker, så denne siden kan ikke misbrukes til å bytte organisasjon.
 */
const KOMMUNE = ["liten", "kommune", "medelstor"] as const;
const SELSKAP = ["start", "vekst", "bygg"] as const;
const PRIS: Record<string, string> = {
  liten: "3 900", kommune: "7 900", medelstor: "12 900",
  start: "2 900", vekst: "5 900", bygg: "11 900",
};

export default function VelkommenSide() {
  const o = useOrd();
  const t = o.landing.priser;
  const router = useRouter();
  const [navn, setNavn] = useState("");
  const [orgNr, setOrgNr] = useState("");
  const [brukernavn, setBrukernavn] = useState("");
  const [plan, setPlan] = useState("kommune");
  const [maltype, setMaltype] = useState<"kommune" | "selskap">("kommune");
  const [feil, setFeil] = useState("");
  const [laster, setLaster] = useState(false);

  // Planen velges i betalingssteget og følger med hit, så folk slipper å
  // ta det samme valget to ganger.
  useEffect(() => {
    const fra = new URLSearchParams(window.location.search).get("plan");
    if (fra && [...KOMMUNE, ...SELSKAP, "engangs"].includes(fra)) {
      setPlan(fra);
      if ((SELSKAP as readonly string[]).includes(fra)) setMaltype("selskap");
    }
  }, []);

  async function opprett(e: React.FormEvent) {
    e.preventDefault();
    setFeil("");
    setLaster(true);

    const supabase = createClient();
    const { error } = await supabase.rpc("opprett_organisasjon", {
      p_navn: navn,
      p_brukernavn: brukernavn,
      p_org_nr: orgNr || null,
      p_plan: plan,
    });

    if (error) {
      setLaster(false);
      setFeil(error.message);
      return;
    }

    router.push("/oversikt");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-surface pt-[9vh] px-4">
      <div className="w-full max-w-[440px] bg-surface rounded-2xl shadow-lift overflow-hidden">
        <div className="px-7 pt-7 pb-1 text-center">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[19px] font-semibold tracking-tight">
            {o.oppstart.opprettOrganisasjonen}
          </h1>
          <p className="text-[13px] text-dim mt-2 leading-relaxed">
            Kontrollene, leverandørene og rapportene legges under selskapet —
            ikke under den enkelte brukeren. Kolleger legges til etterpå.
          </p>
        </div>

        <form onSubmit={opprett} className="px-7 pt-6 pb-7">
          <div className="mb-3.5">
            <label htmlFor="navn" className="block text-xs font-semibold mb-1.5">
              {o.konto.navnPaOrganisasjonen}
            </label>
            <input
              id="navn"
              required
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="Eksempelvik kommune"
              className={FELT_FULL}
            />
          </div>

          <div className="mb-3.5">
            <label htmlFor="orgnr" className="block text-xs font-semibold mb-1.5">
              {o.konto.organisasjonsnummer} <span className="text-faint font-normal">— valgfritt</span>
            </label>
            <input
              id="orgnr"
              inputMode="numeric"
              value={orgNr}
              onChange={(e) => setOrgNr(e.target.value)}
              placeholder="964 338 531"
              className={FELT_FULL}
            />
          </div>

          <div className="mb-3.5">
            <label htmlFor="brukernavn" className="block text-xs font-semibold mb-1.5">
              {o.oppstart.dittNavn}
            </label>
            <input
              id="brukernavn"
              required
              value={brukernavn}
              onChange={(e) => setBrukernavn(e.target.value)}
              placeholder="Marit Aasen"
              className={FELT_FULL}
            />
          </div>

          <div className="mb-4">
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
                  className={`flex-1 text-[13px] font-semibold py-2 rounded-xl border transition ${
                    maltype === m ? "border-accent bg-accent-light text-accent" : "border-border text-dim hover:border-border-strong"
                  }`}
                >
                  {t.maltype[m]}
                </button>
              ))}
            </div>
            <label htmlFor="plan" className="block text-xs font-semibold mb-1.5">
              {maltype === "kommune" ? "Plan" : t.bedrift.etikett}
            </label>
            <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)} className={FELT_FULL}>
              {maltype === "kommune"
                ? KOMMUNE.map((v) => (
                    <option key={v} value={v}>
                      {t.nivaer[v].navn} — {t.nivaer[v].spenn} — {PRIS[v]} NOK/mnd
                    </option>
                  ))
                : SELSKAP.map((v) => (
                    <option key={v} value={v}>
                      {t.bedrift.nivaer[v].navn} — {t.bedrift.nivaer[v].spenn} — {PRIS[v]} NOK/mnd
                    </option>
                  ))}
            </select>
          </div>

          {feil && <div className="text-xs text-bad mb-3">{feil}</div>}

          <button
            type="submit"
            disabled={laster}
            className="w-full bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60"
          >
            {laster ? o.oppstart.oppretter : o.oppstart.opprettOrganisasjon}
          </button>
        </form>
      </div>
    </div>
  );
}
