/**
 * Sentral godkjenning for ansvarsrett — DiBK.
 * https://sgregister.dibk.no/api/enterprises?query={orgnr}
 * Åpent, ingen nøkkel.
 *
 * VIKTIG OM HVA DETTE BETYR:
 *
 * Sentral godkjenning har vært frivillig siden 2016. Den er en
 * kvalitetsordning, ikke et krav for å få bygge. At et foretak IKKE står i
 * registeret er derfor ikke et avvik, og skal aldri vises som ett — det
 * betyr bare at de ikke har søkt.
 *
 * Det motsatte er verdt noe: står de der med gyldig godkjenning, har DiBK
 * gått gjennom kompetanse, erfaring og rutiner. Det er en opplysning i
 * leverandørens favør.
 *
 * Den ene linja som faktisk kan kontrollere noe vi i dag bare spør om:
 * educational_enterprise_approved. Lærlingekravet i § 5h er en egenerklæring
 * i kontrollen vår — her kan den etterprøves.
 */
const BASE = "https://sgregister.dibk.no/api/enterprises";

export type Godkjenningsomrade = {
  funksjon: string;
  fagomrade: string;
  klasse: string;
};

export type Sentralgodkjenning =
  | {
      status: "godkjent";
      navn: string;
      gyldigTil: string | null;
      bevis: string | null;
      larebedrift: boolean;
      ansvarsforsikring: boolean;
      omrader: Godkjenningsomrade[];
    }
  | { status: "utlopt"; navn: string; gyldigTil: string | null }
  /** Ikke et avvik. De har ikke søkt, og det er lov. */
  | { status: "ikke_registrert" }
  | { status: "feil"; melding: string };

export async function hentSentralgodkjenning(
  orgnr: string,
): Promise<Sentralgodkjenning> {
  let svar: Response;
  try {
    svar = await fetch(`${BASE}?query=${encodeURIComponent(orgnr)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
    });
  } catch {
    return { status: "feil", melding: "Fikk ikke kontakt med DiBK." };
  }

  if (!svar.ok) return { status: "feil", melding: `DiBK svarte ${svar.status}.` };

  let j: any;
  try {
    j = await svar.json();
  } catch {
    return { status: "feil", melding: "Uleselig svar fra DiBK." };
  }

  // Søket treffer på navn også, så vi må plukke ut den med riktig nummer.
  const e = (j?.enterprises ?? []).find(
    (x: any) => String(x?.organizational_number) === orgnr,
  );
  if (!e) return { status: "ikke_registrert" };

  const gyldigTil = e?.status?.approval_period_to ?? null;
  const godkjent = e?.status?.approved === true;

  if (!godkjent)
    return { status: "utlopt", navn: e.name, gyldigTil };

  return {
    status: "godkjent",
    navn: e.name,
    gyldigTil,
    bevis: e?.status?.approval_certificate ?? null,
    larebedrift: e?.additional_terms?.educational_enterprise_approved === true,
    ansvarsforsikring: e?.additional_terms?.liability_insurance === true,
    omrader: (e?.valid_approval_areas ?? []).map((o: any) => ({
      funksjon: o?.function ?? "",
      fagomrade: o?.subject_area ?? "",
      klasse: o?.grade ?? "",
    })),
  };
}
