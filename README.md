# Relavo

Leverandørkontroll for norske anskaffelser. Next.js 14 (App Router) + Supabase
(Postgres, Auth) + Vercel.

Dette er første skive av appen: innlogging og en ekte leverandørliste koblet
til Postgres, med Row Level Security. Resten av prototypen (§ 5k-kjeden,
ESPD, priser, personalvyen) bygges ut i samme mønster derfra.

## Kom i gang

### 1. Installer avhengigheter

```
npm install
```

### 2. Opprett et Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) → New project (gratisnivået holder til å starte)
2. Når prosjektet er klart: **Project Settings → API**
3. Kopier **Project URL** og **anon public key**

### 3. Sett opp miljøvariabler

```
cp .env.example .env.local
```

Lim inn URL-en og anon-nøkkelen fra steg 2.

### 4. Kjør databaseskjemaet

Åpne **SQL Editor** i Supabase-dashbordet, lim inn hele innholdet i
`supabase/migrations/0001_init.sql`, og kjør det. Det oppretter tabellene,
Row Level Security-reglene, og litt demodata (Bergen kommune med tre
leverandører) så appen ikke starter helt tom.

### 5. Opprett en innloggingsbruker

Skjemaet lager selskaper og leverandører, men ikke brukere — det gjøres via
Supabase sitt eget auth-system:

1. **Authentication → Users → Add user** i Supabase-dashbordet
2. Opprett en bruker med en e-post og et passord du velger
3. Kjør deretter i SQL Editor (bytt inn riktig e-post og bruker-id, som du
   finner i Authentication → Users):
   ```sql
   insert into profiler (id, organisasjon_id, navn, rolle)
   values ('<bruker-id-fra-auth>', '00000000-0000-0000-0000-000000000001', 'Ditt navn', 'administrator');
   ```

### 6. Kjør appen lokalt

```
npm run dev
```

Åpne [localhost:3000](http://localhost:3000), logg inn med brukeren fra
steg 5, og du skal se de tre demoleverandørene fra migreringen.

## Deploy til Vercel

1. Push dette repoet til GitHub
2. [vercel.com](https://vercel.com) → Add New → Project → velg repoet
3. Legg inn de samme to miljøvariablene fra `.env.local` under
   **Environment Variables** i Vercel sitt prosjektoppsett
4. Deploy — Vercel bygger og deployer automatisk ved hver push til main

## Neste steg, i rekkefølge

1. **Ny kontroll-flyten** — koble kontrollguiden mot en ekte oppslags-API
   (Brønnøysundregisteret sitt åpne API, eller Roaring/Creditsafe når
   avtale er på plass), og skriv resultatet til `kontroller`-tabellen
2. **§ 5k-kjeden** — `kjede_ledd`-tabellen er klar; bygg om
   leverandørkjede-siden til å lese og skrive dit i stedet for lokal state
3. **ESPD** — `espd_erklaringer`-tabellen dekker både faser (tilbud/løpende)
   som ble bygget i prototypen
4. **Personalvyen** — egen Next.js-rute bak et `rolle = 'administrator'`-sjekk,
   ikke en egen app

## Mappestruktur

```
app/
  page.tsx                     — forside
  (auth)/logg-inn/             — innlogging (Supabase Auth)
  (dashboard)/leverandorer/    — leverandørliste (ekte spørring)
  api/                         — Route Handlers, foreløpig tomme
components/
  RelavoMark.tsx                — R-merket som SVG-komponent
  DashboardShell.tsx            — sidemeny for innloggede sider
lib/supabase/
  client.ts                     — Supabase-klient for nettleseren
  server.ts                     — Supabase-klient for Server Components
  types.ts                      — erstattes av `supabase gen types`
supabase/migrations/
  0001_init.sql                  — hele databaseskjemaet + RLS + demodata
middleware.ts                    — fornyer innloggingsøkten, beskytter sider
```
