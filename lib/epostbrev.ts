import { brevHtml, brevTekst, type Brev } from "@/lib/epostmal";
import { ordbokFor, type Sprak } from "@/lib/sprak";

/**
 * Alle brev vi sender, bygget ett sted. Samme funksjoner brukes når brevet
 * sendes og når vi viser en forhåndsvisning, slik at det man ser er det som
 * går ut.
 *
 * Språket velges av den som mottar: kundens profil for varsler og svar, og
 * et eget valg på tilbudet. Interne brev til oss selv er på norsk.
 */
export type Ferdig = { emne: string; tekst: string; html: string };

const fyll = (s: string, v: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

const ferdig = (emne: string, b: Brev, sprak: Sprak = "no"): Ferdig => {
  const m = { tittel: emne, sprak, ...b };
  return { emne, tekst: brevTekst(m), html: brevHtml(m) };
};

export const glemtPassordBrev = (
  t: {
    epostEmne: string;
    epostHei: string;
    epostIngress: string;
    epostKnapp: string;
    epostEllerLenke: string;
    epostIgnorer: string;
  },
  lenke: string,
  sprak: Sprak = "no",
) =>
  ferdig(
    t.epostEmne,
    {
      hei: t.epostHei,
      avsnitt: [t.epostIngress],
      knapp: { tekst: t.epostKnapp, lenke },
      visLenke: t.epostEllerLenke,
      liten: [t.epostIgnorer],
    },
    sprak,
  );

export const tilbudBrev = (o: {
  sprak: Sprak;
  kontakt: string | null;
  plan: string;
  total: string;
  lenke: string;
  giltigTil: string | null;
  avsender: string;
  nummer: string;
}) => {
  const t = ordbokFor(o.sprak).epost.tilbud;
  return ferdig(
    fyll(t.emne, { nr: o.nummer }),
    {
      tittel: t.tittel,
      hei: o.kontakt ? fyll(t.heiNavn, { navn: o.kontakt }) : t.hei,
      avsnitt: [
        fyll(t.ingress, { plan: o.plan.toLowerCase(), total: o.total }),
        ...(o.giltigTil ? [fyll(t.gyldig, { dato: o.giltigTil })] : []),
      ],
      knapp: { tekst: t.knapp, lenke: o.lenke },
      liten: [t.liten],
      signatur: `${t.hilsen}\n${o.avsender}\nRelavo`,
    },
    o.sprak,
  );
};

export const svarPaaSakBrev = (o: { sprak: Sprak; svarFra: string; emne: string; tekst: string; lenke: string }) => {
  const t = ordbokFor(o.sprak).epost.svar;
  return ferdig(
    fyll(t.emne, { emne: o.emne }),
    {
      avsnitt: [fyll(t.ingress, { fra: o.svarFra, emne: o.emne }), o.tekst],
      knapp: { tekst: t.knapp, lenke: o.lenke },
      liten: [t.liten],
    },
    o.sprak,
  );
};

export const nySakBrev = (o: { emne: string; organisasjon: string | null; tekst: string; nySak: boolean; lenke: string }) =>
  ferdig(o.nySak ? `Ny støttesak — ${o.emne}` : `Kunden har svart — ${o.emne}`, {
    avsnitt: [o.organisasjon ?? "Ukjent organisasjon", o.tekst],
    knapp: { tekst: "Åpne saken", lenke: o.lenke },
  });

export const henvendelseBrev = (o: {
  navn: string;
  epost: string;
  organisasjon: string | null;
  telefon: string | null;
  kategori: string;
  melding: string;
  lenke: string;
}) =>
  ferdig(`Kontaktskjema — ${o.navn}${o.organisasjon ? `, ${o.organisasjon}` : ""}`, {
    avsnitt: [
      [o.navn, o.epost, o.telefon, o.organisasjon].filter(Boolean).join("\n"),
      `Gjelder: ${o.kategori}`,
      o.melding,
    ],
    knapp: { tekst: "Åpne henvendelsen", lenke: o.lenke },
  });

export const overvakingBrev = (o: {
  sprak: Sprak;
  hendelser: { navn: string; slag: string; haster: boolean }[];
  forsteNavn: string;
  lenke: string;
}) => {
  const t = ordbokFor(o.sprak).epost.overvaking;
  const tekster = t.hendelser as Record<string, string>;
  const kritisk = o.hendelser.some((h) => h.haster);
  return ferdig(
    kritisk
      ? fyll(t.emneKritisk, { navn: o.forsteNavn })
      : o.hendelser.length === 1
        ? t.emne1
        : fyll(t.emneN, { n: o.hendelser.length }),
    {
      avsnitt: [t.ingress],
      punkter: o.hendelser.map((h) => ({ tekst: `${h.navn} ${tekster[h.slag] ?? h.slag}`, haster: h.haster })),
      etterPunkter: kritisk ? t.haster : undefined,
      knapp: { tekst: t.knapp, lenke: o.lenke },
    },
    o.sprak,
  );
};

/** Til leverandøren: oppgi underleverandørene dine. Samme brev brukes til purring. */
export const foresporselBrev = (o: { kunde: string; leverandor: string; lenke: string; frist: string; purring: number }) =>
  ferdig(
    o.purring ? `Påminnelse: underleverandører for ${o.kunde}` : `${o.kunde} ber om en oversikt over underleverandørene dine`,
    {
      tittel: o.purring ? "En liten påminnelse" : "Hvem utfører arbeidet?",
      hei: "Hei,",
      avsnitt: [
        `${o.kunde} har en avtale med ${o.leverandor} og må dokumentere hvem som utfører arbeidet, også underleverandørene.`,
        "Det tar noen minutter. Du legger inn organisasjonsnumrene til selskapene som utfører deler av oppdraget for dere, eller svarer at dere ikke bruker underleverandører.",
        `Vi ber om svar innen ${o.frist}.`,
      ],
      knapp: { tekst: "Oppgi underleverandører", lenke: o.lenke },
      liten: ["Du trenger ikke opprette konto. Lenken er personlig for dette oppdraget."],
    },
  );

/** Til kunden: leverandøren har svart. */
export const foresporselSvartBrev = (o: { leverandor: string; antall: number; ingen: boolean; lenke: string }) =>
  ferdig(`${o.leverandor} har svart på kjedeforespørselen`, {
    avsnitt: [
      o.ingen
        ? `${o.leverandor} har bekreftet at de ikke bruker underleverandører på oppdraget.`
        : `${o.leverandor} har oppgitt ${o.antall} underleverandør${o.antall === 1 ? "" : "er"}. Hver av dem er slått opp og kontrollert.`,
    ],
    knapp: { tekst: "Se kjeden", lenke: o.lenke },
  });
