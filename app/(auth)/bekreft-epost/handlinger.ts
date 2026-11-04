"use server";

import { createClient } from "@/lib/supabase/server";
import { grunnUrl } from "@/lib/url";
import { aktivtSprak } from "@/lib/sprak";
import { sendBekreftelse } from "@/lib/epostbekreftelse";

export async function sendPaNytt(): Promise<{ ok: boolean; feil?: "vent" | "sending" | "innlogging" }> {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user?.email) return { ok: false, feil: "innlogging" };

  const r = await sendBekreftelse({
    userId: user.id,
    epost: user.email,
    sprak: aktivtSprak(),
    origin: grunnUrl(),
  });
  return r.ok ? { ok: true } : { ok: false, feil: r.feil };
}
