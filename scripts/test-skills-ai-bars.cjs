const assert=require('node:assert/strict');
const {server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const p=await b.newPage({viewport:{width:1366,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:'+server.address().port);
  const fs=require('node:fs');await p.addScriptTag({content:fs.readFileSync('docs/qa/2026-10-27/class-lab-engine.js','utf8')});
  const checks=await p.evaluate(()=>{
   const out=[],check=(ok,label)=>{if(!ok)throw Error(label);out.push(label)};
   const make=id=>{ClassLab.make(ClassLab.forms.find(f=>f.id===id),100,'equilibrada','dummy',123);enemy.hp=enemy.maxHp=100000;enemy.armor=0;player.mp=100000;};
   const skill=id=>getSkillInfo().find(x=>x.type===id);
   make('berserker');const buff=skill('warrior_unstoppable');applySkillLocally(buff);
   check(playerEffects.attackBuffAmount===40&&playerEffects.finalDamageBuffPercent===.2,'unstoppable effects');
   check(buff.hpCostPercent===.3&&buff.turns===4,'other unstoppable costs preserved');
   make('samurai');applySkillLocally(skill('warrior_swift_strikes'));
   check(enemy.bleedStacks.length===1&&enemy.bleedDamagePerTurn===5000&&enemy.bleedTurns===3,'samurai fixed enemy-max-HP bleed once per action');
   make('ninja');applySkillLocally(skill('warrior_swift_strikes'));check(!enemy.bleedStacks?.length,'ninja unchanged swift strikes');
   for(const id of ['espadachim','samurai','ninja']){make(id);const s=skill('warrior_deep_cut'),base=70+Math.floor((id==='ninja'?.9:1.1)*getActiveAttack())+Math.floor((id==='ninja'?1.1:.8)*getSkillPowerBonus());check(s.damage===base+8000,id+' deep cut current hp');}
   make('mago_incendiario');check(skill('mage_explode').damage===200+Math.floor(1.3*getSkillPowerBonus())+Math.floor(.5*getPreviewStats().maxHp)+38000+getUniversalDamageFlatBonus(),'explode 38%');
   make('corrompido');check(skill('mage_demon_form').damagePercent===1.38,'demon 138%');
   const setup=()=>{enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');enemy.attack=100;enemy.hp=enemy.maxHp=1000;enemy.mp=enemy.maxMp=1000;resetCombatEffects();enemy.bossAbilities=[];return enemy;};
   const heal={id:'heal',cost:20,fullHeal:true},hit={id:'hit',cost:20,power:200};
   setup();enemy.bossAbilities=[heal,hit];check(CampaignEnemyCombat.choose()?.id==='hit','no wasted full heal');enemy.hp=100;check(CampaignEnemyCombat.choose()?.id==='heal','heal when critically injured');
   setup();enemy.bossAbilities=[{id:'regen',cost:20,regen:.3,turns:3}];check(CampaignEnemyCombat.choose()===null,'save mana when regen unnecessary');enemy.hp=100;check(CampaignEnemyCombat.choose()?.id==='regen','regen with missing hp');
   setup();enemy.bossAbilities=[{id:'shield',cost:20,shield:.4}];enemy.noShieldTurns=2;check(CampaignEnemyCombat.choose()===null,'no blocked shield cast');enemy.noShieldTurns=0;check(CampaignEnemyCombat.choose()?.id==='shield','use useful shield');enemy.shieldValue=500;check(CampaignEnemyCombat.choose()===null,'no redundant shield');
   setup();enemy.mp=0;enemy.bossAbilities=[hit];check(CampaignEnemyCombat.choose()===null,'respect mana');
   setup();player.hp=100;enemy.bossAbilities=[hit,{id:'buff',cost:10,attackBonus:.5,turns:3}];check(CampaignEnemyCombat.choose()?.id==='hit','prefer lethal damage');
   for(const region of Object.keys(regions))for(const template of [...regions[region].enemies,regions[region].boss]){
    enemy=createEnemyFromTemplate(template,template===regions[region].boss,region);resetCombatEffects();
    const a=CampaignEnemyCombat.choose();check(!a||enemy.mp>=a.cost,'affordable choice '+template.name);
   }
   currentMode='battle';isProcessingTurn=false;levelUpPoints=0;pendingLevelUps=0;player.level=70;player.xp=10;player.hp=1000;updateUI();return out;
  });
  await p.locator('#rpgHeroVitals .scene-vital-energy').hover();assert.match(await p.locator('#rpgActionTooltip').innerText(),/Regenera \d+ de mana por turno/);
  await p.locator('#rpgHeroVitals .scene-vital-xp').hover();assert.match(await p.locator('#rpgActionTooltip').innerText(),/Faltam \d+ XP/);
  assert.deepEqual(errors,[]);console.log('PASS',checks.length,'skill and AI checks; mana and XP hover popups');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
