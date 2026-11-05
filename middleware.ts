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
const TOKENSIDER = ["/offert", "/ettersending", "/underleverandorer"];

/**
 * Ruter som kjøres av maskiner, ikke av folk.
 *
 * De må forbi både passordsperren og innloggingskravet — en planlagt jobb
 * har verken kapsel eller sesjon. Det er ikke et hull: de har sin egen
 * dør, CRON_SECRET i Authorization, og den er strengere enn begge de
 * andre. Uten dette ble cron-kallet sendt til /port, og overvåkingen
 * hadde aldri kjørt en eneste natt.
 */
const MASKINRUTER = ["/api/paminnelser", "/api/stripe/webhook", "/api/overvaking", "/api/synk-sanksjoner", "/api/synk-renhold"];

export async function middleware(request: NextRequest) {
  const sti = request.nextUrl.pathname;
  const medToken = TOKENSIDER.some((p) => sti.startsWith(`${p}/`));
  const maskin = MASKINRUTER.includes(sti);

  // Maskinrutene svarer selv på om kallet er legitimt.
  if (maskin) return NextResponse.next();

  // Portvakten kommer først av alt. Er SIDE_PASSORD satt, slipper ingen
  // inn noe sted uten kapselen — heller ikke forsiden, og heller ikke
  // API-rutene. Er variabelen ikke satt, er sperren av.
  // RELAVO_APEN=1 slår sperren av uten at passordet må slettes. Fjernes
  // variabelen, er sperren på igjen.
  const sidePassord = process.env.RELAVO_APEN === "1" ? undefined : process.env.SIDE_PASSORD;
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

  // Språk. Kundene ser bare norsk, overalt: landingssiden, registreringen og
  // appen. Svensk og engelsk finnes for oss som eier siden, og bare når vi er
  // innlogget som ansatt. Én video, ett sett markedsmateriell.
  //
  // Språket ligger i en kapsel, fordi rotoppsettet må vite det uten å slå
  // opp i databasen på hver sidevisning. Kapselen er lett å endre for hvem
  // som helst, så den gjelder bare når profilen sier ansatt. Det slås opp
  // bare når kapselen peker på noe annet enn norsk, eller mangler for en
  // innlogget bruker; vanlige kunder koster ingen ekstra spørring.
  const kapsel = request.cookies.get(KAPSEL_SPRAK)?.value;
  // Bare norsk og svensk er i bruk. Engelsk finnes i ordboka, men velges ikke.
  const settNorsk = () => {
    request.cookies.set(KAPSEL_SPRAK, "no");
    response = NextResponse.next({ request: { headers: videre } });
    response.cookies.set(KAPSEL_SPRAK, "no", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  };
  if (erSprak(kapsel) && kapsel !== "no" && !user) {
    settNorsk();
  } else if (user && (!erSprak(kapsel) || kapsel !== "no")) {
    const { data } = await supabase
      .from("profiler")
      .select("sprak, ansatt")
      .eq("id", user.id)
      .maybeSingle();
    if (data?.ansatt) {
      // Ansatt: profilens valg gjelder når kapselen mangler på en ny maskin.
      if (kapsel === "en") {
        settNorsk();
      } else if (!erSprak(kapsel) && (data.sprak === "no" || data.sprak === "sv")) {
        request.cookies.set(KAPSEL_SPRAK, data.sprak);
        response = NextResponse.next({ request: { headers: videre } });
        response.cookies.set(KAPSEL_SPRAK, data.sprak, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      }
    } else {
      settNorsk();
      // Gammelt valg på profilen (fra da kundene kunne velge) ryddes bort.
      if (data && data.sprak && data.sprak !== "no") {
        await supabase.from("profiler").update({ sprak: "no" }).eq("id", user.id);
      }
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
    "/glemt-passord",
    "/tofaktor",
    "/kontakt",
    "/juridisk",
    "/veiledning",
    "/guide",
    "/video",
    "/robots.txt",
    "/sitemap.xml",
    "/api/kommune",
    "/api/feil",
    "/api/stripe/webhook",
    "/auth/callback",
    "/auth/bekreft",
    "/auth/epost",
    "/bekreft-epost",
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
