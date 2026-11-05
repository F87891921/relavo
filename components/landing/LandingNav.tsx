import Link from "next/link";
import { RelavoLogo } from "@/components/RelavoLogo";
import { LandingMeny } from "./LandingMeny";
import { ord, ordbokFor, type Sprak } from "@/lib/sprak";

/**
 * Toppnavigasjon. I prototypen åpnet «Logg inn» og «Kom i gang» en modal
 * med demokontoer — her peker begge på den ekte innloggingssiden, som går
 * mot Supabase Auth.
 */
export function LandingNav({ forsprak }: { forsprak?: Sprak } = {}) {
  // Sider som er skrevet på ett språk (veiledning, videoguiden) låser
  // navigasjonen til det språket, så ikke en ansatt med svensk valg får
  // svensk meny over norsk tekst.
  const t = (forsprak ? ordbokFor(forsprak) : ord()).landing;

  return (
    <nav className="nav">
      <div className="nav-in">
        <Link href="/" className="logo" aria-label={ord().internt.tilForsiden}>
          <RelavoLogo />
        </Link>
        <div className="nav-links">
          <a href="/#plattform">{t.nav.plattform}</a>
          <a href="/#regelverk">{t.nav.regelverk}</a>
          <a href="/#priser">{t.nav.priser}</a>
          <a href="/#faq">{t.nav.sporsmal}</a>
        </div>
        <div className="nav-act">
          {/* Ingen språkvelger her: kundene ser bare norsk. Svensk og engelsk
              kan velges av ansatte, inne i kontoen. */}
          <Link href="/logg-inn" className="btn btn-quiet nav-bred">
            {t.nav.loggInn}
          </Link>
          <Link href="/registrer" className="btn btn-primary">
            {t.nav.komIGang}
          </Link>
          <LandingMeny
            loggInn={t.nav.loggInn}
            merke={t.nav.meny}
            lenker={[
              { href: "/#plattform", tekst: t.nav.plattform },
              { href: "/#regelverk", tekst: t.nav.regelverk },
              { href: "/#priser", tekst: t.nav.priser },
              { href: "/#faq", tekst: t.nav.sporsmal },
            ]}
          />
        </div>
      </div>
    </nav>
  );
}
