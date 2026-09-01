import Link from "next/link";
import { notFound } from "next/navigation";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Merke } from "@/components/ui";
import { StatusMerke } from "@/components/ui/StatusMerke";
import { Offertdokument, type Offertdata } from "@/components/offert/Offertdokument";
import { Verktyg } from "@/components/offert/Verktyg";
import { offertstatus } from "@/lib/offert";
import { settOffertStatus } from "@/app/internt/handlinger";
import { grunnUrl } from "@/lib/url";

export default async function OffertSide({ params }: { params: { id: string } }) {
  const { supabase, t } = await krevAnsatt();

  const { data: o } = await supabase
    .from("offerter")
    .select(
      "id, kund, org_nr, kontaktperson, kontakt_epost, plan, ar, rabatt, giltig_til, fritt_antall, fritt_pris, notat, status, opprettet, token, sendt, sett, svar, svar_kommentar, svar_navn, svar_tid",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!o) notFound();

  const lenke = `${grunnUrl()}/offert/${o.token}`;
  const tid = (t: string | null) =>
    t ? new Date(t).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" }) : null;

  return (
    <StaffShell aktivtSteg="offerter">
      <Side smal>
        <div className="skjul-i-utskrift flex items-center justify-between gap-4 flex-wrap mb-4">
          <Link
            href="/internt/offerter"
            className="text-[13px] text-dim hover:text-ink transition"
          >
            ← {t.internt.alleOfferter}
          </Link>
          <StatusMerke
            id={o.id}
            verdi={o.status}
            val={offertstatus(t)}
            handling={settOffertStatus}
          />
        </div>

        {/* Vad som hänt med den, i den ordning det hände. */}
        <div className="skjul-i-utskrift flex flex-wrap items-center gap-2 mb-4 text-[11.5px] text-faint">
          <Merke tone="noytral">
            {t.internt.skapad} {tid(o.opprettet)}
          </Merke>
          {o.sendt && (
            <Merke tone="advarsel">
              {t.internt.skickadDen} {tid(o.sendt)}
            </Merke>
          )}
          {o.sett && (
            <Merke tone="aksent">
              {t.internt.oppnad} {tid(o.sett)}
            </Merke>
          )}
          {o.svar === "akseptert" && (
            <Merke tone="god">
              {t.internt.accepterad} {tid(o.svar_tid)}
            </Merke>
          )}
          {o.svar === "endring" && (
            <Merke tone="advarsel">
              {t.internt.onskarAndring} {tid(o.svar_tid)}
            </Merke>
          )}
          {o.svar === "avslatt" && (
            <Merke tone="brudd">
              {t.internt.nekad} {tid(o.svar_tid)}
            </Merke>
          )}
        </div>

        {o.svar && (
          <div
            className={`skjul-i-utskrift rounded-xl px-4 py-3.5 mb-5 text-[12.5px] leading-relaxed ${
              o.svar === "akseptert"
                ? "bg-good-bg text-good"
                : o.svar === "endring"
                  ? "bg-warn-bg text-warn"
                  : "bg-bad-bg text-bad"
            }`}
          >
            <b>
              {o.svar_navn ?? o.kund}{" "}
              {o.svar === "akseptert"
                ? t.internt.accepteradeOfferten
                : o.svar === "endring"
                  ? t.internt.onskarAndringAv
                  : t.internt.tackadeNej}
            </b>
            {o.svar_kommentar && (
              <span className="block mt-1.5 italic">”{o.svar_kommentar}”</span>
            )}
            {/* Et nei er ikke det samme som «ikke prøv igjen». Ønsker de
                endring, er ballen hos oss — og da skal veien videre stå her,
                ikke i hodet på den som leser. */}
            {o.svar !== "akseptert" && (
              <Link
                href={`/internt/offerter?revider=${o.id}`}
                className="inline-block mt-2 font-semibold underline underline-offset-2 hover:no-underline"
              >
                {t.internt.lagRevisjon} →
              </Link>
            )}
            {o.svar === "avslatt" && (
              <span className="block mt-1.5 text-[11.5px] opacity-80">
                {t.internt.skapaNyOffert}
              </span>
            )}
          </div>
        )}

        {/* Verktøyet vises alltid. Utskrift og lenke skal virke også etter at
            kunden har svart — det var nettopp da man trengte å hente fram
            tilbudet igjen, og før lå knappene bak et «bare hvis ubesvart». */}
        <Verktyg
          id={o.id}
          epost={o.kontakt_epost}
          redanSand={Boolean(o.sendt)}
          besvart={Boolean(o.svar)}
          lenke={lenke}
        />

        <Offertdokument o={o as unknown as Offertdata} />
      </Side>
    </StaffShell>
  );
}
