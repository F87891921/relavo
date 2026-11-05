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
import { aktivtSprak } from "@/lib/sprak";

export const stripeOppsatt = () => Boolean(process.env.STRIPE_SECRET_KEY);

/** Hvilken Stripe-modus nøkkelen peker mot. Vises internt så ingen tror de tar imot ekte betalinger i testmodus. */
export function stripeModus(): "test" | "live" | null {
  const k = process.env.STRIPE_SECRET_KEY ?? "";
  if (k.startsWith("sk_live_") || k.startsWith("rk_live_")) return "live";
  if (k.startsWith("sk_test_") || k.startsWith("rk_test_")) return "test";
  return null;
}

type Svar<T> = { ok: true; data: T } | { ok: false; feil: string; mangler?: true };

async function kall<T>(sti: string, kropp?: URLSearchParams, metode?: "DELETE", versjon?: string): Promise<Svar<T>> {
  const nokkel = process.env.STRIPE_SECRET_KEY;
  if (!nokkel)
    return {
      ok: false,
      mangler: true,
      feil: "Ingen betalingsleverandør er koblet til. Sett STRIPE_SECRET_KEY.",
    };

  try {
    const svar = await fetch(`https://api.stripe.com/v1/${sti}`, {
      method: metode ?? (kropp ? "POST" : "GET"),
      headers: {
        Authorization: `Bearer ${nokkel}`,
        ...(versjon ? { "Stripe-Version": versjon } : {}),
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
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
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
  /** Hvor ofte en prenumerasjon trekkes. Selskap betaler ett år om gangen. */
  intervall?: "month" | "year";
  suksessUrl: string;
  avbruttUrl: string;
  referanse: string;
  organisasjonId?: string;
  /** Id-en til en Relavo-kampanjekode, funnet med finnRabattkode. */
  rabattkodeId?: string;
}) {
  const p = new URLSearchParams();
  p.set("mode", o.gjentakende ? "subscription" : "payment");
  p.set("success_url", o.suksessUrl);
  p.set("cancel_url", o.avbruttUrl);
  p.set("customer_email", o.epost);
  p.set("client_reference_id", o.referanse);
  if (o.organisasjonId) p.set("metadata[organisasjon_id]", o.organisasjonId);
  // Rabattkoden skrives inn hos oss, ikke på Stripes side: kontoen deles med
  // ISO-kollen, og Stripes eget felt tar imot alle kodene i kontoen. Bare koder
  // merket app=relavo slipper gjennom (se finnRabattkode).
  if (o.rabattkodeId) p.set("discounts[0][promotion_code]", o.rabattkodeId);
  // Betalingssiden på samme språk som kunden har på Relavo, ikke det nettleseren
  // tilfeldigvis står på. Norsk bokmål er «nb» hos Stripe.
  p.set("locale", ({ no: "nb", sv: "sv", en: "en" } as const)[aktivtSprak()]);
  p.set("line_items[0][quantity]", "1");
  p.set("line_items[0][price_data][currency]", "nok");
  p.set("line_items[0][price_data][product_data][name]", o.beskrivelse);
  p.set("line_items[0][price_data][unit_amount]", String(Math.round(o.belopNok * 100)));
  if (o.gjentakende) p.set("line_items[0][price_data][recurring][interval]", o.intervall ?? "month");
  // Moms. Prisene våre er eks. mva, og uten dette tar Stripe bare imot netto-
  // beløpet. Settes STRIPE_MVA_ID (en skattesats lagt inn i Stripe, 25 %, ikke
  // inkludert i prisen) legges mva på betalingen. Ikke satt = ingen mva, helt
  // til det er avklart med revisor om og hvordan vi skal kreve inn den.
  if (process.env.STRIPE_MVA_ID) p.set("line_items[0][tax_rates][0]", process.env.STRIPE_MVA_ID);

  // Kontoen deles med ISO-kollen. Betalingssiden får Relavos navn, logo og farge, og
  // kortutskriften står som RELAVO i stedet for kontoens felles tekst. Kvitteringen
  // Stripe sender selv bruker fortsatt kontoens merkevare (den kan ikke settes per
  // betaling). Feiler Stripe på noe av dette, tas vanlig betalingsside i stedet:
  // en kunde skal aldri miste muligheten til å betale på grunn av pynt.
  const pen = new URLSearchParams(p);
  pen.set("branding_settings[display_name]", "Relavo");
  pen.set("branding_settings[logo][type]", "url");
  pen.set("branding_settings[logo][url]", "https://relavo.no/brand/relavo-logo.png");
  pen.set("branding_settings[icon][type]", "url");
  pen.set("branding_settings[icon][url]", "https://relavo.no/brand/relavo-ikon.png");
  pen.set("branding_settings[button_color]", "#654b70");
  pen.set("branding_settings[background_color]", "#ffffff");
  pen.set("branding_settings[border_style]", "rounded");
  if (!o.gjentakende) pen.set("payment_intent_data[statement_descriptor]", "RELAVO");
  return kall<Kasseokt>("checkout/sessions", pen, undefined, "2025-09-30.clover").then((svar) =>
    svar.ok ? svar : kall<Kasseokt>("checkout/sessions", p),
  );
}

export const hentKasseokt = (id: string) =>
  kall<Kasseokt>(`checkout/sessions/${encodeURIComponent(id)}`);

/**
 * Stripes kundeportal: kunden bytter kort og sier opp selv. Krever at portalen
 * er slått på i Stripe (Innstillinger → Billing → Kundeportal).
 */
export const opprettPortal = (kunde: string, returUrl: string) =>
  kall<{ url: string }>(
    "billing_portal/sessions",
    new URLSearchParams({ customer: kunde, return_url: returUrl }),
  );

/** Avslutter alle aktive abonnementer for en kunde, brukt når en konto slettes. */
export async function avsluttAbonnementer(kunde: string): Promise<{ ok: boolean; feil?: string }> {
  const nokkel = process.env.STRIPE_SECRET_KEY;
  if (!nokkel) return { ok: true };
  try {
    const liste = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(kunde)}&status=active&limit=20`, {
      headers: { Authorization: `Bearer ${nokkel}` },
    });
    const d = (await liste.json()) as { data?: { id: string }[]; error?: { message: string } };
    if (!liste.ok) return { ok: false, feil: d.error?.message };
    for (const s of d.data ?? [])
      await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(s.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${nokkel}` },
      });
    return { ok: true };
  } catch (e) {
    return { ok: false, feil: e instanceof Error ? e.message : "Ukjent feil" };
  }
}

