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
 *
 * Oversikten viser hele lista, banneret viser det øverste. Begge kommer
 * herfra. To uttrekk ville gitt to forskjellige svar på hva som haster, og
 * da er banneret ikke lenger til å stole på.
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

const grupper = cache(async (): Promise<Steg[][]> => {
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
  const g: Steg[][] = [];

  g.push(
    (kritiske ?? []).map((k, i) => ({
      tittel: navn(k),
      detalj: t.endring[k.slag as keyof typeof t.endring] ?? t.endringAnnet,
      kriterium: t.endringKrav,
      href: "/leverandorer",
      knapp: t.seEndringen,
      tone: "brudd" as const,
      kø: i === 0 ? (kritiske?.length ?? 0) - 1 : undefined,
    })),
  );

  // 1 — svar som venter på en vurdering
  g.push(
    (uvurdert ?? []).map((f, i) => ({
      tittel: f.leverandor_navn,
      detalj: t.vurderSvar,
      kriterium: t.vurderSvarKrav,
      href: "/tilbud",
      knapp: t.vurder,
      tone: "brudd" as const,
      kø: i === 0 ? (uvurdert?.length ?? 0) - 1 : undefined,
    })),
  );

  // 2 — ESPD der fristen er ute
  const forfalt = (espd ?? []).filter((e) => (dagerIgjen(e.frist) ?? 0) < 0);
  g.push(
    forfalt.map((f, i) => ({
      tittel: navn(f),
      detalj: t.espdForfalt.replace("{n}", String(Math.abs(dagerIgjen(f.frist) ?? 0))),
      kriterium: t.espdKrav,
      href: "/espd",
      knapp: t.seFristen,
      tone: "brudd" as const,
      kø: i === 0 ? forfalt.length - 1 : undefined,
    })),
  );

  // 3 — § 24-9 sendt, fristen ute, ingenting kommet
  g.push(
    (ubesvart ?? []).map((f, i) => ({
      tittel: f.leverandor_navn,
      detalj: t.ingenRedegjorelse,
      kriterium: t.ingenRedegjorelseKrav,
      href: "/tilbud",
      knapp: t.seSaken,
      tone: "brudd" as const,
      kø: i === 0 ? (ubesvart?.length ?? 0) - 1 : undefined,
    })),
  );

  // 4 — mulig inhabilitet. Samme leverandør kan ha flere treff; lista
  // skal vise selskapet én gang, ikke én linje per navnelikhet.
  const javSett = new Set<string>();
  const javUnike = (jav ?? []).filter((j) => {
    const n = navn(j);
    if (javSett.has(n)) return false;
    javSett.add(n);
    return true;
  });
  g.push(
    javUnike.map((j, i) => ({
      tittel: navn(j),
      detalj: t.jav,
      kriterium: t.javKrav,
      href: "/jav",
      knapp: t.seKoblingen,
      tone: "advarsel" as const,
      kø: i === 0 ? javUnike.length - 1 : undefined,
    })),
  );

  // 5 — frister som løper ut snart
  const snart = (espd ?? []).filter((e) => {
    const d = dagerIgjen(e.frist);
    return d !== null && d >= 0 && d <= 3;
  });
  g.push(
    snart.map((f, i) => {
      const d = dagerIgjen(f.frist) ?? 0;
      return {
        tittel: navn(f),
        detalj: d === 0 ? t.fristIDag : t.fristSnart.replace("{n}", String(d)),
        kriterium: t.espdKrav,
        href: "/espd",
        knapp: t.seFristen,
        tone: "advarsel" as const,
        kø: i === 0 ? snart.length - 1 : undefined,
      };
    }),
  );

  // 6 — kontrollplikten
  const mangler = (antLev ?? 0) - (antKontroll ?? 0);
  g.push(
    mangler > 0
      ? [
          {
            tittel: t.kontrollplikt,
            detalj: t.manglerKontroll
              .replace("{n}", String(mangler))
              .replace("{av}", String(antLev ?? 0)),
            kriterium: t.kontrollpliktKrav,
            href: "/ny-kontroll",
            knapp: t.kjorKontroll,
            tone: "aksent" as const,
          },
        ]
      : [],
  );

  return g;
});

/** Alt som krever noe, i samme rekkefølge som banneret prioriterer. */
export const alleSteg = cache(async (): Promise<Steg[]> =>
  (await grupper()).flat(),
);

/** Det øverste. Står ingenting igjen, er det fordi ingenting står igjen. */
export const nesteSteg = cache(async (): Promise<Steg> => {
  const t = ord().nesteSteg;
  const forste = (await grupper()).flat()[0];
  return (
    forste ?? {
      tittel: t.altIOrden,
      detalj: t.altIOrdenTekst,
      kriterium: t.altIOrdenKrav,
      href: "/leverandorer",
      knapp: t.sePortefoljen,
      tone: "god",
    }
  );
});
