import Link from "next/link";

const PLANER = [
  {
    navn: "Leverandørkontroll",
    pris: "590",
    enhet: "NOK",
    beskrivelse: "Én kontroll, full rapport som PDF. Uten abonnement.",
    punkter: [
      "Selskapsdata og roller",
      "Skatt, avgift og anmerkninger",
      "Kjedekontroll mot § 5k",
      "Rapport som PDF",
    ],
    knapp: "Kjør én kontroll",
    anbefalt: false,
  },
  {
    navn: "Standard",
    pris: "6 900",
    enhet: "NOK/mnd",
    beskrivelse: "Løpende overvåking av leverandørene i porteføljen.",
    punkter: [
      "Alt i enkeltkontroll",
      "Alle kilder i hver kontroll",
      "Daglig overvåking",
      "Bulkkontroll og anskaffelser",
      "Vurdering av lave tilbud",
    ],
    knapp: "Start Standard",
    anbefalt: true,
  },
  {
    navn: "Enterprise",
    pris: "12 900",
    enhet: "NOK/mnd",
    beskrivelse: "Flere enheter under samme avtale, med API.",
    punkter: [
      "Alt i Standard",
      "Flere enheter og arbeidsområder",
      "API-tilgang",
      "Egen kontaktperson",
      "Databehandleravtale",
    ],
    knapp: "Start Enterprise",
    anbefalt: false,
  },
];

export function Priser() {
  return (
    <section className="sec" id="priser">
      <div className="wrap">
        <div className="sec-head center">
          <div className="eyebrow">Priser</div>
          <h2 className="statement">
            Én pris, hele rapporten.{" "}
            <span>
              Ingen tillegg per oppslag og ingen overraskelser på fakturaen.
            </span>
          </h2>
        </div>
        <div className="plans">
          {PLANER.map((plan) => (
            <div
              key={plan.navn}
              className={plan.anbefalt ? "plan rec" : "plan"}
            >
              {plan.anbefalt && <span className="plan-tag">Vanligst</span>}
              <div className="plan-n">{plan.navn}</div>
              <div className="plan-p">
                {plan.pris} <em>{plan.enhet}</em>
              </div>
              <p className="plan-d">{plan.beskrivelse}</p>
              <ul>
                {plan.punkter.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link
                href="/logg-inn"
                className={`btn ${plan.anbefalt ? "btn-primary" : "btn-ghost"}`}
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
