import { writeFileSync } from "fs";
import { no } from "../lib/sprak/no";
import { en } from "../lib/sprak/en";
import {
  glemtPassordBrev, tilbudBrev, svarPaaSakBrev, nySakBrev, henvendelseBrev, overvakingBrev,
} from "../lib/epostbrev";

const L = "https://relavo.no";
const lister = [
  ["1 · Glemt passord (norsk)", "Til kunden. Språket følger sidens språk.", glemtPassordBrev(no.glemt, `${L}/auth/bekreft?token_hash=…&type=recovery`)],
  ["2 · Glemt passord (engelsk)", "Samme brev når siden står på engelsk.", glemtPassordBrev(en.glemt, `${L}/auth/bekreft?token_hash=…&type=recovery`)],
  ["3 · Tilbud", "Fra oss til en kommune eller et selskap, med lenke til tilbudet.", tilbudBrev({ kontakt: "Marit", plan: "Kommune", total: "94 800", lenke: `${L}/offert/…`, giltigTil: "2026-11-30", avsender: "Fred", nummer: "O-2026-A1B2" })],
  ["4 · Svar på støttesak", "Til kunden når vi har svart.", svarPaaSakBrev({ svarFra: "Relavo support", emne: "Spørsmål om skatteattest", tekst: "Attesten må ikke være eldre enn tre måneder. Last den opp under leverandøren, så ligger den ved rapporten.", lenke: `${L}/support` })],
  ["5 · Ny støttesak (til oss)", "Internt varsel når en kunde skriver.", nySakBrev({ emne: "Spørsmål om skatteattest", organisasjon: "Eksempelvik kommune", tekst: "Hvor gammel kan attesten være?", nySak: true, lenke: `${L}/internt/support` })],
  ["6 · Kontaktskjema (til oss)", "Internt varsel når noen fyller ut kontaktskjemaet på forsiden.", henvendelseBrev({ navn: "Marit Aasen", epost: "marit@eksempelvik.kommune.no", organisasjon: "Eksempelvik kommune", telefon: "900 00 000", kategori: "Vil se en demo", melding: "Vi vil gjerne se en demo for innkjøpsavdelingen.", lenke: `${L}/internt/kontakt` })],
  ["7 · Overvåking, krever handling", "Til kundens administratorer når en leverandør går konkurs eller mister godkjenning.", overvakingBrev({ hendelser: [{ tekst: "Fjordservice AS er registrert konkurs", haster: true }, { tekst: "Nordrent AS har fått ny daglig leder", haster: false }], kritisk: true, forsteNavn: "Fjordservice AS", lenke: `${L}/oversikt` })],
] as const;

const html = `<!doctype html><html lang="no"><head><meta charset="utf-8"><title>E-postene fra Relavo</title>
<style>body{font-family:Inter,system-ui,sans-serif;background:#e9e5ec;margin:0;padding:32px 16px;color:#1d1d1f}
h1{font-size:22px;max-width:640px;margin:0 auto 24px}.b{max-width:640px;margin:0 auto 36px}
.b h2{font-size:15px;margin:0 0 2px}.b p{font-size:13px;color:#6b6469;margin:0 0 4px}
.e{font-size:12.5px;margin:0 0 10px}iframe{width:100%;height:520px;border:0;border-radius:12px;background:#fff}</style></head><body>
<h1>E-postene fra Relavo</h1>
${lister.map(([t, h, b]) => `<div class="b"><h2>${t}</h2><p>${h}</p><p class="e"><b>Emne:</b> ${b.emne}</p><iframe srcdoc="${b.html.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"></iframe></div>`).join("")}
</body></html>`;
writeFileSync("epost-forhandsvisning.html", html);
console.log("ok", lister.length);
