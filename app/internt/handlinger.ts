"use server";

import { revalidatePath } from "next/cache";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { validerOrgnr } from "@/lib/orgnr";
import { kredittvurder } from "@/lib/kreditt";
import { grunnUrl } from "@/lib/url";
import { sendEpost, epostOppsatt } from "@/lib/epost";
import { offertnummer, regnUt } from "@/lib/offert";

export type Svar = { ok: true } | { ok: false; feil: string };

const tekst = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

/* ---------------------------------------------------------------- Leads */

export async function nyttLead(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevAnsatt();

  const bolag = tekst(fd, "bolag");
  if (!bolag) return { ok: false, feil: "Bolagsnamn saknas." };

  const { error } = await supabase.from("leads").insert({
    bolag,
    kontakt: tekst(fd, "kontakt") || null,
    epost: tekst(fd, "epost") || null,
    kalla: tekst(fd, "kalla") || null,
    status: tekst(fd, "status") || "ny",
    nasta: tekst(fd, "nasta") || null,
    notis: tekst(fd, "notis") || null,
    opprettet_av: user.id,
  });

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/leads");
  revalidatePath("/internt/attgora");
  return { ok: true };
}

export async function settLeadStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/leads");
  return { ok: true };
}

/* ------------------------------------------------------------- Offerter */

export async function nyOfferte(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevAnsatt();

  const kund = tekst(fd, "kund");
  if (!kund) return { ok: false, feil: "Kund saknas." };

  // Fritt tilbud: et avtalt antall kontroller til en avtalt pris, utenfor
  // planene. Settes antallet, er det den prisen som gjelder.
  const frittAntall = Number(tekst(fd, "fritt_antall")) || null;
  const frittPris = Number(tekst(fd, "fritt_pris").replace(/\s/g, "")) || null;

  if (frittAntall && !frittPris)
    return { ok: false, feil: "Ange ett pris för det fria erbjudandet." };
  if (frittPris && !frittAntall)
    return { ok: false, feil: "Ange antal kontroller för det fria erbjudandet." };

  const orgNr = tekst(fd, "org_nr").replace(/\s/g, "");
  if (orgNr) {
    const sjekk = validerOrgnr(orgNr);
    if (!sjekk.ok) return { ok: false, feil: sjekk.feil };
  }

  const { error } = await supabase.from("offerter").insert({
    kund,
    lead_id: tekst(fd, "lead_id") || null,
    plan: tekst(fd, "plan") || "standard",
    ar: Number(tekst(fd, "ar")) || 1,
    rabatt: Number(tekst(fd, "rabatt")) || 0,
    giltig_til: tekst(fd, "giltig_til") || null,
    status: tekst(fd, "status") || "utkast",
    org_nr: orgNr || null,
    fakturaadresse: tekst(fd, "fakturaadresse") || null,
    kontaktperson: tekst(fd, "kontaktperson") || null,
    kontakt_epost: tekst(fd, "kontakt_epost") || null,
    fritt_antall: frittAntall,
    fritt_pris: frittPris,
    notat: tekst(fd, "notat") || null,
    opprettet_av: user.id,
  });

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/offerter");
  return { ok: true };
}

/**
 * Søk blant kunder og leads. Brukes når man skriver et navn i tilbuds- eller
 * fakturaskjemaet — da slipper man å skrive inn organisasjonsnummer og
 * adresse på nytt for noen vi allerede kjenner.
 */
export type Kundetreff = {
  navn: string;
  org_nr: string | null;
  kilde: "kunde" | "lead";
  organisasjon_id: string | null;
  kontaktperson: string | null;
  kontakt_epost: string | null;
};

export async function sokKunder(q: string): Promise<Kundetreff[]> {
  const { supabase } = await krevAnsatt();
  const sok = q.trim();
  if (sok.length < 2) return [];

  const [{ data: organisasjoner }, { data: leads }] = await Promise.all([
    supabase
      .from("organisasjoner")
      .select("id, navn, org_nr")
      .ilike("navn", `%${sok}%`)
      .limit(6),
    supabase
      .from("leads")
      .select("id, bolag, kontakt, epost")
      .ilike("bolag", `%${sok}%`)
      .limit(6),
  ]);

  const ut: Kundetreff[] = [];

  for (const o of organisasjoner ?? [])
    ut.push({
      navn: o.navn,
      org_nr: o.org_nr,
      kilde: "kunde",
      organisasjon_id: o.id,
      kontaktperson: null,
      kontakt_epost: null,
    });

  for (const l of leads ?? [])
    // Er selskapet allerede kunde, er kundetreffet det mest presise.
    if (!ut.some((x) => x.navn.toLowerCase() === l.bolag.toLowerCase()))
      ut.push({
        navn: l.bolag,
        org_nr: null,
        kilde: "lead",
        organisasjon_id: null,
        kontaktperson: l.kontakt,
        kontakt_epost: l.epost,
      });

  return ut;
}

