(function(){
  selectClass('Guerreiro');
  const clone=x=>JSON.parse(JSON.stringify(x));
  const basePlayer=clone(player);
  const logs=[];let captureLogs=false;
  updateUI=()=>{};saveCampaign=()=>{};queueCampaignSave=()=>{};log=m=>{if(captureLogs){logs.push(m);if(logs.length>200)logs.shift();}};
  wait=async()=>{};playSpriteAttackAnimation=async()=>{};animateEnemyBarTo=async()=>{};animateEnemyHitSequence=async()=>{};blurActiveControl=()=>{};
  handleDeath=()=>{isDead=true;player.hp=0;isProcessingTurn=false;};
  handleEnemyDefeat=()=>{enemy.hp=0;isProcessingTurn=false;};
  let randomState=1;
  Math.random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
  const builds={equilibrada:[1,1,1],forca_pura:[1,0,0],vida_pura:[0,1,0],mana_pura:[0,0,1],ofensiva:[6,2,2],resistente:[2,6,2],arcana:[2,2,6],hibrida:[4,2,4]};
  const attributes=['strength','vitality','wisdom'];
  const regionByLevel={1:'Floresta',10:'Floresta',20:'Caverna',30:'Ruinas',40:'Pantano',50:'Vulcao',60:'Abismo',70:'Fortaleza',80:'Necropole',100:'Panteao'};
  const forms=[];
  for(const [className,def] of Object.entries(subclassChoicesByClass)){
    forms.push({className,id:className,name:className,tier30:null,tier60:null,tier:0,levels:[1,10,20]});
    for(const t of def.tier30){
      forms.push({className,id:t.id,name:t.name,tier30:t.id,tier60:null,tier:1,levels:[30,40,50]});
      for(const s of def.tier60[t.id])forms.push({className,id:s.id,name:s.name,tier30:t.id,tier60:s.id,tier:2,levels:[60,70,80,100]});
    }
  }
  function make(form,level,build,encounter='boss',seed=1){
    randomState=seed;logs.length=0;
    player=clone(basePlayer);player.class=form.className;player.level=level;player.xp=0;player.coins=0;
    const b=classes[form.className];player.baseStats={hp:b.hp,mp:b.mp,attack:b.attack};player.maxHp=b.hp;player.maxMp=b.mp;player.attack=b.attack;
    player.stats.invested=createDefaultInvestedStats();player.equipment=Object.fromEntries(equipmentSlots.map(s=>[s,null]));player.inventory=[];
    player.subclassChoices={tier30:form.tier30,tier60:form.tier60};
    allocation={strength:0,vitality:0,wisdom:0};levelUpPoints=0;pendingLevelUps=0;
    const weights=builds[build],total=weights.reduce((a,b)=>a+b,0),counts=[0,0,0];
    for(let lv=2;lv<=level;lv++){
      let best=0;for(let a=1;a<3;a++)if((lv-1)*weights[a]/total-counts[a]>(lv-1)*weights[best]/total-counts[best]+1e-9)best=a;
      counts[best]++;const attr=attributes[best],gain=getAttributePointGain(attr,lv);player.stats.invested[attr]++;
      if(attr==='strength'){player.attack+=gain;player.stats.invested.attackGain+=gain;player.stats.invested.skillGain+=gain;}
      if(attr==='vitality'){player.maxHp+=gain;player.stats.invested.hpGain+=gain;}
      if(attr==='wisdom'){player.maxMp+=gain;player.stats.invested.mpGain+=gain;}
    }
    currentMode='battle';currentRegion=encounter.includes(':')?encounter.split(':')[1]:(regionByLevel[level]||'Panteao');isProcessingTurn=false;isDead=false;needsNewEnemy=false;
    playerEffects=createDefaultPlayerEffects();resetCombatEffects();player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;
    const region=regions[currentRegion];
    const t=encounter==='common'?region.enemies[0]:region.boss;
    enemy=createEnemyFromTemplate(t,encounter!=='common',currentRegion);
    if(encounter==='dummy'){
      enemy={...enemy,baseName:'Alvo de teste',name:'Alvo de teste',isBoss:false,bossAbilities:[],maxHp:20000,hp:20000,attack:200,armor:80,maxMp:0,mp:0,skillCost:0,maxHpStrikePercent:0};
    }
    displayState={playerHp:player.hp,playerMp:player.mp,playerXp:0,enemyHp:enemy.hp};
    return {hp:player.hp,mp:player.mp,attack:getActiveAttack(),power:getSkillPowerBonus(),regen:getManaRegen(),points:clone(player.stats.invested),enemyHp:enemy.hp,enemyArmor:enemy.armor,enemyAttack:enemy.attack};
  }
  function snapshot(){return {p:clone(player),e:clone(enemy),fx:clone(playerEffects),rng:randomState,dead:isDead,processing:isProcessingTurn,display:clone(displayState)};}
  function restore(s){player=s.p;enemy=s.e;playerEffects=s.fx;randomState=s.rng;isDead=s.dead;isProcessingTurn=s.processing;displayState=s.display;}
  function canUse(s){return player.mp>=useSkillCost(s)&&(!s.hpCostPercent||player.hp>Math.floor(getCurrentCaps().maxHp*s.hpCostPercent))&&playerEffects.forcedBasicTurns<=0;}
  function dotTotal(e){return (e.dotDamagePerTurn||0)*(e.dotTurns||0)+(e.natureMarkDamage||0)*(e.natureMarkTurns||0)+(e.naturePoisonDamage||0)*(e.naturePoisonTurns||0)+(e.natureDecayDamage||0)*(e.natureDecayTurns||0);}
  function estimate(index,turn,utility=false){
    const saved=snapshot(),savedCapture=captureLogs;captureLogs=false;let value=0;
    // Probe randomness is independent of the battle RNG. The policy cannot inspect future combat rolls.
    for(let sample=0;sample<2;sample++){
      restore(clone(saved));randomState=1000003+7919*sample+97*turn;
      const hp=player.hp,mp=player.mp,ehp=enemy.hp,shield=playerEffects.shieldValue,oldDots=dotTotal(enemy);
      const result=index<0?getBasicAttackResult():applySkillLocally(getSkillInfo()[index]);
      if(result.blocked){value=-Infinity;break;}
      let score=ehp-enemy.hp;
      if(utility)score+=Math.max(0,dotTotal(enemy)-oldDots)*0.55+Math.max(0,player.hp-hp)*0.8+Math.max(0,playerEffects.shieldValue-shield)*0.35+Math.max(0,getActiveAttack()-(()=>{const cur=snapshot();restore(clone(saved));const old=getActiveAttack();restore(cur);return old;})())*2;
      value+=score/2;
    }
    restore(saved);captureLogs=savedCapture;return value;
  }
  function bestDamage(turn,utility=false){
    let choice=-1,score=estimate(-1,turn,utility);const skills=getSkillInfo();
    for(let i=0;i<skills.length;i++)if(canUse(skills[i])){const val=estimate(i,turn,utility);if(val>score+1){score=val;choice=i;}}
    if(!Number.isFinite(score))return -2;
    return choice;
  }
  const combos={
    Guerreiro:['warrior_shove','basic','warrior_shove','basic'],
    cavaleiro:['warrior_warcry','warrior_shove','warrior_stagger','basic','warrior_shove'],
    paladino:['warrior_warcry','warrior_judgment','warrior_shove','warrior_stagger','warrior_judgment'],
    berserker:['warrior_valhalla','warrior_stagger','basic','warrior_stagger','warrior_warcry','warrior_stagger'],
    espadachim:['warrior_second_wind','warrior_swift_strikes','warrior_deep_cut','warrior_shove','basic'],
    samurai:['warrior_second_wind','warrior_ultrasonic_cuts','basic','basic','warrior_deep_cut','warrior_swift_strikes'],
    ninja:['warrior_smoke_bomb','warrior_giant_slayer','warrior_deep_cut','warrior_swift_strikes','basic'],
    Mago:['mage_mana_burst','basic','basic','mage_mana_burst'],
    elementalista:['mage_fireball','mage_freeze','mage_mana_burst','basic'],
    mago_incendiario:['mage_freeze','mage_explode','mage_fireball','mage_mana_burst','basic'],
    mago_frigido:['mage_fireball','mage_freeze','mage_avalanche','mage_mana_burst','basic'],
    arcanista:['basic','basic','mage_discharge','mage_mana_burst'],
    arquimago:['mage_concentration','basic','basic','mage_overcharge','mage_discharge'],
    corrompido:['mage_corruption','mage_demon_form','basic','basic','mage_discharge'],
    Arqueiro:['archer_focus','basic','basic','basic','basic'],
    atirador:['archer_focus','archer_headshot','archer_piercing_shot','archer_headshot','basic'],
    atirador_arcano:['archer_focus','archer_headshot','archer_overcharge','archer_arcane_shot','basic'],
    sniper:['archer_focus','archer_weak_spot','archer_headshot','archer_execute','archer_piercing_shot'],
    cacador:['archer_focus','archer_trap','archer_barrage','basic'],
    espreitador:['archer_camouflage','archer_surprise','archer_aim_leg','archer_trap','archer_barrage'],
    guarda_florestal:['archer_tranquilizer','archer_trap','archer_barrage','archer_cutting_shot','basic'],
    'Adepto da Natureza':['nature_living_seed','nature_roots','basic','basic'],
    druida:['nature_living_seed','nature_roots','nature_swamp_flower','nature_harvest','basic'],
    druida_sombrio:['nature_swamp_collapse','nature_roots','nature_swamp_flower','nature_decay','nature_harvest'],
    avatar_da_natureza:['nature_living_seed','nature_roots','nature_swamp_flower','nature_harvest','nature_true_form','basic','basic','nature_crush_invader'],
    espirito_da_floresta:['nature_living_seed','nature_roots','nature_ancestral_song','nature_breeze_charm'],
    fada_monarca:['nature_ancestral_song','nature_ancestral_song','nature_ancestral_song','nature_crown','nature_roots','nature_queen_decree','nature_breeze_charm'],
    protetor_da_floresta:['nature_living_seed','nature_vine_cocoon','nature_ancestral_song','nature_roots','nature_throw_thorns','nature_breeze_charm']
  };
  const alternatives={
    paladino:{escudo_julgamento:['warrior_faith_shield','warrior_judgment','warrior_judgment','warrior_second_wind','warrior_judgment'],brado_sustento:['warrior_warcry','warrior_shove','warrior_judgment','warrior_second_wind','warrior_judgment']},
    berserker:{ultima_chance:['warrior_warcry','warrior_stagger'],furia_explosiva:['warrior_valhalla','warrior_stagger','warrior_stagger']},
    samurai:{janela_segura:['warrior_ultrasonic_cuts','basic','basic','warrior_deep_cut','warrior_armor_piercer'],sangramento:['warrior_second_wind','warrior_deep_cut','warrior_swift_strikes','warrior_deep_cut']},
    ninja:{esquiva_execucao:['warrior_smoke_bomb','warrior_giant_slayer','warrior_smoke_bomb','warrior_swift_strikes','warrior_deep_cut'],sangramento_primeiro:['warrior_deep_cut','warrior_smoke_bomb','warrior_giant_slayer','warrior_swift_strikes']},
    mago_incendiario:{queimar:['mage_freeze','basic','mage_fireball','mage_explode'],explosao:['mage_explode','mage_freeze','basic']},
    mago_frigido:{avalanche_dupla:['mage_avalanche','mage_avalanche','mage_fireball','mage_freeze'],frio_preparado:['mage_fireball','mage_freeze','mage_avalanche']},
    arquimago:{escudo_cargas:['mage_mana_shield','basic','basic','mage_discharge'],concentrar:['mage_concentration','basic','basic','mage_overcharge']},
    corrompido:{missil_primeiro:['basic','mage_corruption','mage_demon_form','basic'],corrupcao_abertura:['mage_corruption','mage_demon_form','basic']},
    atirador_arcano:{reservar_mana:['archer_headshot','archer_headshot','archer_arcane_shot','archer_overcharge'],esgotar_recuperar:['archer_overcharge','archer_arcane_shot','archer_headshot']},
    sniper:{ponto_fraco_primeiro:['archer_weak_spot','archer_headshot','archer_execute'],foco_camo:['archer_focus','archer_camouflage','archer_headshot','archer_execute']},
    espreitador:{reduzir_armadura:['archer_aim_leg','archer_camouflage','archer_surprise','archer_barrage','archer_trap'],emboscada:['archer_camouflage','archer_surprise','archer_camouflage','archer_surprise','archer_trap']},
    guarda_florestal:{mitigar_dot:['archer_tranquilizer','archer_cutting_shot','archer_barrage','archer_trap'],esquiva_rajada:['archer_focus','archer_camouflage','archer_trap','archer_barrage','archer_barrage']},
    druida_sombrio:{colapso_colheita:['nature_swamp_collapse','nature_harvest'],dot_longo:['nature_living_seed','nature_roots','nature_swamp_flower','nature_decay','nature_harvest']},
    avatar_da_natureza:{forma_abertura:['nature_true_form','basic','basic','nature_roots','nature_crush_invader','nature_harvest'],escudo_colheita:['nature_living_seed','nature_roots','nature_swamp_flower','nature_harvest','nature_crush_invader']},
    fada_monarca:{coroa_cedo:['nature_crown','nature_living_seed','nature_ancestral_song','nature_queen_decree','nature_roots','nature_queen_decree'],cadencia_curta:['nature_ancestral_song','nature_ancestral_song','nature_crown','nature_queen_decree','nature_roots','nature_queen_decree']},
    protetor_da_floresta:{casulo_espinhos:['nature_vine_cocoon','nature_vine_cocoon','nature_throw_thorns'],cancao_espinhos:['nature_roots','nature_ancestral_song','nature_vine_cocoon','nature_throw_thorns']}
  };
  function choose(form,strategy,turn,cursor){
    if(playerEffects.forcedBasicTurns>0)return -1;
    if(strategy==='basico')return player.class==='Mago'&&player.mp<Math.floor(3+.1*player.level)*3?-2:-1;
    if(strategy==='dano_direto')return bestDamage(turn,false);
    const skills=getSkillInfo(),find=type=>skills.findIndex(s=>s.type===type&&canUse(s));
    const hpRatio=player.hp/getCurrentCaps().maxHp;
    if(strategy==='sustentacao'){
      if(hpRatio<0.6){const i=find('warrior_second_wind');if(i>=0)return i;}
      if(hpRatio<0.68){const i=find('nature_ancestral_song');if(i>=0)return i;}
      if(hpRatio<0.7&&playerEffects.invulnerableTurns===0){const i=find('warrior_faith_shield');if(i>=0)return i;}
      if(playerEffects.shieldValue<enemy.attack*.8){for(const type of ['nature_vine_cocoon','mage_mana_shield']){const i=find(type);if(i>=0)return i;}}
      if(playerEffects.basicOnlyUntouchableTurns===0&&hpRatio<0.65){const i=find('warrior_ultrasonic_cuts');if(i>=0)return i;}
      if(playerEffects.enemyMissBonusTurns===0){const i=find('archer_camouflage');if(i>=0)return i;}
      if(enemy.attackDownTurns===0){for(const type of ['archer_tranquilizer','archer_aim_leg','mage_fireball']){const i=find(type);if(i>=0&&(type!=='mage_fireball'||form.id==='mago_frigido'))return i;}}
      if(enemy.natureMarkTurns===0){const i=find('nature_living_seed');if(i>=0)return i;}
      if(form.id==='protetor_da_floresta'&&playerEffects.shieldValue>=enemy.attack*1.5&&hpRatio>.3){const i=find('nature_throw_thorns');if(i>=0)return i;}
      return bestDamage(turn,true);
    }
    const chain=strategy.startsWith('combo:')?alternatives[form.id][strategy.slice(6)]:(combos[form.id]||['basic']);
    // Try each next step once. Unaffordable or locked steps fall through rather than pretending the combo happened.
    for(let attempts=0;attempts<chain.length;attempts++){
      const type=chain[cursor.index++%chain.length];
      if(type==='basic')return player.class==='Mago'&&player.mp<Math.floor(3+.1*player.level)*3?-2:-1;
      const i=find(type);if(i>=0)return i;
    }
    return bestDamage(turn,true);
  }
  async function runFight(form,level,build,strategy,encounter,seed,trace=false){
    const initial=make(form,level,build,encounter,seed),cursor={index:0};captureLogs=trace;let turns=0,blocks=0;const actions={},timeline=[];
    for(;turns<120&&!isDead&&player.hp>0&&enemy.hp>0;turns++){
      const index=choose(form,strategy,turns,cursor),skill=index>=0?getSkillInfo()[index]:null;
      const label=skill?.name||(index===-2?'Passar turno':getBasicAttackLabel());actions[label]=(actions[label]||0)+1;
      const before={hp:player.hp,mp:player.mp,enemyHp:enemy.hp,shield:playerEffects.shieldValue};
      if(index===-2)await passTurn();else if(index===-1)await attack();else await useSkill(index);
      if(player.hp===before.hp&&player.mp===before.mp&&enemy.hp===before.enemyHp&&playerEffects.shieldValue===before.shield)blocks++;
      if(trace&&timeline.length<30)timeline.push({turn:turns+1,action:label,before,after:{hp:player.hp,mp:player.mp,enemyHp:enemy.hp,shield:playerEffects.shieldValue},effects:clone(playerEffects)});
      if(![player.hp,player.mp,enemy.hp,...Object.values(playerEffects).filter(x=>typeof x==='number')].every(Number.isFinite))throw Error('Non-finite state '+form.name);
      isProcessingTurn=false;
    }
    const result={win:enemy.hp<=0&&player.hp>0,mutual:enemy.hp<=0&&player.hp<=0,timeout:enemy.hp>0&&player.hp>0,turns,hp:player.hp,mp:player.mp,damageFraction:Math.max(0,Math.min(1,(initial.enemyHp-enemy.hp)/initial.enemyHp)),initial,actions,blocks};
    if(trace){result.timeline=timeline;result.log=[...logs];}
    captureLogs=false;return result;
  }
  function aggregate(results){
    const n=results.length,sum=key=>results.reduce((s,x)=>s+x[key],0),wins=results.filter(x=>x.win);
    return {n,wins:wins.length,mutual:results.filter(x=>x.mutual).length,timeouts:results.filter(x=>x.timeout).length,turns:sum('turns')/n,winTurns:wins.length?wins.reduce((s,x)=>s+x.turns,0)/wins.length:null,damageFraction:sum('damageFraction')/n,remainingHpFraction:results.reduce((s,x)=>s+x.hp/x.initial.hp,0)/n,initial:results[0].initial,actions:results.reduce((all,x)=>{for(const[k,v]of Object.entries(x.actions))all[k]=(all[k]||0)+v;return all;},{})};
  }
  async function batch(className){
    const rows=[];
    for(const form of forms.filter(x=>x.className===className))for(const level of form.levels)for(const build of Object.keys(builds))for(const strategy of ['basico','dano_direto','combo','sustentacao'])for(const encounter of ['common','boss']){
      const fights=[];for(let seed=1;seed<=5;seed++)fights.push(await runFight(form,level,build,strategy,encounter,seed));
      rows.push({form:form.name,id:form.id,className,level,build,strategy,encounter,...aggregate(fights)});
    }
    return rows;
  }
  async function validate(configs){
    const rows=[];
    for(const config of configs){const form=forms.find(x=>x.id===config.id);
      for(const encounter of ['boss','common','dummy','boss:Cataclismo','boss:Paradoxo']){
        const fights=[];for(let seed=10001;seed<=10030;seed++)fights.push(await runFight(form,100,config.build,config.strategy,encounter,seed));
        rows.push({...config,form:form.name,encounter,...aggregate(fights),example:await runFight(form,100,config.build,config.strategy,encounter,10001,true)});
      }
    }
    return rows;
  }
  async function alternativeBatch(className){
    const rows=[];
    for(const form of forms.filter(x=>x.className===className&&x.tier===2))for(const build of Object.keys(builds))for(const name of Object.keys(alternatives[form.id]))for(const encounter of ['boss','boss:Cataclismo','boss:Paradoxo']){
      const fights=[];for(let seed=1;seed<=10;seed++)fights.push(await runFight(form,100,build,'combo:'+name,encounter,seed));
      rows.push({form:form.name,id:form.id,className,level:100,build,strategy:'combo:'+name,encounter,...aggregate(fights)});
    }
    return rows;
  }
  function catalog(){
    const entries=[];
    for(const form of forms){const level=form.tier===2?100:form.tier===1?50:20;make(form,level,'equilibrada','dummy');
      entries.push({form,level,stats:getPreviewStats(),power:getSkillPowerBonus(),regen:getManaRegen(),basic:{name:getBasicAttackLabel(),description:getBasicAttackTooltip()},active:clone(getSkillInfo()),passive:getUnlockedPassiveSkills().map(p=>({...p,description:getPassiveStatusDescription(p)}))});
    }
    return entries;
  }
  async function probes(){
    const rows=[];
    // All active skills: actual turn entry points, ordinary resources and enough resources; normal and shielded targets.
    for(const form of forms){const level=form.tier===2?100:form.tier===1?50:20;make(form,level,'equilibrada','dummy');const skills=clone(getSkillInfo());
      for(const meta of skills)for(const condition of ['normal','preparada','recursos_altos','alvo_com_escudo']){
        make(form,level,'equilibrada','dummy',601);player.hp=Math.floor(player.hp*.7);
        if(condition==='recursos_altos'){player.maxMp+=10000;player.mp=getCurrentCaps().maxMp;player.hp=getCurrentCaps().maxHp;}
        if(condition==='preparada'){
          enemy.natureMarkTurns=4;enemy.natureMarkDamage=50;enemy.rootedTurns=3;enemy.naturePoisonTurns=4;enemy.naturePoisonDamage=50;enemy.natureDecayTurns=4;enemy.natureDecayDamage=50;
          enemy.attackDownTurns=3;enemy.attackDownPercent=.3;playerEffects.natureCadence=3;playerEffects.arcaneCharges=6;playerEffects.arcaneChargeTurns=3;playerEffects.shieldValue=400;playerEffects.lastActionType='archer_camouflage';playerEffects.guaranteedHitTurns=4;
          if(meta.type==='archer_execute')enemy.hp=enemy.maxHp*.35;
          if(meta.type==='archer_arcane_shot')player.mp=Math.max(meta.cost,Math.floor(player.mp*.3));
          if(meta.type==='nature_crush_invader')playerEffects.natureTrueFormTurns=4;
        }
        if(condition==='alvo_com_escudo')enemy.shieldValue=1000;
        captureLogs=true;const i=getSkillInfo().findIndex(s=>s.id===meta.id);const skill=getSkillInfo()[i];const before=snapshot();const legal=canUse(skill);
        let error=null;try{await useSkill(i);}catch(e){error=e.message;}
        rows.push({form:form.name,className:form.className,level,skill:skill.name,type:skill.type,condition,legal,cost:skill.cost,hpCost:skill.hpCostPercent||0,damage:before.e.hp-enemy.hp,mpBefore:before.p.mp,mpAfter:player.mp,hpBefore:before.p.hp,hpAfter:player.hp,shieldBefore:before.fx.shieldValue,shieldAfter:playerEffects.shieldValue,effectsAfter:clone(playerEffects),enemyAfter:clone(enemy),error,log:[...logs].slice(-8)});
      }
    }
    return rows;
  }
  async function passiveProbes(){
    const rows=[];const originalRandom=Math.random;
    for(const form of forms){
      const level=form.tier===2?100:form.tier===1?50:20;
      make(form,level,'equilibrada','dummy');const passiveList=clone(getUnlockedPassiveSkills());
      for(const passive of passiveList){
        make(form,level,'equilibrada','dummy');enemy.armor=0;player.hp=Math.floor(player.hp*.5);
        Math.random=()=>.99;let detail={},pass=false;
        const type=passive.type,mods=getPassiveModifiers();
        try{
          if(type==='warrior_flat_reduction'){const r=applyIncomingDamage(100);detail={reduction:mods.flatReduction,damage:r.damage,regen:mods.turnHealPercent};pass=mods.flatReduction===Math.floor(.6*level);}
          if(type==='warrior_enemy_miss'){detail={dodge:getEnemyMissChance()};pass=detail.dodge===.2;}
          if(type==='warrior_reflect'){Math.random=()=>.49;const hp=enemy.hp;applyIncomingDamage(100);detail={reflection:mods.reflectPercent,enemyDamage:hp-enemy.hp};pass=hp>enemy.hp;}
          if(type==='warrior_counter_on_dodge'){playerEffects.nextIncomingAutoMiss=true;const hp=player.hp,ehp=enemy.hp;applyIncomingDamage(100);detail={counterDamage:ehp-enemy.hp,healed:player.hp-hp};pass=ehp>enemy.hp;}
          if(type==='warrior_aura_shield'){applyTurnStartPassives();detail={shield:playerEffects.shieldValue,expected:Math.floor(getCurrentCaps().maxHp*.02)};pass=detail.shield===detail.expected;}
          if(type==='warrior_last_stand'){player.hp=1;applyIncomingDamage(100);detail={hp:player.hp,pending:playerEffects.berserkerLastStandPending};pass=player.hp===1&&detail.pending;}
          if(type==='warrior_first_strike_echo'){const first=getBasicAttackResult().damage,second=getBasicAttackResult().damage;detail={first,second};pass=first>second;}
          if(type==='warrior_execute_bonus'){enemy.hp=16000;const high=applyDamageToEnemy(100);enemy.hp=6000;const low=applyDamageToEnemy(100);detail={high,low};pass=low===high*1.5;}
          if(type==='mage_last_resort'){player.hp=1;player.mp=500;const expected=2*(100+Math.floor(100*(playerEffects.incomingDamageBonusTurns>0?playerEffects.incomingDamageBonusPercent:0)));const r=applyIncomingDamage(100);detail={hp:player.hp,mp:player.mp,manaSpent:r.manaAbsorbed,expected};pass=player.hp===1&&r.manaAbsorbed===expected;}
          if(type==='mage_mana_to_life'){detail={bonusHp:mods.bonusHp,maxMp:getCurrentCaps().maxMp,factor:form.id==='mago_frigido'?.65:.5};pass=mods.bonusHp>=Math.floor(detail.maxMp*detail.factor);}
          if(type==='mage_overflowing'){const factor=form.id==='arquimago'?.45:.3;detail={flat:mods.totalDamageFlat,costIncrease:mods.skillCostIncrease,maxMp:getCurrentCaps().maxMp};pass=mods.totalDamageFlat===Math.floor(detail.maxMp*factor);}
          if(type==='mage_hellfire'){const s=getSkillInfo().find(x=>x.type==='mage_fireball');applySkillLocally(s);detail={burn:enemy.dotDamagePerTurn,expected:Math.floor(enemy.maxHp*.05)};pass=detail.burn===detail.expected;}
          if(type==='mage_frostburn'){applySkillLocally(getSkillInfo().find(x=>x.type==='mage_fireball'));detail={burn:enemy.dotDamagePerTurn,turns:enemy.dotTurns};pass=detail.burn===Math.floor(enemy.maxHp*.03);}
          if(type==='mage_charge_damage'){addArcaneCharges(3);detail={percent:getPassiveModifiers().totalDamagePercent};pass=Math.abs(detail.percent-.15)<1e-9;}
          if(type==='mage_glass_cannon'){const saved=snapshot();const boosted=getBasicAttackResult().damage;restore(saved);playerEffects.firstAttackDoubleAvailable=false;const normal=getBasicAttackResult().damage;detail={boosted,normal,incoming:playerEffects.incomingDamageBonusPercent};pass=boosted===normal*2&&detail.incoming===.5;}
          if(type.startsWith('archer_dodge_')&&type!=='archer_dodge_damage_buff'){
            detail={dodge:getEnemyMissChance(),crit:getArcherCritChanceBonus(),coinBonus:mods.coinBonus};pass=Math.abs(detail.dodge-(.05+.005*level))<1e-9;
          }
          if(type==='archer_attack_level_bonus'){detail={attack:mods.bonusAttack,power:mods.skillPower};pass=mods.bonusAttack>=Math.floor(.9*level);}
          if(type==='archer_dodge_damage_buff'){playerEffects.nextIncomingAutoMiss=true;const hp=player.hp;applyIncomingDamage(100);detail={next:playerEffects.nextDamageBonusPercent,buff:playerEffects.finalDamageBuffPercent,heal:player.hp-hp};pass=detail.next>.0||detail.buff>.0||detail.heal>0;}
          if(type==='archer_mana_to_skill_bonus'){detail={power:mods.skillPower,fromMana:Math.floor(getCurrentCaps().maxMp*.05)};pass=mods.skillPower>=detail.fromMana;}
          if(type==='archer_sniper_bonus_crit'){const at70=getArcherCritChanceBonus();player.level=69;const at69=getArcherCritChanceBonus();player.level=level;detail={at70,at69,delta:at70-at69,critical:getArcherCriticalProfile(.8)};pass=Math.abs(detail.delta-.15)<1e-9;}
          if(type==='archer_enemy_skip_chance'){detail={skip:mods.enemySkipChance};pass=detail.skip===.07;}
          if(type==='archer_flat_reduction_level'){detail={flat:mods.flatReduction};pass=mods.flatReduction===Math.floor(.2*level);}
          if(type==='nature_cycle'){enemy.natureMarkTurns=3;player.mp-=50;const mp=player.mp;const damage=applyDamageToEnemy(100,{skillCost:50});detail={damage,refund:player.mp-mp,spiritPower:mods.skillPower};pass=damage===(form.tier30==='druida'?116:110)&&detail.refund===5;}
          if(type==='nature_sap'){enemy.natureMarkTurns=2;enemy.natureMarkDamage=100;enemy.naturePoisonTurns=2;enemy.naturePoisonDamage=100;const hp=player.hp;await processNatureDotTicks();detail={healed:player.hp-hp,maxHp:getCurrentCaps().maxHp};pass=detail.healed>0;}
          if(type==='nature_fairy_aura'){const power=getSkillPowerBonus();for(let i=0;i<3;i++)grantPlayerShield(100);detail={cadence:playerEffects.natureCadence,powerBefore:power,powerAfter:getSkillPowerBonus()};pass=detail.cadence===3&&detail.powerAfter>power;}
          if(type==='nature_dot_mastery'){detail={multiplier:getNatureDotMultiplier()};pass=detail.multiplier===1.3;}
          if(type==='nature_ancestral_bark'){const base=mods.flatReduction;playerEffects.natureTrueFormTurns=4;detail={normal:base,inForm:getPassiveModifiers().flatReduction};pass=detail.inForm>base;}
          if(type==='nature_royal_wings'){const normal=getEnemyMissChance();playerEffects.natureCrownedTurns=4;detail={normal,crowned:getEnemyMissChance()};pass=normal===.2&&detail.crowned===.6;}
          if(type==='nature_forest_oath'){grantPlayerShield(100);const shield=playerEffects.shieldValue,ehp=enemy.hp;applyIncomingDamage(100);detail={shield,reflected:ehp-enemy.hp};pass=shield>=106&&detail.reflected>=30;}
          rows.push({form:form.name,className:form.className,level,name:passive.name,type,pass,detail});
        }catch(e){rows.push({form:form.name,name:passive.name,type,pass:false,error:e.message});}
        Math.random=originalRandom;
      }
    }
    return rows;
  }
  async function sequenceProbes(){
    const rows=[];
    for(const form of forms){const level=form.tier===2?100:form.tier===1?50:20;const chain=combos[form.id];
      for(const build of Object.keys(builds))for(const order of ['roteiro','invertida','basico']){
        const runs=[];
        for(let seed=301;seed<=310;seed++){
          const stats=make(form,level,build,'dummy',seed);enemy.maxHp=enemy.hp=100000;enemy.attack=0;const actions=[],skipped=[];
          for(let t=0;t<6&&player.hp>0&&enemy.hp>0;t++){
            const seq=order==='invertida'?[...chain].reverse():chain;const type=order==='basico'?'basic':seq[t%seq.length];
            let index=type==='basic'?-1:getSkillInfo().findIndex(s=>s.type===type&&canUse(s));
            if(index===-1&&type!=='basic')skipped.push(type);
            if(playerEffects.forcedBasicTurns>0){if(type!=='basic')skipped.push(type);index=-1;}
            if(index>=0){actions.push(getSkillInfo()[index].name);await useSkill(index);}else if(player.class==='Mago'&&player.mp<Math.floor(3+.1*player.level)*3){actions.push('Passar turno');await passTurn();}else{actions.push(getBasicAttackLabel());await attack();}
            isProcessingTurn=false;
          }
          runs.push({damage:100000-enemy.hp,hp:player.hp,mp:player.mp,stats,actions,skipped});
        }
        rows.push({form:form.name,id:form.id,className:form.className,level,build,order,n:runs.length,damage:runs.reduce((s,x)=>s+x.damage,0)/runs.length,hp:runs.reduce((s,x)=>s+x.hp,0)/runs.length,mp:runs.reduce((s,x)=>s+x.mp,0)/runs.length,unavailable:runs.reduce((s,x)=>s+x.skipped.length,0),example:runs[0]});
      }
    }
    return rows;
  }
  async function mechanics(){
    const form=id=>forms.find(x=>x.id===id),rows=[];const rng=Math.random;
    make(form('arquimago'),100,'equilibrada','dummy');enemy.maxHp=enemy.hp=1000000;enemy.armor=0;Math.random=()=>.99;
    const zero=getBasicAttackResult().damage;
    make(form('arquimago'),100,'equilibrada','dummy');enemy.maxHp=enemy.hp=1000000;enemy.armor=0;Math.random=()=>.99;addArcaneCharges(3);
    const three=getBasicAttackResult().damage;rows.push({name:'carregar-multiplicacao',zero,three,ratio:three/zero,nominalBonus:.15});Math.random=rng;
    make(form('paladino'),100,'equilibrada','dummy');enemy.attack=400;enemy.maxHp=enemy.hp=1000000;
    const baseIncoming=applyIncomingDamage,damage=[];applyIncomingDamage=function(...args){const r=baseIncoming(...args);damage.push(r.damage);return r;};
    const duration=[];
    try{await useSkill(getSkillInfo().findIndex(s=>s.type==='warrior_faith_shield'));duration.push({action:'Escudo de Fe',remaining:playerEffects.invulnerableTurns,damage:[...damage]});damage.length=0;
      for(let i=0;i<3;i++){await passTurn();duration.push({action:'Passar turno',remaining:playerEffects.invulnerableTurns,damage:[...damage]});damage.length=0;}
    }finally{applyIncomingDamage=baseIncoming;}
    rows.push({name:'duracao-escudo-de-fe',duration});
    make(form('espreitador'),100,'equilibrada','dummy');enemy.attack=0;await useSkill(getSkillInfo().findIndex(s=>s.type==='archer_camouflage'));
    rows.push({name:'camuflagem-surpresa-campanha',lastAction:playerEffects.lastActionType,empowered:getSkillInfo().find(s=>s.type==='archer_surprise').empoweredFromCamouflage});
    make(form('berserker'),100,'equilibrada','dummy');enemy.attack=0;enemy.hp=enemy.maxHp=100000;
    await useSkill(getSkillInfo().findIndex(s=>s.type==='warrior_unstoppable'));playerEffects.skipNextTurn=true;
    const hpBefore=enemy.hp;await attack();rows.push({name:'imparavel-controle',enemyHpBefore:hpBefore,enemyHpAfter:enemy.hp,preventedSkip:enemy.hp<hpBefore});
    make(form('avatar_da_natureza'),100,'hibrida','dummy');enemy.attack=0;
    const window=[];
    for(const type of ['nature_true_form','basic','basic','nature_roots','nature_crush_invader']){
      const index=type==='basic'?-1:getSkillInfo().findIndex(s=>s.type===type),s=index>=0?getSkillInfo()[index]:null;
      const before={mp:player.mp,cost:s?.cost,legal:s?canUse(s):true,form:playerEffects.natureTrueFormTurns};
      if(index>=0)await useSkill(index);else await attack();window.push({action:type,before,after:{mp:player.mp,form:playerEffects.natureTrueFormTurns}});
    }
    rows.push({name:'forma-verdadeira-janela-mana',window});
    rows.push({name:'sets-atuais',paradoxo:getSetBonusValues('Paradoxo'),rarityMultipliers:clone(rarityMultipliers)});
    return rows;
  }
  window.ClassLab={forms,builds,combos,alternatives,batch,alternativeBatch,validate,catalog,probes,passiveProbes,sequenceProbes,mechanics,make,runFight,snapshot,restore};
})();
