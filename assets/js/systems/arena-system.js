(function(){
  const ARENA_RUN_MODE = "arena_run";
  const MAX_ARENA_PLAYERS = 2;
  const baseContinueCampaign = window.continueCampaign;
  const baseSelectClass = window.selectClass;

  function cloneData(value){
    return JSON.parse(JSON.stringify(value));
  }

  function ensureArenaState(){
    if(!arenaMultiplayer || typeof arenaMultiplayer !== "object"){
      arenaMultiplayer = createArenaMultiplayerState();
    }
    if(!arenaMultiplayer.fighters || typeof arenaMultiplayer.fighters !== "object"){
      arenaMultiplayer.fighters = {};
    }
    if(!arenaMultiplayer.heroStates || typeof arenaMultiplayer.heroStates !== "object"){
      arenaMultiplayer.heroStates = {};
    }
  }

  function createArenaHeroState(sourceHero){
    const hero = cloneData(sourceHero);
    hero.effects = hero.effects || createDefaultPlayerEffects();
    hero.baseName = getDisplayedClassName(hero);
    hero.name = hero.baseName;
    hero.attackDownPercent = hero.attackDownPercent || 0;
    hero.attackDownTurns = hero.attackDownTurns || 0;
    hero.armorDownPercent = hero.armorDownPercent || 0;
    hero.armorDownTurns = hero.armorDownTurns || 0;
    hero.dotDamagePerTurn = hero.dotDamagePerTurn || 0;
    hero.dotTurns = hero.dotTurns || 0;
    hero.dotSourceName = hero.dotSourceName || "";
    hero.rootedTurns = hero.rootedTurns || 0;
    hero.natureMarkTurns = hero.natureMarkTurns || 0;
    hero.natureMarkDamage = hero.natureMarkDamage || 0;
    hero.naturePoisonTurns = hero.naturePoisonTurns || 0;
    hero.naturePoisonDamage = hero.naturePoisonDamage || 0;
    hero.natureDecayTurns = hero.natureDecayTurns || 0;
    hero.natureDecayDamage = hero.natureDecayDamage || 0;
    hero.healReductionPercent = hero.healReductionPercent || 0;
    hero.healReductionTurns = hero.healReductionTurns || 0;
    hero.frozenDamageBonusPercent = hero.frozenDamageBonusPercent || 0;
    hero.nextDamageTakenPercent = hero.nextDamageTakenPercent || 0;
    hero.skipNextAttack = !!hero.skipNextAttack;
    hero.shieldValue = hero.shieldValue || 0;
    hero.shieldTurns = hero.shieldTurns || 0;
    hero.noShieldTurns = hero.noShieldTurns || 0;
    hero.armor = hero.armor || 0;
    return hero;
  }

  function withArenaHeroContext(actorHero, targetHero, callback){
    const savedPlayer = player;
    const savedEnemy = enemy;
    const savedEffects = playerEffects;
    const savedDisplay = displayState;
    const savedMode = currentMode;
    const savedLevelUpPoints = levelUpPoints;
    const savedAllocation = allocation;
    player = actorHero;
    enemy = targetHero;
    playerEffects = actorHero.effects || createDefaultPlayerEffects();
    displayState = {
      playerHp: actorHero.hp,
      playerMp: actorHero.mp,
      playerXp: actorHero.xp,
      enemyHp: targetHero ? targetHero.hp : null
    };
    currentMode = ARENA_RUN_MODE;
    levelUpPoints = 0;
    allocation = { strength: 0, wisdom: 0, vitality: 0 };
    if((actorHero.attackDownTurns || 0) > 0){
      playerEffects.damageDownTurns = Math.max(playerEffects.damageDownTurns || 0, actorHero.attackDownTurns || 0);
      playerEffects.damageDownPercent = Math.max(playerEffects.damageDownPercent || 0, actorHero.attackDownPercent || 0);
    }
    if((actorHero.healReductionTurns || 0) > 0){
      playerEffects.healReductionTurns = Math.max(playerEffects.healReductionTurns || 0, actorHero.healReductionTurns || 0);
      playerEffects.healReductionPercent = Math.max(playerEffects.healReductionPercent || 0, actorHero.healReductionPercent || 0);
    }
    try{
      const result = callback();
      actorHero.effects = playerEffects;
      return result;
    }finally{
      player = savedPlayer;
      enemy = savedEnemy;
      playerEffects = savedEffects;
      displayState = savedDisplay;
      currentMode = savedMode;
      levelUpPoints = savedLevelUpPoints;
      allocation = savedAllocation;
    }
  }

  function getArenaPreviewStats(hero){
    return withArenaHeroContext(hero, null, () => cloneData(getPreviewStats()));
  }

  function buildArenaProfile(hero, peerId){
    const sourceHero = hero || player;
    const previewStats = getArenaPreviewStats(createArenaHeroState(sourceHero));
    const effects = sourceHero.effects || createDefaultPlayerEffects();
    return {
      id: peerId,
      name: `${getDisplayedClassName(sourceHero)} Lv.${sourceHero.level}`,
      displayedClassName: getDisplayedClassName(sourceHero),
      class: sourceHero.class,
      level: sourceHero.level,
      icon: getHeroSpriteIcon(sourceHero),
      hp: sourceHero.hp,
      maxHp: previewStats.maxHp,
      mp: sourceHero.mp,
      maxMp: previewStats.maxMp,
      shieldValue: effects.shieldValue || sourceHero.shieldValue || 0,
      dead: sourceHero.hp <= 0
    };
  }

  function getArenaLocalHero(){
    const localId = arenaMultiplayer.peer?.id;
    if(!localId){ return null; }
    return arenaMultiplayer.heroStates[localId] || null;
  }

  function getArenaOpponentId(){
    const localId = arenaMultiplayer.peer?.id;
    return Object.keys(arenaMultiplayer.fighters || {}).find(id => id !== localId) || "";
  }

  function getArenaOpponentHero(){
    const opponentId = getArenaOpponentId();
    return opponentId ? arenaMultiplayer.heroStates[opponentId] || null : null;
  }

  function syncArenaSceneFromState(){
    const localHero = getArenaLocalHero();
    if(arenaMultiplayer.duelActive && localHero){
      player = localHero;
      playerEffects = player.effects || createDefaultPlayerEffects();
      const opponentHero = getArenaOpponentHero();
      enemy = opponentHero ? createArenaHeroState(opponentHero) : null;
      displayState.playerHp = player.hp;
      displayState.playerMp = player.mp;
      displayState.playerXp = player.xp;
      displayState.enemyHp = enemy ? enemy.hp : null;
      currentMode = ARENA_RUN_MODE;
      return;
    }
    enemy = null;
    displayState.enemyHp = null;
    currentMode = "arena";
  }

  function broadcastArenaState(notification = ""){
    if(!arenaMultiplayer.isHost){ return; }
    const payload = {
      type: "arena_state",
      roomCode: arenaMultiplayer.roomCode,
      fighters: cloneData(arenaMultiplayer.fighters),
      heroStates: cloneData(arenaMultiplayer.heroStates),
      duelActive: !!arenaMultiplayer.duelActive,
      turnId: arenaMultiplayer.turnId || "",
      round: arenaMultiplayer.round || 1,
      notification
    };
    Object.values(arenaMultiplayer.connections || {}).forEach(connection => {
      if(connection?.open){
        connection.send(payload);
      }
    });
  }

  function refreshArenaProfiles(){
    const localId = arenaMultiplayer.peer?.id;
    if(localId){
      const localHero = arenaMultiplayer.duelActive ? getArenaLocalHero() : player;
      arenaMultiplayer.fighters[localId] = buildArenaProfile(localHero, localId);
    }
  }

  function sendArenaProfileUpdate(){
    if(!arenaMultiplayer.peer){ return; }
    refreshArenaProfiles();
    if(arenaMultiplayer.isHost){
      broadcastArenaState();
      updateUI();
      return;
    }
    if(arenaMultiplayer.hostConnection?.open){
      arenaMultiplayer.hostConnection.send({
        type: "profile_update",
        fighter: arenaMultiplayer.fighters[arenaMultiplayer.peer.id],
        heroState: cloneData(player)
      });
    }
  }

  function closeArenaConnections(){
    Object.values(arenaMultiplayer.connections || {}).forEach(connection => {
      try { connection.close(); } catch {}
    });
    if(arenaMultiplayer.hostConnection){
      try { arenaMultiplayer.hostConnection.close(); } catch {}
    }
    if(arenaMultiplayer.peer){
      try { arenaMultiplayer.peer.destroy(); } catch {}
    }
  }

  function resetArenaState(){
    closeArenaConnections();
    arenaMultiplayer = createArenaMultiplayerState();
    ensureArenaState();
    if(typeof baseContinueCampaign === "function" && localStorage.getItem(SAVE_KEY)){
      baseContinueCampaign();
    }
    enemy = null;
    currentMode = "arena";
  }

  function prepareArenaHeroesForDuel(){
    Object.keys(arenaMultiplayer.heroStates || {}).forEach(peerId => {
      const arenaHero = createArenaHeroState(arenaMultiplayer.heroStates[peerId]);
      const previewStats = getArenaPreviewStats(arenaHero);
      arenaHero.hp = previewStats.maxHp;
      arenaHero.mp = previewStats.maxMp;
      arenaHero.effects = createDefaultPlayerEffects();
      arenaHero.baseName = getDisplayedClassName(arenaHero);
      arenaHero.name = arenaHero.baseName;
      arenaMultiplayer.heroStates[peerId] = arenaHero;
      arenaMultiplayer.fighters[peerId] = buildArenaProfile(arenaHero, peerId);
    });
  }

  function getArenaTurnName(){
    const currentId = arenaMultiplayer.turnId;
    return arenaMultiplayer.fighters[currentId]?.name || "...";
  }

  function isMyArenaTurn(){
    return !!(arenaMultiplayer.duelActive && arenaMultiplayer.turnId && arenaMultiplayer.turnId === arenaMultiplayer.peer?.id);
  }

  function tickArenaDot(hero, label, damageKey, turnsKey, messages){
    if((hero[turnsKey] || 0) <= 0){ return false; }
    const damage = Math.max(0, Math.floor(hero[damageKey] || 0));
    if(damage > 0){
      hero.hp = Math.max(0, hero.hp - damage);
      messages.push(`${hero.baseName} sofreu ${damage} de dano por ${label}.`);
    }
    hero[turnsKey] = Math.max(0, (hero[turnsKey] || 0) - 1);
    if(hero[turnsKey] <= 0){
      hero[damageKey] = 0;
    }
    return hero.hp <= 0;
  }

  function processArenaHeroTurnStart(hero, messages){
    if(tickArenaDot(hero, hero.dotSourceName || "dano continuo", "dotDamagePerTurn", "dotTurns", messages)){ return true; }
    if(tickArenaDot(hero, "marca natural", "natureMarkDamage", "natureMarkTurns", messages)){ return true; }
    if(tickArenaDot(hero, "veneno", "naturePoisonDamage", "naturePoisonTurns", messages)){ return true; }
    if(tickArenaDot(hero, "apodrecimento", "natureDecayDamage", "natureDecayTurns", messages)){ return true; }
    if(hero.skipNextAttack){
      hero.skipNextAttack = false;
      messages.push(`${hero.baseName} perdeu o turno.`);
      return "skip";
    }
    return false;
  }

  function decayArenaHeroStatuses(hero){
    if(hero.attackDownTurns > 0){
      hero.attackDownTurns--;
      if(hero.attackDownTurns <= 0){ hero.attackDownPercent = 0; }
    }
    if(hero.armorDownTurns > 0){
      hero.armorDownTurns--;
      if(hero.armorDownTurns <= 0){ hero.armorDownPercent = 0; }
    }
    if(hero.healReductionTurns > 0){
      hero.healReductionTurns--;
      if(hero.healReductionTurns <= 0){ hero.healReductionPercent = 0; }
    }
    if(hero.rootedTurns > 0){ hero.rootedTurns--; }
    if(hero.noShieldTurns > 0){ hero.noShieldTurns--; }
  }

  function finishArenaRound(messages){
    const localId = arenaMultiplayer.peer?.id;
    const opponentId = getArenaOpponentId();
    refreshArenaProfiles();
    if(localId){ arenaMultiplayer.fighters[localId] = buildArenaProfile(arenaMultiplayer.heroStates[localId], localId); }
    if(opponentId){ arenaMultiplayer.fighters[opponentId] = buildArenaProfile(arenaMultiplayer.heroStates[opponentId], opponentId); }
    if(arenaMultiplayer.heroStates[localId]?.hp <= 0 || arenaMultiplayer.heroStates[opponentId]?.hp <= 0){
      arenaMultiplayer.duelActive = false;
      const winnerId = arenaMultiplayer.heroStates[localId]?.hp > 0 ? localId : opponentId;
      Object.entries(arenaMultiplayer.heroStates || {}).forEach(([peerId, hero]) => {
        hero.stats = hero.stats || {};
        hero.stats.arenaDuels = (hero.stats.arenaDuels || 0) + 1;
        if(peerId === winnerId){
          hero.stats.arenaWins = (hero.stats.arenaWins || 0) + 1;
        }
      });
      messages.push(`${arenaMultiplayer.fighters[winnerId]?.name || "Um jogador"} venceu o duelo.`);
      arenaMultiplayer.turnId = "";
    }else{
      arenaMultiplayer.turnId = localId === arenaMultiplayer.turnId ? opponentId : localId;
      arenaMultiplayer.round = (arenaMultiplayer.round || 1) + 1;
    }
    syncArenaSceneFromState();
    updateUI();
    if(messages.length){
      messages.forEach(message => log(message));
    }
    broadcastArenaState(messages.join(" "));
  }

  function resolveArenaAction(action){
    if(!arenaMultiplayer.isHost || !arenaMultiplayer.duelActive){ return; }
    const actorId = action.actorId;
    const targetId = Object.keys(arenaMultiplayer.heroStates).find(id => id !== actorId);
    if(!actorId || !targetId || arenaMultiplayer.turnId !== actorId){ return; }
    const actorHero = arenaMultiplayer.heroStates[actorId];
    const targetHero = arenaMultiplayer.heroStates[targetId];
    if(!actorHero || !targetHero || actorHero.hp <= 0 || targetHero.hp <= 0){ return; }
    const messages = [];
    const startResult = processArenaHeroTurnStart(actorHero, messages);
    if(startResult === true){
      finishArenaRound(messages);
      return;
    }
    if(startResult === "skip"){
      finishArenaRound(messages);
      return;
    }
    withArenaHeroContext(actorHero, targetHero, () => {
      if(action.kind === "basic"){
        const result = getBasicAttackResult(actorHero.baseName || actorHero.name || "Heroi");
        if(result.blocked){
          messages.push(result.message);
          return;
        }
        applyTurnStartPassives();
        playerEffects.lastActionType = "basic_attack";
        messages.push(result.message);
      }else if(action.kind === "skill"){
        const skills = getSkillInfo();
        const skillInfo = skills[action.skillIndex];
        if(!skillInfo){
          messages.push("Essa habilidade nao esta disponivel.");
          return;
        }
        const result = applySkillLocally(skillInfo, actorHero.baseName || actorHero.name || "Heroi");
        if(result.blocked){
          messages.push(result.message);
          return;
        }
        applyTurnStartPassives();
        playerEffects.lastActionType = "skill";
        messages.push(result.message);
      }else{
        applyTurnStartPassives();
        playerEffects.lastActionType = "pass_turn";
        messages.push(`${actorHero.baseName} passou o turno.`);
      }
      decayPlayerBuffs();
      applyEndOfTurnRecovery();
      actorHero.hp = Math.max(0, player.hp);
      actorHero.mp = Math.max(0, player.mp);
      actorHero.effects = playerEffects;
      targetHero.hp = Math.max(0, enemy.hp);
      targetHero.shieldValue = enemy.shieldValue || 0;
      targetHero.shieldTurns = enemy.shieldTurns || 0;
      targetHero.attackDownPercent = enemy.attackDownPercent || 0;
      targetHero.attackDownTurns = enemy.attackDownTurns || 0;
      targetHero.armorDownPercent = enemy.armorDownPercent || 0;
      targetHero.armorDownTurns = enemy.armorDownTurns || 0;
      targetHero.dotDamagePerTurn = enemy.dotDamagePerTurn || 0;
      targetHero.dotTurns = enemy.dotTurns || 0;
      targetHero.dotSourceName = enemy.dotSourceName || "";
      targetHero.rootedTurns = enemy.rootedTurns || 0;
      targetHero.natureMarkTurns = enemy.natureMarkTurns || 0;
      targetHero.natureMarkDamage = enemy.natureMarkDamage || 0;
      targetHero.naturePoisonTurns = enemy.naturePoisonTurns || 0;
      targetHero.naturePoisonDamage = enemy.naturePoisonDamage || 0;
      targetHero.natureDecayTurns = enemy.natureDecayTurns || 0;
      targetHero.natureDecayDamage = enemy.natureDecayDamage || 0;
      targetHero.healReductionPercent = enemy.healReductionPercent || 0;
      targetHero.healReductionTurns = enemy.healReductionTurns || 0;
      targetHero.frozenDamageBonusPercent = enemy.frozenDamageBonusPercent || 0;
      targetHero.nextDamageTakenPercent = enemy.nextDamageTakenPercent || 0;
      targetHero.skipNextAttack = !!enemy.skipNextAttack;
      targetHero.noShieldTurns = enemy.noShieldTurns || 0;
    });
    decayArenaHeroStatuses(actorHero);
    finishArenaRound(messages);
  }

  function applyArenaStatePayload(data){
    ensureArenaState();
    arenaMultiplayer.roomCode = data.roomCode || arenaMultiplayer.roomCode;
    arenaMultiplayer.fighters = data.fighters || {};
    arenaMultiplayer.heroStates = data.heroStates || {};
    arenaMultiplayer.duelActive = !!data.duelActive;
    arenaMultiplayer.turnId = data.turnId || "";
    arenaMultiplayer.round = data.round || 1;
    syncArenaSceneFromState();
    if(data.notification){
      log(data.notification);
    }
    updateUI();
  }

  function handleArenaHostMessage(connection, data){
    if(!data || !arenaMultiplayer.isHost){ return; }
    if(data.type === "join"){
      if(Object.keys(arenaMultiplayer.fighters).length >= MAX_ARENA_PLAYERS){
        connection.send({ type: "reject", reason: "A arena ja esta cheia." });
        connection.close();
        return;
      }
      arenaMultiplayer.connections[connection.peer] = connection;
      arenaMultiplayer.fighters[connection.peer] = data.fighter;
      arenaMultiplayer.heroStates[connection.peer] = createArenaHeroState(data.heroState);
      connection.send({ type: "joined", roomCode: arenaMultiplayer.roomCode });
      broadcastArenaState(`${data.fighter.name} entrou na arena.`);
      updateUI();
      return;
    }
    if(data.type === "profile_update"){
      arenaMultiplayer.fighters[connection.peer] = data.fighter;
      arenaMultiplayer.heroStates[connection.peer] = createArenaHeroState(data.heroState);
      broadcastArenaState();
      updateUI();
      return;
    }
    if(data.type === "arena_action"){
      resolveArenaAction({ ...data, actorId: connection.peer });
      return;
    }
  }

  function handleArenaGuestMessage(data){
    if(!data){ return; }
    if(data.type === "reject"){
      log(data.reason || "Nao foi possivel entrar na arena.");
      resetArenaState();
      updateUI();
      return;
    }
    if(data.type === "joined"){
      arenaMultiplayer.roomCode = data.roomCode || arenaMultiplayer.roomCode;
      log(`Conectado a arena ${arenaMultiplayer.roomCode}.`);
      updateUI();
      return;
    }
    if(data.type === "arena_state"){
      applyArenaStatePayload(data);
    }
  }

  function attachArenaConnection(connection){
    connection.on("data", data => {
      if(arenaMultiplayer.isHost){
        handleArenaHostMessage(connection, data);
      }else{
        handleArenaGuestMessage(data);
      }
    });
    connection.on("close", () => {
      if(arenaMultiplayer.isHost){
        delete arenaMultiplayer.connections[connection.peer];
        delete arenaMultiplayer.fighters[connection.peer];
        delete arenaMultiplayer.heroStates[connection.peer];
        if(arenaMultiplayer.duelActive){
          arenaMultiplayer.duelActive = false;
          arenaMultiplayer.turnId = "";
          enemy = null;
          log("O outro jogador deixou a arena. O duelo foi encerrado.");
        }
        broadcastArenaState();
        updateUI();
        return;
      }
      log("A conexao com a arena foi encerrada.");
      resetArenaState();
      updateUI();
    });
  }

  window.hostArenaRoom = function(){
    if(currentMode !== "arena" || !player || isDead || player.hp <= 0){ return; }
    if(typeof Peer === "undefined"){
      log("Nao foi possivel carregar o sistema online da arena.");
      return;
    }
    resetArenaState();
    const roomCode = `PVP${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    arenaMultiplayer.isHost = true;
    arenaMultiplayer.roomCode = roomCode;
    arenaMultiplayer.peer = new Peer(roomCode);
    arenaMultiplayer.peer.on("open", id => {
      arenaMultiplayer.roomCode = id;
      arenaMultiplayer.fighters[id] = buildArenaProfile(player, id);
      arenaMultiplayer.heroStates[id] = createArenaHeroState(player);
      if(typeof triggerActionFeedback === "function"){
        triggerActionFeedback("arena", `Sala da arena criada: ${id}.`, "success");
      }
      log(`Sala da arena criada: ${id}.`);
      updateUI();
    });
    arenaMultiplayer.peer.on("connection", connection => {
      arenaMultiplayer.connections[connection.peer] = connection;
      attachArenaConnection(connection);
    });
    arenaMultiplayer.peer.on("error", error => {
      log(`Erro na arena online: ${error.type || error.message}.`);
      updateUI();
    });
  };

  window.joinArenaRoom = function(){
    if(currentMode !== "arena" || !player || isDead || player.hp <= 0){ return; }
    if(typeof Peer === "undefined"){
      log("Nao foi possivel carregar o sistema online da arena.");
      return;
    }
    const input = document.getElementById("arenaJoinCode");
    const roomCode = (input?.value || "").trim().toUpperCase();
    if(!roomCode){
      log("Informe o codigo da sala para entrar na arena.");
      return;
    }
    resetArenaState();
    arenaMultiplayer.isHost = false;
    arenaMultiplayer.roomCode = roomCode;
    arenaMultiplayer.peer = new Peer();
    arenaMultiplayer.peer.on("open", () => {
      const connection = arenaMultiplayer.peer.connect(roomCode, { reliable: true });
      arenaMultiplayer.hostConnection = connection;
      attachArenaConnection(connection);
      connection.on("open", () => {
        connection.send({
          type: "join",
          fighter: buildArenaProfile(player, arenaMultiplayer.peer?.id || "guest"),
          heroState: cloneData(player)
        });
        if(typeof triggerActionFeedback === "function"){
          triggerActionFeedback("arena", `Conectando a arena ${roomCode}.`, "info");
        }
        log(`Conectando a arena ${roomCode}...`);
        updateUI();
      });
    });
    arenaMultiplayer.peer.on("error", error => {
      log(`Erro na conexao da arena: ${error.type || error.message}.`);
      updateUI();
    });
  };

  window.leaveArenaRoom = function(){
    if(typeof triggerActionFeedback === "function"){
      triggerActionFeedback("arena", "Voce saiu da sala da arena.", "info");
    }
    resetArenaState();
    updateUI();
  };

  window.startArenaDuel = function(){
    if(!arenaMultiplayer.isHost || Object.keys(arenaMultiplayer.fighters).length < 2){ return; }
    prepareArenaHeroesForDuel();
    arenaMultiplayer.duelActive = true;
    const ids = Object.keys(arenaMultiplayer.heroStates);
    arenaMultiplayer.turnId = ids[Math.floor(Math.random() * ids.length)] || "";
    arenaMultiplayer.round = 1;
    syncArenaSceneFromState();
    if(typeof triggerActionFeedback === "function"){
      triggerActionFeedback("arena", "Duelo iniciado. Boa luta.", "success");
    }
    updateUI();
    const announcement = `O duelo comecou. ${getArenaTurnName()} joga primeiro.`;
    log(announcement);
    broadcastArenaState(announcement);
  };

  function sendArenaAction(action){
    if(!arenaMultiplayer.duelActive || !isMyArenaTurn()){ return; }
    if(arenaMultiplayer.isHost){
      resolveArenaAction({ ...action, actorId: arenaMultiplayer.peer?.id });
      return;
    }
    if(arenaMultiplayer.hostConnection?.open){
      arenaMultiplayer.hostConnection.send({ type: "arena_action", ...action });
    }
  }

  window.arenaAttack = function(){
    sendArenaAction({ kind: "basic" });
  };

  window.arenaUseSkill = function(index){
    sendArenaAction({ kind: "skill", skillIndex: index });
  };

  window.arenaPassTurn = function(){
    sendArenaAction({ kind: "pass" });
  };

  window.getArenaStatusMessage = function(){
    if(!arenaMultiplayer.peer){
      return "Crie uma sala ou entre com um codigo para desafiar outro jogador.";
    }
    if(!arenaMultiplayer.duelActive){
      return Object.keys(arenaMultiplayer.fighters).length >= 2 ? "Os dois duelistas estao prontos. O host ja pode iniciar o combate." : "Aguardando o segundo duelista entrar na sala.";
    }
    return `Duelo em andamento. Turno atual: ${getArenaTurnName()}.`;
  };

  function getArenaFighterListMarkup(){
    const currentId = arenaMultiplayer.turnId;
    return `<div class="party-list">${Object.values(arenaMultiplayer.fighters || {}).map(fighter => `
      <div class="party-entry ${fighter.id === arenaMultiplayer.peer?.id ? "local" : ""} ${fighter.id === currentId ? "active-turn" : ""} ${fighter.dead ? "down" : ""}">
        <div class="party-entry-head">
          <strong>${fighter.icon} ${fighter.name}</strong>
          <span class="party-turn-tag">${fighter.id === currentId ? "Turno atual" : fighter.dead ? "Derrotado" : "Aguardando"}</span>
        </div>
        <span class="lock-note">Vida ${fighter.hp}/${fighter.maxHp}</span>
        <div class="bar"><div class="fill hp" style="width:${Math.max(0, Math.min(100, (fighter.hp / Math.max(1, fighter.maxHp)) * 100))}%"></div></div>
        <span class="lock-note">Mana ${fighter.mp}/${fighter.maxMp}</span>
        <div class="bar"><div class="fill mp" style="width:${Math.max(0, Math.min(100, (fighter.mp / Math.max(1, fighter.maxMp)) * 100))}%"></div></div>
      </div>`).join("")}</div>`;
  }

  window.renderArenaRoomControls = function(){
    return `
      <div class="inventory-list">
        <div class="inventory-item">
          <strong>Sala de duelo</strong><br>
          <span class="lock-note">${arenaMultiplayer.isHost
            ? (arenaMultiplayer.roomCode ? `Sala criada. Compartilhe o codigo ${arenaMultiplayer.roomCode}.` : "Criando sala...")
            : arenaMultiplayer.peer
              ? `Conectado a sala ${arenaMultiplayer.roomCode}.`
              : "Crie uma sala ou informe um codigo para entrar em um duelo."}</span>
          ${arenaMultiplayer.roomCode ? `<div style="margin-top:10px;"><span class="room-pill">${arenaMultiplayer.roomCode}</span></div>` : ""}
          ${!arenaMultiplayer.peer ? `<div style="margin-top:10px;"><input id="arenaJoinCode" class="text-input" placeholder="Codigo da sala" maxlength="12" /></div>` : ""}
          <div class="button-row">
            <button onclick="hostArenaRoom()" ${arenaMultiplayer.peer ? "disabled" : ""}>Criar sala</button>
            <button onclick="joinArenaRoom()" ${arenaMultiplayer.peer ? "disabled" : ""}>Entrar</button>
            ${arenaMultiplayer.peer ? `<button onclick="leaveArenaRoom()">Sair da sala</button>` : ""}
          </div>
          ${arenaMultiplayer.isHost ? `<div class="button-row" style="margin-top:10px;"><button onclick="startArenaDuel()" ${Object.keys(arenaMultiplayer.fighters).length >= 2 && !arenaMultiplayer.duelActive ? "" : "disabled"}>Iniciar duelo</button></div>` : ""}
        </div>
        <div class="inventory-item">
          <strong>Combate</strong><br>
          <span class="lock-note">A iniciativa e sorteada aleatoriamente no inicio de cada duelo.</span><br>
          <span class="lock-note">Os turnos alternam entre os dois jogadores ate alguem cair.</span>
        </div>
        <div class="inventory-item">
          <strong>Duelistas</strong>
          ${getArenaFighterListMarkup()}
        </div>
      </div>`;
  };

  window.renderArenaActions = function(actions){
    const skills = getSkillInfo();
    if(isDead || player.hp <= 0){
      actions.innerHTML = `<button onclick="leaveArenaRoom()">Voltar para o lobby da arena</button>`;
      return;
    }
    if(!arenaMultiplayer.peer){
      actions.innerHTML = `<button onclick="hostArenaRoom()">Criar sala</button><button onclick="joinArenaRoom()">Entrar na sala</button><button onclick="returnToMainPage('battle')">Voltar para a campanha</button>`;
      return;
    }
    if(!arenaMultiplayer.duelActive){
      actions.innerHTML = `${arenaMultiplayer.isHost ? `<button onclick="startArenaDuel()" ${Object.keys(arenaMultiplayer.fighters).length >= 2 ? "" : "disabled"}>Iniciar duelo</button>` : `<button disabled>Aguardando o host iniciar</button>`}<button onclick="leaveArenaRoom()">Sair da sala</button>`;
      return;
    }
    if(!isMyArenaTurn()){
      actions.innerHTML = `<button disabled>Aguardando ${getArenaTurnName()} jogar...</button><button onclick="leaveArenaRoom()">Abandonar duelo</button>`;
      return;
    }
    const skillButtons = skills.length
      ? skills.map((skill, index) => renderSkillActionButton(skill, index, `arenaUseSkill(${index})`)).join("")
      : `<button disabled>Nenhuma habilidade ativa disponivel</button>`;
    actions.innerHTML = `${renderBasicActionButton(getBasicAttackLabel(), getBasicAttackTooltip(), "arenaAttack()")}${skillButtons}<button class="action-btn" onclick="arenaPassTurn()">Passar turno</button><button onclick="leaveArenaRoom()">Abandonar duelo</button>`;
  };

  if(IS_ARENA_PAGE){
    currentMode = "arena";
    if(typeof baseContinueCampaign === "function"){
      window.continueCampaign = function(){
        baseContinueCampaign();
        currentMode = "arena";
        enemy = null;
        updateUI();
      };
    }
    if(typeof baseSelectClass === "function"){
      window.selectClass = function(name){
        baseSelectClass(name);
        currentMode = "arena";
        enemy = null;
        updateUI();
      };
    }
    if(player){
      updateUI();
    }
  }
})();
