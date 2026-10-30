// Continuous campaign. No granted gear, currency, potions or respecs.
window.runCampaign70=async function(cfg){
 const clone=x=>JSON.parse(JSON.stringify(x)),final=ClassLab.forms.find(f=>f.id===cfg.id),base=Balance70.formAt(final,1),names=Object.keys(regions);
 ClassLab.make(base,1,cfg.build,'common',cfg.seed);player.characterId='balance70-'+cfg.id+'-'+cfg.build+'-'+cfg.seed;player.stats.regionBossKills={};player.stats.regionKills={};player.inventory=[];player.equipment=Object.fromEntries(equipmentSlots.map(s=>[s,null]));player.coins=0;
 let seconds=0,fights=0,deaths=0,restSpent=0,gearSpent=0,xp=0,unlocked=0,bossTried=-1,coinsEarned=0,turns=0;
 const checkpoints=[],bosses=[],gearHistory=[],byLevel={},failedTargets={},realNow=Date.now;Date.now=()=>1793361600000+seconds*1000;
 function form(){return Balance70.formAt(final,player.level);}
 function checkpoint(){checkpoints.push({level:player.level,region:names[unlocked],minutes:Math.round(seconds/60),fights,deaths,coins:player.coins,gear:clone(player.equipment)});}
 function workshop(){
  currentMode='village';const before=player.coins,desired=EquipmentSystem.unlockedRegions(player).at(-1);
  for(const slot of EquipmentData.slots){const worn=player.equipment[slot];if(!worn||names.indexOf(worn.regionName)<names.indexOf(desired)){const recipe=EquipmentSystem.getRecipes(player,{region:desired,slot})[0];if(recipe&&EquipmentSystem.canCraft(recipe,player)){const made=EquipmentSystem.craft(recipe.id);player.equipment[slot]=made;player.inventory=player.inventory.filter(x=>x.uid!==made.uid);gearHistory.push({level:player.level,slot,region:desired});}}}
  for(const slot of EquipmentData.slots){const item=player.equipment[slot];if(item&&getRarityRank(item.rarity)<2){const u=EquipmentSystem.getUpgradeRequirements(item,player);if(u&&player.coins>=u.cost&&Object.entries(u.requirements).every(([id,q])=>getInventoryCountById(id)>=q))EquipmentSystem.tryUpgrade(slot);}}
  gearSpent+=before-player.coins;const state=EquipmentSystem.refreshContracts(player);for(const q of [...state.active])if(q.progress>=q.count)EquipmentSystem.claimContract(q.id);for(const q of state.offers)if(player.mercenary.active.length<3)EquipmentSystem.acceptContract(q.id);currentMode='battle';
 }
 function advance(){
  while(player.level<70&&xp>=getXpToNextLevel()){
   xp-=getXpToNextLevel();const old=clone(player),oldCap=getCurrentCaps(),rng=ClassLab.snapshot().rng;
   ClassLab.make(Balance70.formAt(final,old.level+1),old.level+1,cfg.build,'common',cfg.seed);const built=clone(player),state=ClassLab.snapshot();state.rng=rng;ClassLab.restore(state);
   player.stats={...old.stats,invested:built.stats.invested};for(const key of ['inventory','equipment','mercenary','characterId','coins'])player[key]=old[key];
   player.hp=Math.min(getCurrentCaps().maxHp,old.hp+getCurrentCaps().maxHp-oldCap.maxHp);player.mp=Math.min(getCurrentCaps().maxMp,old.mp+getCurrentCaps().maxMp-oldCap.maxMp);checkpoint();
  }
 }
 checkpoint();let reason='level70';
 try{
 for(;fights<6000&&player.level<70;){
  workshop();let region=names[unlocked],data=regions[region],kills=player.stats.regionKills[region]||{};
  const boss=player.level!==bossTried&&data.enemies.every(e=>kills[e.name])&&player.level>=data.boss.level+3;
  let template;
  if(boss){template=data.boss;bossTried=player.level;}
  else{
   const candidates=data.enemies.filter(e=>e.level+3<=player.level&&(!cfg.pragmatic||failedTargets[e.name]===undefined||player.level>failedTargets[e.name]+2));
   // Prefer missing regional materials; otherwise farm the highest safe enemy.
   for(const r of EquipmentSystem.getRecipes(player,{region})){if(player.equipment[r.slot]?.regionName===region)continue;const m=Object.entries(r.requirements).find(([id,q])=>getInventoryCountById(id)<q);if(m){const source=EquipmentSystem.materialById(m[0]);const t=candidates.find(e=>e.name===source.enemyName);if(t){template=t;break;}}}
   template||=candidates.at(-1);
   if(!template){const alternatives=names.slice(0,unlocked+1).flatMap(region=>regions[region].enemies.map(t=>({t,region}))).filter(({t})=>t.level+3<=player.level&&(!cfg.pragmatic||failedTargets[t.name]===undefined||player.level>failedTargets[t.name]+2));const fallback=alternatives.at(-1);region=fallback?.region||'Floresta';template=fallback?.t||regions.Floresta.enemies[0];data=regions[region];}
   if(player.level<4){region='Floresta';template=regions.Floresta.enemies[0];}
  }
  enemy=createEnemyFromTemplate(template,boss,region);currentRegion=region;currentMode='battle';resetCombatEffects();isDead=false;isProcessingTurn=false;
  const cursor={index:0},lv=player.level;let n=0;
  const bucket=byLevel[lv]||={fights:0,wins:0,deaths:0,turns:0,enemies:{},actions:{}};
  for(;n<100&&enemy.hp>0&&player.hp>0&&!isDead;n++){
   let i=cfg.pragmatic?Balance70.pragmatic(n):ClassLab.choose(form(),cfg.policy,n,cursor);if(i>=0&&!getSkillActionState(getSkillInfo()[i]).canUse)i=player.class==='Mago'&&player.mp<Math.floor(3+.1*player.level)*3?-2:-1;
   const a=i>=0?getSkillInfo()[i].id:i===-2?'pass':'basic';bucket.actions[a]=(bucket.actions[a]||0)+1;
   if(i===-2)await passTurn();else if(i<0)await attack();else await useSkill(i);isProcessingTurn=false;
  }
  const win=enemy.hp<=0&&player.hp>0;turns+=n;seconds+=n*4+8;fights++;bucket.fights++;bucket.turns+=n;bucket.enemies[template.name]=(bucket.enemies[template.name]||0)+1;
  if(win){
   bucket.wins++;const mods=getPassiveModifiers(),reward=Math.floor(((boss?18:4)+enemy.level*3+Math.floor(Math.random()*4))*(1+mods.coinBonus));player.coins+=reward;coinsEarned+=reward;const baseXp=(boss?40:22)+enemy.level*8;xp+=baseXp+Math.floor(baseXp*mods.xpBonus);
   for(const m of EquipmentSystem.rollDrops(enemy))addInventoryItem(m);EquipmentSystem.recordKill(enemy,player);
   if(boss){player.stats.regionBossKills[region]=(player.stats.regionBossKills[region]||0)+1;bosses.push({region,level:player.level,minutes:Math.round(seconds/60)});if(unlocked<names.length-1)unlocked++;bossTried=-1;}
   else{player.stats.regionKills[region]||={};player.stats.regionKills[region][template.name]=true;}advance();
  }else{if(cfg.pragmatic&&player.hp>0){reason='100 turnos sem resolucao';break;}deaths++;bucket.deaths++;failedTargets[template.name]=player.level;seconds+=6+player.level*2;if(deaths>=30){reason='30 derrotas';break;}isDead=false;player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;}
  const rest=getHealCost()+getManaHealCost();if(rest>0&&player.coins>=rest){player.coins-=rest;restSpent+=rest;seconds+=20;player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;}
  enemy=null;
 }
 if(fights>=6000)reason='6000 combates';
 return{...cfg,level:player.level,reason,minutes:Math.round(seconds/60),fights,deaths,turns,coinsEarned,restSpent,gearSpent,coins:player.coins,bosses,gearHistory,checkpoints,byLevel,gear:clone(player.equipment)};
 }finally{Date.now=realNow;}
};
