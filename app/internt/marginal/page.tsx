import { krevSuperadmin } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK } from "@/components/ui";
import { hentKonton, mrr } from "@/lib/konton";
import { planFor } from "@/lib/plan";
import { KILDER } from "@/lib/kilder";

/**
 * Marginen per konto.
 *
 * Her sto det en kostnad per oppslag regnet ut av en snittpris over
 * demokildene. Den var oppdiktet, og en margin bygget på et oppdiktet tall
 * er verre enn ingen margin: den ser ut som et regnskap.
 *
 * Sannheten i dag er at den variable kostnaden er null. Alle kildene vi
 * faktisk bruker — Enhetsregisteret, Arbeidstilsynet, DiBK, EUs
 * sanksjonsliste — er gratis, og skatteattesten kommer fra leverandøren.
 * Marginen er derfor inntekten minus drift, og driften er ikke per kunde.
 *
 * Det som er verdt å se her er noe annet: hvem som betaler lite og bruker
 * mye. Det er den som blir dyr den dagen en kilde begynner å koste.
 */
export default async function InterntMarginalSide() {
  const { t } = await krevSuperadmin();
  const konton = await hentKonton();

  const betalende = konton.filter((k) => k.status === "aktiv");
  const inntekt = mrr(konton);
  const kontroller30 = betalende.reduce((s, k) => s + Number(k.kontroller_30d), 0);

  const betalte = KILDER.filter((k) => k.vei !== "mangler" && (k.kostnad ?? 0) > 0);

  const rader = betalende
    .map((k) => {
      const pris = planFor(k.plan).manedspris;
      const brukt = Number(k.kontroller_30d);
      // Hva en kontroll faktisk innbringer for denne kunden denne måneden.
      // Det er tallet som faller når noen bruker mye og betaler fast.
      const perKontroll = brukt ? Math.round(pris / brukt) : null;
      return { ...k, pris, brukt, perKontroll };
    })
    .sort((a, b) => (a.perKontroll ?? Infinity) - (b.perKontroll ?? Infinity));

  return (
    <StaffShell aktivtSteg="marginal">
      <Side>
        <Sidehode
          tittel={t.ansattsider.marginal.tittel}
          tekst={t.ansattsider.marginal.tekst}
        />

        <Rad>
          <Tall verdi={`${NOK(inntekt)} kr`} merke={t.internt.inntektPerManed} />
          <Tall verdi={String(kontroller30)} merke={t.internt.kontroller30} />
          <Tall
            verdi={kontroller30 ? `${NOK(Math.round(inntekt / kontroller30))} kr` : "—"}
            merke={t.internt.snittPerKontroll}
          />
          <Tall
            verdi={betalte.length ? `${betalte.length}` : "0 kr"}
            merke={t.internt.betalteKilder}
          />
        </Rad>

        <div className="bg-surface2 text-accent text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed max-w-[76ch]">
          {t.internt.marginForklaring}
        </div>

        <Kort>
          <Tabell
            kolonner={[
              t.internt.konto,
              t.internt.plan,
              t.internt.inntekt,
              t.internt.kontroller30Kol,
              t.internt.perKontroll,
            ]}
            tom={t.internt.ingenBetalende}
            rader={rader.map((r) => [
              <span key="n" className="font-semibold">{r.navn}</span>,
              <Merke key="p" tone={r.plan === "enterprise" ? "aksent" : "noytral"}>
                {planFor(r.plan).navn}
              </Merke>,
              <span key="i" className="tabular-nums whitespace-nowrap">
                {r.pris ? `${NOK(r.pris)} kr` : t.internt.perStykk}
              </span>,
              <span key="b" className="tabular-nums">{r.brukt}</span>,
              r.perKontroll === null ? (
                <Merke key="m" tone="advarsel">{t.internt.ingenBruk}</Merke>
              ) : (
                <span
                  key="m"
                  className={`tabular-nums whitespace-nowrap font-semibold ${
                    r.perKontroll < 100 ? "text-warn" : ""
                  }`}
                >
                  {NOK(r.perKontroll)} kr
                </span>
              ),
            ])}
          />
        </Kort>

        <p className="text-[12px] text-faint mt-4 max-w-[76ch] leading-relaxed">
          {t.internt.marginFotnot}
        </p>
      </Side>
    </StaffShell>
  );
}
