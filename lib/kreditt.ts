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
    return { ok: false, feil: "Hittade inget bolag med det numret." };
  if (oppslag.status === "feil") return { ok: false, feil: oppslag.melding };

  const enhet = oppslag.enhet;
  const regnskap = await hentRegnskap(orgnr);
  const siste = regnskap[0];

  const b: Punkt[] = [];

  // ---- Harde flagg fra Enhetsregisteret ----
  const konkursaktig =
    enhet.konkurs || enhet.underTvangsavvikling || enhet.underAvvikling;
  b.push({
    punkt: "Bolagsstatus",
    status: konkursaktig ? "brudd" : "ok",
    tekst: enhet.konkurs
      ? "Registrerad konkurs"
      : enhet.underTvangsavvikling
        ? "Under tvångsavveckling"
        : enhet.underAvvikling
          ? "Under avveckling"
          : "Aktivt, ingen konkurs eller avveckling registrerad",
  });

  // ---- Alder ----
  const aar = enhet.registrert
    ? (Date.now() - new Date(enhet.registrert).getTime()) / 31_557_600_000
    : null;
  b.push({
    punkt: "Ålder",
    status: aar === null ? "ukjent" : aar < 2 ? "advarsel" : "ok",
    tekst:
      aar === null
        ? "Registreringsdatum saknas"
        : `Registrerat ${enhet.registrert}, ${Math.floor(aar)} år`,
  });

  // ---- Regnskap ----
  if (!siste) {
    b.push({
      punkt: "Årsredovisning",
      status: "ukjent",
      tekst:
        "Ingen årsredovisning i Regnskapsregisteret. Vanligt för enkeltpersonforetak, kommuner och nystartade bolag.",
    });
  } else {
    const ekAndel =
      siste.egenkapital !== null && siste.eiendeler
        ? siste.egenkapital / siste.eiendeler
        : null;

    b.push({
      punkt: "Soliditet",
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
          ? "Gick inte att räkna ut"
          : ekAndel < 0
            ? `Negativt eget kapital (${Math.round(ekAndel * 100)} %) ${siste.aar}`
            : `${Math.round(ekAndel * 100)} % ${siste.aar}`,
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
          ? "Saknas i redovisningen"
          : `${new Intl.NumberFormat("nb-NO").format(siste.aarsresultat)} ${siste.valuta} ${siste.aar}`,
    });

    const ferskt = new Date().getFullYear() - siste.aar <= 2;
    b.push({
      punkt: "Färskhet",
      status: ferskt ? "ok" : "advarsel",
      tekst: ferskt
        ? `Senaste redovisning är från ${siste.aar}`
        : `Senaste redovisning är från ${siste.aar} — äldre än två år`,
    });
  }

  // ---- Det vi ikke vet ----
  b.push({
    punkt: "Betalningsanmärkningar",
    status: "ukjent",
    tekst:
      "Kräver avtal med Creditsafe. Ej hämtad — står som ej kontrollerad, inte som frånvaro av anmärkningar.",
  });
  b.push({
    punkt: "Skatteskulder",
    status: "ukjent",
    tekst: "Kräver avtal med Skatteetaten via Maskinporten. Ej hämtad.",
  });

  const brudd = b.filter((p) => p.status === "brudd").length;
  const advarsler = b.filter((p) => p.status === "advarsel").length;
  const vurdering = brudd > 0 ? "hoy" : advarsler >= 2 ? "middels" : "lav";

  return { ok: true, enhet, regnskap, vurdering, begrunnelse: b };
}
