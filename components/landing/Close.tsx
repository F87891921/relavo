import Link from "next/link";

export function Close() {
  return (
    <section className="close">
      <div className="wrap">
        <h2>Hvor dyp er kjeden i din største kontrakt?</h2>
        <p>
          Kjør én kontroll og se svaret. Du trenger ikke abonnement for å prøve.
        </p>
        <div className="hero-cta">
          <Link href="/logg-inn" className="btn btn-primary btn-lg">
            Kom i gang
          </Link>
          <a className="btn btn-ghost btn-lg" href="#priser">
            Se priser
          </a>
        </div>
      </div>
    </section>
  );
}