/* ------------------------------------------------------------ Rabattkoder */

export type Kampanjekode = {
  id: string;
  code: string;
  active: boolean;
  times_redeemed: number;
  max_redemptions: number | null;
  expires_at: number | null;
  rabatt: string;
  varighet: string;
};

type Kupong = {
  id: string;
  percent_off?: number | null;
  amount_off?: number | null;
  duration?: string;
  duration_in_months?: number | null;
};

const rabattTekst = (k?: Kupong | null) =>
  !k
    ? "—"
    : k.percent_off != null
      ? `${k.percent_off} %`
      : k.amount_off != null
        ? `${(k.amount_off / 100).toLocaleString("nb-NO")} kr`
        : "—";

const varighetTekst = (k?: Kupong | null) =>
  !k?.duration
    ? "—"
    : k.duration === "once"
      ? "Første betaling"
      : k.duration === "forever"
        ? "Hele avtalen"
        : `${k.duration_in_months ?? "?"} måneder`;

/**
 * Lager en kupong og en kampanjekode som peker på den. Stripes API har endret
 * hvordan koden knyttes til kupongen, så vi prøver den gamle måten først og
 * den nye hvis Stripe ber om det.
 */
export async function lagKampanjekode(o: {
  kode: string;
  prosent?: number;
  belopNok?: number;
  varighet: "once" | "repeating" | "forever";
  maneder?: number;
  maksBruk?: number;
  utloper?: string;
}): Promise<{ ok: true } | { ok: false; feil: string }> {
  const k = new URLSearchParams();
  k.set("name", o.kode);
  k.set("metadata[app]", "relavo");
  if (o.prosent) k.set("percent_off", String(o.prosent));
  else if (o.belopNok) {
    k.set("amount_off", String(Math.round(o.belopNok * 100)));
    k.set("currency", "nok");
  }
  k.set("duration", o.varighet);
  if (o.varighet === "repeating" && o.maneder) k.set("duration_in_months", String(o.maneder));
  const kupong = await kall<{ id: string }>("coupons", k);
  if (!kupong.ok) return kupong;

  const lag = (ny: boolean) => {
    const p = new URLSearchParams();
    p.set("code", o.kode);
    p.set("metadata[app]", "relavo");
    if (ny) {
      p.set("promotion[type]", "coupon");
      p.set("promotion[coupon]", kupong.data.id);
    } else p.set("coupon", kupong.data.id);
    if (o.maksBruk) p.set("max_redemptions", String(o.maksBruk));
    if (o.utloper) p.set("expires_at", String(Math.floor(new Date(`${o.utloper}T23:59:59Z`).getTime() / 1000)));
    return kall("promotion_codes", p);
  };

  // Kontoens API-versjon er ny, og den vil ha promotion[coupon]. Prøver den
  // nye måten først og faller tilbake på den gamle for eldre kontoer.
  let svar = await lag(true);
  // Bare «ukjent parameter» betyr at Stripe vil ha den andre formen. Alle andre
  // feil (koden finnes, ugyldig dato) skal vises som de er, ikke skjules av
  // et andre forsøk som feiler på en annen måte.
  if (!svar.ok && /unknown parameter/i.test(svar.feil)) {
    const forste = svar;
    svar = await lag(false);
    if (!svar.ok) svar = forste;
  }
  if (!svar.ok) {
    // Kupongen er lagd, men koden ble det ikke. Fjern den så den ikke blir liggende.
    await kall(`coupons/${encodeURIComponent(kupong.data.id)}`, undefined, "DELETE");
    return svar;
  }
  return { ok: true };
}

