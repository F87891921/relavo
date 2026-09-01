import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import type { Ordbok } from "@/lib/sprak";
import { Side, Sidehode, Kort, Tabell, Tall, Rad } from "@/components/ui";
import { StatusMerke, type StatusVal } from "@/components/ui/StatusMerke";
import { Skjema, Felt } from "@/components/internt/Skjema";
import { nyttLead, settLeadStatus } from "@/app/internt/handlinger";

const statusValg = (t: Ordbok): StatusVal[] => [
  { verdi: "ny", tekst: "Ny", tone: "aksent" },
  { verdi: "kontaktad", tekst: t.internt.kontaktad, tone: "noytral" },
  { verdi: "demo", tekst: t.internt.demo, tone: "advarsel" },
  { verdi: "offert", tekst: t.internt.offertStatus, tone: "advarsel" },
  { verdi: "vunnen", tekst: t.internt.vunnen, tone: "god" },
  { verdi: "forlorad", tekst: t.internt.forlorad, tone: "brudd" },
];

export default async function InterntLeadsSide() {
  const { supabase, t } = await krevAnsatt();
  const STATUS = statusValg(t);

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, bolag, kontakt, epost, kalla, status, nasta, notis, opprettet")
    .order("opprettet", { ascending: false });

  const alle = leads ?? [];
  const vunna = alle.filter((l) => l.status === "vunnen").length;
  const forlorade = alle.filter((l) => l.status === "forlorad").length;

  return (
    <StaffShell aktivtSteg="leads">
      <Side>
        <Sidehode
          tittel={t.ansattsider.leads.tittel}
          tekst={t.ansattsider.leads.tekst}
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke={t.internt.leadsTotalt} />
          <Tall verdi={String(alle.length - vunna - forlorade)} merke={t.internt.apneSaker} />
          <Tall verdi={String(vunna)} merke={t.internt.vunna} />
          <Tall
            verdi={
              vunna + forlorade
                ? `${Math.round((vunna / (vunna + forlorade)) * 100)} %`
                : "—"
            }
            merke={t.internt.vinnerandel}
          />
        </Rad>

        <Skjema knapp={`+ ${t.internt.nyttLead}`} tittel={t.internt.nyttLead} handling={nyttLead}>
          <Felt navn="bolag" merke={t.internt.bolag} krav plassholder="Stavanger kommune" />
          <Felt navn="kontakt" merke={t.internt.kontaktperson} plassholder="Ingvild Berge" />
          <Felt navn="epost" merke={t.auth.epost} type="email" plassholder="namn@kommune.no" />
          <Felt
            navn="kalla"
            merke={t.internt.kilde}
            val={[
              { verdi: "", tekst: t.internt.valj },
              { verdi: t.internt.landingsside, tekst: t.internt.landingsside },
              { verdi: t.internt.messe, tekst: t.internt.messe },
              { verdi: t.internt.anbefaling, tekst: t.internt.anbefaling },
              { verdi: t.internt.utgaendeKontakt, tekst: t.internt.utgaendeKontakt },
            ]}
          />
          <Felt navn="status" merke={t.internt.statusKol} val={STATUS} standard="ny" />
          <Felt navn="nasta" merke={t.internt.nesteSteg} type="date" />
          <Felt navn="notis" merke={t.internt.notis} plassholder="Väntar på svar från innkjøpssjef" />
        </Skjema>

        {error && (
          <div className="text-sm text-bad bg-bad-bg rounded-xl px-4 py-3 mb-4">
            Kunde inte hämta leads: {error.message}
          </div>
        )}

        <Kort>
          <Tabell
            kolonner={[t.internt.bolag, t.internt.kontaktKol, t.internt.kilde, t.internt.opprettet, t.internt.nesteSteg, t.internt.notis, t.internt.statusKol]}
            tom={t.internt.ingenLeads}
            rader={alle.map((l) => [
              <span key="b" className="font-semibold whitespace-nowrap">{l.bolag}</span>,
              <div key="k">
                <div className="whitespace-nowrap">{l.kontakt ?? "—"}</div>
                {l.epost && <div className="text-[11.5px] text-faint">{l.epost}</div>}
              </div>,
              <span key="ka" className="text-dim whitespace-nowrap">{l.kalla ?? "—"}</span>,
              <span key="s" className="text-dim whitespace-nowrap">
                {new Date(l.opprettet).toLocaleDateString("sv-SE")}
              </span>,
              <span key="n" className="text-dim whitespace-nowrap">{l.nasta ?? "—"}</span>,
              <span key="no" className="text-dim max-w-[30ch] inline-block">{l.notis ?? "—"}</span>,
              <StatusMerke
                key="st"
                id={l.id}
                verdi={l.status}
                val={STATUS}
                handling={settLeadStatus}
              />,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
