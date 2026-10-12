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
    .select("status, frist, svart, svart_navn, ingen, organisasjoner(navn), kjede_ledd(navn)")
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
              <h1 className="text-lg font-semibold mb-2">Svaret er mottatt</h1>
              <p className="text-[13.5px] text-dim leading-relaxed">
                {f.ingen ? "Du har bekreftet at dere ikke bruker underleverandører." : "Takk for oppgavene."}
                {f.svart_navn && ` Besvart av ${f.svart_navn}.`}
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
