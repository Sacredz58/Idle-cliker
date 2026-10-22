# Underworld Escape — что осталось сделать в нейросетях (арт и звук)

Составлено 20.10.2026 перед повторной отправкой на CrazyGames.
Код готов. Ниже — только то, что нужно сгенерировать в нейросети для картинок или звука. Когда пришлёте результат, его подключат в игру.

Порядок — по важности для ревьюера: сначала то, что он увидит в первые минуты.

---

## Как присылать картинки

- Персонажи: **по одному на картинку**, квадрат 1:1, лучше 1024×1024. Сетки для персонажей не нужны: фигуры разного масштаба плохо режутся.
- Фон для персонажей — ровный **зелёный #00FF00**. Если на персонаже есть зелень (листва, бирюзовое свечение) — **пурпурный #FF00FF**.
- Персонаж смотрит **влево** (герой стоит слева).
- Без надписей. Если генератор дорисовал текст — лучше сделать ещё вариант.
- Подпишите, кто на картинке (или назовите файл как в списке ниже).

**Общий хвост для персонажей** (уже вставлен в промты ниже):
`dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, full body, whole figure inside the frame, centered, figure fills 85% of frame height, feet touching the bottom edge, facing left, solid pure green #00FF00 background, no green on the character, no text, no watermark`

**Негативный промт** (если генератор поддерживает):
`photo, 3d render, text, letters, logo, watermark, frame, border, cropped, cut off feet, cut off tail, multiple characters, blurry, extra limbs, deformed hands, green on the character`

---

## 1. Обложки игры — НУЖНО ДО ОТПРАВКИ

**Зачем:** обложку ревьюер и игроки видят ещё до запуска игры. Текущие обложки делались до нового арта.

**Требования CrazyGames:**
- 3 обложки: **1920×1080 (16:9)**, **800×1200 (2:3)**, **800×800 (1:1)**, одна картинка для всех трёх.
- На обложке можно писать **только название игры**. Никаких «New», «Play», значков, логотипов магазинов и рамок.
- Не скриншот игры, а иллюстрация: главный герой, крупное стилизованное название.
- Просто, чисто, читается в маленьком размере.

**Как сделать:** сгенерируйте одну широкую картинку 16:9 **без текста** с запасом по краям. Я обрежу её под три формата и добавлю название шрифтом игры (Forum). Так название будет одинаковым и читаемым на всех трёх.

**Промт (16:9):**
```
epic key art for a dark greek mythology game, a young hero in bronze armor and a short black cloak with a gold meander pattern, iron crown with a garnet, bronze sword raised, standing on the left on a rocky ledge, facing right toward a colossal monstrous she-dragon jailer with a coiled obsidian serpent body glowing with molten cracks and a huge scorpion tail arched above her, rising from a sea of lava in a vast underworld cavern, chains hanging from the ceiling, a narrow beam of light far above showing the way out, the hero and the monster both large and clearly readable, empty dark area in the upper middle for a title, cinematic composition, dramatic rim light, deep crimson, black and gold palette, hand-painted digital illustration, high detail, no text, no letters, no logo, no watermark, no frame
```
Подсказка: дайте генератору референсом `img/hero.webp` и `img/boss_0010.webp` (Кампа), чтобы персонажи были похожи на игровых.

**Видео для страницы игры** (2 штуки, 19 с) — нейросеть не нужна, их перезапишу сам с новым интерфейсом. Первый кадр должен совпадать с обложкой, поэтому видео делаю после обложки.

---

## 2. Безымянные боссы актов II–IV — ЖЕЛАТЕЛЬНО

**Зачем:** это боссы каждого 10-го этажа между именными (как Кампа в акте I). Сейчас вместо них — перекрашенный обычный монстр. Это около 600 этажей.

**Акт II · Эмпуса** · файл `gboss_2.png` · этажи 510–2000
```
Empusa, demoness of the underworld, pale woman with hair of living flame, one leg of bronze and one leg of a donkey, tattered ash-grey dress, long black claws, burning orange eyes, ash-grey and fiery orange palette, dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, full body, whole figure inside the frame, centered, figure fills 85% of frame height, feet touching the bottom edge, facing left, solid pure green #00FF00 background, no green on the character, no text, no watermark
```

