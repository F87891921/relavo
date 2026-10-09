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

/* ------------------------------------------------------------ Overvåking */

const TEKST: Record<string, string> = {
  konkurs: "er registrert konkurs",
  tvangsavvikling: "er under tvangsavvikling",
  under_avvikling: "er under avvikling",
  slettet_fra_register: "finnes ikke lenger i Enhetsregisteret",
  renhold_mistet_godkjenning: "har mistet godkjenningen i renholdsregisteret",
  renhold_godkjent: "er godkjent i renholdsregisteret",
  ny_daglig_leder: "har fått ny daglig leder",
  styreendring: "har endret styre",
  navneendring: "har byttet navn",
  nytt_regnskap: "har levert nytt årsregnskap",
};

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
  const linjer = verdt
    .map((h) => `  ${h.alvor === "kritisk" ? "!" : "·"} ${h.navn} ${TEKST[h.slag] ?? h.slag}`)
    .join("\n");

  const emne = kritiske.length
    ? `Endring som krever handling — ${kritiske[0].navn}`
    : `${verdt.length} endring${verdt.length === 1 ? "" : "er"} hos leverandørene dere følger`;

  const tekst = `Den daglige overvåkingen fant dette siden i går:

${linjer}

${kritiske.length ? "Linjene med utropstegn er avvisningsgrunner etter § 24-2, eller gjør det ulovlig å kjøpe tjenesten. De bør ses på i dag.\n\n" : ""}${grunnUrl()}/oversikt`;

  for (const m of mottakere) {
    const til = await epostTil(m.id);
    await prov({ til, emne, tekst });
  }
}
