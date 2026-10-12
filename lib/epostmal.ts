import { RELAVO, relavoOrgNr } from "@/lib/relavo";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONT = "Inter,Helvetica,Arial,sans-serif";

export type Brev = {
  /** Stor overskrift øverst i brevet. */
  tittel?: string;
  /** Teksten som vises i innboksen ved siden av emnet. */
  forhandsvis?: string;
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
  const p = (t: string, ned = 16) => `<p style="margin:0 0 ${ned}px 0;">${esc(t).replace(/\n/g, "<br>")}</p>`;
  const rad = (inn: string) => `<tr><td style="padding:0 40px;font-family:${FONT};font-size:15.5px;line-height:1.65;color:#3a363b;">${inn}</td></tr>`;

  const deler: string[] = [];
  if (o.tittel)
    deler.push(
      `<tr><td style="padding:0 40px 18px 40px;font-family:${FONT};font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-0.025em;color:#1d1d1f;">${esc(o.tittel)}</td></tr>`,
    );
  if (o.hei) deler.push(rad(p(o.hei)));
  for (const a of o.avsnitt ?? []) deler.push(rad(p(a)));
  if (o.punkter?.length)
    deler.push(
      rad(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px 0;">${o.punkter
          .map(
            (x) =>
              `<tr><td style="padding:12px 16px;background:${x.haster ? "#fdf0ef" : "#f6f4f8"};border-radius:12px;font-family:${FONT};font-size:14.5px;line-height:1.5;color:#1d1d1f;">${x.haster ? '<span style="color:#c0392b;font-weight:700;">●</span>&nbsp; ' : '<span style="color:#654b70;font-weight:700;">●</span>&nbsp; '}${esc(x.tekst)}</td></tr><tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>`,
          )
          .join("")}</table>`,
      ),
    );
  if (o.etterPunkter) deler.push(rad(p(o.etterPunkter)));
  if (o.knapp)
    deler.push(
      `<tr><td style="padding:10px 40px 30px 40px;"><a href="${esc(o.knapp.lenke)}" style="display:inline-block;background:#654b70;color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;text-decoration:none;padding:15px 30px;border-radius:12px;">${esc(o.knapp.tekst)}&nbsp;&rarr;</a></td></tr>`,
    );
  const smaa: string[] = [];
  if (o.visLenke)
    smaa.push(
      `<p style="margin:0 0 6px 0;">${esc(o.visLenke)}</p><p style="margin:0 0 18px 0;word-break:break-all;"><a href="${esc(o.knapp?.lenke ?? "")}" style="color:#654b70;">${esc(o.knapp?.lenke ?? "")}</a></p>`,
    );
  for (const l of o.liten ?? []) smaa.push(`<p style="margin:0 0 10px 0;">${esc(l)}</p>`);
  if (smaa.length)
    deler.push(`<tr><td style="padding:0 40px 10px 40px;font-family:${FONT};font-size:13px;line-height:1.6;color:#8a8289;">${smaa.join("")}</td></tr>`);
  if (o.signatur) deler.push(rad(`<p style="margin:14px 0 24px 0;">${esc(o.signatur).replace(/\n/g, "<br>")}</p>`));

  const pre = o.forhandsvis ?? o.avsnitt?.[0] ?? o.tittel ?? "";

  return `<!doctype html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f1eef4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eef4;padding:36px 14px;">
 <tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
   <tr><td style="padding:0 6px 16px 6px;font-family:${FONT};font-size:21px;font-weight:700;letter-spacing:-0.02em;color:#654b70;">Relavo</td></tr>
   <tr><td>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border-top:4px solid #654b70;">
     <tr><td style="height:36px;font-size:0;line-height:0;">&nbsp;</td></tr>
     ${deler.join("\n     ")}
     <tr><td style="height:12px;font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>
   </td></tr>
   <tr><td style="padding:20px 8px 0 8px;font-family:${FONT};font-size:12px;line-height:1.7;color:#8a8289;text-align:center;">
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
    o.tittel,
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
