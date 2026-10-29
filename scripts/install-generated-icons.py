import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'docs/hud/icones/geracao.json').read_text(encoding='utf-8-sig'))
report=[]
for r in records:
 if r.get('error') or not r.get('source'):continue
 source=Path(r['source']);target=root/r['path'];target.parent.mkdir(parents=True,exist_ok=True)
 with Image.open(source) as im:
  # Package the complete generated image at icon resolution; no cropping or repainting.
  im.thumbnail((256,256),Image.Resampling.LANCZOS)
  im.save(target,'WEBP',lossless=True)
  report.append({'id':r['id'],'size':im.size,'file':r['path']})
(root/'docs/hud/icones/arquivos.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(report)} artes instaladas')
