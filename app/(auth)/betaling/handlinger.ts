"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { grunnUrl } from "@/lib/url";
import { PLANER, type PlanId } from "@/lib/plan";
import { opprettKasseokt, opprettPortal, stripeOppsatt } from "@/lib/stripe";
import { ord } from "@/lib/sprak";
import { BEDRIFT, ENKELTKONTROLL, mndBedrift } from "@/lib/priser";

export type Svar =
  | { ok: true; status: string }
  | { ok: false; feil: string };

/** Månedsprisen i kroner. Engangsplanen er én kontroll, ikke et abonnement. */
/**
 * Beløpet på kortet. Månedlig trekk bruker månedsprisen (med påslag), årlig
 * trekk bruker tolvmånedersprisen × 12. Beregnes her, ikke hentes fra
 * nettleseren.
 */
function kortBelop(plan: string, intervall: "month" | "year"): number {
  if (plan === "engangs") return ENKELTKONTROLL;
  const b = BEDRIFT.find((x) => x.id === plan);
  if (b) return (mndBedrift(b, intervall === "year" ? 12 : 1) ?? 0) * (intervall === "year" ? 12 : 1);
  return BELOP[(plan as PlanId) ?? "vekst"] ?? BELOP.vekst;
}

const BELOP: Record<PlanId, number> = {
  engangs: 890,
  liten: 3900,
  kommune: 7900,
  medelstor: 12900,
  stor: 0,
  start: 1500,
  vekst: 5900,
  bygg: 11900,
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
export async function bestill(
  plan: string,
  betalingsmate: "kort" | "faktura",
  intervall: "month" | "year" = "year",
): Promise<Svar> {
  const { supabase, user, profil } = await krevProfil();

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
      feil: ord().feil.kortIkkeKoblet,
    };

  const p = PLANER[(plan as PlanId) ?? "kommune"] ?? PLANER.kommune;
  const base = grunnUrl();

  const okt = await opprettKasseokt({
    // Selskap betaler ett år i forskudd og fornyes hvert år; engangskontrollen er én betaling.
    belopNok: kortBelop(plan, intervall),
    beskrivelse: `Relavo ${p.navn}`,
    epost: user.email ?? "",
    gjentakende: plan !== "engangs",
    intervall: plan === "engangs" ? undefined : intervall,
    suksessUrl: `${base}/betaling/klar?okt={CHECKOUT_SESSION_ID}`,
    avbruttUrl: `${base}/betaling?avbrutt=1`,
    referanse: user.id,
    organisasjonId: profil.organisasjon_id,
  });

  if (!okt.ok) return { ok: false, feil: okt.feil };
  if (!okt.data.url) return { ok: false, feil: ord().feil.ingenBetalingslenke };

  redirect(okt.data.url);
}

/**
 * Kjøp én kontroll til. Brukes av kunder på enkeltkontroll som har brukt opp
 * det de har betalt for. Kontoen er allerede åpen; bare kvoten øker, når
 * betalingen er bekreftet (webhook eller «takk»-siden).
 */
export async function kjopKontroll(): Promise<void> {
  const { user, profil } = await krevProfil();
  if (profil.rolle !== "administrator") redirect("/oversikt");
  if (!stripeOppsatt()) redirect("/oversikt");

  const base = grunnUrl();
  const okt = await opprettKasseokt({
    belopNok: ENKELTKONTROLL,
    beskrivelse: "Relavo enkeltkontroll",
    epost: user.email ?? "",
    gjentakende: false,
    suksessUrl: `${base}/betaling/klar?okt={CHECKOUT_SESSION_ID}`,
    avbruttUrl: `${base}/oversikt`,
    referanse: user.id,
    organisasjonId: profil.organisasjon_id,
  });
  if (!okt.ok || !okt.data.url) redirect("/oversikt");
  redirect(okt.data.url);
}

/** Åpner Stripes kundeportal for den som betaler med kort. */
export async function aapneBetalingsportal(): Promise<void> {
  const { supabase, profil } = await krevProfil();
  if (profil.rolle !== "administrator") redirect("/konto");
  const { data: org } = await supabase
    .from("organisasjoner")
    .select("stripe_kunde_id")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();
  if (!org?.stripe_kunde_id) redirect("/konto");
  const r = await opprettPortal(org.stripe_kunde_id, `${grunnUrl()}/konto`);
  if (!r.ok) redirect("/konto?portal=feil");
  redirect(r.data.url);
}
