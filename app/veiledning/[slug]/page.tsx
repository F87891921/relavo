import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VeiledningSkall } from "@/components/landing/VeiledningSkall";
import {
  ANSVAR,
  OPPDATERT,
  VEILEDNINGER,
  finnVeiledning,
  type Status,
} from "../innhold";

const SIDE = "https://relavo.no";

export function generateStaticParams() {
  return VEILEDNINGER.map((v) => ({ slug: v.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const v = finnVeiledning(params.slug);
  if (!v) return {};
  const url = `${SIDE}/veiledning/${v.slug}`;
  return {
    title: `${v.tittel} | Relavo`,
    description: v.beskrivelse,
    alternates: { canonical: url },
    openGraph: {
      title: v.tittel,
      description: v.beskrivelse,
      url,
      type: "article",
      locale: "nb_NO",
    },
  };
}

const MERKE: Record<Status, string> = {
  "Kontrollert mot register": "reg",
  "Mottatt fra leverandør": "lev",
  Egenerklæring: "egen",
  "Ikke kontrollert": "ikke",
};

export default function VeiledningSide({ params }: { params: { slug: string } }) {
  const v = finnVeiledning(params.slug);
  if (!v) notFound();

  const url = `${SIDE}/veiledning/${v.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: v.tittel,
      description: v.beskrivelse,
      inLanguage: "nb-NO",
      datePublished: OPPDATERT,
      dateModified: OPPDATERT,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Relavo", url: SIDE },
      publisher: { "@type": "Organization", name: "Relavo", url: SIDE },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: v.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Relavo", item: SIDE },
        { "@type": "ListItem", position: 2, name: "Veiledning", item: `${SIDE}/veiledning` },
        { "@type": "ListItem", position: 3, name: v.tittel, item: url },
      ],
    },
  ];

  const relaterte = v.relaterte
    .map((s) => finnVeiledning(s))
    .filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <VeiledningSkall>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="smul" aria-label="Brødsmulesti">
        <Link href="/">Relavo</Link>
        <span>/</span>
        <Link href="/veiledning">Veiledning</Link>
      </nav>

      <div className="kicker">{v.kicker}</div>
      <h1>{v.tittel}</h1>
      <p className="ingress">{v.ingress}</p>
      <p className="meta">Sist oppdatert {OPPDATERT.split("-").reverse().join(".")}</p>

      <article className="innhold">
        {v.seksjoner.map((s) => (
          <section key={s.h2}>
            <h2>{s.h2}</h2>
            {s.avsnitt.map((a) => (
              <p key={a}>{a}</p>
            ))}
            {s.liste && (
              <ul className="punkt">
                {s.liste.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {v.tabell && (
          <section>
            <h2>Hva Relavo gjør, krav for krav</h2>
            <div className="tabellramme">
              <table>
                <thead>
                  <tr>
                    <th>Krav</th>
                    <th>Hva Relavo gjør</th>
                    <th>Status i rapporten</th>
                  </tr>
                </thead>
                <tbody>
                  {v.tabell.map((r) => (
                    <tr key={r.krav}>
                      <td className="krav">{r.krav}</td>
                      <td>{r.vi}</td>
                      <td>
                        <span className={`merke ${MERKE[r.status]}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tabellnote">
              Det som ikke er kontrollert står oppført som ikke kontrollert i rapporten, i stedet for å utelates.
            </p>
          </section>
        )}

        <section>
          <h2>Vanlige spørsmål</h2>
          <div className="spm">
            {v.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <div className="cta">
        <h2>Kjør en kontroll på en av dine egne leverandører</h2>
        <p>
          Enkeltkontroll koster 890 NOK eks. mva., uten abonnement. Kommuner får abonnement fra 3 900 NOK per måned etter innbyggertall.
        </p>
        <div className="rad">
          <Link href="/registrer" className="btn btn-primary btn-lg">Kom i gang</Link>
          <Link href="/#priser" className="btn btn-ghost btn-lg">Se priser</Link>
        </div>
      </div>

      {relaterte.length > 0 && (
        <div className="rel">
          <h2>Les også</h2>
          {relaterte.map((r) => (
            <Link key={r.slug} href={`/veiledning/${r.slug}`}>{r.tittel}</Link>
          ))}
        </div>
      )}

      <p className="ansvar">{ANSVAR}</p>
    </VeiledningSkall>
  );
}
