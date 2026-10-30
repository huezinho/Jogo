const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});const errors=[],checks=[];try{
 const p=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.stack));await p.goto('http://127.0.0.1:'+server.address().port);
 await p.evaluate(()=>{selectClass('Guerreiro');enemy=null;player.coins=50000;currentMode='village';villageTab='inn';player.hp=10;player.mp=5;updateUI();});
 const rest=await p.evaluate(()=>({cost:getHealCost()+getManaHealCost(),coins:player.coins}));await p.locator('[data-hud="heal-both"]').click();
 assert.deepEqual(await p.evaluate(()=>({hp:player.hp,mp:player.mp,coins:player.coins})),await p.evaluate(r=>({hp:getCurrentCaps().maxHp,mp:getCurrentCaps().maxMp,coins:r.coins-r.cost}),rest));
 assert(await p.locator('[data-hud="heal-both"]').isDisabled());
 assert(await p.evaluate(()=>{player.hp=1;player.mp=1;player.coins=0;const before=JSON.stringify(player);return restoreBothAtVillage()===false&&before===JSON.stringify(player);}));checks.push('combined inn recovery, exact cost, full resources, insufficient funds atomicity');
 await p.evaluate(()=>{player.coins=50000;player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;currentMode='battle';player.stats.regionKills.Floresta={};for(const e of regions.Floresta.enemies)player.stats.regionKills.Floresta[e.name]=1;updateUI();});
 assert.equal(await p.locator('.region-map-boss-btn').count(),1);assert.equal(await p.locator('[data-hud="boss"]').count(),0);assert.equal(await p.locator('[data-hud="tracking"]').count(),0);
 assert.equal(await p.evaluate(()=>CreatureTracking.purchase('Aranha Gigante')),false);
 await p.locator('.region-map-boss-btn').click();assert(await p.evaluate(()=>enemy.isBoss));
 await p.evaluate(()=>{enemy=null;player.stats.regionBossKills.Floresta=1;updateUI();});await p.locator('[data-hud="tracking"]').click();assert.equal(await p.locator('[data-hud="buy-tracking"]').count(),3);
 const cost=await p.evaluate(()=>CreatureTracking.offer('Aranha Gigante').cost),coins=await p.evaluate(()=>player.coins);await p.locator('[data-hud="buy-tracking"][data-value="Aranha Gigante"]').click();
 assert.equal(await p.evaluate(()=>player.coins),coins-cost);assert(await p.evaluate(()=>CreatureTracking.active()?.name==='Aranha Gigante'));
 const tracking=await p.evaluate(()=>{
  const hunt={...player.creatureTracking},preview=getRegionSpawnPreview('Floresta'),chance=preview.find(e=>e.name===hunt.name).chance;
  const original=Math.random;let state=982451653,hits=0;Math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  for(let i=0;i<5000;i++)if(chooseWeightedEnemy(regions.Floresta.enemies).name===hunt.name)hits++;
  Math.random=()=>.99;enemiesSpawned=0;spawnEnemy();const intro=enemy.baseName;spawnEnemy(true);const boss=enemy.isBoss;Math.random=original;enemy=null;
  const otherBefore=getAdjustedRegionSpawnWeights(regions.Caverna.enemies,'Caverna');player.creatureTracking=null;const otherAfter=getAdjustedRegionSpawnWeights(regions.Caverna.enemies,'Caverna');player.creatureTracking=hunt;
  const expired=CreatureTracking.active(player,hunt.expiresAt)===null;
  const realNow=Date.now;Date.now=()=>hunt.expiresAt;const ended=getRegionSpawnPreview('Floresta').find(e=>e.name===hunt.name).chance;Date.now=realNow;updateUI();
  return{chance,hits,intro,boss,otherUnchanged:JSON.stringify(otherBefore)===JSON.stringify(otherAfter),expired,ended};
 });assert(tracking.chance>=90-1e-8);assert(tracking.hits>4350&&tracking.hits<4650);assert.equal(tracking.intro,'Aranha Gigante');assert(tracking.boss&&tracking.expired&&tracking.otherUnchanged);assert(tracking.ended<90);checks.push({tracking});
 const expiry=await p.evaluate(()=>{saveCampaign();return player.creatureTracking.expiresAt;});await p.reload();await p.evaluate(()=>continueCampaign());assert.equal(await p.evaluate(()=>CreatureTracking.active().expiresAt),expiry);checks.push('paid hunt persists across reload and excludes other regions and bosses');
 await p.evaluate(()=>{enemy=null;currentMode='village';villageTab='artisan';player.coins=50000;const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon'})[0];for(const[id,qty]of Object.entries(r.requirements))addInventoryItem({...EquipmentSystem.materialById(id),qty:qty*10});updateUI();});
 await p.locator('[data-hud="craft"]').click();assert(await p.locator('[data-hud="craft"]').isDisabled());assert((await p.locator('.rpg-rule-note').innerText()).includes('já possui'));
 const duplicate=await p.evaluate(()=>{const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon'})[0],before=JSON.stringify(player);return EquipmentSystem.craft(r.id)===false&&before===JSON.stringify(player);});assert(duplicate);
 const uid=await p.evaluate(()=>player.inventory.find(i=>i.type==='equipment'&&i.slot==='weapon').uid);
 await p.evaluate(()=>{currentMode='camp';campTab='equipamentos';updateUI();});await p.locator('[data-hud="equipped"][data-value="weapon"]').click();await p.locator(`[data-hud="slot-equip"][data-value="${uid}"]`).click();assert.equal(await p.evaluate(()=>player.equipment.weapon.uid),uid);assert.equal(await p.locator('.rpg-slot-picker').count(),1);await p.keyboard.press('Escape');
 assert(await p.evaluate(()=>{const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon'})[0];return !EquipmentSystem.canCraft(r,player);}));
 await p.evaluate(()=>{const u=EquipmentSystem.getUpgradeRequirements(player.equipment.weapon,player);for(const[id,qty]of Object.entries(u.requirements))addInventoryItem({...EquipmentSystem.materialById(id),qty});currentMode='village';EquipmentSystem.tryUpgrade('weapon');currentMode='camp';updateUI();});
 assert(await p.evaluate(()=>player.equipment.weapon.rarity==='incomum'&&!EquipmentSystem.canCraft(EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon'})[0],player)));
 await p.locator('[data-hud="equipped"][data-value="weapon"]').click();await p.locator('[data-hud="unequip"]').click();
 await p.evaluate(()=>{currentMode='village';villageTab='artisan';const item=player.inventory.find(i=>i.type==='equipment'&&i.slot==='weapon');sellItem(item.uid);updateUI();});assert(await p.locator('[data-hud="craft"]').isEnabled());await p.locator('[data-hud="craft"]').click();checks.push('craft uniqueness in inventory/equipment/across rarity, slot equip, unequip, sale unlocks recraft');
 await p.evaluate(()=>{currentMode='village';villageTab='mercenary';updateUI();});await p.locator('[data-hud="contract-tab"][data-value="offers"]').click();
 const contract=await p.locator('[data-hud="accept"]').getAttribute('data-value'),offers=await p.locator('[data-hud="contract-select"]').count();await p.locator('[data-hud="accept"]').click();assert.equal(await p.locator(`[data-hud="contract-select"][data-value="${contract}"]`).count(),0);assert.equal(await p.locator('[data-hud="contract-select"]').count(),offers-1);
 assert(await p.evaluate(()=>{const q=player.mercenary.active[0],expiry=(player.mercenary.boardCycle+1)*EquipmentData.boardIntervalMs;const before=EquipmentSystem.refreshContracts(player,expiry-1).offers.map(o=>o.id);const after=EquipmentSystem.refreshContracts(player,expiry+1);return EquipmentData.boardIntervalMs===1200000&&after.active.some(a=>a.id===q.id)&&!after.offers.some(o=>before.includes(o.id));}));checks.push('accepted offers disappear, 20-minute refresh retains active contracts');
 const potions=await p.evaluate(async()=>{
  const original={wait,playSpriteAttackAnimation,enemyTurn,random:Math.random};wait=async()=>{};playSpriteAttackAnimation=async()=>{};Math.random=()=>.99;let responses=0;const nativeTurn=enemyTurn;enemyTurn=async()=>{responses++;await nativeTurn();};const rows=[];
  try{for(const id of Object.keys(consumableCatalog)){
    currentMode='battle';isDead=false;isProcessingTurn=false;levelUpPoints=0;enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');enemy.hp=enemy.maxHp=100000;enemy.attack=1;player.maxHp=1000;player.hp=500;player.mp=1;resetCombatEffects();
    Object.assign(playerEffects,{enemyMissBonusTurns:3,enemyMissBonus:.3,attackBuffTurns:3,attackBuffPercent:.1,skillBuffTurns:3,skillBuffPercent:.1});addInventoryItem(createConsumableItem(id,2));const count=getInventoryCountById(id),before=responses;
    await useConsumable(id);rows.push({id,responses:responses-before,spent:count-getInventoryCountById(id),dodge:playerEffects.enemyMissBonusTurns,attack:playerEffects.attackBuffTurns,skill:playerEffects.skillBuffTurns});
  }
  currentMode='village';enemy=null;playerEffects.enemyMissBonusTurns=3;await useConsumable('health_potion');rows.push({outsideBattle:playerEffects.enemyMissBonusTurns});
  player.inventory=player.inventory.filter(i=>i.id!=='health_potion');currentMode='battle';enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');const count=responses;await useConsumable('health_potion');rows.push({unavailable:responses-count,dodge:playerEffects.enemyMissBonusTurns});
  }finally{wait=original.wait;playSpriteAttackAnimation=original.playSpriteAttackAnimation;enemyTurn=original.enemyTurn;Math.random=original.random;isProcessingTurn=false;enemy=null;}return rows;
 });for(const r of potions.filter(r=>r.id)){assert.equal(r.responses,1);assert.equal(r.spent,1);assert.equal(r.dodge,2);assert.equal(r.attack,r.id==='attack_tonic'?3:2);assert.equal(r.skill,r.id==='skill_tonic'?3:2);}assert.equal(potions[4].outsideBattle,3);assert.equal(potions[5].unavailable,0);assert.equal(potions[5].dodge,3);checks.push({potions});
 await p.evaluate(()=>{currentMode='camp';campTab='equipamentos';updateUI();});await p.locator('[data-hud="equipped"][data-value="weapon"]').click();
 const contractReward=await p.evaluate(()=>{const q=player.mercenary.active[0],before=getInventoryCountById(q.rewardId);for(let i=q.progress;i<q.count;i++)EquipmentSystem.recordKill({baseName:q.targetName,region:q.targetRegion},player);updateUI();return{id:q.id,reward:q.rewardId,qty:q.rewardQty,before};});
 assert((await p.locator('#gameNotice').innerText()).includes('Contrato concluído'));assert(await p.locator('#gameNotice').evaluate(e=>e.matches(':popover-open')));assert(await p.locator('#rpgDialog').evaluate(e=>e.open));
 assert.equal(await p.evaluate(()=>player.mercenary.active.length),0);assert.equal(await p.evaluate(id=>getInventoryCountById(id),contractReward.reward),contractReward.before+contractReward.qty);
 await p.waitForFunction(()=>document.getElementById('gameNotice').hidden,{},{timeout:8000});await p.keyboard.press('Escape');
 assert(await p.evaluate(c=>{currentMode='village';const before=getInventoryCountById(c.reward);return !EquipmentSystem.claimContract(c.id)&&before===getInventoryCountById(c.reward);},contractReward));
 assert.equal(await p.locator('#achievementNotice').count(),0);checks.push('automatic mercenary reward exactly once, temporary top-layer contract notice over a modal');

 for(const width of [1366,390,320]){
  await p.setViewportSize({width,height:900});await p.evaluate(()=>{currentMode='battle';enemy=null;player.hp=getCurrentCaps().maxHp;player.stats.regionBossKills.Floresta=1;updateUI();});
  for(const selector of ['.location-map-marker','.region-map-marker','.region-map-boss-btn']){const targets=await p.locator(selector).all();for(const t of targets){await t.hover({force:true});assert(await p.locator('#rpgActionTooltip').isVisible());assert(await p.locator('#rpgActionTooltip').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}}
  await p.evaluate(()=>{currentMode='village';villageTab='artisan';updateUI();});await p.locator('[data-hud="craft-map"]').click();assert(await p.locator('#rpgDialogTitle').evaluate(e=>e.getBoundingClientRect().height<110&&e.getBoundingClientRect().width>150));for(const t of await p.locator('[data-hud="craft-region"]').all()){await t.hover({force:true});assert(await p.locator('#rpgActionTooltip').evaluate(e=>e.matches(':popover-open')),JSON.stringify({width,marker:await t.getAttribute('data-value'),tooltip:await p.locator('#rpgActionTooltip').evaluate(e=>({hidden:e.hidden,text:e.textContent,box:e.getBoundingClientRect().toJSON()}))}));assert(await p.locator('#rpgActionTooltip').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));}await p.screenshot({path:path.join(__dirname,`services-map-${width}.png`)});await p.keyboard.press('Escape');
  await p.evaluate(()=>{currentMode='camp';campTab='equipamentos';updateUI();});await p.locator('[data-hud="equipped"][data-value="weapon"]').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.keyboard.press('Escape');
 }
 checks.push('all map hotspots and slot dialogs fit1366/390/320, including locked markers and modal map popovers');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'services-results.json'),JSON.stringify({checks,errors},null,2));console.log('PASS campaign services: '+checks.length+' integrated checks');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
