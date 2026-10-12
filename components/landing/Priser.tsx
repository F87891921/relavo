import { ord } from "@/lib/sprak";
import Link from "next/link";
import { NIVAER, kr, ENKELTKONTROLL } from "@/lib/priser";
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
          <p className="mono" style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "14px" }}>
            {t.eksMva}
          </p>
        </div>

        <div data-avsloj>
          <Prisfinner />
        </div>

        <div className="pf-tabell" data-avsloj>
          <h3>{t.tabell.tittel}</h3>
          <p>{t.tabell.tekst}</p>
          <table>
            <thead>
              <tr>
                <th>{t.tabell.kolInnb}</th>
                <th>{t.tabell.kolPris}</th>
              </tr>
            </thead>
            <tbody>
              {NIVAER.map((n) => (
                <tr key={n.id}>
                  <td>
                    <b>{t.nivaer[n.id].navn}</b> · {t.nivaer[n.id].spenn}
                  </td>
                  <td>
                    {n.mnd === null ? t.tabell.offert : `${kr(n.mnd)} NOK`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pf-ingar" data-avsloj>
          <h3>{t.ingar.tittel}</h3>
          <ul>
            {t.ingar.punkter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="pf-under" data-avsloj>
          <div>
            <b>{t.enkelt.navn}</b> — {kr(ENKELTKONTROLL)} {t.enkelt.enhet}. {t.enkelt.tekst}{" "}
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
