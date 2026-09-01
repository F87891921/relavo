import { ord } from "@/lib/sprak";
/**
 * Tallbåndet. Fire tall, ingen av dem oppdiktet: to av dem står i
 * forskriften, ett er målt medianresponstid, ett er antall registre.
 */
const TALL = [
  { verdi: "2", enhet: null },
  { verdi: "1,4", enhet: " sek" },
  { verdi: "5", enhet: null },
  { verdi: "§ 5i", enhet: null },
];

export function Regelverk() {
  const t = ord().landing.regelverk;

  return (
    <section className="sec sec-alt" id="regelverk">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2 className="statement">
            {t.tittel} <span>{t.undertittel}</span>
          </h2>
        </div>
        <div className="stats">
          {TALL.map((tall, i) => (
            <div className="stat" key={tall.verdi}>
              <div className="stat-v">
                {tall.verdi}
                {tall.enhet && <em>{tall.enhet}</em>}
              </div>
              <div className="stat-l">{t.tall[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
