"""Technical registration of individually authored poses; no synthesized animation frames."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
src=root/'docs/arte/guerreiro/fontes'
meta=json.loads((src/'anchors.json').read_text())
report={}
for name,registration in meta.items():
 im=Image.open(src/(name+'.png')).convert('RGBA')
 head,ground=registration['head'],registration['ground']
 scale=230/(ground-head)
 pivot=registration['pivot']
 out=Image.new('RGBA',(384,384))
 box=im.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox()
 tile=im.crop(box)
 tile=tile.resize((round(tile.width*scale),round(tile.height*scale)),Image.Resampling.LANCZOS)
 x=round(192+(box[0]-pivot)*scale);y=round(376+(box[1]-ground)*scale)
 assert x>=8 and y>=8 and x+tile.width<=376 and y+tile.height<=380,(name,'Needs larger pose canvas',x,y,tile.size)
 out.alpha_composite(tile,(x,y))
 out.save(root/f'assets/visual/warrior-poses/{name}.webp','WEBP',lossless=True)
 report[name]={'canvas':[384,384],'footAnchor':[192,376],'scale':scale,'bounds':[x,y,x+tile.width,y+tile.height]}
(src.parent/'registration.json').write_text(json.dumps(report,indent=2)+'\n')
