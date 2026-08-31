"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { validerOrgnr } from "@/lib/orgnr";
import { slaOppEnhet, type Enhet } from "@/lib/brreg";
import { HMS_PUNKTER, type Svar, type Resultat } from "@/lib/kontroll";
import { finnJav } from "@/lib/jav";
import { erRenholdsbransje, tolkStatus } from "@/lib/renhold";

/**
 * Kjører kontrollen og lagrer den. Oppslaget gjøres på nytt her, på
 * serveren — verdiene nettleseren sender inn er det brukeren så, ikke noe
 * vi kan la bestemme hva som havner i dokumentasjonen.
 */
export async function kjorKontroll(svar: Svar): Promise<Resultat> {
  const { supabase, profil, user } = await krevProfil();

  const validering = validerOrgnr(svar.orgnr);
  if (!validering.ok) return { ok: false, feil: validering.feil };

  const oppslag = await slaOppEnhet(validering.orgnr);
  if (oppslag.status !== "funnet") {
    return {
      ok: false,
      feil:
        oppslag.status === "ikke-funnet"
          ? "Fant ingen enhet med dette nummeret."
          : oppslag.melding,
    };
  }
  const enhet = oppslag.enhet;

  // Renholdsregisteret slås opp før vurderingen, så resultatet kan inngå i
  // kravlista. Bare for renholdsselskaper — for andre bransjer er registeret
  // ikke relevant, og en linje om det ville bare vært støy.
  let renhold: { status: string; godkjent: boolean } | null = null;
  if (erRenholdsbransje(enhet.bransje)) {
    const { data } = await supabase
      .from("renholdsvirksomheter")
      .select("status, godkjent")
      .eq("org_nr", enhet.orgnr)
      .maybeSingle();
    renhold = data ?? { status: "Ikke i registeret", godkjent: false };
  }

  const { krav, kilder, risiko } = vurder(enhet, svar, renhold);

  // Leverandøren må finnes før kontrollen kan peke på den. Er selskapet
  // kontrollert før, gjenbrukes raden — ellers legges den inn nå.
  const { data: finnes } = await supabase
    .from("leverandorer")
    .select("id")
    .eq("org_nr", enhet.orgnr)
    .maybeSingle();

  let leverandorId = finnes?.id as string | undefined;

  if (!leverandorId) {
    const { data: ny, error: leverandorFeil } = await supabase
      .from("leverandorer")
      .insert({
        organisasjon_id: profil.organisasjon_id,
        navn: enhet.navn,
        org_nr: enhet.orgnr,
        bransje: enhet.bransje,
        sted: enhet.sted,
        ansatte: enhet.ansatte,
        risiko,
        sist_kontrollert: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (leverandorFeil) return { ok: false, feil: leverandorFeil.message };
    leverandorId = ny.id;
  } else {
    await supabase
      .from("leverandorer")
      .update({ risiko, sist_kontrollert: new Date().toISOString() })
      .eq("id", leverandorId);
  }

  // Etter grenen over er den alltid satt, men det ser ikke typene. Sjekken
  // er ekte nok: uten leverandør er det ingenting å knytte kontrollen til.
  if (!leverandorId)
    return { ok: false, feil: "Kunne ikke knytte kontrollen til en leverandør." };

  const { data: kontroll, error } = await supabase
    .from("kontroller")
    .insert({
      organisasjon_id: profil.organisasjon_id,
      leverandor_id: leverandorId,
      utfort_av: user.id,
      risiko,
      krav,
      kilder,
    })
    .select("id")
    .single();

  if (error) return { ok: false, feil: error.message };

  // Jav-kontrollen kjøres etter at kontrollen er lagret, og får ikke velte
  // den. Feiler oppslaget mot rolleregisteret, er kontrollen fortsatt gyldig
  // — jav-delen står da bare som ikke utført.
  try {
    const jav = await finnJav(supabase, {
      organisasjonId: profil.organisasjon_id,
      leverandorId: leverandorId,
      orgnr: enhet.orgnr,
    });

    if (jav.treff.length) {
      await supabase.from("jav_treff").insert(
        jav.treff.map((t) => ({
          organisasjon_id: profil.organisasjon_id,
          kontroll_id: kontroll.id,
          deltaker_id: t.deltaker_id,
          leverandor_id: t.leverandor_id,
          type_kobling: t.type_kobling,
          detaljer: t.detaljer,
        })),
      );
    }
  } catch {
    // Bevisst stille: kontrollen er allerede lagret og skal ikke rulles
    // tilbake fordi en tilleggssjekk ikke gikk gjennom.
  }

  revalidatePath("/leverandorer");
  revalidatePath("/oversikt");
  revalidatePath("/jav");

  return { ok: true, kontrollId: kontroll.id, risiko };
}

/**
 * Vurderingen. Registerflaggene er de harde: konkurs, tvangsavvikling og
 * avvikling er avvisningsgrunner etter § 24-2 og settes til brudd uansett
 * hva som er krysset av. Punktene brukeren ikke har bekreftet blir stående
 * som «ikke kontrollert» — de blir aldri stilltiende godkjent.
 */
function vurder(
  enhet: Enhet,
  svar: Svar,
  renhold: { status: string; godkjent: boolean } | null,
) {
  const krav: { ref: string; status: "ok" | "no" | "na"; tekst: string }[] = [];

  krav.push({
    ref: "§ 24-2",
    status: enhet.konkurs || enhet.underTvangsavvikling ? "no" : "ok",
    tekst: enhet.konkurs
      ? "Selskapet er registrert konkurs"
      : enhet.underTvangsavvikling
        ? "Selskapet er under tvangsavvikling"
        : "Ingen konkurs eller tvangsavvikling registrert",
  });

  if (enhet.underAvvikling) {
    krav.push({
      ref: "§ 24-2",
      status: "no",
      tekst: "Selskapet er under avvikling",
    });
  }

  // Renhold: § 4 i renholdsforskriften. Å kjøpe renhold fra et selskap som
  // ikke er godkjent har vært ulovlig siden 2012, så dette er et brudd og
  // ikke en advarsel.
  if (renhold) {
    krav.push({
      ref: "Renhold",
      status: renhold.godkjent
        ? "ok"
        : tolkStatus(renhold.status) === "under_behandling"
          ? "na"
          : "no",
      tekst: renhold.godkjent
        ? `Godkjent i Arbeidstilsynets renholdsregister (${renhold.status})`
        : tolkStatus(renhold.status) === "under_behandling"
          ? `Søknad til renholdsregisteret er under behandling (${renhold.status})`
          : `Ikke godkjent i Arbeidstilsynets renholdsregister (${renhold.status})`,
    });
  }

  for (const p of HMS_PUNKTER) {
    krav.push({
      ref: p.ref,
      status: svar.hms.includes(p.k) ? "ok" : "na",
      tekst: p.t,
    });
  }

  if (svar.espd === "finnes") {
    krav.push({
      ref: "ESPD",
      status: "ok",
      tekst: "Egenerklæring levert med tilbudet",
    });
  } else if (svar.espd === "be") {
    krav.push({
      ref: "ESPD",
      status: "na",
      tekst: svar.espdFrist
        ? `Egenerklæring etterspurt, frist ${svar.espdFrist}`
        : "Egenerklæring etterspurt",
    });
  }

  const kilder = [
    {
      navn: "Enhetsregisteret",
      status: "svar" as const,
      tidspunkt: new Date().toISOString(),
    },
    // Vi har ikke avtale med disse ennå. En rapport som tier om hullene
    // sine er verre enn ingen rapport, så de står oppført som ikke hentet.
    { navn: "Skatteetaten", status: "ikke" as const, tidspunkt: null },
    { navn: "Creditsafe", status: "ikke" as const, tidspunkt: null },
    {
      navn: "Arbeidstilsynet",
      status: renhold ? ("svar" as const) : ("ikke" as const),
      tidspunkt: renhold ? new Date().toISOString() : null,
    },
    { navn: "StartBANK", status: "ikke" as const, tidspunkt: null },
  ];

  const brudd = krav.some((k) => k.status === "no");
  const uavklart = krav.filter((k) => k.status === "na").length;
  const risiko = brudd ? "hoy" : uavklart >= 3 ? "middels" : "lav";

  return { krav, kilder, risiko };
}
