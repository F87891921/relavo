"""Lager Instagram-materiell for Relavo. Kjør: python3 bygg_instagram.py (deretter chrome-rendering via bygg_instagram.sh)"""
import re, pathlib
here = pathlib.Path(__file__).parent
path = re.search(r'RELAVO_PATH =\s*"([^"]+)"', (here.parent.parent / "components/relavo-path.ts").read_text()).group(1)
MARK = lambda cls="mark", col="#fff": f'<svg class="{cls}" viewBox="0 0 327 312" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" fill="{col}" d="{path}"/></svg>'

HEAD = '''<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>Relavo</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;width:1080px;height:1080px;position:relative;overflow:hidden;background:#654b70;color:#fff}
.ring{position:absolute;border-radius:50%}
'''

def write(name, css, body):
    (here / f"{name}.html").write_text(HEAD + css + "</style></head><body>" + body + "</body></html>")

# Profilbilde: merket sentrert, med romslig margin siden Instagram beskjærer til sirkel.
write("profilbilde", ".mark{position:absolute;left:50%;top:50%;width:470px;transform:translate(-50%,-52%)}",
      MARK())

# Highlight-omslag (Instagram viser en sirkel midt i bildet)
for slug, ord_ in [("plattform", "Plattform"), ("priser", "Priser"), ("kommune", "Kommune"), ("selskap", "Selskap"), ("sporsmal", "Spørsmål")]:
    write(f"highlight-{slug}", ".mark{position:absolute;left:50%;top:41%;width:230px;transform:translate(-50%,-50%);opacity:.95}"
          ".t{position:absolute;left:0;right:0;top:63%;text-align:center;font-size:76px;font-weight:700;letter-spacing:-.02em}",
          MARK() + f'<div class="t">{ord_}</div>')

POST = ".in{position:absolute;inset:0;padding:90px}.logo{display:flex;align-items:center;gap:18px}.logo .mark{width:56px}.logo b{font-size:42px;font-weight:800;letter-spacing:-.03em}" \
       "h1{position:absolute;left:90px;right:90px;top:260px;font-size:92px;line-height:1.04;font-weight:800;letter-spacing:-.04em;text-wrap:balance}h1 span{color:#e4d7ec}" \
       "p{position:absolute;left:90px;right:90px;top:640px;font-size:38px;line-height:1.38;color:rgba(255,255,255,.88)}" \
       ".fot{position:absolute;left:90px;right:90px;bottom:80px;font-size:30px;font-weight:600;color:rgba(255,255,255,.75)}" \
       ".ring{right:-200px;top:-180px;width:700px;height:700px;border:100px solid rgba(255,255,255,.07)}"
def post(name, h, p, fot="relavo.no"):
    write(name, POST, f'<div class="ring"></div><div class="in"><div class="logo">{MARK()}<b>Relavo</b></div><h1>{h}</h1><p>{p}</p><div class="fot">{fot}</div></div>')

post("post-1-velkommen", "Kontrollen du må gjøre. <span>Beviset du må ha.</span>",
     "Relavo kontrollerer leverandørene dine mot offentlige registre og lagrer resultatet som dokumentasjon.")
post("post-2-registre", "Hver linje har <span>kilde og dato.</span>",
     "Enhetsregisteret, sanksjonslister, renholdsregisteret og skatteattest, samlet i én rapport per leverandør.")
post("post-3-kjeden", "Hvem utfører <span>jobben egentlig?</span>",
     "Se hvor mange ledd det er i underleverandørkjeden, og få varsel hvis noe endrer seg.")
(here / "bygg_instagram.sh").write_text('''#!/bin/bash
cd "$(dirname "$0")"
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in profilbilde highlight-plattform highlight-priser highlight-kommune highlight-selskap highlight-sporsmal post-1-velkommen post-2-registre post-3-kjeden; do
  "$C" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=1 --window-size=1080,1080 --screenshot="$PWD/$f.png" "file://$PWD/$f.html" >/dev/null 2>&1
done
''')
