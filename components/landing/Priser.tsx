import { ord } from "@/lib/sprak";
import Link from "next/link";
import { kr, ENKELTKONTROLL } from "@/lib/priser";
import { Prisfinner } from "./Prisfinner";

export function Priser() {
  const t = ord().landing.priser;

  return (
    <section className="sec" id="priser">
      <div className="wrap">
        <div className="sec-head center" data-avsloj>
          <div className="eyebrow">{t.eyebrow}</div>
          <h2 className="statement">
            {t.tittel} <span>{t.undertittel}</span>
          </h2>
          <p className="pf-mva">
            {t.eksMva}
          </p>
        </div>

        <div data-avsloj>
          <Prisfinner />
        </div>

        <div className="pf-under" data-avsloj>
          <div>
            <b>{t.enkelt.navn}</b> — {kr(ENKELTKONTROLL)} {t.enkelt.enhet}.{" "}
            <Link href="/registrer?plan=engangs">{t.enkelt.knapp}</Link>
          </div>
          <div>
            {t.andre.tekst} <Link href="/kontakt?om=priser">{t.andre.knapp}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
