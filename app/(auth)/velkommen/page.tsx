"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RelavoMark } from "@/components/RelavoMark";

/**
 * Første skjerm etter at en ny kunde har logget inn. Kontoen finnes i
 * Supabase Auth, men den hører ennå ikke til noe selskap — og uten et
 * selskap slipper Row Level Security ingenting gjennom.
 *
 * Selve innleggingen gjøres av opprett_organisasjon() i 0002. Den kjører
 * med utvidede rettigheter og nekter å gjøre jobben to ganger for samme
 * bruker, så denne siden kan ikke misbrukes til å bytte organisasjon.
 */
const PLANER = [
  { verdi: "engangs", navn: "Leverandørkontroll", pris: "590 NOK per kontroll" },
  { verdi: "standard", navn: "Standard", pris: "6 900 NOK/mnd" },
  { verdi: "enterprise", navn: "Enterprise", pris: "12 900 NOK/mnd" },
];

export default function VelkommenSide() {
  const router = useRouter();
  const [navn, setNavn] = useState("");
  const [orgNr, setOrgNr] = useState("");
  const [brukernavn, setBrukernavn] = useState("");
  const [plan, setPlan] = useState("standard");
  const [feil, setFeil] = useState("");
  const [laster, setLaster] = useState(false);

  // Planen velges i betalingssteget og følger med hit, så folk slipper å
  // ta det samme valget to ganger.
  useEffect(() => {
    const fra = new URLSearchParams(window.location.search).get("plan");
    if (fra && ["engangs", "standard", "enterprise"].includes(fra)) setPlan(fra);
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
            Opprett organisasjonen din
          </h1>
          <p className="text-[13px] text-dim mt-2 leading-relaxed">
            Kontrollene, leverandørene og rapportene legges under selskapet —
            ikke under den enkelte brukeren. Kolleger legges til etterpå.
          </p>
        </div>

        <form onSubmit={opprett} className="px-7 pt-6 pb-7">
          <div className="mb-3.5">
            <label htmlFor="navn" className="block text-xs font-semibold mb-1.5">
              Navn på organisasjonen
            </label>
            <input
              id="navn"
              required
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="Bergen kommune"
              className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent"
            />
          </div>

          <div className="mb-3.5">
            <label htmlFor="orgnr" className="block text-xs font-semibold mb-1.5">
              Organisasjonsnummer <span className="text-faint font-normal">— valgfritt</span>
            </label>
            <input
              id="orgnr"
              inputMode="numeric"
              value={orgNr}
              onChange={(e) => setOrgNr(e.target.value)}
              placeholder="964 338 531"
              className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent"
            />
          </div>

          <div className="mb-3.5">
            <label htmlFor="brukernavn" className="block text-xs font-semibold mb-1.5">
              Ditt navn
            </label>
            <input
              id="brukernavn"
              required
              value={brukernavn}
              onChange={(e) => setBrukernavn(e.target.value)}
              placeholder="Marit Aasen"
              className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="plan" className="block text-xs font-semibold mb-1.5">
              Plan
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent"
            >
              {PLANER.map((p) => (
                <option key={p.verdi} value={p.verdi}>
                  {p.navn} — {p.pris}
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
            {laster ? "Oppretter …" : "Opprett organisasjon"}
          </button>
        </form>
      </div>
    </div>
  );
}
