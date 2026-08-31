import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Sidehode, Kort, Tabell, Merke, Tall, Rad } from "@/components/ui";
import { KJORINGER, KILDER } from "@/lib/demo/app";

export default async function DiagnostikkSide() {
  const { supabase, profil, user } = await krevProfil();

  const { count: kontroller } = await supabase
    .from("kontroller")
    .select("id", { count: "exact", head: true });
  const { count: leverandorer } = await supabase
    .from("leverandorer")
    .select("id", { count: "exact", head: true });

  const { data: org } = await supabase
    .from("organisasjoner")
    .select("navn, plan, opprettet")
    .eq("id", profil.organisasjon_id)
    .maybeSingle();

  return (
    <DashboardShell aktivtSteg="Diagnostikk">
      <div className="px-8 py-6">
        <Sidehode
          tittel="Diagnostikk"
          tekst="Teknisk status for kontoen. Har du en sak hos brukerstøtte, er det disse opplysningene de spør etter."
        />

        <Rad>
          <Tall verdi={String(leverandorer ?? 0)} merke="leverandører lagret" />
          <Tall verdi={String(kontroller ?? 0)} merke="kontroller lagret" />
          <Tall verdi={org?.plan ?? "—"} merke="plan" />
          <Tall
            verdi={KILDER.filter((k) => k.s === "ok").length + " av " + KILDER.length}
            merke="kilder som svarer"
          />
        </Rad>

        <div className="grid lg:grid-cols-2 gap-4">
          <Kort tittel="Konto">
            <Tabell
              kolonner={["Opplysning", "Verdi"]}
              rader={[
                ["Organisasjon", <b key="o">{org?.navn ?? "—"}</b>],
                ["Organisasjons-id", <span key="i" className="font-mono text-[11.5px]">{profil.organisasjon_id}</span>],
                ["Din bruker-id", <span key="u" className="font-mono text-[11.5px]">{user.id}</span>],
                ["Din rolle", profil.rolle],
                ["Ansatt i Relavo", profil.ansatt ? <Merke key="a" tone="aksent">Ja</Merke> : "Nei"],
                ["Opprettet", org?.opprettet ? new Date(org.opprettet).toLocaleDateString("nb-NO") : "—"],
              ]}
            />
          </Kort>

          <Kort tittel="Siste kjøringer" note="fra prototypens demodata">
            <Tabell
              kolonner={["Tidspunkt", "Utløst av", "Resultat"]}
              rader={KJORINGER.map((k) => [
                <span key="t" className="text-dim whitespace-nowrap">{k.t}</span>,
                <span key="h" className="text-dim">{k.how}</span>,
                <Merke key="r" tone={k.res === "hoy" ? "brudd" : k.res === "middels" ? "advarsel" : "god"}>
                  {k.res === "hoy" ? "Høy" : k.res === "middels" ? "Middels" : "Lav"}
                </Merke>,
              ])}
            />
          </Kort>
        </div>
      </div>
    </DashboardShell>
  );
}
