import { krevSuperadmin } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort } from "@/components/ui";
import { listKampanjekoder, stripeOppsatt, stripeModus } from "@/lib/stripe";
import { Merke } from "@/components/ui";
import { RabattSkjema, SlaAv, Aktiv } from "@/components/internt/Rabatt";

/**
 * Rabattkoder, laget i Stripe herfra. Bare superadmin — en rabatt er en margin.
 * Kodene lever i Stripe: hos oss ligger ingenting, og webhooken bryr seg ikke
 * om hva beløpet ble.
 */
export default async function RabattSide() {
  await krevSuperadmin();
  const lista = stripeOppsatt() ? await listKampanjekoder() : null;

  return (
    <StaffShell aktivtSteg="rabatt">
      <Side>
        <Sidehode
          tittel="Rabattkoder"
          tekst="Lag koder som kunden skriver inn på betalingssiden. Virker på kortbetaling; kommuner får rabatten som lavere pris på tilbudet."
        />

        <div className="mb-4 flex items-center gap-2 text-[12.5px] text-dim">
          Stripe:
          {stripeModus() === "live" ? (
            <Merke tone="god">Live – ekte betalinger</Merke>
          ) : stripeModus() === "test" ? (
            <Merke tone="advarsel">Testmodus – ingen ekte betalinger. Kodene her virker bare i testmodus.</Merke>
          ) : (
            <Merke tone="noytral">Ikke koblet</Merke>
          )}
        </div>

        <Kort tittel="Ny kode" className="mb-4">
          <div className="px-5 py-5">
            <RabattSkjema />
          </div>
        </Kort>

        <Kort tittel="Koder">
          {!lista ? (
            <p className="px-5 py-5 text-[12.5px] text-dim">Stripe er ikke koblet til (STRIPE_SECRET_KEY mangler).</p>
          ) : !lista.ok ? (
            <p className="px-5 py-5 text-[12.5px] text-bad">{lista.feil}</p>
          ) : lista.koder.length === 0 ? (
            <p className="px-5 py-5 text-[12.5px] text-dim">Ingen koder ennå.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-left text-faint">
                    <th className="px-5 py-2.5 font-semibold">Kode</th>
                    <th className="px-3 py-2.5 font-semibold">Rabatt</th>
                    <th className="px-3 py-2.5 font-semibold">Gjelder</th>
                    <th className="px-3 py-2.5 font-semibold">Brukt</th>
                    <th className="px-3 py-2.5 font-semibold">Utløper</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lista.koder.map((k) => (
                    <tr key={k.id}>
                      <td className="px-5 py-2.5 font-mono font-semibold">{k.code}</td>
                      <td className="px-3 py-2.5">{k.rabatt}</td>
                      <td className="px-3 py-2.5 text-dim">{k.varighet}</td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {k.times_redeemed}
                        {k.max_redemptions ? ` / ${k.max_redemptions}` : ""}
                      </td>
                      <td className="px-3 py-2.5 text-dim">
                        {k.expires_at ? new Date(k.expires_at * 1000).toLocaleDateString("nb-NO") : "—"}
                      </td>
                      <td className="px-3 py-2.5"><Aktiv aktiv={k.active} /></td>
                      <td className="px-5 py-2.5 text-right">{k.active && <SlaAv id={k.id} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Kort>
      </Side>
    </StaffShell>
  );
}
