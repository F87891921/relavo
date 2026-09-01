import { redirect } from "next/navigation";
import { krevProfil } from "@/lib/tilgang";
import { RelavoMark } from "@/components/RelavoMark";
import { stripeOppsatt } from "@/lib/stripe";
import { ord } from "@/lib/sprak";
import { Valg } from "./Valg";

export default async function BetalingSide() {
  const { supabase, profil } = await krevProfil();
  const o = ord();

  const { data: org } = await supabase
    .from("organisasjoner")
    .select("status, betalingsmate")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();

  // Ferdig bestilt og åpnet: da har man ingenting her å gjøre.
  if (org?.status === "aktiv") redirect("/oversikt");

  const kanBestille = profil.rolle === "administrator";

  return (
    <div className="min-h-screen bg-surface px-4 py-[7vh]">
      <div className="w-full max-w-[720px] mx-auto">
        <div className="text-center mb-7">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[22px] font-semibold tracking-tight">
            {o.oppstart.velgPlan}
          </h1>
          <p className="text-[13px] text-dim mt-2">{o.oppstart.kanByttes}</p>
        </div>

        {kanBestille ? (
          <Valg kortMulig={stripeOppsatt()} />
        ) : (
          <div className="bg-canvas rounded-card border border-border px-5 py-5 text-[13.5px] leading-relaxed text-dim">
            {o.betaling.bareAdministrator}
          </div>
        )}
      </div>
    </div>
  );
}
