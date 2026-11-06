import type { Metadata } from "next";
import { admin } from "@/lib/supabase/admin";
import { RelavoLogo } from "@/components/RelavoLogo";
import { Skjema } from "./Skjema";

export const metadata: Metadata = {
  title: "Underleverandører",
  robots: { index: false, follow: false },
};

/** Leverandørens side: hvem utfører arbeidet? Ingen innlogging, lenken er nøkkelen. */
export default async function Underleverandorer({ params }: { params: { token: string } }) {
  const db = admin();
  const { data: f } = await db
    .from("kjede_foresporsler")
    .select("status, frist, svart, svart_navn, svart_rolle, ingen, organisasjoner(navn), kjede_ledd(navn)")
    .eq("token", params.token)
    .maybeSingle();

  const kunde = (f?.organisasjoner as unknown as { navn: string } | null)?.navn;
  const leverandor = (f?.kjede_ledd as unknown as { navn: string } | null)?.navn;

  return (
    <main className="min-h-screen bg-canvas px-4 sm:px-6 py-10">
      <div className="max-w-[640px] mx-auto">
        <RelavoLogo className="w-[96px] h-auto text-ink mb-7" />
        <div className="bg-surface rounded-card border border-border shadow-card px-6 py-6">
          {!f ? (
            <>
              <h1 className="text-lg font-semibold mb-2">Vi finner ikke forespørselen</h1>
              <p className="text-[13.5px] text-dim leading-relaxed">Lenken kan være feil. Ta kontakt med den som sendte den.</p>
            </>
          ) : f.status === "besvart" ? (
            <>
              <div className="w-10 h-10 rounded-full bg-good-bg text-good grid place-items-center mb-4" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 10.5l3.5 3.5 7.5-8" /></svg>
              </div>
              <h1 className="text-lg font-semibold mb-2">Svaret er mottatt</h1>
              <p className="text-[13.5px] text-dim leading-relaxed mb-5">
                {f.ingen ? "Du har bekreftet at dere ikke bruker underleverandører." : "Takk for oppgavene."}
                {leverandor && kunde && ` Svaret gjelder ${leverandor} og er sendt til ${kunde}.`}
              </p>

              <dl className="rounded-xl bg-canvas border border-border px-4 py-3 text-[13px] space-y-1.5 mb-5">
                {f.svart_navn && (
                  <div className="flex gap-3"><dt className="text-faint w-[84px] shrink-0">Besvart av</dt><dd>{f.svart_navn}{f.svart_rolle ? `, ${f.svart_rolle}` : ""}</dd></div>
                )}
                {f.svart && (
                  <div className="flex gap-3"><dt className="text-faint w-[84px] shrink-0">Dato</dt><dd>{new Date(f.svart).toLocaleString("nb-NO", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
                )}
                {leverandor && (
                  <div className="flex gap-3"><dt className="text-faint w-[84px] shrink-0">Gjelder</dt><dd>{leverandor}</dd></div>
                )}
              </dl>

              <h2 className="text-[13px] font-semibold mb-1.5">Hva skjer nå?</h2>
              <ul className="text-[13px] text-dim leading-relaxed space-y-1.5 mb-5">
                {!f.ingen && <li>Selskapene du la inn slås opp i Enhetsregisteret og kontrolleres.</li>}
                <li>{kunde ?? "Den som sendte forespørselen"} har fått beskjed og kan se svaret.</li>
                <li>Du trenger ikke gjøre mer. Du kan lukke siden.</li>
              </ul>

              <p className="text-[12px] text-faint leading-relaxed">
                Ble noe feil, eller kommer det flere underleverandører til? Ta kontakt med {kunde ?? "den som sendte lenken"}, så sender de en ny forespørsel.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold mb-2">Hvem utfører arbeidet for {kunde}?</h1>
              <p className="text-[13.5px] text-dim leading-relaxed mb-5">
                {kunde} har en avtale med {leverandor} og må dokumentere hvem som utfører arbeidet, også underleverandørene.
                Legg inn organisasjonsnumrene til selskapene som utfører deler av oppdraget for dere. Vi slår dem opp i
                Enhetsregisteret. Svar innen {new Date(f.frist).toLocaleDateString("nb-NO")}.
              </p>
              <Skjema token={params.token} />
            </>
          )}
        </div>
        <p className="text-[11.5px] text-faint text-center mt-6">Relavo · relavo.no</p>
      </div>
    </main>
  );
}
