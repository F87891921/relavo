/**
 * Stripe, over REST med fetch. Ingen npm-pakke: alt vi trenger er å opprette
 * en Checkout-økt og lese den tilbake, og en avhengighet til for to kall er
 * en avhengighet for mye.
 *
 * Kortnummeret tar vi aldri imot. Kunden sendes til Stripes egen side, og vi
 * får bare vite om økten er betalt. Det holder oss utenfor PCI-omfanget, og
 * det er den eneste grunnen som betyr noe.
 *
 * Er nøkkelen ikke satt, sier vi det. Grensesnittet skal aldri vise et
 * kortskjema som ikke tar imot noe.
 */
export const stripeOppsatt = () => Boolean(process.env.STRIPE_SECRET_KEY);

type Svar<T> = { ok: true; data: T } | { ok: false; feil: string; mangler?: true };

async function kall<T>(sti: string, kropp?: URLSearchParams): Promise<Svar<T>> {
  const nokkel = process.env.STRIPE_SECRET_KEY;
  if (!nokkel)
    return {
      ok: false,
      mangler: true,
      feil: "Ingen betalingsleverandør er koblet til. Sett STRIPE_SECRET_KEY.",
    };

  try {
    const svar = await fetch(`https://api.stripe.com/v1/${sti}`, {
      method: kropp ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${nokkel}`,
        ...(kropp ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      },
      ...(kropp ? { body: kropp } : {}),
    });

    const data = await svar.json();
    if (!svar.ok)
      return { ok: false, feil: data?.error?.message ?? `Stripe svarte ${svar.status}` };
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, feil: e instanceof Error ? e.message : "Ukjent feil" };
  }
}

export type Kasseokt = {
  id: string;
  url: string | null;
  payment_status: string;
  customer: string | null;
  amount_total: number | null;
};

/**
 * Én Checkout-økt.
 *
 * Beløpet sendes som pris i ører, ikke som en pris-id fra Stripe-katalogen.
 * Katalogen ville krevd at prisene finnes to steder — hos Stripe og i
 * lib/offert.ts — og de to ville før eller siden sagt ulike ting.
 */
export function opprettKasseokt(o: {
  belopNok: number;
  beskrivelse: string;
  epost: string;
  gjentakende: boolean;
  suksessUrl: string;
  avbruttUrl: string;
  referanse: string;
}) {
  const p = new URLSearchParams();
  p.set("mode", o.gjentakende ? "subscription" : "payment");
  p.set("success_url", o.suksessUrl);
  p.set("cancel_url", o.avbruttUrl);
  p.set("customer_email", o.epost);
  p.set("client_reference_id", o.referanse);
  p.set("line_items[0][quantity]", "1");
  p.set("line_items[0][price_data][currency]", "nok");
  p.set("line_items[0][price_data][product_data][name]", o.beskrivelse);
  p.set("line_items[0][price_data][unit_amount]", String(Math.round(o.belopNok * 100)));
  if (o.gjentakende) p.set("line_items[0][price_data][recurring][interval]", "month");

  return kall<Kasseokt>("checkout/sessions", p);
}

export const hentKasseokt = (id: string) =>
  kall<Kasseokt>(`checkout/sessions/${encodeURIComponent(id)}`);
