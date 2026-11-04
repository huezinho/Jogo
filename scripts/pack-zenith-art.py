"""Pack authored generated frames; no synthesized poses or painted modifications."""
from PIL import Image
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
src=root/'docs/arte/avatar-do-zenith/fontes'
body=Image.open(src/'corpo.png').convert('RGBA')
frames=[body.crop((round(x*body.width/4),round(y*body.height/4),round((x+1)*body.width/4),round((y+1)*body.height/4))) for y in range(4)for x in range(4)]
boxes=[im.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox()for im in frames]
assert all(boxes)
scale=min(280/max(b[2]-b[0] for b in boxes),360/max(b[3]-b[1] for b in boxes))
out=Image.new('RGBA',(1280,1600))
for i,(im,b) in enumerate(zip(frames,boxes)):
 tile=im.crop(b);tile=tile.resize((round(tile.width*scale),round(tile.height*scale)),Image.Resampling.LANCZOS)
 out.alpha_composite(tile,((i%4)*320+(320-tile.width)//2,(i//4)*400+392-tile.height))
out.save(root/'assets/visual/enemies-v3/avatar-do-zenith.webp','WEBP',lossless=True)
fx=Image.open(src/'efeitos.png').convert('RGBA')
keys=['judgment','glare','prism','aura'];report={'body':{'frames':16,'width':320,'height':400},'effects':{}}
for spell,key in enumerate(keys):
 atlas=Image.new('RGBA',(1024,512));hashes=[]
 for i in range(8):
  x=i%4;y=spell*2+i//4
  tile=fx.crop((round(x*fx.width/4),round(y*fx.height/8),round((x+1)*fx.width/4),round((y+1)*fx.height/8)))
  tile.thumbnail((232,232),Image.Resampling.LANCZOS)
  atlas.alpha_composite(tile,(x*256+(256-tile.width)//2,(i//4)*256+(256-tile.height)//2))
  hashes.append(hashlib.sha256(tile.tobytes()).hexdigest())
 assert len(set(hashes))>=6
 atlas.save(root/f'assets/visual/enemy-fx/zenith-{key}.webp','WEBP',lossless=True)
 report['effects'][key]={'frames':8,'distinct':len(set(hashes))}
(src.parent/'atlas.json').write_text(json.dumps(report,indent=2)+'\n')
print('Packed 16 body poses and 32 skill-effect frames')
