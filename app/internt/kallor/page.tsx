import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad, type Tone } from "@/components/ui";
import { SynkRenhold } from "@/components/internt/SynkRenhold";
import { KILDER } from "@/lib/kilder";

const VEITONE: Record<string, Tone> = {
  oppslag: "god",
  synk: "god",
  leverandor: "aksent",
  mangler: "advarsel",
};

const dager = (nar: string | null) =>
  nar === null ? null : Math.floor((Date.now() - new Date(nar).getTime()) / 86_400_000);

export default async function InterntKallorSide() {
  const { supabase, t } = await krevAnsatt();

  const [{ data: synk }, { data: integrasjoner }] = await Promise.all([
    supabase.from("registersynk").select("register, sist_hentet, antall"),
    supabase.from("integrasjoner").select("navn, sist_synk, sist_feil"),
  ]);

  // Siste henting per kilde, uansett hvilken av de to tabellene den ligger i.
  const sist = new Map<string, { nar: string | null; feil: string | null }>();
  for (const r of synk ?? [])
    sist.set(r.register, { nar: r.sist_hentet, feil: null });
  for (const i of integrasjoner ?? [])
    sist.set(i.navn, { nar: i.sist_synk, feil: i.sist_feil });

  const renhold = (synk ?? []).find((s) => s.register === "renhold");

  const ibruk = KILDER.filter((k) => k.vei !== "mangler");
  const mangler = KILDER.filter((k) => k.vei === "mangler");

  // En synkronisert kilde som ikke er hentet på to døgn er ikke fersk
  // lenger. Det er det eneste vi faktisk kan si noe om, og derfor det
  // eneste som står som varsel.
  const gamle = ibruk.filter((k) => {
    if (!k.synknavn) return false;
    const d = dager(sist.get(k.synknavn)?.nar ?? null);
    return d === null || d > 2;
  });

  return (
    <StaffShell aktivtSteg="kallor">
      <Side>
        <Sidehode
          tittel={t.ansattsider.kallor.tittel}
          tekst={t.ansattsider.kallor.tekst}
        />

        <SynkRenhold
          sistHentet={renhold?.sist_hentet ?? null}
          antall={renhold?.antall ?? 0}
        />

        <Rad>
          <Tall verdi={String(ibruk.length)} merke={t.internt.kilderIBruk} />
          <Tall
            verdi={String(ibruk.filter((k) => k.kostnad === 0).length)}
            merke={t.internt.gratisKilder}
          />
          <Tall
            verdi={String(mangler.length)}
            merke={t.internt.kilderUtenAvtale}
            tone={mangler.length ? "advarsel" : undefined}
          />
          <Tall
            verdi={String(gamle.length)}
            merke={t.internt.ikkeFersk}
            tone={gamle.length ? "brudd" : undefined}
          />
        </Rad>

        <Kort tittel={t.internt.kilder} className="mb-5">
          <Tabell
            kolonner={[
              t.internt.kilde,
              t.internt.hvaDenGir,
              t.internt.hvordan,
              t.internt.kostnadPerStk,
              t.internt.sistHentet,
            ]}
            rader={ibruk.map((k) => {
              const s = k.synknavn ? sist.get(k.synknavn) : undefined;
              const d = dager(s?.nar ?? null);
              return [
                <div key="n">
                  <div className="font-semibold">{k.navn}</div>
                  {k.merknad && (
                    <div className="text-[11.5px] text-faint leading-relaxed max-w-[46ch]">
                      {k.merknad}
                    </div>
                  )}
                </div>,
                <span key="g" className="text-dim">{k.gir}</span>,
                <Merke key="v" tone={VEITONE[k.vei]}>
                  {t.internt.vei[k.vei as keyof typeof t.internt.vei]}
                </Merke>,
                <span key="k" className="tabular-nums text-dim whitespace-nowrap">
                  {k.kostnad === 0 ? t.internt.gratis : `${k.kostnad} kr`}
                </span>,
                !k.synknavn ? (
                  // En kilde uten synk har ingen «sist hentet» — den hentes
                  // i det øyeblikket noen kjører en kontroll, eller den
                  // kommer fra leverandøren.
                  <span key="s" className="text-faint">
                    {k.vei === "leverandor" ? t.internt.narDenKommer : t.internt.perOppslag}
                  </span>
                ) : s?.feil ? (
                  <Merke key="s" tone="brudd">{s.feil}</Merke>
                ) : d === null ? (
                  <Merke key="s" tone="brudd">{t.internt.aldriHentet}</Merke>
                ) : (
                  <Merke key="s" tone={d > 2 ? "brudd" : "god"}>
                    {d === 0 ? t.internt.idag : `${d} ${t.internt.dagerSiden}`}
                  </Merke>
                ),
              ];
            })}
          />
        </Kort>

        <Kort tittel={t.internt.utenAvtale}>
          {/* Står her, ikke gjemt: hver av disse er en linje som sier «ikke
              hentet» på hver eneste kontrollrapport vi leverer. */}
          <Tabell
            kolonner={[t.internt.kilde, t.internt.hvaDenGir, t.internt.hvaSomMangler]}
            rader={mangler.map((k) => [
              <span key="n" className="font-semibold">{k.navn}</span>,
              <span key="g" className="text-dim">{k.gir}</span>,
              <span key="m" className="text-dim text-[12px] leading-relaxed max-w-[62ch] block">
                {k.merknad}
              </span>,
            ])}
          />
        </Kort>

        <p className="text-[12px] text-faint mt-4 max-w-[70ch] leading-relaxed">
          {t.internt.ingenTelemetri}
        </p>
      </Side>
    </StaffShell>
  );
}
