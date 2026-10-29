const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:1150},colorScheme:'dark',reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/docs/hud/telas-preview.html');
  const frame=page.frames().find(f=>f!==page.mainFrame());
  await frame.waitForSelector('.hud');await page.waitForTimeout(200);
  const results=[];
  for(const width of [1366,1024,390,320]){
   await page.setViewportSize({width,height:1250});
   for(const variant of [0,1]){
    await frame.locator('[data-variant]').evaluateAll((els,index)=>els.forEach((el,i)=>el.hidden=i!==index),variant);
    const app=frame.locator('[data-variant]').nth(variant).locator('.hud');
    const prefix=variant===0?'palco':'painel';
    for(const [name,screen] of [['combate','adventure'],['equipamentos','hero'],['oficina','village'],['mercenario','mercenary']]){
     await app.locator('[data-page="'+screen+'"]').first().click();
     assert(await app.locator('[data-screen="'+screen+'"]').isVisible());
     const size=await app.evaluate(a=>({width:a.clientWidth,scroll:a.scrollWidth,height:a.clientHeight}));
     assert(size.width>=size.scroll,`${prefix} ${screen} ${width}: horizontal overflow`);
     results.push({width,variant:prefix,screen,...size});
     if(width===1366||width===390)await app.screenshot({path:path.join(__dirname,`${prefix}-${name}-${width}.png`)});
     if(screen==='hero'){
      await app.locator('[data-inspect-equipment="Capuz da Floresta"]').click();
      assert.equal(await app.locator('.selected-equipment').innerText(),'Capuz da Floresta');
      await app.locator('[data-character-tab="attributes"]').click();
      assert(await app.locator('.character-extra').isVisible());
      await app.locator('[data-character-tab="equipment"]').click();
     }
     if(screen==='village'){
      await app.locator('[data-recipe-mode="upgrade"]').click();
      assert((await app.locator('.recipe-desc').innerText()).includes('comum → incomum'));
      await app.locator('[data-recipe-mode="craft"]').click();
     }
     if(screen==='mercenary'){
      await app.locator('[data-contract-filter="available"]').click();
      assert.equal(await app.locator('.contract-title').innerText(),'Teias na trilha');
      assert.equal(await app.locator('.contract-reward').innerText(),'Fragmento Gélido × 2');
      assert.equal(await app.locator('.contract-cta').isDisabled(),false);
      await app.locator('[data-contract="bats"]').click();
      assert.equal(await app.locator('.contract-title').innerText(),'Asas na escuridão');
      await app.locator('[data-contract-filter="active"]').click();
      assert(await app.locator('.contract-cta').isDisabled());
     }
    }
   }
  }
  assert.equal(errors.length,0,errors.join('\n'));
  fs.writeFileSync(path.join(__dirname,'telas-results.json'),JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({states:results.length,errors,maxHeight:Math.max(...results.map(r=>r.height))}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
