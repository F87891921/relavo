"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RelavoLogo } from "./RelavoLogo";

type Punkt = { navn: string; href: string };

/**
 * Sidemenyen på små skjermer.
 *
 * Sidemenyen er 228 piksler bred og lå fast. På en telefon på 375 piksler
 * spiste den seks tideler av bredden, og innholdet ble presset ned i en
 * kolonne det ikke gikk an å lese en tabell i. Under lg legges den derfor
 * bort i en skuff bak en knapp, og siden får hele bredden.
 *
 * Samme komponent for kunde og kontopanel — bare fargene skiller. To nesten
 * like skuffer ville blitt to steder å glemme det samme.
 */
export function MobilMeny({
  punkter,
  aktivtSteg,
  tittel,
  mork = false,
  children,
}: {
  punkter: Punkt[];
  aktivtSteg: string;
  tittel: string | null;
  mork?: boolean;
  children: React.ReactNode;
}) {
  const [apen, setApen] = useState(false);
  const sti = usePathname();

  // Lukk når man har navigert. Uten dette blir skuffen stående åpen over
  // siden man nettopp valgte.
  useEffect(() => setApen(false), [sti]);

  // Escape lukker, og siden bak skal ikke kunne rulle mens skuffen er oppe.
  useEffect(() => {
    if (!apen) return;
    const tast = (e: KeyboardEvent) => e.key === "Escape" && setApen(false);
    const forrige = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", tast);
    return () => {
      document.body.style.overflow = forrige;
      window.removeEventListener("keydown", tast);
    };
  }, [apen]);

  const topp = mork
    ? "bg-ink text-white border-white/15"
    : "bg-surface text-ink border-border";

  return (
    <>
      <header
        className={`lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b ${topp}`}
      >
        <button
          type="button"
          onClick={() => setApen(true)}
          aria-label="Åpne menyen"
          aria-expanded={apen}
          className={`-ml-2 p-2 rounded-lg transition ${
            mork ? "hover:bg-white/10" : "hover:bg-canvas"
          }`}
        >
          {/* Tre streker. Egen svg framfor et ikonbibliotek — det er ni tall. */}
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <g
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M3 5.5h14" />
              <path d="M3 10h14" />
              <path d="M3 14.5h14" />
            </g>
          </svg>
        </button>

        <RelavoLogo className="w-[74px] h-auto shrink-0" />

        {/* Hvilken side man står på. På telefon er det ikke synlig noe annet
            sted når menyen er lukket. */}
        <span
          className={`text-[13px] font-semibold truncate ml-auto ${
            mork ? "text-white/70" : "text-dim"
          }`}
        >
          {aktivtSteg}
        </span>
      </header>

      {apen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Lukk menyen"
            onClick={() => setApen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <nav
            className={`relative w-[82vw] max-w-[290px] h-full overflow-y-auto px-4 py-5 flex flex-col border-r ${
              mork ? "bg-ink border-white/15" : "bg-surface border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="min-w-0">
                <RelavoLogo
                  className={`w-[86px] h-auto ${mork ? "text-white" : "text-ink"}`}
                />
                {tittel && (
                  <div
                    className={`mt-1.5 text-[11.5px] truncate ${
                      mork ? "text-white/45" : "text-dim"
                    }`}
                    title={tittel}
                  >
                    {tittel}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setApen(false)}
                aria-label="Lukk menyen"
                className={`-mr-1 -mt-1 p-2 rounded-lg transition ${
                  mork
                    ? "text-white/60 hover:bg-white/10"
                    : "text-dim hover:bg-canvas"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M4 4l10 10" />
                    <path d="M14 4L4 14" />
                  </g>
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-0.5 flex-1">
              {punkter.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  aria-current={aktivtSteg === p.navn ? "page" : undefined}
                  className={`text-[14px] px-3 py-2.5 rounded-lg transition ${
                    aktivtSteg === p.navn
                      ? mork
                        ? "bg-white/15 text-white font-semibold"
                        : "bg-surface2 text-accent font-semibold"
                      : mork
                        ? "text-white/60 hover:bg-white/10 hover:text-white"
                        : "text-dim hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {p.navn}
                </Link>
              ))}
            </div>

            <div className="shrink-0 pt-4">{children}</div>
          </nav>
        </div>
      )}
    </>
  );
}
