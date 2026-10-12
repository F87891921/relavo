"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { validerOrgnr } from "@/lib/orgnr";
import { kjorKontroll } from "@/app/(dashboard)/ny-kontroll/handlinger";
import { ord } from "@/lib/sprak";

export type Oppgave = {
  org_nr: string;
  status: "venter" | "kjorer" | "ferdig" | "feilet";
  navn: string | null;
  risiko: "lav" | "middels" | "hoy" | null;
  kontroll_id: string | null;
  feil: string | null;
};

export type Fremdrift = {
  jobbId: string;
  ferdig: boolean;
  totalt: number;
  gjort: number;
  oppgaver: Oppgave[];
};

/**
 * Hvor mange som tas per runde.
 *
 * Hver kontroll er flere oppslag mot Enhetsregisteret, DiBK og
 * sanksjonslista. Åtte om gangen holder seg godt innenfor det en
 * serverhandling får leve, og gir samtidig framdrift ofte nok til at det
 * ser ut som noe skjer. Større bunker er raskere helt til én av dem henger,
 * og da mister man hele bunken i stedet for én.
 */
const PER_RUNDE = 8;

/** Kontrollen uten egenerklæringer: bulk er registeroppslag, ikke intervju. */
const INGEN_EGENERKLARING = {
  offentlig: false,
  sak: {} as Record<string, string>,
  hms: [] as string[],
  espd: null,
  espdFrist: null,
};

export async function startBulk(
  orgnumre: string[],
): Promise<{ ok: true; jobbId: string } | { ok: false; feil: string }> {
  const { supabase, profil, user } = await krevProfil();

  // Valideringen kjøres på nytt her. Nettleseren har allerede gjort den,
  // men det brukeren så er ikke det vi kan la bestemme hva som havner i
  // basen — samme grunn som at oppslaget gjøres om igjen i kjorKontroll.
  const gyldige = Array.from(
    new Set(
      orgnumre
        .map((n) => validerOrgnr(n))
        .filter((v): v is { ok: true; orgnr: string } => v.ok)
        .map((v) => v.orgnr),
    ),
  );

  if (!gyldige.length)
    return { ok: false, feil: ord().feil.ingenGyldigeOrgnr };

  const { data: jobb, error } = await supabase
    .from("bulkjobber")
    .insert({ organisasjon_id: profil.organisasjon_id, startet_av: user.id })
    .select("id")
    .single();

  if (error) return { ok: false, feil: error.message };

  const { error: oppgaveFeil } = await supabase.from("bulkoppgaver").insert(
    gyldige.map((org_nr) => ({
      jobb_id: jobb.id,
      organisasjon_id: profil.organisasjon_id,
      org_nr,
    })),
  );

  if (oppgaveFeil) {
    // Jobben uten oppgaver er en tom rad som bare ville stått og sett ut
    // som en kjøring som aldri kom i gang.
    await supabase.from("bulkjobber").delete().eq("id", jobb.id);
    return { ok: false, feil: oppgaveFeil.message };
  }

  return { ok: true, jobbId: jobb.id };
}

/**
 * Tar neste bunke og kontrollerer den. Kalles om igjen til `ferdig`.
 *
 * Den som kaller er nettleseren, men jobben ligger i basen — lukkes fanen,
 * står de resterende oppgavene som «venter», og kjøringen kan tas opp
 * igjen. Det er forskjellen mellom en kø og en løkke.
 */
export async function kjorBulkRunde(jobbId: string): Promise<Fremdrift> {
  const { supabase } = await krevProfil();

  // Radnivåsikkerheten gjør at en jobb-id fra en annen organisasjon ikke
  // gir noen oppgaver, så det trengs ingen egen eierskapssjekk.
  const { data: tatt } = await supabase.rpc("ta_bulkoppgaver", {
    p_jobb: jobbId,
    p_antall: PER_RUNDE,
  });

  for (const oppgave of (tatt ?? []) as { id: string; org_nr: string }[]) {
    try {
      const res = await kjorKontroll({
        orgnr: oppgave.org_nr,
        ...INGEN_EGENERKLARING,
        espd: null,
      });

      if (res.ok) {
        // Navnet hentes fra leverandøren kontrollen nettopp opprettet
        // eller oppdaterte, så lista kan vise selskap og ikke bare siffer.
        const { data: lev } = await supabase
          .from("leverandorer")
          .select("navn")
          .eq("org_nr", oppgave.org_nr)
          .maybeSingle();

        await supabase
          .from("bulkoppgaver")
          .update({
            status: "ferdig",
            kontroll_id: res.kontrollId,
            risiko: res.risiko,
            navn: lev?.navn ?? null,
            behandlet: new Date().toISOString(),
          })
          .eq("id", oppgave.id);
      } else {
        await supabase
          .from("bulkoppgaver")
          .update({
            status: "feilet",
            feil: res.feil,
            behandlet: new Date().toISOString(),
          })
          .eq("id", oppgave.id);
      }
    } catch (e) {
      // En oppgave som kaster skal ikke bli stående som «kjorer» for
      // alltid. Da ville resten av køen gå videre og jobben aldri bli
      // ferdig, uten at noe sted sa hvorfor.
      await supabase
        .from("bulkoppgaver")
        .update({
          status: "feilet",
          feil: e instanceof Error ? e.message : "Ukjent feil",
          behandlet: new Date().toISOString(),
        })
        .eq("id", oppgave.id);
    }
  }

  return hentFremdrift(jobbId);
}

export async function hentFremdrift(jobbId: string): Promise<Fremdrift> {
  const { supabase } = await krevProfil();

  const { data: oppgaver } = await supabase
    .from("bulkoppgaver")
    .select("org_nr, status, navn, risiko, kontroll_id, feil")
    .eq("jobb_id", jobbId)
    .order("org_nr");

  const alle = (oppgaver ?? []) as Oppgave[];
  const gjort = alle.filter(
    (o) => o.status === "ferdig" || o.status === "feilet",
  ).length;
  const ferdig = alle.length > 0 && gjort === alle.length;

  if (ferdig) {
    await supabase
      .from("bulkjobber")
      .update({ ferdig: new Date().toISOString() })
      .eq("id", jobbId)
      .is("ferdig", null);

    revalidatePath("/leverandorer");
    revalidatePath("/oversikt");
  }

  return { jobbId, ferdig, totalt: alle.length, gjort, oppgaver: alle };
}

/**
 * Jobben som ikke ble ferdig. Lukker man fanen midt i en kjøring, skal
 * siden kunne tilby å ta den opp igjen i stedet for å late som den aldri
 * fantes.
 */
export async function uferdigJobb(): Promise<Fremdrift | null> {
  const { supabase } = await krevProfil();

  const { data: jobb } = await supabase
    .from("bulkjobber")
    .select("id")
    .is("ferdig", null)
    .order("opprettet", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!jobb) return null;

  const f = await hentFremdrift(jobb.id);
  // En jobb uten oppgaver er ikke uferdig, den er tom.
  return f.totalt ? f : null;
}
