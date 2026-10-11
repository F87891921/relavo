import type { SupabaseClient } from "@supabase/supabase-js";
import { hentRoller } from "@/lib/brreg-roller";

/**
 * Screening mot EUs sanksjonsliste.
 *
 * Både selskapet og dem som styrer det. Et sanksjonert selskap bytter navn;
 * styrelederen gjør det sjeldnere, så rollene er ofte det som faktisk
 * treffer.
 *
 * Et treff er ikke en konklusjon. Lista identifiserer med navn, ikke med
 * organisasjonsnummer, så dette er navnelikhet — og navnelikhet tar feil.
 * Ordene rundt treffet er like viktige som treffet: det som står i
 * rapporten må si at det skal verifiseres, ikke at selskapet er sanksjonert.
 */
export type Sanksjonstreff = {
  sokt: string;
  /** Hvor navnet kom fra: selskapet selv, eller en rolle i det. */
  kilde: "selskap" | "rolle";
  rolle: string | null;
  treff: string;
  program: string | null;
  likhet: number;
  eksakt: boolean;
};

export async function screenSanksjoner(
  supabase: SupabaseClient,
  o: { navn: string; orgnr: string },
): Promise<{ treff: Sanksjonstreff[]; listeDato: string | null; kjort: boolean }> {
  const { data: meta } = await supabase
    .from("integrasjoner")
    .select("sist_synk")
    .eq("navn", "sanksjoner")
    .maybeSingle();

  // Er lista aldri hentet, er svaret «ikke kontrollert» — ikke «ingen treff».
  // Det er forskjellen mellom å ha sett etter og å ikke ha sett etter.
  if (!meta?.sist_synk)
    return { treff: [], listeDato: null, kjort: false };

  const treff: Sanksjonstreff[] = [];

  const { data: selskap } = await supabase.rpc("sanksjonstreff", {
    p_navn: o.navn,
    p_slag: "enhet",
  });

  for (const t of selskap ?? [])
    treff.push({
      sokt: o.navn,
      kilde: "selskap",
      rolle: null,
      treff: t.navn,
      program: t.program,
      likhet: t.likhet,
      eksakt: t.eksakt,
    });

  const roller = await hentRoller(o.orgnr);
  if (roller.status === "ok") {
    for (const p of roller.personer) {
      const { data: per } = await supabase.rpc("sanksjonstreff", {
        p_navn: p.navn,
        p_slag: "person",
      });
      for (const t of per ?? [])
        treff.push({
          sokt: p.navn,
          kilde: "rolle",
          rolle: p.rolle,
          treff: t.navn,
          program: t.program,
          likhet: t.likhet,
          eksakt: t.eksakt,
        });
    }
  }

  return { treff, listeDato: meta.sist_synk, kjort: true };
}
