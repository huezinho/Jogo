const assert=require('node:assert/strict');
const path=require('node:path'),os=require('node:os');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  assert.equal(await page.locator('.start-stat-row').count(),0);
  await page.locator('[data-start-class]').first().hover();
  assert.match(await page.locator('#rpgActionTooltip').innerText(),/Vida:.*Mana:.*Dano:/);
  await page.screenshot({path:path.join(os.tmpdir(),'characters-create-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(os.tmpdir(),'characters-create-mobile.png'),fullPage:true});
  const mechanics=await page.evaluate(async()=>{
   selectClass('Guerreiro');wait=async()=>{};playSpriteAttackAnimation=async()=>{};
   CharacterMotion.ready=async()=>{};CharacterMotion.hurt=async()=>{};
   player.hp=player.maxHp=100000;player.baseStats.hp=100000;player.level=100;
   levelUpPoints=0;pendingLevelUps=0;player.subclassChoices={tier30:'cavaleiro',tier60:'paladino'};
   const checks=[];
   for(const boss of [false,true]){
    enemy=createEnemyFromTemplate(boss?regions.Floresta.boss:regions.Floresta.enemies[0],boss,'Floresta');
    enemy.hp=enemy.maxHp=100000;enemy.maxMp=100;enemy.mp=0;
    resetCombatEffects();isProcessingTurn=true;currentMode='battle';
    await enemyTurn();checks.push(enemy.mp===13);
   }
   enemy=null;isProcessingTurn=false;currentMode='village';villageTab='alchemist';
   const costs=[];
   for(const q of alchemyQualities){
    const id='alquimia_sorte_'+q.id,recipe=getAlchemyRecipe(id);costs.push(recipe.gold);
    for(const material of recipe.ingredients)addInventoryItem({...material,qty:material.qty});
    player.coins=recipe.gold-1;const before=recipe.ingredients.map(x=>getInventoryCountById(x.id));
    checks.push(craftAlchemyPotion(id)===false&&recipe.ingredients.every((x,i)=>getInventoryCountById(x.id)===before[i]));
    player.coins=recipe.gold;checks.push(craftAlchemyPotion(id)===true&&player.coins===0);
   }
   currentMode='battle';player.stats.regionKills=player.stats.regionKills||{};
   player.stats.regionKills.Floresta={};for(const e of regions.Floresta.enemies)player.stats.regionKills.Floresta[e.name]=1;
   updateUI();return {checks,costs};
  });
  assert(mechanics.checks.every(Boolean),JSON.stringify(mechanics));
  assert.deepEqual(mechanics.costs,[25,75,200,500,1200,2800,6000,12000]);
  for(const width of [1366,390]){
   await page.setViewportSize({width,height:900});
   const note=await page.locator('.rpg-expedition-note').boundingBox(),dock=await page.locator('.rpg-vital-dock').boundingBox();
   assert(note.x>dock.x+dock.width/2-2);
   const heights=[];
   for(const content of ['<strong>Sem contrato ativo</strong><span>Busque um contrato</span>', '<strong>Contrato mais próximo</strong><span>Aranha Gigante de um nome extremamente longo para conferir o painel</span><small>Floresta · 1/5</small><progress value="1" max="5"></progress>']){
    await page.locator('#rpgContractDock button').evaluate((e,html)=>e.innerHTML=html,content);
    heights.push((await page.locator('#rpgContractDock').boundingBox()).height);
   }
   assert.equal(heights[0],heights[1]);
   await page.screenshot({path:path.join(os.tmpdir(),'ui-alchemy-'+width+'.png'),fullPage:true});
  }
  assert(await page.locator('.region-map-boss-btn').isEnabled());
  assert.match(await page.locator('.region-map-boss-btn').evaluate(e=>getComputedStyle(e).backgroundImage),/174, 48, 51/);
  await page.evaluate(()=>saveCampaign());
  await page.reload();
  await page.locator('[data-start-tab="continue"]').click();
  await page.locator('.saved-character-card').hover();
  assert.match(await page.locator('#rpgActionTooltip').innerText(),/Vida:.*Mana:.*Dano:/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(os.tmpdir(),'characters-saved-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS character tooltips, responsive layout, fixed contract dock, region alignment, common/boss mana, crafting gold',mechanics);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
