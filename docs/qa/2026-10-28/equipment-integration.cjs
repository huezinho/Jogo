const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
const out=__dirname;
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'msedge'}),ctx=await browser.newContext({viewport:{width:1366,height:768}}),page=await ctx.newPage();
 const report={tests:[],errors:[],missingAssets:[]};page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base+'/assets/')&&r.status()>=400)report.missingAssets.push({url:r.url(),status:r.status()});});
 await page.route('https://unpkg.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));await page.goto(base);
 async function test(name,fn){try{const result=await fn();report.tests.push({name,pass:true,result});console.log('PASS '+name+' '+JSON.stringify(result));}catch(error){report.tests.push({name,pass:false,error:error.message});console.log('FAIL '+name+' '+error.message);}}
 await page.evaluate(()=>{selectClass('Guerreiro');enemy=null;player.level=100;player.subclassChoices={tier30:'cavaleiro',tier60:'paladino'};player.hp=player.maxHp=10000;player.mp=player.maxMp=10000;player.attack=100;player.coins=1000000;levelUpPoints=pendingLevelUps=0;allocation={strength:0,wisdom:0,vitality:0};player.stats.regionBossKills={};setMode('village');wait=async()=>{};playSpriteAttackAnimation=async()=>{};animateEnemyBarTo=async()=>{};animateEnemyHitSequence=async()=>{};saveCampaign();});
 await test('actual-mercenary-ui-accept-native-kills-claim-foreign-component',async()=>{
  await page.getByRole('button',{name:'Mercenario',exact:true}).click();
  const offer=await page.evaluate(()=>{const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon',profile:'ofensivo',rarity:'rara'})[0];const foreign=Object.keys(r.requirements).find(id=>EquipmentSystem.materialById(id).regionName==='Caverna');const board=EquipmentSystem.refreshContracts(player);const offer=board.offers.find(o=>o.rewardIds.includes(foreign));return{...offer,rewardId:foreign};});
  assert.ok(offer?.id);await page.locator('#reward_'+offer.id).selectOption(offer.rewardId);await page.locator(`[onclick="EquipmentSystem.acceptContract('${offer.id}')"]`).click();
  const before=await page.evaluate(()=>({active:player.mercenary.active.length,kills:player.stats.enemiesDefeated}));assert.equal(before.active,1);
  for(let i=0;i<offer.count;i++)await page.evaluate(async offer=>{currentMode='battle';enemy=createEnemyFromTemplate(regions[offer.targetRegion].enemies.find(e=>e.name===offer.targetName),false,offer.targetRegion);enemy.hp=1;isProcessingTurn=false;await attack();},offer);
  await page.evaluate(()=>{setMode('village');setVillageTab('mercenary');});
  const claim=page.getByRole('button',{name:'Receber recompensa',exact:true});assert.equal(await claim.isEnabled(),true);await claim.click();
  const result=await page.evaluate(({id,rewardId})=>({completed:player.mercenary.completed,reward:getInventoryCountById(rewardId),duplicate:!!EquipmentSystem.claimContract(id),unlocked:EquipmentSystem.unlockedRegions(player),kills:player.stats.enemiesDefeated}),{id:offer.id,rewardId:offer.rewardId});
  assert.equal(result.completed,1);assert.equal(result.duplicate,false);assert.ok(result.reward>=1);assert.deepEqual(result.unlocked,['Floresta']);assert.equal(result.kills-before.kills,offer.count);return result;
 });
 await test('actual-artisan-ui-crafts-regional-weapon-using-quest-material',async()=>{
  await page.getByRole('button',{name:'Artesao',exact:true}).click();await page.getByRole('combobox',{name:'Raridade do equipamento',exact:true}).selectOption('rara');
  const fixture=await page.evaluate(()=>{const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon',profile:'ofensivo',rarity:'rara'})[0];for(const[id,qty]of Object.entries(r.requirements)){const material=EquipmentSystem.materialById(id),owned=getInventoryCountById(id);if(material.regionName==='Floresta'&&owned<qty)addInventoryItem({...material,qty:qty-owned});}updateUI();return{id:r.id,coins:player.coins,cost:r.cost};});
  const craft=page.locator(`[onclick="EquipmentSystem.craft('${fixture.id}')"]`);assert.equal(await craft.isEnabled(),true);await craft.click();
  const result=await page.evaluate(()=>({item:player.inventory.find(x=>x.schemaVersion===2&&x.slot==='weapon'),coins:player.coins,crafted:player.stats.craftedEquipment,options:[...document.querySelector('[aria-label="Regiao das receitas"]').options].map(x=>x.value)}));
  assert.ok(result.item?.uid);assert.equal(result.coins,fixture.coins-fixture.cost);assert.equal(result.crafted,1);assert.deepEqual(result.options,['Floresta']);
  await page.getByRole('button',{name:result.item.name,exact:true}).click();assert.equal(await page.evaluate(()=>player.equipment.weapon?.schemaVersion),2);return{item:result.item.name,crafted:result.crafted,availableRegions:result.options};
 });
 await test('craft-equip-all-five-slots-save-reload-and-region-guard',async()=>{
  for(const slot of ['head','chest','legs','feet']){
   const recipe=await page.evaluate(slot=>{const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot,profile:'ofensivo',rarity:'rara'})[0];for(const[id,qty]of Object.entries(r.requirements)){const owned=getInventoryCountById(id);if(owned<qty)addInventoryItem({...EquipmentSystem.materialById(id),qty:qty-owned});}updateUI();return{id:r.id,name:r.result.name};},slot);
   await page.locator(`[onclick="EquipmentSystem.craft('${recipe.id}')"]`).click();await page.getByRole('button',{name:recipe.name,exact:true}).click();
  }
  const before=await page.evaluate(()=>{saveCampaign();return{ids:equipmentSlots.slice(0,5).map(s=>player.equipment[s]?.id),set:EquipmentSystem.getSetBonuses(player),count:player.stats.craftedEquipment};});
  assert.equal(before.set.activeSets.length,1);assert.equal(before.set.activeSets[0].count,5);assert.equal(before.count,5);await page.reload();await page.evaluate(()=>continueCampaign());
  const after=await page.evaluate(()=>({ids:equipmentSlots.slice(0,5).map(s=>player.equipment[s]?.id),set:EquipmentSystem.getSetBonuses(player),lockedRecipes:EquipmentSystem.getRecipes(player,{region:'Caverna'}).length,unlocked:EquipmentSystem.unlockedRegions(player)}));assert.deepEqual(after.ids,before.ids);assert.equal(after.set.activeSets[0].count,5);assert.equal(after.lockedRecipes,0);assert.deepEqual(after.unlocked,['Floresta']);return{pieces:after.set.activeSets[0].count,lockedRecipes:after.lockedRecipes};
 });
 await test('v2-forge-UI-honors-additional-foreign-ingredients',async()=>{
  await page.evaluate(()=>{enemy=null;setMode('village');setVillageTab('forge');});
  const before=await page.evaluate(()=>({rarity:player.equipment.weapon.rarity,coins:player.coins,need:EquipmentSystem.getUpgradeRequirements(player.equipment.weapon,player)}));
  await page.locator('[onclick="tryUpgradeEquippedItem(\'weapon\')"]').click();const failed=await page.evaluate(()=>({rarity:player.equipment.weapon.rarity,coins:player.coins}));assert.equal(failed.rarity,before.rarity);assert.equal(failed.coins,before.coins);
  await page.evaluate(()=>{const up=EquipmentSystem.getUpgradeRequirements(player.equipment.weapon,player);for(const[id,qty]of Object.entries(up.requirements)){const owned=getInventoryCountById(id);if(owned<qty)addInventoryItem({...EquipmentSystem.materialById(id),qty:qty-owned});}updateUI();});
  await page.locator('[onclick="tryUpgradeEquippedItem(\'weapon\')"]').click();const after=await page.evaluate(()=>({rarity:player.equipment.weapon.rarity,coins:player.coins}));assert.equal(after.rarity,before.need.toRarity);assert.equal(after.coins,before.coins-before.need.cost);return{before:before.rarity,after:after.rarity,ingredientIds:Object.keys(before.need.requirements)};
 });
 await test('native-set-action-hooks-all12',async()=>{
  const results=await page.evaluate(async()=>{
   wait=async()=>{};playSpriteAttackAnimation=async()=>{};animateEnemyBarTo=async()=>{};animateEnemyHitSequence=async()=>{};
   const rows=[];const originalRandom=Math.random;
   function setup(region,cls='Guerreiro',tier30='cavaleiro',tier60='paladino'){
    player.class=cls;player.level=100;player.subclassChoices={tier30,tier60};player.maxHp=player.hp=10000;player.maxMp=player.mp=10000;player.attack=100;player.baseStats={hp:classes[cls].hp,mp:classes[cls].mp,attack:classes[cls].attack};player.stats.invested={strength:10,vitality:10,wisdom:10,hpGain:0,mpGain:0,attackGain:100,skillGain:100};player.equipment={};for(const slot of EquipmentData.slots)player.equipment[slot]={...EquipmentSystem.createItem(region,slot,cls,'ofensivo','rara'),uid:'integration_'+slot};
    playerEffects=createDefaultPlayerEffects();resetCombatEffects();allocation={strength:0,wisdom:0,vitality:0};pendingLevelUps=levelUpPoints=0;isDead=isProcessingTurn=false;currentMode='battle';currentRegion='Floresta';enemy={...createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta'),maxHp:100000,hp:100000,attack:0,armor:0,maxHpStrikePercent:0};displayState={playerHp:player.hp,playerMp:player.mp,playerXp:0,enemyHp:enemy.hp};Math.random=()=>.99;
   }
   const cast=async type=>{const i=getSkillInfo().findIndex(s=>s.type===type);if(i<0)throw Error('Missing skill '+type);await useSkill(i);};
   setup('Floresta','Mago','elementalista','mago_incendiario');for(let i=0;i<3;i++)await cast('mage_fireball');rows.push({region:'Floresta',pass:!!playerEffects.equipmentRuntime.forestReady,state:playerEffects.equipmentRuntime});
   setup('Caverna');enemy.attack=400;for(let i=0;i<3;i++)await passTurn();rows.push({region:'Caverna',pass:playerEffects.equipmentRuntime.cooldowns.stone>0,shield:playerEffects.shieldValue});
   setup('Ruinas');await cast('warrior_second_wind');await cast('warrior_warcry');await attack();rows.push({region:'Ruinas',pass:playerEffects.equipmentRuntime.cooldowns.echo>0,state:playerEffects.equipmentRuntime});
   setup('Pantano');enemy.dotDamagePerTurn=1;enemy.dotTurns=10;await attack();rows.push({region:'Pantano',pass:enemy.naturePoisonDamage>0,state:playerEffects.equipmentRuntime});
   setup('Vulcao');enemy.dotDamagePerTurn=1;enemy.dotTurns=10;for(let i=0;i<3;i++)await cast('warrior_shove');rows.push({region:'Vulcao',pass:enemy.dotSourceName==='Brasas Vivas',dot:enemy.dotDamagePerTurn});
   setup('Abismo','Mago','arcanista','corrompido');await cast('mage_corruption');const prepared=playerEffects.equipmentRuntime.abyssReady;await attack();rows.push({region:'Abismo',pass:!!prepared&&!playerEffects.equipmentRuntime.abyssReady,penetration:EquipmentSystem.getArmorPenetration(player,playerEffects)});
   setup('Fortaleza');playerEffects.shieldValue=1000;enemy.attack=400;await passTurn();const stored=playerEffects.equipmentRuntime.retaliation;await attack();rows.push({region:'Fortaleza',pass:stored>0&&playerEffects.equipmentRuntime.cooldowns.retaliation>0,stored});
   setup('Necropole','Adepto da Natureza','druida','druida_sombrio');await cast('nature_swamp_collapse');rows.push({region:'Necropole',pass:Object.values(enemy.equipmentDotExtensions||{}).some(x=>x>0),owners:enemy.equipmentDotOwners,extensions:enemy.equipmentDotExtensions});
   setup('Citadela','Arqueiro','atirador','sniper');Math.random=()=>.01;await attack();const ready=playerEffects.equipmentRuntime.critPenReady;await cast('archer_headshot');rows.push({region:'Citadela',pass:!!ready&&!playerEffects.equipmentRuntime.critPenReady,state:playerEffects.equipmentRuntime});
   setup('Panteao');for(let i=0;i<3;i++){player.hp=1000;await cast('warrior_second_wind');}const support=playerEffects.equipmentRuntime.supportReady;await attack();rows.push({region:'Panteao',pass:!!support&&!playerEffects.equipmentRuntime.supportReady,state:playerEffects.equipmentRuntime});
   setup('Cataclismo','Guerreiro','cavaleiro','berserker');await cast('warrior_unstoppable');rows.push({region:'Cataclismo',pass:playerEffects.equipmentRuntime.cooldowns.sacrifice>0&&playerEffects.shieldValue>0,shield:playerEffects.shieldValue});
   setup('Paradoxo');await cast('warrior_second_wind');await cast('warrior_shove');await cast('warrior_warcry');const cycle=playerEffects.equipmentRuntime.cycleReady;await cast('warrior_second_wind');rows.push({region:'Paradoxo',pass:!!cycle&&!playerEffects.equipmentRuntime.cycleReady,state:playerEffects.equipmentRuntime});
   Math.random=originalRandom;return rows;
  });
  assert.equal(results.length,12);assert.ok(results.every(r=>r.pass),JSON.stringify(results.filter(r=>!r.pass)));return results;
 });
 await test('accessory-v2-canonical-caps-no-set-membership',async()=>{const result=await page.evaluate(()=>{const item=EquipmentSystem.createBossAccessory('Paradoxo','lendaria'),old={...getBossAccessoryTemplate('Paradoxo'),type:'equipment',rarity:'lendaria',totalDamagePercent:12};const legacy=normalizeEquipmentMetadata(old);player.equipment.accessory=item;return{item,legacyDamage:legacy.totalDamagePercent,canonical:EquipmentSystem.sanitizeNetworkItem({...item,totalDamagePercent:99999},player.class),setCount:EquipmentSystem.getSetBonuses(player).sets[0]?.count};});assert.ok(result.item.totalDamagePercent<=.15);assert.ok(result.canonical.totalDamagePercent<=.15);assert.equal(result.legacyDamage,12);assert.equal(result.item.setId,null);return{newBonus:result.item.totalDamagePercent,legacy:result.legacyDamage};});
 await page.evaluate(()=>{enemy=null;currentMode='village';villageTab='artisan';updateUI();});await page.screenshot({path:path.join(out,'equipment-artisan-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.evaluate(()=>setVillageTab('mercenary'));await page.screenshot({path:path.join(out,'equipment-mercenary-mobile.png'),fullPage:true});
 await page.waitForTimeout(300);report.errors=[...new Set(report.errors)];report.missingAssets=[...new Map(report.missingAssets.map(x=>[x.url,x])).values()];report.passed=report.tests.filter(t=>t.pass).length;report.failed=report.tests.filter(t=>!t.pass).length;
 fs.writeFileSync(path.join(out,'equipment-integration-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,errors:report.errors,missingAssets:report.missingAssets},null,2));await browser.close();server.close();if(report.failed||report.errors.length||report.missingAssets.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});

