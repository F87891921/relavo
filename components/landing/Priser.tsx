import { ord } from "@/lib/sprak";
import Link from "next/link";

const PRISER = ["590", "6 900", "12 900"];
const ANBEFALT = 1;

export function Priser() {
  const t = ord().landing.priser;

  return (
    <section className="sec" id="priser">
      <div className="wrap">
        <div className="sec-head center">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2 className="statement">
            {t.tittel} <span>{t.undertittel}</span>
          </h2>
          <p className="mono" style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "14px" }}>
            {t.eksMva}
          </p>
        </div>
        <div className="plans">
          {t.planer.map((plan, i) => (
            <div key={plan.navn} className={i === ANBEFALT ? "plan rec" : "plan"}>
              {i === ANBEFALT && <span className="plan-tag">{t.vanligst}</span>}
              <div className="plan-n">{plan.navn}</div>
              <div className="plan-p">
                {PRISER[i]} <em>{plan.enhet}</em>
              </div>
              <p className="plan-d">{plan.beskrivelse}</p>
              <ul>
                {plan.punkter.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link
                href="/registrer"
                className={`btn ${i === ANBEFALT ? "btn-primary" : "btn-ghost"}`}
              >
                {plan.knapp}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
