import { ord } from "@/lib/sprak";
import Link from "next/link";
import { RelavoLogo } from "@/components/RelavoLogo";

/**
 * Bunnraden. De juridiske dokumentene ligger samlet på /juridisk med
 * ankere, slik prototypen hadde dem.
 */
export function LandingFooter() {
  const t = ord().landing;

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-in">
          <span className="logo">
            <RelavoLogo />
          </span>
          <p>{t.foot.tekst}</p>
          <div className="foot-l">
            <a href="#plattform">{t.nav.plattform}</a>
            <a href="#priser">{t.nav.priser}</a>
            <Link href="/juridisk#vilkar">{t.foot.vilkar}</Link>
            <Link href="/juridisk#personvern">{t.foot.personvern}</Link>
            <Link href="/juridisk#cookies">{t.foot.cookies}</Link>
            <Link href="/kontakt">{t.foot.kontakt}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
