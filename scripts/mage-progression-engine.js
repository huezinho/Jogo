// Accelerated preparation benchmark: native battles/rewards, gifted level/gear after defeats.
window.startMageProgression = function(config){
 const E=EquipmentSystem,clone=x=>JSON.parse(JSON.stringify(x)),names=Object.keys(regions);
 const tier30=['mago_frigido','mago_incendiario'].includes(config.route)?'elementalista':'arcanista';
 const s={rng:config.seed,fights:0,turns:0,deaths:[],bosses:[],gifts:[],skills:{},endgameDeaths:0,retreats:0};
 Math.random=()=>{s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;};
 updateUI=()=>{};saveCampaign=()=>{};queueCampaignSave=()=>{};showGameNotice=()=>{};log=()=>{};
 wait=async()=>{};playSpriteAttackAnimation=async()=>{};animateEnemyBarTo=async()=>{};animateEnemyHitSequence=async()=>{};blurActiveControl=()=>{};
 CharacterMotion.ready=async()=>{};CharacterMotion.hurt=async()=>{};triggerForgeFeedback=()=>{};triggerInventoryFlash=()=>{};
 localStorage.clear();selectClass('Mago');enemy=null;isProcessingTurn=false;
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
  player.equipment[slot]=slot==='accessory'?E.createBossAccessory('Floresta',rarity):E.createItem(region,slot,'Mago',rarity);
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
 function choose(pressure=false){
  const skills=getSkillInfo().map((skill,index)=>({...skill,index})).filter(skill=>getSkillActionState(skill).canUse);
  if(playerEffects.skipNextTurn)return -2;
  const H=getCurrentCaps().maxHp,N=Math.floor(3+.1*player.level),F=getUniversalDamageFlatBonus(),A=getActiveAttack(),P=getSkillPowerBonus();
  const elemental=getPlayerSubclassState().tier30==='elementalista'?Math.floor(P*.09):0;
  const basic=Math.max(0,(6+Math.floor(A*.3)+elemental+F/N)-(enemy.armor||0))*N;
  const incoming=enemy.attack+H*(enemy.maxHpStrikePercent||0);
  const shield=skills.find(k=>k.type==='mage_mana_shield');
  if(!pressure&&shield&&playerEffects.shieldValue<=0&&player.hp<Math.max(H*.5,incoming*2)&&enemy.hp>basic*2)return shield.index;
  const concentration=skills.find(k=>k.type==='mage_concentration');
  if(!pressure&&concentration&&!playerEffects.finalDamageBuffTurns&&enemy.hp>basic*4&&player.mp>concentration.cost+N*3)return concentration.index;
  const demon=skills.find(k=>k.type==='mage_demon_form');
  if(!pressure&&demon&&!playerEffects.finalDamageBuffTurns&&enemy.hp>basic*4&&player.hp>incoming*3&&player.mp>demon.cost+N*3)return demon.index;
  const blizzard=skills.find(k=>k.type==='mage_blizzard');
  if(!pressure&&blizzard&&!enemy.blizzardTurns&&enemy.isBoss&&enemy.hp>basic*4&&player.mp>blizzard.cost+N*3)return blizzard.index;
  let best=player.mp>=N*3?basic:-1,index=player.mp>=N*3?-1:-2;
  for(const k of skills){
   let value=k.damage||0;if(!value)continue;
   if(k.hpCostPercent&&player.hp-H*k.hpCostPercent<incoming)continue;
   if(k.burnDamage)value+=k.burnDamage*k.burnTurns*.6;
   if(k.freezeChance)value+=incoming*k.freezeChance;
   if(k.chillAttackDownPercent&&!enemy.attackDownTurns)value+=incoming*k.chillAttackDownPercent;
   value-=Math.max(0,k.cost-getManaRegen())*.08;
   if(value>best+1){best=value;index=k.index;}
  }
  return index;
 }
 window.stepMageProgression=async(batch=40)=>{
  for(let i=0;i<batch&&!done();i++){
   prepare();const region=retry?.region||names.filter(isRegionUnlockedForBattle).at(-1);currentRegion=region;
   const boss=retry?retry.isBoss:getBossUnlockProgress(region).unlocked;
   if(retry){const template=boss?regions[region].boss:regions[region].enemies.find(e=>e.name===retry.name);enemy=createEnemyFromTemplate(template,boss,region);resetCombatEffects();}else spawnEnemy(boss);
   const foe={region,name:enemy.baseName,isBoss:enemy.isBoss};const before=player.stats.deaths,killsBefore=player.stats.enemiesDefeated+player.stats.bossesDefeated,prepared=full();
   let n=0,lastProgress=0,lowest=enemy.hp,pressure=0;
   while(enemy&&!isDead){
    const index=n-lastProgress>100?-2:choose(pressure>0),type=index===-2?'pass':index===-1?'basic':getSkillInfo()[index].type;s.skills[type]=(s.skills[type]||0)+1;
    if(index===-2)await passTurn();else if(index===-1)await attack();else await useSkill(index);
    s.turns++;n++;if(pressure>0)pressure--;if(enemy&&enemy.hp<lowest){lowest=enemy.hp;lastProgress=n;}if(n-lastProgress>=12)pressure=4;if(n>2000)throw Error('Combat stalled: '+JSON.stringify(foe));
   }
   s.fights++;
   const died=player.stats.deaths>before,escaped=player.stats.enemiesDefeated+player.stats.bossesDefeated===killsBefore&&!died;
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
  return{route:config.route,seed:config.seed,done:done(),reason:player.stats.regionBossKills.Paradoxo?'Paradoxo derrotado':s.endgameDeaths>10?'11 mortes no nivel 100 com seis lendarios':null,level:player.level,region:currentRegion,fights:s.fights,turns:s.turns,deaths:player.stats.deaths,retreats:s.retreats,endgameDeaths:s.endgameDeaths,fullLegendary:full(),invested:clone(player.stats.invested),gear:gear(),bosses:s.bosses,deathEvents:s.deaths,gifts:s.gifts,skills:s.skills};
 };
};
