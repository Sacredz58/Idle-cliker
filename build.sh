#!/usr/bin/env bash
# Собирает два релизных архива: для Яндекс Игр и для CrazyGames.
# Консоль разработчика в обоих выключена. Запуск: bash build.sh
set -euo pipefail
cd "$(dirname "$0")"
YA_SDK='<script src="https://yandex.ru/games/sdk/v2"></script>'
CG_SDK='<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'
grep -qF "$YA_SDK" index.html

rm -rf dist build && mkdir -p dist/yandex dist/crazygames build
for t in yandex crazygames; do
  cp -r index.html style.css game.js img fonts "dist/$t/"
  sed -i 's/const DEV_ALLOWED=true/const DEV_ALLOWED=false/' "dist/$t/game.js"
  grep -q "const DEV_ALLOWED=false" "dist/$t/game.js"
done

# CrazyGames: их SDK вместо яндексовского, английский заголовок страницы
python3 - "$YA_SDK" "$CG_SDK" <<'PY'
import sys
ya, cg = sys.argv[1:3]
p = 'dist/crazygames/index.html'
h = open(p, encoding='utf-8').read().replace(ya, cg)
h = h.replace('<html lang="ru">', '<html lang="en">').replace('<title>Подземелье Аида: Побег</title>', '<title>Underworld Escape</title>')
open(p, 'w', encoding='utf-8').write(h)
PY
grep -qF "$CG_SDK" dist/crazygames/index.html
! grep -q "yandex.ru" dist/crazygames/index.html

(cd dist/yandex && zip -qr ../../build/yandex-games.zip .)
(cd dist/crazygames && zip -qr ../../build/crazygames.zip .)
ls -la build
