"""Extract the approved art into runtime sprites; no generated text is used in the HUD."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
out = root / 'assets/visual/hud'
out.mkdir(parents=True, exist_ok=True)
kit = Image.open(root / 'docs/hud/artes/elementos-hud-v1.png')
def save(image, name, rect=None, size=None):
    image = image.crop(rect) if rect else image.copy()
    if size:
        image.thumbnail(size, Image.Resampling.LANCZOS)
    image.save(out / (name + '.webp'), lossless=image.mode == 'RGBA', quality=88, method=6)

for name, rect in {
    'panel-parchment': (936, 16, 1520, 326),
    'button-normal': (14, 758, 506, 888),
    'button-active': (522, 758, 1019, 888),
    'button-disabled': (1028, 758, 1523, 888),
    'portrait-frame': (8, 278, 286, 513),
    'divider': (20, 918, 939, 985),
    'corner': (979, 892, 1107, 1023),
}.items(): save(kit, name, rect)
for name, x in zip(['strike', 'bash', 'heal', 'stun', 'potion', 'map'], [17, 274, 526, 781, 1034, 1288]):
    save(kit, 'icon-' + name, (x, 516, min(x + 246, 1536), 754), (256, 256))
extra = Image.open(out / 'abilities-source.png')
for i, name in enumerate(['arrow', 'fire', 'ice', 'arcane', 'vines', 'poison', 'daggers', 'warcry', 'tree', 'shield', 'holy', 'demon']):
    w, h = extra.size
    save(extra, 'icon-' + name, (round(i%4*w/4), round(i//4*h/3), round((i%4+1)*w/4), round((i//4+1)*h/3)), (256, 256))
equipment = Image.open(out / 'equipment-source.png')
w, h = equipment.size
# The sword extends slightly below the first row. Use individual bounds, not an equal-cell crop.
rects = {
 'sword': (0, 0, .25, .56), 'bow': (.26, 0, .5, .54),
 'staff': (.51, 0, .75, .55), 'nature-staff': (.755, 0, 1, .56),
 'head': (.035, .535, .245, 1), 'chest': (.26, .535, .5, 1),
 'legs': (.53, .54, .74, 1), 'feet': (.775, .55, 1, 1),
}
for name, (x1,y1,x2,y2) in rects.items():
    save(equipment, 'item-' + name, (int(x1*w), int(y1*h), int(x2*w), int(y2*h)), (448, 448))
save(Image.open(out / 'forge-source.png').convert('RGB'), 'forge', size=(1920, 1080))
print('Runtime HUD art prepared in', out)
