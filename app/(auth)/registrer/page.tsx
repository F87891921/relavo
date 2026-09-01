"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrd } from "@/components/Sprakgiver";
import { RelavoMark } from "@/components/RelavoMark";
import { FELT_FULL } from "@/components/ui/felt";
import { KRAV } from "@/lib/passord";
import { registrer } from "./handlinger";

/**
 * Første steg for en ny kunde.
 *
 * Bare e-post og passord her. Selskapet, organisasjonsnummeret og planen
 * kommer i de neste to stegene — å be om alt på én skjerm gjør at folk gir
 * opp før de har begynt, og vi trenger uansett ikke noe av det for å lage
 * en innlogging.
 *
 * Passordkravene vises mens man skriver, og de samme kravene håndheves på
 * serveren. Validering som bare finnes i nettleseren er en anbefaling.
 */
export default function RegistrerSide() {
  const o = useOrd();
  const router = useRouter();
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const status = KRAV.map((k) => ({ ...k, ok: k.oppfylt(passord, epost) }));
  const klar = passord.length > 0 && status.every((k) => k.ok) && epost.includes("@");

  return (
    <div className="min-h-screen bg-surface px-4 py-[9vh]">
      <div className="w-full max-w-[392px] mx-auto">
        <div className="text-center mb-6">
          <RelavoMark className="w-11 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[19px] font-semibold tracking-tight">
            {o.registrering.tittel}
          </h1>
          <p className="text-[12.5px] text-dim mt-1.5">{o.registrering.ingress}</p>
        </div>

        <form
          className="bg-surface rounded-2xl shadow-lift px-6 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            setFeil("");
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const r = await registrer(fd);
              if (!r.ok) setFeil(r.feil);
              else router.push("/velkommen");
            });
          }}
        >
          <label htmlFor="epost" className="block text-xs font-semibold mb-1.5">
            {o.auth.epost}
          </label>
          <input
            id="epost"
            name="epost"
            type="email"
            required
            autoComplete="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            placeholder="navn@kommune.no"
            className={`${FELT_FULL} max-w-none mb-4`}
          />

          <label htmlFor="passord" className="block text-xs font-semibold mb-1.5">
            {o.auth.passord}
          </label>
          <input
            id="passord"
            name="passord"
            type="password"
            required
            autoComplete="new-password"
            value={passord}
            onChange={(e) => setPassord(e.target.value)}
            className={`${FELT_FULL} max-w-none`}
          />

          <ul className="mt-3 mb-4 space-y-1">
            {status.map((k) => (
              <li
                key={k.id}
                className={`text-[11.5px] flex items-center gap-1.5 transition ${
                  k.ok ? "text-good" : "text-faint"
                }`}
              >
                <span className="w-3 shrink-0 text-center">{k.ok ? "✓" : "·"}</span>
                {k.tekst}
              </li>
            ))}
          </ul>

          {feil && (
            <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3 leading-relaxed">
              {feil}
            </div>
          )}

          <button
            type="submit"
            disabled={venter || !klar}
            className="w-full bg-accent hover:bg-accent-hover active:scale-[0.99] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40"
          >
            {venter ? o.felles.sender : o.registrering.opprett}
          </button>
        </form>

        <p className="text-[12.5px] text-dim text-center mt-4">
          {o.registrering.harKonto}{" "}
          <Link href="/logg-inn" className="text-accent hover:underline">
            {o.auth.loggInn}
          </Link>
        </p>
      </div>
    </div>
  );
}
