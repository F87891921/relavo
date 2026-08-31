import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Brukes i Server Components, Route Handlers og Server Actions. Leser og
 * skriver auth-cookien slik at innlogging henger sammen på tvers av
 * navigasjon. Må kalles på nytt per request — ikke gjenbruk én instans.
 *
 * Ingen Database-generic ennå — se samme kommentar i client.ts.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Kalt fra en Server Component uten skrivetilgang til cookies.
            // Ufarlig så lenge middleware.ts fornyer sesjonen på hver request.
          }
        },
      },
    }
  );
}
