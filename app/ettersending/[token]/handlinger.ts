"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

export type Svar = { ok: true } | { ok: false; feil: string };

const MAKS = 15 * 1024 * 1024;

const TYPER: Record<string, string> = {
  "application/pdf": "pdf",
  "application/xml": "xml",
  "text/xml": "xml",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/png": "png",
  "image/jpeg": "jpg",
};

/**
 * Leverandøren laster opp egenerklæringen.
 *
 * Filen går gjennom serveren, ikke rett til lagringen fra nettleseren.
 * Bøtta har ingen policy for anon i det hele tatt — den eneste veien inn er
 * her, etter at token er funnet og filen er sett på. Et opplastingsendepunkt
 * som er åpent for alle med lenken, uten at noen ser på hva som kommer, er
 * ikke et opplastingsendepunkt vi vil ha.
 */
export async function leverESPD(fd: FormData): Promise<Svar> {
  const token = String(fd.get("token") ?? "");
  const navn = String(fd.get("navn") ?? "").trim();
  const rolle = String(fd.get("rolle") ?? "").trim();
  const bekreftet = fd.get("bekreftet") === "on";
  const fil = fd.get("fil");

  if (!navn) return { ok: false, feil: "Skriv inn navnet ditt." };
  if (!rolle) return { ok: false, feil: "Skriv inn hvilken rolle du har i selskapet." };
  if (!bekreftet)
    return { ok: false, feil: "Kryss av for at opplysningene er riktige." };
  if (!(fil instanceof File) || fil.size === 0)
    return { ok: false, feil: "Velg filen med egenerklæringen." };
  if (fil.size > MAKS)
    return { ok: false, feil: "Filen er større enn 15 MB. Send den som PDF." };

  const endelse = TYPER[fil.type];
  if (!endelse)
    return {
      ok: false,
      feil: "Filtypen støttes ikke. Send PDF, XML fra ESPD-tjenesten, Word-fil eller et bilde.",
    };

  const supabase = createClient();

  // Finnes token, og er det ikke levert alt? Sjekkes før filen skrives, så
  // en feil lenke ikke kan brukes til å legge igjen filer hos oss.
  const { data: rader } = await supabase.rpc("espd_ved_token", { t: token });
  const rad = Array.isArray(rader) ? rader[0] : null;
  if (!rad) return { ok: false, feil: "Lenken er ikke gyldig." };
  if (rad.levert) return { ok: false, feil: "Erklæringen er allerede levert." };

  // Leverandørens eget filnavn beholdes til visning, men ikke som sti.
  const trygtNavn = fil.name.replace(/[^\w.\- ]+/g, "_").slice(-80);
  const sti = `${token}/${Date.now()}.${endelse}`;

  const lager = admin();
  const { error: lastFeil } = await lager.storage
    .from("espd")
    .upload(sti, Buffer.from(await fil.arrayBuffer()), {
      contentType: fil.type,
      upsert: false,
    });

  if (lastFeil) return { ok: false, feil: `Opplastingen feilet: ${lastFeil.message}` };

  // Registreringen går med service_role, ikke med anon. Funksjonen skriver
  // inn en filsti, og bare serveren vet hva som faktisk ble lastet opp — den
  // skal ikke kunne kalles utenfra med et token og en oppdiktet sti.
  const { data: ferdig, error } = await lager.rpc("espd_lever", {
    t: token,
    p_filsti: sti,
    p_filnavn: trygtNavn,
    p_navn: navn,
    p_rolle: rolle,
  });

  if (error || ferdig !== true) {
    // Registreringen feilet — da skal ikke filen bli liggende igjen alene.
    await lager.storage.from("espd").remove([sti]);
    return { ok: false, feil: error?.message ?? "Kunne ikke registrere leveransen." };
  }

  revalidatePath(`/ettersending/${token}`);
  return { ok: true };
}
