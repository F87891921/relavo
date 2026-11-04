import type { Indikator } from "@/lib/indikatorer";

/**
 * Sanksjons- og PEP-kontroll av selskapet og personene i styre og ledelse,
 * via Proff (Premium API for roller, Premium Compliance API for søkene).
 *
 * Et treff på navn er ikke en bekreftelse: mange heter det samme. Rapporten
 * sier derfor «mulig treff», og kunden må selv kontrollere. Vi lagrer bare
 * navnet på den som ga treff, ikke listen over alle vi sjekket.
 *
 * Ikke satt PROFF_COMPLIANCE_TOKEN, gjør vi ingenting og sier ingenting: da er
 * funksjonen ikke slått på. Er den satt og søket feiler, står det i rapporten.
 */
const MAKS_PERSONER = 10;

type Person = { fornavn: string; etternavn: string; navn: string; fodt: string | null };

const auth = (nokkel: string) => ({ Authorization: `Token ${nokkel}`, Accept: "application/json" });

async function json(url: string, nokkel: string): Promise<{ ok: true; data: any } | { ok: false }> {
  try {
    const r = await fetch(url, { headers: auth(nokkel), cache: "no-store" });
    if (r.status === 204) return { ok: true, data: null };
    if (!r.ok) return { ok: false };
    return { ok: true, data: await r.json() };
  } catch {
    return { ok: false };
  }
}

/** Splitter «Etternavn, Fornavn» eller «Fornavn Etternavn». */
function delNavn(navn: string): { fornavn: string; etternavn: string } {
  const n = navn.trim().replace(/\s+/g, " ");
  if (n.includes(",")) {
    const [e, f] = n.split(",").map((x) => x.trim());
    return { fornavn: f ?? "", etternavn: e };
  }
  const deler = n.split(" ");
  return { fornavn: deler.slice(0, -1).join(" "), etternavn: deler[deler.length - 1] };
}

const gyldigDato = (d: unknown): string | null =>
  typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : null;

async function hentPersoner(orgnr: string, nokkel: string): Promise<Person[] | null> {
  const svar = await json(`https://api.proff.no/api/companies/register/NO/${orgnr}`, nokkel);
  if (!svar.ok) return null;
  const d = svar.data ?? {};
  const rader = [...(d.personRoles ?? []), ...(d.signatoryRoles ?? []), ...(d.procurationRoles ?? [])];
  const sett = new Map<string, Person>();
  for (const r of rader) {
    const navn = String(r?.name ?? "").trim();
    if (!navn) continue;
    const fodt = gyldigDato(r?.birthDate);
    const nokkelen = `${navn.toLowerCase()}|${fodt ?? ""}`;
    if (!sett.has(nokkelen)) sett.set(nokkelen, { ...delNavn(navn), navn, fodt });
  }
  return [...sett.values()].slice(0, MAKS_PERSONER);
}

/** Antall treff i et Compliance-svar. Tåler både camelCase og PascalCase. */
function antallTreff(data: any): number {
  let sum = 0;
  const gaa = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(gaa);
    const c = v.categories ?? v.Categories;
    if (Array.isArray(c)) for (const k of c) sum += Number(k?.hitCount ?? k?.HitCount ?? 0);
    else Object.values(v).forEach(gaa);
  };
  gaa(data);
  return sum;
}

const lister = (navn: string[]) => navn.map((n) => `listName=${n}`).join("&");

export const complianceOppsatt = () =>
  Boolean(process.env.PROFF_COMPLIANCE_TOKEN && (process.env.PROFF_PREMIUM_TOKEN ?? process.env.PROFF_CREDIT_TOKEN));

