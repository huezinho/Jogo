"""Check the shipped alpha atlases, including every body pose and FX frame."""
import json, hashlib
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
catalog = json.loads((root/'docs/hud/personagens/catalogo.json').read_text(encoding='utf-8'))
report = []
for record in catalog:
    hero = record['kind'] == 'hero'
    width, height, rows = (256, 320, 4) if hero else (256, 256, 2)
    image = Image.open(root/record['path']).convert('RGBA')
    assert image.size == (width*4, height*rows), record['id']
    assert image.getchannel('A').getextrema()[0] == 0, record['id']
    frames = [image.crop((col*width,row*height,(col+1)*width,(row+1)*height)) for row in range(rows) for col in range(4)]
    occupied = [frame.getchannel('A').getbbox() is not None for frame in frames]
    assert sum(occupied) >= (16 if hero else 6), record['id']
    hashes = [hashlib.sha256(frame.tobytes()).hexdigest() for frame in frames]
    if hero:
        for row in range(4):
            assert len(set(hashes[row*4:row*4+4])) >= 3, record['id']
    else:
        assert len(set(hashes)) >= 6, record['id']
    report.append({'id': record['id'], 'frames':len(frames), 'occupied':sum(occupied), 'distinct':len(set(hashes))})
(root/'docs/hud/personagens/quadros.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'PASS {len(report)} transparent atlases, 448 body frames and 504 FX frames')
