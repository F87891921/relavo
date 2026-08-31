/**
 * Microsofts firrutede merke. Fargene er de offisielle og skal ikke
 * tematiseres — Microsofts merkevareregler krever at logoen står
 * uendret der den brukes som innloggingsknapp.
 */
export function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
