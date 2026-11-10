/* Expedition rules. Campaign persistence is never accessed. */
const DungeonRogue=(()=>{
 'use strict';
 const K=DungeonCombatKernel,copy=K.copy,regionsList=Object.keys(regions),alive=h=>h.hp>0;
 const check=(ok,text)=>{if(!ok)throw Error(text);},rand=s=>K.random(s),pick=(s,a)=>a[Math.floor(rand(s)*a.length)];
 const encounterTypes=['battle','gambler','battle','alchemist','battle','vendor','cave'];
 const totalXp=L=>{let n=0;const whole=Math.floor(L);for(let l=1;l<whole;l++)n+=100+(l-1)*25+Math.floor(l*l*1.5);return n+(L-whole)*(100+(whole-1)*25+Math.floor(whole*whole*1.5));};
 function lobby(seed,leader='local'){const s=K.lobby(seed,leader);return {...s,version:3,biomes:regionsList,act:0,node:0,place:'hall',phase:'lobby',trades:[],caveWave:0,battleNumber:0,finishedPlayers:[]};}
 function addHero(s,c){check(!s.party.some(h=>h.owner===(c.owner||s.leader)),'Cada jogador controla um único herói.');const h=K.addHero(s,c);h.coins=40;h.equipment={};h.inventory=['vida','vida','mana','mana'].map(type=>{const id='alquimia_'+type+'_instavel';return {...consumableCatalog[id],id,type:'consumable',qty:1,uid:'start'+(++s.serial)};});h.inventory=copy(h.inventory);h.place='hall';h.ready=false;h.hp=K.stats(s,h).maxHp;h.mp=K.stats(s,h).maxMp;return h;}
 function start(s,seed){check(s.party.length>0,'Adicione um aventureiro.');s.phase='hub';s.seed=String(seed||s.seed).slice(0,48);s.log.push('O grupo chegou ao saguão. Cada herói possui 40 moedas.');}
 function needed(h){return K.classChoices(h).length>0||(h.pendingAttributePoints||0)>0;}
 function gain(s,h,amount){
  const before=K.stats(s,h);h.xp+=Math.floor(amount*(1+K.withHero(s,h,null,()=>getPassiveModifiers().xpBonus||0)));
  while(h.level<120){const cost=100+(h.level-1)*25+Math.floor(h.level*h.level*1.5);if(h.xp<cost)break;h.xp-=cost;h.level++;h.pendingAttributePoints=(h.pendingAttributePoints||0)+1;}
  if(h.level>=120)h.xp=0;K.rebuild(s,h);h.inventory=h.inventory.map(i=>i.type==='equipment'?EquipmentSystem.normalizeItem(i,h):i);const after=K.stats(s,h);if(alive(h)){h.hp=Math.min(after.maxHp,h.hp+Math.max(0,after.maxHp-before.maxHp));h.mp=Math.min(after.maxMp,h.mp+Math.max(0,after.maxMp-before.maxMp));}
 }
 function finish(s,afterBattle=false){s.history.push({region:regionsList[s.act],encounter:s.node%7,wave:s.caveWave});s.roomsCleared++;s.node++;s.caveWave=0;s.finishedPlayers=[];s.shop=[];if(s.node>=84){end(s,'victory');return;}s.act=Math.floor(s.node/7);s.phase='hub';s.afterBattle=afterBattle;s.enemies=[];s.order=[];s.cursor=0;for(const h of s.party){h.place=afterBattle?'hunt':'hall';h.ready=false;}s.trades=[];}
 function retreat(s,reason){s.phase='hub';s.afterBattle=false;s.enemies=[];s.order=[];s.cursor=0;for(const h of s.party){h.place='hall';h.ready=false;delete h.fled;h.effects=createDefaultPlayerEffects();}K.note(s,reason);}
 function end(s,outcome){s.phase='ended';s.outcome=outcome;K.note(s,outcome==='victory'?'O Soberano do Paradoxo foi vencido. A jornada terminou.':'O grupo encerrou a jornada.');}
 function useCampaignEnemy(e,partySize){
  if(e.dungeonCampaign)return;
  e.dungeonCampaign=true;
  e.bossAbilities=CampaignEnemyCombat.kit(e.baseName);
  const exact=campaignEnemyTotalsByName[e.baseName];
  if(exact){
   const maxHp=Math.floor(exact.hp*(e.isBoss?1+.65*(partySize-1):1));
   const fraction=e.hp/e.maxHp;
   e.hp=e.hp>0?Math.max(1,Math.min(maxHp,Math.round(maxHp*fraction))):0;
   Object.assign(e,{maxHp,attack:exact.attack,armor:exact.armor,maxMp:exact.mp,mp:Math.min(e.mp,exact.mp),maxHpStrikePercent:exact.impact});
   e.baseArmor=exact.armor;
  }else e.baseArmor=e.armor;
  // Generic charges and line buffs from older checkpoints have no campaign equivalent.
  delete e.charge;delete e.buffTurns;delete e.buffSource;
  CampaignEnemyCombat.initialize(e);
 }
 function upgradeCheckpoint(s){
  if(s.phase==='battle')s.enemies.forEach(e=>useCampaignEnemy(e,s.party.length));
  if(s.phase==='alchemist'&&s.shop.length===4){
   const life=s.shop.findIndex(o=>o.item.typeId==='vida');
   const type=life<0?'vida':alchemyTypes.find(t=>!s.shop.some(o=>o.item.typeId===t.id)).id;
   const offer=potionOffer(s,type,'offer4');
   if(life<0)s.shop.unshift(offer);
   else{s.shop.unshift(...s.shop.splice(life,1));s.shop.push(offer);}
  }
  return s;
 }
 function makeEnemy(s,template,boss){
  const region=regionsList[s.act],e=K.withHero(s,s.party[0],null,()=>createEnemyFromTemplate(template,boss,region));
  e.id='e'+(++s.serial);e.instanceId=e.id;e.region=region;e.provocations=[];e.initiative=8+s.act;
  e.mp=campaignEnemyTotalsByName[template.name]?.mp??e.mp;
  useCampaignEnemy(e,s.party.length);
  return e;
 }
 function spawn(s){
  const stage=s.node%7,r=regions[regionsList[s.act]],boss=stage===6&&s.caveWave===3;
  let candidates=stage===0?r.enemies.slice(0,2):stage===4?r.enemies.slice(1):r.enemies;
  const weighted=()=>{const total=candidates.reduce((n,e)=>n+(e.weight||1),0);let x=rand(s)*total;for(const e of candidates){x-=e.weight||1;if(x<0)return e;}return candidates[0];};
  s.enemies=Array.from({length:s.party.length},(_,i)=>makeEnemy(s,boss&&i===0?r.boss:weighted(),boss&&i===0));
  s.room={type:boss?'boss':'battle'};for(const h of s.party){K.withHero(s,h,null,()=>resetCombatEffects());h.ready=false;}
  s.phase='battle';s.afterBattle=false;s.battleRegion=regionsList[s.act];s.round=1;K.turnOrder(s);K.note(s,(stage===6?'Caverna · '+(s.caveWave+1)+'/4: ':'Caçada: ')+s.enemies.map(e=>e.name).join(', '));
 }
 function quality(s){const level=s.party.reduce((n,h)=>n+h.level,0)/s.party.length;return alchemyQualities[Math.min(7,Math.floor((level-1)/15))];}
 function potionOffer(s,typeId,offerId){
  const q=quality(s),id='alquimia_'+typeId+'_'+q.id;
  return {id:offerId,item:{...consumableCatalog[id],id,type:'consumable',qty:1,uid:'p'+(++s.serial)},price:Math.ceil(20+20*Math.pow(alchemyQualities.indexOf(q)+1,1.7))};
 }
 function stock(s,type){
  const h=s.party[0],types=alchemyTypes.filter(t=>t.id!=='vida');s.shop=Array.from({length:type==='alchemist'?5:4},(_,i)=>{
   if(type==='alchemist')return potionOffer(s,i===0?'vida':types.splice(Math.floor(rand(s)*types.length),1)[0].id,'offer'+i);
   const artifact=rand(s)<.005,region=pick(s,artifact?regionsList.filter(r=>r!=='Paradoxo'):regionsList),slot=artifact?'accessory':pick(s,EquipmentData.slots),cls=pick(s,s.party).class;
   const item=EquipmentSystem.createItem(region,slot,cls,artifact?'rara':'comum',h);item.uid='loot'+(++s.serial);return {id:'offer'+i,item,artifact,price:K.withHero(s,h,null,()=>Math.max(20,getSellPrice(item)*3))};
  });
 }
 function hunt(s){check(s.phase==='hub','Volte ao saguão.');check(s.party.every(h=>h.place==='hall'&&h.ready&&!needed(h)),'Todos precisam estar no saguão, prontos e com as especializações escolhidas.');check(!s.trades.some(t=>t.status==='pending'),'Resolva as trocas pendentes antes da caçada.');const type=encounterTypes[s.node%7];s.finishedPlayers=[];s.phase=type;if(type==='battle'||type==='cave')spawn(s);else if(type==='alchemist'||type==='vendor')stock(s,type);}
 function finishBattle(s){
  const stage=s.node%7,index=stage===0?0:stage===2?1:stage===4?2:3+s.caveWave,baseLevel=s.act*10,targetLevel=Math.min(120,baseLevel+[1.5,3,5,6.5,8,10,10.8][index]);
  const prevTarget=index===0?(s.act===0?1:baseLevel+.8):baseLevel+[1.5,3,5,6.5,8,10,10.8][index-1],xp=Math.max(1,Math.ceil(totalXp(targetLevel)-totalXp(prevTarget)));
  for(const h of s.party){const wasDown=!alive(h);gain(s,h,xp);const caps=K.stats(s,h);delete h.fled;if(wasDown){h.hp=Math.max(1,Math.floor(caps.maxHp*.2));h.effects=createDefaultPlayerEffects();}
   const bonus=K.withHero(s,h,null,()=>getPassiveModifiers().coinBonus||0),coins=Math.floor(2*s.enemies.reduce((n,e)=>n+(e.isBoss?18:5)+e.level*3,0)/s.party.length*(1+bonus));h.coins+=coins;
   if(rand(s)<.45*(h.luckBattles>0?1.4:1)){const item=EquipmentSystem.createItem(regionsList[s.act],pick(s,EquipmentData.slots),h.class,'comum',h);item.uid='loot'+(++s.serial);h.inventory.push(item);K.note(s,`${h.characterName} recebeu ${item.name}.`);}
   K.note(s,`${h.characterName}: +${xp} XP e ${coins} moedas.${wasDown?' Retornou com 20% da vida.':''}`);if(h.luckBattles>0)h.luckBattles--;
  }
  s.battleNumber++;if(s.node%7===6){if(s.caveWave===3){s.bosses++;for(const h of s.party)h.stats.regionBossKills[regionsList[s.act]]=1;finish(s,true);}else{s.caveWave++;s.phase='cave_pause';s.enemies=[];}}else finish(s,true);
 }
 function provokePriority(h,k){const a=h.subclassChoices||{};return k.type==='warrior_warcry'&&a.tier60==='paladino'?7:k.type==='warrior_warcry'&&a.tier30==='cavaleiro'&&!a.tier60?6:k.type==='nature_true_form'&&a.tier60==='avatar_da_natureza'?5:k.type==='nature_breeze_charm'&&a.tier60==='protetor_da_floresta'?4:k.type==='archer_trap'&&a.tier60==='guarda_florestal'?3:k.type==='warrior_warcry'&&a.tier60==='berserker'?2:k.type==='mage_freeze'&&a.tier60==='mago_frigido'?1:0;}
 function provoke(s,h,k){const priority=provokePriority(h,k);
  if(!priority)return;for(const e of s.enemies.filter(alive)){e.provocations=(e.provocations||[]).filter(x=>x.heroId!==h.id);e.provocations.push({heroId:h.id,priority,left:3,serial:++s.serial});}K.note(s,`${h.characterName} provocou por três ações de cada inimigo.`);
 }
 function activeHub(s,h,place){check(s.phase==='hub'&&h.place===place,'Visite '+place+' para esta ação.');}
 function owned(s,h,uid){const item=h.inventory.find(x=>x.uid===uid);check(item,'Item não está na mochila.');return item;}
 function upgradePrice(s,h,item){return K.withHero(s,h,null,()=>10*(EquipmentSystem.getUpgradeRequirements(item,h)?.cost||0));}
 function buy(s,h,id){check(['vendor','alchemist'].includes(s.phase),'Não há vendedor neste encontro.');const offer=s.shop.find(x=>x.id===id&&!x.sold);check(offer&&h.coins>=offer.price,'Oferta indisponível ou moedas insuficientes.');h.coins-=offer.price;offer.sold=h.id;h.inventory.push({...copy(offer.item.type==='equipment'?EquipmentSystem.normalizeItem(offer.item,h):offer.item),uid:'bag'+(++s.serial)});}
 function potion(s,h,intent){
  const item=owned(s,h,intent.uid);check(!s.trades.some(t=>t.status==='pending'&&t.uid===item.uid),'Poção reservada para troca.');const cfg=consumableCatalog[item.id],ally=s.party.find(x=>x.id===intent.targetId&&alive(x)&&!x.fled);check(cfg&&ally,'Escolha uma poção e um aliado vivo.');check(!['luck'].includes(cfg.effectType)||s.phase==='battle','Use Sorte durante uma batalha.');
  if(s.phase==='battle'){check(K.current(s)?.id===h.id,'Aguarde seu turno.');check(!(h.effects.forcedBasicTurns>0),'Esta postura permite apenas ataques básicos.');check(!h.effects.skipNextTurn||h.effects.controlImmuneTurns>0,'Interrompido: passe o turno ou use uma habilidade que rompe controle.');}
  const apply=()=>{ally.effects.effectSources||={};if(cfg.effectType==='buff_attack')ally.effects.effectSources.attackBuffTurns=item.name;if(cfg.effectType==='buff_skill')ally.effects.effectSources.skillBuffTurns=item.name;if(cfg.effectType==='restore_hp'||cfg.effectType==='restore_both')healPlayer(cfg.value);if(cfg.effectType==='restore_mana'||cfg.effectType==='restore_both')ally.mp=Math.min(K.stats(s,ally).maxMp,ally.mp+(cfg.manaValue||cfg.value));if(cfg.effectType==='buff_attack'){ally.effects.attackBuffTurns=cfg.turns;ally.effects.attackBuffAmount=cfg.value;ally.effects.freshBuffs=['attackBuffTurns'];}else if(cfg.effectType==='buff_skill'){ally.effects.skillBuffTurns=cfg.turns;ally.effects.skillBuffAmount=cfg.value;ally.effects.freshBuffs=['skillBuffTurns'];}else if(cfg.effectType==='luck')ally.luckBattles=cfg.battles;else if(cfg.turnField)applyAlchemyPotionBuff(cfg);};
  if(s.phase==='battle')K.consumePotion(s,h,()=>{K.withHero(s,ally,null,apply);h.inventory=h.inventory.filter(x=>x.uid!==item.uid);});else{check(['hub','cave_pause'].includes(s.phase),'Use poções entre combates.');check(['restore_hp','restore_mana','restore_both'].includes(cfg.effectType),'Use esta poção durante o combate.');K.withHero(s,ally,null,apply);h.inventory=h.inventory.filter(x=>x.uid!==item.uid);}
 }
 function transition(snapshot,owner,intent){
  check(intent&&typeof intent==='object','Pedido inválido.');if(intent.revision!==undefined)check(intent.revision===snapshot.revision,'A partida mudou. Tente novamente.');const s=upgradeCheckpoint(copy(snapshot)),h=s.party.find(x=>x.id===intent.heroId),leader=owner===s.leader,controls=h&&(h.owner===owner||leader&&h.offline);
  const own=()=>check(controls,'Você não controla este aventureiro.');
  if(intent.kind==='addHero'){check(leader&&s.phase==='lobby','Só o anfitrião organiza o grupo.');addHero(s,{...intent,owner});}
  else if(intent.kind==='start'){check(leader&&s.phase==='lobby','Só o anfitrião inicia.');start(s,intent.seed);}
  else if(intent.kind==='hunt'){check(leader,'O anfitrião inicia a caçada.');hunt(s);}
  else if(intent.kind==='nextHunt'){check(leader&&s.phase==='hub'&&s.afterBattle&&s.party.every(h=>h.place==='hunt'&&!needed(h)),'Reúna o grupo e escolha as especializações antes de seguir.');s.party.forEach(h=>{h.place='hall';h.ready=true;});hunt(s);}
  else if(intent.kind==='enemy'){check(leader,'Somente o anfitrião resolve inimigos.');K.enemyAction(s);}
  else if(intent.kind==='caveNext'){check(leader&&s.phase==='cave_pause'&&s.party.every(x=>!needed(x)),'Escolha as especializações antes de seguir.');spawn(s);}
  else if(intent.kind==='abandon'){check(leader,'Só o anfitrião encerra.');end(s,'abandoned');}
  else{own();
   if(intent.kind==='allocate'){check(['hub','cave_pause'].includes(s.phase),'Distribua entre combates.');const values=['strength','vitality','wisdom'].map(k=>Number(intent.points?.[k]||0)),total=values.reduce((a,b)=>a+b,0);check(values.every(v=>Number.isSafeInteger(v)&&v>=0)&&total>0&&total<=(h.pendingAttributePoints||0),'Distribuição inválida.');const before=K.stats(s,h);['strength','vitality','wisdom'].forEach((k,i)=>h.attributes[k]+=values[i]);h.pendingAttributePoints-=total;K.rebuild(s,h);const caps=K.stats(s,h);if(alive(h)){h.hp+=Math.max(0,caps.maxHp-before.maxHp);h.mp+=Math.max(0,caps.maxMp-before.maxMp);}}
   else if(intent.kind==='visit'){check(s.phase==='hub'&&['hall','forge','camp'].includes(intent.place),'Local inválido.');check(h.place!=='hunt'||intent.place==='hall','Volte ao saguão antes de visitar os serviços.');h.place=intent.place;h.ready=false;}
   else if(intent.kind==='ready'){activeHub(s,h,'hall');check(!needed(h),'Escolha a especialização.');h.ready=!h.ready;}
   else if(intent.kind==='subclass'){check(['hub','cave_pause'].includes(s.phase),'Escolha a especialização entre combates.');K.chooseSubclass(s,h,intent.choiceId);}
   else if(intent.kind==='rest'){activeHub(s,h,'camp');const c=K.stats(s,h),price=Math.max(0,Math.ceil((c.maxHp-h.hp)/7)+Math.ceil((c.maxMp-h.mp)/7));check(price>0,'Vida e mana já estão cheias.');check(h.coins>=price,'Moedas insuficientes.');h.coins-=price;h.hp=c.maxHp;h.mp=c.maxMp;}
   else if(intent.kind==='equip'){activeHub(s,h,'camp');const item=owned(s,h,intent.uid);check(!s.trades.some(t=>t.status==='pending'&&t.uid===item.uid),'Item reservado para troca.');check(item.type==='equipment'&&(!item.classRestriction||item.classRestriction===h.class),'Equipamento incompatível.');h.inventory=h.inventory.filter(x=>x.uid!==item.uid);if(h.equipment[item.slot])h.inventory.push(h.equipment[item.slot]);h.equipment[item.slot]=item;const c=K.stats(s,h);h.hp=Math.min(h.hp,c.maxHp);h.mp=Math.min(h.mp,c.maxMp);}
   else if(intent.kind==='unequip'){activeHub(s,h,'camp');check(h.equipment[intent.slot],'Slot vazio.');h.inventory.push(h.equipment[intent.slot]);h.equipment[intent.slot]=null;const c=K.stats(s,h);h.hp=Math.min(h.hp,c.maxHp);h.mp=Math.min(h.mp,c.maxMp);}
   else if(intent.kind==='sell'){activeHub(s,h,'forge');const item=owned(s,h,intent.uid);check(!s.trades.some(t=>t.status==='pending'&&t.uid===item.uid),'Item reservado para troca.');h.coins+=K.withHero(s,h,null,()=>getSellPrice(item));h.inventory=h.inventory.filter(x=>x.uid!==item.uid);}
   else if(intent.kind==='upgrade'){activeHub(s,h,'forge');const equipped=Object.entries(h.equipment).find(([,x])=>x?.uid===intent.uid),item=equipped?.[1]||owned(s,h,intent.uid);check(item.type==='equipment','Escolha um equipamento.');const next=K.withHero(s,h,null,()=>EquipmentSystem.upgradeItem(item));check(next&&next.rarity!==item.rarity,'Raridade máxima.');const price=K.withHero(s,h,null,()=>upgradePrice(s,h,item));check(h.coins>=price,'Moedas insuficientes.');check(!s.trades.some(t=>t.status==='pending'&&t.uid===item.uid),'Item reservado para troca.');h.coins-=price;if(equipped)h.equipment[equipped[0]]=next;else h.inventory[h.inventory.indexOf(item)]=next;}
   else if(intent.kind==='offerTrade'){check(h.owner===owner,'Somente o próprio jogador pode oferecer uma troca.');activeHub(s,h,'camp');const target=s.party.find(x=>x.id===intent.targetId&&x.id!==h.id&&x.place==='camp');check(target,'O destinatário precisa estar no acampamento.');const coins=Number(intent.coins)||0;check(Number.isSafeInteger(coins)&&coins>=0&&coins<=h.coins,'Valor inválido.');if(intent.uid)owned(s,h,intent.uid);check(coins>0||intent.uid,'Ofereça um item ou moedas.');check(!s.trades.some(t=>t.status==='pending'&&t.from===h.id),'Resolva sua oferta anterior.');s.trades.push({id:'trade'+(++s.serial),from:h.id,to:target.id,uid:intent.uid||'',coins,status:'pending'});h.coins-=coins;}
   else if(['acceptTrade','rejectTrade','cancelTrade'].includes(intent.kind)){const t=s.trades.find(x=>x.id===intent.tradeId&&x.status==='pending');check(t&&(intent.kind==='cancelTrade'?t.from===h.id:t.to===h.id),'Oferta inválida.');const from=s.party.find(x=>x.id===t.from);if(intent.kind==='acceptTrade'){check(h.owner===owner,'Somente o destinatário pode aceitar a troca.');activeHub(s,h,'camp');check(from.place==='camp','O remetente deve estar no acampamento.');if(t.uid){const item=owned(s,from,t.uid);from.inventory=from.inventory.filter(x=>x.uid!==item.uid);h.inventory.push(item);}h.coins+=t.coins;t.status='accepted';}else{from.coins+=t.coins;t.status='cancelled';}}
   else if(intent.kind==='bet'){check(s.phase==='gambler'&&!s.finishedPlayers.includes(h.id),'Aposta já resolvida.');const value=Number(intent.amount);check(Number.isSafeInteger(value)&&value>=0&&value<=h.coins,'Aposta inválida.');const win=rand(s)<.5;h.coins+=win?value:-value;s.finishedPlayers.push(h.id);K.note(s,`${h.characterName}: ${value===0?'não apostou':win?'ganhou '+value:'perdeu '+value} moedas.`);if(s.finishedPlayers.length===s.party.length)finish(s);}
   else if(intent.kind==='buy')buy(s,h,intent.offerId);
   else if(intent.kind==='leaveEncounter'){check(['alchemist','vendor'].includes(s.phase),'Encontro inválido.');if(!s.finishedPlayers.includes(h.id))s.finishedPlayers.push(h.id);if(s.finishedPlayers.length===s.party.length)finish(s);}
   else if(intent.kind==='potion')potion(s,h,intent);
   else if(intent.kind==='configureHero'){check(s.phase==='lobby','A jornada já começou.');const replacement=K.hero(s,intent.className,intent.name,h.owner);replacement.coins=40;replacement.equipment={};replacement.inventory=['vida','vida','mana','mana'].map(type=>{const id='alquimia_'+type+'_instavel';return {...consumableCatalog[id],id,type:'consumable',qty:1,uid:'start'+(++s.serial)};});replacement.inventory=copy(replacement.inventory);replacement.place='hall';replacement.ready=false;replacement.hp=K.stats(s,replacement).maxHp;replacement.mp=K.stats(s,replacement).maxMp;replacement.id=h.id;replacement.characterId=h.characterId;s.party[s.party.indexOf(h)]=replacement;}
   else K.act(s,h,intent);
  }
  s.revision++;return copy(s);
 }
 function validState(s){return !!s&&s.version===3&&['lobby','hub','battle','cave_pause','gambler','alchemist','vendor','ended'].includes(s.phase)&&Array.isArray(s.party)&&s.party.length<=3&&s.party.every(h=>h&&Object.hasOwn(classes,h.class)&&typeof h.id==='string'&&typeof h.owner==='string'&&Number.isFinite(h.hp)&&h.hp>=0&&Number.isFinite(h.mp)&&h.mp>=0&&Number.isInteger(h.level)&&h.level>=1&&h.level<=120&&Number.isSafeInteger(h.coins)&&h.coins>=0&&Array.isArray(h.inventory))&&Number.isInteger(s.node)&&s.node>=0&&s.node<=84&&Number.isInteger(s.act)&&s.act>=0&&s.act<12&&Array.isArray(s.enemies)&&s.enemies.length<=3&&Number.isInteger(s.revision)&&NetworkValidation.safeTree(s);}
 window.DungeonJourneyRules={finishBattle,end,retreat,provoke,priority:provokePriority};
 return Object.freeze({...K,lobby,addHero,start,transition,validState,upgradePrice,encounterTypes,totalXp,quality,upgradeCheckpoint});
})();
