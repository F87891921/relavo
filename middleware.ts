import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Kjøres på hver request. Supabase sin auth-cookie må fornyes jevnlig —
 * uten dette blir folk logget ut midt i en økt selv om de er aktive.
 * Beskytter også /(dashboard)-rutene: ingen sesjon → send til innlogging.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /betaling og /velkommen krever innlogging, men ikke en organisasjon —
  // det er der kunden velger plan og oppretter selskapet sitt. Resten krever begge deler; selve
  // organisasjonssjekken gjøres i sidene, som kan slå opp i profiler.
  const beskyttet = request.nextUrl.pathname.startsWith("/oversikt") ||
    request.nextUrl.pathname.startsWith("/leverandorer") ||
    request.nextUrl.pathname.startsWith("/ny-kontroll") ||
    request.nextUrl.pathname.startsWith("/velkommen") ||
    request.nextUrl.pathname.startsWith("/betaling");

  if (beskyttet && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/logg-inn";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)"],
};
