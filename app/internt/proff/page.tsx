import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";

/**
 * Intern visning av hva Proff Credit API faktisk returnerer for et
 * organisasjonsnummer. Dokumentasjonen beskriver ikke feltene i rapportene, så
 * dette er for å se dem før vi bestemmer hva kunden skal få. Ikke lenket i
 * menyen, bare for ansatte. Ingenting lagres.
 */
async function hent(sti: string) {
  const nokkel = process.env.PROFF_CREDIT_TOKEN;
  if (!nokkel) return { status: "PROFF_CREDIT_TOKEN er ikke satt i miljøet." };
  try {
    const r = await fetch(`https://ppc.proff.no${sti}`, {
      headers: { Authorization: `Token ${nokkel}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (r.status === 204) return { status: "204 – ingen data hos Proff." };
    if (!r.ok) return { status: `Feil ${r.status}` };
    return { status: "200", data: await r.json() };
  } catch (e) {
    return { status: `Kunne ikke nå Proff: ${String(e).slice(0, 120)}` };
  }
}

export default async function ProffSide({ searchParams }: { searchParams: { org?: string } }) {
  await krevAnsatt();
  const org = (searchParams.org ?? "").replace(/\D/g, "");
  const gyldig = org.length === 9;

  const [kreditt, rapport] = gyldig
    ? await Promise.all([hent(`/CompanyCreditReport/${org}`), hent(`/CompanyReport/${org}`)])
    : [null, null];

  return (
    <StaffShell aktivtSteg="kreditt">
      <Side>
        <Sidehode
          tittel="Proff – rådata"
          tekst="Viser hva Proff Credit API returnerer for et organisasjonsnummer, så vi ser hvilke nøkkeltall som finnes. Ingenting lagres."
        />
        <form method="get" className="flex gap-3 mb-5 max-w-[460px]">
          <input name="org" defaultValue={org} placeholder="Organisasjonsnummer (9 siffer)" className={FELT_FULL} inputMode="numeric" />
          <button className="bg-accent text-white text-sm font-semibold px-4 rounded-xl">Hent</button>
        </form>

        {org && !gyldig && <p className="text-sm text-bad">Skriv ni siffer.</p>}

        {[["Kredittrapport (CompanyCreditReport)", kreditt], ["Selskapsrapport (CompanyReport)", rapport]].map(([tittel, r]) =>
          r ? (
            <Kort key={String(tittel)} tittel={String(tittel)} className="mb-4">
              <div className="px-5 py-4">
                <p className="text-[12.5px] text-dim mb-2">{(r as { status: string }).status}</p>
                {"data" in (r as object) && (
                  <pre className="text-[11.5px] leading-relaxed overflow-auto max-h-[560px] bg-canvas rounded-xl p-4">
                    {JSON.stringify((r as { data: unknown }).data, null, 2)}
                  </pre>
                )}
              </div>
            </Kort>
          ) : null,
        )}
      </Side>
    </StaffShell>
  );
}
