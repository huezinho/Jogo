/* Campaign enemy specification, 04/11/2026. Shared by the campaign and regional dungeon battles. */
const CampaignEnemyCombat = (() => {
  const a=(id,name,cost,details,extra={})=>({id,name,cost,description:details,...extra});
  const kits={
    2:[a('fang','Presa Venenosa',10,'Causa o dano do ataque e aplica veneno de 5 por turno por 3 turnos.',{basicAttack:true,poison:5,turns:3})],
    3:[a('roots','Raizes',25,'30 de dano + 2% da vida maxima.',{power:30,maxHpPercent:.02})],
    7:[a('stone','Escudo de Pedra',35,'42 de dano; ignora escudo; cria 42 de escudo.',{power:42,shieldFlat:42,ignoreShield:true})],
    10:[a('haunt','Assombrar',30,'50 de dano; fuga forcada apos 2 rodadas.',{power:50,haunt:2})],
    11:[a('lament','Lamento Real',31,'64 de dano; dano do heroi -20% por 3 turnos.',{power:64,damageDown:.2,turns:3})],
    14:[a('shed','Troca de Pele',26,'Cura 33% da vida maxima por turno, 3 turnos.',{regen:.33,turns:3})],
    15:[a('breath','Sopro Corrosivo',50,'40 de dano; veneno de 20 e queimadura de 3% da vida maxima, ambos por 3 turnos.',{power:40,poison:20,burn:.03,turns:3}),a('viscous','Pele Viscosa',38,'Remove debuffs; cura 10% por turno por 5 turnos; escudo de 10%.',{cleanse:true,regen:.1,turns:5,shield:.1})],
    19:[a('scales','Escamas Ardentes',70,'Escudo de 15%; por 5 turnos aplica queimadura de 3% por 3 turnos em quem atacar.',{shield:.15,retaliation:5}),a('eruption','Explosao Vulcanica',80,'180 de dano; queimadura de 3% e cura recebida -25% por 3 turnos.',{power:180,burn:.03,healDown:.25,turns:3})],
    22:[a('rock','Pele Petrea',20,'Escudo de 40% da vida maxima.',{shield:.4})],
    23:[a('reality','Dilacerar Realidade',120,'Prepara por 2 turnos; 400 + 10% da vida atual do heroi; ignora resistencias.',{power:400,currentHpPercent:.1,charge:2,ignoreFlatReduction:true,ignorePercentReduction:true}),a('mantle','Manto do Vazio',80,'Escudo de 18%; dano total +26% por 5 turnos.',{shield:.18,attackBonus:.26,turns:5})],
    26:[a('deathmark','Marca da Morte',50,'Apos 4 turnos causa 100% da vida atual, ignorando resistencia e escudo.',{deathmark:4})],
    27:[a('order','Ordem de Guerra',110,'Retira 60% da mana do heroi; ganha escudo de 3 vezes a mana retirada.',{drain:.6,drainShield:3}),a('steel','Estocada Rasga-Aco',100,'360 de dano; ignora resistencia e escudo; dobra contra escudo.',{power:360,ignoreFlatReduction:true,ignoreShield:true,doubleShield:true})],
    30:[a('reap','Ceifar Alma',45,'Marca ate o fim do combate: executa o heroi em 30% da vida maxima.',{reap:true})],
    31:[a('sentence','Sentenca Funebre',90,'450 de dano; dano -22% e cura -30% por 5 turnos.',{power:450,damageDown:.22,healDown:.3,turns:5}),a('pact','Pacto Funebre',200,'Por 4 turnos, ao receber dano fatal mata quem o atacou.',{pact:4}),a('unprotected','Ceifa do Desprotegido',30,'Se o heroi nao tem escudo, rouba 30% da mana para si.',{drain:.3,unshielded:true})],
    34:[a('double','Ataque Duplo',30,'3 turnos: dois ataques independentes, cada um com mitigacao propria.',{double:3})],
    35:[a('dominion','Dominio Crepuscular',290,'5 turnos: rouba resistencia fixa, escudos e buffs do heroi.',{dominion:5}),a('umbra','Lamina Umbra',102,'400 de dano; sangramento de 30% do dano na vida por turno, 3 turnos.',{power:400,bleedPercent:.3,turns:3})],
    38:[a('solar','Fogo Solar',40,'600 de dano; queimadura padrao de 3% por 10 turnos.',{power:600,burn:.03,turns:10})],
    39:[a('judgment','Julgamento Solar',102,'621 de dano; queimadura de 7% da vida maxima por 3 turnos.',{power:621,burn:.07,turns:3}),a('glare','Clarao Absoluto',184,'Por 3 turnos: dano -30% e 15% de chance de perder cada turno.',{damageDown:.3,skip:.15,turns:3}),a('prism','Prisma do Zenith',298,'Conjura por 3 turnos; causa 1620 de dano.',{power:1620,charge:3})],
    42:[a('wave','Onda Vital',30,'1001 de dano; cura o dano causado na vida do heroi.',{power:1001,leech:true})],
    43:[a('collapse','Colapso Final',204,'3 turnos: queimadura de 4% da vida maxima, veneno de 4% da mana atual e sangramento de 100.',{burn:.04,poisonMana:.04,bleed:100,turns:3}),a('annihilate','Aniquilacao Perfurante',128,'1280 de dano; ignora resistencia e escudo; cura -20% por 2 turnos.',{power:1280,ignoreFlatReduction:true,ignoreShield:true,healDown:.2,turns:2})],
    45:[a('zero','Zerar',42,'Recupera a vida para 100%.',{fullHeal:true})],
    46:[a('devour','Devorar',20,'1400 de dano; aumenta vida atual e maxima pelo dano causado na vida.',{power:1400,grow:true})],
    47:[a('time','Ruptura Temporal',202,'1100 de dano; desfaz a ultima acao sobre o soberano e o ultimo buff do heroi, sem restaurar recursos do heroi.',{power:1100,rewind:true}),a('doom','Fim Inadiavel',111,'DOT irremovivel: 1% da vida maxima, +1 ponto percentual por rodada; nao reaplica.',{doom:true}),a('zeroCollapse','Colapso Zero',222,'Escudo de 75%; cura 10%; dano do heroi -30% por 4 rodadas.',{shield:.75,heal:.1,damageDown:.3,turns:4})]
  };
  const passives={6:'Gosma Toxica',18:'Como uma Fenix',27:'Marcha de Ferro',35:'Ruptura Estelar',37:'Na Visao',39:'Aurea Divina',41:'Duro como Pedra',43:'Manto da Ruina; Fim dos Fracos',44:'Tempo Implacavel',47:'Armadura de Eras'};
  const names=Object.values(regions).flatMap(r=>[...r.enemies,r.boss]).map(e=>e.name);
  const index=name=>names.indexOf(name);
  const enabled=e=>!!e&&(!IS_DUNGEON_PAGE||e.dungeonCampaign)&&!IS_ARENA_PAGE&&e.region!=='Dungeon'&&index(e.baseName)>=0;
  // Attacks whose existing effect can cover the opposing formation.
  const dungeonAreas=new Set(['roots','lament','breath','eruption','reality','sentence','solar','judgment','prism','collapse']);
  const isDungeonArea=ability=>dungeonAreas.has(ability?.id);
  const kit=name=>(kits[index(name)]||[]).map(x=>({...x,campaign:true,type:'campaign'}));
  function state(e=enemy){return e.campaignState||(e.campaignState={turn:0,used:{},timers:{},stolen:{},hero:{},shieldTime:0});}
  function heroState(s=state()){
    return enemy.dungeonCampaign?((s.heroes||={})[player.id]||={}):s.hero;
  }
  function hasDominionOverHero(s){return s.timers.dominion>0&&(!enemy.dungeonCampaign||s.dominionHeroId===player.id);}
  function initialize(e){if(!enabled(e))return;const s=state(e);if(index(e.baseName)===41){e.shieldValue=Math.floor(e.maxHp*.8);s.shieldTime=14;} }
  function restoreState(value){
    const clean=(v,depth=0)=>{if(depth>6)return null;if(typeof v==='number')return Number.isFinite(v)?Math.max(-1e9,Math.min(1e9,v)):0;if(typeof v==='string')return v.slice(0,120);if(typeof v==='boolean'||v===null)return v;if(Array.isArray(v))return v.slice(0,512).map(x=>clean(x,depth+1));if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).slice(0,100).map(([k,x])=>[k,clean(x,depth+1)]));return null;};
    const s=clean(value)||{};return{turn:0,used:{},timers:{},stolen:{},hero:{},shieldTime:0,...s};
  }
  function shield(amount){if(!(enemy.noShieldTurns>0))enemy.shieldValue=(enemy.shieldValue||0)+Math.max(0,Math.floor(amount));}
  function heal(amount){enemy.hp=Math.min(enemy.maxHp,enemy.hp+Math.max(0,Math.floor(amount*(1-(enemy.healReductionTurns>0?enemy.healReductionPercent:0)))));}
  function purge(){
    for(const key of ['burn','poison']){enemy[key+'Stacks']=[];syncPeriodicStacks(enemy,key);}
    enemy.bleedStacks=[];syncBleeding(enemy);
    for(const key of ['natureSongReductionTurns','attackDownTurns','armorDownTurns','healReductionTurns','noShieldTurns','rootedTurns','natureMarkTurns','naturePoisonTurns','natureDecayTurns','dotTurns','blizzardTurns','aimLegTurns'])enemy[key]=0;
    for(const key of ['natureSongReductionPercent','attackDownPercent','armorDownPercent','healReductionPercent','nextDamageTakenPercent','frozenDamageBonusPercent','blizzardSkipChance'])enemy[key]=0;
    enemy.skipNextAttack=false;enemy.debuffSources={};enemy.naturePoisonStacks=[];
  }
  const buffKeys=['visualDemonTurns','attackBuffTurns','attackBuffAmount','attackBuffPercent','skillBuffTurns','skillBuffAmount','skillBuffPercent','finalDamageBuffTurns','finalDamageBuffPercent','guaranteedHitTurns','enemyMissBonusTurns','enemyMissBonus','regenTurns','regenPercent','manaRegenBuffTurns','manaRegenBuffPercent','invulnerableTurns','controlImmuneTurns','lifeStealTurns','lifeStealPercent','natureCrownedTurns','natureTrueFormTurns','natureShieldBonusTurns','natureShieldBonusPercent','nextDamageBonusPercent','nextBarrageDamageBonusPercent','nextIncomingAutoMiss','basicOnlyUntouchableTurns','forcedBasicTurns','percentReductionTurns','percentReduction','enemyMaxHpBonusTurns','enemyMaxHpBonusDamagePercent','natureCadence','arcaneCharges','arcaneChargeTurns','firstAttackDoubleAvailable','samuraiEchoAvailable'];
  function transferBuffs(){
    if(!enabled(enemy))return;
    const s=state(),dom=hasDominionOverHero(s),oracle=index(enemy.baseName)===37;
    if(!dom&&!oracle)return;
    const removed=buffKeys.some(key=>!key.startsWith('visual')&&!!playerEffects[key]);
    if(removed){log(dom?"Dominio Crepuscular roubou os buffs do heroi.":"Na Visao dissipou os buffs do heroi.");if(oracle&&typeof EnemyMotion!=='undefined')EnemyMotion.passive('purge');}
    if(dom&&playerEffects.shieldValue>0){shield(playerEffects.shieldValue);playerEffects.shieldValue=0;playerEffects.shieldTurns=0;}
    if(dom){
      s.stolen.buffs ||= {};
      for(const prefix of ['attackBuff','skillBuff','finalDamageBuff','enemyMissBonus','regen','manaRegenBuff','percentReduction','lifeSteal','enemyMaxHpBonus']){
        if(playerEffects[prefix+'Turns']>0&&!(s.stolen.buffs[prefix+'Turns']>0))for(const key of Object.keys(s.stolen.buffs))if(key.startsWith(prefix))s.stolen.buffs[key]=0;
      }
      for(const k of buffKeys) if(playerEffects[k])s.stolen.buffs[k]=Math.max(Number(s.stolen.buffs[k])||0,Number(playerEffects[k])||0);
      s.stolen.nextDamage=Math.max(s.stolen.nextDamage||0,playerEffects.nextDamageBonusPercent||0,playerEffects.nextBarrageDamageBonusPercent||0);
      s.stolen.autoMiss ||= !!playerEffects.nextIncomingAutoMiss;
    }
    if(dom)refreshStolen(s);
    for(const k of buffKeys)playerEffects[k]=typeof playerEffects[k]==='boolean'?false:0;
  }
  function refreshStolen(s){
    const b=s.stolen.buffs||{};
    s.stolen.attackFlat=b.attackBuffTurns>0?b.attackBuffAmount||0:0;
    s.stolen.attackPercent=b.attackBuffTurns>0?b.attackBuffPercent||0:0;
    s.stolen.damage=b.finalDamageBuffTurns>0?b.finalDamageBuffPercent||0:0;
    s.stolen.dodge=b.enemyMissBonusTurns>0?b.enemyMissBonus||0:0;
    s.stolen.regen=b.regenTurns>0?b.regenPercent||0:0;
    s.stolen.manaRegen=b.manaRegenBuffTurns>0?b.manaRegenBuffPercent||0:0;
    s.stolen.reduction=b.percentReductionTurns>0?b.percentReduction||0:0;
    s.stolen.invulnerable=b.invulnerableTurns>0||b.basicOnlyUntouchableTurns>0;
    s.stolen.lifeSteal=b.lifeStealTurns>0?b.lifeStealPercent||0:0;
    s.stolen.enemyHpBonus=b.enemyMaxHpBonusTurns>0?b.enemyMaxHpBonusDamagePercent||0:0;
  }
  function modifiers(base){if(!enabled(enemy))return;const s=state();if(hasDominionOverHero(s)){s.stolen.flat=base.flatReduction;base.flatReduction=0;} }
  function snapshot(){
    if(!enabled(enemy)||enemy.dungeonCampaign&&index(enemy.baseName)!==47)return;
    state().lastAction={...(enemy.dungeonCampaign?{heroId:player.id}:{}),hp:enemy.hp,maxHp:enemy.maxHp,armor:enemy.armor,shieldValue:enemy.shieldValue,effects:Object.fromEntries(['burnStacks','poisonStacks','bleedStacks','naturePoisonStacks','debuffSources',...enemyDebuffFields,'natureSongReductionPercent','attackDownPercent','armorDownPercent','healReductionPercent','dotDamagePerTurn','dotSourceName','natureMarkDamage','naturePoisonDamage','natureDecayDamage','bleedDamagePerTurn','bleedTurns','burnTurns','burnDamagePerTurn','poisonTurns','poisonDamagePerTurn','blizzardSkipChance','aimLegSkipChance','nextDamageTakenPercent'].map(k=>[k,structuredClone(enemy[k]??null)])),heroBuffs:Object.fromEntries(buffKeys.map(k=>[k,structuredClone(playerEffects[k]??0)]))};
  }
  function finishAction(){
    if(!enabled(enemy)||!state().lastAction||enemy.dungeonCampaign&&state().lastAction.heroId!==player.id)return;
    const last=state().lastAction;
    last.after={hp:enemy.hp,shieldValue:enemy.shieldValue,effects:Object.fromEntries(Object.keys(last.effects).map(k=>[k,structuredClone(enemy[k]??null)]))};
  }
  function rewind(){const last=state().lastAction;if(!last)return;const after=last.after||last;enemy.hp=Math.min(enemy.maxHp,enemy.hp+Math.max(0,last.hp-after.hp));enemy.shieldValue=Math.max(0,enemy.shieldValue+(last.shieldValue-after.shieldValue));for(const[k,v]of Object.entries(last.effects))if(JSON.stringify(v)!==JSON.stringify(after.effects?.[k]))enemy[k]=structuredClone(v);for(const k of buffKeys){const current=playerEffects[k];if(typeof current==='number')playerEffects[k]=Math.min(current,Number(last.heroBuffs[k])||0);else if(current===true&&!last.heroBuffs[k])playerEffects[k]=false;}}
  function beforeDamage(){
    if(!enabled(enemy))return false;transferBuffs();const s=state(),i=index(enemy.baseName);
    if(s.timers.dominion>0&&s.stolen.invulnerable)return true;
    if(s.timers.dominion>0&&s.stolen.autoMiss){s.stolen.autoMiss=false;return true;}
    const dodge=(i===43?.25:0)+(s.timers.dominion>0?s.stolen.dodge||0:0);
    if(dodge>0&&Math.random()<Math.min(1,dodge)){if(i===43){shield(enemy.maxHp*.15);if(typeof EnemyMotion!=='undefined')EnemyMotion.passive('ruin');}log(`${enemy.baseName} esquivou.`);return true;}return false;
  }
  function adjustDamage(damage){if(!enabled(enemy))return damage;const s=state();if(s.timers.dominion>0)damage=Math.max(0,Math.floor((damage-(s.stolen.flat||0))*(1-(s.stolen.reduction||0))));return damage;}
  function afterDamage(hpLost){
    if(!enabled(enemy))return;const s=state(),i=index(enemy.baseName);
    if(i===6){addPeriodicStack(playerEffects,'poison',9,3,'Gosma Toxica');if(typeof EnemyMotion!=='undefined')EnemyMotion.passive('toxicity');}
    if(s.timers.retaliation>0)applyBurning(playerEffects,Math.max(1,Math.floor(getCurrentCaps().maxHp*.03)),3,'Escamas Ardentes');
    if(enemy.hp<=0)beforeDeath();
    heroCheck();
  }
  function beforeDeath(){
    if(!enabled(enemy)||enemy.hp>0)return false;const s=state(),i=index(enemy.baseName);
    if(s.timers.pact>0){player.hp=0;log('Pacto Funebre matou o atacante.');}
    if(i===18&&!s.revived){s.revived=true;enemy.hp=enemy.maxHp;s.timers.rest=3;if(typeof EnemyMotion!=='undefined')EnemyMotion.sync();log('Como uma Fenix restaurou toda a vida.');return true;}
    return false;
  }
  function heroDebuffCount(){
    const s=state(),h=heroState(s);let n=0;
    for(const kind of ['burn','poison','bleed'])n+=(playerEffects[kind+'Stacks']||[]).length;
    for(const key of ['damageDownTurns','healReductionTurns'])if(playerEffects[key]>0)n++;
    if(playerEffects.skipNextTurn)n++;
    for(const key of ['haunt','deathmark','reap','glare','dominion','doom'])if(h[key]||key==='dominion'&&hasDominionOverHero(s))n++;
    return n;
  }
  function heroCheck(){if(!enabled(enemy))return;const s=state();if(heroState(s).reap&&player.hp<=getCurrentCaps().maxHp*.3)player.hp=0;if(index(enemy.baseName)===43&&heroDebuffCount()>=5)player.hp=0;}
  function trueDot(amount,label){
    let actual=Math.max(0,Math.floor(amount));
    const mods=getPassiveModifiers();
    if(actual>=player.hp&&mods.fatalSaveHealPercent>0&&!playerEffects.accessoryFatalSaveUsed){playerEffects.accessoryFatalSaveUsed=true;actual=0;healPlayer(Math.floor(getCurrentCaps().maxHp*mods.fatalSaveHealPercent));log('O acessorio evitou a morte pelo DOT.');}
    player.hp=Math.max(0,player.hp-actual);EquipmentSystem.afterIncoming(player,playerEffects,enemy,{damage:actual,periodic:true,shieldAbsorbed:0});log(`${label}: ${actual} de dano.`);
  }
  function heroEnd(){
    if(!enabled(enemy)||enemy.hp<=0)return false;const s=state(),h=heroState(s);
    for(const kind of ['poison','bleed'])if(playerEffects[kind+'Stacks']?.length)trueDot(tickPeriodicStacks(playerEffects,kind),kind==='poison'?'Veneno':'Sangramento');
    if(h.deathmark&&--h.deathmark===0){const r=applyIncomingDamage(player.hp,{ignoreFlatReduction:true,ignoreShield:true,ignorePreciousMana:true,ignorePercentReduction:true,ignoreDodge:true});log(`Marca da Morte: ${r.damage} de dano.`);}
    if(h.haunt&&--h.haunt===0){log('Assombrar forcou a fuga.');consumeLuckBattle(enemy);enemy=null;resetCombatEffects();isProcessingTurn=false;needsNewEnemy=true;updateUI();queueCampaignSave();return true;}
    if(h.doom){trueDot(getCurrentCaps().maxHp*h.doom*.01,'Fim Inadiavel');h.doom++;}
    if(h.glare>0){if(Math.random()<.15)playerEffects.skipNextTurn=true;h.glare--;}
    heroCheck();if(player.hp<=0){handleDeath('Os efeitos do inimigo derrotaram seu heroi.');return true;}return false;
  }
  function heroStart(){
    if(!enabled(enemy))return false;const s=state(),h=heroState(s);
    heroCheck();if(player.hp<=0){handleDeath('Os efeitos do inimigo derrotaram seu heroi.');return true;}return false;
  }
  function status(e){if(!enabled(e))return[];const s=state(e),out=[];if(s.charge)out.push({kind:'buff',text:s.charge.ability.name,details:`Preparando: ${s.charge.left} turno(s) ate o impacto.`});for(const[k,name]of Object.entries({rest:'Renascido: sem atacar',retaliation:'Escamas Ardentes',pact:'Pacto Funebre',double:'Ataque Duplo',dominion:'Dominio Crepuscular',regen:'Regeneracao',attack:'Dano aumentado'}))if(s.timers[k]>0)out.push({kind:'buff',text:s.timerSources?.[k]||name,details:(kit(e.baseName).find(a=>a.name===s.timerSources?.[k])?.description||name)+'\n'+s.timers[k]+' turno(s)'});if(passives[index(e.baseName)])out.push({kind:'buff',text:passives[index(e.baseName)],details:passiveDescriptions[index(e.baseName)]});return out;}
  const passiveDescriptions={6:'Ao ser atacado, aplica veneno de 9 por 3 turnos.',18:'Uma vez por combate: ao sofrer dano fatal recupera 100% da vida e nao ataca por 3 turnos.',27:'Quando perde o turno ou o heroi esquiva, causa um ataque basico adicional.',35:'Dano total +1% por turno.',37:'Remove qualquer buff que o heroi receber.',39:'A cada turno cura 4% da vida maxima e acumula escudo de 6%.',41:'Comeca com escudo de 80% da vida maxima por 14 turnos.',43:'25% de esquiva; ao esquivar gera escudo de 15%. Executa o heroi com 5 ou mais debuffs/DOTs.',44:'Reduz o dano do heroi em 2 pontos percentuais por turno.',47:'Aumenta a armadura em 22 por turno.'};
  function dungeonHeroEnd(){
    if(!enabled(enemy)||enemy.hp<=0)return false;
    transferBuffs();
    const h=heroState();
    if(h.deathmark&&--h.deathmark===0){
      const r=applyIncomingDamage(player.hp,{ignoreFlatReduction:true,ignoreShield:true,ignorePreciousMana:true,ignorePercentReduction:true,ignoreDodge:true});
      log(`Marca da Morte: ${r.damage} de dano.`);
    }
    if(h.doom){trueDot(getCurrentCaps().maxHp*h.doom*.01,'Fim Inadiavel');h.doom++;}
    if(h.glare>0){if(Math.random()<.15)playerEffects.skipNextTurn=true;h.glare--;}
    heroCheck();
    return player.hp>0&&h.haunt>0&&--h.haunt===0;
  }
  function heroStatus(){if(!enabled(enemy))return[];const s=state(),h=heroState(s),out=[];for(const[k,name]of Object.entries({haunt:'Assombrar: fuga em',deathmark:'Marca da Morte:',glare:'Clarao Absoluto:'}))if(h[k])out.push(`${name} ${h[k]} turno(s)`);if(h.reap)out.push('Ceifar Alma: execucao em 30% de vida');if(s.timers.dominion>0)out.push(`Sob Dominio | ${s.timers.dominion} turno(s)`);if(h.doom)out.push(`Fim Inadiavel: ${h.doom}% da vida maxima na proxima rodada (irremovivel)`);for(const kind of ['poison','bleed'])if(playerEffects[kind+'Stacks']?.length)out.push(`${kind==='poison'?'Veneno':'Sangramento'}: `+playerEffects[kind+'Stacks'].map(x=>`${x.damage}/turno, ${x.turns} turnos`).join('; '));return out;}
  function choose(){
    const s=state();if(s.charge)return null;
    if(s.timers.dominion>0&&s.stolen.buffs?.forcedBasicTurns>0)return null;
    const caps=getCurrentCaps(),missing=Math.max(0,enemy.maxHp-enemy.hp);
    const basic=Math.max(1,enemy.attack*damageMultiplier());
    const heroShield=playerEffects.shieldValue||0;
    const dots=['burn','poison','bleed'].reduce((sum,k)=>sum+(enemy[k+'Stacks']||[]).reduce((n,x)=>n+x.damage*Math.min(3,x.turns),0),0);
    const score=a=>{
      let damage=((a.basicAttack?enemy.attack:a.power||0)+(a.maxHpPercent||0)*caps.maxHp+(a.currentHpPercent||0)*player.hp)*damageMultiplier();
      if(a.doubleShield&&heroShield>0)damage*=2;
      if(playerEffects.invulnerableTurns>0)damage=0;
      else if(!a.ignoreShield)damage=Math.max(0,damage-heroShield);
      // Only public combat state is used; no knowledge of the next hero action.
      let value=damage+(a.poison||0)*Math.min(3,a.turns||0)+(a.burn||0)*caps.maxHp*Math.min(3,a.turns||0)+(a.bleed||damage*(a.bleedPercent||0))*Math.min(3,a.turns||0)+(a.poisonMana||0)*player.mp*Math.min(3,a.turns||0);
      if(damage>=player.hp&&player.hp>0)value+=basic*8;
      if(a.fullHeal)value+=missing*(enemy.hp/enemy.maxHp<.35?2:1);
      if(a.heal)value+=Math.min(missing,enemy.maxHp*a.heal);
      if(a.regen)value+=Math.min(missing,enemy.maxHp*a.regen*Math.min(3,a.turns||1));
      if(a.cleanse)value+=dots+(enemy.attackDownTurns>0?basic*(enemy.attackDownPercent||0)*2:0);
      if(!(enemy.noShieldTurns>0))value+=Math.max(0,enemy.maxHp*(a.shield||0)+(a.shieldFlat||0)-(enemy.shieldValue||0))*.6;
      if(a.attackBonus)value+=basic*a.attackBonus*Math.min(3,a.turns||1);
      if(a.double)value+=basic*Math.min(3,a.double);
      if(a.retaliation)value+=caps.maxHp*.03*2;
      if(a.pact)value+=basic*(enemy.hp/enemy.maxHp<.4?3:.2);
      if(a.dominion)value+=heroShield*.7+basic*(getActiveBuffs().length*.35+.5);
      if(a.damageDown&&!(playerEffects.damageDownTurns>1&&playerEffects.damageDownPercent>=a.damageDown))value+=basic*a.damageDown*2;
      if(a.healDown&&!(playerEffects.healReductionTurns>1))value+=basic*a.healDown;
      if(a.drain)value+=Math.min(player.mp*a.drain,Math.max(0,enemy.maxMp-enemy.mp)+(a.drainShield?player.mp*a.drain*a.drainShield:0))*.5;
      if(a.doom||a.deathmark||a.haunt)value+=basic*2;
      if(a.reap)value+=basic*(player.hp/caps.maxHp<.5?3:1.2);
      if(a.skip&&!(heroState(s).glare>1))value+=basic*.8;
      if(a.rewind)value+=Math.max(0,(s.lastAction?.hp||enemy.hp)-(s.lastAction?.after?.hp||enemy.hp));
      value/=1+(a.charge||0)*.65;
      return value/(1+(a.cost||0)/(Math.max(1,getBaseManaRegen(enemy.maxMp))*8));
    };
    const ranked=(enemy.bossAbilities||[]).filter(a=>enemy.mp>=a.cost&&!(a.doom&&heroState(s).doom)&&!(a.reap&&heroState(s).reap)&&!(a.haunt&&heroState(s).haunt)&&!(a.deathmark&&heroState(s).deathmark)&&!(a.unshielded&&heroShield>0)&&!(a.fullHeal&&missing<enemy.maxHp*.2)&&!(a.regen&&s.timers.regen>0)&&!(a.retaliation&&s.timers.retaliation>0)&&!(a.double&&s.timers.double>0)&&!(a.pact&&s.timers.pact>0)&&!(a.dominion&&s.timers.dominion>0)&&!(a.attackBonus&&s.timers.attack>0)).map(a=>({a,score:score(a)})).sort((a,b)=>b.score-a.score||(s.used[a.a.id]||0)-(s.used[b.a.id]||0)||a.a.cost-b.a.cost);
    // Preserve mana when a skill contributes less than a basic attack.
    return ranked[0]?.score>basic*.8?ranked[0].a:null;
  }
  function cast(a,charged=false,options={}){
    const s=state();if(!charged){enemy.mp-=a.cost;s.used[a.id]=(s.used[a.id]||0)+1;log(`${enemy.baseName} usou ${a.name}.`);}
    options.onCast?.(a,a.charge&&!charged?'charge':'release');
    if(a.charge&&!charged){s.charge={ability:a,left:a.charge};return;}
    if(charged)log(`${enemy.baseName} liberou ${a.name}.`);
    if(a.rewind)(options.rewind||rewind)();if(a.cleanse)purge();if(a.fullHeal)heal(enemy.maxHp);if(a.heal)heal(enemy.maxHp*a.heal);
    if(a.regen){s.regen=a.regen;s.timers.regen=a.turns;}if(a.attackBonus){s.attackBonus=a.attackBonus;s.timers.attack=a.turns;}
    if(a.shield||a.shieldFlat){shield(enemy.maxHp*(a.shield||0)+(a.shieldFlat||0));(enemy.effectSources||={}).shieldValue=a.name;}
    for(const k of ['retaliation','pact','double','dominion'])if(a[k])s.timers[k]=a[k];
    s.timerSources||={};for(const key of ['retaliation','pact','double','dominion'])if(a[key])s.timerSources[key]=a.name;if(a.regen)s.timerSources.regen=a.name;if(a.attackBonus)s.timerSources.attack=a.name;
    if(a.dominion){if(enemy.dungeonCampaign)s.dominionHeroId=player.id;getPassiveModifiers();transferBuffs();}
    // Debuffs from non-damaging casts still require a successful hit check.
    const hostile=a.power!==undefined||a.poison||a.poisonMana||a.burn||a.bleed||a.deathmark||a.reap||a.doom||a.damageDown||a.skip||a.drain;
    if(!hostile)return;
    if(options.area&&isDungeonArea(a))options.area(hit=>applyHostile(a,hit));
    else applyHostile(a);
  }
  function applyHostile(a,{multiple=false,primary=true}={}){
    const s=state(),h=heroState(s),damageScale=multiple?.7:1,effectScale=multiple?.6:1;
    let damage=(a.basicAttack?enemy.attack:(a.power||0))+(a.maxHpPercent?Math.floor(getCurrentCaps().maxHp*a.maxHpPercent):0)+(a.currentHpPercent?Math.floor(player.hp*a.currentHpPercent):0);
    if(a.doubleShield&&playerEffects.shieldValue>0)damage*=2;
    if(damage>0)damage+=Math.floor(getCurrentCaps().maxHp*(enemy.maxHpStrikePercent||0));
    damage=Math.floor(damage*damageMultiplier());
    if(damage>0&&s.timers.dominion>0){damage+=Math.floor(getCurrentCaps().maxHp*(s.stolen.enemyHpBonus||0));if(s.stolen.nextDamage){damage+=Math.floor(damage*s.stolen.nextDamage);s.stolen.nextDamage=0;}}if(enemy.attackDownTurns>0)damage=Math.floor(damage*(1-(enemy.attackDownPercent||0)));
    const hpBefore=player.hp;
    const result=applyIncomingDamage(Math.floor(damage*damageScale),{ignoreShield:!!a.ignoreShield,ignoreFlatReduction:!!a.ignoreFlatReduction,ignorePercentReduction:!!a.ignorePercentReduction,ignoreDodge:s.timers.dominion>0&&s.stolen.buffs?.guaranteedHitTurns>0});
    s.lastMissed=result.missed;
    if(result.missed){march();return;}
    if(a.poison)addPeriodicStack(playerEffects,'poison',Math.floor(a.poison*damageScale),a.turns,a.name);
    if(a.poisonMana)addPeriodicStack(playerEffects,'poison',Math.floor(player.mp*a.poisonMana*damageScale),a.turns,a.name);
    if(a.burn)applyBurning(playerEffects,Math.max(1,Math.floor(getCurrentCaps().maxHp*a.burn*damageScale)),a.turns,a.name);
    if(a.bleed||a.bleedPercent)addPeriodicStack(playerEffects,'bleed',a.bleed?Math.floor(a.bleed*damageScale):Math.floor(result.damage*a.bleedPercent),a.turns,a.name);
    if(a.damageDown){(playerEffects.effectSources||={}).damageDownTurns=a.name;playerEffects.damageDownPercent=Math.max(playerEffects.damageDownPercent||0,a.damageDown*effectScale);playerEffects.damageDownTurns=Math.max(playerEffects.damageDownTurns||0,a.turns);}
    if(a.healDown){(playerEffects.effectSources||={}).healReductionTurns=a.name;playerEffects.healReductionPercent=Math.max(playerEffects.healReductionPercent||0,a.healDown*effectScale);playerEffects.healReductionTurns=Math.max(playerEffects.healReductionTurns||0,a.turns);}
    if(a.haunt)h.haunt=a.haunt; // Countdown resolves after each completed hero action.
    if(a.deathmark)h.deathmark=a.deathmark;
    if(a.reap)h.reap=true;if(a.doom&&!h.doom)h.doom=1;if(a.skip&&primary)h.glare=a.turns;
    if(a.drain&&(!a.unshielded||playerEffects.shieldValue<=0)){const amount=Math.floor(player.mp*a.drain);player.mp-=amount;if(a.drainShield)shield(amount*a.drainShield);else enemy.mp=Math.min(enemy.maxMp,enemy.mp+amount);}
    const hpDamage=Math.min(hpBefore,result.damage);
    if(s.timers.dominion>0&&s.stolen.lifeSteal)heal(hpDamage*s.stolen.lifeSteal);
    if(a.leech)heal(hpDamage);if(a.grow){enemy.maxHp+=hpDamage;enemy.hp+=hpDamage;}
    heroCheck();
  }
  function damageMultiplier(){const s=state();return (enemy.natureSongReductionTurns>0?1-(enemy.natureSongReductionPercent||0):1)*(1+(index(enemy.baseName)===35?s.turn*.01:0)+(s.timers.attack>0?s.attackBonus||0:0)+(s.timers.dominion>0?s.stolen.damage||0:0));}
  function basic(unavoidable=false){const s=state();let d=enemy.attack+(s.timers.dominion>0?s.stolen.attackFlat||0:0);d+=Math.floor(getCurrentCaps().maxHp*(enemy.maxHpStrikePercent||0));d=Math.floor(d*damageMultiplier()*(1+(s.timers.dominion>0?s.stolen.attackPercent||0:0)));if(enemy.attackDownTurns>0)d=Math.floor(d*(1-(enemy.attackDownPercent||0)));if(s.timers.dominion>0){d+=Math.floor(getCurrentCaps().maxHp*(s.stolen.enemyHpBonus||0));if(s.stolen.nextDamage){d+=Math.floor(d*s.stolen.nextDamage);s.stolen.nextDamage=0;}}const hpBefore=player.hp;const r=applyIncomingDamage(d,{ignoreDodge:unavoidable||s.timers.dominion>0&&s.stolen.buffs?.guaranteedHitTurns>0});if(s.timers.dominion>0&&s.stolen.lifeSteal)heal(Math.min(hpBefore,r.damage)*s.stolen.lifeSteal);if(r.missed&&!unavoidable)march();heroCheck();}
  function march(){if(index(enemy.baseName)===27&&player.hp>0){log('Marcha de Ferro respondeu.');if(typeof EnemyMotion!=='undefined')EnemyMotion.passive('march');basic(true);}}
  function* resolveTurn(options={}){
    const s=state(),i=index(enemy.baseName),old={...s.timers};s.turn++;
    if(s.shieldTime>0&&--s.shieldTime===0)enemy.shieldValue=0;
    if(i===39){heal(enemy.maxHp*.04);shield(enemy.maxHp*.06);if(typeof ZenithMotion!=='undefined')yield ()=>ZenithMotion.passive();}if(i===47)enemy.armor+=22;
    if(i===44){s.temporal=Math.min(1,(s.temporal||0)+.02);}
    if(typeof EnemyMotion!=='undefined'){if(i===35)EnemyMotion.passive('stellar');if(i===44)EnemyMotion.passive('decay');if(i===47)EnemyMotion.passive('eras');}
    if(s.timers.regen>0)heal(enemy.maxHp*s.regen);
    if(s.timers.dominion>0&&s.stolen.regen>0)heal(enemy.maxHp*s.stolen.regen);
    if(s.timers.dominion>0&&s.stolen.manaRegen>0)enemy.mp=Math.min(enemy.maxMp,enemy.mp+Math.floor(enemy.maxMp*s.stolen.manaRegen));
    transferBuffs();
    const blocked=s.timers.rest>0||enemy.skipNextAttack||(enemy.aimLegTurns>0&&Math.random()<enemy.aimLegSkipChance)||(enemy.blizzardSkipChance>0&&Math.random()<enemy.blizzardSkipChance)||(getPassiveModifiers().enemySkipChance>0&&Math.random()<getPassiveModifiers().enemySkipChance);
    if(blocked){enemy.skipNextAttack=false;log(`${enemy.baseName} perdeu o turno.`);march();}
    else if(s.charge){if(--s.charge.left===0){const a=s.charge.ability;s.charge=null;cast(a,true,options);yield ()=>playSpriteAttackAnimation('enemy','cast',!s.lastMissed,1,null,null,{...a,visualPhase:'release'});}else{log(`${s.charge.ability.name} continua em preparacao.`);yield ()=>playSpriteAttackAnimation('enemy','cast',false,1,null,null,{...s.charge.ability,visualPhase:'charge'});}}
    else{const action=options.choose?options.choose():choose();if(action){cast(action,false,options);yield ()=>playSpriteAttackAnimation('enemy',action.power!==undefined||action.basicAttack?'cast':'buff',!!(action.power||action.basicAttack)&&!action.charge&&!s.lastMissed,1,null,null,{...action,visualPhase:action.charge?'charge':'release'});}else{const count=s.timers.double>0?2:1;for(let n=0;n<count&&player.hp>0&&enemy.hp>0;n++){basic();yield ()=>playSpriteAttackAnimation('enemy','attack',true);}}}
    for(const[k,v]of Object.entries(old))if(v>0&&s.timers[k]===v)s.timers[k]--;
    if(old.dominion>0){for(const[k,v]of Object.entries(s.stolen.buffs||{}))if(k.endsWith('Turns')&&v>0)s.stolen.buffs[k]--;refreshStolen(s);}
    for(const key of ['aimLegTurns','attackDownTurns','armorDownTurns','blizzardTurns'])if(enemy[key]>0)enemy[key]--;
    if(!(enemy.blizzardTurns>0))enemy.blizzardSkipChance=0;
    if(!enemy.dungeonCampaign&&playerEffects.shieldTurns>0&&--playerEffects.shieldTurns===0)playerEffects.shieldValue=0;
    transferBuffs();heroCheck();
  }
  async function turn(){
    if(typeof EnemyMotion!=='undefined')await EnemyMotion.sync();
    for(const animate of resolveTurn())await animate();
    if(typeof EnemyMotion!=='undefined')await EnemyMotion.sync();updateUI();await wait(320);
    if(player.hp<=0){handleDeath();return;}if(enemy.hp<=0){handleEnemyDefeat();return;}isProcessingTurn=false;updateUI();
  }
  function temporalDamage(d){return enabled(enemy)?Math.floor(d*(1-(state().temporal||0))):d;}
  return{enabled,kit,index,initialize,restoreState,transferBuffs,modifiers,snapshot,beforeDamage,adjustDamage,afterDamage,beforeDeath,heroCheck,heroStart,heroEnd,status,heroStatus,dungeonHeroEnd,turn,resolveTurn,isDungeonArea,rewind,temporalDamage,cast,choose,finishAction,passives,passiveDescriptions};
})();
