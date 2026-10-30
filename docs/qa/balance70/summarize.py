"""Derive tables from raw evidence. No game rules are reimplemented here."""
import json, pathlib, statistics, collections
HERE=pathlib.Path(__file__).resolve().parent
def read(name):
    return json.loads((HERE/name).read_text(encoding='utf-8'))
def files(prefix):
    return [read(p.name) for p in sorted(HERE.glob(prefix+'*.json'))]
meta=read('metadata.json'); world=read('audit.json')['world']
enemy={e['id']:e for e in world}; forms={f['id']:f for f in meta['forms']}
finals=[f for f in meta['forms'] if f['tier']==2]
def collect(prefix):
    return {r['selected']['id']:r for r in files(prefix) if r.get('selected')}
validation=collect('validation-'); equipment=collect('equipment-'); earned=collect('frontier-')
campaign=files('journey-'); campaign=[r for r in campaign if 'checkpoints' in r]
checkpoints=[r for d in files('checkpoints-') for r in d['rows']]
earnedCheckpoints=[r for d in files('journey-levels-') for r in d['rows']]
discovery=[r for d in files('discovery-') for r in d['rows']]
ablation=collect('ablation-')
summary={'counts':{},'classes':[],'difficulty':[],'skills':[],'enemies':[],'campaign':[]}
summary['counts']={
 'discoveryFights':sum(r['n'] for r in discovery),
 'validationFights':sum(r['n'] for d in validation.values() for r in d['rows']),
 'equipmentScreenFights':sum(r['n'] for d in equipment.values() for r in d['discovery']),
 'equipmentValidationFights':sum(r['n'] for d in equipment.values() for r in d['rows']),
 'checkpointFights':sum(r['n'] for r in checkpoints),
 'earnedCheckpointFights':sum(r['n'] for r in earnedCheckpoints),
 'rotationScreenFights':sum(r['n'] for d in files('rotations-') for r in d['discovery']),
 'rotationValidationFights':sum(r['n'] for d in files('rotations-') for r in d['rows']),
 'ablationFights':sum(r['n'] for d in ablation.values() for r in d['rows']),
 'earnedFights':sum(r['n'] for d in earned.values() for r in d['rows'])+sum(len(d.get('candidates',[]))*9 for d in earned.values()),
 'preliminaryEarnedFights':sum(r['n'] for d in collect('earned-').values() for r in d['rows'])+sum(len(d.get('candidates',[]))*9 for d in collect('earned-').values()),
 'campaignRuns':len(campaign),'campaignFights':sum(r['fights'] for r in campaign),
 'activeProbes':len(read('probes.json')['active']),'passiveProbes':len(read('probes.json')['passive']),
 'setProbes':len(read('audit.json')['sets'])}
for f in finals:
    out={'id':f['id'],'name':f['name'],'base':f['className']}
    for mode,data in [('naked',validation),('commonSet',equipment),('earned',earned)]:
        if f['id'] not in data: continue
        d=data[f['id']]; rows={r['enemy']:r for r in d['rows']}; frontier=None; barrier=None
        for e in world:
            if not e['boss'] or e['minLevel']>70: continue
            if rows[e['id']]['wins']/rows[e['id']]['n']>=.8: frontier=e['name']
            else: barrier=e['name'];break
        out[mode]={'build':d['selected']['build'],'policy':d['selected']['policy'],'bosses':{e['id']:{k:rows[e['id']][k] for k in ['wins','n','winTurns','timeouts','damage','actions']} for e in world if e['boss']},'frontier80':frontier,'firstBarrier80':barrier}
    tuned=next((d for d in files('rotations-') if d['selected']['id']==f['id'] and d['improve']),None)
    if tuned:
        out['extraRotation']={'build':tuned['selected']['build'],'policy':tuned['selected']['policy'],'bosses':{r['enemy']:{k:r[k] for k in ['wins','n','winTurns','timeouts','damage','actions']} for r in tuned['rows'] if enemy[r['enemy']]['boss']}}
    runs=[r for r in campaign if r['id']==f['id']]; reached=[r for r in runs if r['level']==70]
    out['campaign']={'n':len(runs),'reached':len(reached),'levels':[min((r['level'] for r in runs),default=0),max((r['level'] for r in runs),default=0)],'minutesMedian':statistics.median(r['minutes'] for r in reached) if reached else None,'buildsReached':dict(collections.Counter(r['build'] for r in reached))}
    summary['classes'].append(out)
