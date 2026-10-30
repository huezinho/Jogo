import json,io,sys,runpy
from pathlib import Path
files=sorted(Path('docs/hud/personagens/geracao').glob('*.json'))
for f in files:
 record=json.loads(f.read_text(encoding='utf-8'));sys.stdin=io.StringIO(json.dumps(record));runpy.run_path('scripts/install-character-art.py',run_name='__main__')
print(f'{len(files)} folhas empacotadas')
