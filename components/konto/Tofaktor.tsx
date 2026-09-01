"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Merke } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";
import { useOrd } from "@/components/Sprakgiver";

type Faktor = { id: string; status: string; friendly_name?: string };

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50";

/**
 * Tofaktor med engangskode fra en autentiseringsapp.
 *
 * Supabase har dette innebygd, så det trengs verken ny leverandør eller ny
 * kostnad. Koden regnes ut i appen på telefonen — hemmeligheten forlater
 * aldri enheten etter at den er skannet inn.
 */
export function Tofaktor() {
  const ordbok = useOrd();
  const t = ordbok.konto;
  const router = useRouter();
  const supabase = createClient();

  const [faktorer, setFaktorer] = useState<Faktor[] | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [hemmelighet, setHemmelighet] = useState<string | null>(null);
  const [nyFaktorId, setNyFaktorId] = useState<string | null>(null);
  const [kode, setKode] = useState("");
  const [feil, setFeil] = useState("");
  const [kvittering, setKvittering] = useState("");
  const [venter, start] = useTransition();

  async function hentFaktorer() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFaktorer((data?.totp ?? []) as Faktor[]);
  }

  useEffect(() => {
    hentFaktorer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aktiv = (faktorer ?? []).filter((f) => f.status === "verified");

  async function start_registrering() {
    setFeil("");
    setKvittering("");

    // Hент listen på nytt i stedet for å stole på state. Avbryter noen
    // midt i, ligger den halvferdige faktoren igjen hos Supabase uten at
    // komponenten nødvendigvis vet om den.
    const { data: fersk } = await supabase.auth.mfa.listFactors();
    for (const f of fersk?.totp ?? [])
      if (f.status !== "verified")
        await supabase.auth.mfa.unenroll({ factorId: f.id });

    // Navnet må være unikt per bruker. Datoen alene kolliderte med seg selv
    // så snart noen prøvde to ganger samme dag.
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Relavo ${new Date().toISOString()}`,
    });

    if (error) {
      setFeil(error.message);
      return;
    }

    setNyFaktorId(data.id);
    setQr(data.totp.qr_code);
    setHemmelighet(data.totp.secret);
  }

  function bekreft() {
    if (!nyFaktorId) return;
    setFeil("");
    start(async () => {
      const { data: utfordring, error: uFeil } = await supabase.auth.mfa.challenge({
        factorId: nyFaktorId,
      });
      if (uFeil) {
        setFeil(uFeil.message);
        return;
      }

      const { error } = await supabase.auth.mfa.verify({
        factorId: nyFaktorId,
        challengeId: utfordring.id,
        code: kode.replace(/\s/g, ""),
      });

      if (error) {
        setFeil(ordbok.auth.kodenStemmerIkke);
        return;
      }

      setQr(null);
      setHemmelighet(null);
      setNyFaktorId(null);
      setKode("");
      setKvittering(t.slattPa);
      await hentFaktorer();
      router.refresh();
    });
  }

  function slaAv(id: string) {
    start(async () => {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) setFeil(error.message);
      else {
        setKvittering(t.slattAv);
        await hentFaktorer();
        router.refresh();
      }
    });
  }

  if (faktorer === null)
    return <div className="text-[13px] text-faint">{ordbok.felles.henter}</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {aktiv.length ? (
          <Merke tone="god">{t.tofaktorPa}</Merke>
        ) : (
          <Merke tone="noytral">{t.tofaktorAv}</Merke>
        )}
      </div>

      <p className="text-[12.5px] text-dim leading-relaxed mb-4">
        {t.tofaktorForklaring}
      </p>

      {aktiv.length > 0 && (
        <div className="space-y-2 mb-4">
          {aktiv.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-4 bg-canvas rounded-xl px-4 py-3"
            >
              <span className="text-[13px]">
                {t.autentiseringsapp}
              </span>
              <button
                type="button"
                disabled={venter}
                onClick={() => slaAv(f.id)}
                className="text-[12.5px] text-bad hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {t.slaAv}
              </button>
            </div>
          ))}
        </div>
      )}

      {!aktiv.length && !qr && (
        <button type="button" onClick={start_registrering} className={KNAPP}>
          {t.settOpp}
        </button>
      )}

      {qr && (
        <div className="bg-canvas rounded-xl p-5">
          <p className="text-[13px] mb-3 leading-relaxed">
            {t.skannKoden}
          </p>

          {/* Supabase leverer QR-koden ferdig som SVG i en data-URI. */}
          <img
            src={qr}
            alt={t.qrAlt}
            className="w-44 h-44 bg-surface rounded-xl p-2 mb-3"
          />

          {hemmelighet && (
            <details className="mb-4">
              <summary className="text-[12px] text-dim cursor-pointer">
                {t.fikkIkkeSkannet}
              </summary>
              <code className="block mt-2 text-[12px] font-mono bg-surface rounded-lg px-3 py-2 break-all">
                {hemmelighet}
              </code>
            </details>
          )}

          <label htmlFor="mfakode" className="block text-xs font-semibold mb-1.5">
            {t.skrivKoden}
          </label>
          <input
            id="mfakode"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={kode}
            onChange={(e) => setKode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && kode.length === 6) bekreft();
            }}
            placeholder="000000"
            className={`${FELT_FULL} font-mono tracking-[0.3em] max-w-[180px]`}
          />

          <div className="flex gap-2.5 mt-4">
            <button
              type="button"
              onClick={bekreft}
              disabled={venter || kode.length !== 6}
              className={KNAPP}
            >
              {venter ? ordbok.auth.bekrefter : ordbok.auth.bekreft}
            </button>
            <button
              type="button"
              onClick={() => {
                setQr(null);
                setHemmelighet(null);
                setNyFaktorId(null);
                setKode("");
              }}
              className="text-sm text-dim hover:text-ink px-3 py-2.5 transition"
            >
              {ordbok.felles.avbryt}
            </button>
          </div>
        </div>
      )}

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-3">
          {feil}
        </div>
      )}
      {kvittering && (
        <div className="text-xs text-good bg-good-bg rounded-xl px-3.5 py-2.5 mt-3">
          {kvittering}
        </div>
      )}
    </div>
  );
}
