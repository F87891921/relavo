import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { KAPSEL, avtrykk, likeStrenger } from "@/lib/portvakt";

/**
 * Kjøres på hver request. Supabase sin auth-cookie må fornyes jevnlig —
 * uten dette blir folk logget ut midt i en økt selv om de er aktive.
 * Beskytter også /(dashboard)-rutene: ingen sesjon → send til innlogging.
 */
export async function middleware(request: NextRequest) {
  const sti = request.nextUrl.pathname;

  // Portvakten kommer først av alt. Er SIDE_PASSORD satt, slipper ingen
  // inn noe sted uten kapselen — heller ikke forsiden, og heller ikke
  // API-rutene. Er variabelen ikke satt, er sperren av.
  const sidePassord = process.env.SIDE_PASSORD;
  if (sidePassord && sti !== "/port") {
    const kapsel = request.cookies.get(KAPSEL)?.value ?? "";
    const forventet = await avtrykk(sidePassord);
    if (!likeStrenger(kapsel, forventet)) {
      const url = request.nextUrl.clone();
      url.pathname = "/port";
      url.search = `?neste=${encodeURIComponent(sti + request.nextUrl.search)}`;
      return NextResponse.redirect(url);
    }
  }

  // Stien videresendes som header. Uten den vet ikke krevProfil hvor den
  // står, og ville sendt folk til /konto fra /konto — en evig runddans.
  request.headers.set("x-sti", sti);

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
  // /port må stå her. Uten den regnes sperresiden som beskyttet, sendes til
  // /logg-inn, som portvakten over fanger og sender tilbake til /port — en
  // evig runddans.
  const APNE = ["/", "/port", "/logg-inn", "/tofaktor", "/kontakt", "/juridisk", "/auth/callback"];
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
