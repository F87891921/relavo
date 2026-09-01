import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, Stripe } from "@/components/ui";
import { planFor } from "@/lib/plan";
import { MIN_LENGDE } from "@/lib/passord";
import { Tofaktor } from "@/components/konto/Tofaktor";
import { Sprakvelger } from "@/components/Sprakvelger";
import {
  EgetNavn,
  EgetPassord,
  Organisasjonen,
  NyBrukerSkjema,
  BrukerRad,
} from "@/components/konto/Skjemaer";

export default async function KontoSide() {
  const { supabase, user, profil, t, sprak } = await krevProfil();

  const [{ data: org }, { data: kolleger }, { count: antallLeverandorer }, { count: antallKontroller }] = await Promise.all([
    supabase
      .from("organisasjoner")
      .select("navn, org_nr, plan, opprettet")
      .eq("id", profil.organisasjon_id)
      .maybeSingle(),
    supabase
      .from("profiler")
      .select("id, navn, rolle, opprettet")
      .eq("organisasjon_id", profil.organisasjon_id)
      .order("opprettet"),
    supabase.from("leverandorer").select("id", { count: "exact", head: true }),
    supabase.from("kontroller").select("id", { count: "exact", head: true }),
  ]);

  const plan = planFor(org?.plan);
  const brukt = kolleger?.length ?? 0;
  const admin = profil.rolle === "administrator";
  const fullt = brukt >= plan.brukere;

  return (
    <DashboardShell aktivtSteg="konto">
      <Side smal>
        <Sidehode
          tittel={t.sider.konto.tittel}
          tekst={t.sider.konto.tekst}
        />

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Kort tittel={t.konto.kontoDeg}>
            <div className="px-5 py-5">
              <dl className="text-[13px] mb-5 space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-dim">{t.auth.epost}</dt>
                  <dd className="font-semibold">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-dim">{t.ui.rolle}</dt>
                  <dd>
                    <Merke tone={admin ? "aksent" : "noytral"}>
                      {admin ? t.internt.administrator : t.internt.anvandare}
                    </Merke>
                  </dd>
                </div>
              </dl>
              <EgetNavn navn={profil.navn ?? ""} />
            </div>
          </Kort>

          <Kort tittel={t.konto.byttPassord}>
            <div className="px-5 py-5">
              <p className="text-[12.5px] text-dim mb-4 leading-relaxed">
                {t.konto.passordkrav.replace("{n}", String(MIN_LENGDE))}
              </p>
              <EgetPassord />
            </div>
          </Kort>
        </div>

        <Kort tittel={t.konto.sprakTittel} className="mb-4">
          <div className="px-5 py-5 flex items-start justify-between gap-5">
            <p className="text-[12.5px] text-dim leading-relaxed max-w-[62ch]">
              {t.konto.sprakTekst}
            </p>
            <span className="shrink-0 -mt-1">
              <Sprakvelger na={sprak} retning="ned" />
            </span>
          </div>
        </Kort>

        <Kort tittel={t.konto.kontoTofaktor} note={t.konto.engangskodeFraMobil} className="mb-4">
          <div className="px-5 py-5">
            <Tofaktor />
          </div>
        </Kort>

        <Kort tittel={t.konto.organisasjonen} note={plan.navn} className="mb-4">
          <div className="px-5 py-5">
            <div className="mb-5">
              <div className="flex justify-between text-[12.5px] mb-1.5">
                <span className="text-dim">
                  {brukt} av {plan.brukere}{" "}
                  {plan.brukere === 1 ? "bruker" : "brukere"} i planen
                </span>
                <span className="text-faint">{plan.pris}</span>
              </div>
              <Stripe
                andel={(brukt / plan.brukere) * 100}
                tone={fullt ? "advarsel" : "aksent"}
              />
            </div>

            {admin ? (
              <Organisasjonen navn={org?.navn ?? ""} orgNr={org?.org_nr ?? ""} />
            ) : (
              <dl className="text-[13px] space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-dim">Navn</dt>
                  <dd className="font-semibold">{org?.navn}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-dim">{t.internt.organisasjonsnummer}</dt>
                  <dd>{org?.org_nr ?? "—"}</dd>
                </div>
                <p className="text-[12px] text-faint pt-2">
                  {t.konto.bareAdministrator}
                </p>
              </dl>
            )}
          </div>
        </Kort>

        <Kort
          tittel={t.konto.tilgang}
          note={`${brukt} av ${plan.brukere} plasser brukt`}
        >
          <div className="px-5 pt-5">
            {admin &&
              (fullt ? (
                <div className="bg-warn-bg text-warn text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
                  <b>{t.konto.planenErFull}</b> {plan.navn} gir plass til{" "}
                  {plan.brukere} {plan.brukere === 1 ? "bruker" : "brukere"}.
                  Fjern noen, eller oppgrader for å legge til flere.
                </div>
              ) : (
                <NyBrukerSkjema />
              ))}
          </div>

          <Tabell
            kolonner={["Navn", "Rolle", "Lagt til", ""]}
            rader={(kolleger ?? []).map((k) => [
              <span key="n" className="font-semibold">
                {k.navn}
                {k.id === user.id && (
                  <span className="text-faint font-normal"> — deg</span>
                )}
              </span>,
              <BrukerRad
                key="r"
                id={k.id}
                rolle={k.rolle}
                erDegSelv={k.id === user.id}
                kanEndre={admin}
                felt="rolle"
              />,
              <span key="o" className="text-dim whitespace-nowrap">
                {new Date(k.opprettet).toLocaleDateString("nb-NO")}
              </span>,
              <BrukerRad
                key="f"
                id={k.id}
                rolle={k.rolle}
                erDegSelv={k.id === user.id}
                kanEndre={admin}
                felt="fjern"
              />,
            ])}
          />
        </Kort>

        {/* Lå før på en egen side som het Diagnostikk. Det er kontoopplysninger,
            ikke et eget verktøy — og «Diagnostikk» i kundens meny så ut som noe
            var i stykker. */}
        <Kort tittel={t.konto.teknisk} note={t.konto.oppgiDisse} className="mt-4">
          <Tabell
            kolonner={["Opplysning", t.internt.verdi]}
            rader={[
              [t.konto.leverandorerLagret, String(antallLeverandorer ?? 0)],
              [t.konto.kontrollerLagret, String(antallKontroller ?? 0)],
              [
                t.konto.organisasjonsId,
                <span key="o" className="font-mono text-[11.5px]">
                  {profil.organisasjon_id}
                </span>,
              ],
              [
                t.konto.dinBrukerId,
                <span key="u" className="font-mono text-[11.5px]">
                  {user.id}
                </span>,
              ],
              [
                t.internt.opprettet,
                org?.opprettet
                  ? new Date(org.opprettet).toLocaleDateString("nb-NO")
                  : "—",
              ],
            ]}
          />
        </Kort>
      </Side>
    </DashboardShell>
  );
}
