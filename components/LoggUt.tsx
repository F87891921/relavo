"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoggUt({ tekst, venterTekst }: { tekst: string; venterTekst: string }) {
  const router = useRouter();
  const [venter, start] = useTransition();

  return (
    <button
      type="button"
      disabled={venter}
      onClick={() =>
        start(async () => {
          // Språkkapselen tilhører personen, ikke maskinen. Blir den
          // liggende, arver den neste som logger inn på samme nettleser
          // språket til den forrige — og middleware sår bare fra profilen
          // når kapselen mangler. Sivan har svensk på profilen og fikk
          // norsk, fordi Fred hadde vært innom først.
          document.cookie = "relavo_sprak=; path=/; max-age=0";
          await createClient().auth.signOut();
          router.push("/logg-inn");
          router.refresh();
        })
      }
      className="w-full text-left text-[12px] text-faint hover:text-ink px-3 py-1.5 rounded-lg hover:bg-canvas transition disabled:opacity-50"
    >
      {venter ? venterTekst : tekst}
    </button>
  );
}
