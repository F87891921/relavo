import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { meldFeil } from "@/lib/feil";
import { sendEpost } from "@/lib/epost";
import { kvitteringBrev } from "@/lib/epostbrev";
import { avsenderlinje } from "@/lib/relavo";
import { hentVarenavn } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe melder betalinger hit, slik at kontoen åpnes også når kunden lukker
 * fanen før de kommer tilbake.
 *
 * Signaturen sjekkes mot hemmeligheten fra Stripe (STRIPE_WEBHOOK_SECRET). Uten
 * den kunne hvem som helst POSTe «betalt» og åpne en konto. Selve
 * registreringen skjer i registrer_betaling(), som teller hver økt én gang —
 * Stripe sender samme hendelse flere ganger, og «takk»-siden melder den også.
 */
function signaturGyldig(kropp: string, topptekst: string | null, hemmelighet: string) {
  if (!topptekst) return false;
  const deler = Object.fromEntries(topptekst.split(",").map((p) => p.split("=") as [string, string]));
  const t = deler.t;
  const v1 = topptekst
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  if (!t || !v1.length) return false;

  // Maks fem minutter gammel, mot gjentatte avspillinger.
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;

  const forventet = createHmac("sha256", hemmelighet).update(`${t}.${kropp}`).digest("hex");
  return v1.some((s) => {
    const a = Buffer.from(s, "hex");
    const b = Buffer.from(forventet, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export async function POST(req: NextRequest) {
  const hemmelighet = process.env.STRIPE_WEBHOOK_SECRET;
  if (!hemmelighet) return NextResponse.json({ feil: "STRIPE_WEBHOOK_SECRET mangler" }, { status: 500 });

  const kropp = await req.text();
  if (!signaturGyldig(kropp, req.headers.get("stripe-signature"), hemmelighet))
    return NextResponse.json({ feil: "Ugyldig signatur" }, { status: 400 });

  const hendelse = JSON.parse(kropp) as {
    type: string;
    data: {
      object: {
        id: string;
        payment_status?: string;
        customer?: string | null;
        metadata?: Record<string, string>;
        amount_total?: number | null;
        amount_paid?: number | null;
        total_excluding_tax?: number | null;
        currency?: string;
        billing_reason?: string;
        amount_subtotal?: number | null;
        total_details?: { amount_discount?: number; amount_tax?: number } | null;
        customer_details?: { email?: string | null } | null;
        customer_email?: string | null;
      };
    };
  };

  if (
    hendelse.type === "checkout.session.completed" ||
    hendelse.type === "checkout.session.async_payment_succeeded"
  ) {
    const okt = hendelse.data.object;
    const org = okt.metadata?.organisasjon_id;
    // Omsetningen lagres for mva-vakten. Netto: er det lagt mva på økten, trekkes den fra.
    if (okt.payment_status === "paid" && (okt.currency ?? "nok").toLowerCase() === "nok") {
      const netto = okt.total_excluding_tax ?? okt.amount_total ?? 0;
      const { data: ny } = await admin()
        .from("omsetning")
        .upsert({ referanse: okt.id, kilde: "stripe", belop_ore: netto }, { onConflict: "referanse", ignoreDuplicates: true })
        .select("referanse");

      // Relavos eget kvitto, bare ved første gang vi ser betalingen (Stripe sender
      // samme hendelse flere ganger) og bare for betalinger startet fra Relavo.
      // Stripes eget kvitto bruker kontoens felles utseende, som er ISO-kollens.
      const til = okt.customer_details?.email ?? okt.customer_email;
      if (ny?.length && org && til) {
        try {
          const kr = (ore: number) => `${(ore / 100).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;
          const rabatt = okt.total_details?.amount_discount ?? 0;
          const mva = okt.total_details?.amount_tax ?? 0;
          const brev = kvitteringBrev({
            vare: (await hentVarenavn(okt.id)) ?? "Relavo",
            delsumma: kr(okt.amount_subtotal ?? okt.amount_total ?? 0),
            rabatt: rabatt > 0 ? `\u2212${kr(rabatt)}` : null,
            mva: mva > 0 ? kr(mva) : null,
            betalt: kr(okt.amount_total ?? 0),
            dato: new Date().toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" }),
            referanse: okt.id.slice(-12),
            avsender: avsenderlinje(),
          });
          const svar = await sendEpost({ til, ...brev });
          if (!svar.ok) await meldFeil({ kilde: "server", melding: "Kvittering kunne ikke sendes", detaljer: `${okt.id}: ${svar.feil}` });
        } catch (e) {
          await meldFeil({ kilde: "server", melding: "Kvittering feilet", detaljer: `${okt.id}: ${String(e).slice(0, 200)}` });
        }
      }
    }
    if (okt.payment_status === "paid" && org) {
      const { error } = await admin().rpc("registrer_betaling", {
        p_okt: okt.id,
        p_org: org,
        p_kunde: okt.customer ?? null,
      });
      // 500 gjør at Stripe prøver igjen. Det er riktig: en betaling vi ikke fikk registrert må ikke gå tapt.
      if (error) {
        await meldFeil({ kilde: "server", melding: "Stripe-betaling kunne ikke registreres", detaljer: `${okt.id}: ${error.message}` });
        return NextResponse.json({ feil: error.message }, { status: 500 });
      }
    }
  }

  // Fornyelsen av et kortabonnement er ny omsetning. Første betaling telles via økten over.
  if (hendelse.type === "invoice.paid") {
    const f = hendelse.data.object;
    if (f.billing_reason === "subscription_cycle" && (f.currency ?? "nok").toLowerCase() === "nok") {
      const netto = f.total_excluding_tax ?? f.amount_paid ?? 0;
      await admin()
        .from("omsetning")
        .upsert({ referanse: f.id, kilde: "stripe", belop_ore: netto }, { onConflict: "referanse", ignoreDuplicates: true });
    }
  }

  // Årsprenumerasjonen til selskap som betaler med kort.
  //  - betaling som feilet: vi varsles, kunden får en e-post fra Stripe
  //  - abonnement avsluttet: perioden er ute og kontoen stenges
  const obj = hendelse.data.object as { id: string; customer?: string | null };
  if (hendelse.type === "invoice.payment_failed" || hendelse.type === "customer.subscription.deleted") {
    const db = admin();
    const { data: org } = obj.customer
      ? await db.from("organisasjoner").select("id, navn").eq("stripe_kunde_id", obj.customer).maybeSingle()
      : { data: null };
    if (org) {
      const stengt = hendelse.type === "customer.subscription.deleted";
      if (stengt) await db.from("organisasjoner").update({ status: "stengt" }).eq("id", org.id);
      await db.from("interne_varsler").upsert(
        {
          slag: stengt ? "abonnement_slutt" : "betaling_feilet",
          tittel: stengt ? `${org.navn} har sagt opp kortabonnementet` : `Kortbetalingen feilet — ${org.navn}`,
          tekst: stengt ? "Perioden er ute og kontoen er stengt. Ta kontakt hvis det var feil." : "Stripe prøver igjen. Ta kontakt hvis det fortsetter.",
          lenke: "/internt",
          noekkel: `${stengt ? "abonnement-slutt" : "betaling-feilet"}:${obj.id}`,
        },
        { onConflict: "noekkel", ignoreDuplicates: true },
      );
    }
  }

  return NextResponse.json({ mottatt: true });
}
