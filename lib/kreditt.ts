import { slaOppEnhet, type Enhet } from "@/lib/brreg";
import { hentRegnskap, type Arsregnskap } from "@/lib/regnskap";

/**
 * Kredittvurdering bygget på det som faktisk er offentlig og gratis:
 * Enhetsregisteret for status, Regnskapsregisteret for tallene.
 *
 * Dette er ikke en kredittscore fra et byrå. Det er en vurdering av
 * opplysninger hvem som helst kan slå opp, og den sier selv hva den ikke
 * vet — betalingsanmerkninger og skatterestanser krever avtale med
 * Creditsafe eller Skatteetaten, og finnes ikke her.
 */
export type Punkt = {
  punkt: string;
  status: "ok" | "advarsel" | "brudd" | "ukjent";
  tekst: string;
};

export type Kredittsvar =
  | {
      ok: true;
      enhet: Enhet;
      regnskap: Arsregnskap[];
      vurdering: "lav" | "middels" | "hoy";
      begrunnelse: Punkt[];
    }
  | { ok: false; feil: string };

export async function kredittvurder(orgnr: string): Promise<Kredittsvar> {
  const oppslag = await slaOppEnhet(orgnr);
  if (oppslag.status === "ikke-funnet")
    return { ok: false, feil: "Fant ingen enhet med dette nummeret." };
  if (oppslag.status === "feil") return { ok: false, feil: oppslag.melding };

  const enhet = oppslag.enhet;
  const regnskap = await hentRegnskap(orgnr);
  const siste = regnskap[0];

  const b: Punkt[] = [];

  // ---- Harde flagg fra Enhetsregisteret ----
  const konkursaktig =
    enhet.konkurs || enhet.underTvangsavvikling || enhet.underAvvikling;
  b.push({
    punkt: "Selskapsstatus",
    status: konkursaktig ? "brudd" : "ok",
    tekst: enhet.konkurs
      ? "Registrert konkurs"
      : enhet.underTvangsavvikling
        ? "Under tvangsavvikling"
        : enhet.underAvvikling
          ? "Under avvikling"
          : "Aktivt, ingen konkurs eller avvikling registrert",
  });

  // ---- Alder ----
  const aar = enhet.registrert
    ? (Date.now() - new Date(enhet.registrert).getTime()) / 31_557_600_000
    : null;
  b.push({
    punkt: "Alder",
    status: aar === null ? "ukjent" : aar < 2 ? "advarsel" : "ok",
    tekst:
      aar === null
        ? "Registreringsdato mangler"
        : `Registrert ${enhet.registrert}, ${Math.floor(aar)} år`,
  });

  // ---- Regnskap ----
  if (!siste) {
    b.push({
      punkt: "Årsregnskap",
      status: "ukjent",
      tekst:
        "Ingen regnskap i Regnskapsregisteret. Vanlig for enkeltpersonforetak, kommuner og nystiftede selskaper.",
    });
  } else {
    const ekAndel =
      siste.egenkapital !== null && siste.eiendeler
        ? siste.egenkapital / siste.eiendeler
        : null;

    b.push({
      punkt: "Egenkapitalandel",
      status:
        ekAndel === null
          ? "ukjent"
          : ekAndel < 0
            ? "brudd"
            : ekAndel < 0.1
              ? "advarsel"
              : "ok",
      tekst:
        ekAndel === null
          ? "Kunne ikke regnes ut"
          : ekAndel < 0
            ? `Negativ egenkapital (${Math.round(ekAndel * 100)} %) i ${siste.aar}`
            : `${Math.round(ekAndel * 100)} % i ${siste.aar}`,
    });

    b.push({
      punkt: "Årsresultat",
      status:
        siste.aarsresultat === null
          ? "ukjent"
          : siste.aarsresultat < 0
            ? "advarsel"
            : "ok",
      tekst:
        siste.aarsresultat === null
          ? "Mangler i regnskapet"
          : `${new Intl.NumberFormat("nb-NO").format(siste.aarsresultat)} ${siste.valuta} i ${siste.aar}`,
    });

    const ferskt = new Date().getFullYear() - siste.aar <= 2;
    b.push({
      punkt: "Ferskhet",
      status: ferskt ? "ok" : "advarsel",
      tekst: ferskt
        ? `Siste regnskap er fra ${siste.aar}`
        : `Siste regnskap er fra ${siste.aar} — eldre enn to år`,
    });
  }

  // ---- Det vi ikke vet ----
  b.push({
    punkt: "Betalingsanmerkninger",
    status: "ukjent",
    tekst:
      "Krever avtale med Creditsafe. Ikke hentet — står som ikke kontrollert, ikke som fravær av anmerkninger.",
  });
  b.push({
    punkt: "Skatterestanser",
    status: "ukjent",
    tekst: "Krever avtale med Skatteetaten. Ikke hentet.",
  });

  const brudd = b.filter((p) => p.status === "brudd").length;
  const advarsler = b.filter((p) => p.status === "advarsel").length;
  const vurdering = brudd > 0 ? "hoy" : advarsler >= 2 ? "middels" : "lav";

  return { ok: true, enhet, regnskap, vurdering, begrunnelse: b };
}
