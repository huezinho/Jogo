const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {server,chromium,root}=require('../2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[];
 try{
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.stack));
  await p.route(/\.(png|webp|mp3|svg)(\?|$)/,r=>r.abort());await p.route(/\/character-motion\.js(\?|$)/,r=>r.fulfill({body:'',contentType:'text/javascript'}));
  await p.goto('http://127.0.0.1:'+server.address().port);
  await p.addScriptTag({content:fs.readFileSync(path.join(root,'docs/qa/2026-10-27/class-lab-engine.js'),'utf8')});
  const result=await p.evaluate(()=>{
   const copy=x=>JSON.parse(JSON.stringify(x)),forms=ClassLab.forms,profiles=[],rows=[];
   const regionAt=level=>Object.entries(regions).filter(([r,d])=>d.boss.level<=level).at(-1)?.[0]||'Floresta';
   function setup(f,level,build,armor=true){
    const stats=ClassLab.make(f,level,build,'boss:'+regionAt(level),1);enemy.shieldValue=0;enemy.mp=enemy.maxMp=0;if(!armor)enemy.armor=0;return stats;
   }
   for(const f of forms){
    const level=f.tier===0?29:f.tier===1?59:100;setup(f,level,'equilibrada');
    profiles.push({...f,atLevel:level,active:getSkillInfo(),passive:getUnlockedPassiveSkills().map(s=>({...s,description:getPassiveStatusDescription(s)}))});
    const levels=f.tier===0?[1,10,20,29]:f.tier===1?[30,40,50,59]:[60,70,80,90,100];
    for(const level of levels)for(const build of ['equilibrada','ofensiva','arcana','resistente'])for(const armored of [false,true]){
     const stats=setup(f,level,build,armored),skills=getSkillInfo();
     for(const id of ['basic',...skills.map(s=>s.id)]){
      const values=[];let skill;
      for(let sample=0;sample<16;sample++){
       setup(f,level,build,armored);let seed=100003+sample*7919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
       skill=id==='basic'?null:getSkillInfo().find(s=>s.id===id);
       const before={hp:player.hp,mp:player.mp,e:enemy.hp},available=skill?getSkillActionState(skill).canUse:player.class!=='Mago'||player.mp>=Math.floor(3+.1*level)*3;
       const r=available?(skill?applySkillLocally(skill):getBasicAttackResult()):{blocked:true};
       const dot=(enemy.dotDamagePerTurn||0)*(enemy.dotTurns||0)+(enemy.natureMarkDamage||0)*(enemy.natureMarkTurns||0)*getNatureDotMultiplier()+(enemy.naturePoisonDamage||0)*(enemy.naturePoisonTurns||0)*getNatureDotMultiplier()+(enemy.natureDecayDamage||0)*(enemy.natureDecayTurns||0)*getNatureDotMultiplier();
       values.push({legal:available&&!r.blocked,damage:before.e-enemy.hp,mp:before.mp-player.mp,hpCost:before.hp-player.hp,shield:playerEffects.shieldValue,dot});
      }
      const mean=k=>values.reduce((n,r)=>n+Number(r[k]),0)/values.length;
      rows.push({form:f.id,class:f.className,tier:f.tier,level,build,armored,armor:enemy.armor,stats,id,name:skill?.name||getBasicAttackLabel(),type:skill?.type||'basic',advertised:skill?.damage||0,cost:skill?useSkillCost(skill):player.class==='Mago'?Math.floor(3+.1*level)*3:0,legal:mean('legal'),damage:mean('damage'),dot:mean('dot'),shield:mean('shield'),mp:mean('mp'),hpCost:mean('hpCost')});
     }
    }
   }
   const checks=[];
   function probe(id,level,skillType,configure=()=>{}){
    const f=forms.find(f=>f.id===id);setup(f,level,'equilibrada',false);enemy.maxHp=enemy.hp=10000;configure();
    const skill=getSkillInfo().find(s=>s.type===skillType),before={hp:player.hp,mp:player.mp,e:enemy.hp,cap:getCurrentCaps()},action=getSkillActionState(skill),r=action.canUse?applySkillLocally(skill):{blocked:true};
    checks.push({form:id,level,type:skillType,skill:copy(skill),before,action,result:r,after:{hp:player.hp,mp:player.mp,enemyHp:enemy.hp,shield:playerEffects.shieldValue,fx:copy(playerEffects)},dealt:before.e-enemy.hp});
   }
   probe('mago_incendiario',80,'mage_explode');
   probe('samurai',80,'warrior_armor_piercer',()=>{enemy.armor=100;enemy.shieldValue=200;});
   probe('avatar_da_natureza',80,'nature_true_form',()=>{player.mp--;});
   probe('avatar_da_natureza',80,'nature_true_form');
   probe('atirador_arcano',70,'archer_arcane_shot');
   probe('atirador_arcano',80,'archer_arcane_shot',()=>{player.mp=Math.floor(getCurrentCaps().maxMp*.1);});
   probe('atirador_arcano',80,'archer_overcharge',()=>{player.mp=0;});
   probe('berserker',70,'warrior_warcry');
   probe('druida_sombrio',80,'nature_swamp_collapse');
   probe('druida_sombrio',80,'nature_swamp_collapse',()=>{applyNatureMark(4,80,0);});
   return{forms:profiles,rows,checks};
  });
  if(errors.length)throw Error(errors.join('\n'));
  result.metadata={date:new Date().toISOString(),samples:16,builds:['equilibrada','ofensiva','arcana','resistente'],hashes:Object.fromEntries(['assets/js/game.js','assets/js/data/class-trees.js','assets/js/data/world-data.js','assets/js/systems/equipment-system.js','assets/js/data/equipment-data.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]))};
  fs.writeFileSync(path.join(__dirname,'audit.json'),JSON.stringify(result));
  console.log(JSON.stringify({profiles:result.forms.length,rows:result.rows.length,executions:result.rows.length*16,probes:result.checks.length,errors}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
