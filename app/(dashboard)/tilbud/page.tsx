import Link from "next/link";
import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, Stripe, NOK } from "@/components/ui";
import { virkedagerFram, somDato } from "@/lib/brev";
import { NyRedegjorelse } from "@/components/brev/NyRedegjorelse";
import { RedegjorelseKort, type Redegjorelse } from "@/components/brev/Redegjorelse";

/**
 * Unormalt lave tilbud, § 24-9.
 *
 * Avviket regnes mot medianen av de øvrige tilbudene — det er
 * sammenligningen forskriften legger opp til, ikke mot oppdragsgivers eget
 * estimat. Et estimat kan være feil; de andre tilbyderne kan ikke alle ta
 * feil samtidig.
 *
 * Medianen av «de øvrige» betyr uten tilbudet som vurderes. Regnes det med,
 * trekker et svært lavt tilbud ned sitt eget sammenligningsgrunnlag og
 * avviket ser mindre ut enn det er.
 */
const TERSKEL = -20;

/** Færre enn tre tilbud gir ingen median å si noe om. */
const MINST_ANTALL = 3;

const median = (tall: number[]) => {
  if (!tall.length) return null;
  const s = [...tall].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export default async function TilbudSide({
  searchParams,
}: {
  searchParams: { sak?: string };
}) {
  const { supabase, profil, organisasjonNavn, t } = await krevProfil();

  const [{ data: anskaffelser }, { data: lagrede }] = await Promise.all([
    supabase
      .from("anskaffelser")
      .select("id, saksnummer, navn")
      .order("opprettet", { ascending: false }),
    supabase
      .from("redegjorelser")
      .select(
        "id, leverandor_navn, leverandor_epost, anskaffelse_ref, anskaffelse_navn, avvik_prosent, utkast, frist, sendt, svar, svar_mottatt, vurdering, vurdering_begrunnelse",
      )
      .order("opprettet", { ascending: false }),
  ]);

  const saker = anskaffelser ?? [];
  const valgt = saker.find((a) => a.id === searchParams.sak) ?? saker[0] ?? null;

  const { data: tilbud } = valgt
    ? await supabase
        .from("tilbud")
        .select("id, leverandor_navn, leverandor_epost, sum")
        .eq("anskaffelse_id", valgt.id)
        .order("sum")
    : { data: [] };

  const alle = (tilbud ?? []).map((b) => ({ ...b, sum: Number(b.sum) }));
  const nokTilbud = alle.length >= MINST_ANTALL;

  const rader = alle.map((b) => {
    const ovrige = alle.filter((x) => x.id !== b.id).map((x) => x.sum);
    const med = median(ovrige);
    const avvik = med ? Math.round(((b.sum - med) / med) * 100) : 0;
    return { ...b, avvik, lav: nokTilbud && avvik <= TERSKEL };
  });

  const helMedian = median(alle.map((b) => b.sum));
  const lave = rader.filter((r) => r.lav);
  const frist = somDato(virkedagerFram(10));

  return (
    <DashboardShell aktivtSteg="tilbud">
      <Side>
        <Sidehode
          tittel={t.sider.tilbud.tittel}
          tekst={t.sider.tilbud.tekst}
        />

        {saker.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {saker.map((a) => (
              <Link
                key={a.id}
                href={`/tilbud?sak=${a.id}`}
                className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-xl transition ${
                  a.id === valgt?.id
                    ? "bg-surface shadow-card ring-1 ring-accent"
                    : "bg-surface2 text-dim hover:text-ink"
                }`}
              >
                {a.saksnummer}
              </Link>
            ))}
          </div>
        )}

        {!valgt ? (
          <Kort>
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-dim mb-4">{t.tilbud.ingenAnskaffelse}</p>
              <Link
                href="/anskaffelser"
                className="bg-accent hover:bg-accent-hover transition text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl inline-block"
              >
                {t.anskaffelse.nyAnskaffelse}
              </Link>
            </div>
          </Kort>
        ) : (
          <Kort
            tittel={valgt.navn}
            note={
              helMedian
                ? `${valgt.saksnummer} · median ${NOK(helMedian)} NOK`
                : valgt.saksnummer
            }
            className="mb-5"
          >
            {!nokTilbud && (
              <div className="bg-warn-bg text-warn text-[12.5px] px-5 py-3 leading-relaxed">
                {/* Med ett eller to tilbud finnes det ikke noe å sammenligne
                    med. Å vise et avvik likevel ville gitt et tall som ser
                    ut som en vurdering uten å være det. */}
                {t.tilbud.forFaa.replace("{n}", String(MINST_ANTALL))}{" "}
                <Link href="/anskaffelser" className="underline">
                  {t.tilbud.leggTilTilbud}
                </Link>
              </div>
            )}
            <Tabell
              kolonner={[
                t.internt.tilbyder,
                t.internt.tilbudssum,
                t.internt.avvikMotMedian,
                "",
                t.brev.vurdering,
              ]}
              tom={t.tilbud.ingenTilbud}
              rader={rader.map((r) => [
                <span key="n" className={r.lav ? "font-semibold" : "text-dim"}>
                  {r.leverandor_navn}
                </span>,
                <span key="s" className="tabular-nums whitespace-nowrap">
                  {NOK(r.sum)}
                </span>,
                <span
                  key="a"
                  className={`tabular-nums font-semibold ${r.lav ? "text-bad" : "text-dim"}`}
                >
                  {nokTilbud ? `${r.avvik > 0 ? "+" : ""}${r.avvik} %` : "—"}
                </span>,
                <div key="b" className="w-28">
                  {nokTilbud && (
                    <Stripe
                      andel={Math.min(100, Math.abs(r.avvik) * 2)}
                      tone={r.lav ? "brudd" : "aksent"}
                    />
                  )}
                </div>,
                !nokTilbud ? (
                  <Merke key="v" tone="noytral">{t.tilbud.ikkeVurdert}</Merke>
                ) : r.lav ? (
                  <Merke key="v" tone="brudd">{t.internt.undersokelsesplikt}</Merke>
                ) : (
                  <Merke key="v" tone="god">{t.internt.normalt}</Merke>
                ),
              ])}
            />
          </Kort>
        )}

        {valgt &&
          lave.map((l) => {
            const alt = (lagrede ?? []).find(
              (r) =>
                r.leverandor_navn === l.leverandor_navn &&
                r.anskaffelse_ref === valgt.saksnummer,
            );
            if (alt) return null;
            return (
              <NyRedegjorelse
                key={l.id}
                leverandor={l.leverandor_navn}
                anskaffelseRef={valgt.saksnummer}
                anskaffelseNavn={valgt.navn}
                tilbudssum={l.sum}
                median={helMedian ?? l.sum}
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
              {t.brev.kravRedegjorelse}
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
