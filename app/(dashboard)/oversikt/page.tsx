import Link from "next/link";
import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, Stripe } from "@/components/ui";
import { HANDLING, KJORINGER, SUPPLIERS } from "@/lib/demo/app";

const navnFor = (org: string) =>
  SUPPLIERS.find((s) => s.org === org)?.name ?? org;

export default async function OversiktSide() {
  const { supabase, profil, t } = await krevProfil();

  // Tallene som finnes i databasen hentes derfra. Resten er ennå demodata
  // fra prototypen — se lib/demo/app.ts.
  const { count: antallLeverandorer } = await supabase
    .from("leverandorer")
    .select("id", { count: "exact", head: true });

  const { count: antallKontroller } = await supabase
    .from("kontroller")
    .select("id", { count: "exact", head: true });

  const { data: hoyRisiko } = await supabase
    .from("leverandorer")
    .select("id")
    .eq("risiko", "hoy");

  // Frister som løper ut. Dette er det eneste på oversikten som krever noe
  // av dem i dag, så det står øverst og ikke nede i en tabell.
  const idag = new Date().toISOString().slice(0, 10);
  const { data: forfalteEspd } = await supabase
    .from("espd_erklaringer")
    .select("id")
    .eq("status", "sendt")
    .lt("frist", idag);

  const { data: apneKrav } = await supabase
    .from("redegjorelser")
    .select("id")
    .is("vurdering", null)
    .not("sendt", "is", null);

  const totalt = antallLeverandorer ?? 0;
  const kontrollert = antallKontroller ?? 0;
  const andel = totalt ? Math.round((kontrollert / totalt) * 100) : 0;

  return (
    <DashboardShell aktivtSteg="oversikt">
      <Side>
        <Sidehode
          tittel={t.sider.oversikt.tittel}
          tekst={t.sider.oversikt.tekst}
        />

        <Rad>
          <Tall verdi={String(totalt)} merke="leverandører i porteføljen" />
          <Tall verdi={String(kontrollert)} merke="kontroller kjørt" />
          <Tall
            verdi={String(hoyRisiko?.length ?? 0)}
            merke="med høy risiko"
            tone={hoyRisiko?.length ? "brudd" : undefined}
          />
          <Tall verdi={`${andel} %`} merke="dokumentert etter § 5i" />
        </Rad>

        {(forfalteEspd?.length || apneKrav?.length) ? (
          <div className="bg-bad-bg text-bad rounded-xl px-4 py-3.5 mb-5 text-[12.5px] leading-relaxed">
            <b>Frister som løper.</b>{" "}
            {forfalteEspd?.length ? (
              <>
                {forfalteEspd.length} ESPD-erklæring
                {forfalteEspd.length === 1 ? " er" : "er er"} over fristen.{" "}
                <Link href="/espd" className="underline">
                  Se dem
                </Link>
                .{" "}
              </>
            ) : null}
            {apneKrav?.length ? (
              <>
                {apneKrav.length} krav om redegjørelse venter på vurdering.{" "}
                <Link href="/tilbud" className="underline">
                  Se dem
                </Link>
                .
              </>
            ) : null}
          </div>
        ) : null}

        <Kort
          tittel="Kontrollplikt § 5i"
          note={`${kontrollert} av ${totalt} leverandører dokumentert`}
          className="mb-6"
        >
          <div className="px-5 py-5">
            <Stripe andel={andel} tone={andel < 60 ? "advarsel" : "aksent"} />
            <p className="text-[12.5px] text-dim mt-3 leading-relaxed">
              Kontrollen må kunne dokumenteres i ettertid, ikke bare utføres.
              Leverandører uten lagret kontroll teller ikke med.{" "}
              <Link href="/ny-kontroll" className="text-accent hover:underline">
                Kjør en kontroll →
              </Link>
            </p>
          </div>
        </Kort>

        <div className="grid lg:grid-cols-2 gap-4">
          <Kort tittel="Krever noe av deg" note="fra prototypens demodata">
            <Tabell
              kolonner={["Leverandør", "Hva", "Når"]}
              rader={HANDLING.map((h) => [
                <span key="n" className="font-semibold">{navnFor(h.org)}</span>,
                <span key="w" className="text-dim">{h.why}</span>,
                <Merke key="t" tone={h.sev === "red" ? "brudd" : "advarsel"}>
                  {h.when}
                </Merke>,
              ])}
            />
          </Kort>

          <Kort tittel="Siste kjøringer" note="fra prototypens demodata">
            <Tabell
              kolonner={["Leverandør", "Tidspunkt", "Utløst av", "Resultat"]}
              rader={KJORINGER.map((k) => [
                <span key="n" className="font-semibold">{navnFor(k.org)}</span>,
                <span key="t" className="text-dim whitespace-nowrap">{k.t}</span>,
                <span key="h" className="text-dim">{k.how}</span>,
                <Merke
                  key="r"
                  tone={k.res === "hoy" ? "brudd" : k.res === "middels" ? "advarsel" : "god"}
                >
                  {k.res === "hoy" ? "Høy" : k.res === "middels" ? "Middels" : "Lav"}
                </Merke>,
              ])}
            />
          </Kort>
        </div>
      </Side>
    </DashboardShell>
  );
}
