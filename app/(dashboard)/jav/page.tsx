import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, type Tone } from "@/components/ui";

const KOBLINGSTONE: Record<string, Tone> = {
  styre: "brudd",
  daglig_leder: "brudd",
  eier: "brudd",
  naer_relasjon: "advarsel",
};

type Detaljer = {
  deltaker_navn: string;
  deltaker_rolle: string;
  person_navn: string;
  person_rolle: string;
  fodselsdato: string | null;
  eksakt: boolean;
  avvik: number;
};

export default async function JavSide() {
  const { supabase, t } = await krevProfil();

  const [{ data: treff, error }, { count: antallDeltakere }] = await Promise.all([
    supabase
      .from("jav_treff")
      .select("id, leverandor_id, type_kobling, detaljer, opprettet, leverandorer(navn, org_nr)")
      .order("opprettet", { ascending: false }),
    supabase
      .from("prosjektdeltakere")
      .select("id", { count: "exact", head: true }),
  ]);

  // Hver kontrollkjøring legger igjen sine egne treff, så samme par dukker
  // opp på nytt for hver kjøring. Som spor er det riktig — men på en
  // oversikt ser gjentakelsen ut som en feil. Her vises siste treff per par.
  const sett = new Set<string>();
  const alle = (treff ?? []).filter((rad) => {
    const d = rad.detaljer as Detaljer;
    const nokkel = `${rad.leverandor_id}|${d?.person_navn}|${d?.deltaker_navn}`;
    if (sett.has(nokkel)) return false;
    sett.add(nokkel);
    return true;
  });

  const sikre = alle.filter((t) => (t.detaljer as Detaljer)?.eksakt);

  return (
    <DashboardShell aktivtSteg="jav">
      <Side>
        <Sidehode
          tittel={t.sider.jav.tittel}
          tekst={t.sider.jav.tekst}
        />

        <Rad>
          <Tall
            verdi={String(alle.length)}
            merke={t.jav.muligeKoblinger}
            tone={alle.length ? "brudd" : undefined}
          />
          <Tall verdi={String(sikre.length)} merke={t.jav.identiskNavn} />
          <Tall
            verdi={String(alle.length - sikre.length)}
            merke={t.jav.skrivevariasjon}
          />
          <Tall
            verdi={String(antallDeltakere ?? 0)}
            merke={t.jav.deltakere}
            tone={antallDeltakere ? undefined : "advarsel"}
          />
        </Rad>

        {!antallDeltakere && (
          <div className="bg-warn-bg text-warn text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
            <b>{t.jav.ingenDeltakere}</b> {t.jav.utenDeltakere}
          </div>
        )}

        <div className="bg-canvas text-dim text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed border border-border">
          {t.jav.eiersiden}
        </div>

        {error && (
          <div className="text-sm text-bad bg-bad-bg rounded-xl px-4 py-3 mb-4">
            {t.jav.kunneIkkeHente} {error.message}
          </div>
        )}

        <Kort>
          <Tabell
            kolonner={[
              t.ui.leverandor,
              t.jav.hosLeverandoren,
              t.jav.hosDere,
              t.jav.kobling,
              t.jav.sikkerhet,
              t.jav.funnet,
            ]}
            tom={t.jav.ingenFunnet}
            rader={alle.map((treff) => {
              const d = treff.detaljer as Detaljer;
              const lev = treff.leverandorer as unknown as {
                navn: string;
                org_nr: string;
              } | null;
              const koblingstekst: string =
                (
                  {
                    styre: t.jav.styre,
                    daglig_leder: t.jav.dagligLeder,
                    eier: t.jav.eier,
                    naer_relasjon: t.jav.naerRelasjon,
                  } as Record<string, string>
                )[treff.type_kobling] ?? treff.type_kobling;

              return [
                <div key="l">
                  <div className="font-semibold">{lev?.navn ?? "—"}</div>
                  <div className="text-xs text-faint font-mono">
                    {lev?.org_nr ?? ""}
                  </div>
                </div>,
                <div key="p">
                  <div className="font-semibold">{d?.person_navn}</div>
                  <div className="text-xs text-dim">{d?.person_rolle}</div>
                  {d?.fodselsdato && (
                    <div className="text-xs text-faint font-mono">
                      {t.jav.fodt} {d.fodselsdato}
                    </div>
                  )}
                </div>,
                <div key="d">
                  <div className="font-semibold">{d?.deltaker_navn}</div>
                  <div className="text-xs text-dim">{d?.deltaker_rolle}</div>
                </div>,
                <Merke key="k" tone={KOBLINGSTONE[treff.type_kobling] ?? "noytral"}>
                  {koblingstekst}
                </Merke>,
                d?.eksakt ? (
                  <Merke key="s" tone="brudd">
                    {t.jav.identiskNavnMerke}
                  </Merke>
                ) : (
                  <Merke key="s" tone="advarsel">
                    {d?.avvik} {t.jav.tegnsAvvik}
                  </Merke>
                ),
                <span key="t" className="text-dim whitespace-nowrap">
                  {new Date(treff.opprettet).toLocaleDateString("nb-NO")}
                </span>,
              ];
            })}
          />
        </Kort>
      </Side>
    </DashboardShell>
  );
}
