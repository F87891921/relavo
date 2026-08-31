import Link from "next/link";
import { RelavoMark } from "./RelavoMark";

/**
 * Sidemenyen for kontopanelet. Punktene følger relavo-staff.html, som er
 * skrevet på svensk — det er Relavos eget interne verktøy, mens kundedelen
 * er på norsk. Den forskjellen er bevisst og beholdes.
 */
export const ANSATTMENY = [
  { navn: "Konton", href: "/internt" },
  { navn: "Marginal", href: "/internt/marginal" },
  { navn: "Kreditkontroll", href: "/internt/kreditt" },
  { navn: "Källhälsa", href: "/internt/kallor" },
  { navn: "Att göra", href: "/internt/attgora" },
  { navn: "Leads", href: "/internt/leads" },
  { navn: "Offerter", href: "/internt/offerter" },
  { navn: "Fakturering", href: "/internt/fakturering" },
  { navn: "Onboarding", href: "/internt/onboarding" },
  { navn: "Support", href: "/internt/support" },
  { navn: "Åtkomstlogg", href: "/internt/logg" },
  { navn: "Team och behörighet", href: "/internt/team" },
];

export function StaffShell({
  aktivtSteg,
  children,
}: {
  aktivtSteg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-[230px] shrink-0 border-r border-border bg-ink px-4 py-5 flex flex-col">
        <Link href="/internt" className="flex items-center gap-2 px-1 mb-2">
          <RelavoMark className="w-6 h-auto text-white" />
          <span className="font-extrabold text-[15px] tracking-tight text-white">
            Relavo
          </span>
        </Link>
        <div className="px-1 mb-7 text-[10.5px] font-bold tracking-[0.09em] uppercase text-white/40">
          Internt
        </div>

        <nav className="flex flex-col gap-0.5">
          {ANSATTMENY.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={aktivtSteg === s.navn ? "page" : undefined}
              className={`text-[13px] px-3 py-2 rounded-lg transition ${
                aktivtSteg === s.navn
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s.navn}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-5 border-t border-white/15">
          <Link
            href="/oversikt"
            className="text-[13px] px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition block"
          >
            ← Tilbake til kundevisning
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0 bg-canvas">{children}</main>
    </div>
  );
}
