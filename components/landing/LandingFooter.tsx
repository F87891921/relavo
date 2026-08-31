import { RelavoLogo } from "@/components/RelavoLogo";

/**
 * De juridiske sidene finnes ennå bare som statiske filer i prototypen.
 * Til de er portet peker lenkene på ruter som skal bygges — se README.
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
            <a href="#faq">Spørsmål</a>
            <a href="#regelverk">Regelverk</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
