import { ord } from "@/lib/sprak";
import Link from "next/link";
import { HeroShot } from "./HeroShot";

export function Hero() {
  const t = ord().landing;

  return (
    <header className="hero">
      <div className="wrap">
        <a className="pill" href="#regelverk">
          <em>{t.hero.nytt}</em> <b>§§ 5e–5k</b> {t.hero.pille}
        </a>
        <h1>{t.hero.tittel}</h1>
        <p className="lead">{t.hero.lead}</p>
        <div className="hero-cta">
          <Link href="/logg-inn" className="btn btn-primary btn-lg">
            {t.nav.komIGang}
          </Link>
          <a className="btn btn-ghost btn-lg" href="#priser">
            {t.hero.sePriser}
          </a>
        </div>
        <div className="hero-note">{t.hero.note}</div>
      </div>
      <div className="shot">
        <div className="shot-frame">
          <HeroShot />
        </div>
      </div>
    </header>
  );
}
