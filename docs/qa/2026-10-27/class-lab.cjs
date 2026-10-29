const fs=require('node:fs');const path=require('node:path');const {server,out,chromium}=require('./smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});const ctx=await browser.newContext();const p=await ctx.newPage();
 await p.route('https://unpkg.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));await p.goto('http://127.0.0.1:'+server.address().port);
 await p.addScriptTag({content:fs.readFileSync(path.join(out,'class-lab-engine.js'),'utf8')});
 const report={method:'Native attack/useSkill/passTurn and enemy AI; UI, timers and rewards disabled. Chronological point allocation; no equipment or potions. Five discovery seeds, thirty independent validation seeds. Fixed authored sequences are heuristic policies, not optimal human play. PvE only.',date:'2026-10-27',rows:[],validation:[]};
 const meta=await p.evaluate(()=>({forms:ClassLab.forms,builds:ClassLab.builds,combos:ClassLab.combos,alternatives:ClassLab.alternatives,catalog:ClassLab.catalog()}));Object.assign(report,meta);
 const classNames=['Guerreiro','Mago','Arqueiro','Adepto da Natureza'];
 if(process.argv.includes('--resume')){report.rows=JSON.parse(fs.readFileSync(path.join(out,'class-lab-results.json'),'utf8')).rows;console.log('Reusing discovery matrix; repeating validation and probes.');}
 else for(const name of classNames){const start=Date.now();const rows=await p.evaluate(name=>ClassLab.batch(name),name);report.rows.push(...rows);fs.writeFileSync(path.join(out,'class-lab-results.json'),JSON.stringify(report));console.log(JSON.stringify({class:name,groups:rows.length,fights:rows.reduce((s,x)=>s+x.n,0),seconds:(Date.now()-start)/1000}));}
 report.alternativeRows=[];
 for(const name of classNames){const rows=await p.evaluate(name=>ClassLab.alternativeBatch(name),name);report.alternativeRows.push(...rows);console.log(JSON.stringify({alternativeClass:name,fights:rows.reduce((s,x)=>s+x.n,0)}));}
 const configs=[];
 for(const form of meta.forms.filter(x=>x.tier===2)){
  const candidates=[...report.rows,...report.alternativeRows].filter(x=>x.id===form.id&&x.level===100&&x.encounter==='boss');
  candidates.sort((a,b)=>b.wins/b.n-a.wins/a.n||b.damageFraction-a.damageFraction||(a.winTurns??999)-(b.winTurns??999)||b.remainingHpFraction-a.remainingHpFraction);
  const best=candidates[0];configs.push({id:form.id,build:best.build,strategy:best.strategy,role:'selecionada'});
  configs.push({id:form.id,build:'equilibrada',strategy:'dano_direto',role:'referencia'});
 }
 for(const name of classNames){const ids=meta.forms.filter(x=>x.className===name).map(x=>x.id);const selected=configs.filter(x=>ids.includes(x.id));const rows=await p.evaluate(configs=>ClassLab.validate(configs),selected);report.validation.push(...rows);console.log(JSON.stringify({validation:name,fights:rows.reduce((s,x)=>s+x.n,0)}));}
 report.probes=await p.evaluate(()=>ClassLab.probes());
 report.passiveProbes=await p.evaluate(()=>ClassLab.passiveProbes());
 report.sequenceProbes=await p.evaluate(()=>ClassLab.sequenceProbes());
 fs.writeFileSync(path.join(out,'class-lab-results.json'),JSON.stringify(report));
 console.log(JSON.stringify({totalDiscovery:report.rows.reduce((s,x)=>s+x.n,0),alternativeFights:report.alternativeRows.reduce((s,x)=>s+x.n,0),totalValidation:report.validation.reduce((s,x)=>s+x.n,0),skillProbes:report.probes.length,probeErrors:report.probes.filter(x=>x.error).length,passiveProbes:report.passiveProbes.length,passiveFailures:report.passiveProbes.filter(x=>!x.pass),sequenceRuns:report.sequenceProbes.reduce((s,x)=>s+x.n,0)}));
 await browser.close();server.close();
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
