import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import Link from "next/link";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK } from "@/components/ui";
import { StatusMerke } from "@/components/ui/StatusMerke";
import { PRIS, OFFERTSTATUS, regnUt } from "@/lib/offert";
import { OffertSkjema } from "@/components/internt/OffertSkjema";
import { KundeSok } from "@/components/internt/KundeSok";
import { settOffertStatus } from "@/app/internt/handlinger";
import { formaterOrgnr } from "@/lib/orgnr";

export default async function InterntOfferterSide() {
  const { supabase, t } = await krevAnsatt();

  const [{ data: offerter }, { data: leads }] = await Promise.all([
    supabase
      .from("offerter")
      .select(
        "id, kund, org_nr, kontaktperson, kontakt_epost, plan, ar, rabatt, giltig_til, status, fritt_antall, fritt_pris, notat, opprettet, sendt, sett, svar",
      )
      .order("opprettet", { ascending: false }),
    supabase
      .from("leads")
      .select("id, bolag")
      .not("status", "in", '("vunnen","forlorad")')
      .order("bolag"),
  ]);

  const rader = (offerter ?? []).map((o) => ({ ...o, ...regnUt(o) }));

  return (
    <StaffShell aktivtSteg="offerter">
      <Side>
        <Sidehode
          tittel={t.ansattsider.offerter.tittel}
          tekst={t.ansattsider.offerter.tekst}
        />

        <Rad>
          <Tall verdi={String(rader.length)} merke="offerter" />
          <Tall
            verdi={String(rader.filter((o) => o.status === "skickad").length)}
            merke={t.internt.venterPaSvar}
          />
          <Tall
            verdi={`${NOK(Math.round(rader.reduce((s, r) => s + r.totalt, 0)))} kr`}
            merke={t.internt.samletVerdi}
          />
          <Tall
            verdi={String(rader.filter((o) => o.sendt && !o.svar).length)}
            merke={t.internt.sendtUtenSvar}
          />
        </Rad>

        <OffertSkjema leads={leads ?? []} KundeSok={KundeSok} />

        <Kort>
          <Tabell
            kolonner={[t.internt.kunde, t.internt.opplegg, t.internt.lopetid, t.internt.verdi, t.internt.gyldigTom, t.internt.statusKol, ""]}
            tom={t.internt.ingenTilbud}
            rader={rader.map((o) => [
              <div key="k">
                <Link
                  href={`/internt/offerter/${o.id}`}
                  className="font-semibold whitespace-nowrap hover:text-accent transition"
                >
                  {o.kund}
                </Link>
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
              <div key="s" className="flex flex-col items-start gap-1.5">
                <StatusMerke
                  id={o.id}
                  verdi={o.status}
                  val={OFFERTSTATUS}
                  handling={settOffertStatus}
                />
                {o.sendt && !o.svar && (
                  <span className="text-[11px] text-faint whitespace-nowrap">
                    {o.sett ? t.internt.apnetAvKunden : t.internt.ikkeApnet}
                  </span>
                )}
              </div>,
              <Link
                key="v"
                href={`/internt/offerter/${o.id}`}
                className="text-[12.5px] font-semibold text-accent hover:underline whitespace-nowrap"
              >
                {t.internt.visLenke}
              </Link>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
