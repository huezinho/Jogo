const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../docs/qa/2026-10-27/class-lab-engine.js'),'utf8')});
 const result=await page.evaluate(async()=>{
 let checks=0;const check=(ok,message)=>{if(!ok)throw Error(message);checks++;};
 const all=Object.entries(regions).flatMap(([region,r])=>[...r.enemies.map(t=>({t,region,boss:false})),{t:r.boss,region,boss:true}]);check(all.length===48,'48 enemies');
 for(const {t,region,boss}of all){const e=createEnemyFromTemplate(t,boss,region),expected=campaignEnemyTotalsByName[t.name];check(e.maxHp===expected.hp&&e.attack===expected.attack&&e.armor===expected.armor&&e.maxMp===expected.mp&&e.maxHpStrikePercent===expected.impact,t.name+' exact totals');}
 ClassLab.make(ClassLab.forms.find(f=>f.id==='mago_incendiario'),100,'equilibrada','dummy',123);enemy.hp=enemy.maxHp=100000;enemy.armor=0;player.mp=100000;
 const fire=getSkillInfo().find(s=>s.type==='mage_fireball');applySkillLocally(fire);applySkillLocally(fire);check(enemy.burnStacks.length===2,'fireball stacks');check(enemy.dotTurns===0,'burn not generic overwrite');
 enemy.burnStacks=[];syncPeriodicStacks(enemy,'burn');applyBurning(enemy,10,2,'A');applyBurning(enemy,20,3,'B');check(tickPeriodicStacks(enemy,'burn')===30,'sum1');check(tickPeriodicStacks(enemy,'burn')===30,'sum2');check(tickPeriodicStacks(enemy,'burn')===20,'independent expiry');check(enemy.burnTurns===0,'expired');
 addPeriodicStack(enemy,'poison',5,3,'Presa');addPeriodicStack(enemy,'poison',9,2,'Gosma');check(tickPeriodicStacks(enemy,'poison')===14,'poison sum');check(tickPeriodicStacks(enemy,'poison')===14,'poison sum2');check(tickPeriodicStacks(enemy,'poison')===5,'poison expiry');
 applyBurning(enemy,11,3,'A');applyBurning(enemy,22,4,'B');const effects=getEnemyStatusEffects(enemy).filter(e=>e.text==='Queimadura (DOT)');check(effects.length===1&&effects[0].details.includes('11 dano/turno')&&effects[0].details.includes('22 dano/turno'),'single tooltip all stacks');
 const target=JSON.parse(JSON.stringify(enemy));syncPeriodicStacks(target,'burn');check(target.burnStacks.length===2&&target.burnDamagePerTurn===33,'JSON roundtrip');
 enemy.naturePoisonTurns=0;enemy.naturePoisonDamage=0;enemy.naturePoisonStacks=[];applyNaturePoison(10,2);applyNaturePoison(20,3);check(applyNatureDotTick('Veneno','naturePoisonDamage','naturePoisonTurns',false)===30,'natural poison sums');check(applyNatureDotTick('Veneno','naturePoisonDamage','naturePoisonTurns',false)===30,'natural poison second tick');check(applyNatureDotTick('Veneno','naturePoisonDamage','naturePoisonTurns',false)===20,'natural poison independent expiry');
 enemy.naturePoisonStacks=[];applyNaturePoison(10,2);applyNaturePoison(20,3);check(consumeNatureDotsForDamage(true)===80&&enemy.naturePoisonStacks.length===0,'natural poison consumption exact remaining damage');
 enemy.burnStacks=[];syncPeriodicStacks(enemy,'burn');applyBurning(enemy,5,2,'A');applyBurning(enemy,5,3,'B');check(tickPeriodicStacks(enemy,'burn',damage=>Math.floor(damage*1.1))===10,'damage modifiers round per independent application');
 return{checks};});assert.deepEqual(errors,[]);console.log('PASS stacking DOTs and explicit enemy totals',result);
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
