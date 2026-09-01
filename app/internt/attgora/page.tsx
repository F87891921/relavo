import Link from "next/link";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, NOK } from "@/components/ui";
import { LARM } from "@/lib/demo/staff";
import { Varsler, type Varsel } from "@/components/internt/Varsler";

/**
 * Samlar det som faktiskt kräver en människa i dag, från de riktiga
 * tabellerna. Poängen är att slippa gå igenom sju flikar för att se om
 * något brinner. Källhälsolarmen är ännu demodata — de har ingen tabell.
 */
export default async function InterntAttgoraSide() {
  const { supabase, t } = await krevAnsatt();

  const idag = new Date().toISOString().slice(0, 10);

  const [{ data: fakturaer }, { data: leads }, { data: offerter }, { data: varsler }] =
    await Promise.all([
      supabase
        .from("fakturaer")
        .select("id, nummer, kunde_navn, belopp, forfall, status")
        .in("status", ["obetald", "forfallen"]),
      supabase
        .from("leads")
        .select("id, bolag, nasta, notis, status")
        .not("status", "in", '("vunnen","forlorad")')
        .not("nasta", "is", null)
        .lte("nasta", idag),
      supabase
        .from("offerter")
        .select("id, kund, giltig_til, status")
        .eq("status", "skickad")
        .not("giltig_til", "is", null)
        .lte("giltig_til", idag),
      supabase
        .from("interne_varsler")
        .select("id, slag, tittel, tekst, lenke, opprettet")
        .is("lest", null)
        .order("opprettet", { ascending: false }),
    ]);

  const poster: {
    hastar: boolean;
    vad: string;
    detalj: string;
    var: string;
    lank: string;
  }[] = [];

  for (const f of fakturaer ?? []) {
    const forfallen = f.status === "forfallen" || f.forfall < idag;
    poster.push({
      hastar: forfallen,
      vad: `${forfallen ? t.internt.forfallenStatus : t.internt.obetald} faktura ${f.nummer}`,
      detalj: `${NOK(f.belopp)} kr`,
      var: `${f.kunde_navn} · förfaller ${f.forfall}`,
      lank: "/internt/fakturering",
    });
  }

  for (const o of offerter ?? []) {
    poster.push({
      hastar: true,
      vad: `Offert till ${o.kund} har gått ut`,
      detalj: t.internt.tilbudUtgatt,
      var: `gick ut ${o.giltig_til}`,
      lank: "/internt/offerter",
    });
  }

  for (const l of leads ?? []) {
    poster.push({
      hastar: false,
      vad: `Följ upp ${l.bolag}`,
      detalj: l.notis ?? t.internt.nesteStegPassert,
      var: `skulle följts upp ${l.nasta}`,
      lank: "/internt/leads",
    });
  }

  for (const l of LARM.filter((x) => x.status === "aktivt")) {
    poster.push({
      hastar: true,
      vad: `Larm: ${l.kalla}`,
      detalj: l.regel,
      var: `aktivt sedan ${l.sedan} · demodata`,
      lank: "/internt/kallor",
    });
  }

  poster.sort((a, b) => Number(b.hastar) - Number(a.hastar));

  return (
    <StaffShell aktivtSteg="attgora">
      <Side>
        <Sidehode
          tittel={t.ansattsider.attgora.tittel}
          tekst={t.ansattsider.attgora.tekst}
        />
        <Varsler varsler={(varsler ?? []) as Varsel[]} />

        <Kort note={`${poster.length} poster`}>
          <Tabell
            kolonner={["", t.internt.vad, t.internt.detalj, t.internt.var, ""]}
            tom={t.internt.ingentingBrenner}
            rader={poster.map((p) => [
              p.hastar ? (
                <Merke key="h" tone="brudd">{t.internt.haster}</Merke>
              ) : (
                <Merke key="h" tone="noytral">{t.internt.kanVente}</Merke>
              ),
              <span key="v" className="font-semibold whitespace-nowrap">{p.vad}</span>,
              <span key="d" className="text-dim">{p.detalj}</span>,
              <span key="s" className="text-faint whitespace-nowrap">{p.var}</span>,
              <Link key="l" href={p.lank} className="text-accent hover:underline whitespace-nowrap">
                {t.internt.apne}
              </Link>,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
