#!/bin/bash
cd "$(dirname "$0")"
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in profilbilde highlight-plattform highlight-priser highlight-kommune highlight-selskap highlight-sporsmal post-1-velkommen post-2-registre post-3-kjeden; do
  "$C" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=1 --window-size=1080,1080 --screenshot="$PWD/$f.png" "file://$PWD/$f.html" >/dev/null 2>&1
done
