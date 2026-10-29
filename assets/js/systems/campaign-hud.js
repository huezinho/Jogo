/* Campaign presentation. Combat, economy and save rules stay in their existing systems. */
const CampaignHUD = (() => {
  'use strict';
  const art = 'assets/visual/hud/';
  const state = { bag: false, region: null, slot: 'weapon', upgrade: null, item: null, contractTab: 'active', contract: null, dialog: null, opener: null };
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
  const money = () => `<span class="rpg-coins">${player.coins.toLocaleString('pt-BR')} <small>moedas</small></span>`;
  const itemArt = item => {
    if(item?.type !== 'equipment') return getInventoryItemSymbol(item);
    if(item.slot==='accessory')return getInventoryItemSymbol(item);
    const weapon = { Guerreiro: 'sword', Arqueiro:'bow', Mago:'staff', 'Adepto da Natureza':'nature-staff' };
    return image('item-' + (item.slot === 'weapon' ? weapon[item.classRestriction || player.class] || 'sword' : ['head','chest','legs','feet'].includes(item.slot) ? item.slot : 'staff'), 'rpg-item-art');
  };
  const slotArt = slot => slot==='accessory'?image('icon-holy','rpg-item-art'):itemArt({type:'equipment', slot, classRestriction:player.class});
  function mount(){
    if(mounted) return;
    const game = document.getElementById('game');
    const log = document.getElementById('log');
    const level = document.getElementById('levelUpPanel');
    game.innerHTML = `<div id="campaignHud" class="game-layout rpg-layout">
      <header class="rpg-top"><div class="rpg-location"><h1 id="rpgTitle"></h1></div></header>
      <div class="rpg-world-layout">
        <aside class="rpg-locations-rail"><nav id="modeTabs" aria-label="Locais da campanha"></nav><footer id="rpgOptions"></footer></aside>
        <main id="rpgMain"><div id="rpgLevelMount"></div><section id="enemyInfo"></section><div id="rpgChronicle" class="rpg-chronicle" aria-live="polite"></div><div id="actions"></div></main>
        <aside class="rpg-regions-rail"><section id="regionInfo" class="rpg-world-map" aria-label="Mapa de regiões"></section><div id="rpgBagButton"></div><div id="rpgAccount"></div></aside>
      </div>
      <div id="playerInfo" hidden></div><div id="heroPortraitPanel" hidden></div>
      <dialog id="rpgDialog" aria-labelledby="rpgDialogTitle"><header><h2 id="rpgDialogTitle"></h2><button type="button" data-hud="close-dialog" aria-label="Fechar janela">Fechar ×</button></header><div id="rpgDialogContent"></div><section id="logPanel" hidden><div id="rpgLogMount"></div></section><section id="inventoryInfo" hidden></section></dialog>
    </div>`;
    document.getElementById('rpgLogMount').append(log);
    document.getElementById('rpgLevelMount').append(level);
    document.getElementById('campaignHud').addEventListener('click', onClick);
    document.getElementById('actions').addEventListener('focusin', inspectAction);
    document.getElementById('actions').addEventListener('mouseover', inspectAction);
    const dialog = document.getElementById('rpgDialog');
    dialog.addEventListener('click', event => { if(event.target === dialog){ const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) closeDialog(); } });
    dialog.addEventListener('close', () => { if(dialog.open)return; state.bag=false;state.dialog=null; if(state.opener?.isConnected) state.opener.focus(); });
    mounted = true;
  }
  function nav(){
    document.getElementById('modeTabs').innerHTML = renderLocationMapNavigation().replace(/onclick="setMode\('([^']+)'\)"/g, 'data-hud="navigate" data-value="$1"');
    document.getElementById('rpgOptions').innerHTML=button('Opções','settings');
    document.getElementById('rpgBagButton').innerHTML=button(`${image('item-chest')}<span>Bolsa</span>`,'navigate','bag','aria-label="Abrir bolsa"');
  }

  function render(){
    if(!enabled()) return false;
    if(characterId!==player.characterId){state.bag=false;state.item=null;state.region=null;state.upgrade=null;characterId=player.characterId;}
    mount(); document.body.classList.add('rpg-playing');
    if(typeof hideTrophyCategoryPopup==='function')hideTrophyCategoryPopup();
    const root=document.getElementById('campaignHud');
    root.dataset.mode=currentMode;root.dataset.service=villageTab;
    document.getElementById('rpgTitle').textContent=pageTitle();
    document.getElementById('rpgAccount').innerHTML=money();
    const panel=document.getElementById('enemyInfo');
    panel.className='rpg-content';
    panel.innerHTML=currentMode==='battle'?renderBattle():currentMode==='village'?renderVillage():currentMode==='camp'?renderCharacter():currentMode==='bestiary'?`<section class="rpg-journal">${renderBestiary()}</section>`:currentMode==='trophies'?`<section class="rpg-journal">${renderTrophySummaryPanel()}${renderTrophyGroups()}</section>`:renderPortal();
    if(currentMode==='battle') dockVitals();
    document.getElementById('regionInfo').innerHTML=renderRegionMapCard().replace(/<p class="map-current-label">[\s\S]*?<\/p>/,`<p class="rpg-map-caption">${esc(currentRegion)}</p>`);
    renderActions(); renderLevelUpPanel(); animateBars(); nav(); syncChronicle();
    for(const control of root.querySelectorAll('button[data-tooltip]:not([aria-label])'))control.setAttribute('aria-label',control.textContent.trim());
    if(currentMode!=='battle'&&!progressionPending()) document.getElementById('levelUpPanel').style.display='none';
    if(state.bag&&document.getElementById('rpgDialog').open)document.getElementById('rpgDialogContent').innerHTML=renderBag();
    return true;
  }
  function renderBattle(){
    const progress=getBossUnlockProgress(currentRegion);
    const title=`${getDisplayedClassName()} · Nv. ${player.level}`;
    return `<section class="rpg-battle ${enemy?.isBoss?'is-boss':''}"><div class="rpg-battle-banner"><span>${isDead?'Derrotado':levelUpPoints>0?'Evolução pendente':needsSubclassChoice()?'Escolha sua subclasse':isProcessingTurn?'Turno em andamento':enemy?'Sua vez':'Exploração'}</span></div>
      <aside class="rpg-quest" aria-label="Progresso do chefe" data-state="${enemy?.isBoss?'fighting':progress.unlocked?'ready':'tracking'}"><strong>${enemy?.isBoss?'Confronto com o chefe':progress.unlocked?'Chefe localizado':'Rastro do chefe'}</strong>${enemy?.isBoss?`<span>${esc(enemy.name)}</span>${button('Analisar chefe','target')}`:`<span>${progress.defeated} / ${progress.total} criaturas vencidas</span><progress max="${Math.max(1,progress.total)}" value="${progress.defeated}" aria-label="Criaturas diferentes vencidas para liberar o chefe"></progress>${progress.unlocked?button('Desafiar chefe','boss','',enemy||locked()||progressionPending()?'disabled':''):button('Ver rastros','objective')}`}</aside>
      ${renderCombatScene(enemy,currentRegion)}
      <div class="rpg-vital-dock"><section class="rpg-hero-plate"><div class="rpg-portrait">${getHeroSpriteMarkup().replace(/id="heroSprite"/g,'id="hudHeroPortrait"')}</div><div><strong>${esc(title)}</strong><div id="rpgHeroVitals"></div></div></section>${enemy?`<section class="rpg-enemy-plate"><div><button class="rpg-target-name" data-hud="target">${esc(enemy.name)}</button><div id="rpgEnemyVitals"></div></div><div class="rpg-enemy-portrait">${getEnemySpriteMarkup(enemy).replace(/id="enemySprite"/g,'id="enemyPortrait"')}</div></section>`:`<section class="rpg-expedition-note"><span>${esc(regions[currentRegion].description)}</span>${progress.unlocked?button('Desafiar chefe','boss'):''}</section>`}</div>
    </section>`;
  }
  function dockVitals(){
    for(const [kind, target] of [['hero','rpgHeroVitals'],['enemy','rpgEnemyVitals']]){
      const source=document.querySelector(`#enemyInfo .battle-scene .scene-vitals-${kind}`),dock=document.getElementById(target);
      if(source&&dock) dock.append(source);
      if(dock)for(const label of dock.querySelectorAll('.scene-vital-text'))label.textContent=label.textContent.replace(/\//g,' / ');
    }
  }
  function skillIcon(skill){
    const type=skill?.type||'';
    if(/shove/.test(type)) return 'bash'; if(/stagger/.test(type)) return 'stun';
    if(/heal|breath|second_wind|song/.test(type)) return 'heal';
    if(/faith|holy|sacred|phoenix|valhalla/.test(type)) return 'holy';
    if(/shield|cocoon|invul/.test(type)) return 'shield';
    if(/fire|burn|incend/.test(type)) return 'fire';
    if(/ice|freeze|blizzard|avalanche|frost/.test(type)) return 'ice';
    if(/poison|rot|decay|corrupt/.test(type)) return 'poison';
    if(/demon|berserk|sacrifice/.test(type)) return 'demon';
    if(/arrow|shot|barrage|trap|snipe/.test(type)) return 'arrow';
    if(/smoke|swift|cut|ultrasonic/.test(type)) return 'daggers';
    if(/warcry|focus|unstoppable/.test(type)) return 'warcry';
    if(/nature|vine|seed|root|swamp|forest|queen/.test(type)) return 'vines';
    if(/arcane|magic|mana|discharge|overcharge/.test(type)) return 'arcane';
    return player.class==='Arqueiro'?'arrow':player.class==='Mago'?'arcane':player.class==='Adepto da Natureza'?'tree':'strike';
  }
  function renderActions(){
    if(!enabled()||!mounted) return false;
    const area=document.getElementById('actions');
    area.className='rpg-actions';
    if(currentMode!=='battle'){area.innerHTML='';return true;}
    if(isDead){const seconds=Math.max(0,Math.ceil((deadUntil-Date.now())/1000));area.innerHTML=`<div class="rpg-recovery">${button(seconds?`Renascer em ${seconds}s`:'Renascer','respawn','',seconds?'disabled':'')}${button('Reiniciar aventura','restart')}</div>`;return true;}
    if(!enemy){area.innerHTML=`<div class="rpg-recovery">${button(`${image('icon-strike')}<span>Procurar inimigo</span>`,'find','','class="rpg-find" '+(locked()||progressionPending()?'disabled':''))}${getBossUnlockProgress(currentRegion).unlocked?button('Desafiar chefe','boss','',locked()||progressionPending()?'disabled':''):''}</div>`;return true;}
    const skills=getSkillInfo(),busy=locked()||progressionPending();
    const basicCost=player.class==='Mago'?Math.floor(3+.1*player.level)*3:0;
    const basicIcon=player.class==='Arqueiro'?'arrow':player.class==='Mago'?'arcane':player.class==='Adepto da Natureza'?'vines':'strike';
    const skillButtons=skills.map((skill,index)=>{const available=getSkillActionState(skill),blocked=busy||!available.canUse||playerEffects.forcedBasicTurns>0;return button(`${image('icon-'+skillIcon(skill))}<strong>${text(skill.name)}</strong><small>${available.manaCost} mana${skill.hpCostPercent?' · vida':''}</small><span class="rpg-hotkey">${index+2<=9?index+2:''}</span>`,'skill',index,`class="rpg-ability" data-hud-hotkey="${index+2}" data-hud-description="${esc(skill.description+(available.reason?' · '+available.reason:''))}" ${blocked?'disabled':''} aria-label="${text(skill.name)}, ${available.manaCost} de mana${blocked?', indisponível':''}"`);}).join('');
    area.innerHTML=`<div class="rpg-command-belt"><div class="rpg-potion-slot">${button(`${image('icon-potion')}<span>Itens</span>`,'consumables','',busy?'disabled':'')}</div><div class="rpg-ability-list">${button(`${image('icon-'+basicIcon)}<strong>${text(getBasicAttackLabel())}</strong><small>${basicCost} mana</small><span class="rpg-hotkey">1</span>`,'attack','',`class="rpg-ability" data-hud-hotkey="1" data-hud-description="${esc(getBasicAttackTooltip())}" ${busy||player.mp<basicCost?'disabled':''}`)}${skillButtons}</div><div class="rpg-turn-actions">${button('Encerrar turno','pass','',busy?'disabled':'')}${button('Fugir','flee','',busy?'disabled':'')}${button('Habilidades','skills')}</div></div><div id="rpgSkillHint" class="rpg-skill-hint">${busy?'Aguarde a resolução do turno.':'Selecione uma habilidade para ver seu efeito.'}</div>`;
    return true;
  }
  function inspectAction(event){const b=event.target.closest('[data-hud-description]');if(b&&document.getElementById('rpgSkillHint'))document.getElementById('rpgSkillHint').textContent=b.dataset.hudDescription;}
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
  function renderVillage(){
    if(villageTab==='artisan'||villageTab==='forge') return serviceNav()+renderWorkshop();
    if(villageTab==='mercenary') return serviceNav()+renderMercenary();
    if(villageTab==='alchemist') return serviceNav()+`<section class="rpg-village-interior rpg-alchemy"><div class="rpg-service-copy"><h2>Poções e preparados</h2><p>Prepare seus consumíveis antes de voltar à trilha.</p></div><div class="rpg-shop">${renderActionFeedback('village')}${renderAlchemistPanel()}</div></section>`;
    return serviceNav()+`<section class="rpg-village-interior"><div class="rpg-service-copy"><h2>Descanse, aventureiro</h2><p>Recupere suas forças antes da próxima expedição.</p></div><div class="rpg-inn rpg-paper">${renderActionFeedback('village')}<h2>Pousada</h2><p>Vida: ${player.hp} / ${getCurrentCaps().maxHp}</p>${button(`Recuperar vida · ${getHealCost()} moedas`,'heal','',player.coins<getHealCost()?'disabled':'')}<p>Mana: ${player.mp} / ${getCurrentCaps().maxMp}</p>${button(`Recuperar mana · ${getManaHealCost()} moedas`,'mana','',player.coins<getManaHealCost()?'disabled':'')}</div></section>`;
  }
  function currentCraft(){
    const unlocked=EquipmentSystem.unlockedRegions(player);
    if(!unlocked.includes(state.region))state.region=unlocked.includes(currentRegion)?currentRegion:unlocked[0];
    return EquipmentSystem.getRecipes(player,{region:state.region}).find(recipe=>recipe.slot===state.slot);
  }
  function requirementList(requirements, cost){
    return `<ul class="rpg-materials">${Object.entries(requirements||{}).map(([id,qty])=>{const material=EquipmentSystem.materialById(id),owned=getInventoryCountById(id);return `<li class="${owned>=qty?'material-ready':'material-missing'}"><span class="rpg-material-icon">${getInventoryItemSymbol(material)}</span><span>${esc(material?.name||id)}${material?.regionName?`<small>${esc(material.regionName)}</small>`:''}</span><strong>${owned} / ${qty}</strong></li>`;}).join('')}<li class="${player.coins>=cost?'material-ready':'material-missing'}"><span class="rpg-material-coin" aria-hidden="true">◈</span><span>Moedas</span><strong>${player.coins} / ${cost}</strong></li></ul>`;
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
    const item=upgrading?chosen?.item:recipe?.result,upgrade=upgrading&&item?EquipmentSystem.getUpgradeRequirements(item,player):null;
    const region=item?.regionName||state.region,requirements=upgrading?upgrade?.requirements:recipe?.requirements,cost=upgrading?upgrade?.cost:recipe?.cost;
    const setCount=EquipmentSystem.getSetBonuses(player).sets.find(set=>set.region===region)?.count||0;
    const slots=upgrading?candidates.map(entry=>button(`${itemArt(entry.item)}<span>${esc(slotLabels[entry.item.slot])}<small>${esc(getRarityInfo(entry.item.rarity).label)}</small></span>`,'upgrade-item',entry.key,`class="rpg-rack-slot" aria-pressed="${entry.key===chosen?.key}" aria-label="Selecionar ${esc(entry.item.name)}"`)).join(''):EquipmentData.slots.map(slot=>button(`${slotArt(slot)}<span>${text(slotLabels[slot])}</span>`,'craft-slot',slot,`class="rpg-rack-slot" aria-pressed="${slot===state.slot}"`)).join('');
    const actionable=upgrading?!!upgrade&&player.coins>=cost&&EquipmentSystem.isRegionUnlocked(region,player)&&Object.entries(requirements||{}).every(([id,qty])=>getInventoryCountById(id)>=qty):recipe&&EquipmentSystem.canCraft(recipe,player);
    return `<div class="rpg-forge-tabs">${button('Fabricar','service','artisan',`aria-pressed="${!upgrading}"`)}${button('Aprimorar','service','forge',`aria-pressed="${upgrading}"`)}</div><section class="rpg-workshop"><aside class="rpg-workshop-map"><button data-hud="craft-map" class="rpg-map-object"><img src="assets/visual/maps/region-map.webp" alt="Mapa de regiões para fabricar equipamentos"><span>${esc(state.region)} · escolher região</span></button>${setSummary(region,setCount)}</aside><section class="rpg-equipment-rack" aria-label="Escolher equipamento">${slots||'<p>Nenhuma peça para aprimorar.</p>'}</section><section class="rpg-anvil"><h2>${item?text(item.name.replace(/^[^-]+ - /,'').replace(new RegExp(' '+getRarityInfo(item.rarity).label+'$','i'),'')):'Equipe ou fabrique uma peça'}</h2><p>${item?text(slotLabels[item.slot])+' · '+text(item.setName)+' · '+esc(getRarityInfo(item.rarity).label):'Oficina do ferreiro'}</p>${item?itemArt(item):image('item-sword')}<div class="rpg-rarity-path" aria-label="Ordem das raridades">${rarityOrder.map((r,index)=>`<span class="${r===item?.rarity?'current':''}"><i class="rpg-gem rarity-${r}" aria-hidden="true"></i>${esc(getRarityInfo(r).label)}${index<4?' <b>›</b>':''}</span>`).join('')}</div></section><section class="rpg-recipe rpg-paper">${renderActionFeedback('village')}${item?`<h3>${upgrading?upgrade?`${esc(getRarityInfo(item.rarity).label)} → ${esc(getRarityInfo(upgrade.toRarity).label)}`:'Raridade máxima':'Propriedades'}</h3><p class="rpg-item-stats">${formatStatBonusList(item).split(',').map(stat=>'<span>'+text(stat.trim())+'</span>').join('')}</p>${upgrading&&upgrade?`<p class="rpg-upgrade-stats">Após melhorar: ${esc(formatStatBonusList(upgrade.nextItem))}</p>`:''}${!upgrading||upgrade?`${requirementList(requirements,cost)}${button(upgrading?'Melhorar para '+esc(getRarityInfo(upgrade.toRarity).label):'Forjar',upgrading?'upgrade':'craft',upgrading?chosen.key:recipe.id,`class="rpg-primary" ${!actionable||locked()?'disabled':''}`)}<p class="rpg-rule-note">${upgrading?'Melhoria garantida. Uma raridade por vez.':'Resultado: equipamento comum.'}</p>`:'<p>Esta peça já alcançou a última raridade.</p>'}`:'<h3>Sua bancada está vazia</h3><p>Fabrique uma peça comum e equipe na tela do personagem, ou selecione uma peça na bolsa.</p>'}</section></section>`;
  }
  function renderMercenary(){
    const board=EquipmentSystem.refreshContracts(player),remaining=Math.max(0,Math.ceil(((board.boardCycle+1)*EquipmentData.boardIntervalMs-Date.now())/60000));
    const offers=state.contractTab==='active'?board.active:board.offers;
    const selected=offers.find(q=>q.id===state.contract)||offers[0];state.contract=selected?.id||null;
    return `<section class="rpg-contract-board"><header class="rpg-board-intro"><h2>Contratos da fronteira</h2><p>Caçadas em regiões desbloqueadas. Pagamento fixo em materiais de outras terras.</p><span>Novas ofertas em <strong>${remaining} min</strong> · ${board.active.length} / ${EquipmentData.maxActiveContracts} ativos</span><small>A renovação troca as ofertas. Seus contratos aceitos continuam ativos.</small></header><div class="rpg-contract-tabs">${button('Em andamento','contract-tab','active',`aria-pressed="${state.contractTab==='active'}"`)}${button('Disponíveis','contract-tab','offers',`aria-pressed="${state.contractTab==='offers'}"`)}</div><div class="rpg-contract-layout"><div class="rpg-contract-list">${offers.length?offers.map(q=>button(`<strong>Cace ${q.count} ${esc(q.targetName)}</strong><span>${esc(q.targetRegion)} · ${state.contractTab==='active'?`${q.progress} / ${q.count}`:esc(q.difficulty)}</span><small>${esc(EquipmentSystem.materialById(q.rewardId)?.name)} × ${q.rewardQty}</small>`,'contract-select',q.id,`class="rpg-contract" aria-pressed="${q.id===selected.id}"`)).join(''):'<p class="rpg-paper">Você ainda não aceitou contratos. Consulte as ofertas disponíveis.</p>'}</div><aside class="rpg-paper rpg-contract-detail">${selected?`<h2>${esc(selected.targetName)}</h2><p>Derrote ${selected.count} em ${esc(selected.targetRegion)}.</p><h3>Recompensa fixa</h3><div class="rpg-reward">${getInventoryItemSymbol(EquipmentSystem.materialById(selected.rewardId))}<strong>${esc(EquipmentSystem.materialById(selected.rewardId)?.name)} × ${selected.rewardQty}</strong></div><p>Origem: ${esc(EquipmentSystem.materialById(selected.rewardId)?.regionName)}</p>${state.contractTab==='active'?`<p>Progresso: ${selected.progress} / ${selected.count}</p>${button('Receber recompensa','claim',selected.id,`class="rpg-primary" ${selected.progress<selected.count?'disabled':''}`)}${button('Abandonar contrato','abandon-confirm',selected.id)}`:button(board.claimed.includes(selected.id)||board.active.some(q=>q.id===selected.id)?'Contrato já retirado':'Aceitar contrato','accept',selected.id,`class="rpg-primary" ${board.claimed.includes(selected.id)||board.active.some(q=>q.id===selected.id)||board.active.length>=EquipmentData.maxActiveContracts?'disabled':''}`)}`:'<h2>Seu próximo contrato</h2><p>Escolha uma oferta para ver o objetivo e a recompensa antes de aceitar.</p>'}</aside></div></section>`;
  }
  function renderCharacter(){
    const tabs=`<nav class="rpg-character-tabs">${[['equipamentos','Equipamentos'],['status','Atributos'],['habilidades','Habilidades']].map(([id,label])=>button(label,'camp-tab',id,`aria-pressed="${campTab===id}"`)).join('')}</nav>`;
    if(campTab!=='equipamentos')return tabs+`<section class="rpg-journal">${renderCampContent(getCampEntries(),getPreviewStats(),getInvestedSummary(),player.baseStats||classes[player.class],getTotalSubclassBonuses(),getActiveSetBonuses(),getXpToNextLevel()).replace(/<div class="inner-tabs">.*?<\/div>/s,'')}${campTab==='status'?`<section class="rpg-trainer"><h3>Treinador</h3><p>Redistribuir atributos: ${getTrainerRespecCost()} moedas.</p>${button('Pagar e redistribuir atributos','respec','',player.level<=1||levelUpPoints>0||needsSubclassChoice()?'disabled':'')}</section>`:''}</section>`;
    const stats=getPreviewStats();
    return tabs+`<section class="rpg-character-sheet"><div class="rpg-paperdoll"><div class="rpg-character-figure">${getHeroSpriteMarkup()}<h2>${esc(getDisplayedClassName())}</h2><span>Nível ${player.level}</span></div><div class="rpg-loadout">${equipmentSlots.map(slot=>{const item=player.equipment[slot];return button(`${item?itemArt(item):slotArt(slot)}<span>${text(slotLabels[slot])}<small>${item?esc(getRarityInfo(item.rarity).label):'Vazio'}</small></span>`,'equipped',slot,`class="rpg-equipment-slot ${item?'filled':''}" aria-label="${esc(item?.name||slotLabels[slot]+' vazio')}"`);}).join('')}</div></div><aside class="rpg-paper rpg-character-stats"><h2>${esc(getDisplayedClassName())}</h2><p>${esc(player.class)} · Nível ${player.level}</p><dl>${[['Vida máxima',stats.maxHp],['Mana máxima',stats.maxMp],['Ataque',getActiveAttack()],['Poder de habilidade',getSkillPowerBonus()],['Redução fixa',getPassiveModifiers().flatReduction]].map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>${EquipmentSystem.getSetBonuses(player).sets.map(set=>setSummary(set.region,set.count)).join('')||'<p>Nenhum conjunto equipado.</p>'}${button('Abrir bolsa','navigate','bag')}</aside></section>`;
  }
  function renderBag(){
    const items=getVisibleInventoryItems();
    const selected=player.inventory.find(item=>item.uid===state.item);
    return `<section class="rpg-bag"><div class="rpg-bag-content"><header><h2>Seus pertences</h2><span>${player.inventory.length} pilhas de itens</span></header>${renderActionFeedback('inventory')}<div class="rpg-bag-filters">${INVENTORY_FILTER_OPTIONS.map(filter=>button(esc(filter.label),'filter',filter.id,`aria-pressed="${inventoryFilter===filter.id}"`)).join('')}</div><div class="rpg-bag-grid">${items.map(item=>button(`${itemArt(item)}<span class="rpg-item-qty">${item.qty>1?'×'+item.qty:''}</span>`,'inspect-item',item.uid,`class="rpg-bag-slot rarity-${item.rarity||'comum'}" aria-pressed="${state.item===item.uid}" aria-label="${esc(item.name)}"`)).join('')||'<p>Sua bolsa está vazia neste filtro.</p>'}</div></div><aside class="rpg-paper rpg-item-detail">${selected?renderItemDetail(selected):'<h2>Inspecione um item</h2><p>Selecione para ver atributos, comparação e ações. Selecionar não equipa nem vende.</p>'}</aside></section>`;
  }
  function renderItemDetail(item, equippedSlot=''){
    const gear=item.type==='equipment',old=gear?player.equipment[item.slot]:null;
    const blocked=locked()||!!enemy;
    return `<div class="rpg-inspected-art">${itemArt(item)}</div><h2>${esc(item.name)}</h2><p>${esc(gear?formatStatBonusList(item):item.description||getInventoryTypeLabel(item))}</p>${gear?`<p>${esc(item.regionName)} · ${esc(getRarityInfo(item.rarity).label)}</p>${old&&!equippedSlot?`<div class="rpg-compare"><strong>Equipado: ${esc(old.name)}</strong><p>${esc(formatStatBonusList(old))}</p></div>`:''}${item.setId?setSummary(item.regionName,EquipmentSystem.getSetBonuses(player).sets.find(s=>s.region===item.regionName)?.count||0):''}${equippedSlot?button('Remover equipamento','unequip',equippedSlot,currentMode!=='camp'||blocked?'disabled':''):button(canEquipItem(item)?'Equipar':'Equipamento de outra classe','equip',item.uid,blocked||!canEquipItem(item)?'disabled':'')}${blocked?'<p>Troque equipamentos fora de combate.</p>':''}`:item.type==='consumable'?button('Usar consumível','use-item',item.uid,locked()?'disabled':''):item.type==='chest'?button('Abrir baú','use-item',item.uid,locked()?'disabled':''):''}${!equippedSlot?button(`Vender uma unidade · ${getSellPrice(item)} moedas`,'sell',item.uid,currentMode!=='village'||locked()?'disabled':''):''}${currentMode!=='village'&&!equippedSlot?'<small>A venda é feita na aldeia.</small>':''}`;
  }
  function renderPortal(){return `<section class="rpg-journal"><h2>${esc(pageTitle())}</h2><p>Prepare sua próxima jornada.</p>${button('Entrar','external',currentMode)}${button('Voltar à campanha','navigate','battle')}</section>`;}
  function openDialog(kind,title,content){
    state.opener=document.activeElement;state.dialog=kind;
    document.getElementById('rpgDialogTitle').textContent=title;
    document.getElementById('rpgDialogContent').innerHTML=content||'';
    for(const id of ['inventoryInfo','logPanel'])document.getElementById(id).hidden=true;
    document.getElementById('rpgDialog').showModal();
  }
  function closeDialog(){state.bag=false;document.getElementById('rpgDialog')?.close();}
  function showMap(crafting=false){
    if(crafting){const unlocked=EquipmentSystem.unlockedRegions(player);openDialog('craft-map','Região dos equipamentos',`<div class="region-map-frame crafting-region-map"><img class="region-map-image" src="assets/visual/maps/region-map.webp" alt="Regiões do mundo">${Object.keys(regions).map((region,index)=>{const marker=REGION_MAP_MARKERS[region]||{x:50,y:50};return button(`${index+1}<span class="map-marker-label">${esc(region)}</span>`,'craft-region',region,`class="region-map-marker ${state.region===region?'active':''}" style="--x:${marker.x}%;--y:${marker.y}%" aria-label="Equipamentos de ${esc(region)}${unlocked.includes(region)?'':' — região bloqueada'}" ${unlocked.includes(region)?'':'disabled'}`);}).join('')}</div><p>As receitas acompanham as regiões que você desbloqueou.</p>`);}
    else{openDialog('map','Mapa da campanha',renderRegionMapCard()+`<p>${enemy?'Termine o combate para viajar.':esc(regions[currentRegion].description)}</p>`);}
  }
  function navigate(target){
    if(target==='more'){openDialog('more','Diário e outros caminhos',`<div class="rpg-more">${button('Bestiário','navigate','bestiary')}${button('Troféus e conquistas','navigate','trophies')}${button('Arena','navigate','arena')}${button('Dungeon','navigate','dungeon')}${button('Configurações','settings')}</div>`);return;}
    closeDialog();
    if(target==='bag'){state.bag=true;openDialog('bag','Bolsa do aventureiro',renderBag());return;}
    state.bag=false;
    if(target==='camp'&&currentMode!=='camp')campTab='equipamentos';
    setMode(target);
  }
  function onClick(event){
    const b=event.target.closest('[data-hud]');if(!b||b.disabled)return;
    const value=b.dataset.value,action=b.dataset.hud;
    if(action==='close-dialog')return closeDialog();
    if(action==='navigate')return navigate(value);
    if(action==='settings'){closeDialog();return toggleSettingsPanel();}
    if(action==='map')return showMap();if(action==='craft-map')return showMap(true);
    if(action==='craft-region'){if(!EquipmentSystem.isRegionUnlocked(value,player))return;state.region=value;closeDialog();updateUI();return;}
    if(action==='history'){openDialog('history','Histórico de batalha','');document.getElementById('logPanel').hidden=false;document.getElementById('log').style.display='block';return;}
    if(action==='target')return openDialog('target',enemy?.name||'Inimigo',enemy?`<p>Vida: ${Math.ceil(enemy.hp)} / ${enemy.maxHp}</p><p>Armadura: ${getEnemyDisplayedArmor(enemy)}</p><h3>Efeitos</h3><p>${esc(getEnemyStatusEffects(enemy).map(effect=>effect.text).join(' · ')||'Sem efeitos ativos.')}</p><h3>Possíveis drops</h3><p>${esc(enemy.possibleDrop||'Consulte o bestiário.')}</p>`:'');
    if(action==='objective'){const p=getBossUnlockProgress(currentRegion),contracts=EquipmentSystem.refreshContracts(player).active;return openDialog('objective','Objetivo da expedição',`<h3>Encontre o chefe de ${esc(currentRegion)}</h3><p>Criaturas diferentes: ${p.defeated} / ${p.total}</p><p>${esc((p.missing||[]).join(', ')||'Você já pode desafiar o chefe.')}</p>${p.unlocked?button('Desafiar chefe','boss','',enemy?'disabled':''):''}${contracts.map(q=>`<h3>${esc(q.targetName)}</h3><p>${q.progress} / ${q.count} · ${esc(EquipmentSystem.materialById(q.rewardId)?.name)} × ${q.rewardQty}</p>`).join('')}`);}
    if(action==='skills')return openDialog('skills','Habilidades',getSkillInfo().map(skill=>`<section class="rpg-skill-entry">${image('icon-'+skillIcon(skill))}<div><h3>${text(skill.name)} · ${getSkillActionState(skill).manaCost} mana</h3><p>${esc(skill.description)}</p></div></section>`).join(''));
    if(action==='consumables')return openDialog('consumables','Consumíveis',player.inventory.filter(item=>item.type==='consumable').map(item=>`<section class="rpg-consumable"><h3>${esc(item.name)} × ${item.qty||1}</h3><p>${esc(item.description)}</p>${button('Usar','use-item',item.uid,locked()?'disabled':'')}</section>`).join('')||'<p>Você não carrega consumíveis. Visite o alquimista na aldeia.</p>');
    if(action==='flee')return openDialog('flee','Fugir da batalha',`<p>A fuga custa ${getFleeCost()} moedas e encerra a batalha sem recompensas.</p>${button('Confirmar fuga','confirm-flee','',player.coins<getFleeCost()?'disabled':'')}`);
    if(action==='service'){if(locked())return;state.bag=false;if(value==='mercenary')state.contractTab=EquipmentSystem.refreshContracts(player).active.length?'active':'offers';setVillageTab(value);return;}
    if(action==='camp-tab')return setCampTab(value);
    if(action==='craft-slot'){state.slot=value;updateUI();return;}
    if(action==='upgrade-item'){state.upgrade=value;updateUI();return;}
    if(action==='filter'){inventoryFilter=value;updateUI();return;}
    if(action==='inspect-item'){state.item=value;updateUI();return;}
    if(action==='equipped'){const item=player.equipment[value];return openDialog('equipped',slotLabels[value],item?renderItemDetail(item,value):'<p>Este espaço está vazio. Fabrique equipamentos na oficina da aldeia.</p>');}
    if(action==='contract-tab'){state.contractTab=value;state.contract=null;updateUI();return;}
    if(action==='contract-select'){state.contract=value;updateUI();return;}
    if(action==='abandon-confirm')return openDialog('abandon','Abandonar contrato',`<p>O progresso desta caçada será perdido.</p>${button('Abandonar contrato','abandon',value)}`);
    if(locked()&&!['respawn','restart'].includes(action))return;
    if(action==='attack')return attack();if(action==='skill')return useSkill(Number(value));if(action==='pass')return passTurn();
    if(action==='find')return ensureEnemy();if(action==='boss'){closeDialog();return challengeBoss();}
    if(action==='confirm-flee'){closeDialog();return fleeBattle();}
    if(action==='craft')return EquipmentSystem.craft(value);if(action==='upgrade')return EquipmentSystem.tryUpgrade(value);
    if(action==='heal')return healAtVillage();if(action==='mana')return restoreManaAtVillage();
    if(action==='accept')return EquipmentSystem.acceptContract(value);if(action==='claim')return EquipmentSystem.claimContract(value);if(action==='abandon'){closeDialog();return EquipmentSystem.abandonContract(value);}
    if(action==='equip'&&!enemy)return equipItem(value);if(action==='unequip'&&!enemy){closeDialog();return unequipItem(value);}
    if(action==='sell'&&currentMode==='village')return sellItem(value);if(action==='use-item'){closeDialog();return activateInventoryItem(value);}
    if(action==='respec')return resetInvestedStatsAtCamp();if(action==='respawn')return respawnPlayer();if(action==='restart')return resetAdventure();
    if(action==='external')return value==='arena'?openArenaPage():openDungeonPage();
  }
  function handleShortcut(event){
    if(!enabled()||!mounted||state.bag||document.getElementById('rpgDialog').open||currentMode!=='battle'||shouldIgnoreShortcutTarget(event.target)||event.ctrlKey||event.altKey||event.metaKey)return false;
    const match=event.code.match(/^(?:Digit|Numpad)([1-9])$/);if(!match)return false;
    const b=document.querySelector(`#actions [data-hud-hotkey="${match[1]}"]`);if(!b)return false;
    event.preventDefault();if(!b.disabled)b.click();return true;
  }
  document.addEventListener('keydown',event=>{if(mounted&&document.getElementById('rpgDialog')?.open&&/^(Key[CBIVHZA]|Digit[1-9]|Numpad[1-9])$/.test(event.code))event.stopImmediatePropagation();},true);
  return {enabled,render,renderActions,syncChronicle,handleShortcut};
})();
window.CampaignHUD=CampaignHUD;
if(CampaignHUD.enabled())updateUI();
