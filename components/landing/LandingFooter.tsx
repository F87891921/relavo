import Link from "next/link";
import { RelavoLogo } from "@/components/RelavoLogo";

/**
 * Bunnraden. De juridiske dokumentene ligger samlet på /juridisk med
 * ankere, slik prototypen hadde dem.
 */
export function LandingFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-in">
          <span className="logo">
            <RelavoLogo />
          </span>
          <p>
            Relavo kontrollerer selskaper, ikke enkeltpersoner. Opplysninger om
            straffedommer behandles ikke.
          </p>
          <div className="foot-l">
            <a href="#plattform">Plattform</a>
            <a href="#priser">Priser</a>
            <Link href="/juridisk#vilkar">Vilkår</Link>
            <Link href="/juridisk#personvern">Personvern</Link>
            <Link href="/juridisk#cookies">Cookies</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
