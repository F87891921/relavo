import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Tall, Rad, NOK } from "@/components/ui";
import { StatusMerke, type StatusVal } from "@/components/ui/StatusMerke";
import { Skjema, Felt } from "@/components/internt/Skjema";
import { KundeSok } from "@/components/internt/KundeSok";
import { nyFaktura, settFakturaStatus } from "@/app/internt/handlinger";

const STATUS: StatusVal[] = [
  { verdi: "obetald", tekst: "Obetald", tone: "advarsel" },
  { verdi: "betald", tekst: "Betald", tone: "god" },
  { verdi: "forfallen", tekst: "Förfallen", tone: "brudd" },
  { verdi: "kreditnota", tekst: "Kreditnota", tone: "noytral" },
];

export default async function InterntFaktureringSide() {
  const { supabase } = await krevAnsatt();

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
    <StaffShell aktivtSteg="Fakturering">
      <Side>
        <Sidehode
          tittel="Fakturering"
          tekst="Fakturor per konto, med förfallodatum och status. Fakturanumret sätts automatiskt som löpnummer per år."
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke="fakturor" />
          <Tall
            verdi={`${NOK(utestaende.reduce((s, f) => s + f.belopp, 0))} kr`}
            merke="utestående"
          />
          <Tall
            verdi={String(forfallna.length)}
            merke="förfallna"
            tone={forfallna.length ? "brudd" : undefined}
          />
          <Tall
            verdi={`${NOK(alle.filter((f) => f.status === "betald").reduce((s, f) => s + f.belopp, 0))} kr`}
            merke="betalt"
          />
        </Rad>

        <Skjema knapp="+ Ny faktura" tittel="Ny faktura" handling={nyFaktura}>
          <KundeSok navn="kunde_navn" merke="Kund" />
          <Felt navn="org_nr" merke="Organisationsnummer" plassholder="964 338 531" />
          <Felt navn="fakturaadresse" merke="Fakturaadress" plassholder="Postboks 7700, 5020 Bergen" />
          <Felt navn="referanse" merke="Er referens" plassholder="K-2026-118" />
          <Felt
            navn="organisasjon_id"
            merke="Koppla till konto"
            val={[
              { verdi: "", tekst: "Inget konto" },
              ...(organisasjoner ?? []).map((o) => ({ verdi: o.id, tekst: o.navn })),
            ]}
          />
          <Felt navn="belopp" merke="Belopp i kr" krav type="number" plassholder="12900" />
          <Felt navn="forfall" merke="Förfaller" krav type="date" />
          <Felt navn="status" merke="Status" val={STATUS} standard="obetald" />
        </Skjema>

        <Kort>
          <Tabell
            kolonner={["Fakturanr", "Kund", "Belopp", "Förfaller", "Status"]}
            tom="Inga fakturor ännu."
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
