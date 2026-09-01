import { admin } from "@/lib/supabase/admin";

/**
 * Fortnox.
 *
 * Fakturaene skrives i Fortnox, ikke her. Poenget med denne er å slippe å
 * føre dem to ganger: vi henter dem inn og speiler dem, slik at en konto i
 * Relavo viser hva som faktisk er fakturert uten at noen taster det på nytt.
 *
 * REST over fetch, ingen npm-pakke — det er tre kall.
 *
 * OAuth2: tilgangstokenet varer en time, og fornyelsestokenet byttes ut for
 * hver fornyelse. Derfor ligger de i tabellen integrasjoner og ikke i
 * miljøet: et fornyelsestoken i en miljøvariabel er utdatert en time senere.
 */
const BASE = "https://api.fortnox.se/3";
const TOKEN_URL = "https://apps.fortnox.se/oauth-v1/token";

export type Fortnoxfaktura = {
  DocumentNumber: number;
  CustomerName: string;
  OrganisationNumber?: string | null;
  InvoiceDate: string;
  DueDate: string;
  Total: number;
  Balance: number;
  Currency: string;
  Cancelled: boolean;
  FinalPayDate?: string | null;
  YourReference?: string | null;
};

type Svar<T> = { ok: true; data: T } | { ok: false; feil: string; mangler?: true };

async function lagretToken() {
  const { data } = await admin()
    .from("integrasjoner")
    .select("tilgangstoken, fornyelsestoken, utloper")
    .eq("navn", "fortnox")
    .maybeSingle();
  return data;
}

/**
 * Gyldig tilgangstoken, fornyet hvis det er i ferd med å gå ut.
 *
 * Fornyes to minutter før utløp, ikke etter. Et kall som feiler med 401
 * midt i en synk er vanskeligere å rydde opp i enn et unødvendig
 * fornyelseskall.
 */
async function token(): Promise<Svar<string>> {
  const rad = await lagretToken();
  if (!rad?.tilgangstoken)
    return {
      ok: false,
      mangler: true,
      feil: "Fortnox er ikke koblet til ennå. Legg inn tokenene under Fakturering.",
    };

  const utloper = rad.utloper ? new Date(rad.utloper).getTime() : 0;
  if (utloper > Date.now() + 120_000) return { ok: true, data: rad.tilgangstoken };

  if (!rad.fornyelsestoken)
    return { ok: false, feil: "Tilgangstokenet er utløpt og det finnes ikke noe fornyelsestoken." };

  const id = process.env.FORTNOX_CLIENT_ID;
  const hemmelighet = process.env.FORTNOX_CLIENT_SECRET;
  if (!id || !hemmelighet)
    return { ok: false, feil: "FORTNOX_CLIENT_ID og FORTNOX_CLIENT_SECRET mangler." };

  const svar = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${hemmelighet}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: rad.fornyelsestoken,
    }),
  });

  const d = await svar.json();
  if (!svar.ok)
    return { ok: false, feil: d?.error_description ?? `Fortnox svarte ${svar.status}` };

  // Fortnox gir et nytt fornyelsestoken hver gang, og det gamle slutter å
  // virke. Skrives ikke det nye ned, er koblingen død ved neste fornyelse.
  await admin()
    .from("integrasjoner")
    .upsert({
      navn: "fortnox",
      tilgangstoken: d.access_token,
      fornyelsestoken: d.refresh_token,
      utloper: new Date(Date.now() + (d.expires_in ?? 3600) * 1000).toISOString(),
      oppdatert: new Date().toISOString(),
    });

  return { ok: true, data: d.access_token as string };
}

export async function fortnoxKoblet(): Promise<boolean> {
  const rad = await lagretToken();
  return Boolean(rad?.tilgangstoken);
}

/** Fakturaene, nyeste først. Fortnox sider på 100. */
export async function hentFakturaer(sider = 3): Promise<Svar<Fortnoxfaktura[]>> {
  const t = await token();
  if (!t.ok) return t;

  const ut: Fortnoxfaktura[] = [];
  for (let side = 1; side <= sider; side++) {
    const svar = await fetch(
      `${BASE}/invoices?limit=100&page=${side}&sortby=invoicedate&sortorder=descending`,
      {
        headers: {
          Authorization: `Bearer ${t.data}`,
          Accept: "application/json",
        },
      },
    );

    if (!svar.ok) {
      const kropp = await svar.text();
      return { ok: false, feil: `Fortnox svarte ${svar.status}: ${kropp.slice(0, 180)}` };
    }

    const d = await svar.json();
    const rader = (d?.Invoices ?? []) as Fortnoxfaktura[];
    ut.push(...rader);
    if (rader.length < 100) break;
  }

  return { ok: true, data: ut };
}
