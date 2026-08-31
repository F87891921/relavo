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

  // Snudd på hodet: alt krever innlogging bortsett fra det som er uttrykkelig
  // åpent. Med den gamle lista over beskyttede stier ble hver nye rute
  // offentlig til noen husket å legge den til.
  const APNE = ["/", "/logg-inn", "/juridisk", "/auth/callback"];
  const sti = request.nextUrl.pathname;
  const apen = APNE.some((p) => sti === p || sti.startsWith(`${p}/`));
  const beskyttet = !apen;

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
