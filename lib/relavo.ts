/**
 * Relavos egne opplysninger, ett sted.
 *
 * De trengs på tilbudet, i vilkårene og i personvernerklæringen. Lå de tre
 * steder, ville de før eller siden sagt tre forskjellige ting — og et
 * organisasjonsnummer som ikke stemmer i et tilbud er verre enn ingen.
 *
 * Nummeret settes i miljøet, ikke i koden, fordi selskapet ennå ikke er
 * registrert. Mangler det, sier grensesnittet det høyt i stedet for å sende
 * ut et tilbud uten avsender.
 */
export const RELAVO = {
  navn: "Relavo AS",
  orgNr: process.env.NEXT_PUBLIC_RELAVO_ORG_NR?.trim() || null,
  adresse: process.env.NEXT_PUBLIC_RELAVO_ADRESSE?.trim() || null,
  epost: process.env.NEXT_PUBLIC_RELAVO_EPOST?.trim() || "post@relavo.no",
  nett: "relavo.no",
};

/** Organisasjonsnummer i lesbar form, eller en tydelig mangel. */
export const relavoOrgNr = () =>
  RELAVO.orgNr
    ? RELAVO.orgNr.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")
    : null;
