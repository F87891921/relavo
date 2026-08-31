import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Sidehode, Kort, Tabell, Merke, Tall, Rad, type Tone } from "@/components/ui";
import { LEADS, STATUSTEXT } from "@/lib/demo/staff";

const TONE: Record<string, Tone> = {
  ny: "aksent",
  kontaktad: "noytral",
  demo: "advarsel",
  offert: "advarsel",
  vunnen: "god",
  forlorad: "brudd",
};

export default async function InterntLeadsSide() {
  await krevAnsatt();

  const vunna = LEADS.filter((l) => l.status === "vunnen").length;
  const forlorade = LEADS.filter((l) => l.status === "forlorad").length;
  const oppna = LEADS.length - vunna - forlorade;

  return (
    <StaffShell aktivtSteg="Leads">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Leads"
          tekst="Intresserade som ännu inte är kunder. Kolumnen nästa steg är den som avgör om något faller mellan stolarna."
        />

        <Rad>
          <Tall verdi={String(LEADS.length)} merke="leads totalt" />
          <Tall verdi={String(oppna)} merke="öppna" />
          <Tall verdi={String(vunna)} merke="vunna" />
          <Tall
            verdi={`${Math.round((vunna / Math.max(1, vunna + forlorade)) * 100)} %`}
            merke="vinstandel av avgjorda"
          />
        </Rad>

        <Kort note="demodata från relavo-staff.html">
          <Tabell
            kolonner={["Ref", "Bolag", "Kontakt", "Källa", "Skapad", "Nästa steg", "Notis", "Status"]}
            rader={LEADS.map((l) => [
              <span key="i" className="font-mono text-[12px] text-accent">{l.id}</span>,
              <span key="b" className="font-semibold whitespace-nowrap">{l.bolag}</span>,
              <div key="k">
                <div className="whitespace-nowrap">{l.kontakt}</div>
                <div className="text-[11.5px] text-faint">{l.epost}</div>
              </div>,
              <span key="ka" className="text-dim whitespace-nowrap">{l.kalla}</span>,
              <span key="s" className="text-dim whitespace-nowrap">{l.skapad}</span>,
              <span key="n" className="text-dim whitespace-nowrap">{l.nasta || "—"}</span>,
              <span key="no" className="text-dim max-w-[34ch] inline-block">{l.notis}</span>,
              <Merke key="st" tone={TONE[l.status] ?? "noytral"}>
                {STATUSTEXT[l.status as keyof typeof STATUSTEXT] ?? l.status}
              </Merke>,
            ])}
          />
        </Kort>
      </div>
    </StaffShell>
  );
}
