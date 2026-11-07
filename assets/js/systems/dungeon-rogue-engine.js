/* Host-authoritative, deterministic dungeon state machine. No campaign persistence. */
const DungeonCombatKernel = (() => {
  'use strict';
  const R=DungeonRules,copy=x=>JSON.parse(JSON.stringify(x)),alive=x=>x.hp>0;
  const native={passives:getPassiveModifiers,damage:applyDamageToEnemy,log,update:updateUI,save:saveCampaign,queue:queueCampaignSave};
  function requireRule(ok,message){if(!ok)throw new Error(message);}
  function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
  function pick(s,a){return a[Math.floor(random(s)*a.length)];}
  function shuffle(s,a){const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function hash(value){let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
  function note(s,text){s.log.push(String(text).slice(0,400));s.log=s.log.slice(-65);}
  function stampDots(s,h,t){
    if(!t)return;
    for(const key of ['burnStacks','poisonStacks','bleedStacks','naturePoisonStacks'])for(const stack of t[key]||[])if(!stack.ownerId)stack.ownerId=h.id;
    t.dotOwners||={};
    for(const key of ['dotTurns','natureMarkTurns','natureDecayTurns'])if(t[key]>0){const source=s.party.find(x=>x.characterId===t.equipmentDotOwners?.[key]);t.dotOwners[key]=source?.id||t.dotOwners[key]||h.id;}
  }
  function withHero(s,h,t,fn,scale=1){
    const saved={player,effects:playerEffects,enemy,mode:currentMode,pendingLevelUps,levelUpPoints,allocation,displayState,isDead,isProcessingTurn,random:Math.random,passives:getPassiveModifiers,damage:applyDamageToEnemy,log,update:updateUI,save:saveCampaign,queue:queueCampaignSave};
    player=h;playerEffects=h.effects;enemy=t;currentMode='dungeon_run';pendingLevelUps=0;levelUpPoints=0;allocation={strength:0,vitality:0,wisdom:0};isDead=false;isProcessingTurn=false;
    displayState={playerHp:h.hp,playerMp:h.mp,playerXp:0,enemyHp:t?.hp||0};Math.random=()=>random(s);
    log=text=>note(s,text);updateUI=()=>{};saveCampaign=()=>{};queueCampaignSave=()=>{};
    getPassiveModifiers=()=>native.passives(player.rogueMods||{});
    applyDamageToEnemy=(amount,options)=>native.damage(Math.floor(amount*scale),options);
    try{return fn();}finally{
      stampDots(s,h,t);h.effects=playerEffects;h.hp=Math.max(0,Number(h.hp)||0);h.mp=Math.max(0,Number(h.mp)||0);
      player=saved.player;playerEffects=saved.effects;enemy=saved.enemy;currentMode=saved.mode;pendingLevelUps=saved.pendingLevelUps;levelUpPoints=saved.levelUpPoints;allocation=saved.allocation;displayState=saved.displayState;isDead=saved.isDead;isProcessingTurn=saved.isProcessingTurn;
      Math.random=saved.random;getPassiveModifiers=saved.passives;applyDamageToEnemy=saved.damage;log=saved.log;updateUI=saved.update;saveCampaign=saved.save;queueCampaignSave=saved.queue;
    }
  }
  function stats(s,h){return withHero(s,h,null,()=>({...getPreviewStats(),power:getSkillPowerBonus(),attack:getActiveAttack(),crit:getArcherCriticalProfile().critChance,manaRegen:getManaRegen(),armor:getPassiveModifiers().flatReduction}));}
  function rebuild(s,h){
    const b=classes[h.class],counts=h.attributes||{strength:0,vitality:0,wisdom:0};h.stats.invested=createDefaultInvestedStats(counts);
    const i=h.stats.invested;i.attackGain=i.skillGain=i.strength*getAttributePointGain('strength',h.level);i.hpGain=i.vitality*getAttributePointGain('vitality',h.level);i.mpGain=i.wisdom*getAttributePointGain('wisdom',h.level);
    h.maxHp=b.hp+i.hpGain;h.maxMp=b.mp+i.mpGain;h.attack=b.attack+i.attackGain;h.stats.investedAtLevel=h.level;
    EquipmentSystem.refreshEquipmentStats(h);
  }
  function hero(s,className,name,owner,relic='ember'){
    requireRule(Object.hasOwn(classes,className),'Classe inválida.');const b=classes[className],id='h'+(++s.serial);
    const h={id,characterId:'rogue-'+s.id+'-'+id,characterName:String(name||className).trim().slice(0,28)||className,class:className,owner,offline:false,level:1,xp:0,coins:0,baseStats:{hp:b.hp,mp:b.mp,attack:b.attack},baseAttack:b.attack,maxHp:b.hp,maxMp:b.mp,attack:b.attack,hp:b.hp,mp:b.mp,subclassChoices:{tier30:null,tier60:null},attributes:{strength:0,vitality:0,wisdom:0},stats:{regionKills:{},regionBossKills:{},enemiesDefeated:0,bossesDefeated:0,deaths:0,coinsEarned:0,invested:createDefaultInvestedStats(),investedAtLevel:1},inventory:[],equipment:{},effects:createDefaultPlayerEffects(),relicId:R.relics.find(x=>x.id===relic)?.id||'none',rogueMods:copy(R.relics.find(x=>x.id===relic)?.mods||{}),boons:[],flasks:{life:2,mana:2,revive:1},aggro:0,aggroTurns:0};
    h.equipment.weapon={...EquipmentSystem.createItem('Floresta','weapon',className,'comum',h),uid:id+'-weapon'};
    h.equipment.chest={...EquipmentSystem.createItem('Floresta','chest',className,'comum',h),uid:id+'-chest'};
    const c=stats(s,h);h.hp=c.maxHp;h.mp=c.maxMp;return h;
  }
  function lobby(seed,leader='local'){
    const rng=hash(seed||'expedition');return {version:2,id:'r'+rng.toString(36)+'-'+Date.now().toString(36),seed:String(seed||'expedition').slice(0,48),rng,serial:0,revision:0,leader,phase:'lobby',party:[],enemies:[],node:0,act:0,biomes:[],choices:[],room:null,round:1,order:[],cursor:0,gold:80,log:[],history:[],roomsCleared:0,bosses:0,reward:{},outcome:null};
  }
  function addHero(s,config){requireRule(s.phase==='lobby'&&s.party.length<R.maxParty,'O grupo já está completo.');const h=hero(s,config.className,config.name,config.owner||s.leader,config.relicId);s.party.push(h);return h;}
  function start(s,seed){
    requireRule(s.phase==='lobby'&&s.party.length>0,'Escolha ao menos um aventureiro.');
    if(seed!==undefined){s.seed=String(seed).trim().slice(0,48)||s.seed;s.rng=hash(s.seed);}
    s.biomes=['Floresta',pick(s,['Caverna','Ruinas','Pantano']),pick(s,['Vulcao','Abismo','Fortaleza','Necropole']),pick(s,['Citadela','Panteao','Cataclismo','Paradoxo'])];
    note(s,'A expedição começou. Vida, ouro e escolhas pertencem somente a esta jornada.');path(s);
  }
  function path(s){
    s.phase='path';s.enemies=[];s.order=[];s.act=Math.floor(s.node/R.roomsPerAct);
    if(s.node%R.roomsPerAct===R.roomsPerAct-1){s.choices=[{id:'boss-'+s.node,type:'boss'}];return;}
    const side=shuffle(s,['rest','event','treasure','merchant']);
    s.choices=[{id:'battle-'+s.node,type:'battle'},{id:side[0]+'-'+s.node,type:side[0]},{id:(s.node%3===2?'elite':side[1])+'-'+s.node,type:s.node%3===2?'elite':side[1]}];
  }
  function classChoices(h){const data=subclassChoicesByClass[h.class];return h.level>=30&&!h.subclassChoices.tier30?data.tier30:h.level>=60&&!h.subclassChoices.tier60?data.tier60[h.subclassChoices.tier30]||[]:[];}
  function increaseLevel(s,h){
    const old=stats(s,h),bonus=withHero(s,h,null,()=>getPassiveModifiers().xpBonus||0);
    const progress=(h.levelProgress||0)+R.levelsPerRoom*(1+bonus),earned=Math.floor(progress+1e-8);h.levelProgress=Math.max(0,progress-earned);
    const next=Math.min(100,h.level+earned);
    const weights=h.class==='Guerreiro'?[2,2,1]:h.class==='Arqueiro'?[2,1,2]:[1,1,3];
    for(let n=h.level;n<next;n++){const keys=['strength','vitality','wisdom'],total=n+1;let best=keys[0],deficit=-Infinity;for(let k=0;k<3;k++){const delta=total*weights[k]/5-h.attributes[keys[k]];if(delta>deficit){best=keys[k];deficit=delta;}}h.attributes[best]++;}
    h.level=next;rebuild(s,h);const c=stats(s,h);if(alive(h)){h.hp=Math.min(c.maxHp,h.hp+Math.max(0,c.maxHp-old.maxHp));h.mp=Math.min(c.maxMp,h.mp+Math.max(0,c.maxMp-old.maxMp));}
  }
  function gear(s,h,rarity){
    const slot=pick(s,EquipmentData.slots),region=s.biomes[s.act];return {...EquipmentSystem.createItem(region,slot,h.class,rarity||pick(s,s.act>=2?['rara','ultra_rara']:['comum','incomum']),h),uid:'loot-'+(++s.serial)};
  }
  function finishRoom(s){
    if(window.DungeonJourneyRules)return window.DungeonJourneyRules.finishBattle(s);
    s.roomsCleared++;s.history.push({node:s.node,type:s.room.type,region:s.biomes[s.act]});
    if(s.room.type==='boss')s.bosses++;
    const coinBonus=s.party.reduce((total,h)=>total+withHero(s,h,null,()=>getPassiveModifiers().coinBonus||0),0)/s.party.length;
    const amount=Math.floor(((s.room.type==='elite'?65:s.room.type==='boss'?100:30)+s.act*20)*(1+coinBonus));s.gold+=amount;
    for(const h of s.party)increaseLevel(s,h);
    s.phase='reward';s.reward={};
    for(const h of s.party){s.reward[h.id]={options:shuffle(s,R.boons).slice(0,3).map(x=>x.id),chosen:false,gear:(['battle','elite','boss'].includes(s.room.type)||s.room.type==='treasure'&&s.room.opened)?gear(s,h,s.room.type==='boss'?rarityOrder[Math.min(4,s.act+1)]:null):null};}
    note(s,`Sala concluída: +${amount} ouro para o grupo e evolução dos aventureiros.`);
  }
  function next(s){
    requireRule(s.phase==='reward'&&s.party.every(h=>s.reward[h.id]?.chosen&&!classChoices(h).length),'Escolha as bênçãos e especializações de todos os aventureiros.');
    s.node++;if(s.node>=R.acts*R.roomsPerAct){end(s,'victory');return;}path(s);
  }
  function end(s,outcome){if(window.DungeonJourneyRules)return window.DungeonJourneyRules.end(s,outcome);s.phase='ended';s.outcome=outcome;s.shards=s.roomsCleared+s.bosses*3+(outcome==='victory'?12:0);note(s,outcome==='victory'?'Os quatro guardiões caíram. A expedição foi concluída.':'A expedição terminou. As memórias conquistadas permanecem neste modo.');}
  function room(s,id){
    requireRule(s.phase==='path','O caminho não pode ser escolhido agora.');requireRule(s.party.every(h=>!classChoices(h).length),'Escolha a especialização pendente.');
    const selected=s.choices.find(x=>x.id===id);requireRule(!!selected,'Caminho inválido.');s.room=copy(selected);s.choices=[];
    if(['battle','elite','boss'].includes(selected.type)){battle(s);return;}
    s.phase=selected.type;
    if(selected.type==='merchant')s.shop=s.party.flatMap(h=>[{id:'life-'+h.id,heroId:h.id,kind:'life',price:30+s.act*10},{id:'mana-'+h.id,heroId:h.id,kind:'mana',price:25+s.act*10},{id:'gear-'+h.id,heroId:h.id,kind:'gear',price:70+s.act*35,item:gear(s,h)}]);
  }
  function battle(s){
    const region=s.biomes[s.act],boss=s.room.type==='boss',elite=s.room.type==='elite',living=s.party.filter(alive),avg=living.reduce((n,h)=>n+h.level,0)/living.length;
    const count=boss?1:living.length;
    // Encounter budgets depend on depth and party size, so upgrades really make heroes stronger.
    const aggregate=living.length*(33+1.9*avg+.08*avg*avg);
    s.enemies=Array.from({length:count},(_,i)=>{
      const template=boss?regions[region].boss:pick(s,regions[region].enemies),level=Math.max(1,Math.round(avg+s.act+(elite?3:0)));
      const maxHp=Math.max(60,Math.floor(aggregate*(boss?8:elite?4.2:2.8)/count));
      return {id:'e'+(++s.serial),instanceId:'e'+s.serial,baseName:template.name,name:template.name,region,level,isBoss:boss,hp:maxHp,maxHp,attack:Math.max(8,Math.floor((16+1.4*avg+.055*avg*avg)*(boss?1.55:elite?1.25:1))),armor:Math.floor(level*.12),maxMp:80+level*8,mp:80+level*8,shieldValue:0,shieldTurns:0,attackDownTurns:0,armorDownTurns:0,burnStacks:[],poisonStacks:[],bleedStacks:[],used:{},role:boss?'boss':i%2?'caster':'brute',buffTurns:0,initiative:8+s.act};
    });
    for(const h of s.party){withHero(s,h,null,()=>resetCombatEffects());h.aggroTurns=0;h.aggro=0;}
    s.phase='battle';s.round=1;turnOrder(s);note(s,`${boss?'Guardião: ':'Encontro: '}${s.enemies.map(e=>e.name).join(', ')}.`);
  }
  function turnOrder(s){
    s.order=[...s.party.filter(alive).map(h=>({id:h.id,side:'hero',speed:({Guerreiro:10,Arqueiro:15,Mago:11,'Adepto da Natureza':12}[h.class])+Math.floor(random(s)*4)})),...s.enemies.filter(alive).map(e=>({id:e.id,side:'enemy',speed:e.initiative+Math.floor(random(s)*4)}))].sort((a,b)=>b.speed-a.speed).map(({id,side})=>({id,side}));s.cursor=0;
  }
  function current(s){if(s.phase!=='battle')return null;return s.order[s.cursor]||null;}
  function advance(s){
    if(s.phase!=='battle')return;
    if(!s.party.some(alive)){end(s,'defeat');return;}
    if(!s.enemies.some(alive)){finishRoom(s);return;}
    do{ s.cursor++;if(s.cursor>=s.order.length){s.round++;turnOrder(s);}const entry=current(s),unit=(entry.side==='hero'?s.party:s.enemies).find(x=>x.id===entry.id);if(unit&&alive(unit))break;}while(true);
  }
  function available(s,h,target=s.enemies.find(alive)){
    return withHero(s,h,target,()=>getSkillInfo().map(k=>{
      const effectiveCost=useSkillCost(k),hpCost=Math.floor(getCurrentCaps().maxHp*(k.hpCostPercent||0));
      const blockedReason=h.mp<effectiveCost?'Mana insuficiente.':h.hp<=hpCost?'Vida insuficiente para o sacrifício.':h.effects.forcedBasicTurns>0?'Esta postura só permite ataques básicos.':k.type==='warrior_ultrasonic_cuts'&&h.effects.ultrasonicRecoveryTurns>0?'Use outra ação antes de reativar Cortes Ultrassônicos.':h.effects.skipNextTurn&&!(h.effects.controlImmuneTurns>0)&&!k.canBreakControl?'Interrompido: use uma habilidade que rompe controle ou encerre o turno.':'';
      const provokePriority=window.DungeonJourneyRules?.priority(h,k)||0;return {...k,target:R.target(k),effectiveCost,blockedReason,provokePriority,description:k.description+(provokePriority?' Na dungeon, provoca por três ações de cada inimigo (prioridade '+provokePriority+'); áreas continuam atingindo o grupo.':'')};
    }));
  }
  function canAct(s,h,k){
    requireRule(alive(h),'Este aventureiro está caído.');requireRule(!classChoices(h).length,'Escolha a especialização primeiro.');
    if(k){requireRule(h.mp>=k.effectiveCost,'Mana insuficiente.');requireRule(!k.hpCostPercent||h.hp>Math.floor(stats(s,h).maxHp*k.hpCostPercent),'Vida insuficiente para o sacrifício.');requireRule(!(h.effects.forcedBasicTurns>0),'Esta postura só permite ataques básicos.');}
  }
  function healAlly(s,caster,target,amount,shield=0){
    const scaled=withHero(s,caster,null,()=>{
      let healBonus=caster.class==='Adepto da Natureza'&&hasUnlockedPassiveType('nature_fairy_aura')&&(caster.effects.natureCadence||0)>=3?(getPlayerSubclassState().tier60==='fada_monarca'?.1:.05):0;
      if(caster.effects.natureCrownedTurns>0)healBonus+=.2;
      let shieldBonus=caster.class==='Adepto da Natureza'&&hasUnlockedPassiveType('nature_forest_oath')?.06:0;
      if(caster.class==='Adepto da Natureza'&&getPlayerSubclassState().tier60==='protetor_da_floresta'&&hasUnlockedPassiveType('nature_fairy_aura')&&(caster.effects.natureCadence||0)>=3)shieldBonus+=.1;
      if(caster.effects.natureShieldBonusTurns>0)shieldBonus+=caster.effects.natureShieldBonusPercent||0;
      return {heal:Math.floor(EquipmentSystem.modifyHealing(caster,caster.effects,amount,{canHeal:target.hp<stats(s,target).maxHp})*(1+healBonus)),shield:Math.floor(EquipmentSystem.modifyShield(caster,caster.effects,shield,{track:false})*(1+shieldBonus))};
    });
    const c=stats(s,target),before=target.hp;
    const reduction=target.effects.healReductionTurns>0?target.effects.healReductionPercent||0:0;
    target.hp=Math.min(c.maxHp,target.hp+Math.floor(scaled.heal*(1-reduction)));
    const result={heal:target.hp-before,shield:target.noShieldTurns>0?0:scaled.shield};
    if(result.shield>0){target.effects.shieldValue+=result.shield;target.effects.shieldTurns=Math.max(target.effects.shieldTurns,2);if(target===caster)target.effects.rogueShieldFresh=true;}
    withHero(s,caster,null,()=>{EquipmentSystem.noteHealing(caster,caster.effects,result.heal);EquipmentSystem.noteShield(caster,caster.effects,result.shield);if(result.heal>0||result.shield>0)grantNatureCadence();});
    return result;
  }
  function support(s,h,k,targetId){
    const recipients=k.target==='party'?s.party.filter(alive):[s.party.find(x=>x.id===targetId&&alive(x))];requireRule(recipients.every(Boolean),'Selecione um aliado vivo.');
    withHero(s,h,s.enemies.find(alive),()=>beginEquipmentAction('skill',k));h.mp-=k.effectiveCost;h.effects.firstSkillFreeAvailable=false;
    for(const ally of recipients){
      const f=ally.effects,beforeEffects={...ally.effects};
      if(k.type==='warrior_second_wind'){
        healAlly(s,h,ally,k.heal);if(k.cleansesDot)withHero(s,ally,null,()=>cleanseStrongestPlayerDot());
        if(k.damageBuff){f.finalDamageBuffTurns=Math.max(f.finalDamageBuffTurns,k.turns);f.finalDamageBuffPercent=Math.max(f.finalDamageBuffPercent,k.damageBuff);}
      }else if(k.type==='mage_mana_shield'){
        f.shieldValue=0;f.shieldTurns=0;healAlly(s,h,ally,0,k.shield);
        f.shieldReactiveWeakening=h.subclassChoices.tier60==='corrompido';f.rogueShieldReactive=f.shieldReactiveWeakening;
      }else if(k.type==='nature_vine_cocoon')healAlly(s,h,ally,0,k.shield);
      else if(k.type==='nature_ancestral_song'){healAlly(s,h,ally,k.heal,k.shield||0);if(k.enemyDamageDownPercent)for(const e of s.enemies.filter(alive)){e.attackDownPercent=Math.max(e.attackDownPercent||0,k.enemyDamageDownPercent);e.attackDownTurns=Math.max(e.attackDownTurns||0,3);}}
      else if(k.type==='warrior_smoke_bomb'){f.nextIncomingAutoMiss=true;f.nextDamageBonusPercent=Math.max(f.nextDamageBonusPercent,k.nextDamageBonus);}
      else if(k.type==='warrior_faith_shield'){f.invulnerableTurns=Math.max(f.invulnerableTurns,k.turns);f.storedFaithDamage=0;}
      else if(k.type==='warrior_warcry'){f.finalDamageBuffTurns=Math.max(f.finalDamageBuffTurns,k.turns);f.finalDamageBuffPercent=Math.max(f.finalDamageBuffPercent,k.totalDamagePercent);if(k.damageReductionPercent){f.percentReductionTurns=k.turns;f.percentReduction=k.damageReductionPercent;}}
      else if(k.type==='mage_concentration'){f.finalDamageBuffTurns=Math.max(f.finalDamageBuffTurns,k.turns);f.finalDamageBuffPercent=Math.max(f.finalDamageBuffPercent,k.percent);f.manaRegenBuffTurns=Math.max(f.manaRegenBuffTurns,k.turns);f.manaRegenBuffPercent=Math.max(f.manaRegenBuffPercent,k.manaRegenPercent);}
      recordCombatEffectSources(f,beforeEffects,k.name);
      note(s,`${h.characterName} usou ${k.name} em ${ally.characterName}.`);
    }
    // A newly granted buff retains its complete duration when caster is a recipient.
    h.effects.freshBuffs=({warrior_second_wind:['finalDamageBuffTurns'],warrior_warcry:['finalDamageBuffTurns','percentReductionTurns'],warrior_faith_shield:['invulnerableTurns'],mage_concentration:['finalDamageBuffTurns','manaRegenBuffTurns']}[k.type]||[]).filter(key=>h.effects[key]>0);
    if(h.effects.equipmentAction)h.effects.equipmentAction.resolving=false;
    h.effects.lastActionType=k.type;

  }
  function nativeCast(s,h,k,target){
    const mode=k.target;
    if(mode==='enemies'){
      const before=copy(h),targets=s.enemies.filter(alive);let first;
      for(const [i,e] of targets.entries()){
        const actor=copy(before);withHero(s,actor,e,()=>{const info=getSkillInfo().find(x=>x.type===k.type);const result=applySkillLocally(info,h.characterName,true);requireRule(!result.blocked,result.message);note(s,result.message);if(i===0)endEquipmentAction();},R.areaScale);
        if(i===0)first=actor;
      }
      Object.assign(h,first);note(s,`${k.name}: área inimiga (70% do dano direto por alvo; custo único).`);
    }else{
      withHero(s,h,target||s.enemies.find(alive),()=>{const info=getSkillInfo().find(x=>x.type===k.type);const result=applySkillLocally(info,h.characterName,mode!=='self');requireRule(!result.blocked,result.message);note(s,result.message);s.lastAction={serial:++s.serial,actorId:h.id,targetId:target?.id||null,skillType:k.type,hits:result.hitDamages||[]};});
    }

  }
  function heroEnd(s,h,actionTarget=null){
    const victory=!s.enemies.some(alive),t=actionTarget||s.enemies.find(alive)||s.enemies[0]||null;
    withHero(s,h,t,()=>{
      applyTurnStartPassives();decayPlayerBuffs();applyEndOfTurnRecovery();
      if(h.effects.shieldTurns>0&&!h.effects.rogueShieldFresh&&--h.effects.shieldTurns===0){h.effects.shieldValue=0;h.effects.shieldReactiveWeakening=false;h.effects.rogueShieldReactive=false;}
      h.effects.rogueShieldFresh=false;if(h.noShieldTurns>0)h.noShieldTurns--;
      if(victory)return;
      if(h.effects.burnTurns>0){const d=tickPeriodicStacks(h.effects,'burn',damage=>Math.floor(damage*(1-(getPassiveModifiers().burnDamageReductionPercent||0))));h.hp=Math.max(0,h.hp-d);EquipmentSystem.afterIncoming(h,h.effects,t,{damage:d,periodic:true,shieldAbsorbed:0});if(d)note(s,`${h.characterName}: ${d} por queimadura.`);}
      for(const kind of ['poison','bleed'])if(h.effects[kind+'Stacks']?.length){const d=tickPeriodicStacks(h.effects,kind);h.hp=Math.max(0,h.hp-d);EquipmentSystem.afterIncoming(h,h.effects,t,{damage:d,periodic:true,shieldAbsorbed:0});if(d)note(s,`${h.characterName}: ${d} por ${kind==='poison'?'veneno':'sangramento'}.`);}
    });
    if(victory){finishRoom(s);return;}
    if(alive(h))for(const d of h.effects.pendingEnemyDebuffs||[]){
      if(!s.enemies.some(e=>e.id===d.sourceId&&alive(e))){d.left=0;continue;}
      if(d.type==='doom'){h.hp=Math.max(0,h.hp-Math.floor(stats(s,h).maxHp*d.percent/100));d.percent++;}
      else if(--d.left<=0){if(d.type==='haunt'){window.DungeonJourneyRules.retreat(s,`${d.source}: o grupo foi obrigado a recuar.`);return;}if(d.type==='deathmark')h.hp=0;}
    }
    h.effects.pendingEnemyDebuffs=(h.effects.pendingEnemyDebuffs||[]).filter(d=>d.type==='doom'||d.left>0);

    if(h.effects.berserkerLastStandPending){h.effects.berserkerLastStandPending=false;h.hp=0;}
    if(!alive(h))note(s,`${h.characterName} caiu. Retornará com 20% da vida máxima se o grupo vencer.`);
    advance(s);
  }
  function act(s,h,intent){
    requireRule(s.phase==='battle'&&current(s)?.side==='hero'&&current(s)?.id===h.id,'Aguarde o turno deste aventureiro.');
    s.lastAction=null;const shieldBefore=h.effects.shieldValue;
    let k=intent.kind==='skill'?available(s,h,s.enemies.find(x=>x.id===intent.targetId)||s.enemies.find(alive)).find(x=>x.type===intent.skillType):null;
    requireRule(intent.kind!=='skill'||!!k,'Habilidade indisponível.');canAct(s,h,k);
    requireRule(!(h.effects.forcedBasicTurns>0)||intent.kind==='basic','Esta postura só permite ataques básicos.');
    const side=k?.target||'enemy',target=s.enemies.find(e=>e.id===intent.targetId&&alive(e));
    if(['basic','skill'].includes(intent.kind)&&side==='enemy')requireRule(!!target,'Escolha o inimigo que receberá a habilidade.');
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
    }else if(intent.kind==='item'){
      const type=intent.itemId,ally=s.party.find(x=>x.id===intent.targetId);requireRule(['life','mana','revive'].includes(type)&&h.flasks[type]>0,'Provisão indisponível.');requireRule(!!ally&&(type==='revive'?!alive(ally):alive(ally)),'Escolha um alvo válido para a provisão.');
      withHero(s,h,s.enemies.find(alive),()=>beginEquipmentAction('consumable'));h.flasks[type]--;
      if(type==='life')healAlly(s,h,ally,40+12*h.level);
      if(type==='mana')ally.mp=Math.min(stats(s,ally).maxMp,ally.mp+30+10*h.level);
      if(type==='revive'){ally.hp=Math.max(1,Math.floor(stats(s,ally).maxHp*.35));ally.effects=createDefaultPlayerEffects();}
      note(s,`${h.characterName} usou ${type==='life'?'Tônico vital':type==='mana'?'Essência de mana':'Sopro de retorno'} em ${ally.characterName}.`);
    }else requireRule(false,'Ação inválida.');
    if(h.effects.shieldValue>shieldBefore&&h.effects.shieldTurns>0)h.effects.rogueShieldFresh=true;
    if(k&&window.DungeonJourneyRules)window.DungeonJourneyRules.provoke(s,h,k);
    heroEnd(s,h,target||null);
  }
  function enemyTarget(s,e){const heroes=s.party.filter(alive),entries=(e.provocations||[]).filter(x=>x.left>0&&heroes.some(h=>h.id===x.heroId)).sort((a,b)=>b.priority-a.priority||b.serial-a.serial);return entries.length?heroes.find(h=>h.id===entries[0].heroId):[...heroes].sort((a,b)=>(a.hp/stats(s,a).maxHp)-(b.hp/stats(s,b).maxHp))[0];}
  function enemyIntent(s,e){
    if(e.charge)return {kind:'release',name:e.charge.name,target:'party'};
    const allies=s.enemies.filter(alive),missing=allies.filter(x=>x.hp<x.maxHp*.55),moves=R.enemySkills(e).filter(x=>e.mp>=x.cost);
    const healing=moves.find(x=>x.kind==='heal'),charge=moves.find(x=>x.kind==='charge'),buff=moves.find(x=>x.kind==='buff');
    if(healing&&missing.length&&(e.usedHealRound===undefined||s.round-e.usedHealRound>=3))return healing;
    if(charge&&s.round%3===0)return charge;
    if(buff&&allies.some(x=>!x.buffTurns)&&s.round%3===1)return buff;
    return moves.find(x=>['attack','area'].includes(x.kind))||{kind:'attack',name:'Ataque básico',target:'hero',cost:0,multiplier:1};
  }
  function enemyDots(s,e){
    const resolveOwner=id=>s.party.find(h=>h.id===id)||s.party[0];
    function tick(ownerId,raw,natural,label){
      const h=resolveOwner(ownerId);withHero(s,h,e,()=>{
        const d=Math.floor(raw*EquipmentSystem.getDotDamageMultiplier(h)*(natural?getNatureDotMultiplier():1));
        const lost=Math.min(e.hp,d);e.hp=Math.max(0,e.hp-d);applyLifeSteal(lost);
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
    const timers=['attackDownTurns','armorDownTurns','blizzardTurns','aimLegTurns','noShieldTurns','healReductionTurns','buffTurns','shieldTurns'],previous=Object.fromEntries(timers.map(key=>[key,e[key]||0]));let refreshedBuff=false;
    const passiveSkip=Math.max(0,...s.party.filter(alive).map(h=>withHero(s,h,e,()=>getPassiveModifiers().enemySkipChance||0)));
    if(e.skipNextAttack||e.rootedTurns>0||e.aimLegTurns>0&&random(s)<(e.aimLegSkipChance||0)||random(s)<(e.blizzardSkipChance||0)||random(s)<passiveSkip){
      e.skipNextAttack=false;e.rootedTurns=Math.max(0,(e.rootedTurns||0)-1);note(s,`${e.name} teve sua ação interrompida.`);
      if(e.charge){e.charge=null;note(s,'A conjuração preparada foi cancelada.');}
    }else{
      const move=enemyIntent(s,e);e.mp-=move.cost||0;
      if(move.kind==='heal'){const ally=[...s.enemies.filter(alive)].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];ally.hp=Math.min(ally.maxHp,ally.hp+Math.floor(ally.maxHp*(e.isBoss?.16:.25)*(1-(ally.healReductionTurns>0?ally.healReductionPercent||0:0))));e.usedHealRound=s.round;note(s,`${e.name} restaurou um aliado com ${move.name}.`);}
      else if(move.kind==='buff'){refreshedBuff=true;for(const ally of s.enemies.filter(alive)){ally.buffTurns=3;ally.buffSource=move.name;if(!(ally.noShieldTurns>0)){ally.shieldValue+=Math.floor(ally.maxHp*.10);ally.shieldTurns=Math.max(ally.shieldTurns,3);}}note(s,`${e.name} usou ${move.name}: +20% de ataque e escudo para a linha inimiga.`);}
      else if(move.kind==='charge'){e.charge={name:move.name};note(s,`${e.name} prepara ${move.name}. O próximo golpe atingirá todo o grupo!`);}
      else{
        const targets=move.target==='party'?s.party.filter(alive):[enemyTarget(s,e)];
        for(const h of targets){if(!h)continue;const raw=Math.floor(e.attack*(e.buffTurns>0?1.2:1)*(move.kind==='release'?1.35:move.multiplier||1)*(e.attackDownTurns>0?1-(e.attackDownPercent||0):1));
          withHero(s,h,e,()=>{const r=applyIncomingDamage(raw);if(h.effects.rogueShieldReactive&&!(h.effects.invulnerableTurns>0)&&r.absorbed>0){e.attackDownPercent=Math.max(e.attackDownPercent||0,.3);e.attackDownTurns=Math.max(e.attackDownTurns||0,3);}if(h.effects.shieldValue<=0)h.effects.rogueShieldReactive=false;if(!r.missed&&move.dot)addPeriodicStack(h.effects,move.dot,Math.max(2,Math.floor(e.attack*.12)),2,move.name);if(!r.missed&&move.debuffs){const d=move.debuffs;h.effects.pendingEnemyDebuffs||=[];for(const type of ['haunt','deathmark','doom'])if(d[type]&&!h.effects.pendingEnemyDebuffs.some(x=>x.type===type&&x.sourceId===e.id))h.effects.pendingEnemyDebuffs.push({type,sourceId:e.id,source:move.name,left:d[type],percent:1});for(const[type,field]of [['damageDown','damageDown'],['healDown','healReduction']])if(d[type]){h.effects[field+'Turns']=d.turns||3;h.effects[field+'Percent']=d[type];(h.effects.effectSources||={})[field+'Turns']=move.name;}}note(s,`${e.name} → ${h.characterName}: ${r.damage} de dano (${move.name})${r.missed?' · esquiva':''}.`);});
          if(!alive(h))note(s,`${h.characterName} caiu.`);
        }
        if(move.kind==='release')e.charge=null;
      }
    }
    e.mp=Math.min(e.maxMp,e.mp+getBaseManaRegen(e.maxMp));
    // Damage over time happens after the affected creature's own action.
    enemyDots(s,e);
    e.provocations=(e.provocations||[]).map(x=>({...x,left:x.left-1})).filter(x=>x.left>0);
    for(const key of timers)if(e[key]>0&&e[key]<=previous[key]&&!(refreshedBuff&&['buffTurns','shieldTurns'].includes(key)))e[key]--;
    if(!e.shieldTurns)e.shieldValue=0;if(!e.blizzardTurns)e.blizzardSkipChance=0;
    advance(s);
  }
  function chooseBoon(s,h,id){
    const offer=s.reward[h.id];requireRule(s.phase==='reward'&&offer&&!offer.chosen&&offer.options.includes(id),'Bênção indisponível.');const b=R.boons.find(x=>x.id===id),amount=b.amount??Math.floor(b.base+b.scale*h.level);h.rogueMods[b.mod]=(h.rogueMods[b.mod]||0)+amount;h.boons.push({id,amount});offer.chosen=true;
    if(alive(h)){if(b.mod==='hp')h.hp+=amount;if(b.mod==='mp')h.mp+=amount;}
    note(s,`${h.characterName} recebeu ${b.name}.`);
  }
  function chooseSubclass(s,h,id){const option=classChoices(h).find(x=>x.id===id);requireRule(!!option,'Especialização indisponível.');requireRule(s.phase!=='battle','Escolha a especialização entre encontros.');const before=stats(s,h);h.subclassChoices[h.subclassChoices.tier30?'tier60':'tier30']=id;const after=stats(s,h);if(alive(h)){h.hp+=Math.max(0,after.maxHp-before.maxHp);h.mp+=Math.max(0,after.maxMp-before.maxMp);}note(s,`${h.characterName} escolheu ${option.name}.`);}
  function claimGear(s,h){const reward=s.reward[h.id];requireRule(s.phase==='reward'&&reward?.gear,'Não há equipamento para receber.');const item=reward.gear;h.equipment[item.slot]=item;reward.gear=null;const c=stats(s,h);h.hp=Math.min(h.hp,c.maxHp);h.mp=Math.min(h.mp,c.maxMp);note(s,`${h.characterName} equipou ${item.name}.`);}
  function event(s,choice){
    requireRule(['rest','event','treasure'].includes(s.phase),'Não há encontro para resolver.');
    if(s.phase==='rest'){
      if(choice==='rescue'){const down=s.party.find(h=>!alive(h));requireRule(!!down&&s.gold>=50,'Reanimar exige um aliado caído e 50 ouro.');s.gold-=50;down.hp=Math.floor(stats(s,down).maxHp*.5);down.effects=createDefaultPlayerEffects();note(s,`${down.characterName} retornou ao grupo.`);}
      else{requireRule(choice==='rest','Escolha inválida.');for(const h of s.party.filter(alive)){const c=stats(s,h);h.hp=Math.min(c.maxHp,h.hp+60+14*h.level);h.mp=Math.min(c.maxMp,h.mp+40+10*h.level);}note(s,'O grupo recuperou vida e mana no santuário.');}
    }else if(s.phase==='treasure'){
      requireRule(['open','safe'].includes(choice),'Escolha inválida.');if(choice==='open'){s.room.opened=true;s.gold+=60+s.act*25;for(const h of s.party.filter(alive)){const c=stats(s,h);h.hp=Math.max(1,h.hp-Math.floor(c.maxHp*.08));}note(s,'O selo feriu o grupo, mas revelou ouro e equipamento.');}else note(s,'O grupo contornou o selo sem perder recursos.');
    }else{
      requireRule(['offering','memory','leave'].includes(choice),'Escolha inválida.');
      if(choice==='offering'){requireRule(s.gold>=40,'A oferenda custa 40 ouro.');s.gold-=40;for(const h of s.party){h.rogueMods.power=(h.rogueMods.power||0)+5+h.level;}}
      if(choice==='memory'){for(const h of s.party.filter(alive)){h.hp=Math.max(1,h.hp-Math.floor(stats(s,h).maxHp*.12));h.rogueMods.crit=(h.rogueMods.crit||0)+.02;}s.gold+=25;}
      note(s,choice==='leave'?'O altar ficou para trás.':'O altar respondeu à escolha do grupo.');
    }
    finishRoom(s);
  }
  function buy(s,h,id){requireRule(s.phase==='merchant','O mercador não está disponível.');const offer=s.shop.find(x=>x.id===id&&x.heroId===h.id&&!x.sold);requireRule(!!offer&&s.gold>=offer.price,'Oferta indisponível ou ouro insuficiente.');s.gold-=offer.price;offer.sold=true;if(offer.kind==='gear'){h.equipment[offer.item.slot]=offer.item;const c=stats(s,h);h.hp=Math.min(h.hp,c.maxHp);h.mp=Math.min(h.mp,c.maxMp);}else h.flasks[offer.kind]++;note(s,`${h.characterName} comprou ${offer.kind==='gear'?offer.item.name:'uma provisão'}.`);}
  function transition(snapshot,owner,intent){
    requireRule(intent&&typeof intent==='object'&&!Array.isArray(intent),'Pedido inválido.');
    if(intent.revision!==undefined)requireRule(intent.revision===snapshot.revision,'A partida mudou. Selecione a ação novamente.');
    const s=copy(snapshot),h=s.party.find(x=>x.id===intent.heroId);
    const controls=h&&(h.owner===owner||owner===s.leader&&h.offline);
    if(intent.kind==='addHero'){requireRule(owner===s.leader&&s.phase==='lobby','Só o anfitrião organiza o grupo.');addHero(s,intent);}
    else if(intent.kind==='start'){requireRule(owner===s.leader,'Só o anfitrião inicia a expedição.');start(s,intent.seed);}
    else if(intent.kind==='path'){requireRule(owner===s.leader,'O anfitrião escolhe o caminho.');room(s,intent.choiceId);}
    else if(intent.kind==='enemy'){requireRule(owner===s.leader,'Somente o anfitrião resolve inimigos.');enemyAction(s);}
    else if(intent.kind==='event'){requireRule(owner===s.leader,'O anfitrião resolve o encontro.');event(s,intent.choiceId);}
    else if(intent.kind==='leaveShop'){requireRule(owner===s.leader&&s.phase==='merchant','Não é possível sair agora.');finishRoom(s);}
    else if(intent.kind==='next'){requireRule(owner===s.leader,'O anfitrião conduz o grupo.');next(s);}
    else if(intent.kind==='abandon'){requireRule(owner===s.leader&&s.phase!=='ended','Somente o anfitrião pode encerrar a expedição.');end(s,'abandoned');}
    else{
      requireRule(!!controls,'Você não controla este aventureiro.');
      if(intent.kind==='configureHero'){requireRule(s.phase==='lobby','O aventureiro só pode ser alterado antes da expedição.');const replacement=hero(s,intent.className,intent.name,h.owner,intent.relicId);replacement.id=h.id;replacement.characterId=h.characterId;s.party[s.party.indexOf(h)]=replacement;}
      else if(intent.kind==='boon')chooseBoon(s,h,intent.choiceId);
      else if(intent.kind==='subclass')chooseSubclass(s,h,intent.choiceId);
      else if(intent.kind==='gear')claimGear(s,h);
      else if(intent.kind==='buy')buy(s,h,intent.offerId);
      else act(s,h,intent);
    }
    s.revision++;return s;
  }
  function validState(s){
    if(!s||s.version!==2||!['lobby','path','battle','reward','rest','event','treasure','merchant','ended'].includes(s.phase)||typeof s.id!=='string'||typeof s.leader!=='string'||!Number.isInteger(s.revision)||s.revision<0)return false;
    if(!Number.isInteger(s.node)||s.node<0||s.node>28||!Number.isInteger(s.act)||s.act<0||s.act>3||!Number.isFinite(s.gold)||s.gold<0||!Array.isArray(s.biomes)||!s.biomes.every(x=>Object.hasOwn(regions,x)))return false;
    if(!Array.isArray(s.party)||s.party.length>3||s.phase!=='lobby'&&!s.party.length||!s.party.every(h=>h&&typeof h.id==='string'&&typeof h.owner==='string'&&Object.hasOwn(classes,h.class)&&Number.isInteger(h.level)&&h.level>=1&&h.level<=100&&Number.isFinite(h.hp)&&h.hp>=0&&Number.isFinite(h.mp)&&h.mp>=0&&h.effects&&h.attributes&&h.stats&&h.equipment&&h.flasks&&h.subclassChoices&&Array.isArray(h.boons)))return false;
    if(!Array.isArray(s.enemies)||s.enemies.length>3||!s.enemies.every(e=>e&&typeof e.id==='string'&&Number.isFinite(e.hp)&&Number.isFinite(e.maxHp)&&e.maxHp>0&&Object.hasOwn(regions,e.region)))return false;
    if(!Array.isArray(s.log)||s.log.length>65||!s.log.every(x=>typeof x==='string')||!Array.isArray(s.choices)||!Array.isArray(s.history)||!Array.isArray(s.order))return false;
    if(s.phase==='battle'&&(!s.order.length||!Number.isInteger(s.cursor)||!s.order[s.cursor]||!s.room))return false;
    if(s.phase==='reward'&&(!s.reward||!s.party.every(h=>s.reward[h.id]&&Array.isArray(s.reward[h.id].options))))return false;
    return NetworkValidation.safeTree(s);
  }
  return Object.freeze({lobby,addHero,start,transition,stats,available,current,classChoices,enemyIntent,validState,withHero,copy,hero,rebuild,turnOrder,random,note,act,enemyAction,chooseSubclass,enemyTarget});
})();
