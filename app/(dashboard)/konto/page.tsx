import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, Stripe } from "@/components/ui";
import { planFor } from "@/lib/plan";
import { MIN_LENGDE } from "@/lib/passord";
import { Tofaktor } from "@/components/konto/Tofaktor";
import {
  EgetNavn,
  EgetPassord,
  Organisasjonen,
  NyBrukerSkjema,
  BrukerRad,
} from "@/components/konto/Skjemaer";

export default async function KontoSide({
  searchParams,
}: {
  searchParams: { mfa?: string };
}) {
  const { supabase, user, profil } = await krevProfil();

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
    <DashboardShell aktivtSteg="Konto">
      <Side smal>
        <Sidehode
          tittel="Kontoinnstillinger"
          tekst="Dine egne opplysninger, organisasjonen du hører til, og hvem som har tilgang."
        />

        {searchParams.mfa === "kreves" && (
          <div className="bg-bad-bg text-bad rounded-xl px-4 py-3.5 mb-5 text-[13px] leading-relaxed">
            <b>Tofaktor kreves for ansatte.</b> Kontoen din gir tilgang til
            flere kunders data. Sett det opp under Tofaktor lenger ned — resten
            av panelet åpnes så snart det er på plass.
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Kort tittel="Deg">
            <div className="px-5 py-5">
              <dl className="text-[13px] mb-5 space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-dim">E-post</dt>
                  <dd className="font-semibold">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-dim">Rolle</dt>
                  <dd>
                    <Merke tone={admin ? "aksent" : "noytral"}>
                      {admin ? "Administrator" : "Bruker"}
                    </Merke>
                  </dd>
                </div>
              </dl>
              <EgetNavn navn={profil.navn ?? ""} />
            </div>
          </Kort>

          <Kort tittel="Bytt passord">
            <div className="px-5 py-5">
              <p className="text-[12.5px] text-dim mb-4 leading-relaxed">
                Minst {MIN_LENGDE} tegn, med stor og liten bokstav, tall og
                spesialtegn. Kan ikke inneholde e-postadressen din.
              </p>
              <EgetPassord />
            </div>
          </Kort>
        </div>

        <Kort tittel="Tofaktor" note="engangskode fra mobilen" className="mb-4">
          <div className="px-5 py-5">
            <Tofaktor maPa={profil.ansatt === true} />
          </div>
        </Kort>

        <Kort tittel="Organisasjonen" note={plan.navn} className="mb-4">
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
                  <dt className="text-dim">Organisasjonsnummer</dt>
                  <dd>{org?.org_nr ?? "—"}</dd>
                </div>
                <p className="text-[12px] text-faint pt-2">
                  Bare administrator kan endre disse.
                </p>
              </dl>
            )}
          </div>
        </Kort>

        <Kort
          tittel="Tilgang"
          note={`${brukt} av ${plan.brukere} plasser brukt`}
        >
          <div className="px-5 pt-5">
            {admin &&
              (fullt ? (
                <div className="bg-warn-bg text-warn text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
                  <b>Planen er full.</b> {plan.navn} gir plass til{" "}
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
        <Kort tittel="Teknisk" note="oppgi disse ved kontakt med brukerstøtte" className="mt-4">
          <Tabell
            kolonner={["Opplysning", "Verdi"]}
            rader={[
              ["Leverandører lagret", String(antallLeverandorer ?? 0)],
              ["Kontroller lagret", String(antallKontroller ?? 0)],
              [
                "Organisasjons-id",
                <span key="o" className="font-mono text-[11.5px]">
                  {profil.organisasjon_id}
                </span>,
              ],
              [
                "Din bruker-id",
                <span key="u" className="font-mono text-[11.5px]">
                  {user.id}
                </span>,
              ],
              [
                "Opprettet",
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
