const fs=require('node:fs');const path=require('node:path');const {server,out,chromium}=require('./smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});const ctx=await browser.newContext();const p=await ctx.newPage();
 await p.route('https://unpkg.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));await p.goto('http://127.0.0.1:'+server.address().port);await p.addScriptTag({content:fs.readFileSync(path.join(out,'class-lab-engine.js'),'utf8')});
 const result=await p.evaluate(()=>{
  const clone=x=>JSON.parse(JSON.stringify(x)),rows=[];
  function setup(id,level){
   const form=ClassLab.forms.find(x=>x.id===id);ClassLab.make(form,level,'hibrida','dummy');
   dungeonMultiplayer=createDungeonMultiplayerState();dungeonMultiplayer.peer={id:'host',destroy(){}};dungeonMultiplayer.isHost=true;
   dungeonMultiplayer.party={host:{id:'host',name:'Host'}};dungeonMultiplayer.connections={};currentMode='dungeon';enemy=null;
   for(const peer of ['guest1','guest2'])handleDungeonHostMessage({peer,send(){}},{type:'join',player:{id:peer,name:peer},heroState:clone(player)});
   startDungeonRaid();
   for(const peer of ['host','guest1','guest2']){const hero=clone(dungeonMultiplayer.heroStates[peer]);hero.hp=Math.floor(hero.hp*.35);handleDungeonHostMessage({peer,send(){}},{type:'hero_state',heroState:hero});}
   const enemyTemplate=clone(dungeonMultiplayer.run.enemies[0]);
   dungeonMultiplayer.run.enemies=[20000,50000,90000].map((hp,i)=>({...clone(enemyTemplate),instanceId:'target'+i,maxHp:hp,hp,attack:0,armor:0}));
   dungeonMultiplayer.run.turnOrder=['host','guest1','guest2','target0','target1','target2'];dungeonMultiplayer.run.turnIndex=0;dungeonMultiplayer.selectedEnemyId='target0';
  }
  for(const [id,level]of [['espirito_da_floresta',50],['fada_monarca',100],['protetor_da_floresta',100]])for(const actor of ['host','guest1']){
   setup(id,level);dungeonMultiplayer.run.turnIndex=actor==='host'?0:1;
   const before=Object.fromEntries(Object.entries(dungeonMultiplayer.heroStates).map(([id,h])=>[id,{hp:h.hp,shield:h.effects?.shieldValue||0}]));
   const index=getSkillInfo().findIndex(s=>s.type==='nature_ancestral_song');
   handleDungeonHostMessage({peer:actor,send(){}},{type:'action',actionKind:'skill',skillIndex:index,targetEnemyId:'target0'});
   const after=Object.fromEntries(Object.entries(dungeonMultiplayer.heroStates).map(([id,h])=>[id,{hp:h.hp,shield:h.effects?.shieldValue||0}]));
   rows.push({form:id,type:'party_heal',actor,before,after});
  }
  for(const [id,type]of [['mago_frigido','mage_blizzard'],['mago_frigido','mage_avalanche'],['fada_monarca','nature_queen_decree']])for(const actor of ['host','guest1']){
   setup(id,100);dungeonMultiplayer.run.turnIndex=actor==='host'?0:1;
   const before=clone(dungeonMultiplayer.run.enemies);const index=getSkillInfo().findIndex(s=>s.type===type);
   handleDungeonHostMessage({peer:actor,send(){}},{type:'action',actionKind:'skill',skillIndex:index,targetEnemyId:'target0'});
   rows.push({form:id,type,actor,targets:dungeonMultiplayer.run.enemies.map((e,i)=>({maxHp:e.maxHp,damage:before[i].hp-e.hp,slowChance:e.blizzardSkipChance,turns:e.blizzardTurns}))});
  }
  return rows;
 });
 fs.writeFileSync(path.join(out,'dungeon-class-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();server.close();
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
