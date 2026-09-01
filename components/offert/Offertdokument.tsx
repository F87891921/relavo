import { RelavoLogo } from "@/components/RelavoLogo";
import { RELAVO, relavoOrgNr } from "@/lib/relavo";
import { NOK } from "@/components/ui";
import { formaterOrgnr } from "@/lib/orgnr";
import { regnUt, offertnummer, PRIS, type Offertrad } from "@/lib/offert";

export type Offertdata = Offertrad & {
  id: string;
  kund: string;
  org_nr: string | null;
  kontaktperson: string | null;
  giltig_til: string | null;
  notat: string | null;
  opprettet: string;
};

const dato = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }) : "—";

function Linje({ merke, verdi }: { merke: string; verdi: string }) {
  return (
    <div className="flex justify-between gap-6 py-1.5 border-b border-border last:border-0">
      <span className="text-dim">{merke}</span>
      <span className="font-semibold text-right tabular-nums">{verdi}</span>
    </div>
  );
}

/**
 * Selve tilbudet, slik kunden ser det.
 *
 * Samme komponent på tre steder: forhåndsvisningen internt, lenken kunden
 * får, og utskriften. Ett dokument, ikke tre som skal holdes like.
 *
 * PDF lages med nettleserens egen utskrift til fil. Et pdf-bibliotek ville
 * vært en avhengighet til, en font til å bygge inn, og et andre oppsett som
 * før eller siden så annerledes ut enn skjermen.
 */
export function Offertdokument({ o }: { o: Offertdata }) {
  const r = regnUt(o);
  const nummer = offertnummer(o.id, o.opprettet);
  const orgnr = relavoOrgNr();

  return (
    <article className="bg-surface text-ink rounded-card border border-border shadow-card overflow-hidden print:border-0 print:shadow-none print:rounded-none">
      <div className="px-7 sm:px-10 py-8 sm:py-10">
        {/* ---------- Hode ---------- */}
        <div className="flex items-start justify-between gap-6 flex-wrap mb-9">
          <div>
            <RelavoLogo className="w-[104px] h-auto text-ink mb-3" />
            <div className="text-[11.5px] text-dim leading-relaxed">
              {RELAVO.navn}
              <br />
              {orgnr ? (
                <>Org.nr {orgnr}</>
              ) : (
                <span className="text-bad font-semibold">
                  Org.nr mangler — sett NEXT_PUBLIC_RELAVO_ORG_NR
                </span>
              )}
              {RELAVO.adresse && (
                <>
                  <br />
                  {RELAVO.adresse}
                </>
              )}
              <br />
              {RELAVO.epost} · {RELAVO.nett}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[26px] font-semibold tracking-tight leading-none">
              Tilbud
            </div>
            <div className="font-mono text-[12px] text-dim mt-2">{nummer}</div>
            <div className="text-[11.5px] text-dim mt-1">
              Datert {dato(o.opprettet)}
            </div>
            {o.giltig_til && (
              <div className="text-[11.5px] text-dim">
                Gyldig til {dato(o.giltig_til)}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Mottaker ---------- */}
        <div className="mb-9">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-faint mb-2">
            Tilbud til
          </div>
          <div className="text-[15px] font-semibold">{o.kund}</div>
          <div className="text-[12px] text-dim mt-0.5 leading-relaxed">
            {o.org_nr && <>Org.nr {formaterOrgnr(o.org_nr)}</>}
            {o.org_nr && o.kontaktperson && <br />}
            {o.kontaktperson && <>Att: {o.kontaktperson}</>}
          </div>
        </div>

        {/* ---------- Innhold ---------- */}
        <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-faint mb-2">
          Det tilbudet gjelder
        </div>

        <div className="bg-canvas rounded-xl px-5 py-4 mb-6">
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <span className="text-[15px] font-semibold">{r.planNavn}</span>
            {!r.fritt && r.manedspris > 0 && (
              <span className="text-[12px] text-dim tabular-nums">
                {NOK(r.manedspris)} NOK/mnd
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-dim leading-relaxed max-w-[70ch]">
            {r.fritt ? (
              <>
                {o.fritt_antall} leverandørkontroller til avtalt pris. Hver
                kontroll henter selskapsdata, kartlegger leverandørkjeden og
                lagres som dokumentasjon på kontrollplikten i
                anskaffelsesloven § 5i.
              </>
            ) : o.plan === "engangs" ? (
              <>
                Enkeltkontroller etter behov, fakturert per kontroll. Hver
                kontroll lagres som dokumentasjon på kontrollplikten i § 5i.
              </>
            ) : (
              <>
                Løpende leverandørkontroll med overvåking, leverandørkjede
                etter § 5k, interessekonfliktkontroll og dokumentasjon på
                kontrollplikten i § 5i.{" "}
                {PRIS[o.plan]?.navn === "Enterprise"
                  ? "Inntil ti brukere i organisasjonen."
                  : "Inntil tre brukere i organisasjonen."}
              </>
            )}
          </p>
        </div>

        {/* ---------- Regnestykket ---------- */}
        <div className="text-[13px] mb-2">
          {r.fritt ? (
            <>
              <Linje merke="Antall kontroller" verdi={String(o.fritt_antall)} />
              <Linje
                merke="Pris per kontroll"
                verdi={`${NOK(Math.round(r.totalt / (o.fritt_antall || 1)))} NOK`}
              />
            </>
          ) : (
            <>
              <Linje merke="Listepris per år" verdi={`${NOK(r.listepris)} NOK`} />
              {o.rabatt > 0 && (
                <Linje merke={`Rabatt ${o.rabatt} %`} verdi={`−${NOK(r.rabattBelop)} NOK`} />
              )}
              <Linje merke="Pris per år" verdi={`${NOK(r.arsverdi)} NOK`} />
              <Linje merke="Løpetid" verdi={`${o.ar} ${o.ar === 1 ? "år" : "år"}`} />
            </>
          )}
        </div>

        <div className="flex justify-between gap-6 items-baseline border-t-2 border-ink pt-3 mt-3 mb-8">
          <span className="text-[13.5px] font-semibold">
            Samlet kontraktsverdi
          </span>
          <span className="text-[22px] font-bold tabular-nums tracking-tight">
            {NOK(r.totalt)} NOK
          </span>
        </div>

        <p className="text-[11.5px] text-faint mb-8">
          Alle priser er oppgitt eksklusive merverdiavgift.
        </p>

        {o.notat && (
          <div className="mb-8">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-faint mb-2">
              Merknad
            </div>
            <p className="text-[12.5px] leading-relaxed whitespace-pre-line max-w-[72ch]">
              {o.notat}
            </p>
          </div>
        )}

        {/* ---------- Vilkår ---------- */}
        <div className="border-t border-border pt-6 text-[11.5px] text-dim leading-relaxed max-w-[76ch]">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-faint mb-2">
            Vilkår
          </div>
          <p className="mb-2">
            Fakturering skjer årlig på forskudd med 30 dagers betalingsfrist.
            Avtalen forutsetter at kunden er en offentlig oppdragsgiver eller
            leverandør til slike.
          </p>
          <p>
            For øvrig gjelder Relavos alminnelige vilkår, som til enhver tid
            ligger på {RELAVO.nett}/juridisk. Ved motstrid går dette tilbudet
            foran.
          </p>
        </div>
      </div>
    </article>
  );
}
