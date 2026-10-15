"""Genererer markedsmateriellet (HTML). PDF/PNG lages med Chrome, se bygg.sh.
Kjør: python3 bygg_materiell.py
"""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
sti = (ROOT.parent / "components" / "relavo-path.ts").read_text()
D = re.search(r'RELAVO_PATH\s*=\s*\n?\s*"([^"]+)"', sti).group(1)

def mark(fill, cls="mark"):
    return f'<svg class="{cls}" viewBox="0 0 327 312" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" fill="{fill}" d="{D}"/></svg>'

FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
FIRMA = "LOD TECH AB NUF · org.nr 938 518 858"

BASE = """
* { box-sizing: border-box; margin: 0; padding: 0 }
body { font-family: Inter, system-ui, sans-serif; color: #1d1d1f; -webkit-font-smoothing: antialiased }
ul { list-style: none }
"""

# ----------------------------------------------------------------- Presentasjon
PRES_CSS = BASE + """
@page { size: 1280px 720px; margin: 0 }
html, body { width: 1280px }
.s { width: 1280px; height: 720px; position: relative; overflow: hidden; break-after: page; padding: 70px 84px 0; background: #fff }
.s.mork { background: #654b70; color: #fff }
.kick { font-size: 15px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #654b70 }
.mork .kick { color: #e4d7ec }
h1 { font-size: 70px; line-height: 1.05; font-weight: 800; letter-spacing: -0.035em; margin-top: 18px }
h1 em { font-style: normal; color: #e4d7ec }
h2 { font-size: 44px; line-height: 1.1; font-weight: 800; letter-spacing: -0.03em; margin-top: 14px; max-width: 1000px }
h3 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 10px }
p { font-size: 19px; line-height: 1.5; color: #4a4548 }
.lead { margin-top: 26px; font-size: 25px; line-height: 1.45; color: rgba(255,255,255,.86); max-width: 800px }
.cov { position: relative; height: 100%; padding-bottom: 58px; display: flex; flex-direction: column; justify-content: space-between }
.logo { display: flex; align-items: center; gap: 14px } .logo .mark { width: 46px } .logo span { font-size: 36px; font-weight: 800; letter-spacing: -0.03em }
.bunn { display: flex; justify-content: space-between; font-size: 17px; color: rgba(255,255,255,.75); font-weight: 600 }
.ring { position: absolute; right: -180px; top: -170px; width: 640px; height: 640px; border-radius: 50%; border: 100px solid rgba(255,255,255,.07) }
.ring2 { position: absolute; right: 160px; bottom: -380px; width: 520px; height: 520px; border-radius: 50%; background: rgba(255,255,255,.06) }
.fot { position: absolute; left: 84px; right: 84px; bottom: 30px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; color: #8a8289 }
.fot span:first-child { display: flex; align-items: center; gap: 8px; color: #654b70; font-weight: 800; font-size: 16px; letter-spacing: -0.02em }
.m2 { width: 20px }
.tre { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 44px }
.boks { background: #f6f3f8; border-radius: 18px; padding: 30px 28px 32px }
.boks .n { display: block; font-size: 20px; font-weight: 800; color: #654b70; margin-bottom: 16px }
.boks p { font-size: 17px }
.to { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 44px; align-items: start }
.lys { background: #f6f3f8; border-radius: 18px; padding: 30px 32px }
li { font-size: 19px; line-height: 1.4; padding: 9px 0 9px 28px; position: relative; color: #3a363b }
li::before { content: ""; position: absolute; left: 0; top: 17px; width: 11px; height: 11px; border-radius: 50%; background: #654b70 }
.stor { font-size: 28px; line-height: 1.3; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; margin-bottom: 18px }
.steg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; margin-top: 52px }
.steg b { display: flex; width: 54px; height: 54px; border-radius: 50%; background: #654b70; color: #fff; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px }
.note { margin-top: 40px; font-size: 20px; font-weight: 600; color: #654b70 }
.rutenett { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 22px; margin-top: 38px }
.rutenett > div { border-top: 3px solid #654b70; padding-top: 16px }
.rutenett p { font-size: 16.5px }
.pris { display: grid; grid-template-columns: 1.6fr 1fr; gap: 40px; margin-top: 34px; align-items: start }
table { width: 100%; border-collapse: collapse; font-size: 19px }
th { text-align: right; font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #8a8289; padding: 0 0 12px }
th:first-child, td:first-child { text-align: left }
td { text-align: right; padding: 15px 0; border-top: 1px solid #e5e0e8; font-weight: 700; font-variant-numeric: tabular-nums }
td small { display: block; font-weight: 400; font-size: 13.5px; color: #8a8289 }
td .sp { display: inline; font-size: 12px; color: #3d7a4f; font-weight: 700; margin-left: 6px }
td[colspan] { color: #654b70 }
.side { background: #f6f3f8; border-radius: 18px; padding: 26px 28px }
.side p { font-size: 17px } .side li { font-size: 17px; padding: 6px 0 6px 26px } .side li::before { top: 13px }
.side .liten { margin-top: 12px; font-size: 15.5px; color: #654b70; font-weight: 600 }
"""

