// Accelerated preparation benchmark: native battles/rewards, gifted level/gear after defeats.
window.startRevisedProgression = function(config){
 const E=EquipmentSystem,clone=x=>JSON.parse(JSON.stringify(x)),names=Object.keys(regions);
 const warrior=['paladino','berserker','samurai','ninja'].includes(config.route);
 const className=warrior?'Guerreiro':'Arqueiro';
 const tier30=warrior?(['paladino','berserker'].includes(config.route)?'cavaleiro':'espadachim'):(['sniper','atirador_arcano'].includes(config.route)?'atirador':'cacador');
 const s={rng:config.seed,fights:0,turns:0,deaths:[],bosses:[],gifts:[],skills:{},endgameDeaths:0,retreats:0,records:[]};
 Math.random=()=>{s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;};
 updateUI=()=>{};saveCampaign=()=>{};queueCampaignSave=()=>{};showGameNotice=()=>{};log=()=>{};
 wait=async()=>{};playSpriteAttackAnimation=async()=>{};animateEnemyBarTo=async()=>{};animateEnemyHitSequence=async()=>{};blurActiveControl=()=>{};
 CharacterMotion.ready=async()=>{};CharacterMotion.hurt=async()=>{};triggerForgeFeedback=()=>{};triggerInventoryFlash=()=>{};
 if(config.captureFights){
  const defeat=handleEnemyDefeat;
  handleEnemyDefeat=function(...args){
   const before={hp:player.hp,maxHp:getCurrentCaps().maxHp,mp:player.mp,maxMp:getCurrentCaps().maxMp};
   const kills=player.stats.enemiesDefeated+player.stats.bossesDefeated;
   const result=defeat(...args);
   if(player.stats.enemiesDefeated+player.stats.bossesDefeated>kills)s.lastVictoryState=before;
   return result;
  };
 }
 localStorage.clear();selectClass(className);enemy=null;isProcessingTurn=false;
 let retry=null,failedOnce=false;
 const gear=()=>Object.fromEntries(equipmentSlots.map(slot=>[slot,player.equipment[slot]?{region:player.equipment[slot].regionName,rarity:player.equipment[slot].rarity}:null]));
 const full=()=>player.level===100&&equipmentSlots.every(slot=>player.equipment[slot]?.rarity==='lendaria');
 const done=()=>!!player.stats.regionBossKills.Paradoxo||s.endgameDeaths>10;
 function allocate(){
  while(needsSubclassChoice())chooseSubclass(!getPlayerSubclassState().tier30?tier30:config.route);
  while(levelUpPoints>0){const inv=player.stats.invested;const key=['strength','vitality','wisdom'].sort((a,b)=>(inv[a]+allocation[a])-(inv[b]+allocation[b]))[0];adjustAttribute(key,1);}
  if(pendingLevelUps>0)finishLevelUp();
  while(needsSubclassChoice())chooseSubclass(!getPlayerSubclassState().tier30?tier30:config.route);
 }
 function giftGear(){
  const slot=[...equipmentSlots].sort((a,b)=>(player.equipment[a]?getRarityRank(player.equipment[a].rarity)+1:0)-(player.equipment[b]?getRarityRank(player.equipment[b].rarity)+1:0))[0];
  const item=player.equipment[slot];if(item?.rarity==='lendaria')return;
  const rarity=item?['comum','incomum','rara','ultra_rara','lendaria'][getRarityRank(item.rarity)+1]:'comum';
  const region=item?.regionName||(isRegionUnlockedForBattle('Caverna')?'Caverna':'Floresta');
  player.equipment[slot]=slot==='accessory'?E.createBossAccessory('Floresta',rarity):E.createItem(region,slot,className,rarity);
  E.refreshEquipmentStats(player);s.gifts.push({fight:s.fights,kind:'gear',slot,rarity,region:player.equipment[slot].regionName});
 }
 function prepare(){
  enemy=null;isProcessingTurn=false;
  if(isDead){isDead=false;deadUntil=0;}
  allocate();currentMode='village';openAllChests();
  // Craft only what actual earned drops and coins afford, with the existing recipes.
  for(const slot of ['weapon','chest','legs','head','feet']){
   if(player.equipment[slot])continue;
   const r=E.getRecipes(player,{region:isRegionUnlockedForBattle('Caverna')?'Caverna':'Floresta',slot})[0];
   if(r&&E.canCraft(r,player)){E.craft(r.id);const item=player.inventory.find(i=>i.type==='equipment'&&i.slot===slot);if(item)equipItem(item.uid);}
  }
  if(!player.equipment.accessory){const a=player.inventory.find(i=>i.type==='equipment'&&i.slot==='accessory');if(a)equipItem(a.uid);}
  player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;resetCombatEffects();currentMode='battle';
 }
 function chooseArcher(pressure=false){
  const skills=getSkillInfo().map((skill,index)=>({...skill,index})).filter(skill=>getSkillActionState(skill).canUse&&!avoidBuff(skill));
  if(playerEffects.skipNextTurn)return -2;
  const basic=Math.max(0,getActiveAttack()+2-(enemy.armor||0)),H=getCurrentCaps().maxHp;
  const focus=skills.find(k=>k.type==='archer_focus');
  if(!pressure&&focus&&!playerEffects.guaranteedHitTurns&&enemy.hp>basic*3)return focus.index;
  const camo=skills.find(k=>k.type==='archer_camouflage');
  if(!pressure&&camo&&!playerEffects.enemyMissBonusTurns&&enemy.hp>basic*2&&(enemy.isBoss||player.hp<H*.6))return camo.index;
  let best=basic,index=-1;
  for(const k of skills){
   let value=k.damage||0;
   if(k.hits)value=basic*k.hits*(1+(playerEffects.nextBarrageDamageBonusPercent||0));
   if(k.type==='archer_execute'&&enemy.hp<=enemy.maxHp*k.executeThreshold)value*=k.executeMultiplier;
   if(k.totalDamage)value=k.totalDamage*.8;
   if(k.type==='archer_headshot')value*=1+(k.critChance||0);
   if(k.enemyAttackDownPercent&&!enemy.attackDownTurns)value+=enemy.attack*k.enemyAttackDownPercent;
   if(k.skipChance)value+=enemy.attack*k.skipChance;
   value-=Math.max(0,k.cost-getManaRegen())*.08;
   if(value>best+1){best=value;index=k.index;}
  }
  return index;
 }
 function warriorAction(pressure=false){
  const skills=getSkillInfo(),available=skills.map((skill,index)=>({...skill,index})).filter(skill=>getSkillActionState(skill).canUse&&!avoidBuff(skill));
  if(playerEffects.skipNextTurn){const breaker=available.find(skill=>skill.canBreakControl);return{index:breaker?breaker.index:-2};}
  if(playerEffects.forcedBasicTurns>0)return{index:-1};
  const H=getCurrentCaps().maxHp,missingHp=H-player.hp,basic=Math.max(0,getActiveAttack()+2-(enemy.armor||0));
  const incoming=Math.max(1,Math.max(enemy.attack,enemy.isBoss?enemy.skillDamage||0:0)+H*(enemy.maxHpStrikePercent||0)-getPassiveModifiers().flatReduction);
  const shield=available.find(skill=>skill.type==='warrior_faith_shield');
  if(!pressure&&shield&&!playerEffects.invulnerableTurns&&(player.hp<incoming*2||player.hp<H*.4)&&enemy.hp>basic*2)return{index:shield.index};
  const heal=available.find(skill=>skill.type==='warrior_second_wind');
  if(!pressure&&heal&&missingHp>=heal.heal&&player.hp<Math.max(H*.65,incoming*1.5))return{index:heal.index};
  const cuts=available.find(skill=>skill.type==='warrior_ultrasonic_cuts');if(cuts&&enemy.hp>basic*2)return{index:cuts.index};
  const rage=available.find(skill=>skill.type==='warrior_warcry');
  if(rage&&!playerEffects.finalDamageBuffTurns&&enemy.hp>basic*3&&(!rage.hpCostPercent||player.hp-Math.floor(H*rage.hpCostPercent)>incoming))return{index:rage.index};
  const valhalla=available.find(skill=>skill.type==='warrior_valhalla');if(valhalla&&!playerEffects.enemyMaxHpBonusTurns&&player.hp>incoming*3&&enemy.hp>basic*5)return{index:valhalla.index};
  const smoke=available.find(skill=>skill.type==='warrior_smoke_bomb');if(smoke&&!playerEffects.nextIncomingAutoMiss&&!playerEffects.nextDamageBonusPercent&&enemy.hp>basic*2&&player.hp<H*.8)return{index:smoke.index};
  let selected=-1,best=basic;
  for(const skill of available){let value=skill.damage||0;if(skill.hits)value=basic*skill.hits;if(skill.bleedPercent)value*=1+skill.bleedPercent*.75;if(skill.enemyAttackDownPercent&&!enemy.attackDownTurns)value+=incoming*skill.enemyAttackDownPercent*1.5;if(skill.skipChance)value+=incoming*skill.skipChance;value-=Math.max(0,skill.cost-getManaRegen())*.10;if(value>best+1){best=value;selected=skill.index;}}
  return{index:selected};
 }
 function avoidBuff(skill){
  const hostile=enemy.baseName==='Oraculo Radiante'||(enemy.bossAbilities||[]).some(a=>a.dominion);
  return hostile&&['archer_focus','archer_camouflage','warrior_warcry','warrior_valhalla','warrior_faith_shield','warrior_ultrasonic_cuts','warrior_smoke_bomb'].includes(skill.type);
 }
 function choose(pressure=false){
  if(enemy.campaignState?.timers.pact>0){
   const heal=getSkillInfo().findIndex(k=>k.type==='warrior_second_wind'&&getSkillActionState(k).canUse&&getCurrentCaps().maxHp-player.hp>=k.heal);
   return heal>=0?heal:-2;
  }
  if(warrior&&enemy.campaignState?.charge?.left===1){
   const shield=getSkillInfo().findIndex(k=>['warrior_faith_shield','warrior_ultrasonic_cuts','warrior_smoke_bomb'].includes(k.type)&&!avoidBuff(k)&&getSkillActionState(k).canUse);
   if(shield>=0&&!playerEffects.invulnerableTurns&&!playerEffects.basicOnlyUntouchableTurns&&!playerEffects.nextIncomingAutoMiss)return shield;
  }
  return warrior?warriorAction(pressure).index:chooseArcher(pressure);
 }

 window.stepRevisedProgression=async(batch=40)=>{
  for(let i=0;i<batch&&!done();i++){
   prepare();const region=retry?.region||names.filter(isRegionUnlockedForBattle).at(-1);currentRegion=region;
   const boss=retry?retry.isBoss:getBossUnlockProgress(region).unlocked;
   if(retry){const template=boss?regions[region].boss:regions[region].enemies.find(e=>e.name===retry.name);enemy=createEnemyFromTemplate(template,boss,region);resetCombatEffects();}else spawnEnemy(boss);
   const start = config.captureFights ? {level:player.level,gear:gear(),enemyLevel:enemy.level,enemyMaxHp:enemy.maxHp,hpStart:player.hp,maxHpStart:getCurrentCaps().maxHp} : null;
   s.lastVictoryState=null;let hpMinRatio=player.hp/getCurrentCaps().maxHp;
   const foe={region,name:enemy.baseName,isBoss:enemy.isBoss};const before=player.stats.deaths,killsBefore=player.stats.enemiesDefeated+player.stats.bossesDefeated,prepared=full();
   let n=0,lastProgress=0,lowest=enemy.hp,pressure=0;
   while(enemy&&!isDead){
    const index=n-lastProgress>100?-2:choose(pressure>0),type=index===-2?'pass':index===-1?'basic':getSkillInfo()[index].type;s.skills[type]=(s.skills[type]||0)+1;
    if(index===-2)await passTurn();else if(index===-1)await attack();else await useSkill(index);
    if(config.captureFights){const h=s.lastVictoryState||{hp:player.hp,maxHp:getCurrentCaps().maxHp};hpMinRatio=Math.min(hpMinRatio,h.hp/h.maxHp);}
    s.turns++;n++;if(pressure>0)pressure--;if(enemy&&enemy.hp<lowest){lowest=enemy.hp;lastProgress=n;}if(n-lastProgress>=12)pressure=4;if(n>2000)throw Error('Combat stalled: '+JSON.stringify(foe));
   }
   s.fights++;
   const died=player.stats.deaths>before,escaped=player.stats.enemiesDefeated+player.stats.bossesDefeated===killsBefore&&!died;
   if(start)s.records.push({fight:s.fights,foe,...start,rounds:n,hpMinRatio,preReward:s.lastVictoryState,outcome:died?"death":escaped?"escape":"win"});
   if(died||escaped){
    if(died&&prepared)s.endgameDeaths++;
    if(died)s.deaths.push({fight:s.fights,level:player.level,foe,prepared,gear:gear()});else s.retreats++;
    retry=foe;
    if(!done()){
     if(player.level<100){const level=player.level;gainXP(Math.ceil((getXpToNextLevel()-player.xp)/(1+getPassiveModifiers().xpBonus)));allocate();s.gifts.push({fight:s.fights,kind:'level',from:level,to:player.level});}
     if(failedOnce||player.level===100){giftGear();failedOnce=false;}else failedOnce=true;
    }
   }else{retry=null;failedOnce=false;if(foe.isBoss)s.bosses.push({region,level:player.level,fight:s.fights,deaths:player.stats.deaths,gear:gear()});}
   allocate();
  }
  return{className,route:config.route,seed:config.seed,done:done(),reason:player.stats.regionBossKills.Paradoxo?'Paradoxo derrotado':s.endgameDeaths>10?'11 mortes no nivel 100 com seis lendarios':null,level:player.level,region:currentRegion,fights:s.fights,turns:s.turns,deaths:player.stats.deaths,retreats:s.retreats,endgameDeaths:s.endgameDeaths,fullLegendary:full(),invested:clone(player.stats.invested),gear:gear(),bosses:s.bosses,deathEvents:s.deaths,gifts:s.gifts,skills:s.skills,...(config.captureFights?{encounters:s.records}:{})};
 };
};
