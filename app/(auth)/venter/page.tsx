import Link from "next/link";
import { redirect } from "next/navigation";
import { krevProfil } from "@/lib/tilgang";
import { RelavoMark } from "@/components/RelavoMark";
import { planFor } from "@/lib/plan";
import { RELAVO } from "@/lib/relavo";

/**
 * Kontoen er bestilt, men ikke åpnet ennå.
 *
 * Siden sier hva som faktisk mangler og hvem det står på. «Venter på
 * godkjenning» uten mer er det verste å møte når man nettopp har betalt
 * eller signert noe.
 */
export default async function VenterSide() {
  const { supabase, profil } = await krevProfil();

  const { data: org } = await supabase
    .from("organisasjoner")
    .select("navn, plan, status, betalingsmate, forskuddsbetaling, avslag_grunn, bestilt")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();

  if (!org || org.status === "aktiv") redirect("/oversikt");
  if (!org.betalingsmate) redirect("/betaling");

  const plan = planFor(org.plan);
  const avslatt = org.status === "avslatt";

  return (
    <div className="min-h-screen bg-surface px-4 py-[10vh]">
      <div className="w-full max-w-[520px] mx-auto">
        <div className="text-center mb-6">
          <RelavoMark className="w-12 h-auto mx-auto mb-4 text-accent" />
          <h1 className="text-[20px] font-semibold tracking-tight">
            {avslatt ? "Vi fikk ikke åpnet kontoen" : "Kontoen er på vei"}
          </h1>
        </div>

        <div className="bg-canvas rounded-card border border-border px-5 py-5 text-[13.5px] leading-relaxed">
          {avslatt ? (
            <>
              <p className="mb-3">
                Kredittkontrollen gikk ikke gjennom, og da kan vi ikke åpne
                kontoen på faktura.
              </p>
              {org.avslag_grunn && (
                <p className="text-dim mb-3">{org.avslag_grunn}</p>
              )}
              <p className="text-dim">
                Ta kontakt på {RELAVO.epost}, så finner vi ut av det. Kort
                fungerer uansett utfall.
              </p>
            </>
          ) : org.status === "venter_betaling" && org.forskuddsbetaling ? (
            <>
              <p className="mb-3">
                <b>{org.navn}</b> er godkjent for {plan.navn}. Fakturaen er på
                vei, og kontoen åpner seg når betalingen er registrert hos oss.
              </p>
              <p className="text-dim">
                Har dere allerede betalt, tar det som regel en virkedag før
                det er synlig her.
              </p>
            </>
          ) : org.status === "venter_betaling" ? (
            <>
              <p className="mb-3">
                Betalingen er ikke bekreftet ennå. Fullførte dere den hos
                Stripe, åpner kontoen seg av seg selv.
              </p>
              <Link href="/betaling" className="text-accent hover:underline">
                Prøv betalingen på nytt →
              </Link>
            </>
          ) : (
            <>
              <p className="mb-3">
                <b>{org.navn}</b> har bestilt {plan.navn} mot faktura. Vi gjør
                en kredittkontroll før kontoen åpnes — det tar vanligvis
                samme virkedag.
              </p>
              <p className="text-dim">
                Dere hører fra oss på e-post så snart den er gjort. Haster
                det, ring oss heller enn å vente.
              </p>
            </>
          )}
        </div>

        <p className="text-[12px] text-faint text-center mt-5">
          Spørsmål? {RELAVO.epost}
        </p>
      </div>
    </div>
  );
}
