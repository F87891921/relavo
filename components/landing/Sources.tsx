import { Fragment } from "react";

/**
 * Kildestripen står der logokarusellen ville stått. Vi har ingen
 * kundelogoer ennå, og en oppdiktet logovegg er verre enn ingen.
 */
const KILDER = [
  "Brønnøysundregistrene",
  "Skatteetaten",
  "Creditsafe",
  "Arbeidstilsynet",
  "StartBANK",
];

export function Sources() {
  return (
    <section className="sources">
      <div className="sources-l">
        Bygger på
        {KILDER.map((kilde, i) => (
          <Fragment key={kilde}>
            <b>{kilde}</b>
            {i < KILDER.length - 1 && <i>·</i>}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
