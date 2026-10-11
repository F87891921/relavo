/**
 * En liten PDF-skriver.
 *
 * Hvorfor ikke et bibliotek: de to vanlige valgene er enten en hel
 * nettleser på serveren (Puppeteer — tungt, og bygget må da frakte
 * Chromium) eller et renderingslag som vil tegne sine egne komponenter.
 * Rapporten her er tekst i én spalte med overskrifter, linjer og tabeller.
 * Det er omtrent det en PDF består av, og det er mindre kode å skrive den
 * enn å konfigurere noe til å skrive den for oss.
 *
 * Det som faktisk er verdt å være nøye med er to ting:
 *
 * Teksten må brytes på riktig sted, og det krever de ekte bredde­tabellene
 * fra Helvetica. Gjetter man bredder, sklir høyrekanten og dokumentet ser
 * hjemmelaget ut — som er det motsatte av hva en kontrollrapport skal se ut
 * som når den legges ved et anskaffelsesvedtak.
 *
 * Og tegnene må overleve. æ ø å § « » – er alle i WinAnsi, som er
 * kodingen de 14 innebygde fontene bruker, så de trenger ingen innebygd
 * font — men de må oversettes fra Unicode til riktig byte, ellers blir
 * «Brønnøysund» til «Brnnysund» i et dokument som skal arkiveres.
 */

