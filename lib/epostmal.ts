import { RELAVO, relavoOrgNr } from "@/lib/relavo";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONT = "Inter,Helvetica,Arial,sans-serif";

export type Brev = {
  hei?: string;
  avsnitt?: string[];
  /** Punktliste, f.eks. hendelser. «!» markerer noe som haster. */
  punkter?: { tekst: string; haster?: boolean }[];
  etterPunkter?: string;
  knapp?: { tekst: string; lenke: string };
  /** Liten tekst under knappen. */
  liten?: string[];
  /** Vis lenken i klartekst under knappen, for klienter som skjuler knapper. */
  visLenke?: string;
  signatur?: string;
};

/**
 * HTML-malen for alle brev fra Relavo.
 *
 * Tabeller og innebygd CSS, ikke flex og klasser: e-postklienter (Outlook
 * særlig) ignorerer det meste annet. Ordmerket er tekst, ikke bilde — SVG
 * vises ikke i Gmail, og et bilde som ikke lastes blir en tom boks.
 */
export function brevHtml(o: Brev) {
  const p = (t: string, ned = 14) => `<p style="margin:0 0 ${ned}px 0;">${esc(t).replace(/\n/g, "<br>")}</p>`;
  const rad = (s: string) => `<tr><td style="padding:0 36px;font-family:${FONT};font-size:15px;line-height:1.6;color:#1d1d1f;">${s}</td></tr>`;

  const deler: string[] = [];
  if (o.hei) deler.push(rad(p(o.hei)));
  for (const a of o.avsnitt ?? []) deler.push(rad(p(a)));
  if (o.punkter?.length)
    deler.push(
      rad(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">${o.punkter
          .map(
            (x) =>
              `<tr><td style="padding:9px 12px;background:${x.haster ? "#fbeeee" : "#f4f1f6"};border-left:3px solid ${x.haster ? "#c0392b" : "#654b70"};font-family:${FONT};font-size:14px;line-height:1.5;color:#1d1d1f;">${esc(x.tekst)}</td></tr><tr><td style="height:6px;"></td></tr>`,
          )
          .join("")}</table>`,
      ),
    );
  if (o.etterPunkter) deler.push(rad(p(o.etterPunkter)));
  if (o.knapp)
    deler.push(
      `<tr><td style="padding:8px 36px 24px 36px;"><a href="${esc(o.knapp.lenke)}" style="display:inline-block;background:#654b70;color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:12px;">${esc(o.knapp.tekst)}</a></td></tr>`,
    );
  const smaa: string[] = [];
  if (o.visLenke)
    smaa.push(
      `<p style="margin:0 0 6px 0;">${esc(o.visLenke)}</p><p style="margin:0 0 18px 0;word-break:break-all;"><a href="${esc(o.knapp?.lenke ?? "")}" style="color:#654b70;">${esc(o.knapp?.lenke ?? "")}</a></p>`,
    );
  for (const l of o.liten ?? []) smaa.push(`<p style="margin:0 0 10px 0;">${esc(l)}</p>`);
  if (smaa.length)
    deler.push(`<tr><td style="padding:0 36px 8px 36px;font-family:${FONT};font-size:12.5px;line-height:1.6;color:#8a8289;">${smaa.join("")}</td></tr>`);
  if (o.signatur) deler.push(rad(`<p style="margin:12px 0 20px 0;">${esc(o.signatur).replace(/\n/g, "<br>")}</p>`));

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f1f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1f6;padding:32px 16px;">
 <tr><td align="center">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;">
   <tr><td style="padding:32px 36px 18px 36px;font-family:${FONT};font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#654b70;">Relavo</td></tr>
   ${deler.join("\n   ")}
   <tr><td style="border-top:1px solid #e5e0e8;padding:18px 36px 28px 36px;font-family:${FONT};font-size:11.5px;line-height:1.6;color:#8a8289;">
     ${esc(RELAVO.navn)} · org.nr ${esc(relavoOrgNr())}<br>${esc(RELAVO.nett)}
   </td></tr>
  </table>
 </td></tr>
</table>
</body></html>`;
}

/** Ren tekst-versjonen, for klienter uten HTML og for spamfiltre som vil ha begge. */
export function brevTekst(o: Brev) {
  return [
    o.hei,
    ...(o.avsnitt ?? []),
    o.punkter?.map((x) => `${x.haster ? "!" : "·"} ${x.tekst}`).join("\n"),
    o.etterPunkter,
    o.knapp ? `${o.knapp.tekst}:\n${o.knapp.lenke}` : undefined,
    ...(o.liten ?? []),
    o.signatur,
  ]
    .filter(Boolean)
    .join("\n\n");
}
