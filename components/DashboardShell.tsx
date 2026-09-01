import Link from "next/link";
import { RelavoLogo } from "./RelavoLogo";
import { LoggUt } from "./LoggUt";
import { MobilMeny } from "./MobilMeny";
import { krevProfil } from "@/lib/tilgang";

/**
 * Sidemenyen for kundedelen. Punktene og rekkefølgen er de samme som i
 * relavo-app.html, slik at prototypen og appen kan sammenlignes direkte.
 */
export const KUNDEMENY = [
  { navn: "Oversikt", href: "/oversikt" },
  { navn: "Ny kontroll", href: "/ny-kontroll" },
  { navn: "Bulkkontroll", href: "/bulk" },
  { navn: "Leverandørkjede", href: "/kjede" },
  { navn: "Unormalt lave tilbud", href: "/tilbud" },
  { navn: "Anskaffelser", href: "/anskaffelser" },
  { navn: "Leverandører", href: "/leverandorer" },
  { navn: "Interessekonflikt", href: "/jav" },
  { navn: "ESPD", href: "/espd" },
  { navn: "Brukerstøtte", href: "/support" },
];

/**
 * Henter sine egne opplysninger i stedet for å få dem som props. Ellers
 * måtte hver eneste side sende inn organisasjon, navn og e-post — tolv
 * steder å glemme det samme.
 */
export async function DashboardShell({
  aktivtSteg,
  children,
}: {
  aktivtSteg: string;
  children: React.ReactNode;
}) {
  // krevProfil er cachet per forespørsel, så dette koster ingenting ekstra
  // selv om siden allerede har kalt den.
  const { user, profil, organisasjonNavn } = await krevProfil();

  const ansatt = profil.ansatt;
  const organisasjon = organisasjonNavn;
  const brukernavn = profil.navn ?? null;
  const epost = user.email ?? null;

  const initialer = (brukernavn ?? epost ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((d: string) => d[0]?.toUpperCase())
    .join("");

  // Bunnen av menyen: konto, utlogging og veien inn til kontopanelet. Samme
  // innhold i sidemenyen og i mobilskuffen — skrevet én gang, ikke to.
  const bunn = (
    <>
      {ansatt && (
        <Link
          href="/internt"
          className="text-[13px] px-3 py-2 rounded-lg text-dim hover:bg-canvas hover:text-ink transition block"
        >
          Relavo internt →
        </Link>
      )}

      <div className="border-t border-border pt-2 mt-1">
        <Link
          href="/konto"
          aria-current={aktivtSteg === "Konto" ? "page" : undefined}
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition ${
            aktivtSteg === "Konto" ? "bg-surface2" : "hover:bg-canvas"
          }`}
        >
          <span className="w-7 h-7 rounded-lg bg-surface2 text-accent text-[10.5px] font-bold flex items-center justify-center shrink-0">
            {initialer}
          </span>
          <span className="min-w-0">
            <span className="block text-[12.5px] font-semibold truncate">
              {brukernavn ?? "Kontoen din"}
            </span>
            <span className="block text-[10.5px] text-faint truncate">
              {epost}
            </span>
          </span>
        </Link>
        <LoggUt />
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Under lg ligger de samme punktene i MobilMeny. Sidemenyen tar 228 av
          375 piksler på en telefon — der må den bort, ikke bare krympes. */}
      <aside className="hidden lg:flex w-[228px] shrink-0 border-r border-border bg-surface px-4 py-5 flex-col sticky top-0 h-screen">
        <Link href="/oversikt" className="block px-1 mb-1" aria-label="Relavo">
          <RelavoLogo className="w-[86px] h-auto text-ink" />
        </Link>

        {/* Hvilken organisasjon man ser data for. Uten dette er det umulig å
            vite om man ser på Bergen eller Askøy før man leser tabellen. */}
        {organisasjon && (
          <div className="px-1 mb-6 text-[11.5px] text-dim truncate" title={organisasjon}>
            {organisasjon}
          </div>
        )}

        <nav className="flex flex-col gap-0.5 overflow-y-auto min-h-0 flex-1">
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

        <div className="shrink-0 pt-4 space-y-1">{bunn}</div>
      </aside>

      <MobilMeny
        punkter={KUNDEMENY}
        aktivtSteg={aktivtSteg}
        tittel={organisasjon}
      >
        <div className="space-y-1">{bunn}</div>
      </MobilMeny>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
