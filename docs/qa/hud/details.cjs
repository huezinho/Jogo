const assert=require('node:assert/strict'),path=require('node:path');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:'+server.address().port);await p.evaluate(()=>{selectClass('Guerreiro');player.coins=50000;for(const slot of EquipmentData.slots)player.equipment[slot]={...EquipmentSystem.createItem('Floresta',slot,player.class,'comum'),uid:'detail_'+slot};updateUI();});
 for(const width of [1366,390,320]){
  await p.setViewportSize({width,height:900});await p.evaluate(()=>{currentMode='battle';if(!enemy)spawnEnemy();updateUI();});
  assert(await p.locator('.rpg-coins .rpg-coin-icon').isVisible());assert.equal(await p.locator('#rpgSkillHint').count(),0);await p.locator('[data-hud="attack"]').hover();
  assert(await p.locator('#rpgActionTooltip').isVisible());assert(await p.locator('#rpgActionTooltip').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));
  await p.screenshot({path:path.join(__dirname,`skill-popup-${width}.png`),fullPage:false});
  await p.mouse.move(0,0);assert(await p.locator('#rpgActionTooltip').isHidden());
  const clue=await p.locator('.region-map-boss-btn').getAttribute('data-tooltip');assert(clue.includes('Complete o rastro'));assert(clue.length<80);
  await p.evaluate(()=>{enemy=null;currentMode='village';villageTab='inn';player.hp=10;player.mp=5;updateUI();});
  assert.equal(await p.getByRole('meter',{name:'Vida',exact:true}).getAttribute('aria-valuenow'),'10');assert.equal(await p.getByRole('meter',{name:'Mana',exact:true}).getAttribute('aria-valuenow'),'5');
  await p.locator('.rpg-inn-title').evaluate(e=>e.decode());assert(await p.locator('[data-hud="heal"] .rpg-coin-icon').count());
  await p.screenshot({path:path.join(__dirname,`inn-details-${width}.png`),fullPage:true});
  await p.locator('[data-hud="heal"]').click();assert(await p.evaluate(()=>player.hp===getCurrentCaps().maxHp));
  await p.evaluate(()=>{currentMode='camp';campTab='equipamentos';updateUI();});
  assert.equal(await p.locator('.rpg-character-figure').evaluate(e=>getComputedStyle(e).backgroundImage),'none');
  await p.screenshot({path:path.join(__dirname,`camp-details-${width}.png`),fullPage:true});
  for(const service of ['artisan','forge']){
   await p.evaluate(service=>{currentMode='village';villageTab=service;updateUI();},service);
   const selector=service==='artisan'?'craft-slot':'upgrade-item',values=await p.locator(`[data-hud="${selector}"]`).evaluateAll(es=>es.map(e=>e.dataset.value));
   let base=null;for(const value of values){await p.locator(`[data-hud="${selector}"][data-value="${value}"]`).click();
    const state=await p.evaluate(()=>{const s=getComputedStyle(document.querySelector('#rpgMain'));return {image:s.backgroundImage,size:s.backgroundSize,attachment:s.backgroundAttachment,height:document.querySelector('.rpg-anvil>img').getBoundingClientRect().height};});
    assert.equal(state.attachment,'fixed');assert.equal(state.height,280);if(base)assert.deepEqual(state,base);base=state;
   }
   await p.screenshot({path:path.join(__dirname,`${service}-details-${width}.png`),fullPage:true});
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);console.log('PASS ability popups, concise boss hint, currency icons, inn meters and healing, camp glow, stable forge across 30 piece selections');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
