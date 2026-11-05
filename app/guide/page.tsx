import Link from "next/link";
import type { Metadata } from "next";
import { VeiledningSkall } from "@/components/landing/VeiledningSkall";
import { ANSVAR, VEILEDNINGER } from "../veiledning/innhold";

const URL = "https://relavo.no/guide";
const VIDEO = "https://relavo.no/video/guide-nb.mp4";
const POSTER = "https://relavo.no/video/guide-nb.jpg";

export const metadata: Metadata = {
  title: "Se hvordan Relavo fungerer | Relavo",
  description:
    "En gjennomgang på to minutter: fra du legger inn en leverandør, til du har en kontroll du kan vise fram. Med tekst og undertekster.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Se hvordan Relavo fungerer",
    description:
      "En gjennomgang på to minutter av leverandørkontroll i offentlige anskaffelser.",
    url: URL,
    type: "video.other",
    locale: "nb_NO",
    images: [POSTER],
  },
};

/**
 * Voiceover-teksten, samlet etter scene. Den står både som transkripsjon på
 * siden (de som ikke kan eller vil høre lyd, og søkemotorer) og som
 * undertekster i guide-nb.vtt. Endres talet, må begge byttes.
 */
const TRANSKRIPSJON = [
  {
    "h": "Hele reisen på ett sted",
    "t": "Her er hele reisen på ett sted. Du starter på relavo.no, og kommer i gang med noen få klikk."
  },
  {
    "h": "Legg inn leverandørene",
    "t": "Du legger inn leverandørene dere kjøper fra. Du ser med en gang hvor mange som er dokumentert, og hvilke som trenger oppfølging."
  },
  {
    "h": "Én kontroll, alle registre",
    "t": "Så kjører du kontrollen. Relavo samler svaret fra registrene i én rapport. Hvert krav har sin egen linje. Det som ikke er sjekket, står som ikke sjekket. Rapporten kan lastes ned som PDF."
  },
  {
    "h": "Leverandørkjeden, ledd for ledd",
    "t": "Kjeden kartlegges ledd for ledd. I bygg, anlegg og renhold er taket to ledd. Går kjeden dypere, flagger Relavo det med en gang."
  },
  {
    "h": "Hvert krav på sin egen linje",
    "t": "Rapporten følger loven punkt for punkt. Det leverandøren bare har bekreftet, står som egenerklæring. Det som er mottatt eller slått opp, står med det."
  },
  {
    "h": "Unormalt lave tilbud",
    "t": "Er et tilbud unormalt lavt, regner Relavo avviket mot de andre tilbudene. Du får et utkast til den redegjørelsen du skal be om, og kan lese det gjennom før du sender."
  },
  {
    "h": "Løpende overvåking",
    "t": "Relavo følger leverandørene videre. Konkurs, tapt godkjenning og nye ledd i kjeden fanges opp i den daglige kjøringen."
  },
  {
    "h": "Rapport som holder",
    "t": "Hver kjøring lagres uendret, med kilde og dato. Det som ikke er kontrollert, står oppført som ikke kontrollert."
  },
  {
    "h": "Enkle priser",
    "t": "Prisen følger kommunens innbyggertall. Du skriver kommunens navn, og ser prisen per måned og per år. Velger du en lengre avtale, ser du også totalen. Ingen tillegg per bruker eller per kontroll."
  },
  {
    "h": "Kom i gang",
    "t": "Kom i gang på relavo.no."
  }
] as const;

export default function GuideSide() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Se hvordan Relavo fungerer",
      description:
        "En gjennomgang på to minutter av leverandørkontroll i offentlige anskaffelser: fra du legger inn en leverandør til du har en kontroll du kan vise fram.",
      thumbnailUrl: POSTER,
      contentUrl: VIDEO,
      uploadDate: "2026-11-05",
      duration: "PT2M12S",
      inLanguage: "nb-NO",
      transcript: TRANSKRIPSJON.map((s) => s.t).join(" "),
      publisher: { "@type": "Organization", name: "Relavo", url: "https://relavo.no" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Relavo", item: "https://relavo.no" },
        { "@type": "ListItem", position: 2, name: "Guide", item: URL },
      ],
    },
  ];

  return (
    <VeiledningSkall>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="kicker">Guide</div>
      <h1>Se hvordan Relavo fungerer.</h1>
      <p className="ingress">
        En gjennomgang på to minutter: fra du legger inn en leverandør, til du har en kontroll du kan vise fram.
      </p>

      <video
        className="guide-video"
        controls
        playsInline
        preload="metadata"
        poster="/video/guide-nb.jpg"
      >
        <source src="/video/guide-nb.mp4" type="video/mp4" />
        <track kind="captions" src="/video/guide-nb.vtt" srcLang="nb" label="Norsk" />
        Nettleseren din kan ikke spille av videoen. <a href="/video/guide-nb.mp4">Åpne filen direkte</a>.
      </video>
      <p className="meta">Skjermbildene viser eksempeldata fra et fiktivt selskap. Du kan slå på undertekster i videospilleren.</p>

      <div className="innhold">
        <details className="guide-tekst">
          <summary>Les teksten fra videoen</summary>
          {TRANSKRIPSJON.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.t}</p>
            </div>
          ))}
        </details>
      </div>

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

      <div className="rel">
        <h2>Les mer</h2>
        {VEILEDNINGER.slice(0, 4).map((v) => (
          <Link key={v.slug} href={`/veiledning/${v.slug}`}>{v.tittel}</Link>
        ))}
        <Link href="/veiledning">Alle veiledninger</Link>
      </div>

      <p className="ansvar">{ANSVAR}</p>
    </VeiledningSkall>
  );
}
