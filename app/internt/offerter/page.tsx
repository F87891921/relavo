import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK, type Tone } from "@/components/ui";
import { StatusVelger } from "@/components/internt/Skjema";
import { OffertSkjema } from "@/components/internt/OffertSkjema";
import { KundeSok } from "@/components/internt/KundeSok";
import { settOffertStatus } from "@/app/internt/handlinger";
import { formaterOrgnr } from "@/lib/orgnr";

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

  const [{ data: offerter }, { data: leads }] = await Promise.all([
    supabase
      .from("offerter")
      .select(
        "id, kund, org_nr, kontaktperson, kontakt_epost, plan, ar, rabatt, giltig_til, status, fritt_antall, fritt_pris, notat, opprettet",
      )
      .order("opprettet", { ascending: false }),
    supabase
      .from("leads")
      .select("id, bolag")
      .not("status", "in", '("vunnen","forlorad")')
      .order("bolag"),
  ]);

  const rader = (offerter ?? []).map((o) => {
    const fritt = o.fritt_antall && o.fritt_pris;
    const p = PRIS[o.plan] ?? { navn: o.plan, mnd: 0 };
    const arsvarde = fritt ? o.fritt_pris! : p.mnd * 12 * (1 - o.rabatt / 100);
    return {
      ...o,
      fritt,
      planNavn: fritt ? "Fritt erbjudande" : p.navn,
      arsvarde,
      totalt: fritt ? o.fritt_pris! : arsvarde * o.ar,
    };
  });

  return (
    <StaffShell aktivtSteg="Offerter">
      <Side>
        <Sidehode
          tittel="Offerter"
          tekst="Skickade offerter, vad de är värda och när de går ut. Sök på kundens namn så fylls organisationsnummer och kontaktuppgifter i automatiskt."
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
            verdi={String(rader.filter((o) => o.fritt).length)}
            merke="fria erbjudanden"
          />
        </Rad>

        <OffertSkjema leads={leads ?? []} KundeSok={KundeSok} />

        <Kort>
          <Tabell
            kolonner={["Kund", "Upplägg", "Löptid", "Värde", "Giltig t.o.m.", "Status"]}
            tom="Inga offerter ännu."
            rader={rader.map((o) => [
              <div key="k">
                <div className="font-semibold whitespace-nowrap">{o.kund}</div>
                {o.org_nr && (
                  <div className="text-[11.5px] text-faint font-mono">
                    {formaterOrgnr(o.org_nr)}
                  </div>
                )}
                {o.kontaktperson && (
                  <div className="text-[11.5px] text-faint">{o.kontaktperson}</div>
                )}
              </div>,
              <div key="p">
                <Merke tone={o.fritt ? "advarsel" : o.plan === "enterprise" ? "aksent" : "noytral"}>
                  {o.planNavn}
                </Merke>
                {o.fritt && (
                  <div className="text-[11.5px] text-dim mt-1">
                    {o.fritt_antall} kontroller
                  </div>
                )}
                {!o.fritt && o.rabatt > 0 && (
                  <div className="text-[11.5px] text-dim mt-1">−{o.rabatt} %</div>
                )}
              </div>,
              <span key="a" className="text-dim whitespace-nowrap">
                {o.fritt ? "—" : `${o.ar} år`}
              </span>,
              <span key="t" className="tabular-nums whitespace-nowrap font-semibold">
                {NOK(Math.round(o.totalt))}
              </span>,
              <span key="g" className="text-dim whitespace-nowrap">
                {o.giltig_til ?? "—"}
              </span>,
              <div key="s" className="flex items-center gap-2">
                <Merke tone={TONE[o.status] ?? "noytral"}>
                  {STATUS.find((s) => s.verdi === o.status)?.tekst ?? o.status}
                </Merke>
                <StatusVelger
                  id={o.id}
                  status={o.status}
                  val={STATUS}
                  handling={settOffertStatus}
                />
              </div>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
