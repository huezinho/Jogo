const fs=require('node:fs'),assert=require('node:assert/strict');
const{server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],missing=[],checks=[];
 try{
  const p=await browser.newPage({viewport:{width:1366,height:900}});
  p.on('pageerror',e=>errors.push(e.stack));p.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await p.goto('http://127.0.0.1:'+server.address().port+'/dungeon.html');
  await p.evaluate(()=>{
   const s=DungeonRogue.lobby('base-interface');
   for(const[c,i]of['Guerreiro','Mago','Arqueiro'].map((c,i)=>[c,i])){const h=DungeonRogue.addHero(s,{className:c,owner:i?'guest'+i:'local',name:['Arthur','Merlin','Robin'][i]});h.offline=!!i;}
   DungeonRogue.start(s);s.party.forEach(h=>h.place='camp');
   const h=s.party[0];h.coins=10000;h.hp=60;h.mp=30;
   for(const slot of EquipmentData.slots){const i=EquipmentSystem.createItem('Floresta',slot,h.class,'comum',h);i.uid='ui-'+slot;h.inventory.push(i);}
   RogueApp.load(s);
  });
  assert.equal(await p.locator('.journey-top,.journey-region,#tradeTarget,#tradeItem').count(),0);
  const bounds=await p.evaluate(()=>{const rect=c=>{const r=document.querySelector(c).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};return {rail:rect('.base-locations'),main:rect('.base-main'),map:rect('.base-map'),bag:rect('.base-bag-button'),coins:rect('.base-coins')};});
  assert(bounds.rail.right<=bounds.main.x+1);assert(bounds.bag.x>=bounds.main.right-1);assert(bounds.coins.y>=bounds.bag.bottom);checks.push('left map, campaign bag and coin counter on right, no former header');
  // Profile and trade begin by clicking an actual companion in the camp scene.
  await p.locator('[data-action=basePerson]').first().click();
  assert(await p.locator('[data-action=baseProfile]').isVisible());assert(await p.locator('[data-action=baseTrade]').isVisible());
  await p.locator('[data-action=baseProfile]').click();assert(await p.locator('#rogueDialog').isVisible());assert((await p.locator('#rogueDialog').innerText()).includes('Merlin'));await p.locator('[data-action=closeModal]').click();
  await p.locator('[data-action=basePerson]').first().click();await p.locator('[data-action=baseTrade]').click();
  await p.locator('[data-action=baseBagItem][data-uid=ui-weapon]').click();await p.locator('#baseTradeCoins').fill('10');await p.locator('[data-action=baseOffer]').click();
  const offered=await p.evaluate(()=>RogueApp.state());assert.equal(offered.trades[0].uid,'ui-weapon');assert.equal(offered.trades[0].coins,10);assert.equal(offered.party[0].coins,9990);assert(offered.party[0].inventory.some(i=>i.uid==='ui-weapon'));checks.push('companion → profile/trade → backpack → item and coins offered, not transferred');
  await p.screenshot({path:'docs/hud/dungeon-base-trade-1366.png',fullPage:true});await p.locator('[data-action=baseClose]').click();
  // Empty equipment slots open the filtered backpack, and equipping updates the sheet.
  await p.locator('[data-action=baseEquipment][data-slot=head]').click();await p.locator('[data-action=baseChooseEquipment]').click();
  assert.equal(await p.locator('[data-action=baseBagItem]').count(),1);await p.locator('[data-action=baseBagItem][data-uid=ui-head]').click();await p.locator('[data-action=equip]').click();
  assert.equal(await p.evaluate(()=>RogueApp.state().party[0].equipment.head.uid),'ui-head');await p.locator('[data-action=baseClose]').click();checks.push('empty slot → filtered backpack → equip');
  await p.locator('.base-bag-button').click();const size1=await p.locator('#rogueDialog').boundingBox();await p.locator('[data-action=baseFilter][data-value=potions]').click();const size2=await p.locator('#rogueDialog').boundingBox();assert.equal(size1.width,size2.width);assert.equal(size1.height,size2.height);await p.screenshot({path:'docs/hud/dungeon-base-bag-1366.png',fullPage:true});await p.locator('[data-action=baseClose]').click();checks.push('fixed backpack size across filters');
  async function visit(place){const pcts={hall:[.5,.23],forge:[.28,.52],camp:[.65,.78]};const map=await p.locator('.base-map').boundingBox();await p.mouse.click(map.x+map.width*pcts[place][0],map.y+map.height*pcts[place][1]);await p.waitForFunction(place=>RogueApp.state().party[0].place===place,place);}
  await visit('forge');await p.locator('[data-action=baseForgeItem][data-uid=ui-head]').click();const before=await p.evaluate(()=>RogueApp.state().party[0].coins);await p.locator('[data-action=upgrade]').click();assert.equal(await p.evaluate(()=>RogueApp.state().party[0].equipment.head.rarity),'incomum');assert(await p.evaluate(()=>RogueApp.state().party[0].coins)<before);checks.push('map hit area → forge → improve equipped item');
  await p.screenshot({path:'docs/hud/dungeon-base-forge-equipped-1366.png',fullPage:true});
  await p.locator('.base-bag-button').click();await p.locator('[data-action=baseBagItem][data-uid=ui-legs]').click();await p.locator('[data-action=sell]').click();await p.locator('[data-action=baseClose]').click();assert(!(await p.evaluate(()=>RogueApp.state().party[0].inventory)).some(i=>i.uid==='ui-legs'));checks.push('forge sells selected backpack item');
  await visit('camp');await p.locator('[data-action=rest]').click();assert(await p.evaluate(()=>{const s=RogueApp.state(),h=s.party[0],c=DungeonRogue.stats(s,h);return h.hp===c.maxHp&&h.mp===c.maxMp;}));checks.push('camp rest restores both resources');
  await p.locator('.base-bag-button').click();await p.locator('[data-action=cancelTrade]').click();await p.locator('[data-action=baseClose]').click();checks.push('cancelled offer releases item and refunds coins');
  const baseState=await p.evaluate(()=>RogueApp.state());
  for(const type of ['alchemist','vendor']){
   await p.evaluate(({baseState,type})=>{const s=DungeonRogue.copy(baseState);s.node=type==='alchemist'?3:5;s.party.forEach(h=>{h.place='hall';h.ready=true;});RogueApp.load(DungeonRogue.transition(s,'local',{kind:'hunt'}));},{baseState,type});
   assert.equal(await p.locator('[data-action=baseOfferItem]').count(),4);await p.locator('[data-action=baseOfferItem]').nth(2).click();const before=await p.evaluate(()=>RogueApp.state());await p.locator('[data-action=buy]').click();const after=await p.evaluate(()=>RogueApp.state());assert(after.shop[2].sold);assert.equal(after.party[0].coins,before.party[0].coins-before.shop[2].price);assert.equal(after.party[0].inventory.length,before.party[0].inventory.length+1);assert.equal(after.party[1].coins,before.party[1].coins);assert(await p.locator('[data-action=buy]').isDisabled());checks.push(type+' selected offer purchase uses individual wallet');
  }
  await p.evaluate(baseState=>{const s=DungeonRogue.copy(baseState);s.node=1;s.party.forEach(h=>{h.place='hall';h.ready=true;});RogueApp.load(DungeonRogue.transition(s,'local',{kind:'hunt'}));},baseState);await p.locator('#betValue').fill('3');const stake=await p.evaluate(()=>RogueApp.state().party[0].coins);await p.locator('[data-action=bet]').click();assert.equal(Math.abs(await p.evaluate(()=>RogueApp.state().party[0].coins)-stake),3);assert(await p.locator('[data-action=bet]').isDisabled());checks.push('gambler stake and completed choice');await p.evaluate(s=>RogueApp.load(s),baseState);
  for(const place of ['camp','hall','forge']){
   await p.setViewportSize({width:1366,height:900});await visit(place);
   for(const width of[1366,768,390,320]){await p.setViewportSize({width,height:900});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),place+' overflow '+width);checks.push(place+' fits '+width);if(width===1366||width===390)await p.screenshot({path:`docs/hud/dungeon-base-${place}-${width}.png`,fullPage:true});}
  }
  await p.setViewportSize({width:320,height:900});await visit('camp');checks.push('mobile full-map hit area selects camp');
  await p.locator('.base-bag-button').click();await p.locator('[data-action=baseFilter][data-value=potions]').click();await p.locator('[data-action=baseBagItem]').first().click();assert(await p.evaluate(()=>{const r=document.getElementById('rogueDialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}));await p.screenshot({path:'docs/hud/dungeon-base-bag-320.png',fullPage:true});checks.push('mobile backpack fits viewport');
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(missing)],[]);
  fs.writeFileSync('docs/qa/dungeon-base-ui.json',JSON.stringify({checks,errors,missing},null,2));console.log('PASS',checks.length,'base interface flows, map navigation, profile/trade, backpack, equipment, forge and rest');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
