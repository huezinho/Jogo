// Accelerated preparation benchmark: native battles/rewards, gifted level/gear after defeats.
window.startArcherProgression = function(config){
 const E=EquipmentSystem,clone=x=>JSON.parse(JSON.stringify(x)),names=Object.keys(regions);
 const tier30=['sniper','atirador_arcano'].includes(config.route)?'atirador':'cacador';
 const s={rng:config.seed,fights:0,turns:0,deaths:[],bosses:[],gifts:[],skills:{},endgameDeaths:0};
 Math.random=()=>{s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;};
 updateUI=()=>{};saveCampaign=()=>{};queueCampaignSave=()=>{};showGameNotice=()=>{};log=()=>{};
 wait=async()=>{};playSpriteAttackAnimation=async()=>{};animateEnemyBarTo=async()=>{};animateEnemyHitSequence=async()=>{};blurActiveControl=()=>{};
 CharacterMotion.ready=async()=>{};CharacterMotion.hurt=async()=>{};triggerForgeFeedback=()=>{};triggerInventoryFlash=()=>{};
 localStorage.clear();selectClass('Arqueiro');enemy=null;isProcessingTurn=false;
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
  player.equipment[slot]=slot==='accessory'?E.createBossAccessory('Floresta',rarity):E.createItem(region,slot,'Arqueiro',rarity);
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
 function choose(){
  const skills=getSkillInfo().map((skill,index)=>({...skill,index})).filter(skill=>getSkillActionState(skill).canUse);
  if(playerEffects.skipNextTurn)return -2;
  const basic=Math.max(0,getActiveAttack()+2-(enemy.armor||0)),H=getCurrentCaps().maxHp;
  const focus=skills.find(k=>k.type==='archer_focus');
  if(focus&&!playerEffects.guaranteedHitTurns&&enemy.hp>basic*3)return focus.index;
  const camo=skills.find(k=>k.type==='archer_camouflage');
  if(camo&&!playerEffects.enemyMissBonusTurns&&enemy.hp>basic*2&&(enemy.isBoss||player.hp<H*.6))return camo.index;
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
 window.stepArcherProgression=async(batch=40)=>{
  for(let i=0;i<batch&&!done();i++){
   prepare();const region=retry?.region||names.filter(isRegionUnlockedForBattle).at(-1);currentRegion=region;
   const boss=retry?retry.isBoss:getBossUnlockProgress(region).unlocked;
   if(retry){const template=boss?regions[region].boss:regions[region].enemies.find(e=>e.name===retry.name);enemy=createEnemyFromTemplate(template,boss,region);resetCombatEffects();}else spawnEnemy(boss);
   const foe={region,name:enemy.baseName,isBoss:enemy.isBoss};const before=player.stats.deaths,prepared=full();
   let n=0;
   while(enemy&&!isDead){
    const index=choose(),type=index===-2?'pass':index===-1?'basic':getSkillInfo()[index].type;s.skills[type]=(s.skills[type]||0)+1;
    if(index===-2)await passTurn();else if(index===-1)await attack();else await useSkill(index);
    s.turns++;if(++n>2000)throw Error('Combat stalled: '+JSON.stringify(foe));
   }
   s.fights++;
   if(player.stats.deaths>before){
    if(prepared)s.endgameDeaths++;
    s.deaths.push({fight:s.fights,level:player.level,foe,prepared,gear:gear()});retry=foe;
    if(!done()){
     if(player.level<100){const level=player.level;gainXP(Math.ceil((getXpToNextLevel()-player.xp)/(1+getPassiveModifiers().xpBonus)));allocate();s.gifts.push({fight:s.fights,kind:'level',from:level,to:player.level});}
     if(failedOnce||player.level===100){giftGear();failedOnce=false;}else failedOnce=true;
    }
   }else{retry=null;failedOnce=false;if(foe.isBoss)s.bosses.push({region,level:player.level,fight:s.fights,deaths:player.stats.deaths,gear:gear()});}
   allocate();
  }
  return{route:config.route,seed:config.seed,done:done(),reason:player.stats.regionBossKills.Paradoxo?'Paradoxo derrotado':s.endgameDeaths>10?'11 mortes no nivel 100 com seis lendarios':null,level:player.level,region:currentRegion,fights:s.fights,turns:s.turns,deaths:player.stats.deaths,endgameDeaths:s.endgameDeaths,fullLegendary:full(),invested:clone(player.stats.invested),gear:gear(),bosses:s.bosses,deathEvents:s.deaths,gifts:s.gifts,skills:s.skills};
 };
};
