const fs=require('node:fs');const path=require('node:path');const {server,out,chromium}=require('./smoke.cjs');
async function main(){
 const file=path.join(out,'class-lab-results.json'),report=JSON.parse(fs.readFileSync(file,'utf8'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});const ctx=await browser.newContext();const p=await ctx.newPage();
 await p.route('https://unpkg.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));await p.goto('http://127.0.0.1:'+server.address().port);await p.addScriptTag({content:fs.readFileSync(path.join(out,'class-lab-engine.js'),'utf8')});
 report.validation=report.validation.filter(x=>x.role!=='original');
 const configs=[];
 for(const form of report.forms.filter(x=>x.tier===2)){
  const candidates=report.rows.filter(x=>x.id===form.id&&x.level===100&&x.encounter==='boss');candidates.sort((a,b)=>b.wins-a.wins||b.damageFraction-a.damageFraction||(a.winTurns??999)-(b.winTurns??999)||b.remainingHpFraction-a.remainingHpFraction);
  const best=candidates[0],selected=report.validation.find(x=>x.id===form.id&&x.role==='selecionada');
  if(best.build!==selected.build||best.strategy!==selected.strategy)configs.push({id:form.id,build:best.build,strategy:best.strategy,role:'original'});
 }
 report.validation.push(...await p.evaluate(configs=>ClassLab.validate(configs),configs));
 report.mechanics=await p.evaluate(()=>ClassLab.mechanics());
 fs.writeFileSync(file,JSON.stringify(report));console.log(JSON.stringify({additionalConfigurations:configs,mechanics:report.mechanics,validationFights:report.validation.reduce((s,x)=>s+x.n,0)},null,2));
 await browser.close();server.close();
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
