const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'}),checks=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:1366,height:900}});p.on('pageerror',e=>errors.push(e.stack));
  await p.goto('http://127.0.0.1:'+server.address().port);
  await p.evaluate(()=>{selectClass('Guerreiro');enemy=null;currentMode='village';player.coins=100000;updateUI();});
  const completion=await p.evaluate(()=>{
   const offer=EquipmentSystem.refreshContracts(player).offers[0];EquipmentSystem.acceptContract(offer.id);
   const q=player.mercenary.active[0];q.progress=q.count-2;
   const before=getInventoryCountById(q.rewardId),completed=player.mercenary.completed;
   currentMode='battle';isProcessingTurn=true;
   EquipmentSystem.recordKill({baseName:q.targetName,region:q.targetRegion},player);
   const premature=getInventoryCountById(q.rewardId)-before;
   enemy=createEnemyFromTemplate(regions[q.targetRegion].enemies.find(e=>e.name===q.targetName),false,q.targetRegion);
   player.xp=getXpToNextLevel()-1;enemy.hp=0;handleEnemyDefeat();
   return{id:q.id,reward:q.rewardId,qty:q.rewardQty,completed,delta:getInventoryCountById(q.rewardId)-before,premature};
  });
  assert.equal(completion.premature,0);assert(completion.delta>=completion.qty);
  assert.equal(await p.evaluate(()=>player.mercenary.completed),completion.completed+1);
  assert.equal(await p.evaluate(()=>player.mercenary.active.length),0);
  assert((await p.locator('#gameNotice').innerText()).includes('Contrato concluído'));
  assert(await p.locator('#rpgLevelDialog').evaluate(e=>e.open));
  await p.screenshot({path:path.join(__dirname,'contracts-completed-level.png')});
  const savedReward=await p.evaluate(()=>{saveCampaign();return player.inventory.filter(i=>i.type==='material').map(i=>[i.id,i.qty]);});
  await p.reload();await p.evaluate(()=>continueCampaign());
  assert.deepEqual(await p.evaluate(()=>player.inventory.filter(i=>i.type==='material').map(i=>[i.id,i.qty])),savedReward);
  assert.equal(await p.evaluate(()=>EquipmentSystem.collectCompletedContracts(player).length),0);
  assert.equal(await p.locator('#achievementNotice').count(),0);
  checks.push('native enemy defeat completes and rewards a contract once during a processing turn; reload cannot repeat it');

  const recipes=await p.evaluate(()=>{
   const actor=structuredClone(player);for(const region of Object.keys(regions))actor.stats.regionBossKills[region]=1;
   const rows=[];for(const region of Object.keys(regions)){
    const chest=EquipmentSystem.getRecipes(actor,{region,slot:'chest'})[0],legs=EquipmentSystem.getRecipes(actor,{region,slot:'legs'})[0];
    rows.push({region,cost:chest.cost>legs.cost,superset:Object.entries(legs.requirements).every(([id,n])=>chest.requirements[id]>=n),extra:Object.values(chest.requirements).reduce((a,b)=>a+b,0)>Object.values(legs.requirements).reduce((a,b)=>a+b,0),hard:EquipmentSystem.getMaterials(regions[region].enemies[2].name,region).every(m=>chest.requirements[m.id]>0)});
   }return rows;
  });assert(recipes.length>=10);for(const row of recipes)assert(row.cost&&row.superset&&row.extra&&row.hard,JSON.stringify(row));
  await p.evaluate(()=>{enemy=null;levelUpPoints=0;currentMode='village';villageTab='artisan';const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'chest'})[0];for(const[id,qty]of Object.entries(r.requirements))addInventoryItem({...EquipmentSystem.materialById(id),qty});updateUI();});
  await p.locator('[data-hud="craft-slot"][data-value="chest"]').click();await p.locator('[data-hud="craft"]').click();
  assert(await p.locator('.rpg-anvil.rpg-crafted').isVisible());assert(await p.locator('.rpg-owned-piece').isVisible());
  assert(await p.locator('.rpg-owned-piece').evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(33, 68, 43)'));
  await p.screenshot({path:path.join(__dirname,'contracts-craft.png')});
  await p.waitForFunction(()=>!document.querySelector('.rpg-anvil.rpg-crafted'));
  assert(await p.locator('.rpg-owned-piece').isVisible());assert(await p.locator('[data-hud="craft"]').isDisabled());
  checks.push({chestRecipes:recipes.length,greenCraftFlash:'temporary; owned-piece green background remains'});

  await p.evaluate(()=>{currentMode='camp';campTab='equipamentos';updateUI();});
  assert.equal(await p.locator('[data-hud="camp-tab"]').count(),2);
  assert.equal(await p.locator('[data-hud="camp-tab"][data-value="status"]').count(),0);
  assert(await p.locator('.rpg-character-sheet>.rpg-trainer').isVisible());
  assert(await p.locator('.rpg-trainer').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.rpg-paperdoll').getBoundingClientRect().bottom));
  checks.push('camp has Equipment and Skills only; trainer follows equipment');

  for(const width of [1366,390,320]){
   await p.setViewportSize({width,height:900});
   await p.evaluate(()=>{currentMode='battle';enemy=null;isProcessingTurn=false;isDead=false;levelUpPoints=0;enemiesSpawned=5;updateUI();});
   const expected=await p.evaluate(()=>getRegionSpawnPreview(currentRegion).map(e=>`${e.name}: ${e.chance.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`));
   await p.locator('[data-hud="find"]').hover();
   for(const line of expected)assert((await p.locator('#rpgActionTooltip').innerText()).includes(line));
   assert(await p.locator('#rpgActionTooltip').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
   await p.evaluate(()=>{enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');enemy.maxHp=enemy.hp=100000;enemy.attack=1;player.hp=getCurrentCaps().maxHp/2;player.inventory=player.inventory.filter(i=>i.type!=='consumable');for(const id of Object.keys(consumableCatalog))addInventoryItem(createConsumableItem(id,1));resetCombatEffects();playerEffects.enemyMissBonusTurns=3;playerEffects.enemyMissBonus=.3;updateUI();});
   await p.locator('[data-hud="consumables"]').click();
   assert.equal(await p.locator('[data-hud="quick-use"]').count(),4);assert.equal(await p.locator('#rpgDialog').evaluate(e=>e.open),false);
   assert(await p.locator('#rpgQuickItems').evaluate(e=>{const r=e.getBoundingClientRect(),a=document.querySelector('[data-hud="consumables"]').getBoundingClientRect();return e.matches(':popover-open')&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=a.top;}));
   const item=p.locator('[data-hud="quick-use"]').first();await item.hover();
   const description=await item.getAttribute('data-hud-description');assert.equal(await p.locator('#rpgActionTooltip').innerText(),description);
   assert(await p.locator('#rpgActionTooltip').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
   await p.screenshot({path:path.join(__dirname,`contracts-items-${width}.png`)});
   const enemyHp=await p.evaluate(()=>enemy.hp);await p.keyboard.press('1');assert.equal(await p.evaluate(()=>enemy.hp),enemyHp);
   await p.keyboard.press('Escape');assert.equal(await p.locator('#rpgQuickItems').count(),0);
  }
  await p.evaluate(()=>{window.qaEnemyTurns=0;const native=enemyTurn;enemyTurn=async()=>{window.qaEnemyTurns++;await native();};wait=async()=>{};playSpriteAttackAnimation=async()=>{};});
  await p.locator('[data-hud="consumables"]').click();
  const healthUid=await p.evaluate(()=>player.inventory.find(i=>i.id==='health_potion').uid);
  await p.locator(`[data-hud="quick-use"][data-value="${healthUid}"]`).click();
  await p.waitForFunction(()=>!isProcessingTurn);
  assert.equal(await p.evaluate(()=>window.qaEnemyTurns),1);assert.equal(await p.evaluate(()=>playerEffects.enemyMissBonusTurns),2);
  assert.equal(await p.evaluate(()=>getInventoryCountById('health_potion')),0);
  await p.locator('[data-hud="consumables"]').click();assert.equal(await p.locator(`[data-hud="quick-use"][data-value="${healthUid}"]`).count(),0);
  await p.mouse.click(160,400);assert.equal(await p.locator('#rpgQuickItems').count(),0);
  checks.push('spawn chance and quick consumable tooltips fit 1366/390/320; icons consume items, use one turn, decay buffs and close on Escape/outside');

  await p.locator('[data-hud="settings"]').click();
  assert.equal(await p.locator('[onclick*="setEnemyBarSpeed"],[onclick*="adjustMusicVolume"]').count(),0);
  const slider=p.locator('#musicVolume');assert.equal(await slider.getAttribute('type'),'range');
  await p.evaluate(()=>{window.qaSlider=document.getElementById('musicVolume');qaSlider.value='37';qaSlider.dispatchEvent(new Event('input',{bubbles:true}));});
  assert(await p.evaluate(()=>qaSlider===document.getElementById('musicVolume')));assert.equal(await p.locator('#musicVolumeValue').innerText(),'37%');
  await slider.focus();await p.keyboard.press('ArrowRight');assert.equal(await slider.inputValue(),'38');
  assert.equal(await p.evaluate(()=>JSON.parse(GameStorage.getItem(UI_SETTINGS_KEY)).musicVolume),.38);
  await p.screenshot({path:path.join(__dirname,'contracts-settings-320.png')});
  await p.reload();assert.equal(await p.evaluate(()=>uiSettings.musicVolume),.38);
  checks.push('music slider supports live input and keyboard without replacing its node; saved volume survives reload; speed and +/- controls removed');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'contracts-ui-results.json'),JSON.stringify({checks,errors},null,2));
  console.log('PASS contracts/UI: '+checks.length+' integrated checks');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
