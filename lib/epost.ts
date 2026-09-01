/**
 * Utgående e-post.
 *
 * Kalles mot Resends REST-api med fetch. Ingen npm-pakke: alt vi trenger er
 * én POST, og en avhengighet til for det er en avhengighet for mye.
 *
 * Er nøkkelen ikke satt, sender vi ingenting og sier det. Kallstedet viser
 * da en mailto-knapp i stedet, slik at det går an å komme videre — men
 * grensesnittet skal aldri påstå at et brev er sendt når det ikke er det.
 * Det var nettopp det som var galt med varslingsvalget på støttesakene.
 */
export type Epostsvar =
  | { ok: true; id: string }
  | { ok: false; feil: string; mangler?: true };

export const epostOppsatt = () => Boolean(process.env.RESEND_API_KEY);

export async function sendEpost(o: {
  til: string;
  emne: string;
  tekst: string;
  svarTil?: string | null;
}): Promise<Epostsvar> {
  const nokkel = process.env.RESEND_API_KEY;
  if (!nokkel)
    return {
      ok: false,
      mangler: true,
      feil: "Ingen e-postleverandør er koblet til. Sett RESEND_API_KEY.",
    };

  const fra = process.env.EPOST_AVSENDER || "Relavo <post@relavo.no>";

  try {
    const svar = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${nokkel}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fra,
        to: [o.til],
        subject: o.emne,
        text: o.tekst,
        ...(o.svarTil ? { reply_to: o.svarTil } : {}),
      }),
    });

    if (!svar.ok) {
      const kropp = await svar.text();
      return { ok: false, feil: `Resend svarte ${svar.status}: ${kropp.slice(0, 200)}` };
    }

    const data = (await svar.json()) as { id?: string };
    return { ok: true, id: data.id ?? "" };
  } catch (e) {
    return { ok: false, feil: e instanceof Error ? e.message : "Ukjent feil" };
  }
}
