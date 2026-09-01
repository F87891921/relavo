import { ord } from "@/lib/sprak";
import Link from "next/link";

export function Close() {
  const t = ord().landing;

  return (
    <section className="close">
      <div className="wrap">
        <h2>{t.close.tittel}</h2>
        <p>{t.close.tekst}</p>
        <div className="hero-cta">
          <Link href="/logg-inn" className="btn btn-primary btn-lg">
            {t.nav.komIGang}
          </Link>
          <Link href="/kontakt?om=demo" className="btn btn-ghost btn-lg">
            {t.close.snakkMedOss}
          </Link>
        </div>
      </div>
    </section>
  );
}
