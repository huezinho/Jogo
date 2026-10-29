const fs=require('node:fs');const path=require('node:path');
const {server,out,chromium}=require('./smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext();const page=await context.newPage();
 await page.route('https://unpkg.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 await page.goto('http://127.0.0.1:'+server.address().port);
 const report=await page.evaluate(async()=>{
  selectClass('Guerreiro');
  const clone=x=>JSON.parse(JSON.stringify(x));const template=clone(player);
  updateUI=()=>{};saveCampaign=()=>{};log=()=>{};wait=async()=>{};playSpriteAttackAnimation=async()=>{};
  handleDeath=()=>{isDead=true;isProcessingTurn=false;};handleEnemyDefeat=()=>{enemy.hp=0;isProcessingTurn=false;};
  let seed=1;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function make(className,level,sub){
   player=clone(template);player.class=className;player.baseStats={...classes[className]};player.level=level;player.xp=0;
   player.maxHp=classes[className].hp;player.maxMp=classes[className].mp;player.attack=classes[className].attack;player.subclassChoices={tier30:level>=30?sub.tier30:null,tier60:level>=60?sub.tier60:null};
   player.stats.invested=createDefaultInvestedStats();allocation={strength:0,wisdom:0,vitality:0};levelUpPoints=0;pendingLevelUps=0;
   for(let lv=2;lv<=level;lv++){
    const attr=['strength','vitality','wisdom'][(lv-2)%3];const gain=getAttributePointGain(attr,lv);player.stats.invested[attr]++;
    if(attr==='strength'){player.attack+=gain;player.stats.invested.attackGain+=gain;player.stats.invested.skillGain+=gain;}
    if(attr==='vitality'){player.maxHp+=gain;player.stats.invested.hpGain+=gain;}
    if(attr==='wisdom'){player.maxMp+=gain;player.stats.invested.mpGain+=gain;}
   }
   playerEffects=createDefaultPlayerEffects();resetCombatEffects();player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;isDead=false;isProcessingTurn=false;currentMode='battle';
  }
  function scoreCandidate(index){
   const saved={player:clone(player),enemy:clone(enemy),effects:clone(playerEffects),seed};
   const pHp=player.hp,eHp=enemy.hp,pShield=playerEffects.shieldValue;let blocked=false;
   try{const result=index<0?getBasicAttackResult():applySkillLocally(getSkillInfo()[index]);blocked=result.blocked;
    const dot=enemy.dotDamagePerTurn*enemy.dotTurns+enemy.natureMarkDamage*enemy.natureMarkTurns+enemy.naturePoisonDamage*enemy.naturePoisonTurns+enemy.natureDecayDamage*enemy.natureDecayTurns;
    const oldDot=saved.enemy.dotDamagePerTurn*saved.enemy.dotTurns+saved.enemy.natureMarkDamage*saved.enemy.natureMarkTurns+saved.enemy.naturePoisonDamage*saved.enemy.naturePoisonTurns+saved.enemy.natureDecayDamage*saved.enemy.natureDecayTurns;
    return blocked?-Infinity:(eHp-enemy.hp)+0.6*(player.hp-pHp)+0.35*(playerEffects.shieldValue-pShield)+0.6*(dot-oldDot)+100*Math.max(0,playerEffects.invulnerableTurns-saved.effects.invulnerableTurns)+80*(Number(enemy.skipNextAttack)-Number(saved.enemy.skipNextAttack));
   }finally{player=saved.player;enemy=saved.enemy;playerEffects=saved.effects;seed=saved.seed;}
  }
  const beginners=[];
  for(const className of Object.keys(classes))for(const mob of regions.Floresta.enemies)for(const policy of ['basic','greedy']){
   let wins=0,turnSum=0;
   for(let trial=0;trial<40;trial++){
    seed=trial+1;make(className,1,{});enemy=createEnemyFromTemplate(mob,false,'Floresta');
    let turns=0;for(;turns<80&&player.hp>0&&enemy.hp>0;turns++){
     let index=-1,best=scoreCandidate(-1);if(policy==='greedy')for(let i=0;i<getSkillInfo().length;i++){const s=scoreCandidate(i);if(s>best){best=s;index=i;}}
     const result=index<0?getBasicAttackResult():applySkillLocally(getSkillInfo()[index]);
     if(result.blocked)break;applyTurnStartPassives();decayPlayerBuffs();applyEndOfTurnRecovery();if(enemy.hp>0)await enemyTurn();
    }
    if(enemy.hp<=0)wins++;turnSum+=turns;
   }
   beginners.push({className,enemy:mob.name,policy,trials:40,wins,averageTurns:turnSum/40});
  }
  const bosses=[];const aiErrors=[];
  for(const [className,def] of Object.entries(subclassChoicesByClass))for(const t of def.tier30)for(const leaf of def.tier60[t.id])for(const [region,regionData] of Object.entries(regions)){
   for(let trial=0;trial<3;trial++){
    const level=Math.min(100,regionData.boss.level);seed=trial+41;make(className,level,{tier30:t.id,tier60:leaf.id});currentRegion=region;enemy=createEnemyFromTemplate(regionData.boss,true,region);
    const initial={maxHp:player.hp,maxMp:player.mp,attack:getActiveAttack(),enemyHp:enemy.hp,enemyAttack:enemy.attack,enemyArmor:enemy.armor};
    let turns=0;try{
     for(;turns<150&&player.hp>0&&enemy.hp>0;turns++){
      if(await handlePlayerTurnStartEffects())continue;
      let index=-1,best=scoreCandidate(-1);for(let i=0;i<getSkillInfo().length;i++){const s=scoreCandidate(i);if(s>best){best=s;index=i;}}
      const result=index<0?getBasicAttackResult():applySkillLocally(getSkillInfo()[index]);if(result.blocked)break;
      applyTurnStartPassives();decayPlayerBuffs();applyEndOfTurnRecovery();if(enemy.hp>0)await enemyTurn();
      if(!Number.isFinite(player.hp)||!Number.isFinite(enemy.hp))throw Error('Non-finite HP');
     }
     bosses.push({className,subclass:leaf.name,region,level,trial,win:enemy.hp<=0,hp:player.hp,enemyRemaining:enemy.hp,turns,initial});
    }catch(e){aiErrors.push({className,subclass:leaf.name,region,error:e.message});}
   }
  }
  return {method:'Seeded exploratory simulation. Native formulas and enemy AI; animations, DOM updates, rewards disabled. One attribute point per level spent strength/vitality/wisdom in rotation; no items/accessories/potions; one-turn greedy policy. This is not a campaign completion test or proof that a build is unwinnable.',beginners,bosses,aiErrors};
 });
 fs.writeFileSync(path.join(out,'balance-results.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({beginnerBattles:report.beginners.reduce((s,x)=>s+x.trials,0),beginners:report.beginners,bossBattles:report.bosses.length,bossWins:report.bosses.filter(x=>x.win).length,aiErrors:report.aiErrors,bossByRegion:report.bosses.reduce((a,x)=>{a[x.region]??={wins:0,battles:0};a[x.region].battles++;a[x.region].wins+=Number(x.win);return a;},{})},null,2));
 await browser.close();server.close();
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
