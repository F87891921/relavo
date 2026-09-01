import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { KAPSEL, avtrykk, likeStrenger } from "@/lib/portvakt";
import { KAPSEL_SPRAK, erSprak } from "@/lib/sprak/felles";

/**
 * Kjøres på hver request. Supabase sin auth-cookie må fornyes jevnlig —
 * uten dette blir folk logget ut midt i en økt selv om de er aktive.
 * Beskytter også /(dashboard)-rutene: ingen sesjon → send til innlogging.
 */
/**
 * Sider som er ment for noen utenfor Relavo og utenfor kundens organisasjon:
 * leverandøren som skal ettersende en egenerklæring, og kunden som skal ta
 * stilling til et tilbud. Begge kommer med et token i lenken, og token er
 * nøkkelen — det er derfor de også må slippe forbi passordsperren. Møter
 * mottakeren en passordrute, har lenken ingen hensikt.
 */
const TOKENSIDER = ["/offert", "/ettersending"];

export async function middleware(request: NextRequest) {
  const sti = request.nextUrl.pathname;
  const medToken = TOKENSIDER.some((p) => sti.startsWith(`${p}/`));

  // Portvakten kommer først av alt. Er SIDE_PASSORD satt, slipper ingen
  // inn noe sted uten kapselen — heller ikke forsiden, og heller ikke
  // API-rutene. Er variabelen ikke satt, er sperren av.
  const sidePassord = process.env.SIDE_PASSORD;
  if (sidePassord && sti !== "/port" && !medToken) {
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
  // står, og sender folk til den siden de allerede er på — en evig runddans.
  //
  // Headers på en NextRequest er uforanderlige. request.headers.set() gjør
  // ingenting og sier ingenting; headeren kom aldri fram, og gaten sendte
  // /betaling til /betaling i det uendelige. Riktig vei er å bygge et nytt
  // Headers-objekt og gi det til NextResponse.next().
  const videre = new Headers(request.headers);
  videre.set("x-sti", sti);

  let response = NextResponse.next({ request: { headers: videre } });

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
          response = NextResponse.next({ request: { headers: videre } });
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

  // Språket ligger i en kapsel, fordi rotoppsettet må vite det uten å slå
  // opp i databasen på hver eneste sidevisning. Men valget er lagret på
  // profilen, og på en ny maskin finnes ikke kapselen ennå. Da hentes den
  // her, én gang, og settes — ellers ville rotoppsettet stått på norsk mens
  // resten av siden var på svensk.
  if (user && !erSprak(request.cookies.get(KAPSEL_SPRAK)?.value)) {
    const { data } = await supabase
      .from("profiler")
      .select("sprak")
      .eq("id", user.id)
      .maybeSingle();
    if (erSprak(data?.sprak)) {
      request.cookies.set(KAPSEL_SPRAK, data.sprak);
      response = NextResponse.next({ request: { headers: videre } });
      response.cookies.set(KAPSEL_SPRAK, data.sprak, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
  }

  // Snudd på hodet: alt krever innlogging bortsett fra det som er uttrykkelig
  // åpent. Med den gamle lista over beskyttede stier ble hver nye rute
  // offentlig til noen husket å legge den til.
  // /port må stå her. Uten den regnes sperresiden som beskyttet, sendes til
  // /logg-inn, som portvakten over fanger og sender tilbake til /port — en
  // evig runddans.
  const APNE = [
    "/",
    "/port",
    "/logg-inn",
    "/registrer",
    "/tofaktor",
    "/kontakt",
    "/juridisk",
    "/auth/callback",
    ...TOKENSIDER,
  ];
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
