const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { server, chromium } = require('../2026-10-27/smoke.cjs');
const out = __dirname;
let runningBrowser;
async function main(){
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({headless:true, channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge'});
  runningBrowser=browser;
  const report = {date:'2026-10-28',checks:[],errors:[],missingAssets:[],resources:[]};
  const context = await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true});
  const page = await context.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('response', r => {if(r.status() >= 400 && r.url().startsWith(base)) report.missingAssets.push({url:r.url(),status:r.status()});});
  await page.goto(base);
  await page.evaluate(() => selectClass('Guerreiro'));
  await page.waitForTimeout(500);
  const initial = await page.evaluate(() => ({hp:player.hp,enemy:enemy?.hp,processing:isProcessingTurn}));
  await page.locator('#actions button').first().click();
  await page.waitForFunction(() => !isProcessingTurn);
  const after = await page.evaluate(() => ({hp:player.hp,enemy:enemy?.hp}));
  assert(after.enemy < initial.enemy);assert(after.hp <= initial.hp);
  report.checks.push({name:'native combat button resolves player and enemy turn',pass:true});
  report.resources = await page.evaluate(() => performance.getEntriesByType('resource').filter(r => r.name.startsWith(location.origin) && !r.name.includes('.mp3')).map(r => ({url:new URL(r.name).pathname,bytes:r.encodedBodySize})));
  report.coldSelectionAndBattleBytes = report.resources.reduce((sum,r) => sum+r.bytes,0);
  assert(report.coldSelectionAndBattleBytes < 5*1024*1024, 'Initial resource budget exceeds5MiB');
  const saved = await page.evaluate(() => {
    enemy=null;currentMode='camp';player.level=20;player.attack=135;
    player.stats.invested={strength:19,wisdom:0,vitality:0,hpGain:0,mpGain:0,attackGain:115,skillGain:115};
    const weapon={id:'legacy_sword_rara',uid:'legacy-sword',type:'equipment',name:'Espada antiga',slot:'weapon',classRestriction:'Guerreiro',regionName:'Floresta',rarity:'rara',bonusAttack:17};
    const head={id:'legacy_hood_comum',uid:'legacy-hood',type:'equipment',name:'Capuz antigo',slot:'head',regionName:'Floresta',rarity:'comum',bonusMp:23};
    player.inventory=[weapon,head];player.equipment={head:{...head,uid:'equipped-head'},weapon:{...weapon,uid:'equipped-weapon'},chest:null,legs:null,feet:null,accessory:null};
    normalizePlayerState();saveCampaign();const state=getSavedCharacterState(player.characterId);state.schemaVersion=1;
    GameStorage.setItem(CHARACTER_SAVES_KEY,JSON.stringify([state]));GameStorage.setItem(SAVE_KEY,JSON.stringify(state));
    const result={id:player.characterId,stats:getPreviewStats()};player=null;return result;
  });
  await page.reload();await page.evaluate(id => continueCampaign(id),saved.id);
  const migrated = await page.evaluate(() => {
    const state=getSavedCharacterState(player.characterId),preview=getSavedCharacterPreviewStats(state);
    return {inventory:player.inventory.map(i=>i.uid),weapon:player.equipment.weapon?.bonusAttack,head:player.equipment.head?.bonusMp,actual:getPreviewStats(),preview,backup:JSON.parse(GameStorage.getItem(CHARACTER_SAVES_KEY+':backup'))[0].schemaVersion};
  });
  assert.deepEqual(migrated.inventory,['legacy-sword','legacy-hood']);assert.equal(migrated.weapon,17);assert.equal(migrated.head,23);assert.equal(migrated.backup,1);
  assert.deepEqual(migrated.actual,saved.stats);assert.equal(migrated.preview.attack,migrated.actual.attack);assert.equal(migrated.preview.maxHp,migrated.actual.maxHp);assert.equal(migrated.preview.maxMp,migrated.actual.maxMp);
  await page.evaluate(() => saveCampaign());await page.reload();await page.evaluate(id => continueCampaign(id),saved.id);
  assert.equal(await page.evaluate(() => JSON.parse(GameStorage.getItem(CHARACTER_SAVES_KEY+':backup'))[0].schemaVersion),1);
  report.checks.push({name:'legacy gear survives two reloads, migration backs up once, preview equals actual',pass:true,value:migrated});
  const production = await page.evaluate(() => {
    currentMode='camp';enemy=null;updateUI();const level=player.level;grantNextLevelForTest();
    return {levelBefore:level,levelAfter:player.level,button:document.body.innerText.includes('Teste: Proximo nivel'),dev:DEV_MODE};
  });
  assert.equal(production.button,false);assert.equal(production.levelBefore,production.levelAfter);assert.equal(production.dev,false);
  report.checks.push({name:'production hides and guards development level control',pass:true});
  // Both attribute escaping and JavaScript-string escaping are needed in inline actions.
  const escaped = await page.evaluate(() => {
    window.__importXss=0;
    const name='<img src=x onerror="window.__importXss=1">';
    const item={type:'material',id:'parte_lobo_sombrio',uid:'x\'\");window.__importXss=1;//',name,description:name};
    const box=document.createElement('div');box.innerHTML=renderInventorySlotMarkup(item)+getInventoryItemCardMarkup(item,name);document.body.appendChild(box);
    const image=box.querySelector('img[onerror]'),handler=box.querySelector('button').getAttribute('onclick');box.remove();return {image:!!image,xss:window.__importXss,handler};
  });
  assert.equal(escaped.image,false);assert.equal(escaped.xss,0);assert(escaped.handler.includes('\\\''));
  report.checks.push({name:'imported item names, tooltips and action identifiers are escaped',pass:true});
  // Simulate quota failure without touching the personal browser profile.
  await page.evaluate(() => {
    window.__realSet=Storage.prototype.setItem;window.__realRemove=Storage.prototype.removeItem;
    localStorage.setItem('qa-remove','old');
    Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};
    Storage.prototype.removeItem=function(){throw new DOMException('blocked','SecurityError');};
    player.coins=12345;saveCampaign();GameStorage.removeItem('qa-remove');
  });
  assert.equal(await page.evaluate(() => getSavedCharacterState(player.characterId).player.coins),12345);
  assert.equal(await page.evaluate(() => GameStorage.getItem('qa-remove')),null);
  assert(await page.locator('#saveStorageNotice').isVisible());
  const downloadEvent=page.waitForEvent('download');await page.evaluate(() => exportCharacterSave());const download=await downloadEvent;
  const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.state.player.coins,12345);assert.equal(exported.version,2);
  await page.evaluate(() => {Storage.prototype.setItem=window.__realSet;Storage.prototype.removeItem=window.__realRemove;});
  report.checks.push({name:'quota failure retains session save, removal and downloadable export',pass:true});
  // Import creates a separate character; it never overwrites the source save.
  page.on('dialog',d => d.accept());
  const chooserEvent=page.waitForEvent('filechooser');await page.evaluate(() => importCharacterSave());const chooser=await chooserEvent;
  await chooser.setFiles({name:'character.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
  await page.waitForFunction(() => getCharacterSaves().length===2);
  const imports=await page.evaluate(() => getCharacterSaves().map(s => ({id:s.characterId,coins:s.player.coins})));
  assert.equal(new Set(imports.map(s=>s.id)).size,2);assert(imports.some(s=>s.id===saved.id));
  report.checks.push({name:'JSON export imports as separate character with original preserved',pass:true});
  await page.evaluate(()=>restoreSaveBackup());
  const restored=await page.evaluate(()=>({count:getCharacterSaves().length,id:getCharacterSaves()[0]?.characterId,active:player}));
  assert.equal(restored.count,1);assert.equal(restored.id,saved.id);assert.equal(restored.active,null);
  report.checks.push({name:'migration backup restores saved character list',pass:true});
  await context.close();
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=await mobile.newPage();m.on('pageerror',e=>report.errors.push(e.message));
  for(const width of [390,360]){
    await m.setViewportSize({width,height:844});await m.goto(base);await m.evaluate(() => {if(!player)selectClass('Guerreiro');});await m.waitForTimeout(450);
    const battle=await m.evaluate(() => {const rect=document.querySelector('#actions button').getBoundingClientRect();return {width:innerWidth,scroll:document.documentElement.scrollWidth,actionY:rect.y,actionBottom:rect.bottom,navigation:[...document.querySelectorAll('.location-map-marker')].map(b=>({label:b.innerText,width:b.getBoundingClientRect().width}))};});
    assert(battle.scroll<=width,JSON.stringify(battle));assert(battle.actionBottom<844,JSON.stringify(battle));assert(battle.navigation.some(b=>b.label.includes('Aldeia')||b.label.includes('Vilarejo')));report.checks.push({name:`mobile${width} combat and navigation reachable in first screen`,pass:true,value:battle});
    if(width===390)await m.screenshot({path:path.join(out,'core-mobile-battle.png'),fullPage:true});
    for(const mode of ['camp','village','bestiary','trophies']){
      await m.evaluate(mode => {enemy=null;currentMode=mode;updateUI();},mode);
      const size=await m.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(size.scroll<=width,mode+JSON.stringify(size));
    }
  }
  await mobile.close();
  // An incomplete old save and a corrupt bank must not prevent opening the game.
  const partialCtx=await browser.newContext(),partial=await partialCtx.newPage();partial.on('pageerror',e=>report.errors.push(e.message));await partial.goto(base);
  const partialResult=await partial.evaluate(()=>{
    if(normalizeSavedCharacterState({player:{class:'constructor'}})!==null)throw Error('Inherited class accepted');
    const malformed=normalizeSavedCharacterState({player:{class:'Guerreiro',stats:'broken',baseStats:'broken',equipment:[],inventory:null},allocation:null,playerEffects:'broken',enemy:{name:{invalid:true},hp:'broken'}});
    GameStorage.setItem(SAVE_KEY,JSON.stringify(malformed));continueCampaign();
    if(!Number.isFinite(getPreviewStats().maxHp)||enemy!==null)throw Error('Malformed record produced invalid stats');
    enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');enemy.blizzardTurns=3;enemy.blizzardSkipChance=.4;enemy.nextDamageTakenPercent=.15;enemy.equipmentDotOwners={dotTurns:'owner'};saveCampaign();continueCampaign(player.characterId);
    if(enemy.blizzardTurns!==3||enemy.blizzardSkipChance!==.4||enemy.nextDamageTakenPercent!==.15||enemy.equipmentDotOwners.dotTurns!=='owner')throw Error('Enemy skill state lost after reload');
    player=null;
    GameStorage.removeItem(CHARACTER_SAVES_KEY);GameStorage.removeItem(SAVE_KEY);GameStorage.removeItem(ACTIVE_CHARACTER_KEY);
    GameStorage.setItem(CHARACTER_SAVES_KEY,'{broken');renderStartScreen();
    GameStorage.setItem(SAVE_KEY,JSON.stringify({player:{class:'Mago'}}));continueCampaign();
    return {class:player?.class,finite:Number.isFinite(getPreviewStats().maxHp),inventory:Array.isArray(player.inventory)};
  });
  assert.equal(partialResult.class,'Mago');assert(partialResult.finite&&partialResult.inventory);report.checks.push({name:'corrupt bank and partial legacy save recover without exception',pass:true});
  await partialCtx.close();await browser.close();server.close();
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));assert.equal(report.missingAssets.length,0,JSON.stringify(report.missingAssets));
  fs.writeFileSync(path.join(out,'core-regression-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(async error=>{console.error(error);await runningBrowser?.close();server.close();process.exitCode=1;});