/**
 * Send tilbudet.
 *
 * Kunden får en lenke til tilbudet, ikke et vedlegg. Da kan de svare der de
 * leser det — og vi ser at det er lest, hva de svarte og hvorfor. Et pdf-
 * vedlegg gir oss ingen av delene.
 *
 * Er ingen e-postleverandør koblet til, sendes ingenting. Da får personalen
 * lenken og en mailto tilbake, og kan sende den fra sin egen post. Det som
 * ikke skjer, er at grensesnittet sier «skickad» om et brev som aldri gikk.
 */
export type Sendesvar =
  | { ok: true; lenke: string; epostSendt: boolean; grunn?: string }
  | { ok: false; feil: string };

export async function sendOfferte(id: string, epost: string): Promise<Sendesvar> {
  const { supabase, user, profil } = await krevAnsatt();

  const { data: o, error: hentFeil } = await supabase
    .from("offerter")
    .select(
      "id, token, kund, kontaktperson, kontakt_epost, plan, ar, rabatt, fritt_antall, fritt_pris, giltig_til, opprettet, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (hentFeil || !o) return { ok: false, feil: "Offerten finns inte." };

  const mottaker = (epost || o.kontakt_epost || "").trim();

  const { error } = await supabase
    .from("offerter")
    .update({
      sendt: new Date().toISOString(),
      sendt_av: user.id,
      // Bare utkast går videre til skickad. Er den redan besvarad, skal et
      // nytt utsendelse ikke sette den tilbake.
      ...(o.status === "utkast" ? { status: "skickad" } : {}),
      ...(mottaker && mottaker !== o.kontakt_epost ? { kontakt_epost: mottaker } : {}),
    })
    .eq("id", id);

  if (error) return { ok: false, feil: error.message };

  const lenke = `${grunnUrl()}/offert/${o.token}`;
  revalidatePath("/internt/offerter");
  revalidatePath(`/internt/offerter/${id}`);

  if (!mottaker)
    return { ok: true, lenke, epostSendt: false, grunn: "Ingen e-postadress angiven." };

  if (!epostOppsatt())
    return {
      ok: true,
      lenke,
      epostSendt: false,
      grunn: "Ingen e-postleverantör är kopplad. Skicka länken från din egen post.",
    };

  const r = regnUt(o);
  const brev = `Hei${o.kontaktperson ? " " + o.kontaktperson : ""},

Her er tilbudet fra Relavo på ${r.planNavn.toLowerCase()} — samlet kontraktsverdi ${new Intl.NumberFormat("nb-NO").format(r.totalt)} NOK eksklusive merverdiavgift.

Tilbudet kan leses og besvares her:
${lenke}
${o.giltig_til ? `\nTilbudet er gyldig til ${o.giltig_til}.\n` : ""}
Si fra om noe er uklart, så tar vi det derfra.

Med vennlig hilsen
${profil.navn ?? "Relavo"}
Relavo`;

  const sendt = await sendEpost({
    til: mottaker,
    emne: `Tilbud fra Relavo — ${offertnummer(o.id, o.opprettet)}`,
    tekst: brev,
  });

  if (!sendt.ok) return { ok: true, lenke, epostSendt: false, grunn: sendt.feil };
  return { ok: true, lenke, epostSendt: true };
}

/* -------------------------------------------------------------- Varsler */

export async function markerVarselLest(id: string): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase
    .from("interne_varsler")
    .update({ lest: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/attgora");
  return { ok: true };
}

export async function markerAlleVarslerLest(): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase
    .from("interne_varsler")
    .update({ lest: new Date().toISOString() })
    .is("lest", null);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/attgora");
  return { ok: true };
}

export async function settOffertStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase.from("offerter").update({ status }).eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/offerter");
  revalidatePath(`/internt/offerter/${id}`);
  return { ok: true };
}