def slide(i, n, inner, cls=""):
    foot = "" if cls == "mork" else f'<div class="fot"><span>{mark("#654b70","m2")}Relavo</span><span>{i:02d} / {n:02d}</span></div>'
    return f'<section class="s {cls}">{inner}{foot}</section>'

def cover(kick, h1a, h1b, lead, kontakt):
    return f'''<div class="ring"></div><div class="ring2"></div><div class="cov">
 <div class="logo">{mark("#ffffff")}<span>Relavo</span></div>
 <div><div class="kick">{kick}</div><h1>{h1a}<br><em>{h1b}</em></h1><p class="lead">{lead}</p></div>
 <div class="bunn"><span>{kontakt}</span><span>{FIRMA}</span></div></div>'''

def deck(tittel, slides):
    n = len(slides)
    sek = "".join(slide(i + 1, n, inner, cls) for i, (inner, cls) in enumerate(slides))
    return f'<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>{tittel}</title>{FONT}<style>{PRES_CSS}</style></head><body>{sek}</body></html>'

# --- kommune
k_slides = [
 (cover("Leverandørkontroll etter §§ 5e–5k", "Kontrollen du må gjøre.", "Beviset du må ha.", "Slik dokumenterer kommunen leverandørkontrollen som gjelder fra 1. juli 2026.", "relavo.no · post@relavo.no"), "mork"),
 ('''<div class="kick">Hva som endres</div><h2>Fra 1. juli 2026 er kontrollplikten uttrykkelig.</h2>
<div class="tre">
 <div class="boks"><b class="n">§ 5i</b><h3>Kontrollen må kunne dokumenteres</h3><p>Det holder ikke at kontrollen ble gjort. Kommunen må kunne vise i ettertid hva som ble sjekket, mot hvilke kilder, og når.</p></div>
 <div class="boks"><b class="n">§ 5k</b><h3>Høyst to ledd underleverandører</h3><p>I bygg, anlegg og renhold er taket to ledd. Kjøperen må vite hvor dyp kjeden er, ikke bare hvem hovedleverandøren er.</p></div>
 <div class="boks"><b class="n">§ 24-2</b><h3>Avvisning når kravene ikke er oppfylt</h3><p>Konkurs, tvangsavvikling og manglende godkjenning er avvisningsgrunner. Det må fanges opp før kontrakten signeres, og mens den løper.</p></div>
</div>''', ""),
 ('''<div class="kick">Slik fungerer det</div><h2>Fra organisasjonsnummer til dokumentasjon.</h2>
<div class="steg">
 <div><b>1</b><h3>Legg inn organisasjonsnummeret</h3><p>Ett nummer, eller mange på en gang. Nummeret kontrolleres mens du skriver.</p></div>
 <div><b>2</b><h3>Relavo henter og vurderer</h3><p>Registrene slås opp og vurderes mot kravene i regelverket. Hvert krav får sin egen linje, med kilde og dato.</p></div>
 <div><b>3</b><h3>Rapporten lagres</h3><p>Lastes ned som PDF og ligger klar for anskaffelsesprotokollen, også om et år.</p></div>
</div><p class="note">Det som ikke er kontrollert, står oppført som ikke kontrollert. Aldri som i orden.</p>''', ""),
 ('''<div class="kick">Hva rapporten dekker</div><h2>Én kontroll, alle registre.</h2>
<div class="rutenett">
 <div><h3>Selskapet</h3><p>Opplysninger fra Enhetsregisteret, bransje og status.</p></div>
 <div><h3>Roller</h3><p>Styre og daglig leder, kontrollert mot andre i anskaffelsen for å varsle om mulig habilitetsspørsmål.</p></div>
 <div><h3>Sanksjonslister</h3><p>Selskap og tilknyttede roller sjekkes mot sanksjonslister.</p></div>
 <div><h3>Renholdsregisteret</h3><p>Godkjenning etter renholdsordningen. Å kjøpe fra et selskap uten godkjenning er ulovlig.</p></div>
 <div><h3>Leverandørkjeden (§ 5k)</h3><p>Leverandøren oppgir underleverandørene via en lenke. Relavo kontrollerer hvert ledd og flagger det som går over taket.</p></div>
 <div><h3>Skatteattest og ESPD</h3><p>Leverandøren laster selv opp attesten og egenerklæringen, og de lagres sammen med kontrollen.</p></div>
</div>''', ""),
 ('''<div class="kick">Etter kontrollen</div><h2>Tilbudene og leverandørene følges opp.</h2>
<div class="to">
 <div class="lys"><h3>Unormalt lave tilbud (§ 24-9)</h3><ul><li>Avvik per tilbud, regnet mot de øvrige</li><li>Flagg på de som ligger unormalt lavt</li><li>Utkast til den redegjørelsen kommunen må be om</li><li>Indikasjoner fra årsregnskapet, for eksempel omsetning per ansatt</li></ul></div>
 <div class="lys"><h3>Daglig overvåking</h3><ul><li>Konkurs og tvangsavvikling</li><li>Tapt renholdsgodkjenning</li><li>Ny daglig leder og endringer i styret</li><li>Varsel på e-post når noe krever handling</li></ul></div>
</div>''', ""),
 ('''<div class="kick">Pris og trygghet</div><h2>Pris etter kommunens innbyggertall.</h2>
<div class="pris">
 <table><thead><tr><th>Kommunestørrelse</th><th>12 mnd</th><th>24 mnd</th><th>36 mnd</th></tr></thead><tbody>
  <tr><td><b>Liten</b><small>under 10 000 innbyggere</small></td><td>3 900</td><td>3 600</td><td>3 300</td></tr>
  <tr><td><b>Kommune</b><small>10 000–25 000</small></td><td>7 900</td><td>7 300</td><td>6 700</td></tr>
  <tr><td><b>Medelstor</b><small>25 000–50 000</small></td><td>12 900</td><td>11 900</td><td>11 000</td></tr>
  <tr><td><b>Stor</b><small>over 50 000</small></td><td colspan="3">Tilbud etter størrelse</td></tr></tbody></table>
 <div class="side"><p><b>Kr per måned, eks. mva.</b></p>
  <ul><li>Ubegrenset antall kontroller, brukere og leverandører</li><li>Fast pris i hele avtaleperioden</li><li>Tofaktor og drift innenfor EØS</li><li>Eksport og sletting av dataene når som helst</li></ul>
  </div>
</div>''', ""),
 (cover("Neste steg", "Skal vi vise det på", "en av dine leverandører?", "Tjue minutter, så ser du hvordan rapporten faktisk ser ut.", "post@relavo.no · relavo.no"), "mork"),
]
(ROOT / "kommune" / "presentasjon.html").write_text(deck("Relavo for kommuner", k_slides))

