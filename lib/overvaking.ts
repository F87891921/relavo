import { slaOppEnhet } from "@/lib/brreg";
import { hentRoller } from "@/lib/brreg-roller";

/**
 * Hva som har endret seg siden sist.
 *
 * Overvåking er ikke å kjøre kontrollen på nytt hver natt. Det er å
 * sammenligne mot forrige svar og si fra om differansen. En kunde som får
 * den samme rapporten hver dag slutter å lese den.
 *
 * Alvorsgraden er ikke en smakssak:
 *
 *   kritisk  — endringen er i seg selv en avvisningsgrunn etter § 24-2,
 *              eller gjør det ulovlig å kjøpe tjenesten. Konkurs, og tap
 *              av renholdsgodkjenning.
 *   advarsel — endringen kan bety noe, men krever at et menneske ser på
 *              den. Ny daglig leder kan være en ny inhabilitet.
 *   info     — verdt å vite, utløser ingenting. Nytt regnskap levert.
 */
export type Slag =
  | "konkurs"
  | "under_avvikling"
  | "tvangsavvikling"
  | "navneendring"
  | "ny_daglig_leder"
  | "styreendring"
  | "renhold_mistet_godkjenning"
  | "renhold_godkjent"
  | "nytt_regnskap"
  | "slettet_fra_register";

export type Hendelse = {
  slag: Slag;
  alvor: "kritisk" | "advarsel" | "info";
  fra: string | null;
  til: string | null;
};

/** Det vi husker fra forrige kjøring. */
export type Tilstand = {
  navn?: string;
  konkurs?: boolean;
  underAvvikling?: boolean;
  underTvangsavvikling?: boolean;
  dagligLeder?: string | null;
  styre?: string[];
  renhold?: string | null;
  finnes?: boolean;
};

const ALVOR: Record<Slag, Hendelse["alvor"]> = {
  konkurs: "kritisk",
  tvangsavvikling: "kritisk",
  renhold_mistet_godkjenning: "kritisk",
  slettet_fra_register: "kritisk",
  under_avvikling: "advarsel",
  ny_daglig_leder: "advarsel",
  styreendring: "advarsel",
  navneendring: "info",
  renhold_godkjent: "info",
  nytt_regnskap: "info",
};

const h = (slag: Slag, fra: string | null, til: string | null): Hendelse => ({
  slag,
  alvor: ALVOR[slag],
  fra,
  til,
});

/**
 * Henter fersk tilstand og sammenligner.
 *
 * Første gang en leverandør ses finnes det ingenting å sammenligne mot. Da
 * lagres tilstanden og det skrives ingen hendelser — ellers ville hver ny
 * leverandør utløst et varsel om at den «ble konkurs», bare fordi vi ikke
 * visste om den før.
 */
export async function sjekkLeverandor(
  orgnr: string,
  forrige: Tilstand | null,
): Promise<{ tilstand: Tilstand; hendelser: Hendelse[] }> {
  const oppslag = await slaOppEnhet(orgnr);

  if (oppslag.status === "feil") throw new Error(oppslag.melding);

  if (oppslag.status === "ikke-funnet") {
    const na: Tilstand = { ...forrige, finnes: false };
    // Et selskap som forsvinner fra registeret er ikke en registerfeil —
    // det er slettet, og da finnes det ingen motpart i kontrakten.
    const hendelser =
      forrige && forrige.finnes !== false
        ? [h("slettet_fra_register", orgnr, null)]
        : [];
    return { tilstand: na, hendelser };
  }

  const e = oppslag.enhet;
  const roller = await hentRoller(orgnr);
  // Svarer registeret ikke, beholder vi forrige verdi. Alternativet er å
  // melde «daglig leder fjernet» hver gang Brønnøysund har en dårlig dag.
  const harRoller = roller.status === "ok";
  const dagligLeder = harRoller
    ? (roller.personer.find((r) => r.kobling === "daglig_leder")?.navn ?? null)
    : (forrige?.dagligLeder ?? null);
  const styre = harRoller
    ? roller.personer.filter((r) => r.kobling === "styre").map((r) => r.navn).sort()
    : (forrige?.styre ?? []);

  const na: Tilstand = {
    navn: e.navn,
    konkurs: e.konkurs,
    underAvvikling: e.underAvvikling,
    underTvangsavvikling: e.underTvangsavvikling,
    dagligLeder,
    styre,
    renhold: forrige?.renhold ?? null,
    finnes: true,
  };

  if (!forrige) return { tilstand: na, hendelser: [] };

  const ut: Hendelse[] = [];
  if (!forrige.konkurs && e.konkurs) ut.push(h("konkurs", "nei", "ja"));
  if (!forrige.underTvangsavvikling && e.underTvangsavvikling)
    ut.push(h("tvangsavvikling", "nei", "ja"));
  if (!forrige.underAvvikling && e.underAvvikling)
    ut.push(h("under_avvikling", "nei", "ja"));
  if (forrige.navn && forrige.navn !== e.navn)
    ut.push(h("navneendring", forrige.navn, e.navn));

  if (harRoller) {
    if ((forrige.dagligLeder ?? null) !== dagligLeder)
      ut.push(h("ny_daglig_leder", forrige.dagligLeder ?? null, dagligLeder));

    const før = (forrige.styre ?? []).join("|");
    if (før && før !== styre.join("|"))
      ut.push(h("styreendring", `${(forrige.styre ?? []).length} medlemmer`, `${styre.length} medlemmer`));
  }

  return { tilstand: na, hendelser: ut };
}

/**
 * Renholdsgodkjenningen sammenlignes for seg, fordi den kommer fra en
 * 22 MB stor fil som hentes én gang per kjøring og ikke per leverandør.
 */
export function sjekkRenhold(
  forrige: Tilstand | null,
  naStatus: string | null,
): Hendelse[] {
  const før = forrige?.renhold ?? null;
  if (!naStatus || før === naStatus || !før) return [];
  if (før === "godkjent" && naStatus !== "godkjent")
    return [h("renhold_mistet_godkjenning", før, naStatus)];
  if (før !== "godkjent" && naStatus === "godkjent")
    return [h("renhold_godkjent", før, naStatus)];
  return [];
}
