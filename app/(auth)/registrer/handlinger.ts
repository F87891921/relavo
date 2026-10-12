"use server";

import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { manglendeKrav, KRAV } from "@/lib/passord";
import { ord } from "@/lib/sprak";
import { kommuner } from "@/lib/kommuner";
import { nivaFor } from "@/lib/priser";
import { regnUt } from "@/lib/offert";

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
  const offertToken = String(fd.get("offert") ?? "");
  let offert: { id: string; plan: string; ar: number; totalt: number; kund: string } | null = null;

  if (type === "offert") {
    // Tilbudet sjekkes på nytt her. Formen kan sende hva som helst; det er
    // raden i basen som sier hva kunden har avtalt.
    const { data: o } = await admin()
      .from("offerter")
      .select("id, kund, plan, ar, rabatt, fritt_antall, fritt_pris, svar, organisasjon_id")
      .eq("token", offertToken)
      .maybeSingle();
    if (!o || o.svar !== "akseptert" || o.organisasjon_id)
      return { ok: false, feil: ord().feil.tilbudIkkeApent };
    plan = o.plan;
    offert = { id: o.id, plan: o.plan, ar: o.ar, totalt: regnUt(o).totalt, kund: o.kund };
    if (!orgnavn) orgnavn = o.kund;
    if (!orgnavn) return { ok: false, feil: ord().feil.manglerNavn };
  } else if (type === "kommune") {
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
  const { data: orgId, error } = await supabase.rpc("opprett_organisasjon", {
    p_navn: orgnavn,
    p_brukernavn: person,
    p_org_nr: orgnr || null,
    p_plan: plan,
  });
  if (error || !orgId) return { ok: true, neste: "/velkommen" };

  // Kommuner krever tofaktor som utgangspunkt; administratoren kan slå det av.
  if (["liten", "kommune", "medelstor", "stor"].includes(plan))
    await admin().from("organisasjoner").update({ krever_tofaktor: true }).eq("id", orgId);

  if (offert) {
    // Avtalen skrives av serveren. Kunden kan ikke endre den fra nettleseren
    // (vern_organisasjonsfelt). Kontoen står i venter_kreditt til vi har
    // sendt fakturaen og åpnet den; betaling er alltid mot faktura her.
    const db = admin();
    const { data: tatt } = await db
      .from("offerter")
      .update({ organisasjon_id: orgId })
      .eq("id", offert.id)
      .is("organisasjon_id", null)
      .select("id");
    // Noen andre rakk det samme tilbudet først. Kontoen finnes, men uten avtale;
    // da må vi se på den for hånd.
    if (!tatt?.length) {
      await db.from("interne_varsler").insert({
        slag: "offert_konflikt",
        tittel: `${orgnavn} brukte et tilbud som allerede var brukt`,
        tekst: "Kontoen er opprettet uten avtalt pris. Se over før den åpnes.",
        lenke: "/internt/onboarding",
      });
      return { ok: true, neste: "/venter" };
    }
    await db
      .from("organisasjoner")
      .update({
        offert_id: offert.id,
        avtalt_total: offert.totalt,
        avtale_mnd: offert.ar * 12,
        betalingsmate: "faktura",
        status: "venter_kreditt",
        bestilt: new Date().toISOString(),
      })
      .eq("id", orgId);
    await db.from("interne_varsler").insert({
      slag: "ny_bestilling",
      tittel: `${orgnavn} har opprettet konto fra tilbud`,
      tekst: `Avtalt ${offert.totalt} NOK over ${offert.ar * 12} måneder, mot faktura. Venter på kredittkontroll.`,
      lenke: "/internt/onboarding",
    });
    return { ok: true, neste: "/venter" };
  }

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
