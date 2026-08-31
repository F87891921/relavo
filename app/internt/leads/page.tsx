import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, type Tone } from "@/components/ui";
import { Skjema, Felt, StatusVelger } from "@/components/internt/Skjema";
import { nyttLead, settLeadStatus } from "@/app/internt/handlinger";

const STATUS = [
  { verdi: "ny", tekst: "Ny" },
  { verdi: "kontaktad", tekst: "Kontaktad" },
  { verdi: "demo", tekst: "Demo" },
  { verdi: "offert", tekst: "Offert" },
  { verdi: "vunnen", tekst: "Vunnen" },
  { verdi: "forlorad", tekst: "Förlorad" },
];

const TONE: Record<string, Tone> = {
  ny: "aksent",
  kontaktad: "noytral",
  demo: "advarsel",
  offert: "advarsel",
  vunnen: "god",
  forlorad: "brudd",
};

export default async function InterntLeadsSide() {
  const { supabase } = await krevAnsatt();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, bolag, kontakt, epost, kalla, status, nasta, notis, opprettet")
    .order("opprettet", { ascending: false });

  const alle = leads ?? [];
  const vunna = alle.filter((l) => l.status === "vunnen").length;
  const forlorade = alle.filter((l) => l.status === "forlorad").length;

  return (
    <StaffShell aktivtSteg="Leads">
      <Side>
        <Sidehode
          tittel="Leads"
          tekst="Intresserade som ännu inte är kunder. Kolumnen nästa steg är den som avgör om något faller mellan stolarna."
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke="leads totalt" />
          <Tall verdi={String(alle.length - vunna - forlorade)} merke="öppna" />
          <Tall verdi={String(vunna)} merke="vunna" />
          <Tall
            verdi={
              vunna + forlorade
                ? `${Math.round((vunna / (vunna + forlorade)) * 100)} %`
                : "—"
            }
            merke="vinstandel av avgjorda"
          />
        </Rad>

        <Skjema knapp="+ Nytt lead" tittel="Nytt lead" handling={nyttLead}>
          <Felt navn="bolag" merke="Bolag" krav plassholder="Stavanger kommune" />
          <Felt navn="kontakt" merke="Kontaktperson" plassholder="Ingvild Berge" />
          <Felt navn="epost" merke="E-post" type="email" plassholder="namn@kommune.no" />
          <Felt
            navn="kalla"
            merke="Källa"
            val={[
              { verdi: "", tekst: "Välj …" },
              { verdi: "Landningssida", tekst: "Landningssida" },
              { verdi: "Mässa", tekst: "Mässa" },
              { verdi: "Rekommendation", tekst: "Rekommendation" },
              { verdi: "Utgående kontakt", tekst: "Utgående kontakt" },
            ]}
          />
          <Felt navn="status" merke="Status" val={STATUS} standard="ny" />
          <Felt navn="nasta" merke="Nästa steg" type="date" />
          <Felt navn="notis" merke="Notis" plassholder="Väntar på svar från innkjøpssjef" />
        </Skjema>

        {error && (
          <div className="text-sm text-bad bg-bad-bg rounded-xl px-4 py-3 mb-4">
            Kunde inte hämta leads: {error.message}
          </div>
        )}

        <Kort>
          <Tabell
            kolonner={["Bolag", "Kontakt", "Källa", "Skapad", "Nästa steg", "Notis", "Status"]}
            tom="Inga leads ännu. Skapa det första med knappen ovan."
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
              <div key="st" className="flex items-center gap-2">
                <Merke tone={TONE[l.status] ?? "noytral"}>
                  {STATUS.find((s) => s.verdi === l.status)?.tekst ?? l.status}
                </Merke>
                <StatusVelger
                  id={l.id}
                  status={l.status}
                  val={STATUS}
                  handling={settLeadStatus}
                />
              </div>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
