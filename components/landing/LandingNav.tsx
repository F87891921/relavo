import Link from "next/link";
import { RelavoLogo } from "@/components/RelavoLogo";
import { Sprakvelger } from "@/components/Sprakvelger";
import { aktivtSprak, ord } from "@/lib/sprak";

/**
 * Toppnavigasjon. I prototypen åpnet «Logg inn» og «Kom i gang» en modal
 * med demokontoer — her peker begge på den ekte innloggingssiden, som går
 * mot Supabase Auth.
 */
export function LandingNav() {
  const sprak = aktivtSprak();
  const t = ord().landing;

  return (
    <nav className="nav">
      <div className="nav-in">
        <Link href="/" className="logo" aria-label={ord().internt.tilForsiden}>
          <RelavoLogo />
        </Link>
        <div className="nav-links">
          <a href="#plattform">{t.nav.plattform}</a>
          <a href="#regelverk">{t.nav.regelverk}</a>
          <a href="#priser">{t.nav.priser}</a>
          <a href="#faq">{t.nav.sporsmal}</a>
        </div>
        <div className="nav-act">
          {/* Her møter den som ennå ikke har konto valget. Kapselen husker
              det, og ved første innlogging følger det med på profilen. */}
          <Sprakvelger na={sprak} variant="minimal" retning="ned" />
          <Link href="/logg-inn" className="btn btn-quiet">
            {t.nav.loggInn}
          </Link>
          <Link href="/logg-inn" className="btn btn-primary">
            {t.nav.komIGang}
          </Link>
        </div>
      </div>
      {/* Samme fire lenkene som .nav-links, men i en rullbar rad. Vises bare
          under 820px, der .nav-links er skjult. */}
      <div className="nav-mob">
        <a href="#plattform">{t.nav.plattform}</a>
        <a href="#regelverk">{t.nav.regelverk}</a>
        <a href="#priser">{t.nav.priser}</a>
        <a href="#faq">{t.nav.sporsmal}</a>
      </div>
    </nav>
  );
}
