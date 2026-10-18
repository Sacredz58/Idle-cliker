# usage: python3 tools/chroma_magenta.py src.png out.png  (-> out.png 1024² + out.webp 640²)
# keys out a flat MAGENTA background with un-mixing (keeps translucent ghost wisps, removes pink fringe)
import sys, numpy as np
from PIL import Image, ImageFilter
src,out=sys.argv[1:3]
a=np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
cor=np.concatenate([a[:8,:8].reshape(-1,3),a[:8,-8:].reshape(-1,3),a[-8:,:8].reshape(-1,3),a[-8:,-8:].reshape(-1,3)]);M=np.median(cor,0)
r,g,b=a[...,0],a[...,1],a[...,2]
m=np.minimum(r,b)-g; m0=M[[0,2]].min()-M[1]
k=np.clip((m-30)/(m0*0.8-30),0,1)
al=1-k
al=np.asarray(Image.fromarray((al*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)/255
A=np.maximum(al,1e-3)[...,None]
F=np.clip((a-(1-A)*M)/A,0,255)
# kill remaining magenta tint at soft edges
mag=np.clip(np.minimum(F[...,0],F[...,2])-F[...,1],0,None)
soft=(al<0.95)[...,None]
F=np.where(soft,F-np.stack([mag,np.zeros_like(mag),mag],-1)*0.8,F)
al[al<0.04]=0
im=Image.fromarray(np.dstack([np.clip(F,0,255),al*255]).astype(np.uint8),'RGBA')
bb=im.split()[3].point(lambda x:255 if x>30 else 0).getbbox();fig=im.crop(bb)
S=1024;sc=min(S*.9/fig.height,S*.96/fig.width);fig=fig.resize((round(fig.width*sc),round(fig.height*sc)),Image.LANCZOS)
c=Image.new('RGBA',(S,S),(0,0,0,0));c.paste(fig,((S-fig.width)//2,S-fig.height-int(S*.04)),fig)
c.save(out);c.resize((640,640),Image.LANCZOS).save(out.replace('.png','.webp'),'WEBP',quality=84,method=6)
print(out,'bg',M.round())
