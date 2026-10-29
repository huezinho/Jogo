(function(){
  "use strict";
  const ARENA_RUN_MODE = "arena_run", HEARTBEAT_MS = 3000, CONNECTION_TIMEOUT_MS = 12000;
  const baseContinueCampaign = window.continueCampaign, baseSelectClass = window.selectClass, baseSaveCampaign = window.saveCampaign;
  const baseExitToCharacterSelect = window.exitToCharacterSelect;
  let campaignSnapshot = null, closingConnections = false, incomingDepth = 0;
  const clone = value => JSON.parse(JSON.stringify(value));
  const safeText = (value, max = 80) => NetworkValidation.safeText(value, max);
  const validId = value => NetworkValidation.validPeerId(value);

  function ensureState(){
    if(!arenaMultiplayer || typeof arenaMultiplayer !== "object"){ arenaMultiplayer = createArenaMultiplayerState(); }
    for(const key of ["fighters", "heroStates", "connections", "lastSeen"]){ if(!arenaMultiplayer[key] || typeof arenaMultiplayer[key] !== "object"){ arenaMultiplayer[key] = {}; } }
    arenaMultiplayer.revision = Number.isInteger(arenaMultiplayer.revision) ? arenaMultiplayer.revision : 0;
    arenaMultiplayer.duelId = arenaMultiplayer.duelId || "";
    arenaMultiplayer.processedActions = Array.isArray(arenaMultiplayer.processedActions) ? arenaMultiplayer.processedActions : [];
  }
  function captureCampaign(){
    if(!player || player.arenaCombatant){ return; }
    campaignSnapshot = { player: clone(player), playerEffects: clone(playerEffects), enemy: enemy && !enemy.arenaCombatant ? clone(enemy) : null,
      pendingLevelUps, levelUpPoints, allocation: clone(allocation), currentRegion, needsNewEnemy, enemiesSpawned, isDead, deadUntil, isLogHidden };
  }
  function restoreCampaign(){
    if(!campaignSnapshot){ return; }
    player = clone(campaignSnapshot.player); playerEffects = clone(campaignSnapshot.playerEffects);
    pendingLevelUps = campaignSnapshot.pendingLevelUps; levelUpPoints = campaignSnapshot.levelUpPoints; allocation = clone(campaignSnapshot.allocation);
    currentRegion = campaignSnapshot.currentRegion; enemiesSpawned = campaignSnapshot.enemiesSpawned;
    isDead = campaignSnapshot.isDead; deadUntil = campaignSnapshot.deadUntil; isLogHidden = campaignSnapshot.isLogHidden;
    needsNewEnemy = true; enemy = null; isProcessingTurn = false;
    displayState = { playerHp: player.hp, playerMp: player.mp, playerXp: player.xp, enemyHp: null };
  }
  // Autosave always serializes the campaign, even while the scene displays a duel hero.
  saveCampaign = window.saveCampaign = function(options){
    if(!campaignSnapshot || !IS_ARENA_PAGE){ return baseSaveCampaign(options); }
    const saved = { player, enemy, playerEffects, pendingLevelUps, levelUpPoints, allocation, currentMode, needsNewEnemy, isDead, deadUntil, currentRegion, enemiesSpawned };
    try{
      player = clone(campaignSnapshot.player); playerEffects = clone(campaignSnapshot.playerEffects); enemy = campaignSnapshot.enemy ? clone(campaignSnapshot.enemy) : null;
      pendingLevelUps = campaignSnapshot.pendingLevelUps; levelUpPoints = campaignSnapshot.levelUpPoints; allocation = clone(campaignSnapshot.allocation);
      currentRegion = campaignSnapshot.currentRegion; enemiesSpawned = campaignSnapshot.enemiesSpawned; isDead = campaignSnapshot.isDead; deadUntil = campaignSnapshot.deadUntil;
      needsNewEnemy = !enemy; currentMode = "battle";
      return baseSaveCampaign(options);
    }finally{ ({ player, enemy, playerEffects, pendingLevelUps, levelUpPoints, allocation, currentMode, needsNewEnemy, isDead, deadUntil, currentRegion, enemiesSpawned } = saved); }
  };
  function createHero(source){
    const hero = clone(source); hero.arenaCombatant = true;
    hero.effects = { ...createDefaultPlayerEffects(), ...(hero.effects || {}) };
    hero.baseName = getDisplayedClassName(hero); hero.name = hero.baseName;
    for(const key of ["attackDownPercent", "attackDownTurns", "armorDownPercent", "armorDownTurns", "dotDamagePerTurn", "dotTurns", "rootedTurns", "natureMarkTurns", "natureMarkDamage", "naturePoisonTurns", "naturePoisonDamage", "natureDecayTurns", "natureDecayDamage", "healReductionPercent", "healReductionTurns", "frozenDamageBonusPercent", "nextDamageTakenPercent", "noShieldTurns", "armor"]){ hero[key] = Number.isFinite(hero[key]) ? Math.max(0, hero[key]) : 0; }
    hero.dotSourceName = safeText(hero.dotSourceName); hero.skipNextAttack = !!hero.skipNextAttack;
    hero.shieldValue = hero.effects.shieldValue; hero.shieldTurns = hero.effects.shieldTurns;
    return hero;
  }
  function withHero(actor, target, callback){
    const saved = { player, enemy, playerEffects, displayState, currentMode, levelUpPoints, allocation };
    player = actor; enemy = target; playerEffects = actor.effects || createDefaultPlayerEffects();
    displayState = { playerHp: actor.hp, playerMp: actor.mp, playerXp: actor.xp, enemyHp: target?.hp || 0 };
    currentMode = ARENA_RUN_MODE; levelUpPoints = 0; allocation = { strength: 0, wisdom: 0, vitality: 0 };
    if(actor.attackDownTurns > 0){ playerEffects.damageDownTurns = Math.max(playerEffects.damageDownTurns, actor.attackDownTurns); playerEffects.damageDownPercent = Math.max(playerEffects.damageDownPercent, actor.attackDownPercent); }
    if(actor.healReductionTurns > 0){ playerEffects.healReductionTurns = Math.max(playerEffects.healReductionTurns, actor.healReductionTurns); playerEffects.healReductionPercent = Math.max(playerEffects.healReductionPercent, actor.healReductionPercent); }
    try { return callback(); }
    finally{
      actor.effects = playerEffects; actor.shieldValue = playerEffects.shieldValue; actor.shieldTurns = playerEffects.shieldTurns;
      ({ player, enemy, playerEffects, displayState, currentMode, levelUpPoints, allocation } = saved);
    }
  }
  // Common damage engine calls this after outgoing modifiers and before target shield/HP.
  window.resolveArenaIncomingDamage = function(target, damage, options = {}){
    if(currentMode !== ARENA_RUN_MODE || !target?.arenaCombatant){ return null; }
    const attacker = player; incomingDepth++;
    try {
      return withHero(target, incomingDepth > 1 ? null : attacker, () => {
        let incoming = Math.max(0, Math.floor(damage));
        if(!options.ignoreArmor){ incoming = Math.max(0, incoming - Math.max(0, Math.floor((target.armor || 0) * (1 - (target.armorDownTurns > 0 ? target.armorDownPercent : 0))))); }
        return applyIncomingDamage(incoming, options);
      });
    }finally{ incomingDepth--; }
  };
  function preview(hero){ return withHero(hero, null, () => clone(getPreviewStats())); }
  function profile(hero, id){
    const stats = preview(hero);
    return { id, name: `${getDisplayedClassName(hero)} Lv.${hero.level}`, displayedClassName: getDisplayedClassName(hero), class: hero.class, level: hero.level,
      hp: hero.hp, maxHp: stats.maxHp, mp: hero.mp, maxMp: stats.maxMp, shieldValue: hero.effects?.shieldValue || 0, dead: hero.hp <= 0 };
  }
  function refreshProfiles(){ for(const [id, hero] of Object.entries(arenaMultiplayer.heroStates)){ arenaMultiplayer.fighters[id] = profile(hero, id); } }
  function localHero(){ return arenaMultiplayer.heroStates[arenaMultiplayer.peer?.id] || null; }
  function opponentId(){ return Object.keys(arenaMultiplayer.heroStates).find(id => id !== arenaMultiplayer.peer?.id) || ""; }
  function myTurn(){ return !!(arenaMultiplayer.duelActive && arenaMultiplayer.turnId === arenaMultiplayer.peer?.id); }
  function turnName(){ return arenaMultiplayer.fighters[arenaMultiplayer.turnId]?.name || "outro duelista"; }
  function syncScene(){
    const hero = localHero();
    if(arenaMultiplayer.duelActive && hero){ player = hero; playerEffects = hero.effects; enemy = arenaMultiplayer.heroStates[opponentId()] || null; currentMode = ARENA_RUN_MODE;
      displayState = { playerHp: player.hp, playerMp: player.mp, playerXp: player.xp, enemyHp: enemy?.hp || 0 }; }
    else { restoreCampaign(); enemy = null; currentMode = "arena"; }
  }
  function applyResult(result){
    const id = arenaMultiplayer.peer?.id;
    if(!campaignSnapshot || !result || result.duelId !== arenaMultiplayer.duelId || !Array.isArray(result.participants) || !result.participants.includes(id)){ return; }
    if(arenaMultiplayer.heroStates[id]?.characterId !== campaignSnapshot.player.characterId){ return; }
    const stats = campaignSnapshot.player.stats || (campaignSnapshot.player.stats = {}), applied = Array.isArray(stats.arenaResultIds) ? stats.arenaResultIds : [];
    if(applied.includes(result.duelId)){ return; }
    stats.arenaDuels = (stats.arenaDuels || 0) + 1; if(result.winnerId === id){ stats.arenaWins = (stats.arenaWins || 0) + 1; }
    stats.arenaResultIds = [...applied, result.duelId].slice(-100); saveCampaign();
  }
  function broadcast(notification = ""){
    if(!arenaMultiplayer.isHost){ return; } refreshProfiles();
    const payload = { type: "arena_state", roomCode: arenaMultiplayer.roomCode, heroStates: clone(arenaMultiplayer.heroStates), duelActive: !!arenaMultiplayer.duelActive,
      turnId: arenaMultiplayer.turnId || "", round: arenaMultiplayer.round || 1, revision: arenaMultiplayer.revision, duelId: arenaMultiplayer.duelId,
      result: arenaMultiplayer.result || null, notification: safeText(notification, 400) };
    Object.values(arenaMultiplayer.connections).forEach(c => { if(c?.open){ c.send(payload); } });
  }
  function stopHeartbeat(){ if(arenaMultiplayer.heartbeatTimer){ clearInterval(arenaMultiplayer.heartbeatTimer); arenaMultiplayer.heartbeatTimer = null; } }
  function closeConnections(){
    if(closingConnections){ return; } closingConnections = true; stopHeartbeat();
    Object.values(arenaMultiplayer.connections || {}).forEach(c => { try { c.close(); } catch {} });
    try { arenaMultiplayer.hostConnection?.close(); } catch {} try { arenaMultiplayer.peer?.destroy(); } catch {}
    closingConnections = false;
  }
  function resetState(){ closeConnections(); restoreCampaign(); arenaMultiplayer = createArenaMultiplayerState(); ensureState(); currentMode = "arena"; }
  function disconnectPeer(id){
    if(closingConnections){ return; }
    if(arenaMultiplayer.isHost){
      if(!arenaMultiplayer.heroStates[id] && !arenaMultiplayer.connections[id]){ return; }
      const active = arenaMultiplayer.duelActive;
      delete arenaMultiplayer.connections[id]; delete arenaMultiplayer.fighters[id]; delete arenaMultiplayer.heroStates[id]; delete arenaMultiplayer.lastSeen[id];
      arenaMultiplayer.duelActive = false; arenaMultiplayer.turnId = ""; arenaMultiplayer.result = null; arenaMultiplayer.revision++;
      syncScene(); if(active){ log("O outro duelista desconectou. O duelo foi encerrado e sua campanha foi preservada."); } broadcast(); updateUI();
    }else{ resetState(); log("A conexao com o host terminou. Sua campanha foi preservada; crie ou entre em outra sala."); updateUI(); }
  }
  function startHeartbeat(){
    stopHeartbeat(); arenaMultiplayer.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      if(arenaMultiplayer.isHost){ for(const [id, c] of Object.entries(arenaMultiplayer.connections)){
        if(now - (arenaMultiplayer.lastSeen[id] || now) > CONNECTION_TIMEOUT_MS){ disconnectPeer(id); try { c.close(); } catch {} }
        else if(c.open){ c.send({ type: "ping" }); }
      } }else if(arenaMultiplayer.hostConnection?.open){
        if(now - (arenaMultiplayer.lastHostSeen || now) > CONNECTION_TIMEOUT_MS){ disconnectPeer("host"); }
        else { arenaMultiplayer.hostConnection.send({ type: "ping" }); }
      }
    }, HEARTBEAT_MS);
  }
  function tickDot(hero, label, damageKey, turnsKey, messages){
    if(!(hero[turnsKey] > 0)){ return; }
    const ownerId = hero.equipmentDotOwners?.[turnsKey];
    const opponents = Object.values(arenaMultiplayer.heroStates).filter(source => source !== hero);
    const source = opponents.find(source => String(source.characterId || source.id || source.class) === ownerId) || opponents[0];
    const natural = turnsKey !== "dotTurns";
    const multiplier = source ? withHero(source, hero, () => (natural ? getNatureDotMultiplier() : 1) * (typeof EquipmentSystem !== "undefined" ? EquipmentSystem.getDotDamageMultiplier(source) : 1)) : 1;
    const damage = Math.min(hero.hp, Math.max(0, Math.floor((hero[damageKey] || 0) * multiplier)));
    hero.hp = Math.max(0, hero.hp - damage); hero[turnsKey]--;
    if(source){
      withHero(source, hero, () => {
        if(typeof EquipmentSystem !== "undefined"){ EquipmentSystem.afterDamage(source, playerEffects, hero, { damage, source: "dot" }); }
        const sapAllowed = natural && (turnsKey !== "natureDecayTurns" || (getPlayerSubclassState().tier60 === "druida_sombrio" && source.level >= 60));
        if(sapAllowed && source.class === "Adepto da Natureza" && hasUnlockedPassiveType("nature_sap")){ healPlayer(Math.floor(damage * .08)); }
      });
    }
    if(hero[turnsKey] <= 0){ hero[damageKey] = 0; } if(damage){ messages.push(`${hero.baseName} sofreu ${damage} de dano por ${label}.`); }
  }
  function startTurn(hero, messages){
    for(const [label, damage, turns] of [[hero.dotSourceName || "dano continuo", "dotDamagePerTurn", "dotTurns"], ["marca natural", "natureMarkDamage", "natureMarkTurns"], ["veneno", "naturePoisonDamage", "naturePoisonTurns"], ["apodrecimento", "natureDecayDamage", "natureDecayTurns"]]){
      tickDot(hero, label, damage, turns, messages); if(hero.hp <= 0){ return "dead"; }
    }
    if(hero.effects.burnTurns > 0){
      const reduction = withHero(hero, null, () => getPassiveModifiers().burnDamageReductionPercent || 0), damage = Math.max(0, Math.floor(hero.effects.burnDamagePerTurn * (1 - reduction)));
      hero.hp = Math.max(0, hero.hp - damage); if(damage){ messages.push(`${hero.baseName} sofreu ${damage} de dano por queimadura.`); } if(hero.hp <= 0){ return "dead"; }
    }
    const skip = (hero.skipNextAttack || hero.effects.skipNextTurn) && !(hero.effects.controlImmuneTurns > 0);
    hero.skipNextAttack = false; hero.effects.skipNextTurn = false;
    if(skip){ messages.push(`${hero.baseName} perdeu o turno.`); return "skip"; } return "ready";
  }
  function decayStatuses(hero){
    for(const [turns, percent] of [["attackDownTurns", "attackDownPercent"], ["armorDownTurns", "armorDownPercent"], ["healReductionTurns", "healReductionPercent"]]){ if(hero[turns] > 0 && --hero[turns] === 0){ hero[percent] = 0; } }
    if(hero.rootedTurns > 0){ hero.rootedTurns--; } if(hero.noShieldTurns > 0){ hero.noShieldTurns--; }
    hero.shieldValue = hero.effects.shieldValue; hero.shieldTurns = hero.effects.shieldTurns;
  }
  function decayDefenderShield(hero){
    if(hero.effects.shieldTurns > 0 && --hero.effects.shieldTurns === 0){ hero.effects.shieldValue = 0; }
    hero.shieldValue = hero.effects.shieldValue; hero.shieldTurns = hero.effects.shieldTurns;
  }
  function finishRound(messages){
    const ids = Object.keys(arenaMultiplayer.heroStates), alive = ids.filter(id => arenaMultiplayer.heroStates[id].hp > 0); arenaMultiplayer.revision++;
    if(alive.length < ids.length){
      arenaMultiplayer.duelActive = false; arenaMultiplayer.turnId = ""; const winnerId = alive.length === 1 ? alive[0] : "";
      arenaMultiplayer.result = { duelId: arenaMultiplayer.duelId, winnerId, participants: ids };
      messages.push(winnerId ? `${arenaMultiplayer.fighters[winnerId]?.name || "Um duelista"} venceu o duelo.` : "O duelo terminou empatado."); applyResult(arenaMultiplayer.result);
    }else{ arenaMultiplayer.turnId = ids.find(id => id !== arenaMultiplayer.turnId) || ids[0]; arenaMultiplayer.round++; }
    refreshProfiles(); syncScene(); messages.forEach(m => log(m)); broadcast(messages.join(" ")); updateUI();
  }
  function availability(actor, target, action){
    return withHero(actor, target, () => {
      if(action.kind === "pass"){ return { allowed: true }; }
      if(action.kind === "basic"){ return actor.class === "Mago" && actor.mp < Math.floor(3 + actor.level * .1) * 3 ? { allowed: false, message: "Mana insuficiente para Misseis Magicos." } : { allowed: true }; }
      if(action.kind !== "skill" || !Number.isInteger(action.skillIndex)){ return { allowed: false, message: "Acao invalida." }; }
      const skill = getSkillInfo()[action.skillIndex]; if(!skill){ return { allowed: false, message: "Essa habilidade nao esta disponivel." }; }
      if(playerEffects.forcedBasicTurns > 0){ return { allowed: false, message: "Use o ataque basico durante Cortes Ultrasonicos." }; }
      if(actor.noShieldTurns > 0 && ["mage_mana_shield", "nature_vine_cocoon"].includes(skill.type)){ return { allowed: false, message: "A corrupcao impede ganhar escudo agora." }; }
      if(player.mp < useSkillCost(skill)){ return { allowed: false, message: "Mana insuficiente!" }; }
      if(skill.hpCostPercent && player.hp <= Math.floor(getCurrentCaps().maxHp * skill.hpCostPercent)){ return { allowed: false, message: "Vida insuficiente para essa habilidade!" }; }
      return { allowed: true };
    });
  }
  function resolveAction(action){
    if(!arenaMultiplayer.isHost || !arenaMultiplayer.duelActive){ return; }
    const actorId = action.actorId, targetId = Object.keys(arenaMultiplayer.heroStates).find(id => id !== actorId);
    if(!validId(actorId) || !targetId || arenaMultiplayer.turnId !== actorId){ return; }
    if(action.duelId !== arenaMultiplayer.duelId || action.revision !== arenaMultiplayer.revision || typeof action.actionId !== "string" || action.actionId.length > 150 || arenaMultiplayer.processedActions.includes(action.actionId)){ return; }
    const actor = arenaMultiplayer.heroStates[actorId], target = arenaMultiplayer.heroStates[targetId]; if(!actor || !target || actor.hp <= 0 || target.hp <= 0){ return; }
    const check = availability(actor, target, action);
    if(!check.allowed){ if(actorId === arenaMultiplayer.peer?.id){ log(check.message); } else { arenaMultiplayer.connections[actorId]?.send({ type: "action_rejected", message: check.message, revision: arenaMultiplayer.revision }); } return; }
    const actorBefore = clone(actor), targetBefore = clone(target), messages = [], start = startTurn(actor, messages);
    if(start !== "ready"){
      withHero(actor, target, () => { if(start === "skip"){ applyTurnStartPassives(); } decayPlayerBuffs(); if(start === "skip"){ applyEndOfTurnRecovery(); } });
      decayStatuses(actor); decayDefenderShield(target); arenaMultiplayer.processedActions.push(action.actionId); finishRound(messages); return;
    }
    const result = withHero(actor, target, () => {
      let result;
      if(action.kind === "basic"){ result = getBasicAttackResult(actor.baseName); playerEffects.lastActionType = "basic_attack"; }
      else if(action.kind === "skill"){ result = applySkillLocally(getSkillInfo()[action.skillIndex], actor.baseName); }
      else { beginEquipmentAction("pass"); result = { blocked: false, message: `${actor.baseName} passou o turno.` }; playerEffects.lastActionType = "pass_turn"; }
      if(result.blocked){ return result; }
      // Some offensive abilities explicitly shatter the enemy-facing shield alias.
      if(target.shieldValue !== target.effects.shieldValue){ target.effects.shieldValue = Math.max(0, target.shieldValue || 0); target.effects.shieldTurns = target.shieldTurns || 0; }
      applyTurnStartPassives(); decayPlayerBuffs(); applyEndOfTurnRecovery();
      if(playerEffects.berserkerLastStandPending && target.hp > 0){ player.hp = 0; } return result;
    });
    if(result.blocked){ arenaMultiplayer.heroStates[actorId] = actorBefore; arenaMultiplayer.heroStates[targetId] = targetBefore; syncScene(); log(result.message); updateUI(); return; }
    messages.push(result.message); decayStatuses(actor); decayDefenderShield(target); arenaMultiplayer.processedActions.push(action.actionId); arenaMultiplayer.processedActions = arenaMultiplayer.processedActions.slice(-100); finishRound(messages);
  }
  function applyState(data){
    if(!Number.isInteger(data.revision) || data.revision < (arenaMultiplayer.lastAppliedRevision ?? -1) || !data.heroStates || typeof data.heroStates !== "object"){ return; }
    const entries = Object.entries(data.heroStates);
    if(entries.length > 2 || entries.some(([id,h]) => !validId(id) || !h || !classes[h.class] || !Number.isFinite(h.hp) || !Number.isFinite(h.mp))){ return; }
    arenaMultiplayer.lastAppliedRevision = data.revision; arenaMultiplayer.revision = data.revision; arenaMultiplayer.duelId = safeText(data.duelId, 120);
    arenaMultiplayer.heroStates = Object.fromEntries(entries.map(([id,h]) => [id,createHero(h)])); arenaMultiplayer.duelActive = data.duelActive === true;
    arenaMultiplayer.turnId = validId(data.turnId) ? data.turnId : ""; arenaMultiplayer.round = Number.isInteger(data.round) && data.round > 0 ? data.round : 1;
    arenaMultiplayer.result = data.result || null; arenaMultiplayer.pendingAction = false; refreshProfiles(); applyResult(arenaMultiplayer.result); syncScene();
    if(data.notification){ log(safeText(data.notification, 400)); } updateUI();
  }
  function lobbyHero(source){
    const clean = NetworkValidation.sanitizeHero(source); if(!clean){ return null; }
    const hero = createHero(clean), stats = preview(hero); hero.hp = Math.max(1, Math.min(stats.maxHp, hero.hp)); hero.mp = Math.min(stats.maxMp, hero.mp); return hero;
  }
  function hostMessage(connection, data){
    if(!arenaMultiplayer.isHost || !NetworkValidation.isMessage(data) || !validId(connection.peer)){ return; } arenaMultiplayer.lastSeen[connection.peer] = Date.now();
    if(data.type === "ping"){ connection.send({ type: "pong" }); return; } if(data.type === "pong"){ return; }
    if(data.type === "join"){
      if(arenaMultiplayer.duelActive || Object.keys(arenaMultiplayer.heroStates).length >= 2 || arenaMultiplayer.heroStates[connection.peer]){ connection.send({ type: "reject", reason: "A arena ja esta cheia ou em combate." }); connection.close(); return; }
      const hero = lobbyHero(data.heroState); if(!hero){ connection.send({ type: "reject", reason: "Dados de personagem invalidos. Reabra seu personagem antes de entrar." }); connection.close(); return; }
      arenaMultiplayer.connections[connection.peer] = connection; arenaMultiplayer.heroStates[connection.peer] = hero; arenaMultiplayer.revision++; refreshProfiles();
      connection.send({ type: "joined", roomCode: arenaMultiplayer.roomCode }); broadcast(`${arenaMultiplayer.fighters[connection.peer].name} entrou na arena.`); updateUI(); return;
    }
    if(!arenaMultiplayer.heroStates[connection.peer]){ return; }
    if(data.type === "profile_update"){
      if(arenaMultiplayer.duelActive){ return; } const hero = lobbyHero(data.heroState); if(!hero){ return; }
      arenaMultiplayer.heroStates[connection.peer] = hero; arenaMultiplayer.revision++; broadcast(); updateUI();
    }else if(data.type === "arena_action"){ resolveAction({ ...data, actorId: connection.peer }); }
    else if(data.type === "leave"){ disconnectPeer(connection.peer); try { connection.close(); } catch {} }
  }
  function guestMessage(data){
    if(!NetworkValidation.isMessage(data)){ return; } arenaMultiplayer.lastHostSeen = Date.now();
    if(data.type === "ping"){ arenaMultiplayer.hostConnection?.send({ type: "pong" }); return; } if(data.type === "pong"){ return; }
    if(data.type === "reject"){ const reason = safeText(data.reason, 200); resetState(); log(reason || "Nao foi possivel entrar na arena."); updateUI(); return; }
    if(data.type === "joined"){ arenaMultiplayer.roomCode = safeText(data.roomCode, 12); updateUI(); return; }
    if(data.type === "action_rejected"){ arenaMultiplayer.pendingAction = false; log(safeText(data.message, 200)); updateUI(); return; }
    if(data.type === "arena_state"){ applyState(data); }
  }
  function attach(connection){
    arenaMultiplayer.lastSeen[connection.peer] = Date.now(); connection.on("data", d => arenaMultiplayer.isHost ? hostMessage(connection,d) : guestMessage(d));
    connection.on("close", () => disconnectPeer(connection.peer)); connection.on("error", () => disconnectPeer(connection.peer));
  }
  window.hostArenaRoom = function(){
    if(currentMode !== "arena" || !player || isDead || player.hp <= 0){ return; } if(typeof Peer === "undefined"){ log("Nao foi possivel carregar o sistema online da arena."); return; }
    resetState(); captureCampaign(); const roomCode = `PVP${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    arenaMultiplayer.isHost = true; arenaMultiplayer.roomCode = roomCode; arenaMultiplayer.peer = new Peer(roomCode);
    arenaMultiplayer.peer.on("open", id => { arenaMultiplayer.roomCode = id; arenaMultiplayer.heroStates[id] = createHero(campaignSnapshot.player); refreshProfiles(); log(`Sala da arena criada: ${safeText(id)}.`); startHeartbeat(); updateUI(); });
    arenaMultiplayer.peer.on("connection", c => { if(!validId(c.peer)){ try { c.close(); } catch {} return; } arenaMultiplayer.connections[c.peer] = c; attach(c); });
    arenaMultiplayer.peer.on("disconnected", () => { resetState(); log("O servico online desconectou. Crie uma nova sala."); updateUI(); });
    arenaMultiplayer.peer.on("error", e => { log(`Erro na arena: ${safeText(e.type || e.message)}.`); updateUI(); });
  };
  window.joinArenaRoom = function(){
    if(currentMode !== "arena" || !player || isDead || player.hp <= 0){ return; } if(typeof Peer === "undefined"){ log("Nao foi possivel carregar o sistema online da arena."); return; }
    const code = (document.getElementById("arenaJoinCode")?.value || "").trim().toUpperCase(); if(!/^PVP[A-Z0-9]{5}$/.test(code)){ log("Informe um codigo valido, como PVP12345."); return; }
    resetState(); captureCampaign(); arenaMultiplayer.roomCode = code; arenaMultiplayer.peer = new Peer();
    arenaMultiplayer.peer.on("open", () => {
      const c = arenaMultiplayer.peer.connect(code, { reliable: true }); arenaMultiplayer.hostConnection = c; arenaMultiplayer.lastHostSeen = Date.now(); attach(c);
      c.on("open", () => { c.send({ type: "join", heroState: clone(campaignSnapshot.player) }); startHeartbeat(); updateUI(); });
    });
    arenaMultiplayer.peer.on("error", e => { const reason = safeText(e.type || e.message); resetState(); log(`Erro na conexao da arena: ${reason}.`); updateUI(); });
    arenaMultiplayer.peer.on("disconnected", () => disconnectPeer("host"));
  };
  window.leaveArenaRoom = function(){ try { if(arenaMultiplayer.hostConnection?.open){ arenaMultiplayer.hostConnection.send({ type: "leave" }); } } catch {} resetState(); log("Voce saiu da arena. Sua campanha foi preservada."); updateUI(); };
  window.startArenaDuel = function(){
    if(!arenaMultiplayer.isHost || arenaMultiplayer.duelActive || Object.keys(arenaMultiplayer.heroStates).length !== 2){ return; } captureCampaign();
    for(const [id, source] of Object.entries(arenaMultiplayer.heroStates)){
      const hero = createHero(source); withHero(hero,null,() => resetCombatEffects()); const stats = preview(hero); hero.hp = stats.maxHp; hero.mp = stats.maxMp;
      hero.shieldValue = hero.effects.shieldValue; hero.shieldTurns = hero.effects.shieldTurns; arenaMultiplayer.heroStates[id] = hero;
    }
    arenaMultiplayer.duelActive = true; arenaMultiplayer.duelId = `duel-${Date.now()}-${Math.random().toString(36).slice(2,10)}`; arenaMultiplayer.result = null; arenaMultiplayer.processedActions = [];
    arenaMultiplayer.revision++; const ids = Object.keys(arenaMultiplayer.heroStates); arenaMultiplayer.turnId = ids[Math.floor(Math.random()*ids.length)]; arenaMultiplayer.round = 1;
    refreshProfiles(); syncScene(); const announcement = `O duelo comecou. ${turnName()} joga primeiro.`; log(announcement); broadcast(announcement); updateUI();
  };
  function sendAction(action){
    if(!myTurn() || arenaMultiplayer.pendingAction){ return; }
    const payload = { ...action, duelId: arenaMultiplayer.duelId, revision: arenaMultiplayer.revision, actionId: `${arenaMultiplayer.peer.id}-${arenaMultiplayer.revision}-${Date.now()}` };
    if(arenaMultiplayer.isHost){ resolveAction({ ...payload, actorId: arenaMultiplayer.peer.id }); }
    else if(arenaMultiplayer.hostConnection?.open){ arenaMultiplayer.pendingAction = true; arenaMultiplayer.hostConnection.send({ type: "arena_action", ...payload }); updateUI(); }
  }
  window.arenaAttack = () => sendAction({ kind: "basic" }); window.arenaUseSkill = i => sendAction({ kind: "skill", skillIndex: i }); window.arenaPassTurn = () => sendAction({ kind: "pass" });
  window.getArenaStatusMessage = function(){
    if(arenaMultiplayer.duelActive){ return `Turno atual: ${turnName()}. Se a conexao cair, a sala encerra em ate 15 segundos.`; }
    if(arenaMultiplayer.result){ return "Duelo concluido. O resultado foi salvo; a campanha foi preservada."; }
    return Object.keys(arenaMultiplayer.heroStates).length === 2 ? "Os dois duelistas estao prontos." : "Crie uma sala ou entre com o codigo de outro jogador.";
  };
  function fighterMarkup(){
    return `<div class="party-list">${Object.values(arenaMultiplayer.fighters).map(f => `<div class="party-entry ${f.id === arenaMultiplayer.peer?.id ? "local" : ""} ${f.id === arenaMultiplayer.turnId ? "active-turn" : ""}"><strong>${getHeroSpriteIcon({ class:f.class, subclassChoices:{} })} ${escapeHtml(f.name)}</strong><span class="lock-note">Vida ${f.hp}/${f.maxHp} | Mana ${f.mp}/${f.maxMp}${f.shieldValue ? ` | Escudo ${f.shieldValue}` : ""}</span><div class="bar"><div class="fill hp" style="width:${Math.max(0,Math.min(100,f.hp/Math.max(1,f.maxHp)*100))}%"></div></div></div>`).join("")}</div>`;
  }
  window.renderArenaRoomControls = function(){
    ensureState(); const connected = !!arenaMultiplayer.peer;
    return `<div class="inventory-list"><div class="inventory-item"><strong>Sala de duelo</strong><p class="lock-note">${escapeHtml(getArenaStatusMessage())}</p>${arenaMultiplayer.roomCode ? `<span class="room-pill">${escapeHtml(arenaMultiplayer.roomCode)}</span>` : ""}${!connected ? `<label class="lock-note" for="arenaJoinCode">Codigo da sala</label><input id="arenaJoinCode" class="text-input" placeholder="PVP12345" maxlength="8" />` : ""}<div class="button-row"><button onclick="hostArenaRoom()" ${connected ? "disabled" : ""}>Criar sala</button><button onclick="joinArenaRoom()" ${connected ? "disabled" : ""}>Entrar</button>${connected ? `<button onclick="leaveArenaRoom()">Sair da sala</button>` : ""}</div>${arenaMultiplayer.isHost ? `<button onclick="startArenaDuel()" ${Object.keys(arenaMultiplayer.heroStates).length===2&&!arenaMultiplayer.duelActive ? "" : "disabled"}>${arenaMultiplayer.result ? "Revanche" : "Iniciar duelo"}</button>` : ""}</div><div class="inventory-item"><strong>Duelistas</strong>${fighterMarkup()}</div></div>`;
  };
  window.renderArenaActions = function(actions){
    if(!arenaMultiplayer.peer){ actions.innerHTML = `<button onclick="hostArenaRoom()">Criar sala</button><button onclick="joinArenaRoom()">Entrar na sala</button><button onclick="returnToMainPage('battle')">Voltar para a campanha</button>`; return; }
    if(!arenaMultiplayer.duelActive){ actions.innerHTML = `${arenaMultiplayer.isHost ? `<button onclick="startArenaDuel()" ${Object.keys(arenaMultiplayer.heroStates).length===2 ? "" : "disabled"}>${arenaMultiplayer.result ? "Revanche" : "Iniciar duelo"}</button>` : `<button disabled>Aguardando o host</button>`}<button onclick="leaveArenaRoom()">Sair da sala</button>`; return; }
    if(!myTurn() || arenaMultiplayer.pendingAction){ actions.innerHTML = `<button disabled>${arenaMultiplayer.pendingAction ? "Enviando acao..." : `Aguardando ${escapeHtml(turnName())}...`}</button><button onclick="leaveArenaRoom()">Abandonar duelo</button>`; return; }
    actions.innerHTML = `${renderBasicActionButton(getBasicAttackLabel(),getBasicAttackTooltip(),"arenaAttack()")}${getSkillInfo().map((s,i)=>renderSkillActionButton(s,i,`arenaUseSkill(${i})`)).join("")}<button onclick="arenaPassTurn()">Passar turno</button><button onclick="leaveArenaRoom()">Abandonar duelo</button>`;
  };
  ensureState();
  if(IS_ARENA_PAGE){
    window.exitToCharacterSelect = exitToCharacterSelect = function(){
      if(isProcessingTurn){ return baseExitToCharacterSelect(); }
      resetState();
      try { return baseExitToCharacterSelect(); } finally { campaignSnapshot = null; }
    };
    window.continueCampaign = continueCampaign = function(...args){ campaignSnapshot=null; baseContinueCampaign(...args); captureCampaign(); currentMode="arena"; enemy=null; updateUI(); };
    window.selectClass = selectClass = function(name){ campaignSnapshot=null; baseSelectClass(name); captureCampaign(); currentMode="arena"; enemy=null; updateUI(); };
    if(player){ captureCampaign(); currentMode="arena"; enemy=null; updateUI(); }
  }
  window.ArenaSystem = Object.freeze({ applyState, handleHostMessage:hostMessage, checkAction:availability, restoreCampaign, captureCampaign });
})();
