import { ord } from "@/lib/sprak";
import Link from "next/link";
import { HeroShot } from "./HeroShot";
import { ShotRapport } from "./ShotRapport";
import { ShotTilbud } from "./ShotTilbud";
import { Bildespill } from "./Bildespill";

export function Hero() {
  const t = ord().landing;

  return (
    <header className="hero">
      <div className="wrap">
        {/* Ingen pille. Strekene er dekor og skal ikke leses opp. */}
        <a className="kicker" href="#regelverk">
          <i aria-hidden="true" />
          {t.hero.kicker}
          <i aria-hidden="true" />
        </a>
        <h1>{t.hero.tittel}</h1>
        <p className="lead">{t.hero.lead}</p>
        <div className="hero-cta">
          <Link href="/registrer" className="btn btn-primary btn-lg">
            {t.nav.komIGang}
          </Link>
          <a className="btn btn-ghost btn-lg" href="#priser">
            {t.hero.sePriser}
          </a>
        </div>
        <div className="hero-note">{t.hero.note}</div>
      </div>
      <div className="shot">
        <Bildespill
          navn={[t.spill.leverandorer, t.spill.rapporten, t.spill.tilbud]}
          bilder={[<HeroShot key="l" />, <ShotRapport key="r" />, <ShotTilbud key="t" />]}
        />
      </div>
    </header>
  );
}
