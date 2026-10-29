import pathlib, re, json, struct
root=pathlib.Path(__file__).resolve().parents[3]
files=[p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and 'qa' not in p.parts]
result={'files':len(files),'totalBytes':sum(p.stat().st_size for p in files),'byFolder':{},'missingReferences':[],'images':[],'sourceLines':{}}
for p in files:
    key=str(p.relative_to(root).parts[0])
    result['byFolder'][key]=result['byFolder'].get(key,0)+p.stat().st_size
    if p.suffix in ('.js','.css','.html'):
        source=p.read_text(encoding='utf-8')
        result['sourceLines'][p.relative_to(root).as_posix()]=len(source.splitlines())
        refs=[]
        if p.suffix=='.html': refs+=re.findall(r'(?:src|href)=["\']([^"\']+)',source)
        if p.suffix=='.css': refs+=re.findall(r'url\(["\']?([^\)"\']+)',source)
        for ref in refs:
            if ref.startswith(('http:','https:','data:','#')): continue
            clean=ref.split('?')[0].split('#')[0]
            target=p.parent/clean
            if not target.exists(): result['missingReferences'].append({'source':p.relative_to(root).as_posix(),'ref':ref})
    if p.suffix=='.png':
        with p.open('rb') as f: header=f.read(24)
        if header[:8]==b'\x89PNG\r\n\x1a\n':
            w,h=struct.unpack('>II',header[16:24]);result['images'].append({'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'width':w,'height':h})
result['largestFiles']=[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size} for p in sorted(files,key=lambda p:p.stat().st_size,reverse=True)[:20]]
result['images'].sort(key=lambda x:x['bytes'],reverse=True)
out=pathlib.Path(__file__).with_name('static-results.json');out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='images'},ensure_ascii=False,indent=2))
