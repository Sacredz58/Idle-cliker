# Обложки из ключевого арта (store/key_art_hydra_1254.png): python tools/cover_art.py <папка>/ — CrazyGames ×3 + иконки Пикабу. Нужен tools/cover.py и шрифты forum.ttf/golos.ttf рядом.
import sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(HERE + '/cover.py', encoding='utf-8').read().split('\nLAND = ')[0]
exec(src)  # outlined(), font(), FORUM — общий код обложек
ART = Image.open(HERE + '/../store/key_art_hydra_1254.png').convert('RGB')
OUT = sys.argv[1]

def grad_band(W, H, y0, a=215, col=(10, 3, 0)):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for y in range(int(y0), H):
        d.line([(0, y), (W, y)], fill=int(a * min(1, (y - y0) / max(1, (H - y0) * .55))))
    return Image.composite(Image.new('RGBA', (W, H), col + (255,)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), m)

def ttl(cv, lines, cx, y_last, size, gap=.95):
    for i, t in enumerate(reversed(lines)):
        outlined(cv, (cx, y_last - i * size * gap), t, font(FORUM, size), (255, 246, 205), (240, 160, 50), (30, 6, 0),
                 max(4, int(size * .06)), glow=(255, 110, 0), anchor='mm')

def fit(lines, size, maxw):
    while size > 20:
        f = font(FORUM, size); w = max(ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), t, font=f)[2] for t in lines)
        if w <= maxw: return size
        size *= .95
    return size

def landscape(W, H, lines, size_k=.15):
    S = int(W * .80); fg = ART.resize((S, S), Image.LANCZOS)
    y0 = int(S * .15); fg = fg.crop((0, y0, S, y0 + H)).convert('RGBA'); x0 = W - S
    bg = ART.resize((W, W), Image.LANCZOS).crop((0, int(W * .2), W, int(W * .2) + H)).filter(ImageFilter.GaussianBlur(22))
    bg = ImageEnhance.Brightness(bg).enhance(.75).convert('RGBA')
    m = Image.new('L', fg.size, 255); d = ImageDraw.Draw(m); fe = int(S * .22)
    for x in range(fe): d.line([(x, 0), (x, H)], fill=int(255 * (x / fe) ** 1.3))
    fg.putalpha(m); bg.alpha_composite(fg, (x0, 0))
    # затемнение слева снизу под название
    sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).ellipse((-W * .25, H * .35, W * .62, H * 1.45), fill=200)
    sh = sh.filter(ImageFilter.GaussianBlur(H * .12))
    bg.alpha_composite(Image.composite(Image.new('RGBA', (W, H), (10, 3, 0, 255)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), sh))
    size = fit(lines, H * size_k, W * .46)
    ttl(bg, lines, W * .27, H * .86, size, gap=1.0)
    return bg.convert('RGB')

def portrait(W, H, lines):
    s = H / ART.height; im = ART.resize((int(ART.width * s), H), Image.LANCZOS)
    x = int(im.width * .14); cv = im.crop((x, 0, x + W, H)).convert('RGBA')
    cv.alpha_composite(grad_band(W, H, H * .70))
    ttl(cv, lines, W / 2, H * .93, H * .085)
    return cv.convert('RGB')

def square(W, lines):
    cv = ART.resize((W, W), Image.LANCZOS).convert('RGBA')
    cv.alpha_composite(grad_band(W, W, W * .74))
    ttl(cv, [' '.join(lines)] if len(' '.join(lines)) < 20 else lines, W / 2, W * .92, W * (.105 if len(' '.join(lines)) < 20 else .085))
    return cv.convert('RGB')

EN = ['Underworld', 'Escape']; RU = ['Подземелье Аида:', 'Побег']
os.makedirs(OUT + 'crazygames', exist_ok=True); os.makedirs(OUT + 'pikabu', exist_ok=True)
landscape(1920, 1080, EN).save(OUT + 'crazygames/cover_landscape_1920x1080_v3.jpg', quality=93)
portrait(800, 1200, EN).save(OUT + 'crazygames/cover_portrait_800x1200_v3.jpg', quality=93)
square(800, EN).save(OUT + 'crazygames/cover_square_800x800_v3.jpg', quality=93)
# Пикабу: квадратная иконка без текста (от 1024), горизонтальная 1920×1080 с русским названием
ART.resize((1024, 1024), Image.LANCZOS).save(OUT + 'pikabu/icon_square_1024_v2.png')
landscape(1920, 1080, RU).save(OUT + 'pikabu/icon_horizontal_1920x1080_v2.jpg', quality=93)
print('ok')
