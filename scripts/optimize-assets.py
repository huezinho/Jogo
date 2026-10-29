"""Create web delivery derivatives; retain source PNGs for future art work."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
total_before=total_after=0
for folder in ('backgrounds/regions','backgrounds/scenes','maps'):
    for src in (root/'assets/visual'/folder).glob('*.png'):
        image=Image.open(src).convert('RGB')
        image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
        dst=src.with_suffix('.webp')
        image.save(dst,'WEBP',quality=86,method=6)
        total_before+=src.stat().st_size
        total_after+=dst.stat().st_size
print(f'{total_before:,} source bytes -> {total_after:,} delivery bytes')
