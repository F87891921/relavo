import Link from "next/link";
import { RelavoMark } from "./RelavoMark";

/**
 * Sidemenyen for kundedelen. Punktene og rekkefølgen er de samme som i
 * relavo-app.html, slik at prototypen og appen kan sammenlignes direkte
 * mens resten av skjermbildene portes.
 */
export const KUNDEMENY = [
  { navn: "Oversikt", href: "/oversikt" },
  { navn: "Ny kontroll", href: "/ny-kontroll" },
  { navn: "Bulkkontroll", href: "/bulk" },
  { navn: "Leverandørkjede", href: "/kjede" },
  { navn: "Unormalt lave tilbud", href: "/tilbud" },
  { navn: "Anskaffelser", href: "/anskaffelser" },
  { navn: "Leverandører", href: "/leverandorer" },
  { navn: "ESPD", href: "/espd" },
  { navn: "Datakilder", href: "/kilder" },
  { navn: "Brukerstøtte", href: "/support" },
  { navn: "Diagnostikk", href: "/diagnostikk" },
];

export function DashboardShell({
  aktivtSteg,
  ansatt = false,
  children,
}: {
  aktivtSteg: string;
  ansatt?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-[220px] shrink-0 border-r border-border bg-surface px-4 py-5 flex flex-col">
        <Link href="/oversikt" className="flex items-center gap-2 px-1 mb-7">
          <RelavoMark className="w-6 h-auto text-accent" />
          <span className="font-extrabold text-[15px] tracking-tight">Relavo</span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {KUNDEMENY.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={aktivtSteg === s.navn ? "page" : undefined}
              className={`text-[13.5px] px-3 py-2 rounded-lg transition ${
                aktivtSteg === s.navn
                  ? "bg-surface2 text-accent font-semibold"
                  : "text-dim hover:bg-canvas hover:text-ink"
              }`}
            >
              {s.navn}
            </Link>
          ))}
        </nav>

        {ansatt && (
          <div className="mt-auto pt-5 border-t border-border">
            <Link
              href="/internt"
              className="text-[13px] px-3 py-2 rounded-lg text-dim hover:bg-canvas hover:text-ink transition block"
            >
              Relavo internt →
            </Link>
          </div>
        )}
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
