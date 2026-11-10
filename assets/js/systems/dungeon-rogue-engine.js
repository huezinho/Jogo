/* Host-authoritative, deterministic dungeon state machine. No campaign persistence. */
const DungeonCombatKernel = (() => {
  'use strict';
  const R=DungeonRules,copy=x=>JSON.parse(JSON.stringify(x)),alive=x=>x.hp>0&&!x.fled;
  const native={damage:applyDamageToEnemy,log,update:updateUI,save:saveCampaign,queue:queueCampaignSave};
  function requireRule(ok,message){if(!ok)throw new Error(message);}
  function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
  function hash(value){let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
  function note(s,text){s.log.push(String(text).slice(0,400));s.log=s.log.slice(-65);}
  function stampDots(s,h,t){
    if(!t)return;
    for(const key of ['burnStacks','poisonStacks','bleedStacks','naturePoisonStacks'])for(const stack of t[key]||[])if(!stack.ownerId)stack.ownerId=h.id;
    t.dotOwners||={};
    for(const key of ['dotTurns','natureMarkTurns','natureDecayTurns'])if(t[key]>0){const source=s.party.find(x=>x.characterId===t.equipmentDotOwners?.[key]);t.dotOwners[key]=source?.id||t.dotOwners[key]||h.id;}
  }
  function withHero(s,h,t,fn,scale=1){
    const saved={player,effects:playerEffects,enemy,mode:currentMode,pendingLevelUps,levelUpPoints,allocation,displayState,isDead,isProcessingTurn,random:Math.random,damage:applyDamageToEnemy,log,update:updateUI,save:saveCampaign,queue:queueCampaignSave};
    player=h;playerEffects=h.effects;enemy=t;currentMode='dungeon_run';pendingLevelUps=0;levelUpPoints=0;allocation={strength:0,vitality:0,wisdom:0};isDead=false;isProcessingTurn=false;
    displayState={playerHp:h.hp,playerMp:h.mp,playerXp:0,enemyHp:t?.hp||0};Math.random=()=>random(s);
    log=text=>note(s,text);updateUI=()=>{};saveCampaign=()=>{};queueCampaignSave=()=>{};
    applyDamageToEnemy=(amount,options)=>native.damage(Math.floor(amount*scale),options);
    try{return fn();}finally{
      stampDots(s,h,t);h.effects=playerEffects;h.hp=Math.max(0,Number(h.hp)||0);h.mp=Math.max(0,Number(h.mp)||0);
      player=saved.player;playerEffects=saved.effects;enemy=saved.enemy;currentMode=saved.mode;pendingLevelUps=saved.pendingLevelUps;levelUpPoints=saved.levelUpPoints;allocation=saved.allocation;displayState=saved.displayState;isDead=saved.isDead;isProcessingTurn=saved.isProcessingTurn;
      Math.random=saved.random;applyDamageToEnemy=saved.damage;log=saved.log;updateUI=saved.update;saveCampaign=saved.save;queueCampaignSave=saved.queue;
    }
  }
  function stats(s,h){return withHero(s,h,null,()=>({...getPreviewStats(),power:getSkillPowerBonus(),attack:getActiveAttack(),crit:getArcherCriticalProfile().critChance,manaRegen:getManaRegen(),armor:getPassiveModifiers().flatReduction}));}
  function rebuild(s,h){
    const b=classes[h.class],counts=h.attributes||{strength:0,vitality:0,wisdom:0};h.stats.invested=createDefaultInvestedStats(counts);
    const i=h.stats.invested;i.attackGain=i.skillGain=i.strength*getAttributePointGain('strength',h.level);i.hpGain=i.vitality*getAttributePointGain('vitality',h.level);i.mpGain=i.wisdom*getAttributePointGain('wisdom',h.level);
    h.maxHp=b.hp+i.hpGain;h.maxMp=b.mp+i.mpGain;h.attack=b.attack+i.attackGain;h.stats.investedAtLevel=h.level;
    EquipmentSystem.refreshEquipmentStats(h);
  }
  function hero(s,className,name,owner){
    requireRule(Object.hasOwn(classes,className),'Classe inválida.');const b=classes[className],id='h'+(++s.serial);
    const h={id,characterId:'rogue-'+s.id+'-'+id,characterName:String(name||className).trim().slice(0,28)||className,class:className,owner,offline:false,level:1,xp:0,coins:0,baseStats:{hp:b.hp,mp:b.mp,attack:b.attack},baseAttack:b.attack,maxHp:b.hp,maxMp:b.mp,attack:b.attack,hp:b.hp,mp:b.mp,subclassChoices:{tier30:null,tier60:null},attributes:{strength:0,vitality:0,wisdom:0},stats:{regionKills:{},regionBossKills:{},enemiesDefeated:0,bossesDefeated:0,deaths:0,coinsEarned:0,invested:createDefaultInvestedStats(),investedAtLevel:1},inventory:[],equipment:{},effects:createDefaultPlayerEffects()};
    const c=stats(s,h);h.hp=c.maxHp;h.mp=c.maxMp;return h;
  }
  function lobby(seed,leader='local'){
    const rng=hash(seed||'expedition');return {id:'r'+rng.toString(36)+'-'+Date.now().toString(36),seed:String(seed||'expedition').slice(0,48),rng,serial:0,revision:0,leader,phase:'lobby',party:[],enemies:[],node:0,act:0,biomes:[],room:null,round:1,order:[],cursor:0,log:[],history:[],roomsCleared:0,bosses:0,outcome:null};
  }
  function addHero(s,config){requireRule(s.phase==='lobby'&&s.party.length<R.maxParty,'O grupo já está completo.');const h=hero(s,config.className,config.name,config.owner||s.leader);s.party.push(h);return h;}
  function classChoices(h){const data=subclassChoicesByClass[h.class];return h.level>=30&&!h.subclassChoices.tier30?data.tier30:h.level>=60&&!h.subclassChoices.tier60?data.tier60[h.subclassChoices.tier30]||[]:[];}
  function finishRoom(s){return window.DungeonJourneyRules.finishBattle(s);}
  function end(s,outcome){return window.DungeonJourneyRules.end(s,outcome);}
  function turnOrder(s){
    s.order=[...s.party.filter(alive).map(h=>({id:h.id,side:'hero',speed:({Guerreiro:10,Arqueiro:15,Mago:11,'Adepto da Natureza':12}[h.class])+Math.floor(random(s)*4)})),...s.enemies.filter(alive).map(e=>({id:e.id,side:'enemy',speed:e.initiative+Math.floor(random(s)*4)}))].sort((a,b)=>b.speed-a.speed).map(({id,side})=>({id,side}));s.cursor=0;
  }
  function current(s){if(s.phase!=='battle')return null;return s.order[s.cursor]||null;}
  function advance(s){
    if(s.phase!=='battle')return;
    if(!s.party.some(alive)){if(s.party.some(h=>h.fled))window.DungeonJourneyRules.retreat(s,'O grupo recuou.');else end(s,'defeat');return;}
    if(!s.enemies.some(alive)){finishRoom(s);return;}
    do{ s.cursor++;if(s.cursor>=s.order.length){s.round++;turnOrder(s);}const entry=current(s),unit=(entry.side==='hero'?s.party:s.enemies).find(x=>x.id===entry.id);if(unit&&alive(unit))break;}while(true);
  }
  function available(s,h,target=s.enemies.find(alive)){
    return withHero(s,h,target,()=>getSkillInfo().map(k=>{
      const effectiveCost=useSkillCost(k),areaPrimary=R.needsPrimary(k)&&s.enemies.filter(alive).length>1,hpCost=Math.floor(getCurrentCaps().maxHp*(k.hpCostPercent||0));
      const blockedReason=h.mp<effectiveCost?'Mana insuficiente.':h.hp<=hpCost?'Vida insuficiente para o sacrifício.':h.effects.forcedBasicTurns>0?'Esta postura só permite ataques básicos.':k.type==='warrior_ultrasonic_cuts'&&h.effects.ultrasonicRecoveryTurns>0?'Use outra ação antes de reativar Cortes Ultrassônicos.':h.effects.skipNextTurn&&!(h.effects.controlImmuneTurns>0)&&!k.canBreakControl?'Interrompido: use uma habilidade que rompe controle ou encerre o turno.':'';
      const provokePriority=window.DungeonJourneyRules?.priority(h,k)||0;return {...k,target:R.target(k),areaPrimary,effectiveCost,blockedReason,provokePriority,description:k.description+(provokePriority?' Na dungeon, provoca por três ações de cada inimigo (prioridade '+provokePriority+'); áreas continuam atingindo o grupo.':'')};
    }));
  }
  function canAct(s,h,k){
    requireRule(alive(h),'Este aventureiro está caído.');requireRule(!classChoices(h).length,'Escolha a especialização primeiro.');
    if(k){requireRule(h.mp>=k.effectiveCost,'Mana insuficiente.');requireRule(!k.hpCostPercent||h.hp>Math.floor(stats(s,h).maxHp*k.hpCostPercent),'Vida insuficiente para o sacrifício.');requireRule(!(h.effects.forcedBasicTurns>0),'Esta postura só permite ataques básicos.');}
  }
  function healAlly(s,caster,target,amount,shield=0,turns=0){
    const maxHp=stats(s,target).maxHp,before=target.hp;
    const reduction=withHero(s,target,null,()=>getPlayerHealReductionPercent());
    withHero(s,caster,null,()=>{
      if(amount>0){
        const heal=getPlayerHealingAmount(amount,{canHeal:target.hp<maxHp&&reduction<1,reduction});
        target.hp=Math.min(maxHp,target.hp+heal);
        if(target.hp>before){EquipmentSystem.noteHealing(caster,caster.effects,target.hp-before);grantNatureCadence();}
      }
      if(shield<=0||target.noShieldTurns>0)return;
      const protection=getPlayerShieldAmount(shield,{track:false});
      if(protection<=0)return;
      target.effects.shieldValue+=protection;
      target.effects.shieldTurns=Math.max(target.effects.shieldTurns||0,turns);
      if(target===caster&&turns>0)target.effects.rogueShieldFresh=true;
      EquipmentSystem.noteShield(caster,caster.effects,protection);
      grantNatureCadence();
    });
  }
  function support(s,h,k,targetId){
    const recipients=k.target==='party'?s.party.filter(alive):[s.party.find(x=>x.id===targetId&&alive(x))];requireRule(recipients.every(Boolean),'Selecione um aliado vivo.');
    withHero(s,h,s.enemies.find(alive),()=>beginEquipmentAction('skill',k));h.mp-=k.effectiveCost;h.effects.firstSkillFreeAvailable=false;
    const scale=recipients.length>1?R.supportScale:1;
    for(const ally of recipients){
      const f=ally.effects,beforeEffects={...ally.effects};
      if(k.type==='mage_mana_shield'){
        f.shieldValue=0;f.shieldTurns=0;healAlly(s,h,ally,0,k.shield,k.turns||0);
        f.shieldReactiveWeakening=h.subclassChoices.tier60==='corrompido';
      }else if(k.type==='nature_vine_cocoon')healAlly(s,h,ally,0,k.shield);
      else if(k.type==='nature_ancestral_song')healAlly(s,h,ally,k.heal*scale,(k.shield||0)*scale);
      else if(k.type==='warrior_smoke_bomb'){f.nextIncomingAutoMiss=true;f.nextDamageBonusPercent=Math.max(f.nextDamageBonusPercent,k.nextDamageBonus);}
      else if(k.type==='warrior_faith_shield'){f.invulnerableTurns=Math.max(f.invulnerableTurns,k.turns);f.storedFaithDamage=0;}
      else if(k.type==='warrior_warcry'){
        const [turns,bonus,value]=k.totalDamagePercent?['finalDamageBuffTurns','finalDamageBuffPercent',k.totalDamagePercent]:['attackBuffTurns','attackBuffPercent',k.attackPercent];
        f[turns]=Math.max(f[turns],k.turns);f[bonus]=Math.max(f[bonus],value*scale);
        if(k.damageReductionPercent){f.percentReductionTurns=k.turns;f.percentReduction=k.damageReductionPercent*scale;}
      }
      for(const enemy of s.enemies.filter(alive))withHero(s,ally,enemy,()=>CampaignEnemyCombat.transferBuffs());
      recordCombatEffectSources(f,beforeEffects,k.name);
      note(s,`${h.characterName} usou ${k.name} em ${ally.characterName}.`);
    }
    if(k.type==='nature_ancestral_song'&&k.enemyDamageDownPercent){
      const enemies=s.enemies.filter(alive),factor=enemies.length>1?R.supportScale:1;
      for(const e of enemies){e.attackDownPercent=Math.max(e.attackDownPercent||0,k.enemyDamageDownPercent*factor);e.attackDownTurns=Math.max(e.attackDownTurns||0,3);(e.debuffSources||={}).attackDownTurns=k.name;}
    }
    // A newly granted buff retains its complete duration when caster is a recipient.
    h.effects.freshBuffs=({warrior_second_wind:['finalDamageBuffTurns'],warrior_warcry:['attackBuffTurns','finalDamageBuffTurns','percentReductionTurns'],warrior_faith_shield:['invulnerableTurns']}[k.type]||[]).filter(key=>h.effects[key]>0);
    if(h.effects.equipmentAction)h.effects.equipmentAction.resolving=false;
    h.effects.lastActionType=k.type;

  }
  function nativeCast(s,h,k,target){
    const mode=k.target;
    if(mode==='enemies'){
      const before=copy(h),targets=s.enemies.filter(alive);
      if(target)targets.unshift(...targets.splice(targets.indexOf(target),1));
      const singleShot=k.type==='archer_barrage';
      const multi=targets.length>1&&!singleShot;
      let first;
      for(const [i,e] of targets.entries()){
        const actor=copy(before);
        const beforeHit=actor.hp;
        withHero(s,actor,e,()=>{
          const info=getSkillInfo().find(x=>x.type===k.type);
          const result=applySkillLocally(info,h.characterName,true,singleShot?{singleShot:true}:multi?{damageScale:R.areaScale,debuffScale:R.supportScale,primary:i===0}:undefined);
          requireRule(!result.blocked,result.message);
          note(s,`${e.name} · ${result.message}`);
          if(i===0)endEquipmentAction();else CampaignEnemyCombat.finishAction();
        },multi?R.areaScale:1);
        if(i===0)first=actor;
        else{
          if(actor.hp<beforeHit&&e.dungeonCampaign){
            // Retaliation from secondary targets still affects the real caster.
            const pact=e.campaignState?.timers?.pact>0&&e.hp<=0;
            const execution=CampaignEnemyCombat.index(e.baseName)===43;
            if(pact||execution&&actor.hp===0)first.hp=0;
          }
          for(const field of ['burnStacks','poisonStacks','bleedStacks']){
            const newStacks=(actor.effects[field]||[]).slice((before.effects[field]||[]).length);
            if(newStacks.length){(first.effects[field]||=[]).push(...newStacks);syncPeriodicStacks(first.effects,field.replace('Stacks',''));}
          }
        }
      }
      Object.assign(h,first);
    }else{
      withHero(s,h,target||s.enemies.find(alive),()=>{const info=getSkillInfo().find(x=>x.type===k.type);const result=applySkillLocally(info,h.characterName,mode!=='self');requireRule(!result.blocked,result.message);note(s,result.message);s.lastAction={serial:++s.serial,actorId:h.id,targetId:target?.id||null,skillType:k.type,hits:result.hitDamages||[]};});
    }

  }
  function heroEnd(s,h,actionTarget=null){
    const victory=!s.enemies.some(alive),t=actionTarget||s.enemies.find(alive)||s.enemies[0]||null;
    withHero(s,h,t,()=>{
      if(!alive(h)){endEquipmentAction();return;}
      applyTurnStartPassives();decayPlayerBuffs();applyEndOfTurnRecovery();
      if(h.effects.shieldTurns>0&&!h.effects.rogueShieldFresh&&--h.effects.shieldTurns===0){h.effects.shieldValue=0;h.effects.shieldReactiveWeakening=false;}
      h.effects.rogueShieldFresh=false;if(h.noShieldTurns>0)h.noShieldTurns--;
      if(victory)return;
      if(h.effects.burnTurns>0){const d=tickPeriodicStacks(h.effects,'burn',damage=>Math.floor(damage*(1-(getPassiveModifiers().burnDamageReductionPercent||0))));h.hp=Math.max(0,h.hp-d);EquipmentSystem.afterIncoming(h,h.effects,t,{damage:d,periodic:true,shieldAbsorbed:0});if(d)note(s,`${h.characterName}: ${d} por queimadura.`);}
      for(const kind of ['poison','bleed'])if(h.effects[kind+'Stacks']?.length){const d=tickPeriodicStacks(h.effects,kind);h.hp=Math.max(0,h.hp-d);EquipmentSystem.afterIncoming(h,h.effects,t,{damage:d,periodic:true,shieldAbsorbed:0});if(d)note(s,`${h.characterName}: ${d} por ${kind==='poison'?'veneno':'sangramento'}.`);}
    });
    if(victory){if(s.party.some(alive))finishRoom(s);else advance(s);return;}
    for(const foe of s.enemies.filter(alive)){
      if(!alive(h))break;
      if(withHero(s,h,foe,()=>CampaignEnemyCombat.dungeonHeroEnd())){
        h.fled=true;note(s,`Assombrar forçou ${h.characterName} a recuar.`);
      }
    }
    if(alive(h))for(const d of h.effects.pendingEnemyDebuffs||[]){
      if(!s.enemies.some(e=>e.id===d.sourceId&&alive(e))){d.left=0;continue;}
      if(d.type==='doom'){h.hp=Math.max(0,h.hp-Math.floor(stats(s,h).maxHp*d.percent/100));d.percent++;}
      else if(--d.left<=0){if(d.type==='haunt'){window.DungeonJourneyRules.retreat(s,`${d.source}: o grupo foi obrigado a recuar.`);return;}if(d.type==='deathmark')h.hp=0;}
    }
    h.effects.pendingEnemyDebuffs=(h.effects.pendingEnemyDebuffs||[]).filter(d=>d.type==='doom'||d.left>0);

    if(h.effects.berserkerLastStandPending){h.effects.berserkerLastStandPending=false;h.hp=0;}
    if(!h.fled&&!alive(h))note(s,`${h.characterName} caiu. Retornará com 20% da vida máxima se o grupo vencer.`);
    advance(s);
  }
  function act(s,h,intent){
    requireRule(s.phase==='battle'&&current(s)?.side==='hero'&&current(s)?.id===h.id,'Aguarde o turno deste aventureiro.');
    s.lastAction=null;const shieldBefore=h.effects.shieldValue;
    let k=intent.kind==='skill'?available(s,h,s.enemies.find(x=>x.id===intent.targetId)||s.enemies.find(alive)).find(x=>x.type===intent.skillType):null;
    requireRule(intent.kind!=='skill'||!!k,'Habilidade indisponível.');canAct(s,h,k);
    requireRule(!(h.effects.forcedBasicTurns>0)||intent.kind==='basic','Esta postura só permite ataques básicos.');
    if(k?.type==='archer_barrage'&&intent.barrageMode==='area')k={...k,target:'enemies'};
    const side=k?.target||'enemy',target=s.enemies.find(e=>e.id===intent.targetId&&alive(e));
    if(['basic','skill'].includes(intent.kind)&&side==='enemy')requireRule(!!target,'Escolha o inimigo que receberá a habilidade.');
    if(k?.areaPrimary)requireRule(!!target,'Escolha o alvo principal da habilidade em área.');
    if(k?.target==='ally')requireRule(s.party.some(x=>x.id===intent.targetId&&alive(x)),'Escolha um aliado vivo.');
    if(k?.target==='self'&&intent.targetId!==undefined)requireRule(intent.targetId===h.id,'Esta habilidade só pode ser usada no próprio aventureiro.');
    if(k&&['mage_mana_shield','nature_vine_cocoon'].includes(k.type))requireRule(!(s.party.find(x=>x.id===intent.targetId)?.noShieldTurns>0),'Este aliado não pode receber escudos agora.');
    if(h.effects.skipNextTurn&&h.effects.controlImmuneTurns>0)h.effects.skipNextTurn=false;
    if(h.effects.skipNextTurn&&!k?.canBreakControl&&!(h.effects.controlImmuneTurns>0)){h.effects.skipNextTurn=false;withHero(s,h,s.enemies.find(alive),()=>beginEquipmentAction('pass'));note(s,`${h.characterName} perdeu o turno.`);heroEnd(s,h);return;}
    if(k?.canBreakControl)h.effects.skipNextTurn=false;
    if(intent.kind==='basic'){
      withHero(s,h,target,()=>{const result=getBasicAttackResult(h.characterName,true);requireRule(!result.blocked,result.message);note(s,result.message);});
    }else if(intent.kind==='skill'){
      if(['ally','party'].includes(k.target))support(s,h,k,intent.targetId);else nativeCast(s,h,k,target);
    }else if(intent.kind==='pass'){
      withHero(s,h,s.enemies.find(alive),()=>beginEquipmentAction('pass'));note(s,`${h.characterName} passou o turno.`);
    }else requireRule(false,'Ação inválida.');
    if(h.effects.shieldValue>shieldBefore&&h.effects.shieldTurns>0)h.effects.rogueShieldFresh=true;
    if(k&&window.DungeonJourneyRules)window.DungeonJourneyRules.provoke(s,h,k);
    heroEnd(s,h,target||null);
  }
  function consumePotion(s,h,apply){
    withHero(s,h,s.enemies.find(alive),()=>beginEquipmentAction('consumable'));
    apply();
    heroEnd(s,h);
  }
  function enemyTarget(s,e,roll){const heroes=s.party.filter(alive),entries=(e.provocations||[]).filter(x=>x.left>0&&heroes.some(h=>h.id===x.heroId)).sort((a,b)=>b.priority-a.priority||b.serial-a.serial);return entries.length?heroes.find(h=>h.id===entries[0].heroId):heroes[Math.floor((roll??random(s))*heroes.length)];}
  function enemyPlan(s,e){
    // Read the upcoming roll without spending the authoritative RNG.
    const target=enemyTarget(s,e,random({rng:s.rng}));
    if(!target)return {name:'Ataque básico',target:'hero'};
    const charge=e.campaignState?.charge;
    const ability=charge?.ability||withHero(s,target,copy(e),()=>CampaignEnemyCombat.choose());
    const hostile=ability&&(ability.power!==undefined||ability.basicAttack||ability.poison||ability.burn||ability.bleed||ability.poisonMana||ability.damageDown||ability.healDown||ability.skip||ability.haunt||ability.deathmark||ability.reap||ability.doom||ability.drain);
    return {ability,hero:target,name:ability?.name||'Ataque básico',target:CampaignEnemyCombat.isDungeonArea(ability)?'party':!ability||hostile?'hero':'self',left:charge?.left||0};
  }
  function enemyIntent(s,e){
    const plan=enemyPlan(s,e);
    return {name:plan.name,target:plan.target,heroId:plan.hero?.id,left:plan.left};
  }
  function enemyDots(s,e){
    const resolveOwner=id=>s.party.find(h=>h.id===id)||s.party[0];
    function tick(ownerId,raw,natural,label){
      const h=resolveOwner(ownerId);withHero(s,h,e,()=>{
        const d=CampaignEnemyCombat.temporalDamage(Math.floor(raw*EquipmentSystem.getDotDamageMultiplier(h)*(natural?getNatureDotMultiplier():1)));
        const lost=Math.min(e.hp,d);e.hp=Math.max(0,e.hp-d);if(!e.hp)CampaignEnemyCombat.beforeDeath();applyLifeSteal(lost);
        EquipmentSystem.afterDamage(h,h.effects,e,{damage:d,rawDamage:d,source:'dot'});
        if(natural&&hasUnlockedPassiveType('nature_sap'))healPlayer(Math.floor(d*.08));
        if(d)note(s,`${e.name}: ${d} por ${label} de ${h.characterName}.`);
      });
    }
    for(const [kind,label] of [['burn','queimadura'],['poison','veneno'],['bleed','sangramento'],['naturePoison','veneno natural']]){
      for(const stack of e[kind+'Stacks']||[]){if(stack.turns>0&&e.hp>0)tick(stack.ownerId,stack.damage,kind==='naturePoison',label);stack.turns--;}
      e[kind+'Stacks']=(e[kind+'Stacks']||[]).filter(x=>x.turns>0);
      if(kind==='bleed')syncBleeding(e);else if(kind==='naturePoison')syncNaturePoison(e);else syncPeriodicStacks(e,kind);
    }
    for(const [turn,value,natural,label] of [['dotTurns','dotDamagePerTurn',false,'armadilha'],['natureMarkTurns','natureMarkDamage',true,'marca natural'],['natureDecayTurns','natureDecayDamage',true,'apodrecimento']])if(e[turn]>0){if(e.hp>0)tick(e.dotOwners?.[turn],e[value]||0,natural,label);e[turn]--;if(!e[turn])e[value]=0;}
  }
  function enemyAction(s){
    requireRule(s.phase==='battle'&&current(s)?.side==='enemy','Não há ação inimiga pendente.');const e=s.enemies.find(x=>x.id===current(s).id);
    if(!e||!alive(e)){advance(s);return;}
    const plan=enemyPlan(s,e),h=plan.hero;
    if(!h){advance(s);return;}
    random(s);
    s.lastEnemyAction=null;
    withHero(s,h,e,()=>{
      const options={
        choose:()=>plan.ability,
        onCast:(ability,phase)=>{s.lastEnemyAction={actorId:e.id,skillId:ability.id,phase,target:plan.target,heroId:h.id};},
        area:hit=>{
          const targets=s.party.filter(alive);
          for(const ally of targets)withHero(s,ally,e,()=>hit({multiple:targets.length>1,primary:ally===h}));
        },
        rewind:()=>{
          const author=s.party.find(ally=>ally.id===e.campaignState?.lastAction?.heroId);
          if(author)withHero(s,author,e,()=>CampaignEnemyCombat.rewind());
        }
      };
      // The campaign consumes the animation callbacks; the dungeon renders the resulting snapshot.
      for(const animation of CampaignEnemyCombat.resolveTurn(options)){}
    });
    e.mp=Math.min(e.maxMp,e.mp+getBaseManaRegen(e.maxMp));
    enemyDots(s,e);
    e.provocations=(e.provocations||[]).map(x=>({...x,left:x.left-1})).filter(x=>x.left>0);
    for(const key of ['noShieldTurns','healReductionTurns','rootedTurns'])if(e[key]>0)e[key]--;
    advance(s);
  }
  function chooseSubclass(s,h,id){const option=classChoices(h).find(x=>x.id===id);requireRule(!!option,'Especialização indisponível.');requireRule(s.phase!=='battle','Escolha a especialização entre encontros.');const before=stats(s,h);h.subclassChoices[h.subclassChoices.tier30?'tier60':'tier30']=id;const after=stats(s,h);if(alive(h)){h.hp+=Math.max(0,after.maxHp-before.maxHp);h.mp+=Math.max(0,after.maxMp-before.maxMp);}note(s,`${h.characterName} escolheu ${option.name}.`);}
  return Object.freeze({lobby,addHero,stats,available,current,classChoices,enemyIntent,withHero,copy,hero,rebuild,turnOrder,random,note,act,consumePotion,enemyAction,chooseSubclass,enemyTarget});
})();
