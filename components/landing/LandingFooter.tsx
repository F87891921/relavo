import { ord } from "@/lib/sprak";
import Link from "next/link";
import { RelavoLogo } from "@/components/RelavoLogo";
import { RELAVO, relavoOrgNr } from "@/lib/relavo";

/**
 * Bunnraden. De juridiske dokumentene ligger samlet på /juridisk med
 * ankere, slik prototypen hadde dem.
 *
 * Avtaleparten står her, ikke bare i vilkårene. Et NUF er en filial og
 * ikke et eget rettssubjekt — rettssubjektet er det svenske aksjebolaget.
 * En offentlig innkjøper som skal føre oss opp i en protokoll trenger å
 * se hvem de faktisk inngår avtale med uten å måtte åpne vilkårene.
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
          <p>
            {t.foot.tekst}
            <span className="foot-part">
              {RELAVO.navn}, org.nr {relavoOrgNr()} — {t.foot.avdeling}{" "}
              {RELAVO.morNavn}, org.nr {RELAVO.morOrgNr}
            </span>
          </p>
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
