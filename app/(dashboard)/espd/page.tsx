import { krevProfil } from "@/lib/tilgang";
import { DashboardShell } from "@/components/DashboardShell";
import { Side, Sidehode, Tall, Rad } from "@/components/ui";
import { EspdRad, type Espd } from "@/components/brev/EspdRad";
import { dagerIgjen } from "@/lib/brev";
import { grunnUrl } from "@/lib/url";

export default async function EspdSide() {
  const { supabase, profil, organisasjonNavn } = await krevProfil();
  const lenkebase = grunnUrl();

  const { data: erklaringer } = await supabase
    .from("espd_erklaringer")
    .select(
      "id, status, fase, anskaffelse_ref, frist, etterspurt, mottaker_navn, mottaker_epost, utkast, token, levert, levert_filnavn, signert_navn, signert_rolle, leverandorer(navn, org_nr)",
    )
    .order("frist", { ascending: true, nullsFirst: false });

  const alle = (erklaringer ?? []) as unknown as Espd[];

  const venter = alle.filter((e) => e.status === "sendt");
  const forfalt = venter.filter((e) => {
    const d = dagerIgjen(e.frist);
    return d !== null && d < 0;
  });
  const snart = venter.filter((e) => {
    const d = dagerIgjen(e.frist);
    return d !== null && d >= 0 && d <= 3;
  });

  return (
    <DashboardShell aktivtSteg="ESPD">
      <Side>
        <Sidehode
          tittel="ESPD og egenerklæringer"
          tekst="Egenerklæringene dekker den delen av kvalifikasjonsvurderingen registrene ikke kan svare på. Mangler en, kan den kreves ettersendt etter § 23-5 — og fristen følges opp her."
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke="erklæringer" />
          <Tall verdi={String(venter.length)} merke="venter på svar" />
          <Tall
            verdi={String(snart.length)}
            merke="frist innen tre dager"
            tone={snart.length ? "advarsel" : undefined}
          />
          <Tall
            verdi={String(forfalt.length)}
            merke="over fristen"
            tone={forfalt.length ? "brudd" : undefined}
          />
        </Rad>

        {forfalt.length > 0 && (
          <div className="bg-bad-bg text-bad rounded-xl px-4 py-3 mb-5 text-[12.5px] leading-relaxed">
            <b>
              {forfalt.length}{" "}
              {forfalt.length === 1 ? "erklæring er" : "erklæringer er"} over
              fristen.
            </b>{" "}
            Fristen etter § 23-5 er ute. Tas tilbudet videre uten erklæringen,
            bør det begrunnes i anskaffelsesprotokollen.
          </div>
        )}

        {snart.length > 0 && (
          <div className="bg-warn-bg text-warn rounded-xl px-4 py-3 mb-5 text-[12.5px] leading-relaxed">
            <b>
              {snart.length} {snart.length === 1 ? "frist" : "frister"} løper ut
              innen tre dager.
            </b>{" "}
            Har dere ikke hørt noe, er det nå en påminnelse hører hjemme.
          </div>
        )}

        <div className="space-y-3">
          {alle.length === 0 && (
            <div className="bg-surface rounded-card border border-border shadow-card px-5 py-10 text-center text-dim text-sm">
              Ingen egenerklæringer registrert ennå. De opprettes når en
              kontroll knyttes til en anskaffelse.
            </div>
          )}
          {alle.map((e) => (
            <EspdRad
              key={e.id}
              e={e}
              lenkebase={lenkebase}
              avsenderNavn={profil.navn}
              avsenderOrg={organisasjonNavn}
            />
          ))}
        </div>
      </Side>
    </DashboardShell>
  );
}
