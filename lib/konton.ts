import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { planFor } from "@/lib/plan";

/**
 * Kundekontoene, slik personalet trenger å se dem.
 *
 * Tallene kommer fra kontooversikt() i basen, som bare gir aggregater — se
 * 0020. Kvoten og prisen legges på her, der planene allerede er definert.
 */
export type Konto = {
  id: string;
  navn: string;
  org_nr: string | null;
  plan: string;
  status: string;
  betalingsmate: string | null;
  opprettet: string;
  antall_brukere: number;
  antall_leverandorer: number;
  antall_kontroller: number;
  kontroller_30d: number;
  sist_aktiv: string | null;
  kontakt_navn: string | null;
};

export const hentKonton = cache(async (): Promise<Konto[]> => {
  const supabase = createClient();
  const { data } = await supabase.rpc("kontooversikt");
  return (data ?? []) as Konto[];
});

/**
 * Månedsinntekten. Engangskunder teller ikke med — de har ingen
 * månedsavgift, og å regne dem inn ville gitt en MRR vi ikke får inn.
 * Stengte og avslåtte kontoer teller heller ikke.
 */
export const mrr = (konton: Konto[]) =>
  konton
    .filter((k) => k.status === "aktiv" && k.plan !== "engangs")
    .reduce((s, k) => s + planFor(k.plan).manedspris, 0);
