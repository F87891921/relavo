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
 * Hilsen og underskrift.
 *
 * Brevene gikk før rett på «Vi viser til deres tilbud». Det er korrekt, og
 * det leses som et vedtak. Disse brevene er de første kunden sender til en
 * leverandør de kanskje skal jobbe med i fire år — de skal være tydelige,
 * ikke kalde. Navn på begge sider koster ingenting og endrer tonen helt.
 */
function hilsen(navn?: string | null, selskap?: string | null): string {
  if (navn?.trim()) return `Hei ${navn.trim()},`;
  if (selskap?.trim()) return `Til ${selskap.trim()},`;
  return "Hei,";
}

function underskrift(navn?: string | null, org?: string | null): string {
  const linjer = ["Med vennlig hilsen", navn?.trim(), org?.trim()].filter(Boolean);
  // Bare «Med vennlig hilsen» og ingenting under er verre enn ingen hilsen.
  return linjer.length > 1 ? `\n\n${linjer.join("\n")}` : "";
}

export type Avsender = {
  /** Den som sender — saksbehandleren, ikke Relavo. */
  avsenderNavn?: string | null;
  /** Oppdragsgiver. Kommunen eller fylkeskommunen. */
  avsenderOrg?: string | null;
};

/**
 * Kravet etter § 24-9. Må være konkret om hva som skal forklares — et
 * generelt spørsmål om prisen oppfyller ikke plikten, og KOFA har underkjent
 * anskaffelser der kravet var for løst formulert.
 */
export function redegjorelseBrev(
  o: Avsender & {
    leverandor: string;
    mottakerNavn?: string | null;
    anskaffelseRef: string;
    anskaffelseNavn: string;
    avvikProsent: number;
    frist: string;
  },
) {
  return `${hilsen(o.mottakerNavn, o.leverandor)}

Vi viser til deres tilbud i ${o.anskaffelseRef} — ${o.anskaffelseNavn}.

Tilbudssummen ligger ${Math.abs(o.avvikProsent)} % under medianen av de øvrige tilbudene. Før vi tar stilling til tilbudet ber vi om en redegjørelse etter anskaffelsesforskriften § 24-9, særlig om:

  – hvordan lønns- og arbeidsvilkår er kalkulert
  – hvilke underleverandører som inngår, og i hvor mange ledd
  – om det er lagt til grunn offentlig støtte
  – hvordan produksjonsmetode og tekniske løsninger gir lavere kostnad

Frist for svar er ${o.frist}.

Manglende eller utilstrekkelig redegjørelse kan føre til at tilbudet avvises.${underskrift(o.avsenderNavn, o.avsenderOrg)}`;
}

/**
 * Forespørsel om ettersending av ESPD, etter § 23-5.
 *
 * Lenken går til en side der leverandøren laster opp erklæringen og
 * bekrefter med navn og rolle. Uten den måtte de svare på e-post, og
 * vedlegget havnet i en innboks i stedet for i saken.
 */
export function espdBrev(
  o: Avsender & {
    leverandor: string;
    mottakerNavn?: string | null;
    anskaffelseRef: string;
    frist: string;
    lenke?: string | null;
  },
) {
  const opplasting = o.lenke
    ? `\n\nErklæringen kan lastes opp her:\n${o.lenke}\n\nLenken gjelder bare denne forespørselen.`
    : "";

  return `${hilsen(o.mottakerNavn, o.leverandor)}

Vi viser til deres tilbud i ${o.anskaffelseRef}.

Vi kan ikke se at ESPD-egenerklæring er levert med tilbudet, og ber om at den ettersendes.

Manglende egenerklæring er normalt en mangel som kan rettes etter anskaffelsesforskriften § 23-5, i motsetning til innholdet i selve tilbudet.

Frist for ettersending er ${o.frist}.${opplasting}${underskrift(o.avsenderNavn, o.avsenderOrg)}`;
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