**Акт III · Радамант** · файл `gboss_3.png` · этажи 2010–4500 · **пурпурный фон**
```
Rhadamanthus, ghostly judge of the dead in Elysium, tall stern bearded old king, translucent spectral body glowing teal, white marble crown, long pale robes, holding a golden scepter and bronze scales of judgment, cold calm gaze, teal and white marble palette with gold accents, dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, full body, whole figure inside the frame, centered, figure fills 85% of frame height, feet touching the bottom edge, facing left, solid pure magenta #FF00FF background, no magenta on the character, no text, no watermark
```

**Акт IV · Бриарей** · файл `gboss_4.png` · этажи 4510–7000
```
Briareus the hundred-handed guardian, massive giant with six muscular arms, each hand gripping a different bronze weapon or shield, bronze bands on his arms, storm clouds swirling around his shoulders, fierce stare, marble white, bronze and storm blue palette, dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, full body, whole figure inside the frame, centered, figure fills 85% of frame height, feet touching the bottom edge, facing left, solid pure green #00FF00 background, no green on the character, no text, no watermark
```

---

## 3. Иконки кольца и плаща — ЖЕЛАТЕЛЬНО

**Зачем:** во вкладке «Вещи» шлем, доспех, меч и амулет нарисованы на бронзовом медальоне, а кольцо и плащ — векторные значки. Это бросается в глаза.

Квадрат, зелёный фон, в том же стиле, что `img/icons/slot_1.webp` (дайте его референсом).

**Кольцо** · `slot_5.png`
```
round bronze medallion game icon with an ornate rim and greek meander pattern, in its center a gold signet ring with an engraved owl, warm golden glow, dark greek mythology, hand-painted digital illustration, one object, centered, bold silhouette readable at 48 px, strong rim light, solid pure green #00FF00 background, no text, no watermark
```

**Плащ** · `slot_6.png`
```
round bronze medallion game icon with an ornate rim and greek meander pattern, in its center a folded crimson cloak with a round gold clasp, warm golden glow, dark greek mythology, hand-painted digital illustration, one object, centered, bold silhouette readable at 48 px, strong rim light, solid pure green #00FF00 background, no text, no watermark
```

---

## 4. Музыка и звуки — ЖЕЛАТЕЛЬНО

**Зачем:** сейчас весь звук синтезируется кодом на лету (простой эмбиент и «пиканье»). В требованиях CrazyGames к качеству есть пункт «audio should be of high quality, levels consistent, music complements the visuals».

**Чем делать:** музыку — Suno или Udio; звуки — ElevenLabs Sound Effects (или любой генератор SFX).

**Формат:** MP3 или OGG, 44.1 kHz. Треки 60–120 с, **без вступления и концовки, чтобы бесшовно шли по кругу**. Звуки 0.1–1.5 с, без тишины в начале.
Размер: трек до ~1.5 МБ, звук до ~30 КБ (иначе игра долго грузится на телефоне).

### Музыка

**Готово (21.10):** общая тема «Between Torch and Temple» (Gemini) играет во всей игре — `music/theme.mp3`. Треки ниже теперь необязательны: их можно сделать позже, чтобы у разных актов и у боя с боссом была своя музыка.

### Музыка по актам (необязательно, 4 трека)

Общая часть промта для всех треков:
`instrumental, loopable, no vocals, no drums intro, steady mood, background music for an idle game, ancient greek instruments (lyre, aulos flute, frame drum), dark fantasy, 70 bpm, seamless loop`

