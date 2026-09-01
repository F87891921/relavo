import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, Stripe } from "@/components/ui";
import { ANSKAFFELSER } from "@/lib/demo/app";
import { virkedagerFram, somDato } from "@/lib/brev";
import { NyRedegjorelse } from "@/components/brev/NyRedegjorelse";
import { RedegjorelseKort, type Redegjorelse } from "@/components/brev/Redegjorelse";

/**
 * Tilbudene fra prototypen. Avviket regnes mot medianen av de øvrige
 * tilbudene — det er sammenligningen § 24-9 legger opp til, ikke mot
 * oppdragsgivers eget estimat.
 */
const TILBUD = [
  { navn: "Solstrand Renhold AS", sum: 21_400_000 },
  { navn: "Clean Nord AS", sum: 33_800_000 },
  { navn: "Vestlandsrenhold AS", sum: 35_200_000 },
  { navn: "Fjordservice AS", sum: 36_900_000 },
];

const TERSKEL = -20;

export default async function TilbudSide() {
  const { supabase, profil, organisasjonNavn } = await krevProfil();

  const { data: lagrede } = await supabase
    .from("redegjorelser")
    .select(
      "id, leverandor_navn, leverandor_epost, anskaffelse_ref, anskaffelse_navn, avvik_prosent, utkast, frist, sendt, svar, svar_mottatt, vurdering, vurdering_begrunnelse",
    )
    .order("opprettet", { ascending: false });

  const sortert = [...TILBUD].sort((a, b) => a.sum - b.sum);
  const ovrige = sortert.slice(1).map((t) => t.sum).sort((a, b) => a - b);
  const median = ovrige[Math.floor(ovrige.length / 2)];

  const rader = sortert.map((t) => {
    const avvik = Math.round(((t.sum - median) / median) * 100);
    return { ...t, avvik, lav: avvik <= TERSKEL };
  });

  const lave = rader.filter((r) => r.lav);
  const ansk = ANSKAFFELSER[0];
  const frist = somDato(virkedagerFram(10));

  return (
    <DashboardShell aktivtSteg="Unormalt lave tilbud">
      <Side>
        <Sidehode
          tittel="Unormalt lave tilbud"
          tekst="Avviket regnes mot medianen av de øvrige tilbudene. Er et tilbud unormalt lavt, plikter dere etter § 24-9 å be tilbyderen redegjøre skriftlig før tilbudet eventuelt avvises."
        />

        <Kort
          tittel={ansk.navn}
          note={`${ansk.id} · median ${new Intl.NumberFormat("nb-NO").format(median)} NOK`}
          className="mb-5"
        >
          <Tabell
            kolonner={["Tilbyder", "Tilbudssum", "Avvik mot median", "", "Vurdering"]}
            rader={rader.map((r) => [
              <span key="n" className={r.lav ? "font-semibold" : "text-dim"}>
                {r.navn}
              </span>,
              <span key="s" className="tabular-nums whitespace-nowrap">
                {new Intl.NumberFormat("nb-NO").format(r.sum)}
              </span>,
              <span
                key="a"
                className={`tabular-nums font-semibold ${r.lav ? "text-bad" : "text-dim"}`}
              >
                {r.avvik > 0 ? "+" : ""}
                {r.avvik} %
              </span>,
              <div key="b" className="w-28">
                <Stripe
                  andel={Math.min(100, Math.abs(r.avvik) * 2)}
                  tone={r.lav ? "brudd" : "aksent"}
                />
              </div>,
              r.lav ? (
                <Merke key="v" tone="brudd">Undersøkelsesplikt</Merke>
              ) : (
                <Merke key="v" tone="god">Normalt</Merke>
              ),
            ])}
          />
        </Kort>

        {lave.map((l) => {
          const alt = (lagrede ?? []).find(
            (r) => r.leverandor_navn === l.navn && r.anskaffelse_ref === ansk.id,
          );
          if (alt) return null;
          return (
            <NyRedegjorelse
              key={l.navn}
              leverandor={l.navn}
              anskaffelseRef={ansk.id}
              anskaffelseNavn={ansk.navn}
              tilbudssum={l.sum}
              median={median}
              avvik={l.avvik}
              frist={frist}
              avsenderNavn={profil.navn}
              avsenderOrg={organisasjonNavn}
            />
          );
        })}

        {(lagrede ?? []).length > 0 && (
          <div className="space-y-3 mt-5">
            <div className="text-[12px] font-semibold text-dim">
              Krav om redegjørelse
            </div>
            {(lagrede as unknown as Redegjorelse[]).map((r) => (
              <RedegjorelseKort key={r.id} r={r} />
            ))}
          </div>
        )}
      </Side>
    </DashboardShell>
  );
}
