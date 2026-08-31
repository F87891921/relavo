import { cache } from "react";
import { redirect } from "next/navigation";
import { krevProfil } from "@/lib/tilgang";

/**
 * To nivåer innad i Relavo.
 *
 * personal   — det daglige: support, leads, tilbud, fakturering, onboarding,
 *              kredittkontroll, kildehelse.
 * superadmin — i tillegg marginer per kunde, hvem som har åpnet hvilken
 *              kundes data, og hvem som har hvilken tilgang.
 *
 * Skillet er ikke ansiennitet, men hva som er nødvendig å se for å gjøre
 * jobben. En som svarer på support trenger ikke vite hva hver kunde koster
 * oss, og en åtkomstlogg som alle kan lese er ikke en åtkomstlogg.
 */
export const krevAnsatt = cache(async () => {
  const kontekst = await krevProfil();
  if (!kontekst.profil.ansatt) redirect("/oversikt");
  return kontekst;
});

/** For sidene bare superadmin skal se. */
export const krevSuperadmin = cache(async () => {
  const kontekst = await krevAnsatt();
  if (kontekst.profil.ansatt_rolle !== "superadmin") redirect("/internt");
  return kontekst;
});
