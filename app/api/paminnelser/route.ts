import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { vurder, type Aktivitetsrad } from "@/lib/aktivitet";
import { hjerteslag, meldFeil, vaktJobb } from "@/lib/feil";
import { sendEpost } from "@/lib/epost";
import { grunnUrl } from "@/lib/url";
import { foresporselBrev } from "@/lib/epostbrev";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daglig jobb for oss selv: fakturaer som snart forfaller, avtaler som snart
 * går ut, og kunder som ikke bruker tjenesten.
 *
 * Alt går som varsler i «Å gjøre»-lista. Hvert varsel har en nøkkel, og samme
 * nøkkel gir aldri to varsler — jobben kan kjøre hver natt uten å fylle lista
 * med det samme om igjen.
 */
export async function GET(req: NextRequest) {
  const hemmelighet = process.env.CRON_SECRET;
  if (!hemmelighet) return NextResponse.json({ feil: "CRON_SECRET mangler" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${hemmelighet}`)
    return NextResponse.json({ feil: "Ikke autorisert" }, { status: 401 });

  const db = admin();
  const na = Date.now();
  const idag = new Date(na).toISOString().slice(0, 10);
  const om30 = new Date(na + 30 * 86_400_000).toISOString().slice(0, 10);
  const kr = (n: number) => n.toLocaleString("nb-NO").replace(/ /g, " ");

  const varsler: { slag: string; tittel: string; tekst: string; lenke: string; noekkel: string }[] = [];

  // --- Fakturaer: 30 dager før, og igjen hvis dagen er passert uten at den er sendt.
  const { data: plan } = await db
    .from("fakturaplan")
    .select("id, aar, forfaller, belopp, organisasjoner(navn)")
    .eq("status", "planlagt")
    .lte("forfaller", om30);
  for (const p of (plan ?? []) as unknown as { id: string; aar: number; forfaller: string; belopp: number; organisasjoner: { navn: string } | null }[]) {
    const navn = p.organisasjoner?.navn ?? "Ukjent";
    const sen = p.forfaller < idag;
    varsler.push({
      slag: sen ? "faktura_sen" : "faktura_snart",
      tittel: sen ? `Faktura er forsinket — ${navn}` : `Fakturer ${navn} — år ${p.aar}`,
      tekst: `${kr(p.belopp)} NOK eks. mva. Faktureringsdato ${p.forfaller}.`,
      lenke: "/internt/fakturering",
      noekkel: `${sen ? "faktura-sen" : "faktura"}:${p.id}`,
    });
  }

  // --- Avtaler som går ut: 90 dager før. Kommunene fornyes ikke av seg selv, så her må en ny offert sendes.
  const { data: alle } = await db.from("fakturaplan").select("organisasjon_id, forfaller, organisasjoner(navn)");
  const sluttPer = new Map<string, { navn: string; slutt: string }>();
  for (const p of (alle ?? []) as unknown as { organisasjon_id: string; forfaller: string; organisasjoner: { navn: string } | null }[]) {
    const d = new Date(p.forfaller);
    d.setFullYear(d.getFullYear() + 1);
    const slutt = d.toISOString().slice(0, 10);
    const forrige = sluttPer.get(p.organisasjon_id);
    if (!forrige || slutt > forrige.slutt) sluttPer.set(p.organisasjon_id, { navn: p.organisasjoner?.navn ?? "Ukjent", slutt });
  }
  for (const [org, { navn, slutt }] of sluttPer) {
    const dager = Math.floor((new Date(slutt).getTime() - na) / 86_400_000);
    if (dager <= 90 && dager >= -30)
      varsler.push({
        slag: "avtale_slutt",
        tittel: `Avtalen med ${navn} går ut ${slutt}`,
        tekst: "Send en ny offert i god tid. Avtalen forlenges ikke av seg selv.",
        lenke: "/internt/offerter",
        noekkel: `slutt:${org}:${slutt}`,
      });
  }

  // --- Kunder som ikke bruker tjenesten.
  const { data: akt } = await db.rpc("aktivitet_data");
  for (const r of (akt ?? []) as Aktivitetsrad[]) {
    const v = vurder(r, na);
    if (!v.segment || v.nyligKontaktet) continue;
    if (v.segment === "aldri")
      varsler.push({ slag: "inaktiv", tittel: `${r.navn} har aldri tatt tjenesten i bruk`, tekst: `Kontoen er ${v.dager} dager gammel uten en eneste kontroll. Ta kontakt og hør om de trenger hjelp i gang.`, lenke: "/internt/aktivitet", noekkel: `aldri:${r.id}` });
    else if (v.segment === "inaktiv" && v.tersk && v.tersk >= 60)
      varsler.push({ slag: "inaktiv", tittel: `${r.navn} har vært borte i ${v.tersk}+ dager`, tekst: "Ingen innlogging og ingen kontroller. Sjekk om de kommer til å fornye.", lenke: "/internt/aktivitet", noekkel: `inaktiv:${r.id}:${v.tersk}:${r.sist_kontroll ?? r.sist_innlogget ?? ""}`.slice(0, 120) });
    else if (v.segment === "faller")
      varsler.push({ slag: "inaktiv", tittel: `Bruken hos ${r.navn} faller`, tekst: `${r.kontroller_30d} kontroller siste 30 dager mot ${r.kontroller_forrige_30d} måneden før.`, lenke: "/internt/aktivitet", noekkel: `faller:${r.id}:${idag.slice(0, 7)}` });
  }

  let nye = 0;
  for (const v of varsler) {
    const { data } = await db.from("interne_varsler").upsert(v, { onConflict: "noekkel", ignoreDuplicates: true }).select("id");
    if (data?.length) nye += 1;
  }

  // --- Kjedeforespørsler: purring etter 5 og 10 dager, utløp når fristen er ute.
  const { data: apne } = await db
    .from("kjede_foresporsler")
    .select("id, token, mottaker_epost, sendt, purringer, frist, opprettet_av, ledd_id, organisasjoner(navn), kjede_ledd(navn)")
    .eq("status", "venter");
  for (const f of (apne ?? []) as unknown as {
    id: string; token: string; mottaker_epost: string | null; sendt: string; purringer: number; frist: string; opprettet_av: string | null; ledd_id: string;
    organisasjoner: { navn: string } | null; kjede_ledd: { navn: string } | null;
  }[]) {
    const dager = Math.floor((na - new Date(f.sendt).getTime()) / 86_400_000);
    const kunde = f.organisasjoner?.navn ?? "";
    const lev = f.kjede_ledd?.navn ?? "";
    if (f.frist < idag) {
      await db.from("kjede_foresporsler").update({ status: "utlopt" }).eq("id", f.id);
      await db.from("kjede_ledd").update({ kartlegging: "ikke_svart" }).eq("id", f.ledd_id);
      if (f.opprettet_av) {
        const { data } = await db.auth.admin.getUserById(f.opprettet_av);
        if (data.user?.email)
          await sendEpost({ til: data.user.email, emne: `${lev} har ikke svart på kjedeforespørselen`, tekst: `${lev} har ikke oppgitt underleverandører innen fristen. Kjeden står som ikke besvart i Relavo, og er ikke kartlagt lenger ned. ${grunnUrl()}/kjede` });
      }
    } else if (f.mottaker_epost && ((f.purringer === 0 && dager >= 5) || (f.purringer === 1 && dager >= 10))) {
      await sendEpost({ til: f.mottaker_epost, ...foresporselBrev({ kunde, leverandor: lev, lenke: `${grunnUrl()}/underleverandorer/${f.token}`, frist: f.frist, purring: f.purringer + 1 }) });
      await db.from("kjede_foresporsler").update({ purringer: f.purringer + 1 }).eq("id", f.id);
    }
  }

  // --- Sletting: organisasjoner der angrefristen er ute.
  let slettet = 0;
  const { data: forfalt } = await db
    .from("organisasjoner")
    .select("id, navn")
    .not("slettes_den", "is", null)
    .lte("slettes_den", new Date(na).toISOString());
  for (const o of forfalt ?? []) {
    try {
      // Filene i lageret først: radene som peker på dem forsvinner med organisasjonen.
      for (const [bucket, tabell, kol] of [
        ["skatteattest", "skatteattester", "filsti"],
        ["espd", "espd_erklaringer", "levert_filsti"],
      ] as const) {
        const { data: rader } = await db.from(tabell).select(kol).eq("organisasjon_id", o.id);
        const stier = ((rader ?? []) as unknown as Record<string, string | null>[]).map((r) => r[kol]).filter(Boolean) as string[];
        if (stier.length) await db.storage.from(bucket).remove(stier);
      }
      const { data: brukere } = await db.from("profiler").select("id").eq("organisasjon_id", o.id);
      const { error } = await db.from("organisasjoner").delete().eq("id", o.id);
      if (error) throw new Error(error.message);
      for (const b of brukere ?? []) await db.auth.admin.deleteUser(b.id);
      await db.from("interne_varsler").insert({
        slag: "sletting",
        tittel: `Konto slettet: ${o.navn}`,
        tekst: "Organisasjonen, brukerne og filene er slettet etter angrefristen. Fakturaer er beholdt.",
        lenke: "/internt/logg",
        noekkel: `slettet:${o.id}`,
      });
      slettet += 1;
    } catch (e) {
      await meldFeil({ kilde: "jobb", melding: `Sletting av ${o.navn} feilet`, detaljer: e instanceof Error ? e.message : String(e) });
    }
  }

  await hjerteslag("paminnelser");
  await vaktJobb("overvaking", 36);

  return NextResponse.json({ sjekket: varsler.length, nye, slettet });
}