# --- bolag
b_slides = [
 (cover("For bygg, anlegg og renhold", "Sjekk leverandørene før de starter.", "Ha beviset når noen spør.", "Relavo kontrollerer underentreprenørene og leverandørene dine mot offentlige registre, og lagrer resultatet.", "relavo.no · post@relavo.no"), "mork"),
 ('''<div class="kick">Hvorfor det lønner seg</div><h2>Kravene til leverandørkjeden blir strengere.</h2>
<div class="tre">
 <div class="boks"><b class="n">Offentlige kunder</b><h3>Må kontrollere leverandørene sine</h3><p>Fra 1. juli 2026 må offentlige oppdragsgivere kunne dokumentere kontrollen etter §§ 5e–5k. Det treffer dere som leverandør.</p></div>
 <div class="boks"><b class="n">Åpenhetsloven</b><h3>Aktsomhet i hele kjeden</h3><p>Større virksomheter må gjøre aktsomhetsvurderinger i leverandørkjeden og offentliggjøre en redegjørelse hvert år.</p></div>
 <div class="boks"><b class="n">Bygg og renhold</b><h3>Plikt til å påse</h3><p>Den som bestiller i en bransje med allmenngjort tariffavtale har informasjons- og påseplikt overfor leverandørens lønns- og arbeidsvilkår.</p></div>
</div>''', ""),
 ('''<div class="kick">Slik fungerer det</div><h2>Fra organisasjonsnummer til rapport.</h2>
<div class="steg">
 <div><b>1</b><h3>Legg inn leverandørene</h3><p>Ett organisasjonsnummer eller mange på en gang.</p></div>
 <div><b>2</b><h3>Få rapporten</h3><p>Registrene slås opp, og hvert punkt får sin egen linje med kilde og dato.</p></div>
 <div><b>3</b><h3>Hold oversikten</h3><p>Rapportene lagres, og du får varsel hvis noe endrer seg etterpå.</p></div>
</div><p class="note">Svaret kommer før du rekker å åpne neste fane.</p>''', ""),
 ('''<div class="kick">Hva rapporten dekker</div><h2>Alt du trenger å vite om en leverandør.</h2>
<div class="rutenett">
 <div><h3>Selskapet</h3><p>Opplysninger fra Enhetsregisteret, bransje og status.</p></div>
 <div><h3>Roller</h3><p>Styre og daglig leder, med varsel hvis personer går igjen hos flere leverandører.</p></div>
 <div><h3>Sanksjonslister</h3><p>Selskap og tilknyttede roller sjekkes mot sanksjonslister.</p></div>
 <div><h3>Renholdsregisteret</h3><p>Godkjenning etter renholdsordningen, for dere som kjøper renholdstjenester.</p></div>
 <div><h3>Underleverandørkjeden</h3><p>Leverandøren oppgir hvem som utfører arbeidet via en lenke. Hvert ledd kontrolleres, og du ser kjeden som et tre.</p></div>
 <div><h3>Skatteattest</h3><p>Leverandøren laster selv opp attesten, og den lagres med kontrollen.</p></div>
</div>''', ""),
 ('''<div class="kick">Etter kontrollen</div><h2>Daglig overvåking av alle leverandørene.</h2>
<div class="to">
 <div><p class="stor">Dere får vite det når noe endrer seg, ikke først ved neste kontroll.</p><p>Hver natt sammenlignes leverandørene med registrene. Dere får e-post når noe krever handling.</p></div>
 <div class="lys"><h3>Det overvåkes</h3><ul><li>Konkurs og tvangsavvikling</li><li>Selskapet slettet fra registeret</li><li>Tapt renholdsgodkjenning</li><li>Ny daglig leder og endringer i styret</li><li>Navnebytte og nytt årsregnskap</li></ul></div>
</div>''', ""),
 ('''<div class="kick">Pris</div><h2>Billigere enn enkeltkontroller, uansett nivå.</h2>
<div class="pris">
 <table><thead><tr><th>Nivå</th><th>Månedlig</th><th>12 mnd</th><th>24 mnd</th><th>36 mnd</th></tr></thead><tbody>
  <tr><td><b>Start</b><small>opptil 50 leverandører</small></td><td>3 300</td><td>2 900</td><td>2 700</td><td>2 500</td></tr>
  <tr><td><b>Vekst</b><small>opptil 150 leverandører</small></td><td>6 700</td><td>5 900</td><td>5 400</td><td>5 000</td></tr>
  <tr><td><b>Bygg</b><small>opptil 400 leverandører</small></td><td>13 600</td><td>11 900</td><td>10 900</td><td>10 100</td></tr>
  <tr><td><b>Over 400</b></td><td colspan="4">Tilbud etter behov</td></tr></tbody></table>
 <div class="side"><p><b>Kr per måned, eks. mva.</b></p>
  <ul><li>Ubegrenset antall kontroller og brukere</li><li>Månedlig uten binding, eller betal for lengre avtale og spar</li><li>Spar fra 11 % til 66 % mot enkeltkontroller</li><li>Kort eller faktura</li></ul>
  <p class="liten">Enkeltkontroll uten abonnement: 890 kr.</p></div>
</div>''', ""),
 (cover("Neste steg", "Prøv det på", "en av leverandørene dine.", "Kjør én kontroll for 890 kr og se hvordan rapporten ser ut, eller book tjue minutter, så viser vi det.", "post@relavo.no · relavo.no"), "mork"),
]
(ROOT / "bolag" / "presentasjon.html").write_text(deck("Relavo for bolag", b_slides))


