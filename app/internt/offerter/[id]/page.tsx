import Link from "next/link";
import { notFound } from "next/navigation";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Merke } from "@/components/ui";
import { StatusMerke } from "@/components/ui/StatusMerke";
import { Offertdokument, type Offertdata } from "@/components/offert/Offertdokument";
import { Verktyg } from "@/components/offert/Verktyg";
import { OFFERTSTATUS } from "@/lib/offert";
import { settOffertStatus } from "@/app/internt/handlinger";
import { grunnUrl } from "@/lib/url";

export default async function OffertSide({ params }: { params: { id: string } }) {
  const { supabase } = await krevAnsatt();

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
            ← Alla offerter
          </Link>
          <StatusMerke
            id={o.id}
            verdi={o.status}
            val={OFFERTSTATUS}
            handling={settOffertStatus}
          />
        </div>

        {/* Vad som hänt med den, i den ordning det hände. */}
        <div className="skjul-i-utskrift flex flex-wrap items-center gap-2 mb-4 text-[11.5px] text-faint">
          <Merke tone="noytral">Skapad {tid(o.opprettet)}</Merke>
          {o.sendt && <Merke tone="advarsel">Skickad {tid(o.sendt)}</Merke>}
          {o.sett && <Merke tone="aksent">Öppnad {tid(o.sett)}</Merke>}
          {o.svar === "akseptert" && <Merke tone="god">Accepterad {tid(o.svar_tid)}</Merke>}
          {o.svar === "avslatt" && <Merke tone="brudd">Nekad {tid(o.svar_tid)}</Merke>}
        </div>

        {o.svar === "avslatt" && (
          <div className="skjul-i-utskrift bg-bad-bg text-bad rounded-xl px-4 py-3.5 mb-5 text-[12.5px] leading-relaxed">
            <b>{o.svar_navn ?? o.kund} tackade nej.</b>
            {o.svar_kommentar && (
              <span className="block mt-1.5 italic">”{o.svar_kommentar}”</span>
            )}
            <span className="block mt-1.5 text-[11.5px]">
              Skapa en ny offert om ni vill komma tillbaka med ett annat
              upplägg — den här är låst till svaret.
            </span>
          </div>
        )}

        {o.svar === "akseptert" && (
          <div className="skjul-i-utskrift bg-good-bg text-good rounded-xl px-4 py-3.5 mb-5 text-[12.5px] leading-relaxed">
            <b>{o.svar_navn ?? o.kund} accepterade offerten.</b>
            {o.svar_kommentar && (
              <span className="block mt-1.5 italic">”{o.svar_kommentar}”</span>
            )}
          </div>
        )}

        {!o.svar && (
          <Verktyg
            id={o.id}
            epost={o.kontakt_epost}
            redanSand={Boolean(o.sendt)}
            lenke={lenke}
          />
        )}

        <Offertdokument o={o as unknown as Offertdata} />
      </Side>
    </StaffShell>
  );
}
