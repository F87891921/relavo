"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RelavoMark } from "@/components/RelavoMark";
import { MicrosoftLogo } from "@/components/MicrosoftLogo";

/**
 * Erstatter prototypens KONTOER-objekt (et hardkodet passord-i-klartekst
 * JS-objekt) med ekte Supabase Auth. Ingen passord lagres eller
 * sammenlignes i denne filen — Supabase gjør det på serveren.
 *
 * To veier inn: e-post og passord, eller Microsoft-konto. Kommunene har
 * stort sett Entra ID fra før, så de slipper enda et passord å forvalte.
 */
/**
 * Skrus på med NEXT_PUBLIC_MICROSOFT_INNLOGGING=på i Vercel når
 * Azure-provideren er satt opp i Supabase. Til da viser knappen at den
 * ikke er klar, i stedet for å sende folk ut av appen.
 */
const MICROSOFT_PA =
  process.env.NEXT_PUBLIC_MICROSOFT_INNLOGGING === "på";

export default function LoggInnSide() {
  const router = useRouter();
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");
  const [laster, setLaster] = useState(false);
  const [msLaster, setMsLaster] = useState(false);

  // Callback-ruten sender folk hit med ?feil= når OAuth ikke gikk gjennom.
  useEffect(() => {
    const fraUrl = new URLSearchParams(window.location.search).get("feil");
    if (fraUrl) setFeil(feilTekst(fraUrl));
  }, []);

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

  async function loggInnMedMicrosoft() {
    setFeil("");

    // signInWithOAuth melder ikke fra hvis provideren mangler — den sender
    // nettleseren rett til Supabase, som svarer med rå JSON («provider is
    // not enabled»). Kunden ville altså landet på en naken feilside hos
    // supabase.co. Derfor stopper vi her i stedet, helt til Azure er satt
    // opp og flagget skrus på.
    if (!MICROSOFT_PA) {
      setFeil(
        "Innlogging med Microsoft er ikke slått på ennå. Bruk e-post og passord så lenge.",
      );
      return;
    }

    setMsLaster(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        // openid og profile trengs for navnet vi viser i profilen.
        scopes: "openid profile email",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // Går alt bra, navigerer nettleseren til Microsoft og koden under
    // rekker aldri å kjøre.
    if (error) {
      setMsLaster(false);
      setFeil("Fikk ikke kontakt med Microsoft. Prøv igjen.");
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-surface pt-[11vh] px-4">
      <div className="w-full max-w-[392px] bg-surface rounded-2xl shadow-lift overflow-hidden">
        <div className="px-6 pt-6 pb-1 text-center">
          <RelavoMark className="w-14 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[17px] font-semibold">Logg inn</h1>
          <p className="text-[12.5px] text-dim mt-1.5">
            Leverandørkontroll for offentlige anskaffelser
          </p>
        </div>

        <div className="px-6 pt-5">
          <button
            type="button"
            onClick={loggInnMedMicrosoft}
            disabled={msLaster || laster}
            className={`w-full flex items-center justify-center gap-2.5 border border-border-strong transition text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60 ${
              MICROSOFT_PA ? "hover:bg-surface2 active:scale-[0.97]" : "opacity-70"
            }`}
          >
            <MicrosoftLogo className="w-[17px] h-[17px]" />
            {msLaster ? "Sender deg til Microsoft …" : "Logg inn med Microsoft"}
            {!MICROSOFT_PA && (
              <span className="text-[11px] font-medium text-faint">kommer</span>
            )}
          </button>
        </div>

        <div className="px-6 pt-4 pb-1 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-faint">eller</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={loggInn} className="px-6 pt-3 pb-1.5">
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

          <button
            type="submit"
            disabled={laster || msLaster}
            className="w-full bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60 mt-1 mb-4"
          >
            {laster ? "Logger inn …" : "Logg inn"}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Feilene fra Supabase er engelske og tekniske. De to som faktisk treffer
 * folk får en norsk tekst; resten vises som de er, så support har noe å gå
 * etter i stedet for en generisk «noe gikk galt».
 */
function feilTekst(kode: string) {
  if (kode === "mangler-kode") return "Innloggingen ble avbrutt. Prøv igjen.";
  if (kode === "access_denied") return "Du avbrøt innloggingen hos Microsoft.";
  return kode;
}
