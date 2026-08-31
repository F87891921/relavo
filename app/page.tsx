import Link from "next/link";
import { RelavoMark } from "@/components/RelavoMark";

/**
 * Forenklet port av relavo-landing.html sin hero-seksjon. Resten av den
 * statiske siden (plattform, priser, FAQ) flyttes inn etter hvert —
 * se README for rekkefølgen dette prosjektet er tenkt bygget ut i.
 */
export default function Hjemmeside() {
  return (
    <main>
      <nav className="max-w-[1120px] mx-auto flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-2">
          <RelavoMark className="w-6 h-auto text-accent" />
          <span className="font-extrabold text-[16px] tracking-tight">Relavo</span>
        </div>
        <Link
          href="/logg-inn"
          className="bg-accent hover:bg-accent-hover transition text-white text-[13.5px] font-semibold px-4 py-2 rounded-lg"
        >
          Logg inn
        </Link>
      </nav>

      <section className="max-w-[720px] mx-auto text-center px-6 pt-16 pb-20">
        <span className="inline-flex items-center gap-2 border border-border-strong rounded-full px-3.5 py-1.5 text-xs text-dim mb-7">
          <b className="text-ink font-semibold">Nytt</b> §§ 5e–5k gjelder fra 1. juli 2026 →
        </span>
        <h1 className="text-[44px] leading-[1.08] tracking-tight font-semibold mb-5">
          Kontrollen du må gjøre. Beviset du må ha.
        </h1>
        <p className="text-[16px] text-dim leading-relaxed max-w-[520px] mx-auto mb-8">
          Relavo henter selskapsdata, skatterestanser og betalingsanmerkninger,
          kartlegger leverandørkjeden, og lagrer resultatet som dokumentasjon på
          kontrollplikten i § 5i.
        </p>
        <Link
          href="/logg-inn"
          className="inline-block bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-[14px] font-semibold px-6 py-3 rounded-xl"
        >
          Kom i gang
        </Link>
      </section>
    </main>
  );
}
