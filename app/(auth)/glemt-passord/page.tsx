"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useOrd } from "@/components/Sprakgiver";
import { RelavoMark } from "@/components/RelavoMark";
import { FELT_FULL } from "@/components/ui/felt";
import { glemtPassord, type GlemtSvar } from "./handlinger";

export default function GlemtPassordSide() {
  const o = useOrd();
  const t = o.glemt;
  const [epost, setEpost] = useState("");
  const [svar, setSvar] = useState<GlemtSvar | null>(null);
  const sendt = svar === "sendt";
  const [venter, start] = useTransition();

  return (
    <div className="min-h-screen flex items-start justify-center bg-surface pt-[11vh] px-4">
      <div className="w-full max-w-[392px] bg-surface rounded-2xl shadow-lift px-6 py-7">
        <div className="text-center mb-5">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[17px] font-semibold">{t.tittel}</h1>
          <p className="text-[12.5px] text-dim mt-1.5">{t.ingress}</p>
        </div>

        {sendt ? (
          <p className="text-[13px] text-dim bg-canvas rounded-xl px-4 py-3 leading-relaxed">{t.sendt}</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                setSvar(await glemtPassord(epost));
              });
            }}
          >
            <label htmlFor="epost" className="block text-xs font-semibold mb-1.5">{o.auth.epost}</label>
            <input id="epost" type="email" required autoComplete="username" value={epost} onChange={(e) => setEpost(e.target.value)} className={`${FELT_FULL} max-w-none mb-4`} />
            {(svar === "ukjent" || svar === "feil") && (
              <p role="alert" className="text-[12.5px] text-bad bg-canvas rounded-xl px-3.5 py-2.5 mb-3 leading-relaxed">
                {svar === "ukjent" ? t.ukjent : t.feilSending}
                {svar === "ukjent" && (
                  <>
                    {" "}
                    <Link href="/registrer" className="text-accent font-semibold hover:underline">{t.opprettKonto}</Link>
                  </>
                )}
              </p>
            )}
            <button type="submit" disabled={venter} className="w-full bg-accent hover:bg-accent-hover active:scale-[0.99] transition text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-60">
              {venter ? o.felles.sender : t.knapp}
            </button>
          </form>
        )}

        <p className="text-[12.5px] text-center mt-5">
          <Link href="/logg-inn" className="text-accent hover:underline">{t.tilbake}</Link>
        </p>
      </div>
    </div>
  );
}
