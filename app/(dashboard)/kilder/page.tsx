import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Sidehode, Kort, Tabell, Merke, type Tone } from "@/components/ui";
import { KILDER } from "@/lib/demo/app";

/**
 * «Manuell» betyr at kilden ikke har et API vi kan spørre — ESPD-erklæringen
 * kommer som vedlegg fra leverandøren. Den er ikke nede, den er bare ikke
 * automatiserbar, og skal ikke se ut som en feil.
 */
const STATUS: Record<string, { tone: Tone; tekst: string }> = {
  ok: { tone: "god", tekst: "Svarer" },
  delvis: { tone: "advarsel", tekst: "Delvis" },
  manuell: { tone: "noytral", tekst: "Manuell" },
};

export default async function KilderSide() {
  const { profil } = await krevProfil();

  return (
    <DashboardShell aktivtSteg="Datakilder" ansatt={profil.ansatt}>
      <div className="px-8 py-6">
        <Sidehode
          tittel="Datakilder"
          tekst="Hvilke registre som svarer, og hvor ferske svarene er. En kilde som ikke svarer står oppført som ikke kontrollert i rapporten — den utelates aldri."
        />

        <div className="bg-warn-bg text-warn text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed">
          <b>Bare Enhetsregisteret er koblet på ennå.</b> De øvrige krever
          avtale, og står oppført som ikke hentet i alle kontroller til de er
          på plass.
        </div>

        <Kort>
          <Tabell
            kolonner={["Kilde", "Hva den gir", "Status", "Sist"]}
            rader={KILDER.map((k) => [
              <span key="n" className="font-semibold">{k.n}</span>,
              <span key="d" className="text-dim">{k.d}</span>,
              <Merke key="s" tone={STATUS[k.s].tone}>
                {STATUS[k.s].tekst}
              </Merke>,
              <span key="w" className="text-dim whitespace-nowrap">{k.w}</span>,
            ])}
          />
        </Kort>
      </div>
    </DashboardShell>
  );
}
