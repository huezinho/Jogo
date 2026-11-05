import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
raw=(root/'assets/js/data/enemy-art.js').read_text(encoding='utf-8')
enemies=json.loads(raw.split('Object.freeze(',1)[1].rsplit(');',1)[0])
fits={}
def measure(path,rows):
 im=Image.open(path).convert('RGBA');tile=im.crop((0,0,im.width//4,im.height//rows));box=tile.getchannel('A').point(lambda x:255 if x>40 else 0).getbbox()
 if not box:return 1
 width=(box[2]-box[0])*256/tile.width;height=(box[3]-box[1])*320/tile.height
 return round(max(.8,min(1.45,250/height,270/width)),4)
for p in (root/'assets/visual/heroes-v2').glob('*.webp'):fits['hero-'+p.stem]=measure(p,4)
for key,info in enemies.items():
 if info.get('boss') or info.get('egg'):continue
 p=root/'assets/visual/enemies-v3'/f'{key}.webp'
 if p.exists():fits['enemy-'+key]=measure(p,info['rows'])
(root/'assets/js/data/combat-art-fit.js').write_text('// Visual bounds measured from idle atlas frames; no combat statistics.\nconst COMBAT_ART_FIT = '+json.dumps(fits,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Measured',len(fits),'hero and ordinary enemy silhouettes')
