const fs=require('node:fs');const path=require('node:path');const {server,out,root,chromium}=require('./smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'msedge',headless:true});const report={tests:[],errors:[]};
 async function test(name,file,fn){
  const ctx=await browser.newContext();const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push({name,message:e.message}));
  await p.route('https://unpkg.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));
  await p.goto(base);await p.evaluate(()=>{selectClass('Guerreiro');enemy=null;saveCampaign();});
  if(file!=='index.html'){await p.goto(base+'/'+file);await p.evaluate(()=>{if(!player)continueCampaign();});}
  try{const result=await fn(p);report.tests.push({name,result});console.log(name+': '+JSON.stringify(result));}catch(e){report.tests.push({name,error:e.message});console.log(name+': ERROR '+e.message);}
  await ctx.close();
 }
 await test('economia-pocoes-vendas-forja-morte','index.html',p=>p.evaluate(async()=>{
  currentMode='village';player.coins=0;buyConsumable('health_potion');const blockedPurchase=player.inventory.length===0&&player.coins===0;
  player.coins=1000;player.hp=20;const cost=getHealCost();healAtVillage();const healed={cost,hp:player.hp,maxHp:getCurrentCaps().maxHp,coins:player.coins};
  const coinsBefore=player.coins;buyConsumable('health_potion');const item=player.inventory.find(x=>x.id==='health_potion');const afterBuy={coins:player.coins,qty:item.qty};
  player.hp=20;await useConsumable('health_potion');const afterPotion={hp:player.hp,qty:player.inventory.find(x=>x.id==='health_potion')?.qty||0};
  buyConsumable('mana_potion');const sale=player.inventory.find(x=>x.id==='mana_potion');const expectedSale=getSellPrice(sale),beforeSale=player.coins;sellItem(sale.uid);const saleCorrect=player.coins===beforeSale+expectedSale;
  const accessory=addInventoryItem(createEquipmentItem(getBossAccessoryTemplate('Floresta'),'comum'));equipItem(accessory.uid);const forgeBefore={coins:player.coins,rarity:player.equipment.accessory.rarity};
  const original=Math.random;Math.random=()=>0;tryUpgradeEquippedItem('accessory');Math.random=original;const forgeAfter={coins:player.coins,rarity:player.equipment.accessory.rarity};
  uiSettings.disableRespawnTimer=true;handleDeath();const dead={isDead,hp:player.hp,deaths:player.stats.deaths};respawnPlayer();
  return {blockedPurchase,healed,coinsBefore,afterBuy,afterPotion,saleCorrect,forgeBefore,forgeAfter,dead,respawn:{isDead,hp:player.hp,mode:currentMode}};
 }));
 await test('preview-save-diverge-dos-atributos-reais','index.html',p=>p.evaluate(()=>{
  for(let level=2;level<=20;level++){player.level=level;levelUpPoints=1;adjustAttribute('strength',1);finishLevelUp();}
  saveCampaign();const saved=getSavedCharacterState(player.characterId);return {actual:getPreviewStats(),card:getSavedCharacterPreviewStats(saved),invested:player.stats.invested};
 }));
 await test('ciclo-natural-reembolso-mana','index.html',p=>p.evaluate(()=>{
  player.class='Adepto da Natureza';player.level=20;player.maxMp=500;player.mp=500;player.maxHp=500;player.hp=500;player.attack=100;player.subclassChoices={tier30:null,tier60:null};playerEffects=createDefaultPlayerEffects();
  enemy=createEnemyFromTemplate(regions.Floresta.boss,true,'Floresta');enemy.hp=enemy.maxHp=10000;enemy.natureMarkTurns=3;
  const skill=getSkillInfo().find(s=>s.type==='nature_roots');const before=player.mp;const result=applySkillLocally(skill);
  return {skill:skill.name,cost:skill.cost,before,after:player.mp,expectedRefund:Math.floor(skill.cost*0.1),refundObserved:player.mp-before+skill.cost,result};
 }));
 await test('recursos-dinamicos-e-peso-inicial','index.html',async p=>{
  const data=await p.evaluate(()=>{
   const paths=[];for(const [region,data] of Object.entries(regions)){
    paths.push('assets/visual/backgrounds/regions/'+toCssToken(region)+'.png');
    for(const mob of [...data.enemies,data.boss])paths.push(getVisualSpritePath('enemies',toCssToken(mob.name)),getItemSpritePath(getEnemyMaterialTemplate(mob.name,region)));
    paths.push(getItemSpritePath(getBossAccessoryItem(region)));
   }
   for(const [className,def] of Object.entries(subclassChoicesByClass)){
    paths.push(getVisualSpritePath('heroes',toCssToken(className)));
    for(const tier of def.tier30){paths.push(getVisualSpritePath('heroes',toCssToken(tier.name)));for(const leaf of def.tier60[tier.id])paths.push(getVisualSpritePath('heroes',toCssToken(leaf.name)));}
   }
   return {paths,resources:performance.getEntriesByType('resource').map(x=>({name:x.name,encodedBodySize:x.encodedBodySize,decodedBodySize:x.decodedBodySize})),trophies:getTrophies().length};
  });
  await p.waitForTimeout(700);
  data.resources=await p.evaluate(()=>performance.getEntriesByType('resource').map(x=>({name:x.name,encodedBodySize:x.encodedBodySize,decodedBodySize:x.decodedBodySize})));
  const missing=[...new Set(data.paths)].filter(x=>!fs.existsSync(path.join(root,new URL(x,base+'/').pathname.slice(1))));
  const local=data.resources.filter(x=>x.name.startsWith(base));
  return {checkedDynamicPaths:[...new Set(data.paths)].length,missing,localResources:local.length,localResourceBodyBytes:local.reduce((s,x)=>s+x.encodedBodySize,0),largestResources:local.sort((a,b)=>b.encodedBodySize-a.encodedBodySize).slice(0,6),trophies:data.trophies};
 });
 await test('dungeon-turnConsumed-false-e-run-completa','dungeon.html',p=>p.evaluate(()=>{
  const clone=x=>JSON.parse(JSON.stringify(x));
  player.level=100;player.maxHp=player.hp=1000000;player.maxMp=player.mp=100000;player.attack=100000;player.subclassChoices={tier30:'cavaleiro',tier60:'paladino'};pendingLevelUps=levelUpPoints=0;allocation={strength:0,wisdom:0,vitality:0};enemy=null;currentMode='dungeon';
  const conn={peer:'guest',open:true,send(){},close(){}};
  dungeonMultiplayer.peer={id:'host',destroy(){}};dungeonMultiplayer.isHost=true;dungeonMultiplayer.party={host:{id:'host',name:'Host'}};dungeonMultiplayer.connections={guest:conn};
  handleDungeonHostMessage(conn,{type:'join',player:{id:'guest',name:'Guest'},heroState:clone(player)});startDungeonRaid();
  const run=dungeonMultiplayer.run;
  const guestIndex=run.turnOrder.indexOf('guest');run.turnIndex=guestIndex;
  // Ensure the encounter survives a legal guest attack so turn advancement can be observed.
  for(const mob of run.enemies){mob.hp=mob.maxHp=10000000;}
  const beforeIndex=run.turnIndex;handleDungeonHostMessage(conn,{type:'action',actionKind:'basic_attack',targetEnemyId:run.enemies[0].instanceId,turnConsumed:false});
  const afterIndex=run.turnIndex;const exploit={beforeIndex,afterIndex,phase:run.phase};
  let victories=0,steps=0,guard=0;const phases=[];
  while(dungeonMultiplayer.run.active&&guard++<2500){
   const activeRun=dungeonMultiplayer.run;
   if(activeRun.phase==='intermission'){
    victories++;phases.push({region:activeRun.regionIndex,encounter:activeRun.encounterIndex});advanceDungeonIntermission();continue;
   }
   if(activeRun.phase!=='battle')break;
   const entry=activeRun.turnOrder[activeRun.turnIndex];
   if(entry==='host'||entry==='guest'){
    // Test fixture reduces HP only; all attacks, victory handlers and rewards use the actual engine.
    for(const mob of activeRun.enemies)if(mob.hp>0)mob.hp=1;
    if(entry==='host')dungeonAttack();
    else handleDungeonHostMessage(conn,{type:'action',actionKind:'basic_attack',targetEnemyId:activeRun.enemies.find(e=>e.hp>0)?.instanceId});
    steps++;
   }else break;
  }
  saveCampaign();const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
  return {exploit,guard,heroActions:steps,intermissions:victories,expectedEncounterCount:getDungeonSequence().length,finished:!dungeonMultiplayer.run.active,mode:currentMode,liveStats:player.stats,savedStats:saved.player.stats,lastLog:document.getElementById('log').innerText.slice(-2500),phases};
 }));
 await browser.close();server.close();fs.writeFileSync(path.join(out,'acceptance-results.json'),JSON.stringify(report,null,2));console.log('Complete '+report.tests.length+' groups, browser errors: '+JSON.stringify(report.errors));
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
