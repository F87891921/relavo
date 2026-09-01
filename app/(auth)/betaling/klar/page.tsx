import Link from "next/link";
import { redirect } from "next/navigation";
import { krevProfil } from "@/lib/tilgang";
import { admin } from "@/lib/supabase/admin";
import { hentKasseokt } from "@/lib/stripe";
import { RelavoMark } from "@/components/RelavoMark";

/**
 * Tilbake fra Stripe.
 *
 * Vi stoler ikke på at kunden kom hit — vi spør Stripe om økten faktisk er
 * betalt. En success_url kan hvem som helst åpne.
 *
 * Dette er ikke en erstatning for webhooks. Lukker kunden fanen rett etter
 * betaling, kommer de aldri hit, og kontoen står i venter_betaling til noen
 * hos oss åpner den. Det er feil vei å feile på: kontoen åpnes for tidlig
 * aldri, bare for sent.
 */
export default async function BetalingKlar({
  searchParams,
}: {
  searchParams: { okt?: string };
}) {
  const { profil, user } = await krevProfil();
  const okt = searchParams.okt;

  if (!okt) redirect("/betaling");

  const svar = await hentKasseokt(okt);
  const betalt = svar.ok && svar.data.payment_status === "paid";

  if (betalt) {
    await admin()
      .from("organisasjoner")
      .update({
        status: "aktiv",
        aktivert: new Date().toISOString(),
        stripe_okt_id: svar.data.id,
        stripe_kunde_id: svar.data.customer,
      })
      .eq("id", profil.organisasjon_id)
      .eq("status", "venter_betaling");
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-[10vh]">
      <div className="w-full max-w-[460px] mx-auto text-center">
        <RelavoMark className="w-12 h-auto mx-auto mb-4 text-accent" />

        {betalt ? (
          <>
            <h1 className="text-[20px] font-semibold tracking-tight mb-2">
              Takk — betalingen er registrert
            </h1>
            <p className="text-[13.5px] text-dim leading-relaxed mb-6">
              Kontoen er åpnet. Kvitteringen kommer fra Stripe til{" "}
              {user.email}.
            </p>
            <Link
              href="/oversikt"
              className="inline-block bg-accent hover:bg-accent-hover transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              Kom i gang
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-[20px] font-semibold tracking-tight mb-2">
              Vi venter fortsatt på betalingen
            </h1>
            <p className="text-[13.5px] text-dim leading-relaxed mb-6">
              {svar.ok
                ? "Stripe har ikke bekreftet betalingen ennå. Er den gjennomført, åpner kontoen seg av seg selv — du trenger ikke gjøre noe."
                : svar.feil}
            </p>
            <Link
              href="/betaling"
              className="inline-block bg-surface border border-border hover:border-border-strong transition text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              Tilbake
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
