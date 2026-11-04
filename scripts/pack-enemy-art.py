"""Slice authored poses into runtime atlases. Does not generate or alter artwork.

Sources and ordering: docs/arte/inimigos/fontes/producao.json.
Run after generation: python3 scripts/pack-enemy-art.py
"""
from pathlib import Path
from PIL import Image
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/arte/inimigos/fontes'
CONFIG = json.loads((SOURCE / 'producao.json').read_text())
REPORT = {'enemies': {}, 'effects': {}, 'forms': {}}
PARTIAL = '--partial' in sys.argv


def available(source):
    path = SOURCE / (source + '.png')
    if not PARTIAL:
        return True
    if not path.exists():
        return False
    lo, hi = Image.open(path).convert('RGBA').getchannel('A').getextrema()
    return lo <= 2 and hi >= 240


def cells(source, rows):
    im = Image.open(SOURCE / (source + '.png')).convert('RGBA')
    lo, hi = im.getchannel('A').getextrema()
    assert lo <= 2 and hi >= 240, (source, 'Expected transparent cutouts', (lo, hi))
    edges = CONFIG.get('rowEdges', {}).get(source, [y / rows for y in range(rows + 1)])
    assert len(edges) == rows + 1 and edges[0] == 0 and edges[-1] == 1 and edges == sorted(edges), source
    return [im.crop((round(x * im.width / 4), round(edges[y] * im.height),
                     round((x + 1) * im.width / 4), round(edges[y + 1] * im.height)))
            for y in range(rows) for x in range(4)]


def pack_body(frames, width, height, target):
    boxes = [im.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox() for im in frames]
    assert all(boxes), target
    scale = min((width - 28) / max(b[2] - b[0] for b in boxes),
                (height - 28) / max(b[3] - b[1] for b in boxes))
    out = Image.new('RGBA', (width * 4, height * ((len(frames) + 3) // 4)))
    hashes = []
    for i, (im, box) in enumerate(zip(frames, boxes)):
        tile = im.crop(box)
        hashes.append(hashlib.sha256(tile.tobytes()).hexdigest())
        tile = tile.resize((max(1, round(tile.width * scale)), max(1, round(tile.height * scale))), Image.Resampling.LANCZOS)
        out.alpha_composite(tile, ((i % 4) * width + (width - tile.width) // 2,
                                   (i // 4) * height + height - 8 - tile.height))
    assert len(set(hashes)) >= min(4, len(frames)), target
    path = ROOT / target
    path.parent.mkdir(parents=True, exist_ok=True)
    out.save(path, 'WEBP', lossless=True)
    return {'frames': len(frames), 'distinct': len(set(hashes)), 'width': width, 'height': height}


runtime = {}
for e in CONFIG['enemies']:
    key = e['key']
    if e['source'] != 'zenith' and available(e['source']):
        frames = cells(e['source'], e['gridRows'])[e['start']:e['start'] + e['count']]
        REPORT['enemies'][key] = pack_body(frames, 320 if e['boss'] else 256,
                                          400 if e['boss'] else 320,
                                          f'assets/visual/enemies-v3/{key}.webp')
    elif e['source'] == 'zenith':
        REPORT['enemies'][key] = {'frames': 16, 'width': 320, 'height': 400, 'approvedPilot': True}
    runtime[key] = {k: e[k] for k in ['name', 'region', 'boss', 'phase', 'rows']}
    runtime[key]['skills'] = {s['id']: next((dict(key=f['key'], self=f.get('self', False),
                                                ground=f.get('ground', False), charge=f.get('charge', False))
                                            for f in CONFIG['effects'] if f['enemy'] == key and f['id'] == s['id']),
                                           {'key': 'zenith-' + s['id']}) for s in e['skills']}
    runtime[key]['passives'] = {f['id']: {'key': f['key'], 'self': f['self']} for f in CONFIG['effects'] if f['enemy'] == key and f.get('passive')}

egg = cells('active-6', 4)[8:16]
REPORT['enemies']['fenix-sombria-ovo'] = pack_body(egg, 256, 320, 'assets/visual/enemies-v3/fenix-sombria-ovo.webp')
runtime['fenix-sombria-ovo'] = {'name': 'Fenix Sombria — ovo', 'region': 'Vulcao', 'boss': False, 'phase': 2, 'rows': 2, 'egg': True, 'skills': {}, 'passives': {}}

for f in CONFIG['effects']:
    if not available(f['source']):
        continue
    tiles = cells(f['source'], 8)[f['row'] * 4:f['row'] * 4 + 8]
    atlas = Image.new('RGBA', (1024, 512))
    hashes = set()
    for i, tile in enumerate(tiles):
        hashes.add(hashlib.sha256(tile.tobytes()).hexdigest())
        tile.thumbnail((240, 240), Image.Resampling.LANCZOS)
        atlas.alpha_composite(tile, ((i % 4) * 256 + (256 - tile.width) // 2,
                                     (i // 4) * 256 + (256 - tile.height) // 2))
    assert len(hashes) >= 6, f['key']
    atlas.save(ROOT / f"assets/visual/enemy-fx/{f['key']}.webp", 'WEBP', lossless=True)
    REPORT['effects'][f['key']] = {'frames': 8, 'distinct': len(hashes)}

for key in CONFIG['forms']:
    if not available('form-' + key):
        continue
    REPORT['forms'][key] = pack_body(cells('form-' + key, 4), 256, 320,
                                     f'assets/visual/hero-forms/{key}.webp')

data = ROOT / 'assets/js/data/enemy-art.js'
data.write_text('/* Authored visual catalogue; no combat rules. */\nconst EnemyArt = Object.freeze(' +
                json.dumps(runtime, ensure_ascii=False, separators=(',', ':')) + ');\n')
(SOURCE.parent / 'atlas.json').write_text(json.dumps(REPORT, ensure_ascii=False, indent=2) + '\n')
print(f"Packed {len(runtime)} enemy/form atlases, {len(REPORT['effects'])} effects and {len(REPORT['forms'])} hero forms")
