import { Pdf, GRAFITT, DIM, AKSENT, ROD, GRONN, GUL } from "@/lib/pdf";
import { RELAVO, relavoOrgNr } from "@/lib/relavo";
import {
  antallBrudd,
  antallUkontrollert,
  type Kontrollrapport,
} from "@/lib/kontrollrapport";

/**
 * Kontrollrapporten som PDF.
 *
 * Dokumentet er skrevet for å bli lagt ved en sak, ikke for å se bra ut på
 * en skjerm. Derfor: ingen farge som bærer mening alene, hvert punkt har
 * et merke i ord, og de tre tingene en ettergåer spør om — hvem, hva og
 * når — står øverst før noe annet.
 *
 * Det som ikke ble kontrollert står like tydelig som det som ble det. En
 * rapport som bare lister funnene later som om resten er i orden.
 */

const DATO = (s: string) =>
  new Date(s).toLocaleDateString("nb-NO", {
    day: "2-digit", month: "long", year: "numeric",
  });

const KLOKKE = (s: string) =>
  new Date(s).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

const RISIKOORD = { lav: "Lav risiko", middels: "Middels risiko", hoy: "Høy risiko" };
const RISIKOFARGE = { lav: GRONN, middels: GUL, hoy: ROD };

const KRAVMERKE = {
  ok: { ord: "OPPFYLT", farge: GRONN },
  no: { ord: "BRUDD", farge: ROD },
  na: { ord: "IKKE SJEKKET", farge: GUL },
};

const KILDEMERKE = {
  svar: { ord: "SVAR", farge: GRONN },
  vedlegg: { ord: "VEDLEGG", farge: GRONN },
  ikke: { ord: "IKKE SVAR", farge: GUL },
};

const KOBLING: Record<string, string> = {
  styre: "Styremedlem",
  daglig_leder: "Daglig leder",
  eier: "Eier",
  naer_relasjon: "Nær relasjon",
};

