"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { grunnUrl } from "@/lib/url";
import { PLANER, type PlanId } from "@/lib/plan";
import { opprettKasseokt, stripeOppsatt } from "@/lib/stripe";

export type Svar =
  | { ok: true; status: string }
  | { ok: false; feil: string };

/** Månedsprisen i kroner. Engangsplanen er én kontroll, ikke et abonnement. */
const BELOP: Record<PlanId, number> = {
  engangs: 590,
  standard: 6900,
  enterprise: 12900,
};

/**
 * Kunden bestiller.
 *
 * Faktura er hovedveien: norsk offentlig sektor betaler mot faktura, og EHF
 * er lovpålagt for leverandører til det offentlige. Kort finnes for de
 * private kundene på engangsplanen.
 *
 * Selve statusen settes av bestill_plan() i basen, som også krever at det er
 * en administrator som bestiller — en vanlig bruker skal ikke kunne binde
 * organisasjonen til en avtale.
 */
export async function bestill(plan: string, betalingsmate: "kort" | "faktura"): Promise<Svar> {
  const { supabase, user } = await krevProfil();

  const { data, error } = await supabase.rpc("bestill_plan", {
    p_plan: plan,
    p_betalingsmate: betalingsmate,
  });
  if (error) return { ok: false, feil: error.message };

  revalidatePath("/", "layout");

  if (betalingsmate === "faktura") return { ok: true, status: String(data) };

  // Kortveien: Stripe eier betalingen. Vi ser aldri kortnummeret.
  if (!stripeOppsatt())
    return {
      ok: false,
      feil: "Kortbetaling er ikke koblet på ennå. Velg faktura, så tar vi kontakt.",
    };

  const p = PLANER[(plan as PlanId) ?? "standard"] ?? PLANER.standard;
  const base = grunnUrl();

  const okt = await opprettKasseokt({
    belopNok: BELOP[(plan as PlanId) ?? "standard"] ?? BELOP.standard,
    beskrivelse: `Relavo ${p.navn}`,
    epost: user.email ?? "",
    gjentakende: plan !== "engangs",
    suksessUrl: `${base}/betaling/klar?okt={CHECKOUT_SESSION_ID}`,
    avbruttUrl: `${base}/betaling?avbrutt=1`,
    referanse: user.id,
  });

  if (!okt.ok) return { ok: false, feil: okt.feil };
  if (!okt.data.url) return { ok: false, feil: "Stripe ga ingen betalingslenke." };

  redirect(okt.data.url);
}
