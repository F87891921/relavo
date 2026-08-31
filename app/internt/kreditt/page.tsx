import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Merke, Tall, Rad, type Tone } from "@/components/ui";
import { Kredittsjekk } from "@/components/internt/Kredittsjekk";
import { formaterOrgnr } from "@/lib/orgnr";

const TONE: Record<string, Tone> = { lav: "god", middels: "advarsel", hoy: "brudd" };
const TEKST: Record<string, string> = { lav: "Låg risk", middels: "Medelrisk", hoy: "Hög risk" };

const PUNKT_TONE: Record<string, Tone> = {
  ok: "god",
  advarsel: "advarsel",
  brudd: "brudd",
  ukjent: "noytral",
};

type Punkt = { punkt: string; status: string; tekst: string };

export default async function InterntKredittSide() {
  const { supabase } = await krevAnsatt();

  const { data: sjekker } = await supabase
    .from("kredittsjekker")
    .select("id, org_nr, navn, vurdering, begrunnelse, utfort")
    .order("utfort", { ascending: false })
    .limit(25);

  const alle = sjekker ?? [];

  return (
    <StaffShell aktivtSteg="Kreditkontroll">
      <Side>
        <Sidehode
          tittel="Kreditkontroll"
          tekst="Kontroll av kunder och blivande kunder innan vi fakturerar. Varje körning sparas oförändrad med tidpunkt, så den kan hämtas fram i efterhand."
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke="kontroller körda" />
          <Tall
            verdi={String(alle.filter((s) => s.vurdering === "hoy").length)}
            merke="med hög risk"
            tone={alle.some((s) => s.vurdering === "hoy") ? "brudd" : undefined}
          />
          <Tall
            verdi={String(alle.filter((s) => s.vurdering === "middels").length)}
            merke="med medelrisk"
          />
          <Tall verdi="2 av 4" merke="register påkopplade" />
        </Rad>

        <Kredittsjekk />

        <div className="space-y-4">
          {alle.length === 0 && (
            <Kort>
              <div className="px-5 py-10 text-center text-dim text-sm">
                Inga kontroller körda ännu. Skriv ett organisationsnummer ovan.
              </div>
            </Kort>
          )}

          {alle.map((s) => (
            <Kort
              key={s.id}
              tittel={s.navn}
              note={`${formaterOrgnr(s.org_nr)} · ${new Date(s.utfort).toLocaleString("sv-SE")}`}
            >
              <div className="px-5 py-4">
                <div className="mb-4">
                  <Merke tone={TONE[s.vurdering] ?? "noytral"}>
                    {TEKST[s.vurdering] ?? s.vurdering}
                  </Merke>
                </div>
                <dl className="divide-y divide-border">
                  {(s.begrunnelse as Punkt[]).map((p, i) => (
                    <div key={i} className="flex gap-4 py-2.5 items-baseline">
                      <dt className="text-[12.5px] font-semibold w-44 shrink-0">
                        {p.punkt}
                      </dt>
                      <dd className="text-[12.5px] text-dim flex-1">{p.tekst}</dd>
                      <Merke tone={PUNKT_TONE[p.status] ?? "noytral"}>
                        {p.status === "ok"
                          ? "OK"
                          : p.status === "advarsel"
                            ? "Varning"
                            : p.status === "brudd"
                              ? "Allvarligt"
                              : "Ej kontrollerad"}
                      </Merke>
                    </div>
                  ))}
                </dl>
              </div>
            </Kort>
          ))}
        </div>
      </Side>
    </StaffShell>
  );
}
