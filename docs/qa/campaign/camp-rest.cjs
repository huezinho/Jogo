const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../2026-10-27/smoke.cjs'),screenshot=require('../screenshot.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'msedge'}),checks=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.stack));await p.goto(base);
  await p.evaluate(()=>{selectClass('Guerreiro');enemy=null;isDead=false;currentMode='camp';campTab='equipamentos';player.hp=10;player.mp=5;player.coins=50000;updateUI();});
  assert.equal(await p.locator('[data-hud="rest"]').innerText(),'Descansar');assert.equal(await p.locator('.rpg-camp-rest small').count(),0);assert((await p.locator('.rpg-camp-rest p').innerText()).includes('HP/s'));
  await p.locator('[data-hud="rest"]').click();assert.equal(await p.locator('[data-hud="rest"]').innerText(),'Levantar');
  const timing=await p.evaluate(()=>{
   const hp=player.hp,mp=player.mp,coins=player.coins,unit=getCampRestHealing(),t=Date.now()-10500;player.campRest.lastTickAt=t;
   const early=recoverCampRest(t+2999),at3=recoverCampRest(t+3000),first=player.hp,repeat=recoverCampRest(t+3000),late=recoverCampRest(t+10500),last=player.hp,remainder=t+10500-player.campRest.lastTickAt;
   player.campRest.lastTickAt=Date.now();return{hp,unit,early,at3,first,repeat,late,last,remainder,mpSame:mp===player.mp,coinsSame:coins===player.coins};
  });assert(!timing.early&&timing.at3&&!timing.repeat&&timing.late);assert.equal(timing.first,timing.hp+timing.unit);assert.equal(timing.last,timing.hp+timing.unit*3);assert.equal(timing.remainder,1500);assert(timing.mpSame&&timing.coinsSame);
  const beforeTick=await p.evaluate(()=>{player.campRest.lastTickAt=Date.now()-3000;return player.hp;});await p.waitForFunction(hp=>player.hp>hp,beforeTick,{timeout:3000});
  checks.push('3-second real timer; no instant healing, duplicate tick, mana gain or charge; elapsed catch-up retains partial interval');

  for(const mode of ['village','bestiary','trophies','camp']){await p.evaluate(mode=>setMode(mode),mode);assert.equal(await p.evaluate(()=>currentMode),mode);assert(await p.evaluate(()=>isCampResting()));}
  await p.evaluate(()=>{currentMode='village';villageTab='artisan';const r=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon'})[0];for(const[id,qty]of Object.entries(r.requirements))addInventoryItem({...EquipmentSystem.materialById(id),qty});updateUI();});
  await p.locator('[data-hud="craft"]').click();assert(await p.evaluate(()=>isCampResting()&&player.inventory.some(i=>i.type==='equipment'&&i.slot==='weapon')));
  assert(await p.evaluate(()=>toggleCampRest()===false&&isCampResting()));
  await p.locator('[data-hud="rest-camp"]').click();assert.equal(await p.evaluate(()=>currentMode),'camp');
  await p.locator('[data-hud="equipped"][data-value="weapon"]').click();await p.locator('[data-hud="slot-equip"]').click();await p.keyboard.press('Escape');assert(await p.evaluate(()=>isCampResting()&&!!player.equipment.weapon));
  checks.push('rest continues across tabs, crafting and equipping; only camp can stop it; indicator returns to camp');

  await p.evaluate(()=>{setMode('battle');player.stats.regionBossKills.Floresta=1;player.stats.regionKills.Floresta={};for(const e of regions.Floresta.enemies)player.stats.regionKills.Floresta[e.name]=1;updateUI();});
  assert.equal(await p.locator('[data-hud="find"]').count(),0);assert.equal(await p.locator('#actions button').count(),1);assert.equal(await p.locator('#actions button').innerText(),'Descansando');assert.equal(await p.locator('#actions p').count(),0);assert(await p.locator('.region-map-boss-btn').isDisabled());
  await p.keyboard.press('1');assert.equal(await p.evaluate(()=>enemy),null);
  await screenshot(p,{path:path.join(__dirname,'camp-rest-battle.png'),fullPage:true});
  const blocked=await p.evaluate(()=>{const n=enemiesSpawned;ensureEnemy();challengeBoss();const normal=spawnEnemy(),boss=spawnEnemy(true);openArenaPage();openDungeonPage();return{normal,boss,n,after:enemiesSpawned,enemy,rest:isCampResting(),queued:sessionStorage.getItem(PENDING_PAGE_MODE_KEY)};});
  assert.equal(blocked.normal,false);assert.equal(blocked.boss,false);assert.equal(blocked.after,blocked.n);assert.equal(blocked.enemy,null);assert(blocked.rest);assert.equal(blocked.queued,null);assert.equal(p.url(),base+'/');
  for(const mode of ['arena','dungeon']){await p.evaluate(mode=>setMode(mode),mode);assert(await p.locator('[data-hud="external"]').isDisabled());}
  await p.evaluate(()=>{saveCampaign();});await p.reload();await p.evaluate(()=>continueCampaign());assert(await p.evaluate(()=>isCampResting()));
  checks.push('normal/boss encounters, keyboard entry and arena/dungeon entry stay blocked until standing; reload preserves rest');

  // A direct visit to a separate combat page must also return this resting character to camp.
  const characterId=await p.evaluate(()=>player.characterId);
  for(const route of ['arena.html','dungeon.html']){
   await p.goto(base+'/'+route);await p.evaluate(id=>{if(!player)setTimeout(()=>continueCampaign(id),0);},characterId);
   await p.waitForURL('**/index.html');
   try{await p.waitForFunction(()=>player&&currentMode==='camp',{},{timeout:5000});}
   catch(error){console.error(route,await p.evaluate(()=>({mode:currentMode,rest:player?.campRest,queued:sessionStorage.getItem(PENDING_PAGE_MODE_KEY),saved:getSavedCharacterState()?.currentMode,log:document.getElementById('log').innerText})),errors);throw error;}
   assert(await p.evaluate(()=>isCampResting()));
  }
  for(const width of [1366,390,320]){
   await p.setViewportSize({width,height:900});await p.evaluate(()=>{campTab='equipamentos';updateUI();});
   const rest=p.locator('[data-hud="rest"]');await rest.scrollIntoViewIfNeeded();assert(await rest.isVisible());
   assert(await rest.evaluate(e=>{const r=e.getBoundingClientRect(),n=document.querySelector('.rpg-character-caption h2').getBoundingClientRect();return r.top>=n.bottom&&r.left>=0&&r.right<=innerWidth;}));
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await screenshot(p,{path:path.join(__dirname,`camp-rest-${width}.png`),fullPage:true});
  }
  await p.evaluate(()=>{player.campRest.lastTickAt=Date.now()-30000000;updateUI();});assert(await p.evaluate(()=>player.hp===getCurrentCaps().maxHp&&isCampResting()));
  await p.locator('[data-hud="rest"]').click();assert(await p.evaluate(()=>!isCampResting()));
  await p.evaluate(()=>setMode('battle'));assert(await p.locator('[data-hud="find"]').isEnabled());await p.locator('[data-hud="find"]').click();assert(await p.evaluate(()=>!!enemy));
  checks.push('direct combat-page URLs return to camp; rest UI fits1366/390/320; HP caps without auto-standing; standing unlocks combat');

  const recipes=await p.evaluate(()=>{
   const actor=structuredClone(player);for(const r of Object.keys(regions))actor.stats.regionBossKills[r]=1;
   return Object.keys(regions).map(region=>{const r=EquipmentSystem.getRecipes(actor,{region,slot:'chest'})[0],legs=EquipmentSystem.getRecipes(actor,{region,slot:'legs'})[0];return{region,total:Object.values(r.requirements).reduce((a,b)=>a+b,0),cost:r.cost,legs:legs.cost};});
  });for(const r of recipes){assert.equal(r.total,7);assert(r.cost>r.legs&&r.cost<Math.ceil(r.legs*1.35));}
  checks.push({moderateChestRecipes:recipes});assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'camp-rest-results.json'),JSON.stringify({checks,errors},null,2));console.log('PASS camp rest: '+checks.length+' integrated checks');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
