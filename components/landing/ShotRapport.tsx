import { ord } from "@/lib/sprak";

/**
 * Kontrollrapporten. Den viktigste av de tre: hele salgsargumentet er at
 * kontrollen skal kunne vises fram, og dette er tingen som vises fram.
 *
 * Merkene står i ord, ikke bare farge — slik de gjør i den ekte
 * rapporten, fordi den skrives ut i svart-hvitt like ofte som den leses
 * på skjerm. «Ikke sjekket» står med like stor vekt som «Oppfylt»; en
 * rapport som bare lister funnene later som om resten er i orden.
 */
export function ShotRapport() {
  const s = ord().skjermbilde;

  const KRAV = [
    { merke: s.rBrudd, farge: "#c43b3b", ref: "§ 5k", tekst: s.rKjede },
    { merke: s.rBrudd, farge: "#c43b3b", ref: "Renhold", tekst: s.rRenhold },
    { merke: s.rIkke, farge: "#9a6b12", ref: "§ 5i", tekst: s.rSkatt },
    { merke: s.rOk, farge: "#15803d", ref: "§ 24-2", tekst: s.rKonkurs },
    { merke: s.rOk, farge: "#15803d", ref: s.rSanksjoner, tekst: s.rIngenTreff },
  ];

  return (
    <svg
      viewBox="0 0 1600 700"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={s.aRapport}
      style={{ width: "100%", display: "block", background: "#fff" }}
    >
      <rect x="0" y="0" width="1600" height="700" fill="#ffffff" />
      <rect x="0" y="0" width="1600" height="64" fill="#f8f6f9" />
      <line x1="0" y1="64" x2="1600" y2="64" stroke="rgba(40,31,42,0.08)" strokeWidth="1" />
      <text x="40" y="40" fontSize="19" fontWeight="700" fill="#1d1d1f">relavo</text>
      <rect x="1352" y="18" width="218" height="30" rx="8" fill="#654b70" />
      <text x="1461" y="38" fontSize="13" fontWeight="600" fill="#ffffff" textAnchor="middle">{s.rLastNed}</text>

      {/* Brevhodet — rapporten er et dokument, ikke en skjerm */}
      <text x="80" y="130" fontSize="34" fontWeight="700" fill="#1d1d1f">Eksempelbygg AS</text>
      <text x="80" y="160" fontSize="15" fill="rgba(40,31,42,0.58)">918 000 003 · {s.rBransje} · Sandvika</text>

      <rect x="80" y="190" width="1440" height="92" rx="12" fill="#ffffff" stroke="rgba(40,31,42,0.08)" strokeWidth="1" />
      <rect x="108" y="214" width="112" height="26" rx="13" fill="rgba(196,59,59,0.09)" />
      <text x="164" y="232" fontSize="12.5" fontWeight="700" fill="#c43b3b" textAnchor="middle">{s.rHoyRisiko}</text>
      <text x="108" y="266" fontSize="14" fill="rgba(40,31,42,0.58)">{s.rSammendrag}</text>
      <text x="1130" y="224" fontSize="13" fill="rgba(40,31,42,0.48)">{s.rUtfort}</text>
      <text x="1492" y="224" fontSize="13" fontWeight="600" fill="#1d1d1f" textAnchor="end">11. oktober 2026</text>
      <text x="1130" y="252" fontSize="13" fill="rgba(40,31,42,0.48)">{s.rUtfortAv}</text>
      <text x="1492" y="252" fontSize="13" fontWeight="600" fill="#1d1d1f" textAnchor="end">Kari Nordmann</text>

      <text x="80" y="332" fontSize="11.5" fontWeight="700" fill="#654b70" letterSpacing="1.2">{s.rVurdering}</text>
      <line x1="80" y1="348" x2="1520" y2="348" stroke="rgba(40,31,42,0.08)" strokeWidth="1" />

      {KRAV.map((k, i) => {
        const y = 392 + i * 62;
        return (
          <g key={k.ref + i}>
            <text x="80" y={y} fontSize="11.5" fontWeight="700" fill={k.farge} letterSpacing="0.6">{k.merke}</text>
            <text x="260" y={y} fontSize="15" fontWeight="600" fill="#1d1d1f">{k.ref}</text>
            <text x="400" y={y} fontSize="14.5" fill="rgba(40,31,42,0.58)">{k.tekst}</text>
            {i < KRAV.length - 1 && (
              <line x1="80" y1={y + 22} x2="1520" y2={y + 22} stroke="rgba(40,31,42,0.06)" strokeWidth="1" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
