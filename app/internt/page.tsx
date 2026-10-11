import Link from "next/link";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, NOK } from "@/components/ui";
import { hentKonton, mrr } from "@/lib/konton";
import { planFor } from "@/lib/plan";

const STATUSTONE: Record<string, "god" | "advarsel" | "brudd" | "noytral"> = {
  aktiv: "god",
  venter_kreditt: "advarsel",
  venter_betaling: "advarsel",
  avslatt: "brudd",
  stengt: "brudd",
};

/** «för 12 min sedan» — relativt, fordi det er det som sier om noe lever. */
function sedan(nar: string | null, t: { minuter: string; timmar: string; dagar: string; aldrig: string }) {
  if (!nar) return t.aldrig;
  const min = Math.floor((Date.now() - new Date(nar).getTime()) / 60000);
  if (min < 60) return `${Math.max(1, min)} ${t.minuter}`;
  if (min < 1440) return `${Math.floor(min / 60)} ${t.timmar}`;
  return `${Math.floor(min / 1440)} ${t.dagar}`;
}

export default async function InterntKontonSide() {
  const { t } = await krevAnsatt();
  const konton = await hentKonton();

  const aktiva = konton.filter((k) => k.status === "aktiv");
  const kontroller30 = konton.reduce((s, k) => s + Number(k.kontroller_30d), 0);
  const leverandorer = konton.reduce((s, k) => s + Number(k.antall_leverandorer), 0);

  return (
    <StaffShell aktivtSteg="konton">
      <Side>
        <Sidehode
          tittel={t.ansattsider.konton.tittel}
          tekst={t.ansattsider.konton.tekst}
        />

        <Rad>
          <Tall verdi={String(aktiva.length)} merke={t.internt.aktiveKontoer} />
          <Tall verdi={`${NOK(mrr(konton))} kr`} merke={t.internt.manedsinntekt} />
          <Tall verdi={String(leverandorer)} merke={t.internt.underKontroll} />
          <Tall verdi={String(kontroller30)} merke={t.internt.kontroller30} />
        </Rad>

        {/* Tallene er aggregater fra kontooversikt() i basen. Personalet ser
            hvor mye en kunde bruker tjenesten, ikke hvem de handler med —
            det siste angår ikke oss, og en policy som ga oss det ene ville
            gitt oss begge. */}
        <Kort note={t.internt.bareTall}>
          <Tabell
            kolonner={[
              t.internt.konto,
              t.internt.plan,
              t.felles.status,
              t.internt.leverantorerKol,
              t.internt.kontroller30Kol,
              t.internt.kontaktKol,
              t.internt.sist,
            ]}
            tom={t.internt.ingenKonton}
            rader={konton.map((k) => [
              <div key="n">
                <div className="font-semibold">{k.navn}</div>
                {k.org_nr && (
                  <div className="text-[11.5px] text-faint font-mono">{k.org_nr}</div>
                )}
              </div>,
              <Merke key="p" tone={k.plan === "enterprise" ? "aksent" : "noytral"}>
                {planFor(k.plan).navn}
              </Merke>,
              <Merke key="s" tone={STATUSTONE[k.status] ?? "noytral"}>
                {t.internt.kontostatus[k.status as keyof typeof t.internt.kontostatus] ?? k.status}
              </Merke>,
              <span key="l" className="tabular-nums">{k.antall_leverandorer}</span>,
              <span key="k" className="tabular-nums">{k.kontroller_30d}</span>,
              <div key="c">
                <div>{k.kontakt_navn ?? "—"}</div>
                <div className="text-[11.5px] text-faint">
                  {k.antall_brukere} {Number(k.antall_brukere) === 1 ? t.internt.bruker : t.internt.brukere}
                </div>
              </div>,
              <span key="t" className="text-faint whitespace-nowrap">
                {sedan(k.sist_aktiv, t.internt.sedan)}
              </span>,
            ])}
          />
        </Kort>

        <p className="text-[12px] text-faint mt-4">
          {t.internt.kontonFotnot}{" "}
          <Link href="/internt/onboarding" className="text-accent hover:underline">
            {t.ansattmeny.onboarding}
          </Link>
        </p>
      </Side>
    </StaffShell>
  );
}
