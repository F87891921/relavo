import Link from "next/link";
import type { Metadata } from "next";
import { RelavoLogo } from "@/components/RelavoLogo";
import { JURIDISK } from "./innhold";

export const metadata: Metadata = {
  title: "Relavo — vilkår og personvern",
  description:
    "Brukervilkår, personvernerklæring, databehandleravtale og informasjon om informasjonskapsler for Relavo.",
};

/**
 * Alle de juridiske dokumentene på én side med ankere, slik prototypen
 * hadde det. Bunnlenkene på forsiden peker hit med #vilkar, #personvern,
 * #cookies og #kontakt.
 */
export default function JuridiskSide() {
  return (
    <div className="bg-surface min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-[820px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Relavo, til forsiden">
            <RelavoLogo className="w-[92px] h-auto text-ink" />
          </Link>
          <Link href="/" className="text-[13px] text-dim hover:text-ink transition">
            ← Til forsiden
          </Link>
        </div>
      </header>

      <div className="max-w-[820px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-semibold tracking-tight mb-3">
          Vilkår og personvern
        </h1>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-accent mb-14">
          {JURIDISK.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="hover:underline">
              {s.tittel}
            </a>
          ))}
        </nav>

        {JURIDISK.map((seksjon) => (
          <section
            key={seksjon.id}
            id={seksjon.id}
            className="mb-14 scroll-mt-6"
          >
            <h2 className="text-[22px] font-semibold tracking-tight mb-5 pb-3 border-b border-border">
              {seksjon.tittel}
            </h2>
            {seksjon.blokker.map((blokk, i) =>
              blokk.t === "h3" ? (
                <h3 key={i} className="text-[15px] font-semibold mt-7 mb-2">
                  {blokk.v}
                </h3>
              ) : blokk.t === "liste" ? (
                <ul key={i} className="my-3 space-y-1.5">
                  {blokk.v.map((punkt) => (
                    <li key={punkt} className="flex gap-3 text-[14px] text-dim leading-relaxed">
                      <span className="mt-[9px] w-1 h-1 rounded-full bg-accent shrink-0" />
                      {punkt}
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="text-[14px] text-dim leading-relaxed mb-3 whitespace-pre-line">
                  {blokk.v}
                </p>
              ),
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