# ----------------------------------------------------------------- One-pager (A4)
ONE_CSS = BASE + """
@page { size: 210mm 297mm; margin: 0 }
body { width: 210mm; height: 297mm; background: #fff; position: relative; overflow: hidden }
.glow { position: absolute; right: -60mm; top: -50mm; width: 150mm; height: 150mm; border-radius: 50%; background: radial-gradient(circle, #ece6f1 0%, rgba(236,230,241,0) 70%) }
.wrap { position: relative; padding: 16mm 17mm 0 17mm }
.logo { display: flex; align-items: center; gap: 3.2mm }
.mark { width: 9.5mm; height: auto }
.ord { font-size: 7.4mm; font-weight: 800; letter-spacing: -0.03em; color: #654b70 }
.for { margin-left: auto; font-size: 3.2mm; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #8a8289 }
.kicker { margin-top: var(--topp, 20mm); font-size: 3.4mm; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #654b70 }
h1 { margin-top: 4mm; font-size: var(--h1, 14.5mm); text-wrap: balance; line-height: 1.03; font-weight: 800; letter-spacing: -0.035em }
h1 span { color: #654b70 }
.lead { margin-top: 7mm; max-width: 150mm; font-size: 4.6mm; line-height: 1.5; color: #4a4548 }
.kort { margin-top: 12mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm }
.k { background: #f6f3f8; border-radius: 4mm; padding: 6mm 5.5mm 6.5mm }
.k b.n { display: block; font-size: 3.2mm; font-weight: 700; letter-spacing: .1em; color: #654b70; margin-bottom: 3.5mm }
.k h3 { font-size: 4.9mm; line-height: 1.2; font-weight: 700; letter-spacing: -0.015em; margin-bottom: 2.6mm }
.k p { font-size: 3.55mm; line-height: 1.5; color: #4a4548 }
.tall { margin-top: 7mm; background: #654b70; border-radius: 4mm; color: #fff; display: grid; grid-template-columns: repeat(3, 1fr); padding: 7mm 6mm }
.tall div { padding: 0 4mm; border-left: 1px solid rgba(255,255,255,.22) }
.tall div:first-child { border-left: 0 }
.tall strong { display: block; font-size: 9mm; line-height: 1; font-weight: 800; letter-spacing: -0.03em }
.tall span { display: block; margin-top: 2.2mm; font-size: 3.3mm; line-height: 1.4; color: rgba(255,255,255,.82) }
.pris { margin-top: 9mm; display: flex; gap: 8mm; align-items: flex-end; justify-content: space-between }
.pris .t { font-size: 3.4mm; color: #8a8289; font-weight: 600; letter-spacing: .1em; text-transform: uppercase }
.pris .b { margin-top: 2mm; font-size: 6.4mm; font-weight: 800; letter-spacing: -0.02em }
.pris .b small { font-size: 3.6mm; font-weight: 500; color: #4a4548; letter-spacing: 0 }
.pris p { margin-top: 1.8mm; font-size: 3.4mm; color: #4a4548; max-width: 105mm; line-height: 1.45 }
.cta { background: #1d1d1f; color: #fff; border-radius: 3.2mm; padding: 4.2mm 6.5mm; font-size: 4.2mm; font-weight: 700; white-space: nowrap }
.foot { position: absolute; left: 17mm; right: 17mm; bottom: 12mm; border-top: 1px solid #e5e0e8; padding-top: 4mm; display: flex; justify-content: space-between; font-size: 3mm; color: #8a8289 }
"""

