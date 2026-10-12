"use server";

import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { manglendeKrav, KRAV } from "@/lib/passord";
import { ord } from "@/lib/sprak";
import { kommuner } from "@/lib/kommuner";
import { nivaFor } from "@/lib/priser";

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
  const r = await lagKonto(fd);
  return r.ok ? { ok: true } : r;
}

async function lagKonto(
  fd: FormData,
): Promise<{ ok: true; supabase: ReturnType<typeof createClient> } | { ok: false; feil: string }> {
  const epost = String(fd.get("epost") ?? "").trim().toLowerCase();
  const passord = String(fd.get("passord") ?? "");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(epost))
    return { ok: false, feil: ord().feil.ugyldigEpost };

  const mangler = manglendeKrav(passord, epost);
  if (mangler.length) {
    const tekst = KRAV.filter((k) => mangler.includes(k.id))
      .map((k) => k.tekst.toLowerCase())
      .join(", ");
    return {
      ok: false,
      feil: ord().feil.passordMangler.replace("{krav}", tekst),
    };
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
  if (!data.user) return { ok: false, feil: ord().feil.kontoIkkeOpprettet };

  // Logg inn med en gang, slik at neste steg har en økt å jobbe i.
  const supabase = createClient();
  const { error: innFeil } = await supabase.auth.signInWithPassword({
    email: epost,
    password: passord,
  });
  if (innFeil) return { ok: false, feil: innFeil.message };

  return { ok: true, supabase };
}

export type OpprettSvar = { ok: true; neste: string } | { ok: false; feil: string };

const SELSKAPSPLANER = ["start", "vekst", "bygg"];

/**
 * Hele registreringen i ett: konto, organisasjon og — for kommuner — selve
 * bestillingen.
 *
 * Kommunens nivå regnes ut her fra innbyggertallet, ikke tatt fra
 * skjemaet. Ellers kunne en kommune på 80 000 velge «Liten» ved å endre én
 * verdi i nettleseren.
 *
 * Kommuner betaler alltid mot faktura (EHF), så bestillingen gjøres her og
 * kunden går rett til ventesiden. Selskap får velge betalingsmåte i neste
 * steg.
 *
 * Går kontoen opp men organisasjonen ikke, er kunden likevel innlogget; da
 * sendes hun til /velkommen, som lar henne fylle inn det samme for hånd.
 */
export async function opprettKonto(fd: FormData): Promise<OpprettSvar> {
  const type = String(fd.get("type") ?? "");
  const navn = String(fd.get("orgnavn") ?? "").trim();
  const orgnr = String(fd.get("orgnr") ?? "").trim();
  const person = String(fd.get("person") ?? "").trim();
  let plan = String(fd.get("plan") ?? "");
  let orgnavn = navn;

  if (type === "kommune") {
    const kode = String(fd.get("kommunekode") ?? "");
    const alle = await kommuner().catch(() => []);
    const k = alle.find((x) => x.kode === kode);
    if (!k) return { ok: false, feil: ord().feil.ugyldigKommune };
    const niva = nivaFor(k.innbyggere);
    if (niva.mnd === null) return { ok: false, feil: ord().feil.kommuneTilbud };
    plan = niva.id;
    orgnavn = /kommune/i.test(k.navn) ? k.navn : `${k.navn} kommune`;
  } else if (type === "selskap") {
    if (!SELSKAPSPLANER.includes(plan)) return { ok: false, feil: ord().feil.ugyldigPlan };
    if (!orgnavn) return { ok: false, feil: ord().feil.manglerNavn };
  } else if (type === "engangs") {
    plan = "engangs";
    if (!orgnavn) return { ok: false, feil: ord().feil.manglerNavn };
  } else {
    return { ok: false, feil: ord().feil.ugyldigPlan };
  }
  if (!person) return { ok: false, feil: ord().feil.manglerNavn };

  const konto = await lagKonto(fd);
  if (!konto.ok) return konto;
  const { supabase } = konto;
  const { error } = await supabase.rpc("opprett_organisasjon", {
    p_navn: orgnavn,
    p_brukernavn: person,
    p_org_nr: orgnr || null,
    p_plan: plan,
  });
  if (error) return { ok: true, neste: "/velkommen" };

  if (type === "kommune") {
    const { error: bFeil } = await supabase.rpc("bestill_plan", {
      p_plan: plan,
      p_betalingsmate: "faktura",
    });
    if (bFeil) return { ok: true, neste: "/betaling" };
    return { ok: true, neste: "/venter" };
  }
  return { ok: true, neste: `/betaling?plan=${plan}` };
}
