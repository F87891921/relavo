import Link from "next/link";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Sidehode, Kort, Tabell, Merke } from "@/components/ui";
import { ARENDEN, LARM, LEADS, FAKTUROR, KONTON } from "@/lib/demo/staff";

const kontoNamn = (id: string) => KONTON.find((k) => k.id === id)?.namn ?? id;

/**
 * Samlar det som faktiskt kräver en människa i dag, från de andra vyerna.
 * Poängen är att slippa gå igenom sju flikar för att se om något brinner.
 */
export default async function InterntAttgoraSide() {
  await krevAnsatt();

  const idag = new Date("2026-08-31");

  const poster: {
    hastar: boolean;
    vad: string;
    detalj: string;
    var: string;
    lank: string;
  }[] = [];

  for (const a of ARENDEN.filter((x) => x.status === "obesvarad")) {
    poster.push({
      hastar: a.vantat > 2,
      vad: `Obesvarat ärende ${a.id}`,
      detalj: a.emne,
      var: `${kontoNamn(a.konto)} · väntat ${a.vantat} d`,
      lank: "/internt/support",
    });
  }

  for (const l of LARM.filter((x) => x.status === "aktivt")) {
    poster.push({
      hastar: true,
      vad: `Larm: ${l.kalla}`,
      detalj: l.regel,
      var: `aktivt sedan ${l.sedan}`,
      lank: "/internt/kallor",
    });
  }

  for (const f of FAKTUROR.filter((x) => x.status === "forfallen")) {
    poster.push({
      hastar: true,
      vad: `Förfallen faktura ${f.nr}`,
      detalj: `${f.belopp} kr`,
      var: `${kontoNamn(f.konto)} · förföll ${f.forfall}`,
      lank: "/internt/fakturering",
    });
  }

  for (const l of LEADS.filter((x) => x.nasta && new Date(x.nasta) <= idag)) {
    poster.push({
      hastar: false,
      vad: `Följ upp ${l.bolag}`,
      detalj: l.notis,
      var: `nästa steg ${l.nasta}`,
      lank: "/internt/leads",
    });
  }

  poster.sort((a, b) => Number(b.hastar) - Number(a.hastar));

  return (
    <StaffShell aktivtSteg="Att göra">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Att göra"
          tekst="Det som kräver en människa i dag, hämtat från ärenden, larm, fakturor och leads. Rött hastar."
        />
        <Kort note={`${poster.length} poster`}>
          <Tabell
            kolonner={["", "Vad", "Detalj", "Var", ""]}
            tom="Ingenting brinner just nu."
            rader={poster.map((p) => [
              p.hastar ? (
                <Merke key="h" tone="brudd">Hastar</Merke>
              ) : (
                <Merke key="h" tone="noytral">Kan vänta</Merke>
              ),
              <span key="v" className="font-semibold whitespace-nowrap">{p.vad}</span>,
              <span key="d" className="text-dim">{p.detalj}</span>,
              <span key="s" className="text-faint whitespace-nowrap">{p.var}</span>,
              <Link key="l" href={p.lank} className="text-accent hover:underline whitespace-nowrap">
                Öppna →
              </Link>,
            ])}
          />
        </Kort>
      </div>
    </StaffShell>
  );
}
