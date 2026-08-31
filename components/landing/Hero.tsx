import Link from "next/link";
import { HeroShot } from "./HeroShot";

export function Hero() {
  return (
    <header className="hero">
      <div className="wrap">
        <a className="pill" href="#regelverk">
          <em>Nytt</em> <b>§§ 5e–5k</b> gjelder fra 1. juli 2026 →
        </a>
        <h1>Kontrollen du må gjøre. Beviset du må ha.</h1>
        <p className="lead">
          Relavo henter selskapsdata, skatterestanser og betalingsanmerkninger,
          kartlegger hvor dyp leverandørkjeden faktisk er, og lagrer resultatet
          som dokumentasjon på kontrollplikten i § 5i.
        </p>
        <div className="hero-cta">
          <Link href="/logg-inn" className="btn btn-primary btn-lg">
            Kom i gang
          </Link>
          <a className="btn btn-ghost btn-lg" href="#priser">
            Se priser
          </a>
        </div>
        <div className="hero-note">
          Fra 590 NOK per kontroll. Ingen bindingstid.
        </div>
      </div>
      <div className="shot">
        <div className="shot-frame">
          <HeroShot />
        </div>
      </div>
    </header>
  );
}
