import { ord } from "@/lib/sprak";

/**
 * Unormalt lave tilbud, § 24-9.
 *
 * Den tredje av de tre fordi den viser en regning kunden ellers gjør for
 * hånd: avviket mot medianen av de ØVRIGE tilbudene. Regnes tilbudet med
 * i sin egen median, trekker et svært lavt tilbud ned grunnlaget sitt og
 * ser mindre lavt ut enn det er — og det er nettopp det tilfellet
 * forskriften er skrevet for.
 */
export function ShotTilbud() {
  const s = ord().skjermbilde;

  const RADER = [
    { navn: "Testrenhold AS", sum: "21 400 000", avvik: "−39 %", lav: true },
    { navn: "Demoservice ANS", sum: "33 800 000", avvik: "−4 %", lav: false },
    { navn: "Vestlandsrenhold AS", sum: "35 200 000", avvik: "+4 %", lav: false },
    { navn: "Fjordservice AS", sum: "36 900 000", avvik: "+9 %", lav: false },
  ];

  return (
    <svg
      viewBox="0 0 1600 700"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={s.aTilbud}
      style={{ width: "100%", display: "block", background: "#fff" }}
    >
      <rect x="0" y="0" width="1600" height="700" fill="#ffffff" />
      <rect x="0" y="0" width="1600" height="64" fill="#f8f6f9" />
      <line x1="0" y1="64" x2="1600" y2="64" stroke="rgba(40,31,42,0.08)" strokeWidth="1" />
      <text x="40" y="40" fontSize="19" fontWeight="700" fill="#1d1d1f">relavo</text>

      <text x="80" y="128" fontSize="34" fontWeight="600" fill="#1d1d1f">{s.tTittel}</text>
      <text x="80" y="160" fontSize="15" fill="rgba(40,31,42,0.58)">K-2026-118 · {s.tMedian} 34 500 000 NOK</text>

      {/* Kolonnehoder */}
      <text x="80" y="226" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)" letterSpacing="0.8">{s.tTilbyder}</text>
      <text x="640" y="226" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)" letterSpacing="0.8">{s.tSum}</text>
      <text x="900" y="226" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)" letterSpacing="0.8">{s.tAvvik}</text>
      <text x="1240" y="226" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)" letterSpacing="0.8">{s.tVurdering}</text>
      <line x1="80" y1="242" x2="1520" y2="242" stroke="rgba(40,31,42,0.08)" strokeWidth="1" />

      {RADER.map((r, i) => {
        const y = 290 + i * 66;
        const f = r.lav ? "#c43b3b" : "rgba(40,31,42,0.58)";
        return (
          <g key={r.navn}>
            <text x="80" y={y} fontSize="15.5" fontWeight={r.lav ? 700 : 500} fill={r.lav ? "#1d1d1f" : "rgba(40,31,42,0.58)"}>{r.navn}</text>
            <text x="640" y={y} fontSize="15" fill="#1d1d1f">{r.sum}</text>
            <text x="900" y={y} fontSize="15" fontWeight="700" fill={f}>{r.avvik}</text>
            {/* Stolpen gjør avviket til noe man ser, ikke regner */}
            <rect x="1000" y={y - 13} width="190" height="7" rx="3.5" fill="#eeeaef" />
            <rect x="1000" y={y - 13} width={r.lav ? 150 : 32} height="7" rx="3.5" fill={r.lav ? "#c43b3b" : "#cfc7d3"} />
            {r.lav ? (
              <>
                <rect x="1240" y={y - 20} width="226" height="28" rx="14" fill="rgba(196,59,59,0.09)" />
                <text x="1353" y={y - 1} fontSize="12.5" fontWeight="700" fill="#c43b3b" textAnchor="middle">{s.tUndersokelse}</text>
              </>
            ) : (
              <text x="1240" y={y} fontSize="13.5" fill="rgba(40,31,42,0.48)">{s.tNormalt}</text>
            )}
            {i < RADER.length - 1 && (
              <line x1="80" y1={y + 24} x2="1520" y2={y + 24} stroke="rgba(40,31,42,0.06)" strokeWidth="1" />
            )}
          </g>
        );
      })}

      {/* Det som faktisk er produktet: brevet skriver seg selv */}
      <rect x="80" y="572" width="1440" height="76" rx="12" fill="#f8f6f9" stroke="rgba(40,31,42,0.08)" strokeWidth="1" />
      <text x="112" y="604" fontSize="14.5" fontWeight="600" fill="#1d1d1f">{s.tBrevTittel}</text>
      <text x="112" y="628" fontSize="13.5" fill="rgba(40,31,42,0.58)">{s.tBrevTekst}</text>
      <rect x="1304" y="588" width="184" height="44" rx="10" fill="#654b70" />
      <text x="1396" y="616" fontSize="13.5" fontWeight="600" fill="#ffffff" textAnchor="middle">{s.tBrevKnapp}</text>
    </svg>
  );
}
