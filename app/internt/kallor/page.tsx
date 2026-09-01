import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad } from "@/components/ui";
import { KALLOR, LARM, NYCKLAR } from "@/lib/demo/staff";
import { SynkRenhold } from "@/components/internt/SynkRenhold";

export default async function InterntKallorSide() {
  const { supabase, t } = await krevAnsatt();

  const { data: synk } = await supabase
    .from("registersynk")
    .select("sist_hentet, antall")
    .eq("register", "renhold")
    .maybeSingle();

  const aktivaLarm = LARM.filter((l) => l.status === "aktivt");

  return (
    <StaffShell aktivtSteg="kallor">
      <Side>
        <Sidehode
          tittel={t.ansattsider.kallor.tittel}
          tekst={t.ansattsider.kallor.tekst}
        />

        <SynkRenhold
          sistHentet={synk?.sist_hentet ?? null}
          antall={synk?.antall ?? 0}
        />

        <Rad>
          <Tall verdi={String(KALLOR.length)} merke="källor" />
          <Tall
            verdi={String(KALLOR.reduce((s, k) => s + k.anrop, 0))}
            merke={t.internt.anropDenneManeden}
          />
          <Tall
            verdi={`${Math.round(KALLOR.reduce((s, k) => s + k.svar, 0) / KALLOR.length)} ms`}
            merke={t.internt.medianSvartid}
          />
          <Tall
            verdi={String(aktivaLarm.length)}
            merke={t.internt.aktiveAlarmer}
            tone={aktivaLarm.length ? "brudd" : undefined}
          />
        </Rad>

        {aktivaLarm.length > 0 && (
          <Kort tittel={t.internt.aktivaLarm} className="mb-5">
            <Tabell
              kolonner={[t.internt.kilde, t.internt.regel, t.internt.siden, t.internt.tiltak]}
              rader={aktivaLarm.map((l) => [
                <span key="k" className="font-semibold">{l.kalla}</span>,
                <span key="r" className="text-dim">{l.regel}</span>,
                <Merke key="s" tone="brudd">{l.sedan}</Merke>,
                <span key="a" className="text-dim">{l.atgard}</span>,
              ])}
            />
          </Kort>
        )}

        <Kort tittel={t.internt.kilder} className="mb-5">
          <Tabell
            kolonner={[t.internt.kilde, t.internt.hvaDenGir, t.internt.anrop, "Fel", t.internt.svartid, t.internt.kostnadPerStk, t.internt.statusKol]}
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
                {k.status === "ok" ? t.internt.frisk : k.status}
              </Merke>,
            ])}
          />
        </Kort>

        <Kort tittel={t.internt.nokler}>
          <Tabell
            kolonner={[t.internt.kilde, t.internt.nokkel, "Kvot", t.internt.brukt, t.internt.kostnadPerStk, t.internt.rotert]}
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
      </Side>
    </StaffShell>
  );
}
