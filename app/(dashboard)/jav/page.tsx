import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Sidehode, Kort, Tabell, Merke, Tall, Rad, type Tone } from "@/components/ui";

const KOBLING: Record<string, { tekst: string; tone: Tone }> = {
  styre: { tekst: "Styre", tone: "brudd" },
  daglig_leder: { tekst: "Daglig leder", tone: "brudd" },
  eier: { tekst: "Eier", tone: "brudd" },
  naer_relasjon: { tekst: "Nær relasjon", tone: "advarsel" },
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
  const { supabase } = await krevProfil();

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
  const alle = (treff ?? []).filter((t) => {
    const d = t.detaljer as Detaljer;
    const nokkel = `${t.leverandor_id}|${d?.person_navn}|${d?.deltaker_navn}`;
    if (sett.has(nokkel)) return false;
    sett.add(nokkel);
    return true;
  });

  const sikre = alle.filter((t) => (t.detaljer as Detaljer)?.eksakt);

  return (
    <DashboardShell aktivtSteg="Interessekonflikt">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Interessekonflikt"
          tekst="Styret og daglig leder hos leverandøren krysset mot dem dere har registrert som deltakere i anskaffelsen. Et treff er ikke en avgjørelse — inhabilitet etter forvaltningsloven § 6 må vurderes av en person."
        />

        <Rad>
          <Tall
            verdi={String(alle.length)}
            merke="mulige koblinger"
            tone={alle.length ? "brudd" : undefined}
          />
          <Tall verdi={String(sikre.length)} merke="med identisk navn" />
          <Tall
            verdi={String(alle.length - sikre.length)}
            merke="med liten skrivevariasjon"
          />
          <Tall
            verdi={String(antallDeltakere ?? 0)}
            merke="deltakere registrert"
            tone={antallDeltakere ? undefined : "advarsel"}
          />
        </Rad>

        {!antallDeltakere && (
          <div className="bg-warn-bg text-warn text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
            <b>Ingen prosjektdeltakere er registrert.</b> Uten dem finnes det
            ingenting å krysse styret mot, og kontrollen er ikke utført — ikke
            bestått.
          </div>
        )}

        <div className="bg-canvas text-dim text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed border border-border">
          Eiersiden er ikke kontrollert. Aksjonærregisteret publiseres av
          Skatteetaten som en årlig fil, ikke som oppslag, så eierskap kan ikke
          krysses automatisk ennå.
        </div>

        {error && (
          <div className="text-sm text-bad bg-bad-bg rounded-xl px-4 py-3 mb-4">
            Kunne ikke hente treff: {error.message}
          </div>
        )}

        <Kort>
          <Tabell
            kolonner={[
              "Leverandør",
              "Hos leverandøren",
              "Hos dere",
              "Kobling",
              "Sikkerhet",
              "Funnet",
            ]}
            tom="Ingen mulige interessekonflikter funnet."
            rader={alle.map((t) => {
              const d = t.detaljer as Detaljer;
              const lev = t.leverandorer as unknown as {
                navn: string;
                org_nr: string;
              } | null;
              const k = KOBLING[t.type_kobling] ?? {
                tekst: t.type_kobling,
                tone: "noytral" as Tone,
              };

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
                      f. {d.fodselsdato}
                    </div>
                  )}
                </div>,
                <div key="d">
                  <div className="font-semibold">{d?.deltaker_navn}</div>
                  <div className="text-xs text-dim">{d?.deltaker_rolle}</div>
                </div>,
                <Merke key="k" tone={k.tone}>
                  {k.tekst}
                </Merke>,
                d?.eksakt ? (
                  <Merke key="s" tone="brudd">
                    Identisk navn
                  </Merke>
                ) : (
                  <Merke key="s" tone="advarsel">
                    {d?.avvik} tegns avvik
                  </Merke>
                ),
                <span key="t" className="text-dim whitespace-nowrap">
                  {new Date(t.opprettet).toLocaleDateString("nb-NO")}
                </span>,
              ];
            })}
          />
        </Kort>
      </div>
    </DashboardShell>
  );
}
