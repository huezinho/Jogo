const assert=require('node:assert/strict'),path=require('node:path');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:'+server.address().port);await p.evaluate(()=>selectClass('Guerreiro'));
  for(const width of [1366,390,320]){
   await p.setViewportSize({width,height:900});
   assert.equal(await p.locator('[data-hud="skills"]').count(),0);
   await p.getByRole('button',{name:'Ver rastros',exact:true}).hover();
   assert(await p.locator('#rpgBossClues').isVisible());
   await p.screenshot({path:path.join(__dirname,`boss-clues-${width}.png`),fullPage:true});
   assert(await p.locator('#rpgBossClues').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));
   await p.getByRole('button',{name:'Ver rastros',exact:true}).click();
   assert.equal(await p.locator('#rpgDialog').evaluate(e=>e.open),false);
   await p.evaluate(()=>{enemy=null;setMode('camp');});
   assert.equal(await p.getByRole('button',{name:'Abrir bolsa',exact:true}).count(),1);
   await p.evaluate(()=>{setMode('village');setVillageTab('forge');});
   assert.equal(await p.locator('#rpgMain').evaluate(e=>getComputedStyle(e).backgroundAttachment),'fixed');
   await p.screenshot({path:path.join(__dirname,`forge-whole-${width}.png`),fullPage:true});
   await p.evaluate(()=>{setMode('battle');gainXP(getXpToNextLevel());updateUI();});
   assert(await p.locator('#rpgLevelDialog').evaluate(e=>e.open));
   await p.keyboard.press('Escape');assert(await p.locator('#rpgLevelDialog').evaluate(e=>e.open));
   assert(await p.locator('#rpgLevelDialog').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
   await p.screenshot({path:path.join(__dirname,`level-dialog-${width}.png`),fullPage:true});
   await p.evaluate(()=>{allocation.vitality=levelUpPoints;levelUpPoints=0;updateUI();});
   await p.getByRole('button',{name:'Terminar distribuicao e continuar',exact:true}).click();
   assert.equal(await p.locator('#rpgLevelDialog').evaluate(e=>e.open),false);
   await p.evaluate(()=>{spawnEnemy();updateUI();});
  }
  assert.deepEqual(errors,[]);console.log('PASS anchored boss clues, no duplicate controls, modal level progression and full forge background at three widths');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
