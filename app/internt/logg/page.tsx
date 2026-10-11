import { krevSuperadmin } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke } from "@/components/ui";

const initialer = (navn: string) =>
  navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((d) => d[0]?.toUpperCase() ?? "")
    .join("");

export default async function InterntLoggSide() {
  const { supabase, t } = await krevSuperadmin();

  const { data: rader } = await supabase
    .from("tilgangslogg")
    .select("id, utfort_av_navn, organisasjon_navn, handling, begrunnelse, opprettet")
    .order("opprettet", { ascending: false })
    .limit(200);

  return (
    <StaffShell aktivtSteg="logg">
      <Side>
        <Sidehode
          tittel={t.ansattsider.logg.tittel}
          tekst={t.ansattsider.logg.tekst}
        />

        <div className="bg-surface2 text-accent text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed max-w-[76ch]">
          {t.internt.loggForklaring}
        </div>

        <Kort>
          <Tabell
            kolonner={[
              t.internt.hvem,
              t.internt.konto,
              t.internt.vad,
              t.internt.begrunnelse,
              t.internt.tid,
            ]}
            tom={t.internt.ingenLogg}
            rader={(rader ?? []).map((l) => [
              <div key="v" className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-surface2 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">
                  {initialer(l.utfort_av_navn)}
                </span>
                <span className="font-semibold whitespace-nowrap">
                  {l.utfort_av_navn}
                </span>
              </div>,
              <Merke key="k" tone="aksent">{l.organisasjon_navn}</Merke>,
              <span key="h" className="whitespace-nowrap">{l.handling}</span>,
              <span key="b" className="text-dim">{l.begrunnelse}</span>,
              <span key="t" className="text-faint whitespace-nowrap">
                {new Date(l.opprettet).toLocaleString("nb-NO", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </span>,
            ])}
          />
        </Kort>

        {/* Det som ikke står her er like viktig som det som gjør. */}
        <p className="text-[12px] text-faint mt-4 max-w-[76ch] leading-relaxed">
          {t.internt.loggOmfang}
        </p>
      </Side>
    </StaffShell>
  );
}
