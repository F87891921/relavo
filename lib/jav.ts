import type { SupabaseClient } from "@supabase/supabase-js";
import { hentRoller, type Rolleperson } from "@/lib/brreg-roller";
import { liknerPa } from "@/lib/navnelikhet";

/**
 * Jav-kontroll: krysser styret og daglig leder hos leverandøren mot folk
 * organisasjonen selv har registrert som deltakere i anskaffelsen.
 *
 * Et treff er ikke en konklusjon om inhabilitet — det er et varsel om at
 * noen må se på det. Forvaltningsloven § 6 avgjøres av en person, ikke av
 * en navnesammenligning.
 */
export type JavTreff = {
  deltaker_id: string;
  leverandor_id: string;
  type_kobling: "styre" | "daglig_leder";
  detaljer: {
    deltaker_navn: string;
    deltaker_rolle: string;
    person_navn: string;
    person_rolle: string;
    fodselsdato: string | null;
    eksakt: boolean;
    avvik: number;
  };
};

export type JavResultat = {
  treff: JavTreff[];
  /** Sant når vi faktisk fikk rollene. Ellers er kontrollen ikke utført. */
  rollerHentet: boolean;
  merknad?: string;
};

export async function finnJav(
  supabase: SupabaseClient,
  opts: {
    organisasjonId: string;
    leverandorId: string;
    orgnr: string;
  },
): Promise<JavResultat> {
  const { data: deltakere } = await supabase
    .from("prosjektdeltakere")
    .select("id, navn, rolle")
    .eq("organisasjon_id", opts.organisasjonId);

  // Ingen deltakere registrert: ingenting å krysse mot. Da er dette ikke
  // «ingen jav funnet», men «ikke kontrollert» — og det skal sies.
  if (!deltakere?.length) {
    return {
      treff: [],
      rollerHentet: false,
      merknad:
        "Ingen prosjektdeltakere er registrert, så det finnes ingenting å krysse styret mot.",
    };
  }

  const roller = await hentRoller(opts.orgnr);

  if (roller.status === "feil")
    return { treff: [], rollerHentet: false, merknad: roller.melding };

  if (roller.status === "ingen")
    return {
      treff: [],
      rollerHentet: true,
      merknad: "Enhetsregisteret har ingen registrerte roller på selskapet.",
    };

  const treff: JavTreff[] = [];

  for (const d of deltakere) {
    for (const p of roller.personer as Rolleperson[]) {
      const likhet = liknerPa(d.navn, p.navn);
      if (!likhet.treff) continue;

      treff.push({
        deltaker_id: d.id,
        leverandor_id: opts.leverandorId,
        type_kobling: p.kobling,
        detaljer: {
          deltaker_navn: d.navn,
          deltaker_rolle: d.rolle,
          person_navn: p.navn,
          person_rolle: p.rolle,
          fodselsdato: p.fodselsdato,
          eksakt: likhet.eksakt,
          avvik: likhet.avvik,
        },
      });
    }
  }

  return {
    treff,
    rollerHentet: true,
    merknad:
      "Eiersiden er ikke kontrollert. Aksjonærregisteret finnes bare som årlig fil fra Skatteetaten, ikke som oppslag.",
  };
}
