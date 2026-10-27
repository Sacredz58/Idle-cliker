# Обложки CrazyGames: python tools/cover.py <папка_вывода>/  (Pillow; Гидра + герой + цифры урона + монеты)
import random, math, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageChops
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SP = HERE + '/'  # шрифты forum.ttf и golos.ttf кладутся рядом (конвертация fonts/*.woff через fontTools)
IMG = HERE + '/../img/'
FORUM = SP + 'forum.ttf'; GOLOS = SP + 'golos.ttf'
random.seed(7)

def L(n): return Image.open(IMG + n).convert('RGBA')

def bg_cover(W, H):
    b = Image.open(IMG + 'act1_bg.webp').convert('RGB')
    s = max(W / b.width, H / b.height)
    b = b.resize((math.ceil(b.width * s), math.ceil(b.height * s)), Image.LANCZOS)
    x = (b.width - W) // 2; y = int((b.height - H) * .55)
    b = b.crop((x, y, x + W, y + H)).filter(ImageFilter.GaussianBlur(max(W, H) / 700))
    b = ImageEnhance.Color(b).enhance(1.35); b = ImageEnhance.Brightness(b).enhance(1.12)
    b = ImageEnhance.Contrast(b).enhance(1.08)
    return b.convert('RGBA')

def radial(W, H, cx, cy, r, col, a):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=int(255 * a))
    m = m.filter(ImageFilter.GaussianBlur(r * .45))
    return Image.composite(Image.new('RGBA', (W, H), col + (255,)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), m)

def vignette(W, H, k=.55):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    d.ellipse((-W * .25, -H * .3, W * 1.25, H * 1.3), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(min(W, H) * .18))
    inv = ImageChops.invert(m).point(lambda v: int(v * k))
    return Image.composite(Image.new('RGBA', (W, H), (8, 2, 0, 255)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), inv)

def glow_of(sprite, col, rad, strength=1.0):
    a = sprite.getchannel('A').filter(ImageFilter.GaussianBlur(rad)).point(lambda v: min(255, int(v * 1.6 * strength)))
    g = Image.new('RGBA', sprite.size, col + (0,)); g.putalpha(a); return g

def place(canvas, sprite, x, y, h, glow=None, grad=None, flip=False):
    s = h / sprite.height
    sp = sprite.resize((max(1, int(sprite.width * s)), int(h)), Image.LANCZOS)
    if flip: sp = sp.transpose(Image.FLIP_LEFT_RIGHT)
    sp = ImageEnhance.Contrast(sp).enhance(1.12); sp = ImageEnhance.Color(sp).enhance(1.25)
    sp = ImageEnhance.Sharpness(sp).enhance(1.6)
    if glow:
        pad = int(h * .08)
        big = Image.new('RGBA', (sp.width + 2 * pad, sp.height + 2 * pad), (0, 0, 0, 0)); big.paste(sp, (pad, pad), sp)
        g = glow_of(big, glow, h * .025, 1.0)
        canvas.alpha_composite(g, (int(x) - pad, int(y) - pad))
    canvas.alpha_composite(sp, (int(x), int(y)))
    return sp.width, sp.height

def burst(canvas, cx, cy, r):
    W, H = canvas.size
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i in range(14):
        a = i / 14 * 2 * math.pi + random.uniform(-.1, .1); r1 = r * .55; r2 = r * random.uniform(1.0, 1.35)
        w = max(2, int(r * .05))
        d.line([(cx + r1 * math.cos(a), cy + r1 * math.sin(a)), (cx + r2 * math.cos(a), cy + r2 * math.sin(a))], fill=(255, 236, 160, 230), width=w)
    d.ellipse((cx - r * .5, cy - r * .5, cx + r * .5, cy + r * .5), outline=(255, 222, 120, 255), width=max(3, int(r * .06)))
    d.ellipse((cx - r * .72, cy - r * .72, cx + r * .72, cy + r * .72), outline=(255, 200, 90, 160), width=max(2, int(r * .03)))
    gl = lay.filter(ImageFilter.GaussianBlur(r * .08))
    canvas.alpha_composite(radial(W, H, int(cx), int(cy), int(r * .45), (255, 220, 140), .35))
    canvas.alpha_composite(gl); canvas.alpha_composite(lay)

def font(path, size, wght=None):
    f = ImageFont.truetype(path, int(size))
    if wght:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f

def outlined(canvas, xy, txt, f, fill_top, fill_bot, stroke, sw, glow=None, anchor='la'):
    W, H = canvas.size
    if glow:
        g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).text(xy, txt, font=f, fill=255, stroke_width=sw * 2, anchor=anchor)
        g = g.filter(ImageFilter.GaussianBlur(sw * 4)).point(lambda v: int(v * .85))
        canvas.alpha_composite(Image.composite(Image.new('RGBA', (W, H), glow + (255,)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), g))
    sm = Image.new('L', (W, H), 0); ImageDraw.Draw(sm).text(xy, txt, font=f, fill=255, stroke_width=sw, anchor=anchor)
    canvas.alpha_composite(Image.composite(Image.new('RGBA', (W, H), stroke + (255,)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), sm))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).text(xy, txt, font=f, fill=255, anchor=anchor)
    bb = m.getbbox() or (0, 0, W, H)
    gr = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(gr)
    for y in range(bb[1], bb[3] + 1):
        t = (y - bb[1]) / max(1, bb[3] - bb[1])
        c = tuple(int(fill_top[i] + (fill_bot[i] - fill_top[i]) * t) for i in range(3))
        gd.line([(bb[0], y), (bb[2], y)], fill=c + (255,))
    canvas.alpha_composite(Image.composite(gr, Image.new('RGBA', (W, H), (0, 0, 0, 0)), m))

