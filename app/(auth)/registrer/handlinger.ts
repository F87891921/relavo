"use server";

import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { manglendeKrav, KRAV } from "@/lib/passord";

export type Svar = { ok: true } | { ok: false; feil: string };

/**
 * Opprett konto.
 *
 * Brukeren lages med service_role og settes som bekreftet med en gang, i
 * stedet for å vente på en bekreftelseslenke på e-post. Det er et bevisst
 * valg, ikke en snarvei:
 *
 * Kontoen gir ingenting før den er åpnet av oss. Fram til da ser man
 * ventesiden og ingenting annet — ingen leverandørdata, ingen kontroller.
 * Det som faktisk verifiserer motparten er kredittkontrollen mot
 * organisasjonsnummeret, og den gjør et menneske. En e-postbekreftelse i
 * tillegg ville bare vært et steg til før den samme sperren.
 *
 * Skal e-posten verifiseres senere, er stedet her: bytt til signUp() og slå
 * på bekreftelse i Supabase.
 */
export async function registrer(fd: FormData): Promise<Svar> {
  const epost = String(fd.get("epost") ?? "").trim().toLowerCase();
  const passord = String(fd.get("passord") ?? "");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(epost))
    return { ok: false, feil: "Skriv en gyldig e-postadresse." };

  const mangler = manglendeKrav(passord, epost);
  if (mangler.length) {
    const tekst = KRAV.filter((k) => mangler.includes(k.id))
      .map((k) => k.tekst.toLowerCase())
      .join(", ");
    return { ok: false, feil: `Passordet mangler: ${tekst}.` };
  }

  const { data, error } = await admin().auth.admin.createUser({
    email: epost,
    password: passord,
    email_confirm: true,
  });

  if (error) {
    // Supabase sier «already registered». Vi sier ikke mer enn det —
    // hvem som har konto hos oss er ikke noe en fremmed skal kunne kartlegge
    // ved å prøve adresser, men å late som om det gikk bra er verre: da
    // sitter den som faktisk eier adressen og lurer på hvorfor de ikke kommer
    // inn. Innloggingslenken under er svaret for begge.
    const alt = /already/i.test(error.message);
    return {
      ok: false,
      feil: alt
        ? "Det finnes allerede en konto på denne adressen. Logg inn i stedet."
        : error.message,
    };
  }
  if (!data.user) return { ok: false, feil: "Kontoen ble ikke opprettet." };

  // Logg inn med en gang, slik at neste steg har en økt å jobbe i.
  const supabase = createClient();
  const { error: innFeil } = await supabase.auth.signInWithPassword({
    email: epost,
    password: passord,
  });
  if (innFeil) return { ok: false, feil: innFeil.message };

  return { ok: true };
}
