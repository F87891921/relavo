import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad } from "@/components/ui";
import { KundeKontakt } from "@/components/internt/KundeKontakt";
import { vurder, type Aktivitetsrad, type Segment } from "@/lib/aktivitet";
import { planFor } from "@/lib/plan";

const dagerSiden = (iso: string | null) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null;

/**
 * Hvem bruker tjenesten og hvem gjør det ikke. Reglene ligger i
 * lib/aktivitet.ts og er de samme som den daglige jobben bruker til varsler.
 */
export default async function InterntAktivitetSide() {
  const { supabase, t } = await krevAnsatt();
  const s = t.aktivitetssider;

  const { data } = await supabase.rpc("aktivitet");
  const rader = ((data ?? []) as Aktivitetsrad[]).map((r) => ({ r, v: vurder(r) }));

  const grupper: { id: Segment | "fulgt"; tittel: string; tekst: string; rader: typeof rader }[] = [
    { id: "aldri", tittel: s.aldri, tekst: s.aldriTekst, rader: rader.filter((x) => x.v.segment === "aldri" && !x.v.nyligKontaktet) },
    { id: "inaktiv", tittel: s.inaktiv, tekst: s.inaktivTekst, rader: rader.filter((x) => x.v.segment === "inaktiv" && !x.v.nyligKontaktet).sort((a, b) => b.v.dager - a.v.dager) },
    { id: "faller", tittel: s.faller, tekst: s.fallerTekst, rader: rader.filter((x) => x.v.segment === "faller" && !x.v.nyligKontaktet) },
    { id: "lite", tittel: s.lite, tekst: s.liteTekst, rader: rader.filter((x) => x.v.segment === "lite" && !x.v.nyligKontaktet) },
    { id: "fulgt", tittel: s.fulgt, tekst: s.fulgtTekst, rader: rader.filter((x) => x.v.segment && x.v.nyligKontaktet) },
  ];
  const trenger = grupper.slice(0, 4).reduce((n, g) => n + g.rader.length, 0);

  return (
    <StaffShell aktivtSteg="aktivitet">
      <Side>
        <Sidehode tittel={s.tittel} tekst={s.tekst} />

        <Rad>
          {grupper.map((g) => (
            <Tall key={g.id} verdi={String(g.rader.length)} merke={g.tittel} tone={g.id !== "fulgt" && g.rader.length ? "advarsel" : undefined} />
          ))}
        </Rad>

        {trenger === 0 && <div className="text-[13.5px] text-dim mb-5">{s.alleOk}</div>}

        {grupper.map((g) =>
          g.rader.length === 0 ? null : (
            <Kort key={g.id} tittel={g.tittel} note={g.tekst} className="mb-5">
              <Tabell
                kolonner={[s.konto, s.plan, s.sistAktiv, s.kontroller, s.leverandorer, s.kontakt, s.handling]}
                tom={s.ingen}
                rader={g.rader.map(({ r, v }) => [
                  <div key="n">
                    <div className="font-semibold whitespace-nowrap">{r.navn}</div>
                    {r.sist_kontaktet && (
                      <div className="text-[11.5px] text-faint">
                        {s.sistKontaktet}: {s.dagerSiden.replace("{n}", String(dagerSiden(r.sist_kontaktet)))}
                      </div>
                    )}
                  </div>,
                  <Merke key="p" tone="noytral">{planFor(r.plan).navn}</Merke>,
                  <span key="s" className="text-dim whitespace-nowrap">
                    {r.sist_kontroll || r.sist_innlogget ? s.dagerSiden.replace("{n}", String(v.dager)) : s.aldriInnlogget}
                  </span>,
                  <span key="k" className="tabular-nums">{r.kontroller_30d}</span>,
                  <span key="l" className="tabular-nums">{r.antall_leverandorer}</span>,
                  <span key="c" className="text-dim whitespace-nowrap">{r.kontakt_navn ?? "—"}</span>,
                  <KundeKontakt key="h" id={r.id} epost={r.kontakt_epost} navn={r.kontakt_navn} />,
                ])}
              />
            </Kort>
          ),
        )}
      </Side>
    </StaffShell>
  );
}