def coins(canvas, pts, size):
    c = L('icons/coin.webp'); a = c.getchannel('A'); c = ImageEnhance.Brightness(c.convert('RGB')).enhance(1.9); c = ImageEnhance.Color(c).enhance(1.6).convert('RGBA'); c.putalpha(a)
    for (x, y, s, rot) in pts:
        cc = c.resize((int(size * s), int(size * s)), Image.LANCZOS).rotate(rot, expand=True, resample=Image.BICUBIC)
        canvas.alpha_composite(glow_of(cc, (255, 200, 80), size * s * .08, .6), (int(x), int(y)))
        canvas.alpha_composite(cc, (int(x), int(y)))

def dmg(canvas, x, y, txt, size, crit=False):
    f = font(GOLOS, size, 900)
    outlined(canvas, (x, y), txt, f, (255, 250, 210) if not crit else (255, 245, 150), (255, 190, 60) if not crit else (255, 120, 40),
             (40, 8, 0), max(3, int(size * .09)), glow=(255, 120, 20), anchor='mm')

def title(canvas, cx, y, size, anchor='mm', txt='Underworld Escape'):
    f = font(FORUM, size)
    outlined(canvas, (cx, y), txt, f, (255, 244, 200), (240, 160, 50), (30, 6, 0), max(4, int(size * .06)), glow=(255, 110, 0), anchor=anchor)

def make(W, H, lay):
    cv = bg_cover(W, H)
    cv.alpha_composite(radial(W, H, int(W * lay['glow'][0]), int(H * lay['glow'][1]), int(min(W, H) * .55), (255, 120, 30), .55))
    cv.alpha_composite(vignette(W, H, .5))
    hyd = L('boss_0500.webp'); hero = L('hero.webp')
    hx, hy, hh = lay['hydra']; place(cv, hyd, W * hx, H * hy, H * hh, glow=(90, 255, 120), flip=lay.get('hflip', False))
    bx, by, br = lay['burst']; burst(cv, W * bx, H * by, min(W, H) * br)
    ex, ey, eh = lay['hero']; place(cv, hero, W * ex, H * ey, H * eh, glow=(255, 190, 80))
    for (x, y, t, s, c) in lay['dmg']: dmg(cv, W * x, H * y, t, min(W, H) * s, c)
    coins(cv, [(W * x, H * y, s, r) for (x, y, s, r) in lay['coins']], min(W, H) * .11)
    tx, ty, ts = lay['title']
    # тёмная подложка под названием для читаемости
    band = Image.new('L', (W, H), 0); bd = ImageDraw.Draw(band)
    bd.rectangle((0, H * ty - H * ts * .9, W, H), fill=170); band = band.filter(ImageFilter.GaussianBlur(H * ts * .6))
    if lay.get('band', True): cv.alpha_composite(Image.composite(Image.new('RGBA', (W, H), (10, 2, 0, 255)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), band))
    if lay.get('two'):
        title(cv, W * tx, H * (ty - ts * .95), H * ts, txt='Underworld'); title(cv, W * tx, H * ty, H * ts, txt='Escape')
    else: title(cv, W * tx, H * ty, H * ts)
    return cv.convert('RGB')

LAND = dict(glow=(.62, .45), hydra=(.47, .02, .93), burst=(.70, .40, .12), hero=(.10, .20, .78), band=True,
            dmg=[(.66, .14, '-1.2K', .085, False), (.83, .34, 'CRIT!', .12, True), (.56, .56, '-3.4K', .07, False)],
            coins=[(.45, .58, .9, 10), (.51, .70, .75, -20), (.41, .74, .6, 30), (.90, .66, .6, 15)],
            title=(.5, .89, .135))
PORT = dict(glow=(.55, .38), hydra=(.18, .03, .60), burst=(.58, .30, .14), hero=(-.02, .33, .50), band=True,
            dmg=[(.62, .12, '-1.2K', .10, False), (.70, .54, 'CRIT!', .12, True), (.86, .25, '-48K', .085, False)],
            coins=[(.62, .62, 1.0, 10), (.80, .66, .8, -20), (.70, .74, .65, 30)],
            title=(.5, .92, .10), two=True)
SQ = dict(glow=(.6, .42), hydra=(.42, .03, .80), burst=(.70, .34, .13), hero=(-.08, .20, .70), band=True,
          dmg=[(.72, .12, '-1.2K', .085, False), (.76, .55, 'CRIT!', .11, True)],
          coins=[(.44, .60, .9, 10), (.36, .72, .7, -20)],
          title=(.5, .89, .11))
out = sys.argv[1] if len(sys.argv) > 1 else SP
make(1920, 1080, LAND).save(out + 'cover_landscape_1920x1080.jpg', quality=92)
make(800, 1200, PORT).save(out + 'cover_portrait_800x1200.jpg', quality=92)
make(800, 800, SQ).save(out + 'cover_square_800x800.jpg', quality=92)
print('ok')
