import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Kort, Tabell, Merke, type Tone } from "@/components/ui";
import { ESPD, ESPD_STATUS, ESPD_FASE, SUPPLIERS } from "@/lib/demo/app";

const TONE: Record<string, Tone> = {
  mottatt: "god",
  motstrid: "brudd",
  mangler: "brudd",
  sendt: "advarsel",
  utlopt: "brudd",
};

const navnFor = (org: string) => SUPPLIERS.find((s) => s.org === org)?.name ?? org;

export default async function EspdSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="ESPD">
      <Side>
        <Sidehode
          tittel="ESPD og egenerklæringer"
          tekst="Egenerklæringene dekker den delen av kvalifikasjonsvurderingen registrene ikke kan svare på. Motstrid mot registrene er en avvisningsgrunn etter § 24-2 tredje ledd."
        />
        <Kort note="fra prototypens demodata">
          <Tabell
            kolonner={["Ref", "Tilbyder", "Anskaffelse", "Fase", "Levert via", "Mottatt", "Tilbudssum", "Status"]}
            rader={ESPD.map((e) => [
              <span key="i" className="font-mono text-[12px] text-accent">{e.id}</span>,
              <span key="n" className="font-semibold">{navnFor(e.org)}</span>,
              <span key="a" className="font-mono text-[12px] text-dim">{e.ansk}</span>,
              <span key="f" className="text-dim whitespace-nowrap">
                {ESPD_FASE[e.fase as keyof typeof ESPD_FASE] ?? e.fase}
              </span>,
              <span key="p" className="text-dim">{e.plattform || "—"}</span>,
              <span key="m" className="text-dim whitespace-nowrap">{e.mottatt || "—"}</span>,
              <span key="s" className="tabular-nums whitespace-nowrap">{e.tilbudssum || "—"}</span>,
              <Merke key="st" tone={TONE[e.status] ?? "noytral"}>
                {ESPD_STATUS[e.status as keyof typeof ESPD_STATUS] ?? e.status}
              </Merke>,
            ])}
          />
        </Kort>
      </Side>
    </DashboardShell>
  );
}
