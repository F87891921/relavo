import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Én kontroll, hentet fram igjen.
 *
 * Kontrollene ble lagret fra første dag, men det fantes ingen vei tilbake
 * til dem. Hele salgsargumentet er at kontrollen skal kunne vises fram —
 * journalføringsplikten gjelder det som faktisk ble gjort, ikke at noen
 * husker at det ble gjort. Modellen her er delt mellom skjermen og PDF-en
 * med vilje: to forskjellige uttrekk ville før eller siden gitt to
 * forskjellige svar på hva kontrollen fant.
 */

import type { Nokkeltall } from "@/lib/nokkeltall";

export type Krav = {
  ref: string;
  status: "ok" | "no" | "na";
  tekst: string;
  notat?: string;
};

export type Kilde = {
  navn: string;
  status: "svar" | "vedlegg" | "ikke";
  tidspunkt: string | null;
};

export type Ledd = {
  niva: number;
  navn: string;
  org_nr: string;
  over_grense: boolean;
};

export type IndikatorRad = { id: string; niva: "info" | "varsel"; tittel: string; tekst: string };

export type Javrad = {
  type_kobling: string;
  person_navn: string;
  person_rolle: string;
  deltaker_navn: string;
  deltaker_rolle: string;
  eksakt: boolean;
  avvik: number;
};

export type Kontrollrapport = {
  id: string;
  utfort: string;
  utfortAv: string | null;
  risiko: "lav" | "middels" | "hoy";
  organisasjon: { navn: string; orgNr: string | null };
  leverandor: { navn: string; orgNr: string; bransje: string | null; sted: string | null };
  krav: Krav[];
  kilder: Kilde[];
  kjede: Ledd[];
  indikatorer: IndikatorRad[];
  nokkeltall: Nokkeltall | null;
  jav: Javrad[];
};

/** Antall krav som ikke er oppfylt. Det er tallet som betyr noe. */
export const antallBrudd = (krav: Krav[]) =>
  krav.filter((k) => k.status === "no").length;

/** Antall punkter vi ikke fikk kontrollert. Skal aldri skjules. */
export const antallUkontrollert = (krav: Krav[]) =>
  krav.filter((k) => k.status === "na").length;

export async function hentKontrollrapport(
  supabase: SupabaseClient,
  id: string,
): Promise<Kontrollrapport | null> {
  // Radnivåsikkerheten gjør jobben: en id fra en annen organisasjon gir
  // ingen rad, ikke en rad vi må huske å avvise.
  const { data: k } = await supabase
    .from("kontroller")
    // Én sammenhengende streng: deles den i to, klarer ikke typene i
    // supabase-js å lese den, og raden blir til `unknown`.
    .select("id, utfort, risiko, krav, kilder, indikatorer, nokkeltall, utfort_av, organisasjon_id, leverandor_id, leverandorer(navn, org_nr, bransje, sted)")
    .eq("id", id)
    .maybeSingle();

  if (!k) return null;

  const [{ data: org }, { data: person }, { data: kjede }, { data: jav }] =
    await Promise.all([
      supabase
        .from("organisasjoner")
        .select("navn, org_nr")
        .eq("id", k.organisasjon_id)
        .maybeSingle(),
      k.utfort_av
        ? supabase.from("profiler").select("navn").eq("id", k.utfort_av).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("kjede_ledd")
        .select("niva, navn, org_nr, over_grense")
        .eq("kontroll_id", id)
        .order("niva"),
      supabase
        .from("jav_treff")
        .select("type_kobling, detaljer")
        .eq("kontroll_id", id),
    ]);

  const lev = k.leverandorer as unknown as {
    navn: string; org_nr: string; bransje: string | null; sted: string | null;
  } | null;

  return {
    id: k.id,
    utfort: k.utfort,
    utfortAv: (person as { navn?: string } | null)?.navn ?? null,
    risiko: k.risiko,
    organisasjon: { navn: org?.navn ?? "—", orgNr: org?.org_nr ?? null },
    leverandor: {
      navn: lev?.navn ?? "—",
      orgNr: lev?.org_nr ?? "—",
      bransje: lev?.bransje ?? null,
      sted: lev?.sted ?? null,
    },
    krav: (k.krav ?? []) as Krav[],
    kilder: (k.kilder ?? []) as Kilde[],
    kjede: (kjede ?? []) as Ledd[],
    indikatorer: (k.indikatorer ?? []) as IndikatorRad[],
    nokkeltall: (k.nokkeltall ?? null) as Nokkeltall | null,
    jav: (jav ?? []).map((r) => {
      const d = (r.detaljer ?? {}) as Record<string, unknown>;
      return {
        type_kobling: r.type_kobling,
        person_navn: String(d.person_navn ?? ""),
        person_rolle: String(d.person_rolle ?? ""),
        deltaker_navn: String(d.deltaker_navn ?? ""),
        deltaker_rolle: String(d.deltaker_rolle ?? ""),
        eksakt: Boolean(d.eksakt),
        avvik: Number(d.avvik ?? 0),
      };
    }),
  };
}
