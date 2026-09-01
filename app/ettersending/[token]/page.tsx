import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RelavoLogo } from "@/components/RelavoLogo";
import { dagerIgjen } from "@/lib/brev";
import { Skjema } from "./Skjema";

export const metadata: Metadata = {
  title: "Ettersending av egenerklæring",
  robots: { index: false, follow: false },
};

type Rad = {
  leverandor: string;
  anskaffelse_ref: string | null;
  oppdragsgiver: string;
  frist: string | null;
  brev: string | null;
  levert: string | null;
  levert_filnavn: string | null;
  signert_navn: string | null;
};

export default async function Ettersending({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data } = await supabase.rpc("espd_ved_token", { t: params.token });
  const e = (Array.isArray(data) ? data[0] : null) as Rad | null;

  if (!e)
    return (
      <Ramme>
        <h1 className="text-lg font-semibold mb-2">Vi finner ikke forespørselen</h1>
        <p className="text-[13.5px] text-dim leading-relaxed">
          Lenken kan være feil eller utløpt. Ta kontakt med oppdragsgiveren
          som ba om erklæringen.
        </p>
      </Ramme>
    );

  const igjen = dagerIgjen(e.frist);

  if (e.levert)
    return (
      <Ramme>
        <div className="bg-good-bg text-good rounded-xl px-5 py-4 mb-5">
          <div className="text-[14px] font-semibold mb-1">Erklæringen er mottatt</div>
          <p className="text-[12.5px] leading-relaxed">
            {e.levert_filnavn} ble levert{" "}
            {new Date(e.levert).toLocaleDateString("nb-NO")}
            {e.signert_navn && ` av ${e.signert_navn}`}. {e.oppdragsgiver} har
            fått beskjed.
          </p>
        </div>
        <p className="text-[12.5px] text-dim leading-relaxed">
          Trenger dere å sende en ny versjon, ta kontakt med {e.oppdragsgiver}{" "}
          direkte — denne lenken er brukt opp.
        </p>
      </Ramme>
    );

  return (
    <Ramme>
      <h1 className="text-xl font-semibold tracking-tight mb-1.5">
        Ettersending av ESPD-egenerklæring
      </h1>
      <p className="text-[13.5px] text-dim leading-relaxed mb-5 max-w-[68ch]">
        {e.oppdragsgiver} ber {e.leverandor} om å ettersende
        ESPD-egenerklæringen
        {e.anskaffelse_ref && (
          <>
            {" "}
            i <span className="font-mono text-[12.5px]">{e.anskaffelse_ref}</span>
          </>
        )}
        . Manglende egenerklæring er normalt en mangel som kan rettes etter
        anskaffelsesforskriften § 23-5.
      </p>

      {e.frist && (
        <div
          className={`rounded-xl px-4 py-3 mb-5 text-[12.5px] leading-relaxed ${
            igjen !== null && igjen < 0
              ? "bg-bad-bg text-bad"
              : igjen !== null && igjen <= 3
                ? "bg-warn-bg text-warn"
                : "bg-canvas text-dim"
          }`}
        >
          <b>Frist {e.frist}.</b>{" "}
          {igjen === null
            ? null
            : igjen < 0
              ? `Fristen gikk ut for ${Math.abs(igjen)} dager siden. Send inn så snart som mulig, og ta kontakt med ${e.oppdragsgiver}.`
              : igjen === 0
                ? "Fristen går ut i dag."
                : `${igjen} dager igjen.`}
        </div>
      )}

      <div className="bg-surface rounded-card border border-border shadow-card px-5 sm:px-6 py-5 sm:py-6">
        <Skjema token={params.token} />
      </div>

      {e.brev && (
        <details className="mt-5">
          <summary className="text-[12.5px] text-dim cursor-pointer">
            Vis forespørselen slik den ble sendt
          </summary>
          <div className="bg-canvas rounded-xl px-4 py-3.5 text-[12.5px] leading-relaxed text-dim whitespace-pre-line mt-2">
            {e.brev}
          </div>
        </details>
      )}
    </Ramme>
  );
}

function Ramme({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-[720px] mx-auto">
        <RelavoLogo className="w-[92px] h-auto text-ink mb-6" />
        {children}
        <p className="text-[11.5px] text-faint mt-8 leading-relaxed">
          Siden driftes av Relavo på vegne av oppdragsgiveren. Filen deles
          bare med dem.
        </p>
      </div>
    </main>
  );
}
