"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { admin } from "@/lib/supabase/admin";
import { planFor } from "@/lib/plan";
import { erGyldig, manglendeKrav, KRAV } from "@/lib/passord";
import { ord } from "@/lib/sprak";
import { avsluttAbonnementer } from "@/lib/stripe";

export type Svar = { ok: true; melding?: string } | { ok: false; feil: string };

const t = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

/* ------------------------------------------------------- Egne innstillinger */

export async function oppdaterEgetNavn(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevProfil();
  const navn = t(fd, "navn");
  if (!navn) return { ok: false, feil: ord().feil.navnTomt };

  const { error } = await supabase.from("profiler").update({ navn }).eq("id", user.id);
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true, melding: ord().kvittering.navnOppdatert };
}

export async function byttEgetPassord(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevProfil();

  const nytt = t(fd, "nytt");
  const gjenta = t(fd, "gjenta");

  if (nytt !== gjenta) return { ok: false, feil: ord().feil.passordUlike };

  if (!erGyldig(nytt, user.email ?? "")) {
    const mangler = manglendeKrav(nytt, user.email ?? "")
      .map((id) => KRAV.find((k) => k.id === id)?.tekst)
      .filter(Boolean);
    return {
      ok: false,
      feil: ord().feil.passordMangler.replace("{krav}", mangler.join(", ")),
    };
  }

  const { error } = await supabase.auth.updateUser({ password: nytt });
  if (error) return { ok: false, feil: error.message };

  return { ok: true, melding: ord().kvittering.passordByttet };
}

/* ------------------------------------------------------ Organisasjonen */

export async function oppdaterOrganisasjon(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: ord().feil.bareAdminOrganisasjon };

  const navn = t(fd, "navn");
  if (!navn) return { ok: false, feil: ord().feil.navnTomt };

  const { error } = await supabase
    .from("organisasjoner")
    .update({ navn, org_nr: t(fd, "org_nr") || null })
    .eq("id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true, melding: ord().kvittering.organisasjonOppdatert };
}

/* ----------------------------------------------------------- Kolleger */

export async function nyBruker(fd: FormData): Promise<Svar> {
  const { supabase, user, profil } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: ord().feil.bareAdminBrukere };

  const epost = t(fd, "epost").toLowerCase();
  const navn = t(fd, "navn");
  const passord = t(fd, "passord");
  const rolle = t(fd, "rolle") === "administrator" ? "administrator" : "bruker";

  if (!epost || !navn) return { ok: false, feil: ord().feil.navnOgEpost };

  if (!erGyldig(passord, epost)) {
    const mangler = manglendeKrav(passord, epost)
      .map((id) => KRAV.find((k) => k.id === id)?.tekst)
      .filter(Boolean);
    return {
      ok: false,
      feil: ord().feil.passordMangler.replace("{krav}", mangler.join(", ")),
    };
  }

  // Grensen sjekkes før vi oppretter innloggingen. Ellers ville en avvist
  // bruker likevel ligget igjen i auth.users uten profil.
  const { data: org } = await supabase
    .from("organisasjoner")
    .select("plan")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();

  const plan = planFor(org?.plan);

  // Kommunale brukere må ha kommunens e-postadresse. Administratoren ble
  // kontrollert da kontoen ble åpnet, så domenet hennes er domenet kommunen
  // bruker. Selskap har ofte flere domener og konsulenter, så der er det fritt.
  if (["liten", "kommune", "medelstor", "stor"].includes(org?.plan ?? "")) {
    const domene = (e: string | null | undefined) => (e ?? "").split("@")[1]?.toLowerCase() ?? "";
    const mitt = domene(user.email);
    const nytt = domene(epost);
    if (mitt && nytt !== mitt && !nytt.endsWith(`.${mitt}`))
      return { ok: false, feil: ord().feil.kommuneDomene.replace("{domene}", mitt) };
  }

  const { count } = await supabase
    .from("profiler")
    .select("id", { count: "exact", head: true })
    .eq("organisasjon_id", profil.organisasjon_id);

  if ((count ?? 0) >= plan.brukere) {
    return {
      ok: false,
      feil: ord()
        .feil.planFullt.replace("{plan}", plan.navn)
        .replace("{n}", String(plan.brukere))
        .replace(
          "{ord}",
          plan.brukere === 1 ? ord().internt.bruker : ord().internt.brukere,
        ),
    };
  }

  const a = admin();

  const { data: ny, error: authFeil } = await a.auth.admin.createUser({
    email: epost,
    password: passord,
    email_confirm: true,
  });

  if (authFeil || !ny.user)
    return { ok: false, feil: authFeil?.message ?? ord().feil.ingenInnlogging };

  const { error: profilFeil } = await a.from("profiler").insert({
    id: ny.user.id,
    organisasjon_id: profil.organisasjon_id,
    navn,
    rolle,
  });

  if (profilFeil) {
    // Rydd opp, ellers står en innlogging igjen som ikke hører til noen.
    await a.auth.admin.deleteUser(ny.user.id);
    return { ok: false, feil: profilFeil.message };
  }

  revalidatePath("/konto");
  return { ok: true, melding: ord().kvittering.lagtTil.replace("{navn}", navn) };
}