def onepager(tittel, for_tekst, kicker, h1a, h1b, lead, kort, tall, prislinje, pristekst, h1mm=14.5, topp=20):
    k = "".join(f'<div class="k"><b class="n">{n}</b><h3>{h}</h3><p>{p}</p></div>' for n, h, p in kort)
    t = "".join(f'<div><strong>{a}</strong><span>{b}</span></div>' for a, b in tall)
    return f'''<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>{tittel}</title>{FONT}<style>{ONE_CSS}</style></head><body>
<div class="glow"></div><div class="wrap" style="--h1:{h1mm}mm;--topp:{topp}mm">
<div class="logo">{mark("#654b70")}<span class="ord">Relavo</span><span class="for">{for_tekst}</span></div>
<div class="kicker">{kicker}</div><h1>{h1a}<br><span>{h1b}</span></h1><p class="lead">{lead}</p>
<div class="kort">{k}</div><div class="tall">{t}</div>
<div class="pris"><div><div class="t">{prislinje[0]}</div><div class="b">{prislinje[1]} <small>{prislinje[2]}</small></div><p>{pristekst}</p></div><div class="cta">relavo.no</div></div>
</div><div class="foot"><span>{FIRMA}</span><span>post@relavo.no · relavo.no</span></div></body></html>'''