# Like-level comparisons: equal hero/foe level only. Report all policies and builds,
# plus balanced damage policy as a fixed, easier-to-read reference.
for e in world:
    matched=[r for r in checkpoints if r['enemy']==e['id'] and r['level']==e['level']]
    if not matched: continue
    fixed=[r for r in matched if r['build']=='equilibrada' and r['policy']=='dano_direto']
    best=[]
    for fid in set(r['id'] for r in matched):
        options=[r for r in matched if r['id']==fid]
        best.append(max(options,key=lambda r:(r['wins']/r['n'],r['damage'])))
    summary['difficulty'].append({'enemy':e['id'],'name':e['name'],'level':e['level'],'boss':e['boss'],'n':sum(r['n'] for r in matched),'wins':sum(r['wins'] for r in matched),'rate':sum(r['wins'] for r in matched)/sum(r['n'] for r in matched),'fixedN':sum(r['n'] for r in fixed),'fixedWins':sum(r['wins'] for r in fixed),'bestWins':sum(r['wins'] for r in best),'bestN':sum(r['n'] for r in best)})
    withGear=[r for r in earnedCheckpoints if r['enemy']==e['id'] and r['level']==e['level']]
    summary['difficulty'][-1]['earnedWins']=sum(r['wins'] for r in withGear)
    summary['difficulty'][-1]['earnedN']=sum(r['n'] for r in withGear)
for fid,d in ablation.items():
    baseline=[r for r in d['rows'] if not r.get('ban') and not r.get('open')]; baseWins=sum(r['wins'] for r in baseline)
    catalog=next(c for c in meta['catalog'] if c['id']==fid)
    for skill in catalog['active']:
        banned=[r for r in d['rows'] if r.get('ban')==skill['id']]; opening=[r for r in d['rows'] if r.get('open')==skill['id']]
        greedy=[r for r in discovery if r['id']==fid and r['policy']=='dano_direto']
        uses=sum(r['actions'].get(skill['id'],0) for r in greedy); actions=sum(sum(r['actions'].values()) for r in greedy)
        summary['skills'].append({'form':fid,'id':skill['id'],'name':skill['name'],'cost':skill['cost'],'greedyUses':uses,'greedyActions':actions,'baselineWins':baseWins,'n':sum(r['n'] for r in baseline),'banWins':sum(r['wins'] for r in banned),'openingWins':sum(r['wins'] for r in opening),'lostWhenBanned':baseWins-sum(r['wins'] for r in banned),'gainedWhenOpening':sum(r['wins'] for r in opening)-baseWins})
for e in world:
    out={k:e[k] for k in ['id','name','level','region','boss','minLevel','stats']}
    for name,ds in [('naked',validation),('commonSet',equipment)]:
        rows=[next(r for r in d['rows'] if r['enemy']==e['id']) for d in ds.values()]
        out[name]={'wins':sum(r['wins'] for r in rows),'n':sum(r['n'] for r in rows),'perfectForms':sum(r['wins']==r['n'] for r in rows),'timeouts':sum(r['timeouts'] for r in rows)}
    summary['enemies'].append(out)
for cls in ['Guerreiro','Arqueiro','Mago','Adepto da Natureza']:
    rs=[r for r in campaign if forms[r['id']]['className']==cls]; wins=[r for r in rs if r['level']==70]
    summary['campaign'].append({'class':cls,'runs':len(rs),'reached':len(wins),'levels':[min((r['level'] for r in rs),default=0),max((r['level'] for r in rs),default=0)],'medianMinutes':statistics.median(r['minutes'] for r in wins) if wins else None})
(HERE/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(summary['counts'],ensure_ascii=False))
print('LIKE-LEVEL HARDEST',json.dumps(sorted(summary['difficulty'],key=lambda r:r['rate'])[:12],ensure_ascii=False))
print('LOW USE',json.dumps(sorted(summary['skills'],key=lambda r:r['greedyUses']/max(1,r['greedyActions']))[:15],ensure_ascii=False))
