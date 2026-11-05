const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const zlib=require('node:zlib');
const {server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
const output='docs/qa/campaign-balance-2026-11-05/results.json';
const routes=['paladino','berserker','samurai','ninja','sniper','atirador_arcano','espreitador','guarda_florestal','mago_incendiario','mago_frigido','arquimago','corrompido','druida_sombrio','avatar_da_natureza','fada_monarca','protetor_da_floresta'];
const baselineRevision='d8ea212';
const baseline=execFileSync('git',['show',baselineRevision+':assets/js/game.js'],{encoding:'utf8',maxBuffer:4e6});
const engine=fs.readFileSync(path.join(__dirname,'campaign-balance-engine.js'),'utf8');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
 const runs=fs.existsSync(output+'.gz')?JSON.parse(zlib.gunzipSync(fs.readFileSync(output+'.gz'))).runs:fs.existsSync(output)?JSON.parse(fs.readFileSync(output,'utf8')).runs:[];
 const runDir=path.join(path.dirname(output),'runs');fs.mkdirSync(runDir,{recursive:true});
 for(const file of fs.readdirSync(runDir)){if(!file.endsWith('.json'))continue;const r=JSON.parse(fs.readFileSync(path.join(runDir,file),'utf8'));if(!runs.some(x=>x.version===r.version&&x.route===r.route&&x.seed===r.seed))runs.push(r);}
 const tasks=['before','after'].flatMap(version=>routes.flatMap(route=>[101,202,303].map(seed=>({version,route,seed})))).filter(t=>!runs.some(r=>r.version===t.version&&r.route===t.route&&r.seed===t.seed));
 const persist=()=>{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({baselineRevision,seeds:[101,202,303],method:'Same mechanic-aware heuristic for all versions. Balanced attributes. Native combat and current economy/XP, no potions. Full HP/MP between fights; one gifted level after death/escape, repeat failures improve one gear slot. Initial Floresta/Caverna gear retained, Forest accessory; not set optimized. Stop on final boss victory or 11 deaths already at level100 with six legendary pieces. Records include all fights and skill use. Nature policy is new. Version before replaces game.js with the baseline revision; same other files.',runs},null,2));};
 async function worker(){
  while(tasks.length){
   const task=tasks.shift(),context=await browser.newContext(),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route(/\.(png|webp|jpg|mp3)(\?|$)/,route=>route.abort());
   if(task.version==='before')await page.route('**/assets/js/game.js?*',route=>route.fulfill({contentType:'text/javascript',body:baseline}));
   try{
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.addScriptTag({content:engine});
    await page.evaluate(config=>startCampaignBalance(config),{...task,captureFights:true});
    let result;
    do{result=await page.evaluate(()=>stepCampaignBalance(20));console.log(JSON.stringify({version:task.version,route:task.route,seed:task.seed,fights:result.fights,level:result.level,region:result.region,done:result.done}));}while(!result.done);
    assert.deepEqual(errors,[]);
    assert(result.reason==='Paradoxo derrotado'||result.fullLegendary&&result.endgameDeaths===11);
    const points=['strength','vitality','wisdom'].map(k=>result.invested[k]);assert(Math.max(...points)-Math.min(...points)<=1);
    const record={...result,version:task.version};runs.push(record);
    const file=path.join(runDir,task.version+'-'+task.route+'-'+task.seed+'.json');
    for(let attempt=0;;attempt++){try{fs.writeFileSync(file,JSON.stringify(record));break;}catch(error){if(attempt>=20)throw error;await new Promise(r=>setTimeout(r,100));}}
   }finally{await context.close();}
  }
 }
 try{await Promise.all(Array.from({length:Number(process.env.BALANCE_WORKERS)||4},worker));for(let attempt=0;;attempt++){try{persist();break;}catch(error){if(attempt>=20)throw error;await new Promise(r=>setTimeout(r,100));}}
 const full=JSON.parse(fs.readFileSync(output,'utf8'));
 fs.writeFileSync(output+'.gz',zlib.gzipSync(JSON.stringify(full),{level:9}));
 fs.writeFileSync(output,JSON.stringify({...full,fullData:'results.json.gz',runs:full.runs.map(({encounters,deathEvents,gifts,...run})=>run)},null,2));
 for(const file of fs.readdirSync(runDir)){if(/^(before|after)-[a-z_]+-(101|202|303)\.json$/.test(file))fs.unlinkSync(path.join(runDir,file));}
 if(!fs.readdirSync(runDir).length)fs.rmdirSync(runDir);
 console.log('PASS '+runs.length+' before/after campaigns');}
 finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
