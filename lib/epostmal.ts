import { RELAVO, relavoOrgNr } from "@/lib/relavo";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * HTML-malen for brev med én handling.
 *
 * Tabeller og innebygd CSS, ikke flex og klasser: e-postklienter (Outlook
 * særlig) ignorerer det meste annet. Ordmerket er tekst, ikke bilde — SVG
 * vises ikke i Gmail, og et bilde som ikke lastes blir en tom boks.
 */
export function handlingsbrev(o: {
  hei: string;
  ingress: string;
  knapp: string;
  lenke: string;
  ellerLenke: string;
  ignorer: string;
}) {
  const lenke = esc(o.lenke);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f1f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1f6;padding:32px 16px;">
 <tr><td align="center">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;">
   <tr><td style="padding:32px 36px 8px 36px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#654b70;">Relavo</td></tr>
   <tr><td style="padding:16px 36px 0 36px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1d1d1f;">
     <p style="margin:0 0 14px 0;">${esc(o.hei)}</p>
     <p style="margin:0 0 24px 0;">${esc(o.ingress)}</p>
   </td></tr>
   <tr><td style="padding:0 36px 24px 36px;">
     <a href="${lenke}" style="display:inline-block;background:#654b70;color:#ffffff;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:12px;">${esc(o.knapp)}</a>
   </td></tr>
   <tr><td style="padding:0 36px 8px 36px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:12.5px;line-height:1.6;color:#8a8289;">
     <p style="margin:0 0 6px 0;">${esc(o.ellerLenke)}</p>
     <p style="margin:0 0 20px 0;word-break:break-all;"><a href="${lenke}" style="color:#654b70;">${lenke}</a></p>
     <p style="margin:0 0 28px 0;">${esc(o.ignorer)}</p>
   </td></tr>
   <tr><td style="border-top:1px solid #e5e0e8;padding:18px 36px 28px 36px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:11.5px;line-height:1.6;color:#8a8289;">
     ${esc(RELAVO.navn)} · org.nr ${esc(relavoOrgNr())}<br>${esc(RELAVO.nett)}
   </td></tr>
  </table>
 </td></tr>
</table>
</body></html>`;
}
