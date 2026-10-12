"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useOrd } from "@/components/Sprakgiver";
import { RelavoMark } from "@/components/RelavoMark";
import { FELT_FULL } from "@/components/ui/felt";
import { KRAV } from "@/lib/passord";
import { byttPassord } from "./handlinger";

/** Landingssiden fra lenken i e-posten. Brukeren har en økt via /auth/callback. */
export default function NyttPassordSide() {
  const o = useOrd();
  const t = o.glemt;
  const router = useRouter();
  const [passord, setPassord] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [feil, setFeil] = useState("");
  const [ferdig, setFerdig] = useState(false);
  const [venter, start] = useTransition();

  const status = KRAV.map((k) => ({ ...k, ok: k.oppfylt(passord, "") }));
  const like = passord === bekreft;
  const klar = passord.length > 0 && status.every((k) => k.ok) && like && bekreft.length > 0;

  return (
    <div className="min-h-screen flex items-start justify-center bg-surface pt-[11vh] px-4">
      <div className="w-full max-w-[392px] bg-surface rounded-2xl shadow-lift px-6 py-7">
        <div className="text-center mb-5">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[17px] font-semibold">{t.nyttTittel}</h1>
        </div>

        {ferdig ? (
          <p className="text-[13px] text-dim bg-canvas rounded-xl px-4 py-3">{t.ferdig}</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFeil("");
              start(async () => {
                const r = await byttPassord(passord);
                if (!r.ok) return setFeil(r.feil);
                setFerdig(true);
                setTimeout(() => {
                  router.push("/oversikt");
                  router.refresh();
                }, 1200);
              });
            }}
          >
            <label htmlFor="pw" className="block text-xs font-semibold mb-1.5">{t.nyttLabel}</label>
            <input id="pw" type="password" autoComplete="new-password" required value={passord} onChange={(e) => setPassord(e.target.value)} className={`${FELT_FULL} max-w-none`} />
            <ul className="mt-3 mb-4 space-y-1">
              {status.map((k) => (
                <li key={k.id} className={`text-[11.5px] flex items-center gap-1.5 ${k.ok ? "text-good" : "text-faint"}`}>
                  <span className="w-3 shrink-0 text-center">{k.ok ? "✓" : "·"}</span>
                  {k.tekst}
                </li>
              ))}
            </ul>
            <label htmlFor="pw2" className="block text-xs font-semibold mb-1.5">{t.bekreftLabel}</label>
            <input id="pw2" type="password" autoComplete="new-password" required value={bekreft} onChange={(e) => setBekreft(e.target.value)} className={`${FELT_FULL} max-w-none mb-1.5`} />
            {bekreft.length > 0 && !like && <div className="text-[11.5px] text-bad mb-3">{t.ikkeLike}</div>}
            <div className="mb-3" />
            {feil && <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">{feil}</div>}
            <button type="submit" disabled={venter || !klar} className="w-full bg-accent hover:bg-accent-hover active:scale-[0.99] transition text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40">
              {venter ? o.felles.sender : t.nyttKnapp}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