| Файл | Где играет | Промт (добавить к общей части) |
|---|---|---|
| `music_tartarus.mp3` | Акты I–II (Тартар, Асфодель) | `deep underworld cavern, low drones, distant fire crackle, slow mysterious lyre melody, minor key, ominous but calm` |
| `music_elysium.mp3` | Акты III–IV (Элизиум, Олимп) | `serene fields of the blessed and marble temples above the clouds, warm lyre and soft flute, hopeful, slightly melancholic, dorian mode` |
| `music_chaos.mp3` | Акты V–VI (Вход в Хаос, Сердце Хаоса) | `cosmic void and cracking reality, ethereal choir pads, reversed textures, sparse dissonant lyre, cold and vast` |
| `music_boss.mp3` | Бой с боссом (30 с) | `tense boss battle, pounding frame drums and heartbeat, urgent staccato strings and lyre, 110 bpm, epic but not too loud` |

### Звуки

**Готово (21.10):** 8 звуков с SoundDino подключены — удар, крит, монстр повержен, покупка (монеты), умение, появление босса, победа над боссом, поражение (`sfx/`). Синтезом остались только награда (сундук) и фея; при желании их можно заменить файлами `sfx/reward.mp3` и `sfx/fairy.mp3`.

### Звуки (исходный список)

| Файл | Когда звучит | Промт |
|---|---|---|
| `sfx_click.mp3` | Обычный удар по монстру | `short soft sword slash hitting a shadow creature, quick whoosh and muffled impact, 0.15 seconds, not harsh` |
| `sfx_crit.mp3` | Критический удар | `powerful sword strike with metallic ring and a small burst of fire, 0.4 seconds` |
| `sfx_kill.mp3` | Монстр побеждён | `dark creature dissolving into smoke and ash, short whoosh with a soft magical sparkle, 0.6 seconds` |
| `sfx_boss_in.mp3` | Появление босса | `ominous deep horn and low rumble, a boss appears in an underworld cave, 1.5 seconds` |
| `sfx_boss_win.mp3` | Босс побеждён | `triumphant short brass and choir hit with a cymbal swell, victory, 1.5 seconds` |
| `sfx_lose.mp3` | Время на босса вышло | `descending sad lyre notes and a soft low thud, defeat, 1 second` |
| `sfx_buy.mp3` | Покупка улучшения | `bright coin clink with a short rising chime, upgrade purchased, 0.3 seconds` |
| `sfx_reward.mp3` | Награда, сундук | `treasure chest opening with jingling gold coins and a magical shimmer, 1 second` |
| `sfx_skill.mp3` | Умение | `magic power activation, swirling energy whoosh with a deep resonant hum, 0.7 seconds` |
| `sfx_fairy.mp3` | Поймана фея | `tiny fairy chime, delicate high bells and a soft sparkle, 0.5 seconds` |

Регуляторы громкости в настройках останутся, громкость всех файлов выровняю при подключении.

---

## 5. Можно позже (ревьюер не увидит)

### Монстры актов V–VI (этажи 7001–10 000, сейчас эмодзи)

**Акт V · Порождение разлома** · `act5_mob.png`
```
Rift Spawn, a hunched creature born from a crack in reality, body of jagged dark violet crystal shards held together by purple energy, glowing cracks, long claws, empty glowing eyes, floating shard fragments around it, violet and black palette, dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, full body, whole figure inside the frame, centered, figure fills 85% of frame height, feet touching the bottom edge, three-quarter view facing left, solid pure green #00FF00 background, no green on the character, no text, no watermark
```

**Акт VI · Око Хаоса** · `act6_mob.png`
```
Eye of Chaos, a floating monstrous eye the size of a man, veined black sclera, glowing hot-pink iris, ring of jagged black teeth around it, long writhing void tendrils hanging below, drifting magenta sparks, black and hot pink palette, dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, whole creature inside the frame, centered, fills 85% of frame height, tendrils touching the bottom edge, solid pure green #00FF00 background, no green on the character, no text, no watermark
```

### Безымянные боссы актов V–VI (сейчас эмодзи 👑)

**Акт V · Кера** · `gboss_5.png`
```
Ker, spirit of violent death, gaunt winged woman with ragged black wings, blood-red tattered robes, long bloody claws, sharp fangs, wild dark hair, glowing violet eyes, violet, black and blood red palette, dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, full body, whole figure inside the frame including wings, centered, figure fills 85% of frame height, feet touching the bottom edge, facing left, solid pure green #00FF00 background, no green on the character, no text, no watermark
```

