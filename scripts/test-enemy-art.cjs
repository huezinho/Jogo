const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium,root}=require('../docs/qa/2026-10-27/smoke.cjs');
const out=path.join(root,'docs/qa/2026-11-04-art');fs.mkdirSync(out,{recursive:true});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
 const report={errors:[],badResponses:[],layouts:[],effects:[]};
 try{
  const page=await browser.newPage({viewport:{width:1366,height:960}});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.badResponses.push({status:r.status(),url:r.url()});});
  await page.goto(base+'/docs/arte/inimigos/index.html');
  const coverage=await page.evaluate(async()=>{
   const data=Object.entries(EnemyArt).filter(([,a])=>!a.egg),phases=[1,2,3].map(n=>data.filter(([,a])=>a.phase===n).length);
   const errors=[];let decoded=0;
   const urls=new Set();
   for(const[key,a]of data){
    urls.add(key==='avatar-do-zenith'?ZenithMotion.spritePath():EnemyMotion.spritePath(key));
    if(a.phase===1){const p=EnemyMotion.profile(key,{id:'invented'});if(a.rows!==1||p.key||p.row!==0||Object.keys(a.skills).length)errors.push('Invented cast '+key);}
    for(const[id,spec]of Object.entries(a.skills)){
     urls.add('assets/visual/enemy-fx/'+spec.key+'.webp');
     if(key!=='avatar-do-zenith'){const p=EnemyMotion.profile(key,{id});if(!p.key||p.row<1||p.row>=a.rows)errors.push('Missing skill '+key+':'+id);}
    }
    for(const[id,spec]of Object.entries(a.passives)){
     urls.add('assets/visual/enemy-fx/'+spec.key+'.webp');
     if(EnemyMotion.profile(key,{id}).row!==0)errors.push('Passive casts '+key+':'+id);
    }
   }
   urls.add(EnemyMotion.spritePath('fenix-sombria-ovo'));
   for(const k of ['corrompido-demonio','fada-monarca-coroada','avatar-da-natureza-verdadeira'])urls.add(CharacterMotion.heroPath(k));
   await Promise.all([...urls].map(async url=>{const im=new Image();im.src=new URL(url,document.baseURI).href;try{await im.decode();decoded++;}catch{errors.push('Decode '+url);}}));
   return {phases,errors,decoded};
  });
  assert.deepEqual(coverage.phases,[20,16,12]);assert.deepEqual(coverage.errors,[]);report.coverage=coverage;
  for(const width of [320,390,1366]){
   await page.setViewportSize({width,height:960});
   for(const phase of [1,2,3]){
    await page.click(`[data-phase="${phase}"]`);const keys=await page.locator('#enemyPick option').evaluateAll(options=>options.map(o=>o.value));
    for(const key of keys){
     await page.selectOption('#enemyPick',key);
     const layout=await page.evaluate(()=>{const e=document.querySelector('#enemySpriteBox .sheet-sprite').getBoundingClientRect(),s=document.querySelector('.battle-scene').getBoundingClientRect();return{key:document.getElementById('enemyPick').value,width:innerWidth,scroll:document.documentElement.scrollWidth,inside:e.left>=s.left-1&&e.right<=s.right+1&&e.top>=s.top-1&&e.bottom<=s.bottom+1,hero:document.querySelector('#heroSpriteBox .sheet-sprite').getBoundingClientRect().height,enemy:e.height};});
     assert.equal(layout.scroll,width,'Horizontal overflow '+key);assert(layout.inside,'Clipped sprite '+JSON.stringify(layout));
     if(phase===3)assert(layout.enemy>layout.hero*1.2,'Boss size '+key);
     report.layouts.push(layout);
    }
   }
   await page.selectOption('#enemyPick','ent-ancestral');await page.screenshot({path:path.join(out,`ent-${width}.png`),fullPage:true});
  }
  await page.setViewportSize({width:1366,height:960});
  for(const[key,id]of [['ent-ancestral','roots'],['hidra-do-lodo','viscous'],['soberano-do-paradoxo','time'],['avatar-do-zenith','judgment']]){
   await page.selectOption('#enemyPick',key);
   const promise=page.evaluate(id=>playEnemySample(id),id);
   const selector=key==='avatar-do-zenith'?'.zenith-spell-fx':'.enemy-painted-fx';
   await page.waitForSelector(selector);
   await page.waitForTimeout(350);
   const fx=await page.locator(selector).first().evaluate(el=>({key:el.dataset.enemyEffect||el.dataset.zenithEffect,frame:Number(el.dataset.frame)}));
   assert(fx.frame>=1,'Effect progression '+key);report.effects.push(fx);await promise;
   assert.equal(await page.locator(selector).count(),0,'Effect cleanup');
  }
  await page.click('[data-phase="2"]');await page.selectOption('#enemyPick','slime-toxico');
  const reactive=page.evaluate(()=>{const motion=EnemyMotion.passive('toxicity');const box=document.getElementById('enemySpriteBox');box.innerHTML=box.innerHTML;return motion;});
  await page.waitForSelector('[data-enemy-effect="slime-toxico-toxicity"]');await reactive;
  await page.click('[data-phase="2"]');await page.selectOption('#enemyPick','fenix-sombria');
  const hatch=page.evaluate(()=>playEnemySample('egg'));
  await page.waitForSelector('[data-enemy-art="fenix-sombria-ovo"]');
  await page.waitForTimeout(350);await page.screenshot({path:path.join(out,'phoenix-egg.png'),fullPage:true});
  await hatch;assert.equal(await page.locator('#enemySpriteBox [data-enemy-art="fenix-sombria"]').count(),1);
  await page.emulateMedia({reducedMotion:'reduce'});
  const counts=await page.evaluate(async()=>{
   let physical=0,skills=0,passives=0;
   for(const[key,a]of Object.entries(EnemyArt).filter(([,a])=>!a.egg)){
    choosePhase(a.phase);pick.value=key;showEnemy(key);
    await playEnemySample('basic');physical++;
    for(const id of Object.keys(a.skills)){await playEnemySample(id);skills++;}
    for(const id of Object.keys(a.passives)){await playEnemySample('passive:'+id);passives++;}
   }
   return{physical,skills,passives,remainingEffects:document.querySelectorAll('.enemy-painted-fx,.zenith-spell-fx').length};
  });
  assert.equal(counts.physical,48);assert.equal(counts.skills,35);assert.equal(counts.remainingEffects,0);report.actions=counts;
  // Exercise the real combat renderer and native transformation flags, not gallery-only markup.
  await page.goto(base);await page.evaluate(()=>selectClass('Guerreiro'));
  const native=await page.evaluate(async()=>{
   const errors=[];let bodies=0;
   for(const[region,r]of Object.entries(regions))for(const[t,boss]of [...r.enemies.map(t=>[t,false]),[r.boss,true]]){
    enemy=createEnemyFromTemplate(t,boss,region);updateUI();
    const el=document.querySelector('#enemySpriteBox .sheet-sprite.enemy-painted,#enemySpriteBox .sheet-sprite.zenith-painted');if(!el)errors.push(t.name);else bodies++;
    await playSpriteAttackAnimation('enemy','attack',false);
   }
   const formCases=[['corrompido','Mago','visualDemonTurns','corrompido-demonio'],['fada-monarca','Adepto da Natureza','natureCrownedTurns','fada-monarca-coroada'],['avatar-da-natureza','Adepto da Natureza','natureTrueFormTurns','avatar-da-natureza-verdadeira']];
   const actual=[];
   for(const[key,cls,flag,expected]of formCases){player.class=cls;playerEffects=createDefaultPlayerEffects();playerEffects[flag]=3;const selected=CharacterMotion.formKey(player,key);actual.push(selected);if(selected!==expected)errors.push('Form '+key);playerEffects[flag]=0;if(CharacterMotion.formKey(player,key)!==key)errors.push('Expired '+key);}
   return{errors,bodies,forms:actual};
  });
  assert.deepEqual(native.errors,[]);assert.equal(native.bodies,48);report.native=native;
  report.native.phoenix=await page.evaluate(async()=>{
   enemy=createEnemyFromTemplate(regions.Vulcao.enemies[2],false,'Vulcao');
   playerEffects=createDefaultPlayerEffects();player.hp=100000;
   updateUI();enemy.hp=0;CampaignEnemyCombat.beforeDeath();updateUI();
   if(!document.querySelector('#enemySpriteBox [data-enemy-art="fenix-sombria-ovo"]'))throw Error('Native phoenix did not become an egg');
   const rest=[];
   for(let n=0;n<3;n++){
    await CampaignEnemyCombat.turn();
    const egg=!!document.querySelector('#enemySpriteBox [data-enemy-art="fenix-sombria-ovo"]');
    rest.push(egg?'egg':'phoenix');
    if(egg!==(n<2))throw Error('Wrong phoenix rest appearance '+n);
   }
   return {rest,resurrected:enemy.campaignState.revived};
  });
  await page.evaluate(()=>window.nativeArtUI={updateUI});
  await page.addScriptTag({content:fs.readFileSync(path.join(root,'docs/qa/2026-10-27/class-lab-engine.js'),'utf8')});
  const activated=await page.evaluate(()=>{
   const results=[];updateUI=nativeArtUI.updateUI;
   for(const[id,type,expected]of [['corrompido','mage_demon_form','corrompido-demonio'],['fada_monarca','nature_crown','fada-monarca-coroada'],['avatar_da_natureza','nature_true_form','avatar-da-natureza-verdadeira']]){
    ClassLab.make(ClassLab.forms.find(f=>f.id===id),100,'equilibrada','dummy',123);
    enemy=createEnemyFromTemplate(regions.Floresta.enemies[0],false,'Floresta');
    const skill=getSkillInfo().find(s=>s.type===type);if(!skill)throw Error('Missing transformation '+id);
    player.mp=100000;applySkillLocally(skill);updateUI();
    if(getHeroCombatAssetKey()!==expected)throw Error('Native transform '+id);
    if(id==='corrompido'){applyIncomingDamage(1);if(getHeroCombatAssetKey()!==expected)throw Error('First-hit passive erased demon form');}
    const image=document.querySelector('#heroSpriteBox .hero-v2').style.getPropertyValue('--sprite-url');
    if(!image.includes('/hero-forms/'+expected+'.webp'))throw Error('Native transformed sprite '+id);
    for(let n=0;n<skill.turns+2;n++)decayPlayerBuffs();
    if(getHeroCombatAssetKey()===expected)throw Error('Native form did not expire '+id);
    results.push({id,skill:type,turns:skill.turns,restored:true});
   }
   return results;
  });report.native.activated=activated;
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.badResponses,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log('PASS enemy art',JSON.stringify({coverage,actions:counts,native,layouts:report.layouts.length}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
