import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import type { Ordbok } from "@/lib/sprak";
import { Side, Sidehode, Kort, Tabell, Merke, Stripe } from "@/components/ui";
import { hentKonton } from "@/lib/konton";
import { planFor } from "@/lib/plan";
import { Bestillinger, type Bestilling } from "@/components/internt/Bestillinger";

/**
 * Uppstarten, steg för steg. Ett konto räknas som igång först när det kört
 * sin första kontroll — inte när avtalet är påskrivet. Det är den enda
 * mätpunkten som säger något om kunden faktiskt kommit igång.
 */
const stegNavn = (t: Ordbok) => [
  t.internt.avtale,
  t.internt.kontoOpprettet,
  t.internt.brukereInvitert,
  t.internt.leverandorerLest,
  t.internt.forsteKontrollen,
];

/**
 * Hvor langt en konto er kommet, utledet av hva som faktisk finnes.
 *
 * Et konto som er opprettet har passert steg 2. Er det flere enn én bruker,
 * er noen invitert. Finnes det leverandører, er lista lest inn. Er det
 * kjørt en kontroll, er de i gang — og det er den eneste målepunktet som
 * sier noe om at kunden bruker tjenesten.
 */
function naddeSteg(k: {
  status: string;
  antall_brukere: number;
  antall_leverandorer: number;
  antall_kontroller: number;
}) {
  if (Number(k.antall_kontroller) > 0) return 5;
  if (Number(k.antall_leverandorer) > 0) return 4;
  if (Number(k.antall_brukere) > 1) return 3;
  if (k.status === "aktiv") return 2;
  return 1;
}

export default async function InterntOnboardingSide() {
  const { t, supabase } = await krevAnsatt();
  const STEG = stegNavn(t);

  // Kontoer som venter på oss. Beslutningen om å åpne en konto tas her.
  const { data: venter } = await supabase
    .from("organisasjoner")
    .select("id, navn, org_nr, plan, status, betalingsmate, forskuddsbetaling, bestilt, avtalt_total, avtale_mnd")
    .in("status", ["venter_kreditt", "venter_betaling"])
    .order("bestilt", { ascending: true, nullsFirst: false });

  const konton = await hentKonton();
  const rader = konton
    .filter((k) => k.status === "aktiv")
    .map((k) => {
      const naddaSteg = naddeSteg(k);
      return { ...k, naddaSteg, klar: naddaSteg === STEG.length };
    })
    // De som ikke er i mål først. Det er dem siden er til for.
    .sort((a, b) => a.naddaSteg - b.naddaSteg);

  return (
    <StaffShell aktivtSteg="onboarding">
      <Side>
        <Sidehode
          tittel={t.ansattsider.onboarding.tittel}
          tekst={t.ansattsider.onboarding.tekst}
        />
        <Bestillinger rader={(venter ?? []) as Bestilling[]} />

        <Kort>
          <Tabell
            kolonner={[t.internt.konto, t.internt.plan, t.internt.framdrift, t.internt.starPa, t.internt.kontaktKol, t.internt.statusKol]}
            tom={t.internt.ingenAktiveKonton}
            rader={rader.map((r) => [
              <span key="n" className="font-semibold whitespace-nowrap">{r.navn}</span>,
              <Merke key="p" tone={r.plan === "enterprise" ? "aksent" : "noytral"}>
                {planFor(r.plan).navn}
              </Merke>,
              <div key="f" className="w-40">
                <div className="text-[11.5px] text-faint mb-1 tabular-nums">
                  {r.naddaSteg} av {STEG.length} steg
                </div>
                <Stripe
                  andel={(r.naddaSteg / STEG.length) * 100}
                  tone={r.klar ? "aksent" : "advarsel"}
                />
              </div>,
              <span key="s" className="text-dim whitespace-nowrap">
                {r.klar ? "—" : STEG[r.naddaSteg]}
              </span>,
              <span key="k" className="text-dim whitespace-nowrap">{r.kontakt_navn ?? "—"}</span>,
              r.klar ? (
                <Merke key="st" tone="god">{t.internt.igang}</Merke>
              ) : (
                <Merke key="st" tone="advarsel">{t.internt.underOppstart}</Merke>
              ),
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
