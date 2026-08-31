import Link from "next/link";
import { RelavoLogo } from "@/components/RelavoLogo";

/**
 * Toppnavigasjon. I prototypen åpnet «Logg inn» og «Kom i gang» en modal
 * med demokontoer — her peker begge på den ekte innloggingssiden, som går
 * mot Supabase Auth.
 */
export function LandingNav() {
  return (
    <nav className="nav">
      <div className="nav-in">
        <Link href="/" className="logo" aria-label="Relavo, til forsiden">
          <RelavoLogo />
        </Link>
        <div className="nav-links">
          <a href="#plattform">Plattform</a>
          <a href="#regelverk">Regelverk</a>
          <a href="#priser">Priser</a>
          <a href="#faq">Spørsmål</a>
        </div>
        <div className="nav-act">
          <Link href="/logg-inn" className="btn btn-quiet">
            Logg inn
          </Link>
          <Link href="/logg-inn" className="btn btn-primary">
            Kom i gang
          </Link>
        </div>
      </div>
    </nav>
  );
}
