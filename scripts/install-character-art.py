import json,sys
from pathlib import Path
from PIL import Image
r=json.load(sys.stdin);root=Path(__file__).resolve().parents[1];out=root/'docs/hud/personagens/geracao';out.mkdir(exist_ok=True)
im=Image.open(r['source']).convert('RGBA');cols=4;rows=4 if r['kind']=='hero' else 2
cw=im.width/cols;ch=im.height/rows;tw,th=(256,320)if r['kind']=='hero'else(256,256)
# Detect transparent row gaps when the generator gives uneven outer margins.
mask=im.getchannel('A').point(lambda a:255 if a>40 else 0);projection=mask.getprojection()[1];bands=[];start=None
for y,occupied in enumerate(projection+[0]):
 if occupied and start is None:start=y
 if not occupied and start is not None:bands.append((start,y));start=None
merged=[]
for lo,hi in bands:
 if merged and lo-merged[-1][1]<12:merged[-1]=(merged[-1][0],hi)
 else:merged.append((lo,hi))
major=[v for v in merged if v[1]-v[0]>im.height/(rows*4)]
ybands=major if r['kind']=='hero' and len(major)==rows else [(round(y*ch),round((y+1)*ch))for y in range(rows)]
tiles=[]
for row in range(rows):
 for col in range(cols):
  tile=im.crop((round(col*cw),max(0,ybands[row][0]-3),round((col+1)*cw),min(im.height,ybands[row][1]+3)))
  tiles.append(tile)
if r['kind']=='hero':
 boxes=[t.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox()for t in tiles]
 maxw=max(b[2]-b[0]for b in boxes if b);maxh=max(b[3]-b[1]for b in boxes if b);scale=min((tw-16)/maxw,(th-16)/maxh)
atlas=Image.new('RGBA',(tw*cols,th*rows))
for i,tile in enumerate(tiles):
 if r['kind']=='hero':
  box=boxes[i]
  if not box:raise ValueError('Empty hero frame')
  tile=tile.crop(box);tile=tile.resize((max(1,round(tile.width*scale)),max(1,round(tile.height*scale))),Image.Resampling.LANCZOS)
 else:tile.thumbnail((tw,th),Image.Resampling.LANCZOS)
 frame=Image.new('RGBA',(tw,th));frame.alpha_composite(tile,((tw-tile.width)//2,th-tile.height-4 if r['kind']=='hero'else(th-tile.height)//2));atlas.alpha_composite(frame,((i%cols)*tw,(i//cols)*th))
target=root/r['path'];target.parent.mkdir(exist_ok=True,parents=True);atlas.save(target,'WEBP',lossless=True);r['atlas']={'columns':cols,'rows':rows,'frameWidth':tw,'frameHeight':th,'frames':cols*rows,'sourceSize':im.size};(out/(r['id']+'.json')).write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
