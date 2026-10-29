const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
let nextUid=0;
const context=vm.createContext({console,Date,Math:Object.create(Math),window:{},currentMode:'village',isDead:false,isProcessingTurn:false,log(){},updateUI(){},saveCampaign(){}});
context.getCurrentCaps=()=>({maxHp:context.player.maxHp,maxMp:context.player.maxMp});
context.getActiveAttack=()=>100;context.getSkillPowerBonus=()=>100;
context.addInventoryItem=item=>{const entry={...item,uid:item.uid||`qa_${++nextUid}`,qty:item.qty||1};const existing=context.player.inventory.find(x=>x.id===entry.id);if(existing){existing.qty+=entry.qty;return existing;}context.player.inventory.push(entry);return entry;};
for(const name of ['assets/js/data/system-data.js','assets/js/data/world-data.js','assets/js/data/equipment-data.js','assets/js/systems/equipment-system.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name});
const es=vm.runInContext('EquipmentSystem',context),data=vm.runInContext('EquipmentData',context),regions=vm.runInContext('regions',context);
const names=Object.keys(regions),tests=[];
function fresh(){context.player={characterId:'qa_hero',class:'Guerreiro',level:100,maxHp:1000,hp:500,maxMp:1000,mp:1000,attack:100,coins:100000,stats:{regionBossKills:{},craftedEquipment:0},inventory:[],equipment:{},mercenary:null};return context.player;}
function run(name,fn){fn();tests.push({name,pass:true});console.log('PASS '+name);}
function equip(region,count=5){const actor=fresh();data.slots.slice(0,count).forEach((slot,i)=>{actor.equipment[slot]={...es.createItem(region,slot,actor.class,'ofensivo','rara'),uid:'slot_'+i};});return actor;}
function effectContext(region){const actor=equip(region),effects={shieldValue:0},enemy={hp:10000,maxHp:10000,shieldValue:0,armorDownPercent:0};let procDamage=0;
const callbacks={damage(n){procDamage+=n;enemy.hp-=n;return n;},shield(n){effects.shieldValue+=n;return n;},heal(n){const before=actor.hp;actor.hp=Math.min(actor.maxHp,actor.hp+n);return actor.hp-before;}};
const begin=(type='skill_a',kind='skill')=>es.beginAction(actor,effects,{kind,skill:{id:type,type},enemy,callbacks,power:200,maxHp:1000,maxMp:1000});
const hit=n=>es.afterDamage(actor,effects,enemy,{damage:n,kind:'direct'}),end=()=>es.endAction(actor,effects,{enemy});
return {actor,effects,enemy,begin,hit,end,get procDamage(){return procDamage;}};}

run('all48enemies-have-two-materials-and-primary-ids-preserved',()=>{assert.equal(es.allMaterials().length,96);assert.equal(new Set(es.allMaterials().map(x=>x.id)).size,96);assert.equal(es.getMaterials('Lobo Sombrio','Floresta')[0].id,'parte_lobo_sombrio');});
run('4800canonical-items-fit-budget-and-network-rebuilds-stats',()=>{let count=0;for(const region of names)for(const cls of Object.keys(data.weaponNames))for(const slot of data.slots)for(const profile of Object.keys(data.profiles))for(const rarity of Object.keys(data.rarityFactors)){const item=es.createItem(region,slot,cls,profile,rarity);assert.ok(item);assert.ok(item.itemLevel<=100);const spent=Object.entries(item.stats).reduce((s,[key,value])=>s+value/data.statValues[key],0);assert.ok(spent<=item.budget+.02);item.bonusAttack=999999;const safe=es.sanitizeNetworkItem(item,cls);assert.ok(safe);assert.notEqual(safe.bonusAttack,999999);count++;}assert.equal(count,4800);assert.equal(es.sanitizeNetworkItem(es.createItem('Floresta','weapon','Guerreiro'),'Mago'),null);});
run('legacy-normalization-is-nondestructive',()=>{const item={type:'equipment',slot:'weapon',bonusAttack:999};assert.equal(es.normalizeItem(item),null);assert.equal(item.bonusAttack,999);});
run('recipe-visibility-and-atomic-craft-enforce-region-and-all-ingredients',()=>{const a=fresh();const recipes=es.getRecipes(a);assert.equal(recipes.length,100);assert.ok(recipes.every(x=>x.region==='Floresta'));const locked=es.createItem('Caverna','weapon','Guerreiro','ofensivo','rara');assert.equal(es.craft(`${locked.templateId}|ofensivo|rara`),false);const r=recipes.find(x=>x.slot==='weapon'&&x.profile==='ofensivo'&&x.rarity==='rara');const before=a.coins;assert.equal(es.craft(r.id),false);assert.equal(a.coins,before);for(const[id,qty]of Object.entries(r.requirements))context.addInventoryItem({...es.materialById(id),qty});assert.ok(es.craft(r.id));assert.equal(a.coins,before-r.cost);assert.equal(a.stats.craftedEquipment,1);assert.ok(a.inventory.some(x=>x.schemaVersion===2));assert.equal(es.craft(r.id),false);});
run('all-unlocked-recipes-foreign-materials-within-next-two-regions',()=>{for(let highest=0;highest<12;highest++){const a=fresh();for(let i=0;i<highest;i++)a.stats.regionBossKills[names[i]]=1;for(const r of es.getRecipes(a))for(const id of Object.keys(r.requirements)){const material=es.materialById(id);assert.ok(material);assert.ok(names.indexOf(material.regionName)<=Math.min(11,highest+2));}}});
run('all96-drops-used-by-crafting-and-strong-rarities-require-both-boss-components',()=>{
 const a=fresh();for(const region of names)a.stats.regionBossKills[region]=1;
 const recipes=es.getRecipes(a),used=new Set(recipes.flatMap(recipe=>Object.keys(recipe.requirements)));
 assert.equal(used.size,96);assert.equal(es.allMaterials().filter(material=>!used.has(material.id)).length,0);
 for(const region of names){
  const boss=es.getMaterials(regions[region].boss.name,region);
  for(const recipe of recipes.filter(recipe=>recipe.region===region)){
   if(['ultra_rara','lendaria'].includes(recipe.rarity)){assert.ok(recipe.requirements[boss[0].id]>0);assert.ok(recipe.requirements[boss[1].id]>0);}
  }
  for(const profile of Object.keys(data.profiles))for(const slot of data.slots){
   const item=es.createItem(region,slot,a.class,profile,'ultra_rara'),up=es.getUpgradeRequirements(item,a);
   assert.ok(up.requirements[boss[1].id]>0);assert.ok(Object.values(up.requirements).every(qty=>qty>0));
  }
 }
});
run('mercenary-rotates-keeps-active-and-claims-once-with-foreign-reward',()=>{const a=fresh(),now=Date.now(),board=es.refreshContracts(a,now);assert.equal(board.offers.length,6);assert.ok(board.offers.every(x=>x.targetRegion==='Floresta'&&x.rewardRegion!=='Floresta'));assert.ok(board.offers.some(x=>x.rewardRegion==='Caverna'));assert.ok(board.offers.some(x=>x.rewardRegion==='Ruinas'));const offer=board.offers[0];const reward=offer.rewardIds[1];assert.equal(es.acceptContract(offer.id,reward),true);for(let i=0;i<offer.count;i++)es.recordKill({baseName:offer.targetName,region:offer.targetRegion},a);es.refreshContracts(a,now+data.boardIntervalMs);assert.equal(a.mercenary.active[0].progress,offer.count);const first=es.claimContract(offer.id);assert.ok(first);const inventoryQty=a.inventory.find(x=>x.id===reward).qty;assert.equal(es.claimContract(offer.id),false);assert.equal(a.inventory.find(x=>x.id===reward).qty,inventoryQty);assert.equal(a.stats.mercenaryContracts,1);});
run('mercenary-state-survives-json-and-respects-unlocked-targets',()=>{const a=fresh();a.stats.regionBossKills.Floresta=1;const board=es.refreshContracts(a);assert.ok(board.offers.every(x=>['Floresta','Caverna'].includes(x.targetRegion)));es.acceptContract(board.offers[0].id,board.offers[0].rewardIds[0]);const id=a.mercenary.active[0].id;context.player=JSON.parse(JSON.stringify(a));es.normalizePlayer(context.player);assert.equal(context.player.mercenary.active[0].id,id);});
run('imported-contracts-rebuild-offers-reject-injection-and-canonicalize-rewards',()=>{
 const a=fresh(),board=es.refreshContracts(a),offer=board.offers[0];
 assert.equal(es.acceptContract(offer.id,offer.rewardIds[0]),true);
 const good=JSON.parse(JSON.stringify(a.mercenary.active[0]));
 a.mercenary.offers=[{id:'" onfocus="alert(1)',rewardIds:['missing']}];
 a.mercenary.active=[{...good,id:"');alert(1);//"},{...good,rewardQty:999},good,{...good,id:'contract_1_1_0',targetRegion:'Paradoxo'}];
 a.mercenary.claimed=['" onclick="alert(1)'];
 const state=es.refreshContracts(a);
 assert.equal(state.offers.length,6);assert.ok(state.offers.every(x=>/^contract_\d+_\d+_[0-5]$/.test(x.id)));
 assert.equal(state.active.length,1);assert.equal(state.active[0].id,good.id);assert.equal(state.active[0].rewardQty,3);assert.equal(state.claimed.length,0);
});
run('all60-new-boss-accessories-canonical-bounded-and-outside-crafting-sets',()=>{
 const a=fresh();for(const region of names)for(const rarity of Object.keys(data.rarityFactors)){
  const item=es.createBossAccessory(region,rarity);assert.equal(item.schemaVersion,2);assert.equal(item.slot,'accessory');assert.equal(item.setId,null);
  for(const[key,cap]of Object.entries(data.accessoryEffectCaps))assert.ok(!(item[key]>cap));
  assert.deepEqual(JSON.parse(JSON.stringify(es.normalizeItem({...item,totalDamagePercent:1e10}))),JSON.parse(JSON.stringify({...item,qty:1})));
 }
 assert.ok(es.getRecipes(a).every(recipe=>recipe.slot!=='accessory'));
});
run('v2-forge-requires-next-rarity-foreign-material-delta',()=>{const a=fresh();a.equipment.weapon={...es.createItem('Floresta','weapon',a.class,'ofensivo','incomum'),uid:'weapon'};const upgrade=es.getUpgradeRequirements(a.equipment.weapon,a);assert.ok(Object.keys(upgrade.requirements).some(id=>es.materialById(id).regionName==='Caverna'));const coins=a.coins;assert.equal(es.tryUpgrade('weapon'),false);assert.equal(a.coins,coins);for(const[id,qty]of Object.entries(upgrade.requirements))context.addInventoryItem({...es.materialById(id),qty});assert.ok(es.tryUpgrade('weapon'));assert.equal(a.equipment.weapon.rarity,'rara');assert.equal(a.coins,coins-upgrade.cost);});
run('partial2-4-5-bonuses-and-accessory-exclusion',()=>{let a=equip('Floresta',2);assert.equal(es.getSetBonuses(a).bonuses.bonusMpPercent,.06);assert.equal(es.getSetBonuses(a).activeSets.length,0);a=equip('Floresta',4);assert.equal(es.getSetBonuses(a).bonuses.dotDamagePercent,.08);a.equipment.accessory={...es.createItem('Floresta','feet',a.class),slot:'accessory'};assert.equal(es.getSetBonuses(a).activeSets.length,0);a=equip('Floresta',5);assert.equal(es.getSetBonuses(a).activeSets.length,1);});
run('Floresta5-after-three-dot-actions-boosts-once',()=>{const x=effectContext('Floresta');for(let i=0;i<3;i++){x.begin('nature_decay');x.enemy.natureDecayDamage=50;x.enemy.natureDecayTurns=4;es.noteDotApplication(x.actor,x.effects,x.enemy,['natureDecayTurns']);x.end();}assert.equal(es.modifyHealing(x.actor,x.effects,100),120);assert.equal(es.modifyHealing(x.actor,x.effects,100),100);});
run('freeze-without-dot-application-cannot-steal-ownership-or-progress-forest',()=>{
 const x=effectContext('Floresta');x.enemy.dotTurns=5;x.enemy.dotDamagePerTurn=123;x.enemy.equipmentDotOwners={dotTurns:'other-character'};x.enemy.equipmentDotExtensions={dotTurns:2};
 for(let i=0;i<3;i++){x.begin('mage_freeze');x.enemy.skipTurns=1;x.hit(50);x.end();}
 assert.equal(x.enemy.equipmentDotOwners.dotTurns,'other-character');assert.equal(x.enemy.equipmentDotExtensions.dotTurns,2);assert.equal(x.effects.equipmentRuntime.dotActions||0,0);assert.equal(x.effects.equipmentRuntime.forestReady||false,false);
});
run('actual-dot-application-only-claims-declared-channel-and-counts-once-per-action',()=>{
 const x=effectContext('Floresta');x.enemy.dotTurns=5;x.enemy.dotDamagePerTurn=123;x.enemy.equipmentDotOwners={dotTurns:'other-character'};
 x.begin('nature_decay');x.enemy.natureDecayDamage=40;x.enemy.natureDecayTurns=4;es.noteDotApplication(x.actor,x.effects,x.enemy,['natureDecayTurns']);es.noteDotApplication(x.actor,x.effects,x.enemy,['natureDecayTurns']);x.end();
 assert.equal(x.enemy.equipmentDotOwners.dotTurns,'other-character');assert.equal(x.enemy.equipmentDotOwners.natureDecayTurns,x.actor.characterId);assert.equal(x.effects.equipmentRuntime.dotActions,1);
});
run('no-shield-status-blocks-set-fallback-before-first-action',()=>{
 const actor=equip('Caverna'),effects={shieldValue:0};actor.noShieldTurns=5;
 for(let i=0;i<3;i++)es.afterIncoming(actor,effects,{hp:100},{damage:10});assert.equal(effects.shieldValue,0);
});
run('Caverna5-shield-on-third-hit-with-cooldown',()=>{const x=effectContext('Caverna');x.begin();for(let i=0;i<3;i++)es.afterIncoming(x.actor,x.effects,x.enemy,{damage:50,absorbed:0});assert.equal(x.effects.shieldValue,80);for(let i=0;i<3;i++)es.afterIncoming(x.actor,x.effects,x.enemy,{damage:50,absorbed:0});assert.equal(x.effects.shieldValue,80);});
run('Ruinas4-5-action-wide-bonus-and-bounded-echo',()=>{const x=effectContext('Ruinas');x.begin('a');x.end();x.begin('b');x.end();x.begin('c');for(let i=0;i<13;i++)x.hit(10);x.end();assert.equal(x.procDamage,Math.floor(130*.08)+Math.floor(130*.25));});
run('Pantano5-applies-existing-poison-channel-once',()=>{const x=effectContext('Pantano');x.enemy.dotTurns=3;x.enemy.dotDamagePerTurn=20;x.enemy.equipmentDotOwners={dotTurns:'other-character'};x.begin();x.hit(100);x.end();assert.equal(x.enemy.naturePoisonDamage,24);assert.equal(x.enemy.naturePoisonTurns,2);assert.equal(x.enemy.equipmentDotOwners.naturePoisonTurns,x.actor.characterId);assert.equal(x.enemy.equipmentDotOwners.dotTurns,'other-character');});
run('Vulcao4-5-periodic-target-bonus-and-third-offensive-burn',()=>{const x=effectContext('Vulcao');x.enemy.dotTurns=2;x.enemy.dotDamagePerTurn=5;x.enemy.natureDecayTurns=4;x.enemy.natureDecayDamage=40;x.enemy.equipmentDotOwners={natureDecayTurns:'other-character'};for(let i=0;i<3;i++){x.begin('s'+i);x.hit(100);x.end();}assert.ok(x.procDamage>=24);assert.equal(x.enemy.dotDamagePerTurn,30);assert.ok(x.enemy.dotTurns>=2);assert.equal(x.enemy.equipmentDotOwners.dotTurns,x.actor.characterId);assert.equal(x.enemy.equipmentDotOwners.natureDecayTurns,'other-character');});
run('Abismo4-5-penetration-and-next-action-bonus',()=>{const x=effectContext('Abismo');assert.equal(es.getArmorPenetration(x.actor,x.effects),.15);x.begin();x.enemy.armorDownPercent=.5;x.end();x.begin('b');x.hit(100);x.end();assert.equal(x.procDamage,15);});
run('Fortaleza4-5-absorption-stores-bounded-retaliation',()=>{const x=effectContext('Fortaleza');assert.equal(es.modifyShield(x.actor,x.effects,100),110);es.afterIncoming(x.actor,x.effects,x.enemy,{damage:0,absorbed:1000});x.begin();x.hit(100);x.end();assert.equal(x.procDamage,120);});
run('Necropole2-4-5-heals-dot-and-extends-only-owned-dots',()=>{const x=effectContext('Necropole');assert.equal(es.getDotDamageMultiplier(x.actor),1.08);x.begin('nature_swamp_collapse');x.enemy.natureMarkDamage=x.enemy.naturePoisonDamage=x.enemy.natureDecayDamage=10;x.enemy.natureMarkTurns=x.enemy.naturePoisonTurns=x.enemy.natureDecayTurns=4;es.noteDotApplication(x.actor,x.effects,x.enemy,['natureMarkTurns','naturePoisonTurns','natureDecayTurns']);x.end();assert.equal(x.enemy.natureMarkTurns,5);const hp=x.actor.hp;es.afterDamage(x.actor,x.effects,x.enemy,{damage:1000,source:'dot'});assert.equal(x.actor.hp-hp,20);es.afterDamage(x.actor,x.effects,x.enemy,{damage:1000,source:'dot'});assert.equal(x.actor.hp-hp,20);});
run('Citadela2-4-5-critical-prepares-next-skill-penetration',()=>{const x=effectContext('Citadela');assert.equal(es.getSetBonuses(x.actor).bonuses.critChanceBonus,.04);assert.equal(es.getSetBonuses(x.actor).bonuses.critDamageBonus,.1);x.begin();es.markCritical(x.actor,x.effects);x.hit(100);x.end();x.begin('next');assert.equal(es.getArmorPenetration(x.actor,x.effects),.2);x.hit(100);x.end();x.begin('last');assert.equal(es.getArmorPenetration(x.actor,x.effects),0);});
run('Panteao4-5-effective-primary-support-only',()=>{const x=effectContext('Panteao');for(let i=0;i<3;i++){x.begin('heal'+i);es.noteHealing(x.actor,x.effects,10);x.end();}x.begin('hit');x.hit(100);x.end();assert.equal(x.procDamage,40);const state=x.effects.equipmentRuntime;assert.equal(state.supportActions,0);x.begin('basic','basic');es.noteHealing(x.actor,x.effects,100);es.modifyShield(x.actor,x.effects,100);x.end();assert.equal(state.supportActions,0);});
run('ally-shield-records-only-actual-source-support-and-heal-target-can-consume-forest',()=>{
 const x=effectContext('Panteao');x.begin('ally_shield');assert.equal(es.modifyShield(x.actor,x.effects,100,{track:false}),110);assert.equal(x.effects.equipmentRuntime.current.shielded,0);
 es.noteShield(x.actor,x.effects,40);assert.equal(x.effects.equipmentRuntime.current.shielded,40);x.end();assert.equal(x.effects.equipmentRuntime.supportActions,1);
 x.begin('basic','basic');es.noteShield(x.actor,x.effects,100);x.end();assert.equal(x.effects.equipmentRuntime.supportActions,1);
 const f=effectContext('Floresta');f.actor.hp=f.actor.maxHp;f.effects.equipmentRuntime={forestReady:true};assert.equal(es.modifyHealing(f.actor,f.effects,100,{canHeal:true}),120);assert.equal(f.effects.equipmentRuntime.forestReady,false);
 f.actor.hp=1;f.effects.equipmentRuntime.forestReady=true;assert.equal(es.modifyHealing(f.actor,f.effects,100,{canHeal:false}),100);assert.equal(f.effects.equipmentRuntime.forestReady,true);
});
run('Cataclismo4-5-hp-payment-generates-capped-shield',()=>{const x=effectContext('Cataclismo');x.actor.hp=300;x.begin();es.noteHpCost(x.actor,x.effects,400);x.hit(100);x.end();assert.equal(x.effects.shieldValue,120);assert.equal(x.procDamage,10);});
run('Paradoxo4-5-three-distinct-skills-discount-once',()=>{const x=effectContext('Paradoxo');for(const skill of ['a','b','c']){x.begin(skill);x.end();}assert.equal(es.modifySkillCost(x.actor,x.effects,{type:'ordinary'},100),85);assert.equal(es.modifySkillCost(x.actor,x.effects,{type:'nature_true_form'},100),100);x.begin('d');x.hit(100);x.end();assert.equal(es.modifySkillCost(x.actor,x.effects,{type:'ordinary'},100),100);assert.equal(x.procDamage,20);});

const result={tests,passed:tests.length,failed:0};fs.writeFileSync(path.join(__dirname,'equipment-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:result.passed,failed:0}));