export async function fjernBruker(id: string): Promise<Svar> {
  const { profil, user } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: ord().feil.bareAdminFjerne };
  if (id === user.id) return { ok: false, feil: ord().feil.kanIkkeFjerneSegSelv };

  const a = admin();

  // Bare folk i egen organisasjon. Uten denne kunne en administrator
  // fjernet hvem som helst ved å gjette en id.
  const { data: mal } = await a
    .from("profiler")
    .select("organisasjon_id")
    .eq("id", id)
    .maybeSingle();

  if (!mal || mal.organisasjon_id !== profil.organisasjon_id)
    return { ok: false, feil: ord().feil.brukerIkkeIOrg };

  const { error } = await a.auth.admin.deleteUser(id);
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true, melding: ord().kvittering.brukerFjernet };
}

export async function settRolle(id: string, rolle: string): Promise<Svar> {
  const { supabase, profil, user } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: ord().feil.bareAdminRoller };
  if (id === user.id)
    return { ok: false, feil: ord().feil.kanIkkeEndreEgenRolle };

  const { error } = await supabase
    .from("profiler")
    .update({ rolle })
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true };
}

/* ------------------------------------------------------------ Sletting */

const ANGREFRIST_DAGER = 14;

/**
 * Administratoren ber om å slette organisasjonen.
 *
 * Kontoen stenges med en gang og et eventuelt kortabonnement avsluttes, men
 * dataene ligger i fjorten dager. Den som har slettet ved en feil, eller en
 * annen som har overtatt innloggingen, rekker å si fra. Så tar den daglige
 * jobben resten. Navnet på organisasjonen må skrives for å bekrefte.
 */
export async function bestillSletting(bekreftNavn: string): Promise<Svar> {
  const { supabase, profil } = await krevProfil();
  if (profil.rolle !== "administrator") return { ok: false, feil: ord().feil.bareAdministrator };

  const { data: org } = await supabase
    .from("organisasjoner")
    .select("navn, stripe_kunde_id")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();
  if (!org || bekreftNavn.trim().toLowerCase() !== org.navn.trim().toLowerCase())
    return { ok: false, feil: ord().datakort.feilNavn };

  if (org.stripe_kunde_id) await avsluttAbonnementer(org.stripe_kunde_id);

  const db = admin();
  const dato = new Date(Date.now() + ANGREFRIST_DAGER * 86_400_000).toISOString();
  const { error } = await db
    .from("organisasjoner")
    .update({ status: "stengt", slettes_den: dato })
    .eq("id", profil.organisasjon_id);
  if (error) return { ok: false, feil: error.message };

  await db.from("interne_varsler").insert({
    slag: "sletting",
    tittel: `${org.navn} har bedt om sletting`,
    tekst: `Kontoen er stengt og slettes ${dato.slice(0, 10)} hvis de ikke angrer.`,
    lenke: "/internt",
    noekkel: `sletting:${profil.organisasjon_id}:${dato.slice(0, 10)}`,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Angrer slettingen så lenge fristen ikke er ute. */
export async function angreSletting(): Promise<Svar> {
  const { profil } = await krevProfil();
  if (profil.rolle !== "administrator") return { ok: false, feil: ord().feil.bareAdministrator };
  const db = admin();
  const { data: org } = await db
    .from("organisasjoner")
    .select("slettes_den")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();
  if (!org?.slettes_den || new Date(org.slettes_den) < new Date())
    return { ok: false, feil: ord().datakort.forSent };
  await db.from("organisasjoner").update({ status: "aktiv", slettes_den: null }).eq("id", profil.organisasjon_id);
  revalidatePath("/", "layout");
  return { ok: true };
}
