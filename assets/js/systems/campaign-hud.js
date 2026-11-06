/* Campaign presentation. Combat, economy and save rules stay in their existing systems. */
const CampaignHUD = (() => {
  'use strict';
  const art = 'assets/visual/hud/';
  const state = { contractNotices: [], chestSummary: '', bag: false, quickItems: false, region: null, slot: 'weapon', upgrade: null, item: null, contractTab: 'active', contract: null, dialog: null, opener: null };
  let mounted = false;
  let characterId = null;
  const esc = value => escapeHtml(String(value ?? ''));
  const displayText = value => String(value ?? '').replace(/\bFolego\b/g,'Fôlego').replace(/\bEsbarrao\b/g,'Esbarrão').replace(/\bMisseis Magicos\b/g,'Mísseis Mágicos').replace(/\bRaizes\b/g,'Raízes').replace(/\bDOT\b/g,'dano periódico').replace(/\bmaxima\b/g,'máxima').replace(/\bperiodico\b/g,'periódico').replace(/\bpecas\b/g,'peças').replace(/\bbonus\b/g,'bônus').replace(/\bCabeca\b/g,'Cabeça').replace(/\bPes\b/g,'Pés').replace(/\bacoes\b/g,'ações').replace(/\bproxima\b/g,'próxima').replace(/\bBaus\b/g,'Baús').replace(/\bConsumiveis\b/g,'Consumíveis');
  const text = value => esc(displayText(value));
  const image = (name, cls = '', alt = '') => `<img class="${cls}" src="${art}${name}.webp" alt="${esc(alt)}" draggable="false">`;
  const button = (label, action, value = '', options = '') => `<button type="button" data-hud="${action}" data-value="${esc(value)}" ${options}>${label}</button>`;
  const enabled = () => typeof player !== 'undefined' && !!player && !IS_DUNGEON_PAGE && !IS_ARENA_PAGE;
  const locked = () => isProcessingTurn || isDead || player.hp <= 0;
  const progressionPending = () => levelUpPoints>0||Object.values(allocation).some(value=>Number(value)>0)||needsSubclassChoice();
  const pageTitle = () => currentMode === 'battle' ? currentRegion : currentMode === 'camp' ? 'Personagem' : currentMode === 'village' ? ({artisan:'Oficina',forge:'Oficina',inn:'Pousada',alchemist:'Alquimista',mercenary:'Mercenário'}[villageTab]) : ({bestiary:'Bestiário',trophies:'Sala de troféus',arena:'Portal da arena',dungeon:'Portal da dungeon'}[currentMode] || 'Aventura');
  const money = () => `<span class="rpg-coins" tabindex="0" aria-label="${player.coins.toLocaleString('pt-BR')} moedas" data-hud-description="${player.coins.toLocaleString('pt-BR')} moedas"><img class="rpg-coin-icon" src="assets/visual/hud/icon-coin.webp" alt=""><span>${formatCoinAmount(player.coins)}</span></span>`;
  const itemArt = item => {
    if(item?.type !== 'equipment') return getInventoryItemSymbol(item);
    if(item.slot==='accessory')return getInventoryItemSymbol(item);
    return `<img class="rpg-item-art" src="${esc(getItemSpritePath(item))}" alt="${esc(item.name||'Equipamento')}" draggable="false">`;
  };
  const slotArt = slot => slot==='accessory'?image('icon-holy','rpg-item-art'):itemArt({type:'equipment',slot,classRestriction:player.class,regionName:state.region||currentRegion});
  const flashes = item => !!item && inventoryFlash.result==='success' && (item.uid===inventoryFlash.uid || item.id===inventoryFlash.id);
  function mount(){
    if(mounted) return;
    const game = document.getElementById('game');
    const log = document.getElementById('log');
    const level = document.getElementById('levelUpPanel');
    game.innerHTML = `<div id="campaignHud" class="game-layout rpg-layout">
      <header class="rpg-top"><div class="rpg-location"><h1 id="rpgTitle"></h1></div></header>
      <div class="rpg-world-layout">
        <aside class="rpg-locations-rail"><nav id="modeTabs" aria-label="Locais da campanha"></nav><footer id="rpgOptions"></footer></aside>
        <main id="rpgMain"><section id="enemyInfo"></section><div id="rpgPassives" class="rpg-combat-passives" aria-label="Passivas do personagem"></div><div id="rpgChronicle" class="rpg-chronicle" aria-live="polite"></div><div id="actions"></div></main>
        <aside class="rpg-regions-rail"><section id="regionInfo" class="rpg-world-map" aria-label="Mapa de regiões"></section><div id="rpgTowerButton"></div><div id="rpgBagButton"></div><div id="rpgAccount"></div></aside>
      </div>
      <div id="playerInfo" hidden></div><div id="heroPortraitPanel" hidden></div>
      <dialog id="rpgLevelDialog" aria-label="Evolução do personagem"><div id="rpgLevelMount"></div></dialog><dialog id="rpgDialog" aria-labelledby="rpgDialogTitle"><header><h2 id="rpgDialogTitle"></h2><button type="button" data-hud="close-dialog" aria-label="Fechar janela">Fechar ×</button></header><div id="rpgDialogContent"></div><section id="logPanel" hidden><div id="rpgLogMount"></div></section><section id="inventoryInfo" hidden></section></dialog>
    </div>`;
    document.getElementById('rpgLogMount').append(log);
    document.getElementById('rpgLevelMount').append(level);
    document.getElementById('campaignHud').addEventListener('click', onClick);
    const dialog = document.getElementById('rpgDialog');
    dialog.addEventListener('click', event => { if(event.target === dialog){ const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) closeDialog(); } });
    dialog.addEventListener('close', () => { if(dialog.open)return; state.bag=false;state.dialog=null; if(state.opener?.isConnected) state.opener.focus(); });
    document.getElementById('rpgLevelDialog').addEventListener('cancel',event=>{if(progressionPending())event.preventDefault();});
    mounted = true;
  }
  function nav(){
    document.getElementById('modeTabs').innerHTML = renderLocationMapNavigation().replace(/onclick="setMode\('([^']+)'\)"/g, 'data-hud="navigate" data-value="$1"');
    document.getElementById('rpgTowerButton').innerHTML=button('Torre de Desafios','tower','',`class="rpg-tower-button" ${isChallengeTowerUnlocked()?'':'disabled'} data-hud-description="${isChallengeTowerUnlocked()?'12 chefes em sequência · Nv.120':'Vença o último chefe do Paradoxo para liberar.'}"`);
    document.getElementById('rpgOptions').innerHTML=button('Opções','settings');
    document.getElementById('rpgBagButton').innerHTML=button(image('icon-bag-button'),'navigate','bag','aria-label="Abrir bolsa" data-hud-description="Bolsa"');
  }
  function render(){
    if(!enabled()) return false;
    if(characterId!==player.characterId){state.chestSummary='';state.bag=false;state.quickItems=false;state.item=null;state.region=null;state.upgrade=null;characterId=player.characterId;}
    mount(); document.body.classList.add('rpg-playing');
    if(typeof hideTrophyCategoryPopup==='function')hideTrophyCategoryPopup();
    const root=document.getElementById('campaignHud');
    root.dataset.mode=currentMode;root.dataset.service=villageTab;
    document.getElementById('rpgTitle').textContent=pageTitle();
    document.getElementById('rpgAccount').innerHTML=money()+(getLuckBattles()>0?`<span class="rpg-luck-status" tabindex="0" data-hud-description="Sorte: +40% de chance de drop. ${getLuckBattles()} batalha(s) restantes.">Sorte · ${getLuckBattles()} batalha(s)</span>`:'')+(player.expedition?button('Expedição: '+player.expedition.region+' - recolher','expedition-stop','', 'class="rpg-expedition-status"'):'')+(isDead?button(Math.max(0,Math.ceil((deadUntil-Date.now())/1000))?'Renascer em '+Math.max(0,Math.ceil((deadUntil-Date.now())/1000))+'s':'Renascer','respawn','',`class="rpg-death-return" ${Date.now()<deadUntil?'disabled':''}`):'')+(isCampResting()?button(`Descansando · ${Math.ceil(player.hp)} / ${getCurrentCaps().maxHp} vida`,'rest-camp','',`class="rpg-rest-indicator" data-hud-description="Volte ao acampamento e clique em Levantar antes de combater."`):'');
    const panel=document.getElementById('enemyInfo');
    panel.className='rpg-content';
    panel.innerHTML=currentMode==='battle'?renderBattle():currentMode==='village'?renderVillage():currentMode==='camp'?renderCharacter():currentMode==='bestiary'?`<section class="rpg-journal rpg-bestiary"><aside class="rpg-bestiary-map"><h2>Regi&otilde;es</h2>${renderBestiaryRegionMapCard(getSelectedBestiaryRegion(),isBestiaryDevUnlocked())}</aside><div class="rpg-bestiary-entries">${renderBestiary()}</div></section>`:currentMode==='trophies'?`<section class="rpg-journal">${renderTrophySummaryPanel()}${renderTrophyGroups()}</section>`:renderPortal();
    if(currentMode==='battle'){refreshContractDock();dockVitals();if(typeof CharacterMotion!=='undefined')CharacterMotion.prepare(getSkillInfo());}
    document.getElementById('regionInfo').innerHTML=renderRegionMapCard().replace(/<p class="map-current-label">[\s\S]*?<\/p>/,`<p class="rpg-map-caption">${esc(currentRegion)}</p>`);
    const rack=root.querySelector('.rpg-upgrade-rack');if(rack)rack.scrollTop=state.rackScroll||0;
    renderActions(); renderLevelUpPanel(); animateBars(); nav(); syncChronicle();
    for(const control of root.querySelectorAll('button[data-tooltip]:not([aria-label])'))control.setAttribute('aria-label',control.textContent.trim());
    if(currentMode!=='battle'&&!progressionPending()) document.getElementById('levelUpPanel').style.display='none';
    const levelDialog=document.getElementById('rpgLevelDialog');
    if(progressionPending()){if(document.getElementById('rpgDialog').open)closeDialog();if(!levelDialog.open){levelDialog.showModal();raiseGameNotice();}}else if(levelDialog.open)levelDialog.close();
    if(state.bag&&document.getElementById('rpgDialog').open)document.getElementById('rpgDialogContent').innerHTML=renderBag();
    return true;
  }
  function renderBattle(){
    const progress=getBossUnlockProgress(currentRegion);
    const title=`${getDisplayedClassName()} · Nv. ${player.level}`;
    return `<section class="rpg-battle ${enemy?.isBoss?'is-boss':''}"><div class="rpg-battle-banner"><span>${isDead?'Derrotado':isCampResting()?'Descansando':levelUpPoints>0?'Evolução pendente':needsSubclassChoice()?'Escolha sua subclasse':isProcessingTurn?'Turno em andamento':enemy?'Sua vez':'Exploração'}</span></div>
      <aside class="rpg-quest" style="--boss-progress:${Math.round(360*Math.min(1,Math.max(0,progress.defeated/Math.max(1,progress.total))))}deg" aria-label="Rastreador da região" data-state="${enemy?.isBoss?'fighting':progress.unlocked?'ready':'tracking'}"><span class="rpg-boss-seal" role="img" aria-label="${text(regions[currentRegion].boss.name)}: ${progress.defeated} de ${progress.total} criaturas vencidas"><img src="assets/visual/bosses/${slugify(regions[currentRegion].boss.name)}.webp?v=20261029" alt="" width="64" height="64"></span>${renderTracker(progress)}</aside>
      <aside id="rpgContractDock" class="rpg-contract-tracker" aria-label="Contrato do mercenário"></aside>
      ${renderCombatScene(enemy,enemy?.challengeTowerFloor!==undefined?enemy.region:currentRegion)}
      <div class="rpg-vital-dock"><section class="rpg-hero-plate"><div><strong>${esc(title)}</strong><div id="rpgHeroVitals"></div></div></section>${enemy?`<section class="rpg-enemy-plate"><div><button class="rpg-target-name" data-hud="target">${esc(enemy.name)}</button><div id="rpgEnemyVitals"></div><div class="enemy-status-list">${getEnemyStatusEffects(enemy).map(effect=>`<span tabindex="0" class="enemy-status-pill ${effect.kind}" data-hud-description="${esc(effect.details||effect.text)}">${text(effect.text)}</span>`).join('')}</div></div></section>`:`<section class="rpg-expedition-note"><span>${esc(regions[currentRegion].description)}</span></section>`}</div>
    </section>`;
  }
  let contractNoticeTimer=null;
  function refreshContractDock(){
    clearTimeout(contractNoticeTimer);
    if(!player){state.contractNotices=[];return;}
    state.contractNotices=state.contractNotices.filter(n=>n.characterId===player.characterId&&n.expiresAt>Date.now());
    const dock=document.getElementById('rpgContractDock'),notice=state.contractNotices[0];
    if(notice)contractNoticeTimer=setTimeout(refreshContractDock,Math.max(1,notice.expiresAt-Date.now()));
    if(!dock)return;
    const quests=[...(player.mercenary?.active||[])].sort((a,b)=>b.progress/b.count-a.progress/a.count||(a.count-a.progress)-(b.count-b.progress));
    const quest=quests[0];
    const content=notice?`<strong>Contrato concluído!</strong><span>${text(notice.name)}</span><small>${text(notice.reward)}</small>`:quest?`<strong>Contrato mais próximo</strong><span>${text(quest.targetName)}</span><small>${text(quest.targetRegion)} · ${quest.progress} / ${quest.count}</small><progress value="${quest.progress}" max="${quest.count}" aria-label="Abates do contrato"></progress>`:'<strong>Sem contrato ativo</strong><span>Busque um contrato</span><small>Visitar o mercenário</small>';
    dock.classList.toggle('is-complete',!!notice);
    dock.innerHTML=button(content,'mercenary','',`aria-label="${notice?'Contrato concluído':quest?'Ver contratos no mercenário':'Buscar contrato no mercenário'}" ${enemy||isProcessingTurn||(!isDead&&progressionPending())?'disabled':''}`);
  }
  function notifyContractCompleted(quest,reward){
    state.contractNotices=state.contractNotices.filter(n=>n.characterId===player.characterId&&n.expiresAt>Date.now());
    const last=state.contractNotices.at(-1);
    state.contractNotices.push({name:quest.targetName,reward,characterId:player.characterId,expiresAt:Math.max(Date.now(),last?.expiresAt||0)+2500});
    refreshContractDock();
  }
  function showTower(){
    const floors=getChallengeTowerFloors();
    openDialog('tower','Torre de Desafios',`<section class="rpg-tower-lobby"><p>Todos os ${floors.length} chefes no nível 120. Vida e mana não são recuperadas entre andares. Derrota ou fuga encerram a tentativa.</p><p>Melhor resultado: ${Math.min(floors.length,Number(player.stats.towerBest)||0)} / ${floors.length} · Conclusões: ${Number(player.stats.towerCompletions)||0}</p><ol>${floors.map(region=>`<li><strong>${text(regions[region].boss.name)}</strong><span>${text(region)} · Nv.120</span></li>`).join('')}</ol><p>Recompensa final: ${floors.length*(18+120*3)} moedas e um baú do Paradoxo. Os andares não concedem XP ou recompensas da campanha.</p>${button('Iniciar desafio','tower-start','',!isChallengeTowerUnlocked()||enemy||locked()||progressionPending()||isCampResting()||player.expedition?'disabled':'')}</section>`);
  }
  function renderTracker(progress){
    if(enemy?.challengeTowerFloor!==undefined)return `<strong>Torre de Desafios</strong><span>Andar ${enemy.challengeTowerFloor+1} / ${getChallengeTowerFloors().length} · Nv.120</span>${button('Analisar chefe','target')}`;
    if(enemy?.isBoss) return `<strong>Confronto com o chefe</strong><span>${esc(enemy.name)}</span>${button('Analisar chefe','target')}`;
    if(player.stats.regionBossKills?.[currentRegion] > 0){
      const hunt=CreatureTracking.active(),here=hunt?.region===currentRegion;
      return `<strong>${here?'Criatura rastreada':'Rastreador da região'}</strong><span>${here?`${text(hunt.name)} · ${Math.ceil((hunt.expiresAt-Date.now())/60000)} min`:'Chefe já derrotado'}</span>${button(here?'Trocar rastreamento':'Rastrear criatura','tracking','',enemy||locked()||progressionPending()?'disabled':'')}`;
    }
    return `<strong>${progress.unlocked?'Chefe localizado':'Rastro do chefe'}</strong><span>${progress.defeated} / ${progress.total} criaturas vencidas</span><progress max="${Math.max(1,progress.total)}" value="${progress.defeated}" aria-label="Criaturas diferentes vencidas para liberar o chefe"></progress>${progress.unlocked?'<span>Enfrente o chefe pelo mapa.</span>':`<div class="rpg-clues"><button type="button" aria-describedby="rpgBossClues">Ver rastros</button><div id="rpgBossClues" role="tooltip" class="rpg-clues-popup"><strong>Criaturas que faltam</strong><ul>${(progress.missing||[]).map(name=>'<li>'+text(name)+'</li>').join('')}</ul></div></div>`}`;
  }
  function showTracking(){
    if(!(player.stats.regionBossKills?.[currentRegion]>0)||enemy||locked()||progressionPending())return;
    const hunt=CreatureTracking.active();
    openDialog('tracking',`Rastrear em ${currentRegion}`,`<p>Escolha uma criatura: durante 6 minutos, ela terá pelo menos 90% de chance de aparecer nesta região. O preço aumenta com o nível e a raridade.</p>${hunt?`<p>Ativo: ${text(hunt.name)} em ${text(hunt.region)}. Uma nova contratação substitui o rastreamento atual.</p>`:''}<div class="rpg-tracking-list">${regions[currentRegion].enemies.map(e=>{const offer=CreatureTracking.offer(e.name);return `<article><h3>${text(e.name)} · Nv. ${e.level}</h3><p>6 minutos · pelo menos 90% de chance</p>${button(`Rastrear · ${offer.cost} moedas`,'buy-tracking',e.name,player.coins<offer.cost?'disabled':'')}</article>`;}).join('')}</div>`);
  }
  function dockVitals(){
    for(const [kind, target] of [['hero','rpgHeroVitals'],['enemy','rpgEnemyVitals']]){
      const source=document.querySelector(`#enemyInfo .battle-scene .scene-vitals-${kind}`),dock=document.getElementById(target);
      if(source&&dock) dock.append(source);
      if(dock)for(const label of dock.querySelectorAll('.scene-vital-text'))label.textContent=label.textContent.replace(/\//g,' / ');
    }
    const dock=document.querySelector('.rpg-vital-dock');if(!dock)return;
    const bounds=dock.getBoundingClientRect();
    for(const kind of ['hero','enemy']){
      const entity=document.getElementById(kind+'SpriteBox'),plate=document.querySelector('.rpg-'+kind+'-plate');
      if(entity&&plate){const r=entity.getBoundingClientRect();plate.style.left=(r.left+r.width/2-bounds.left)+'px';}
    }
  }
  window.addEventListener('resize',()=>{if(enabled()&&currentMode==='battle')dockVitals();});
  const skillArt = skill => `<img src="${esc(getSkillSpritePath(skill))}" alt="" draggable="false">`;
  function renderActions(){
    if(!enabled()||!mounted) return false;
    const area=document.getElementById('actions');
    if(currentMode!=='battle'||!enemy||locked()||progressionPending())state.quickItems=false;
    area.className='rpg-actions';
    const passiveDock=document.getElementById('rpgPassives');if(passiveDock)passiveDock.innerHTML=currentMode==='battle'&&enemy?renderCombatPassives():'';
    if(currentMode!=='battle'){area.innerHTML='';return true;}
    if(player.expedition){area.innerHTML='<div class="rpg-recovery"><p>Em expedi&ccedil;&atilde;o: '+text(player.expedition.region)+' - '+player.expedition.encounters+' encontros, '+player.expedition.coins+' moedas, '+player.expedition.drops+' materiais.</p>'+button('Recolher personagem','expedition-stop')+'</div>';return true;}
    if(isDead){const seconds=Math.max(0,Math.ceil((deadUntil-Date.now())/1000));area.innerHTML=`<div class="rpg-recovery">${button(seconds?`Renascer em ${seconds}s`:'Renascer','respawn','',seconds?'disabled':'')}${button('Reiniciar aventura','restart')}</div>`;return true;}
    if(!enemy){
      const chances=getRegionSpawnPreview(currentRegion).map(e=>`${e.name}: ${e.chance.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`).join('\n');
      area.innerHTML=isCampResting()?`<div class="rpg-recovery">${button('Descansando','rest-camp')}</div>`:`<div class="rpg-recovery">${button(`${image('icon-find-enemy')}<span>Procurar inimigo</span><span class="rpg-hotkey" aria-hidden="true">1</span>`,'find','',`class="rpg-find" data-hud-hotkey="1" aria-keyshortcuts="1" data-hud-description="${esc(`Encontros em ${currentRegion}\n${chances}`)}" ${locked()||progressionPending()?'disabled':''}`)}</div>`;return true;
    }
    const skills=getSkillInfo(),busy=locked()||progressionPending();
    const basicCost=player.class==='Mago'?Math.floor(3+.1*player.level)*3:0;
    const skillButtons=skills.map((skill,index)=>{const available=getSkillActionState(skill),blocked=busy||!available.canUse||playerEffects.forcedBasicTurns>0;return button(`${skillArt(skill)}<strong>${text(skill.name)}</strong><small>${available.manaCost} mana${skill.hpCostPercent?' · vida':''}</small><span class="rpg-hotkey">${index+2<=9?index+2:''}</span>`,'skill',index,`class="rpg-ability" data-hud-hotkey="${index+2}" data-hud-description="${esc(getSkillReadout(skill))}" ${blocked?'disabled':''} aria-label="${text(skill.name)}, ${available.manaCost} de mana${blocked?', indisponível':''}"`);}).join('');
    const breakChoices=skills.filter(skill=>skill.canBreakControl&&getSkillActionState(skill).canUse).map(skill=>text(skill.name));
    const controlWarning=playerEffects.skipNextTurn&&!(playerEffects.controlImmuneTurns>0)?`<p class="rpg-control-warning">Turno bloqueado: ${breakChoices.length?'use '+breakChoices.join(' ou ')+', ou encerre o turno.':'encerre o turno.'}</p>`:'';
    area.innerHTML=`${controlWarning}<div class="rpg-command-belt"><div class="rpg-potion-slot">${button(`${image('icon-potion')}<span>Itens</span>`,'consumables','',`aria-expanded="${state.quickItems}" aria-controls="rpgQuickItems" ${busy?'disabled':''}`)}${state.quickItems?renderQuickItems():''}</div><div class="rpg-ability-list">${button(`${skillArt(null)}<strong>${text(getBasicAttackLabel())}</strong><small>${basicCost} mana</small><span class="rpg-hotkey">1</span>`,'attack','',`class="rpg-ability" data-hud-hotkey="1" data-hud-description="${esc(getBasicAttackTooltip())}" ${busy||player.mp<basicCost?'disabled':''}`)}${skillButtons}</div><div class="rpg-turn-actions">${button('Encerrar turno','pass','',busy?'disabled':'')}${button('Fugir','flee','',`data-tooltip="Custa ${getFleeCost()} moedas. Encerra a batalha sem recompensas.${player.coins<getFleeCost()?' Moedas insuficientes.':''}" aria-description="Fugir custa ${getFleeCost()} moedas e encerra a batalha sem recompensas." ${busy?'disabled':''}`)}</div></div>`;
    if(state.quickItems){
      document.getElementById('rpgQuickItems').showPopover();positionQuickItems();
    }
    return true;
  }
  function renderQuickItems(){
    const items=player.inventory.filter(item=>item.type==='consumable'&&(item.qty||0)>0&&consumableCatalog[item.id]);
    return `<div id="rpgQuickItems" popover="manual" role="group" aria-label="Itens disponíveis para usar">${items.length?items.map(item=>button(`${itemArt(item)}<span>×${item.qty}</span>`,'quick-use',item.uid,`class="rpg-quick-item" aria-label="Usar ${text(item.name)}" data-hud-description="${esc(`${item.name}\n${consumableCatalog[item.id].description}`)}"`)).join(''):'<p>Nenhum consumível na bolsa.</p>'}</div>`;
  }
  function closeQuickItems(){if(state.quickItems){state.quickItems=false;renderActions();}}
  function positionQuickItems(){
    const popup=document.getElementById('rpgQuickItems'),button=document.querySelector('[data-hud="consumables"]');
    if(!popup?.matches(':popover-open')||!button)return;
    const anchor=button.getBoundingClientRect(),r=popup.getBoundingClientRect();
    popup.style.left=Math.max(8,Math.min(innerWidth-r.width-8,anchor.left))+'px';
    popup.style.top=Math.max(8,Math.min(innerHeight-r.height-8,anchor.top-r.height-8))+'px';
  }
  function syncChronicle(){
    if(!mounted) return;
    const last=document.getElementById('log')?.lastElementChild?.textContent||'Uma nova jornada começa.';
    const box=document.getElementById('rpgChronicle');
    box.hidden=currentMode!=='battle';
    box.replaceChildren();const span=document.createElement('span');span.textContent=last;box.append(span);
    box.insertAdjacentHTML('beforeend',button('Histórico','history'));
  }
  function serviceNav(){
    return `<nav class="rpg-service-nav" aria-label="Serviços da aldeia">${[['artisan','Ferreiro'],['inn','Pousada'],['mercenary','Mercenário'],['alchemist','Alquimista']].map(([id,label])=>button(label,'service',id,`aria-pressed="${villageTab===id||(id==='artisan'&&villageTab==='forge')}"`)).join('')}</nav>`;
  }
  function innMeter(label,value,max,kind){return `<div class="rpg-inn-meter ${kind}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><i style="width:${Math.max(0,Math.min(100,100*value/max))}%"></i><span>${label} · ${Math.ceil(value)} / ${max}</span></div>`;}
  function renderVillage(){
    if(villageTab==='artisan'||villageTab==='forge') return serviceNav()+renderWorkshop();
    if(villageTab==='mercenary') return serviceNav()+renderMercenary();
    if(villageTab==='alchemist') return serviceNav()+`<section class="rpg-village-interior rpg-alchemy"><div class="rpg-service-copy"><h2>Poções e preparados</h2><p>Prepare seus consumíveis antes de voltar à trilha.</p></div><div class="rpg-shop">${renderActionFeedback('village')}${renderAlchemistPanel({compact:true})}</div></section>`;
    const bothCost=getHealCost()+getManaHealCost();
    const caps=getCurrentCaps(),busy=locked();
    const healCard=(label,kind,cost,action)=>button(label+' - '+cost+' moedas',action,'',busy||!cost||player.coins<cost?'disabled':'');
    return serviceNav()+`<section class="rpg-village-interior rpg-inn-interior"><div class="rpg-inn-vendor"><img src="assets/visual/hud/inn-vendor.webp" alt="Vendedor da pousada"></div><div class="rpg-inn rpg-paper"><h2><img class="rpg-inn-title" src="assets/visual/hud/inn-title-rustic.webp" alt="Pousada"></h2><div class="rpg-inn-vitals">${innMeter("Vida",player.hp,caps.maxHp,"hp")}${innMeter("Mana",player.mp,caps.maxMp,"mp")}</div><div class="rpg-inn-services">${healCard('Descanso reparador','hp',getHealCost(),'heal')}${healCard('Recuperar energias','mp',getManaHealCost(),'mana')}${button('Recuperar os dois - '+bothCost+' moedas','heal-both','',busy||!bothCost||player.coins<bothCost?'disabled':'')}</div><section class="rpg-inn-drink"><img src="assets/visual/hud/inn-drink.webp" alt="Bebida Revigorante"><div><h3>Bebida Revigorante</h3><p>Recupera 5% de vida e mana. Agora: ${Math.max(1,Math.floor(caps.maxHp*.05))} HP e ${Math.max(1,Math.floor(caps.maxMp*.05))} MP.</p>${button('Levar uma bebida - '+getInvigoratingDrinkCost()+' moedas','buy-drink','',player.coins<getInvigoratingDrinkCost()||busy?'disabled':'')}</div></section></div></section>`;
  }
  function currentCraft(){
    const unlocked=EquipmentSystem.unlockedRegions(player);
    if(!regions[state.region])state.region=currentRegion;
    return EquipmentSystem.getRecipes(player,{region:state.region,includeLocked:true}).find(recipe=>recipe.slot===state.slot);
  }
  function requirementList(requirements, cost){
    return `<ul class="rpg-materials">${Object.entries(requirements||{}).map(([id,qty])=>{const material=EquipmentSystem.materialById(id),owned=getInventoryCountById(id);return `<li class="${owned>=qty?'material-ready':'material-missing'}"><span class="rpg-material-icon">${getInventoryItemSymbol(material)}</span><span>${esc(material?.name||id)}${material?.regionName?`<small>${esc(material.regionName)}</small>`:''}</span><strong>${owned} / ${qty}</strong></li>`;}).join('')}<li class="${player.coins>=cost?'material-ready':'material-missing'}"><span class="rpg-material-coin" aria-hidden="true"><img class="rpg-coin-icon" src="assets/visual/hud/icon-coin.webp" alt=""></span><span>Moedas</span><strong>${player.coins} / ${cost}</strong></li></ul>`;
  }
  function setSummary(region, count){
    const set=EquipmentData.sets[region];if(!set)return '';
    return `<section class="rpg-set-summary"><h3>${text(set.name)} <span>${count} / 5</span></h3>${[[2,set.two],[4,set.four],[5,set.five]].map(([n,text])=>`<p class="${count>=n?'set-active':''}"><strong>${n} peças:</strong> ${esc(displayText(text))}</p>`).join('')}</section>`;
  }
  function renderWorkshop(){
    const recipe=currentCraft(),upgrading=villageTab==='forge';
    const candidates=[...equipmentSlots.filter(slot=>player.equipment[slot]).map(slot=>({key:slot,item:player.equipment[slot]})),...player.inventory.filter(item=>item.type==='equipment').map(item=>({key:item.uid,item}))];
    const chosen=candidates.find(x=>x.key===state.upgrade)||candidates[0];
    if(chosen)state.upgrade=chosen.key;
    const item=upgrading?EquipmentSystem.normalizeItem(chosen?.item,player):recipe?.result,upgrade=upgrading&&item?EquipmentSystem.getUpgradeRequirements(item,player):null;
    const region=item?.regionName||state.region,requirements=upgrading?upgrade?.requirements:recipe?.requirements,cost=upgrading?upgrade?.cost:recipe?.cost;
    const setCount=EquipmentSystem.getSetBonuses(player).sets.find(set=>set.region===region)?.count||0;
    const slots=upgrading?candidates.map(entry=>button(`${itemArt(entry.item)}<span>${esc(slotLabels[entry.item.slot])}<small>${esc(getRarityInfo(entry.item.rarity).label)}</small></span>`,'upgrade-item',entry.key,`class="rpg-rack-slot" aria-pressed="${entry.key===chosen?.key}" aria-label="Selecionar ${esc(entry.item.name)}"`)).join(''):EquipmentData.slots.map(slot=>button(`${slotArt(slot)}<span>${text(slotLabels[slot])}</span>`,'craft-slot',slot,`class="rpg-rack-slot ${slot===state.slot&&flashes(item)?'rpg-crafted':''}" aria-pressed="${slot===state.slot}"`)).join('');
    const actionable=upgrading?EquipmentSystem.canUpgrade(item,player):recipe&&EquipmentSystem.canCraft(recipe,player);
    const duplicateInfo=upgrade?.duplicate?`<p class="rpg-artifact-copy">Custo adicional: outro ${esc(bossAccessoryProfiles[item.regionName].name)} comum na bolsa — ${EquipmentSystem.duplicateCount(player,item,upgrade)} / 1. A copia sera consumida.</p>`:"";
    return `<div class="rpg-forge-tabs">${button('Fabricar','service','artisan',`aria-pressed="${!upgrading}"`)}${button('Aprimorar','service','forge',`aria-pressed="${upgrading}"`)}</div><section class="rpg-workshop"><aside class="rpg-workshop-map"><button data-hud="craft-map" class="rpg-map-object"><img src="assets/visual/maps/region-map-v2.webp" alt="Mapa de regiões para fabricar equipamentos"><span>${esc(state.region)} · escolher região</span></button>${setSummary(region,setCount)}</aside><section class="rpg-equipment-rack ${upgrading?'rpg-upgrade-rack':''}" aria-label="Escolher equipamento">${slots||'<p>Nenhuma peça para aprimorar.</p>'}</section><section class="rpg-anvil ${!upgrading&&flashes(item)?'rpg-crafted':''}"><h2>${item?text(item.name.replace(/^[^-]+ - /,'').replace(new RegExp(' '+getRarityInfo(item.rarity).label+'$','i'),'')):'Equipe ou fabrique uma peça'}</h2><p>${item?text(slotLabels[item.slot])+' · '+text(item.setName)+' · '+esc(getRarityInfo(item.rarity).label):'Oficina do ferreiro'}</p>${item?itemArt(item):image('item-sword')}<div class="rpg-rarity-path" aria-label="Ordem das raridades">${rarityOrder.map((r,index)=>`<span class="${r===item?.rarity?'current':''}"><i class="rpg-gem rarity-${r}" aria-hidden="true"></i>${esc(getRarityInfo(r).label)}${index<4?' <b>›</b>':''}</span>`).join('')}</div></section><section class="rpg-recipe rpg-paper">${renderActionFeedback('village')}${item?`<h3>${upgrading?upgrade?`${esc(getRarityInfo(item.rarity).label)} → ${esc(getRarityInfo(upgrade.toRarity).label)}`:'Raridade máxima':'Propriedades'}</h3><p class="rpg-item-stats">${formatStatBonusList(item).split(',').map(stat=>'<span>'+text(stat.trim())+'</span>').join('')}</p>${upgrading&&upgrade?`<p class="rpg-upgrade-stats">Após melhorar: ${esc(formatStatBonusList(upgrade.nextItem))}</p>`:''}${!upgrading||upgrade?`${requirementList(requirements,cost)}${duplicateInfo}${button(upgrading?'Melhorar para '+esc(getRarityInfo(upgrade.toRarity).label):'Forjar',upgrading?'upgrade':'craft',upgrading?chosen.key:recipe.id,`class="rpg-primary" ${!actionable||locked()?'disabled':''}`)}<p class="rpg-rule-note ${!upgrading&&EquipmentSystem.ownsRecipeItem(recipe,player)?'rpg-owned-piece':''}">${upgrading?'Melhoria garantida. Uma raridade por vez.':EquipmentSystem.ownsRecipeItem(recipe,player)?'Você já possui esta peça na bolsa ou equipada. Venda para fabricar novamente.':'Resultado: equipamento comum.'}</p>`:'<p>Esta peça já alcançou a última raridade.</p>'}`:'<h3>Sua bancada está vazia</h3><p>Fabrique uma peça comum e equipe na tela do personagem, ou selecione uma peça na bolsa.</p>'}</section></section>`;
  }
  function renderMercenary(){
    const board=EquipmentSystem.refreshContracts(player),remaining=Math.max(0,Math.ceil(((board.boardCycle+1)*EquipmentData.boardIntervalMs-Date.now())/60000));
    const offers=state.contractTab==='active'?board.active:board.offers.filter(q=>!board.active.some(active=>active.id===q.id)&&!board.claimed.includes(q.id));
    return `<section class="rpg-village-interior rpg-mercenary-interior"><div class="rpg-mercenary-vendor"><img src="assets/visual/hud/mercenary-vendor.webp" alt="Mercenário responsável pelos contratos"></div><div class="rpg-mercenary-board"><header><h2>Mercenário</h2><p>Novas ofertas em ${remaining} min · ${board.active.length} / ${EquipmentData.maxActiveContracts} ativos</p></header><div class="rpg-contract-tabs">${button('Em andamento','contract-tab','active',`aria-pressed="${state.contractTab==='active'}"`)}${button('Disponíveis','contract-tab','offers',`aria-pressed="${state.contractTab==='offers'}"`)}</div><div class="rpg-mercenary-list">${offers.map(q=>{
      const reward=EquipmentSystem.materialById(q.rewardId);
      const tip=`Recompensa: ${reward?.name||q.rewardId} ×${q.rewardQty}\n${q.rewardGold} moedas · ${q.rewardXp} XP base\nOrigem do material: ${reward?.regionName||''}`;
      return `<article class="rpg-mercenary-entry">${button(`<strong>Cace ${q.count} ${text(q.targetName)}</strong><span>${text(q.targetRegion)}${state.contractTab==='active'?' · '+q.progress+' / '+q.count:''}</span>`,'contract-reward',q.id,`class="rpg-contract-objective" data-hud-description="${esc(tip)}" aria-label="Cace ${q.count} ${esc(q.targetName)}. Consultar recompensa."`)}${state.contractTab==='active'?button('Abandonar','abandon-confirm',q.id):button('Assinar','accept',q.id,board.active.length>=EquipmentData.maxActiveContracts||locked()?'disabled':'')}</article>`;
    }).join('')||`<p>${state.contractTab==='active'?'Nenhum contrato ativo. Consulte as ofertas disponíveis.':'Sem ofertas nesta rotação.'}</p>`}</div></div></section>`;
  }

  function renderCharacter(){
    if(campTab==='status')campTab='equipamentos';
    const tabs=`<nav class="rpg-character-tabs">${[['equipamentos','Equipamentos'],['habilidades','Habilidades']].map(([id,label])=>button(label,'camp-tab',id,`aria-pressed="${campTab===id}"`)).join('')}</nav>`;
    if(campTab==='habilidades')return tabs+renderSkillBook();

    const investment=getInvestedSummary(),stats=getPreviewStats();
    return tabs+`<section class="rpg-character-sheet"><div class="rpg-paperdoll"><div class="rpg-character-figure">${getHeroSpriteMarkup()}</div><div class="rpg-character-caption"><h2>${esc(getDisplayedClassName())}</h2><span>Nível ${player.level}</span><div class="rpg-camp-rest">${button(isCampResting()?'Levantar':'Descansar','rest','',locked()||enemy?'disabled':'')}<p><span class="rpg-rest-hp">${Math.ceil(player.hp)} / ${stats.maxHp} HP · +${(getCampRestHealing() / (CAMP_REST_INTERVAL_MS / 1000)).toLocaleString('pt-BR',{maximumFractionDigits:2})} HP/s · ${Math.ceil(player.mp)} / ${stats.maxMp} MP · +${(getCampRestManaRecovery() / (CAMP_REST_INTERVAL_MS / 1000)).toLocaleString('pt-BR',{maximumFractionDigits:2})} MP/s</span></p></div></div><div class="rpg-loadout">${equipmentSlots.map(slot=>{const item=player.equipment[slot];return button(`${item?itemArt(item):slotArt(slot)}<span>${text(slotLabels[slot])}<small>${item?esc(getRarityInfo(item.rarity).label):'Vazio'}</small></span>`,'equipped',slot,`class="rpg-equipment-slot ${item?'filled':''}" ${item?`data-hud-description="${esc(item.name + '\n' + formatStatBonusList(item))}"`: ''} aria-label="${esc(item?.name||slotLabels[slot]+' vazio')}"`);}).join('')}</div></div><aside class="rpg-paper rpg-character-stats"><h2>${esc(getDisplayedClassName())}</h2><p>${esc(player.class)} · Nível ${player.level}</p><div class="rpg-investments" role="list" aria-label="Pontos investidos">${[['strength','Força',investment.strengthPoints,`+${investment.attackGain} ATQ / poder`],['vitality','Vitalidade',investment.vitalityPoints,`+${investment.hpGain} HP`],['wisdom','Sabedoria',investment.wisdomPoints,`+${investment.mpGain} MP`]].map(([key,label,points,bonus])=>`<div class="rpg-investment rpg-investment-${key}" role="listitem" tabindex="0" data-hud-description="${esc(`${label}: ${points} ponto(s). ${bonus}. Cada ponto vale ${getAttributePointGain(key)} no nível ${player.level}.`)}"><span>${label}</span><strong>${points}</strong><small>pontos</small></div>`).join('')}</div><dl>${[['Vida máxima',stats.maxHp],['Mana máxima',stats.maxMp],['Ataque',getActiveAttack()],['Poder de habilidade',getSkillPowerBonus()],['Redução fixa',getPassiveModifiers().flatReduction]].map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>${EquipmentSystem.getSetBonuses(player).sets.map(set=>setSummary(set.region,set.count)).join('')||'<p>Nenhum conjunto equipado.</p>'}</aside><section class="rpg-trainer"><h3>Treinador</h3><p>Redistribuir atributos: ${getTrainerRespecCost()} moedas.</p>${button('Pagar e redistribuir atributos','respec','',player.level<=1||levelUpPoints>0||needsSubclassChoice()?'disabled':'')}</section></section>`;
  }
  function renderBag(){
    const items=getVisibleInventoryItems();
    const selected=player.inventory.find(item=>item.uid===state.item);
    const chestCount=player.inventory.filter(item=>item.type==='chest'&&Object.prototype.hasOwnProperty.call(regions,item.region)&&Number.isSafeInteger(item.qty??1)&&(item.qty??1)>0).reduce((sum,item)=>sum+(item.qty??1),0);
    return `<section class="rpg-bag"><div class="rpg-bag-content"><header><h2>Seus pertences</h2><span>${player.inventory.length} pilhas de itens</span></header>${chestCount?`<div class="rpg-bag-actions">${button(`Abrir todos os baús (${chestCount})`,'open-all-chests','',locked()?'disabled':'')}</div>`:''}${state.chestSummary?`<p role="status">${esc(state.chestSummary)}</p>`:''}${renderActionFeedback('inventory')}<div class="rpg-bag-filters">${INVENTORY_FILTER_OPTIONS.map(filter=>button(esc(filter.label),'filter',filter.id,`aria-pressed="${inventoryFilter===filter.id}"`)).join('')}</div><div class="rpg-bag-grid">${items.map(item=>button(`${itemArt(item)}<span class="rpg-item-qty">${item.qty>1?'×'+item.qty:''}</span>`,'inspect-item',item.uid,`class="rpg-bag-slot rarity-${item.rarity||'comum'} ${flashes(item)?'rpg-crafted':''}" aria-pressed="${state.item===item.uid}" aria-label="${esc(item.name)}"`)).join('')||'<p>Sua bolsa está vazia neste filtro.</p>'}</div></div><aside class="rpg-paper rpg-item-detail">${selected?renderItemDetail(selected,'',false):'<h2>Inspecione um item</h2><p>Selecione para ver atributos, comparação e ações. Selecionar não equipa nem vende.</p>'}</aside></section>`;
  }
  function renderItemDetail(item, equippedSlot='', showSet=true){
    const gear=item.type==='equipment',old=gear?player.equipment[item.slot]:null;
    const blocked=locked()||!!enemy;
    return `<div class="rpg-inspected-art">${itemArt(item)}</div><h2>${esc(item.name)}</h2><p>${esc(gear?formatStatBonusList(item):item.description||getInventoryTypeLabel(item))}</p>${gear?`<p>${esc(item.regionName)} · ${esc(getRarityInfo(item.rarity).label)}</p>${old&&!equippedSlot?`<div class="rpg-compare"><strong>Equipado: ${esc(old.name)}</strong><p>${esc(formatStatBonusList(old))}</p></div>`:''}${showSet&&item.setId?setSummary(item.regionName,EquipmentSystem.getSetBonuses(player).sets.find(s=>s.region===item.regionName)?.count||0):''}${equippedSlot?button('Remover equipamento','unequip',equippedSlot,currentMode!=='camp'||blocked?'disabled':''):button(canEquipItem(item)?'Equipar':'Equipamento de outra classe','equip',item.uid,blocked||!canEquipItem(item)?'disabled':'')}${blocked?'<p>Troque equipamentos fora de combate.</p>':''}`:item.type==='consumable'?button('Usar consumível','use-item',item.uid,locked()?'disabled':''):item.type==='chest'?button('Abrir baú','use-item',item.uid,locked()?'disabled':''):''}${!equippedSlot?button(`Vender uma unidade · ${getSellPrice(item)} moedas`,'sell',item.uid,currentMode!=='village'||locked()?'disabled':''):''}${currentMode!=='village'&&!equippedSlot?'<small>A venda é feita na aldeia.</small>':''}`;
  }
  function renderPortal(){return `<section class="rpg-journal"><h2>${esc(pageTitle())}</h2><p>${isCampResting()?'Volte ao acampamento e levante antes de entrar em combate.':'Prepare sua próxima jornada.'}</p>${button('Entrar','external',currentMode,isCampResting()?'disabled':'')}${button('Voltar à campanha','navigate','battle')}${isCampResting()?button('Voltar ao acampamento','rest-camp'):''}</section>`;}
  function openEquipmentSlot(slot){
    if(!equipmentSlots.includes(slot)||currentMode!=='camp')return;
    const worn=player.equipment[slot],items=player.inventory.filter(item=>item.type==='equipment'&&item.slot===slot&&canEquipItem(item));
    openDialog('equipped',slotLabels[slot],`${worn?renderItemDetail(worn,slot):'<p>Este espaço está vazio.</p>'}<section class="rpg-slot-picker"><h3>Equipar da bolsa</h3>${items.length?items.map(item=>`<article>${itemArt(item)}<div><strong>${text(item.name)}</strong><p>${text(formatStatBonusList(item))}</p>${button('Equipar esta peça','slot-equip',item.uid,locked()||enemy?'disabled':'')}</div></article>`).join(''):'<p>Nenhuma peça compatível na bolsa. Fabrique uma na oficina.</p>'}</section>`);
  }
  function openDialog(kind,title,content){
    closeQuickItems();
    if(!document.getElementById('rpgDialog').open)state.opener=document.activeElement;state.dialog=kind;
    document.getElementById('rpgDialogTitle').textContent=title;
    document.getElementById('rpgDialogContent').innerHTML=content||'';
    for(const id of ['inventoryInfo','logPanel'])document.getElementById(id).hidden=true;
    document.getElementById('rpgDialog').dataset.kind=kind;
    if(!document.getElementById('rpgDialog').open){document.getElementById('rpgDialog').showModal();raiseGameNotice();}
  }
  function closeDialog(){state.bag=false;document.getElementById('rpgDialog')?.close();}
  function showMap(crafting=false){
    if(crafting){const unlocked=EquipmentSystem.unlockedRegions(player);openDialog('craft-map','Região dos equipamentos',`<div class="region-map-frame crafting-region-map"><img class="region-map-image" src="assets/visual/maps/region-map-v2.webp" alt="Regiões do mundo">${Object.keys(regions).map(region=>{return button(`<span class="map-marker-label">${esc(region)}</span>`,'craft-region',region,`class="region-map-marker region-map-area ${state.region===region?'active':''}" style="${getRegionMapAreaStyle(region)}" data-region="${esc(region)}" data-hud-description="${esc(region)} · Prévia do conjunto" aria-pressed="${state.region===region}" aria-label="Equipamentos de ${esc(region)}"`);}).join('')}</div><p>Todos os conjuntos podem ser consultados. Fabricar exige região liberada, materiais e moedas.</p>`);}
    else{openDialog('map','Mapa da campanha',renderRegionMapCard()+`<p>${enemy?'Termine o combate para viajar.':esc(regions[currentRegion].description)}</p>`);}
  }
  function navigate(target){
    if(target==='more'){openDialog('more','Diário e outros caminhos',`<div class="rpg-more">${button('Bestiário','navigate','bestiary')}${button('Troféus e conquistas','navigate','trophies')}${button('Arena','navigate','arena')}${button('Dungeon','navigate','dungeon')}${button('Configurações','settings')}</div>`);return;}
    closeDialog();
    if(target==='bag'){state.chestSummary='';state.bag=true;openDialog('bag','Bolsa do aventureiro',renderBag());return;}
    state.bag=false;
    if(target==='camp'&&currentMode!=='camp')campTab='equipamentos';
    setMode(target);
  }
  function onClick(event){
    const b=event.target.closest('[data-hud]');if(!b||b.disabled)return;
    const value=b.dataset.value,action=b.dataset.hud;
    if(action==='tower')return showTower();
    if(action==='tower-start'){closeDialog();return startChallengeTower();}
    if(action==='mercenary'){if(enemy||isProcessingTurn||(!isDead&&progressionPending()))return;villageTab='mercenary';return setMode('village');}
    if(action==='skill-info')return openDialog('skill-info',b.dataset.skillName,`<p class="rpg-skill-description">${esc(b.dataset.hudDescription)}</p>`);
    if(action==='contract-reward')return openDialog('contract-reward','Recompensa do contrato',`<p class="rpg-skill-description">${esc(b.dataset.hudDescription)}</p>`);
    if(action==='close-dialog')return closeDialog();
    if(action==='expedition-start')return startExpedition();
    if(action==='expedition-stop')return stopExpedition();
    if(action==='navigate')return navigate(value);
    if(action==='settings'){closeDialog();return toggleSettingsPanel();}
    if(action==='rest')return toggleCampRest();
    if(action==='rest-camp'){closeDialog();state.bag=false;campTab='equipamentos';return setMode('camp');}
    if(action==='map')return showMap();if(action==='craft-map')return showMap(true);
    if(action==='craft-region'){if(!regions[value])return;state.region=value;closeDialog();updateUI();return;}
    if(action==='history'){openDialog('history','Histórico de batalha','');document.getElementById('logPanel').hidden=false;document.getElementById('log').style.display='block';return;}
    if(action==='target')return openDialog('target',enemy?.name||'Inimigo',enemy?`<p>Vida: ${Math.ceil(enemy.hp)} / ${enemy.maxHp}</p><p>Armadura: ${getEnemyDisplayedArmor(enemy)}</p><h3>Efeitos</h3><p>${esc(getEnemyStatusEffects(enemy).map(effect=>effect.details?effect.text+': '+effect.details:effect.text).join(' · ')||'Sem efeitos ativos.')}</p><h3>Possíveis drops</h3><p>${esc(enemy.possibleDrop||'Consulte o bestiário.')}</p>`:'');
    if(action==='consumables'){state.quickItems=!state.quickItems;renderActions();if(event.detail===0)document.querySelector('#rpgQuickItems button')?.focus({preventScroll:true});return;}
    if(action==='quick-use'){if(locked()||!enemy||currentMode!=='battle')return;closeQuickItems();return activateInventoryItem(value);}
    if(action==='service'){if(isProcessingTurn)return;state.bag=false;if(value==='mercenary')state.contractTab=EquipmentSystem.refreshContracts(player).active.length?'active':'offers';setVillageTab(value);return;}
    if(action==='camp-tab')return setCampTab(value);
    if(action==='craft-slot'){state.slot=value;updateUI();return;}
    if(action==='buy-drink')return buyConsumable('invigorating_drink');
    if(action==='upgrade-item'){state.upgrade=value;updateUI();return;}
    if(action==='filter'){inventoryFilter=value;updateUI();return;}
    if(action==='inspect-item'){state.item=value;updateUI();return;}
    if(action==='equipped')return openEquipmentSlot(value);
    if(action==='slot-equip'){if(currentMode!=='camp'||enemy||locked())return;const item=player.inventory.find(item=>item.uid===value);if(!item||!canEquipItem(item))return;equipItem(value);return openEquipmentSlot(item.slot);}
    if(action==='tracking')return showTracking();
    if(action==='buy-tracking'){if(CreatureTracking.purchase(value))closeDialog();return;}
    if(action==='contract-tab'){state.contractTab=value;state.contract=null;updateUI();return;}
    if(action==='contract-select'){state.contract=value;updateUI();return;}
    if(action==='abandon-confirm')return openDialog('abandon','Abandonar contrato',`<p>O progresso desta caçada será perdido.</p>${button('Abandonar contrato','abandon',value)}`);
    if(locked()&&!['respawn','restart'].includes(action))return;
    if(action==='open-all-chests'){state.item=null;const result=openAllChests();state.chestSummary=result.opened?`${result.opened} baús abertos. ${result.opened*4} materiais recebidos.`:'';updateUI();return result;}
    if(action==='attack')return attack();if(action==='skill')return useSkill(Number(value));if(action==='pass')return passTurn();
    if(action==='find')return ensureEnemy();
    if(action==='flee')return fleeBattle();
    if(action==='craft')return EquipmentSystem.craft(value);if(action==='upgrade')return EquipmentSystem.tryUpgrade(value);
    if(action==='heal')return healAtVillage();if(action==='mana')return restoreManaAtVillage();if(action==='heal-both')return restoreBothAtVillage();
    if(action==='accept')return EquipmentSystem.acceptContract(value);if(action==='claim')return EquipmentSystem.claimContract(value);if(action==='abandon'){closeDialog();return EquipmentSystem.abandonContract(value);}
    if(action==='equip'&&!enemy)return equipItem(value);if(action==='unequip'&&!enemy){closeDialog();return unequipItem(value);}
    if(action==='sell'&&currentMode==='village')return sellItem(value);if(action==='use-item'){closeDialog();return activateInventoryItem(value);}
    if(action==='respec')return resetInvestedStatsAtCamp();if(action==='respawn')return respawnPlayer();if(action==='restart')return resetAdventure();
    if(action==='external')return value==='arena'?openArenaPage():openDungeonPage();
  }
  function handleShortcut(event){
    if(!enabled()||!mounted||state.bag||state.quickItems||document.getElementById('rpgDialog').open||currentMode!=='battle'||shouldIgnoreShortcutTarget(event.target)||event.ctrlKey||event.altKey||event.metaKey)return false;
    const match=event.code.match(/^(?:Digit|Numpad)([1-9])$/);if(!match)return false;
    const b=document.querySelector(`#actions [data-hud-hotkey="${match[1]}"]`);if(!b)return false;
    event.preventDefault();if(!b.disabled)b.click();return true;
  }
  document.addEventListener('keydown',event=>{if(state.quickItems&&event.key==='Escape'){event.preventDefault();closeQuickItems();document.querySelector('[data-hud="consumables"]')?.focus({preventScroll:true});return;}if(mounted&&(state.quickItems||document.getElementById('rpgDialog')?.open||document.getElementById('rpgLevelDialog')?.open)&&/^(Key[CBIVHZA]|Digit[1-9]|Numpad[1-9])$/.test(event.code))event.stopImmediatePropagation();},true);
  document.addEventListener('click',event=>{if(state.quickItems&&!event.target.closest('.rpg-potion-slot'))closeQuickItems();});
  let rackDrag=null;
  let suppressRackClick=false;
  document.addEventListener('scroll',event=>{if(event.target.matches?.('.rpg-upgrade-rack'))state.rackScroll=event.target.scrollTop;},true);
  document.addEventListener('pointerdown',event=>{
    const rack=event.target.closest?.('.rpg-upgrade-rack');
    if(!rack||event.pointerType!=='mouse'||event.button!==0)return;
    suppressRackClick=false;
    rackDrag={rack,y:event.clientY,top:rack.scrollTop,moved:false};
  });
  document.addEventListener('pointermove',event=>{
    if(!rackDrag)return;
    const delta=event.clientY-rackDrag.y;
    if(Math.abs(delta)>5)rackDrag.moved=true;
    if(rackDrag.moved){event.preventDefault();rackDrag.rack.scrollTop=rackDrag.top-delta;}
  },{passive:false});
  document.addEventListener('pointerup',()=>{if(rackDrag){suppressRackClick=rackDrag.moved;rackDrag=null;}});
  document.addEventListener('pointercancel',()=>{rackDrag=null;suppressRackClick=false;});
  document.addEventListener('click',event=>{
    if(suppressRackClick&&event.target.closest?.('.rpg-upgrade-rack')){event.preventDefault();event.stopImmediatePropagation();suppressRackClick=false;}
  },true);
  window.addEventListener('resize',closeQuickItems);
  window.addEventListener('scroll',()=>{if(state.quickItems)positionQuickItems();},true);
  return {notifyContractCompleted,enabled,render,renderActions,syncChronicle,handleShortcut};
})();
window.CampaignHUD=CampaignHUD;
if(CampaignHUD.enabled())updateUI();
