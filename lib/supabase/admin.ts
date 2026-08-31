import { createClient } from "@supabase/supabase-js";

/**
 * Klient med service_role. Går utenom Row Level Security og kan opprette
 * innlogginger — derfor bare på serveren, aldri i en client component.
 *
 * Nøkkelen har ingen NEXT_PUBLIC_-prefiks nettopp for at den ikke skal
 * kunne havne i nettleserbunten ved et uhell.
 */
export function admin() {
  const nokkel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!nokkel) throw new Error("SUPABASE_SERVICE_ROLE_KEY mangler");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, nokkel, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
