import hashlib, json, math, re, runpy
from pathlib import Path
here=Path(__file__).resolve().parent
root=here.parents[2]
a=json.loads((here/'audit.json').read_text(encoding='utf-8'))
w=json.loads((here/'windows.json').read_text(encoding='utf-8'))
for filename,digest in a['metadata']['hashes'].items():
    assert hashlib.sha256((root/filename).read_bytes()).hexdigest()==digest,filename+' changed; regenerate audit'
assert len(a['forms'])==28 and len(a['rows'])==5440 and len(w['rows'])==204
cap=int(re.search(r'const MAX_LEVEL = (\d+);',(root/'assets/js/game.js').read_text(encoding='utf-8')).group(1))
assert max(r['level'] for r in a['rows'])==cap
assert max(r['level'] for r in w['rows'])==cap
assert all(f['atLevel']<=cap for f in a['forms'])
assert len({s['type'] for f in a['forms'] for s in f['active']})==55
assert len({s['type'] for f in a['forms'] for s in f['passive']})==31
for r in a['rows']:
    for k in ['advertised','cost','legal','damage','dot','shield','mp','hpCost']:
        assert math.isfinite(r[k]),(r['form'],r['id'],k)
explosion=next(c for c in a['checks'] if c['type']=='mage_explode')
assert explosion['action']['canUse'] and explosion['skill']['damage']>0 and explosion['dealt']==explosion['skill']['damage']
assert explosion['after']['hp']<explosion['before']['hp'] and explosion['after']['mp']<explosion['before']['mp']
forms=[c for c in a['checks'] if c['type']=='nature_true_form']
assert not forms[0]['action']['canUse'] and forms[1]['action']['canUse']
zero=next(c for c in a['checks'] if c['type']=='archer_overcharge')
assert zero['skill']['cost']==0 and zero['dealt']>0
assert not w['errors']
for row in w['rows']:assert math.isfinite(row['ratio'])
runpy.run_path(str(here/'catalog.py'),run_name='__main__')
catalog=(root/'docs/habilidades_classes_subclasses.md').read_text(encoding='utf-8')
assert catalog.count('### Ataque básico')==28 and catalog.count('### Habilidades ativas')==28 and catalog.count('### Habilidades passivas')==28
assert '## Recomendações' not in catalog and 'propostos' not in catalog
report=(root/'docs/analise_incentivos_habilidades.md').read_text(encoding='utf-8')
assert '87.040' in report and '6.528' in report and 'Explodir' in report
assert not re.search(r'\b(?:no|No|nível) 120\b',report)
print('PASS evidence hashes, native probes, catalogue coverage and numeric formula checks')
