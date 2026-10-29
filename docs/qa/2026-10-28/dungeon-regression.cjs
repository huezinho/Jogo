const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'msedge',headless:true});const report={cases:[],errors:[]};
 async function page(){const ctx=await browser.newContext();const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base);await p.evaluate(()=>{selectClass('Guerreiro');updateUI=()=>{};queueCampaignSave=()=>{};});
  await p.evaluate(()=>{
   const clone=x=>JSON.parse(JSON.stringify(x));const baseline=clone(player);
   window.__makeHero=(className,id,level=100)=>{
    const h=clone(baseline),b=classes[className];h.characterId=id;h.class=className;h.characterName=className;h.level=level;h.xp=0;h.coins=0;h.inventory=[];h.equipment=Object.fromEntries(equipmentSlots.map(s=>[s,null]));
    h.baseStats={hp:b.hp,mp:b.mp,attack:b.attack};h.maxHp=b.hp;h.maxMp=b.mp;h.attack=b.attack;h.stats.invested=createDefaultInvestedStats();
    h.subclassChoices=level>=30?{tier30:{Guerreiro:'cavaleiro',Mago:'elementalista',Arqueiro:'atirador','Adepto da Natureza':'espirito_da_floresta'}[className],tier60:level>=60?{Guerreiro:'paladino',Mago:'mago_frigido',Arqueiro:'sniper','Adepto da Natureza':'protetor_da_floresta'}[className]:null}:{tier30:null,tier60:null};
    for(let lv=2;lv<=level;lv++){const attr=['strength','vitality','wisdom'][(lv-2)%3],g=getAttributePointGain(attr,lv);h.stats.invested[attr]++;if(attr==='strength'){h.attack+=g;h.stats.invested.attackGain+=g;h.stats.invested.skillGain+=g;}if(attr==='vitality'){h.maxHp+=g;h.stats.invested.hpGain+=g;}if(attr==='wisdom'){h.maxMp+=g;h.stats.invested.mpGain+=g;}}
    const old=player,oldAlloc=allocation;player=h;allocation={strength:0,vitality:0,wisdom:0};h.hp=getCurrentCaps().maxHp;h.mp=getCurrentCaps().maxMp;player=old;allocation=oldAlloc;return h;
   };
   window.__setup=(className='Guerreiro',level=100,guests=1)=>{
    player=__makeHero(className,'host-character',level);player.stats.dungeonClears=3;player.stats.dungeonBestStep=40;playerEffects=createDefaultPlayerEffects();enemy=null;currentMode='dungeon';isDead=false;levelUpPoints=pendingLevelUps=0;allocation={strength:0,vitality:0,wisdom:0};
    dungeonMultiplayer=createDungeonMultiplayerState();dungeonMultiplayer.peer={id:'host',destroy(){}};dungeonMultiplayer.isHost=true;dungeonMultiplayer.party={host:{id:'host',name:'Host'}};dungeonMultiplayer.connections={};
    window.__connections={};
    for(let i=1;i<=guests;i++){const id='guest'+i,c={peer:id,open:true,sent:[],send(data){this.sent.push(clone(data));},close(){this.open=false;}};__connections[id]=c;handleDungeonHostMessage(c,{type:'join',heroState:__makeHero(className,id+'-character',level),player:{name:'<img src=x onerror=window.__xss=1>'}});}
    startDungeonRaid();return {members:getDungeonRoomMembers().length,active:dungeonMultiplayer.run.active};
   };
   window.__intent=(peer,payload)=>({type:'action',...payload,runId:dungeonMultiplayer.run.runId,revision:dungeonMultiplayer.run.revision,actionId:peer+'-'+Math.random()});
   window.__hero=id=>id==='host'?dungeonMultiplayer.localHero:dungeonMultiplayer.heroStates[id];
   window.__safeEnemies=()=>{for(const e of dungeonMultiplayer.run.enemies){e.hp=e.maxHp=100000;e.attack=0;e.armor=0;e.maxHpStrikePercent=0;e.isBoss=false;e.bossAbilities=[];}};
  });return {ctx,p};}
 async function test(name,fn){const {ctx,p}=await page();try{const value=await fn(p);report.cases.push({name,pass:true,value});console.log(name+': PASS');}catch(e){report.cases.push({name,pass:false,error:e.stack});console.error(name+': FAIL '+e.message);}await ctx.close();}
 await test('canonical lobby, runtime injection, revision/replay and turnConsumed',async p=>{
  assert.deepEqual(await p.evaluate(()=>__setup()),{members:2,active:true});
  const r=await p.evaluate(()=>{__safeEnemies();const hero=__hero('guest1'),initial=hero.hp,c=__connections.guest1;
   handleDungeonHostMessage(c,{type:'hero_state',heroState:{...hero,hp:999999,attack:999999}});handleDungeonHostMessage(c,{type:'profile_update',heroState:{...hero,hp:999999,attack:999999}});handleDungeonHostMessage(c,{type:'enemy_reaction',updatedEnemy:{...dungeonMultiplayer.run.enemies[0],hp:0}});
   const afterInjection=__hero('guest1').hp;dungeonMultiplayer.run.turnIndex=dungeonMultiplayer.run.turnOrder.indexOf('guest1');
   const action=__intent('guest1',{actionKind:'basic_attack',targetEnemyId:dungeonMultiplayer.run.enemies[0].instanceId,turnConsumed:false});handleDungeonHostMessage(c,action);
   const after=dungeonMultiplayer.run.enemies[0].hp,turn=getDungeonCurrentTurnId();dungeonMultiplayer.run.turnIndex=dungeonMultiplayer.run.turnOrder.indexOf('guest1');handleDungeonHostMessage(c,action);
   return {initial,afterInjection,after,replayed:dungeonMultiplayer.run.enemies[0].hp,turn,xss:window.__xss||0,html:document.body.innerHTML.includes('onerror=window.__xss')};});
  assert.equal(r.initial,r.afterInjection);assert.equal(r.after,r.replayed);assert.notEqual(r.turn,'guest1');assert.equal(r.xss,0);assert.equal(r.html,false);return r;
 });
 await test('blocked skill does not tick DOT, expire shield or consume turn',async p=>{
  await p.evaluate(()=>__setup());const r=await p.evaluate(()=>{__safeEnemies();const hero=__hero('guest1');hero.mp=0;hero.effects.burnTurns=3;hero.effects.burnDamagePerTurn=25;hero.effects.shieldTurns=2;hero.effects.shieldValue=100;dungeonMultiplayer.run.turnIndex=1;
   const hp=hero.hp,rev=dungeonMultiplayer.run.revision;handleDungeonHostMessage(__connections.guest1,__intent('guest1',{actionKind:'skill',skillIndex:0,targetEnemyId:dungeonMultiplayer.run.enemies[0].instanceId}));return {hp,after:__hero('guest1').hp,rev,afterRev:dungeonMultiplayer.run.revision,burn:__hero('guest1').effects.burnTurns,shield:__hero('guest1').effects.shieldTurns,turn:getDungeonCurrentTurnId()};});
  assert.equal(r.hp,r.after);assert.equal(r.rev,r.afterRev);assert.equal(r.burn,3);assert.equal(r.shield,2);assert.equal(r.turn,'guest1');return r;
 });
 await test('guest party heal and shield reach each ally once',async p=>{
  await p.evaluate(()=>__setup('Adepto da Natureza',100,2));const r=await p.evaluate(()=>{__safeEnemies();for(const id of ['host','guest1','guest2']){const h=__hero(id);h.hp=100;h.effects.shieldValue=0;h.effects.natureCadence=0;}
   dungeonMultiplayer.run.turnIndex=1;const skill=getSkillInfo().findIndex(s=>s.type==='nature_ancestral_song');handleDungeonHostMessage(__connections.guest1,__intent('guest1',{actionKind:'skill',skillIndex:skill,targetEnemyId:dungeonMultiplayer.run.enemies[0].instanceId}));return Object.fromEntries(['host','guest1','guest2'].map(id=>[id,{hp:__hero(id).hp,shield:__hero(id).effects.shieldValue}]));});
  assert(r.host.hp>100);assert.equal(r.host.hp,r.guest1.hp);assert.equal(r.host.hp,r.guest2.hp);assert.equal(r.host.shield,r.guest1.shield);assert.equal(r.host.shield,r.guest2.shield);return r;
 });
 await test('Avalanche per-target percent, frostburn and DOT ownership',async p=>{
  await p.evaluate(()=>__setup('Mago',100,2));const r=await p.evaluate(()=>{const t=dungeonMultiplayer.run.enemies[0];dungeonMultiplayer.run.enemies=[20000,50000,90000].map((hp,i)=>({...JSON.parse(JSON.stringify(t)),instanceId:'target'+i,hp,maxHp:hp,armor:0,attack:0}));dungeonMultiplayer.run.turnOrder=['host','guest1','guest2','target0','target1','target2'];dungeonMultiplayer.run.turnIndex=1;dungeonMultiplayer.selectedEnemyId='target0';const i=getSkillInfo().findIndex(s=>s.type==='mage_avalanche');handleDungeonHostMessage(__connections.guest1,__intent('guest1',{actionKind:'skill',skillIndex:i,targetEnemyId:'target0'}));return dungeonMultiplayer.run.enemies.map(e=>({maxHp:e.maxHp,damage:e.maxHp-e.hp,dot:e.dotDamagePerTurn,owner:e.equipmentDotOwners?.dotTurns}));});
  assert.equal(r[1].damage-r[0].damage,15000);assert.equal(r[2].damage-r[1].damage,20000);assert.equal(r[0].dot,600);assert.equal(r[2].dot,2700);assert(r.every(x=>x.owner==='guest1-character'));return r;
 });
 await test('Canto uses caster gear and counts effective allied support for Panteao',async p=>{
  await p.evaluate(()=>__setup('Adepto da Natureza',100,2));const r=await p.evaluate(()=>{
   __safeEnemies();
   for(const id of ['host','guest2']){const h=__hero(id);Object.assign(h,__makeHero('Guerreiro',h.characterId,100));h.hp=10;h.effects=createDefaultPlayerEffects();}
   const receiver=__hero('host');for(const slot of EquipmentData.slots)receiver.equipment[slot]=EquipmentSystem.createItem('Panteao',slot,'Guerreiro','suporte','lendaria');
   let caster=__hero('guest1');for(const slot of EquipmentData.slots)caster.equipment[slot]=EquipmentSystem.createItem('Panteao',slot,caster.class,'suporte','rara');
   const oldPlayer=player,oldEffects=playerEffects;player=caster;playerEffects=caster.effects;caster.hp=getCurrentCaps().maxHp;const song=getSkillInfo().find(s=>s.type==='nature_ancestral_song'),skillIndex=getSkillInfo().findIndex(s=>s.type==='nature_ancestral_song'),expectedHeal=EquipmentSystem.modifyHealing(caster,createDefaultPlayerEffects(),song.heal),expectedShield=EquipmentSystem.modifyShield(caster,createDefaultPlayerEffects(),song.shield,{track:false});player=oldPlayer;playerEffects=oldEffects;
   const actions=[];for(let n=0;n<3;n++){
    caster=__hero('guest1');caster.mp=10000;caster.noShieldTurns=1;for(const id of ['host','guest2']){__hero(id).hp=10;__hero(id).effects.shieldValue=0;}
    dungeonMultiplayer.run.turnIndex=dungeonMultiplayer.run.turnOrder.indexOf('guest1');handleDungeonHostMessage(__connections.guest1,__intent('guest1',{actionKind:'skill',skillIndex,targetEnemyId:dungeonMultiplayer.run.enemies[0].instanceId}));
    actions.push({heals:['host','guest2'].map(id=>__hero(id).hp-10),shields:['host','guest2'].map(id=>__hero(id).effects.shieldValue),sourceHp:__hero('guest1').hp,sourceShield:__hero('guest1').effects.shieldValue,support:__hero('guest1').effects.equipmentRuntime.supportActions||0,ready:__hero('guest1').effects.equipmentRuntime.supportReady||0});
   }
   for(const id of ['host','guest1','guest2']){const h=__hero(id),saved=player;player=h;h.hp=getCurrentCaps().maxHp;h.noShieldTurns=1;player=saved;}
   caster=__hero('guest1');caster.mp=10000;dungeonMultiplayer.run.turnIndex=dungeonMultiplayer.run.turnOrder.indexOf('guest1');handleDungeonHostMessage(__connections.guest1,__intent('guest1',{actionKind:'skill',skillIndex,targetEnemyId:dungeonMultiplayer.run.enemies[0].instanceId}));
   return {expectedHeal,expectedShield,actions,ineffectiveSupportActions:__hero('guest1').effects.equipmentRuntime.supportActions||0};
  });assert(r.expectedHeal>0);for(const action of r.actions){assert.deepEqual(action.heals,[r.expectedHeal,r.expectedHeal]);assert.deepEqual(action.shields,[r.expectedShield,r.expectedShield]);assert.equal(action.sourceShield,0);}assert.deepEqual(r.actions.map(a=>a.support),[1,2,0]);assert.equal(r.actions[2].ready,1);assert.equal(r.ineffectiveSupportActions,0);return r;
 });
 await test('authoritative shop, consumable, fountain and allocation intentions',async p=>{
  await p.evaluate(()=>__setup('Guerreiro',20,1));const r=await p.evaluate(()=>{__safeEnemies();const run=dungeonMultiplayer.run,c=__connections.guest1;run.phase='intermission';run.shopStock=[{id:'test-offer',cost:25,item:createConsumableItem('health_potion',1)}];__hero('guest1').dungeonCoins=100;
   const buy=__intent('guest1',{type:'run_operation',kind:'buy',itemId:'test-offer'});handleDungeonHostMessage(c,buy);handleDungeonHostMessage(c,buy);
   const bought={coins:__hero('guest1').dungeonCoins,qty:__hero('guest1').runInventory[0]?.qty};__hero('guest1').hp=10;const item=__hero('guest1').runInventory[0];handleDungeonHostMessage(c,__intent('guest1',{type:'run_operation',kind:'use',itemId:item.uid}));const used={hp:__hero('guest1').hp,items:__hero('guest1').runInventory.length};
   for(const id of ['host','guest1']){__hero(id).hp=10;__hero(id).mp=10;__hero(id).dungeonCoins=1000;dungeonMultiplayer.party[id].coins=1000;}dungeonMultiplayer.dungeonCoins=1000;
   handleDungeonHostMessage(c,__intent('guest1',{type:'run_operation',kind:'fountain'}));const fountain={hostHp:__hero('host').hp,guestHp:__hero('guest1').hp,hostCoins:__hero('host').dungeonCoins,guestCoins:__hero('guest1').dungeonCoins,uses:__hero('guest1').runStats.dungeonFountainUses};
   const h=__hero('guest1');h.level=21;h.levelUpPoints=1;h.pendingLevelUps=1;h.allocation={strength:0,vitality:0,wisdom:0};const before=h.maxHp;
   handleDungeonHostMessage(c,__intent('guest1',{type:'run_operation',kind:'allocate',attribute:'vitality',amount:1}));handleDungeonHostMessage(c,__intent('guest1',{type:'run_operation',kind:'finish_level'}));
   return {bought,used,fountain,allocation:{before,after:__hero('guest1').maxHp,points:__hero('guest1').levelUpPoints,expected:getAttributePointGain('vitality',21)}};});
  assert.deepEqual(r.bought,{coins:75,qty:1});assert(r.used.hp>10);assert.equal(r.used.items,0);assert(r.fountain.hostHp>10);assert.equal(r.fountain.hostHp,r.fountain.guestHp);assert.equal(r.fountain.hostCoins,r.fountain.guestCoins);assert.equal(r.fountain.uses,1);assert.equal(r.allocation.after-r.allocation.before,r.allocation.expected);assert.equal(r.allocation.points,0);return r;
 });
 await test('84 encounters preserve completion and apply rewards once',async p=>{
  await p.evaluate(()=>__setup());const r=await p.evaluate(()=>{const runId=dungeonMultiplayer.run.runId;player.inventory.push({id:'test-material',type:'material',qty:7,uid:'preserve-me'});
   for(const id of ['host','guest1']){const h=__hero(id);h.attack=100000;h.hp=h.maxHp=100000;h.maxMp=h.mp=10000;}
   let guard=0,intermissions=0;while(dungeonMultiplayer.run.active&&guard++<700){const run=dungeonMultiplayer.run;if(run.phase==='intermission'){intermissions++;advanceDungeonIntermission();continue;}const peer=getDungeonCurrentTurnId();for(const e of run.enemies)if(e.hp>0)e.hp=1;
    const action={actionKind:'basic_attack',targetEnemyId:run.enemies.find(e=>e.hp>0)?.instanceId};if(peer==='host')dungeonAttack();else if(peer==='guest1')handleDungeonHostMessage(__connections.guest1,__intent('guest1',action));else throw Error('Unexpected enemy turn');}
   const before={coins:player.coins,clears:player.stats.dungeonClears,best:player.stats.dungeonBestStep,applied:player.stats.appliedDungeonRuns.filter(id=>id===runId).length,material:player.inventory.find(i=>i.uid==='preserve-me')?.qty};
   handleDungeonGuestMessage({type:'run_end',runId,outcome:'complete',message:'duplicate'});return {finished:!dungeonMultiplayer.run.active,intermissions,guard,before,after:{coins:player.coins,clears:player.stats.dungeonClears,best:player.stats.dungeonBestStep}};});
  assert.equal(r.finished,true);assert.equal(r.intermissions,83);assert.equal(r.before.clears,4);assert.equal(r.before.best,84);assert.equal(r.before.applied,1);assert.equal(r.before.material,7);assert.equal(r.after.coins,r.before.coins);assert.equal(r.after.clears,r.before.clears);
  await p.evaluate(()=>saveCampaign());await p.reload();await p.evaluate(()=>continueCampaign('host-character'));r.reloaded=await p.evaluate(()=>({clears:player.stats.dungeonClears,best:player.stats.dungeonBestStep,coins:player.coins,applied:player.stats.appliedDungeonRuns.length}));assert.equal(r.reloaded.clears,4);assert.equal(r.reloaded.best,84);assert.equal(r.reloaded.coins,r.before.coins);assert.equal(r.reloaded.applied,1);return r;
 });
 await test('dungeon materials and contract kills transfer once from host tally',async p=>{
  await p.evaluate(()=>__setup());const r=await p.evaluate(()=>{
   const runId=dungeonMultiplayer.run.runId,target=dungeonMultiplayer.run.enemies[0],name=target.baseName||target.name.replace(/ Lv\.\d+$/,''),material=EquipmentSystem.getMaterials(name,target.region)[0];
   dungeonMultiplayer.run.enemies=[target];dungeonMultiplayer.selectedEnemyId=target.instanceId;dungeonMultiplayer.run.turnIndex=dungeonMultiplayer.run.turnOrder.findIndex(entry=>entry=== 'host'||entry?.id==='host'||entry?.peerId==='host');
   player.mercenary={active:[{id:'contract_1_1_0',targetRegion:target.region,targetName:name,count:100,progress:0,rewardId:EquipmentSystem.getMaterials(regions.Caverna.enemies[0].name,'Caverna')[0].id}],claimed:[]};
   const guest=__hero('guest1');handleDungeonHostMessage(__connections.guest1,{type:'hero_state',heroState:{...guest,runKills:[{region:target.region,name,count:999}],runMaterialDrops:{[material.id]:999}}});
   const injectionAccepted=__hero('guest1').runKills.length>0;
   const random=Math.random;Math.random=()=>.01;target.hp=1;dungeonAttack();Math.random=random;
   const tally=__hero('host').runKills.map(x=>({...x})),drops={...__hero('host').runMaterialDrops};leaveDungeonRoom(true);
   const before={progress:player.mercenary.active[0].progress,qty:getInventoryCountById(material.id),coins:player.coins};
   handleDungeonGuestMessage({type:'run_end',runId,outcome:'complete',heroStates:{},message:'duplicate'});
   return {injectionAccepted,tally,drops,before,after:{progress:player.mercenary.active[0].progress,qty:getInventoryCountById(material.id),coins:player.coins}};
  });assert.equal(r.injectionAccepted,false);assert.equal(r.tally[0].count,1);assert.equal(r.before.progress,1);assert.equal(r.before.qty,3);assert.deepEqual(r.after,r.before);return r;
 });
 await test('pass turn advances equipment cooldown once',async p=>{await p.evaluate(()=>__setup());const result=await p.evaluate(()=>{__safeEnemies();const hero=__hero('host');hero.effects.equipmentRuntime={cooldowns:{stone:3},turn:2};dungeonMultiplayer.run.turnIndex=dungeonMultiplayer.run.turnOrder.findIndex(entry=>entry==='host'||entry?.id==='host'||entry?.peerId==='host');dungeonPassTurn();return {cooldown:__hero('host').effects.equipmentRuntime.cooldowns.stone,turn:__hero('host').effects.equipmentRuntime.turn};});assert.equal(result.cooldown,2);assert.equal(result.turn,3);return result;});
 await test('shared trophy catalog and sequence are page independent',async p=>{const main=await p.evaluate(()=>({count:getTrophies().length,sequence:getDungeonSequence().length}));await p.goto(base+'/arena.html');await p.evaluate(()=>{if(!player)continueCampaign();});const arena=await p.evaluate(()=>({count:getTrophies().length,sequence:getDungeonSequence().length,unknown:isRegionUnlockedForBattle('invalid')}));assert.equal(main.count,44);assert.equal(arena.count,main.count);assert.equal(arena.sequence,84);assert.equal(arena.unknown,false);return {main,arena};});
 await browser.close();server.close();fs.writeFileSync(path.join(__dirname,'dungeon-regression-results.json'),JSON.stringify(report,null,2));assert.equal(report.errors.length,0,report.errors.join('\n'));assert(report.cases.every(x=>x.pass),'Dungeon regressions failed');
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});