export function kontrollrapportPdf(r: Kontrollrapport): ArrayBuffer {
  const pdf = new Pdf(`${RELAVO.produkt} · ${r.leverandor.orgNr}`);

  /* ------------------------------------------------------------ Hode */
  pdf.tekst(RELAVO.produkt, { storrelse: 19, fet: true, farge: AKSENT });
  pdf.tekst(
    `${RELAVO.navn} · org.nr ${relavoOrgNr()} · ${RELAVO.nett}`,
    { storrelse: 8, farge: DIM, etter: 16 },
  );

  pdf.tekst("Leverandørkontroll", { storrelse: 24, fet: true, etter: 2 });
  pdf.tekst(r.leverandor.navn, { storrelse: 15, farge: DIM, etter: 14 });

  /* -------------------------------------------------------- Konklusjon */
  const brudd = antallBrudd(r.krav);
  const ukontrollert = antallUkontrollert(r.krav);

  // Høyden må romme begge linjene i boksen (13 + 12) med luft over og
  // under. For lav boks, og den andre linja henger utenfor flaten.
  pdf.flate(46, [0.97, 0.96, 0.975]);
  pdf.luft(11);
  pdf.tekst(RISIKOORD[r.risiko], {
    storrelse: 11,
    fet: true,
    farge: RISIKOFARGE[r.risiko],
    x: 68,
    linjehoyde: 13,
  });
  pdf.tekst(
    brudd === 0
      ? `Ingen brudd funnet. ${ukontrollert} ${ukontrollert === 1 ? "punkt" : "punkter"} kunne ikke kontrolleres.`
      : `${brudd} ${brudd === 1 ? "krav er ikke oppfylt" : "krav er ikke oppfylt"}. ${ukontrollert} ${ukontrollert === 1 ? "punkt" : "punkter"} kunne ikke kontrolleres.`,
    { storrelse: 9, farge: DIM, x: 68, linjehoyde: 12 },
  );
  pdf.luft(22);

  /* ------------------------------------------------------------ Fakta */
  pdf.overskrift("Om kontrollen");
  pdf.rad("Leverandør", `${r.leverandor.navn} (org.nr ${r.leverandor.orgNr})`, { fet: true });
  if (r.leverandor.bransje) pdf.rad("Bransje", r.leverandor.bransje);
  if (r.leverandor.sted) pdf.rad("Sted", r.leverandor.sted);
  pdf.rad("Oppdragsgiver", r.organisasjon.orgNr
    ? `${r.organisasjon.navn} (org.nr ${r.organisasjon.orgNr})`
    : r.organisasjon.navn);
  pdf.rad("Utført", `${DATO(r.utfort)} kl. ${KLOKKE(r.utfort)}`);
  pdf.rad("Utført av", r.utfortAv ?? "—");
  pdf.rad("Referanse", r.id);
  pdf.luft(6);

  /* -------------------------------------------------------- Vurderingen */
  pdf.overskrift("Vurdering mot regelverket");

  // Brudd først. En rapport som lister kravene i den rekkefølgen koden
  // tilfeldigvis la dem inn, lar det viktigste drukne.
  const rekkefolge = { no: 0, na: 1, ok: 2 };
  const sortert = [...r.krav].sort(
    (a, b) => rekkefolge[a.status] - rekkefolge[b.status],
  );

  for (const k of sortert) {
    const m = KRAVMERKE[k.status];
    pdf.punkt(m.ord, k.ref, [k.tekst, k.notat].filter(Boolean).join(" "), m.farge);
  }

  /* ------------------------------------------------------------ Kilder */
  pdf.overskrift("Kilder");
  if (!r.kilder.length) {
    pdf.tekst("Ingen kilder er registrert på kontrollen.", {
      storrelse: 9.5, farge: DIM, etter: 6,
    });
  } else {
    for (const kilde of r.kilder) {
      const m = KILDEMERKE[kilde.status] ?? KILDEMERKE.ikke;
      pdf.punkt(
        m.ord,
        kilde.navn,
        kilde.tidspunkt ? `Hentet ${DATO(kilde.tidspunkt)}` : "Ikke hentet",
        m.farge,
      );
    }
  }

  /* ------------------------------------------------------------- Kjede */
  if (r.kjede.length) {
    pdf.overskrift("Leverandørkjede (§ 5k)");
    for (const l of r.kjede) {
      pdf.punkt(
        l.niva === 0 ? "HOVED" : `LEDD ${l.niva}`,
        `${l.navn} · ${l.org_nr}`,
        l.over_grense ? "Over grensen for antall ledd i § 5k." : "",
        l.over_grense ? ROD : GRAFITT,
      );
    }
  }

  /* --------------------------------------------------------------- Jav */
  pdf.overskrift("Interessekonflikt (forvaltningsloven § 6)");
  if (!r.jav.length) {
    pdf.tekst(
      "Ingen mulige koblinger mellom leverandørens styre og registrerte deltakere i anskaffelsen.",
      { storrelse: 9.5, farge: DIM, etter: 6 },
    );
  } else {
    for (const j of r.jav) {
      pdf.punkt(
        j.eksakt ? "IDENTISK" : `${j.avvik} TEGN`,
        `${j.person_navn} — ${KOBLING[j.type_kobling] ?? j.type_kobling} hos leverandøren`,
        `Ligner ${j.deltaker_navn} (${j.deltaker_rolle}) hos oppdragsgiver. ` +
          `Treffet er navnelikhet, ikke en avgjørelse om inhabilitet.`,
        j.eksakt ? ROD : GUL,
      );
    }
  }

  /* ----------------------------------------------------------- Forbehold */
  pdf.overskrift("Forbehold");
  pdf.tekst(
    "Kontrollen bygger på offentlige registre slik de sto på tidspunktet over, og på det " +
      "leverandøren selv har oppgitt. Et register kan være utdatert, og en egenerklæring kan " +
      "være uriktig. Treff mot sanksjonslister og mot deltakere i anskaffelsen er navnelikhet " +
      "og må verifiseres før de legges til grunn. Punkter merket «ikke sjekket» er ikke " +
      "kontrollert — de er ikke funnet i orden.",
    { storrelse: 9, farge: DIM, linjehoyde: 13, etter: 10 },
  );
  pdf.tekst(
    `Utstedt av ${RELAVO.navn}, org.nr ${relavoOrgNr()}, ${RELAVO.adresse}.`,
    { storrelse: 8, farge: DIM },
  );

  return pdf.bygg();
}
