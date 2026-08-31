import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK, type Tone } from "@/components/ui";
import { Skjema, Felt, StatusVelger } from "@/components/internt/Skjema";
import { nyOfferte, settOffertStatus } from "@/app/internt/handlinger";

const PRIS: Record<string, { navn: string; mnd: number }> = {
  engangs: { navn: "Leverandørkontroll", mnd: 0 },
  standard: { navn: "Standard", mnd: 6900 },
  enterprise: { navn: "Enterprise", mnd: 12900 },
};

const STATUS = [
  { verdi: "utkast", tekst: "Utkast" },
  { verdi: "skickad", tekst: "Skickad" },
  { verdi: "akseptert", tekst: "Accepterad" },
  { verdi: "utgatt", tekst: "Utgången" },
  { verdi: "forlorad", tekst: "Förlorad" },
];

const TONE: Record<string, Tone> = {
  utkast: "noytral",
  skickad: "advarsel",
  akseptert: "god",
  utgatt: "brudd",
  forlorad: "brudd",
};

export default async function InterntOfferterSide() {
  const { supabase } = await krevAnsatt();

  const { data: offerter } = await supabase
    .from("offerter")
    .select("id, kund, plan, ar, rabatt, giltig_til, status, opprettet")
    .order("opprettet", { ascending: false });

  const { data: leads } = await supabase
    .from("leads")
    .select("id, bolag")
    .not("status", "in", '("vunnen","forlorad")')
    .order("bolag");

  const rader = (offerter ?? []).map((o) => {
    const p = PRIS[o.plan] ?? { navn: o.plan, mnd: 0 };
    const arsvarde = p.mnd * 12 * (1 - o.rabatt / 100);
    return { ...o, planNavn: p.navn, arsvarde, totalt: arsvarde * o.ar };
  });

  return (
    <StaffShell aktivtSteg="Offerter">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Offerter"
          tekst="Skickade offerter, vad de är värda och när de går ut. Kontraktsvärdet är årspriset efter rabatt gånger antal år."
        />

        <Rad>
          <Tall verdi={String(rader.length)} merke="offerter" />
          <Tall
            verdi={String(rader.filter((o) => o.status === "skickad").length)}
            merke="väntar på svar"
          />
          <Tall
            verdi={`${NOK(Math.round(rader.reduce((s, r) => s + r.totalt, 0)))} kr`}
            merke="samlat kontraktsvärde"
          />
          <Tall
            verdi={String(rader.filter((o) => o.status === "akseptert").length)}
            merke="accepterade"
          />
        </Rad>

        <Skjema knapp="+ Ny offert" tittel="Ny offert" handling={nyOfferte}>
          <Felt navn="kund" merke="Kund" krav plassholder="Stavanger kommune" />
          <Felt
            navn="lead_id"
            merke="Koppla till lead"
            val={[
              { verdi: "", tekst: "Ingen koppling" },
              ...(leads ?? []).map((l) => ({ verdi: l.id, tekst: l.bolag })),
            ]}
          />
          <Felt
            navn="plan"
            merke="Plan"
            standard="standard"
            val={Object.entries(PRIS).map(([v, p]) => ({
              verdi: v,
              tekst: p.mnd ? `${p.navn} — ${NOK(p.mnd)} kr/mån` : p.navn,
            }))}
          />
          <Felt navn="ar" merke="Löptid i år" type="number" standard="1" />
          <Felt navn="rabatt" merke="Rabatt i procent" type="number" standard="0" />
          <Felt navn="giltig_til" merke="Giltig till" type="date" />
          <Felt navn="status" merke="Status" val={STATUS} standard="utkast" />
        </Skjema>

        <Kort>
          <Tabell
            kolonner={["Kund", "Plan", "Löptid", "Rabatt", "Årsvärde", "Kontraktsvärde", "Giltig t.o.m.", "Status"]}
            tom="Inga offerter ännu."
            rader={rader.map((o) => [
              <span key="k" className="font-semibold whitespace-nowrap">{o.kund}</span>,
              <Merke key="p" tone={o.plan === "enterprise" ? "aksent" : "noytral"}>
                {o.planNavn}
              </Merke>,
              <span key="a" className="text-dim whitespace-nowrap">{o.ar} år</span>,
              <span key="r" className="tabular-nums text-dim">{o.rabatt} %</span>,
              <span key="v" className="tabular-nums whitespace-nowrap">{NOK(Math.round(o.arsvarde))}</span>,
              <span key="t" className="tabular-nums whitespace-nowrap font-semibold">{NOK(Math.round(o.totalt))}</span>,
              <span key="g" className="text-dim whitespace-nowrap">{o.giltig_til ?? "—"}</span>,
              <div key="s" className="flex items-center gap-2">
                <Merke tone={TONE[o.status] ?? "noytral"}>
                  {STATUS.find((s) => s.verdi === o.status)?.tekst ?? o.status}
                </Merke>
                <StatusVelger id={o.id} status={o.status} val={STATUS} handling={settOffertStatus} />
              </div>,
            ])}
          />
        </Kort>
      </div>
    </StaffShell>
  );
}
