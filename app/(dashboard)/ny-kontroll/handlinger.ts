"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { validerOrgnr } from "@/lib/orgnr";
import { slaOppEnhet, type Enhet } from "@/lib/brreg";
import { HMS_PUNKTER, type Svar, type Resultat } from "@/lib/kontroll";

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

  const { krav, kilder, risiko } = vurder(enhet, svar);

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

  revalidatePath("/leverandorer");
  revalidatePath("/oversikt");

  return { ok: true, kontrollId: kontroll.id, risiko };
}

/**
 * Vurderingen. Registerflaggene er de harde: konkurs, tvangsavvikling og
 * avvikling er avvisningsgrunner etter § 24-2 og settes til brudd uansett
 * hva som er krysset av. Punktene brukeren ikke har bekreftet blir stående
 * som «ikke kontrollert» — de blir aldri stilltiende godkjent.
 */
function vurder(enhet: Enhet, svar: Svar) {
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
    { navn: "Arbeidstilsynet", status: "ikke" as const, tidspunkt: null },
    { navn: "StartBANK", status: "ikke" as const, tidspunkt: null },
  ];

  const brudd = krav.some((k) => k.status === "no");
  const uavklart = krav.filter((k) => k.status === "na").length;
  const risiko = brudd ? "hoy" : uavklart >= 3 ? "middels" : "lav";

  return { krav, kilder, risiko };
}
