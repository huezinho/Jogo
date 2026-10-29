const fs=require('node:fs');
const path=require('node:path');
const {server,root,out,chromium}=require('./smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const report={date:'2026-10-27',tests:[],errors:[]};
 async function test(name,file,fn){
  const ctx=await browser.newContext({viewport:{width:1366,height:768}});
  const page=await ctx.newPage();
  page.on('pageerror',e=>report.errors.push({test:name,message:e.message}));
  // Keep protocol tests deterministic and separate from actual WebRTC availability.
  await page.route('https://unpkg.com/**',r=>r.fulfill({contentType:'text/javascript',body:'/* Peer replaced per protocol test */'}));
  await page.goto(base+'/index.html');await page.evaluate(()=>selectClass('Guerreiro'));
  if(file!=='index.html'){await page.evaluate(()=>{enemy=null;saveCampaign();});await page.goto(base+'/'+file);await page.evaluate(()=>{if(!player)continueCampaign();});}
  try{const result=await fn(page);report.tests.push({name,result});console.log(name+': '+JSON.stringify(result));}
  catch(e){report.tests.push({name,error:e.message});console.log(name+': ERROR '+e.message);}
  await ctx.close();
 }
 await test('campanha-vitoria-nivel-regioes','index.html',p=>p.evaluate(()=>{
  const locked=!isRegionUnlockedForBattle('Caverna');
  enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');enemy.hp=0;handleEnemyDefeat();
  const victory={coins:player.coins,xp:player.xp,kills:player.stats.enemiesDefeated};
  gainXP(getXpToNextLevel());adjustAttribute('vitality',1);finishLevelUp();
  const level={level:player.level,maxHp:player.maxHp,points:levelUpPoints,invested:player.stats.invested};
  player.stats.regionBossKills.Floresta=1;
  return {locked,victory,level,unlocked:isRegionUnlockedForBattle('Caverna'),bossGate:getBossUnlockProgress('Floresta')};
 }));
 await test('equipamentos-persistencia','index.html',async p=>{
  const before=await p.evaluate(()=>{
   enemy=null;currentMode='camp';
   const weapon=createEquipmentItem(getRegionSetTemplate('Floresta','weapon','Guerreiro'),'rara');
   const head=createEquipmentItem(getRegionSetTemplate('Floresta','head','Guerreiro'),'rara');
   const accessory=getBossAccessoryItem('Floresta');
   addInventoryItem(weapon);addInventoryItem(head);addInventoryItem(accessory);equipItem(weapon.uid);saveCampaign();
   return {inventory:player.inventory.map(x=>({name:x.name,slot:x.slot})),weapon:player.equipment.weapon?.name};
  });
  await p.reload();await p.evaluate(()=>continueCampaign());
  return {before,after:await p.evaluate(()=>({inventory:player.inventory.map(x=>({name:x.name,slot:x.slot})),weapon:player.equipment.weapon?.name||null}))};
 });
 await test('habilidade-gratis-e-custo-vida-interface','index.html',p=>p.evaluate(()=>{
  playerEffects.firstSkillFreeAvailable=true;player.mp=0;
  const skill=getSkillInfo()[0];const ui=getSkillActionState(skill);const result=applySkillLocally(skill);
  return {skill:skill.name,uiCanUse:ui.canUse,actualBlocked:!!result.blocked,mp:player.mp};
 }));
 await test('cobertura-arvores-habilidades','index.html',p=>p.evaluate(()=>{
  updateUI=()=>{};saveCampaign=()=>{};log=()=>{};
  const baseline=JSON.parse(JSON.stringify(player));const cases=[];const problems=[];const types=new Set();
  for(const className of Object.keys(classes)){
   const def=subclassChoicesByClass[className];
   const paths=[{tier30:null,tier60:null},...def.tier30.flatMap(t=>[{tier30:t.id,tier60:null},...def.tier60[t.id].map(s=>({tier30:t.id,tier60:s.id}))])];
   for(const sub of paths)for(const level of [1,10,20,30,40,50,60,70,80,100]){
    if(sub.tier30&&level<30||sub.tier60&&level<60)continue;
    player=JSON.parse(JSON.stringify(baseline));player.class=className;player.level=level;player.subclasses=sub;player.subclass=null;
    player.maxHp=5000;player.hp=2500;player.maxMp=10000;player.mp=10000;player.attack=500;
    // Use the engine's subclass field instead of assuming its storage shape.
    const state=getPlayerSubclassState();state.tier30=sub.tier30;state.tier60=sub.tier60;
    player.activeSkills=getClassTrees().activeSkills;player.passiveSkills=getClassTrees().passiveSkills;
    for(const descriptor of getSkillInfo()){
     playerEffects=createDefaultPlayerEffects();player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;enemy=createEnemyFromTemplate(regions.Paradoxo.boss,true,'Paradoxo');
     const fresh=getSkillInfo().find(s=>s.id===descriptor.id);types.add(fresh.type);
     try{const result=applySkillLocally(fresh);const invalid=[player.hp,player.mp,enemy.hp,...Object.values(playerEffects).filter(v=>typeof v==='number')].some(v=>!Number.isFinite(v));
      cases.push({className,level,sub:sub.tier60||sub.tier30||'base',skill:fresh.name,blocked:!!result.blocked});
      if(invalid||result.blocked)problems.push({className,level,sub,skill:fresh.name,invalid,result});
     }catch(e){problems.push({className,level,sub,skill:fresh.name,error:e.message});}
    }
   }
  }
  return {cases:cases.length,uniqueTypes:types.size,problems};
 }));
 await test('telas-subsecoes-desktop-mobile','index.html',async p=>{
  const rows=[];
  await p.evaluate(()=>{enemy=null;player.coins=10000;});
  for(const width of [1920,1366,768,390,360]){
   await p.setViewportSize({width,height:width>768?768:844});
   for(const mode of ['battle','village','camp','bestiary','trophies','arena','dungeon']){
    await p.evaluate(m=>{enemy=null;currentMode=m;updateUI();},mode);
    rows.push(await p.evaluate(({width,mode})=>({width,mode,scrollWidth:document.documentElement.scrollWidth,actionsY:document.getElementById('actions').getBoundingClientRect().y,bodyHeight:document.documentElement.scrollHeight,smallButtons:[...document.querySelectorAll('button')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height<24;}).length}),{width,mode}));
   }
  }
  await p.evaluate(()=>{currentMode='village';setVillageTab('artisan');});
  await p.screenshot({path:path.join(out,'03-artesao-mobile.png'),fullPage:true});
  return rows;
 });
 const arenaSetup=async p=>p.evaluate(()=>{
  const local=JSON.parse(JSON.stringify(player));local.effects=createDefaultPlayerEffects();local.maxHp=local.hp=1000;local.maxMp=local.mp=100;local.attack=100;
  const other=JSON.parse(JSON.stringify(local));other.characterId='guest-character';
  arenaMultiplayer={...createArenaMultiplayerState(),isHost:true,peer:{id:'host'},fighters:{host:{id:'host',name:'Host'},guest:{id:'guest',name:'Guest'}},heroStates:{host:local,guest:other}};
  startArenaDuel();arenaMultiplayer.turnId='host';
 });
 await test('arena-defesas-do-alvo','arena.html',async p=>{
  await arenaSetup(p);
  return p.evaluate(()=>{
   const defender=arenaMultiplayer.heroStates.guest;defender.effects.shieldValue=500;defender.effects.shieldTurns=3;defender.effects.invulnerableTurns=3;
   const before=defender.hp;arenaAttack();
   return {before,after:defender.hp,shieldEffects:defender.effects.shieldValue,shieldTopLevel:defender.shieldValue,invulnerableTurns:defender.effects.invulnerableTurns,log:document.getElementById('log').innerText};
  });
 });
 await test('arena-habilidade-bloqueada-consome-turno','arena.html',async p=>{
  await arenaSetup(p);
  return p.evaluate(()=>{
   arenaMultiplayer.heroStates.host.mp=0;
   const before=arenaMultiplayer.turnId;arenaUseSkill(0);
   return {before,after:arenaMultiplayer.turnId,log:document.getElementById('log').innerText};
  });
 });
 await test('arena-derrota-contamina-campanha','arena.html',async p=>{
  const result=await p.evaluate(async()=>{
   window.Peer=class{constructor(id){this.id=id;this.handlers={};setTimeout(()=>this.handlers.open?.(id),0);}on(e,f){this.handlers[e]=f;}destroy(){}};
   hostArenaRoom();await new Promise(r=>setTimeout(r,20));
   const connection={peer:'guest',open:true,handlers:{},send(){},close(){},on(e,f){this.handlers[e]=f;}};
   arenaMultiplayer.peer.handlers.connection(connection);
   const guest=JSON.parse(JSON.stringify(player));guest.effects=createDefaultPlayerEffects();
   connection.handlers.data({type:'join',fighter:{id:'guest',name:'Visitante'},heroState:guest});startArenaDuel();
   arenaMultiplayer.heroStates[arenaMultiplayer.peer.id].hp=1;arenaMultiplayer.turnId='guest';
   connection.handlers.data({type:'arena_action',kind:'basic'});saveCampaign();
   return {live:{hp:player.hp,duels:player.stats.arenaDuels,wins:player.stats.arenaWins},save:JSON.parse(localStorage.getItem(SAVE_KEY)).player,enemy:enemy?.name};
  });
  await p.reload();await p.evaluate(()=>continueCampaign());
  return {live:result.live,saved:{hp:result.save.hp,duels:result.save.stats.arenaDuels,wins:result.save.stats.arenaWins},reloaded:await p.evaluate(()=>({hp:player.hp,duels:player.stats.arenaDuels,wins:player.stats.arenaWins,isDead}))};
 });
 await test('arena-protocolo-perfil-injetado','arena.html',p=>p.evaluate(async()=>{
  window.Peer=class{constructor(id){this.id=id;this.handlers={};setTimeout(()=>this.handlers.open?.(id),0);}on(e,f){this.handlers[e]=f;}destroy(){}};
  hostArenaRoom();await new Promise(r=>setTimeout(r,20));
  const connection={peer:'guest',open:true,handlers:{},send(){},close(){},on(e,f){this.handlers[e]=f;}};
  arenaMultiplayer.peer.handlers.connection(connection);
  const guest=JSON.parse(JSON.stringify(player));guest.effects=createDefaultPlayerEffects();
  connection.handlers.data({type:'join',fighter:{id:'guest',name:'Visitante'},heroState:guest});startArenaDuel();
  const before=arenaMultiplayer.heroStates.guest.hp;
  const cheated=JSON.parse(JSON.stringify(arenaMultiplayer.heroStates.guest));cheated.hp=999999;cheated.attack=999999;
  connection.handlers.data({type:'profile_update',fighter:{id:'guest',name:'<img src=x onerror="window.__qaXss=1">'},heroState:cheated});
  await new Promise(r=>setTimeout(r,100));
  return {before,after:arenaMultiplayer.heroStates.guest.hp,attack:arenaMultiplayer.heroStates.guest.attack,htmlExecuted:window.__qaXss===1,duelActive:arenaMultiplayer.duelActive};
 }));
 await test('dungeon-protocolo-estado-injetado','dungeon.html',p=>p.evaluate(()=>{
  dungeonMultiplayer.peer={id:'host'};dungeonMultiplayer.isHost=true;dungeonMultiplayer.connections={};dungeonMultiplayer.party={host:{id:'host',name:'Host'}};
  const connection={peer:'guest',open:true,send(){},close(){}};
  const guest=JSON.parse(JSON.stringify(player));
  handleDungeonHostMessage(connection,{type:'join',player:{id:'guest',name:'Visitante'},heroState:guest});
  const original=dungeonMultiplayer.heroStates.guest.hp;
  const cheated=JSON.parse(JSON.stringify(dungeonMultiplayer.heroStates.guest));cheated.hp=999999;cheated.attack=999999;cheated.stateVersion=999999;
  handleDungeonHostMessage(connection,{type:'hero_state',heroState:cheated});
  return {original,received:dungeonMultiplayer.heroStates.guest.hp,attack:dungeonMultiplayer.heroStates.guest.attack,sequence:getDungeonSequence().length,trophyCount:getTrophies().length};
 }));
 await test('limite-personagens-e-separacao','index.html',p=>p.evaluate(()=>{
  const first=player.characterId;player.coins=123;saveCampaign();
  player=null;selectClass('Mago');const second=player.characterId;player.coins=456;saveCampaign();
  continueCampaign(first);const firstCoins=player.coins;continueCampaign(second);const secondCoins=player.coins;
  for(let i=0;i<4;i++){player=null;selectClass('Arqueiro');saveCampaign();}
  return {firstCoins,secondCoins,count:getCharacterSaves().length,canCreate:!document.querySelector('[data-start-class]:not([disabled])')};
 }));
 await test('save-corrompido-valido-json','index.html',async p=>{
  await p.addInitScript(()=>{localStorage.setItem('rpg_turnos_character_saves_v1',JSON.stringify([{characterId:'broken',player:{class:'Guerreiro'}}]));localStorage.removeItem('rpg_turnos_campaign_v1');});
  await p.reload();
  return p.evaluate(()=>({startVisible:document.getElementById('classSelect').innerText.length>0,body:document.body.innerText.slice(0,300)}));
 });
 await browser.close();server.close();
 fs.writeFileSync(path.join(out,'deep-results.json'),JSON.stringify(report,null,2));
 console.log('Complete: '+report.tests.length+' groups; '+report.errors.length+' browser errors');
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
