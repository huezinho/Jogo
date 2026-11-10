/* Dungeon journey UI, using the campaign artwork and command belt. */
(()=>{
'use strict';
const E=DungeonRogue,R=DungeonRules,root=document.getElementById('rogueApp'),tip=document.getElementById('rogueTooltip');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pct=x=>(x*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
let state=E.lobby(Date.now().toString(36)),selectedClass='Guerreiro',heroName='',selected=null,inspected='',modal='',enemyTimer=null,seq=0,activeHero='',itemMenu=false,statusMessage='',visualBusy=false;
 let profileId='',allocationHero='',attributeDraft={};
 let resumeSetup=null,resumeCheckpoint=null,lobbyDraft=null,joinCode='';
 const token=DungeonStore.read('token','')||crypto.randomUUID();DungeonStore.write('token',token);
 const net=DungeonNetwork.create({
  state:()=>state,
  status(t){statusMessage=t;render();},
  hostReady(id){
   const s=E.copy(state);
   s.party.forEach(h=>{if(h.owner===s.leader)h.owner=id;});
   s.leader=id;
   commit(s);
  },
  join(c){
   const s=E.copy(state);
   if(c.peerId!==c.oldId&&s.party.some(h=>h.owner===c.peerId))return false;
   const previous=s.party.find(h=>h.owner===c.oldId);
   const hero=previous||(s.resuming?s.party.find(h=>h.id===c.heroId&&h.offline):null);
   if(hero){hero.owner=c.peerId;hero.offline=false;}
   else{
    if(s.resuming||s.phase!=='lobby'||s.party.length===3)return false;
    E.addHero(s,{className:c.className,name:c.name,owner:c.peerId});
   }
   s.revision++;
   commit(s);
   return true;
  },
  snapshot(s){
   if(!E.validState(s))return;
   const before=state;
   state=s;selected=null;itemMenu=false;
   persist();present(before,s);
  },
  disconnect(id){
   const s=E.copy(state);
   s.party.forEach(h=>{if(h.owner===id)h.offline=true;});
   s.revision++;commit(s);
  },
  intent(owner,intent){
   if(state.resuming)throw Error('Aguarde a retomada pelo anfitrião.');
   commit(E.transition(state,owner,intent));
  }
 });
const localId=()=>net.info.mode==='solo'?'local':net.info.id,isLeader=()=>net.info.mode!=='guest'&&state.leader===localId(),controls=h=>h&&(h.owner===localId()||isLeader()&&h.offline);
function message(t){const node=document.getElementById('rogueToast');node.textContent=t;node.hidden=false;setTimeout(()=>node.hidden=true,3500);}
function persist(){if(state.phase!=='lobby')DungeonStore.write('run',state);}
 function savedRun(){
  const s=DungeonStore.read('run',null);
  return E.validState(s)&&!['lobby','ended'].includes(s.phase)&&s.party.length?s:null;
 }
 const isOnlineSave=s=>s.leader!=='local'||s.party.some(h=>h.owner!=='local');
 function prepareResume(){
  if(state.phase!=='lobby'||net.info.mode!=='solo')return;
  const saved=savedRun();
  if(!saved)throw Error('Jornada salva indisponível.');
  if(isOnlineSave(saved)){
   resumeSetup={saved,count:0,heroId:''};
   render();
  }else commit(E.upgradeCheckpoint(saved));
 }
 async function openResumeRoom(){
  if(!resumeSetup||net.info.mode!=='solo')return;
  const {saved,count,heroId}=resumeSetup;
  if(count!==saved.party.length||!saved.party.some(h=>h.id===heroId))throw Error('Confirme o total de jogadores e escolha seu aventureiro.');
  resumeCheckpoint=saved;
  resumeSetup=null;
  lobbyDraft=state;
  const lobby=E.lobby(saved.seed);
  lobby.resuming=true;
  lobby.revision=saved.revision;
  lobby.party=saved.party.map(h=>({...h,owner:h.id===heroId?'local':'',offline:h.id!==heroId}));
  state=lobby;
  await net.host();
 }
 const canResume=()=>!!resumeCheckpoint&&isLeader()&&net.info.connected&&state.party.every(h=>!h.offline);
 function resumeOnline(){
  if(!canResume())throw Error('Aguarde todos os jogadores entrarem e escolherem seus aventureiros.');
  const s=E.upgradeCheckpoint(E.copy(resumeCheckpoint));
  s.leader=state.leader;
  s.revision=state.revision+1;
  for(const hero of s.party){
   hero.owner=state.party.find(h=>h.id===hero.id).owner;
   hero.offline=false;
  }
  resumeCheckpoint=null;lobbyDraft=null;statusMessage='';
  commit(s);
 }
 function cancelRoom(){
  net.close();
  resumeCheckpoint=null;resumeSetup=null;statusMessage='';
  state=lobbyDraft||E.lobby(Date.now().toString(36));
  lobbyDraft=null;
  render();
 }
function commit(s){const before=state;state=s;selected=null;itemMenu=false;persist();net.broadcast(s);present(before,s).then(scheduleEnemy);}
function scheduleEnemy(){if(!enemyTimer&&isLeader()&&state.phase==='battle'&&E.current(state)?.side==='enemy')enemyTimer=setTimeout(()=>{enemyTimer=null;if(!visualBusy&&state.phase==='battle'&&E.current(state)?.side==='enemy')send({kind:'enemy'});else scheduleEnemy();},750);}
async function present(before,after){
 const action=after.lastAction;
 if(before.phase==='battle'&&action?.skillType==='warrior_swift_strikes'&&action.hits?.length&&action.serial!==before.lastAction?.serial){
  visualBusy=true;const saved=state;state=before;render();state=saved;root.querySelectorAll('button').forEach(b=>b.disabled=true);
  const target=root.querySelector(`[data-unit="${action.targetId}"]`),actor=root.querySelector(`[data-unit="${action.actorId}"] .rogue-character`),foe=before.enemies.find(e=>e.id===action.targetId);let hp=foe?.hp||0;
  for(const[index,damage]of action.hits.entries()){
   if(state.id!==after.id)break;
   window.dispatchEvent(new CustomEvent('dungeon-motion',{detail:{phase:'start',skill:action.skillType,hit:index}}));
   const motion=actor?.animate([0,1,2,3].map((c,i)=>({backgroundPosition:`${c*100/3}% ${100/3}%`,offset:i/3,easing:'steps(1,end)'})),{duration:500});
   await new Promise(r=>setTimeout(r,250));hp=Math.max(0,hp-damage);
   const bar=target?.querySelector('.rogue-bar.health');if(bar){bar.querySelector('i').style.width=hp/foe.maxHp*100+'%';bar.querySelector('span').textContent=Math.ceil(hp)+' / '+foe.maxHp;bar.setAttribute('aria-valuenow',Math.ceil(hp));}
   if(target){const f=document.createElement('span');f.className='rogue-float';f.textContent='−'+damage;target.append(f);setTimeout(()=>f.remove(),900);}
   window.dispatchEvent(new CustomEvent('dungeon-motion',{detail:{phase:'impact',skill:action.skillType,hit:index,damage,hp}}));
   await (motion?.finished||new Promise(r=>setTimeout(r,250))).catch(()=>{});
  }
  visualBusy=false;render();if(before.phase!==after.phase)animate(before,after);
 }else{render();animate(before,after);}
}

function animate(before,after){
 if(before.phase==='battle'&&after.phase!=='battle'){const own=after.party.find(h=>h.owner===localId());if(own){const lines=after.log.filter(t=>t.startsWith(own.characterName+': +'));if(lines.length)message(lines.at(-1));}return;}
 if(before.id!==after.id||before.phase!=='battle'||after.phase!=='battle'||before.revision===after.revision||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const turn=E.current(before),unit=(turn?.side==='hero'?after.party:before.enemies).find(h=>h.id===turn?.id),node=root.querySelector(`[data-unit="${turn?.id}"]`);node?.classList.add('rogue-acting');
  if(unit){
   const action=turn.side==='enemy'&&after.lastEnemyAction?.actorId===unit.id?after.lastEnemyAction:null;
   const art=turn.side==='enemy'?EnemyArt[enemyArtKey(unit)]:null;
   const rows=turn.side==='hero'?4:art?.rows||1;
   const row=Math.min(rows-1,action&&unit.isBoss||turn.side==='hero'&&['Mago','Adepto da Natureza'].includes(unit.class)?2:1);
   node?.querySelector('.rogue-character,.rogue-enemy-art')?.animate([0,1,2,3].map((col,i)=>({backgroundPosition:`${col*100/3}% ${rows>1?row*100/(rows-1):0}%`,offset:i/3,easing:'steps(1,end)'})),{duration:480});
   const skill=art?.skills[action?.skillId];
   if(skill){
    const ids=action.phase==='charge'||skill.self?[unit.id]:action.target==='party'?before.party.filter(h=>h.hp>0&&!h.fled).map(h=>h.id):[action.heroId];
    for(const id of ids){
     const sprite=root.querySelector(`[data-unit="${id}"] .rogue-unit-sprite`);
     if(!sprite)continue;
     const fx=document.createElement('span');fx.className='dungeon-enemy-fx';fx.setAttribute('aria-hidden','true');
     fx.style.backgroundImage=`url('assets/visual/enemy-fx/${skill.key}.webp')`;sprite.append(fx);
     const frames=skill.charge?action.phase==='charge'?[0,1,2,3]:[4,5,6,7]:[0,1,2,3,4,5,6,7];
     fx.animate(frames.map((frame,i)=>({backgroundPosition:`${frame%4*100/3}% ${Math.floor(frame/4)*100}%`,offset:i/(frames.length-1),easing:'steps(1,end)'})),{duration:650});
     setTimeout(()=>fx.remove(),650);
    }
   }
  }
 for(const u of [...after.party,...after.enemies]){const old=[...before.party,...before.enemies].find(h=>h.id===u.id),target=root.querySelector(`[data-unit="${u.id}"]`);if(!old||!target||old.hp===u.hp)continue;const value=Math.round(u.hp-old.hp),f=document.createElement('span');f.className='rogue-float'+(value>0?' heal':'');f.textContent=(value>0?'+':'')+value;target.classList.add(value>0?'rogue-recover':'rogue-impact');target.append(f);setTimeout(()=>f.remove(),950);}
}
 function send(intent){try{if(state.resuming)throw Error('Aguarde a retomada pelo anfitrião.');if(visualBusy)throw Error('Aguarde a sequência de golpes.');const p={...intent,revision:state.revision};if(net.info.mode==='guest')net.send(p,++seq);else commit(E.transition(state,localId(),p));}catch(e){message(e.message);}}
function btn(label,action,data={},disabled=false,extra=''){const imageControl=action==='items'||/base-map-area|base-item-slot|base-equipment-slot|base-bag-button|base-person-button|rogue-entity-button|rogue-skill|rogue-basic|dungeon-hunt|base-exit/.test(extra);return `<button type="button" ${imageControl?'':'data-ui="action"'} data-action="${action}" ${Object.entries(data).map(([k,v])=>`data-${k}="${esc(v)}"`).join(' ')} ${disabled?'disabled':''} ${extra}>${label}</button>`;}
  function art(h){let key=slug(h.subclassChoices?.tier60||h.subclassChoices?.tier30||h.class),folder='heroes-v2';const f=h.effects||{};if(key==='corrompido'&&f.visualDemonTurns>0){key+='-demonio';folder='hero-forms';}if(key==='fada-monarca'&&f.natureCrownedTurns>0){key+='-coroada';folder='hero-forms';}if(key==='avatar-da-natureza'&&f.natureTrueFormTurns>0){key+='-verdadeira';folder='hero-forms';}return new URL('assets/visual/'+folder+'/'+key+'.webp',document.baseURI).href;}
  function figure(h){return `<span class="rogue-character" style="--hero-art:url('${art(h)}')" role="img" aria-label="${esc(heroTitle(h))}"></span>`;}
  function heroTitle(h){return E.withHero(state,h,null,()=>getDisplayedClassName(h));}
  function bar(value,max,kind,label,tooltip){return `<div class="rogue-bar scene-vital-bar ${kind}" tabindex="0" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${Math.ceil(max)}" aria-valuenow="${Math.max(0,Math.ceil(value))}" data-tip="${esc(tooltip||label)}"><i class="scene-vital-fill ${kind==='health'?'scene-hp-fill':'scene-mp-fill'}" style="width:${Math.max(0,Math.min(100,value/Math.max(1,max)*100))}%"></i><span>${Math.ceil(value)} / ${Math.ceil(max)}</span></div>`;}
  function shield(value,max){
    return value>0?`<div class="rogue-bar scene-vital-bar scene-vital-shield shield" role="meter" aria-label="Escudo" aria-valuemin="0" aria-valuemax="${Math.max(max,value)}" aria-valuenow="${value}"><i class="scene-vital-fill scene-shield-fill" style="width:${Math.min(100,value/max*100)}%"></i><span>Escudo ${Math.floor(value)}</span></div>`:'';
  }
  function statusItems(items){
    return items.map(e=>typeof e==='string'?{text:e.split('|')[0].trim(),details:e}:e);
  }
  function unitEffects(unit,side){
    if(side==='enemy')return statusItems(getEnemyStatusEffects(unit));
    const all=E.withHero(state,unit,null,()=>getHeroStatusEffects());
    for(const e of state.enemies.filter(e=>e.hp>0)){
      const turns=e.provocations?.find(p=>p.heroId===unit.id)?.left;
      if(e.campaignState?.timers?.dominion>0&&e.campaignState.dominionHeroId===unit.id)all.push({text:'Sob domínio',details:`${e.name} · ${e.campaignState.timers.dominion} turno(s)`});
      if(turns)all.push({text:'Provocação',details:`${e.name} · ${turns} ação(ões) restantes`});
      for(const [field,label] of [['haunt','Assombrar'],['deathmark','Marca da Morte'],['glare','Clarão Absoluto'],['doom','Fim Inadiável'],['reap','Ceifar Alma']]){
        const value=e.campaignState?.heroes?.[unit.id]?.[field];
        if(value)all.push({text:label,details:`${e.name} · ${field==='doom'?value+'% da vida no próximo turno':field==='reap'?'Execução a 30% da vida':value+' turno(s)'}`});
      }
    }
    if(unit.fled)all.push('Em retirada');
    if(unit.effects.skipNextTurn)all.push('Interrompido | A próxima ação será perdida, exceto ao usar habilidade que rompe controle.');
    return statusItems(all);
  }
  function statusChips(unit,side){
    const all=unitEffects(unit,side);
    return `<div class="rogue-status">${all.slice(0,2).map(x=>`<span tabindex="0" data-tip="${esc(x.details||x.text)}">${esc(x.text)}</span>`).join('')}${all.length>2?btn('+'+(all.length-2)+' efeitos','exam',{id:unit.id}):''}</div>`;
  }
  function enemyArtKey(e){return e.baseName==='Fenix Sombria'&&e.campaignState?.timers?.rest>0?'fenix-sombria-ovo':slug(e.baseName);}
  function enemyFigure(e){
    const key=enemyArtKey(e);
    return `<span class="rogue-enemy-art" style="--enemy-art:url('${new URL('assets/visual/enemies-v3/'+key+'.webp',document.baseURI).href}');--enemy-rows:${(EnemyArt[key]?.rows||1)*100}%" role="img" aria-label="${esc(e.name)}"></span>`;
  }
  function heroCard(h){
    const c=E.stats(state,h),valid=selected?.side==='ally'&&h.hp>0&&!h.fled;
    return `<article data-unit="${esc(h.id)}" class="rogue-hero ${h.hp<=0||h.fled?'fallen':''} ${E.current(state)?.id===h.id?'active-turn':''} ${valid?'valid-target':''}">
      ${btn(figure(h),'hero',{id:h.id},false,`class="rogue-entity-button rogue-unit-sprite" aria-label="${esc((valid?'Usar em ':'Inspecionar ')+h.characterName)}"`)}
      <div class="rogue-unit-details dungeon-campaign-vitals"><div class="rogue-unit-name"><strong>${esc(h.characterName)}</strong><span>${esc(heroTitle(h))} · Nv.${h.level}${h.offline?' · Ausente':''}</span></div>
      ${bar(h.hp,c.maxHp,'health','Vida de '+h.characterName)}${bar(h.mp,c.maxMp,'mana','Mana de '+h.characterName,'Regenera '+c.manaRegen+' MP por turno.')}
      ${shield(h.effects.shieldValue,c.maxHp)}${statusChips(h,'hero')}</div></article>`;
  }
  function intentTarget(e,move){
    return move.target==='party'?'Grupo de heróis':move.target==='self'?'Uso próprio':state.party.find(h=>h.id===move.heroId)?.characterName||'Herói';
  }
  function enemyCard(e){
    const move=E.enemyIntent(state,e),valid=['enemy','enemies'].includes(selected?.side);
    return `<article data-unit="${esc(e.id)}" class="rogue-enemy ${e.isBoss?'boss':''} ${valid?'valid-target':''} ${E.current(state)?.id===e.id?'active-turn':''}">
      ${btn(enemyFigure(e),'enemy',{id:e.id},false,`class="rogue-entity-button rogue-unit-sprite" aria-label="${esc((valid?'Selecionar ':'Examinar ')+e.name)}"`)}
      <div class="rogue-unit-details dungeon-campaign-vitals"><div class="rogue-unit-name"><strong>${esc(e.baseName)}</strong><span>Nv.${e.level}${e.isBoss?' · Guardião':''}</span></div>
      ${bar(e.hp,e.maxHp,'health','Vida de '+e.name)}
      ${e.maxMp>0?bar(e.mp,e.maxMp,'mana','Mana de '+e.name,'Regenera '+getBaseManaRegen(e.maxMp)+' MP por turno.'):''}
      ${shield(e.shieldValue,e.maxHp)}
      <div class="rogue-unit-meta"><span>Armadura ${getEnemyDisplayedArmor(e)}</span>${btn('Examinar','exam',{id:e.id})}</div>
      <p class="rogue-intent ${move.left?'danger':''}" data-tip="${esc(move.name+' · '+intentTarget(e,move))}">${esc(move.name)} · ${esc(intentTarget(e,move))}${move.left?' · '+move.left+' em preparo':''}</p>
      ${statusChips(e,'enemy')}</div></article>`;
  }
  function timeline(){
    return `<nav class="dungeon-turn-order" aria-label="Ordem dos turnos"><strong>Turno ${state.cursor+1} · R${state.round}</strong><ol>${state.order.map((entry,i)=>{
      const hero=entry.side==='hero',u=(hero?state.party:state.enemies).find(x=>x.id===entry.id);
      if(!u||u.hp<=0||u.fled)return '';
      return `<li class="${entry.side} ${i<state.cursor?'played':''}">${btn(hero?figure(u):enemyFigure(u),'exam',{id:u.id},false,`aria-label="${esc(u.characterName||u.name)}" ${i===state.cursor?'aria-current="step"':''} data-tip="${esc(u.characterName||u.name)}"`)}</li>`;
    }).join('')}</ol></nav>`;
  }
  function huntButton(label,action,disabled=false){return btn(`<img src="assets/visual/hud/icon-find-enemy.webp" alt=""><span>${label}</span>`,action,{},disabled,'class="dungeon-hunt"');}
  function toolbar(){
    const entry=E.current(state),h=state.party.find(x=>x.id===entry?.id)||state.party.find(x=>x.id===state.lastAction?.actorId)||state.party.find(controls)||state.party[0];if(!h)return '';
    const target=state.enemies.find(e=>e.id===inspected&&e.hp>0)||state.enemies.find(e=>e.hp>0);
    const own=entry?.side==='hero'&&controls(h)&&!visualBusy,skills=E.available(state,h,target);
    const targetText=selected?selected.side==='barrage'?'Escolha todos os disparos em um alvo ou um disparo por inimigo vivo.':selected.side==='enemy'?'Escolha o inimigo.':selected.areaPrimary?'Escolha o alvo principal da área.':selected.side==='ally'?'Escolha o aliado.':selected.side==='self'?'Usar no próprio herói.':selected.side==='party'?'Aplicar no grupo.':'Atingir todos os inimigos.':'Selecione uma ação e depois o alvo.';
    const restricted=h.effects.forcedBasicTurns>0,basicCost=h.class==='Mago'?Math.floor(3+.1*h.level)*3:0;
    const skillCard=(skill,index)=>{
      const cost=skill?.effectiveCost??basicCost,name=skill?.name??E.withHero(state,h,null,getBasicAttackLabel);
      const label=esc(name),active=skill?selected?.skillType===skill.type:selected?.kind==='basic';
      const tip=skill?E.withHero(state,h,target,()=>getSkillReadout(skill))+'\n'+R.targetDescription(skill):E.withHero(state,h,state.enemies.find(e=>e.hp>0),getBasicAttackTooltip);
      const classes=`rpg-ability ${skill?'rogue-skill':'rogue-basic'}`;
      return btn(`<img src="${getSkillSpritePath(skill,h.class)}" alt="" draggable="false"><strong>${label}</strong><small>${cost} mana${skill?.hpCostPercent?' · vida':''}</small><span class="rpg-hotkey">${index<=9?index:''}</span>`,'select',skill?{kind:'skill',skill:skill.type}:{kind:'basic'},!own||(skill?!!skill.blockedReason:h.mp<cost),`class="${classes}" aria-label="${label}" aria-pressed="${active}" data-tip="${esc(tip)}"`);
    };
    const passiveDock=E.withHero(state,h,null,renderCombatPassives);
    return `<section class="rogue-command dungeon-campaign-ui">
     <div class="rpg-command-belt">
      <div class="rpg-potion-slot rogue-potion-slot">${btn('<img src="assets/visual/hud/icon-potion.webp" alt=""><span>Itens</span>','items',{},!own||restricted,`aria-expanded="${itemMenu}"`)}</div>
      <div class="rpg-ability-list rogue-skills">${skillCard(null,1)}${skills.map((k,i)=>skillCard(k,i+2)).join('')}</div>
      <div class="rpg-turn-actions">${btn('Encerrar turno','pass',{},!own||restricted)}</div>
     </div>
     <div class="rpg-combat-passives">${passiveDock}</div>
     <div class="rogue-target-prompt" role="status"><div>${selected?'<strong>'+esc(selected.label)+'</strong>':''}<p>${own?targetText:entry?.side==='enemy'?'Os inimigos estão agindo…':'Aguarde '+esc(h.characterName)+'.'}</p></div>
      ${selected?.side==='barrage'?btn('Alvo único','barrageMode',{value:'single'})+btn('Em área','barrageMode',{value:'area'}):''}${selected?btn('Cancelar','cancel'):''}
      ${selected&&!selected.areaPrimary&&['self','party','enemies'].includes(selected.side)?btn('Confirmar','confirm'):''}
     </div>
    </section>`;
  }
  function postBattle(){const cave=state.phase==='cave_pause',blocked=!isLeader()||state.party.some(h=>E.classChoices(h).length||(h.pendingAttributePoints||0)>0)||!cave&&state.party.some(h=>h.place!=='hunt');return `<div class="dungeon-recovery">${huntButton(cave?'Próximo combate':'Próxima caçada',cave?'caveNext':'nextHunt',blocked)}</div>${subclasses()}`;}
  function battleView(){const fighting=state.phase==='battle',region=state.battleRegion||state.biomes[state.act];return `${fighting?timeline():''}<section class="rogue-battle-scene" style="--battle-background:url('${new URL('assets/visual/backgrounds/regions/'+slug(region)+'.webp',document.baseURI).href}')" aria-label="Campo de combate"><div class="rogue-enemies">${fighting?state.enemies.filter(e=>e.hp>0).map(enemyCard).join(''):''}</div><div class="rogue-party">${state.party.map(h=>heroCard(h)).join('')}</div></section>${chronicleView()}${fighting?toolbar():postBattle()}${itemMenu?itemPicker():''}`;}

const attributeLabels=[['vitality','Vitalidade','HP máxima'],['wisdom','Sabedoria','MP máxima'],['strength','Força','ataque e dano de habilidade']];
function syncAllocation(){
 const dialog=document.getElementById('dungeonAttributes');
 const h=['hub','cave_pause'].includes(state.phase)&&state.party.find(h=>controls(h)&&h.pendingAttributePoints>0);
 if(!h){if(dialog.open)dialog.close();allocationHero='';attributeDraft={};return;}
 if(document.getElementById('rogueDialog').open)return;
 if(allocationHero!==h.id){allocationHero=h.id;attributeDraft={};}
 const points=h.pendingAttributePoints;
 if(Object.values(attributeDraft).reduce((a,b)=>a+b,0)>points)attributeDraft={};
 const left=points-Object.values(attributeDraft).reduce((a,b)=>a+b,0);
 dialog.innerHTML=`<header class="base-modal-header"><h2>Distribuir atributos</h2></header><div class="dungeon-attribute-body"><p>${esc(h.characterName)} · Nível ${h.level} · ${left} ponto(s) disponíveis</p>
  ${attributeLabels.map(([key,label,stat])=>{
   const n=attributeDraft[key]||0,gain=getAttributePointGain(key,h.level);
   return `<div class="dungeon-attribute-row"><div><strong>${label}</strong><small>+${gain} ${stat} por ponto · +${gain*n} nesta distribuição</small></div>
    <div class="dungeon-attribute-controls">${[-5,-1,1,5].map((delta,i)=>(i===2?`<output>${n}</output>`:'')+btn(delta>0?'+'+delta:String(delta),'attributeStep',{key,delta},delta<0?n< -delta:left<delta,`aria-label="${delta>0?'+':''}${delta} ${label}"`)).join('')}</div></div>`;
  }).join('')}${btn('Terminar distribuição','allocate',{hero:h.id},left>0)}</div>`;
 if(!dialog.open)dialog.showModal();
}
function subclasses(){return state.party.filter(h=>E.classChoices(h).length).map(h=>`<section class="rogue-panel"><h3>${esc(h.characterName)} · Especialização</h3>${E.classChoices(h).map(c=>btn(esc(c.name),'subclass',{hero:h.id,id:c.id},!controls(h))).join('')}</section>`).join('');}
function itemText(item,h){return item.type==='equipment'?E.withHero(state,h,null,()=>EquipmentSystem.describe(item,h)):item.description||item.name;}
function itemCard(item,h,actions){return `<article class="journey-item"><img src="${getItemSpritePath(item)}" alt=""><div><strong>${esc(item.name)}</strong><p>${esc(itemText(item,h))}</p>${actions}</div></article>`;}
function itemPicker(){const h=state.party.find(x=>x.id===E.current(state)?.id)||state.party.find(x=>x.id===activeHero);return `<section class="rogue-panel journey-items"><h3>Poções</h3>${h.inventory.filter(i=>i.type==='consumable').map(i=>itemCard(i,h,btn('Selecionar','potionSelect',{hero:h.id,uid:i.uid}))).join('')||'<p>Nenhuma poção disponível.</p>'}${btn('Fechar','closeItems')}</section>`;}
 function continuationView(saved){
  if(!saved||net.info.mode!=='solo')return '';
  return `<section class="rogue-lobby-section"><h2>Continuar aventura</h2>
   <p>${isOnlineSave(saved)?'Online':'Solo'} · ${esc(saved.biomes[saved.act])} · Sala ${saved.node+1}</p>
   ${resumeSetup?`
    <p>Reúna os ${resumeSetup.saved.party.length} jogadores do grupo salvo.</p>
    <label>Total de jogadores
     <select id="resumeCount"><option value="">Selecione</option>
      ${[1,2,3].map(n=>`<option value="${n}" ${n===resumeSetup.count?'selected':''}>${n}</option>`).join('')}
     </select>
    </label>
    <label>Seu aventureiro
     <select id="resumeHero"><option value="">Selecione</option>
      ${resumeSetup.saved.party.map(h=>`<option value="${esc(h.id)}" ${h.id===resumeSetup.heroId?'selected':''}>${esc(h.characterName)} · ${esc(heroTitle(h))}</option>`).join('')}
     </select>
    </label>
    <div class="rogue-lobby-buttons">${btn('Criar sala de retomada','openResume',{},resumeSetup.count!==resumeSetup.saved.party.length||!resumeSetup.heroId)}${btn('Cancelar','cancelResume')}</div>
   `:btn('Retomar jornada','resume')}
  </section>`;
 }
 function cooperativeView(){
  const {mode,code,connected}=net.info;
  return `<section class="rogue-lobby-section"><h2>Cooperativo</h2>
   ${mode==='host'&&code?`<p class="rogue-room-code">Código da sala <code>${esc(code)}</code></p>`:''}
   ${state.resuming?`
    <p>${state.party.filter(h=>!h.offline).length} de ${state.party.length} jogadores com aventureiro escolhido</p>
    <ul class="rogue-resume-roster">${state.party.map(h=>`<li>
     <span>${esc(h.characterName)} · ${esc(heroTitle(h))}</span>
     ${mode==='guest'&&!connected&&h.offline?btn('Escolher','claimHero',{id:h.id},false,`aria-label="Escolher ${esc(h.characterName)}"`):`<small>${h.offline?'Aguardando jogador':h.owner===localId()?'Seu aventureiro':'Conectado'}</small>`}
    </li>`).join('')}</ul>
    ${mode==='host'?btn('Continuar aventura online','resumeOnline',{},!canResume()):''}
   `:mode==='solo'?`
    ${btn('Criar sala','host',{},!state.party.length||!!resumeSetup)}
    <div class="rogue-room-join">
     <label>Código da sala<input id="joinCode" value="${esc(joinCode)}" maxlength="80" autocomplete="off"></label>
     ${btn('Entrar na sala','join',{},!!resumeSetup)}
    </div>
   `:''}
   ${mode!=='solo'?btn(mode==='host'?'Fechar sala':'Sair da sala','cancelRoom'):''}
   ${mode==='guest'&&!connected&&!state.resuming?btn('Reconectar','reconnect'):''}
   ${statusMessage?`<p role="status">${esc(statusMessage)}</p>`:''}
  </section>`;
 }
 function lobbyView(){
  const party=state.party.length?state.party:[{class:selectedClass,characterName:heroName||selectedClass,subclassChoices:{}}];
  const own=state.party.some(h=>h.owner===localId());
  return `<section class="rogue-lobby" aria-label="Entrada da dungeon">
   <header class="rogue-lobby-header">
    <a href="index.html">← Voltar à campanha</a>
    <h1>Dungeon</h1>
   </header>
   <div class="rogue-lobby-scene">
    <div class="rogue-lobby-party">${party.map(h=>`<div>${figure(h)}<div class="rogue-lobby-name">
     <strong>${esc(h.characterName)}</strong><small>${esc(heroTitle(h))}</small>
    </div></div>`).join('')}</div>
   </div>
   <aside class="rogue-panel">
    ${continuationView(resumeSetup?.saved||savedRun())}
    ${state.resuming||resumeSetup?'':`<section class="rogue-lobby-section"><h2>Seu aventureiro</h2>
     <div class="rogue-class-grid">${Object.keys(classes).map(c=>btn(`${figure({class:c,subclassChoices:{}})}<span>${esc(c)}</span>`,'class',{value:c},false,`class="${c===selectedClass?'selected':''}" aria-pressed="${c===selectedClass}"`)).join('')}</div>
     <label>Nome<input id="journeyName" value="${esc(heroName)}" maxlength="28"></label>
     <p>40 moedas · duas poções de vida e duas de mana · sem equipamentos.</p>
     <div class="rogue-lobby-buttons">
      ${own?btn('Atualizar herói','configureHero'):btn('Adicionar herói','addHero',{},net.info.mode==='guest'||state.party.length===3)}
      ${btn('Entrar no saguão','start',{},!isLeader()||!state.party.length)}
     </div>
    </section>`}
    ${cooperativeView()}
   </aside>
  </section>`;
 }
function chronicleView(){const last=state.log.at(-1)||'A aventura aguarda.';return `<div class="rpg-chronicle" aria-label="Última ação"><span>${esc(last)}</span>${btn('Histórico','baseHistory')}</div>`;}
function hubView(){const h=state.party.find(p=>p.id===activeHero&&controls(p))||state.party.find(controls);return h?.place==='hunt'?battleView():baseUI.view()+subclasses();}
function encounterView(){return baseUI.encounter();}
function render(){tip.hidden=true;const mode=state.phase;const body=`${mode==='lobby'?lobbyView():mode==='hub'?hubView():mode==='battle'?battleView():mode==='cave_pause'?battleView():mode==='ended'?`<section class="rogue-panel"><h1>${state.outcome==='victory'?'Jornada concluída':'Fim da jornada'}</h1><p>${state.battleNumber} batalhas · ${state.bosses} chefes vencidos.</p>${btn('Novo grupo','newRun')}</section>`:encounterView()}${mode!=='lobby'&&statusMessage?'<p role="status">'+esc(statusMessage)+'</p>':''}${mode!=='lobby'&&net.info.mode==='guest'&&!net.info.connected?btn('Reconectar','reconnect'):''}`;root.innerHTML=!['lobby','ended'].includes(mode)?baseUI.shell(body):body;const activeTurn=root.querySelector('.dungeon-turn-order [aria-current="step"]');
if(activeTurn){const list=activeTurn.closest('ol');if(list.scrollWidth>list.clientWidth)activeTurn.scrollIntoView({block:'nearest',inline:'nearest'});}
baseUI.sync();syncProfile();syncAllocation();}
function selectAction(d){const h=state.party.find(p=>p.id===E.current(state)?.id);if(!controls(h)||visualBusy)return;if(d.kind==='skill'){const k=E.available(state,h).find(k=>k.type===d.skill);if(!k||k.blockedReason)return;selected={kind:'skill',heroId:h.id,skillType:k.type,side:k.type==='archer_barrage'?'barrage':k.target,areaPrimary:k.areaPrimary,label:k.name};}else selected={kind:'basic',heroId:h.id,side:'enemy',label:'Ataque básico'};render();}
async function click(a,d){if(baseUI.handle(a,d))return;const hero=d.hero||E.current(state)?.id;switch(a){case 'class':selectedClass=d.value;render();break;case 'active':activeHero=d.hero;render();break;case 'addHero':send({kind:'addHero',className:selectedClass,name:heroName||selectedClass,owner:localId()});break;case 'configureHero':send({kind:'configureHero',heroId:state.party.find(h=>h.owner===localId())?.id,className:selectedClass,name:heroName||selectedClass});break;case 'start':send({kind:'start'});break;case 'resume':prepareResume();break;
case 'cancelResume':resumeSetup=null;render();break;
case 'openResume':await openResumeRoom();break;
case 'claimHero':net.claimHero(d.id);break;
case 'resumeOnline':resumeOnline();break;
case 'cancelRoom':cancelRoom();break;
case 'host':lobbyDraft=state;await net.host();break;
case 'join':{
 const code=joinCode.trim();
 if(!NetworkValidation.validPeerId(code))throw Error('Informe um código de sala válido.');
 lobbyDraft=state;
 DungeonStore.write('roomCode',code);
 await net.join(code,{className:selectedClass,name:heroName||selectedClass,relicId:'none',token});
 break;
}
case 'reconnect':await net.join(net.info.code||DungeonStore.read('roomCode',''),{className:selectedClass,name:heroName||selectedClass,relicId:'none',token});break;
case 'visit':baseUI.close();send({kind:a,heroId:hero,place:d.place});break;case 'attributeStep':{
 const delta=Number(d.delta);
 if(allocationHero&&attributeLabels.some(([key])=>key===d.key)&&[-5,-1,1,5].includes(delta)){
  attributeDraft[d.key]=(attributeDraft[d.key]||0)+delta;syncAllocation();
  document.querySelector(`[data-action="attributeStep"][data-key="${d.key}"][data-delta="${delta}"]:not(:disabled)`)?.focus();
 }
 break;
}
case 'allocate':send({kind:'allocate',heroId:hero,points:attributeDraft});break;
case 'ready':case 'rest':case 'hunt':case 'nextHunt':case 'caveNext':case 'leaveEncounter':case 'pass':send({kind:a,heroId:hero});break;case 'equip':case 'sell':case 'upgrade':send({kind:a,heroId:hero,uid:d.uid});break;case 'unequip':send({kind:a,heroId:hero,slot:d.slot});break;case 'buy':send({kind:a,heroId:hero,offerId:d.id});break;case 'bet':case 'skipBet':send({kind:'bet',heroId:hero,amount:a==='skipBet'?0:Number(document.getElementById('betValue').value)});break;case 'subclass':send({kind:a,heroId:hero,choiceId:d.id});break;case 'offerTrade':send({kind:a,heroId:hero,targetId:document.getElementById('tradeTarget').value,uid:document.getElementById('tradeItem').value,coins:Number(document.getElementById('tradeCoins').value)});break;case 'acceptTrade':case 'rejectTrade':case 'cancelTrade':send({kind:a,heroId:hero,tradeId:d.id});break;case 'select':selectAction(d);break;case 'barrageMode':if(selected?.side==='barrage'){selected={...selected,barrageMode:d.value,side:d.value==='area'?'enemies':'enemy'};render();}break;case 'cancel':selected=null;render();break;case 'confirm':if(selected)send({...selected,targetId:selected.side==='self'?selected.heroId:undefined});break;case 'hero':case 'enemy':if(selected&&(a==='hero'&&selected.side==='ally'||a==='enemy'&&(selected.side==='enemy'||selected.areaPrimary)))send({...selected,targetId:d.id});else inspect(d.id,a);break;case 'inspect':case 'exam':inspect(d.id);break;case 'items':itemMenu=!itemMenu;render();break;case 'closeItems':itemMenu=false;render();break;case 'campItems':activeHero=hero;itemMenu=true;render();break;case 'potionSelect':{const h=state.party.find(p=>p.id===hero),i=h.inventory.find(i=>i.uid===d.uid);if(state.phase!=='battle')send({kind:'potion',heroId:hero,uid:i.uid,targetId:hero});else{selected={kind:'potion',heroId:hero,uid:i.uid,side:'ally',label:i.name};itemMenu=false;render();}break;}case 'potionSelf':send({kind:'potion',heroId:hero,uid:d.uid,targetId:hero});break;case 'closeModal':profileId='';baseUI.close();syncAllocation();break;case 'abandon':if(confirm('Encerrar esta jornada?'))send({kind:'abandon'});break;case 'newRun':net.close();clearTimeout(enemyTimer);enemyTimer=null;state=E.lobby(Date.now().toString(36));render();break;}}
function profileContent(id){
 const h=state.party.find(p=>p.id===id),e=state.enemies.find(p=>p.id===id);
 if(h)return `<header class="base-modal-header"><h2>${esc(h.characterName)}</h2>${btn('Fechar','closeModal')}</header><div class="dungeon-hero-profile">${figure(h)}<section>${baseUI.profile(h)}</section></div>`;
 if(!e)return '';
 const move=E.enemyIntent(state,e),armor=getEnemyDisplayedArmor(e),base=e.baseArmor??e.armor??0;
 const i=CampaignEnemyCombat.index(e.baseName),passive=CampaignEnemyCombat.passives[i];
 const effects=[...unitEffects(e,'enemy'),...(e.provocations||[]).filter(p=>state.party.some(h=>h.id===p.heroId&&h.hp>0&&!h.fled)).map(p=>({text:'Provocação',details:`${state.party.find(h=>h.id===p.heroId).characterName} · ${p.left} ação(ões) restantes`}))];
 return `<header class="base-modal-header"><h2>Examinar inimigo</h2>${btn('Fechar','closeModal')}</header>
  <div class="dungeon-exam-grid"><section class="dungeon-exam-sheet">
   <div class="dungeon-exam-art" style="background-image:url('assets/visual/backgrounds/regions/${slug(e.region)}.webp')">${enemyFigure(e)}</div>
   <h3>${esc(e.baseName)}</h3><p>${e.isBoss?'Chefe · ':''}${esc(e.region)} · Nv.${e.level}</p>
   <div class="dungeon-exam-vital"><strong>Vida</strong>${bar(e.hp,e.maxHp,'health','Vida')}</div>${e.maxMp?`<div class="dungeon-exam-vital"><strong>Mana</strong>${bar(e.mp,e.maxMp,'mana','Mana')}</div>`:''}
   ${shield(e.shieldValue,e.maxHp)||'<p>Escudo 0</p>'}
   <p class="dungeon-exam-armor"><strong>Armadura ${armor}</strong><small>${base} base · ${armor-base>=0?'+':''}${armor-base} de efeitos</small></p>
  </section><section class="dungeon-exam-reading">
   <h3>Próxima ação</h3><p><strong>${esc(move.name)}</strong><br>${esc(intentTarget(e,move))}${move.left?' · '+move.left+' ação(ões) em preparação':''}</p>
   <h3>Efeitos ativos</h3><ul>${effects.map(x=>`<li><strong>${esc(x.text)}</strong>${x.details&&x.details!==x.text?`<br>${esc(x.details)}`:''}</li>`).join('')||'<li>Nenhum efeito ativo</li>'}</ul>
   <h3>Habilidades e passivas</h3>
   <details><summary>Habilidades</summary><ul><li>Ataque básico · alvo único</li>${CampaignEnemyCombat.kit(e.baseName).map(a=>`<li><strong>${esc(a.name)} · ${a.cost} MP · ${CampaignEnemyCombat.isDungeonArea(a)?'Área':'Conforme o efeito'}</strong><br>${esc(a.description)}</li>`).join('')}</ul></details>
   <details><summary>Passivas</summary><p>${passive?esc(passive+' · '+CampaignEnemyCombat.passiveDescriptions[i]):'Nenhuma passiva especial'}</p></details>
  </section></div>`;
}
function syncProfile(){
 if(!profileId)return;
 const dialog=document.getElementById('rogueDialog');
 if(!dialog.open){profileId='';return;}
 const body=profileContent(profileId);
 if(!body){dialog.close();profileId='';return;}
 const open=[...dialog.querySelectorAll('details')].map(d=>d.open);
 const scroll=dialog.scrollTop;
 dialog.innerHTML=body;
 dialog.querySelectorAll('details').forEach((d,i)=>d.open=!!open[i]);
 dialog.scrollTop=scroll;
}
function inspect(id){
 baseUI.close();
 const dialog=document.getElementById('rogueDialog'),body=profileContent(id);
 if(!body)return;
 profileId=id;dialog.dataset.kind='exam';dialog.innerHTML=body;dialog.showModal();
}
document.addEventListener('click',e=>{
 const skill=e.target.closest('.dungeon-campaign-ui [data-hud="skill-info"]');
 if(skill){baseUI.showSkill(skill.dataset.skillName,skill.dataset.hudDescription);return;}
 if(e.target.closest('a[href="index.html"]'))queuePageMode('resume');const b=e.target.closest('[data-action]');if(b&&!b.disabled)click(b.dataset.action,b.dataset).catch(e=>message(e.message));});document.addEventListener('input',e=>{
 if(e.target.id==='journeyName'){
  heroName=e.target.value;
  if(!state.party.length)root.querySelector('.rogue-lobby-name strong').textContent=heroName||selectedClass;
 }
 if(e.target.id==='joinCode')joinCode=e.target.value;
});
document.addEventListener('change',e=>{
 if(!resumeSetup||!['resumeCount','resumeHero'].includes(e.target.id))return;
 resumeSetup.count=Number(document.getElementById('resumeCount').value);
 resumeSetup.heroId=document.getElementById('resumeHero').value;
 root.querySelector('[data-action="openResume"]').disabled=resumeSetup.count!==resumeSetup.saved.party.length||!resumeSetup.heroId;
});
document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||document.getElementById('rogueDialog').open||document.getElementById('dungeonAttributes').open)return;if(e.key==='Escape'){selected=null;itemMenu=false;render();}if(/^[1-9]$/.test(e.key)&&state.phase==='battle'){const h=state.party.find(p=>p.id===E.current(state)?.id);if(h&&controls(h)){const k=E.available(state,h)[Number(e.key)-2];if(e.key==='1')selectAction({kind:'basic'});else if(k)selectAction({kind:'skill',skill:k.type});}}if(e.key==='Enter'&&selected&&!selected.areaPrimary&&['self','party','enemies'].includes(selected.side))click('confirm',{});});
function showTip(e){const el=e.target.closest?.('[data-tip], .dungeon-campaign-ui [data-hud-description]');if(!el){tip.hidden=true;return;}tip.textContent=el.dataset.tip||el.dataset.hudDescription;tip.hidden=false;const r=el.getBoundingClientRect(),b=tip.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(innerWidth-b.width-8,r.left))+'px';tip.style.top=Math.max(8,r.top-b.height-8)+'px';}document.addEventListener('pointerover',showTip);document.addEventListener('focusin',showTip);document.addEventListener('pointerout',()=>tip.hidden=true);window.addEventListener('beforeunload',persist);
document.getElementById('dungeonAttributes').addEventListener('cancel',e=>e.preventDefault());
const baseUI=DungeonBaseUI.create({state:()=>state,active:()=>activeHero,setActive:id=>activeHero=id,controls,isLeader,localId,esc,btn,figure,heroTitle,itemText,send,render,inspect,leave(){persist();queuePageMode('resume');net.close();window.location.href='index.html';},selectPotion(heroId,uid){selected={kind:'potion',heroId,uid,side:'ally',label:'Usar poção'};render();}});
window.RogueApp={state:()=>E.copy(state),network:net,send,render,load(s){if(!E.validState(s))throw Error('Estado inválido');commit(E.upgradeCheckpoint(E.copy(s)));}};render();
})();
