/**
 * MERK: feil-feltet er en nøkkel inn i ordboka, ikke ferdig tekst. Modulen
 * brukes både på server og klient, og en fast norsk setning her ville stått
 * på norsk midt i et engelsk skjema.
 */
/**
 * Validering av norske organisasjonsnummer, samme regel som i prototypen:
 * ni siffer der det siste er et kontrollsiffer beregnet med modulus 11.
 *
 * Poenget er å fange tastefeil før vi slår opp — et nummer som ikke består
 * modulus 11 finnes ikke i Enhetsregisteret uansett, og da er «Ugyldig
 * nummer» et bedre svar enn «Fant ingen treff».
 */
const VEKTER = [3, 2, 7, 6, 5, 4, 3, 2];

export type OrgnrSvar =
  | { ok: true; orgnr: string }
  | { ok: false; feil: string };

export function validerOrgnr(input: string): OrgnrSvar {
  const d = String(input).replace(/\D/g, "");

  if (d.length !== 9) {
    return { ok: false, feil: "orgnrNiSiffer" };
  }

  let sum = 0;
  for (let i = 0; i < 8; i++) sum += VEKTER[i] * Number(d[i]);

  const rest = sum % 11;
  const kontroll = rest === 0 ? 0 : 11 - rest;

  // Kontrollsiffer 10 er ikke mulig å skrive med ett siffer, så slike
  // nummer deles aldri ut.
  if (kontroll === 10) return { ok: false, feil: "orgnrUgyldig" };

  if (kontroll !== Number(d[8])) {
    return { ok: false, feil: "orgnrKontrollsiffer" };
  }

  return { ok: true, orgnr: d };
}

/** 987 654 321 — grupper på tre, slik Brønnøysund selv skriver dem. */
export function formaterOrgnr(orgnr: string): string {
  const d = orgnr.replace(/\D/g, "");
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}