/* ----------------------------------------------------------- Fakturaer */

export async function nyFaktura(fd: FormData): Promise<Svar> {
  const { supabase, user } = await krevAnsatt();

  const kunde = tekst(fd, "kunde_navn");
  const belopp = Number(tekst(fd, "belopp").replace(/\s/g, ""));
  const forfall = tekst(fd, "forfall");

  if (!kunde) return { ok: false, feil: "Kund saknas." };
  if (!Number.isFinite(belopp) || belopp < 0)
    return { ok: false, feil: "Beloppet är inte ett giltigt tal." };
  if (!forfall) return { ok: false, feil: "Förfallodatum saknas." };

  // Løpenummer per år. Krasjer to samtidige mot unique-regelen, feiler den
  // ene høyt i stedet for å skrive to fakturaer med samme nummer.
  const aar = new Date().getFullYear();
  const { count } = await supabase
    .from("fakturaer")
    .select("id", { count: "exact", head: true })
    .like("nummer", `${aar}-%`);

  const nummer = `${aar}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { error } = await supabase.from("fakturaer").insert({
    kunde_navn: kunde,
    organisasjon_id: tekst(fd, "organisasjon_id") || null,
    nummer,
    belopp,
    forfall,
    status: tekst(fd, "status") || "obetald",
    org_nr: tekst(fd, "org_nr").replace(/\s/g, "") || null,
    fakturaadresse: tekst(fd, "fakturaadresse") || null,
    referanse: tekst(fd, "referanse") || null,
    opprettet_av: user.id,
  });

  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/fakturering");
  revalidatePath("/internt/attgora");
  return { ok: true };
}

export async function settFakturaStatus(id: string, status: string): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase.from("fakturaer").update({ status }).eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/fakturering");
  revalidatePath("/internt/attgora");
  return { ok: true };
}

/* -------------------------------------------------------- Kredittsjekk */

export type KredittResultat =
  | { ok: true; id: string; vurdering: string }
  | { ok: false; feil: string };

export async function kjorKredittsjekk(fd: FormData): Promise<KredittResultat> {
  const { supabase, user } = await krevAnsatt();

  const validering = validerOrgnr(tekst(fd, "orgnr"));
  if (!validering.ok) return { ok: false, feil: validering.feil };

  const svar = await kredittvurder(validering.orgnr);
  if (!svar.ok) return { ok: false, feil: svar.feil };

  const { data, error } = await supabase
    .from("kredittsjekker")
    .insert({
      org_nr: validering.orgnr,
      navn: svar.enhet.navn,
      vurdering: svar.vurdering,
      begrunnelse: svar.begrunnelse,
      registerdata: { enhet: svar.enhet, regnskap: svar.regnskap },
      utfort_av: user.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/internt/kreditt");
  return { ok: true, id: data.id, vurdering: svar.vurdering };
}

/* ------------------------------------------------------- Kontaktskjema */

export async function settBehandlet(id: string, behandlet: boolean): Promise<Svar> {
  const { supabase } = await krevAnsatt();
  const { error } = await supabase
    .from("kontakt_henvendelser")
    .update({ behandlet })
    .eq("id", id);
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/internt/kontakt");
  return { ok: true };
}

/* --------------------------------------------------------- Personalroller */

/**
 * Gör en kollega till personal, eller tar bort det.
 *
 * Bara superadmin. Flagget avgör hvem som ser andre kunders data, og den
 * avgjørelsen skal ikke kunne tas av den som allerede er inne.
 */
export async function settAnsatt(
  id: string,
  ansatt: boolean,
  niva: "superadmin" | "personal" | null,
): Promise<Svar> {
  const { supabase, profil, user } = await krevAnsatt();

  if (profil.ansatt_rolle !== "superadmin")
    return { ok: false, feil: "Bara superadmin kan ändra personalbehörighet." };

  if (id === user.id)
    return { ok: false, feil: "Du kan inte ändra din egen behörighet." };

  const { error } = await supabase
    .from("profiler")
    .update({ ansatt, ansatt_rolle: ansatt ? (niva ?? "personal") : null })
    .eq("id", id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/internt/team");
  return { ok: true };
}