(ROOT / "kommune" / "brosjyre.html").write_text(onepager("Relavo for kommuner", "For kommuner og innkjøpssamarbeid", "§§ 5e–5k gjelder fra 1. juli 2026",
 "Kontrollen du må gjøre.", "Beviset du må ha.",
 "Fra 1. juli 2026 må kommunen kunne dokumentere at leverandørene er kontrollert. Relavo gjør kontrollen mot offentlige registre og lagrer resultatet, slik at du kan vise det i anskaffelsesprotokollen.",
 [("01","Én kontroll, alle registre","Selskapsdata, roller, sanksjonslister og renholdsregisteret i én rapport, med kilde og dato på hver linje."),
  ("02","Hele leverandørkjeden","§ 5k tillater høyst to ledd underleverandører i bygg, anlegg og renhold. Leverandøren oppgir kjeden via en lenke, og Relavo kontrollerer hvert ledd og flagger det som går over."),
  ("03","Dokumentasjon som holder","Hver kjøring lagres uendret og kan hentes fram igjen. Det som ikke er kontrollert, står oppført som ikke kontrollert.")],
 [("2","ledd underleverandører er taket i bygg, anlegg og renhold"),("Daglig","overvåking av konkurs, tvangsavvikling og tapt renholdsgodkjenning"),("Ubegrenset","antall kontroller og brukere, uten tillegg")],
 ("Pris etter kommunens innbyggertall","Fra 3 900 kr","per måned, eks. mva."), "Fast pris i avtaleperioden, fakturert årlig i forskudd."))

(ROOT / "bolag" / "brosjyre.html").write_text(onepager("Relavo for bolag", "For bygg, anlegg og renhold", "Leverandørkontroll for entreprenører og bestillere",
 "Sjekk leverandørene før de starter.", "Ha beviset når noen spør.",
 "Relavo kontrollerer underentreprenørene og leverandørene dine mot offentlige registre og lagrer resultatet. Du ser hvem du jobber med, hvor lang kjeden er, og du får varsel hvis noe endrer seg.",
 [("01","Alle registre i én rapport","Selskapsdata, roller, sanksjonslister og renholdsregisteret, med kilde og dato på hver linje."),
  ("02","Hele underleverandørkjeden","Be leverandøren oppgi hvem som utfører arbeidet. Relavo kontrollerer hvert ledd, og du ser kjeden som et tre."),
  ("03","Overvåking hver natt","Konkurs, tvangsavvikling, tapt renholdsgodkjenning og ny daglig leder fanges opp i den daglige kjøringen.")],
 [("50–400","leverandører i planen, fra Start til Bygg"),("−66 %","opptil, mot å kjøpe enkeltkontroller"),("Ubegrenset","antall kontroller og brukere")],
 ("Pris etter antall leverandører","Fra 2 900 kr","per måned, eks. mva."), "Månedlig uten binding, eller betal for 12, 24 eller 36 måneder og spar. Enkeltkontroll 890 kr uten abonnement.", h1mm=12.2, topp=14))

