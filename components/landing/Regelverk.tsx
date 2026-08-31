/**
 * Tallbåndet. Fire tall, ingen av dem oppdiktet: to av dem står i
 * forskriften, ett er målt medianresponstid, ett er antall registre.
 */
const TALL = [
  {
    verdi: "2",
    enhet: null,
    tekst: "ledd underleverandører er taket i bygg, anlegg og renhold etter § 5k",
  },
  {
    verdi: "1,4",
    enhet: " sek",
    tekst: "medianen på et oppslag mot Enhetsregisteret",
  },
  {
    verdi: "5",
    enhet: null,
    tekst: "registre samlet i én rapport, med kilde og dato på hver linje",
  },
  {
    verdi: "§ 5i",
    enhet: null,
    tekst: "krever at kontrollen kan dokumenteres i ettertid, ikke bare utføres",
  },
];

export function Regelverk() {
  return (
    <section className="sec sec-alt" id="regelverk">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">Regelverk</div>
          <h2 className="statement">
            Én lovendring, fire tall som betyr noe.{" "}
            <span>Fra 1. juli 2026 er kontrollplikten uttrykkelig.</span>
          </h2>
        </div>
        <div className="stats">
          {TALL.map((t) => (
            <div className="stat" key={t.tekst}>
              <div className="stat-v">
                {t.verdi}
                {t.enhet && <em>{t.enhet}</em>}
              </div>
              <div className="stat-l">{t.tekst}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
