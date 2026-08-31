/**
 * Plasshold for typene Supabase genererer automatisk fra databaseskjemaet.
 *
 * Når prosjektet er koblet til et ekte Supabase-prosjekt, kjør:
 *   npx supabase gen types typescript --project-id <ditt-prosjekt-id> > lib/supabase/types.ts
 *
 * Det erstatter denne filen med nøyaktige typer for hver tabell, så
 * feil som `.from("leverandorer").select("nvn")` (skrivefeil) fanges
 * av TypeScript i stedet for å feile stille i nettleseren.
 */
/**
 * Plasshold. Denne filen brukes ikke ennå — se kommentarene i
 * lib/supabase/client.ts og server.ts for hvorfor.
 *
 * Når prosjektet er koblet til et ekte Supabase-prosjekt, kjør:
 *   npx supabase gen types typescript --project-id <ditt-prosjekt-id> > lib/supabase/types.ts
 *
 * Det skriver over denne filen med nøyaktige typer for hver tabell. Legg
 * deretter til <Database> som generic på createBrowserClient/createServerClient
 * i client.ts og server.ts, så fanger TypeScript feil som
 * `.from("leverandorer").select("nvn")` (skrivefeil i kolonnenavn).
 */
export type Database = Record<string, never>;