**Акт VI · Офион** · `gboss_6.png`
```
Ophion, primordial serpent of chaos, colossal coiled serpent with black obsidian scales cracked with hot-pink light, a crown of jagged horns, glowing magenta eyes, starry void visible through the cracks, coils rising high, black and hot pink palette, dark greek mythology, 2D game art, hand-painted digital illustration, bold readable silhouette, strong rim light, deep shadows, limited palette, whole serpent inside the frame, centered, fills 85% of frame height, coils touching the bottom edge, facing left, solid pure green #00FF00 background, no green on the character, no text, no watermark
```

### Облики героя для лавки Нектара (раздел сейчас скрыт)

Обязательно дайте генератору референсом `img/hero.webp` — меняется только одежда и оружие, лицо и поза те же. Герой смотрит **вправо**.

Общая часть: `same young greek hero as the reference image, same face and pose, full body, facing right, hand-painted 2D game art, bold readable silhouette, strong rim light, solid pure green #00FF00 background, no green on the character, no text, no watermark`

| Файл | Облик | Цена | Промт (добавить к общей части) |
|---|---|---|---|
| `skin_1.png` | Афинский гоплит | 20 | `now in polished silver Athenian armor with a blue cloak and a crested corinthian helmet held under his arm` |
| `skin_2.png` | Страж Элизиума | 30 | `now in light green-gold leaf-patterned armor with a white cloak and a laurel wreath, glowing faintly` |
| `skin_3.png` | Тень Никты | 40 | `now in dark night-blue leather armor with a hood, twin curved daggers, faint starry glow on the cloak` |
| `skin_4.png` | Жрец Гекаты | 60 | `now in long violet robes with a silver crescent pendant, holding a torch with violet flame instead of a sword` |
| `skin_5.png` | Царь Подземного мира | 100 | `now in ornate black-and-gold royal armor with a crimson cloak and a tall iron crown, holding a two-pronged bident` |

Темы арены картинок не требуют: это цветовые фоны, они уже есть в коде.

---

## Иконка дара «Воды Леты» (новый 9-й дар) — ✅ готово 22.10

Файл: `img/ui/gift_9.webp`. Сейчас там временная иконка: перекрашенный в бирюзовый алтарь Никты. Пришлите квадрат 1024×1024 PNG, я уменьшу его до 112×112 webp, как остальные дары.

Стиль должен совпадать с `gift_1…gift_8`: один предмет по центру, тёмное грозовое небо с серо-фиолетовыми облаками и звёздами, без рамки и текста.

```
Square 1:1 game UI icon, hand-painted dark-fantasy Greek mythology style, matching a set of icons: one centered object on a dark stormy night background with swirling grey-violet clouds, faint stars and a soft vignette. The object: an ancient black-marble ritual basin (kylix) on a short pedestal, decorated with a thin gold Greek-key meander band, brimming with glowing pale-teal and silver water of the river Lethe; luminous water spills over the rim in thin streams; small translucent soul wisps — teal and violet flames shaped like tiny spirits — rise from the surface and spiral upward. The water lights the bowl from within. High contrast, rich detail, bold silhouette that stays readable at 64 px. No text, no frame, no border, no characters, no watermark.
```

---

## Итог: что присылать и в каком порядке

| # | Что | Сколько | Важность |
|---|---|---|---|
| 1 | Картинка для обложек (16:9 без текста) | 1 | до отправки |
| 2 | Безымянные боссы актов II–IV | 3 | желательно |
| 3 | Иконки кольца и плаща | 2 | желательно |
| 4 | Музыка | 4 трека | желательно |
| 4 | Звуки | 10 | желательно |
| 5 | Монстры актов V–VI, боссы Кера и Офион | 4 | позже |
| 5 | Облики героя | 5 | позже |
| ✅ | Иконка дара «Воды Леты» (`gift_9`) | 1 | готово |

После обложек: перезапись видео 16:9 и 2:3 (делаю сам).
