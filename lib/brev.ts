/**
 * Brevene kunden skal sende selv.
 *
 * Relavo sender dem ikke. Kommunen er journalføringspliktig: hvert utgående
 * saksdokument skal føres i deres eget arkiv. Et brev sendt fra relavo.no
 * havner aldri der, og finnes ikke igjen ved en innsynsbegjæring eller en
 * klage til KOFA. Svaret ville dessuten kommet til oss i stedet for til dem.
 *
 * Derfor: vi skriver utkastet, de sender det fra sitt eget system, og vi
 * lagrer hva som ble spurt om og hva som kom tilbake.
 */

export function virkedagerFram(antall: number, fra = new Date()): Date {
  const d = new Date(fra);
  let igjen = antall;
  while (igjen > 0) {
    d.setDate(d.getDate() + 1);
    // 0 = søndag, 6 = lørdag. Helligdager tas ikke høyde for — de varierer,
    // og fristen skal uansett settes av den som sender.
    if (d.getDay() !== 0 && d.getDay() !== 6) igjen--;
  }
  return d;
}

export const somDato = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Kravet etter § 24-9. Må være konkret om hva som skal forklares — et
 * generelt spørsmål om prisen oppfyller ikke plikten, og KOFA har underkjent
 * anskaffelser der kravet var for løst formulert.
 */
export function redegjorelseBrev(o: {
  leverandor: string;
  anskaffelseRef: string;
  anskaffelseNavn: string;
  avvikProsent: number;
  frist: string;
}) {
  return `Vi viser til deres tilbud i ${o.anskaffelseRef} — ${o.anskaffelseNavn}.

Tilbudssummen ligger ${Math.abs(o.avvikProsent)} % under medianen av de øvrige tilbudene. Før vi tar stilling til tilbudet ber vi om en redegjørelse etter anskaffelsesforskriften § 24-9, særlig om:

  – hvordan lønns- og arbeidsvilkår er kalkulert
  – hvilke underleverandører som inngår, og i hvor mange ledd
  – om det er lagt til grunn offentlig støtte
  – hvordan produksjonsmetode og tekniske løsninger gir lavere kostnad

Frist for svar er ${o.frist}.

Manglende eller utilstrekkelig redegjørelse kan føre til at tilbudet avvises.`;
}

/** Forespørsel om ettersending av ESPD, etter § 23-5. */
export function espdBrev(o: {
  leverandor: string;
  anskaffelseRef: string;
  frist: string;
}) {
  return `Vi viser til deres tilbud i ${o.anskaffelseRef}.

Vi kan ikke se at ESPD-egenerklæring er levert med tilbudet. Vi ber om at den ettersendes.

Manglende egenerklæring er normalt en mangel som kan rettes etter anskaffelsesforskriften § 23-5, i motsetning til innholdet i selve tilbudet.

Frist for ettersending er ${o.frist}.`;
}

/**
 * mailto-lenke som åpner kundens egen e-postklient med alt ferdig utfylt.
 *
 * Sendes derfra, går brevet ut fra kommunens egen adresse og kan
 * journalføres som ethvert annet utgående dokument. Svaret kommer til dem.
 */
export function mailtoLenke(o: {
  til?: string | null;
  emne: string;
  tekst: string;
}) {
  const p = new URLSearchParams();
  p.set("subject", o.emne);
  p.set("body", o.tekst);
  // URLSearchParams koder mellomrom som +, men mailto krever %20.
  return `mailto:${o.til ?? ""}?${p.toString().replace(/\+/g, "%20")}`;
}

/**
 * Dager igjen til en frist. Negativt betyr passert.
 *
 * Ligger her og ikke i EspdRad, som er merket "use client". En vanlig
 * funksjon eksportert derfra blir en klientreferanse når en serverkomponent
 * importerer den — den ser ut som en funksjon, men lar seg ikke kalle.
 */
export function dagerIgjen(frist: string | null): number | null {
  if (!frist) return null;
  const d = new Date(frist);
  d.setHours(23, 59, 59);
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}
