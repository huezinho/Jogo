const fs=require('node:fs');const path=require('node:path');
const {server,out,chromium}=require('./smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const report={date:'2026-10-27',transport:'Real PeerJS/WebRTC, isolated browser contexts on one machine',errors:[],arena:{},dungeon:{}};
 async function make(file,className='Guerreiro'){
  const ctx=await browser.newContext();const page=await ctx.newPage();
  page.on('pageerror',e=>report.errors.push({file,error:e.message}));
  await page.goto(base);await page.evaluate(c=>{selectClass(c);enemy=null;saveCampaign();},className);
  await page.goto(base+'/'+file);await page.evaluate(()=>{if(!player)continueCampaign();});
  return {ctx,page};
 }
 try{
  const a=await make('arena.html');const b=await make('arena.html','Mago');
  await a.page.evaluate(()=>hostArenaRoom());
  await a.page.waitForFunction(()=>arenaMultiplayer.peer?.open,{},{timeout:18000});
  const code=await a.page.evaluate(()=>arenaMultiplayer.roomCode);
  await b.page.locator('#arenaJoinCode').fill(code);await b.page.evaluate(()=>joinArenaRoom());
  await a.page.waitForFunction(()=>Object.keys(arenaMultiplayer.fighters).length===2,{},{timeout:18000});
  await a.page.evaluate(()=>startArenaDuel());
  await b.page.waitForFunction(()=>arenaMultiplayer.duelActive,{},{timeout:8000});
  const before=await a.page.evaluate(()=>JSON.parse(JSON.stringify(arenaMultiplayer.heroStates)));
  const hostFirst=await a.page.evaluate(()=>arenaMultiplayer.turnId===arenaMultiplayer.peer.id);
  await (hostFirst?a.page:b.page).evaluate(()=>arenaAttack());await a.page.waitForTimeout(1200);
  report.arena={connected:true,firstAttack:hostFirst?'host':'guest',before,host:await a.page.evaluate(()=>({states:arenaMultiplayer.heroStates,turn:arenaMultiplayer.turnId})),guest:await b.page.evaluate(()=>({states:arenaMultiplayer.heroStates,turn:arenaMultiplayer.turnId}))};
  await b.ctx.close();try{await a.page.waitForFunction(()=>!arenaMultiplayer.duelActive,{},{timeout:15000});}catch{report.arena.disconnectTimeoutMs=15000;}
  report.arena.afterGuestDisconnect=await a.page.evaluate(()=>({active:arenaMultiplayer.duelActive,mode:currentMode,log:document.getElementById('log').innerText}));
  await a.ctx.close();
 }catch(e){report.arena.failure=e.message;}
 try{
  const a=await make('dungeon.html');const b=await make('dungeon.html','Mago');const c=await make('dungeon.html','Adepto da Natureza');
  await a.page.evaluate(()=>hostDungeonRoom());
  await a.page.waitForFunction(()=>dungeonMultiplayer.peer?.open,{},{timeout:18000});
  const code=await a.page.evaluate(()=>dungeonMultiplayer.roomCode);
  for(const member of [b,c]){
   await member.page.locator('#dungeonJoinCode').fill(code);await member.page.evaluate(()=>joinDungeonRoom());
   await member.page.waitForFunction(()=>getDungeonRoomMembers().length>=2,{},{timeout:18000});
  }
  await a.page.waitForFunction(()=>getDungeonRoomMembers().length===3,{},{timeout:18000});
  await a.page.evaluate(()=>startDungeonRaid());
  await b.page.waitForFunction(()=>isDungeonRunMode(),{},{timeout:10000});
  await c.page.waitForFunction(()=>isDungeonRunMode(),{},{timeout:10000});
  report.dungeon={connected:true,initial:await a.page.evaluate(()=>({run:dungeonMultiplayer.run,heroes:dungeonMultiplayer.heroStates}))};
  // Let each current player make legal actions; stop at intermission or defeat.
  for(let i=0;i<12;i++){
   const active=await a.page.evaluate(()=>({phase:dungeonMultiplayer.run.phase,active:dungeonMultiplayer.run.active,turn:dungeonMultiplayer.run.turnOrder[dungeonMultiplayer.run.turnIndex]}));
   if(active.phase!=='battle'||!active.active)break;
   for(const member of [a,b,c]){
    if(await member.page.evaluate(()=>isMyDungeonTurn())){await member.page.evaluate(()=>dungeonAttack());break;}
   }
   await a.page.waitForTimeout(400);
  }
  report.dungeon.afterActions=await a.page.evaluate(()=>({mode:currentMode,run:dungeonMultiplayer.run,log:document.getElementById('log').innerText}));
  await c.page.evaluate(()=>leaveDungeonRoom());await a.page.waitForTimeout(1500);await c.ctx.close();
  report.dungeon.afterOneGuestDisconnect=await a.page.evaluate(()=>({members:getDungeonRoomMembers().length,active:dungeonMultiplayer.run.active,mode:currentMode}));
  await b.page.evaluate(()=>leaveDungeonRoom());await a.page.waitForTimeout(1500);await b.ctx.close();
  report.dungeon.afterBothGuestsDisconnect=await a.page.evaluate(()=>({members:getDungeonRoomMembers().length,active:dungeonMultiplayer.run.active,mode:currentMode,log:document.getElementById('log').innerText}));
  await a.ctx.close();
 }catch(e){report.dungeon.failure=e.message;}
 fs.writeFileSync(path.join(out,'online-results.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({arena:{connected:report.arena.connected,failure:report.arena.failure,afterGuestDisconnect:report.arena.afterGuestDisconnect},dungeon:{connected:report.dungeon.connected,failure:report.dungeon.failure,afterOneGuestDisconnect:report.dungeon.afterOneGuestDisconnect,afterBothGuestsDisconnect:report.dungeon.afterBothGuestsDisconnect},errors:report.errors},null,2));
 await browser.close();server.close();
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
