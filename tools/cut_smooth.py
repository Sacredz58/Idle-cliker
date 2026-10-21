# usage: python3 tools/cut_smooth.py src.png out.png [порог=12] [flip] [glow]  (-> out.png 1024² + out.webp 640²)
# фигура на гладком фоне (тёмный градиент со свечением): фон = гладкие области, залитые от краёв картинки
import sys,cv2,numpy as np
from scipy import ndimage as nd
from PIL import Image
src,out=sys.argv[1:3];T=float(sys.argv[3]) if len(sys.argv)>3 else 12;flip='flip' in sys.argv
img=cv2.imread(src);h,w=img.shape[:2]
g=cv2.GaussianBlur(cv2.cvtColor(img,cv2.COLOR_BGR2GRAY).astype(np.float32),(0,0),1.5)
e=np.hypot(cv2.Sobel(g,cv2.CV_32F,1,0),cv2.Sobel(g,cv2.CV_32F,0,1));e=cv2.GaussianBlur(e,(0,0),2)
lo=e<T
lab,n=nd.label(lo);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(edge))
if 'glow' in sys.argv:  # крупные гладкие тёплые пятна свечения внутри силуэта — тоже фон
    rgb=img[...,::-1].astype(np.int32);warm=(rgb[...,0]-rgb[...,2])>35
    lab2,n2=nd.label(e<T*1.4)
    for i in range(1,n2+1):
        r=lab2==i;s_=r.sum()
        if s_>6000 and warm[r].mean()>0.7: bg|=r
m=~bg
m=nd.binary_opening(m,iterations=2)
lab,n=nd.label(m);sz=nd.sum(m,lab,range(1,n+1));keep=np.zeros(n+1,bool);keep[1:]=sz>max(2500,sz.max()*0.01);m=keep[lab]
holes=nd.binary_fill_holes(m)&~m;hl,hn=nd.label(holes)
for i in range(1,hn+1):
    r=hl==i
    if r.sum()<1500 or e[r].mean()>T*1.2: m|=r
m=nd.binary_erosion(m,iterations=1)
a=cv2.GaussianBlur(m.astype(np.float32),(0,0),1.0);a=np.clip((a-0.2)/0.6,0,1)
rgba=np.dstack([cv2.cvtColor(img,cv2.COLOR_BGR2RGB),(a*255).astype(np.uint8)])
im=Image.fromarray(rgba,'RGBA')
if flip:im=im.transpose(Image.FLIP_LEFT_RIGHT)
bb=im.split()[3].point(lambda x:255 if x>30 else 0).getbbox();fig=im.crop(bb)
S=1024;sc=min(S*.9/fig.height,S*.96/fig.width);fig=fig.resize((round(fig.width*sc),round(fig.height*sc)),Image.LANCZOS)
c=Image.new('RGBA',(S,S),(0,0,0,0));c.paste(fig,((S-fig.width)//2,S-fig.height-int(S*.04)),fig)
c.save(out);c.resize((640,640),Image.LANCZOS).save(out.replace('.png','.webp'),'WEBP',quality=84,method=6)
