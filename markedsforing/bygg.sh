#!/bin/bash
# Lager PDF og PNG av alt markedsmateriell. Kjør etter python3 bygg_materiell.py.
cd "$(dirname "$0")"
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
pdf() { "$C" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 --print-to-pdf="$PWD/$2" "file://$PWD/$1" >/dev/null 2>&1; }
png() { "$C" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=$4 --window-size=$3 --screenshot="$PWD/$2" "file://$PWD/$1" >/dev/null 2>&1; }
for d in kommune bolag; do
  pdf $d/presentasjon.html $d/presentasjon.pdf
  pdf $d/brosjyre.html $d/brosjyre.pdf
  png $d/brosjyre.html $d/brosjyre.png 794,1123 3
  png $d/linkedin-banner.html $d/linkedin-banner.png 1200,628 2
  pdf $d/linkedin-karusell.html $d/linkedin-karusell.pdf
  png $d/linkedin-karusell.html $d/linkedin-karusell-forside.png 1080,1080 1
done
