import { createHash } from "crypto";
import { admin } from "@/lib/supabase/admin";
import { sendEpost } from "@/lib/epost";
import { RELAVO } from "@/lib/relavo";

/**
 * Feil vi må få vite om.
 *
 * Alt havner i feillogg. En feil som ikke er sett siste timen gir i tillegg
 * et varsel i appen og en e-post til oss. Samme feil igjen i samme time
 * gir ingenting mer: ellers ville én feil på forsiden gitt hundre e-poster.
 */
export async function meldFeil(o: {
  kilde: "klient" | "server" | "jobb";
  melding: string;
  side?: string | null;
  detaljer?: string | null;
}) {
  try {
    const melding = o.melding.slice(0, 500);
    const time = new Date().toISOString().slice(0, 13);
    const hash = createHash("sha1").update(`${o.kilde}:${melding}:${o.side ?? ""}`).digest("hex").slice(0, 16);
    const noekkel = `feil:${hash}:${time}`;
    const db = admin();

    await db.from("feillogg").insert({
      kilde: o.kilde,
      melding,
      side: o.side?.slice(0, 300) ?? null,
      detaljer: o.detaljer?.slice(0, 2000) ?? null,
      noekkel,
    });

    const { data: ny } = await db
      .from("interne_varsler")
      .upsert(
        {
          slag: "feil",
          tittel: `Feil (${o.kilde}): ${melding.slice(0, 90)}`,
          tekst: [o.side, o.detaljer?.slice(0, 300)].filter(Boolean).join(" — ") || "Se feilloggen.",
          lenke: "/internt/attgora",
          noekkel,
        },
        { onConflict: "noekkel", ignoreDuplicates: true },
      )
      .select("id");

    if (ny?.length)
      await sendEpost({
        til: process.env.RELAVO_VARSEL_EPOST?.trim() || RELAVO.epost,
        emne: `Feil i Relavo (${o.kilde})`,
        tekst: `${melding}\n\n${o.side ?? ""}\n${o.detaljer ?? ""}`.trim(),
      });
  } catch {
    // Feilmeldingen kan ikke selv velte det som feilet.
  }
}

/** En jobb som gikk bra. Vaktene under sjekker at dette skjer jevnlig. */
export async function hjerteslag(jobb: string, feil?: string) {
  try {
    await admin()
      .from("jobbhjerteslag")
      .upsert({ jobb, ...(feil ? { sist_feil: feil.slice(0, 300) } : { sist_ok: new Date().toISOString(), sist_feil: null }) });
  } catch {}
}

/** Har jobben meldt seg siste `timer`? Ellers varsler vi. */
export async function vaktJobb(jobb: string, timer: number) {
  const { data } = await admin().from("jobbhjerteslag").select("sist_ok").eq("jobb", jobb).maybeSingle();
  const alder = data ? (Date.now() - new Date(data.sist_ok).getTime()) / 3_600_000 : Infinity;
  if (alder > timer)
    await meldFeil({
      kilde: "jobb",
      melding: `Jobben «${jobb}» har ikke kjørt de siste ${timer} timene`,
      detaljer: data ? `Sist OK: ${data.sist_ok}` : "Har aldri meldt seg.",
    });
}
