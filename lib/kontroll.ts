/**
 * Delte data og typer for kontrollen. Ligger her, og ikke i handlinger.ts,
 * fordi den filen er merket "use server": der må alt som eksporteres være
 * async funksjoner. En vanlig konstant blir en serverreferanse i stedet for
 * data når klienten importerer den, og feiler først når den brukes.
 */
export const HMS_PUNKTER = [
  { k: "tariff", ref: "§ 5g", t: "Leverandøren har bekreftet at lønn utbetales via bank" },
  { k: "hms", ref: "HMS", t: "Alle arbeidstakere på kontrakten har gyldig HMS-kort" },
  { k: "lonn", ref: "§ 5j", t: "Lønns- og arbeidsvilkår følger landsomfattende tariffavtale" },
  { k: "lare", ref: "§ 5h", t: "Lærlingekravet er vurdert for denne kontrakten" },
  { k: "ue", ref: "§ 5k", t: "Antall ledd underleverandører er kartlagt og dokumentert" },
] as const;

export type Svar = {
  orgnr: string;
  offentlig: boolean;
  sak: Record<string, string>;
  hms: string[];
  espd: "finnes" | "be" | null;
  espdFrist: string | null;
};

export type Resultat =
  | { ok: true; kontrollId: string; risiko: string }
  | { ok: false; feil: string };
