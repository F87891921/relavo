import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import type { Ordbok } from "@/lib/sprak";
import { Side, Sidehode, Kort, Tabell, Tall, Rad, NOK } from "@/components/ui";
import { StatusMerke, type StatusVal } from "@/components/ui/StatusMerke";
import { Skjema, Felt } from "@/components/internt/Skjema";
import { KundeSok } from "@/components/internt/KundeSok";
import { nyFaktura, settFakturaStatus } from "@/app/internt/handlinger";

const statusValg = (t: Ordbok): StatusVal[] => [
  { verdi: "obetald", tekst: t.internt.obetald, tone: "advarsel" },
  { verdi: "betald", tekst: t.internt.betald, tone: "god" },
  { verdi: "forfallen", tekst: t.internt.forfallenStatus, tone: "brudd" },
  { verdi: "kreditnota", tekst: t.internt.kreditnota, tone: "noytral" },
];

export default async function InterntFaktureringSide() {
  const { supabase, t } = await krevAnsatt();
  const STATUS = statusValg(t);

  const { data: fakturaer } = await supabase
    .from("fakturaer")
    .select("id, nummer, kunde_navn, org_nr, referanse, belopp, forfall, status, organisasjon_id")
    .order("forfall", { ascending: false });

  const { data: organisasjoner } = await supabase
    .from("organisasjoner")
    .select("id, navn")
    .order("navn");

  const alle = fakturaer ?? [];
  const utestaende = alle.filter(
    (f) => f.status === "obetald" || f.status === "forfallen",
  );
  const forfallna = alle.filter((f) => f.status === "forfallen");

  return (
    <StaffShell aktivtSteg="fakturering">
      <Side>
        <Sidehode
          tittel={t.ansattsider.fakturering.tittel}
          tekst={t.ansattsider.fakturering.tekst}
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke={t.internt.fakturor} />
          <Tall
            verdi={`${NOK(utestaende.reduce((s, f) => s + f.belopp, 0))} kr`}
            merke={t.internt.utestaende}
          />
          <Tall
            verdi={String(forfallna.length)}
            merke={t.internt.forfalne}
            tone={forfallna.length ? "brudd" : undefined}
          />
          <Tall
            verdi={`${NOK(alle.filter((f) => f.status === "betald").reduce((s, f) => s + f.belopp, 0))} kr`}
            merke={t.internt.betalt}
          />
        </Rad>

        <Skjema knapp={`+ ${t.internt.nyFaktura}`} tittel={t.internt.nyFaktura} handling={nyFaktura}>
          <KundeSok navn="kunde_navn" merke={t.internt.kunde} />
          <Felt navn="org_nr" merke={t.internt.organisasjonsnummer} plassholder="964 338 531" />
          <Felt navn="fakturaadresse" merke={t.internt.fakturaadresse} plassholder="Postboks 7700, 5020 Bergen" />
          <Felt navn="referanse" merke={t.internt.deresReferanse} plassholder="K-2026-118" />
          <Felt
            navn="organisasjon_id"
            merke={t.internt.koblTilKonto}
            val={[
              { verdi: "", tekst: t.internt.ingenKonto },
              ...(organisasjoner ?? []).map((o) => ({ verdi: o.id, tekst: o.navn })),
            ]}
          />
          <Felt navn="belopp" merke={t.internt.belopIKr} krav type="number" plassholder="12900" />
          <Felt navn="forfall" merke={t.internt.forfallsdato} krav type="date" />
          <Felt navn="status" merke={t.internt.statusKol} val={STATUS} standard="obetald" />
        </Skjema>

        <Kort>
          <Tabell
            kolonner={[t.internt.fakturanr, t.internt.kunde, t.internt.belop, t.internt.forfallsdato, t.internt.statusKol]}
            tom={t.internt.ingenFakturaer}
            rader={alle.map((f) => [
              <span key="n" className="font-mono text-[12px] text-accent">{f.nummer}</span>,
              <div key="k">
                <div className="font-semibold whitespace-nowrap">{f.kunde_navn}</div>
                {f.org_nr && (
                  <div className="text-[11.5px] text-faint font-mono">{f.org_nr}</div>
                )}
                {f.referanse && (
                  <div className="text-[11.5px] text-faint">Ref: {f.referanse}</div>
                )}
              </div>,
              <span key="b" className="tabular-nums whitespace-nowrap">{NOK(f.belopp)} kr</span>,
              <span
                key="f"
                className={`whitespace-nowrap ${f.status === "forfallen" ? "text-bad font-semibold" : "text-dim"}`}
              >
                {f.forfall}
              </span>,
              <StatusMerke
                key="s"
                id={f.id}
                verdi={f.status}
                val={STATUS}
                handling={settFakturaStatus}
              />,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
