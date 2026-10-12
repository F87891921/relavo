import { ord } from "@/lib/sprak";
import { renholdstall } from "@/lib/renholdstall";
import "./landing.css";

import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Sources } from "@/components/landing/Sources";
import { Tallet } from "@/components/landing/Tallet";
import { Plattform } from "@/components/landing/Plattform";
import { Regelverk } from "@/components/landing/Regelverk";
import { Priser } from "@/components/landing/Priser";
import { Faq } from "@/components/landing/Faq";
import { Close } from "@/components/landing/Close";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Avslojning } from "@/components/landing/Avslojning";
import { Rullenav } from "@/components/landing/Rullenav";

/**
 * Forsiden, portet fra relavo-landing.html. Innloggingsmodalen med
 * demokontoer er byttet mot den ekte /logg-inn-ruten, som går mot
 * Supabase Auth — alt annet er samme innhold og samme uttrykk.
 */
export default async function Hjemmeside() {
  const t = ord().landing;

  // Tallet hentes, det skrives ikke inn. Går oppslaget ikke, vises
  // seksjonen ikke i det hele tatt — en forside som gjetter på sin egen
  // nøkkeltall er verre enn en forside uten.
  const tall = await renholdstall();

  return (
    <div className="landing">
      <Avslojning />
      <Rullenav />
      <LandingNav />
      <main>
        <Hero />
        <Sources />
        {tall && (
          <Tallet
            ikkeGodkjente={tall.ikkeGodkjente}
            totalt={tall.totalt}
            hentet={tall.hentet}
          />
        )}
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
