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
