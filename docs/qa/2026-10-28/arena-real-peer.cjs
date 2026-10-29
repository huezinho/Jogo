const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,root,chromium}=require('../2026-10-27/smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[];
 async function make(hp,mp){const ctx=await browser.newContext(),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.evaluate(({hp,mp})=>{selectClass('Guerreiro');player.hp=hp;player.mp=mp;enemy=null;saveCampaign();},{hp,mp});await p.goto(base+'/arena.html');await p.evaluate(()=>{if(!player)continueCampaign();});return {ctx,p};}
 const a=await make(80,32),b=await make(73,29);
 await a.p.evaluate(()=>hostArenaRoom());await a.p.waitForFunction(()=>arenaMultiplayer.peer?.open,{},{timeout:18000});const code=await a.p.evaluate(()=>arenaMultiplayer.roomCode);
 await b.p.locator('#arenaJoinCode').fill(code);await b.p.evaluate(()=>joinArenaRoom());await a.p.waitForFunction(()=>Object.keys(arenaMultiplayer.heroStates).length===2,{},{timeout:18000});
 await a.p.evaluate(()=>startArenaDuel());await b.p.waitForFunction(()=>arenaMultiplayer.duelActive,{},{timeout:10000});
 // Controlled fatal setup, then an actual guest action and actual host->guest result payload.
 await a.p.evaluate(()=>{
  const ids=Object.keys(arenaMultiplayer.heroStates),host=arenaMultiplayer.peer.id,guest=ids.find(x=>x!==host);
  arenaMultiplayer.heroStates[host].hp=1;arenaMultiplayer.turnId=guest;
  const state={type:'arena_state',heroStates:arenaMultiplayer.heroStates,duelActive:true,turnId:guest,round:arenaMultiplayer.round,revision:arenaMultiplayer.revision,duelId:arenaMultiplayer.duelId};
  arenaMultiplayer.connections[guest].send(JSON.parse(JSON.stringify(state)));
 });
 await b.p.waitForFunction(()=>arenaMultiplayer.turnId===arenaMultiplayer.peer.id,{},{timeout:10000});await b.p.evaluate(()=>arenaAttack());
 await a.p.waitForFunction(()=>!arenaMultiplayer.duelActive,{},{timeout:10000});await b.p.waitForFunction(()=>!arenaMultiplayer.duelActive,{},{timeout:10000});
 const read=p=>p.evaluate(()=>({hp:player.hp,mp:player.mp,stats:player.stats,save:JSON.parse(localStorage.getItem(SAVE_KEY)).player,result:arenaMultiplayer.result}));
 const host=await read(a.p),guest=await read(b.p);
 assert.equal(host.hp,80);assert.equal(host.mp,32);assert.equal(host.save.hp,80);assert.equal(host.stats.arenaDuels,1);assert.equal(host.stats.arenaWins,0);
 assert.equal(guest.hp,73);assert.equal(guest.mp,29);assert.equal(guest.save.hp,73);assert.equal(guest.stats.arenaDuels,1);assert.equal(guest.stats.arenaWins,1);
 await b.p.reload();await b.p.evaluate(()=>continueCampaign());const reloaded=await read(b.p);assert.equal(reloaded.hp,73);assert.equal(reloaded.stats.arenaWins,1);
 const report={transport:'Real PeerJS/WebRTC',host,guest,reloaded,errors};fs.writeFileSync(path.join(__dirname,'arena-real-peer-results.json'),JSON.stringify(report,null,2));
 await browser.close();server.close();assert.equal(errors.length,0,errors.join('\n'));console.log('Real PeerJS duel result, both saves and reload: PASS');
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
