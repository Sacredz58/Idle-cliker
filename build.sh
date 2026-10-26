#!/usr/bin/env bash
# Собирает релизные архивы: Яндекс Игры, CrazyGames, Игры ВКонтакте и Пикабу Игры.
# Консоль разработчика во всех выключена. Запуск: bash build.sh
# Результат: build/yandex-games.zip, build/crazygames.zip, build/vk-games.zip
#            dist/yandex — сайт для GitHub Pages: корень = Яндекс, /vk/ = ВКонтакте, /pikabu/ = Пикабу (добавляются после упаковки)
set -euo pipefail
cd "$(dirname "$0")"
YA_SDK='<script src="https://yandex.ru/games/sdk/v2"></script>'
CG_SDK='<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'
VK_SDK='<script src="vk-bridge.min.js"></script>'
PK_SDK='<script src="https://games.pikabu.ru/sdk/sdk.js"></script>'
grep -qF "$YA_SDK" index.html

rm -rf dist build && mkdir -p dist/yandex dist/crazygames dist/vk dist/pikabu build
for t in yandex crazygames vk pikabu; do
  cp -r index.html style.css game.js img fonts music sfx "dist/$t/"
  sed -i 's/const DEV_ALLOWED=true/const DEV_ALLOWED=false/' "dist/$t/game.js"
  grep -q "const DEV_ALLOWED=false" "dist/$t/game.js"
done

# CrazyGames: их SDK вместо яндексовского, английский заголовок страницы
python3 - "$YA_SDK" "$CG_SDK" <<'PY'
import sys
ya, cg = sys.argv[1:3]
p = 'dist/crazygames/index.html'
h = open(p, encoding='utf-8').read().replace(ya, cg)
h = h.replace('<html lang="ru" ', '<html lang="en" ').replace('<title>Подземелье Аида: Побег</title>', '<title>Underworld Escape</title>')
open(p, 'w', encoding='utf-8').write(h)
PY
# реклама CrazyGames: по умолчанию выключена (Basic Launch); для Full Launch — CG_ADS=1 bash build.sh
grep -q "const CG_ADS=false" dist/crazygames/game.js
if [ "${CG_ADS:-0}" = "1" ]; then sed -i 's/const CG_ADS=false/const CG_ADS=true/' dist/crazygames/game.js; grep -q "const CG_ADS=true" dist/crazygames/game.js; echo "CrazyGames: реклама ВКЛЮЧЕНА (Full Launch)"; else echo "CrazyGames: реклама выключена (Basic Launch)"; fi
grep -qF "$CG_SDK" dist/crazygames/index.html
grep -qF '<html lang="en" translate="no"' dist/crazygames/index.html
! grep -q "yandex.ru" dist/crazygames/index.html

# ВКонтакте: VK Bridge (лежит в vendor/, без внешних CDN) вместо яндексовского SDK
cp vendor/vk-bridge.min.js dist/vk/
python3 - "$YA_SDK" "$VK_SDK" <<'PYVK'
import sys
ya, vk = sys.argv[1:3]
p = 'dist/vk/index.html'
h = open(p, encoding='utf-8').read().replace(ya, vk)
open(p, 'w', encoding='utf-8').write(h)
PYVK
grep -qF "$VK_SDK" dist/vk/index.html
! grep -q "yandex.ru" dist/vk/index.html
! grep -qi "crazygames" dist/vk/index.html
# реклама ВКонтакте: по умолчанию включена; до подключения монетизации можно собрать без неё — VK_ADS=0 bash build.sh
grep -q "const VK_ADS=true" dist/vk/game.js
if [ "${VK_ADS:-1}" = "0" ]; then sed -i 's/const VK_ADS=true/const VK_ADS=false/' dist/vk/game.js; grep -q "const VK_ADS=false" dist/vk/game.js; echo "ВКонтакте: реклама ВЫКЛЮЧЕНА"; else echo "ВКонтакте: реклама включена"; fi

# Пикабу Игры: их SDK вместо яндексовского (Пикабу не принимает архивы — игра живёт на GitHub Pages, адрес /pikabu/)
python3 - "$YA_SDK" "$PK_SDK" <<'PYPK'
import sys
ya, pk = sys.argv[1:3]
p = 'dist/pikabu/index.html'
h = open(p, encoding='utf-8').read().replace(ya, pk)
open(p, 'w', encoding='utf-8').write(h)
PYPK
grep -qF "$PK_SDK" dist/pikabu/index.html
! grep -q "yandex.ru" dist/pikabu/index.html

# метка версии: game.js?v=<хеш> и style.css?v=<хеш> — после обновления браузер и VK сразу берут новый код,
# а не версию из кэша (GitHub Pages разрешает кэшировать файлы 10 минут)
for t in yandex crazygames vk pikabu; do
  h=$(cat "dist/$t/game.js" "dist/$t/style.css" | sha1sum | cut -c1-10)
  sed -i "s#href=\"style.css\"#href=\"style.css?v=$h\"#; s#src=\"game.js\"#src=\"game.js?v=$h\"#" "dist/$t/index.html"
  grep -q "game.js?v=$h" "dist/$t/index.html"; grep -q "style.css?v=$h" "dist/$t/index.html"
done

(cd dist/yandex && zip -qr ../../build/yandex-games.zip .)
(cd dist/crazygames && zip -qr ../../build/crazygames.zip .)
(cd dist/vk && zip -qr ../../build/vk-games.zip .)
(cd dist/pikabu && zip -qr ../../build/pikabu-games.zip .)

# GitHub Pages публикует папку dist/yandex (см. .github/workflows/deploy.yml). Уже ПОСЛЕ упаковки архивов
# кладём туда версию ВКонтакте подпапкой /vk/ — её адрес https://<логин>.github.io/<репозиторий>/vk/index.html
# указывается в настройках игры VK → «Размещение» (хостинг VK не принимает аудиофайлы, поэтому игра живёт на Pages).
cp -r dist/vk dist/yandex/vk
cp -r dist/pikabu dist/yandex/pikabu   # Пикабу → Студия → Тестирование и карточка игры: https://<логин>.github.io/<репозиторий>/pikabu/index.html
ls -la build
