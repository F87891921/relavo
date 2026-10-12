import { brevHtml, brevTekst, type Brev } from "@/lib/epostmal";

/**
 * Alle brev vi sender, bygget ett sted. Samme funksjoner brukes når brevet
 * sendes og når vi viser en forhåndsvisning, slik at det man ser er det som
 * går ut.
 */
export type Ferdig = { emne: string; tekst: string; html: string };

const ferdig = (emne: string, b: Brev): Ferdig => ({ emne, tekst: brevTekst(b), html: brevHtml(b) });

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
) =>
  ferdig(t.epostEmne, {
    hei: t.epostHei,
    avsnitt: [t.epostIngress],
    knapp: { tekst: t.epostKnapp, lenke },
    visLenke: t.epostEllerLenke,
    liten: [t.epostIgnorer],
  });

export const tilbudBrev = (o: {
  kontakt: string | null;
  plan: string;
  total: string;
  lenke: string;
  giltigTil: string | null;
  avsender: string;
  nummer: string;
}) =>
  ferdig(`Tilbud fra Relavo — ${o.nummer}`, {
    hei: `Hei${o.kontakt ? " " + o.kontakt : ""},`,
    avsnitt: [
      `Her er tilbudet fra Relavo på ${o.plan.toLowerCase()} — samlet kontraktsverdi ${o.total} NOK eksklusive merverdiavgift.`,
      ...(o.giltigTil ? [`Tilbudet er gyldig til ${o.giltigTil}.`] : []),
    ],
    knapp: { tekst: "Les og svar på tilbudet", lenke: o.lenke },
    liten: ["Si fra om noe er uklart, så tar vi det derfra."],
    signatur: `Med vennlig hilsen\n${o.avsender}\nRelavo`,
  });

export const svarPaaSakBrev = (o: { svarFra: string; emne: string; tekst: string; lenke: string }) =>
  ferdig(`Svar på saken din — ${o.emne}`, {
    avsnitt: [`${o.svarFra} har svart på saken «${o.emne}».`, o.tekst],
    knapp: { tekst: "Svar i Relavo", lenke: o.lenke },
    liten: ["Du får denne e-posten fordi varsling er slått på for saken. Du kan slå den av på samme side."],
  });

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
  hendelser: { tekst: string; haster: boolean }[];
  kritisk: boolean;
  forsteNavn: string;
  lenke: string;
}) =>
  ferdig(
    o.kritisk
      ? `Endring som krever handling — ${o.forsteNavn}`
      : `${o.hendelser.length} endring${o.hendelser.length === 1 ? "" : "er"} hos leverandørene dere følger`,
    {
      avsnitt: ["Den daglige overvåkingen fant dette siden i går:"],
      punkter: o.hendelser.map((h) => ({ tekst: h.tekst, haster: h.haster })),
      etterPunkter: o.kritisk
        ? "De røde linjene er avvisningsgrunner etter § 24-2, eller gjør det ulovlig å kjøpe tjenesten. De bør ses på i dag."
        : undefined,
      knapp: { tekst: "Åpne oversikten", lenke: o.lenke },
    },
  );
