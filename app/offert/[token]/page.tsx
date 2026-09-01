import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Offertdokument, type Offertdata } from "@/components/offert/Offertdokument";
import { Svarskjema } from "./Svarskjema";
import { RELAVO } from "@/lib/relavo";
import { ord } from "@/lib/sprak";

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
  const o9 = ord().offertsvar;

  const { data } = await supabase.rpc("offert_ved_token", { t: params.token });
  const o = (Array.isArray(data) ? data[0] : null) as Rad | null;

  if (!o)
    return (
      <Ramme>
        <div className="bg-surface rounded-card border border-border shadow-card px-6 py-6">
          <h1 className="text-lg font-semibold mb-2">{o9.finnerIkke}</h1>
          <p className="text-[13.5px] text-dim leading-relaxed">
            {o9.finnerIkkeTekst} {RELAVO.epost}
          </p>
        </div>
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
              o.svar === "akseptert"
                ? "bg-good-bg text-good"
                : o.svar === "endring"
                  ? "bg-warn-bg text-warn"
                  : "bg-canvas text-dim"
            }`}
          >
            <div className="text-[14px] font-semibold mb-1">
              {o.svar === "akseptert"
                ? o9.takkGodtatt
                : o.svar === "endring"
                  ? o9.onsketRegistrert
                  : o9.svaretRegistrert}
            </div>
            <p className="text-[12.5px] leading-relaxed">
              {o.svar === "akseptert"
                ? o9.takkGodtattTekst
                : o.svar === "endring"
                  ? o9.onsketTekst
                  : o9.svaretTekst}
            </p>
            {o.svar_navn && (
              <p className="text-[11.5px] mt-2 opacity-80">
                {o9.svartAv} {o.svar_navn}
                {o.svar_tid &&
                  ` · ${new Date(o.svar_tid).toLocaleDateString("nb-NO")}`}
              </p>
            )}
          </div>
        ) : utlopt ? (
          <div className="bg-warn-bg text-warn rounded-card px-6 py-5">
            <div className="text-[14px] font-semibold mb-1">{o9.utlopt}</div>
            <p className="text-[12.5px] leading-relaxed">
              {o9.utloptTekst} {o.giltig_til}. {o9.taKontakt} {RELAVO.epost}
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-card border border-border shadow-card px-6 py-5">
            <div className="text-[14px] font-semibold mb-1">{o9.hvaSierDere}</div>
            <p className="text-[12.5px] text-dim leading-relaxed mb-4 max-w-[64ch]">
              {o9.svarHer}
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
