const assert=require('node:assert/strict'),path=require('node:path');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:'+server.address().port);await p.evaluate(()=>{selectClass('Guerreiro');player.coins=1234567;updateUI();});
 for(const width of [1366,390,320]){
  await p.setViewportSize({width,height:900});await p.evaluate(()=>{currentMode='battle';if(!enemy)spawnEnemy();updateUI();});
  const balance=p.locator('.rpg-coins');assert(!(await balance.innerText()).includes('moedas'));await balance.hover();
  assert((await p.locator('#rpgActionTooltip').innerText()).includes(await p.evaluate(()=>player.coins.toLocaleString('pt-BR')+' moedas')));
  const boss=p.locator('.region-map-boss-btn'),before=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,x:scrollX,y:scrollY}));
  if(await boss.isVisible()){await boss.hover();await p.waitForTimeout(350);assert(await p.locator('#rpgActionTooltip').isVisible());
  const br=await boss.boundingBox(),tr=await p.locator('#rpgActionTooltip').boundingBox();assert(tr.x+tr.width<=br.x+1,'boss tooltip must stay on the left');
  assert.deepEqual(await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,x:scrollX,y:scrollY})),before);
  await p.screenshot({path:path.join(__dirname,`boss-left-${width}.png`)});}
  await p.evaluate(()=>{enemy=null;currentMode='village';villageTab='inn';player.hp=1;player.mp=1;updateUI();});
  await p.locator('.rpg-inn-title').evaluate(e=>e.decode());await p.locator('[data-hud="heal"]').click();assert(await p.evaluate(()=>player.hp===getCurrentCaps().maxHp));
  await p.locator('[data-hud="mana"]').click();assert(await p.evaluate(()=>player.mp===getCurrentCaps().maxMp));assert.equal(await p.locator('.rpg-inn .action-feedback').count(),0);
  assert(!(await p.locator('.rpg-inn').innerText()).includes('restaurada por'));
  await p.screenshot({path:path.join(__dirname,`inn-rustic-${width}.png`),fullPage:true});
  await p.evaluate(()=>{villageTab='alchemist';updateUI();});assert.equal(await p.locator('.rpg-alchemy .coin-badge').count(),0);
  const buy=p.locator('.rpg-alchemy button[onclick^="buyConsumable"]').first();assert(!(await buy.innerText()).includes('moedas'));assert(await buy.locator('.rpg-coin-icon').isVisible());
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);console.log('PASS rustic inn, silent healing, compact alchemy, contrasting balance and stable left boss tooltip at three widths');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
