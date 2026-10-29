const fs=require('node:fs'),path=require('node:path');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>{selectClass('Guerreiro');player.level=40;player.subclassChoices={tier30:'cavaleiro',tier60:null};normalizePlayerState();player.coins=248;for(const slot of EquipmentData.slots)player.equipment[slot]={...EquipmentSystem.createItem('Floresta',slot,player.class,'comum'),uid:'fixture_'+slot};player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;enemy=createEnemyFromTemplate(regions.Floresta.enemies[0]);displayState={playerHp:player.hp,playerMp:player.mp,playerXp:0,enemyHp:enemy.hp};updateUI();});
 await page.evaluate(()=>{const recipe=EquipmentSystem.getRecipes(player,{region:'Floresta',slot:'weapon'})[0];for(const[id,qty]of Object.entries(recipe.requirements))addInventoryItem({...EquipmentSystem.materialById(id),qty});});
 await page.evaluate(()=>document.fonts.ready);const metrics=[];
 for(const width of [1366,390]){await page.setViewportSize({width,height:width===1366?768:844});for(const screen of ['battle','workshop']){
  await page.evaluate(screen=>{if(screen==='battle'){currentMode='battle';enemy=createEnemyFromTemplate(regions.Floresta.enemies[0]);}else{enemy=null;currentMode='village';villageTab='artisan';}updateUI();scrollTo(0,0);},screen);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('#campaignHud img')].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));await Promise.all([...document.querySelectorAll('.sheet-sprite')].map(e=>{const url=getComputedStyle(e).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];if(!url)return;const img=new Image();img.src=url;return img.decode().catch(()=>{});}));});await page.mouse.move(0,0);await page.waitForTimeout(80);
  await page.screenshot({path:path.join(__dirname,`${screen}-${width}.png`),fullPage:true});
  metrics.push(await page.evaluate(({screen,width})=>({screen,width,scroll:document.documentElement.scrollWidth,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),type:[...document.querySelectorAll('#campaignHud button')].filter(e=>e.getBoundingClientRect().width>0).slice(0,12).map(e=>({text:e.innerText,font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize}))}),{screen,width}));
 }}
 fs.writeFileSync(path.join(__dirname,'capture-results.json'),JSON.stringify({metrics,errors},null,2));console.log(JSON.stringify({errors,metrics},null,2));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
