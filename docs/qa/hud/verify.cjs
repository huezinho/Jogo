const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const results={screens:[],flows:[],errors:[],badResponses:[]};
 try{
  const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',e=>results.errors.push(e.stack));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))results.badResponses.push([r.status(),r.url()]);});
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.evaluate(()=>{selectClass('Guerreiro');player.level=40;player.subclassChoices={tier30:'cavaleiro',tier60:null};normalizePlayerState();player.coins=50000;player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;displayState={playerHp:player.hp,playerMp:player.mp,playerXp:0,enemyHp:enemy.hp};updateUI();});
  // Real battle action, stable slots during the animation, and modal keyboard isolation.
  const before=await page.evaluate(()=>({hp:enemy.hp,skills:getSkillInfo().length}));
  await page.locator('[data-hud="attack"]').click();
  assert.equal(await page.locator('#actions .rpg-ability').count(),before.skills+1);
  assert(await page.locator('[data-hud="attack"]').isDisabled());
  await page.waitForFunction(()=>!isProcessingTurn,{},{timeout:20000});
  assert(await page.evaluate(hp=>!enemy||enemy.hp<hp,before.hp));
  results.flows.push('basic attack and stable disabled action slots');
  await page.locator('[data-hud="skills"]').click();
  const hpBeforeModal=await page.evaluate(()=>enemy?.hp);
  await page.keyboard.press('1');assert.equal(await page.evaluate(()=>enemy?.hp),hpBeforeModal);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#rpgDialog').evaluate(d=>d.open),false);
  results.flows.push('skill details dialog, keyboard isolation and Escape');
  await page.evaluate(()=>{enemy=null;currentMode='village';villageTab='artisan';updateUI();});
  await page.locator('[data-hud="craft-map"]').click();
  assert(await page.locator('[data-hud="craft-region"][data-value="Caverna"]').isDisabled());
  await page.keyboard.press('Escape');
  // Craft through the real UI; ingredients come from the canonical recipe.
  const recipe=await page.evaluate(()=>{const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon'})[0];for(const[id,qty]of Object.entries(r.requirements))addInventoryItem({...EquipmentSystem.materialById(id),qty});updateUI();return r;});
  assert.equal(await page.locator('[data-hud="craft"]').isDisabled(),false);
  const money=await page.evaluate(()=>player.coins);
  await page.locator('[data-hud="craft"]').click();
  assert.equal(await page.evaluate(()=>player.coins),money-recipe.cost);
  const crafted=await page.evaluate(()=>player.inventory.find(i=>i.type==='equipment'));
  assert.equal(crafted.rarity,'comum');
  results.flows.push('locked crafting region and common crafting with actual materials/cost');
  // Selection is inspection; only the explicit button equips.
  await page.locator('#modeTabs [data-value="bag"]').click();
  const equipmentBefore=await page.evaluate(()=>JSON.stringify(player.equipment));
  await page.locator('[data-hud="inspect-item"]').first().click();
  assert.equal(await page.evaluate(()=>JSON.stringify(player.equipment)),equipmentBefore);
  await page.locator('[data-hud="equip"]').click();
  assert.equal(await page.evaluate(()=>player.equipment.weapon?.uid),crafted.uid);
  results.flows.push('bag inspection does not mutate equipment; explicit equip works');
  await page.locator('#modeTabs [data-value="village"]').click();
  await page.locator('[data-hud="service"][data-value="forge"]').click();
  assert(await page.locator('[data-hud="upgrade"]').isDisabled());
  await page.evaluate(()=>{const u=EquipmentSystem.getUpgradeRequirements(player.equipment.weapon,player);for(const[id,qty]of Object.entries(u.requirements))addInventoryItem({...EquipmentSystem.materialById(id),qty});updateUI();});
  await page.locator('[data-hud="upgrade"]').click();
  assert.equal(await page.evaluate(()=>player.equipment.weapon.rarity),'incomum');
  results.flows.push('sequential rarity upgrade and missing-material guard');
  await page.locator('[data-hud="service"][data-value="mercenary"]').click();
  await page.locator('[data-hud="contract-tab"][data-value="offers"]').click();
  const offer=await page.evaluate(()=>EquipmentSystem.refreshContracts(player).offers[0]);
  await page.locator('[data-hud="accept"]').click();
  await page.locator('[data-hud="contract-tab"][data-value="active"]').click();
  assert(await page.locator('[data-hud="claim"]').isDisabled());
  await page.evaluate(()=>{const q=player.mercenary.active[0];for(let i=0;i<q.count;i++)EquipmentSystem.recordKill({baseName:q.targetName,region:q.targetRegion},player);updateUI();});
  await page.locator('[data-hud="claim"]').click();
  assert.equal(await page.evaluate(id=>player.inventory.find(i=>i.id===id)?.qty,offer.rewardId),offer.rewardQty);
  assert.equal(await page.evaluate(()=>player.mercenary.active.length),0);
  results.flows.push('fixed mercenary reward, completion, claim exactly once');
  // A fully equipped character makes the visual fixtures representative; no balance changes.
  await page.evaluate(()=>{for(const slot of EquipmentData.slots)player.equipment[slot]={...EquipmentSystem.createItem('Floresta',slot,player.class,'comum'),uid:'qa_'+slot};player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;displayState.playerHp=player.hp;displayState.playerMp=player.mp;});
  for(const width of [1366,1024,768,390,320]){
   await page.setViewportSize({width,height:width<761?844:768});
   for(const screen of ['battle','workshop','upgrade','character','bag','mercenary','inn','alchemist','bestiary','trophies']){
    await page.evaluate(screen=>{enemy=null;isDead=false;isProcessingTurn=false;if(screen==='battle'){currentMode='battle';spawnEnemy();}else if(['workshop','upgrade','mercenary','inn','alchemist'].includes(screen)){currentMode='village';villageTab={workshop:'artisan',upgrade:'forge',mercenary:'mercenary',inn:'inn',alchemist:'alchemist'}[screen];}else if(screen==='character'){currentMode='camp';campTab='equipamentos';}else if(screen==='bag'){currentMode='camp';}else currentMode=screen;updateUI();},screen);
    // Clear bag state using the ordinary navigation before entering the next fixture.
    if(screen==='bag')await page.locator('#modeTabs [data-value="bag"]').click();
    if(screen==='mercenary')await page.locator('[data-hud="contract-tab"][data-value="offers"]').click();
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('#campaignHud img')].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));await Promise.all([...document.querySelectorAll('#campaignHud .sheet-sprite')].map(e=>{const url=getComputedStyle(e).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];if(!url)return;const image=new Image();image.src=url;return image.decode().catch(()=>{});}));});
    await page.mouse.move(0,0);
    const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,duplicates:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,all)=>all.indexOf(id)!==i),broken:[...document.querySelectorAll('#campaignHud img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
    results.screens.push({screen,...metrics});
    assert(metrics.scroll<=width,`${screen} at ${width}: overflow ${metrics.scroll}`);
    assert.equal(metrics.duplicates.length,0,`${screen}: duplicate ids ${metrics.duplicates}`);
    assert.equal(metrics.broken.length,0,`${screen}: broken images ${metrics.broken}`);
    const typography=await page.evaluate(()=>({loaded:[...document.fonts].some(f=>f.family==='RPG Cinzel'&&f.status==='loaded'),labels:[...document.querySelectorAll('#campaignHud *')].filter(e=>e.getBoundingClientRect().width>0&&[...e.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())).map(e=>({family:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight}))}));
    assert(typography.loaded,`${screen}: Cinzel did not load`);
    assert(typography.labels.every(l=>l.family.includes('RPG Cinzel')&&l.weight==='650'),`${screen}: inconsistent font or weight`);
    if([1366,390].includes(width)&&['battle','workshop','character','mercenary','bag'].includes(screen))await page.screenshot({path:path.join(__dirname,`${screen}-${width}.png`),fullPage:true});
    if(screen==='bag')await page.locator('#modeTabs [data-value="battle"]').click();
   }
  }
  // Different classes use their real skill lists and actual basic mana costs.
  for(const className of ['Arqueiro','Mago','Adepto da Natureza']){
   const classContext=await browser.newContext(),p=await classContext.newPage();
   p.on('pageerror',e=>results.errors.push(e.stack));
   await p.goto('http://127.0.0.1:'+server.address().port);
   await p.evaluate(className=>selectClass(className),className);
   const labels=await p.locator('#actions [data-hud="attack"] small').innerText();
   assert.equal(labels,className==='Mago'?'9 MP':'0 MP');
   if(className==='Mago'){await p.evaluate(()=>{player.mp=0;updateUI();});assert(await p.locator('[data-hud="attack"]').isDisabled());}
   assert.equal(await p.locator('#campaignHud').count(),1);await classContext.close();
  }
  results.flows.push('all four classes render; mage basic cost and mana lock match engine');
  await page.evaluate(()=>{enemy=null;currentMode='village';villageTab='inn';player.hp=Math.max(1,player.hp-35);player.mp=Math.max(0,player.mp-35);updateUI();});
  await page.locator('[data-hud="heal"]').click();assert(await page.evaluate(()=>player.hp===getCurrentCaps().maxHp));
  await page.locator('[data-hud="mana"]').click();assert(await page.evaluate(()=>player.mp===getCurrentCaps().maxMp));
  await page.evaluate(()=>saveCampaign());await page.reload();await page.evaluate(()=>continueCampaign());
  assert.equal(await page.locator('#campaignHud').count(),1);
  assert.equal(await page.evaluate(()=>player.equipment.weapon?.schemaVersion),2);
  results.flows.push('inn recovery and save/reload persistence');
  assert.equal(results.errors.length,0,results.errors.join('\n'));assert.equal(results.badResponses.length,0,JSON.stringify(results.badResponses));
  fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({screens:results.screens.length,flows:results.flows,errors:results.errors,badResponses:results.badResponses},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
