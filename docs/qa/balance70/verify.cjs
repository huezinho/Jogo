const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const here=__dirname,root=path.resolve(here,'../../..'),read=f=>JSON.parse(fs.readFileSync(path.join(here,f),'utf8'));
const meta=read('metadata.json'),finals=meta.forms.filter(f=>f.tier===2),all=fs.readdirSync(here).filter(f=>f.endsWith('.json'));
for(const[file,hash]of Object.entries(meta.hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Changed production source '+file);
const issues=[];for(const file of all){const r=read(file);if(r.errors?.length)issues.push({file,errors:r.errors});}
assert.deepEqual(issues,[]);
const journeys=all.filter(f=>f.startsWith('journey-')&&!f.startsWith('journey-levels-')).map(read);
assert.equal(journeys.length,256);assert.equal(new Set(journeys.map(r=>[r.id,r.build,r.seed].join('/'))).size,256);
for(const f of finals){assert.equal(journeys.filter(r=>r.id===f.id).length,16);assert(journeys.some(r=>r.id===f.id&&r.level===70),'No genuine progression70 '+f.id);
 for(const prefix of ['discovery-','validation-','equipment-','ablation-','rotations-','earned-','frontier-']){const d=read(prefix+f.id+'.json');if(['discovery-','validation-','equipment-','earned-','frontier-'].includes(prefix))assert.equal(new Set(d.rows.map(r=>r.enemy)).size,48,prefix+f.id);for(const r of d.rows){assert(r.wins>=0&&r.wins<=r.n);assert(Number.isFinite(r.turns));assert(Number.isFinite(r.damage));}}
 for(const build of ['equilibrada','ofensiva','resistente','arcana'])assert(fs.existsSync(path.join(here,'journey-levels-'+f.id+'-'+build+'.json')));
}
for(const r of journeys){assert(r.level>=1&&r.level<=70);assert(r.fights<=6000);assert(r.deaths<=30);assert.equal(r.checkpoints.length,r.level);assert.equal(r.checkpoints.at(-1).level,r.level);for(const k of ['fights','deaths','turns','minutes','coins','coinsEarned','gearSpent','restSpent'])assert(Number.isFinite(r[k]),'Nonfinite '+r.id+' '+k);}
for(const cls of ['Guerreiro','Arqueiro','Mago','Adepto da Natureza']){const rows=read('checkpoints-'+cls+'.json').rows;assert.deepEqual([...new Set(rows.map(r=>r.level))].sort((a,b)=>a-b),Array.from({length:70},(_,i)=>i+1));}
assert.equal(read('probes.json').active.length,452);assert.equal(read('probes.json').active.filter(r=>r.error).length,0);assert.equal(read('probes.json').passive.filter(r=>!r.pass).length,0);assert.equal(read('audit.json').sets.length,1356);assert.equal(read('audit.json').sets.filter(r=>r.error).length,0);
const mechanics=read('mechanics.json');assert.equal(mechanics.controls.length,12);for(const r of mechanics.controls.filter(r=>r.defense!=='none')){assert.equal(r.before.hp,r.after.hp);assert(r.after.healReductionTurns>0||r.after.damageDownTurns>0);}
const summary=read('summary.json');assert.equal(summary.counts.campaignRuns,256);assert.equal(summary.classes.length,16);assert(summary.classes.every(c=>c.earned));
const report=fs.readFileSync(path.join(root,'docs/analise_balanceamento_nivel70.md'),'utf8');for(const f of finals)assert(report.includes(f.name));for(const e of meta.enemies)assert(report.includes(e.name));
const result={pass:true,date:'2026-10-30',journeys:journeys.length,forms70:finals.length,enemies:48,activeProbes:452,passiveProbes:68,setProbes:1356,sourceHashesVerified:Object.keys(meta.hashes).length,errors:[]};
fs.writeFileSync(path.join(here,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
