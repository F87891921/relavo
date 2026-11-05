import Link from "next/link";
import type { Metadata } from "next";
import { VeiledningSkall } from "@/components/landing/VeiledningSkall";
import { VEILEDNINGER, ANSVAR } from "./innhold";

export const metadata: Metadata = {
  title: "Veiledning om leverandørkontroll i offentlige anskaffelser | Relavo",
  description:
    "Veiledninger om leverandørkontroll, seriøsitetskrav, kjedeansvar, skatteattest, HMS-kort og sanksjonssjekk. Med tydelig skille mellom det som kontrolleres og det som er egenerklæring.",
  alternates: { canonical: "https://relavo.no/veiledning" },
};

export default function VeiledningIndeks() {
  return (
    <VeiledningSkall>
      <div className="kicker">Veiledning</div>
      <h1>Leverandørkontroll, krav for krav.</h1>
      <p className="ingress">
        Korte veiledninger for innkjøpere i offentlige anskaffelser. Hver side sier hva som kan kontrolleres mot et register, hva leverandøren selv må levere, og hva som bare er en egenerklæring.
      </p>

      <p className="meta">
        Vil du heller se det? <Link href="/guide" style={{ color: "var(--accent)", fontWeight: 600 }}>Se videoguiden</Link> (to minutter).
      </p>

      <div className="liste">
        {VEILEDNINGER.map((v) => (
          <Link key={v.slug} href={`/veiledning/${v.slug}`}>
            <strong>{v.tittel}</strong>
            <span>{v.beskrivelse}</span>
          </Link>
        ))}
      </div>

      <p className="ansvar">{ANSVAR}</p>
    </VeiledningSkall>
  );
}
