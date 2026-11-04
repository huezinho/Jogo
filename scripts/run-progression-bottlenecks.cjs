const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
 const out='docs/qa/progression-bottlenecks-2026-11-04';fs.mkdirSync(out,{recursive:true});
 const routes=['paladino','berserker','samurai','ninja','sniper','atirador_arcano','espreitador','guarda_florestal','mago_incendiario','mago_frigido','arquimago','corrompido'];
 try{for(const route of routes)for(const seed of [101,202,303]){
  const dest=path.join(out,`${route}-${seed}.json`);if(fs.existsSync(dest)&&JSON.parse(fs.readFileSync(dest,'utf8')).encounters.every(e=>typeof e.hpMinRatio==='number'))continue;
  const mage=routes.indexOf(route)>=8,name=mage?'Mage':'Revised';
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,mage?'mage-progression-engine.js':'revised-progression-engine.js'),'utf8')});
  await page.evaluate(({name,route,seed})=>window['start'+name+'Progression']({route,seed,captureFights:true}),{name,route,seed});
  let run;do{run=await page.evaluate(name=>window['step'+name+'Progression'](40),name);}while(!run.done);
  assert.deepEqual(errors,[]);assert(run.encounters.length===run.fights);
  assert.equal(run.encounters.filter(e=>e.outcome==='death').length,run.deaths);
  assert(run.reason==='Paradoxo derrotado'||run.level===100&&run.fullLegendary&&run.endgameDeaths===11);
  const prior=JSON.parse(fs.readFileSync(mage?'docs/qa/mage-progression/results.json':'docs/qa/revised-progression-2026-11-04/results.json','utf8')).runs.find(r=>r.route===route&&r.seed===seed);
  const replication={};for(const k of ['fights','deaths','level','reason','retreats'])replication[k]=run[k]===prior[k];
  fs.writeFileSync(dest,JSON.stringify({...run,replication})+'\n');console.log(JSON.stringify({route,seed,fights:run.fights,deaths:run.deaths,level:run.level,reason:run.reason,replication}));
  await page.close();
 }}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
