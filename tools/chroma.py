# usage: chroma2.py src out_png  -> keys out the flat background colour sampled from the corners
import numpy as np, sys
from PIL import Image, ImageFilter
src, out_png = sys.argv[1:3]
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(np.float32); h, w = a.shape[:2]
corners = np.concatenate([a[:8, :8].reshape(-1, 3), a[:8, -8:].reshape(-1, 3), a[-8:, :8].reshape(-1, 3), a[-8:, -8:].reshape(-1, 3)])
bgc = np.median(corners, axis=0)
d = np.sqrt(((a - bgc) ** 2).sum(-1))                    # distance to the background colour
alpha = np.clip((d - 45) / (120 - 45), 0, 1)              # <45 transparent, >120 opaque
A = Image.fromarray((alpha * 255).astype(np.uint8))
# spill suppression only in a thin band next to the background, so green scales/venom inside stay intact
edge = np.asarray(Image.fromarray(((alpha < 0.99) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
r, g, b = a[..., 0], a[..., 1], a[..., 2]
a[..., 1] = np.where(edge & (g > np.maximum(r, b)), np.maximum(r, b) + 2, g)
A = A.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
rgba = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(A)
bb = rgba.getbbox(); fig = rgba.crop(bb)
S = 1024; sc = min(S * 0.9 / fig.height, S * 0.96 / fig.width)
fig = fig.resize((round(fig.width * sc), round(fig.height * sc)), Image.LANCZOS)
c = Image.new('RGBA', (S, S), (0, 0, 0, 0)); c.paste(fig, ((S - fig.width) // 2, S - fig.height - int(S * 0.04)), fig)
c.save(out_png, optimize=True); c.save(out_png.replace('.png', '.webp'), 'WEBP', quality=86, method=6)
print(src.split('/')[-1], 'bg', bgc.round(), 'size', im.size, 'bbox', bb)
