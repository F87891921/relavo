"use server";

import { revalidatePath } from "next/cache";
import { krevProfil } from "@/lib/tilgang";
import { finnJav, type JavTreff } from "@/lib/jav";

export type Svar = { ok: true; melding?: string } | { ok: false; feil: string };

const t = (fd: FormData, n: string) => String(fd.get(n) ?? "").trim();

/**
 * Deltakerne er folk hos kunden selv — saksbehandlere, bestillere,
 * evalueringskomiteen. De er det kontrollen krysser leverandørens styre mot.
 *
 * Funksjonen har ligget ferdig i basen siden 0006 uten noen vei inn i den.
 * Uten deltakere svarer jav-kontrollen «ikke kontrollert», og det er riktig
 * svar — men det er et svar ingen kunde kunne gjøre noe med.
 */
export async function nyDeltaker(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const navn = t(fd, "navn");
  const rolle = t(fd, "rolle");

  if (!navn) return { ok: false, feil: "Navnet kan ikke være tomt." };
  if (!rolle) return { ok: false, feil: "Rollen må fylles ut." };

  // Samme person to ganger gir to identiske treff på hver kontroll. Det ser
  // ut som to funn, men er ett.
  const { data: finnes } = await supabase
    .from("prosjektdeltakere")
    .select("id")
    .eq("organisasjon_id", profil.organisasjon_id)
    .ilike("navn", navn)
    .maybeSingle();

  if (finnes) return { ok: false, feil: `${navn} er allerede registrert.` };

  const { error } = await supabase.from("prosjektdeltakere").insert({
    organisasjon_id: profil.organisasjon_id,
    navn,
    rolle,
  });

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/jav");
  return { ok: true, melding: `${navn} er lagt til.` };
}

/**
 * Lim inn en liste. En evalueringskomité kommer som et avsnitt i en e-post
 * eller et utklipp fra protokollen, ikke som åtte separate skjemaer.
 *
 * Formatet er «Navn, rolle» per linje. Mangler kommaet, settes rollen til
 * den som er valgt i feltet over — det er nesten alltid samme rolle for hele
 * limte lista.
 */
export async function limInnDeltakere(fd: FormData): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const standardrolle = t(fd, "standardrolle") || "Deltaker i anskaffelsen";
  const linjer = String(fd.get("liste") ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!linjer.length) return { ok: false, feil: "Lista er tom." };

  const nye = linjer.map((linje) => {
    // Siste komma deler, ikke første: «Hansen, Ola, saksbehandler» finnes.
    const i = linje.lastIndexOf(",");
    const navn = (i === -1 ? linje : linje.slice(0, i)).trim();
    const rolle = (i === -1 ? "" : linje.slice(i + 1)).trim() || standardrolle;
    return { navn, rolle };
  }).filter((d) => d.navn);

  const { data: eksisterende } = await supabase
    .from("prosjektdeltakere")
    .select("navn")
    .eq("organisasjon_id", profil.organisasjon_id);

  const finnes = new Set((eksisterende ?? []).map((d) => d.navn.toLowerCase()));

  // Dobler både mot basen og innenfor selve lista.
  const sett = new Set<string>();
  const skalInn = nye.filter((d) => {
    const n = d.navn.toLowerCase();
    if (finnes.has(n) || sett.has(n)) return false;
    sett.add(n);
    return true;
  });

  if (!skalInn.length)
    return { ok: false, feil: "Alle i lista er allerede registrert." };

  const { error } = await supabase.from("prosjektdeltakere").insert(
    skalInn.map((d) => ({
      organisasjon_id: profil.organisasjon_id,
      navn: d.navn,
      rolle: d.rolle,
    })),
  );

  if (error) return { ok: false, feil: error.message };

  const hoppet = nye.length - skalInn.length;
  revalidatePath("/jav");
  return {
    ok: true,
    melding:
      `${skalInn.length} lagt til.` +
      (hoppet ? ` ${hoppet} var allerede registrert.` : ""),
  };
}

/**
 * Treffene blir stående når deltakeren fjernes — de er spor av en kontroll
 * som faktisk ble gjort, og journalføringsplikten gjelder sporet, ikke lista.
 * Derfor er det bare raden i prosjektdeltakere som går.
 *
 * Fremmednøkkelen i 0006 er «on delete cascade», så treffene ville fulgt med.
 * Vi løsner dem først.
 */
export async function fjernDeltaker(id: string): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const { data: deltaker } = await supabase
    .from("prosjektdeltakere")
    .select("navn")
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id)
    .maybeSingle();

  if (!deltaker) return { ok: false, feil: "Fant ikke deltakeren." };

  const { count } = await supabase
    .from("jav_treff")
    .select("id", { count: "exact", head: true })
    .eq("deltaker_id", id);

  if (count)
    return {
      ok: false,
      feil: `${deltaker.navn} har ${count} ${count === 1 ? "treff" : "treff"} i kontrollhistorikken og kan ikke fjernes. Sporet må stå.`,
    };

  const { error } = await supabase
    .from("prosjektdeltakere")
    .delete()
    .eq("id", id)
    .eq("organisasjon_id", profil.organisasjon_id);

  if (error) return { ok: false, feil: error.message };

  revalidatePath("/jav");
  return { ok: true, melding: `${deltaker.navn} er fjernet.` };
}

