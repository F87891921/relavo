import "@/app/landing.css";
import "@/app/veiledning/veiledning.css";
import { LandingNav } from "./LandingNav";
import { LandingFooter } from "./LandingFooter";

/**
 * Rammen rundt veiledningssidene: samme navigasjon og bunnrad som forsiden,
 * i samme .landing-omslag som landing.css er scopet til.
 */
export function VeiledningSkall({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing">
      <LandingNav forsprak="no" />
      <main>
        <div className="wrap veil">{children}</div>
      </main>
      <LandingFooter forsprak="no" />
    </div>
  );
}
