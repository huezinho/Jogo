/* Dungeon journey UI, using the campaign artwork and command belt. */
(()=>{
'use strict';
const E=DungeonRogue,R=DungeonRules,root=document.getElementById('rogueApp'),tip=document.getElementById('rogueTooltip');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pct=x=>(x*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
let state=E.lobby(Date.now().toString(36)),selectedClass='Guerreiro',heroName='',selected=null,inspected='',modal='',enemyTimer=null,seq=0,activeHero='',itemMenu=false,statusMessage='',visualBusy=false;
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
  }else commit(saved);
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
  const s=E.copy(resumeCheckpoint);
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
 if(unit){const rows=turn.side==='hero'?4:EnemyArt[slug(unit.baseName)]?.rows||1,row=Math.min(rows-1,turn.side==='hero'&&['Mago','Adepto da Natureza'].includes(unit.class)?2:1);node?.querySelector('.rogue-character,.rogue-enemy-art')?.animate([0,1,2,3].map((col,i)=>({backgroundPosition:`${col*100/3}% ${rows>1?row*100/(rows-1):0}%`,offset:i/3,easing:'steps(1,end)'})),{duration:480});}
 for(const u of [...after.party,...after.enemies]){const old=[...before.party,...before.enemies].find(h=>h.id===u.id),target=root.querySelector(`[data-unit="${u.id}"]`);if(!old||!target||old.hp===u.hp)continue;const value=Math.round(u.hp-old.hp),f=document.createElement('span');f.className='rogue-float'+(value>0?' heal':'');f.textContent=(value>0?'+':'')+value;target.classList.add(value>0?'rogue-recover':'rogue-impact');target.append(f);setTimeout(()=>f.remove(),950);}
}
 function send(intent){try{if(state.resuming)throw Error('Aguarde a retomada pelo anfitrião.');if(visualBusy)throw Error('Aguarde a sequência de golpes.');const p={...intent,revision:state.revision};if(net.info.mode==='guest')net.send(p,++seq);else commit(E.transition(state,localId(),p));}catch(e){message(e.message);}}
function btn(label,action,data={},disabled=false,extra=''){const imageControl=action==='items'||/base-map-area|base-item-slot|base-equipment-slot|base-bag-button|base-person-button|rogue-entity-button|rogue-skill|rogue-basic|dungeon-hunt|base-exit/.test(extra);return `<button type="button" ${imageControl?'':'data-ui="action"'} data-action="${action}" ${Object.entries(data).map(([k,v])=>`data-${k}="${esc(v)}"`).join(' ')} ${disabled?'disabled':''} ${extra}>${label}</button>`;}
  function art(h){let key=slug(h.subclassChoices?.tier60||h.subclassChoices?.tier30||h.class),folder='heroes-v2';const f=h.effects||{};if(key==='corrompido'&&f.visualDemonTurns>0){key+='-demonio';folder='hero-forms';}if(key==='fada-monarca'&&f.natureCrownedTurns>0){key+='-coroada';folder='hero-forms';}if(key==='avatar-da-natureza'&&f.natureTrueFormTurns>0){key+='-verdadeira';folder='hero-forms';}return new URL('assets/visual/'+folder+'/'+key+'.webp',document.baseURI).href;}
  function figure(h){return `<span class="rogue-character" style="--hero-art:url('${art(h)}')" role="img" aria-label="${esc(heroTitle(h))}"></span>`;}
  function heroTitle(h){return E.withHero(state,h,null,()=>getDisplayedClassName(h));}
  function bar(value,max,kind,label,tooltip){return `<div class="rogue-bar ${kind}" tabindex="0" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${Math.ceil(max)}" aria-valuenow="${Math.max(0,Math.ceil(value))}" data-tip="${esc(tooltip||label)}"><i style="width:${Math.max(0,Math.min(100,value/Math.max(1,max)*100))}%"></i><span>${Math.ceil(value)} / ${Math.ceil(max)}</span></div>`;}
  function statusChips(entries){return entries.map(e=>{const x=typeof e==='string'?{text:e.split('|')[0].trim(),details:e}:e;return '<span tabindex="0" data-tip="'+esc(x.details||x.text)+'">'+esc(x.text)+'</span>';}).join('');}
  function statuses(h){const all=E.withHero(state,h,null,()=>getHeroStatusEffects());const active=state.enemies.flatMap(e=>(e.provocations||[]).filter(p=>p.heroId===h.id));if(active.length)all.unshift('Provocando: até '+Math.max(...active.map(p=>p.left))+' ações de cada inimigo.');if(h.effects.skipNextTurn)all.unshift('Interrompido: a próxima ação será perdida, exceto ao usar habilidade que rompe controle.');return statusChips(all);}
  function enemyStatuses(e){const all=getEnemyStatusEffects(e);if(e.buffTurns>0)all.unshift({text:e.buffSource||'Fortalecimento',details:'Ataque +20% | '+e.buffTurns+' turno(s)'});return statusChips(all);}
  function passives(h){return E.withHero(state,h,null,()=>getUnlockedPassiveSkills().map(k=>'<span tabindex="0" data-tip="'+esc(getPassiveStatusDescription(k))+'"><img src="'+getSkillSpritePath(k,h.class)+'" alt=""><span>'+esc(k.name)+'</span></span>').join(''));}
  function heroCard(h,targetable=false){
    const c=E.stats(state,h),turn=E.current(state),valid=selected&&(selected.side==='ally'&&h.hp>0||selected.side==='fallen'&&h.hp<=0);
    return `<article data-unit="${h.id}" class="rogue-hero ${h.hp<=0?'fallen':''} ${turn?.id===h.id?'active-turn':''} ${valid?'valid-target':''}">${btn(`<div class="rogue-hero-art">${figure(h)}</div><div class="rogue-unit-name"><strong>${esc(h.characterName)}</strong><span>${esc(heroTitle(h))} · Nv.${h.level}${h.offline?' · Ausente':''}</span></div>`,'hero',{id:h.id},false,`class="rogue-entity-button" aria-label="${esc(valid?'Usar em '+h.characterName:'Inspecionar '+h.characterName)}"`)}<div class="rogue-vitals">${bar(h.hp,c.maxHp,'health','Vida de '+h.characterName)}${bar(h.mp,c.maxMp,'mana','Mana de '+h.characterName,'Regenera '+c.manaRegen+' MP por turno.')}<div class="rogue-status">${statuses(h)}</div></div></article>`;
  }
  function enemyCard(e){
    const targetable=selected?.side==='enemy',move=E.enemyIntent(state,e),turn=E.current(state);
    return `<article data-unit="${e.id}" class="rogue-enemy ${e.isBoss?'boss':''} ${targetable?'valid-target':''} ${turn?.id===e.id?'active-turn':''}">${btn(`<span class="rogue-enemy-art" style="--enemy-art:url('${new URL('assets/visual/enemies-v3/'+slug(e.baseName)+'.webp',document.baseURI).href}');--enemy-rows:${(EnemyArt[slug(e.baseName)]?.rows||1)*100}%" role="img" aria-label="${esc(e.name)}"></span><strong>${esc(e.name)}</strong><small>Nv.${e.level}${e.isBoss?' · Guardião':''}</small>`,'enemy',{id:e.id},false,'class="rogue-entity-button"')}${bar(e.hp,e.maxHp,'health','Vida de '+e.name)}${e.maxMp>0?bar(e.mp,e.maxMp,'mana','Mana de '+e.name,'Regenera '+(8+Math.floor(e.maxMp*.05))+' MP por turno.'):''}<p class="rogue-intent ${e.charge?'danger':''}" data-tip="${esc('Intenção atual: '+move.name+'. Alvo: '+(move.target==='party'?'todo o grupo':move.target==='allies'?'todos os inimigos':move.target==='ally'?'aliado ferido':'um aventureiro')+'. Pode mudar conforme a luta.')}">${esc(e.charge?'Preparando área!':move.name)} · ${move.target==='party'?'Área':move.target==='allies'?'Buff em área':move.target==='ally'?'Cura':'Alvo único'}</p><div class="rogue-status">${enemyStatuses(e)}</div></article>`;
  }
  function progress(){
    if(state.phase==='lobby')return '';
    return `<nav class="rogue-progress" aria-label="Percurso da expedição">${state.biomes.map((biome,i)=>`<div class="${state.act===i?'current':state.act>i?'complete':''}"><span>${i+1}. ${esc(biome)}</span><div>${Array.from({length:7},(_,n)=>{const index=i*7+n;return `<i class="${index<state.node?'done':index===state.node?'now':''} ${n===6?'guardian':''}" title="Sala ${index+1}${n===6?' · Guardião':''}"></i>`;}).join('')}</div></div>`).join('')}</nav>`;
  }
  function timeline(){
    return `<div class="rogue-timeline" aria-label="Ordem dos turnos"><span>Rodada ${state.round}</span>${state.order.map((entry,i)=>{const u=(entry.side==='hero'?state.party:state.enemies).find(x=>x.id===entry.id);return u?.hp>0?`<span class="${i===state.cursor?'now':''} ${entry.side}">${esc(u.characterName||u.name)}</span>`:'';}).join('')}</div>`;
  }
  function huntButton(label,action,disabled=false){return btn(`<img src="assets/visual/hud/icon-find-enemy.webp" alt=""><span>${label}</span>`,action,{},disabled,'class="dungeon-hunt"');}
  function toolbar(){
    const entry=E.current(state),h=state.party.find(x=>x.id===entry?.id)||state.party.find(x=>x.id===state.lastAction?.actorId)||state.party.find(controls)||state.party[0];if(!h)return '';
    const own=entry?.side==='hero'&&controls(h)&&!visualBusy,skills=E.available(state,h,state.enemies.find(e=>e.id===inspected&&e.hp>0)||state.enemies.find(e=>e.hp>0));
    const targetText=selected?selected.side==='enemy'?'Escolha o inimigo.':selected.side==='ally'?'Escolha o aliado.':selected.side==='self'?'Usar no próprio herói.':selected.side==='party'?'Aplicar no grupo.':'Atingir todos os inimigos.':'Selecione uma ação e depois o alvo.';
    const restricted=h.effects.forcedBasicTurns>0,basicCost=h.class==='Mago'?Math.floor(3+.1*h.level)*3:0;
    return `<section class="rogue-command"><div class="rogue-command-grid"><div class="rogue-potion-slot">${btn('<img src="assets/visual/hud/icon-potion.webp" alt=""><span>Itens</span>','items',{},!own||restricted)}</div><div class="rogue-skills">${btn(`<kbd>1</kbd><img src="${getSkillSpritePath(null,h.class)}" alt=""><span>Ataque básico</span><small>${basicCost} MP</small>`,'select',{kind:'basic'},!own||h.mp<basicCost,`class="rogue-basic ${selected?.kind==='basic'?'selected':''}" aria-label="Ataque básico" data-tip="${esc(E.withHero(state,h,state.enemies.find(e=>e.hp>0),()=>getBasicAttackTooltip()))}"`)}${skills.map((k,i)=>btn(`<kbd>${i+2<=9?i+2:''}</kbd><img src="${getSkillSpritePath(k,h.class)}" alt=""><span>${esc(k.name)}</span><small>${k.effectiveCost} MP</small>`,'select',{kind:'skill',skill:k.type},!own||!!k.blockedReason,`class="rogue-skill ${selected?.skillType===k.type?'selected':''}" data-tip="${esc(k.description+'\n'+R.targetDescription(k)+(k.blockedReason?'\n'+k.blockedReason:''))}" aria-label="${esc(k.name)}"`)).join('')}</div><div class="rogue-utilities">${btn('Encerrar turno','pass',{},!own||restricted)}</div></div><div class="rogue-passives">${passives(h)}</div><div class="rogue-target-prompt" role="status"><div>${selected?'<strong>'+esc(selected.label)+'</strong>':''}<p>${own?targetText:entry?.side==='enemy'?'Os inimigos estão agindo…':'Aguarde '+esc(h.characterName)+'.'}</p></div>${selected?btn('Cancelar','cancel'):''}${selected&&['self','party','enemies'].includes(selected.side)?btn('Confirmar','confirm'):''}</div></section>`;
  }
  function postBattle(){const cave=state.phase==='cave_pause',blocked=!isLeader()||state.party.some(h=>E.classChoices(h).length||(h.pendingAttributePoints||0)>0)||!cave&&state.party.some(h=>h.place!=='hunt');return `<div class="dungeon-recovery">${huntButton(cave?'Próximo combate':'Próxima caçada',cave?'caveNext':'nextHunt',blocked)}</div>${subclasses()}`;}
  function battleView(){const fighting=state.phase==='battle',region=state.battleRegion||state.biomes[state.act];return `<section class="rogue-battle-scene" style="background-image:url('assets/visual/backgrounds/regions/${slug(region)}.webp')" aria-label="Campo de combate"><div class="rogue-enemies">${fighting?state.enemies.filter(e=>e.hp>0).map(enemyCard).join(''):''}</div><div class="rogue-party">${state.party.map(h=>heroCard(h,true)).join('')}</div></section>${chronicleView()}${fighting?toolbar():postBattle()}${itemMenu?itemPicker():''}`;}

function allocationView(){return state.party.filter(h=>controls(h)&&(h.pendingAttributePoints||0)>0).slice(0,1).map(h=>`<section class="rogue-panel dungeon-allocation"><h3>${esc(h.characterName)} · ${h.pendingAttributePoints} ponto(s) de atributo</h3><div>${[['strength','Força'],['vitality','Vitalidade'],['wisdom','Sabedoria']].map(([key,name])=>`<label>${name}<input data-allocation="${h.id}" data-attribute="${key}" type="number" min="0" max="${h.pendingAttributePoints}" value="0"></label>`).join('')}</div>${btn('Confirmar distribuição','allocate',{hero:h.id})}</section>`).join('');}
function subclasses(){return allocationView()+state.party.filter(h=>E.classChoices(h).length).map(h=>`<section class="rogue-panel"><h3>${esc(h.characterName)} · Especialização</h3>${E.classChoices(h).map(c=>btn(esc(c.name),'subclass',{hero:h.id,id:c.id},!controls(h))).join('')}</section>`).join('');}
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
function render(){tip.hidden=true;const mode=state.phase;const body=`${mode==='lobby'?lobbyView():mode==='hub'?hubView():mode==='battle'?battleView():mode==='cave_pause'?battleView():mode==='ended'?`<section class="rogue-panel"><h1>${state.outcome==='victory'?'Jornada concluída':'Fim da jornada'}</h1><p>${state.battleNumber} batalhas · ${state.bosses} chefes vencidos.</p>${btn('Novo grupo','newRun')}</section>`:encounterView()}${mode!=='lobby'&&statusMessage?'<p role="status">'+esc(statusMessage)+'</p>':''}${mode!=='lobby'&&net.info.mode==='guest'&&!net.info.connected?btn('Reconectar','reconnect'):''}`;root.innerHTML=!['lobby','ended'].includes(mode)?baseUI.shell(body):body;baseUI.sync();}
function selectAction(d){const h=state.party.find(p=>p.id===E.current(state)?.id);if(!controls(h)||visualBusy)return;if(d.kind==='skill'){const k=E.available(state,h).find(k=>k.type===d.skill);if(!k||k.blockedReason)return;selected={kind:'skill',heroId:h.id,skillType:k.type,side:k.target,label:k.name};}else selected={kind:'basic',heroId:h.id,side:'enemy',label:'Ataque básico'};render();}
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
case 'visit':baseUI.close();send({kind:a,heroId:hero,place:d.place});break;case 'allocate':{const points=Object.fromEntries([...document.querySelectorAll('[data-allocation="'+hero+'"]')].map(i=>[i.dataset.attribute,Number(i.value)]));send({kind:'allocate',heroId:hero,points});break;}case 'ready':case 'rest':case 'hunt':case 'nextHunt':case 'caveNext':case 'leaveEncounter':case 'pass':send({kind:a,heroId:hero});break;case 'equip':case 'sell':case 'upgrade':send({kind:a,heroId:hero,uid:d.uid});break;case 'unequip':send({kind:a,heroId:hero,slot:d.slot});break;case 'buy':send({kind:a,heroId:hero,offerId:d.id});break;case 'bet':case 'skipBet':send({kind:'bet',heroId:hero,amount:a==='skipBet'?0:Number(document.getElementById('betValue').value)});break;case 'subclass':send({kind:a,heroId:hero,choiceId:d.id});break;case 'offerTrade':send({kind:a,heroId:hero,targetId:document.getElementById('tradeTarget').value,uid:document.getElementById('tradeItem').value,coins:Number(document.getElementById('tradeCoins').value)});break;case 'acceptTrade':case 'rejectTrade':case 'cancelTrade':send({kind:a,heroId:hero,tradeId:d.id});break;case 'select':selectAction(d);break;case 'cancel':selected=null;render();break;case 'confirm':if(selected)send({...selected,targetId:selected.side==='self'?selected.heroId:undefined});break;case 'hero':case 'enemy':if(selected&&(a==='hero'&&selected.side==='ally'||a==='enemy'&&selected.side==='enemy'))send({...selected,targetId:d.id});else inspect(d.id,a);break;case 'inspect':inspect(d.id,'hero');break;case 'items':itemMenu=!itemMenu;render();break;case 'closeItems':itemMenu=false;render();break;case 'campItems':activeHero=hero;itemMenu=true;render();break;case 'potionSelect':{const h=state.party.find(p=>p.id===hero),i=h.inventory.find(i=>i.uid===d.uid);if(state.phase!=='battle')send({kind:'potion',heroId:hero,uid:i.uid,targetId:hero});else{selected={kind:'potion',heroId:hero,uid:i.uid,side:'ally',label:i.name};itemMenu=false;render();}break;}case 'potionSelf':send({kind:'potion',heroId:hero,uid:d.uid,targetId:hero});break;case 'closeModal':baseUI.close();document.getElementById('rogueDialog').close();break;case 'abandon':if(confirm('Encerrar esta jornada?'))send({kind:'abandon'});break;case 'newRun':net.close();clearTimeout(enemyTimer);enemyTimer=null;state=E.lobby(Date.now().toString(36));render();break;}}
function inspect(id,side){baseUI.close();const h=state.party.find(p=>p.id===id),e=state.enemies.find(p=>p.id===id),dialog=document.getElementById('rogueDialog');dialog.innerHTML=btn('Fechar','closeModal')+(h?`<h2>${esc(h.characterName)}</h2><p>${esc(heroTitle(h))} · Nv.${h.level} · ${h.coins} moedas · XP ${h.xp}/${100+(h.level-1)*25+Math.floor(h.level*h.level*1.5)}</p><dl>${Object.entries(E.stats(state,h)).filter(([k])=>['maxHp','maxMp','attack','power','crit','manaRegen','armor'].includes(k)).map(([k,v])=>'<dt>'+esc({maxHp:'Vida',maxMp:'Mana',attack:'Ataque',power:'Poder',crit:'Crítico',manaRegen:'Mana por turno',armor:'Resistência'}[k])+'</dt><dd>'+esc(k==='crit'?pct(v):v)+'</dd>').join('')}</dl><div class="rogue-passives">${passives(h)}</div>`:e?`<h2>${esc(e.name)}</h2><p>${e.hp}/${e.maxHp} HP · ${e.attack} ataque</p><p>${esc(E.enemyIntent(state,e).name)}</p>`:'');dialog.showModal();}
document.addEventListener('click',e=>{if(e.target.closest('a[href="index.html"]'))queuePageMode('resume');const b=e.target.closest('[data-action]');if(b&&!b.disabled)click(b.dataset.action,b.dataset).catch(e=>message(e.message));});document.addEventListener('input',e=>{
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
document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||document.getElementById('rogueDialog').open)return;if(e.key==='Escape'){selected=null;itemMenu=false;render();}if(/^[1-9]$/.test(e.key)&&state.phase==='battle'){const h=state.party.find(p=>p.id===E.current(state)?.id);if(h&&controls(h)){const k=E.available(state,h)[Number(e.key)-2];if(e.key==='1')selectAction({kind:'basic'});else if(k)selectAction({kind:'skill',skill:k.type});}}if(e.key==='Enter'&&selected&&['self','party','enemies'].includes(selected.side))click('confirm',{});});
function showTip(e){const el=e.target.closest?.('[data-tip]');if(!el){tip.hidden=true;return;}tip.textContent=el.dataset.tip;tip.hidden=false;const r=el.getBoundingClientRect(),b=tip.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(innerWidth-b.width-8,r.left))+'px';tip.style.top=Math.max(8,r.top-b.height-8)+'px';}document.addEventListener('pointerover',showTip);document.addEventListener('focusin',showTip);document.addEventListener('pointerout',()=>tip.hidden=true);window.addEventListener('beforeunload',persist);
const baseUI=DungeonBaseUI.create({state:()=>state,active:()=>activeHero,setActive:id=>activeHero=id,controls,isLeader,localId,esc,btn,figure,heroTitle,itemText,send,render,inspect,leave(){persist();queuePageMode('resume');net.close();window.location.href='index.html';},selectPotion(heroId,uid){selected={kind:'potion',heroId,uid,side:'ally',label:'Usar poção'};render();}});
window.RogueApp={state:()=>E.copy(state),network:net,send,render,load(s){if(!E.validState(s))throw Error('Estado inválido');commit(E.copy(s));}};render();
})();
