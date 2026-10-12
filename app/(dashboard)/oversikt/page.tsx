import Link from "next/link";
import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, Stripe } from "@/components/ui";
import { NesteSteg } from "@/components/NesteSteg";
import { alleSteg } from "@/lib/nesteSteg";
import { GrenserBanner } from "@/components/GrenserBanner";
import { hentGrenser } from "@/lib/grenser";

export default async function OversiktSide() {
  const { supabase, profil, t } = await krevProfil();

  const grenser = await hentGrenser(supabase, profil.organisasjon_id);

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

  // Lista over det som krever noe er den samme som banneret over henter
  // sitt ene punkt fra. Det øverste står allerede der, så tabellen begynner
  // på det nest øverste — ellers leser man den samme saken to ganger.
  const krever = (await alleSteg()).slice(1, 9);

  // De siste kjøringene, med lenke til hver rapport.
  const { data: sisteKjoringer } = await supabase
    .from("kontroller")
    .select("id, utfort, risiko, leverandorer(navn)")
    .order("utfort", { ascending: false })
    .limit(8);

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

        <GrenserBanner g={grenser} />

        <NesteSteg />

        <Rad>
          <Tall verdi={String(totalt)} merke={t.oversikt.iPortefoljen} />
          <Tall verdi={String(kontrollert)} merke={t.oversikt.kontrollerKjort} />
          <Tall
            verdi={String(hoyRisiko?.length ?? 0)}
            merke={t.oversikt.medHoyRisiko}
            tone={hoyRisiko?.length ? "brudd" : undefined}
          />
        </Rad>

        {(forfalteEspd?.length || apneKrav?.length) ? (
          <div className="bg-bad-bg text-bad rounded-xl px-4 py-3.5 mb-5 text-[12.5px] leading-relaxed">
            <b>{t.oversikt.frister}</b>{" "}
            {forfalteEspd?.length ? (
              <>
                {forfalteEspd.length}{" "}
                {forfalteEspd.length === 1
                  ? t.oversikt.espdEn
                  : t.oversikt.espdFlere}{" "}
                <Link href="/espd" className="underline">
                  {t.oversikt.seDem}
                </Link>
                .{" "}
              </>
            ) : null}
            {apneKrav?.length ? (
              <>
                {apneKrav.length} {t.oversikt.kravVenter}{" "}
                <Link href="/tilbud" className="underline">
                  {t.oversikt.seDem}
                </Link>
                .
              </>
            ) : null}
          </div>
        ) : null}

        <Kort
          tittel={t.oversikt.kontrollplikt}
          note={`${kontrollert} / ${totalt} ${t.oversikt.avDokumentert}`}
          className="mb-6"
        >
          <div className="px-5 py-5">
            <Stripe andel={andel} tone={andel < 60 ? "advarsel" : "aksent"} />
            <p className="text-[12.5px] text-dim mt-3 leading-relaxed">
              {t.oversikt.forklaring}{" "}
              <Link href="/ny-kontroll" className="text-accent hover:underline">
                {t.oversikt.kjorEnKontroll}
              </Link>
            </p>
          </div>
        </Kort>

        <div className="grid lg:grid-cols-2 gap-4">
          <Kort tittel={t.oversikt.kreverNoe}>
            <Tabell
              kolonner={[t.ui.leverandor, t.ui.hva, ""]}
              tom={t.oversikt.ingenKrever}
              rader={krever.map((steg) => [
                <span key="n" className="font-semibold">{steg.tittel}</span>,
                <span key="w" className="text-dim">{steg.detalj}</span>,
                <Link
                  key="t"
                  href={steg.href}
                  className="text-[12px] text-accent hover:underline whitespace-nowrap"
                >
                  {steg.knapp}
                </Link>,
              ])}
            />
          </Kort>

          <Kort tittel={t.oversikt.sisteKjoringer}>
            <Tabell
              kolonner={[t.ui.leverandor, t.ui.tidspunkt, t.ui.resultat]}
              tom={t.oversikt.ingenKjoringer}
              rader={(sisteKjoringer ?? []).map((k) => {
                const lev = k.leverandorer as unknown as { navn: string } | null;
                return [
                  <Link
                    key="n"
                    href={`/kontroll/${k.id}`}
                    className="font-semibold hover:text-accent hover:underline"
                  >
                    {lev?.navn ?? "—"}
                  </Link>,
                  <span key="t" className="text-dim whitespace-nowrap">
                    {new Date(k.utfort).toLocaleDateString("nb-NO", {
                      day: "numeric", month: "short",
                    })}
                  </span>,
                  <Merke
                    key="r"
                    tone={k.risiko === "hoy" ? "brudd" : k.risiko === "middels" ? "advarsel" : "god"}
                  >
                    {t.risiko[k.risiko as keyof typeof t.risiko] ?? k.risiko}
                  </Merke>,
                ];
              })}
            />
          </Kort>
        </div>
      </Side>
    </DashboardShell>
  );
}
