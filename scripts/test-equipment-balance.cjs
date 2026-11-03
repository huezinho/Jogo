const assert = require('node:assert/strict');
const { server, chromium } = require('../docs/qa/2026-10-27/smoke.cjs');
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium'});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:' + server.address().port);
    const result = await page.evaluate(() => {
      const check = (ok, label) => { if(!ok) throw Error(label); };
      selectClass('Guerreiro'); enemy = null; currentMode = 'village';
      player.stats.regionBossKills = Object.fromEntries(Object.keys(regions).map(r => [r, 1]));
      const E = EquipmentSystem, D = EquipmentData;
      let reflectionCases = 0;
      const reflectionRandom=Math.random;
      try{
        Math.random=()=>.99;
        for(const cls of Object.keys(classes)) for(const rarity of [null,...rarityOrder]){
          selectClass(cls); player.hp=player.maxHp=10000; playerEffects=createDefaultPlayerEffects();
          player.equipment=rarity?{accessory:E.createBossAccessory('Floresta',rarity)}:{};
          enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');
          enemy.hp=enemy.maxHp=100000; enemy.armor=0; enemy.shieldValue=0;
          const before=enemy.hp;
          const received=applyIncomingDamage(1000);
          const rate=rarity?E.createBossAccessory('Floresta',rarity).reflectPercent:0;
          check(before-enemy.hp===Math.floor(received.damage*rate),'collar reflection '+cls+' '+rarity);
          check(player.hp===10000-received.damage,'reflection does not prevent incoming damage');
          reflectionCases++;
        }
      }finally{Math.random=reflectionRandom;}
      selectClass('Guerreiro'); enemy=null; currentMode='village';
      player.stats.regionBossKills=Object.fromEntries(Object.keys(regions).map(r=>[r,1]));
      let recipeStages = 0;
      const used = new Set();
      for(const region of Object.keys(regions)) for(const slot of [...D.slots, 'accessory']) {
        if(slot!=='accessory'){
          const recipe=E.getRecipes(player,{region,slot})[0];
          check(Object.keys(recipe.requirements).length===2,'exactly two fabrication materials');
          check(Object.keys(recipe.requirements).every(id=>E.materialById(id).regionName===region),'fabrication local only');
          Object.keys(recipe.requirements).forEach(id=>used.add(id));
        }
        for(let rank=0;rank<4;rank++){
          const current=E.createItem(region,slot,'Guerreiro',rarityOrder[rank],player);
          const u=E.getUpgradeRequirements(current,player);
          check(Object.keys(u.localRequirements).length===2,'two local upgrade materials');
          check(Object.keys(u.regionalRequirements).length===3,'three band materials');
          check(Object.keys(u.requirements).length===5,'five distinct upgrade materials');
          check(Object.keys(u.localRequirements).every(id=>E.materialById(id).regionName===region),'local upgrade region');
          const band=Object.keys(regions).slice(rank*3,rank*3+3).sort();
          check(JSON.stringify(Object.keys(u.regionalRequirements).map(id=>E.materialById(id).regionName).sort())===JSON.stringify(band),'exact three-region band');
          check(Object.entries(u.requirements).every(([id,qty])=>qty===(u.localRequirements[id]||0)+(u.regionalRequirements[id]||0)),'full stage requirements');
          Object.keys(u.requirements).forEach(id=>used.add(id)); recipeStages++;
        }
      }
      check(E.allMaterials().every(m=>used.has(m.id)),'every material used');
      for(const rarity of rarityOrder.slice(0,4)){
        let last=0;
        for(const slot of ['feet','head','legs','chest','weapon']){
          const u=E.getUpgradeRequirements(E.createItem('Floresta',slot,'Guerreiro',rarity),player);
          const qty=Object.values(u.requirements).reduce((a,b)=>a+b,0);
          check(qty>last,'heavier piece costs more'); last=qty;
        }
      }
      const originalRandom=Math.random;
      try{
        for(const region of Object.keys(regions)){
          const boss={baseName:regions[region].boss.name,region,isBoss:true};
          Math.random=()=>.649999;check(E.rollDrops(boss).some(m=>m.materialTier==='primary'),'boss primary below 65%');
          Math.random=()=>.65;check(!E.rollDrops(boss).some(m=>m.materialTier==='primary'),'boss primary stops at 65%');
          Math.random=()=>.549999;check(E.rollDrops(boss).some(m=>m.materialTier==='secondary'),'boss secondary below 55%');
          Math.random=()=>.55;check(!E.rollDrops(boss).some(m=>m.materialTier==='secondary'),'boss secondary stops at 55%');
          const pool=[...regions[region].enemies,regions[region].boss].flatMap(e=>E.getMaterials(e.name,region));
          for(let i=0;i<8;i++){
            Math.random=()=> (i+.5)/8;
            const contents=getBossChestItems(region);
            check(contents.length===1&&contents[0].id===pool[i].id&&contents[0].qty===4,'all eight chest materials can repeat four times');
          }
          for(const rolls of [[0,0,1,1],[0,1,1,1],[0,2,4,7]]){
            let n=0;Math.random=()=> (rolls[n++]+.5)/8;
            const contents=getBossChestItems(region);
            check(contents.reduce((sum,m)=>sum+m.qty,0)===4,'four chest units');
            check(contents.every(m=>m.regionName===region),'chest regional materials only');
            check(contents.length===new Set(rolls).size,'chest duplicate merging');
          }
        }
        player.inventory=[];
        addInventoryItem({...createRegionChest('Floresta'),uid:'chest-test',qty:2});
        Math.random=()=>.99;openChest('chest-test');
        check(player.inventory.find(i=>i.uid==='chest-test').qty===1,'one chest consumed');
        check(player.inventory.filter(i=>i.type==='material').reduce((sum,m)=>sum+m.qty,0)===4,'four materials delivered');
        openChest('chest-test');
        check(!player.inventory.some(i=>i.uid==='chest-test'),'last chest removed');
        check(player.inventory.filter(i=>i.type==='material').reduce((sum,m)=>sum+m.qty,0)===8,'second chest adds four');
      }finally{Math.random=originalRandom;}
      let variants = 0;
      for(const [region, profile] of Object.entries(D.regionStats)) {
        check(Math.abs(Object.values(profile).reduce((a,b)=>a+b,0)-1)<1e-9, region+' proportions');
        for(const level of [1, 10, 50, 100]) {
          const actor = {...player, level};
          for(const cls of Object.keys(classes)) for(const slot of D.slots) for(const rarity of rarityOrder) {
            const item = E.createItem(region,slot,cls,rarity,actor);
            check(item && Object.values(item.stats).every(Number.isFinite), 'finite stats');
            if(slot==='weapon') check(Object.keys(item.stats).every(k=>['bonusAttack','skillPower'].includes(k)), 'offensive weapon');
            check(!('equipmentRating' in item), 'no rating');
            check(!('itemLevel' in item), 'no regional level');
            const peer=E.createItem('Floresta',slot,cls,rarity,actor);
            check(item.budget===peer.budget,'equal regional budget'); variants++;
          }
          const effects = rarityOrder.map(r=>E.createBossAccessory(region,r,actor));
          const effectKey = Object.keys(D.accessoryEffects[region])[0];
          check(effects.every((item,i)=>i===0||item[effectKey]>effects[i-1][effectKey]),region+' effect every rarity');
        }
      }
      check(D.statValues.bonusHp===D.statValues.bonusMp,'HP MP parity');
      for(const region of Object.keys(regions)) for(const rarity of rarityOrder){
        const key=Object.keys(D.accessoryEffects[region])[0],cap=D.accessoryRegionEffectCaps[region]?.[key]??D.accessoryEffectCaps[key];
        const value=Math.min(cap,D.accessoryEffects[region][key]*D.rarityFactors[rarity]*3);
        const expected=key==='flatReduction'?Math.floor(value):Math.floor(value*10000)/10000;
        check(E.createBossAccessory(region,rarity,{level:50})[key]===expected,'triple artifact factor');
      }
      const regionalGold=Object.keys(regions).map(payoutRegion=>E.contractRewards({count:4,payoutRegion},player).rewardGold);
      const deltas=regionalGold.slice(1).map((gold,i)=>gold-regionalGold[i]);
      check(deltas.every((value,i)=>i===0||value>deltas[i-1]),'accelerating regional payments');

      for(const region of Object.keys(regions)) for(const rarity of rarityOrder){
        const key=Object.keys(D.accessoryEffects[region])[0];
        check(E.createBossAccessory(region,rarity,{level:1})[key]===E.createBossAccessory(region,rarity,{level:100})[key],'special effect independent of level');
      }
      check(D.accessoryRegionEffectCaps.Paradoxo.totalDamagePercent>D.accessoryRegionEffectCaps.Citadela.totalDamagePercent,'distinct caps');
      player.level=10; player.equipment={weapon:{...E.createItem('Floresta','weapon','Guerreiro'),uid:'level-test'}};
      player.inventory=[{...E.createItem('Floresta','chest','Guerreiro'),uid:'bag-level-test'}];
      const oldPower=player.equipment.weapon.skillPower; player.xp=0;
      gainXP(getXpToNextLevel());
      check(player.level===11&&player.equipment.weapon.scaledHeroLevel===11&&player.inventory[0].scaledHeroLevel===11,'level up updates stored stats');
      check(player.equipment.weapon.skillPower>oldPower,'weapon power grows');
      levelUpPoints=0;
      const rewards=[4,10,16].map(count=>E.contractRewards({count,targetRegion:'Floresta',payoutRegion:'Floresta'},player));
      check(rewards[2].rewardGold>rewards[1].rewardGold&&rewards[1].rewardXp>rewards[0].rewardXp,'difficulty payment');
      check(E.contractRewards({count:16,payoutRegion:'Paradoxo'},player).rewardGold>rewards[2].rewardGold,'regional payment');
      currentRegion='Floresta'; player.inventory=[]; player.equipment={};
      const offer=E.refreshContracts(player).offers[0]; E.acceptContract(offer.id);
      const q=player.mercenary.active[0], payment=E.contractRewards(q,player), coinsBefore=player.coins;
      const originalGainXP=gainXP; let deliveredXP=0; gainXP=amount=>{deliveredXP+=amount; originalGainXP(amount);};
      currentRegion='Paradoxo';
      check(E.contractRewards(E.refreshContracts(player).active[0],player).rewardGold===payment.rewardGold,'accepted payout frozen across travel');
      for(let i=0;i<q.count;i++) E.recordKill({baseName:q.targetName,region:q.targetRegion},player);
      check(player.coins===coinsBefore+payment.rewardGold,'contract gold paid');
      const paid=player.coins; E.collectCompletedContracts(player); check(player.coins===paid,'reward exactly once');
      check(deliveredXP===payment.rewardXp,'exactly one XP payment'); gainXP=originalGainXP; currentRegion='Floresta';

      check(JSON.stringify(D.slotWeights)===JSON.stringify({weapon:1.2,chest:1,head:.6,legs:.8,feet:.5}),'weights');
      check(JSON.stringify(Object.values(D.rarityFactors))===JSON.stringify([1,1.5,2,3,4]),'rarities');
      player.level = 10;
      player.equipment = {chest:{...E.createItem('Caverna','chest','Guerreiro'),uid:'armor'}};
      const low = getPassiveModifiers().armorFlatReduction;
      player.level = 100;
      const high = getPassiveModifiers().armorFlatReduction;
      check(high > low,'equipped armor grows without recreation');
      check(formatStatBonusList(player.equipment.chest).includes('resistencia fixa'),'current stats visible');
      player.equipment = Object.fromEntries(['head','chest','legs','feet'].map(slot=>[slot,{...E.createItem('Caverna',slot,'Guerreiro','lendaria'),uid:slot}]));
      const raw = Object.values(player.equipment).reduce((sum,item)=>sum+item.flatReduction,0);
      const setIds=Object.values(player.equipment).map(i=>i.setId);
      Object.values(player.equipment).forEach(i=>i.setId=null);
      const general=getPassiveModifiers().flatReduction;
      Object.values(player.equipment).forEach((i,n)=>i.setId=setIds[n]);
      check(getPassiveModifiers().flatReduction===Math.floor(general*1.08),'stone set general reduction');
      player.hp = 10000; playerEffects = createDefaultPlayerEffects();
      const reduction = getPassiveModifiers().flatReduction;
      const incoming = applyIncomingDamage(1000,{ignoreDodge:true});
      check(incoming.damage===1000-reduction,'fixed damage calculation');
      check(applyIncomingDamage(1,{ignoreDodge:true}).damage===0,'no negative damage');
      player.inventory = []; player.equipment = {}; player.coins = 10000000;
      const recipe = E.getRecipes(player,{region:'Floresta',slot:'chest'})[0];
      check(recipe.cost>=300,'higher crafting coin price');
      for(const [id,qty] of Object.entries(recipe.requirements)) addInventoryItem({...E.materialById(id),qty});
      const crafted = E.craft(recipe.id); check(crafted.rarity==='comum','craft common');
      player.equipment.chest = crafted;
      for(let i=0;i<4;i++) {
        const u=E.getUpgradeRequirements(player.equipment.chest,player);
        for(const [id,qty] of Object.entries(u.requirements)) addInventoryItem({...E.materialById(id),qty});
        const coins=player.coins; check(E.tryUpgrade('chest'),'armor upgrade');
        check(player.coins===coins-u.cost,'exact armor cost');
      }
      check(player.equipment.chest.rarity==='lendaria','complete chain');
      player.inventory=[]; player.equipment={accessory:{...E.createBossAccessory('Floresta','ultra_rara'),uid:'artifact'}};
      const item=player.equipment.accessory, u=E.getUpgradeRequirements(item,player);
      for(const [id,qty] of Object.entries(u.requirements)) addInventoryItem({...E.materialById(id),qty});
      const before=JSON.stringify(player); check(!E.tryUpgrade('accessory'),'missing copy rejected');
      check(JSON.stringify(player)===before,'failure atomic');
      addInventoryItem({...E.createBossAccessory('Caverna','comum'),uid:'wrong'});
      check(!E.canUpgrade(item,player),'wrong region rejected');
      addInventoryItem({...E.createBossAccessory('Floresta','incomum'),uid:'wrong-rarity'});
      check(!E.canUpgrade(item,player),'wrong rarity rejected');
      addInventoryItem({...E.createBossAccessory('Floresta','comum'),uid:'sacrifice',qty:2});
      updateUI();
      const coins=player.coins;
      check(E.tryUpgrade('accessory'),'artifact upgrade');
      check(player.equipment.accessory.rarity==='lendaria'&&player.equipment.accessory.uid==='artifact','identity preserved');
      check(player.inventory.find(i=>i.uid==='sacrifice').qty===1,'exactly one copy consumed');
      check(player.coins===coins-u.cost,'exact artifact coins');
      check(Object.entries(u.requirements).every(([id])=>getInventoryCountById(id)===0),'exact artifact materials');
      // Inventory promotion: consuming components and the copy may move its index.
      player.equipment={}; player.inventory=[];
      addInventoryItem({...E.createBossAccessory('Floresta','comum'),uid:'copy'});
      addInventoryItem({...E.createBossAccessory('Floresta','ultra_rara'),uid:'bag-target',qty:2});
      const bag=player.inventory.find(i=>i.uid==='bag-target');
      for(const [id,qty] of Object.entries(E.getUpgradeRequirements(bag,player).requirements)) addInventoryItem({...E.materialById(id),qty});
      check(E.tryUpgrade('bag-target'),'stacked inventory upgrade');
      check(player.inventory.find(i=>i.uid==='bag-target').qty===1,'one stacked target consumed');
      check(player.inventory.some(i=>i.slot==='accessory'&&i.rarity==='lendaria'),'new legendary in bag');
      check(!player.inventory.some(i=>i.uid==='copy'),'copy removed');
      player.equipment.chest={...E.createItem('Floresta','chest','Guerreiro'),uid:'saved'};
      saveCampaign();
      const examples=[['Floresta','chest','lendaria',50],['Caverna','chest','rara',50],['Abismo','weapon','rara',50],['Paradoxo','accessory','lendaria',50],['Citadela','accessory','lendaria',50],['Floresta','chest','lendaria',100]].map(([region,slot,rarity,level])=>({region,slot,rarity,level,stats:E.createItem(region,slot,'Guerreiro',rarity,{level}).stats}));
      return {variants,reflectionCases,recipeStages,low,high,recipeCost:recipe.cost,artifactCost:u.cost,examples};
    });
    await page.reload();
    await page.evaluate(()=>continueCampaign());
    assert(await page.evaluate(()=>EquipmentSystem.normalizeItem(player.equipment.chest).scaledHeroLevel===player.level));
    await page.evaluate(()=>{
      enemy=null; currentMode='village'; villageTab='forge'; player.coins=10000000;
      levelUpPoints=0; allocation={strength:0,wisdom:0,vitality:0};
      player.subclassChoices={tier30:'cavaleiro',tier60:'paladino'};
      player.inventory=[]; player.equipment={accessory:{...EquipmentSystem.createBossAccessory('Floresta','ultra_rara'),uid:'ui-target'}};
      const upgrade=EquipmentSystem.getUpgradeRequirements(player.equipment.accessory,player);
      for(const [id,qty] of Object.entries(upgrade.requirements)) addInventoryItem({...EquipmentSystem.materialById(id),qty});
      updateUI();
    });
    assert(await page.locator('[data-hud="upgrade"]').isDisabled());
    assert((await page.locator('.rpg-artifact-copy').innerText()).includes('0 / 1'));
    await page.evaluate(()=>{addInventoryItem({...EquipmentSystem.createBossAccessory('Floresta','comum'),uid:'ui-copy'});updateUI();});
    assert(await page.locator('[data-hud="upgrade"]').isEnabled());
    await page.locator('[data-hud="upgrade"]').click();
    assert(await page.evaluate(()=>player.equipment.accessory.rarity==='lendaria'&&!player.inventory.some(i=>i.uid==='ui-copy')));
    for(const width of [1366,390,320]) {
      await page.setViewportSize({width,height:900});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'workshop overflow '+width);
    }
    assert.deepEqual(errors,[]);
    console.log('PASS equipment balance',JSON.stringify(result,null,2));
  } finally { await browser.close(); server.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
