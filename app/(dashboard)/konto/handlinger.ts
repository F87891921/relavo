"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { admin } from "@/lib/supabase/admin";
import { planFor } from "@/lib/plan";
import { erGyldig, manglendeKrav, KRAV } from "@/lib/passord";

export type Svar = { ok: true; melding?: string } | { ok: false; feil: string };

const t = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

/* ------------------------------------------------------- Egne innstillinger */

export async function oppdaterEgetNavn(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevProfil();
  const navn = t(fd, "navn");
  if (!navn) return { ok: false, feil: "Navnet kan ikke være tomt." };

  const { error } = await supabase.from("profiler").update({ navn }).eq("id", user.id);
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true, melding: "Navnet er oppdatert." };
}

export async function byttEgetPassord(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevProfil();

  const nytt = t(fd, "nytt");
  const gjenta = t(fd, "gjenta");

  if (nytt !== gjenta) return { ok: false, feil: "De to passordene er ikke like." };

  if (!erGyldig(nytt, user.email ?? "")) {
    const mangler = manglendeKrav(nytt, user.email ?? "")
      .map((id) => KRAV.find((k) => k.id === id)?.tekst)
      .filter(Boolean);
    return { ok: false, feil: `Passordet mangler: ${mangler.join(", ")}.` };
  }

  const { error } = await supabase.auth.updateUser({ password: nytt });
  if (error) return { ok: false, feil: error.message };

  return { ok: true, melding: "Passordet er byttet." };
}

/* ------------------------------------------------------ Organisasjonen */

export async function oppdaterOrganisasjon(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: "Bare administrator kan endre organisasjonen." };

  const navn = t(fd, "navn");
  if (!navn) return { ok: false, feil: "Navnet kan ikke være tomt." };

  const { error } = await supabase
    .from("organisasjoner")
    .update({ navn, org_nr: t(fd, "org_nr") || null })
    .eq("id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true, melding: "Organisasjonen er oppdatert." };
}

/* ----------------------------------------------------------- Kolleger */

export async function nyBruker(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: "Bare administrator kan legge til brukere." };

  const epost = t(fd, "epost").toLowerCase();
  const navn = t(fd, "navn");
  const passord = t(fd, "passord");
  const rolle = t(fd, "rolle") === "administrator" ? "administrator" : "bruker";

  if (!epost || !navn) return { ok: false, feil: "Navn og e-post må fylles ut." };

  if (!erGyldig(passord, epost)) {
    const mangler = manglendeKrav(passord, epost)
      .map((id) => KRAV.find((k) => k.id === id)?.tekst)
      .filter(Boolean);
    return { ok: false, feil: `Passordet mangler: ${mangler.join(", ")}.` };
  }

  // Grensen sjekkes før vi oppretter innloggingen. Ellers ville en avvist
  // bruker likevel ligget igjen i auth.users uten profil.
  const { data: org } = await supabase
    .from("organisasjoner")
    .select("plan")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();

  const plan = planFor(org?.plan);

  const { count } = await supabase
    .from("profiler")
    .select("id", { count: "exact", head: true })
    .eq("organisasjon_id", profil.organisasjon_id);

  if ((count ?? 0) >= plan.brukere) {
    return {
      ok: false,
      feil: `${plan.navn} gir plass til ${plan.brukere} ${plan.brukere === 1 ? "bruker" : "brukere"}. Oppgrader planen for å legge til flere.`,
    };
  }

  const a = admin();

  const { data: ny, error: authFeil } = await a.auth.admin.createUser({
    email: epost,
    password: passord,
    email_confirm: true,
  });

  if (authFeil || !ny.user)
    return { ok: false, feil: authFeil?.message ?? "Kunne ikke opprette innlogging." };

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
  return { ok: true, melding: `${navn} er lagt til.` };
}

export async function fjernBruker(id: string): Promise<Svar> {
  const { profil, user } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: "Bare administrator kan fjerne brukere." };
  if (id === user.id) return { ok: false, feil: "Du kan ikke fjerne deg selv." };

  const a = admin();

  // Bare folk i egen organisasjon. Uten denne kunne en administrator
  // fjernet hvem som helst ved å gjette en id.
  const { data: mal } = await a
    .from("profiler")
    .select("organisasjon_id")
    .eq("id", id)
    .maybeSingle();

  if (!mal || mal.organisasjon_id !== profil.organisasjon_id)
    return { ok: false, feil: "Brukeren hører ikke til din organisasjon." };

  const { error } = await a.auth.admin.deleteUser(id);
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true, melding: "Brukeren er fjernet." };
}

export async function settRolle(id: string, rolle: string): Promise<Svar> {
  const { supabase, profil, user } = await krevProfil();
  if (profil.rolle !== "administrator")
    return { ok: false, feil: "Bare administrator kan endre roller." };
  if (id === user.id)
    return { ok: false, feil: "Du kan ikke endre din egen rolle." };

  const { error } = await supabase
    .from("profiler")
    .update({ rolle })
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/konto");
  return { ok: true };
}
