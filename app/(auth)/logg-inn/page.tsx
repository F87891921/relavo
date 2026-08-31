"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RelavoMark } from "@/components/RelavoMark";

/**
 * Erstatter prototypens KONTOER-objekt (et hardkodet passord-i-klartekst
 * JS-objekt) med ekte Supabase Auth. Ingen passord lagres eller
 * sammenlignes i denne filen — Supabase gjør det på serveren.
 */
export default function LoggInnSide() {
  const router = useRouter();
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");
  const [laster, setLaster] = useState(false);

  async function loggInn(e: React.FormEvent) {
    e.preventDefault();
    setFeil("");
    setLaster(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: epost,
      password: passord,
    });

    setLaster(false);
    if (error) {
      setFeil("Feil e-post eller passord.");
      return;
    }
    router.push("/leverandorer");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-black/20 pt-[11vh] px-4">
      <div className="w-full max-w-[392px] bg-surface rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 pt-6 pb-1 text-center">
          <RelavoMark className="w-14 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[17px] font-semibold">Logg inn</h1>
          <p className="text-[12.5px] text-dim mt-1.5">
            Leverandørkontroll for offentlige anskaffelser
          </p>
        </div>

        <form onSubmit={loggInn} className="px-6 pt-4 pb-1.5">
          <div className="mb-3">
            <label htmlFor="epost" className="block text-xs font-semibold mb-1.5">
              E-post
            </label>
            <input
              id="epost"
              type="email"
              autoComplete="username"
              required
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              placeholder="navn@kommune.no"
              className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passord" className="block text-xs font-semibold mb-1.5">
              Passord
            </label>
            <input
              id="passord"
              type="password"
              autoComplete="current-password"
              required
              value={passord}
              onChange={(e) => setPassord(e.target.value)}
              placeholder="••••••••"
              className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent"
            />
          </div>
          {feil && <div className="text-xs text-bad mb-2.5">{feil}</div>}
        </form>

        <div className="px-6 pb-4">
          <button
            onClick={loggInn}
            disabled={laster}
            className="w-full bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60"
          >
            {laster ? "Logger inn …" : "Logg inn"}
          </button>
        </div>
      </div>
    </div>
  );
}
