import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RelavoMark } from "@/components/RelavoMark";
import { ord } from "@/lib/sprak";
import { Skjema } from "./Skjema";

export default async function BekreftEpostSide() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  // Bekreftet allerede (eller aldri krevd): da er det ingenting å vente på her.
  const { data: ok } = await supabase.rpc("epost_er_bekreftet");
  if (ok !== false) redirect("/betaling");

  const t = ord().bekreft;

  return (
    <div className="min-h-screen flex items-start justify-center bg-surface pt-[11vh] px-4">
      <div className="w-full max-w-[420px] bg-surface rounded-2xl shadow-lift px-6 py-7">
        <div className="text-center mb-5">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[17px] font-semibold">{t.tittel}</h1>
          <p className="text-[13px] text-dim mt-2 leading-relaxed">
            {t.ingress.replace("{epost}", user.email ?? "")}
          </p>
        </div>
        <p className="text-[12px] text-faint leading-relaxed">{t.hjelp}</p>
        <Skjema />
      </div>
    </div>
  );
}
