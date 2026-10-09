import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { ord } from "@/lib/sprak";
import { dagerIgjen } from "@/lib/brev";

/**
 * Hva som skal gjøres nå.
 *
 * Ett svar, regnet ut av dataene hver gang siden vises. Ikke et felt noen
 * må huske å sette: et «neste steg» som ligger lagret, er et neste steg som
 * før eller siden er feil, og da er knappen verre enn ingen knapp.
 *
 * Rekkefølgen er ikke hvor irriterende noe er, men hva loven gjør med det
 * hvis det blir liggende:
 *
 *   1. Svar på § 24-9 som ikke er vurdert. Forskriften krever at dere tar
 *      stilling. Fram til det er gjort kan ikke tilbudet avvises, og det
 *      kan heller ikke tildeles.
 *   2. ESPD over fristen etter § 23-5. Fristen er ute, og tas tilbudet
 *      videre uten erklæringen må det begrunnes i protokollen.
 *   3. § 24-9 sendt uten svar, frist passert.
 *   4. Mulig inhabilitet. Må avklares før tildeling, ikke etter.
 *   5. Frister som løper ut om få dager.
 *   6. Leverandører uten lagret kontroll — kontrollplikten i § 5i.
 *
 * Hvert steg sier også hva som skal til for at det er gjort. Den setningen
 * er like viktig som tallet: «dokumentert» og «kontrollert» er ikke det
 * samme, og det er nettopp der kontrollplikten ryker.
 */
export type Steg = {
  tittel: string;
  detalj: string;
  /** Hva som skal til for at dette er gjort. Vises som egen linje. */
  kriterium: string;
  href: string;
  knapp: string;
  tone: "brudd" | "advarsel" | "aksent" | "god";
  /** Hvor mange som står i kø bak denne. */
  kø?: number;
};

export const nesteSteg = cache(async (): Promise<Steg> => {
  const supabase = createClient();
  const t = ord().nesteSteg;
  const idag = new Date().toISOString().slice(0, 10);

  const [{ data: kritiske }, { data: uvurdert }, { data: espd }, { data: ubesvart }, { data: jav },
         { count: antLev }, { count: antKontroll }] = await Promise.all([
    supabase
      .from("overvakning_hendelser")
      .select("id, slag, leverandorer(navn)")
      .eq("alvor", "kritisk")
      .is("lest", null)
      .order("oppdaget", { ascending: false }),
    supabase
      .from("redegjorelser")
      .select("id, leverandor_navn, frist")
      .not("svar_mottatt", "is", null)
      .is("vurdering", null),
    supabase
      .from("espd_erklaringer")
      .select("id, frist, leverandorer(navn)")
      .eq("status", "sendt")
      .is("levert", null)
      .not("frist", "is", null)
      .order("frist"),
    supabase
      .from("redegjorelser")
      .select("id, leverandor_navn, frist")
      .not("sendt", "is", null)
      .is("svar_mottatt", null)
      .not("frist", "is", null)
      .lt("frist", idag),
    supabase.from("jav_treff").select("id, leverandorer(navn)"),
    supabase.from("leverandorer").select("id", { count: "exact", head: true }),
    supabase.from("kontroller").select("id", { count: "exact", head: true }),
  ]);

  const navn = (r: { leverandorer?: unknown }) =>
    (r.leverandorer as { navn?: string } | null)?.navn ?? "—";

  // 0 — noe har endret seg i natt som i seg selv er en avvisningsgrunn.
  // Det går foran alt annet: de andre punktene handler om saker vi
  // allerede visste om.
  if (kritiske?.length) {
    const k = kritiske[0];
    return {
      tittel: navn(k),
      detalj: t.endring[k.slag as keyof typeof t.endring] ?? t.endringAnnet,
      kriterium: t.endringKrav,
      href: "/leverandorer",
      knapp: t.seEndringen,
      tone: "brudd",
      kø: kritiske.length - 1,
    };
  }

  // 1 — svar som venter på en vurdering
  if (uvurdert?.length) {
    const f = uvurdert[0];
    return {
      tittel: f.leverandor_navn,
      detalj: t.vurderSvar,
      kriterium: t.vurderSvarKrav,
      href: "/tilbud",
      knapp: t.vurder,
      tone: "brudd",
      kø: uvurdert.length - 1,
    };
  }

  // 2 — ESPD der fristen er ute
  const forfalt = (espd ?? []).filter((e) => (dagerIgjen(e.frist) ?? 0) < 0);
  if (forfalt.length) {
    const f = forfalt[0];
    const dager = Math.abs(dagerIgjen(f.frist) ?? 0);
    return {
      tittel: navn(f),
      detalj: t.espdForfalt.replace("{n}", String(dager)),
      kriterium: t.espdKrav,
      href: "/espd",
      knapp: t.seFristen,
      tone: "brudd",
      kø: forfalt.length - 1,
    };
  }

  // 3 — § 24-9 sendt, fristen ute, ingenting kommet
  if (ubesvart?.length) {
    const f = ubesvart[0];
    return {
      tittel: f.leverandor_navn,
      detalj: t.ingenRedegjorelse,
      kriterium: t.ingenRedegjorelseKrav,
      href: "/tilbud",
      knapp: t.seSaken,
      tone: "brudd",
      kø: ubesvart.length - 1,
    };
  }

  // 4 — mulig inhabilitet
  if (jav?.length) {
    return {
      tittel: navn(jav[0]),
      detalj: t.jav,
      kriterium: t.javKrav,
      href: "/jav",
      knapp: t.seKoblingen,
      tone: "advarsel",
      kø: jav.length - 1,
    };
  }

  // 5 — frister som løper ut snart
  const snart = (espd ?? []).filter((e) => {
    const d = dagerIgjen(e.frist);
    return d !== null && d >= 0 && d <= 3;
  });
  if (snart.length) {
    const f = snart[0];
    const d = dagerIgjen(f.frist) ?? 0;
    return {
      tittel: navn(f),
      detalj: d === 0 ? t.fristIDag : t.fristSnart.replace("{n}", String(d)),
      kriterium: t.espdKrav,
      href: "/espd",
      knapp: t.seFristen,
      tone: "advarsel",
      kø: snart.length - 1,
    };
  }

  // 6 — kontrollplikten
  const mangler = (antLev ?? 0) - (antKontroll ?? 0);
  if (mangler > 0) {
    return {
      tittel: t.kontrollplikt,
      detalj: t.manglerKontroll
        .replace("{n}", String(mangler))
        .replace("{av}", String(antLev ?? 0)),
      kriterium: t.kontrollpliktKrav,
      href: "/ny-kontroll",
      knapp: t.kjorKontroll,
      tone: "aksent",
    };
  }

  return {
    tittel: t.altIOrden,
    detalj: t.altIOrdenTekst,
    kriterium: t.altIOrdenKrav,
    href: "/leverandorer",
    knapp: t.sePortefoljen,
    tone: "god",
  };
});
