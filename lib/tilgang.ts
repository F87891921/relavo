import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aktivtSprak, ord } from "@/lib/sprak";

/**
 * Samme dør inn til alle kundesidene: må være innlogget, og må høre til en
 * organisasjon. Uten profil slipper Row Level Security ingenting gjennom, så
 * da sendes folk til å velge plan og opprette selskapet sitt.
 *
 * cache() gjør at dette skjer én gang per forespørsel, ikke én gang per
 * kaller. Før dette kalte både siden og DashboardShell den hver for seg, og
 * hver sidevisning gjorde tre getUser og to profiler-spørringer i stedet for
 * én av hver. Organisasjonsnavnet hentes i samme spørring — det trengs på
 * hver eneste side uansett, i sidemenyen.
 */
export const krevProfil = cache(async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const { data: profil } = await supabase
    .from("profiler")
    .select("organisasjon_id, navn, rolle, ansatt, ansatt_rolle, sprak, organisasjoner!profiler_organisasjon_id_fkey(navn, status, betalingsmate)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) redirect("/betaling");

  const sti = headers().get("x-sti") ?? "";

  // Tofaktor er frivillig — ingen blir tvunget til å sette det opp, heller
  // ikke ansatte. Men har man først slått det på, skal det brukes: aal1 betyr
  // passord bekreftet, engangskode ikke. Uten denne linjen ville en påslått
  // faktor bare vært pynt.
  const { data: niva } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (
    niva?.nextLevel === "aal2" &&
    niva.nextLevel !== niva.currentLevel &&
    sti !== "/tofaktor"
  )
    redirect("/tofaktor");

  const org = profil.organisasjoner as unknown as {
    navn: string;
    status: string;
    betalingsmate: string | null;
  } | null;

  // Kontoen er ikke åpnet ennå. Har de ikke bestilt, mangler det et valg;
  // har de bestilt, venter det på betaling eller på oss.
  //
  // Ansatte går alltid gjennom: de skal kunne se og behandle kontoer som
  // står og venter, og uten dette ville de blitt låst ute av sin egen
  // godkjenningsside.
  const APEN_UTEN_AKTIV = ["/venter", "/betaling", "/tofaktor", "/konto"];
  const dit = org?.betalingsmate ? "/venter" : "/betaling";
  if (
    sti &&
    !profil.ansatt &&
    org &&
    org.status !== "aktiv" &&
    sti !== dit &&
    !APEN_UTEN_AKTIV.some((p) => sti === p || sti.startsWith(`${p}/`))
  )
    redirect(dit);


  return {
    supabase,
    user,
    profil,
    organisasjonNavn: org?.navn ?? null,
    // Kapselen, ikke profilen.
    //
    // Profilen er der valget lagres varig, og middleware sår kapselen fra
    // den når den mangler — på en ny maskin. Men i selve visningen må det
    // være én kilde: rotoppsettet leser bare kapselen, siden det ikke kan
    // slå opp i databasen. Lot vi profilen vinne her, kunne sidemenyen stå
    // på svensk mens veiviseren inni sto på norsk.
    sprak: aktivtSprak(),
    t: ord(),
  };
});