# ----------------------------------------------------------------- Banner (LinkedIn, 1200x628)
BAN_CSS = BASE + """
body { width: 1200px; height: 628px; background: #654b70; color: #fff; position: relative; overflow: hidden }
.ring { position: absolute; right: -170px; top: -150px; width: 620px; height: 620px; border-radius: 50%; border: 90px solid rgba(255,255,255,.07) }
.ring2 { position: absolute; right: 130px; bottom: -330px; width: 480px; height: 480px; border-radius: 50%; background: rgba(255,255,255,.06) }
.in { position: relative; padding: 64px 72px }
.logo { display: flex; align-items: center; gap: 14px } .mark { width: 44px } .ord { font-size: 34px; font-weight: 800; letter-spacing: -0.03em }
h1 { margin-top: 74px; text-wrap: balance; font-size: 66px; line-height: 1.05; font-weight: 800; letter-spacing: -0.035em; max-width: 1000px }
h1 span { color: #e4d7ec }
p { margin-top: 28px; font-size: 27px; line-height: 1.4; color: rgba(255,255,255,.86); max-width: 760px }
.nede { position: absolute; left: 72px; right: 72px; bottom: 54px; display: flex; justify-content: space-between; align-items: center; font-size: 22px; font-weight: 600; color: rgba(255,255,255,.8) }
.pil { background: #fff; color: #654b70; border-radius: 14px; padding: 14px 26px; font-weight: 800; font-size: 24px }
"""
def banner(h1a, h1b, p, nede):
    return f'''<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>Relavo</title>{FONT}<style>{BAN_CSS}</style></head><body>
<div class="ring"></div><div class="ring2"></div><div class="in"><div class="logo">{mark("#ffffff")}<span class="ord">Relavo</span></div><h1>{h1a} <span>{h1b}</span></h1><p>{p}</p></div>
<div class="nede"><span>{nede}</span><span class="pil">relavo.no</span></div></body></html>'''
(ROOT / "kommune" / "linkedin-banner.html").write_text(banner("Kontrollen du må gjøre.", "Beviset du må ha.", "Leverandørkontroll etter §§ 5e–5k. Kontrollen gjøres mot offentlige registre og lagres som dokumentasjon.", "Fra 3 900 kr per måned etter innbyggertall"))
(ROOT / "bolag" / "linkedin-banner.html").write_text(banner("Sjekk leverandørene før de starter.", "Ha beviset når noen spør.", "Leverandørkontroll for bygg, anlegg og renhold. Registre, kjede og daglig overvåking i én tjeneste.", "Fra 2 900 kr per måned"))

# ----------------------------------------------------------------- Karusell (LinkedIn dokument, 1080x1080)
KAR_CSS = BASE + """
@page { size: 1080px 1080px; margin: 0 }
html, body { width: 1080px }
.c { width: 1080px; height: 1080px; position: relative; overflow: hidden; break-after: page; padding: 84px 84px 0; background: #fff }
.c.mork { background: #654b70; color: #fff }
.ring { position: absolute; right: -200px; top: -200px; width: 640px; height: 640px; border-radius: 50%; border: 100px solid rgba(255,255,255,.07) }
.kick { font-size: 22px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #654b70 }
.mork .kick { color: #e4d7ec }
h1 { margin-top: 26px; font-size: 96px; line-height: 1.04; font-weight: 800; letter-spacing: -0.04em }
h1 em { font-style: normal; color: #e4d7ec }
h2 { margin-top: 22px; font-size: 68px; line-height: 1.08; font-weight: 800; letter-spacing: -0.035em }
p { margin-top: 30px; font-size: 32px; line-height: 1.45; color: #4a4548 }
.mork p { color: rgba(255,255,255,.86) }
ul { list-style: none; margin-top: 34px } li { font-size: 34px; line-height: 1.35; padding: 14px 0 14px 46px; position: relative; color: #3a363b; font-weight: 500 }
li::before { content: ""; position: absolute; left: 0; top: 28px; width: 18px; height: 18px; border-radius: 50%; background: #654b70 }
.logo { display: flex; align-items: center; gap: 14px; position: absolute; left: 84px; bottom: 70px }
.logo .mark { width: 44px } .logo span { font-size: 34px; font-weight: 800; letter-spacing: -0.03em; color: #654b70 }
.mork .logo span { color: #fff }
.sid { position: absolute; right: 84px; bottom: 80px; font-size: 24px; font-weight: 700; color: #8a8289 }
.mork .sid { color: rgba(255,255,255,.7) }
.pil { display: inline-block; margin-top: 44px; background: #fff; color: #654b70; border-radius: 22px; padding: 26px 46px; font-size: 40px; font-weight: 800 }
.stort { font-size: 150px; line-height: 1; font-weight: 800; letter-spacing: -0.05em; color: #654b70; margin-top: 20px }
"""
def karusell(tittel, sider):
    n = len(sider); sek = ""
    for i, (cls, inner) in enumerate(sider, 1):
        lg = mark("#ffffff" if cls == "mork" else "#654b70")
        sek += f'<section class="c {cls}">{"<div class=ring></div>" if cls=="mork" else ""}{inner}<div class="logo">{lg}<span>Relavo</span></div><div class="sid">{i}/{n}</div></section>'
    return f'<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>{tittel}</title>{FONT}<style>{KAR_CSS}</style></head><body>{sek}</body></html>'

