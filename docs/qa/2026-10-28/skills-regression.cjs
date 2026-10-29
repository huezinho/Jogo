const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {server,root,chromium}=require('../2026-10-27/smoke.cjs');
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:'msedge'}),report={checks:[],errors:[]};
 const oldFiles=new Map();const old=file=>{if(!oldFiles.has(file))oldFiles.set(file,cp.execFileSync('git',['show','HEAD:'+file],{cwd:root,encoding:'utf8'}));return oldFiles.get(file);};
 async function page(baseline=false,arena=false){
  const ctx=await browser.newContext(),p=await ctx.newPage();p.on('pageerror',e=>report.errors.push({baseline,error:e.message}));
  await p.route('https://unpkg.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await p.route(/\.(png|webp|jpg|mp3)(\?|$)/,r=>r.abort());
  if(baseline){await p.route('**/__baseline__.html',r=>r.fulfill({contentType:'text/html',body:old('index.html')}));await p.route('**/assets/js/**',r=>{const file=new URL(r.request().url()).pathname.slice(1);return r.fulfill({contentType:'text/javascript',body:old(file)});});}
  await p.goto(base+(baseline?'/__baseline__.html':arena?'/arena.html':'/index.html'));
  return {ctx,p};
 }
 const a=await page(true),b=await page();
 const definitions=p=>p.evaluate(()=>({skillSource:getSkillInfo.toString().replace(/\r\n/g,'\n'),classes,subclasses:subclassChoicesByClass,gains:Array.from({length:100},(_,i)=>['strength','wisdom','vitality'].map(a=>getAttributePointGain(a,i+1)))}));
 const baseline=await definitions(a.p),current=await definitions(b.p);
 assert.deepEqual(current,baseline,'Skill coefficients, class stats/subclass bonuses or point gain changed vs HEAD');
 report.checks.push({name:'unchanged skill definitions, class stats/subclass bonuses, all point gains1..100',pass:true});await a.ctx.close();
 await b.p.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../2026-10-27/class-lab-engine.js'),'utf8')});
 const mechanics=await b.p.evaluate(async()=>{
  const form=id=>ClassLab.forms.find(f=>f.id===id),clone=x=>JSON.parse(JSON.stringify(x));const rows=[];const random=Math.random;
  function setup(id='arquimago'){ClassLab.make(form(id),100,'equilibrada','dummy');enemy.hp=enemy.maxHp=10000000;enemy.armor=0;enemy.attack=0;Math.random=()=>.99;}
  setup();const zero=getBasicAttackResult().damage;
  setup();addArcaneCharges(3);const three=getBasicAttackResult().damage;rows.push({name:'single15percent',zero,three,ratio:three/zero});
  setup();const activeAttack=getActiveAttack(),flat=getUniversalDamageFlatBonus(),missiles=13;
  const min=5+Math.floor(activeAttack*.2),max=5+Math.floor(activeAttack*.5),rolled=min+Math.floor(.99*(max-min+1));
  const damage=getBasicAttackResult().damage;rows.push({name:'flat once per missile action',flat,damage,expected:missiles*rolled+flat,missiles,rolled});
  setup('sniper');rows.push({name:'sniper intended crit',chance:getArcherCritChanceBonus()});
  setup('paladino');enemy.attack=10000;const incoming=applyIncomingDamage,rounds=[];
  applyIncomingDamage=function(...args){const r=incoming(...args);rounds.push(r.damage);return r;};
  try{await useSkill(getSkillInfo().findIndex(s=>s.type==='warrior_faith_shield'));await passTurn();await passTurn();await passTurn();}finally{applyIncomingDamage=incoming;}
  rows.push({name:'faith protects3responses',rounds});
  setup('samurai');await useSkill(getSkillInfo().findIndex(s=>s.type==='warrior_ultrasonic_cuts'));const counts=[playerEffects.forcedBasicTurns];
  for(let i=0;i<3;i++){await attack();counts.push(playerEffects.forcedBasicTurns);}
  rows.push({name:'ultra allows3basic actions',counts,untouchable:playerEffects.basicOnlyUntouchableTurns});
  setup('berserker');enemy.isBoss=true;enemy.bossAbilities=[{name:'Controle de teste',type:'attack',cost:0,power:1,variance:0,targetSkipChance:1}];enemy.mp=enemy.maxMp=1000;
  await useSkill(getSkillInfo().findIndex(s=>s.type==='warrior_unstoppable'));const immune=[{turns:playerEffects.controlImmuneTurns,skip:playerEffects.skipNextTurn}];
  for(let i=0;i<4;i++){await attack();immune.push({turns:playerEffects.controlImmuneTurns,skip:playerEffects.skipNextTurn});}
  rows.push({name:'unstoppable protects4enemyresponses',immune});
  setup('corrompido');player.noShieldTurns=2;playerEffects.shieldValue=0;
  const blockedIncoming=applyIncomingDamage(100,{ignorePreciousMana:true,ignoreFlatReduction:true}),blockedShield=playerEffects.shieldValue;
  player.noShieldTurns=0;const allowedIncoming=applyIncomingDamage(100,{ignorePreciousMana:true,ignoreFlatReduction:true});
  rows.push({name:'corruption blocks passive Overflowing shield in campaign',damage:blockedIncoming.damage,blockedShield,allowedDamage:allowedIncoming.damage,allowedShield:playerEffects.shieldValue});
  const invalidActions=[];
  const invalidState=()=>({hp:player.hp,mp:player.mp,burnTurns:playerEffects.burnTurns,burnDamage:playerEffects.burnDamagePerTurn,skip:playerEffects.skipNextTurn,forced:playerEffects.forcedBasicTurns,processing:isProcessingTurn,enemyHp:enemy.hp});
  for(const kind of ['skill-no-mana','basic-no-mana','skill-forced-basic']){
   setup('arquimago');player.mp=kind==='skill-forced-basic'?getCurrentCaps().maxMp:0;playerEffects.burnTurns=3;playerEffects.burnDamagePerTurn=10;playerEffects.skipNextTurn=true;playerEffects.forcedBasicTurns=kind==='skill-no-mana'?0:3;
   const before=invalidState();if(kind==='basic-no-mana')await attack();else await useSkill(0);invalidActions.push({kind,before,after:invalidState()});
  }
  rows.push({name:'invalid campaign actions preserve DOT control buffs and turn',invalidActions});Math.random=random;
  return rows;
 });
 assert(Math.abs(mechanics[0].ratio-1.15)<.002,JSON.stringify(mechanics[0]));assert.equal(mechanics[1].damage,mechanics[1].expected);assert(Math.abs(mechanics[2].chance-.35)<1e-9);
 assert.deepEqual(mechanics[3].rounds.slice(0,3),[0,0,0]);assert(mechanics[3].rounds[3]>0,JSON.stringify(mechanics[3]));assert.deepEqual(mechanics[4].counts,[3,2,1,0]);assert.equal(mechanics[4].untouchable,0);
 assert(mechanics[5].immune.slice(0,4).every(x=>!x.skip),JSON.stringify(mechanics[5]));assert.equal(mechanics[5].immune[4].skip,true,JSON.stringify(mechanics[5]));
 assert(mechanics[6].damage>0);assert.equal(mechanics[6].blockedShield,0);assert.equal(mechanics[6].allowedShield,mechanics[6].allowedDamage);
 for(const item of mechanics[7].invalidActions)assert.deepEqual(item.after,item.before,item.kind);
 report.mechanics=mechanics;report.checks.push({name:'eight corrected mechanic invariants',pass:true});
 const coverage=await b.p.evaluate(async()=>{
  let cases=0,executed=0;const names=new Set(),forms=new Set(),sets=new Set(),thresholds=new Set(),failures=[];
  const originalApply=applySkillLocally;
  applySkillLocally=function(...args){const result=originalApply(...args);if(!result.blocked)executed++;return result;};
  const finite=value=>typeof value==='number'?Number.isFinite(value):Array.isArray(value)?value.every(finite):value&&typeof value==='object'?Object.values(value).every(finite):true;
  function equip(region,count,form){player.equipment=Object.fromEntries(equipmentSlots.map(s=>[s,null]));for(const slot of EquipmentData.slots.slice(0,count)){const item=EquipmentSystem.createItem(region,slot,form.className,'arcano','rara');item.uid=region+'-'+slot;player.equipment[slot]=item;}}
  for(const form of ClassLab.forms){const level=form.tier===2?100:form.tier===1?50:20;ClassLab.make(form,level,'equilibrada','dummy');const descriptors=getSkillInfo().map(s=>({id:s.id,name:s.name}));
   for(const region of Object.keys(EquipmentData.sets))for(const count of [2,4,5]){
    ClassLab.make(form,level,'equilibrada','dummy');equip(region,count,form);
    const totals=getPreviewStats(),bonuses=getActiveSetBonuses();if(!finite(totals)||!finite(bonuses)||bonuses.sets[0]?.count!==count)failures.push({form:form.name,region,count,error:'set count/stat'});
    sets.add(region);thresholds.add(count);
    for(const desc of descriptors)for(const condition of ['prepared','resources']){
     ClassLab.make(form,level,'equilibrada','dummy');equip(region,count,form);enemy.hp=enemy.maxHp=10000000;enemy.attack=0;enemy.armor=0;
     player.maxMp+=20000;player.mp=getCurrentCaps().maxMp;player.hp=getCurrentCaps().maxHp;
     if(condition==='prepared'){playerEffects.arcaneCharges=6;playerEffects.arcaneChargeTurns=3;playerEffects.natureCadence=3;playerEffects.shieldValue=400;playerEffects.lastActionType='archer_camouflage';enemy.natureMarkTurns=4;enemy.natureMarkDamage=100;enemy.naturePoisonTurns=4;enemy.naturePoisonDamage=100;enemy.natureDecayTurns=4;enemy.natureDecayDamage=100;enemy.rootedTurns=3;enemy.attackDownTurns=3;enemy.attackDownPercent=.3;}
     const index=getSkillInfo().findIndex(s=>s.id===desc.id),before=executed;try{await useSkill(index);if(executed!==before+1)throw Error('skill did not execute');if(!finite(player)||!finite(enemy)||!finite(playerEffects))throw Error('non-finite state');}catch(e){failures.push({form:form.name,region,count,skill:desc.name,condition,error:e.message});}
     cases++;names.add(desc.name);forms.add(form.id);
    }
   }
  }
  applySkillLocally=originalApply;
  return {cases,executed,activeNames:names.size,forms:forms.size,sets:sets.size,thresholds:[...thresholds],failures};
 });
 assert.equal(coverage.forms,28);assert.equal(coverage.activeNames,59);assert.equal(coverage.sets,12);assert.deepEqual(coverage.thresholds,[2,4,5]);assert.equal(coverage.failures.length,0,JSON.stringify(coverage.failures.slice(0,5)));report.coverage=coverage;
 await b.ctx.close();
 const online=await page(false,true);await online.p.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../2026-10-27/class-lab-engine.js'),'utf8')});
 const antiShield=await online.p.evaluate(()=>{
  const clone=x=>JSON.parse(JSON.stringify(x)),f=id=>ClassLab.forms.find(x=>x.id===id),rows=[];
  for(const targetId of ['arquimago','protetor_da_floresta']){
   ClassLab.make(f(targetId),100,'equilibrada','dummy');const target=clone(player),shieldIndex=getSkillInfo().findIndex(s=>s.type===(targetId==='arquimago'?'mage_mana_shield':'nature_vine_cocoon'));
   target.maxHp=target.hp=100000;ClassLab.make(f('corrompido'),100,'equilibrada','dummy');const attacker=clone(player);
   arenaMultiplayer={...createArenaMultiplayerState(),peer:{id:'host'},isHost:true,heroStates:{host:attacker,guest:target},fighters:{host:{id:'host'},guest:{id:'guest'}},connections:{},lastSeen:{},processedActions:[],revision:0};
   ArenaSystem.captureCampaign();startArenaDuel();arenaMultiplayer.turnId='host';const index=getSkillInfo().findIndex(s=>s.type==='mage_corruption');arenaUseSkill(index);
   const hero=arenaMultiplayer.heroStates.guest,noShield=hero.noShieldTurns;
   hero.dotDamagePerTurn=1;hero.dotTurns=3;const hp=hero.hp,revision=arenaMultiplayer.revision;
   ArenaSystem.handleHostMessage({peer:'guest',send(){}},{type:'arena_action',kind:'skill',skillIndex:shieldIndex,duelId:arenaMultiplayer.duelId,revision:arenaMultiplayer.revision,actionId:'shield-'+targetId});
   rows.push({targetId,noShield,shield:hero.effects.shieldValue,hp,afterHp:hero.hp,revision,afterRevision:arenaMultiplayer.revision,dotTurns:hero.dotTurns});
  }
  ClassLab.make(f('corrompido'),100,'equilibrada','dummy');const passiveTarget=clone(player);ClassLab.make(f('Guerreiro'),20,'equilibrada','dummy');const passiveAttacker=clone(player);
  arenaMultiplayer={...createArenaMultiplayerState(),peer:{id:'host'},isHost:true,heroStates:{host:passiveAttacker,guest:passiveTarget},fighters:{host:{id:'host'},guest:{id:'guest'}},connections:{},lastSeen:{},processedActions:[],revision:0};
  ArenaSystem.captureCampaign();startArenaDuel();arenaMultiplayer.turnId='host';const passiveHero=arenaMultiplayer.heroStates.guest;passiveHero.noShieldTurns=2;passiveHero.effects.shieldValue=0;
  const passiveResult=resolveArenaIncomingDamage(passiveHero,100,{ignorePreciousMana:true,ignoreFlatReduction:true});rows.push({targetId:'corrompido-passive',noShield:passiveHero.noShieldTurns,shield:passiveHero.effects.shieldValue,damage:passiveResult.damage});
  return rows;
 });
 assert(antiShield.every(x=>x.noShield>0&&x.shield===0),JSON.stringify(antiShield));assert(antiShield.slice(0,2).every(x=>x.hp===x.afterHp&&x.revision===x.afterRevision&&x.dotTurns===3),JSON.stringify(antiShield));assert(antiShield[2].damage>0);report.antiShield=antiShield;await online.ctx.close();
 await browser.close();server.close();assert.equal(report.errors.length,0,JSON.stringify(report.errors));fs.writeFileSync(path.join(__dirname,'skills-regression-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({mechanics,coverage:{...coverage,failures:coverage.failures.length},antiShield},null,2));
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
