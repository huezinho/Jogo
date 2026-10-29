import sys,json
from pathlib import Path
from PIL import Image
r=json.load(sys.stdin);root=Path(__file__).resolve().parents[1];target=root/r['path'];target.parent.mkdir(parents=True,exist_ok=True)
with Image.open(r['source']) as im:
 im.thumbnail((256,256),Image.Resampling.LANCZOS);im.save(target,'WEBP',lossless=True)
out=root/'docs/hud/arsenal/geracao';out.mkdir(exist_ok=True);(out/(r['id']+'.json')).write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
