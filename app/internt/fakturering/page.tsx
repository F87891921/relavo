import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK, type Tone } from "@/components/ui";
import { Skjema, Felt, StatusVelger } from "@/components/internt/Skjema";
import { nyFaktura, settFakturaStatus } from "@/app/internt/handlinger";

const STATUS = [
  { verdi: "obetald", tekst: "Obetald" },
  { verdi: "betald", tekst: "Betald" },
  { verdi: "forfallen", tekst: "Förfallen" },
  { verdi: "kreditnota", tekst: "Kreditnota" },
];

const TONE: Record<string, Tone> = {
  obetald: "advarsel",
  betald: "god",
  forfallen: "brudd",
  kreditnota: "noytral",
};

export default async function InterntFaktureringSide() {
  const { supabase } = await krevAnsatt();

  const { data: fakturaer } = await supabase
    .from("fakturaer")
    .select("id, nummer, kunde_navn, belopp, forfall, status, organisasjon_id")
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
          <Felt navn="kunde_navn" merke="Kund" krav plassholder="Bergen kommune" />
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
              <span key="k" className="font-semibold whitespace-nowrap">{f.kunde_navn}</span>,
              <span key="b" className="tabular-nums whitespace-nowrap">{NOK(f.belopp)} kr</span>,
              <span
                key="f"
                className={`whitespace-nowrap ${f.status === "forfallen" ? "text-bad font-semibold" : "text-dim"}`}
              >
                {f.forfall}
              </span>,
              <div key="s" className="flex items-center gap-2">
                <Merke tone={TONE[f.status] ?? "noytral"}>
                  {STATUS.find((s) => s.verdi === f.status)?.tekst ?? f.status}
                </Merke>
                <StatusVelger id={f.id} status={f.status} val={STATUS} handling={settFakturaStatus} />
              </div>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