/**
 * Kryss styret hos alle registrerte leverandører mot deltakerlista på nytt.
 *
 * Dette er hele poenget med at lista kan redigeres. Jav-kontrollen kjører
 * ellers bare i det øyeblikket en kontroll utføres, så legger man inn
 * evalueringskomiteen i dag, hadde leverandørene som ble kontrollert i går
 * aldri blitt krysset mot den. Da ville lista sett vedlikeholdt ut og
 * kontrollen vært like tom som før.
 *
 * Treffene knyttes ikke til noen kontroll (kontroll_id er null) — de kommer
 * ikke fra en kjøring, de kommer fra at lista endret seg.
 */
export async function kjorJavPaNytt(): Promise<Svar> {
  const { supabase, profil } = await krevProfil();

  const { data: deltakere } = await supabase
    .from("prosjektdeltakere")
    .select("id, navn, rolle")
    .eq("organisasjon_id", profil.organisasjon_id);

  if (!deltakere?.length)
    return { ok: false, feil: "Det er ingen deltakere å krysse mot." };

  const { data: leverandorer } = await supabase
    .from("leverandorer")
    .select("id, navn, org_nr")
    .eq("organisasjon_id", profil.organisasjon_id);

  if (!leverandorer?.length)
    return { ok: false, feil: "Det er ingen leverandører å krysse." };

  // Rolleoppslaget går mot Enhetsregisteret, ett kall per leverandør. Med
  // mange leverandører rekker ikke en serverhandling å bli ferdig, og en
  // halvveis kjøring som ikke sier fra er verre enn en som stopper og
  // forteller hvor langt den kom.
  const TAK = 60;
  const koen = leverandorer.slice(0, TAK);

  // Det som allerede finnes, så en omkjøring ikke dobler lista. Nøkkelen er
  // paret leverandør–deltaker–person, ikke rad-id-en: samme kobling funnet
  // på nytt er den samme koblingen.
  const { data: gamle } = await supabase
    .from("jav_treff")
    .select("leverandor_id, deltaker_id, detaljer");

  const kjent = new Set(
    (gamle ?? []).map(
      (r) =>
        `${r.leverandor_id}|${r.deltaker_id}|${(r.detaljer as { person_navn?: string })?.person_navn ?? ""}`,
    ),
  );

  // Åtte om gangen. Sekvensielt tar seksti oppslag lengre tid enn
  // serverhandlingen får lov til å leve; alle på en gang er ikke en måte å
  // behandle et åpent register på.
  const PULJE = 8;
  const resultater: { ok: boolean; treff: JavTreff[] }[] = [];

  for (let i = 0; i < koen.length; i += PULJE) {
    const pulje = await Promise.all(
      koen.slice(i, i + PULJE).map(async (lev) => {
        try {
          const res = await finnJav(supabase, {
            organisasjonId: profil.organisasjon_id,
            leverandorId: lev.id,
            orgnr: lev.org_nr,
            deltakere,
          });
          return { ok: res.rollerHentet, treff: res.treff };
        } catch {
          return { ok: false, treff: [] as JavTreff[] };
        }
      }),
    );
    resultater.push(...pulje);
  }

  const feilet = resultater.filter((r) => !r.ok).length;

  const skalInn = resultater
    .flatMap((r) => r.treff)
    .filter((t) => {
      const n = `${t.leverandor_id}|${t.deltaker_id}|${t.detaljer.person_navn}`;
      if (kjent.has(n)) return false;
      kjent.add(n);
      return true;
    });

  if (skalInn.length) {
    const { error } = await supabase.from("jav_treff").insert(
      skalInn.map((t) => ({
        organisasjon_id: profil.organisasjon_id,
        kontroll_id: null,
        deltaker_id: t.deltaker_id,
        leverandor_id: t.leverandor_id,
        type_kobling: t.type_kobling,
        detaljer: t.detaljer,
      })),
    );
    if (error) return { ok: false, feil: error.message };
  }

  revalidatePath("/jav");
  revalidatePath("/oversikt");

  const deler = [
    `${koen.length} ${koen.length === 1 ? "leverandør" : "leverandører"} krysset mot ${deltakere.length} ${deltakere.length === 1 ? "deltaker" : "deltakere"}.`,
    skalInn.length
      ? `${skalInn.length} ${skalInn.length === 1 ? "ny mulig kobling" : "nye mulige koblinger"}.`
      : "Ingen nye koblinger.",
  ];
  if (feilet) deler.push(`${feilet} kunne ikke slås opp i Enhetsregisteret.`);
  if (leverandorer.length > TAK)
    deler.push(`${leverandorer.length - TAK} gjenstår — kjør igjen.`);

  return { ok: true, melding: deler.join(" ") };
}
