import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Hvor mange renholdsvirksomheter som ikke er godkjent.
 *
 * Tallet står på landingssiden. Det hentes, det skrives ikke inn: et tall
 * i en setning blir feil den dagen registeret endrer seg, og da står det
 * en påstand på forsiden vår som ikke stemmer lenger.
 *
 * Returnerer null når oppslaget ikke går. Da vises ikke tallet i det hele
 * tatt — en forside som gjetter er verre enn en forside uten tall.
 */
export type Renholdstall = {
  totalt: number;
  ikkeGodkjente: number;
  /** Hele prosenter. «41 %» er like sant som «40,6 %» og lettere å lese. */
  andel: number;
  /** Når registeret sist ble hentet. Et tall uten dato er en påstand. */
  hentet: string | null;
};

export const renholdstall = cache(async (): Promise<Renholdstall | null> => {
  const supabase = createClient();
  const { data } = await supabase.rpc("renholdstall");

  const rad = Array.isArray(data) ? data[0] : null;
  if (!rad) return null;

  const totalt = Number(rad.totalt);
  const ikkeGodkjente = Number(rad.ikke_godkjente);
  if (!totalt || !Number.isFinite(ikkeGodkjente)) return null;

  return {
    totalt,
    ikkeGodkjente,
    andel: Math.round((ikkeGodkjente / totalt) * 100),
    hentet: (rad.sist_hentet as string | null) ?? null,
  };
});