export async function proffComplianceIndikatorer(orgnr: string, selskapsnavn: string): Promise<Indikator[]> {
  const cNokkel = process.env.PROFF_COMPLIANCE_TOKEN;
  // Roller hentes fra Premium API, som har egen nøkkel. Faller tilbake på den
  // gamle variabelen så ingenting slutter å virke før den nye er satt.
  const pNokkel = process.env.PROFF_PREMIUM_TOKEN ?? process.env.PROFF_CREDIT_TOKEN;
  if (!cNokkel || !pNokkel) return [];

  const dato = new Date().toLocaleDateString("nb-NO");
  const base = "https://capi.proff.no";
  const ut: Indikator[] = [];
  let feil = false;

  // Selskapet: sanksjoner og statlig eide selskaper.
  const sSel = await json(`${base}/sanctions?companyName=${encodeURIComponent(selskapsnavn)}&${lister(["SANCTIONS_AT"])}`, cNokkel);
  if (!sSel.ok) feil = true;
  else if (antallTreff(sSel.data) > 0)
    ut.push({
      id: "compliance-selskap-sanksjon",
      niva: "varsel",
      tittel: "Mulig treff på sanksjonsliste (selskapet)",
      tekst: `Selskapsnavnet ga treff på en internasjonal sanksjonsliste (EU, FN, OFAC eller Storbritannia). Treff på navn er ikke en bekreftelse. Kontroller manuelt. Kilde: Proff, ${dato}.`,
    });

  const soe = await json(`${base}/soe?companyName=${encodeURIComponent(selskapsnavn)}`, cNokkel);
  if (soe.ok && antallTreff(soe.data) > 0)
    ut.push({
      id: "compliance-soe",
      niva: "info",
      tittel: "Selskapet kan være statlig eid",
      tekst: `Navnet ga treff i en oversikt over statlig eide selskaper. Kilde: Proff, ${dato}.`,
    });

  // Personene i styre og ledelse.
  const personer = await hentPersoner(orgnr, pNokkel);
  if (personer === null) feil = true;
  else {
    const sanksjonsTreff: string[] = [];
    const pepTreff: string[] = [];
    // Fem personer om gangen: raskt nok til at kontrollen ikke henger, og
    // skånsomt nok til at Proff ikke ser det som et angrep.
    const sok = async (p: Person) => {
      const q = `lastName=${encodeURIComponent(p.etternavn)}${p.fornavn ? `&firstName=${encodeURIComponent(p.fornavn)}` : ""}${p.fodt ? `&dob=${p.fodt}` : ""}`;
      const [s, pep] = await Promise.all([
        json(`${base}/sanctions?${q}&${lister(["SANCTIONS_AT"])}`, cNokkel),
        json(`${base}/pep/nordic?${q}&${lister(["NORDIC_PEP"])}`, cNokkel),
      ]);
      return { p, s, pep };
    };
    for (let i = 0; i < personer.length; i += 5) {
      const gruppe = await Promise.all(personer.slice(i, i + 5).map(sok));
      for (const { p, s, pep } of gruppe) {
        if (!s.ok || !pep.ok) feil = true;
        if (s.ok && antallTreff(s.data) > 0) sanksjonsTreff.push(p.navn);
        if (pep.ok && antallTreff(pep.data) > 0) pepTreff.push(p.navn);
      }
    }

    if (sanksjonsTreff.length)
      ut.push({
        id: "compliance-person-sanksjon",
        niva: "varsel",
        tittel: "Mulig treff på sanksjonsliste (person i styre eller ledelse)",
        tekst: `Navnet ga treff for: ${sanksjonsTreff.join(", ")}. Mange personer har samme navn, så dette er en mulig treff og ikke en bekreftelse. Kontroller manuelt. Kilde: Proff, ${dato}.`,
      });
    if (pepTreff.length)
      ut.push({
        id: "compliance-person-pep",
        niva: "info",
        tittel: "Mulig PEP-treff (person i styre eller ledelse)",
        tekst: `Navnet ga treff i en liste over politisk eksponerte personer for: ${pepTreff.join(", ")}. En PEP-status er ikke i seg selv noe galt. Mange personer har samme navn, så kontroller manuelt. Kilde: Proff, ${dato}.`,
      });

    if (!feil && !sanksjonsTreff.length && !pepTreff.length && !ut.length)
      ut.push({
        id: "compliance-ingen",
        niva: "info",
        tittel: "Ingen treff på sanksjons- eller PEP-lister",
        tekst: personer.length
          ? `Søkt på selskapet og ${personer.length} person${personer.length === 1 ? "" : "er"} i styre, ledelse og signatur${personer.length >= MAKS_PERSONER ? ` (de ${MAKS_PERSONER} første)` : ""}. Søk på navn fanger ikke alt. Kilde: Proff, ${dato}.`
          : `Søkt på selskapet. Proff har ingen personer registrert i roller. Kilde: Proff, ${dato}.`,
      });
  }

  if (feil)
    ut.push({
      id: "compliance-feil",
      niva: "info",
      tittel: "Sanksjons- og PEP-kontroll kunne ikke fullføres",
      tekst: "Vi fikk ikke svar fra Proff på hele søket. Resten av rapporten er ikke berørt. Kjør kontrollen på nytt senere.",
    });

  return ut;
}

/** Utfallet av sanksjons- og PEP-søket. null = ikke slått på. */
export function complianceStatus(ind: Indikator[]): "ok" | "treff" | "feil" | null {
  const ids = ind.map((i) => i.id).filter((id) => id.startsWith("compliance-"));
  if (!ids.length) return null;
  if (ids.includes("compliance-feil")) return "feil";
  if (ids.some((id) => id.endsWith("-sanksjon"))) return "treff";
  return "ok";
}
