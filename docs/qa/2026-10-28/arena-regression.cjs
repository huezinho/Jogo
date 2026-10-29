const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {server,root,chromium}=require('../2026-10-27/smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'msedge'});const report={cases:[],errors:[]};
 async function page(){
  const ctx=await browser.newContext();const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await p.route('https://unpkg.com/**',r=>r.fulfill({contentType:'text/javascript',body:'window.Peer=class{constructor(id){this.id=id||"guest";this.handlers={};setTimeout(()=>this.handlers.open?.(this.id),0);}on(e,f){this.handlers[e]=f;}destroy(){} };'}));
  await p.route('**/arena.html',async r=>{let html=fs.readFileSync(path.join(root,'arena.html'),'utf8');let extra='';for(const f of ['storage-system.js','network-validation.js'])if(!html.includes(f)&&fs.existsSync(path.join(root,'assets/js/systems',f)))extra+='<script src="assets/js/systems/'+f+'"></script>';html=html.replace('<script src="assets/js/game.js',extra+'<script src="assets/js/game.js');await r.fulfill({contentType:'text/html',body:html});});
  await p.goto(base+'/arena.html');await p.evaluate(()=>selectClass('Guerreiro'));return {ctx,p};
 }
 async function setup(p){return p.evaluate(async()=>{
  window.Peer=class{constructor(id){this.id=id||'guest';this.handlers={};setTimeout(()=>this.handlers.open?.(this.id),0);}on(e,f){this.handlers[e]=f;}destroy(){}};
  hostArenaRoom();await new Promise(r=>setTimeout(r,20));
  const conn={peer:'guest',open:true,sent:[],handlers:{},send(p){this.sent.push(JSON.parse(JSON.stringify(p)));},close(){this.open=false;},on(e,f){this.handlers[e]=f;}};
  arenaMultiplayer.peer.handlers.connection(conn);window.__guestConn=conn;
  const hero=JSON.parse(JSON.stringify(player));
  conn.handlers.data({type:'join',fighter:{id:'guest',name:'<img src=x onerror="window.__xss=1">'},heroState:hero});
  startArenaDuel();arenaMultiplayer.turnId=arenaMultiplayer.peer.id;window.__hostId=arenaMultiplayer.peer.id;
  return {guest:!!arenaMultiplayer.heroStates.guest,active:arenaMultiplayer.duelActive};
 });}
 async function test(name,fn){const {ctx,p}=await page();try{const value=await fn(p);report.cases.push({name,pass:true,value});console.log(name+': PASS');}catch(e){report.cases.push({name,pass:false,error:e.stack});console.error(name+': FAIL '+e.message);}await ctx.close();}
 await test('canonical lobby, injection, malformed message',async p=>{
  assert.equal((await setup(p)).active,true);
  const r=await p.evaluate(()=>{const initial=arenaMultiplayer.heroStates.guest.hp;__guestConn.handlers.data({type:'profile_update',fighter:{name:'<img src=x onerror="window.__xss=1">'},heroState:{...arenaMultiplayer.heroStates.guest,hp:999999,attack:999999}});__guestConn.handlers.data({type:'arena_action',kind:'skill',skillIndex:NaN});return {initial,after:arenaMultiplayer.heroStates.guest.hp,attack:arenaMultiplayer.heroStates.guest.attack,xss:window.__xss||0,html:renderArenaRoomControls(),forged:NetworkValidation.sanitizeHero({...player,attack:999999})};});
  assert.equal(r.initial,r.after);assert.equal(r.attack,18);assert.equal(r.xss,0);assert(!r.html.includes('onerror'));assert.equal(r.forged,null);return {hp:r.after};
 });
 await test('shield and invulnerability use defender state',async p=>{
  await setup(p);const r=await p.evaluate(()=>{const defender=arenaMultiplayer.heroStates.guest;defender.effects.shieldValue=500;defender.effects.invulnerableTurns=2;const hp=defender.hp;arenaAttack();const protectedHp=defender.hp;arenaMultiplayer.turnId=__hostId;defender.effects.invulnerableTurns=0;arenaAttack();return {hp,protectedHp,after:defender.hp,shield:defender.effects.shieldValue};});
  assert.equal(r.hp,r.protectedHp);assert.equal(r.hp,r.after);assert(r.shield<500);return r;
 });
 await test('blocked skill preserves turn and DOT',async p=>{
  await setup(p);const r=await p.evaluate(()=>{const actor=arenaMultiplayer.heroStates[__hostId];actor.mp=0;actor.dotDamagePerTurn=10;actor.dotTurns=3;const hp=actor.hp,revision=arenaMultiplayer.revision;arenaUseSkill(0);arenaUseSkill(0);return {hp,after:actor.hp,turn:arenaMultiplayer.turnId,revision,afterRevision:arenaMultiplayer.revision,dot:actor.dotTurns};});
  assert.equal(r.hp,r.after);assert.equal(r.revision,r.afterRevision);assert.equal(r.dot,3);return r;
 });
 await test('defeat cannot poison campaign and result is idempotent',async p=>{
  await setup(p);const r=await p.evaluate(()=>{arenaMultiplayer.heroStates[__hostId].hp=1;arenaMultiplayer.turnId='guest';const action={type:'arena_action',kind:'basic',duelId:arenaMultiplayer.duelId,revision:arenaMultiplayer.revision,actionId:'guest-final'};__guestConn.handlers.data(action);__guestConn.handlers.data(action);saveCampaign();const saved=JSON.parse(localStorage.getItem(SAVE_KEY));return {hp:player.hp,savedHp:saved.player.hp,duels:saved.player.stats.arenaDuels,wins:saved.player.stats.arenaWins,active:arenaMultiplayer.duelActive,result:arenaMultiplayer.result};});
  assert.equal(r.active,false);assert.equal(r.hp,120);assert.equal(r.savedHp,120);assert.equal(r.duels,1);assert.equal(r.wins,0);return r;
 });
 await test('action revision and replay guards',async p=>{
  await setup(p);const r=await p.evaluate(()=>{arenaMultiplayer.turnId='guest';const action={type:'arena_action',kind:'basic',duelId:arenaMultiplayer.duelId,revision:arenaMultiplayer.revision,actionId:'guest-unique'};__guestConn.handlers.data(action);const after=arenaMultiplayer.heroStates[__hostId].hp;arenaMultiplayer.turnId='guest';__guestConn.handlers.data(action);return {after,replayed:arenaMultiplayer.heroStates[__hostId].hp};});assert.equal(r.after,r.replayed);return r;
 });
 await test('periodic equipment bonuses heal the attacker in arena',async p=>{
  await setup(p);const r=await p.evaluate(()=>{
   const source=arenaMultiplayer.heroStates[__hostId],target=arenaMultiplayer.heroStates.guest;
   for(const slot of EquipmentData.slots.slice(0,4))source.equipment[slot]=EquipmentSystem.createItem('Necropole',slot,source.class,'ofensivo','rara');
   source.hp=10;target.maxHp=target.hp=1000;arenaPassTurn();const before=source.hp,hp=target.hp;
   target.dotDamagePerTurn=100;target.dotTurns=2;target.equipmentDotOwners={dotTurns:source.characterId};
   __guestConn.handlers.data({type:'arena_action',kind:'pass',duelId:arenaMultiplayer.duelId,revision:arenaMultiplayer.revision,actionId:'guest-periodic'});
   return {damage:hp-target.hp,healed:source.hp-before,remaining:target.dotTurns};
  });assert.equal(r.damage,108);assert.equal(r.healed,2);assert.equal(r.remaining,1);return r;
 });
 await test('pass advances equipment action cooldowns',async p=>{
  await setup(p);const r=await p.evaluate(()=>{
   const actor=arenaMultiplayer.heroStates[__hostId];actor.effects.equipmentRuntime={turn:3,cooldowns:{stone:2}};
   arenaPassTurn();return actor.effects.equipmentRuntime;
  });assert.equal(r.turn,4);assert.equal(r.cooldowns.stone,1);assert.equal(r.current,null);return r;
 });
 await test('natural DOT keeps mastery and Sap in arena',async p=>{
  await setup(p);const r=await p.evaluate(()=>{
   const source=arenaMultiplayer.heroStates[__hostId],target=arenaMultiplayer.heroStates.guest;
   source.class='Adepto da Natureza';source.level=100;source.subclassChoices={tier30:'druida',tier60:'druida_sombrio'};source.maxHp=1000;source.hp=10;target.maxHp=target.hp=1000;
   arenaPassTurn();const before=source.hp,hp=target.hp;target.natureDecayDamage=100;target.natureDecayTurns=2;target.equipmentDotOwners={natureDecayTurns:source.characterId};
   __guestConn.handlers.data({type:'arena_action',kind:'pass',duelId:arenaMultiplayer.duelId,revision:arenaMultiplayer.revision,actionId:'guest-natural-periodic'});
   return {damage:hp-target.hp,healed:source.hp-before,remaining:target.natureDecayTurns};
  });assert.equal(r.damage,130);assert.equal(r.healed,10);assert.equal(r.remaining,1);return r;
 });
 await test('heartbeat ends abandoned duel with campaign intact',async p=>{
  await setup(p);await p.evaluate(()=>{arenaMultiplayer.lastSeen.guest=Date.now()-20000;});await p.waitForTimeout(3300);const r=await p.evaluate(()=>({active:arenaMultiplayer.duelActive,hp:player.hp,members:Object.keys(arenaMultiplayer.heroStates).length}));assert.equal(r.active,false);assert.equal(r.hp,120);assert.equal(r.members,1);return r;
 });
 await browser.close();server.close();fs.writeFileSync(path.join(__dirname,'arena-regression-results.json'),JSON.stringify(report,null,2));assert.equal(report.errors.length,0,report.errors.join('\n'));assert(report.cases.every(x=>x.pass),'Arena regressions failed');
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
