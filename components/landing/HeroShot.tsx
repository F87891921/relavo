import { ord } from "@/lib/sprak";
/**
 * Produktbildet i heroen. Ren SVG, ingen rasterfil — den skalerer skarpt
 * på alle skjermer og koster ingenting å laste. Innholdet er det samme
 * demoselskapet som migreringen legger inn: Bergen kommune.
 */
export function HeroShot() {
  const s9 = ord().skjermbilde;
  return (
        <svg viewBox="0 0 1600 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Relavo: Leverandører" style={{width: '100%', display: 'block', borderRadius: '11px 11px 0 0', overflow: 'hidden', background: '#fff'}}>
        <rect x="0" y="0" width="1600" height="700" fill="#ffffff"/>
        <rect x="0" y="0" width="1600" height="64" fill="#f8f6f9"/>
        <line x1="0" y1="64" x2="1600" y2="64" stroke="rgba(40,31,42,0.08)" strokeWidth="1"/>
        <text x="40" y="40" fontFamily="Inter, sans-serif" fontSize="19" fontWeight="700" fill="#1d1d1f">relavo</text>
        <rect x="1352" y="18" width="118" height="30" rx="8" fill="#654b70"/>
        <text x="1411" y="38" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#ffffff" textAnchor="middle">{s9.nyKontroll}</text>
        <rect x="1482" y="18" width="88" height="30" rx="8" fill="none" stroke="rgba(40,31,42,0.16)" strokeWidth="1"/>
        <text x="1526" y="38" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="500" fill="#1d1d1f" textAnchor="middle">{s9.loggUt}</text>
        <rect x="0" y="64" width="260" height="636" fill="#ffffff"/>
        <line x1="260" y1="64" x2="260" y2="700" stroke="rgba(40,31,42,0.08)" strokeWidth="1"/>
        <text x="32" y="108" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#654b70">{s9.plussNyKontroll}</text>
        <rect x="16" y="130" width="228" height="38" rx="8" fill="#f1ecf3" stroke="rgba(40,31,42,0.08)" strokeWidth="1"/>
        <text x="32" y="154" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#1d1d1f">{s9.leverandorer}</text>
        <text x="32" y="204" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">{s9.overvakninger}</text>
        <text x="32" y="248" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">{s9.historikk}</text>
        <text x="32" y="292" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">{s9.leverandorkjede}</text>
        <circle cx="34" cy="648" r="18" fill="#654b70"/>
        <text x="34" y="653" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#ffffff" textAnchor="middle">A</text>
        <text x="62" y="644" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#1d1d1f">Anna Andersen</text>
        <text x="62" y="661" fontFamily="Inter, sans-serif" fontSize="11" fill="rgba(40,31,42,0.38)">anna@eksempel.no</text>
        <text x="300" y="128" fontFamily="Inter, sans-serif" fontSize="36" fontWeight="600" fill="#1d1d1f">{s9.leverandorer}</text>
        <text x="300" y="158" fontFamily="Inter, sans-serif" fontSize="15" fill="rgba(40,31,42,0.58)">{s9.aktiveLeverandorer}</text>
        <rect x="300" y="188" width="1264" height="108" rx="12" fill="#ffffff" stroke="rgba(40,31,42,0.08)" strokeWidth="1"/>
        <text x="330" y="226" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="700" fill="#1d1d1f">{s9.kontrollplikt}</text>
        <text x="330" y="250" fontFamily="Inter, sans-serif" fontSize="13" fill="rgba(40,31,42,0.58)">{s9.dokumentert}</text>
        <rect x="330" y="266" width="1204" height="8" rx="4" fill="#e9e3ec"/>
        <rect x="330" y="266" width="1106" height="8" rx="4" fill="#654b70"/>
        <rect x="300" y="326" width="640" height="46" rx="10" fill="#ffffff" stroke="rgba(40,31,42,0.16)" strokeWidth="1"/>
        <circle cx="326" cy="349" r="7" fill="none" stroke="rgba(40,31,42,0.38)" strokeWidth="1.6"/>
        <line x1="331" y1="354" x2="337" y2="360" stroke="rgba(40,31,42,0.38)" strokeWidth="1.6" strokeLinecap="round"/>
        <text x="346" y="354" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.38)">{s9.sokPlassholder}</text>
        <rect x="958" y="326" width="70" height="46" rx="23" fill="#ffffff" stroke="#654b70" strokeWidth="1.5"/>
        <text x="993" y="354" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill="#654b70" textAnchor="middle">{s9.alle}</text>
        <rect x="1040" y="326" width="196" height="46" rx="23" fill="#ffffff" stroke="rgba(40,31,42,0.16)" strokeWidth="1"/>
        <text x="1138" y="354" fontFamily="Inter, sans-serif" fontSize="13" fill="#1d1d1f" textAnchor="middle">{s9.lavRisiko}</text>
        <rect x="1248" y="326" width="118" height="46" rx="23" fill="#ffffff" stroke="rgba(40,31,42,0.16)" strokeWidth="1"/>
        <text x="1307" y="354" fontFamily="Inter, sans-serif" fontSize="13" fill="#1d1d1f" textAnchor="middle">{s9.hoyRisiko}</text>
        <rect x="1378" y="326" width="86" height="46" rx="23" fill="#ffffff" stroke="rgba(40,31,42,0.16)" strokeWidth="1"/>
        <text x="1421" y="354" fontFamily="Inter, sans-serif" fontSize="13" fill="#1d1d1f" textAnchor="middle">A–Å</text>
        <text x="300" y="416" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)">{s9.kolSelskap}</text>
        <text x="650" y="416" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)">{s9.kolOrgnr}</text>
        <text x="870" y="416" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)">{s9.kolSist}</text>
        <text x="1150" y="416" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="rgba(40,31,42,0.38)">{s9.kolStatus}</text>
        <line x1="300" y1="430" x2="1564" y2="430" stroke="rgba(40,31,42,0.08)" strokeWidth="1"/>
        <text x="300" y="466" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="600" fill="#654b70">Eksempelbygg AS</text>
        <text x="650" y="466" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">918 000 001</text>
        <text x="870" y="466" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">2. jul 2026</text>
        <circle cx="1150" cy="461" r="4" fill="#15803d"/>
        <text x="1162" y="466" fontFamily="Inter, sans-serif" fontSize="14" fill="#15803d">{s9.lavRisiko}</text>
        <line x1="300" y1="484" x2="1564" y2="484" stroke="rgba(40,31,42,0.06)" strokeWidth="1"/>
        <text x="300" y="518" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="600" fill="#654b70">Testrengjøring AS</text>
        <text x="650" y="518" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">918 000 002</text>
        <text x="870" y="518" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">1. jul 2026</text>
        <circle cx="1150" cy="513" r="4" fill="#15803d"/>
        <text x="1162" y="518" fontFamily="Inter, sans-serif" fontSize="14" fill="#15803d">{s9.lavRisiko}</text>
        <line x1="300" y1="536" x2="1564" y2="536" stroke="rgba(40,31,42,0.06)" strokeWidth="1"/>
        <text x="300" y="570" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="600" fill="#654b70">Demoservice ANS</text>
        <text x="650" y="570" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">918 000 003</text>
        <text x="870" y="570" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">28. jun 2026</text>
        <circle cx="1150" cy="565" r="4" fill="#c43b3b"/>
        <text x="1162" y="570" fontFamily="Inter, sans-serif" fontSize="14" fill="#c43b3b">{s9.hoyRisiko}</text>
        <line x1="300" y1="588" x2="1564" y2="588" stroke="rgba(40,31,42,0.06)" strokeWidth="1"/>
        <text x="300" y="622" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="600" fill="#654b70">Prøvemark &amp; Grunn AS</text>
        <text x="650" y="622" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">918 000 004</text>
        <text x="870" y="622" fontFamily="Inter, sans-serif" fontSize="14" fill="rgba(40,31,42,0.58)">25. jun 2026</text>
        <circle cx="1150" cy="617" r="4" fill="#15803d"/>
        <text x="1162" y="622" fontFamily="Inter, sans-serif" fontSize="14" fill="#15803d">{s9.lavRisiko}</text>
        </svg>
  );
}
