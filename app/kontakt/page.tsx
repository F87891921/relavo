import { ord } from "@/lib/sprak";
import Link from "next/link";
import type { Metadata } from "next";
import { RelavoLogo } from "@/components/RelavoLogo";
import { KontaktSkjema } from "./Skjema";

export const metadata: Metadata = {
  title: "Kontakt Relavo",
  description:
    "Spørsmål om leverandørkontroll, priser eller personvern? Send oss en melding.",
};

export default function KontaktSide({
  searchParams,
}: {
  searchParams: { om?: string };
}) {
  const o = ord();
  return (
    <div className="bg-surface min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-[820px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label={o.oppstart.tilForsiden}>
            <RelavoLogo className="w-[92px] h-auto text-ink" />
          </Link>
          <Link href="/" className="text-[13px] text-dim hover:text-ink transition">
            ← Til forsiden
          </Link>
        </div>
      </header>

      <div className="max-w-[720px] mx-auto px-6 py-14">
        <h1 className="text-[32px] font-semibold tracking-tight mb-3">Kontakt</h1>
        <p className="text-[15px] text-dim leading-relaxed mb-9 max-w-[58ch]">
          Skriv til oss om anskaffelser, priser eller hvordan tjenesten
          behandler opplysninger. Vi svarer normalt innen én virkedag.
        </p>

        <KontaktSkjema forvalgt={searchParams.om} />
      </div>
    </div>
  );
}
