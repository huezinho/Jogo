// Native campaign rules; presentation and wall-clock waits alone are accelerated.
window.startWarriorProgression = function(config, checkpoint = null){
 const clone=value=>JSON.parse(JSON.stringify(value)),E=EquipmentSystem;
 const names=Object.keys(regions),materials=Object.fromEntries(E.allMaterials().map(m=>[m.id,m]));
 const tier30=['paladino','berserker'].includes(config.route)?'cavaleiro':'espadachim';
 const s=(checkpoint?clone(checkpoint.state):null)||{version:2,policyRevision:"material-access-guard",rng:config.seed,seconds:0,fights:0,turns:0,retreats:0,endgameDeaths:0,boardWaits:0,milestones:[],gearEvents:[],bosses:[],deaths:[],encounters:{},skillCounts:{},recovery:null,artifactRegion:null,plans:[],recent:[]};
 const realNow=Date.now;
 const resumeRng=s.rng,resumeRecent=s.recent.slice();
 Math.random=()=>{s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;};
 Date.now=()=>1793703600000+Math.floor(s.seconds*1000);
 updateUI=()=>{};saveCampaign=()=>{};queueCampaignSave=()=>{};showGameNotice=()=>{};
 wait=async()=>{};playSpriteAttackAnimation=async()=>{};animateEnemyBarTo=async()=>{};animateEnemyHitSequence=async()=>{};blurActiveControl=()=>{};
 CharacterMotion.ready=async()=>{};CharacterMotion.hurt=async()=>{};triggerForgeFeedback=()=>{};triggerInventoryFlash=()=>{};
 log=message=>{s.recent.push(message);if(s.recent.length>40)s.recent.shift();};
 localStorage.clear();selectClass('Guerreiro');player.characterId='warrior-'+config.seed;
 let initialEnemy=enemy;enemy=null;isProcessingTurn=false;
 if(checkpoint){
  player=clone(checkpoint.player);playerEffects=clone(checkpoint.playerEffects);currentRegion=checkpoint.currentRegion;currentMode=checkpoint.currentMode;
  isDead=checkpoint.isDead;deadUntil=checkpoint.deadUntil;levelUpPoints=checkpoint.levelUpPoints;pendingLevelUps=checkpoint.pendingLevelUps;allocation=clone(checkpoint.allocation);
  enemiesSpawned=checkpoint.enemiesSpawned;displayState=clone(checkpoint.displayState);enemy=null;initialEnemy=null;s.rng=resumeRng;s.recent=resumeRecent;
 }
 const recipeCache=new Map(),upgradeCache=new Map();
 const unlocked=()=>names.filter(isRegionUnlockedForBattle);
 const fullLegendary=()=>player.level===MAX_LEVEL&&equipmentSlots.every(slot=>player.equipment[slot]?.rarity==='lendaria');
 const finished=()=>!!player.stats.regionBossKills.Paradoxo||(fullLegendary()&&s.endgameDeaths>10);
 const grade=()=>equipmentSlots.reduce((sum,slot)=>sum+(player.equipment[slot]?getRarityRank(player.equipment[slot].rarity)+1:0),0);
 const gear=()=>Object.fromEntries(equipmentSlots.map(slot=>[slot,player.equipment[slot]?{region:player.equipment[slot].regionName,rarity:player.equipment[slot].rarity}:null]));
 function levelUp(){
  while(needsSubclassChoice())chooseSubclass(!getPlayerSubclassState().tier30?tier30:config.route);
  if(levelUpPoints>0){while(levelUpPoints>0){const invested=player.stats.invested;const keys=['strength','vitality','wisdom'].sort((a,b)=>(invested[a]+allocation[a])-(invested[b]+allocation[b]));adjustAttribute(keys[0],1);}finishLevelUp();}
  while(needsSubclassChoice())chooseSubclass(!getPlayerSubclassState().tier30?tier30:config.route);
  if(!s.milestones.length||s.milestones.at(-1).level!==player.level)s.milestones.push({level:player.level,region:currentRegion,fights:s.fights,deaths:player.stats.deaths,minutes:Math.round(s.seconds/60),gear:gear()});
 }
 function recipe(region,slot){const key=region+slot;if(!recipeCache.has(key))recipeCache.set(key,E.getRecipes(player,{region,slot})[0]);return recipeCache.get(key);}
 function upgrade(item){const key=item.templateId+item.rarity;if(!upgradeCache.has(key))upgradeCache.set(key,E.getUpgradeRequirements(item,player));return upgradeCache.get(key);}
 function buildGoals(){
  const region=isRegionUnlockedForBattle('Caverna')?'Caverna':'Floresta';
  const goals=[];
  for(const slot of ['weapon','chest','legs','head','feet']){
   const worn=player.equipment[slot];
   if(!worn||worn.regionName!==region){const r=recipe(region,slot);if(r)goals.push({kind:'craft',slot,region,rank:-1,cost:r.cost,requirements:r.requirements,recipe:r});}
   else if(worn.rarity!=='lendaria'){const u=upgrade(worn);goals.push({kind:'upgrade',slot,region,rank:getRarityRank(worn.rarity),cost:u.cost,requirements:u.requirements,upgrade:u});}
  }
  const accessory=player.equipment.accessory;
  if(!accessory)goals.push({kind:'artifact',slot:'accessory',region:s.artifactRegion||'Floresta',rank:-1,requirements:{},cost:0});
  else if(accessory.rarity!=='lendaria'){const u=upgrade(accessory);goals.push({kind:'upgrade',slot:'accessory',region:accessory.regionName,rank:getRarityRank(accessory.rarity),cost:u.cost,requirements:u.requirements,upgrade:u});}
  return goals.sort((a,b)=>a.rank-b.rank||['weapon','chest','legs','head','feet','accessory'].indexOf(a.slot)-['weapon','chest','legs','head','feet','accessory'].indexOf(b.slot));
 }
 function equipAndForge(){
  currentMode='village';openAllChests();
  const planned=isRegionUnlockedForBattle('Caverna')?'Caverna':'Floresta';
  for(const slot of ['weapon','chest','legs','head','feet']){
   if(player.equipment[slot]?.regionName===planned)continue;
   const owned=player.inventory.find(i=>i.type==='equipment'&&i.slot===slot&&i.regionName===planned);
   if(owned)equipItem(owned.uid);
  }
  if(!player.equipment.accessory){const owned=player.inventory.find(i=>i.type==='equipment'&&i.slot==='accessory');if(owned){s.artifactRegion=owned.regionName;equipItem(owned.uid);s.gearEvents.push({kind:'artifact',level:player.level,fights:s.fights,region:owned.regionName,rarity:owned.rarity});}}
  for(let pass=0;pass<6;pass++){
   let changed=false;
   for(const goal of buildGoals()){
    if(goal.kind==='craft'&&E.canCraft(goal.recipe,player)){const item=E.craft(goal.recipe.id);equipItem(item.uid);s.gearEvents.push({kind:'craft',level:player.level,fights:s.fights,slot:goal.slot,region:item.regionName,rarity:item.rarity});changed=true;break;}
    if(goal.kind==='upgrade'&&E.canUpgrade(player.equipment[goal.slot],player)){const item=E.tryUpgrade(goal.slot);s.gearEvents.push({kind:'upgrade',level:player.level,fights:s.fights,slot:goal.slot,region:item.regionName,rarity:item.rarity});changed=true;break;}
   }
   if(!changed)break;
  }
 }
 function supplies(major=false){
  currentMode='village';
  const desired=major?5:2;
  while(getInventoryCountById('health_potion')<desired&&player.coins>=consumableCatalog.health_potion.price+100)buyConsumable('health_potion');
  if(major)for(const id of ['attack_tonic','skill_tonic'])if(!getInventoryCountById(id)&&player.coins>=consumableCatalog[id].price+100)buyConsumable(id);
 }
 function recover(){
  if(isDead){s.seconds+=getRespawnSeconds();respawnPlayer();}
  if(player.hp<getCurrentCaps().maxHp){currentMode='camp';toggleCampRest();const ticks=Math.ceil((getCurrentCaps().maxHp-player.hp)/getCampRestHealing());s.seconds+=ticks*CAMP_REST_INTERVAL_MS/1000;recoverCampRest(Date.now());toggleCampRest();}
  currentMode='village';if(getManaHealCost()>0&&player.coins>=getManaHealCost())restoreManaAtVillage();
  s.seconds+=10;currentMode='battle';
 }
 function missing(goals){const required={};for(const goal of goals)for(const[id,qty]of Object.entries(goal.requirements))required[id]=(required[id]||0)+qty;return Object.fromEntries(Object.entries(required).map(([id,qty])=>[id,Math.max(0,qty-getInventoryCountById(id))]).filter(([,qty])=>qty>0));}
 function safeRegion(){return unlocked().filter(r=>regions[r].enemies[0].level<=player.level+2).at(-1)||'Floresta';}
 function contractTask(needs){
  currentMode='village';let board=E.refreshContracts(player);
  for(const q of [...board.active])if(!needs[q.rewardId]||regions[q.targetRegion].enemies.find(e=>e.name===q.targetName).level>player.level+3)E.abandonContract(q.id);
  board=E.refreshContracts(player);
  const offers=board.offers.filter(q=>needs[q.rewardId]&&!board.active.some(a=>a.id===q.id)&&!board.claimed.includes(q.id)&&regions[q.targetRegion].enemies.find(e=>e.name===q.targetName).level<=player.level+3).sort((a,b)=>a.count-b.count);
  for(const offer of offers)if(player.mercenary.active.length<3)E.acceptContract(offer.id);
  currentMode='battle';
  const active=player.mercenary.active.filter(q=>needs[q.rewardId]).sort((a,b)=>(a.count-a.progress)-(b.count-b.progress));
  return active[0]?{region:active[0].targetRegion,enemyName:active[0].targetName,source:'contract'}:null;
 }
 function materialTask(goals){
  const needs=missing(goals);
  const active=contractTask(needs);if(active)return active;
  for(const goal of goals){
   if(goal.kind==='artifact'&&player.stats.regionBossKills[goal.region]>0)return{region:goal.region,isBoss:true,source:'artifact drop'};
   if(goal.upgrade?.duplicate&&E.duplicateCount(player,player.equipment[goal.slot],goal.upgrade)<1)return{region:goal.region,isBoss:true,source:'common copy'};
  }
  const accessible=Object.entries(needs).filter(([id])=>{
   const material=materials[id];
   if(!isRegionUnlockedForBattle(material.regionName))return false;
   // A still-unbeaten boss is an advancement challenge, not a viable source of farming materials.
   if(material.isBossMaterial)return player.stats.regionBossKills[material.regionName]>0;
   const template=regions[material.regionName].enemies.find(enemy=>enemy.name===material.enemyName);
   if(template.level>player.level+3)return false;
   return !s.deaths.some(death=>death.level===player.level&&death.target.name===material.enemyName&&equipmentSlots.reduce((sum,slot)=>sum+(death.gear[slot]?getRarityRank(death.gear[slot].rarity)+1:0),0)>=grade());
  });
  const chosen=accessible.find(([id])=>materials[id].regionName===safeRegion())||accessible[0];
  if(chosen){const material=materials[chosen[0]];return{region:material.regionName,enemyName:material.enemyName,isBoss:material.isBossMaterial,source:'equipment material'};}
  const reach=names.indexOf(unlocked().at(-1))+2;
  if(Object.keys(needs).some(id=>names.indexOf(materials[id].regionName)>reach))return{source:'advance for material access'};
  if(Object.keys(needs).length){
   // Waiting for a new board grants no items, coins or XP; only simulated elapsed time advances.
   const next=(Math.floor(Date.now()/EquipmentData.boardIntervalMs)+1)*EquipmentData.boardIntervalMs+1;
   s.seconds+=(next-Date.now())/1000;s.boardWaits++;return{source:'wait for contracts'};
  }
  return{region:safeRegion(),source:'coins'};
 }
 function advanceTask(){
  const region=unlocked().at(-1);
  if(player.level<MAX_LEVEL&&regions[region].enemies[0].level>player.level+3)return{region:safeRegion(),source:'level training'};
  return{region,isBoss:getBossUnlockProgress(region).unlocked,source:'advance'};
 }
 function chooseTask(){
  const goals=buildGoals();
  if(s.recovery){
   const improved=player.level>=Math.min(MAX_LEVEL,s.recovery.level+2)&&player.level>s.recovery.level||grade()>s.recovery.grade;
   if(improved||fullLegendary()){
    const target=s.recovery.target;s.recovery=null;supplies(true);
    return{region:target.region,enemyName:target.name,isBoss:target.isBoss,source:'retry after preparation'};
   }
   const task=materialTask(goals);
   if(task.source==='advance for material access'){supplies(true);return advanceTask();}
   if(task.region&&player.level<MAX_LEVEL){const template=task.isBoss?regions[task.region].boss:regions[task.region].enemies.find(e=>e.name===task.enemyName)||regions[task.region].enemies[0];if(template.level>player.level+3)return{region:safeRegion(),source:'level training'};}
   return task;
  }
  return advanceTask();
 }
 function chooseAction(pressure=false){
  const skills=getSkillInfo(),available=skills.map((skill,index)=>({...skill,index})).filter(skill=>getSkillActionState(skill).canUse);
  if(playerEffects.skipNextTurn){const breaker=available.find(skill=>skill.canBreakControl);return{index:breaker?breaker.index:-2};}
  if(playerEffects.forcedBasicTurns>0)return{index:-1};
  const H=getCurrentCaps().maxHp,missingHp=H-player.hp,basic=Math.max(0,getActiveAttack()+2-(enemy.armor||0));
  const incoming=Math.max(1,Math.max(enemy.attack,enemy.isBoss?enemy.skillDamage||0:0)+H*(enemy.maxHpStrikePercent||0)-getPassiveModifiers().flatReduction);
  const shield=available.find(skill=>skill.type==='warrior_faith_shield');
  if(!pressure&&shield&&!playerEffects.invulnerableTurns&&(player.hp<incoming*2||player.hp<H*.4)&&enemy.hp>basic*2)return{index:shield.index};
  if(!pressure&&getInventoryCountById('health_potion')>0&&player.hp<incoming*1.2&&missingHp>=H*.3)return{consumable:'health_potion'};
  const heal=available.find(skill=>skill.type==='warrior_second_wind');
  if(!pressure&&heal&&missingHp>=heal.heal&&player.hp<Math.max(H*.65,incoming*1.5))return{index:heal.index};
  const cuts=available.find(skill=>skill.type==='warrior_ultrasonic_cuts');if(cuts&&enemy.hp>basic*2)return{index:cuts.index};
  if(enemy.isBoss&&enemy.hp>basic*5){if(getInventoryCountById('attack_tonic')&&!playerEffects.attackBuffTurns)return{consumable:'attack_tonic'};if(getInventoryCountById('skill_tonic')&&!playerEffects.skillBuffTurns)return{consumable:'skill_tonic'};}
  const rage=available.find(skill=>skill.type==='warrior_warcry');
  if(rage&&!playerEffects.finalDamageBuffTurns&&enemy.hp>basic*3&&(!rage.hpCostPercent||player.hp-Math.floor(H*rage.hpCostPercent)>incoming))return{index:rage.index};
  const valhalla=available.find(skill=>skill.type==='warrior_valhalla');if(valhalla&&!playerEffects.enemyMaxHpBonusTurns&&player.hp>incoming*3&&enemy.hp>basic*5)return{index:valhalla.index};
  const smoke=available.find(skill=>skill.type==='warrior_smoke_bomb');if(smoke&&!playerEffects.nextIncomingAutoMiss&&!playerEffects.nextDamageBonusPercent&&enemy.hp>basic*2&&player.hp<H*.8)return{index:smoke.index};
  let selected=-1,best=basic;
  for(const skill of available){let value=skill.damage||0;if(skill.hits)value=basic*skill.hits;if(skill.bleedPercent)value*=1+skill.bleedPercent*.75;if(skill.enemyAttackDownPercent&&!enemy.attackDownTurns)value+=incoming*skill.enemyAttackDownPercent*1.5;if(skill.skipChance)value+=incoming*skill.skipChance;value-=Math.max(0,skill.cost-getManaRegen())*.10;if(value>best+1){best=value;selected=skill.index;}}
  return{index:selected};
 }
 const summary=()=>({version:2,route:config.route,seed:config.seed,done:finished(),task:s.task,reason:player.stats.regionBossKills.Paradoxo?'Paradoxo derrotado':fullLegendary()&&s.endgameDeaths>10?'11 mortes no nivel 100 com seis lendarios':null,level:player.level,region:currentRegion,fights:s.fights,turns:s.turns,deaths:player.stats.deaths,endgameDeaths:s.endgameDeaths,fullLegendary:fullLegendary(),retreats:s.retreats,boardWaits:s.boardWaits,minutes:Math.round(s.seconds/60),coins:player.coins,contracts:player.stats.mercenaryContracts||0,stats:getPreviewStats(),invested:clone(player.stats.invested),gear:gear(),uniqueBosses:new Set(s.bosses.map(boss=>boss.region)).size,bosses:s.bosses,gearEvents:s.gearEvents,milestones:s.milestones,deathEvents:s.deaths,skillCounts:s.skillCounts,encounters:s.encounters,recovery:s.recovery,inventory:clone(player.inventory)});
 window.exportWarriorCheckpoint=()=>({state:clone(s),player:clone(player),playerEffects:clone(playerEffects),currentRegion,currentMode,isDead,deadUntil,levelUpPoints,pendingLevelUps,allocation:clone(allocation),enemiesSpawned,displayState:clone(displayState)});
 levelUp();
 window.stepWarriorProgression=async function(batch=40){
  for(let count=0;count<batch&&!finished();count++){
   levelUp();if(isDead)recover();equipAndForge();supplies(fullLegendary());recover();
   const task=chooseTask();s.task=task;
   if(task.source==='wait for contracts')continue;
   currentRegion=task.region||safeRegion();currentMode='battle';
   if(task.enemyName&&!task.isBoss&&player.stats.regionBossKills[currentRegion]>0){const hunt=CreatureTracking.active();if((hunt?.name!==task.enemyName||hunt.region!==currentRegion)&&player.coins>=CreatureTracking.offer(task.enemyName).cost)CreatureTracking.purchase(task.enemyName);}
   if(initialEnemy){enemy=initialEnemy;initialEnemy=null;currentRegion='Floresta';resetCombatEffects();}else spawnEnemy(!!task.isBoss);
   const foe={name:enemy.baseName,region:currentRegion,isBoss:enemy.isBoss,level:enemy.level};s.encounters[foe.name]=(s.encounters[foe.name]||0)+1;
   const deathsBefore=player.stats.deaths;let n=0,lastProgress=0,lowest=enemy.hp,pressure=0,retreated=false;
   while(enemy&&!isDead){
    const action=chooseAction(pressure>0);if(pressure>0)pressure--;
    const type=action.consumable||((action.index??-1)<0?(action.index===-2?'pass':'basic'):getSkillInfo()[action.index].type);s.skillCounts[type]=(s.skillCounts[type]||0)+1;
    if(action.consumable)await useConsumable(action.consumable);else if(action.index===-2)await passTurn();else if((action.index??-1)<0)await attack();else await useSkill(action.index);
    n++;s.turns++;s.seconds+=4;
    if(enemy&&enemy.hp<lowest){lowest=enemy.hp;lastProgress=n;}
    if(enemy&&n-lastProgress>=12){
     if(!fullLegendary()&&player.coins>=getFleeCost()){fleeBattle();s.retreats++;retreated=true;break;}
     // Fully prepared characters try an offensive push instead of an endless heal/regen loop.
     pressure=4;lastProgress=n;
    }
   }
   s.fights++;s.seconds+=8;
   if(player.stats.deaths>deathsBefore){
    const ready=fullLegendary();if(ready)s.endgameDeaths++;
    s.deaths.push({fight:s.fights,level:player.level,target:foe,gear:gear(),fullyPrepared:ready,endgameDeaths:s.endgameDeaths,lastLog:s.recent.slice(-15)});
    s.recovery={level:player.level,grade:grade(),target:foe};
   }else if(retreated)s.recovery={level:player.level,grade:grade(),target:foe};
   else if(foe.isBoss)s.bosses.push({region:foe.region,level:player.level,fight:s.fights,deaths:player.stats.deaths,minutes:Math.round(s.seconds/60),gear:gear()});
   levelUp();
  }
  const result=summary();if(result.done)Date.now=realNow;return result;
 };
};