/* ------------------------------------------------------------- Bredder */
// Adobes egne tall for Helvetica, i 1/1000 em. Rekkefølgen er ASCII 32–126.
const V_NORMAL = [
  278, 278, 355, 556, 556, 889, 667, 222, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  222, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const V_FET = [
  278, 333, 474, 556, 556, 889, 722, 278, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  278, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

/**
 * De tegnene over ASCII som faktisk står i en norsk kontrollrapport.
 * Verdien er [WinAnsi-byte, bredde normal, bredde fet]. Aksenttegn er like
 * brede som grunnbokstaven i Helvetica, så Å er like bred som A.
 */
const OVER_ASCII: Record<string, [number, number, number]> = {
  "æ": [0xe6, 889, 889], "ø": [0xf8, 611, 611], "å": [0xe5, 556, 556],
  "Æ": [0xc6, 1000, 1000], "Ø": [0xd8, 778, 778], "Å": [0xc5, 667, 722],
  "ä": [0xe4, 556, 556], "ö": [0xf6, 556, 611], "Ä": [0xc4, 667, 722],
  "Ö": [0xd6, 778, 778], "é": [0xe9, 556, 556], "è": [0xe8, 556, 556],
  "ü": [0xfc, 556, 611], "Ü": [0xdc, 722, 722], "ß": [0xdf, 611, 611],
  "§": [0xa7, 556, 556], "«": [0xab, 556, 556], "»": [0xbb, 556, 556],
  "–": [0x96, 556, 556], "—": [0x97, 1000, 1000], "•": [0x95, 350, 350],
  "“": [0x93, 333, 500], "”": [0x94, 333, 500],
  "‘": [0x91, 222, 278], "’": [0x92, 222, 278],
  "°": [0xb0, 400, 400], "€": [0x80, 556, 556], "…": [0x85, 1000, 1000],
  "·": [0xb7, 278, 278], "©": [0xa9, 737, 737], "®": [0xae, 737, 737],
  "±": [0xb1, 584, 584], "½": [0xbd, 834, 834], "¼": [0xbc, 834, 834],
  "×": [0xd7, 584, 584], "™": [0x99, 1000, 1000], "†": [0x86, 556, 556],
  "£": [0xa3, 556, 556], "¶": [0xb6, 537, 556], "‰": [0x89, 1000, 1000],
  " ": [0x20, 278, 278], // hardt mellomrom → vanlig
  "​": [-1, 0, 0],       // nullbreddemellomrom → bort
};

function tegn(c: string, fet: boolean): [number, number] {
  const k = c.charCodeAt(0);
  if (k >= 32 && k <= 126) {
    const b = (fet ? V_FET : V_NORMAL)[k - 32];
    return [k, b];
  }
  const o = OVER_ASCII[c];
  if (o) return [o[0], fet ? o[2] : o[1]];
  // Ukjent tegn blir spørsmålstegn. Å slippe det gjennom rått gir en
  // byte som leseren tolker som noe helt annet.
  return [63, fet ? 611 : 556];
}

function bredde(s: string, storrelse: number, fet: boolean): number {
  let b = 0;
  for (const c of s) b += tegn(c, fet)[1];
  return (b * storrelse) / 1000;
}

/** PDF-strenger: parenteser og bakstrek må rømmes, høye bytes skrives oktalt. */
function pdfStreng(s: string, fet: boolean): string {
  let ut = "";
  for (const c of s) {
    const [b] = tegn(c, fet);
    if (b < 0) continue;
    if (b === 0x28 || b === 0x29 || b === 0x5c) ut += "\\" + String.fromCharCode(b);
    else if (b < 32 || b > 126) ut += "\\" + b.toString(8).padStart(3, "0");
    else ut += String.fromCharCode(b);
  }
  return ut;
}

/* --------------------------------------------------------------- Sider */

const A4 = { bredde: 595.28, hoyde: 841.89 };
const MARG = { venstre: 56, hoyre: 56, topp: 64, bunn: 64 };
const SPALTE = A4.bredde - MARG.venstre - MARG.hoyre;

type Farge = [number, number, number];

export const GRAFITT: Farge = [0.11, 0.11, 0.12];
export const DIM: Farge = [0.42, 0.4, 0.42];
export const AKSENT: Farge = [0.4, 0.29, 0.44];
export const ROD: Farge = [0.69, 0.16, 0.16];
export const GRONN: Farge = [0.13, 0.43, 0.26];
export const GUL: Farge = [0.6, 0.38, 0.06];

export class Pdf {
  private sider: string[] = [];
  private na = "";
  private y = A4.hoyde - MARG.topp;
  private bunntekst = "";

  constructor(bunntekst = "") {
    this.bunntekst = bunntekst;
  }

  /** Plassen som er igjen på siden. Brukes til å holde ting samlet. */
  get plass() {
    return this.y - MARG.bunn;
  }

  nySide() {
    if (this.na) this.sider.push(this.na);
    this.na = "";
    this.y = A4.hoyde - MARG.topp;
  }

  /** Bryt til ny side hvis det som kommer ikke får plass på denne. */
  sikrePlass(h: number) {
    if (this.plass < h) this.nySide();
  }

  luft(h: number) {
    this.y -= h;
  }

  private farge(f: Farge) {
    this.na += `${f[0]} ${f[1]} ${f[2]} rg\n`;
  }

  /**
   * Tekst med linjebryting. Returnerer hvor mange linjer det ble, så
   * kallstedet kan regne ut høyden på forhånd når det trengs.
   */
  tekst(
    s: string,
    o: {
      storrelse?: number;
      fet?: boolean;
      farge?: Farge;
      x?: number;
      bredde?: number;
      linjehoyde?: number;
      etter?: number;
    } = {},
  ) {
    const st = o.storrelse ?? 10;
    const fet = o.fet ?? false;
    const x = o.x ?? MARG.venstre;
    const maks = o.bredde ?? SPALTE;
    const lh = o.linjehoyde ?? st * 1.45;

    for (const avsnitt of s.split("\n")) {
      const linjer = this.bryt(avsnitt, maks, st, fet);
      for (const linje of linjer) {
        if (this.plass < lh) this.nySide();
        this.y -= lh;
        this.farge(o.farge ?? GRAFITT);
        this.na +=
          `BT /${fet ? "F2" : "F1"} ${st} Tf ` +
          `${x.toFixed(2)} ${this.y.toFixed(2)} Td ` +
          `(${pdfStreng(linje, fet)}) Tj ET\n`;
      }
    }
    if (o.etter) this.luft(o.etter);
  }

  private bryt(s: string, maks: number, st: number, fet: boolean): string[] {
    if (!s.trim()) return [""];
    const ord = s.split(/\s+/).filter(Boolean);
    const ut: string[] = [];
    let linje = "";
    for (const o of ord) {
      const forslag = linje ? `${linje} ${o}` : o;
      if (bredde(forslag, st, fet) <= maks) {
        linje = forslag;
      } else {
        if (linje) ut.push(linje);
        // Et enkelt ord som er bredere enn spalten må kuttes, ellers
        // renner det ut av siden.
        if (bredde(o, st, fet) > maks) {
          let bit = "";
          for (const c of o) {
            if (bredde(bit + c, st, fet) > maks) {
              ut.push(bit);
              bit = c;
            } else bit += c;
          }
          linje = bit;
        } else linje = o;
      }
    }
    if (linje) ut.push(linje);
    return ut;
  }

  /** Vannrett strek. */
  strek(o: { farge?: Farge; tykkelse?: number; etter?: number } = {}) {
    if (this.plass < 8) this.nySide();
    const f = o.farge ?? [0.89, 0.88, 0.9];
    this.y -= 4;
    this.na +=
      `${f[0]} ${f[1]} ${f[2]} RG ${(o.tykkelse ?? 0.6).toFixed(2)} w ` +
      `${MARG.venstre} ${this.y.toFixed(2)} m ${(A4.bredde - MARG.hoyre).toFixed(2)} ${this.y.toFixed(2)} l S\n`;
    this.luft(o.etter ?? 10);
  }

  /** Fylt flate bak noe — brukes til risikoboksen øverst. */
  flate(h: number, f: Farge) {
    if (this.plass < h) this.nySide();
    this.na +=
      `${f[0]} ${f[1]} ${f[2]} rg ` +
      `${MARG.venstre} ${(this.y - h).toFixed(2)} ${SPALTE.toFixed(2)} ${h.toFixed(2)} re f\n`;
  }

  /**
   * Etikett til venstre, verdi til høyre. Verdien brytes i sin egen spalte,
   * så en lang kilde ikke skyver etiketten ut av stilling.
   */
  rad(etikett: string, verdi: string, o: { farge?: Farge; fet?: boolean } = {}) {
    const etikettBredde = 132;
    const verdiBredde = SPALTE - etikettBredde;
    const linjer = this.bryt(verdi, verdiBredde, 9.5, o.fet ?? false);
    const h = Math.max(1, linjer.length) * 13.8 + 2;

    this.sikrePlass(h);
    const topp = this.y;

    this.tekst(etikett, { storrelse: 9.5, farge: DIM, linjehoyde: 13.8 });
    const etterEtikett = this.y;

    this.y = topp;
    this.tekst(verdi, {
      storrelse: 9.5,
      fet: o.fet,
      farge: o.farge,
      x: MARG.venstre + etikettBredde,
      bredde: verdiBredde,
      linjehoyde: 13.8,
    });

    this.y = Math.min(this.y, etterEtikett) - 2;
  }

  /**
   * Et punkt med statusmerke foran. Merket er tekst, ikke farge alene —
   * rapporten skrives ut i svart-hvitt like ofte som den leses på skjerm.
   */
  punkt(merke: string, tittel: string, tekst: string, f: Farge) {
    const merkeBredde = 74;
    const innrykk = MARG.venstre + merkeBredde;
    const b = SPALTE - merkeBredde;

    const linjerT = this.bryt(tittel, b, 9.5, true).length;
    const linjerS = tekst ? this.bryt(tekst, b, 9.5, false).length : 0;
    this.sikrePlass(linjerT * 13.4 + linjerS * 13 + 8);

    const topp = this.y;
    this.tekst(merke, { storrelse: 8, fet: true, farge: f, linjehoyde: 13.4 });
    this.y = topp;

    this.tekst(tittel, {
      storrelse: 9.5, fet: true, x: innrykk, bredde: b, linjehoyde: 13.4,
    });
    if (tekst)
      this.tekst(tekst, {
        storrelse: 9.5, farge: DIM, x: innrykk, bredde: b, linjehoyde: 13,
      });
    this.luft(7);
  }

  overskrift(s: string) {
    this.sikrePlass(46);
    this.luft(8);
    this.tekst(s.toUpperCase(), {
      storrelse: 8.5, fet: true, farge: AKSENT, linjehoyde: 12,
    });
    this.strek({ etter: 8 });
  }

  /**
   * Ferdig fil, som ArrayBuffer. Latin-1 fordi WinAnsi er en enbytes­koding
   * — én byte per tegn er hele poenget med å slippe å bygge inn en font.
   */
  bygg(): ArrayBuffer {
    if (this.na) this.sider.push(this.na);
    if (!this.sider.length) this.sider.push("");

    // Bunnteksten legges på til slutt, når vi vet hvor mange sider det ble.
    const n = this.sider.length;
    const sider = this.sider.map((innhold, i) => {
      if (!this.bunntekst && n === 1) return innhold;
      const linje = `${this.bunntekst}${this.bunntekst ? "  ·  " : ""}Side ${i + 1} av ${n}`;
      const b = bredde(linje, 7.5, false);
      return (
        innhold +
        `${DIM[0]} ${DIM[1]} ${DIM[2]} rg\n` +
        `BT /F1 7.5 Tf ${(A4.bredde - MARG.hoyre - b).toFixed(2)} ${(MARG.bunn - 24).toFixed(2)} Td ` +
        `(${pdfStreng(linje, false)}) Tj ET\n`
      );
    });

    const objekter: string[] = [];
    const leggTil = (s: string) => objekter.push(s) && objekter.length;

    // 1 katalog, 2 sidetre, 3 og 4 fonter, så par av side + innhold.
    const sideIder = sider.map((_, i) => 5 + i * 2);

    leggTil("<< /Type /Catalog /Pages 2 0 R >>");
    leggTil(
      `<< /Type /Pages /Count ${n} /Kids [${sideIder.map((i) => `${i} 0 R`).join(" ")}] >>`,
    );
    leggTil(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    );
    leggTil(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    );

    sider.forEach((innhold, i) => {
      const id = sideIder[i];
      leggTil(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.bredde} ${A4.hoyde}] ` +
          `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${id + 1} 0 R >>`,
      );
      leggTil(
        `<< /Length ${Buffer.byteLength(innhold, "latin1")} >>\nstream\n${innhold}endstream`,
      );
    });

    let ut = "%PDF-1.4\n%âãÏÓ\n";
    const steder: number[] = [];
    objekter.forEach((o, i) => {
      steder.push(Buffer.byteLength(ut, "latin1"));
      ut += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });

    const kryss = Buffer.byteLength(ut, "latin1");
    ut += `xref\n0 ${objekter.length + 1}\n0000000000 65535 f \n`;
    for (const s of steder) ut += `${String(s).padStart(10, "0")} 00000 n \n`;
    ut +=
      `trailer\n<< /Size ${objekter.length + 1} /Root 1 0 R >>\n` +
      `startxref\n${kryss}\n%%EOF\n`;

    const b = Buffer.from(ut, "latin1");
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
  }
}
