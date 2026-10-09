import { admin } from "@/lib/supabase/admin";
import { sendEpost } from "@/lib/epost";
import { RELAVO } from "@/lib/relavo";
import { grunnUrl } from "@/lib/url";

/**
 * Varsler på e-post.
 *
 * Én regel over alle andre: et varsel som ikke går fram skal aldri rive
 * med seg det som faktisk skjedde. Svaret er lagret i det øyeblikket raden
 * er skrevet. Feiler Resend etterpå, er svaret fortsatt lagret — og da
 * skal ikke den som skrev det få en feilmelding som får dem til å sende
 * det en gang til.
 *
 * Derfor returnerer ingenting her noe kallstedet må forholde seg til.
 * Feil havner i serverloggen, der de hører hjemme.
 */
async function prov(o: {
  til: string | null | undefined;
  emne: string;
  tekst: string;
}): Promise<void> {
  if (!o.til) return;
  try {
    const svar = await sendEpost({ til: o.til, emne: o.emne, tekst: o.tekst });
    if (!svar.ok && !svar.mangler) console.error("[varsling]", svar.feil);
  } catch (e) {
    console.error("[varsling] kastet:", e);
  }
}

/** E-posten til en bruker. Ligger i auth, ikke i profiler. */
export async function epostTil(brukerId: string): Promise<string | null> {
  try {
    const { data } = await admin().auth.admin.getUserById(brukerId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

/** Adressen hos oss som tar imot. Én felles, ikke en liste å holde ved like. */
const OSS = () => process.env.RELAVO_VARSEL_EPOST?.trim() || RELAVO.epost;

/* ----------------------------------------------------------- Støttesaker */

export async function varsleKundeOmSvar(o: {
  tilBrukerId: string;
  emne: string;
  svarFra: string;
  tekst: string;
}) {
  const til = await epostTil(o.tilBrukerId);
  await prov({
    til,
    emne: `Svar på saken din — ${o.emne}`,
    tekst: `${o.svarFra} har svart på saken «${o.emne}».

${o.tekst}

Svar direkte i Relavo:
${grunnUrl()}/support

Du får denne e-posten fordi varsling er slått på for saken. Du kan slå
den av på samme side.`,
  });
}

export async function varsleOssOmSak(o: {
  emne: string;
  organisasjon: string | null;
  tekst: string;
  nySak: boolean;
}) {
  await prov({
    til: OSS(),
    emne: o.nySak
      ? `Ny støttesak — ${o.emne}`
      : `Kunden har svart — ${o.emne}`,
    tekst: `${o.organisasjon ?? "Ukjent organisasjon"}

${o.tekst}

${grunnUrl()}/internt/support`,
  });
}

/* -------------------------------------------------------- Kontaktskjemaet */

export async function varsleOssOmHenvendelse(o: {
  navn: string;
  epost: string;
  organisasjon: string | null;
  telefon: string | null;
  kategori: string;
  melding: string;
}) {
  await prov({
    til: OSS(),
    emne: `Kontaktskjema — ${o.navn}${o.organisasjon ? `, ${o.organisasjon}` : ""}`,
    tekst: `${o.navn}
${o.epost}${o.telefon ? `\n${o.telefon}` : ""}
${o.organisasjon ?? ""}

Gjelder: ${o.kategori}

${o.melding}

${grunnUrl()}/internt/kontakt`,
  });
}
