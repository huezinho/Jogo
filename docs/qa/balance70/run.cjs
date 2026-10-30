const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),os=require('node:os');
const {server,chromium,root}=require('../2026-10-27/smoke.cjs');
const out=__dirname,stage=process.argv[2]||'pilot';
function write(name,data){fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(data));}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
  browser=await chromium.launch({headless:true,channel:'msedge'});const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route(/\.(png|webp|mp3|svg)(\?|$)/,r=>r.abort());await p.route(/\/character-motion\.js(\?|$)/,r=>r.fulfill({body:'',contentType:'text/javascript'}));await p.route('https://unpkg.com/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));
  await p.goto('http://127.0.0.1:'+server.address().port);
  let labSource=fs.readFileSync(path.join(root,'docs/qa/2026-10-27/class-lab-engine.js'),'utf8').replaceAll('form.tier===2?100','form.tier===2?70').replace('window.ClassLab={','window.ClassLab={choose,canUse,aggregate,');
  // Combat probes never mutate inventory/contracts. Share these two immutable
  // fields while cloning mutable combat state, avoiding copies of farmed loot.
  if(!process.argv.includes('--full-clone'))labSource=labSource
    .replace('const clone=x=>JSON.parse(JSON.stringify(x));',`const clone=x=>{if(x&&x.p&&x.fx&&'rng'in x){const inventory=x.p.inventory,mercenary=x.p.mercenary;const r=JSON.parse(JSON.stringify({...x,p:{...x.p,inventory:null,mercenary:null}}));r.p.inventory=inventory;r.p.mercenary=mercenary;return r;}return JSON.parse(JSON.stringify(x));};`)
    .replace('function snapshot(){return {p:clone(player),e:clone(enemy),fx:clone(playerEffects),rng:randomState,dead:isDead,processing:isProcessingTurn,display:clone(displayState)};}', 'function snapshot(){return clone({p:player,e:enemy,fx:playerEffects,rng:randomState,dead:isDead,processing:isProcessingTurn,display:displayState});}');
  await p.addScriptTag({content:labSource});
  await p.addScriptTag({content:fs.readFileSync(path.join(out,'engine.js'),'utf8')});
  await p.addScriptTag({content:fs.readFileSync(path.join(out,'rotations.js'),'utf8')});
  const meta=await p.evaluate(()=>({forms:ClassLab.forms,builds:ClassLab.builds,policies:Balance70.policies,enemies:Balance70.encounters,catalog:Balance70.catalog()}));
  const finals=meta.forms.filter(f=>f.tier===2);
  if(stage==='pilot'){
    const start=Date.now();const rows=await p.evaluate(async()=>{const rows=[];for(const f of ClassLab.forms.filter(f=>f.tier===2))for(const policy of Balance70.policies)rows.push(await Balance70.group({id:f.id,level:70,build:'equilibrada',policy,enemy:'general_de_aco'},[1,2]));return rows;});write('pilot',{seconds:(Date.now()-start)/1000,rows,errors});console.log(JSON.stringify({seconds:(Date.now()-start)/1000,fights:rows.reduce((s,r)=>s+r.n,0),errors}));
  }
  if(stage==='discovery'){
    write('metadata',{date:'2026-10-30',hashes:Object.fromEntries(['assets/js/game.js','assets/js/data/world-data.js','assets/js/data/class-trees.js','assets/js/systems/equipment-system.js','assets/js/data/equipment-data.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')])),...meta});
    for(const f of finals){const filename=path.join(out,'discovery-'+f.id+'.json');if(fs.existsSync(filename))continue;const start=Date.now();const rows=await p.evaluate(async id=>{const rows=[];for(const build of Object.keys(ClassLab.builds))for(const policy of Balance70.policies)for(const e of Balance70.encounters)rows.push(await Balance70.group({id,level:70,build,policy,enemy:e.id},[11,29,47]));return rows;},f.id);write('discovery-'+f.id,{rows,errors});console.log(JSON.stringify({stage,id:f.id,fights:rows.reduce((s,r)=>s+r.n,0),seconds:(Date.now()-start)/1000}));}
  }
  if(stage==='campaign'||stage==='campaign-pilot'){
    await p.addScriptTag({content:fs.readFileSync(path.join(out,'campaign.js'),'utf8')});
    const configs=finals.flatMap(f=>Object.keys(meta.builds).flatMap(build=>[101,307].map(seed=>({id:f.id,build,seed,policy:'sustentacao'}))));
    const selected=stage==='campaign-pilot'?configs.filter(c=>c.id==='paladino'&&c.build==='equilibrada'&&c.seed===101):configs;
    for(const cfg of selected){const file='campaign-'+cfg.id+'-'+cfg.build+'-'+cfg.seed;if(fs.existsSync(path.join(out,file+'.json')))continue;const start=Date.now();const result=await p.evaluate(cfg=>runCampaign70(cfg),cfg);write(file,result);console.log(JSON.stringify({stage,id:cfg.id,build:cfg.build,seed:cfg.seed,level:result.level,fights:result.fights,reason:result.reason,seconds:(Date.now()-start)/1000}));}
  }
  if(stage==='clone-parity'){
    await p.addScriptTag({content:fs.readFileSync(path.join(out,'campaign.js'),'utf8')});
    const cfg={id:'paladino',build:'equilibrada',seed:101,policy:'sustentacao'},start=Date.now();const actual=await p.evaluate(cfg=>runCampaign70(cfg),cfg),expected=JSON.parse(fs.readFileSync(path.join(out,'campaign-paladino-equilibrada-101.json')));
    const normalize=r=>JSON.stringify(r).replace(/"uid":"[^"]*"/g,'"uid":"ignored"');
    if(normalize(actual)!==normalize(expected))throw Error('Optimized snapshot changed campaign results');write('clone-parity',{pass:true,seconds:(Date.now()-start)/1000,level:actual.level,fights:actual.fights});console.log('PASS clone parity '+actual.fights+' fights');
  }
  if(stage==='checkpoints'){
    for(const cls of ['Guerreiro','Arqueiro','Mago','Adepto da Natureza']){
      const file='checkpoints-'+cls;if(fs.existsSync(path.join(out,file+'.json')))continue;const start=Date.now();
      const rows=await p.evaluate(async cls=>{const rows=[];for(let level=1;level<=70;level++)for(const f of ClassLab.forms.filter(f=>f.className===cls&&f.tier===(level<30?0:level<60?1:2)))for(const build of ['equilibrada','ofensiva','resistente','arcana'])for(const policy of ['dano_direto','sustentacao']){
        const foes=[Balance70.encounters.filter(e=>!e.boss&&e.level<=level).at(-1),Balance70.encounters.find(e=>e.boss&&e.level>=level)];
        for(const e of foes)rows.push(await Balance70.group({id:f.id,level,build,policy,enemy:e.id},[73,101,139]));
      }return rows;},cls);write(file,{rows,errors});console.log(JSON.stringify({stage,cls,fights:rows.reduce((s,r)=>s+r.n,0),seconds:(Date.now()-start)/1000}));
    }
  }
  if(stage==='probes'){
    const start=Date.now(),active=await p.evaluate(()=>ClassLab.probes()),passive=await p.evaluate(()=>ClassLab.passiveProbes());
    write('probes',{active,passive,errors});console.log(JSON.stringify({stage,active:active.length,passive:passive.length,exceptions:active.filter(r=>r.error).length,seconds:(Date.now()-start)/1000}));
  }
  if(stage==='validate'){
    const selections=[];
    for(const f of finals){
      const discovery=JSON.parse(fs.readFileSync(path.join(out,'discovery-'+f.id+'.json'))).rows;
      const ranked=[];for(const build of Object.keys(meta.builds))for(const policy of meta.policies){const rows=discovery.filter(r=>r.build===build&&r.policy===policy&&meta.enemies.some(e=>e.id===r.enemy&&e.boss&&e.level>=60&&e.level<=90));ranked.push({id:f.id,build,policy,score:rows.reduce((s,r)=>s+r.wins/r.n,0),damage:rows.reduce((s,r)=>s+r.damage,0),turns:rows.reduce((s,r)=>s+(r.winTurns||100),0)});}
      ranked.sort((a,b)=>b.score-a.score||b.damage-a.damage||a.turns-b.turns);const best=ranked[0];selections.push(best);
      const file='validation-'+f.id;if(fs.existsSync(path.join(out,file+'.json')))continue;const start=Date.now();
      const rows=await p.evaluate(async best=>{const rows=[];for(const e of Balance70.encounters)rows.push(await Balance70.group({id:best.id,level:70,build:best.build,policy:best.policy,enemy:e.id},Array.from({length:30},(_,i)=>10001+i)));return rows;},best);
      write(file,{selected:best,ranked,rows,errors});console.log(JSON.stringify({stage,id:f.id,build:best.build,policy:best.policy,fights:rows.reduce((s,r)=>s+r.n,0),seconds:(Date.now()-start)/1000}));
    }write('selections',selections);
  }
  if(stage==='equipment'){
    for(const f of finals){const file='equipment-'+f.id;if(fs.existsSync(path.join(out,file+'.json')))continue;const start=Date.now();
      const discovery=await p.evaluate(async id=>{const rows=[];for(const build of Object.keys(ClassLab.builds))for(const policy of Balance70.policies)for(const enemy of ['general_de_aco','lorde_da_cripta','imperador_do_eclipse'])rows.push(await Balance70.group({id,level:70,build,policy,enemy,set:{region:'Fortaleza',rarity:'comum'}},[11,29,47]));return rows;},f.id);
      const ranks=[];for(const build of Object.keys(meta.builds))for(const policy of meta.policies){const rows=discovery.filter(r=>r.build===build&&r.policy===policy);ranks.push({id:f.id,build,policy,score:rows.reduce((s,r)=>s+r.wins/r.n,0),damage:rows.reduce((s,r)=>s+r.damage,0),turns:rows.reduce((s,r)=>s+(r.winTurns||100),0)});}ranks.sort((a,b)=>b.score-a.score||b.damage-a.damage||a.turns-b.turns);const best=ranks[0];
      const rows=await p.evaluate(async best=>{const rows=[];for(const e of Balance70.encounters)rows.push(await Balance70.group({id:best.id,level:70,build:best.build,policy:best.policy,enemy:e.id,set:{region:'Fortaleza',rarity:'comum'}},Array.from({length:30},(_,i)=>10001+i)));return rows;},best);
      write(file,{selected:best,discovery,rows,errors});console.log(JSON.stringify({stage,id:f.id,build:best.build,policy:best.policy,fights:discovery.reduce((s,r)=>s+r.n,0)+rows.reduce((s,r)=>s+r.n,0),seconds:(Date.now()-start)/1000}));
    }
  }
  if(stage==='ablation'){
    for(const f of finals){const file='ablation-'+f.id;if(fs.existsSync(path.join(out,file+'.json')))continue;const best=JSON.parse(fs.readFileSync(path.join(out,'validation-'+f.id+'.json'))).selected;const start=Date.now();
      const rows=await p.evaluate(async best=>{const rows=[];Balance70.setup({id:best.id,level:70,build:best.build,enemy:'general_de_aco',seed:1});const skills=getSkillInfo().map(s=>s.id);for(const enemy of ['general_de_aco','lorde_da_cripta','imperador_do_eclipse'])for(const skill of [null,...skills])for(const mode of (skill?['ban','open']:['baseline']))rows.push(await Balance70.group({id:best.id,level:70,build:best.build,policy:best.policy,enemy,...(mode==='ban'?{ban:skill}:mode==='open'?{open:skill}:{})},Array.from({length:30},(_,i)=>10001+i)));return rows;},best);
      write(file,{selected:best,rows,errors});console.log(JSON.stringify({stage,id:f.id,fights:rows.reduce((s,r)=>s+r.n,0),seconds:(Date.now()-start)/1000}));
    }
  }
  if(stage==='earned'){
    for(const f of finals){const file='earned-'+f.id;if(fs.existsSync(path.join(out,file+'.json')))continue;
      const runs=fs.readdirSync(out).filter(n=>n.startsWith('journey-'+f.id+'-')&&n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync(path.join(out,n)))).filter(r=>r.level===70);
      if(!runs.length){write(file,{id:f.id,selected:null,rows:[],reason:'No continuous run reached70'});continue;}
      const candidates=[];for(const r of runs){const rows=await p.evaluate(async r=>{const rows=[];for(const enemy of ['general_de_aco','lorde_da_cripta','imperador_do_eclipse'])rows.push(await Balance70.group({id:r.id,level:70,build:r.build,policy:r.policy,enemy,gear:r.gear},[11,29,47]));return rows;},r);candidates.push({run:r,score:rows.reduce((s,r)=>s+r.wins/r.n,0),damage:rows.reduce((s,r)=>s+r.damage,0),turns:rows.reduce((s,r)=>s+(r.winTurns||100),0)});}
      candidates.sort((a,b)=>b.score-a.score||b.damage-a.damage||a.turns-b.turns);const best=candidates[0].run;
      const rows=await p.evaluate(async r=>{const rows=[];for(const e of Balance70.encounters)rows.push(await Balance70.group({id:r.id,level:70,build:r.build,policy:r.policy,enemy:e.id,gear:r.gear},Array.from({length:30},(_,i)=>20001+i)));return rows;},best);
      write(file,{selected:{id:best.id,build:best.build,policy:best.policy,seed:best.seed,gear:best.gear},candidates:candidates.map(c=>({build:c.run.build,seed:c.run.seed,score:c.score,damage:c.damage})),rows,errors});console.log(JSON.stringify({stage,id:f.id,build:best.build,fights:rows.reduce((s,r)=>s+r.n,0)}));
    }
  }
  if(stage==='audit'){
    const result=await p.evaluate(async()=>{
      const world=Balance70.encounters.map(e=>{const actual=createEnemyFromTemplate(e.template,e.boss,e.region);return{...e,minLevel:regions[e.region].minLevel,stats:{hp:actual.maxHp,attack:actual.attack,armor:actual.armor,mp:actual.maxMp,maxHpStrikePercent:actual.maxHpStrikePercent},abilities:actual.bossAbilities};});
      const mana=[];for(const id of ['Mago','mago_incendiario','mago_frigido','arquimago','corrompido'])for(const build of ['equilibrada','mana_pura']){
        const level=id==='Mago'?20:70;const cfg={id,level,build,seed:101,enemy:'general_de_aco'};Balance70.setup(cfg);const saved=ClassLab.snapshot();
        for(const enemyMana of ['full','zero']){ClassLab.restore(JSON.parse(JSON.stringify(saved)));if(enemyMana==='zero')enemy.mp=0;const skill=getSkillInfo().find(s=>s.type==='mage_mana_burst'),before={enemyHp:enemy.hp,enemyMp:enemy.mp,mp:player.mp};const r=applySkillLocally(skill);mana.push({id,level,build,enemyMana,cost:useSkillCost(skill),enemyMaxHp:enemy.maxHp,damage:r.damage,drained:before.enemyMp-enemy.mp,mpSpent:before.mp-player.mp});}
      }
      const sets=[];for(const f of ClassLab.forms){const level=f.tier===2?70:f.tier===1?50:20;ClassLab.make(f,level,'equilibrada','dummy',1);const ids=getSkillInfo().map(s=>s.id);for(const region of Object.keys(regions))for(const id of ids){ClassLab.make(f,level,'equilibrada','dummy',601);for(const slot of EquipmentData.slots)player.equipment[slot]={...EquipmentSystem.createItem(region,slot,f.className,'comum'),uid:slot};player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;enemy.hp=enemy.maxHp=1000000;enemy.attack=0;const skill=getSkillInfo().find(s=>s.id===id),legal=getSkillActionState(skill).canUse;let error=null;if(legal){try{await useSkill(getSkillInfo().findIndex(s=>s.id===id));if(![player.hp,player.mp,enemy.hp].every(Number.isFinite))throw Error('Nonfinite');if(playerEffects.lastActionType!==skill.type)throw Error('Blocked');}catch(e){error=e.message;}}sets.push({id:f.id,level,skill:id,region,legal,error});}}
      return{world,mana,sets};
    });write('audit',{...result,errors});console.log(JSON.stringify({stage,sets:result.sets.length,failures:result.sets.filter(r=>r.error),errors}));
  }
  if(stage==='mechanics'){
    const result=await p.evaluate(async()=>{
      const controls=[],original=chooseBossAction;
      try{for(const boss of ['hidra_do_lodo','general_de_aco','lorde_da_cripta'])for(const defense of ['none','skip','dodge','blizzard']){
        Balance70.setup({id:'paladino',level:70,build:'resistente',seed:101,enemy:boss});const skill=enemy.bossAbilities[0];chooseBossAction=()=>skill;
        if(defense==='skip')enemy.skipNextAttack=true;if(defense==='dodge')playerEffects.nextIncomingAutoMiss=true;if(defense==='blizzard'){enemy.blizzardSkipChance=1;enemy.blizzardTurns=3;}
        const before={hp:player.hp,mp:player.mp,enemyMp:enemy.mp};await enemyTurn();controls.push({boss,defense,ability:skill.name,before,after:{hp:player.hp,mp:player.mp,enemyMp:enemy.mp,burnTurns:playerEffects.burnTurns,burnPercent:playerEffects.burnPercent,healReductionTurns:playerEffects.healReductionTurns,healReductionPercent:playerEffects.healReductionPercent,damageDownTurns:playerEffects.damageDownTurns,damageDownPercent:playerEffects.damageDownPercent}});
      }}finally{chooseBossAction=original;}
      const charges=[];for(const n of [0,3,6]){Balance70.setup({id:'arquimago',level:70,build:'equilibrada',seed:101,enemy:'general_de_aco'});addArcaneCharges(n);const percent=getUniversalDamagePercentBonus(),r=getBasicAttackResult();charges.push({n,percent,damage:r.damage});}
      const traces=[];for(const id of ['mago_frigido','avatar_da_natureza','druida_sombrio','espreitador'])for(const enemyId of ['general_de_aco','lorde_da_cripta','imperador_do_eclipse']){const cfg={id,level:70,build:id==='mago_frigido'?'mana_pura':'ofensiva',policy:'sustentacao',enemy:enemyId,seed:10001,set:{region:'Fortaleza',rarity:'comum'},trace:true};traces.push({cfg,result:await Balance70.fight(cfg)});}
      return{controls,charges,traces};
    });write('mechanics',{...result,errors});console.log(JSON.stringify({stage,controls:result.controls,charges:result.charges,errors}));
  }
  if(stage==='progression-checks'||stage==='journey-checks'){
    const family={warrior:'Guerreiro',mage:'Mago',archer:'Arqueiro',nature:'Adepto da Natureza'}[process.argv[3]];
    for(const f of finals.filter(f=>!family||f.className===family))for(const build of ['equilibrada','ofensiva','resistente','arcana']){
      const source=(stage==='journey-checks'?'journey-':'campaign-')+f.id+'-'+build+'-101.json',file=(stage==='journey-checks'?'journey-levels-':'earned-levels-')+f.id+'-'+build;
      if(!fs.existsSync(path.join(out,source))||fs.existsSync(path.join(out,file+'.json')))continue;const run=JSON.parse(fs.readFileSync(path.join(out,source)));
      const rows=await p.evaluate(async run=>{const rows=[];for(const c of run.checkpoints){const foes=[Balance70.encounters.filter(e=>!e.boss&&e.level<=c.level).at(-1),Balance70.encounters.find(e=>e.boss&&e.level>=c.level)];for(const policy of ['dano_direto','sustentacao'])for(const e of foes)rows.push(await Balance70.group({id:run.id,level:c.level,build:run.build,policy,enemy:e.id,gear:c.gear},[1001,1002,1003]));}return rows;},run);
      write(file,{source,rows,errors});console.log(JSON.stringify({stage,id:f.id,build,levels:run.checkpoints.length,fights:rows.reduce((s,r)=>s+r.n,0)}));
    }
  }
  if(stage==='rotations'){
    for(const f of finals){const file='rotations-'+f.id;if(fs.existsSync(path.join(out,file+'.json')))continue;
      const previous=JSON.parse(fs.readFileSync(path.join(out,'validation-'+f.id+'.json'))).selected;
      const discovery=await p.evaluate(async c=>{const rows=[];for(const build of Object.keys(ClassLab.builds))for(const policy of ['combo:nivel70_0','combo:nivel70_1'])for(const enemy of ['arauto_do_vazio','general_de_aco','lorde_da_cripta','imperador_do_eclipse'])rows.push(await Balance70.group({id:c.id,level:70,build,policy,enemy},[11,29,47]));return rows;},f);
      const ranks=[];for(const build of Object.keys(meta.builds))for(const policy of ['combo:nivel70_0','combo:nivel70_1']){const rows=discovery.filter(r=>r.build===build&&r.policy===policy);ranks.push({id:f.id,build,policy,score:rows.reduce((s,r)=>s+r.wins/r.n,0),damage:rows.reduce((s,r)=>s+r.damage,0),turns:rows.reduce((s,r)=>s+(r.winTurns||100),0)});}ranks.sort((a,b)=>b.score-a.score||b.damage-a.damage||a.turns-b.turns);const best=ranks[0];
      const improve=best.score>previous.score||(best.score===previous.score&&best.damage>previous.damage)||(best.score===previous.score&&best.damage===previous.damage&&best.turns<previous.turns);
      const rows=improve?await p.evaluate(async best=>{const rows=[];for(const e of Balance70.encounters)rows.push(await Balance70.group({id:best.id,level:70,build:best.build,policy:best.policy,enemy:e.id},Array.from({length:30},(_,i)=>10001+i)));return rows;},best):[];
      write(file,{selected:best,improve,previous,discovery,rows,errors});console.log(JSON.stringify({stage,id:f.id,improve,build:best.build,policy:best.policy,fights:discovery.reduce((s,r)=>s+r.n,0)+rows.reduce((s,r)=>s+r.n,0)}));
    }
  }
  if(stage==='journey'){
    await p.addScriptTag({content:fs.readFileSync(path.join(out,'campaign.js'),'utf8')});
    const family={warrior:'Guerreiro',mage:'Mago',archer:'Arqueiro',nature:'Adepto da Natureza'}[process.argv[3]];
    for(const f of finals.filter(f=>!family||f.className===family))for(const build of Object.keys(meta.builds))for(const seed of [101,307]){
      const file='journey-'+f.id+'-'+build+'-'+seed;if(fs.existsSync(path.join(out,file+'.json')))continue;
      const start=Date.now(),cfg={id:f.id,build,seed,policy:'pragmatica',pragmatic:true};const result=await p.evaluate(cfg=>runCampaign70(cfg),cfg);write(file,result);console.log(JSON.stringify({stage,id:f.id,build,seed,level:result.level,fights:result.fights,reason:result.reason,seconds:(Date.now()-start)/1000}));
    }
  }
  if(stage==='frontier'){
    const family={warrior:'Guerreiro',mage:'Mago',archer:'Arqueiro',nature:'Adepto da Natureza'}[process.argv[3]];
    for(const f of finals.filter(f=>!family||f.className===family)){const file='frontier-'+f.id;if(fs.existsSync(path.join(out,file+'.json')))continue;
      const runs=fs.readdirSync(out).filter(n=>n.startsWith('journey-'+f.id+'-')&&n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync(path.join(out,n)))).filter(r=>r.level===70);
      const candidates=[];
      for(const r of runs)for(const policy of [...meta.policies,'pragmatica','combo:nivel70_0','combo:nivel70_1']){
        const cfg={id:r.id,level:70,build:r.build,policy,gear:r.gear};
        const rows=await p.evaluate(async cfg=>{const rows=[];for(const enemy of ['general_de_aco','lorde_da_cripta','imperador_do_eclipse'])rows.push(await Balance70.group({...cfg,enemy},[11,29,47]));return rows;},cfg);
        candidates.push({cfg,seed:r.seed,score:rows.reduce((s,r)=>s+r.wins/r.n,0),damage:rows.reduce((s,r)=>s+r.damage,0),turns:rows.reduce((s,r)=>s+(r.winTurns||100),0)});
      }
      candidates.sort((a,b)=>b.score-a.score||b.damage-a.damage||a.turns-b.turns);const best=candidates[0];
      const rows=await p.evaluate(async cfg=>{const rows=[];for(const e of Balance70.encounters)rows.push(await Balance70.group({...cfg,enemy:e.id},Array.from({length:30},(_,i)=>30001+i)));return rows;},best.cfg);
      write(file,{selected:{...best.cfg,seed:best.seed},candidates:candidates.map(c=>({build:c.cfg.build,policy:c.cfg.policy,seed:c.seed,score:c.score,damage:c.damage})),rows,errors});console.log(JSON.stringify({stage,id:f.id,build:best.cfg.build,policy:best.cfg.policy,fights:rows.reduce((s,r)=>s+r.n,0)+candidates.length*9}));
    }
  }
  if(errors.length)throw Error(errors.join('\n'));
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
