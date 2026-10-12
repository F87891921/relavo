/**
 * Hvem bruker tjenesten og hvem gjør det ikke.
 *
 * Reglene står her, ett sted, og brukes både av siden for ansatte og av den
 * daglige jobben som lager varsler. Terskelene er valgt for at et innkjøp i en
 * kommune ikke kontrollerer hver uke: 30 dager uten noe er verdt å legge
 * merke til, 90 er et spørsmål om kunden kommer til å fornye.
 */
export type Aktivitetsrad = {
  id: string;
  navn: string;
  org_nr: string | null;
  plan: string;
  status: string;
  opprettet: string;
  aktivert: string | null;
  antall_brukere: number;
  antall_leverandorer: number;
  antall_kontroller: number;
  kontroller_30d: number;
  kontroller_forrige_30d: number;
  kontroller_90d: number;
  sist_kontroll: string | null;
  sist_innlogget: string | null;
  kontakt_navn: string | null;
  kontakt_epost: string | null;
  sist_kontaktet: string | null;
};

export type Segment = "aldri" | "inaktiv" | "faller" | "lite";

export type Vurdering = {
  segment: Segment | null;
  /** 30, 60 eller 90 for «inaktiv». */
  tersk: 30 | 60 | 90 | null;
  /** Dager siden sist noe skjedde: innlogging eller kontroll. */
  dager: number;
  /** Tatt kontakt med siste 30 dager: da lar vi dem være. */
  nyligKontaktet: boolean;
};

const DAG = 86_400_000;
const dagerSiden = (iso: string | null, na: number) => (iso ? Math.floor((na - new Date(iso).getTime()) / DAG) : Infinity);

export function vurder(r: Aktivitetsrad, na = Date.now()): Vurdering {
  const nyligKontaktet = dagerSiden(r.sist_kontaktet, na) < 30;
  const alder = dagerSiden(r.aktivert ?? r.opprettet, na);
  const sistAktiv = Math.min(dagerSiden(r.sist_kontroll, na), dagerSiden(r.sist_innlogget, na));
  const dager = Number.isFinite(sistAktiv) ? sistAktiv : alder;

  const ingen = { segment: null, tersk: null, dager, nyligKontaktet } as const;
  if (r.status !== "aktiv") return ingen;

  if (r.antall_kontroller === 0 && alder >= 7) return { segment: "aldri", tersk: null, dager: alder, nyligKontaktet };

  if (dager >= 30) {
    const tersk = dager >= 90 ? 90 : dager >= 60 ? 60 : 30;
    return { segment: "inaktiv", tersk, dager, nyligKontaktet };
  }

  if (r.kontroller_forrige_30d >= 5 && r.kontroller_30d <= r.kontroller_forrige_30d * 0.3)
    return { segment: "faller", tersk: null, dager, nyligKontaktet };

  if (alder >= 60 && r.antall_kontroller > 0 && r.kontroller_90d <= 2)
    return { segment: "lite", tersk: null, dager, nyligKontaktet };

  return ingen;
}
