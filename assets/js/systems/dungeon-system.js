(function(){
  const DUNGEON_RUN_MODE = "dungeon_run";
  const baseSaveCampaign = window.saveCampaign;
  const baseGetTrophies = window.getTrophies;
  const baseRenderActions = window.renderActions;
  const baseUpdateUI = window.updateUI;
  const baseSetMode = window.setMode;
  const baseAdjustAttribute = window.adjustAttribute;
  const baseFinishLevelUp = window.finishLevelUp;
  const baseChooseSubclass = window.chooseSubclass;
  const baseRenderLevelUpPanel = window.renderLevelUpPanel;

  function cloneData(value){
    return JSON.parse(JSON.stringify(value));
  }

  function ensureDungeonRunContainers(){
    if(!dungeonMultiplayer.run){
      dungeonMultiplayer.run = createEmptyDungeonRunState();
    }
    if(!("localHero" in dungeonMultiplayer)){
      dungeonMultiplayer.localHero = null;
    }
    if(!Array.isArray(dungeonMultiplayer.localInventory)){
      dungeonMultiplayer.localInventory = [];
    }
    if(typeof dungeonMultiplayer.dungeonCoins !== "number"){
      dungeonMultiplayer.dungeonCoins = 0;
    }
    if(typeof dungeonMultiplayer.dungeonXp !== "number"){
      dungeonMultiplayer.dungeonXp = 0;
    }
    if(typeof dungeonMultiplayer.selectedEnemyId !== "string"){
      dungeonMultiplayer.selectedEnemyId = "";
    }
    if(typeof dungeonMultiplayer.intermissionView !== "string"){
      dungeonMultiplayer.intermissionView = "overview";
    }
    if(typeof dungeonMultiplayer.localRunId !== "string"){
      dungeonMultiplayer.localRunId = "";
    }
    if(!dungeonMultiplayer.heroStates || typeof dungeonMultiplayer.heroStates !== "object"){
      dungeonMultiplayer.heroStates = {};
    }
  }

  function createEmptyDungeonRunState(){
    return {
      active: false,
      phase: "lobby",
      runId: "",
      regionIndex: 0,
      encounterIndex: 0,
      round: 1,
      enemies: [],
      turnOrder: [],
      turnIndex: 0,
      lastRewards: null,
      lastEncounterWasBoss: false,
      shopStock: []
    };
  }

  ensureDungeonRunContainers();

  window.isDungeonRunMode = function(){
    return currentMode === DUNGEON_RUN_MODE;
  };

  isDungeonMode = window.isDungeonMode = function(){
    return currentMode === "dungeon" || currentMode === DUNGEON_RUN_MODE;
  };

  function getDungeonRun(){
    ensureDungeonRunContainers();
    return dungeonMultiplayer.run;
  }

  function hasActiveDungeonRun(){
    return !!getDungeonRun().active;
  }

  function getDungeonRegionOrder(){
    return Object.keys(regions);
  }

  function getDungeonTotalEncounterCount(){
    return getDungeonRegionOrder().length * 7;
  }

  getDungeonSequence = window.getDungeonSequence = function(){
    return getDungeonRegionOrder().flatMap(regionName => {
      const regionData = regions[regionName];
      const commonTemplate = regionData?.enemies?.[0] || regionData?.boss || { name: regionName, level: 1 };
      const encounters = [];
      for(let encounter = 0; encounter < 6; encounter++){
        encounters.push({
          regionName,
          encounterIndex: encounter,
          isBoss: false,
          template: cloneData(commonTemplate)
        });
      }
      encounters.push({
        regionName,
        encounterIndex: 6,
        isBoss: true,
        template: cloneData(regionData?.boss || commonTemplate)
      });
      return encounters;
    });
  };

  function getDungeonRegionName(regionIndex = getDungeonRun().regionIndex || 0){
    return getDungeonRegionOrder()[Math.min(Math.max(0, regionIndex), Math.max(0, getDungeonRegionOrder().length - 1))] || getDungeonRegionOrder()[0];
  }

  function isDungeonBossEncounter(encounterIndex = getDungeonRun().encounterIndex || 0){
    return encounterIndex >= 6;
  }

  function getDungeonEncounterPool(regionName, encounterIndex){
    const regionData = regions[regionName];
    if(!regionData){ return []; }
    if(isDungeonBossEncounter(encounterIndex)){
      return [regionData.boss];
    }
    const allowedRarities = encounterIndex < 2
      ? ["comum"]
      : encounterIndex < 4
        ? ["comum", "incomum"]
        : ["comum", "incomum", "rara"];
    return regionData.enemies.filter(template => allowedRarities.includes(getEnemyRarity(regionName, template.name, false).key));
  }

  function chooseDungeonEncounterEnemyCount(partySize, encounterIndex){
    if(partySize <= 1 || isDungeonBossEncounter(encounterIndex)){
      return 1;
    }
    if(encounterIndex < 2){
      return Math.random() < 0.22 ? Math.min(2, partySize) : 1;
    }
    if(encounterIndex < 4){
      if(partySize >= 3){
        const roll = Math.random();
        if(roll < 0.48){ return 2; }
        if(roll < 0.62){ return 3; }
        return 1;
      }
      return Math.random() < 0.58 ? 2 : 1;
    }
    if(partySize >= 3){
      const roll = Math.random();
      if(roll < 0.2){ return 1; }
      if(roll < 0.65){ return 2; }
      return 3;
    }
    return Math.random() < 0.72 ? 2 : 1;
  }

  function createDungeonEncounterEnemies(regionName, encounterIndex){
    const regionData = regions[regionName];
    if(!regionData){ return []; }
    const partySize = Math.max(1, getDungeonRoomMembers().filter(member => !member.dead).length || 1);
    if(isDungeonBossEncounter(encounterIndex)){
      const scaledBoss = createEnemyFromTemplate({
        ...regionData.boss,
        level: Math.max(1, regionData.boss.level * partySize)
      }, true, regionName);
      scaledBoss.instanceId = `boss_${slugify(regionName)}_${Date.now()}`;
      scaledBoss.baseName = regionData.boss.name;
      scaledBoss.name = `${regionData.boss.name} Lv.${scaledBoss.level}`;
      return [scaledBoss];
    }
    const pool = getDungeonEncounterPool(regionName, encounterIndex);
    const enemyCount = chooseDungeonEncounterEnemyCount(partySize, encounterIndex);
    const scaleMultiplier = Math.max(1, partySize / Math.max(1, enemyCount));
    return Array.from({ length: enemyCount }, (_, index) => {
      const template = chooseWeightedEnemy(pool, { regionName, applyLevelAdjustment: false });
      const scaledEnemy = createEnemyFromTemplate({
        ...template,
        level: Math.max(1, Math.ceil(template.level * scaleMultiplier))
      }, false, regionName);
      scaledEnemy.instanceId = `${slugify(regionName)}_${slugify(template.name)}_${encounterIndex}_${index}_${Date.now()}_${Math.floor(Math.random() * 999)}`;
      scaledEnemy.baseName = template.name;
      scaledEnemy.name = `${template.name} Lv.${scaledEnemy.level}`;
      return scaledEnemy;
    });
  }

  function getDungeonEncounterProgressText(){
    const run = getDungeonRun();
    const regionName = getDungeonRegionName(run.regionIndex);
    if(!hasActiveDungeonRun()){
      return "Monte o grupo e adentre a dungeon quando estiverem prontos.";
    }
    if(run.phase === "intermission"){
      return `${regionName} | Intermissao apos ${run.lastEncounterWasBoss ? "o chefao" : `a batalha ${Math.max(1, run.encounterIndex)}/6`}`;
    }
    if(run.phase === "battle"){
      return `${regionName} | ${isDungeonBossEncounter(run.encounterIndex) ? "Chefao da regiao" : `Batalha ${run.encounterIndex + 1}/6`} | Rodada ${run.round}`;
    }
    return `${regionName} | Expedicao em andamento`;
  }

  function getDungeonEncounterLabel(){
    const run = getDungeonRun();
    return isDungeonBossEncounter(run.encounterIndex) ? "Chefao da regiao" : `Batalha ${run.encounterIndex + 1}/6`;
  }

  function getDungeonLocalHero(){
    ensureDungeonRunContainers();
    return dungeonMultiplayer.localHero;
  }

  function setDungeonLocalHero(hero){
    ensureDungeonRunContainers();
    dungeonMultiplayer.localHero = hero;
  }

  function getDungeonLocalInventory(){
    ensureDungeonRunContainers();
    return dungeonMultiplayer.localInventory;
  }

  function getDungeonActorName(hero = getDungeonLocalHero()){
    return hero ? `${getDisplayedClassName(hero)} Lv.${hero.level}` : "Heroi";
  }

  function withDungeonHeroContext(hero, targetEnemy, callback){
    const savedPlayer = player;
    const savedEffects = playerEffects;
    const savedEnemy = enemy;
    const savedDisplayState = displayState;
    const savedMode = currentMode;
    const savedPendingLevelUps = pendingLevelUps;
    const savedLevelUpPoints = levelUpPoints;
    const savedAllocation = allocation;
    player = hero;
    playerEffects = hero.effects || createDefaultPlayerEffects();
    enemy = targetEnemy;
    currentMode = DUNGEON_RUN_MODE;
    pendingLevelUps = Number(hero.pendingLevelUps) || 0;
    levelUpPoints = Number(hero.levelUpPoints) || 0;
    allocation = cloneData(hero.allocation || { strength: 0, wisdom: 0, vitality: 0 });
    displayState = {
      playerHp: hero.hp,
      playerMp: hero.mp,
      playerXp: hero.xp,
      enemyHp: targetEnemy ? targetEnemy.hp : null
    };
    try{
      const result = callback();
      hero.effects = playerEffects;
      hero.pendingLevelUps = pendingLevelUps;
      hero.levelUpPoints = levelUpPoints;
      hero.allocation = cloneData(allocation || { strength: 0, wisdom: 0, vitality: 0 });
      return { result, hero, enemy: targetEnemy };
    }finally{
      player = savedPlayer;
      playerEffects = savedEffects;
      enemy = savedEnemy;
      displayState = savedDisplayState;
      currentMode = savedMode;
      pendingLevelUps = savedPendingLevelUps;
      levelUpPoints = savedLevelUpPoints;
      allocation = savedAllocation;
    }
  }

  function getDungeonPreviewStats(hero = getDungeonLocalHero()){
    if(!hero){ return { maxHp: 0, maxMp: 0, attack: 0 }; }
    return cloneData(withDungeonHeroContext(hero, null, () => getPreviewStats()).result);
  }

  function getDungeonSkillInfo(targetEnemy = null, hero = getDungeonLocalHero()){
    if(!hero){ return []; }
    return cloneData(withDungeonHeroContext(hero, targetEnemy, () => getSkillInfo()).result);
  }

  function getDungeonPassiveModifiers(hero = getDungeonLocalHero()){
    if(!hero){ return {}; }
    return cloneData(withDungeonHeroContext(hero, null, () => getPassiveModifiers()).result);
  }

  function buildDungeonHeroProfile(hero = getDungeonLocalHero()){
    const sourceHero = hero || player;
    const previewStats = hero ? getDungeonPreviewStats(hero) : getPreviewStats();
    const effectState = hero?.effects || createDefaultPlayerEffects();
    return {
      id: dungeonMultiplayer.peer?.id || "local",
      name: `${getDisplayedClassName(sourceHero)} Lv.${sourceHero.level}`,
      class: sourceHero.class,
      displayedClassName: getDisplayedClassName(sourceHero),
      level: sourceHero.level,
      icon: getHeroSpriteIcon(sourceHero),
      hp: sourceHero.hp,
      maxHp: previewStats.maxHp,
      mp: sourceHero.mp,
      maxMp: previewStats.maxMp,
      shieldValue: effectState.shieldValue || 0,
      dead: sourceHero.hp <= 0,
      aggroTurns: sourceHero.aggroTurns || 0,
      aggroPower: sourceHero.aggroPower || 0,
      coins: hero ? (hero.dungeonCoins || 0) : (dungeonMultiplayer.dungeonCoins || 0),
      xp: sourceHero.xp || 0,
      xpToNextLevel: hero ? withDungeonHeroContext(hero, null, () => getXpToNextLevel()).result : getXpToNextLevel(),
      levelUpPoints: Number(sourceHero.levelUpPoints) || 0
    };
  }

  getDungeonPlayerProfile = window.getDungeonPlayerProfile = function(){
    return buildDungeonHeroProfile(hasActiveDungeonRun() ? getDungeonLocalHero() : null);
  };

  function initializeDungeonLocalHero(){
    const hero = cloneData(player);
    hero.inventory = [];
    hero.effects = createDefaultPlayerEffects();
    hero.aggroTurns = 0;
    hero.aggroPower = 0;
    hero.pendingLevelUps = 0;
    hero.levelUpPoints = 0;
    hero.allocation = { strength: 0, wisdom: 0, vitality: 0 };
    hero.dungeonCoins = 0;
    hero.syncVersion = 0;
    hero.hp = player.hp;
    hero.mp = player.mp;
    const fullStats = getDungeonPreviewStats(hero);
    hero.hp = fullStats.maxHp;
    hero.mp = fullStats.maxMp;
    setDungeonLocalHero(hero);
    dungeonMultiplayer.dungeonCoins = 0;
    dungeonMultiplayer.localInventory = [];
    dungeonMultiplayer.intermissionView = "overview";
    dungeonMultiplayer.selectedEnemyId = "";
    if(dungeonMultiplayer.peer?.id){
      dungeonMultiplayer.heroStates[dungeonMultiplayer.peer.id] = cloneData(hero);
    }
    return hero;
  }

  function clearDungeonLocalHero(){
    setDungeonLocalHero(null);
    dungeonMultiplayer.localInventory = [];
    dungeonMultiplayer.dungeonCoins = 0;
    dungeonMultiplayer.localRunId = "";
    dungeonMultiplayer.selectedEnemyId = "";
    dungeonMultiplayer.intermissionView = "overview";
    dungeonMultiplayer.heroStates = {};
  }

  function ensureDungeonRunHeroInitialized(runId){
    if(!getDungeonLocalHero() || dungeonMultiplayer.localRunId !== runId){
      initializeDungeonLocalHero();
      dungeonMultiplayer.localRunId = runId;
    }
  }

  function isDungeonConnected(){
    return !!(dungeonMultiplayer.peer && (dungeonMultiplayer.isHost || dungeonMultiplayer.hostConnection?.open));
  }

  function isDungeonHost(){
    return !!(dungeonMultiplayer.peer && dungeonMultiplayer.isHost);
  }

  function getDungeonRoomMembers(){
    ensureDungeonRunContainers();
    return Object.values(dungeonMultiplayer.party || {});
  }

  function buildDungeonTurnOrder(){
    const livingHeroes = Object.keys(dungeonMultiplayer.party || {}).filter(peerId => !dungeonMultiplayer.party[peerId]?.dead);
    const livingEnemies = getDungeonRun().enemies.filter(target => target.hp > 0).map(target => target.instanceId);
    return [...livingHeroes, ...livingEnemies];
  }

  function syncDungeonTurnOrder(){
    const run = getDungeonRun();
    const previousEntryId = run.turnOrder[run.turnIndex] || "";
    run.turnOrder = buildDungeonTurnOrder();
    if(!run.turnOrder.length){
      run.turnIndex = 0;
      return;
    }
    const nextIndex = run.turnOrder.indexOf(previousEntryId);
    run.turnIndex = nextIndex >= 0 ? nextIndex : Math.min(run.turnIndex, run.turnOrder.length - 1);
  }

  function getDungeonCurrentTurnEntry(){
    const run = getDungeonRun();
    const entryId = run.turnOrder[run.turnIndex] || null;
    if(!entryId){ return null; }
    const enemyEntry = run.enemies.find(target => target.instanceId === entryId && target.hp > 0);
    if(enemyEntry){
      return { kind: "enemy", id: entryId, enemy: enemyEntry };
    }
    const heroEntry = dungeonMultiplayer.party[entryId];
    if(heroEntry && !heroEntry.dead){
      return { kind: "hero", id: entryId, hero: heroEntry };
    }
    return null;
  }

  getDungeonCurrentTurnId = window.getDungeonCurrentTurnId = function(){
    return getDungeonCurrentTurnEntry()?.id || null;
  };

  isMyDungeonTurn = window.isMyDungeonTurn = function(){
    const entry = getDungeonCurrentTurnEntry();
    return !!entry && entry.kind === "hero" && entry.id === dungeonMultiplayer.peer?.id && getDungeonRun().phase === "battle";
  };

  function ensureDungeonSelectedEnemy(){
    if(!isDungeonRunMode()){ return; }
    const firstLiving = getDungeonRun().enemies.find(target => target.hp > 0);
    if(!firstLiving){
      dungeonMultiplayer.selectedEnemyId = "";
      return;
    }
    if(!getDungeonRun().enemies.some(target => target.instanceId === dungeonMultiplayer.selectedEnemyId && target.hp > 0)){
      dungeonMultiplayer.selectedEnemyId = firstLiving.instanceId;
    }
  }

  function getDungeonSelectedEnemy(){
    ensureDungeonSelectedEnemy();
    return getDungeonRun().enemies.find(target => target.instanceId === dungeonMultiplayer.selectedEnemyId) || null;
  }

  window.selectDungeonTarget = function(enemyId){
    if(!isDungeonRunMode() || !getDungeonRun().enemies.some(target => target.instanceId === enemyId && target.hp > 0)){
      return;
    }
    dungeonMultiplayer.selectedEnemyId = enemyId;
    updateUI();
  };

  function createDungeonBroadcastPayload(){
    return {
      type: "state",
      roomCode: dungeonMultiplayer.roomCode,
      party: cloneData(dungeonMultiplayer.party),
      run: cloneData(getDungeonRun()),
      heroStates: cloneData(dungeonMultiplayer.heroStates || {})
    };
  }

  function broadcastToDungeonPeers(payload, skipPeerId = ""){
    Object.values(dungeonMultiplayer.connections || {}).forEach(connection => {
      if(connection?.open && connection.peer !== skipPeerId){
        connection.send(payload);
      }
    });
  }

  broadcastDungeonState = window.broadcastDungeonState = function(){
    if(!isDungeonHost()){ return; }
    ensureDungeonRunContainers();
    if(hasActiveDungeonRun() && dungeonMultiplayer.peer?.id){
      dungeonMultiplayer.heroStates[dungeonMultiplayer.peer.id] = cloneData(getDungeonLocalHero());
    }
    dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = buildDungeonHeroProfile(hasActiveDungeonRun() ? getDungeonLocalHero() : null);
    broadcastToDungeonPeers(createDungeonBroadcastPayload());
  };

  syncDungeonProfile = window.syncDungeonProfile = function(){
    if(!isDungeonConnected()){ return; }
    const profile = buildDungeonHeroProfile(hasActiveDungeonRun() ? getDungeonLocalHero() : null);
    if(isDungeonHost()){
      if(hasActiveDungeonRun() && dungeonMultiplayer.peer?.id){
        dungeonMultiplayer.heroStates[dungeonMultiplayer.peer.id] = cloneData(getDungeonLocalHero());
      }
      dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = profile;
      broadcastDungeonState();
    }else if(dungeonMultiplayer.hostConnection?.open){
      dungeonMultiplayer.hostConnection.send({ type: "profile_update", player: profile });
      if(hasActiveDungeonRun()){
        dungeonMultiplayer.hostConnection.send({ type: "hero_state", heroState: cloneData(getDungeonLocalHero()) });
      }
    }
  };

  function updateDungeonBestStep(step){
    player.stats.dungeonBestStep = Math.max(player.stats.dungeonBestStep || 0, step);
  }

  function getDungeonStepNumber(run = getDungeonRun()){
    return run.regionIndex * 7 + run.encounterIndex + 1;
  }

  function syncMainHeroFromDungeonHero(){
    const dungeonHero = getDungeonLocalHero();
    if(!dungeonHero || !player){ return; }
    const preservedInventory = cloneData(player.inventory || []);
    const preservedEquipment = cloneData(player.equipment || {});
    const preservedEffects = cloneData(playerEffects || createDefaultPlayerEffects());
    const preservedCoins = player.coins || 0;
    const preservedStats = cloneData(player.stats || {});
    player.level = dungeonHero.level;
    player.xp = dungeonHero.xp;
    player.maxHp = dungeonHero.maxHp;
    player.maxMp = dungeonHero.maxMp;
    player.attack = dungeonHero.attack;
    player.hp = dungeonHero.hp;
    player.mp = dungeonHero.mp;
    player.subclassChoices = cloneData(dungeonHero.subclassChoices || {});
    player.activeSkills = cloneData(dungeonHero.activeSkills || player.activeSkills || []);
    player.passiveSkills = cloneData(dungeonHero.passiveSkills || player.passiveSkills || []);
    player.baseStats = cloneData(dungeonHero.baseStats || player.baseStats);
    player.stats = { ...preservedStats, ...(cloneData(dungeonHero.stats || {})) };
    player.inventory = preservedInventory;
    player.equipment = preservedEquipment;
    player.coins = preservedCoins;
    playerEffects = preservedEffects;
    pendingLevelUps = Number(dungeonHero.pendingLevelUps) || 0;
    levelUpPoints = Number(dungeonHero.levelUpPoints) || 0;
    allocation = cloneData(dungeonHero.allocation || { strength: 0, wisdom: 0, vitality: 0 });
    const caps = getCurrentCaps();
    player.hp = Math.min(caps.maxHp, player.hp);
    player.mp = Math.min(caps.maxMp, player.mp);
    displayState.playerHp = player.hp;
    displayState.playerMp = player.mp;
    displayState.playerXp = player.xp;
  }

  function applyDungeonRewardsToMain(reasonLabel = "a incursao"){
    const gainedCoins = dungeonMultiplayer.dungeonCoins || 0;
    syncMainHeroFromDungeonHero();
    if(gainedCoins > 0){
      player.coins += gainedCoins;
      player.stats.coinsEarned = (player.stats.coinsEarned || 0) + gainedCoins;
    }
    if(gainedCoins > 0){
      log(`Ao deixar ${reasonLabel}, voce levou ${gainedCoins} moedas para a campanha principal e preservou o nivel alcancado na run.`);
    }
  }

  function resetDungeonRuntimeState(){
    dungeonMultiplayer.run = createEmptyDungeonRunState();
    clearDungeonLocalHero();
  }

  function closeDungeonConnections(){
    Object.values(dungeonMultiplayer.connections || {}).forEach(connection => {
      try { connection.close(); } catch {}
    });
    if(dungeonMultiplayer.hostConnection){
      try { dungeonMultiplayer.hostConnection.close(); } catch {}
    }
    if(dungeonMultiplayer.peer){
      try { dungeonMultiplayer.peer.destroy(); } catch {}
    }
  }

  function finishDungeonRun(message, reasonLabel){
    applyDungeonRewardsToMain(reasonLabel);
    resetDungeonRuntimeState();
    closeDungeonConnections();
    dungeonMultiplayer = createDungeonMultiplayerState();
    ensureDungeonRunContainers();
    currentMode = window.IS_DUNGEON_PAGE ? "dungeon" : "battle";
    if(message){
      log(message);
    }
    updateUI();
  }

  function getDungeonSkillTargetMode(skillInfo){
    const selfOnlySkills = new Set([
      "warrior_second_wind", "warrior_warcry", "warrior_valhalla", "warrior_smoke_bomb",
      "warrior_faith_shield", "warrior_unstoppable", "warrior_ultrasonic_cuts",
      "mage_concentration", "mage_mana_shield", "mage_demon_form",
      "archer_focus", "archer_camouflage",
      "nature_true_form", "nature_crown", "nature_vine_cocoon"
    ]);
    const partySkills = new Set(["nature_ancestral_song"]);
    const areaSkills = new Set(["mage_blizzard", "mage_avalanche", "nature_queen_decree"]);
    if(selfOnlySkills.has(skillInfo.type)){ return "self"; }
    if(partySkills.has(skillInfo.type)){ return "party"; }
    if(areaSkills.has(skillInfo.type)){ return "all_enemies"; }
    return "single";
  }

  function getDungeonAggroData(skillInfo){
    const values = {
      warrior_shove: { turns: 2, power: 2 },
      warrior_stagger: { turns: 2, power: 3 },
      warrior_warcry: { turns: 3, power: 4 },
      warrior_judgment: { turns: 2, power: 3 },
      warrior_faith_shield: { turns: 3, power: 5 },
      nature_vine_cocoon: { turns: 2, power: 2 },
      nature_true_form: { turns: 2, power: 2 }
    };
    return values[skillInfo.type] || null;
  }

  function applyDungeonAggroToHero(hero, skillInfo){
    const aggroData = getDungeonAggroData(skillInfo);
    if(!aggroData){ return; }
    hero.aggroTurns = Math.max(hero.aggroTurns || 0, aggroData.turns);
    hero.aggroPower = Math.max(hero.aggroPower || 0, aggroData.power);
  }

  function tickDungeonAggro(){
    Object.values(dungeonMultiplayer.party || {}).forEach(member => {
      if(member.aggroTurns > 0){
        member.aggroTurns--;
        if(member.aggroTurns <= 0){
          member.aggroPower = 0;
        }
      }
    });
    const localHero = getDungeonLocalHero();
    if(localHero?.aggroTurns > 0){
      localHero.aggroTurns--;
      if(localHero.aggroTurns <= 0){
        localHero.aggroPower = 0;
      }
    }
  }

  function processDungeonHeroStartEffects(hero, targetEnemy){
    return withDungeonHeroContext(hero, targetEnemy, () => {
      const messages = [];
      if(playerEffects.burnTurns > 0 && playerEffects.burnDamagePerTurn > 0){
        const burnReduction = getPassiveModifiers().burnDamageReductionPercent || 0;
        const burnDamage = Math.max(0, Math.floor(playerEffects.burnDamagePerTurn * (1 - burnReduction)));
        if(burnDamage >= player.hp && getPassiveModifiers().fatalSaveHealPercent > 0 && !playerEffects.accessoryFatalSaveUsed){
          playerEffects.accessoryFatalSaveUsed = true;
          const healAmount = Math.max(1, Math.floor(getCurrentCaps().maxHp * getPassiveModifiers().fatalSaveHealPercent));
          const healed = healPlayer(healAmount);
          messages.push(`O acessorio salvou sua vida da queimadura e restaurou ${healed} de vida.`);
        }else{
          player.hp = Math.max(0, player.hp - burnDamage);
          messages.push(`Voce sofreu ${burnDamage} de dano por queimadura.`);
        }
        playerEffects.burnTurns--;
        if(playerEffects.burnTurns <= 0){
          playerEffects.burnDamagePerTurn = 0;
        }
        if(player.hp <= 0){
          return { messages, defeated: true, skipped: false };
        }
      }
      if(playerEffects.skipNextTurn){
        playerEffects.skipNextTurn = false;
        applyTurnStartPassives();
        messages.push("O inimigo controlou o ritmo da luta e voce perdeu o turno.");
        decayPlayerBuffs();
        applyEndOfTurnRecovery();
        return { messages, defeated: false, skipped: true };
      }
      return { messages, defeated: false, skipped: false };
    }).result;
  }

  function replaceDungeonEnemy(updatedEnemy){
    const run = getDungeonRun();
    const enemyIndex = run.enemies.findIndex(target => target.instanceId === updatedEnemy.instanceId);
    if(enemyIndex >= 0){
      run.enemies[enemyIndex] = cloneData(updatedEnemy);
    }
  }

  function logDungeonMessages(messages){
    (messages || []).forEach(message => {
      if(message){
        log(message);
      }
    });
  }

  function applyDungeonPartyEffectToLocalHero(effect){
    const localHero = getDungeonLocalHero();
    if(!localHero){ return; }
    withDungeonHeroContext(localHero, getDungeonSelectedEnemy(), () => {
      if(effect.heal > 0){
        const healed = healPlayer(effect.heal);
        if(healed > 0){
          log(`${effect.sourceName || "Um aliado"} restaurou ${healed} de vida na equipe.`);
        }
      }
      if(effect.shield > 0){
        const shield = grantPlayerShield(effect.shield);
        if(shield > 0){
          log(`${effect.sourceName || "Um aliado"} concedeu ${shield} de escudo a equipe.`);
        }
      }
    });
    syncDungeonProfile();
  }

  function getDungeonShopPrice(item){
    if(item.type === "consumable"){
      return Math.max(12, Math.ceil((consumableCatalog[item.id]?.price || 24) * 1.25));
    }
    return Math.max(25, Math.ceil(getSellPrice(item) * 2.2));
  }

  function createDungeonShopStock(regionName){
    const stock = [];
    ["health_potion", "mana_potion", "skill_tonic", "attack_tonic"].forEach(id => {
      if(consumableCatalog[id]){
        stock.push({
          id: `offer_${id}`,
          offerType: "consumable",
          item: createConsumableItem(id, 1),
          cost: getDungeonShopPrice({ id, type: "consumable" })
        });
      }
    });
    const classWeapon = getRegionSetTemplate(regionName, "weapon", player.class);
    const armorTemplates = ["head", "chest", "legs", "feet"]
      .map(slot => getRegionSetTemplate(regionName, slot, player.class))
      .filter(Boolean);
    const equipmentPool = [...armorTemplates, classWeapon].filter(Boolean);
    for(let index = 0; index < 4; index++){
      const template = equipmentPool[Math.floor(Math.random() * equipmentPool.length)];
      const rarityRoll = Math.random();
      const rarity = rarityRoll < 0.6 ? "comum" : rarityRoll < 0.83 ? "incomum" : rarityRoll < 0.96 ? "rara" : "ultra_rara";
      const item = createEquipmentItem(template, rarity);
      stock.push({
        id: `offer_equipment_${index}_${Date.now()}_${Math.floor(Math.random() * 999)}`,
        offerType: "equipment",
        item,
        cost: getDungeonShopPrice(item)
      });
    }
    return stock;
  }

  function addDungeonInventoryItem(item){
    const inventory = getDungeonLocalInventory();
    const normalizedItem = normalizeEquipmentMetadata({ ...item, uid: item.uid || `${item.id}_${Date.now()}_${Math.floor(Math.random() * 999)}` });
    const stackable = ["equipment", "consumable", "chest"].includes(normalizedItem.type);
    if(stackable){
      const existing = inventory.find(entry =>
        entry.type === normalizedItem.type
        && entry.id === normalizedItem.id
        && (entry.rarity || "") === (normalizedItem.rarity || "")
        && (entry.baseItemId || "") === (normalizedItem.baseItemId || "")
      );
      if(existing){
        existing.qty = (existing.qty || 1) + (normalizedItem.qty || 1);
        return;
      }
    }
    if(stackable && !normalizedItem.qty){
      normalizedItem.qty = 1;
    }
    inventory.push(normalizedItem);
  }

  function removeDungeonInventoryUnit(itemIndex){
    const inventory = getDungeonLocalInventory();
    const item = inventory[itemIndex];
    if(!item){ return; }
    if((item.qty || 1) > 1){
      item.qty--;
    }else{
      inventory.splice(itemIndex, 1);
    }
  }

  window.buyDungeonOffer = function(offerId){
    if(!isDungeonRunMode() || getDungeonRun().phase !== "intermission"){ return; }
    const hero = getDungeonLocalHero();
    const offer = getDungeonRun().shopStock.find(entry => entry.id === offerId);
    if(!offer){
      log("Essa oferta nao esta mais disponivel.");
      return;
    }
    if((dungeonMultiplayer.dungeonCoins || 0) < offer.cost){
      log(`Voce precisa de ${offer.cost} moedas da dungeon para comprar ${offer.item.name}.`);
      return;
    }
    dungeonMultiplayer.dungeonCoins -= offer.cost;
    if(hero){
      hero.dungeonCoins = dungeonMultiplayer.dungeonCoins;
      bumpDungeonHeroStateVersion(hero);
    }
    addDungeonInventoryItem(cloneData(offer.item));
    player.stats.dungeonShopPurchases = (player.stats.dungeonShopPurchases || 0) + 1;
    log(`Voce comprou ${offer.item.name} por ${offer.cost} moedas da dungeon.`);
    syncDungeonProfile();
    updateUI();
  };

  window.equipDungeonItem = function(itemUid){
    const hero = getDungeonLocalHero();
    const inventory = getDungeonLocalInventory();
    if(!hero){ return; }
    const itemIndex = inventory.findIndex(entry => entry.uid === itemUid);
    if(itemIndex < 0){ return; }
    const item = inventory[itemIndex];
    if(item.type !== "equipment"){ return; }
    if(item.classRestriction && item.classRestriction !== hero.class){
      log(`Somente ${item.classRestriction} pode equipar ${item.name}.`);
      return;
    }
    const equipped = hero.equipment?.[item.slot] || null;
    removeDungeonInventoryUnit(itemIndex);
    if(equipped){
      addDungeonInventoryItem(cloneData(equipped));
    }
    hero.equipment[item.slot] = cloneData(item);
    bumpDungeonHeroStateVersion(hero);
    const caps = getDungeonPreviewStats(hero);
    hero.hp = Math.min(caps.maxHp, hero.hp);
    hero.mp = Math.min(caps.maxMp, hero.mp);
    log(`${item.name} foi equipada na expedicao.`);
    syncDungeonProfile();
    updateUI();
  };

  window.useDungeonConsumable = function(itemUid){
    const hero = getDungeonLocalHero();
    const inventory = getDungeonLocalInventory();
    if(!hero){ return; }
    const itemIndex = inventory.findIndex(entry => entry.uid === itemUid);
    if(itemIndex < 0){ return; }
    const item = inventory[itemIndex];
    const config = consumableCatalog[item.id];
    if(item.type !== "consumable" || !config){ return; }
    withDungeonHeroContext(hero, getDungeonSelectedEnemy(), () => {
      if(config.effectType === "restore_hp"){
        const healed = healPlayer(config.value);
        log(`Voce usou ${config.name} e recuperou ${healed} de vida.`);
      }
      if(config.effectType === "restore_hp_percent"){
        const healed = healPlayer(Math.floor(getCurrentCaps().maxHp * config.value));
        log(`Voce usou ${config.name} e recuperou ${healed} de vida.`);
      }
      if(config.effectType === "restore_mana_percent"){
        const manaBefore = player.mp;
        player.mp = Math.min(getCurrentCaps().maxMp, player.mp + Math.max(1, Math.floor(getCurrentCaps().maxMp * config.value)));
        log(`Voce usou ${config.name} e recuperou ${player.mp - manaBefore} de mana.`);
      }
      if(config.effectType === "buff_skill"){
        playerEffects.skillBuffTurns = Math.max(playerEffects.skillBuffTurns, config.turns);
        if(config.isPercent){
          playerEffects.skillBuffPercent = Math.max(playerEffects.skillBuffPercent, config.value);
          log(`Voce usou ${config.name} e ganhou +${Math.floor(config.value * 100)}% de dano de habilidade por ${config.turns} turnos.`);
        }
      }
      if(config.effectType === "buff_attack"){
        playerEffects.attackBuffTurns = Math.max(playerEffects.attackBuffTurns, config.turns);
        if(config.isPercent){
          playerEffects.attackBuffPercent = Math.max(playerEffects.attackBuffPercent, config.value);
          log(`Voce usou ${config.name} e ganhou +${Math.floor(config.value * 100)}% de dano de ataque por ${config.turns} turnos.`);
        }
      }
    });
    bumpDungeonHeroStateVersion(hero);
    removeDungeonInventoryUnit(itemIndex);
    syncDungeonProfile();
    updateUI();
  };

  function getDungeonPartyListMarkup(){
    const members = getDungeonRoomMembers();
    if(!members.length){
      return `<p class="lock-note">Nenhum aventureiro conectado ainda.</p>`;
    }
    return `<div class="party-list">${members.map(member => `
      <div class="party-entry">
        <strong>${member.icon} ${member.name}</strong><br>
        <span class="lock-note">${member.hp ?? 0}/${member.maxHp ?? 0} HP | ${member.mp ?? 0}/${member.maxMp ?? 0} MP</span><br>
        ${member.shieldValue > 0 ? `<span class="status-on">Escudo ${member.shieldValue}</span><br>` : ""}
        ${member.aggroTurns > 0 ? `<span class="status-off">Agressao por ${member.aggroTurns} turno(s)</span>` : `<span class="lock-note">Sem agressao extra</span>`}
      </div>`).join("")}</div>`;
  }

  function renderDungeonRoomControls(){
    const canManageRoom = !isDead && player.hp > 0;
    const canStart = isDungeonHost() && getDungeonRoomMembers().length >= 2 && !hasActiveDungeonRun();
    return `
      <div class="inventory-list">
        <div class="inventory-item">
          <strong>Sala online</strong><br>
          <span class="lock-note">${isDungeonHost()
            ? (dungeonMultiplayer.roomCode ? `Sala criada. Compartilhe o codigo ${dungeonMultiplayer.roomCode}.` : "Criando sala...")
            : isDungeonConnected()
              ? `Conectado a sala ${dungeonMultiplayer.roomCode}.`
              : "Crie uma sala ou entre com um codigo para jogar com ate 2 amigos."}</span>
          ${dungeonMultiplayer.roomCode ? `<div style="margin-top:10px;"><span class="room-pill">${dungeonMultiplayer.roomCode}</span></div>` : ""}
          ${!isDungeonConnected() ? `<div style="margin-top:10px;"><input id="dungeonJoinCode" class="text-input" placeholder="Codigo da sala" maxlength="12" /></div>` : ""}
          <div class="button-row">
            <button onclick="hostDungeonRoom()" ${isDungeonConnected() || !canManageRoom ? "disabled" : ""}>Criar sala</button>
            <button onclick="joinDungeonRoom()" ${isDungeonConnected() || !canManageRoom ? "disabled" : ""}>Entrar</button>
            ${isDungeonConnected() ? `<button onclick="leaveDungeonRoom()">Fechar sala</button>` : ""}
          </div>
          ${isDungeonHost() ? `<div class="button-row"><button onclick="startDungeonRaid()" ${canStart ? "" : "disabled"}>Adentrar dungeon</button></div>` : ""}
        </div>
        <div class="inventory-item">
          <strong>Progressao da run</strong><br>
          <span class="lock-note">Cada regiao possui 6 batalhas antes do chefao.</span><br>
          <span class="lock-note">As batalhas 1 e 2 so enfrentam inimigos comuns. As 3 e 4 misturam comuns e incomuns. As 5 e 6 podem trazer qualquer raridade da regiao.</span><br>
          <span class="lock-note">Se houver menos inimigos que herois, o nivel dos monstros sobe proporcionalmente.</span>
        </div>
        <div class="inventory-item">
          <strong>Equipe</strong>
          ${getDungeonPartyListMarkup()}
        </div>
      </div>`; 
  }

  window.renderDungeonRoomControls = renderDungeonRoomControls;

  function getDungeonIntermissionCost(){
    const members = getDungeonRoomMembers().filter(member => !member.dead);
    if(!members.length){ return { total: 0, share: 0 }; }
    const totalMissingHp = members.reduce((sum, member) => sum + Math.max(0, (member.maxHp || 0) - (member.hp || 0)), 0);
    const totalMissingMp = members.reduce((sum, member) => sum + Math.max(0, (member.maxMp || 0) - (member.mp || 0)), 0);
    const total = Math.max(0, Math.ceil(totalMissingHp / 10) + Math.ceil(totalMissingMp / 11));
    return { total, share: Math.ceil(total / members.length) };
  }

  function renderDungeonIntermissionOverview(){
    const run = getDungeonRun();
    const regionName = getDungeonRegionName(run.regionIndex);
    const fountain = getDungeonIntermissionCost();
    return `
      <div class="combat-arena-card enemy-card dungeon-rest-card">
        <div class="combat-scene-header">
          <div>
            <h3>Intermissao da Dungeon</h3>
            <p class="enemy-subtitle">${regionName} concluida${run.lastRewards ? ` | Ultima recompensa: ${run.lastRewards.xp} XP e ${run.lastRewards.coins} moedas` : ""}</p>
          </div>
          <div class="enemy-badges">
            <span class="enemy-badge">${regionName}</span>
            <span class="enemy-badge">${run.lastEncounterWasBoss ? "Chefao vencido" : "Patrulha vencida"}</span>
          </div>
        </div>
        <div class="dungeon-rest-options">
          <button class="dungeon-service-card" onclick="setDungeonIntermissionView('fountain')">
            <strong>Fonte</strong>
            <span>Cura vida e mana de toda a equipe.</span>
            <span>Custo atual: ${fountain.total} moedas (${fountain.share} por heroi)</span>
          </button>
          <button class="dungeon-service-card" onclick="setDungeonIntermissionView('shop')">
            <strong>Loja da Dungeon</strong>
            <span>Pocoes e equipamentos aleatorios de expedicao.</span>
            <span>Os equipamentos valem so dentro da run.</span>
          </button>
        </div>
      </div>`;
  }

  function renderDungeonShopPanel(){
    const offers = getDungeonRun().shopStock || [];
    const heroCoins = getDungeonLocalHero()?.dungeonCoins || 0;
    return `
      <div class="inventory-item">
        <div class="panel-header"><strong>Loja da Dungeon</strong><span class="coin-badge">${heroCoins} moedas da dungeon</span></div>
        <span class="lock-note">Cada item e gerado para a regiao atual e o custo acompanha o valor bruto dos status fornecidos.</span>
        <div class="inventory-list">${offers.map(offer => getInventoryItemCardMarkup(
          offer.item,
          offer.item.type === "equipment" ? buildEquipmentDescription(offer.item) : offer.item.description,
          `<div class="button-row"><button onclick="buyDungeonOffer('${offer.id}')">Comprar (${offer.cost})</button></div>`,
          true
        )).join("")}</div>
      </div>`;
  }

  function renderDungeonFountainPanel(){
    const fountain = getDungeonIntermissionCost();
    const heroCoins = getDungeonLocalHero()?.dungeonCoins || 0;
    return `
      <div class="inventory-item">
        <div class="panel-header"><strong>Fonte da Dungeon</strong><span class="coin-badge">${heroCoins} moedas da dungeon</span></div>
        <span class="lock-note">A fonte restaura completamente vida e mana do grupo. O custo total e dividido entre os aventureiros vivos.</span><br>
        <span class="lock-note">Custo total: ${fountain.total} moedas | Cota por heroi: ${fountain.share}</span>
        <div class="button-row" style="margin-top:10px;">
          <button onclick="useDungeonFountain()" ${fountain.total <= 0 ? "disabled" : ""}>Curar equipe</button>
        </div>
      </div>`;
  }

  window.setDungeonIntermissionView = function(view){
    dungeonMultiplayer.intermissionView = ["overview", "shop", "fountain"].includes(view) ? view : "overview";
    updateUI();
  };

  function renderDungeonRegionPanel(){
    const run = getDungeonRun();
    const regionName = getDungeonRegionName(run.regionIndex);
    const regionData = regions[regionName];
    const phaseText = run.phase === "battle"
      ? `${getDungeonEncounterLabel()} | Turno atual: ${getDungeonCurrentTurnEntry()?.kind === "hero" ? (dungeonMultiplayer.party[getDungeonCurrentTurnEntry().id]?.name || "...") : (getDungeonCurrentTurnEntry()?.enemy?.baseName || "...")}`
      : run.phase === "intermission"
        ? "A equipe pode visitar a fonte, comprar itens ou seguir para a proxima batalha."
        : "Prepare a sala e adentre a expedicao.";
    const intermissionPanel = run.phase === "intermission"
      ? (dungeonMultiplayer.intermissionView === "shop"
        ? renderDungeonShopPanel()
        : dungeonMultiplayer.intermissionView === "fountain"
          ? renderDungeonFountainPanel()
          : `<div class="inventory-item"><strong>Escolha seu proximo passo</strong><br><span class="lock-note">Fonte e loja ficam disponiveis apos cada combate.</span></div>`)
      : "";
    return `
      <h3>Run da Dungeon</h3>
      <p>${regionData.description} ${phaseText}</p>
      <div class="inventory-item">
        <strong>Progressao atual</strong><br>
        <span class="lock-note">${getDungeonEncounterProgressText()}</span><br>
        <span class="lock-note">Run total: ${Math.max(0, getDungeonStepNumber() - 1)}/${getDungeonTotalEncounterCount()} etapas vencidas.</span>
      </div>
      <div class="inventory-item" style="margin-top:12px;">
        <strong>Equipe</strong>
        ${getDungeonPartyListMarkup()}
      </div>
      ${intermissionPanel}`;
  }

  function renderDungeonEnemyCard(targetEnemy){
    const selected = dungeonMultiplayer.selectedEnemyId === targetEnemy.instanceId;
    return `
      <div class="dungeon-enemy-tile ${selected ? "selected" : ""}">
        <div class="simple-combat-avatar dungeon-enemy-avatar">${renderCombatAvatar("enemies", toCssToken(targetEnemy.baseName || targetEnemy.name), getEnemySpriteIcon(targetEnemy), targetEnemy.baseName || targetEnemy.name)}</div>
        <strong>${targetEnemy.baseName}</strong>
        <span class="${targetEnemy.rarityClass}">${targetEnemy.rarityLabel}</span>
        <span class="lock-note">Nv.${targetEnemy.level}</span>
        ${targetEnemy.shieldValue > 0 ? `<div class="shield-row"><div class="shield-label">Escudo ${targetEnemy.shieldValue}</div><div class="bar small"><div class="shield-fill" style="width:${Math.min(100, targetEnemy.shieldValue / Math.max(1, targetEnemy.maxHp) * 100)}%"></div></div></div>` : ""}
        <span class="lock-note">Vida ${Math.max(0, targetEnemy.hp)}/${targetEnemy.maxHp}</span>
        <div class="bar"><div class="fill hp" style="width:${Math.max(0, targetEnemy.hp) / targetEnemy.maxHp * 100}%"></div></div>
        ${targetEnemy.isBoss ? `<span class="lock-note">Mana ${targetEnemy.mp}/${targetEnemy.maxMp}</span><div class="bar"><div class="fill mp" style="width:${targetEnemy.maxMp > 0 ? (targetEnemy.mp / targetEnemy.maxMp * 100) : 0}%"></div></div>` : ""}
        <span class="lock-note">Armadura ${targetEnemy.armor}</span>
        <button onclick="selectDungeonTarget('${targetEnemy.instanceId}')" ${targetEnemy.hp <= 0 ? "disabled" : ""}>${selected ? "Alvo atual" : "Selecionar alvo"}</button>
      </div>`;
  }

  function renderDungeonBattlePanel(){
    const run = getDungeonRun();
    ensureDungeonSelectedEnemy();
    return `
      <div class="combat-arena-card enemy-card dungeon-battle-card">
        <div class="combat-scene-header">
          <div>
            <h3>${getDungeonRegionName(run.regionIndex)}</h3>
            <p class="enemy-subtitle">${getDungeonEncounterLabel()} | ${run.enemies.length > 1 ? `${run.enemies.length} inimigos ativos` : "1 inimigo ativo"}</p>
          </div>
          <div class="enemy-badges">
            <span class="enemy-badge">Rodada ${run.round}</span>
            <span class="enemy-badge">${getDungeonCurrentTurnEntry()?.kind === "hero" ? "Turno dos herois" : "Turno dos inimigos"}</span>
          </div>
        </div>
        <div class="dungeon-enemy-grid">
          ${run.enemies.filter(target => target.hp > 0).map(renderDungeonEnemyCard).join("")}
        </div>
      </div>`;
  }

  function renderDungeonRunEnemyPanel(){
    const run = getDungeonRun();
    if(!run.active){
      return `
        <div class="combat-arena-card enemy-card">
          <div class="combat-scene-header">
            <div>
              <h3>Entrada da Dungeon</h3>
              <p class="enemy-subtitle">Monte a equipe no lobby e depois adentre a expedicao em uma aba separada.</p>
            </div>
            <div class="enemy-badges">
              <span class="enemy-badge">Sem requisito de nivel</span>
            </div>
          </div>
          <div class="simple-combat-banner">
            <div class="simple-combat-avatar region-focus-avatar"><span class="combat-avatar-fallback">🏛️</span></div>
            <div class="simple-combat-copy">
              <strong>Run resetada</strong>
              <span>Ao entrar novamente, a dungeon sempre volta para a primeira regiao.</span>
              <span>XP e moedas da run so entram na campanha ao sair da expedicao.</span>
            </div>
          </div>
        </div>`;
    }
    if(run.phase === "intermission"){
      return renderDungeonIntermissionOverview();
    }
    return renderDungeonBattlePanel();
  }

  function renderDungeonInventoryPanel(){
    const inventory = getDungeonLocalInventory();
    const hero = getDungeonLocalHero();
    const previewStats = getDungeonPreviewStats(hero);
    const heroCoins = hero?.dungeonCoins || 0;
    return `
      <h3>Bolsa da expedicao</h3>
      <div class="inventory-item">
        <strong>Moedas da dungeon</strong><br>
        <span class="lock-note">${heroCoins} moedas prontas para gastar | Nivel atual ${hero?.level || 1}</span><br>
        <span class="lock-note">Seu nivel evolui normalmente na dungeon. Ao sair, o progresso e as moedas voltam para a campanha principal, mas os equipamentos da run somem.</span>
      </div>
      <div class="inventory-item" style="margin-top:12px;">
        <strong>Status atuais da run</strong><br>
        <span class="lock-note">Vida ${hero?.hp || 0}/${previewStats.maxHp || 0} | Mana ${hero?.mp || 0}/${previewStats.maxMp || 0}</span>
      </div>
      ${inventory.length ? `<div class="inventory-list" style="margin-top:12px;">${inventory.map(item => {
        const useButton = item.type === "consumable"
          ? `<button onclick="useDungeonConsumable('${item.uid}')">Usar</button>`
          : "";
        const equipButton = item.type === "equipment"
          ? `<button onclick="equipDungeonItem('${item.uid}')">Equipar</button>`
          : "";
        return getInventoryItemCardMarkup(
          item,
          item.type === "equipment" ? buildEquipmentDescription(item) : (item.description || ""),
          `<div class="button-row">${useButton}${equipButton}</div>`
        );
      }).join("")}</div>` : `<p class="lock-note">A bolsa da expedicao esta vazia.</p>`}`;
  }

  function getDungeonPartyTargetOptions(){
    const livingParty = getDungeonRoomMembers().filter(member => !member.dead);
    return livingParty;
  }

  function getDungeonSelectedEnemyOrFallback(){
    return getDungeonSelectedEnemy() || getDungeonRun().enemies.find(target => target.hp > 0) || null;
  }

  function buildDungeonActionPayload(payload){
    return {
      ...payload,
      player: buildDungeonHeroProfile(getDungeonLocalHero())
    };
  }

  sendDungeonActionPayload = window.sendDungeonActionPayload = function(payload){
    if(!isDungeonConnected() || !hasActiveDungeonRun()){ return; }
    const actionPayload = buildDungeonActionPayload(payload);
    if(isDungeonHost()){
      handleDungeonHostMessage({ peer: dungeonMultiplayer.peer.id }, { type: "action", ...actionPayload });
    }else if(dungeonMultiplayer.hostConnection?.open){
      dungeonMultiplayer.hostConnection.send({ type: "action", ...actionPayload });
    }
  };

  function getDungeonSkillButtonTooltip(skillInfo){
    const targetMode = getDungeonSkillTargetMode(skillInfo);
    const suffix = targetMode === "self"
      ? " | Alvo: voce"
      : targetMode === "party"
        ? " | Alvo: equipe"
        : targetMode === "all_enemies"
          ? " | Alvo: todos os inimigos"
          : " | Alvo: inimigo selecionado";
    return `${skillInfo.description}${suffix}`;
  }

  function bumpDungeonHeroStateVersion(hero){
    if(!hero){ return; }
    hero.syncVersion = (Number(hero.syncVersion) || 0) + 1;
  }

  function setDungeonHeroStateForPeer(peerId, heroState){
    if(!peerId || !heroState){ return; }
    ensureDungeonRunContainers();
    dungeonMultiplayer.heroStates[peerId] = cloneData(heroState);
    if(peerId === dungeonMultiplayer.peer?.id){
      setDungeonLocalHero(cloneData(heroState));
      dungeonMultiplayer.dungeonCoins = Number(heroState.dungeonCoins) || 0;
    }
    dungeonMultiplayer.party[peerId] = buildDungeonHeroProfile(dungeonMultiplayer.heroStates[peerId]);
  }

  function getDungeonHeroStateForPeer(peerId){
    if(!peerId){ return null; }
    if(peerId === dungeonMultiplayer.peer?.id && getDungeonLocalHero()){
      return getDungeonLocalHero();
    }
    return dungeonMultiplayer.heroStates?.[peerId] || null;
  }

  function syncDungeonHeroFromState(peerId){
    const stateHero = dungeonMultiplayer.heroStates?.[peerId];
    const localHero = getDungeonLocalHero();
    if(stateHero && peerId === dungeonMultiplayer.peer?.id){
      const incomingVersion = Number(stateHero.syncVersion) || 0;
      const localVersion = Number(localHero?.syncVersion) || 0;
      if(localHero && incomingVersion < localVersion){
        return;
      }
      setDungeonLocalHero(cloneData(stateHero));
    }
  }

  function syncLevelGlobalsFromDungeonHero(hero = getDungeonLocalHero()){
    if(!hero){ return; }
    pendingLevelUps = Number(hero.pendingLevelUps) || 0;
    levelUpPoints = Number(hero.levelUpPoints) || 0;
    allocation = cloneData(hero.allocation || { strength: 0, wisdom: 0, vitality: 0 });
  }

  function syncLevelGlobalsToDungeonHero(hero = getDungeonLocalHero()){
    if(!hero){ return; }
    hero.pendingLevelUps = Number(pendingLevelUps) || 0;
    hero.levelUpPoints = Number(levelUpPoints) || 0;
    hero.allocation = cloneData(allocation || { strength: 0, wisdom: 0, vitality: 0 });
    hero.dungeonCoins = dungeonMultiplayer.dungeonCoins || 0;
    bumpDungeonHeroStateVersion(hero);
    setDungeonHeroStateForPeer(dungeonMultiplayer.peer?.id, hero);
  }

  function resolveDungeonSingleTargetSkill(hero, skillIndex, targetEnemy){
    return withDungeonHeroContext(hero, targetEnemy, () => {
      const skillInfo = getSkillInfo()[skillIndex];
      const result = applySkillLocally(skillInfo, getDungeonActorName(hero), true);
      if(result.blocked){
        return { blocked: true, message: result.message };
      }
      applyDungeonAggroToHero(hero, skillInfo);
      applyTurnStartPassives();
      decayPlayerBuffs();
      applyEndOfTurnRecovery();
      return {
        blocked: false,
        result,
        updatedEnemy: cloneData(enemy),
        skillInfo
      };
    }).result;
  }

  function resolveDungeonSelfSkill(hero, skillIndex){
    return withDungeonHeroContext(hero, getDungeonSelectedEnemyOrFallback(), () => {
      const skillInfo = getSkillInfo()[skillIndex];
      const result = applySkillLocally(skillInfo, getDungeonActorName(hero), false);
      if(result.blocked){
        return { blocked: true, message: result.message };
      }
      applyDungeonAggroToHero(hero, skillInfo);
      applyTurnStartPassives();
      decayPlayerBuffs();
      applyEndOfTurnRecovery();
      return { blocked: false, result, skillInfo };
    }).result;
  }

  function resolveDungeonPartySkill(hero, skillIndex, targetEnemy){
    return withDungeonHeroContext(hero, targetEnemy, () => {
      const skillInfo = getSkillInfo()[skillIndex];
      const result = applySkillLocally(skillInfo, getDungeonActorName(hero), true);
      if(result.blocked){
        return { blocked: true, message: result.message };
      }
      applyDungeonAggroToHero(hero, skillInfo);
      applyTurnStartPassives();
      decayPlayerBuffs();
      applyEndOfTurnRecovery();
      return {
        blocked: false,
        result,
        skillInfo,
        updatedEnemy: cloneData(enemy),
        partyEffect: {
          type: "team_support",
          sourceId: dungeonMultiplayer.peer?.id || "local",
          sourceName: getDungeonActorName(hero),
          heal: skillInfo.heal || 0,
          shield: skillInfo.shield || 0,
          applyToSource: false
        }
      };
    }).result;
  }

  function resolveDungeonAreaSkill(hero, skillIndex, targets){
    return withDungeonHeroContext(hero, targets[0] || null, () => {
      const skillInfo = getSkillInfo()[skillIndex];
      const baseResult = applySkillLocally(skillInfo, getDungeonActorName(hero), false);
      if(baseResult.blocked){
        return { blocked: true, message: baseResult.message };
      }
      const updatedEnemies = targets.map(target => {
        enemy = cloneData(target);
        let dealtDamage = 0;
        if(skillInfo.type === "mage_blizzard"){
          enemy.blizzardSkipChance = Math.max(enemy.blizzardSkipChance || 0, skillInfo.enemySkipChance || 0);
          enemy.blizzardTurns = Math.max(enemy.blizzardTurns || 0, skillInfo.turns || 0);
        }
        if(skillInfo.type === "mage_avalanche"){
          dealtDamage = applyDamageToEnemy(skillInfo.damage);
          enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.chillAttackDownPercent || 0);
          enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, skillInfo.chillTurns || 0);
        }
        if(skillInfo.type === "nature_queen_decree"){
          dealtDamage = applyDamageToEnemy(skillInfo.damage, { skillCost: skillInfo.cost });
        }
        return { enemy: cloneData(enemy), dealtDamage };
      });
      applyTurnStartPassives();
      decayPlayerBuffs();
      applyEndOfTurnRecovery();
      const totalDamage = updatedEnemies.reduce((sum, entry) => sum + (entry.dealtDamage || 0), 0);
      const message = skillInfo.type === "mage_blizzard"
        ? `${getDungeonActorName(hero)} usou ${skillInfo.name} e envolveu todos os inimigos em uma tempestade arcana.`
        : `${getDungeonActorName(hero)} usou ${skillInfo.name} e causou ${totalDamage} de dano total na linha inimiga.`;
      return {
        blocked: false,
        result: { ...baseResult, damage: totalDamage, message },
        updatedEnemies: updatedEnemies.map(entry => entry.enemy),
        skillInfo
      };
    }).result;
  }

  function applyLocalDungeonEnemyUpdates(updatedEnemies){
    (updatedEnemies || []).forEach(updatedEnemy => {
      replaceDungeonEnemy(updatedEnemy);
    });
    ensureDungeonSelectedEnemy();
  }

  function applyDungeonPartyEffectOnHost(effect){
    if(!effect){ return; }
    Object.keys(dungeonMultiplayer.heroStates || {}).forEach(peerId => {
      const heroState = getDungeonHeroStateForPeer(peerId);
      if(!heroState){ return; }
      const shouldApply = effect.applyToSource || peerId !== effect.sourceId;
      if(!shouldApply){ return; }
      withDungeonHeroContext(heroState, getDungeonSelectedEnemyOrFallback(), () => {
        if(effect.heal > 0){
          healPlayer(effect.heal);
        }
        if(effect.shield > 0){
          grantPlayerShield(effect.shield);
        }
      });
      bumpDungeonHeroStateVersion(heroState);
      setDungeonHeroStateForPeer(peerId, heroState);
    });
  }

  function resolveDungeonActionForPeer(peerId, data){
    const hero = getDungeonHeroStateForPeer(peerId);
    if(!hero){
      return { blocked: true, message: "O heroi dessa conexao ainda nao sincronizou com a dungeon." };
    }
    const targetEnemy = data.targetEnemyId
      ? cloneData(getDungeonRun().enemies.find(target => target.instanceId === data.targetEnemyId && target.hp > 0) || null)
      : cloneData(getDungeonSelectedEnemyOrFallback());
    const startState = processDungeonHeroStartEffects(hero, targetEnemy);
    if(startState.defeated){
      setDungeonHeroStateForPeer(peerId, hero);
      return {
        blocked: false,
        messages: startState.messages,
        defeatedHero: true,
        defeatMessage: `${getDungeonActorName(hero)} caiu na dungeon. A expedicao terminou em derrota.`,
        turnConsumed: true
      };
    }
    if(startState.skipped){
      setDungeonHeroStateForPeer(peerId, hero);
      return {
        blocked: false,
        messages: [...startState.messages, `${getDungeonActorName(hero)} perdeu o turno.`],
        turnConsumed: true
      };
    }
    let action;
    if(data.actionKind === "pass_turn"){
      action = withDungeonHeroContext(hero, targetEnemy, () => {
        applyTurnStartPassives();
        playerEffects.lastActionType = "pass_turn";
        decayPlayerBuffs();
        applyEndOfTurnRecovery();
        return { blocked: false, result: { message: `${getDungeonActorName(hero)} passou o turno.` } };
      }).result;
    }else if(data.actionKind === "basic_attack"){
      if(!targetEnemy){
        return { blocked: true, message: "Selecione um inimigo valido." };
      }
      action = withDungeonHeroContext(hero, targetEnemy, () => {
        const result = getBasicAttackResult(getDungeonActorName(hero), true);
        if(result.blocked){
          return { blocked: true, message: result.message };
        }
        applyTurnStartPassives();
        playerEffects.lastActionType = "basic_attack";
        decayPlayerBuffs();
        applyEndOfTurnRecovery();
        return { blocked: false, result, updatedEnemy: cloneData(enemy) };
      }).result;
    }else if(data.actionKind === "skill"){
      const skillPreview = getDungeonSkillInfo(targetEnemy, hero)[data.skillIndex];
      if(!skillPreview){
        return { blocked: true, message: "Essa habilidade nao esta disponivel agora." };
      }
      const targetMode = getDungeonSkillTargetMode(skillPreview);
      if(targetMode === "self"){
        action = resolveDungeonSelfSkill(hero, data.skillIndex);
      }else if(targetMode === "party"){
        action = resolveDungeonPartySkill(hero, data.skillIndex, targetEnemy);
      }else if(targetMode === "all_enemies"){
        action = resolveDungeonAreaSkill(hero, data.skillIndex, getLivingDungeonEnemies().map(cloneData));
      }else{
        if(!targetEnemy){
          return { blocked: true, message: "Selecione um inimigo valido." };
        }
        action = resolveDungeonSingleTargetSkill(hero, data.skillIndex, targetEnemy);
      }
    }else{
      return { blocked: true, message: "Acao invalida na dungeon." };
    }
    if(action.blocked){
      setDungeonHeroStateForPeer(peerId, hero);
      return { blocked: true, message: action.message };
    }
    if(action.updatedEnemy){
      applyLocalDungeonEnemyUpdates([action.updatedEnemy]);
    }
    if(action.updatedEnemies){
      applyLocalDungeonEnemyUpdates(action.updatedEnemies);
    }
    if(action.partyEffect){
      applyDungeonPartyEffectOnHost(action.partyEffect);
    }
    bumpDungeonHeroStateVersion(hero);
    setDungeonHeroStateForPeer(peerId, hero);
    return {
      blocked: false,
      messages: [...startState.messages, action.result.message],
      updatedEnemies: action.updatedEnemy ? [action.updatedEnemy] : (action.updatedEnemies || []),
      turnConsumed: true
    };
  }

  function getLivingDungeonEnemies(){
    return getDungeonRun().enemies.filter(target => target.hp > 0);
  }

  function maybeFinishDungeonEncounterAfterEnemyUpdate(){
    if(!isDungeonHost()){ return; }
    const run = getDungeonRun();
    if(run.phase !== "battle"){ return; }
    if(getLivingDungeonEnemies().length <= 0){
      handleDungeonEncounterVictory();
    }
  }

  function sendDungeonReactionIfNeeded(updatedEnemy, reactionMessage = ""){
    if(!updatedEnemy || !isDungeonConnected()){ return; }
    const payload = {
      type: "enemy_reaction",
      player: buildDungeonHeroProfile(getDungeonLocalHero()),
      updatedEnemy,
      reactionMessage
    };
    if(isDungeonHost()){
      handleDungeonHostMessage({ peer: dungeonMultiplayer.peer.id }, payload);
    }else if(dungeonMultiplayer.hostConnection?.open){
      dungeonMultiplayer.hostConnection.send(payload);
    }
  }

  function applyDungeonIncomingPacketToLocalHero(packet){
    const hero = getDungeonLocalHero();
    if(!hero){ return; }
    const sourceEnemy = cloneData(getDungeonRun().enemies.find(target => target.instanceId === packet.sourceEnemyId) || null);
    let updatedEnemy = null;
    const response = withDungeonHeroContext(hero, sourceEnemy, () => {
      const result = applyIncomingDamage(packet.damage, packet.options || {});
      if(!result.missed){
        if(packet.effects?.healReductionPercent){
          playerEffects.healReductionPercent = Math.max(playerEffects.healReductionPercent || 0, packet.effects.healReductionPercent);
          playerEffects.healReductionTurns = Math.max(playerEffects.healReductionTurns || 0, packet.effects.healReductionTurns || 0);
        }
        if(packet.effects?.damageDownPercent){
          playerEffects.damageDownPercent = Math.max(playerEffects.damageDownPercent || 0, packet.effects.damageDownPercent);
          playerEffects.damageDownTurns = Math.max(playerEffects.damageDownTurns || 0, packet.effects.damageDownTurns || 0);
        }
        if(packet.effects?.burnPercent){
          const burnReduction = getPassiveModifiers().burnDamageReductionPercent || 0;
          const burnDamage = Math.max(1, Math.floor(getCurrentCaps().maxHp * packet.effects.burnPercent * (1 - burnReduction)));
          playerEffects.burnDamagePerTurn = Math.max(playerEffects.burnDamagePerTurn || 0, burnDamage);
          playerEffects.burnTurns = Math.max(playerEffects.burnTurns || 0, packet.effects.burnTurns || 0);
        }
        if(packet.effects?.skipChance && Math.random() < packet.effects.skipChance){
          playerEffects.skipNextTurn = true;
        }
      }
      updatedEnemy = enemy ? cloneData(enemy) : null;
      return result;
    }).result;
    if(hero.hp <= 0){
      if(isDungeonHost()){
        handleDungeonRaidDefeat(`${buildDungeonHeroProfile(hero).name} caiu na dungeon. A expedicao terminou em derrota.`);
      }else if(dungeonMultiplayer.hostConnection?.open){
        dungeonMultiplayer.hostConnection.send({ type: "player_defeated", player: buildDungeonHeroProfile(hero) });
      }
      return;
    }
    bumpDungeonHeroStateVersion(hero);
    syncDungeonProfile();
    if(updatedEnemy && updatedEnemy.instanceId === packet.sourceEnemyId){
      sendDungeonReactionIfNeeded(updatedEnemy, "");
    }
    updateUI();
  }

  window.dungeonAttack = function(){
    if(!isDungeonRunMode() || !isDungeonConnected() || !isMyDungeonTurn()){ return; }
    const targetEnemy = getDungeonSelectedEnemyOrFallback();
    if(!targetEnemy){
      log("Selecione um inimigo valido.");
      return;
    }
    sendDungeonActionPayload({
      actionKind: "basic_attack",
      targetEnemyId: targetEnemy.instanceId
    });
  };

  window.dungeonPassTurn = function(){
    if(!isDungeonRunMode() || !isDungeonConnected() || !isMyDungeonTurn()){ return; }
    sendDungeonActionPayload({
      actionKind: "pass_turn"
    });
  };

  window.dungeonUseSkill = function(index){
    if(!isDungeonRunMode() || !isDungeonConnected() || !isMyDungeonTurn()){ return; }
    const hero = getDungeonLocalHero();
    const targetEnemy = getDungeonSelectedEnemyOrFallback();
    if(!hero){ return; }
    const skillPreview = getDungeonSkillInfo(targetEnemy ? cloneData(targetEnemy) : null, hero)[index];
    if(!skillPreview){
      log("Voce ainda nao desbloqueou essa habilidade.");
      return;
    }
    sendDungeonActionPayload({
      actionKind: "skill",
      skillIndex: index,
      targetEnemyId: targetEnemy?.instanceId || null
    });
  };

  function chooseDungeonEnemyTarget(){
    const livingParty = getDungeonRoomMembers().filter(member => !member.dead);
    if(!livingParty.length){ return null; }
    const totalWeight = livingParty.reduce((sum, member) => sum + 1 + Math.max(0, member.aggroPower || 0), 0);
    let roll = Math.random() * totalWeight;
    for(const member of livingParty){
      roll -= 1 + Math.max(0, member.aggroPower || 0);
      if(roll <= 0){
        return member;
      }
    }
    return livingParty[livingParty.length - 1];
  }

  function estimateDungeonBossAbilityScore(actorEnemy, ability, targetProfile){
    const targetShield = targetProfile.shieldValue || 0;
    const targetHp = targetProfile.hp || 0;
    let score = (ability.power || actorEnemy.attack) + Math.floor((ability.variance || 6) / 2);
    if(ability.maxHpPercent){
      score += Math.floor((targetProfile.maxHp || 0) * ability.maxHpPercent);
    }
    if(ability.bonusIfShield && targetShield > 0){
      score += ability.bonusIfShield;
    }
    if(ability.bonusIfNoShield && targetShield <= 0){
      score += ability.bonusIfNoShield;
    }
    if(ability.targetSkipChance){
      score += Math.floor(score * ability.targetSkipChance * 0.5);
    }
    if(ability.targetDamageDownPercent){
      score += Math.floor(score * ability.targetDamageDownPercent * 0.25);
    }
    if(ability.targetBurnPercent){
      score += Math.floor((targetProfile.maxHp || 0) * ability.targetBurnPercent * Math.max(1, ability.targetBurnTurns || 1));
    }
    if(ability.type === "buff"){
      if(actorEnemy.bossBuffTurns > 0){
        return -999;
      }
      const shieldValue = Math.floor((actorEnemy.maxHp || 0) * (ability.selfShieldPercent || 0)) + Math.floor(ability.selfShieldFlat || 0);
      return Math.floor(((ability.attackPercent || 0) * actorEnemy.attack * 3) + shieldValue * 0.45 + (ability.regenPercent || 0) * actorEnemy.maxHp * 2);
    }
    if(targetHp <= score){
      score += 25;
    }
    if(actorEnemy.mp - (ability.cost || 0) < 0){
      return -999;
    }
    return score;
  }

  function chooseDungeonBossAbility(actorEnemy, targetProfile){
    const abilities = (actorEnemy.bossAbilities || []).filter(ability => actorEnemy.mp >= (ability.cost || 0));
    if(!abilities.length){
      return null;
    }
    const ranked = abilities
      .map(ability => ({ ability, score: estimateDungeonBossAbilityScore(actorEnemy, ability, targetProfile) }))
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.ability || null;
  }

  function applyDungeonBossBuff(actorEnemy, ability){
    actorEnemy.mp = Math.max(0, actorEnemy.mp - (ability.cost || 0));
    actorEnemy.bossBuffTurns = ability.turns || 3;
    actorEnemy.bossAttackBuffPercent = ability.attackPercent || 0;
    actorEnemy.bossFlatDamageBonus = ability.flatDamageBonus || 0;
    actorEnemy.bossPierceBonus = ability.pierceBonus || 0;
    actorEnemy.bossRegenPercent = ability.regenPercent || 0;
    if((ability.selfShieldPercent || ability.selfShieldFlat) && actorEnemy.noShieldTurns <= 0){
      const shieldValue = Math.floor((actorEnemy.maxHp || 0) * (ability.selfShieldPercent || 0)) + Math.floor(ability.selfShieldFlat || 0);
      actorEnemy.shieldValue = Math.max(actorEnemy.shieldValue || 0, shieldValue);
      actorEnemy.shieldTurns = Math.max(actorEnemy.shieldTurns || 0, ability.shieldTurns || ability.turns || 3);
    }
  }

  function buildDungeonEnemyAttackPacket(actorEnemy, targetProfile){
    const ability = actorEnemy.isBoss ? chooseDungeonBossAbility(actorEnemy, targetProfile) : null;
    if(ability?.type === "buff"){
      applyDungeonBossBuff(actorEnemy, ability);
      return {
        type: "buff",
        message: `${actorEnemy.baseName} usou ${ability.name} e fortaleceu suas proprias defesas.`,
        sourceEnemyId: actorEnemy.instanceId
      };
    }
    let damage = actorEnemy.attack + Math.floor(Math.random() * 5);
    const packet = {
      type: "attack",
      sourceEnemyId: actorEnemy.instanceId,
      targetId: targetProfile.id,
      targetName: targetProfile.name,
      damage: 0,
      options: {},
      effects: {},
      message: ""
    };
    if(ability){
      actorEnemy.mp = Math.max(0, actorEnemy.mp - (ability.cost || 0));
      damage = (ability.power || actorEnemy.attack) + Math.floor(Math.random() * ((ability.variance || 6) + 1));
      packet.message = `${actorEnemy.baseName} usou ${ability.name} em ${targetProfile.name}.`;
      packet.options.ignoreShield = !!ability.ignoreShield;
      packet.options.ignoreFlatReduction = !!ability.ignoreFlatReduction;
      packet.options.ignorePreciousMana = !!ability.ignorePreciousMana;
      if(ability.bonusIfShield && (targetProfile.shieldValue || 0) > 0){
        damage += ability.bonusIfShield;
      }
      if(ability.bonusIfNoShield && (targetProfile.shieldValue || 0) <= 0){
        damage += ability.bonusIfNoShield;
      }
      if(ability.maxHpPercent){
        damage += Math.floor((targetProfile.maxHp || 0) * ability.maxHpPercent);
      }
      if(ability.targetBurnPercent){
        packet.effects.burnPercent = ability.targetBurnPercent;
        packet.effects.burnTurns = ability.targetBurnTurns || 0;
      }
      if(ability.targetHealReductionPercent){
        packet.effects.healReductionPercent = ability.targetHealReductionPercent;
        packet.effects.healReductionTurns = ability.targetHealReductionTurns || 0;
      }
      if(ability.targetDamageDownPercent){
        packet.effects.damageDownPercent = ability.targetDamageDownPercent;
        packet.effects.damageDownTurns = ability.targetDamageDownTurns || 0;
      }
      if(ability.targetSkipChance){
        packet.effects.skipChance = ability.targetSkipChance;
      }
      if((ability.selfShieldPercent || ability.selfShieldFlat) && actorEnemy.noShieldTurns <= 0){
        const shieldValue = Math.floor((actorEnemy.maxHp || 0) * (ability.selfShieldPercent || 0)) + Math.floor(ability.selfShieldFlat || 0);
        actorEnemy.shieldValue = Math.max(actorEnemy.shieldValue || 0, shieldValue);
        actorEnemy.shieldTurns = Math.max(actorEnemy.shieldTurns || 0, ability.shieldTurns || 2);
      }
    }else{
      packet.message = `${actorEnemy.baseName} atacou ${targetProfile.name}.`;
    }
    damage += actorEnemy.bossFlatDamageBonus || 0;
    if(actorEnemy.bossAttackBuffPercent > 0){
      damage += Math.floor(damage * actorEnemy.bossAttackBuffPercent);
    }
    if(actorEnemy.bossPierceBonus > 0){
      damage += Math.floor(damage * actorEnemy.bossPierceBonus);
    }
    packet.damage = Math.max(0, Math.floor(damage));
    return packet;
  }

  function handleDungeonEnemyUpkeep(actorEnemy){
    if(actorEnemy.shieldTurns > 0){
      actorEnemy.shieldTurns--;
      if(actorEnemy.shieldTurns <= 0){
        actorEnemy.shieldValue = 0;
      }
    }
    if(actorEnemy.bossBuffTurns > 0){
      actorEnemy.bossBuffTurns--;
      if(actorEnemy.bossRegenPercent > 0){
        actorEnemy.hp = Math.min(actorEnemy.maxHp, actorEnemy.hp + Math.max(1, Math.floor(actorEnemy.maxHp * actorEnemy.bossRegenPercent)));
      }
      if(actorEnemy.bossBuffTurns <= 0){
        actorEnemy.bossAttackBuffPercent = 0;
        actorEnemy.bossFlatDamageBonus = 0;
        actorEnemy.bossPierceBonus = 0;
        actorEnemy.bossRegenPercent = 0;
      }
    }
    if(actorEnemy.attackDownTurns > 0){
      actorEnemy.attackDownTurns--;
      if(actorEnemy.attackDownTurns <= 0){
        actorEnemy.attackDownPercent = 0;
      }
    }
    if(actorEnemy.armorDownTurns > 0){
      actorEnemy.armorDownTurns--;
      if(actorEnemy.armorDownTurns <= 0){
        actorEnemy.armorDownPercent = 0;
      }
    }
    if(actorEnemy.blizzardTurns > 0){
      actorEnemy.blizzardTurns--;
      if(actorEnemy.blizzardTurns <= 0){
        actorEnemy.blizzardSkipChance = 0;
      }
    }
    if(actorEnemy.noShieldTurns > 0){
      actorEnemy.noShieldTurns--;
    }
    if(actorEnemy.healReductionTurns > 0){
      actorEnemy.healReductionTurns--;
      if(actorEnemy.healReductionTurns <= 0){
        actorEnemy.healReductionPercent = 0;
      }
    }
    if(actorEnemy.rootedTurns > 0){
      actorEnemy.rootedTurns--;
    }
    if(actorEnemy.dotTurns > 0 && actorEnemy.dotDamagePerTurn > 0){
      actorEnemy.hp = Math.max(0, actorEnemy.hp - actorEnemy.dotDamagePerTurn);
      actorEnemy.dotTurns--;
      if(actorEnemy.dotTurns <= 0){
        actorEnemy.dotDamagePerTurn = 0;
        actorEnemy.dotSourceName = "";
      }
    }
    ["natureMarkTurns", "naturePoisonTurns", "natureDecayTurns"].forEach(turnKey => {
      const damageKey = turnKey.replace("Turns", "Damage");
      if(actorEnemy[turnKey] > 0 && actorEnemy[damageKey] > 0){
        actorEnemy.hp = Math.max(0, actorEnemy.hp - actorEnemy[damageKey]);
        actorEnemy[turnKey]--;
        if(actorEnemy[turnKey] <= 0){
          actorEnemy[damageKey] = 0;
        }
      }
    });
    if(actorEnemy.natureMarkTurns > 0 && !(actorEnemy.natureMarkDamage > 0)){
      actorEnemy.natureMarkTurns--;
    }
    return actorEnemy.hp <= 0;
  }

  function broadcastDungeonLog(message, sourceId = ""){
    if(message){
      log(message);
      broadcastToDungeonPeers({ type: "log", message, sourceId });
    }
  }

  function handleDungeonEnemyPhase(){
    if(!isDungeonHost() || getDungeonRun().phase !== "battle"){ return; }
    let entry = getDungeonCurrentTurnEntry();
    while(entry && entry.kind === "enemy" && getDungeonRun().phase === "battle"){
      const actorEnemy = entry.enemy;
      const diedOnUpkeep = handleDungeonEnemyUpkeep(actorEnemy);
      if(diedOnUpkeep){
        actorEnemy.hp = 0;
        syncDungeonTurnOrder();
        maybeFinishDungeonEncounterAfterEnemyUpdate();
        if(getDungeonRun().phase !== "battle"){
          return;
        }
      }else if(actorEnemy.skipNextAttack || (actorEnemy.blizzardSkipChance > 0 && Math.random() < actorEnemy.blizzardSkipChance)){
        actorEnemy.skipNextAttack = false;
        broadcastDungeonLog(`${actorEnemy.baseName} perdeu o turno.`, "");
      }else{
        const targetProfile = chooseDungeonEnemyTarget();
        if(!targetProfile){
          handleDungeonRaidDefeat("A equipe foi desfeita durante a expedicao.");
          return;
        }
        const packet = buildDungeonEnemyAttackPacket(actorEnemy, targetProfile);
        broadcastDungeonLog(packet.message, "");
        if(packet.type === "attack"){
          if(targetProfile.id === dungeonMultiplayer.peer?.id){
            applyDungeonIncomingPacketToLocalHero(packet);
            dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = buildDungeonHeroProfile(getDungeonLocalHero());
          }
          broadcastToDungeonPeers({ type: "enemy_attack", packet }, targetProfile.id === dungeonMultiplayer.peer?.id ? "" : "");
        }
      }
      syncDungeonTurnOrder();
      if(!getDungeonRun().turnOrder.length){
        break;
      }
      if(getDungeonRun().turnIndex >= getDungeonRun().turnOrder.length - 1){
        getDungeonRun().turnIndex = 0;
        getDungeonRun().round++;
        tickDungeonAggro();
      }else{
        getDungeonRun().turnIndex++;
      }
      syncDungeonTurnOrder();
      entry = getDungeonCurrentTurnEntry();
    }
    broadcastDungeonState();
    updateUI();
  }

  function advanceDungeonTurn(){
    if(!isDungeonHost() || getDungeonRun().phase !== "battle"){ return; }
    syncDungeonTurnOrder();
    if(!getDungeonRun().turnOrder.length){
      return;
    }
    if(getDungeonRun().turnIndex >= getDungeonRun().turnOrder.length - 1){
      getDungeonRun().turnIndex = 0;
      getDungeonRun().round++;
      tickDungeonAggro();
    }else{
      getDungeonRun().turnIndex++;
    }
    syncDungeonTurnOrder();
    const entry = getDungeonCurrentTurnEntry();
    if(entry?.kind === "enemy"){
      handleDungeonEnemyPhase();
      return;
    }
    broadcastDungeonState();
    updateUI();
  }

  function getDungeonEncounterRewards(){
    const enemies = getDungeonRun().enemies || [];
    const totalLevels = enemies.reduce((sum, target) => sum + (target.level || 0), 0);
    const isBoss = enemies.some(target => target.isBoss);
    return {
      xp: Math.max(16, 12 + totalLevels * (isBoss ? 6 : 4)),
      coins: Math.max(10, 8 + totalLevels * (isBoss ? 3 : 2))
    };
  }

  function grantDungeonEncounterRewardsToPeer(peerId, rewards){
    const hero = getDungeonHeroStateForPeer(peerId);
    if(!hero){ return; }
    hero.dungeonCoins = (hero.dungeonCoins || 0) + rewards.coins;
    if(peerId === dungeonMultiplayer.peer?.id){
      dungeonMultiplayer.dungeonCoins = hero.dungeonCoins;
    }
    withDungeonHeroContext(hero, null, () => {
      gainXP(rewards.xp);
      displayState.playerXp = player.xp;
    });
    bumpDungeonHeroStateVersion(hero);
    setDungeonHeroStateForPeer(peerId, hero);
  }

  function grantDungeonEncounterRewards(rewards){
    const partyIds = Object.keys(dungeonMultiplayer.party || {});
    if(!partyIds.length && dungeonMultiplayer.peer?.id){
      partyIds.push(dungeonMultiplayer.peer.id);
    }
    partyIds.forEach(peerId => grantDungeonEncounterRewardsToPeer(peerId, rewards));
  }

  function handleDungeonEncounterVictory(){
    const run = getDungeonRun();
    if(run.phase !== "battle"){ return; }
    const defeatedWasBoss = isDungeonBossEncounter(run.encounterIndex);
    const defeatedEnemyCount = Math.max(1, run.enemies.length);
    const rewards = getDungeonEncounterRewards();
    grantDungeonEncounterRewards(rewards);
    player.stats.dungeonMultiEncounterWins = (player.stats.dungeonMultiEncounterWins || 0) + (defeatedEnemyCount > 1 ? 1 : 0);
    updateDungeonBestStep(getDungeonStepNumber(run));
    if(defeatedWasBoss){
      player.stats.dungeonRegionsCleared = (player.stats.dungeonRegionsCleared || 0) + 1;
    }
    const clearedRegion = getDungeonRegionName(run.regionIndex);
    const message = defeatedWasBoss
      ? `O chefao de ${clearedRegion} caiu. Cada aventureiro ganhou ${rewards.xp} XP e ${rewards.coins} moedas da dungeon.`
      : `A patrulha foi derrotada. Cada aventureiro ganhou ${rewards.xp} XP e ${rewards.coins} moedas da dungeon.`;
    const stepNumber = getDungeonStepNumber(run);
    const completedRun = defeatedWasBoss && run.regionIndex >= getDungeonRegionOrder().length - 1;
    log(message);
    broadcastToDungeonPeers({
      type: "encounter_reward",
      rewards,
      message,
      wasBoss: defeatedWasBoss,
      step: stepNumber,
      completed: completedRun,
      heroStates: cloneData(dungeonMultiplayer.heroStates || {})
    });
    dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = buildDungeonHeroProfile(getDungeonLocalHero());
    run.lastRewards = rewards;
    run.lastEncounterWasBoss = defeatedWasBoss;
    run.phase = "intermission";
    run.enemies = [];
    run.turnOrder = [];
    run.turnIndex = 0;
    if(defeatedWasBoss){
      if(completedRun){
        player.stats.dungeonClears = (player.stats.dungeonClears || 0) + 1;
        broadcastToDungeonPeers({ type: "run_end", outcome: "complete", message: "A dungeon inteira foi concluida. Retornando para a campanha principal." });
        finishDungeonRun("A dungeon inteira foi concluida. Retornando para a campanha principal.", "a dungeon");
        return;
      }
      run.regionIndex++;
      run.encounterIndex = 0;
    }else{
      run.encounterIndex++;
    }
    run.shopStock = createDungeonShopStock(getDungeonRegionName(run.regionIndex));
    dungeonMultiplayer.intermissionView = "overview";
    broadcastDungeonState();
    updateUI();
  }

  function startDungeonEncounter(){
    const run = getDungeonRun();
    const regionName = getDungeonRegionName(run.regionIndex);
    run.enemies = createDungeonEncounterEnemies(regionName, run.encounterIndex);
    run.round = 1;
    run.phase = "battle";
    run.turnOrder = buildDungeonTurnOrder();
    run.turnIndex = 0;
    ensureDungeonSelectedEnemy();
    broadcastDungeonLog(`A equipe entrou em ${regionName} para ${getDungeonEncounterLabel().toLowerCase()}.`, "");
    broadcastDungeonState();
    updateUI();
  }

  startDungeonRaid = window.startDungeonRaid = function(){
    if(!isDungeonHost() || getDungeonRoomMembers().length < 2 || isDead || player.hp <= 0){ return; }
    initializeDungeonLocalHero();
    dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = buildDungeonHeroProfile(getDungeonLocalHero());
    const run = getDungeonRun();
    run.active = true;
    run.phase = "battle";
    run.runId = `run_${Date.now()}_${Math.floor(Math.random() * 999)}`;
    run.regionIndex = 0;
    run.encounterIndex = 0;
    run.round = 1;
    run.shopStock = [];
    currentMode = DUNGEON_RUN_MODE;
    startDungeonEncounter();
  };

  window.advanceDungeonIntermission = function(){
    if(!isDungeonHost() || getDungeonRun().phase !== "intermission"){ return; }
    startDungeonEncounter();
  };

  window.useDungeonFountain = function(){
    if(!isDungeonRunMode() || getDungeonRun().phase !== "intermission"){ return; }
    if(isDungeonHost()){
      const fountain = getDungeonIntermissionCost();
      const livingMembers = getDungeonRoomMembers().filter(member => !member.dead);
      if(fountain.total <= 0){
        log("A equipe ja esta em plena forma.");
        return;
      }
      if(livingMembers.some(member => (member.coins || 0) < fountain.share)){
        log("Nem todos os herois possuem moedas suficientes para pagar a fonte.");
        return;
      }
      dungeonMultiplayer.dungeonCoins = Math.max(0, dungeonMultiplayer.dungeonCoins - fountain.share);
      const hero = getDungeonLocalHero();
      if(hero){
        hero.dungeonCoins = dungeonMultiplayer.dungeonCoins;
        const caps = getDungeonPreviewStats(hero);
        hero.hp = caps.maxHp;
        hero.mp = caps.maxMp;
        bumpDungeonHeroStateVersion(hero);
      }
      dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = buildDungeonHeroProfile(getDungeonLocalHero());
      player.stats.dungeonFountainUses = (player.stats.dungeonFountainUses || 0) + 1;
      broadcastToDungeonPeers({ type: "fountain_used", share: fountain.share, sourceId: dungeonMultiplayer.peer.id });
      log(`A fonte restaurou toda a equipe por ${fountain.share} moedas para cada aventureiro.`);
      syncDungeonProfile();
      updateUI();
      return;
    }
    if(dungeonMultiplayer.hostConnection?.open){
      dungeonMultiplayer.hostConnection.send({ type: "request_fountain" });
    }
  };

  window.abandonDungeonRun = function(){
    if(!isDungeonRunMode() || !hasActiveDungeonRun()){ return; }
    if(isDungeonHost()){
      broadcastToDungeonPeers({ type: "run_end", outcome: "abandon", message: "A equipe abandonou a dungeon e voltou para a campanha principal." });
      finishDungeonRun("A equipe abandonou a dungeon e voltou para a campanha principal.", "a dungeon");
      return;
    }
    if(dungeonMultiplayer.hostConnection?.open){
      dungeonMultiplayer.hostConnection.send({ type: "abandon_run" });
    }
  };

  leaveDungeonRoom = window.leaveDungeonRoom = function(silent = false){
    if(hasActiveDungeonRun()){
      finishDungeonRun(silent ? "" : "Voce deixou a sala da dungeon e voltou para a campanha principal.", "a dungeon");
      return;
    }
    closeDungeonConnections();
    dungeonMultiplayer = createDungeonMultiplayerState();
    ensureDungeonRunContainers();
    currentMode = window.IS_DUNGEON_PAGE ? "dungeon" : "battle";
    if(!silent){
      log("Voce saiu da sala da dungeon.");
    }
    updateUI();
  };

  function handleDungeonPeerDisconnect(peerId){
    delete dungeonMultiplayer.connections[peerId];
    if(dungeonMultiplayer.party[peerId]){
      log(`${dungeonMultiplayer.party[peerId].name} saiu da sala da dungeon.`);
      delete dungeonMultiplayer.party[peerId];
      syncDungeonTurnOrder();
      if(hasActiveDungeonRun() && getDungeonRoomMembers().length < 2){
        handleDungeonRaidDefeat("A expedicao terminou porque o grupo se desfez.");
        return;
      }
      broadcastDungeonState();
      updateUI();
    }
  }

  hostDungeonRoom = window.hostDungeonRoom = function(){
    if(!["dungeon", DUNGEON_RUN_MODE].includes(currentMode) || !player || isDead || player.hp <= 0){ return; }
    if(typeof Peer === "undefined"){
      log("Nao foi possivel carregar o sistema online da dungeon.");
      return;
    }
    closeDungeonConnections();
    dungeonMultiplayer = createDungeonMultiplayerState();
    ensureDungeonRunContainers();
    const roomCode = `DNG${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    dungeonMultiplayer.isHost = true;
    dungeonMultiplayer.roomCode = roomCode;
    dungeonMultiplayer.peer = new Peer(roomCode);
    dungeonMultiplayer.peer.on("open", id => {
      dungeonMultiplayer.roomCode = id;
      dungeonMultiplayer.party[id] = buildDungeonHeroProfile(null);
      log(`Sala da dungeon criada: ${id}.`);
      updateUI();
    });
    dungeonMultiplayer.peer.on("connection", connection => {
      if(getDungeonRoomMembers().length >= 3){
        connection.on("open", () => {
          connection.send({ type: "reject", reason: "A sala da dungeon ja esta cheia." });
          connection.close();
        });
        return;
      }
      dungeonMultiplayer.connections[connection.peer] = connection;
      connection.on("data", data => handleDungeonHostMessage(connection, data));
      connection.on("close", () => handleDungeonPeerDisconnect(connection.peer));
    });
    dungeonMultiplayer.peer.on("error", error => {
      log(`Erro na dungeon online: ${error.type || error.message}.`);
      updateUI();
    });
  };

  joinDungeonRoom = window.joinDungeonRoom = function(){
    if(!["dungeon", DUNGEON_RUN_MODE].includes(currentMode) || !player || isDead || player.hp <= 0){ return; }
    if(typeof Peer === "undefined"){
      log("Nao foi possivel carregar o sistema online da dungeon.");
      return;
    }
    const input = document.getElementById("dungeonJoinCode");
    const roomCode = (input?.value || "").trim().toUpperCase();
    if(!roomCode){
      log("Informe o codigo da sala para entrar na dungeon.");
      return;
    }
    closeDungeonConnections();
    dungeonMultiplayer = createDungeonMultiplayerState();
    ensureDungeonRunContainers();
    dungeonMultiplayer.isHost = false;
    dungeonMultiplayer.roomCode = roomCode;
    dungeonMultiplayer.peer = new Peer();
    dungeonMultiplayer.peer.on("open", () => {
      const connection = dungeonMultiplayer.peer.connect(roomCode, { reliable: true });
      dungeonMultiplayer.hostConnection = connection;
      connection.on("open", () => {
        connection.send({ type: "join", player: buildDungeonHeroProfile(null), heroState: cloneData(player) });
        log(`Conectando a sala ${roomCode}...`);
        updateUI();
      });
      connection.on("data", data => handleDungeonGuestMessage(data));
      connection.on("close", () => {
        log("A conexao com a dungeon foi encerrada.");
        closeDungeonConnections();
        dungeonMultiplayer = createDungeonMultiplayerState();
        ensureDungeonRunContainers();
        currentMode = window.IS_DUNGEON_PAGE ? "dungeon" : "battle";
        updateUI();
      });
    });
    dungeonMultiplayer.peer.on("error", error => {
      log(`Erro na conexao da dungeon: ${error.type || error.message}.`);
      updateUI();
    });
  };

  handleDungeonHostMessage = window.handleDungeonHostMessage = function(connection, data){
    if(!data || !isDungeonHost()){ return; }
    if(data.type === "join"){
      dungeonMultiplayer.party[connection.peer] = data.player;
      if(data.heroState){
        setDungeonHeroStateForPeer(connection.peer, data.heroState);
      }
      connection.send({ type: "joined", roomCode: dungeonMultiplayer.roomCode });
      log(`${data.player.name} entrou na sala da dungeon.`);
      broadcastDungeonState();
      updateUI();
      return;
    }
    if(data.type === "profile_update"){
      dungeonMultiplayer.party[connection.peer] = data.player;
      broadcastDungeonState();
      updateUI();
      return;
    }
    if(data.type === "hero_state"){
      if(data.heroState){
        setDungeonHeroStateForPeer(connection.peer, data.heroState);
        broadcastDungeonState();
        updateUI();
      }
      return;
    }
    if(data.type === "request_fountain"){
      if(getDungeonRun().phase === "intermission"){
        window.useDungeonFountain();
      }
      return;
    }
    if(data.type === "abandon_run"){
      broadcastToDungeonPeers({ type: "run_end", outcome: "abandon", message: "A equipe abandonou a dungeon e voltou para a campanha principal." });
      finishDungeonRun("A equipe abandonou a dungeon e voltou para a campanha principal.", "a dungeon");
      return;
    }
    if(data.type === "player_defeated"){
      handleDungeonRaidDefeat(`${data.player?.name || dungeonMultiplayer.party[connection.peer]?.name || "Um aventureiro"} caiu na dungeon. A expedicao terminou em derrota.`);
      return;
    }
    if(data.type === "enemy_reaction"){
      dungeonMultiplayer.party[connection.peer] = data.player;
      if(data.updatedEnemy){
        replaceDungeonEnemy(data.updatedEnemy);
        maybeFinishDungeonEncounterAfterEnemyUpdate();
      }
      if(data.reactionMessage){
        broadcastDungeonLog(data.reactionMessage, connection.peer);
      }
      broadcastDungeonState();
      updateUI();
      return;
    }
    if(data.type === "action"){
      if(getDungeonRun().phase !== "battle"){ return; }
      const turnEntry = getDungeonCurrentTurnEntry();
      if(!turnEntry || turnEntry.kind !== "hero" || turnEntry.id !== connection.peer){
        return;
      }
      const resolution = resolveDungeonActionForPeer(connection.peer, data);
      if(resolution.blocked){
        if(resolution.message){
          if(connection.peer === dungeonMultiplayer.peer?.id){
            log(resolution.message);
          }else{
            const origin = dungeonMultiplayer.party[connection.peer]?.displayedClassName || dungeonMultiplayer.party[connection.peer]?.name || "Aliado";
            broadcastToDungeonPeers({ type: "log", message: `${origin}: ${resolution.message}`, sourceId: connection.peer });
          }
        }
        broadcastDungeonState();
        updateUI();
        return;
      }
      (resolution.messages || []).forEach(message => broadcastDungeonLog(message, connection.peer));
      maybeFinishDungeonEncounterAfterEnemyUpdate();
      if(resolution.defeatedHero){
        handleDungeonRaidDefeat(resolution.defeatMessage);
        return;
      }
      if(getDungeonRun().phase === "battle" && (data.turnConsumed ?? true)){
        advanceDungeonTurn();
        return;
      }
      broadcastDungeonState();
      updateUI();
    }
  };

  handleDungeonGuestMessage = window.handleDungeonGuestMessage = function(data){
    if(!data){ return; }
    if(data.type === "reject"){
      log(data.reason);
      closeDungeonConnections();
      dungeonMultiplayer = createDungeonMultiplayerState();
      ensureDungeonRunContainers();
      updateUI();
      return;
    }
    if(data.type === "joined"){
      dungeonMultiplayer.roomCode = data.roomCode;
      updateUI();
      return;
    }
    if(data.type === "state"){
      ensureDungeonRunContainers();
      dungeonMultiplayer.roomCode = data.roomCode || dungeonMultiplayer.roomCode;
      dungeonMultiplayer.party = data.party || {};
      dungeonMultiplayer.run = data.run || createEmptyDungeonRunState();
      dungeonMultiplayer.heroStates = data.heroStates || {};
      ensureDungeonRunContainers();
      if(dungeonMultiplayer.run.active){
        ensureDungeonRunHeroInitialized(dungeonMultiplayer.run.runId);
        syncDungeonHeroFromState(dungeonMultiplayer.peer?.id);
        if(getDungeonLocalHero()){
          dungeonMultiplayer.localRunId = dungeonMultiplayer.run.runId;
        }
        currentMode = DUNGEON_RUN_MODE;
        if(!dungeonMultiplayer.heroStates?.[dungeonMultiplayer.peer?.id] && getDungeonLocalHero()){
          syncDungeonProfile();
        }
      }else if(currentMode === DUNGEON_RUN_MODE){
        currentMode = "dungeon";
      }
      ensureDungeonSelectedEnemy();
      updateUI();
      return;
    }
    if(data.type === "log"){
      if(data.sourceId && data.sourceId === dungeonMultiplayer.peer?.id){
        return;
      }
      log(data.message);
      return;
    }
    if(data.type === "party_effect"){
      if(data.effect?.sourceId !== dungeonMultiplayer.peer?.id || data.effect?.applyToSource){
        applyDungeonPartyEffectToLocalHero(data.effect);
      }
      updateUI();
      return;
    }
    if(data.type === "encounter_reward"){
      if(data.heroStates){
        dungeonMultiplayer.heroStates = { ...(dungeonMultiplayer.heroStates || {}), ...data.heroStates };
        syncDungeonHeroFromState(dungeonMultiplayer.peer?.id);
      }
      const localHero = getDungeonLocalHero();
      if(localHero){
        syncLevelGlobalsFromDungeonHero(localHero);
      }
      log(data.message);
      updateDungeonBestStep(data.step || Math.max(1, getDungeonStepNumber() - 1));
      if(data.wasBoss){
        player.stats.dungeonRegionsCleared = (player.stats.dungeonRegionsCleared || 0) + 1;
      }
      if(data.completed){
        player.stats.dungeonClears = (player.stats.dungeonClears || 0) + 1;
      }
      syncDungeonProfile();
      updateUI();
      return;
    }
    if(data.type === "enemy_attack"){
      if(data.packet?.targetId === dungeonMultiplayer.peer?.id){
        applyDungeonIncomingPacketToLocalHero(data.packet);
      }
      return;
    }
    if(data.type === "fountain_used"){
      dungeonMultiplayer.dungeonCoins = Math.max(0, dungeonMultiplayer.dungeonCoins - data.share);
      const hero = getDungeonLocalHero();
      if(hero){
        hero.dungeonCoins = dungeonMultiplayer.dungeonCoins;
        const caps = getDungeonPreviewStats(hero);
        hero.hp = caps.maxHp;
        hero.mp = caps.maxMp;
        bumpDungeonHeroStateVersion(hero);
      }
      player.stats.dungeonFountainUses = (player.stats.dungeonFountainUses || 0) + 1;
      log(`A fonte restaurou toda a equipe por ${data.share} moedas da dungeon.`);
      syncDungeonProfile();
      updateUI();
      return;
    }
    if(data.type === "run_end"){
      finishDungeonRun(data.message, "a dungeon");
      return;
    }
    if(data.type === "room_closed"){
      finishDungeonRun("A sala da dungeon foi encerrada.", "a dungeon");
    }
  };

  handleDungeonRaidDefeat = window.handleDungeonRaidDefeat = function(message){
    if(isDungeonHost()){
      broadcastToDungeonPeers({ type: "run_end", outcome: "defeat", message });
    }
    finishDungeonRun(message, "a dungeon");
  };

  saveCampaign = window.saveCampaign = function(){
    const savedMode = currentMode;
    const savedEnemy = enemy;
    const savedNeedsNewEnemy = needsNewEnemy;
    if(savedMode === "dungeon" || savedMode === DUNGEON_RUN_MODE){
      currentMode = "battle";
      enemy = null;
      needsNewEnemy = true;
    }
    try{
      return baseSaveCampaign();
    }finally{
      currentMode = savedMode;
      enemy = savedEnemy;
      needsNewEnemy = savedNeedsNewEnemy;
    }
  };

  getTrophies = window.getTrophies = function(){
    const trophies = baseGetTrophies ? baseGetTrophies() : [];
    return [
      ...trophies,
      { category: "Dungeon", name: "Loja da Expediccao", done: (player.stats.dungeonShopPurchases || 0) >= 3, description: "Compre 3 itens na loja da dungeon." },
      { category: "Dungeon", name: "Agua Milagrosa", done: (player.stats.dungeonFountainUses || 0) >= 2, description: "Use a fonte da dungeon 2 vezes." },
      { category: "Dungeon", name: "Patrulhas Variadas", done: (player.stats.dungeonMultiEncounterWins || 0) >= 3, description: "Venca 3 batalhas da dungeon contra grupos com mais de um inimigo." },
      { category: "Dungeon", name: "Regioes Vencidas", done: (player.stats.dungeonRegionsCleared || 0) >= 3, description: "Derrote o chefao de 3 regioes diferentes dentro da dungeon." }
    ];
  };

  setMode = window.setMode = function(mode){
    const validModes = ["battle", "village", "trophies", "camp", "dungeon", "bestiary", DUNGEON_RUN_MODE];
    if(isProcessingTurn || isDead || player.hp <= 0 || !validModes.includes(mode)){ return; }
    if(hasActiveDungeonRun() && mode !== DUNGEON_RUN_MODE){
      log("Enquanto a expedicao estiver ativa, voce so sai da dungeon abandonando a run ou se alguem do grupo cair.");
      updateUI();
      return;
    }
    if(mode === DUNGEON_RUN_MODE && !hasActiveDungeonRun()){
      if(!isDungeonConnected()){
        log("Entre em uma sala e adentre a dungeon com o grupo para abrir essa aba.");
        updateUI();
        return;
      }
      log("A run da dungeon ainda nao comecou.");
      updateUI();
      return;
    }
    if(mode !== DUNGEON_RUN_MODE){
      return baseSetMode(mode);
    }
    currentMode = DUNGEON_RUN_MODE;
    updateUI();
  };

  renderActions = window.renderActions = function(){
    if(currentMode === "dungeon" && window.IS_DUNGEON_PAGE){
      const actions = document.getElementById("actions");
      if(isDead || player.hp <= 0){
        actions.innerHTML = `<button disabled>Aguardando seu renascimento...</button>`;
        return;
      }
      if(levelUpPoints > 0 || needsSubclassChoice()){
        actions.innerHTML = `<button disabled>Finalize sua evolucao antes de entrar na dungeon</button><button onclick="returnToMainPage('battle')">Voltar para a batalha</button>`;
        return;
      }
      if(!isDungeonConnected()){
        actions.innerHTML = `
          <button onclick="hostDungeonRoom()">Criar sala</button>
          <button onclick="joinDungeonRoom()">Entrar na sala</button>
          <button onclick="returnToMainPage('battle')">Voltar para a batalha</button>`;
        return;
      }
      actions.innerHTML = `
        ${isDungeonHost()
          ? `<button onclick="startDungeonRaid()" ${getDungeonRoomMembers().length >= 2 ? "" : "disabled"}>Adentrar dungeon</button>`
          : `<button disabled>Aguardando o host adentrar a dungeon</button>`}
        <button onclick="leaveDungeonRoom()">Fechar sala</button>`;
      return;
    }
    if(!isDungeonRunMode()){
      return baseRenderActions();
    }
    const actions = document.getElementById("actions");
    const hero = getDungeonLocalHero();
    if(!hero){
      actions.innerHTML = `<button onclick="setMode('dungeon')">Voltar ao lobby da dungeon</button>`;
      return;
    }
    if(getDungeonRun().phase === "intermission"){
      actions.innerHTML = `
        <button onclick="setDungeonIntermissionView('fountain')">Ir para a fonte</button>
        <button onclick="setDungeonIntermissionView('shop')">Abrir loja</button>
        ${isDungeonHost() ? `<button onclick="advanceDungeonIntermission()">Proxima batalha</button>` : `<button disabled>Aguardando o host escolher a proxima batalha</button>`}
        <button onclick="abandonDungeonRun()">Abandonar dungeon</button>`;
      return;
    }
    if(!isMyDungeonTurn()){
      actions.innerHTML = `<button disabled>Aguarde o turno do grupo...</button><button onclick="abandonDungeonRun()">Abandonar dungeon</button>`;
      return;
    }
    const selectedEnemy = getDungeonSelectedEnemyOrFallback();
    const basicAttackLabel = withDungeonHeroContext(hero, selectedEnemy, () => getBasicAttackLabel()).result;
    const basicAttackTooltip = withDungeonHeroContext(hero, selectedEnemy, () => getBasicAttackTooltip()).result;
    const skillButtons = getDungeonSkillInfo(selectedEnemy, hero)
      .map((skill, index) => `<button class="action-btn" data-tooltip="${getDungeonSkillButtonTooltip(skill)}" onclick="dungeonUseSkill(${index})">${skill.name}</button>`)
      .join("");
    actions.innerHTML = `
      <button class="action-btn" data-tooltip="${basicAttackTooltip} | Alvo: inimigo selecionado" onclick="dungeonAttack()">${basicAttackLabel}</button>
      ${skillButtons}
      <button class="action-btn" data-tooltip="Encerra a sua vez sem atacar." onclick="dungeonPassTurn()">Passar turno</button>
      <button onclick="abandonDungeonRun()">Abandonar dungeon</button>`;
  };

  updateUI = window.updateUI = function(){
    if(!player){
      return baseUpdateUI();
    }
    if(!isDungeonRunMode()){
      return baseUpdateUI();
    }
    ensureDungeonRunContainers();
    const hero = getDungeonLocalHero() || initializeDungeonLocalHero();
    syncLevelGlobalsFromDungeonHero(hero);
    const previewStats = getDungeonPreviewStats(hero);
    const shownPlayerHp = hero.hp;
    const shownPlayerMp = hero.mp;
    const shownPlayerXp = displayState.playerXp ?? hero.xp;
    const xpToNextLevel = withDungeonHeroContext(hero, null, () => getXpToNextLevel()).result;
    const heroCoins = hero.dungeonCoins || 0;
    const shieldValue = hero.effects?.shieldValue || 0;
    const shieldWidth = Math.min(100, shieldValue / Math.max(1, previewStats.maxHp) * 100);
    const activeBuffs = withDungeonHeroContext(hero, getDungeonSelectedEnemyOrFallback(), () => getActiveBuffs()).result;
    document.getElementById("heroPortraitPanel").innerHTML = `
      <h3>Seu heroi</h3>
      <div class="hero-portrait-card">
        <div class="hero-portrait-stage">${renderCombatAvatar("heroes", getHeroCombatAssetKey(hero), getHeroSpriteIcon(hero), getDisplayedClassName(hero))}</div>
        <div class="hero-portrait-copy">
          <strong class="coin-badge" style="align-self:flex-start;">Nivel ${hero.level}</strong>
          <span class="lock-note">Moedas da dungeon: ${heroCoins}</span>
          <span class="lock-note">XP atual: ${hero.level >= MAX_LEVEL ? "MAX" : `${shownPlayerXp}/${xpToNextLevel}`}</span>
        </div>
      </div>`;

    const dungeonButtons = `
      <button class="tab-btn active">Incursao em andamento</button>
      <button class="tab-btn" onclick="returnToMainPage('battle')" ${getDungeonRun().active ? "disabled" : ""}>Voltar para a campanha</button>`;
    document.getElementById("modeTabs").innerHTML = dungeonButtons;

    document.getElementById("playerInfo").innerHTML = `
      <div class="player-header">
        <div class="player-title-wrap">
          <div><h3>${getDisplayedClassName(hero)} - Nivel ${hero.level}</h3>${getDisplayedClassName(hero) !== hero.class ? `<span class="lock-note">Classe base: ${hero.class}</span>` : ""}</div>
        </div>
        <div class="coin-badge">${heroCoins} moedas</div>
      </div>
      ${shieldValue > 0 ? `<div class="shield-row"><div class="shield-label">Escudo: ${shieldValue}</div><div class="bar small"><div class="shield-fill" style="width:${shieldWidth}%"></div></div></div>` : ""}
      Vida: ${shownPlayerHp}/${previewStats.maxHp}
      <div class="bar"><div class="fill hp" style="width:${shownPlayerHp / Math.max(1, previewStats.maxHp) * 100}%"></div></div>
      Mana: ${shownPlayerMp}/${previewStats.maxMp}
      <div class="bar"><div class="fill mp" style="width:${shownPlayerMp / Math.max(1, previewStats.maxMp) * 100}%"></div></div>
      XP: ${hero.level >= MAX_LEVEL ? "MAX" : `${shownPlayerXp}/${xpToNextLevel}`}
      <div class="bar"><div class="fill xp" style="width:${hero.level >= MAX_LEVEL ? 100 : shownPlayerXp / Math.max(1, xpToNextLevel) * 100}%"></div></div>
      <div class="buff-list">${activeBuffs.length ? activeBuffs.map(buff => `<span class="buff-pill">${buff}</span>`).join("") : `<span class="buff-pill">Sem buffs ativos</span>`}</div>`;

    document.getElementById("enemyInfo").innerHTML = renderDungeonRunEnemyPanel();
    document.getElementById("regionInfo").innerHTML = renderDungeonRegionPanel();
    document.getElementById("inventoryInfo").innerHTML = renderDungeonInventoryPanel();
    renderActions();
    renderLevelUpPanel();
    const logBox = document.getElementById("log");
    const logToggle = document.querySelector(".panel-header button");
    const logPanel = document.getElementById("logPanel");
    const playerPanel = document.getElementById("playerInfo");
    const enemyPanel = document.getElementById("enemyInfo");
    const actionsRow = document.getElementById("actions");
    const levelPanel = document.getElementById("levelUpPanel");
    if(logBox){
      logBox.style.display = isLogHidden ? "none" : "block";
    }
    if(logToggle){
      logToggle.textContent = isLogHidden ? "Mostrar" : "Ocultar";
    }
    if(logPanel){
      logPanel.style.display = "block";
      logPanel.style.order = "5";
    }
    if(playerPanel){
      playerPanel.style.display = "block";
      playerPanel.style.order = "3";
    }
    if(enemyPanel){
      enemyPanel.style.order = "1";
    }
    if(actionsRow){
      actionsRow.style.order = "2";
    }
    if(levelPanel){
      levelPanel.style.order = "4";
    }
    saveCampaign();
  };

  renderLevelUpPanel = window.renderLevelUpPanel = function(){
    if(!isDungeonRunMode()){
      return baseRenderLevelUpPanel();
    }
    syncLevelGlobalsFromDungeonHero();
    return baseRenderLevelUpPanel();
  };

  adjustAttribute = window.adjustAttribute = function(attribute, amount){
    if(!isDungeonRunMode()){
      return baseAdjustAttribute(attribute, amount);
    }
    syncLevelGlobalsFromDungeonHero();
    baseAdjustAttribute(attribute, amount);
    syncLevelGlobalsToDungeonHero();
    syncDungeonProfile();
  };

  finishLevelUp = window.finishLevelUp = function(){
    if(!isDungeonRunMode()){
      return baseFinishLevelUp();
    }
    const hero = getDungeonLocalHero();
    if(!hero){ return; }
    syncLevelGlobalsFromDungeonHero(hero);
    const savedMode = currentMode;
    const savedEnemy = enemy;
    const savedNeedsNewEnemy = needsNewEnemy;
    const savedUpdateUI = updateUI;
    currentMode = DUNGEON_RUN_MODE;
    enemy = getDungeonSelectedEnemyOrFallback();
    needsNewEnemy = false;
    try{
      updateUI = function(){};
      withDungeonHeroContext(hero, enemy, () => {
        baseFinishLevelUp();
      });
    }finally{
      updateUI = savedUpdateUI;
    }
    currentMode = savedMode;
    enemy = savedEnemy;
    needsNewEnemy = savedNeedsNewEnemy;
    syncLevelGlobalsToDungeonHero(hero);
    syncDungeonProfile();
    updateUI();
  };

  chooseSubclass = window.chooseSubclass = function(subclassId){
    if(!isDungeonRunMode()){
      return baseChooseSubclass(subclassId);
    }
    const hero = getDungeonLocalHero();
    if(!hero){ return; }
    const savedMode = currentMode;
    const savedEnemy = enemy;
    const savedUpdateUI = updateUI;
    currentMode = DUNGEON_RUN_MODE;
    enemy = getDungeonSelectedEnemyOrFallback();
    try{
      updateUI = function(){};
      withDungeonHeroContext(hero, enemy, () => {
        baseChooseSubclass(subclassId);
      });
    }finally{
      updateUI = savedUpdateUI;
    }
    currentMode = savedMode;
    enemy = savedEnemy;
    syncLevelGlobalsToDungeonHero(hero);
    syncDungeonProfile();
    updateUI();
  };

  if(window.IS_DUNGEON_PAGE){
    if(localStorage.getItem("rpg_turnos_campaign_v1")){
      if(typeof player === "undefined" || !player){
        continueCampaign();
      }else{
        currentMode = hasActiveDungeonRun() ? DUNGEON_RUN_MODE : "dungeon";
        updateUI();
      }
    }else{
      location.href = "index.html";
    }
  }
})();
