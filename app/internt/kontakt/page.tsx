import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { StaffShell } from "@/components/StaffShell";
import { Side, Sidehode, Kort, Tabell, Merke, Tall, Rad } from "@/components/ui";
import { kontaktKategoriTekst } from "@/lib/sak";
import { MarkerBehandlet } from "@/components/internt/MarkerBehandlet";

export default async function InterntKontaktSide() {
  const { supabase, t } = await krevAnsatt();

  const { data: henvendelser } = await supabase
    .from("kontakt_henvendelser")
    .select("id, navn, epost, organisasjon, telefon, kategori, melding, behandlet, opprettet")
    .order("opprettet", { ascending: false });

  const alle = henvendelser ?? [];
  const nya = alle.filter((h) => !h.behandlet);

  return (
    <StaffShell aktivtSteg="kontakt">
      <Side>
        <Sidehode
          tittel={t.ansattsider.kontakt.tittel}
          tekst={t.ansattsider.kontakt.tekst}
        />

        <Rad>
          <Tall verdi={String(alle.length)} merke="meddelanden totalt" />
          <Tall
            verdi={String(nya.length)}
            merke="obehandlade"
            tone={nya.length ? "brudd" : undefined}
          />
          <Tall
            verdi={String(alle.filter((h) => h.kategori === "demo").length)}
            merke="vill se demo"
          />
          <Tall
            verdi={String(alle.filter((h) => h.kategori === "priser").length)}
            merke="frågar om pris"
          />
        </Rad>

        <Kort>
          <Tabell
            kolonner={["Avsändare", "Gäller", "Meddelande", "Inkom", ""]}
            tom="Inga meddelanden ännu."
            rader={alle.map((h) => [
              <div key="a">
                <div className="font-semibold">{h.navn}</div>
                <a
                  href={`mailto:${h.epost}`}
                  className="text-[11.5px] text-accent hover:underline"
                >
                  {h.epost}
                </a>
                {h.organisasjon && (
                  <div className="text-[11.5px] text-faint">{h.organisasjon}</div>
                )}
                {h.telefon && (
                  <div className="text-[11.5px] text-faint">{h.telefon}</div>
                )}
              </div>,
              <Merke key="k" tone={h.kategori === "demo" ? "aksent" : "noytral"}>
                {kontaktKategoriTekst(h.kategori)}
              </Merke>,
              <span key="m" className="text-dim whitespace-pre-line block max-w-[46ch]">
                {h.melding}
              </span>,
              <span key="i" className="text-faint whitespace-nowrap">
                {new Date(h.opprettet).toLocaleDateString("sv-SE")}
              </span>,
              <MarkerBehandlet key="b" id={h.id} behandlet={h.behandlet} />,
            ])}
          />
        </Kort>
      </Side>
    </StaffShell>
  );
}
