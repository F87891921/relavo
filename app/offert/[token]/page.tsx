import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Offertdokument, type Offertdata } from "@/components/offert/Offertdokument";
import { Svarskjema } from "./Svarskjema";
import { RELAVO } from "@/lib/relavo";

export const metadata: Metadata = {
  title: "Tilbud fra Relavo",
  // Lenken deles i e-post. Den skal ikke havne i et søkeresultat.
  robots: { index: false, follow: false },
};

type Rad = Offertdata & {
  status: string;
  svar: string | null;
  svar_kommentar: string | null;
  svar_navn: string | null;
  svar_tid: string | null;
};

export default async function OffertLenke({ params }: { params: { token: string } }) {
  const supabase = createClient();

  const { data } = await supabase.rpc("offert_ved_token", { t: params.token });
  const o = (Array.isArray(data) ? data[0] : null) as Rad | null;

  if (!o)
    return (
      <Ramme>
        <h1 className="text-xl font-semibold mb-2">Vi finner ikke tilbudet</h1>
        <p className="text-[13.5px] text-dim leading-relaxed">
          Lenken kan være utløpt, eller tilbudet er ikke sendt ut ennå. Ta
          kontakt på {RELAVO.epost}, så finner vi ut av det.
        </p>
      </Ramme>
    );

  // Vi noterer at den er åpnet. Ikke sporing — det er selgeren som skal
  // slippe å ringe og spørre om den kom fram.
  await supabase.rpc("offert_sett", { t: params.token });

  const utlopt =
    !o.svar && o.giltig_til ? new Date(o.giltig_til) < new Date(new Date().toDateString()) : false;

  return (
    <Ramme>
      <Offertdokument o={o} />

      <div className="skjul-i-utskrift mt-5">
        {o.svar ? (
          <div
            className={`rounded-card px-6 py-5 ${
              o.svar === "akseptert" ? "bg-good-bg text-good" : "bg-canvas text-dim"
            }`}
          >
            <div className="text-[14px] font-semibold mb-1">
              {o.svar === "akseptert"
                ? "Takk — tilbudet er godtatt."
                : "Svaret er registrert."}
            </div>
            <p className="text-[12.5px] leading-relaxed">
              {o.svar === "akseptert"
                ? "Vi tar kontakt med det praktiske. Trenger dere tilbudet som PDF, kan siden skrives ut."
                : "Takk for at dere svarte. Vi bruker begrunnelsen til å se om noe annet passer bedre."}
            </p>
            {o.svar_navn && (
              <p className="text-[11.5px] mt-2 opacity-80">
                Svart av {o.svar_navn}
                {o.svar_tid &&
                  ` · ${new Date(o.svar_tid).toLocaleDateString("nb-NO")}`}
              </p>
            )}
          </div>
        ) : utlopt ? (
          <div className="bg-warn-bg text-warn rounded-card px-6 py-5">
            <div className="text-[14px] font-semibold mb-1">
              Tilbudet er gått ut på dato
            </div>
            <p className="text-[12.5px] leading-relaxed">
              Gyldighetsfristen var {o.giltig_til}. Ta kontakt på{" "}
              {RELAVO.epost}, så sender vi et oppdatert tilbud.
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-card border border-border shadow-card px-6 py-5">
            <div className="text-[14px] font-semibold mb-1">Hva sier dere?</div>
            <p className="text-[12.5px] text-dim leading-relaxed mb-4 max-w-[64ch]">
              Svarer dere her, kommer det rett til oss. Vil dere ha tilbudet
              som PDF først, kan siden skrives ut.
            </p>
            <Svarskjema token={params.token} />
          </div>
        )}
      </div>

      <p className="skjul-i-utskrift text-[11.5px] text-faint text-center mt-6">
        {RELAVO.navn} · {RELAVO.epost}
      </p>
    </Ramme>
  );
}

function Ramme({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas print:bg-white px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-[820px] mx-auto">{children}</div>
    </main>
  );
}
