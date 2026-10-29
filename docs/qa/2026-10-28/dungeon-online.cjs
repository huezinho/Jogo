const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const{server,chromium}=require('../2026-10-27/smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'msedge',headless:true});const report={cases:[],errors:[],transport:'Real PeerJS/WebRTC, isolated browser contexts on one machine'};
 async function make(cls){const ctx=await browser.newContext();const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base);await p.evaluate(c=>{selectClass(c);enemy=null;saveCampaign();},cls);await p.goto(base+'/dungeon.html');return{ctx,p};}
 async function party(count=3){const members=[];for(const cls of ['Guerreiro','Mago','Adepto da Natureza'].slice(0,count))members.push(await make(cls));const host=members[0];await host.p.evaluate(()=>hostDungeonRoom());await host.p.waitForFunction(()=>dungeonMultiplayer.peer?.open,{},{timeout:18000});const code=await host.p.evaluate(()=>dungeonMultiplayer.roomCode);
  for(const member of members.slice(1)){await member.p.locator('#dungeonJoinCode').fill(code);await member.p.evaluate(()=>joinDungeonRoom());}
  await host.p.waitForFunction(n=>getDungeonRoomMembers().length===n,count,{timeout:18000});await host.p.evaluate(()=>startDungeonRaid());for(const m of members.slice(1))await m.p.waitForFunction(()=>currentMode==='dungeon_run',{},{timeout:10000});return members;
 }
 try{
  const members=await party(3),[a,b,c]=members;
  for(let i=0;i<24;i++){
   const state=await a.p.evaluate(()=>({phase:dungeonMultiplayer.run.phase,revision:dungeonMultiplayer.run.revision,turn:getDungeonCurrentTurnId()}));if(state.phase==='intermission')break;
   const actor=(await Promise.all(members.map(async m=>({m,id:await m.p.evaluate(()=>dungeonMultiplayer.peer.id)})))).find(x=>x.id===state.turn)?.m;
   assert(actor,'Current hero should have a client');await actor.p.waitForFunction(()=>isMyDungeonTurn(),{},{timeout:6000});await actor.p.evaluate(()=>dungeonAttack());await a.p.waitForFunction(rev=>dungeonMultiplayer.run.revision>rev,state.revision,{timeout:6000});await a.p.waitForTimeout(150);
  }
  assert.equal(await a.p.evaluate(()=>dungeonMultiplayer.run.phase),'intermission');
  await a.p.evaluate(()=>{for(const[id,h]of Object.entries(dungeonMultiplayer.heroStates)){h.dungeonCoins=1000;h.hp=20;dungeonMultiplayer.party[id].coins=1000;dungeonMultiplayer.party[id].hp=20;}dungeonMultiplayer.localHero.dungeonCoins=1000;dungeonMultiplayer.localHero.hp=20;dungeonMultiplayer.dungeonCoins=1000;broadcastDungeonState();});
  await b.p.waitForFunction(()=>dungeonMultiplayer.localHero.dungeonCoins===1000,{},{timeout:6000});await b.p.evaluate(()=>buyDungeonOffer('offer_health_potion'));
  await a.p.waitForFunction(()=>Object.values(dungeonMultiplayer.heroStates).some(h=>h.class==='Mago'&&h.runInventory.length===1),{},{timeout:6000});
  await b.p.waitForFunction(()=>dungeonMultiplayer.localHero.runInventory.length===1,{},{timeout:6000});const bought=await b.p.evaluate(()=>({coins:dungeonMultiplayer.localHero.dungeonCoins,qty:dungeonMultiplayer.localHero.runInventory[0].qty}));
  await b.p.evaluate(()=>useDungeonConsumable(dungeonMultiplayer.localHero.runInventory[0].uid));await b.p.waitForFunction(()=>dungeonMultiplayer.localHero.runInventory.length===0,{},{timeout:6000});const healed=await b.p.evaluate(()=>dungeonMultiplayer.localHero.hp);assert(healed>20);
  await c.p.evaluate(()=>useDungeonFountain());await c.p.waitForFunction(()=>dungeonMultiplayer.localHero.runStats.dungeonFountainUses===1,{},{timeout:6000});
  const snapshots=await Promise.all(members.map(m=>m.p.evaluate(()=>JSON.stringify(dungeonMultiplayer.heroStates))));assert.equal(snapshots[0],snapshots[1]);assert.equal(snapshots[0],snapshots[2]);
  await a.p.evaluate(()=>{const id=Object.keys(dungeonMultiplayer.heroStates).find(id=>dungeonMultiplayer.heroStates[id].class==='Mago'),h=dungeonMultiplayer.heroStates[id];h.level=2;h.levelUpPoints=1;h.pendingLevelUps=1;h.allocation={strength:0,vitality:0,wisdom:0};broadcastDungeonState();});
  await b.p.waitForFunction(()=>dungeonMultiplayer.localHero.level===2,{},{timeout:6000});await b.p.evaluate(()=>adjustAttribute('vitality',1));await b.p.waitForFunction(()=>dungeonMultiplayer.localHero.allocation.vitality===1,{},{timeout:6000});await b.p.evaluate(()=>finishLevelUp());await b.p.waitForFunction(()=>dungeonMultiplayer.localHero.stats.invested.vitality===1,{},{timeout:6000});
  const allocation=await b.p.evaluate(()=>({maxHp:dungeonMultiplayer.localHero.maxHp,points:dungeonMultiplayer.localHero.levelUpPoints}));assert.equal(allocation.maxHp,93);assert.equal(allocation.points,0);
  await c.p.evaluate(()=>leaveDungeonRoom());await a.p.waitForFunction(()=>getDungeonRoomMembers().length===2,{},{timeout:6000});await c.ctx.close();
  await b.p.evaluate(()=>{dungeonMultiplayer.hostConnection.send=()=>{};});const silentSince=Date.now();await a.p.waitForFunction(()=>!dungeonMultiplayer.run.active,{},{timeout:18000});const timeoutMs=Date.now()-silentSince;const ended=await a.p.evaluate(()=>({active:dungeonMultiplayer.run.active,best:player.stats.dungeonBestStep,coins:player.coins,applied:player.stats.appliedDungeonRuns.length}));assert.equal(ended.best,1);assert.equal(ended.applied,1);assert(timeoutMs>=10000&&timeoutMs<16500);
  report.cases.push({name:'three-client battle, shop, potion, fountain, allocation, silent guest timeout',pass:true,bought,healed,allocation,timeoutMs,ended});await b.ctx.close();await a.ctx.close();console.log('three-client authoritative flow: PASS');
 }catch(e){report.cases.push({name:'three-client authoritative flow',pass:false,error:e.stack});console.error(e.stack);}
 try{
  const[a,b]=await party(2);
  await a.p.evaluate(()=>{const run=dungeonMultiplayer.run;run.regionIndex=11;run.encounterIndex=6;run.revision++;const boss=createEnemyFromTemplate(regions.Paradoxo.boss,true,'Paradoxo');boss.instanceId='final-fixture';boss.hp=1;boss.armor=0;run.enemies=[boss];run.turnOrder=[dungeonMultiplayer.peer.id,...Object.keys(dungeonMultiplayer.heroStates).filter(id=>id!==dungeonMultiplayer.peer.id),'final-fixture'];run.turnIndex=0;dungeonMultiplayer.selectedEnemyId='final-fixture';broadcastDungeonState();dungeonAttack();});
  for(const m of [a,b])await m.p.waitForFunction(()=>!dungeonMultiplayer.run.active&&player.stats.dungeonClears===1,{},{timeout:8000});
  const results=await Promise.all([a,b].map(m=>m.p.evaluate(()=>({clears:player.stats.dungeonClears,best:player.stats.dungeonBestStep,coins:player.coins,applied:player.stats.appliedDungeonRuns.length,materials:player.inventory.filter(i=>i.type==='material').reduce((n,i)=>n+i.qty,0)}))));assert(results.every(x=>x.clears===1&&x.best===84&&x.applied===1));assert.equal(results[0].coins,results[1].coins);assert(results.every(x=>x.materials>=1));report.cases.push({name:'real final reward transfer to host and guest',pass:true,results});for(const m of [a,b])await m.ctx.close();console.log('real final reward transfer: PASS');
 }catch(e){report.cases.push({name:'real final reward transfer',pass:false,error:e.stack});console.error(e.stack);}
 try{
  const[a,b]=await party(2);await a.p.evaluate(()=>{for(const h of Object.values(dungeonMultiplayer.heroStates))h.dungeonCoins=50;dungeonMultiplayer.localHero.dungeonCoins=50;dungeonMultiplayer.dungeonCoins=50;broadcastDungeonState();});await b.p.waitForFunction(()=>dungeonMultiplayer.localHero.dungeonCoins===50,{},{timeout:6000});
  await a.p.evaluate(()=>{for(const connection of Object.values(dungeonMultiplayer.connections))connection.send=()=>{};});const silentSince=Date.now();await b.p.waitForFunction(()=>!dungeonMultiplayer.run.active,{},{timeout:18000});const timeoutMs=Date.now()-silentSince,guest=await b.p.evaluate(()=>({coins:player.coins,applied:player.stats.appliedDungeonRuns.length}));assert.equal(guest.coins,50);assert.equal(guest.applied,1);assert(timeoutMs>=10000&&timeoutMs<16500);report.cases.push({name:'silent host timeout preserves last confirmed reward',pass:true,timeoutMs,guest});for(const m of [a,b])await m.ctx.close();console.log('silent host timeout: PASS');
 }catch(e){report.cases.push({name:'silent host timeout preserves last confirmed reward',pass:false,error:e.stack});console.error(e.stack);}
 await browser.close();server.close();fs.writeFileSync(path.join(__dirname,'dungeon-online-results.json'),JSON.stringify(report,null,2));assert.equal(report.errors.length,0,report.errors.join('\n'));assert(report.cases.every(x=>x.pass),'Dungeon online failed');
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
