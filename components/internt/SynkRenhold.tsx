"use client";

import { useOrd } from "@/components/Sprakgiver";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Hämtar Arbeidstilsynets renholdsregister till databasen. Körs för hand,
 * inte automatiskt: filen är 22 MB och uppdateras en gång per dygn, så det
 * finns ingen anledning att hämta den oftare än någon gör det.
 */
export function SynkRenhold({
  sistHentet,
  antall,
}: {
  sistHentet: string | null;
  antall: number;
}) {
  const t = useOrd();
  const router = useRouter();
  const [venter, start] = useTransition();
  const [melding, setMelding] = useState("");
  const [feil, setFeil] = useState("");

  function hamta() {
    setFeil("");
    setMelding("");
    start(async () => {
      try {
        const svar = await fetch("/api/synk-renhold", { method: "POST" });
        const data = await svar.json();
        if (!svar.ok) {
          setFeil(data.feil ?? t.internt.hentingFeilet);
          return;
        }
        setMelding(
          `${data.antall} verksamheter hämtade — ${data.godkjente} godkända, ${data.ikkeGodkjente} inte godkända.`,
        );
        router.refresh();
      } catch {
        setFeil(t.internt.ingenKontaktServer);
      }
    });
  }

  return (
    <div className="bg-surface rounded-card border border-border shadow-card p-6 mb-5">
      <h2 className="text-[15px] font-semibold mb-1">
        {t.internt.renholdsregister}
      </h2>
      <p className="text-[12.5px] text-dim mb-4 leading-relaxed max-w-[70ch]">
        Sedan 2012 är det olagligt att köpa städtjänster från bolag som inte är
        godkända här. Registret innehåller <b>både</b> godkända och icke
        godkända — ett träff betyder alltså inte att bolaget är godkänt.
        Öppen fil under NLOD 2.0, uppdateras varje morgon.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={hamta}
          disabled={venter}
          className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
        >
          {venter ? t.internt.henter22 : t.internt.hentRegisteret}
        </button>

        <span className="text-[12.5px] text-dim">
          {sistHentet ? (
            <>
              Senast hämtat{" "}
              <b className="text-ink">
                {new Date(sistHentet).toLocaleString("sv-SE")}
              </b>{" "}
              · {antall} verksamheter
            </>
          ) : (
            <b className="text-warn">{t.internt.aldriHentet}</b>
          )}
        </span>
      </div>

      {melding && (
        <div className="text-xs text-good bg-good-bg rounded-xl px-3.5 py-2.5 mt-4">
          {melding}
        </div>
      )}
      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-4">
          {feil}
        </div>
      )}
    </div>
  );
}