export async function listKampanjekoder(): Promise<{ ok: true; koder: Kampanjekode[] } | { ok: false; feil: string }> {
  type Rad = {
    id: string; code: string; active: boolean; times_redeemed: number;
    max_redemptions: number | null; expires_at: number | null;
    metadata?: Record<string, string> | null;
    coupon?: Kupong | string | null; promotion?: { coupon?: Kupong | string | null } | null;
  };
  let svar = await kall<{ data: Rad[] }>("promotion_codes?limit=100&expand[]=data.coupon");
  if (!svar.ok) svar = await kall<{ data: Rad[] }>("promotion_codes?limit=100&expand[]=data.promotion.coupon");
  if (!svar.ok) svar = await kall<{ data: Rad[] }>("promotion_codes?limit=100");
  if (!svar.ok) return svar;
  // Uten utvidelse kommer kupongen bare som id. Hent den, ellers står det «—».
  const egne = svar.data.data.filter((r) => r.metadata?.app === "relavo");
  const kuponger = new Map<string, Kupong>();
  await Promise.all(
    egne.map(async (r) => {
      const ref = r.coupon ?? r.promotion?.coupon;
      if (typeof ref === "string") {
        const k = await kall<Kupong>(`coupons/${encodeURIComponent(ref)}`);
        if (k.ok) kuponger.set(r.id, k.data);
      }
    }),
  );
  return {
    ok: true,
    // Bare Relavos egne koder. Kontoen deles med ISO-kollen, og de skal ikke se hverandres.
    koder: egne.map((r) => {
      const c = kuponger.get(r.id) ?? (typeof r.coupon === "object" ? r.coupon : null) ?? (typeof r.promotion?.coupon === "object" ? r.promotion?.coupon : null);
      return {
        id: r.id,
        code: r.code,
        active: r.active,
        times_redeemed: r.times_redeemed,
        max_redemptions: r.max_redemptions,
        expires_at: r.expires_at,
        rabatt: rabattTekst(c as Kupong | null),
        varighet: varighetTekst(c as Kupong | null),
      };
    }),
  };
}

export async function slaAvKampanjekode(id: string) {
  const p = new URLSearchParams();
  p.set("active", "false");
  return kall(`promotion_codes/${encodeURIComponent(id)}`, p);
}


/**
 * Slår opp en rabattkode kunden har skrevet. Bare aktive koder merket
 * app=relavo gjelder: kontoen deles med ISO-kollen, og en kode derfra skal
 * ikke virke her.
 */
export async function finnRabattkode(kode: string): Promise<{ ok: true; id: string } | { ok: false }> {
  const ren = kode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (ren.length < 3) return { ok: false };
  const svar = await kall<{ data: { id: string; active: boolean; metadata?: Record<string, string> | null }[] }>(
    `promotion_codes?code=${encodeURIComponent(ren)}&active=true&limit=1`,
  );
  const r = svar.ok ? svar.data.data[0] : null;
  if (!r || r.metadata?.app !== "relavo") return { ok: false };
  return { ok: true, id: r.id };
}


/** Navnet på det som ble kjøpt i en betalingsøkt, til kvitteringen. */
export async function hentVarenavn(oktId: string): Promise<string | null> {
  const svar = await kall<{ data: { description?: string | null }[] }>(
    `checkout/sessions/${encodeURIComponent(oktId)}/line_items?limit=1`,
  );
  return svar.ok ? (svar.data.data[0]?.description ?? null) : null;
}
