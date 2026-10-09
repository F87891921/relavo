import Link from "next/link";
import { nesteSteg } from "@/lib/nesteSteg";
import { ord } from "@/lib/sprak";

const FLATE: Record<string, string> = {
  brudd: "bg-bad text-white",
  advarsel: "bg-warn text-white",
  aksent: "bg-accent text-white",
  god: "bg-good text-white",
};

/**
 * Det ene kortet som sier hva som skal gjøres nå.
 *
 * Det står øverst, det står alltid på samme sted, og det er fylt — alt
 * annet på siden er hvitt. Er det bare én ting som er farget, trenger man
 * ikke lete etter hvor man skal begynne.
 *
 * Kriteriet står under. Det er ikke pynt: «utført» og «dokumentert» er
 * ikke det samme, og forskjellen er hele grunnen til at tjenesten finnes.
 */
export async function NesteSteg() {
  const s = await nesteSteg();
  const o = ord();

  return (
    <div className={`rounded-card px-5 sm:px-6 py-5 mb-5 ${FLATE[s.tone]}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] opacity-70">
            {o.nesteSteg.overskrift}
            {!!s.kø && s.kø > 0 && (
              <span className="font-semibold normal-case tracking-normal">
                {" · "}
                {o.nesteSteg.iKo.replace("{n}", String(s.kø))}
              </span>
            )}
          </div>

          <div className="text-[19px] font-semibold tracking-tight mt-1.5">
            {s.tittel}
          </div>
          <p className="text-[13.5px] leading-relaxed opacity-90 mt-1 max-w-[62ch]">
            {s.detalj}
          </p>
        </div>

        <Link
          href={s.href}
          className="shrink-0 bg-white/95 hover:bg-white text-ink text-sm font-semibold
            px-4 py-2.5 rounded-xl transition active:scale-[0.97]"
        >
          {s.knapp} →
        </Link>
      </div>

      <p className="text-[12px] leading-relaxed opacity-75 mt-4 pt-3.5 border-t border-white/20 max-w-[76ch]">
        {s.kriterium}
      </p>
    </div>
  );
}
