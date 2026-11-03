const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
 const option=(name,fallback)=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.split('=')[1]||fallback;
 const out=path.resolve(__dirname,'../docs/qa',option('out','warrior-progression-legendary'));fs.mkdirSync(out,{recursive:true});
 const seeds=option('seeds','101,202,303').split(',').map(Number),routes=option('routes','paladino,berserker,samurai,ninja').split(',');
 const resume=process.argv.includes('--resume'),destination=path.join(out,'results.json');
 const runs=resume&&fs.existsSync(destination)?JSON.parse(fs.readFileSync(destination,'utf8')).runs:[];
 const write=(file,data)=>{fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2));fs.renameSync(file+'.tmp',file);};
 try{
  for(const seed of seeds)for(const route of routes){
   if(runs.some(run=>run.route===route&&run.seed===seed))continue;
   const checkpointFile=path.join(out,`checkpoint-${route}-${seed}.json`);
   const checkpoint=resume&&fs.existsSync(checkpointFile)?JSON.parse(fs.readFileSync(checkpointFile,'utf8')):null;
   const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:'+server.address().port);
   await page.addScriptTag({content:fs.readFileSync(path.resolve(__dirname,'warrior-progression-engine.js'),'utf8')});
   await page.evaluate(({config,checkpoint})=>startWarriorProgression(config,checkpoint),{config:{seed,route},checkpoint});
   let result,lastLogFights=-200,lastLogWaits=0,lastLevel=0;
   do{
    result=await page.evaluate(()=>stepWarriorProgression(40));
    if(result.done||result.fights-lastLogFights>=200||result.boardWaits-lastLogWaits>=30||result.level>=lastLevel+10){
     console.log(JSON.stringify({route,seed,level:result.level,region:result.region,fights:result.fights,deaths:result.deaths,endgameDeaths:result.endgameDeaths,gear:result.gear,bosses:result.bosses.length,task:result.task,waits:result.boardWaits,done:result.done}));
     lastLogFights=result.fights;lastLogWaits=result.boardWaits;lastLevel=result.level;
    }
    write(path.join(out,'running.json'),result);
    write(checkpointFile,await page.evaluate(()=>exportWarriorCheckpoint()));
   }while(!result.done);
   assert.deepEqual(errors,[]);
   assert(result.reason==='Paradoxo derrotado'||result.level===100&&result.fullLegendary&&result.endgameDeaths===11);
   const points=['strength','vitality','wisdom'].map(key=>result.invested[key]);assert(Math.max(...points)-Math.min(...points)<=1);
   runs.push(result);write(destination,{version:2,method:'Native campaign, balanced points, targeted equipment/material and coin farming after defeats; timed free camp HP recovery, paid mana/potions/tracking, earned drops/chests/contracts only. Success at final boss victory; quit only after 11 deaths while level 100 with all six equipped slots legendary.',runs});
   fs.rmSync(checkpointFile,{force:true});await page.close();
  }
  fs.rmSync(path.join(out,'running.json'),{force:true});console.log('PASS '+runs.length+' adaptive natural progression campaigns');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