(ROOT / "kommune" / "linkedin-karusell.html").write_text(karusell("Relavo karusell kommune", [
 ("mork", '<div class="kick">§§ 5e–5k</div><h1>Kan kommunen bevise leverandørkontrollen?<br><em>Fra 1. juli må den kunne det.</em></h1>'),
 ("", '<div class="kick">Hva som endres</div><h2>Det holder ikke å gjøre kontrollen.</h2><p>Fra 1. juli 2026 må kommunen kunne dokumentere i ettertid hva som ble sjekket, mot hvilke kilder og når.</p>'),
 ("", '<div class="kick">Kjeden</div><h2>Høyst to ledd underleverandører.</h2><p>I bygg, anlegg og renhold er taket to ledd etter § 5k. Vet du hvor dyp kjeden er i din største kontrakt?</p>'),
 ("", '<div class="kick">Slik gjør Relavo det</div><h2>Fra organisasjonsnummer til dokumentasjon.</h2><ul><li>Legg inn organisasjonsnummeret</li><li>Få rapport med kilde og dato på hver linje</li><li>Lagres for anskaffelsesprotokollen</li></ul>'),
 ("mork", '<div class="kick">Pris etter innbyggertall</div><div class="stort">3 900 kr</div><p>per måned for kommuner under 10 000 innbyggere, eks. mva. Ubegrenset antall kontroller og brukere.</p><div class="pil">relavo.no</div>'),
]))
(ROOT / "bolag" / "linkedin-karusell.html").write_text(karusell("Relavo karusell bolag", [
 ("mork", '<div class="kick">For bygg, anlegg og renhold</div><h1>Vet du hvem som jobber for deg?<br><em>Og kan du bevise at du sjekket?</em></h1>'),
 ("", '<div class="kick">Det som er lett å overse</div><h2>Ting som endrer seg etter at kontrakten er signert.</h2><ul><li>Konkurs eller tvangsavvikling</li><li>Tapt renholdsgodkjenning</li><li>Ny daglig leder</li><li>For mange ledd underleverandører</li></ul>'),
 ("", '<div class="kick">Slik fungerer Relavo</div><h2>Én rapport per leverandør, hver natt oppdatert.</h2><p>Registre, roller, sanksjonslister og kjede, med kilde og dato på hver linje. Varsel når noe endrer seg.</p>'),
 ("", '<div class="kick">Pris</div><h2>Billigere enn enkeltkontroller.</h2><p>Fra 2 900 kr per måned for opptil 50 leverandører. Månedlig uten binding, eller spar med 12, 24 og 36 måneder.</p>'),
 ("mork", '<div class="kick">Prøv det</div><h2>Kjør én kontroll for 890 kr.</h2><p>Se hvordan rapporten ser ut på en av dine egne leverandører.</p><div class="pil">relavo.no</div>'),
]))
print("alt generert")
