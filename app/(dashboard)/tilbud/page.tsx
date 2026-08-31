import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Sidehode, Kort, Tabell, Merke, Stripe } from "@/components/ui";
import { ANSKAFFELSER } from "@/lib/demo/app";

/**
 * Tilbudene fra prototypen. Avviket regnes mot medianen av de øvrige
 * tilbudene — det er den sammenligningen § 24-9 legger opp til, ikke mot
 * oppdragsgivers eget estimat.
 */
const TILBUD = [
  { navn: "Solstrand Renhold AS", sum: 21_400_000 },
  { navn: "Clean Nord AS", sum: 33_800_000 },
  { navn: "Vestlandsrenhold AS", sum: 35_200_000 },
  { navn: "Fjordservice AS", sum: 36_900_000 },
];

const TERSKEL = -20; // prosent under medianen før undersøkelsesplikten slår inn

export default async function TilbudSide() {
  const { profil } = await krevProfil();

  const sortert = [...TILBUD].sort((a, b) => a.sum - b.sum);
  const ovrige = sortert.slice(1).map((t) => t.sum);
  const median = ovrige.sort((a, b) => a - b)[Math.floor(ovrige.length / 2)];

  const rader = sortert.map((t) => {
    const avvik = Math.round(((t.sum - median) / median) * 100);
    return { ...t, avvik, lav: avvik <= TERSKEL };
  });

  const lave = rader.filter((r) => r.lav);

  return (
    <DashboardShell aktivtSteg="Unormalt lave tilbud" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <Sidehode
          tittel="Unormalt lave tilbud"
          tekst="Avviket regnes mot medianen av de øvrige tilbudene. Er et tilbud unormalt lavt, plikter oppdragsgiver etter § 24-9 å be tilbyderen redegjøre før tilbudet eventuelt avvises."
        />

        <Kort
          tittel={ANSKAFFELSER[0].navn}
          note={`${ANSKAFFELSER[0].id} · median ${new Intl.NumberFormat("nb-NO").format(median)} NOK`}
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

        {lave.length > 0 && (
          <Kort tittel="Utkast til redegjørelseskrav" note="§ 24-9">
            <div className="px-5 py-5">
              <p className="text-[13px] text-dim leading-relaxed mb-3">
                Sendes til <b className="text-ink">{lave[0].navn}</b>. Kravet må
                være konkret om hva som skal forklares — et generelt spørsmål om
                prisen er ikke nok til å oppfylle plikten.
              </p>
              <div className="bg-canvas rounded-xl px-4 py-3.5 text-[12.5px] leading-relaxed text-dim whitespace-pre-line">
{`Vi viser til deres tilbud i ${ANSKAFFELSER[0].id} — ${ANSKAFFELSER[0].navn}.

Tilbudssummen ligger ${Math.abs(lave[0].avvik)} % under medianen av de øvrige tilbudene. Før vi tar stilling til tilbudet ber vi om en redegjørelse etter anskaffelsesforskriften § 24-9, særlig om:

  – hvordan lønns- og arbeidsvilkår er kalkulert
  – hvilke underleverandører som inngår, og i hvor mange ledd
  – om det er lagt til grunn offentlig støtte

Frist for svar er ti virkedager fra dette brevet.`}
              </div>
            </div>
          </Kort>
        )}
      </div>
    </DashboardShell>
  );
}
