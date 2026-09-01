"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RelavoMark } from "@/components/RelavoMark";
import { FELT_FULL } from "@/components/ui/felt";
import { useOrd } from "@/components/Sprakgiver";

/**
 * Steg to i innloggingen. Vises bare når kontoen har tofaktor slått på og
 * sesjonen ennå står på aal1 — altså passord bekreftet, engangskode ikke.
 */
export default function TofaktorSide() {
  const t = useOrd().auth;
  const router = useRouter();
  const supabase = createClient();

  const [kode, setKode] = useState("");
  const [feil, setFeil] = useState("");
  const [faktorId, setFaktorId] = useState<string | null>(null);
  const [venter, start] = useTransition();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verifisert = (data?.totp ?? []).find((f) => f.status === "verified");
      // Ingen faktor å bekrefte: da hører man ikke hjemme her.
      if (!verifisert) router.replace("/oversikt");
      else setFaktorId(verifisert.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function bekreft() {
    if (!faktorId) return;
    setFeil("");
    start(async () => {
      const { data: utfordring, error: uFeil } = await supabase.auth.mfa.challenge({
        factorId: faktorId,
      });
      if (uFeil) {
        setFeil(uFeil.message);
        return;
      }
      const { error } = await supabase.auth.mfa.verify({
        factorId: faktorId,
        challengeId: utfordring.id,
        code: kode.replace(/\s/g, ""),
      });
      if (error) {
        setFeil(t.kodenStemmerIkke);
        setKode("");
        return;
      }
      router.push("/oversikt");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-surface pt-[13vh] px-4">
      <div className="w-full max-w-[368px] bg-surface rounded-2xl shadow-lift overflow-hidden">
        <div className="px-6 pt-7 pb-1 text-center">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[17px] font-semibold">{t.engangskodeTittel}</h1>
          <p className="text-[12.5px] text-dim mt-1.5 leading-relaxed">
            Skriv inn koden fra autentiseringsappen din.
          </p>
        </div>

        <div className="px-6 pt-5 pb-7">
          <input
            id="kode"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={kode}
            onChange={(e) => setKode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && kode.length === 6) bekreft();
            }}
            placeholder="000000"
            aria-label="Engangskode"
            className={`${FELT_FULL} font-mono text-center text-[20px] tracking-[0.4em] max-w-none`}
          />

          {feil && <div className="text-xs text-bad mt-2.5">{feil}</div>}

          <button
            type="button"
            onClick={bekreft}
            disabled={venter || kode.length !== 6}
            className="w-full bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold py-2.5 rounded-xl mt-4 disabled:opacity-50"
          >
            {venter ? t.bekrefter : t.fortsett}
          </button>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/logg-inn");
            }}
            className="w-full text-[12px] text-faint hover:text-ink mt-4 transition"
          >
            Logg inn som en annen
          </button>
        </div>
      </div>
    </div>
  );
}
