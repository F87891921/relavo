import { admin } from "@/lib/supabase/admin";
import { regnUt } from "@/lib/offert";
import { Veiviser, type AvtaltTilbud } from "./Veiviser";

/**
 * Registreringen. Selve skjemaet er et tre-stegs oppsett (hvem, om dem,
 * konto) i Veiviser.tsx; planen fra prisfinneren på forsiden sendes med
 * som ?plan= og hopper over første steg for selskap.
 *
 * Kommer kunden fra et godtatt tilbud (?offert=), hentes tilbudet her på
 * serveren og skjemaet viser det avtalte beløpet i stedet for listepris.
 * Tokenet sjekkes på nytt når kontoen opprettes — det er ikke dette
 * oppslaget som avgjør hva kunden får.
 */
export default async function RegistrerSide({
  searchParams,
}: {
  searchParams: { plan?: string; offert?: string };
}) {
  let avtalt: AvtaltTilbud | undefined;

  if (searchParams.offert && /^[0-9a-f-]{36}$/i.test(searchParams.offert)) {
    const { data: o } = await admin()
      .from("offerter")
      .select("kund, org_nr, plan, ar, rabatt, fritt_antall, fritt_pris, svar, organisasjon_id")
      .eq("token", searchParams.offert)
      .maybeSingle();

    if (o && o.svar === "akseptert" && !o.organisasjon_id) {
      const r = regnUt(o);
      avtalt = {
        token: searchParams.offert,
        kund: o.kund,
        orgNr: o.org_nr ?? "",
        planNavn: r.planNavn,
        total: r.totalt,
        mnd: o.ar * 12,
      };
    }
  }

  return <Veiviser forvalgt={searchParams.plan} avtalt={avtalt} />;
}
