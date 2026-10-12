import { admin } from "@/lib/supabase/admin";
import { sendEpost } from "@/lib/epost";
import { RELAVO } from "@/lib/relavo";
import { grunnUrl } from "@/lib/url";
import { erSprak, type Sprak } from "@/lib/sprak/felles";
import { svarPaaSakBrev, nySakBrev, henvendelseBrev, overvakingBrev, type Ferdig } from "@/lib/epostbrev";

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
async function prov(o: { til: string | null | undefined } & Ferdig): Promise<void> {
  if (!o.til) return;
  try {
    const svar = await sendEpost({ til: o.til, emne: o.emne, tekst: o.tekst, html: o.html });
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

/** Språket brukeren har valgt, ellers norsk. Brevet skal komme på samme språk som siden. */
export async function sprakTil(brukerId: string): Promise<Sprak> {
  try {
    const { data } = await admin().from("profiler").select("sprak").eq("id", brukerId).maybeSingle();
    return erSprak(data?.sprak) ? data.sprak : "no";
  } catch {
    return "no";
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
  const sprak = await sprakTil(o.tilBrukerId);
  await prov({ til, ...svarPaaSakBrev({ sprak, svarFra: o.svarFra, emne: o.emne, tekst: o.tekst, lenke: `${grunnUrl()}/support` }) });
}

export async function varsleOssOmSak(o: {
  emne: string;
  organisasjon: string | null;
  tekst: string;
  nySak: boolean;
}) {
  await prov({ til: OSS(), ...nySakBrev({ ...o, lenke: `${grunnUrl()}/internt/support` }) });}

/* -------------------------------------------------------- Kontaktskjemaet */

export async function varsleOssOmHenvendelse(o: {
  navn: string;
  epost: string;
  organisasjon: string | null;
  telefon: string | null;
  kategori: string;
  melding: string;
}) {
  await prov({ til: OSS(), ...henvendelseBrev({ ...o, lenke: `${grunnUrl()}/internt/kontakt` }) });}

/* ------------------------------------------------------------ Overvåking */


/**
 * Ett varsel per organisasjon per kjøring, ikke ett per hendelse.
 *
 * Endrer ti leverandører seg samme natt, er ti e-poster en måte å få folk
 * til å lage en regel som arkiverer alt vi sender.
 *
 * Bare kritiske og advarsler utløser e-post. «Har byttet navn» er verdt å
 * se i oversikten, ikke verdt å bli vekket av.
 */
export async function varsleOmHendelser(
  organisasjonId: string,
  hendelser: { navn: string; slag: string; alvor: string }[],
) {
  const verdt = hendelser.filter((h) => h.alvor !== "info");
  if (!verdt.length) return;

  const db = admin();
  const { data: mottakere } = await db
    .from("profiler")
    .select("id")
    .eq("organisasjon_id", organisasjonId)
    .eq("rolle", "administrator");

  if (!mottakere?.length) return;

  const kritiske = verdt.filter((h) => h.alvor === "kritisk");

  // Ett brev per mottaker, på mottakerens eget språk.
  for (const m of mottakere) {
    const til = await epostTil(m.id);
    const sprak = await sprakTil(m.id);
    await prov({
      til,
      ...overvakingBrev({
        sprak,
        hendelser: verdt.map((h) => ({ navn: h.navn, slag: h.slag, haster: h.alvor === "kritisk" })),
        forsteNavn: kritiske[0]?.navn ?? "",
        lenke: `${grunnUrl()}/oversikt`,
      }),
    });
  }
}
