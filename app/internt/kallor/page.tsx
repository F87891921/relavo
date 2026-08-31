import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Sidehode, Kort, Tabell, Merke, Tall, Rad } from "@/components/ui";
import { KALLOR, LARM, NYCKLAR } from "@/lib/demo/staff";

export default async function InterntKallorSide() {
  await krevAnsatt();

  const aktivaLarm = LARM.filter((l) => l.status === "aktivt");

  return (
    <StaffShell aktivtSteg="Källhälsa">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Källhälsa"
          tekst="Svarstider, felfrekvens och kostnad per register. Ligger en källa nere ska kundens rapport säga det, inte tiga om det."
        />

        <Rad>
          <Tall verdi={String(KALLOR.length)} merke="källor" />
          <Tall
            verdi={String(KALLOR.reduce((s, k) => s + k.anrop, 0))}
            merke="anrop denna månad"
          />
          <Tall
            verdi={`${Math.round(KALLOR.reduce((s, k) => s + k.svar, 0) / KALLOR.length)} ms`}
            merke="median svarstid"
          />
          <Tall
            verdi={String(aktivaLarm.length)}
            merke="aktiva larm"
            tone={aktivaLarm.length ? "brudd" : undefined}
          />
        </Rad>

        {aktivaLarm.length > 0 && (
          <Kort tittel="Aktiva larm" className="mb-5">
            <Tabell
              kolonner={["Källa", "Regel", "Sedan", "Åtgärd"]}
              rader={aktivaLarm.map((l) => [
                <span key="k" className="font-semibold">{l.kalla}</span>,
                <span key="r" className="text-dim">{l.regel}</span>,
                <Merke key="s" tone="brudd">{l.sedan}</Merke>,
                <span key="a" className="text-dim">{l.atgard}</span>,
              ])}
            />
          </Kort>
        )}

        <Kort tittel="Källor" className="mb-5">
          <Tabell
            kolonner={["Källa", "Vad den ger", "Anrop", "Fel", "Svarstid", "Kostnad/st", "Status"]}
            rader={KALLOR.map((k) => [
              <span key="n" className="font-semibold">{k.n}</span>,
              <span key="d" className="text-dim">{k.d}</span>,
              <span key="a" className="tabular-nums">{k.anrop}</span>,
              <span key="f" className={`tabular-nums ${k.fel > 1 ? "text-bad font-semibold" : "text-dim"}`}>
                {k.fel} %
              </span>,
              <span key="s" className="tabular-nums">{k.svar} ms</span>,
              <span key="ko" className="tabular-nums text-dim">
                {k.kostnad === 0 ? "gratis" : `${k.kostnad} kr`}
              </span>,
              <Merke key="st" tone={k.status === "ok" ? "god" : "advarsel"}>
                {k.status === "ok" ? "Frisk" : k.status}
              </Merke>,
            ])}
          />
        </Kort>

        <Kort tittel="Nycklar och kvoter">
          <Tabell
            kolonner={["Källa", "Nyckel", "Kvot", "Använt", "Kostnad/st", "Roterad"]}
            rader={NYCKLAR.map((n) => [
              <span key="k" className="font-semibold">{n.kalla}</span>,
              <span key="n" className="font-mono text-[11.5px] text-dim">{n.nyckel}</span>,
              <span key="kv" className="text-dim">{n.kvot}</span>,
              <span key="a" className="tabular-nums">{n.anvant}</span>,
              <span key="s" className="tabular-nums text-dim">
                {n.styck === 0 ? "gratis" : `${n.styck} kr`}
              </span>,
              <span key="r" className="text-faint whitespace-nowrap">{n.roterad}</span>,
            ])}
          />
        </Kort>
      </div>
    </StaffShell>
  );
}
