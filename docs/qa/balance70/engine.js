(function(){
  const copy=x=>JSON.parse(JSON.stringify(x));
  const nativeSkills=getSkillInfo;
  let banned=null;
  getSkillInfo=()=>nativeSkills().filter(s=>s.id!==banned);
  const encounters=Object.entries(regions).flatMap(([region,d])=>[...d.enemies.map(t=>({id:slugify(t.name),name:t.name,level:t.level,region,boss:false,template:t})),{id:slugify(d.boss.name),name:d.boss.name,level:d.boss.level,region,boss:true,template:d.boss}]);
  const policies=['basico','dano_direto','combo','sustentacao'];
  function formAt(final,level){return level>=60?final:ClassLab.forms.find(f=>f.className===final.className&&(level>=30?f.id===final.tier30:f.tier===0));}
  function setup(cfg){
    banned=cfg.ban||null;
    const final=ClassLab.forms.find(f=>f.id===cfg.id),form=formAt(final,cfg.level),e=encounters.find(e=>e.id===cfg.enemy);
    ClassLab.make(form,cfg.level,cfg.build,'boss:'+e.region,cfg.seed);
    if(cfg.gear)player.equipment=copy(cfg.gear);
    else if(cfg.set)for(const slot of EquipmentData.slots)player.equipment[slot]={...EquipmentSystem.createItem(cfg.set.region,slot,form.className,cfg.set.rarity),uid:slot};
    enemy=createEnemyFromTemplate(e.template,e.boss,e.region);resetCombatEffects();
    player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;
    return{form,e};
  }
  async function fight(cfg){
    const {form,e}=setup(cfg),cap=getCurrentCaps(),initial=enemy.maxHp,cursor={index:0},actions={};let turns=0,illegal=0;const trace=[];
    for(;turns<100&&player.hp>0&&enemy.hp>0&&!isDead;turns++){
      let i=cfg.policy==='pragmatica'?pragmatic(turns):ClassLab.choose(form,cfg.policy,turns,cursor);
      if(turns===0&&cfg.open){const opening=getSkillInfo().findIndex(s=>s.id===cfg.open);if(opening>=0&&getSkillActionState(getSkillInfo()[opening]).canUse)i=opening;}
      if(i>=0&&!getSkillActionState(getSkillInfo()[i]).canUse){i=player.class==='Mago'&&player.mp<Math.floor(3+.1*player.level)*3?-2:-1;illegal++;}
      const label=i>=0?getSkillInfo()[i].id:i===-2?'pass':'basic';actions[label]=(actions[label]||0)+1;
      const before=cfg.trace?{hp:player.hp,mp:player.mp,enemyHp:enemy.hp}:null;
      if(i===-2)await passTurn();else if(i<0)await attack();else await useSkill(i);
      if(cfg.trace)trace.push({turn:turns+1,action:label,before,after:{hp:player.hp,mp:player.mp,enemyHp:enemy.hp}});
      if(![player.hp,player.mp,enemy.hp,...Object.values(playerEffects).filter(x=>typeof x==='number')].every(Number.isFinite))throw Error('Nonfinite '+JSON.stringify(cfg));
      isProcessingTurn=false;
    }
    const result={win:enemy.hp<=0&&player.hp>0,timeout:enemy.hp>0&&player.hp>0,mutual:enemy.hp<=0&&player.hp<=0,turns,hp:player.hp/cap.maxHp,mp:player.mp/cap.maxMp,damage:Math.max(0,Math.min(1,(initial-enemy.hp)/initial)),actions,illegal};
    if(cfg.trace)Object.assign(result,{trace,stats:{...cap,attack:getActiveAttack(),power:getSkillPowerBonus(),regen:getManaRegen()},enemy:copy(e)});
    banned=null;return result;
  }
  async function group(cfg,seeds){
    const out={...cfg,n:seeds.length,wins:0,timeouts:0,mutual:0,turns:0,hp:0,damage:0,illegal:0,actions:{}};let winTurns=0;
    for(const seed of seeds){const r=await fight({...cfg,seed});out.wins+=+r.win;out.timeouts+=+r.timeout;out.mutual+=+r.mutual;out.turns+=r.turns;out.hp+=r.hp;out.damage+=r.damage;out.illegal+=r.illegal;if(r.win)winTurns+=r.turns;for(const[k,v]of Object.entries(r.actions))out.actions[k]=(out.actions[k]||0)+v;}
    for(const k of ['turns','hp','damage'])out[k]/=seeds.length;out.winTurns=out.wins?winTurns/out.wins:null;return out;
  }
  function pragmatic(turn){
    // Cheap state-based campaign policy. These are action-selection estimates,
    // never substituted for damage, healing, costs or AI in the game engine.
    const caps=getCurrentCaps(),attackPower=getActiveAttack(),power=getSkillPowerBonus(),armor=Math.max(0,enemy.armor*(1-(enemy.armorDownPercent||0))),flat=getUniversalDamageFlatBonus();
    const missiles=Math.floor(3+.1*player.level),hit=player.class==='Arqueiro'?getHitChance('basic'):1;
    let basic=player.class==='Mago'?missiles*Math.max(0,5+attackPower*.35+Math.floor(flat/missiles)-armor):Math.max(0,attackPower+2.5-armor)*hit;
    if(player.class==='Adepto da Natureza'&&playerEffects.natureTrueFormTurns>0)basic*=1.7;
    let choice=player.class==='Mago'&&player.mp<missiles*3?-2:-1,score=choice===-2?0:basic;
    if(playerEffects.forcedBasicTurns>0)return choice;
    const skills=getSkillInfo();
    for(let i=0;i<skills.length;i++){
      const s=skills[i];if(!getSkillActionState(s).canUse)continue;
      let value=Math.max(0,(s.damage||0)-(s.ignoreArmor?0:armor));
      if(s.type==='warrior_swift_strikes'||s.type==='archer_barrage')value=(s.hits||2)*Math.max(0,attackPower+2.5-armor)*(s.type==='archer_barrage'?hit:1);
      if(s.type==='nature_living_seed')value+=(enemy.natureMarkTurns>0?0:(s.markDamage||0)*2+basic*.2);
      if(s.type==='nature_swamp_flower'&&enemy.rootedTurns>0&&enemy.naturePoisonTurns<=0)value+=(s.poisonDamage||0)*2;
      if(s.type==='nature_decay'&&enemy.natureDecayTurns<=0)value+=(s.decayDamage||0)*2;
      if(s.type==='nature_harvest')value+=(enemy.natureMarkDamage||0)*(enemy.natureMarkTurns||0)+(enemy.naturePoisonDamage||0)*(enemy.naturePoisonTurns||0)+(enemy.natureDecayDamage||0)*(enemy.natureDecayTurns||0);
      if(s.type==='mage_fireball'&&s.appliesBurn&&enemy.dotTurns<=0)value+=(s.burnDamage||0)*2;
      if(s.type==='archer_execute'&&enemy.hp/enemy.maxHp<.4)value*=3;
      const threat=enemy.attack+caps.maxHp*(enemy.maxHpStrikePercent||0),missing=caps.maxHp-player.hp;
      if(s.heal&&missing>threat*.8)value+=Math.min(missing,s.heal)*.85;
      if(s.shield&&playerEffects.shieldValue<threat*.5&&player.hp<caps.maxHp*.75)value+=Math.min(threat*1.5,s.shield)*.65;
      if(['archer_tranquilizer','warrior_shove'].includes(s.type)&&enemy.attackDownTurns<=0)value+=threat*.35;
      if(s.type==='mage_fireball'&&s.appliesChill&&enemy.attackDownTurns<=0)value+=threat*.35;
      if(s.type==='warrior_smoke_bomb'&&!playerEffects.nextIncomingAutoMiss)value=threat*.5+basic*.3;
      if(s.type==='archer_camouflage'&&playerEffects.enemyMissBonusTurns<=0)value=threat*.45+basic*.2;
      if(s.type==='warrior_warcry'&&!s.hpCostPercent&&playerEffects.attackBuffTurns<=0&&enemy.hp>basic*3)value=basic*1.3;
      if(s.type==='nature_true_form'&&playerEffects.natureTrueFormTurns<=0&&enemy.hp>basic*4)value=basic*1.8+threat*.3;
      // Setup that pays huge HP costs is left to the dedicated combo experiments.
      if(s.hpCostPercent)value-=caps.maxHp*s.hpCostPercent;
      if((s.damage||0)>0&&value>=enemy.hp)value+=enemy.maxHp*.5;
      value-=Math.max(0,useSkillCost(s)-getManaRegen())*.08;
      if(value>score+1){choice=i;score=value;}
    }
    return choice;
  }
  function catalog(){
    return ClassLab.forms.map(f=>{const level=f.tier===2?70:f.tier===1?50:20;ClassLab.make(f,level,'equilibrada','dummy',1);return{...f,level,active:copy(nativeSkills()),passive:getUnlockedPassiveSkills().map(p=>({...p,description:getPassiveStatusDescription(p)})),stats:getPreviewStats(),regen:getManaRegen()};});
  }
  window.Balance70={encounters,policies,formAt,setup,fight,group,catalog,pragmatic};
})();
