import { krevSuperadmin } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad } from "@/components/ui";
import { PersonalVelger } from "@/components/internt/PersonalVelger";

export default async function InterntTeamSide() {
  const { supabase, user, t } = await krevSuperadmin();

  // Alla profiler, inte bara de anställda — det är här man gör en kollega
  // till personal.
  const { data: alle } = await supabase
    .from("profiler")
    .select("id, navn, rolle, ansatt, ansatt_rolle, opprettet, organisasjoner(navn)")
    .order("opprettet");

  const profiler = alle ?? [];
  const ansatte = profiler.filter((p) => p.ansatt);

  return (
    <StaffShell aktivtSteg="team">
      <Side>
        <Sidehode
          tittel={t.ansattsider.team.tittel}
          tekst={t.ansattsider.team.tekst}
        />

        <Rad>
          <Tall verdi={String(ansatte.length)} merke={t.internt.ansatte} />
          <Tall
            verdi={String(ansatte.filter((p) => p.ansatt_rolle === "superadmin").length)}
            merke={t.internt.superadminAntal}
          />
          <Tall
            verdi={String(ansatte.filter((p) => p.ansatt_rolle === "personal").length)}
            merke={t.internt.personalAntal}
          />
          <Tall verdi={String(profiler.length - ansatte.length)} merke={t.internt.kundanvandare} />
        </Rad>

        <div className="bg-canvas text-dim text-[12.5px] rounded-xl px-4 py-3 mb-5 leading-relaxed border border-border">
          <b className="text-ink">{t.internt.superadminRolle}</b> ser marginaler per konto,
          åtkomstloggen och den här sidan.{" "}
          <b className="text-ink">{t.internt.personalRolle}</b> ser det dagliga: support, leads,
          offerter, fakturering, onboarding och kreditkontroll. Den som svarar
          på support behöver inte veta vad varje kund kostar oss.
        </div>

        <Kort tittel={t.internt.alleBrukere} note={t.internt.merkPersonal}>
          <Tabell
            kolonner={["Namn", t.internt.organisasjon, t.internt.rolleHosKunden, t.internt.hosOss, ""]}
            rader={profiler.map((p) => {
              const org = p.organisasjoner as unknown as { navn: string } | null;
              return [
                <span key="n" className="font-semibold">
                  {p.navn}
                  {p.id === user.id && (
                    <span className="text-faint font-normal"> — du</span>
                  )}
                </span>,
                <span key="o" className="text-dim whitespace-nowrap">
                  {org?.navn ?? "—"}
                </span>,
                <span key="r" className="text-dim">
                  {p.rolle === "administrator" ? t.internt.administrator : t.internt.anvandare}
                </span>,
                p.ansatt ? (
                  <Merke key="a" tone={p.ansatt_rolle === "superadmin" ? "aksent" : "god"}>
                    {p.ansatt_rolle === "superadmin" ? t.internt.superadminRolle : t.internt.personalRolle}
                  </Merke>
                ) : (
                  <span key="a" className="text-faint">{t.internt.kunde}</span>
                ),
                <PersonalVelger
                  key="v"
                  id={p.id}
                  ansatt={p.ansatt}
                  niva={p.ansatt_rolle}
                  erDegSelv={p.id === user.id}
                />,
              ];
            })}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
