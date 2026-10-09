"use client";

import { useEffect } from "react";

/**
 * Siste skanse når noe kaster under rendering i nettleseren.
 *
 * Uten denne viser Next sin egen «Application error: a client-side
 * exception has occurred» — en setning som ikke sier hva brukeren skal
 * gjøre, og som på norsk og svensk ikke sier noe i det hele tatt.
 *
 * Den vanligste årsaken er ikke en feil i koden: det er en fane som har
 * stått åpen over en ny utrulling. Da peker siden på en js-bit som ikke
 * finnes lenger, innlastingen feiler, og alt stopper. Den feilen kan vi
 * rette selv — last siden på nytt én gang, så henter den den nye versjonen.
 * Én gang, og bare én: en reload-løkke er verre enn en feilmelding.
 */
const NOKKEL = "relavo_lastet_pa_nytt";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const bitMangler =
    error.name === "ChunkLoadError" ||
    /Loading chunk|Failed to fetch dynamically imported|Importing a module script failed/i.test(
      error.message,
    );

  useEffect(() => {
    if (!bitMangler) return;
    try {
      if (sessionStorage.getItem(NOKKEL)) return;
      sessionStorage.setItem(NOKKEL, "1");
      location.reload();
    } catch {
      // Privat vindu uten sessionStorage. Da står knappen igjen.
    }
  }, [bitMangler]);

  return (
    <html lang="no">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#f8f7f9",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#1d1d1f",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            {bitMangler ? "Siden er oppdatert" : "Noe gikk galt"}
          </div>
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "#86868b",
              margin: "0 0 20px",
            }}
          >
            {bitMangler
              ? "Vi la ut en ny versjon mens du hadde siden åpen. Last den på nytt, så er du i gang igjen."
              : "Vi klarte ikke å vise denne siden. Prøv på nytt — går det ikke, si fra til oss, så ser vi på det."}
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(NOKKEL);
                } catch {}
                location.reload();
              }}
              style={{
                background: "#654b70",
                color: "#fff",
                border: 0,
                borderRadius: 12,
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Last siden på nytt
            </button>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#fff",
                color: "#1d1d1f",
                border: "1px solid rgba(40,31,42,0.14)",
                borderRadius: 12,
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Prøv igjen
            </button>
          </div>

          {/* Referansen Vercel logger feilen under. Uten den er «det
              krasjet» alt vi har å gå på når noen melder fra. */}
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                color: "rgba(29,29,31,0.42)",
                marginTop: 18,
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
