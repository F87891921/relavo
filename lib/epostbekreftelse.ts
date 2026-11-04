import { createHash, randomBytes } from "crypto";
import { admin } from "@/lib/supabase/admin";
import { sendEpost } from "@/lib/epost";
import { glemtPassordBrev } from "@/lib/epostbrev";
import { ordbokFor, type Sprak } from "@/lib/sprak";

/**
 * E-postbekreftelse ved registrering.
 *
 * Kontoen lages med en gang, men kan ikke brukes (heller ikke bestille eller
 * betale) før adressen er bekreftet. Tokenet lagres bare som hash, gjelder i
 * 24 timer og kan brukes én gang. Tabellen har ingen policyer: bare serveren
 * rører den.
 */
const GYLDIG_TIMER = 24;
const VENT_SEKUNDER = 60;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function sendBekreftelse(o: {
  userId: string;
  epost: string;
  sprak: Sprak;
  origin: string;
  /** Hopper over ventetiden. Brukes bare første gang, rett etter registreringen. */
  forste?: boolean;
}): Promise<{ ok: true } | { ok: false; feil: "vent" | "sending" }> {
  const db = admin();

  const { data: rad } = await db
    .from("epostbekreftelser")
    .select("sendt, bekreftet")
    .eq("user_id", o.userId)
    .maybeSingle();

  if (!o.forste && rad?.sendt && Date.now() - new Date(rad.sendt).getTime() < VENT_SEKUNDER * 1000)
    return { ok: false, feil: "vent" };

  const token = randomBytes(32).toString("hex");
  await db.from("epostbekreftelser").upsert({
    user_id: o.userId,
    token_hash: hash(token),
    utloper: new Date(Date.now() + GYLDIG_TIMER * 3_600_000).toISOString(),
    sendt: new Date().toISOString(),
    // Bekreftet adresse som ber om ny lenke blir stående som bekreftet.
    bekreftet: rad?.bekreftet ?? null,
  });

  const lenke = `${o.origin}/auth/epost?u=${o.userId}&token=${token}`;
  const brev = glemtPassordBrev(ordbokFor(o.sprak).bekreft, lenke, o.sprak);
  const svar = await sendEpost({ til: o.epost, ...brev });
  if (!svar.ok) {
    console.error("bekreftelse: e-post ikke sendt:", svar.feil);
    return { ok: false, feil: "sending" };
  }
  return { ok: true };
}

/** Bytter tokenet mot en bekreftet adresse. Returnerer true bare første gang. */
export async function bekreftMedToken(userId: string, token: string): Promise<boolean> {
  const db = admin();
  const { data: rad } = await db
    .from("epostbekreftelser")
    .select("token_hash, utloper, bekreftet")
    .eq("user_id", userId)
    .maybeSingle();

  if (!rad?.token_hash || !rad.utloper) return false;
  if (new Date(rad.utloper).getTime() < Date.now()) return false;
  if (rad.token_hash !== hash(token)) return false;

  await db
    .from("epostbekreftelser")
    .update({ bekreftet: rad.bekreftet ?? new Date().toISOString(), token_hash: null, utloper: null })
    .eq("user_id", userId);
  return true;
}
