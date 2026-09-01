import { ord } from "@/lib/sprak";
import "./landing.css";

import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Sources } from "@/components/landing/Sources";
import { Plattform } from "@/components/landing/Plattform";
import { Regelverk } from "@/components/landing/Regelverk";
import { Priser } from "@/components/landing/Priser";
import { Faq } from "@/components/landing/Faq";
import { Close } from "@/components/landing/Close";
import { LandingFooter } from "@/components/landing/LandingFooter";

/**
 * Forsiden, portet fra relavo-landing.html. Innloggingsmodalen med
 * demokontoer er byttet mot den ekte /logg-inn-ruten, som går mot
 * Supabase Auth — alt annet er samme innhold og samme uttrykk.
 */
export default function Hjemmeside() {
  const t = ord().landing;

  return (
    <div className="landing">
      <LandingNav />
      <main>
        <Hero />
        <Sources />
        <Plattform />
        <Regelverk />
        <Priser />
        <Faq
          eyebrow={t.faq.eyebrow}
          tittel={t.faq.tittel}
          sporsmal={t.faq.sporsmal}
        />
        <Close />
      </main>
      <LandingFooter />
    </div>
  );
}
