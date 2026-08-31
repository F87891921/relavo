import { createBrowserClient } from "@supabase/ssr";

/**
 * Brukes i client components ("use client"). Leser nøklene fra
 * NEXT_PUBLIC_-miljøvariablene, som er trygge å eksponere i nettleseren —
 * tilgangen begrenses av Row Level Security i databasen, ikke av at nøkkelen
 * holdes hemmelig.
 *
 * Ingen Database-generic ennå — det krever ekte genererte typer (se
 * lib/supabase/types.ts). Legg til <Database> her når de finnes:
 *   createBrowserClient<Database>(...)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
