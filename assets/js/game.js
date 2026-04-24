const SAVE_KEY = "rpg_turnos_campaign_v1";
const UI_SETTINGS_KEY = "rpg_turnos_ui_settings_v1";
const MAX_LEVEL = 100;

let player, enemy;
let musicFadeInterval = null;
let musicFadeTargetVolume = 0;
let pendingLevelUps = 0;
let levelUpPoints = 0;
let allocation = { strength: 0, wisdom: 0, vitality: 0 };
let isProcessingTurn = false;
let currentRegion = "Floresta";
let needsNewEnemy = false;
let currentMode = "battle";
let bestiaryRegionFilter = null;
let artisanRegionFilter = null;
let selectedTrophyCategory = "Todas";
let campTab = "status";
let villageTab = "inn";
let hideArtisanMaterials = false;
let enemiesSpawned = 0;
let isDead = false;
let deadUntil = null;
let isLogHidden = false;
let isSettingsOpen = false;
let forgeFeedback = { slot: "", result: "", timeoutId: null };
let playerEffects = createDefaultPlayerEffects();
let displayState = {
  playerHp: null,
  playerMp: null,
  playerXp: null,
  enemyHp: null
};
let uiSettings = loadUiSettings();
let dungeonMultiplayer = createDungeonMultiplayerState();
let regionMusicAudio = null;
let currentMusicRegion = null;
const IS_DUNGEON_PAGE = !!window.IS_DUNGEON_PAGE;
const MAIN_PAGE_PATH = "index.html";
const DUNGEON_PAGE_PATH = "dungeon.html";
const PENDING_PAGE_MODE_KEY = "rpg_turnos_pending_page_mode_v1";

function queuePageMode(mode){
  try{
    sessionStorage.setItem(PENDING_PAGE_MODE_KEY, mode);
  }catch{}
}

function consumeQueuedPageMode(){
  try{
    const mode = sessionStorage.getItem(PENDING_PAGE_MODE_KEY);
    if(mode){
      sessionStorage.removeItem(PENDING_PAGE_MODE_KEY);
    }
    return mode || "";
  }catch{
    return "";
  }
}

function navigateToGamePage(mode){
  queuePageMode(mode);
  location.href = ["dungeon", "dungeon_run"].includes(mode) ? DUNGEON_PAGE_PATH : MAIN_PAGE_PATH;
}

function openDungeonPage(){
  navigateToGamePage("dungeon");
}

function returnToMainPage(mode = "battle"){
  navigateToGamePage(mode);
}

function setVillageTab(tab){
  if(!["inn", "alchemist", "forge", "artisan"].includes(tab)){ return; }
  villageTab = tab;
  if(tab === "artisan" && !artisanRegionFilter){
    artisanRegionFilter = currentRegion;
  }
  updateUI();
}

function setArtisanRegion(regionName){
  if(!regions[regionName]){ return; }
  artisanRegionFilter = regionName;
  if(currentMode === "village" && villageTab === "artisan"){
    updateUI();
  }
}

function createDefaultPlayerEffects(){
  return {
    attackBuffTurns: 0,
    attackBuffAmount: 0,
    attackBuffPercent: 0,
    skillBuffTurns: 0,
    skillBuffAmount: 0,
    skillBuffPercent: 0,
    manaRegenBuffTurns: 0,
    manaRegenBuffPercent: 0,
    guaranteedHitTurns: 0,
    enemyMissBonusTurns: 0,
    enemyMissBonus: 0,
    regenTurns: 0,
    regenPercent: 0,
    firstSkillFreeAvailable: false,
    finalDamageBuffTurns: 0,
    finalDamageBuffPercent: 0,
    nextDamageBonusPercent: 0,
    nextBarrageDamageBonusPercent: 0,
    shieldValue: 0,
    shieldTurns: 0,
    shieldReactiveWeakening: false,
    percentReductionTurns: 0,
    percentReduction: 0,
    invulnerableTurns: 0,
    storedFaithDamage: 0,
    enemyMaxHpBonusDamagePercent: 0,
    enemyMaxHpBonusTurns: 0,
    nextIncomingAutoMiss: false,
    forcedBasicTurns: 0,
    basicOnlyUntouchableTurns: 0,
    bonusBasicHits: 0,
    berserkerLastStandAvailable: false,
    berserkerLastStandPending: false,
    accessoryFatalSaveUsed: false,
    samuraiEchoAvailable: false,
    burnDamagePerTurn: 0,
    burnTurns: 0,
    healReductionPercent: 0,
    healReductionTurns: 0,
    damageDownPercent: 0,
    damageDownTurns: 0,
    skipNextTurn: false,
    flatReduction: 0,
    reflectPercent: 0,
    arcaneCharges: 0,
    arcaneChargeTurns: 0,
    firstAttackDoubleAvailable: false,
    incomingDamageBonusTurns: 0,
    incomingDamageBonusPercent: 0,
    lastActionType: "",
    lastActionTurn: 0,
    natureCadence: 0,
    natureCrownedTurns: 0,
    natureTrueFormTurns: 0,
    natureShieldBonusTurns: 0,
    natureShieldBonusPercent: 0
  };
}

function createDungeonMultiplayerState(){
  return {
    peer: null,
    isHost: false,
    roomCode: "",
    hostConnection: null,
    connections: {},
    party: {},
    actionLockedUntil: 0,
    enemyAttackTimer: null,
    turnOrder: [],
    turnIndex: 0,
    dungeonStepIndex: 0,
    round: 1,
    enemySkipTurn: false,
    battleActive: false
  };
}

function loadUiSettings(){
  try{
    const saved = JSON.parse(localStorage.getItem(UI_SETTINGS_KEY) || "{}");
    return {
      enemyBarSpeed: saved.enemyBarSpeed || "rapida",
      disableRespawnTimer: !!saved.disableRespawnTimer,
      musicVolume: typeof saved.musicVolume === "number" ? Math.min(1, Math.max(0, saved.musicVolume)) : 0.5,
      musicMuted: !!saved.musicMuted
    };
  }catch{
    return { enemyBarSpeed: "rapida", disableRespawnTimer: false, musicVolume: 0.5, musicMuted: false };
  }
}

function saveUiSettings(){
  localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(uiSettings));
  renderSettingsPanel();
}

function toggleSettingsPanel(){
  isSettingsOpen = !isSettingsOpen;
  renderSettingsPanel();
}

function toggleHideArtisanMaterials(){
  hideArtisanMaterials = !hideArtisanMaterials;
  updateUI();
}

function triggerForgeFeedback(slot, result){
  if(forgeFeedback.timeoutId){
    clearTimeout(forgeFeedback.timeoutId);
  }
  forgeFeedback = {
    slot,
    result,
    timeoutId: setTimeout(() => {
      forgeFeedback = { slot: "", result: "", timeoutId: null };
      if(currentMode === "village" && villageTab === "forge"){
        updateUI();
      }
    }, 1200)
  };
}

function ensureRegionMusicAudio(){
  if(regionMusicAudio){ return regionMusicAudio; }
  regionMusicAudio = new Audio();
  regionMusicAudio.loop = true;
  regionMusicAudio.preload = "auto";
  applyMusicSettings();
  return regionMusicAudio;
}

function clearMusicFade(){
  if(musicFadeInterval){
    clearInterval(musicFadeInterval);
    musicFadeInterval = null;
  }
}

function getTargetMusicVolume(){
  if(uiSettings.musicMuted){ return 0; }
  return Math.min(1, Math.max(0, uiSettings.musicVolume ?? 0.5));
}

function startRegionMusicFadeIn(){
  const audio = ensureRegionMusicAudio();
  const targetVolume = getTargetMusicVolume();
  musicFadeTargetVolume = targetVolume;
  clearMusicFade();
  if(targetVolume <= 0){
    audio.volume = 0;
    return;
  }
  const startingVolume = Math.min(targetVolume, 0.03);
  audio.volume = startingVolume;
  musicFadeInterval = setInterval(() => {
    const liveTarget = getTargetMusicVolume();
    musicFadeTargetVolume = liveTarget;
    if(liveTarget <= 0){
      audio.volume = 0;
      clearMusicFade();
      return;
    }
    const nextVolume = Math.min(liveTarget, audio.volume + Math.max(0.008, liveTarget / 18));
    audio.volume = nextVolume;
    if(nextVolume >= liveTarget - 0.001){
      audio.volume = liveTarget;
      clearMusicFade();
    }
  }, 220);
}

function applyMusicSettings(){
  const audio = ensureRegionMusicAudio();
  const targetVolume = getTargetMusicVolume();
  musicFadeTargetVolume = targetVolume;
  if(targetVolume <= 0){
    audio.volume = 0;
    clearMusicFade();
    return;
  }
  if(musicFadeInterval){
    if(audio.volume > targetVolume){
      audio.volume = targetVolume;
    }
    return;
  }
  audio.volume = targetVolume;
}

function setMusicVolume(nextVolume){
  uiSettings.musicVolume = Math.min(1, Math.max(0, nextVolume));
  applyMusicSettings();
  saveUiSettings();
}

function adjustMusicVolume(delta){
  setMusicVolume((uiSettings.musicVolume ?? 0.5) + delta);
}

function toggleMusicMute(){
  uiSettings.musicMuted = !uiSettings.musicMuted;
  applyMusicSettings();
  saveUiSettings();
}

function syncRegionMusic(forceRestart = false){
  const track = regionMusicTracks[currentRegion] || null;
  const audio = ensureRegionMusicAudio();
  if(!track){
    clearMusicFade();
    if(!audio.paused){
      audio.pause();
    }
    audio.volume = 0;
    currentMusicRegion = null;
    return;
  }
  const shouldRestart = forceRestart || currentMusicRegion !== currentRegion || !audio.src || !audio.src.endsWith(track.src.replace(/\\/g, "/"));
  if(shouldRestart){
    clearMusicFade();
    audio.src = track.src;
    currentMusicRegion = currentRegion;
    audio.currentTime = 0;
  }
  const targetVolume = getTargetMusicVolume();
  if(!shouldRestart){
    applyMusicSettings();
  }else{
    audio.volume = targetVolume <= 0 ? 0 : Math.min(targetVolume, 0.03);
  }
  const playAttempt = audio.play();
  if(playAttempt?.catch){
    playAttempt.catch(() => {});
  }
  if(shouldRestart){
    startRegionMusicFadeIn();
  }
}

function setEnemyBarSpeed(speed){
  uiSettings.enemyBarSpeed = speed;
  saveUiSettings();
}

function setDisableRespawnTimer(enabled){
  uiSettings.disableRespawnTimer = !!enabled;
  saveUiSettings();
}

function renderSettingsPanel(){
  const panel = document.getElementById("settingsPanel");
  if(!panel){ return; }
  panel.style.display = isSettingsOpen ? "block" : "none";
  if(!isSettingsOpen){
    panel.innerHTML = "";
    return;
  }
  const options = [
    { id: "instantanea", label: "Instantanea" },
    { id: "rapida", label: "Rapida" },
    { id: "media", label: "Media" },
    { id: "lenta", label: "Lenta" }
  ];
  panel.innerHTML = `
    <h3>Configuracao</h3>
    <span class="lock-note">Velocidade da barra de vida do inimigo</span>
    <div class="settings-options">
      ${options.map(option => `<button class="${uiSettings.enemyBarSpeed === option.id ? "active" : ""}" onclick="setEnemyBarSpeed('${option.id}')">${option.label}</button>`).join("")}
    </div>
    <span class="settings-note">Para Guerreiro e Arqueiro, as opcoes continuam mais rapidas que para o Mago para preservar o impacto do Missel Magico.</span>
    <div style="margin-top:14px;">
      <span class="lock-note">Testes de renascimento</span>
      <div class="settings-options">
        <button class="${uiSettings.disableRespawnTimer ? "active" : ""}" onclick="setDisableRespawnTimer(true)">Sem espera</button>
        <button class="${!uiSettings.disableRespawnTimer ? "active" : ""}" onclick="setDisableRespawnTimer(false)">Normal</button>
      </div>
      <span class="settings-note">Opcao de teste para renascer sem tempo de espera.</span>
    </div>
    <div style="margin-top:14px;">
      <span class="lock-note">Volume da musica</span>
      <div class="settings-options">
        <button onclick="adjustMusicVolume(-0.1)">Diminuir</button>
        <button onclick="adjustMusicVolume(0.1)">Aumentar</button>
        <button class="${uiSettings.musicMuted ? "active" : ""}" onclick="toggleMusicMute()">${uiSettings.musicMuted ? "Desmutar" : "Mutar"}</button>
      </div>
      <span class="settings-note">Volume atual: ${Math.round((uiSettings.musicVolume ?? 0.5) * 100)}%${uiSettings.musicMuted ? " | Mutado" : ""}</span>
    </div>`;
}


function getPlayerSubclassState(targetPlayer = player){
  if(!targetPlayer.subclassChoices){
    targetPlayer.subclassChoices = { tier30: null, tier60: null };
  }
  return targetPlayer.subclassChoices;
}

function getTier30ChoiceDef(className, choiceId){
  return (subclassChoicesByClass[className]?.tier30 || []).find(option => option.id === choiceId) || null;
}

function getTier60ChoiceDef(className, tier30Id, choiceId){
  return (subclassChoicesByClass[className]?.tier60?.[tier30Id] || []).find(option => option.id === choiceId) || null;
}

function getChosenSubclassDefs(targetPlayer = player){
  const subclassState = getPlayerSubclassState(targetPlayer);
  const tier30 = subclassState.tier30 ? getTier30ChoiceDef(targetPlayer.class, subclassState.tier30) : null;
  const tier60 = tier30 && subclassState.tier60 ? getTier60ChoiceDef(targetPlayer.class, tier30.id, subclassState.tier60) : null;
  return [tier30, tier60].filter(Boolean);
}

function getCurrentSubclassDef(targetPlayer = player){
  const chosen = getChosenSubclassDefs(targetPlayer);
  return chosen[chosen.length - 1] || null;
}

function getDisplayedClassName(targetPlayer = player){
  return getCurrentSubclassDef(targetPlayer)?.name || targetPlayer.class;
}

function getHeroSpriteIcon(targetPlayer = player){
  const currentSubclass = getCurrentSubclassDef(targetPlayer);
  return (currentSubclass && subclassIcons[currentSubclass.id]) || classIcons[targetPlayer.class] || "&#x2694;&#xFE0F;";
}

function getHeroSpriteClass(targetPlayer = player){
  const currentSubclass = getCurrentSubclassDef(targetPlayer);
  return `hero-${toCssToken(currentSubclass?.id || targetPlayer?.class || "guerreiro")}`;
}

function getHeroCombatAssetKey(targetPlayer = player){
  const currentSubclass = getCurrentSubclassDef(targetPlayer);
  return toCssToken(currentSubclass?.id || targetPlayer?.class || "guerreiro");
}

function getHeroSpriteMarkup(targetPlayer = player){
  const heroClass = getHeroSpriteClass(targetPlayer);
  return `<div id="heroSprite" class="sprite-figure emoji-sprite ${heroClass}">${getHeroSpriteIcon(targetPlayer)}</div>`;
}

function renderCombatAvatar(kind, assetKey, fallbackMarkup, altText){
  const resolvedKey = combatArtAliases[kind]?.[assetKey] || assetKey;
  const source = combatArtAssets[kind]?.[resolvedKey] || `assets/combat-art/normalized/${resolvedKey}.png`;
  return `<img class="combat-avatar-media" src="${source}" alt="${altText}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span class="combat-avatar-fallback" style="display:none;">${fallbackMarkup}</span>`;
}

function formatSubclassStatBonuses(subclass){
  if(!subclass){ return "Sem bonus de status."; }
  const parts = [];
  if(subclass.bonusHp){ parts.push(`+${subclass.bonusHp} HP`); }
  if(subclass.bonusMp){ parts.push(`+${subclass.bonusMp} MP`); }
  if(subclass.bonusAttack){ parts.push(`+${subclass.bonusAttack} ATQ`); }
  if(subclass.skillPower){ parts.push(`+${subclass.skillPower} PODER DE HABILIDADE`); }
  return parts.length ? parts.join(" | ") : "Sem bonus de status.";
}

function getTotalSubclassBonuses(targetPlayer = player){
  return getChosenSubclassDefs(targetPlayer).reduce((acc, subclass) => {
    acc.bonusHp += subclass.bonusHp || 0;
    acc.bonusMp += subclass.bonusMp || 0;
    acc.bonusAttack += subclass.bonusAttack || 0;
    acc.skillPower += subclass.skillPower || 0;
    return acc;
  }, { bonusHp: 0, bonusMp: 0, bonusAttack: 0, skillPower: 0 });
}

function selectClass(name){
  const base = classes[name];
  player = {
    class: name,
    level: 1,
    xp: 0,
    coins: 0,
    baseStats: { hp: base.hp, mp: base.mp, attack: base.attack },
    maxHp: base.hp,
    hp: base.hp,
    maxMp: base.mp,
    mp: base.mp,
    attack: base.attack,
    baseAttack: base.attack,
    activeSkills: [],
    passiveSkills: [],
    inventory: [],
    stats: {
      enemiesDefeated: 0,
      bossesDefeated: 0,
      coinsEarned: 0,
      deaths: 0,
      regionKills: {},
      regionBossKills: {},
      dungeonClears: 0,
      dungeonBestStep: 0
    }
  };
  normalizePlayerState();
  playerEffects = createDefaultPlayerEffects();
  document.getElementById("classSelect").style.display = "none";
  document.getElementById("game").style.display = "block";
  if(IS_DUNGEON_PAGE){
    currentMode = "dungeon";
  }
  syncRegionMusic(true);
  needsNewEnemy = true;
  if(!IS_DUNGEON_PAGE){
    spawnEnemy();
  }
  updateUI();
}

function chooseWeightedEnemy(enemyList, options = {}){
  const { regionName = currentRegion, applyLevelAdjustment = true } = options;
  const weightedEntries = applyLevelAdjustment
    ? getAdjustedRegionSpawnWeights(enemyList, regionName)
    : enemyList.map(enemyData => ({
      enemyData,
      weight: Math.max(0, enemyData.weight || 0)
    }));
  const totalWeight = weightedEntries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for(const entry of weightedEntries){
    roll -= entry.weight;
    if(roll <= 0){
      return entry.enemyData;
    }
  }
  return enemyList[enemyList.length - 1];
}

function getAdjustedEnemySpawnWeight(enemyData, regionName = currentRegion){
  if(!enemyData || !enemyData.weight){ return 0; }
  const levelGap = player.level - enemyData.level;
  if(levelGap <= 3){
    return enemyData.weight;
  }
  const excessGap = levelGap - 3;
  const rarityKey = getEnemyRarity(regionName, enemyData.name, false).key;
  const rarityPenaltyFactor = {
    comum: 1.45,
    incomum: 0.9,
    rara: 0.55
  }[rarityKey] || 1;
  const penalty = 1 + (excessGap * 2.4 * rarityPenaltyFactor) + (excessGap * excessGap * 1.1 * rarityPenaltyFactor);
  return Math.max(1, enemyData.weight / penalty);
}

function getAdjustedRegionSpawnWeights(enemyList, regionName = currentRegion){
  const rawEntries = enemyList.map(enemyData => ({
    enemyData,
    baseWeight: Math.max(0, enemyData.weight || 0),
    weight: getAdjustedEnemySpawnWeight(enemyData, regionName)
  }));
  const rareEntry = rawEntries.find(entry => getEnemyRarity(regionName, entry.enemyData.name, false).key === "rara");
  if(!rareEntry){
    return rawEntries;
  }
  const baseTotal = rawEntries.reduce((sum, entry) => sum + entry.baseWeight, 0) || 1;
  const rawTotal = rawEntries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  const baseRareChance = rareEntry.baseWeight / baseTotal;
  const rawRareChance = rareEntry.weight / rawTotal;
  const rareLead = player.level - rareEntry.enemyData.level;
  let revealProgress = 0;
  if(rareLead >= 1){
    revealProgress = Math.min(1, rareLead / 3);
  }
  const allowedRareChance = baseRareChance + ((rawRareChance - baseRareChance) * revealProgress);
  if(rawRareChance <= allowedRareChance || allowedRareChance >= 0.999){
    return rawEntries;
  }
  const otherWeight = Math.max(0.0001, rawTotal - rareEntry.weight);
  rareEntry.weight = Math.max(1, (allowedRareChance * otherWeight) / Math.max(0.0001, 1 - allowedRareChance));
  return rawEntries;
}

function getRegionSpawnPreview(regionName){
  const regionData = regions[regionName];
  if(!regionData?.enemies?.length){
    return [];
  }
  if(regionName === currentRegion && !isDungeonMode() && enemiesSpawned < 3){
    const forcedEnemy = regionData.enemies.find(enemyData => enemyData.name === "Lobo Sombrio");
    if(forcedEnemy){
      return regionData.enemies.map(enemyData => ({
        ...enemyData,
        chance: enemyData.name === forcedEnemy.name ? 100 : 0
      }));
    }
  }
  const weightedEntries = getAdjustedRegionSpawnWeights(regionData.enemies, regionName);
  const totalWeight = weightedEntries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  return weightedEntries.map(entry => ({
    ...entry.enemyData,
    chance: (entry.weight / totalWeight) * 100
  }));
}

function getRegionBattleEmblem(regionName){
  const emblems = {
    Floresta: "🌲",
    Caverna: "🪨",
    Ruinas: "🏛️",
    Pantano: "🐸",
    Vulcao: "🌋",
    Abismo: "🕳️",
    Fortaleza: "🛡️",
    Necropole: "⚰️",
    Citadela: "🏰",
    Panteao: "☀️",
    Cataclismo: "☄️",
    Paradoxo: "🌀"
  };
  return emblems[regionName] || "⚔️";
}

function getEnemySpriteIcon(targetEnemy){
  const enemyName = targetEnemy?.baseName || targetEnemy?.name || "";
  const byName = {
    "Lobo Sombrio": "🐺",
    Goblin: "👺",
    "Aranha Gigante": "🕷️",
    "Morcego de Pedra": "🦇",
    "Esqueleto Mineiro": "💀",
    "Slime Toxico": "🧪",
    "Sentinela Quebrada": "🛡️",
    "Cultista Perdido": "🔮",
    "Fantasma Antigo": "👻",
    "Sapo Colossal": "🐸",
    "Bruxa do Brejo": "🧙",
    "Serpente do Lodo": "🐍",
    "Salamandra Rubra": "🦎",
    "Golem de Brasa": "🪨",
    "Fenix Sombria": "🔥",
    "Cavaleiro Abissal": "⚔️",
    "Lamia do Eclipse": "🐍",
    "Colosso do Vazio": "🗿",
    "Escudeiro de Ferro": "🛡️",
    "Maga da Muralha": "✨",
    "Carrasco de Guerra": "🪓",
    "Guardiao Funebre": "⚰️",
    "Feiticeira Morta": "🪄",
    "Ceifador de Ossos": "☠️",
    "Anjo Caido": "🪽",
    "Drake Celeste": "🐉",
    "Executor Astral": "🌠",
    "Guardiao Aureo": "☀️",
    "Oraculo Radiante": "🔆",
    "Quimera Solar": "🦁",
    "Arauto do Cataclismo": "☄️",
    "Titan Rachado": "⛰️",
    "Serafim do Fim": "🌩️",
    "Guardiao Temporal": "⏳",
    "Oraculo do Zero": "🌀",
    "Devorador do Eco": "🌌",
    "Ent Ancestral": "🌳",
    "Troll das Profundezas": "🪨",
    "Rei Espectral": "👻",
    "Hidra do Lodo": "🐍",
    "Draco Magmatico": "🌋",
    "Arauto do Vazio": "🕳️",
    "General de Aco": "🛡️",
    "Lorde da Cripta": "⚰️",
    "Imperador do Eclipse": "🌘",
    "Avatar do Zenith": "☀️",
    "Deus da Ruina": "☄️",
    "Soberano do Paradoxo": "🌀"
  };
  if(byName[enemyName]){ return byName[enemyName]; }
  const archetype = getEnemyRigArchetype(enemyName);
  const byArchetype = {
    beast: "🐾",
    humanoid: "⚔️",
    arachnid: "🕸️",
    slime: "🧪",
    serpent: "🐍",
    winged: "🪽",
    specter: "👻",
    reaper: "☠️",
    colossus: "🗿",
    armored: "🛡️",
    ent: "🌳"
  };
  return byArchetype[archetype] || "👹";
}

function getEnemyStats(template, regionOverride = null, isBoss = false){
  const regionName = regionOverride || currentRegion;
  const combatProfile = regionCombatProfiles[regionName] || regionCombatProfiles.Floresta;
  const bossProfile = getBossDifficultyProfile(regionName, isBoss);
  const hpMultiplier = isBoss ? bossProfile.hpMultiplier : (combatProfile.hpMultiplier || 1);
  const attackMultiplier = isBoss ? bossProfile.attackMultiplier : (combatProfile.attackMultiplier || 1);
  const hasArmor = combatProfile.armorScale > 0 || combatProfile.armorFlat > 0;
  const armor = hasArmor
    ? Math.max(1, Math.floor(template.level * combatProfile.armorScale) + combatProfile.armorFlat + (isBoss ? Math.max(2, Math.floor(template.level / 30)) + bossProfile.armorBonus : 0))
    : 0;
  const maxHpStrikePercent = combatProfile.maxHpStrikePercent + (isBoss && combatProfile.maxHpStrikePercent > 0 ? 0.01 : 0);
  return {
    maxHp: Math.floor((template.hp + template.level * 18) * hpMultiplier),
    attack: Math.floor((template.attack + template.level * 2) * attackMultiplier),
    armor,
    maxHpStrikePercent
  };
}

function slugify(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toCssToken(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRegionSpriteClass(regionName){
  return `region-${toCssToken(regionName)}`;
}

function isAdvancedBossRegion(regionName){
  return advancedBossRegions.includes(regionName);
}

function getBossDifficultyProfile(regionName, isBoss = false){
  const combatProfile = regionCombatProfiles[regionName] || regionCombatProfiles.Floresta;
  if(!isBoss || !isAdvancedBossRegion(regionName)){
    return {
      hpMultiplier: combatProfile.bossHpMultiplier || 1,
      attackMultiplier: combatProfile.bossAttackMultiplier || 1,
      skillMultiplier: combatProfile.bossSkillMultiplier || 1,
      manaMultiplier: combatProfile.bossManaMultiplier || 1,
      armorBonus: combatProfile.bossArmorBonus || 0
    };
  }
  const index = Math.max(0, advancedBossRegions.indexOf(regionName));
  return {
    hpMultiplier: (combatProfile.bossHpMultiplier || 1) * (1 + index * 0.01),
    attackMultiplier: (combatProfile.bossAttackMultiplier || 1) * (1 + index * 0.008),
    skillMultiplier: (combatProfile.bossSkillMultiplier || 1) * (1 + index * 0.01),
    manaMultiplier: (combatProfile.bossManaMultiplier || 1) * (1 + index * 0.006),
    armorBonus: (combatProfile.bossArmorBonus || 0) + Math.floor(index / 3)
  };
}

function getBossAbilityLimit(regionName){
  if(["Floresta", "Caverna", "Ruinas"].includes(regionName)){ return 1; }
  if(["Pantano", "Vulcao", "Abismo"].includes(regionName)){ return 2; }
  if(["Fortaleza", "Necropole", "Citadela"].includes(regionName)){ return 3; }
  if(["Panteao", "Cataclismo", "Paradoxo"].includes(regionName)){ return 4; }
  return 1;
}

function getBossAbilitySet(enemyName, regionName = currentRegion){
  const abilities = bossAbilityCatalog[enemyName] || [];
  const bossProfile = getBossDifficultyProfile(regionName, true);
  return abilities.slice(0, getBossAbilityLimit(regionName)).map(ability => ({
    ...ability,
    power: Number.isFinite(ability.power) ? Math.floor(ability.power * bossProfile.skillMultiplier) : ability.power,
    bonusIfShield: Number.isFinite(ability.bonusIfShield) ? Math.floor(ability.bonusIfShield * bossProfile.skillMultiplier) : ability.bonusIfShield,
    bonusIfNoShield: Number.isFinite(ability.bonusIfNoShield) ? Math.floor(ability.bonusIfNoShield * bossProfile.skillMultiplier) : ability.bonusIfNoShield,
    flatDamageBonus: Number.isFinite(ability.flatDamageBonus) ? Math.floor(ability.flatDamageBonus * bossProfile.skillMultiplier) : ability.flatDamageBonus,
    selfShieldFlat: Number.isFinite(ability.selfShieldFlat) ? Math.floor(ability.selfShieldFlat * bossProfile.skillMultiplier) : ability.selfShieldFlat
  }));
}

function getBossShieldValue(ability){
  return Math.max(0, Math.floor((enemy?.maxHp || 0) * (ability.selfShieldPercent || 0)) + Math.floor(ability.selfShieldFlat || 0));
}

function restartElementAnimation(element, className){
  if(!element){ return; }
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function pulseSpriteClass(elementId, className, duration = 260){
  const element = document.getElementById(elementId);
  if(!element){ return Promise.resolve(); }
  restartElementAnimation(element, className);
  return new Promise(resolve => {
    setTimeout(() => {
      element.classList.remove(className);
      resolve();
    }, duration);
  });
}

function getSpriteAnimationTiming(attacker = "hero", style = "attack"){
  if(style === "buff"){
    return { attackerDuration: 520, hitDelay: 180, settleDelay: 160, betweenHits: 96 };
  }
  if(style === "cast"){
    return attacker === "hero"
      ? { attackerDuration: 480, hitDelay: 180, settleDelay: 180, betweenHits: 110 }
      : { attackerDuration: 430, hitDelay: 160, settleDelay: 150, betweenHits: 100 };
  }
  if(attacker === "hero"){
    if(player?.class === "Arqueiro"){
      return { attackerDuration: 420, hitDelay: 170, settleDelay: 140, betweenHits: 110 };
    }
    if(player?.class === "Guerreiro"){
      return { attackerDuration: 320, hitDelay: 150, settleDelay: 120, betweenHits: 96 };
    }
  }
  const enemyArchetype = getEnemyRigArchetype(enemy?.baseName || enemy?.name || "");
  if(["specter", "reaper", "winged", "humanoid"].includes(enemyArchetype)){
    return { attackerDuration: 320, hitDelay: 140, settleDelay: 110, betweenHits: 96 };
  }
  return { attackerDuration: 280, hitDelay: 120, settleDelay: 100, betweenHits: 90 };
}

async function playSpriteAttackAnimation(attacker = "hero", style = "attack", connectHit = true, hitRepeats = 1, hitDelay = null, betweenHits = null){
  const attackerId = attacker === "hero" ? "heroSpriteBox" : "enemySpriteBox";
  const defenderId = attacker === "hero" ? "enemySpriteBox" : "heroSpriteBox";
  const attackerClass = style === "cast" ? "casting" : style === "buff" ? "buffing" : "attacking";
  const timing = getSpriteAnimationTiming(attacker, style);
  const attackerDuration = timing.attackerDuration;
  const resolvedHitDelay = hitDelay ?? timing.hitDelay;
  const resolvedBetweenHits = betweenHits ?? timing.betweenHits;
  pulseSpriteClass(attackerId, attackerClass, attackerDuration);
  if(!connectHit){
    await wait(Math.floor(resolvedHitDelay * 0.85));
    return;
  }
  await wait(resolvedHitDelay);
  for(let hitIndex = 0; hitIndex < Math.max(1, hitRepeats); hitIndex++){
    pulseSpriteClass(defenderId, "hit", 220);
    if(hitIndex < hitRepeats - 1){
      await wait(resolvedBetweenHits);
    }
  }
  await wait(timing.settleDelay);
}

function getSkillAnimationStyle(skillInfo){
  const buffTypes = new Set([
    "warrior_second_wind",
    "warrior_warcry",
    "warrior_smoke_bomb",
    "warrior_faith_shield",
    "warrior_unstoppable",
    "mage_concentration",
    "mage_mana_shield",
    "mage_blizzard",
    "mage_demon_form",
    "archer_focus",
    "archer_camouflage",
    "nature_ancestral_song",
    "nature_true_form",
    "nature_vine_cocoon",
    "nature_crown"
  ]);
  if(buffTypes.has(skillInfo.type)){
    return "buff";
  }
  return player.class === "Mago" || skillInfo.type.startsWith("mage_") || skillInfo.type.startsWith("nature_") ? "cast" : "attack";
}

function getEnemyTemplateByName(enemyName){
  for(const [regionName, regionData] of Object.entries(regions)){
    const regularEnemy = regionData.enemies.find(template => template.name === enemyName);
    if(regularEnemy){
      return { ...regularEnemy, region: regionName, isBoss: false };
    }
    if(regionData.boss?.name === enemyName){
      return { ...regionData.boss, region: regionName, isBoss: true };
    }
  }
  const dungeonEnemy = getDungeonSequence().find(entry => entry.template?.name === enemyName);
  if(dungeonEnemy){
    return { ...dungeonEnemy.template, region: dungeonEnemy.regionName, isBoss: dungeonEnemy.isBoss };
  }
  return null;
}

function getRegionSetLabel(regionName){
  return `Set ${regionArticleMap[regionName] || `de ${regionName}`}`;
}

function formatStatBonusList(source){
  const parts = [];
  if(source?.bonusHp){ parts.push(`+${source.bonusHp} vida maxima`); }
  if(source?.bonusMp){ parts.push(`+${source.bonusMp} mana maxima`); }
  if(source?.bonusAttack){ parts.push(`+${source.bonusAttack} dano de ataque`); }
  if(source?.skillPower){ parts.push(`+${source.skillPower} dano de habilidade`); }
  if(source?.reflectPercent){ parts.push(`+${Math.floor(source.reflectPercent * 100)}% reflexao de dano`); }
  if(source?.coinBonus){ parts.push(`+${Math.floor(source.coinBonus * 100)}% moedas`); }
  if(source?.xpBonus){ parts.push(`+${Math.floor(source.xpBonus * 100)}% XP`); }
  if(source?.turnHealPercent){ parts.push(`+${(source.turnHealPercent * 100).toFixed(1)}% regen de vida`); }
  if(source?.burnDamageReductionPercent){ parts.push(`-${(source.burnDamageReductionPercent * 100).toFixed(1)}% dano de queimadura recebido`); }
  if(source?.flatReduction){ parts.push(`+${source.flatReduction} resistencia fixa`); }
  if(source?.bonusHpPercent){ parts.push(`+${Math.floor(source.bonusHpPercent * 100)}% vida maxima`); }
  if(source?.bonusMpPercent){ parts.push(`+${Math.floor(source.bonusMpPercent * 100)}% mana maxima`); }
  if(source?.totalDamagePercent){ parts.push(`+${Math.floor(source.totalDamagePercent * 100)}% dano total`); }
  if(source?.fatalSaveHealPercent){ parts.push(`1 salvamento fatal por combate e cura de ${Math.floor(source.fatalSaveHealPercent * 100)}% da vida`); }
  if(source?.critChanceBonus){ parts.push(`+${Math.floor(source.critChanceBonus * 100)}% chance de critico`); }
  return parts.join(", ");
}

function getRegionFromEnemy(enemyName){
  return getEnemyTemplateByName(enemyName)?.region || null;
}

function getSetBonusValues(regionName){
  return regionSetBonusProfiles[regionName] || { bonusHp: 0, bonusMp: 0, bonusAttack: 0, skillPower: 0, bonusHpPercent: 0, bonusMpPercent: 0, totalDamagePercent: 0 };
}

function getRegionEquipmentBaseStats(regionName, slot){
  const profile = regionEquipmentBaseProfiles[regionName] || regionEquipmentBaseProfiles.Floresta;
  if(slot === "accessory"){
    return { ...(getBossAccessoryTemplate(regionName)?.baseStats || {}) };
  }
  return slot === "weapon" ? { ...(profile.weapon || {}) } : { ...(profile.armor || {}) };
}

function getRegionDropSlots(regionName, enemyName){
  const regionData = regions[regionName];
  if(!regionData){ return []; }
  const orderedEnemies = [...regionData.enemies].sort((a, b) => b.weight - a.weight);
  const enemyIndex = orderedEnemies.findIndex(enemyData => enemyData.name === enemyName);
  return enemyDropSlotGroups[enemyIndex] ? [...enemyDropSlotGroups[enemyIndex]] : [];
}

function getRegionSetTemplate(regionName, slot, className = player?.class || "Guerreiro"){
  if(!regionName || !slot){ return null; }
  const itemName = slot === "weapon"
    ? `${regionWeaponPieceNames[className] || "Arma"} ${regionArticleMap[regionName] || `de ${regionName}`}`
    : `${regionArmorPieceNames[slot] || slotLabels[slot] || "Peca"} ${regionArticleMap[regionName] || `de ${regionName}`}`;
  return {
    id: `${slugify(regionName)}_${slot}${slot === "weapon" ? `_${slugify(className)}` : ""}`,
    name: itemName,
    slot,
    classRestriction: slot === "weapon" ? className : null,
    regionName,
    setId: `${slugify(regionName)}_set`,
    setName: getRegionSetLabel(regionName),
    baseStats: getRegionEquipmentBaseStats(regionName, slot)
  };
}

function getBossAccessoryTemplate(regionName){
  const accessory = bossAccessoryProfiles[regionName];
  if(!accessory){ return null; }
  return {
    id: `${slugify(regionName)}_accessory_${accessory.id}`,
    name: accessory.name,
    slot: "accessory",
    classRestriction: null,
    regionName,
    setId: null,
    setName: null,
    baseStats: accessory.baseStats
  };
}

function getEnemyDropTemplate(enemyName, regionName, className = player?.class || "Guerreiro", forcedSlot = null){
  const availableSlots = getRegionDropSlots(regionName, enemyName);
  if(!availableSlots.length){ return null; }
  const chosenSlot = forcedSlot && availableSlots.includes(forcedSlot)
    ? forcedSlot
    : availableSlots[Math.floor(Math.random() * availableSlots.length)];
  return getRegionSetTemplate(regionName, chosenSlot, className);
}

function getEnemyMaterialTemplate(enemyName, regionName){
  const material = enemyMaterialDrops?.[enemyName];
  return {
    id: material?.id || `parte_${slugify(enemyName)}`,
    name: material?.name || `Parte de ${enemyName}`,
    type: "material",
    enemyName,
    regionName,
    description: material?.description || `Material obtido de ${enemyName}. O artesao do vilarejo usa essas partes para montar pecas do ${getRegionSetLabel(regionName)}.`
  };
}

function getRegionCraftRecipes(regionName, className = player?.class || "Guerreiro"){
  const regionData = regions[regionName];
  if(!regionData){ return []; }
  const enemyMaterials = regionData.enemies.map(enemyData => getEnemyMaterialTemplate(enemyData.name, regionName));
  const baseRequirements = Object.fromEntries(enemyMaterials.map(material => [material.id, 1]));
  const extraCosts = {
    head: { [enemyMaterials[0].id]: 1 },
    chest: { [enemyMaterials[1].id]: 1 },
    legs: { [enemyMaterials[2].id]: 1 },
    feet: { [enemyMaterials[0].id]: 1, [enemyMaterials[1].id]: 1 },
    weapon: { [enemyMaterials[1].id]: 1, [enemyMaterials[2].id]: 1 }
  };
  return ["head", "chest", "legs", "feet", "weapon"].map(slot => {
    const template = getRegionSetTemplate(regionName, slot, className);
    const requirements = { ...baseRequirements };
    Object.entries(extraCosts[slot] || {}).forEach(([itemId, qty]) => {
      requirements[itemId] = (requirements[itemId] || 0) + qty;
    });
    const cost = Math.max(18, Math.ceil(getSellPrice(createEquipmentItem(template, "comum")) * 0.65));
    return { slot, template, requirements, cost };
  });
}

function getInventoryCountById(itemId){
  return (player.inventory || []).reduce((total, item) => total + (item.id === itemId ? (item.qty || 1) : 0), 0);
}

function canCraftRecipe(recipe){
  if(!recipe){ return false; }
  if((player.coins || 0) < (recipe.cost || 0)){ return false; }
  return Object.entries(recipe.requirements || {}).every(([itemId, qty]) => getInventoryCountById(itemId) >= qty);
}

function consumeInventoryById(itemId, quantity){
  let remaining = quantity;
  while(remaining > 0){
    const itemIndex = player.inventory.findIndex(entry => entry.id === itemId);
    if(itemIndex < 0){
      break;
    }
    const item = player.inventory[itemIndex];
    const available = item.qty || 1;
    if(available > remaining){
      item.qty = available - remaining;
      remaining = 0;
    }else{
      remaining -= available;
      player.inventory.splice(itemIndex, 1);
    }
  }
  return remaining <= 0;
}

function getEquippedSetCount(setId){
  if(!player?.equipment || !setId){ return 0; }
  return equipmentSlots.reduce((total, slot) => total + (player.equipment?.[slot]?.setId === setId ? 1 : 0), 0);
}

function getActiveSetBonuses(){
  const total = { bonusHp: 0, bonusMp: 0, bonusAttack: 0, skillPower: 0, bonusHpPercent: 0, bonusMpPercent: 0, totalDamagePercent: 0 };
  const activeSets = [];
  if(!player?.equipment){ return { bonuses: total, activeSets }; }

  const requiredSetSlots = ["head", "chest", "weapon", "legs", "feet"];
  const sets = {};
  for(const slot of requiredSetSlots){
    const item = normalizeEquipmentMetadata(player.equipment?.[slot]);
    if(!item?.setId){ continue; }
    if(!sets[item.setId]){
      sets[item.setId] = { slots: new Set(), item };
    }
    sets[item.setId].slots.add(slot);
  }

  for(const entry of Object.values(sets)){
    if(entry.slots.size !== requiredSetSlots.length){ continue; }
    const item = entry.item;
    const setBonus = getSetBonusValues(item.regionName);
    total.bonusHp += setBonus.bonusHp || 0;
    total.bonusMp += setBonus.bonusMp || 0;
    total.bonusAttack += setBonus.bonusAttack || 0;
    total.skillPower += setBonus.skillPower || 0;
    total.bonusHpPercent += setBonus.bonusHpPercent || 0;
    total.bonusMpPercent += setBonus.bonusMpPercent || 0;
    total.totalDamagePercent += setBonus.totalDamagePercent || 0;
    activeSets.push({
      setName: item.setName || getRegionSetLabel(item.regionName || "desconhecida"),
      text: formatStatBonusList(setBonus)
    });
  }

  return { bonuses: total, activeSets };
}

function getRegionAverageLevel(region){
  const regionData = regions[region];
  const totalWeight = regionData.enemies.reduce((sum, enemyData) => sum + enemyData.weight, 0);
  const weightedLevels = regionData.enemies.reduce((sum, enemyData) => sum + enemyData.level * enemyData.weight, 0);
  return Math.ceil(weightedLevels / totalWeight);
}

function recordRegionEnemyKill(regionName, enemyName){
  if(!player?.stats || !regionName || !enemyName || !regions[regionName]){ return; }
  player.stats.regionKills = player.stats.regionKills || {};
  player.stats.regionKills[regionName] = player.stats.regionKills[regionName] || {};
  player.stats.regionKills[regionName][enemyName] = (player.stats.regionKills[regionName][enemyName] || 0) + 1;
}

function recordRegionBossKill(regionName){
  if(!player?.stats || !regionName || !regions[regionName]){ return; }
  player.stats.regionBossKills = player.stats.regionBossKills || {};
  player.stats.regionBossKills[regionName] = (player.stats.regionBossKills[regionName] || 0) + 1;
}

function getBossUnlockProgress(regionName){
  const regionData = regions[regionName];
  if(!regionData){
    return { defeated: 0, total: 0, unlocked: false, missing: [] };
  }
  const regionKills = player?.stats?.regionKills?.[regionName] || {};
  const defeatedEnemies = regionData.enemies.filter(template => (regionKills[template.name] || 0) > 0);
  const missing = regionData.enemies.filter(template => (regionKills[template.name] || 0) <= 0).map(template => template.name);
  return {
    defeated: defeatedEnemies.length,
    total: regionData.enemies.length,
    unlocked: defeatedEnemies.length === regionData.enemies.length,
    missing
  };
}

function isBossUnlocked(regionName){
  return getBossUnlockProgress(regionName).unlocked;
}

function getBossUnlockText(regionName){
  const progress = getBossUnlockProgress(regionName);
  if(progress.unlocked){
    return `Chefao liberado: ${progress.defeated}/${progress.total} inimigos da regiao ja foram derrotados.`;
  }
  return `Para enfrentar o chefao, derrote pelo menos 1 vez cada inimigo da regiao. Progresso: ${progress.defeated}/${progress.total}.`;
}

function normalizePlayerState(){
  function normalizeInventoryItem(item, index){
    const normalized = {
      ...item,
      uid: item.uid || `${item.id || "item"}_${Date.now()}_${index}`
    };
    if(item.type === "consumable" && consumableCatalog[item.id]){
      normalized.name = consumableCatalog[item.id].name;
      normalized.description = consumableCatalog[item.id].description;
    }
    return normalizeEquipmentMetadata(normalized);
  }
  player.inventory = (Array.isArray(player.inventory) ? player.inventory : []).map((item, index) => ({
    ...normalizeInventoryItem(item, index)
  }));
  const oldEquipment = player.equipment || {};
  player.equipment = {
    head: normalizeEquipmentMetadata(oldEquipment.head || null),
    chest: normalizeEquipmentMetadata(oldEquipment.chest || null),
    weapon: normalizeEquipmentMetadata(oldEquipment.weapon || null),
    legs: normalizeEquipmentMetadata(oldEquipment.legs || null),
    feet: normalizeEquipmentMetadata(oldEquipment.feet || oldEquipment.boots || null),
    accessory: normalizeEquipmentMetadata(oldEquipment.accessory || null)
  };
  player.stats = player.stats || {
    enemiesDefeated: 0,
    bossesDefeated: 0,
    coinsEarned: 0,
    deaths: 0,
    regionKills: {},
    regionBossKills: {},
    dungeonClears: 0,
    dungeonBestStep: 0
  };
  player.stats.migrations = player.stats.migrations || {};
  player.stats.regionKills = player.stats.regionKills || {};
  player.stats.regionBossKills = player.stats.regionBossKills || {};
  player.stats.dungeonClears = player.stats.dungeonClears || 0;
  player.stats.dungeonBestStep = player.stats.dungeonBestStep || 0;
  const classDefaults = classes[player.class] || { hp: player.maxHp || 0, mp: player.maxMp || 0, attack: player.attack || 0 };
  player.baseStats = player.baseStats || { hp: classDefaults.hp, mp: classDefaults.mp, attack: classDefaults.attack };
  if(!player.stats.migrations.baseHpRebalance_v1){
    const oldBaseHpByClass = { Guerreiro: 140, Arqueiro: 120, Mago: 100 };
    const oldBaseHp = oldBaseHpByClass[player.class];
    if(oldBaseHp && player.baseStats.hp === oldBaseHp){
      const hpDelta = oldBaseHp - classDefaults.hp;
      player.baseStats.hp = classDefaults.hp;
      player.maxHp = Math.max(classDefaults.hp, (player.maxHp || classDefaults.hp) - hpDelta);
      player.hp = Math.min(player.maxHp, Math.max(1, (player.hp || player.maxHp) - hpDelta));
    }
    player.stats.migrations.baseHpRebalance_v1 = true;
  }
  player.stats.invested = createDefaultInvestedStats(player.stats.invested);
  const legacySubclass = player.subclass?.id || player.subclass || null;
  player.subclass = null;
  const subclassState = getPlayerSubclassState(player);
  if(legacySubclass && !subclassState.tier30){
    if(getTier30ChoiceDef(player.class, legacySubclass)){
      subclassState.tier30 = legacySubclass;
    }
  }
  syncInvestedStatsFromCurrentTotals();
  player.activeSkills = getClassTrees().activeSkills;
  player.passiveSkills = getClassTrees().passiveSkills;
  playerEffects = { ...createDefaultPlayerEffects(), ...(playerEffects || {}) };
}

function getAttributePointGain(attribute, targetLevel = player?.level || 1){
  const level = Math.max(1, Math.floor(targetLevel || 1));
  if(attribute === "strength"){
    return Math.floor(5 + (level * 0.15));
  }
  if(attribute === "wisdom"){
    return Math.floor(10 + (1.5 * level));
  }
  return Math.floor(10 + (1.8 * level));
}

function getPendingAllocationGains(targetLevel = player?.level || 1){
  return {
    hpGain: (allocation.vitality || 0) * getAttributePointGain("vitality", targetLevel),
    mpGain: (allocation.wisdom || 0) * getAttributePointGain("wisdom", targetLevel),
    attackGain: (allocation.strength || 0) * getAttributePointGain("strength", targetLevel),
    skillGain: (allocation.strength || 0) * getAttributePointGain("strength", targetLevel)
  };
}

function createDefaultInvestedStats(saved = {}){
  return {
    vitality: Number(saved.vitality ?? saved.hp ?? 0) || 0,
    wisdom: Number(saved.wisdom ?? saved.mp ?? 0) || 0,
    strength: Number(saved.strength ?? saved.attack ?? 0) || 0,
    hpGain: Number(saved.hpGain) || 0,
    mpGain: Number(saved.mpGain) || 0,
    attackGain: Number(saved.attackGain) || 0,
    skillGain: Number(saved.skillGain ?? saved.attackGain) || 0
  };
}

function getPreviewStats(){
  const passives = getPassiveModifiers();
  const pendingGains = getPendingAllocationGains();
  return {
    maxHp: player.maxHp + passives.bonusHp + pendingGains.hpGain,
    maxMp: player.maxMp + passives.bonusMp + pendingGains.mpGain,
    attack: player.attack + passives.bonusAttack + pendingGains.attackGain
  };
}

function getCurrentCaps(){
  const previewStats = getPreviewStats();
  return {
    maxHp: previewStats.maxHp,
    maxMp: previewStats.maxMp
  };
}

function getXpToNextLevel(){
  return 100 + Math.max(0, player.level - 1) * 25 + Math.floor(player.level * player.level * 1.5);
}

function getCurrentClassData(){
  return classes[player.class];
}

function getSubclassChoices(){
  if(!player){ return []; }
  const subclassState = getPlayerSubclassState();
  if(player.level >= 30 && !subclassState.tier30){
    return subclassChoicesByClass[player.class]?.tier30 || [];
  }
  if(player.level >= 60 && subclassState.tier30 && !subclassState.tier60){
    return subclassChoicesByClass[player.class]?.tier60?.[subclassState.tier30] || [];
  }
  return [];
}

function getUnlockedActiveSkills(){
  return getClassTrees().activeSkills.filter(skill => player.level >= skill.level);
}

function getUnlockedPassiveSkills(){
  return getClassTrees().passiveSkills.filter(skill => player.level >= skill.level);
}

function getPassiveModifiers(){
  const base = {
    bonusHp: 0,
    bonusMp: 0,
    bonusAttack: 0,
    manaRegen: 0,
    manaRegenPercent: 0,
    manaRegenPercentSet: null,
    damageReduction: 0,
    coinBonus: 0,
    skillPower: 0,
    flatReduction: 0,
    reflectPercent: 0,
    turnHealPercent: 0,
    skillCostIncrease: 0,
    totalDamageFlat: 0,
    totalDamagePercent: 0,
    enemyMissChance: 0,
    enemySkipChance: 0,
    xpBonus: 0,
    burnDamageReductionPercent: 0,
    bonusHpPercentAccessory: 0,
    bonusMpPercentAccessory: 0,
    fatalSaveHealPercent: 0,
    critChanceBonus: 0,
    preciousMana: false,
    manaToLifePercent: 0
  };
  const pendingGains = getPendingAllocationGains();
  const subclassState = getPlayerSubclassState();
  const tier30 = subclassState.tier30;
  const tier60 = subclassState.tier60;
  for(const passive of getUnlockedPassiveSkills()){
    if(passive.type === "warrior_flat_reduction"){
      base.flatReduction += Math.floor(0.6 * player.level);
      if(tier30 === "cavaleiro" && player.level >= 30){
        base.turnHealPercent += 0.03;
      }
    }
    if(passive.type === "warrior_enemy_miss"){
      base.enemyMissChance += 0.2;
    }
    if(passive.type === "warrior_reflect"){
      base.reflectPercent += tier60 === "paladino" && player.level >= 60 ? 0.32 : tier60 === "berserker" && player.level >= 60 ? 0 : 0.18;
    }
    if(passive.type === "bonus_xp"){
      base.xpBonus += 0.1;
    }
    if(passive.type === "mage_last_resort"){
      base.preciousMana = true;
    }
    if(passive.type === "mage_mana_to_life"){
      base.manaToLifePercent += tier60 === "mago_frigido" && player.level >= 60 ? 0.65 : 0.5;
    }
    if(passive.type === "mage_overflowing"){
      // applied after all mana bonuses are known
    }
    if(passive.type === "mage_charge_damage"){
      base.totalDamagePercent += 0.05 * (playerEffects.arcaneCharges || 0);
    }
    if(passive.type === "mage_glass_cannon"){
      // handled in combat state
    }
    if(passive.type === "archer_dodge_level_scaling"){
      base.enemyMissChance += 0.05 + (0.005 * player.level);
    }
    if(passive.type === "archer_dodge_double_bonus"){
      base.enemyMissChance += 0.05 + (0.005 * player.level);
    }
    if(passive.type === "archer_dodge_coin_bonus"){
      base.enemyMissChance += 0.05 + (0.005 * player.level);
      base.coinBonus += 0.1;
    }
    if(passive.type === "archer_attack_level_bonus"){
      const attackBonus = Math.floor(0.9 * player.level);
      const skillFactor = tier30 === "atirador" && subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 1.3 : 0.9;
      const skillBonus = Math.floor(skillFactor * player.level);
      base.bonusAttack += attackBonus;
      base.skillPower += skillBonus;
    }
    if(passive.type === "archer_flat_reduction_level"){
      base.flatReduction += Math.floor(0.2 * player.level);
    }
    if(passive.type === "archer_enemy_skip_chance"){
      base.enemySkipChance += 0.07;
    }
    if(passive.type === "coin_bonus"){
      base.coinBonus += tier30 === "cacador" && player.level >= 42 ? 0.15 : 0;
    }
    if(passive.type === "nature_cycle" && tier30 === "espirito_da_floresta" && player.level >= 30){
      // Applied after all attack bonuses are known.
    }
    if(passive.type === "nature_fairy_aura"){
      // Applied after class, equipment and set bonuses are known.
    }
    if(passive.type === "nature_sap" && tier60 === "avatar_da_natureza" && player.level >= 60){
      base.bonusHp += Math.floor((player.maxHp + pendingGains.hpGain) * 0.12);
    }
    if(passive.type === "nature_ancestral_bark"){
      const factor = playerEffects.natureTrueFormTurns > 0 ? 0.7 : 0.5;
      base.flatReduction += Math.floor(4 + factor * player.level);
    }
    if(passive.type === "nature_royal_wings"){
      base.enemyMissChance += playerEffects.natureCrownedTurns > 0 ? 0.6 : 0.2;
    }
    if(passive.type === "nature_forest_oath"){
      base.reflectPercent += playerEffects.shieldValue > 0 ? 0.3 : 0;
    }
  }
  for(const subclass of getChosenSubclassDefs()){
    base.bonusHp += subclass.bonusHp || 0;
    base.bonusMp += subclass.bonusMp || 0;
    base.bonusAttack += subclass.bonusAttack || 0;
    base.skillPower += subclass.skillPower || 0;
  }
  for(const slot of equipmentSlots){
    const item = player.equipment?.[slot];
    if(!item){ continue; }
    base.bonusHp += item.bonusHp || 0;
    base.bonusMp += item.bonusMp || 0;
    base.bonusAttack += item.bonusAttack || 0;
    base.skillPower += item.skillPower || 0;
    base.reflectPercent += item.reflectPercent || 0;
    base.coinBonus += item.coinBonus || 0;
    base.xpBonus += item.xpBonus || 0;
    base.turnHealPercent += item.turnHealPercent || 0;
    base.burnDamageReductionPercent += item.burnDamageReductionPercent || 0;
    base.flatReduction += item.flatReduction || 0;
    base.bonusMpPercentAccessory += item.bonusMpPercent || 0;
    base.bonusHpPercentAccessory += item.bonusHpPercent || 0;
    base.totalDamagePercent += item.totalDamagePercent || 0;
    base.fatalSaveHealPercent = Math.max(base.fatalSaveHealPercent, item.fatalSaveHealPercent || 0);
    base.critChanceBonus += item.critChanceBonus || 0;
  }
  const activeSetBonuses = getActiveSetBonuses().bonuses;
  base.bonusHp += activeSetBonuses.bonusHp || 0;
  base.bonusMp += activeSetBonuses.bonusMp || 0;
  base.bonusAttack += activeSetBonuses.bonusAttack || 0;
  base.skillPower += activeSetBonuses.skillPower || 0;
  base.totalDamagePercent += activeSetBonuses.totalDamagePercent || 0;
  if(activeSetBonuses.bonusMpPercent > 0){
    base.bonusMp += Math.floor((player.maxMp + base.bonusMp + pendingGains.mpGain) * activeSetBonuses.bonusMpPercent);
  }
  if(base.bonusMpPercentAccessory > 0){
    base.bonusMp += Math.floor((player.maxMp + base.bonusMp + pendingGains.mpGain) * base.bonusMpPercentAccessory);
  }
  if(getUnlockedPassiveSkills().some(passive => passive.type === "mage_overflowing")){
    const damageFactor = tier60 === "arquimago" && player.level >= 60 ? 0.45 : 0.3;
    const costFactor = tier60 === "arquimago" && player.level >= 60 ? 0.2 : 0.1;
    base.totalDamageFlat += Math.floor((player.maxMp + base.bonusMp) * damageFactor);
    base.skillCostIncrease += Math.floor((player.maxMp + base.bonusMp) * costFactor);
  }
  if(getUnlockedPassiveSkills().some(passive => passive.type === "archer_mana_to_skill_bonus")){
    base.skillPower += Math.floor((player.maxMp + base.bonusMp) * 0.05);
  }
  if(getUnlockedPassiveSkills().some(passive => passive.type === "mage_mana_to_life") && tier60 === "mago_incendiario" && player.level >= 60){
    base.skillPower += Math.floor((player.maxMp + base.bonusMp) * 0.18);
  }
  if(getUnlockedPassiveSkills().some(passive => passive.type === "nature_cycle") && tier30 === "espirito_da_floresta" && player.level >= 30){
    base.skillPower += Math.floor((player.attack + base.bonusAttack + pendingGains.attackGain) * 0.3);
  }
  if(getUnlockedPassiveSkills().some(passive => passive.type === "nature_fairy_aura")){
    const perStack = tier60 === "fada_monarca" && player.level >= 60 ? 0.06 : 0.04;
    const cadenceStacks = Math.min(3, playerEffects.natureCadence || 0);
    if(cadenceStacks > 0){
      base.skillPower += Math.floor((player.attack + base.bonusAttack + base.skillPower + pendingGains.attackGain) * perStack * cadenceStacks);
    }
  }
  if(playerEffects.natureCrownedTurns > 0){
    base.skillPower += Math.floor((player.attack + base.bonusAttack + base.skillPower + pendingGains.attackGain) * 0.3);
  }
  if(base.manaToLifePercent > 0){
    base.bonusHp += Math.floor((player.maxMp + base.bonusMp + pendingGains.mpGain) * base.manaToLifePercent);
  }
  if(activeSetBonuses.bonusHpPercent > 0){
    base.bonusHp += Math.floor((player.maxHp + base.bonusHp + pendingGains.hpGain) * activeSetBonuses.bonusHpPercent);
  }
  if(base.bonusHpPercentAccessory > 0){
    base.bonusHp += Math.floor((player.maxHp + base.bonusHp + pendingGains.hpGain) * base.bonusHpPercentAccessory);
  }
  return base;
}

function needsSubclassChoice(){
  if(!player){ return false; }
  const subclassState = getPlayerSubclassState();
  return (player.level >= 30 && !subclassState.tier30) || (player.level >= 60 && !!subclassState.tier30 && !subclassState.tier60);
}

function getCollectedEquipmentCount(){
  return player.inventory.filter(item => item.type === "equipment").length + Object.values(player.equipment || {}).filter(Boolean).length;
}

function getLegendaryEquipmentCount(){
  return [...player.inventory, ...Object.values(player.equipment || {})].filter(Boolean).filter(item => item.type === "equipment" && item.rarity === "lendaria").length;
}

function getCompletedSetCount(){
  return getActiveSetBonuses().activeSets.length;
}

function getSubclassCount(){
  return getChosenSubclassDefs().length;
}

function getTrophyCompletion(){
  const trophies = getTrophies();
  const done = trophies.filter(trophy => trophy.done).length;
  return Math.floor(done / trophies.length * 100);
}

function getTrophies(){
  return [
    { category: "Combate", name: "Primeiro Sangue", done: player.stats.enemiesDefeated >= 1, description: "Derrote 1 inimigo." },
    { category: "Combate", name: "Limpador de Trilha", done: player.stats.enemiesDefeated >= 10, description: "Derrote 10 inimigos." },
    { category: "Combate", name: "Cacador Experiente", done: player.stats.enemiesDefeated >= 25, description: "Derrote 25 inimigos." },
    { category: "Combate", name: "Exterminador", done: player.stats.enemiesDefeated >= 100, description: "Derrote 100 inimigos." },
    { category: "Chefes", name: "Matador de Chefes", done: player.stats.bossesDefeated >= 1, description: "Derrote 1 chefao." },
    { category: "Chefes", name: "Lenda da Coroa", done: player.stats.bossesDefeated >= 5, description: "Derrote 5 chefes." },
    { category: "Chefes", name: "Dominador Regional", done: Object.keys(regions).every(region => (player.stats.regionBossKills?.[region] || 0) > 0), description: "Derrote o chefao de todas as regioes ao menos uma vez." },
    { category: "Economia", name: "Bolso Pesado", done: player.stats.coinsEarned >= 500, description: "Acumule 500 moedas ao longo da campanha." },
    { category: "Economia", name: "Magnata do Vilarejo", done: player.stats.coinsEarned >= 2500, description: "Acumule 2500 moedas ao longo da campanha." },
    { category: "Equipamentos", name: "Colecionador de Aco", done: getCollectedEquipmentCount() >= 8, description: "Junte 8 equipamentos entre inventario e equipamento atual." },
    { category: "Equipamentos", name: "Tesouro Lendario", done: getLegendaryEquipmentCount() >= 1, description: "Obtenha pelo menos 1 equipamento lendario." },
    { category: "Equipamentos", name: "Vestido para Guerra", done: Object.values(player.equipment || {}).filter(Boolean).length >= 5, description: "Equipe todos os 5 slots de equipamento." },
    { category: "Equipamentos", name: "Mestre dos Sets", done: getCompletedSetCount() >= 1, description: "Ative um set completo de regiao." },
    { category: "Progressao", name: "Caminho Escolhido", done: getSubclassCount() >= 1, description: "Escolha sua primeira subclasse." },
    { category: "Progressao", name: "Forma Final", done: getSubclassCount() >= 2, description: "Escolha sua segunda subclasse." },
    { category: "Progressao", name: "Alem do Vulcao", done: player.level >= 44, description: "Alcance o nivel 44." },
    { category: "Progressao", name: "Senhor da Necropole", done: player.level >= 60, description: "Alcance o nivel 60." },
    { category: "Progressao", name: "Peregrino do Panteao", done: player.level >= 68, description: "Alcance o nivel 68." },
    { category: "Progressao", name: "Fim do Mundo", done: player.level >= 76, description: "Alcance o nivel 76." },
    { category: "Progressao", name: "Alem do Cataclismo", done: player.level >= 84, description: "Alcance o nivel 84." },
    { category: "Sobrevivencia", name: "Imortal por Teimosia", done: player.stats.deaths >= 1, description: "Caia em batalha e volte para lutar outra vez." },
    { category: "Sobrevivencia", name: "Veterano de Guerra", done: player.stats.deaths >= 5, description: "Caia 5 vezes e continue a jornada." },
    { category: "Progressao", name: "Mestre do Vazio", done: player.level >= 60, description: "Alcance o nivel 60." },
    { category: "Progressao", name: "Ascensao Heroica", done: player.level >= 80, description: "Alcance o nivel 80." },
    { category: "Progressao", name: "Mestre Supremo", done: player.level >= MAX_LEVEL, description: "Alcance o nivel maximo." },
    { category: "Dungeon", name: "Primeira Incursao", done: (player.stats.dungeonBestStep || 0) >= 1, description: "Derrote o primeiro inimigo da dungeon online." },
    { category: "Dungeon", name: "Meio Caminho", done: (player.stats.dungeonBestStep || 0) >= Math.floor(getDungeonSequence().length / 2), description: "Alcance metade da sequencia fixa da dungeon." },
    { category: "Dungeon", name: "Fim da Incursao", done: (player.stats.dungeonClears || 0) >= 1, description: "Conclua a dungeon inteira uma vez." },
    { category: "Dungeon", name: "Grupo Persistente", done: (player.stats.dungeonClears || 0) >= 3, description: "Conclua a dungeon inteira 3 vezes." },
    { category: "Colecao", name: "Arsenal Completo", done: getCollectedEquipmentCount() >= 20, description: "Junte 20 equipamentos entre inventario e equipamento atual." },
    { category: "Colecao", name: "Lenda Reluzente", done: getLegendaryEquipmentCount() >= 3, description: "Obtenha 3 equipamentos lendarios." }
  ];
}

function getTrophyCategories(){
  const grouped = {};
  for(const trophy of getTrophies()){
    const category = trophy.category || "Geral";
    grouped[category] = grouped[category] || [];
    grouped[category].push(trophy);
  }
  return grouped;
}

function getTrophyCategorySummary(){
  return Object.entries(getTrophyCategories()).map(([category, trophies]) => {
    const completed = trophies.filter(trophy => trophy.done).length;
    return {
      category,
      completed,
      total: trophies.length,
      percent: Math.floor((completed / Math.max(1, trophies.length)) * 100)
    };
  });
}

function setTrophyCategory(category){
  selectedTrophyCategory = category || "Todas";
  updateUI();
}

function getVisibleTrophyCategories(){
  const grouped = getTrophyCategories();
  if(selectedTrophyCategory === "Todas" || !grouped[selectedTrophyCategory]){
    return grouped;
  }
  return { [selectedTrophyCategory]: grouped[selectedTrophyCategory] };
}

function renderTrophyGroups(){
  return Object.entries(getVisibleTrophyCategories()).map(([category, trophies]) => {
    const completed = trophies.filter(trophy => trophy.done).length;
    return `<div class="trophy-category"><div class="panel-header"><strong>${category}</strong><span class="coin-badge">${completed}/${trophies.length}</span></div><div class="trophy-list">${trophies.map(trophy => `<div class="trophy-item ${trophy.done ? "" : "locked"}"><strong>${trophy.name}</strong><br><span class="lock-note">${trophy.description}</span></div>`).join("")}</div></div>`;
  }).join("");
}

function renderTrophySummaryPanel(){
  const categorySummary = getTrophyCategorySummary();
  const overall = getTrophyCompletion();
  return `
    <h3>Resumo das conquistas</h3>
    <div class="button-row">
      <button class="region-chip ${selectedTrophyCategory === "Todas" ? "active" : ""}" onclick="setTrophyCategory('Todas')">Todas</button>
      ${categorySummary.map(entry => `<button class="region-chip ${selectedTrophyCategory === entry.category ? "active" : ""}" onclick="setTrophyCategory('${entry.category}')">${entry.category}</button>`).join("")}
    </div>
    <div class="trophy-summary-grid">
      ${categorySummary.map(entry => `<div class="trophy-summary-card"><strong>${entry.category}</strong><span>${entry.percent}%</span><small>${entry.completed}/${entry.total} concluidas</small></div>`).join("")}
      <div class="trophy-summary-card"><strong>Total geral</strong><span>${overall}%</span><small>${getTrophies().filter(trophy => trophy.done).length}/${getTrophies().length} conquistas</small></div>
    </div>`;
}

function setCampTab(tab){
  campTab = ["status", "equipamentos", "habilidades"].includes(tab) ? tab : "status";
  updateUI();
}

function renderCampTabs(){
  const tabs = [
    { id: "status", label: "Status do heroi" },
    { id: "equipamentos", label: "Equipamentos" },
    { id: "habilidades", label: "Habilidades" }
  ];
  return `<div class="inner-tabs">${tabs.map(tab => `<button class="inner-tab ${campTab === tab.id ? "active" : ""}" onclick="setCampTab('${tab.id}')">${tab.label}</button>`).join("")}</div>`;
}

function renderCampContent(campEntries, previewStats, investedSummary, classBaseData, subclassBonuses, activeSetData, xpToNextLevel){
  if(campTab === "equipamentos"){
    return `
      ${renderCampTabs()}
      <div class="inventory-item">
        <strong>Equipamentos</strong>
        ${renderEquipmentShowcase()}
      </div>
      <div class="inventory-item" style="margin-top:12px;"><strong>Sets ativos</strong><br><span class="lock-note">${activeSetData.activeSets.length ? activeSetData.activeSets.map(setEntry => `${setEntry.setName}: ${setEntry.text}`).join(" | ") : "Nenhum set completo equipado."}</span></div>`;
  }
  if(campTab === "habilidades"){
    return `
      ${renderCampTabs()}
      <div class="inventory-list">
        <div class="inventory-item">
          <strong>Habilidades ativas</strong>
          <div class="inventory-list">
            ${campEntries.activeEntries.map(skill => `<div class="inventory-item"><strong>${skill.name}</strong><br><span class="lock-note">${skill.description}</span><br><span class="${skill.statusClass}">${skill.status}</span></div>`).join("")}
          </div>
        </div>
        <div class="inventory-item">
          <strong>Habilidades passivas</strong>
          <div class="inventory-list">
            ${campEntries.passiveEntries.map(skill => `<div class="inventory-item"><strong>${skill.name}</strong><br><span class="lock-note">${skill.description}</span><br><span class="${skill.statusClass}">${skill.status}</span></div>`).join("")}
          </div>
        </div>
        <div class="inventory-item"><strong>Proximos desbloqueios</strong><div class="progression-list">${[...campEntries.activeEntries, ...campEntries.passiveEntries].filter(entry => !entry.unlocked).sort((a, b) => a.level - b.level).slice(0, 6).map(entry => `<div class="progression-item ${entry.isNext ? "next" : ""}"><strong>${entry.name}</strong><br><span class="lock-note">${entry.description}</span><br><span class="${entry.statusClass}">${entry.isNext ? "Proximo desbloqueio mais proximo" : "Desbloqueio futuro"} - Nivel ${entry.level}</span></div>`).join("") || `<div class="progression-item"><strong>Tudo desbloqueado</strong><br><span class="lock-note">Sua rota atual ja liberou todas as habilidades dessa classe/subclasse.</span></div>`}</div></div>
      </div>`;
  }
  return `
    ${renderCampTabs()}
    <div class="camp-stats">
      <div class="camp-stat"><strong>Vida</strong><span>${player.hp}/${previewStats.maxHp}</span></div>
      <div class="camp-stat"><strong>Mana</strong><span>${player.mp}/${previewStats.maxMp}</span></div>
      <div class="camp-stat"><strong>Ataque base</strong><span>${getActiveAttack()}</span></div>
      <div class="camp-stat"><strong>Dano de habilidade</strong><span>${getSkillPowerBonus()}</span></div>
      <div class="camp-stat"><strong>Dano resistido</strong><span>${getPassiveModifiers().flatReduction}</span></div>
      <div class="camp-stat"><strong>XP</strong><span>${player.level >= MAX_LEVEL ? "MAX" : `${player.xp}/${xpToNextLevel}`}</span></div>
      <div class="camp-stat"><strong>Pontos em Vitalidade</strong><span>${investedSummary.vitalityPoints}</span></div>
      <div class="camp-stat"><strong>Pontos em Sabedoria</strong><span>${investedSummary.wisdomPoints}</span></div>
      <div class="camp-stat"><strong>Pontos em Forca</strong><span>${investedSummary.strengthPoints}</span></div>
    </div>
    ${getChosenSubclassDefs().length ? `<div class="inventory-item"><strong>Rota de subclasse</strong><div class="subclass-route">${getChosenSubclassDefs().map((subclass, index, arr) => `<span class="subclass-chip active">${index === arr.length - 1 ? "Atual: " : "Escolhida: "}${subclass.name}</span>`).join("")} </div><div class="subclass-summary"><strong>Bonus recebidos</strong><div class="subclass-bonus-list">${getChosenSubclassDefs().map(subclass => `<div class="inventory-item"><strong>${subclass.name}</strong><br><span class="lock-note">${subclass.description}</span><br><span class="status-on">${formatSubclassStatBonuses(subclass)}</span></div>`).join("")}</div><div class="inventory-item" style="margin-top:10px;"><strong>Total acumulado</strong><br><span class="status-on">${formatSubclassStatBonuses(getTotalSubclassBonuses())}</span></div></div></div>` : `<div class="inventory-item"><strong>Subclasse</strong><br><span class="lock-note">Ainda nao escolhida. Sua primeira escolha acontece no nivel 30 e a segunda no nivel 60.</span></div>`}
    <div class="inventory-item" style="margin-top:12px;"><strong>Spoiler de subclasses</strong><br><span class="lock-note">Aqui voce ja consegue ver os nomes das rotas futuras da sua classe.</span><div class="inventory-list">${renderSubclassSpoilers()}</div></div>`;
}

function isDungeonMode(){
  return currentMode === "dungeon";
}

function getDungeonRequirement(){
  return dungeonData.minLevel;
}

function getDungeonSequence(){
  return Object.entries(regions).flatMap(([regionName, regionData]) => [
    ...regionData.enemies.map(template => ({ regionName, template, isBoss: false })),
    { regionName, template: regionData.boss, isBoss: true }
  ]);
}

function getDungeonStepEntry(stepIndex = dungeonMultiplayer.dungeonStepIndex || 0){
  const sequence = getDungeonSequence();
  return sequence[Math.min(Math.max(0, stepIndex), Math.max(0, sequence.length - 1))] || null;
}

function getDungeonPartyScale(){
  return Math.max(1, getDungeonRoomMembers().length || 1);
}

function createDungeonEnemyAtStep(stepIndex = dungeonMultiplayer.dungeonStepIndex || 0){
  const entry = getDungeonStepEntry(stepIndex);
  if(!entry){ return null; }
  const partyScale = getDungeonPartyScale();
  const scaledTemplate = {
    ...entry.template,
    level: Math.max(1, entry.template.level * partyScale)
  };
  const dungeonEnemy = createEnemyFromTemplate(scaledTemplate, entry.isBoss, entry.regionName);
  dungeonEnemy.dungeonStepIndex = stepIndex;
  dungeonEnemy.dungeonSourceRegion = entry.regionName;
  dungeonEnemy.name = `${entry.template.name} Lv.${scaledTemplate.level}`;
  return dungeonEnemy;
}

function getDungeonProgressText(){
  const sequence = getDungeonSequence();
  const currentStep = Math.min((dungeonMultiplayer.dungeonStepIndex || 0) + 1, sequence.length);
  const entry = getDungeonStepEntry();
  if(!entry){
    return "Sequencia completa.";
  }
  return `Etapa ${currentStep}/${sequence.length}: ${entry.template.name} (${entry.regionName})`;
}

function isDungeonConnected(){
  return !!(dungeonMultiplayer.peer && (dungeonMultiplayer.isHost || dungeonMultiplayer.hostConnection?.open));
}

function isDungeonHost(){
  return !!(dungeonMultiplayer.peer && dungeonMultiplayer.isHost);
}

function clearDungeonEnemyTimer(){
  if(dungeonMultiplayer.enemyAttackTimer){
    clearInterval(dungeonMultiplayer.enemyAttackTimer);
    dungeonMultiplayer.enemyAttackTimer = null;
  }
}

function getDungeonRoomMembers(){
  return Object.values(dungeonMultiplayer.party);
}

function getDungeonPlayerProfile(){
  return {
    id: dungeonMultiplayer.peer?.id || "local",
    name: `${getDisplayedClassName()} Lv.${player.level}`,
    class: player.class,
    level: player.level,
    icon: getHeroSpriteIcon()
  };
}

function getDungeonCurrentTurnId(){
  return dungeonMultiplayer.turnOrder[dungeonMultiplayer.turnIndex] || null;
}

function isMyDungeonTurn(){
  return isDungeonConnected() && dungeonMultiplayer.battleActive && getDungeonCurrentTurnId() === dungeonMultiplayer.peer?.id;
}

function syncDungeonEnemyState(sharedEnemy){
  if(currentMode !== "dungeon"){ return; }
  enemy = sharedEnemy ? { ...sharedEnemy } : null;
  displayState.enemyHp = enemy ? enemy.hp : null;
  needsNewEnemy = !enemy;
}

function broadcastToDungeonPeers(payload){
  Object.values(dungeonMultiplayer.connections).forEach(connection => {
    if(connection?.open){
      connection.send(payload);
    }
  });
}

function broadcastDungeonState(){
  if(!isDungeonHost()){ return; }
  dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = getDungeonPlayerProfile();
  broadcastToDungeonPeers({
    type: "state",
    roomCode: dungeonMultiplayer.roomCode,
    party: dungeonMultiplayer.party,
    enemy: enemy ? { ...enemy } : null,
    turnOrder: [...dungeonMultiplayer.turnOrder],
    turnIndex: dungeonMultiplayer.turnIndex,
    dungeonStepIndex: dungeonMultiplayer.dungeonStepIndex,
    round: dungeonMultiplayer.round,
    enemySkipTurn: !!dungeonMultiplayer.enemySkipTurn,
    battleActive: !!dungeonMultiplayer.battleActive
  });
}

function syncDungeonProfile(){
  if(!isDungeonConnected()){ return; }
  const profile = getDungeonPlayerProfile();
  if(isDungeonHost()){
    dungeonMultiplayer.party[dungeonMultiplayer.peer.id] = profile;
    broadcastDungeonState();
  }else if(dungeonMultiplayer.hostConnection?.open){
    dungeonMultiplayer.hostConnection.send({ type: "profile_update", player: profile });
  }
}

function handleDungeonPeerDisconnect(peerId){
  delete dungeonMultiplayer.connections[peerId];
  if(dungeonMultiplayer.party[peerId]){
    log(`${dungeonMultiplayer.party[peerId].name} saiu da sala da dungeon.`);
    delete dungeonMultiplayer.party[peerId];
    dungeonMultiplayer.turnOrder = dungeonMultiplayer.turnOrder.filter(id => id !== peerId);
    if(dungeonMultiplayer.turnIndex >= dungeonMultiplayer.turnOrder.length){
      dungeonMultiplayer.turnIndex = 0;
    }
    if(dungeonMultiplayer.battleActive && dungeonMultiplayer.turnOrder.length < 2){
      handleDungeonRaidDefeat("A incursao terminou porque o grupo se desfez.");
      return;
    }
    broadcastDungeonState();
    updateUI();
  }
}

function leaveDungeonRoom(silent = false){
  clearDungeonEnemyTimer();
  Object.values(dungeonMultiplayer.connections).forEach(connection => {
    try { connection.close(); } catch {}
  });
  if(dungeonMultiplayer.hostConnection){
    try { dungeonMultiplayer.hostConnection.close(); } catch {}
  }
  if(dungeonMultiplayer.peer){
    try { dungeonMultiplayer.peer.destroy(); } catch {}
  }
  dungeonMultiplayer = createDungeonMultiplayerState();
  if(currentMode === "dungeon"){
    enemy = null;
    displayState.enemyHp = null;
    needsNewEnemy = true;
  }
  if(!silent){
    log("Voce saiu da sala da dungeon.");
  }
  updateUI();
}

function renderDungeonPartyList(){
  const members = getDungeonRoomMembers();
  if(!members.length){
    return `<p class="lock-note">Nenhum aventureiro conectado ainda.</p>`;
  }
  return `<div class="party-list">${members.map(member => `<div class="party-entry"><strong>${member.icon} ${member.name}</strong><br><span class="lock-note">${member.class} | Nivel ${member.level}</span></div>`).join("")}</div>`;
}

function getDungeonStatusText(){
  if(isDungeonHost()){
    if(dungeonMultiplayer.battleActive && enemy){
      return `Rodada ${dungeonMultiplayer.round}. Turno atual: ${(dungeonMultiplayer.party[getDungeonCurrentTurnId()] || {}).name || "..."}.`;
    }
    return `Sala criada. Compartilhe o codigo ${dungeonMultiplayer.roomCode} com seus amigos.`;
  }
  if(isDungeonConnected()){
    if(dungeonMultiplayer.battleActive && enemy){
      return `Conectado a sala ${dungeonMultiplayer.roomCode}. Turno atual: ${(dungeonMultiplayer.party[getDungeonCurrentTurnId()] || {}).name || "..."}.`;
    }
    return `Conectado a sala ${dungeonMultiplayer.roomCode}. Aguarde o host iniciar a incursao.`;
  }
  return "Crie uma sala ou entre com um codigo para jogar online com ate 2 amigos.";
}

function renderDungeonRoomControls(){
  const canStart = isDungeonHost() && getDungeonRoomMembers().length >= 2 && !enemy && !isDead && player.hp > 0;
  const canManageRoom = !isDead && player.hp > 0;
  const sequence = getDungeonSequence();
  const nextEntry = getDungeonStepEntry();
  return `
    <div class="inventory-list">
      <div class="inventory-item">
        <strong>Sala online</strong><br>
        <span class="lock-note">${getDungeonStatusText()}</span>
        ${dungeonMultiplayer.roomCode ? `<div style="margin-top:10px;"><span class="room-pill">${dungeonMultiplayer.roomCode}</span></div>` : ""}
        ${!isDungeonConnected() ? `<div style="margin-top:10px;"><input id="dungeonJoinCode" class="text-input" placeholder="Codigo da sala" maxlength="12" /></div>` : ""}
        <div class="button-row">
          <button onclick="hostDungeonRoom()" ${isDungeonConnected() || !canManageRoom ? "disabled" : ""}>Criar sala</button>
          <button onclick="joinDungeonRoom()" ${isDungeonConnected() || !canManageRoom ? "disabled" : ""}>Entrar</button>
          ${isDungeonConnected() ? `<button onclick="leaveDungeonRoom()">Sair da sala</button>` : ""}
        </div>
        ${isDungeonHost() ? `<div class="button-row"><button onclick="startDungeonRaid()" ${canStart ? "" : "disabled"}>Iniciar dungeon</button></div><span class="lock-note">${getDungeonRoomMembers().length < 2 ? "Conecte pelo menos mais 1 jogador para comecar." : "Sala pronta para a batalha."}</span>` : ""}
      </div>
      <div class="inventory-item">
        <strong>Progressao da dungeon</strong><br>
        <span class="lock-note">${getDungeonProgressText()}</span><br>
        <span class="lock-note">Ordem fixa: inimigos e chefao de cada regiao, da Floresta ate o Paradoxo. Proximo: ${nextEntry ? `${nextEntry.template.name} de ${nextEntry.regionName}` : "fim da sequencia"}.</span><br>
        <span class="lock-note">Total da rota: ${sequence.length} encontros. O nivel de cada inimigo e multiplicado pela quantidade de herois conectados.</span>
      </div>
      <div class="inventory-item">
        <strong>Equipe</strong>
        ${renderDungeonPartyList()}
      </div>
    </div>`;
}

function hostDungeonRoom(){
  if(currentMode !== "dungeon" || !player || isDead || player.hp <= 0){ return; }
  if(typeof Peer === "undefined"){
    log("Nao foi possivel carregar o sistema online da dungeon.");
    return;
  }
  leaveDungeonRoom(true);
  const roomCode = `DNG${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  dungeonMultiplayer = createDungeonMultiplayerState();
  dungeonMultiplayer.isHost = true;
  dungeonMultiplayer.roomCode = roomCode;
  dungeonMultiplayer.peer = new Peer(roomCode);
  dungeonMultiplayer.peer.on("open", id => {
    dungeonMultiplayer.roomCode = id;
    dungeonMultiplayer.party[id] = getDungeonPlayerProfile();
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
}

function joinDungeonRoom(){
  if(currentMode !== "dungeon" || !player || isDead || player.hp <= 0){ return; }
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
  leaveDungeonRoom(true);
  dungeonMultiplayer = createDungeonMultiplayerState();
  dungeonMultiplayer.isHost = false;
  dungeonMultiplayer.roomCode = roomCode;
  dungeonMultiplayer.peer = new Peer();
  dungeonMultiplayer.peer.on("open", () => {
    const connection = dungeonMultiplayer.peer.connect(roomCode, { reliable: true });
    dungeonMultiplayer.hostConnection = connection;
    connection.on("open", () => {
      connection.send({ type: "join", player: getDungeonPlayerProfile() });
      log(`Conectando a sala ${roomCode}...`);
      updateUI();
    });
    connection.on("data", handleDungeonGuestMessage);
    connection.on("close", () => {
      log("A conexao com a dungeon foi encerrada.");
      leaveDungeonRoom(true);
    });
  });
  dungeonMultiplayer.peer.on("error", error => {
    log(`Erro na conexao da dungeon: ${error.type || error.message}.`);
    updateUI();
  });
}

function handleDungeonHostMessage(connection, data){
  if(!data || !isDungeonHost()){ return; }
  if(data.type === "join"){
    dungeonMultiplayer.party[connection.peer] = data.player;
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
  if(data.type === "player_defeated"){
    handleDungeonRaidDefeat(`${dungeonMultiplayer.party[connection.peer]?.name || "Um jogador"} caiu na dungeon. A incursao foi perdida.`);
    return;
  }
  if(data.type === "action"){
    if(data.player){
      dungeonMultiplayer.party[connection.peer] = data.player;
    }
    if(getDungeonCurrentTurnId() !== connection.peer || !dungeonMultiplayer.battleActive || !enemy){
      return;
    }
    if(data.message){
      log(data.message);
      broadcastToDungeonPeers({ type: "log", message: data.message });
    }
    if(enemy && data.damage){
      applyDungeonDamageToEnemy(data.damage, { ignoreArmor: !!data.ignoreArmor, ignoreShield: !!data.ignoreShield });
      displayState.enemyHp = enemy.hp;
    }
    if(enemy && data.freezeNext){
      enemy.skipNextAttack = true;
    }
    if(enemy && enemy.hp <= 0){
      handleDungeonRaidVictory();
      return;
    }
    advanceDungeonTurn();
    broadcastDungeonState();
    updateUI();
  }
}

function handleDungeonGuestMessage(data){
  if(!data){ return; }
  if(data.type === "reject"){
    log(data.reason);
    leaveDungeonRoom(true);
    return;
  }
  if(data.type === "joined"){
    dungeonMultiplayer.roomCode = data.roomCode;
    updateUI();
    return;
  }
  if(data.type === "state"){
    const wasBattleActive = dungeonMultiplayer.battleActive;
    const previousEnemyStep = enemy?.dungeonStepIndex;
    dungeonMultiplayer.roomCode = data.roomCode || dungeonMultiplayer.roomCode;
    dungeonMultiplayer.party = data.party || {};
    dungeonMultiplayer.turnOrder = data.turnOrder || [];
    dungeonMultiplayer.turnIndex = data.turnIndex || 0;
    dungeonMultiplayer.round = data.round || 1;
    dungeonMultiplayer.dungeonStepIndex = data.dungeonStepIndex || 0;
    dungeonMultiplayer.enemySkipTurn = !!data.enemySkipTurn;
    dungeonMultiplayer.battleActive = !!data.battleActive;
    if(dungeonMultiplayer.battleActive && (!wasBattleActive || (data.enemy && previousEnemyStep !== data.enemy.dungeonStepIndex))){
      resetCombatEffects();
    }
    syncDungeonEnemyState(data.enemy || null);
    updateUI();
    return;
  }
  if(data.type === "log"){
    log(data.message);
    return;
  }
  if(data.type === "enemy_attack"){
    processDungeonIncomingDamage(data.damage, data.message, data.targetId, data.targetName);
    return;
  }
  if(data.type === "raid_reward"){
    grantDungeonRaidRewards(data.rewards);
    updateUI();
    return;
  }
  if(data.type === "victory"){
    syncDungeonEnemyState(null);
    dungeonMultiplayer.battleActive = false;
    dungeonMultiplayer.turnOrder = [];
    dungeonMultiplayer.turnIndex = 0;
    dungeonMultiplayer.dungeonStepIndex = 0;
    player.stats.dungeonClears = (player.stats.dungeonClears || 0) + 1;
    grantDungeonRaidRewards(data.rewards);
    log(data.message);
    updateUI();
    return;
  }
  if(data.type === "defeat"){
    dungeonMultiplayer.battleActive = false;
    dungeonMultiplayer.turnOrder = [];
    dungeonMultiplayer.turnIndex = 0;
    dungeonMultiplayer.dungeonStepIndex = 0;
    syncDungeonEnemyState(null);
    if(player.hp <= 0 || isDead){
      handleDeath(data.message || "Voce caiu na dungeon.");
    }else{
      handleDungeonRaidDefeat(data.message);
    }
    return;
  }
  if(data.type === "room_closed"){
    log("O host encerrou a sala da dungeon.");
    leaveDungeonRoom(true);
  }
}

function startDungeonRaid(){
  if(!isDungeonHost() || getDungeonRoomMembers().length < 2 || enemy || isDead || player.hp <= 0){ return; }
  dungeonMultiplayer.dungeonStepIndex = 0;
  enemy = createDungeonEnemyAtStep(0);
  if(!enemy){ return; }
  resetCombatEffects();
  displayState.enemyHp = enemy.hp;
  needsNewEnemy = false;
  dungeonMultiplayer.turnOrder = Object.keys(dungeonMultiplayer.party);
  dungeonMultiplayer.turnIndex = 0;
  dungeonMultiplayer.round = 1;
  dungeonMultiplayer.enemySkipTurn = false;
  dungeonMultiplayer.battleActive = true;
  log(`A dungeon comecou contra ${enemy.name}!`);
  broadcastToDungeonPeers({ type: "log", message: `A dungeon comecou contra ${enemy.name}!` });
  broadcastDungeonState();
  updateUI();
}

function applyDungeonDamageToEnemy(rawDamage, options = {}){
  if(!enemy){ return 0; }
  let damage = applyEnemyArmor(rawDamage, !!options.ignoreArmor);
  if(damage > 0 && enemy.shieldValue > 0 && !options.ignoreShield){
    const absorbedByShield = Math.min(enemy.shieldValue, damage);
    enemy.shieldValue -= absorbedByShield;
    damage -= absorbedByShield;
    log(`${enemy.baseName} absorveu ${absorbedByShield} de dano com o escudo.`);
    if(enemy.shieldValue <= 0){
      enemy.shieldValue = 0;
      enemy.shieldTurns = 0;
      log(`O escudo de ${enemy.baseName} se partiu.`);
    }
  }
  enemy.hp -= damage;
  return damage;
}

function grantDungeonRaidRewards(rewards){
  if(!rewards){ return; }
  player.coins += rewards.coins;
  player.stats.coinsEarned += rewards.coins;
  player.stats.enemiesDefeated++;
  player.stats.dungeonBestStep = Math.max(player.stats.dungeonBestStep || 0, rewards.step || 0);
  gainXP(rewards.xp);
}

function handleDungeonRaidVictory(){
  if(!enemy){ return; }
  const defeatedEnemy = enemy;
  const defeatedStep = dungeonMultiplayer.dungeonStepIndex || 0;
  const sequence = getDungeonSequence();
  const rewards = {
    xp: 40 + enemy.level * 9,
    coins: 14 + enemy.level * 4,
    step: defeatedStep + 1
  };
  grantDungeonRaidRewards(rewards);
  if(defeatedEnemy.isBoss){
    player.stats.bossesDefeated++;
  }
  if(defeatedStep < sequence.length - 1){
    dungeonMultiplayer.dungeonStepIndex = defeatedStep + 1;
    enemy = createDungeonEnemyAtStep(dungeonMultiplayer.dungeonStepIndex);
    resetCombatEffects();
    displayState.enemyHp = enemy.hp;
    dungeonMultiplayer.turnIndex = 0;
    dungeonMultiplayer.round++;
    const message = `${defeatedEnemy.name} foi derrotado! Cada jogador recebeu ${rewards.xp} XP e ${rewards.coins} moedas. Proximo encontro: ${enemy.name}.`;
    log(message);
    broadcastToDungeonPeers({ type: "log", message });
    broadcastToDungeonPeers({ type: "raid_reward", rewards });
    broadcastDungeonState();
    updateUI();
    return;
  }
  enemy = null;
  dungeonMultiplayer.battleActive = false;
  dungeonMultiplayer.turnOrder = [];
  dungeonMultiplayer.turnIndex = 0;
  dungeonMultiplayer.dungeonStepIndex = 0;
  displayState.enemyHp = null;
  needsNewEnemy = true;
  player.stats.dungeonClears = (player.stats.dungeonClears || 0) + 1;
  const message = `${defeatedEnemy.name} caiu! A dungeon inteira foi concluida. Cada jogador recebeu ${rewards.xp} XP e ${rewards.coins} moedas.`;
  log(message);
  broadcastToDungeonPeers({ type: "victory", rewards, message });
  broadcastDungeonState();
  updateUI();
}

function handleDungeonRaidDefeat(message){
  enemy = null;
  dungeonMultiplayer.battleActive = false;
  dungeonMultiplayer.turnOrder = [];
  dungeonMultiplayer.turnIndex = 0;
  displayState.enemyHp = null;
  needsNewEnemy = true;
  if(isDungeonHost()){
    broadcastToDungeonPeers({ type: "defeat", message });
    broadcastDungeonState();
  }
  if(isDungeonConnected()){
    leaveDungeonRoom(true);
  }
  currentMode = "battle";
  dungeonMultiplayer.dungeonStepIndex = 0;
  log(message);
  updateUI();
}

function advanceDungeonTurn(){
  if(!isDungeonHost() || !dungeonMultiplayer.battleActive || !enemy){ return; }
  if(dungeonMultiplayer.turnIndex < dungeonMultiplayer.turnOrder.length - 1){
    dungeonMultiplayer.turnIndex++;
    return;
  }
  if(enemy.skipNextAttack){
    enemy.skipNextAttack = false;
    dungeonMultiplayer.turnIndex = 0;
    dungeonMultiplayer.round++;
    log(`${enemy.name} perdeu o turno.`);
    broadcastToDungeonPeers({ type: "log", message: `${enemy.name} perdeu o turno.` });
    return;
  }
  const targetId = dungeonMultiplayer.turnOrder[Math.floor(Math.random() * dungeonMultiplayer.turnOrder.length)];
  const targetName = dungeonMultiplayer.party[targetId]?.name || "um heroi";
  const damage = enemy.attack + Math.floor(Math.random() * 5);
  const message = `${enemy.name} atacou ${targetName} e causou ${damage} de dano.`;
  processDungeonIncomingDamage(damage, message, targetId, targetName);
  broadcastToDungeonPeers({ type: "enemy_attack", damage, message, targetId, targetName });
  if(player.hp <= 0){
    return;
  }
  dungeonMultiplayer.turnIndex = 0;
  dungeonMultiplayer.round++;
}

function processDungeonIncomingDamage(baseDamage, message, targetId = null, targetName = ""){
  if(message){
    log(message);
  }
  const myDungeonId = dungeonMultiplayer.peer?.id || "local";
  if(targetId && targetId !== myDungeonId){
    log(`${targetName || "Outro heroi"} foi o alvo do inimigo desta vez.`);
    updateUI();
    return;
  }
  const result = applyIncomingDamage(baseDamage);
  pulseSpriteClass("enemySpriteBox", "attacking", 240);
  if(!result.missed){
    setTimeout(() => pulseSpriteClass("heroSpriteBox", "hit", 220), 70);
  }
  if(result.missed){
    log("O inimigo errou o golpe contra voce.");
  }
  if(result.absorbed > 0){
    log(`Seu escudo absorveu ${result.absorbed} de dano.`);
  }
  if(result.manaAbsorbed > 0){
    log(`Ultimo Recurso converteu ${result.manaAbsorbed} de dano em gasto de mana.`);
  }
  if(playerEffects.shieldValue <= 0){
    playerEffects.shieldTurns = 0;
    playerEffects.shieldReactiveWeakening = false;
  }else if(playerEffects.shieldTurns > 0){
    playerEffects.shieldTurns--;
    if(playerEffects.shieldTurns <= 0){
      playerEffects.shieldValue = 0;
      playerEffects.shieldReactiveWeakening = false;
      log("Seu escudo se desfez.");
    }
  }
  if(player.hp <= 0){
    if(isDungeonHost()){
      enemy = null;
      dungeonMultiplayer.battleActive = false;
      dungeonMultiplayer.turnOrder = [];
      dungeonMultiplayer.turnIndex = 0;
      displayState.enemyHp = null;
      needsNewEnemy = true;
      broadcastToDungeonPeers({ type: "defeat", message: "O grupo foi derrotado na dungeon." });
      broadcastDungeonState();
      handleDeath("Voce caiu na dungeon.");
    }else if(dungeonMultiplayer.hostConnection?.open){
      dungeonMultiplayer.hostConnection.send({ type: "player_defeated" });
    }
  }
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  updateUI();
}

function sendDungeonActionPayload(payload){
  if(!isDungeonConnected() || !enemy){ return; }
  const actionPayload = { ...payload, player: getDungeonPlayerProfile() };
  if(isDungeonHost()){
    handleDungeonHostMessage({ peer: dungeonMultiplayer.peer.id }, { type: "action", ...actionPayload });
  }else if(dungeonMultiplayer.hostConnection?.open){
    dungeonMultiplayer.hostConnection.send({ type: "action", ...actionPayload });
  }
}

async function dungeonAttack(){
  if(currentMode !== "dungeon" || !isDungeonConnected() || !enemy || isDead || !isMyDungeonTurn()){ return; }
  const result = getBasicAttackResult(getDungeonPlayerProfile().name, false);
  if(result.blocked){
    log(result.message);
    updateUI();
    return;
  }
  applyTurnStartPassives();
  await playSpriteAttackAnimation("hero", player.class === "Mago" ? "cast" : "attack", result.damage > 0, player.class === "Mago" ? Math.min(result.missiles || 1, 3) : 1, 70, 82);
  playerEffects.lastActionType = "basic_attack";
  decayPlayerBuffs();
  const healed = getTurnHealing();
  if(healed > 0){
    player.hp = Math.min(getCurrentCaps().maxHp, player.hp + healed);
    log(`Voce recuperou ${healed} de vida.`);
  }
  const manaRecovered = regenMana();
  if(manaRecovered > 0){
    log(`Voce recuperou ${manaRecovered} de mana.`);
  }
  updateUI();
  sendDungeonActionPayload({ damage: result.damage, message: result.message });
}

async function dungeonUseSkill(index){
  if(currentMode !== "dungeon" || !isDungeonConnected() || !enemy || isDead || !isMyDungeonTurn()){ return; }
  if(playerEffects.forcedBasicTurns > 0){
    log("Voce so pode usar o ataque basico enquanto Cortes Ultrasonicos estiver ativo.");
    updateUI();
    return;
  }
  const skillInfo = getSkillInfo()[index];
  if(!skillInfo){
    log("Voce ainda nao desbloqueou essa habilidade.");
    return;
  }
  const result = applySkillLocally(skillInfo, getDungeonPlayerProfile().name, false);
  if(result.blocked){
    log(result.message);
    updateUI();
    return;
  }
  applyTurnStartPassives();
  displayState.playerMp = player.mp;
  updateUI();
  await wait(80);
  await playSpriteAttackAnimation("hero", getSkillAnimationStyle(skillInfo), result.damage > 0);
  decayPlayerBuffs();
  const healed = getTurnHealing();
  if(healed > 0){
    player.hp = Math.min(getCurrentCaps().maxHp, player.hp + healed);
    log(`Voce recuperou ${healed} de vida.`);
  }
  const manaRecovered = regenMana();
  if(manaRecovered > 0){
    log(`Voce recuperou ${manaRecovered} de mana.`);
  }
  updateUI();
  sendDungeonActionPayload({ damage: result.damage, message: result.message, ignoreArmor: !!skillInfo.ignoreArmor, freezeNext: !!result.freezeApplied });
}

function getRegionRequirement(region){
  const regionNames = Object.keys(regions);
  const index = regionNames.indexOf(region);
  if(index <= 0){ return "nenhum requisito"; }
  const previousRegion = regionNames[index - 1];
  return `derrotar ${regions[previousRegion].boss.name}`;
}

function isRegionUnlockedForBattle(region){
  const regionNames = Object.keys(regions);
  const index = regionNames.indexOf(region);
  if(index <= 0){ return true; }
  const previousRegion = regionNames[index - 1];
  return !!player?.stats?.regionBossKills?.[previousRegion];
}

function grantNextLevelForTest(){
  if(!player){
    return;
  }
  if(player.level >= MAX_LEVEL){
    log("Voce ja alcancou o nivel maximo.");
    updateUI();
    return;
  }
  const xpNeeded = Math.max(1, getXpToNextLevel() - player.xp);
  gainXP(xpNeeded);
  log("Teste: voce recebeu XP suficiente para o proximo nivel.");
  updateUI();
}

window.comandoProximoNivel = grantNextLevelForTest;

function getActiveAttack(){
  const baseAttack = getPreviewStats().attack + (playerEffects.attackBuffTurns > 0 ? playerEffects.attackBuffAmount : 0);
  const percent = playerEffects.attackBuffTurns > 0 ? playerEffects.attackBuffPercent : 0;
  return Math.floor(baseAttack * (1 + percent));
}

function getAttackSkillBonus(){
  const invested = createDefaultInvestedStats(player.stats?.invested || {});
  const previewGains = getPendingAllocationGains();
  return (invested.skillGain || invested.attackGain || 0) + previewGains.skillGain;
}

function getSkillPowerBonus(){
  const baseSkill = getPassiveModifiers().skillPower + getAttackSkillBonus() + (playerEffects.skillBuffTurns > 0 ? playerEffects.skillBuffAmount : 0);
  const percent = playerEffects.skillBuffTurns > 0 ? playerEffects.skillBuffPercent : 0;
  return Math.floor(baseSkill * (1 + percent));
}

function getUniversalDamageFlatBonus(){
  return getPassiveModifiers().totalDamageFlat || 0;
}

function getUniversalDamagePercentBonus(){
  return getPassiveModifiers().totalDamagePercent || 0;
}

function getArcaneChargeInfo(){
  return {
    charges: playerEffects.arcaneCharges || 0,
    turns: playerEffects.arcaneChargeTurns || 0
  };
}

function addArcaneCharges(amount){
  const gained = Math.max(0, Math.floor(amount));
  if(gained <= 0){ return 0; }
  if(playerEffects.arcaneCharges <= 0 || playerEffects.arcaneChargeTurns <= 0){
    playerEffects.arcaneCharges = 0;
    playerEffects.arcaneChargeTurns = 3;
  }
  playerEffects.arcaneCharges += gained;
  return gained;
}

function getHitChance(mode = "basic"){
  if(playerEffects.guaranteedHitTurns > 0){ return 1; }
  if(player.class !== "Arqueiro"){ return 1; }
  const baseChance = mode === "precise" ? 0.9 : 0.84;
  return Math.min(1, baseChance);
}

function rollHit(mode = "basic"){
  return Math.random() < getHitChance(mode);
}

function getArcherCritChanceBonus(){
  const subclassState = getPlayerSubclassState();
  let chance = getPassiveModifiers().critChanceBonus || 0;
  if(subclassState.tier30 === "atirador" && player.level >= 30){
    chance += 0.05;
  }
  if(subclassState.tier60 === "sniper" && player.level >= 60 && player.level >= 40){
    chance += 0.15;
  }
  if(subclassState.tier60 === "sniper" && player.level >= 60){
    chance += 0.15;
  }
  if(subclassState.tier60 === "sniper" && player.level >= 70){
    chance += 0.15;
  }
  return chance;
}

function getArcherCriticalProfile(baseChance = 0){
  const totalChance = Math.max(0, baseChance + (player.class === "Arqueiro" ? getArcherCritChanceBonus() : 0));
  const critChance = Math.min(1, totalChance);
  const critDamageBonus = 1 + Math.max(0, totalChance - 1);
  return {
    totalChance,
    critChance,
    critDamageBonus,
    multiplierOnCrit: 1 + critDamageBonus
  };
}

function rollArcherCriticalOutcome(baseChance = 0){
  const profile = getArcherCriticalProfile(baseChance);
  const didCrit = Math.random() < profile.critChance;
  return {
    ...profile,
    didCrit,
    multiplier: didCrit ? profile.multiplierOnCrit : 1
  };
}

function getEnemyMissChance(){
  const passiveChance = getPassiveModifiers().enemyMissChance;
  const effectChance = playerEffects.enemyMissBonusTurns > 0 ? playerEffects.enemyMissBonus : 0;
  return Math.min(0.95, passiveChance + effectChance);
}

function decayPlayerBuffs(){
  const previousInvulnerableTurns = playerEffects.invulnerableTurns;
  for(const buffName of ["attackBuffTurns", "skillBuffTurns", "manaRegenBuffTurns", "guaranteedHitTurns", "enemyMissBonusTurns", "regenTurns", "finalDamageBuffTurns", "incomingDamageBonusTurns", "arcaneChargeTurns", "percentReductionTurns", "enemyMaxHpBonusTurns", "invulnerableTurns", "forcedBasicTurns", "basicOnlyUntouchableTurns", "burnTurns", "healReductionTurns", "damageDownTurns", "natureCrownedTurns", "natureTrueFormTurns", "natureShieldBonusTurns"]){
    if(playerEffects[buffName] > 0){
      playerEffects[buffName]--;
    }
  }
  if(playerEffects.attackBuffTurns <= 0){ playerEffects.attackBuffAmount = 0; }
  if(playerEffects.attackBuffTurns <= 0){ playerEffects.attackBuffPercent = 0; }
  if(playerEffects.skillBuffTurns <= 0){ playerEffects.skillBuffAmount = 0; }
  if(playerEffects.skillBuffTurns <= 0){ playerEffects.skillBuffPercent = 0; }
  if(playerEffects.manaRegenBuffTurns <= 0){ playerEffects.manaRegenBuffPercent = 0; }
  if(playerEffects.guaranteedHitTurns <= 0){ playerEffects.guaranteedHitTurns = 0; }
  if(playerEffects.enemyMissBonusTurns <= 0){ playerEffects.enemyMissBonus = 0; }
  if(playerEffects.regenTurns <= 0){ playerEffects.regenPercent = 0; }
  if(playerEffects.finalDamageBuffTurns <= 0){ playerEffects.finalDamageBuffPercent = 0; }
  if(playerEffects.incomingDamageBonusTurns <= 0){ playerEffects.incomingDamageBonusPercent = 0; }
  if(playerEffects.percentReductionTurns <= 0){ playerEffects.percentReduction = 0; }
  if(playerEffects.enemyMaxHpBonusTurns <= 0){ playerEffects.enemyMaxHpBonusDamagePercent = 0; }
  if(playerEffects.burnTurns <= 0){ playerEffects.burnDamagePerTurn = 0; }
  if(playerEffects.healReductionTurns <= 0){ playerEffects.healReductionPercent = 0; }
  if(playerEffects.damageDownTurns <= 0){ playerEffects.damageDownPercent = 0; }
  if(playerEffects.natureShieldBonusTurns <= 0){ playerEffects.natureShieldBonusPercent = 0; }
  if(previousInvulnerableTurns > 0 && playerEffects.invulnerableTurns <= 0 && playerEffects.storedFaithDamage > 0 && enemy){
    const explosionDamage = Math.floor(playerEffects.storedFaithDamage * 0.5);
    if(explosionDamage > 0){
      applyDamageToEnemy(explosionDamage);
      log(`Escudo de Fe explodiu e causou ${explosionDamage} de dano.`);
    }
    playerEffects.storedFaithDamage = 0;
  }
  if(playerEffects.arcaneChargeTurns <= 0){
    playerEffects.arcaneCharges = 0;
    playerEffects.arcaneChargeTurns = 0;
  }
}

function getTurnHealing(){
  const passiveRegen = Math.floor(getCurrentCaps().maxHp * (getPassiveModifiers().turnHealPercent || 0));
  const activeRegen = playerEffects.regenTurns > 0 ? Math.floor(getCurrentCaps().maxHp * playerEffects.regenPercent) : 0;
  return passiveRegen + activeRegen;
}

function getPlayerHealReductionPercent(){
  return playerEffects.healReductionTurns > 0 ? (playerEffects.healReductionPercent || 0) : 0;
}

function healPlayer(amount){
  let healBonus = 0;
  if(player.class === "Adepto da Natureza" && getUnlockedPassiveSkills().some(passive => passive.type === "nature_fairy_aura") && (playerEffects.natureCadence || 0) >= 3){
    healBonus += getPlayerSubclassState().tier60 === "fada_monarca" && player.level >= 60 ? 0.1 : 0.05;
  }
  if(player.class === "Adepto da Natureza" && playerEffects.natureCrownedTurns > 0){
    healBonus += 0.2;
  }
  const adjustedAmount = Math.max(0, Math.floor(amount * (1 + healBonus) * (1 - getPlayerHealReductionPercent())));
  const hpBefore = player.hp;
  player.hp = Math.min(getCurrentCaps().maxHp, player.hp + adjustedAmount);
  displayState.playerHp = player.hp;
  const healed = player.hp - hpBefore;
  if(healed > 0){
    grantNatureCadence();
  }
  return healed;
}

function grantNatureCadence(){
  if(player?.class !== "Adepto da Natureza"){ return; }
  if(!getUnlockedPassiveSkills().some(passive => passive.type === "nature_fairy_aura")){ return; }
  playerEffects.natureCadence = Math.min(3, (playerEffects.natureCadence || 0) + 1);
}

function grantPlayerShield(amount, turns = 0){
  let shield = Math.max(0, Math.floor(amount));
  if(shield <= 0){ return 0; }
  let shieldBonus = 0;
  if(player?.class === "Adepto da Natureza" && hasUnlockedPassiveType("nature_forest_oath")){
    shieldBonus += 0.06;
  }
  if(player?.class === "Adepto da Natureza" && getPlayerSubclassState().tier60 === "protetor_da_floresta" && hasUnlockedPassiveType("nature_fairy_aura") && (playerEffects.natureCadence || 0) >= 3){
    shieldBonus += 0.1;
  }
  if(shieldBonus > 0){
    shield += Math.floor(shield * shieldBonus);
  }
  if(playerEffects.natureShieldBonusTurns > 0 && playerEffects.natureShieldBonusPercent > 0){
    shield += Math.floor(shield * playerEffects.natureShieldBonusPercent);
  }
  playerEffects.shieldValue += shield;
  playerEffects.shieldTurns = Math.max(playerEffects.shieldTurns || 0, turns || 0);
  grantNatureCadence();
  return shield;
}

function hasUnlockedPassiveType(type){
  return getUnlockedPassiveSkills().some(passive => passive.type === type);
}

function getNatureDotMultiplier(){
  return player?.class === "Adepto da Natureza" && hasUnlockedPassiveType("nature_dot_mastery") ? 1.3 : 1;
}

function applyNatureMark(turns, damage = 0, enemyDamageDown = 0){
  if(!enemy){ return; }
  enemy.natureMarkTurns = Math.max(enemy.natureMarkTurns || 0, Math.max(0, Math.floor(turns)));
  enemy.natureMarkDamage = Math.max(enemy.natureMarkDamage || 0, Math.max(0, Math.floor(damage)));
  if(enemyDamageDown > 0){
    enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, enemyDamageDown);
    enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, enemy.natureMarkTurns || turns);
  }
}

function applyNatureRoot(turns = 2, armorDownPercent = 0){
  if(!enemy){ return; }
  enemy.rootedTurns = Math.max(enemy.rootedTurns || 0, Math.max(0, Math.floor(turns)));
  if(armorDownPercent > 0){
    enemy.armorDownPercent = Math.max(enemy.armorDownPercent || 0, armorDownPercent);
    enemy.armorDownTurns = Math.max(enemy.armorDownTurns || 0, enemy.rootedTurns || turns);
  }
}

function applyNaturePoison(damage, turns){
  if(!enemy){ return; }
  enemy.naturePoisonDamage = Math.max(enemy.naturePoisonDamage || 0, Math.max(0, Math.floor(damage)));
  enemy.naturePoisonTurns = Math.max(enemy.naturePoisonTurns || 0, Math.max(0, Math.floor(turns)));
}

function applyNatureDecay(damage, turns){
  if(!enemy){ return; }
  enemy.natureDecayDamage = Math.max(enemy.natureDecayDamage || 0, Math.max(0, Math.floor(damage)));
  enemy.natureDecayTurns = Math.max(enemy.natureDecayTurns || 0, Math.max(0, Math.floor(turns)));
}

function enemyHasNatureDot(){
  return !!enemy && (
    (enemy.natureMarkTurns > 0 && enemy.natureMarkDamage > 0) ||
    (enemy.naturePoisonTurns > 0 && enemy.naturePoisonDamage > 0) ||
    (enemy.natureDecayTurns > 0 && enemy.natureDecayDamage > 0)
  );
}

function consumeNatureDotsForDamage(includeAllDots = false){
  if(!enemy){ return 0; }
  let damage = 0;
  if(enemy.natureMarkTurns > 0){
    damage += Math.floor((enemy.natureMarkDamage || 0) * enemy.natureMarkTurns);
    enemy.natureMarkTurns = 0;
    enemy.natureMarkDamage = 0;
  }
  if(includeAllDots && enemy.naturePoisonTurns > 0){
    damage += Math.floor((enemy.naturePoisonDamage || 0) * enemy.naturePoisonTurns);
    enemy.naturePoisonTurns = 0;
    enemy.naturePoisonDamage = 0;
  }
  if(includeAllDots && enemy.natureDecayTurns > 0){
    damage += Math.floor((enemy.natureDecayDamage || 0) * enemy.natureDecayTurns);
    enemy.natureDecayTurns = 0;
    enemy.natureDecayDamage = 0;
  }
  return Math.floor(damage * getNatureDotMultiplier());
}

function applyNatureDotTick(label, damageKey, turnsKey, canTriggerSap = true){
  if(!enemy || !(enemy[turnsKey] > 0) || !(enemy[damageKey] > 0)){ return 0; }
  const tickDamage = Math.floor(enemy[damageKey] * getNatureDotMultiplier());
  enemy.hp -= tickDamage;
  enemy[turnsKey]--;
  log(`${enemy.baseName} sofreu ${tickDamage} de dano por ${label}.`);
  if(canTriggerSap && player.class === "Adepto da Natureza" && hasUnlockedPassiveType("nature_sap")){
    const healed = healPlayer(Math.floor(tickDamage * 0.08));
    if(healed > 0){
      log(`Seiva restaurou ${healed} de vida.`);
    }
  }
  if(enemy[turnsKey] <= 0){
    enemy[damageKey] = 0;
  }
  return tickDamage;
}

async function processNatureDotTicks(){
  if(!enemy){ return false; }
  const decayTriggersSap = getPlayerSubclassState().tier60 === "druida_sombrio" && player.level >= 60;
  const total =
    applyNatureDotTick("Marca Natural", "natureMarkDamage", "natureMarkTurns", true) +
    applyNatureDotTick("Veneno", "naturePoisonDamage", "naturePoisonTurns", true) +
    applyNatureDotTick("Apodrecimento", "natureDecayDamage", "natureDecayTurns", decayTriggersSap);
  if(enemy.natureMarkTurns > 0 && !(enemy.natureMarkDamage > 0)){
    enemy.natureMarkTurns--;
  }
  if(total > 0){
    updateUI();
    await wait(220);
    if(enemy.hp <= 0){
      handleEnemyDefeat();
      return true;
    }
  }
  return false;
}

function applyEndOfTurnRecovery(){
  const healed = healPlayer(getTurnHealing());
  if(healed > 0){
    log(`Voce recuperou ${healed} de vida.`);
  }
  const manaRecovered = regenMana();
  if(manaRecovered > 0){
    log(`Voce recuperou ${manaRecovered} de mana.`);
  }
}

async function handlePlayerTurnStartEffects(){
  if(playerEffects.burnTurns > 0 && playerEffects.burnDamagePerTurn > 0){
    const burnReduction = getPassiveModifiers().burnDamageReductionPercent || 0;
    const burnDamage = Math.max(0, Math.floor(playerEffects.burnDamagePerTurn * (1 - burnReduction)));
    if(burnDamage >= player.hp && getPassiveModifiers().fatalSaveHealPercent > 0 && !playerEffects.accessoryFatalSaveUsed){
      playerEffects.accessoryFatalSaveUsed = true;
      const healAmount = Math.max(1, Math.floor(getCurrentCaps().maxHp * getPassiveModifiers().fatalSaveHealPercent));
      const healed = healPlayer(healAmount);
      log(`O acessorio salvou sua vida da queimadura e restaurou ${healed} de vida.`);
      updateUI();
      await wait(180);
      return false;
    }
    player.hp = Math.max(0, player.hp - burnDamage);
    displayState.playerHp = player.hp;
    log(`Voce sofreu ${burnDamage} de dano por queimadura.`);
    updateUI();
    await wait(180);
    if(player.hp <= 0){
      handleDeath("A queimadura consumiu seu heroi.");
      return true;
    }
  }
  if(playerEffects.skipNextTurn){
    playerEffects.skipNextTurn = false;
    applyTurnStartPassives();
    log("O boss controlou o ritmo da luta e voce perdeu o turno.");
    decayPlayerBuffs();
    applyEndOfTurnRecovery();
    updateUI();
    await wait(320);
    await afterTurn();
    return true;
  }
  return false;
}

function getSkillInfo(){
  const subclassState = getPlayerSubclassState();
  const passiveModifiers = getPassiveModifiers();
  const maxHp = getPreviewStats().maxHp;
  const maxMp = getPreviewStats().maxMp;
  const attack = getActiveAttack();
  const skillPower = getSkillPowerBonus();
  const mageExtraCost = player.class === "Mago" ? passiveModifiers.skillCostIncrease || 0 : 0;
  const warriorExtraCost = player.class === "Guerreiro" ? Math.floor(0.2 * player.level) : 0;
  const clampMageSkillCost = cost => player.class === "Mago" ? Math.min(maxMp, Math.max(0, Math.floor(cost))) : Math.max(0, Math.floor(cost));
  return getUnlockedActiveSkills().map(skill => {
    if(skill.type === "warrior_second_wind"){
      const healFactor = subclassState.tier30 === "cavaleiro" && player.level >= 30 ? 0.15 : 0.1;
      const heal = Math.floor(maxHp * healFactor);
      const damageBuff = subclassState.tier30 === "espadachim" && player.level >= 30 ? 0.2 : 0;
      const cost = 30 + warriorExtraCost;
      return { ...skill, cost, heal, turns: damageBuff ? 3 : 0, damageBuff, description: `${skill.name}: consome ${cost} MP e recupera ${heal} de vida.${damageBuff ? " Tambem aumenta seu dano total em 20% por 3 turnos." : ""}` };
    }
    if(skill.type === "warrior_shove"){
      const isEspadachim = subclassState.tier30 === "espadachim" && player.level >= 30;
      const isCavaleiro = subclassState.tier30 === "cavaleiro" && player.level >= 30;
      const damage = isEspadachim
        ? 20 + Math.floor(0.07 * maxHp) + Math.floor(0.9 * attack) + Math.floor(1.2 * skillPower)
        : 20 + Math.floor((isCavaleiro ? 0.09 : 0.07) * maxHp) + Math.floor((isCavaleiro ? 0.6 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.6 : 0.6) * skillPower);
      const cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost;
      return {
        ...skill,
        name: isEspadachim ? "Investida" : skill.name,
        cost,
        damage,
        enemyAttackDownPercent: isCavaleiro ? 0.3 : 0,
        enemyAttackDownTurns: isCavaleiro ? 3 : 0,
        description: `${isEspadachim ? "Investida" : skill.name}: consome ${cost} MP e causa ${damage} de dano.${isCavaleiro ? " Tambem reduz o ataque do inimigo em 30% por 3 turnos." : ""}`
      };
    }
    if(skill.type === "warrior_stagger"){
      const isBerserker = subclassState.tier60 === "berserker" && player.level >= 60;
      const maxEnemyHp = enemy?.maxHp || 0;
      const damage = isBerserker
        ? 60 + Math.floor(0.07 * maxHp) + Math.floor(0.9 * attack) + Math.floor(0.9 * skillPower) + Math.floor(0.1 * maxEnemyHp)
        : 30 + Math.floor(0.07 * maxHp) + Math.floor(0.5 * attack) + Math.floor(0.5 * skillPower);
      const cost = 40 + warriorExtraCost;
      return { ...skill, cost, damage, skipChance: isBerserker ? 0 : 0.3, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano.${isBerserker ? "" : " Tem 30% de chance de fazer o inimigo perder o proximo turno."}` };
    }
    if(skill.type === "warrior_swift_strikes"){
      const hits = subclassState.tier60 === "ninja" && player.level >= 60 ? 3 : 2;
      const bleedPercent = subclassState.tier60 === "samurai" && player.level >= 60 ? 0.15 : 0;
      const cost = 44 + warriorExtraCost;
      return { ...skill, cost, hits, bleedPercent, description: `${skill.name}: consome ${cost} MP e executa ${hits} ataques basicos.${bleedPercent ? " Tambem aplica sangramento por 3 turnos." : ""}` };
    }
    if(skill.type === "warrior_warcry"){
      if(subclassState.tier60 === "berserker" && player.level >= 60){
        const cost = warriorExtraCost;
        return { ...skill, name: "Ira", cost, hpCostPercent: 0.8, turns: 4, totalDamagePercent: 1.5, description: `Ira: consome ${cost} MP e 80% da sua vida maxima, aumentando o dano total em 150% por 4 turnos.` };
      }
      const attackPercent = subclassState.tier30 === "cavaleiro" && player.level >= 30 ? 0.3 : 0.2;
      const cost = 40 + warriorExtraCost;
      return { ...skill, cost, turns: 5, attackPercent, damageReductionPercent: subclassState.tier60 === "paladino" && player.level >= 60 ? 0.16 : 0, description: `${skill.name}: consome ${cost} MP e aumenta o ataque em ${Math.floor(attackPercent * 100)}% por 5 turnos.${subclassState.tier60 === "paladino" && player.level >= 60 ? " Tambem bloqueia 16% do dano sofrido nesse periodo." : ""}` };
    }
    if(skill.type === "warrior_deep_cut"){
      const damage = 70 + Math.floor(1.1 * attack) + Math.floor(0.8 * skillPower);
      const bleedPercent = subclassState.tier60 === "ninja" && player.level >= 60 ? 0.3 : 0.15;
      const cost = 52 + warriorExtraCost;
      return { ...skill, cost, damage, ignoreArmor: subclassState.tier60 === "samurai" && player.level >= 60, bleedPercent, bleedTurns: 3, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano.${subclassState.tier60 === "samurai" && player.level >= 60 ? " Ignora armadura." : ""} Aplica sangramento equivalente a ${Math.floor(bleedPercent * 100)}% do dano causado por 3 turnos.` };
    }
    if(skill.type === "warrior_judgment"){
      const damage = 80 + Math.floor(0.4 * maxHp) + Math.floor(0.5 * attack) + Math.floor(0.8 * skillPower);
      const cost = 100 + warriorExtraCost;
      return { ...skill, cost, damage, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano.` };
    }
    if(skill.type === "warrior_valhalla"){
      const cost = 100 + warriorExtraCost;
      return { ...skill, cost, turns: 5, incomingDamagePercent: 2, enemyMaxHpBonusDamagePercent: 0.15, description: `${skill.name}: consome ${cost} MP, faz voce receber 200% de dano adicional e adiciona 15% da vida maxima do inimigo em qualquer dano causado por 5 turnos.` };
    }
    if(skill.type === "warrior_armor_piercer"){
      const damage = 80 + Math.floor(1.1 * attack) + Math.floor(1.1 * skillPower);
      const shieldMultiplier = enemy?.shieldValue > 0 ? 3 : 1;
      const cost = 82 + warriorExtraCost;
      return { ...skill, cost, damage: damage * shieldMultiplier, description: `${skill.name}: consome ${cost} MP e causa ${damage * shieldMultiplier} de dano.${shieldMultiplier > 1 ? " O alvo tinha escudo ativo, entao o dano foi triplicado." : ""}` };
    }
    if(skill.type === "warrior_smoke_bomb"){
      const cost = 40 + warriorExtraCost;
      return { ...skill, cost, turns: 1, nextDamageBonus: 0.3, description: `${skill.name}: consome ${cost} MP, garante esquiva no proximo ataque do inimigo e fortalece em 30% o seu proximo dano.` };
    }
    if(skill.type === "warrior_faith_shield"){
      const cost = Math.floor(maxMp * 0.7) + warriorExtraCost;
      return { ...skill, cost, turns: 3, description: `${skill.name}: consome ${cost} MP e por 3 turnos voce nao recebe dano. Depois, explode causando 50% do dano que teria sido absorvido ao inimigo.` };
    }
    if(skill.type === "warrior_unstoppable"){
      const cost = 100 + warriorExtraCost;
      return { ...skill, cost, hpCostPercent: 0.3, turns: 4, attackBuffAmount: 50, description: `${skill.name}: consome ${cost} MP e 30% da sua vida maxima, impede pulos de turno e aumenta o ataque basico em 50 por 4 turnos.` };
    }
    if(skill.type === "warrior_ultrasonic_cuts"){
      const cost = 240 + warriorExtraCost;
      return { ...skill, cost, turns: 3, description: `${skill.name}: consome ${cost} MP. Por 3 turnos, voce so pode usar o ataque basico e nao pode ser atingido.` };
    }
    if(skill.type === "warrior_giant_slayer"){
      const damage = enemy ? Math.floor(enemy.hp * 0.4) : 0;
      const cost = 200 + warriorExtraCost;
      return { ...skill, cost, damage, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano com base na vida atual do inimigo.` };
    }
    if(skill.type === "mage_mana_burst"){
      const skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6;
      const manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.14 : 0.1;
      const manaBurstCost = clampMageSkillCost(20 + Math.floor(0.2 * player.level) + mageExtraCost);
      const enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp || 0) * 0.5) : 0;
      const damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + (enemyManaBurnAmount * 4) + getUniversalDamageFlatBonus();
      return { ...skill, cost: manaBurstCost, damage, enemyManaBurnAmount, description: `${skill.name}: consome ${manaBurstCost} MP e causa ${damage} de dano.${enemyManaBurnAmount > 0 ? ` Tambem consome ${enemyManaBurnAmount} de mana do alvo e converte isso em dano extra.` : ""}` };
    }
    if(skill.type === "mage_fireball"){
      const isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60;
      const isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60;
      const currentHpBonus = isIncendiario && enemy ? Math.floor(enemy.hp * 0.05) : 0;
      const damage = 50 + Math.floor(1.3 * skillPower) + currentHpBonus + getUniversalDamageFlatBonus();
      const burnPercent = getUnlockedPassiveSkills().some(passive => passive.type === "mage_hellfire") ? 0.05 : 0.03;
      const burnDamage = enemy ? Math.max(1, Math.floor(enemy.maxHp * burnPercent)) : 0;
      return {
        ...skill,
        name: isFrigido ? "Bola de Neve" : skill.name,
        cost: clampMageSkillCost(40 + mageExtraCost),
        damage,
        burnDamage,
        burnTurns: 3,
        healReductionPercent: 0.3,
        chillTurns: isFrigido ? 3 : 0,
        chillAttackDownPercent: isFrigido ? 0.3 : 0,
        appliesBurn: !isFrigido,
        appliesChill: isFrigido,
        description: isFrigido
          ? `${isFrigido ? "Bola de Neve" : skill.name}: consome ${clampMageSkillCost(40 + mageExtraCost)} MP e causa ${damage} de dano. Aplica resfriamento por 3 turnos, reduzindo em 30% o ataque do inimigo.`
          : `${skill.name}: consome ${clampMageSkillCost(40 + mageExtraCost)} MP e causa ${damage} de dano de fogo. A queimadura causa ${burnDamage} por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%.`
      };
    }
    if(skill.type === "mage_concentration"){
      const cost = clampMageSkillCost(200 + mageExtraCost);
      return { ...skill, cost, turns: 4, percent: 0.2, manaRegenPercent: 0.1, description: `${skill.name}: consome ${cost} MP, aumenta o dano total em 20% e a regeneracao de mana em 10% por 4 turnos.` };
    }
    if(skill.type === "mage_mana_shield"){
      const isArquimago = subclassState.tier60 === "arquimago" && player.level >= 60;
      const factor = isArquimago ? 0.4 : 0.3;
      const costPercent = isArquimago ? 0.12 : 0.15;
      const cost = clampMageSkillCost(Math.floor(maxMp * costPercent) + mageExtraCost);
      const shield = 40 + Math.floor(factor * maxMp);
      return { ...skill, cost, shield, turns: 2, description: `${skill.name}: consome ${cost} MP e concede ${shield} de escudo por 2 turnos.` };
    }
    if(skill.type === "mage_freeze"){
      const isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60;
      const isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60;
      const damage = 60 + Math.floor(0.9 * skillPower) + getUniversalDamageFlatBonus();
      const cost = clampMageSkillCost(40 + Math.floor(0.2 * player.level) + mageExtraCost);
      const burnPercent = getUnlockedPassiveSkills().some(passive => passive.type === "mage_hellfire") ? 0.05 : 0.03;
      const burnDamage = enemy ? Math.max(1, Math.floor(enemy.maxHp * burnPercent)) : 0;
      return {
        ...skill,
        name: isIncendiario ? "Bafo de Fogo" : skill.name,
        cost,
        damage,
        freezeChance: isIncendiario ? 0 : 0.3,
        burnDamage,
        burnTurns: isIncendiario ? 6 : 0,
        chillTurns: isFrigido ? 2 : 0,
        chillAttackDownPercent: isFrigido ? 0.3 : 0,
        freezeVulnerabilityPercent: isFrigido ? 0.5 : 0,
        description: isIncendiario
          ? `Bafo de Fogo: consome ${cost} MP, causa ${damage} de dano e aplica queimadura por 6 turnos.`
          : `${skill.name}: consome ${cost} MP, causa ${damage} de dano e tem 30% de chance de impedir o proximo ataque do inimigo.${isFrigido ? " Se nao impedir o turno, aplica resfriamento por 2 turnos ou Congelamento se o alvo ja estiver resfriado." : ""}`
      };
    }
    if(skill.type === "mage_discharge"){
      const charges = getArcaneChargeInfo().charges;
      const damage = subclassState.tier60 === "arquimago" && player.level >= 60
        ? Math.floor((player.level + (0.007 * maxMp)) * charges) + getUniversalDamageFlatBonus()
        : 60 + (player.level * charges) + Math.floor(0.1 * skillPower) + Math.floor(0.04 * maxMp) + getUniversalDamageFlatBonus();
      const cost = clampMageSkillCost((10 * charges) + mageExtraCost);
      return { ...skill, cost, damage, charges, description: `${skill.name}: consome ${cost} MP, gasta todas as cargas arcanas e causa ${damage} de dano.` };
    }
    if(skill.type === "mage_sacred_phoenix"){
      const cost = clampMageSkillCost(200 + skillPower + mageExtraCost);
      const damage = 100 + Math.floor(1.8 * skillPower) + getUniversalDamageFlatBonus();
      const burnPercent = getUnlockedPassiveSkills().some(passive => passive.type === "mage_hellfire") ? 0.05 : 0.03;
      const burnDamage = enemy ? Math.max(1, Math.floor(enemy.maxHp * burnPercent)) : 0;
      return { ...skill, cost, damage, burnDamage, burnTurns: 1, healReductionPercent: 0.3, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano, aplicando queimadura por 1 turno.` };
    }
    if(skill.type === "mage_blizzard"){
      const cost = clampMageSkillCost(120 + mageExtraCost);
      return { ...skill, cost, turns: 6, enemySkipChance: 0.15, description: `${skill.name}: consome ${cost} MP e faz o inimigo ter 15% de chance de perder o turno por 6 turnos.` };
    }
    if(skill.type === "mage_corruption"){
      const currentManaCost = clampMageSkillCost(Math.floor(player.mp * 0.3));
      const damage = 100 + Math.floor(1.0 * skillPower) + Math.floor(0.3 * maxMp) + getUniversalDamageFlatBonus();
      return { ...skill, cost: currentManaCost, damage, armorBreakPercent: 1, armorBreakTurns: 5, noShieldTurns: 5, description: `${skill.name}: consome ${currentManaCost} MP, causa ${damage} de dano, remove toda a armadura do inimigo e impede escudos por 5 turnos.` };
    }
    if(skill.type === "mage_overcharge"){
      const charges = getArcaneChargeInfo().charges;
      const damage = 200 + maxMp + (player.level * charges) + getUniversalDamageFlatBonus();
      const cost = clampMageSkillCost(Math.floor(maxMp * 0.95) + mageExtraCost);
      return { ...skill, cost, damage, charges, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano usando sua mana maxima e as cargas arcanas.` };
    }
    if(skill.type === "mage_demon_form"){
      const cost = clampMageSkillCost(Math.floor(player.mp * 0.3));
      return { ...skill, cost, turns: 3, damagePercent: 2, vulnerabilityPercent: 0.3, description: `${skill.name}: consome ${cost} MP, concede 200% de dano total adicional por 3 turnos e faz voce receber 30% de dano adicional pelo mesmo tempo.` };
    }
    if(skill.type === "mage_explode"){
      const damage = 200 + Math.floor(1.3 * skillPower) + Math.floor(0.5 * maxHp) + Math.floor(0.5 * (enemy?.maxHp || 0)) + getUniversalDamageFlatBonus();
      const cost = clampMageSkillCost(500 + mageExtraCost);
      return { ...skill, cost, hpCostPercent: 0.5, damage, description: `${skill.name}: consome ${cost} MP, 50% da sua vida maxima e causa ${damage} de dano.` };
    }
    if(skill.type === "mage_avalanche"){
      const damage = 200 + Math.floor(1.3 * skillPower) + Math.floor(0.5 * (enemy?.maxHp || 0)) + getUniversalDamageFlatBonus();
      const cost = clampMageSkillCost(400 + mageExtraCost);
      return { ...skill, cost, damage, chillTurns: 4, chillAttackDownPercent: 0.3, description: `${skill.name}: consome ${cost} MP, causa ${damage} de dano e aplica resfriamento por 4 turnos.` };
    }
    if(skill.type === "archer_focus"){
      const cost = 30 + player.level;
      const attackBonus = 5 + player.level;
      const headshotBonus = subclassState.tier30 === "atirador" ? 0.1 : 0;
      const barrageExtraShotChance = subclassState.tier30 === "cacador" ? 0.1 : 0;
      return {
        ...skill,
        cost,
        turns: 5,
        attackBonus,
        description: `${skill.name}: consome ${cost} MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em ${attackBonus}${headshotBonus ? ", alem de fortalecer o Headshot em 10% e dar +10% de chance de critico" : ""}${barrageExtraShotChance ? ", alem de conceder 10% de chance de um disparo extra na Rajada de Flechas" : ""}.`
      };
    }
    if(skill.type === "archer_headshot"){
      const focusActive = playerEffects.guaranteedHitTurns > 0;
      const focusDamageBonus = subclassState.tier30 === "atirador" && focusActive ? 0.1 : 0;
      const baseDamage = subclassState.tier60 === "atirador_arcano" && player.level >= 60
        ? 60 + Math.floor(1.1 * skillPower) + Math.floor(0.6 * maxMp)
        : 30 + Math.floor(0.7 * attack) + Math.floor(0.9 * skillPower);
      const damage = Math.floor(baseDamage * (1 + focusDamageBonus));
      const cost = 60 + Math.floor(0.3 * player.level);
      const critChance = (subclassState.tier60 === "sniper" && player.level >= 60 ? 0.7 : 0.1) + (subclassState.tier30 === "atirador" && focusActive ? 0.1 : 0);
      const marksOnNonCrit = subclassState.tier60 === "atirador_arcano" && player.level >= 60;
      const critProfile = getArcherCriticalProfile(critChance);
      const overflowText = critProfile.totalChance > 1 ? ` O excedente acima de 100% de chance de critico vira dano critico adicional, deixando o critico em ${Math.floor(critProfile.critDamageBonus * 100)}% de dano extra.` : "";
      return { ...skill, cost, damage, critChance, marksOnNonCrit, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano, com ${Math.floor(critProfile.totalChance * 100)}% de chance total de critico.${marksOnNonCrit ? " Se nao critar, marca o alvo para receber 15% a mais no proximo golpe." : ""}${overflowText}` };
    }
    if(skill.type === "archer_camouflage"){
      const cost = 40 + Math.floor(0.5 * player.level);
      const dodge = 0.2 + (subclassState.tier30 === "cacador" ? 0.05 : 0);
      const nextDamageBonus = subclassState.tier30 === "atirador" ? 0.3 : 0;
      return { ...skill, cost, turns: 4, dodge, nextDamageBonus, description: `${skill.name}: consome ${cost} MP e concede ${Math.floor(dodge * 100)}% de esquiva adicional por 4 turnos${nextDamageBonus ? ", deixando o proximo dano causado 30% mais forte" : ""}.` };
    }
    if(skill.type === "archer_barrage"){
      const extraShotChance = playerEffects.guaranteedHitTurns > 0 ? 0.1 : 0;
      const hits = subclassState.tier60 === "guarda_florestal" && player.level >= 60 ? 3 : 2;
      const bonusText = playerEffects.nextBarrageDamageBonusPercent > 0 ? ` A proxima rajada esta fortalecida em ${Math.floor(playerEffects.nextBarrageDamageBonusPercent * 100)}%.` : "";
      return { ...skill, cost: 60, hits, extraShotChance, description: `${skill.name}: consome 60 MP e realiza ${hits} ataques basicos no mesmo turno${extraShotChance ? ", com 10% de chance de um disparo adicional por causa do Mirar" : ""}.${bonusText}` };
    }
    if(skill.type === "archer_piercing_shot"){
      const attackFactor = subclassState.tier60 === "sniper" && player.level >= 60 ? 1.2 : 0.8;
      const skillFactor = subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 1.2 : 0.8;
      const damage = 50 + Math.floor(attackFactor * attack) + Math.floor(skillFactor * skillPower);
      const shattersShield = subclassState.tier60 === "sniper" && player.level >= 60;
      return { ...skill, cost: 80, damage, ignoreArmor: true, ignoreShield: true, shattersShield, description: `${skill.name}: consome 80 MP e causa ${damage} de dano, ignorando armadura e escudo do inimigo.${shattersShield ? " Alem disso, remove totalmente o escudo do alvo." : ""}` };
    }
    if(skill.type === "archer_trap"){
      const bonusCurrentHpDamage = subclassState.tier60 === "espreitador" && player.level >= 60 && enemy ? Math.floor(enemy.hp * 0.08) : 0;
      const damage = 30 + Math.floor(1.1 * skillPower) + bonusCurrentHpDamage;
      const nextBarrageBonus = subclassState.tier60 === "guarda_florestal" && player.level >= 60 ? 0.15 : 0;
      return { ...skill, cost: 80, damage, skipChance: 0.3, nextBarrageBonus, description: `${skill.name}: consome 80 MP, causa ${damage} de dano e tem 30% de chance de fazer o inimigo perder o proximo turno.${bonusCurrentHpDamage ? " O dano inclui 8% da vida atual do inimigo." : ""}${nextBarrageBonus ? " Se prender o alvo, sua proxima Rajada de Flechas causara 15% de dano adicional." : ""}` };
    }
    if(skill.type === "archer_arcane_shot"){
      const missingMana = Math.max(0, maxMp - player.mp);
      const damage = 60 + skillPower + Math.floor(0.75 * missingMana);
      return { ...skill, cost: 100, damage, description: `${skill.name}: consome 100 MP e causa ${damage} de dano arcano. O dano aumenta conforme sua mana atual estiver abaixo da mana maxima.` };
    }
    if(skill.type === "archer_execute"){
      const damage = 60 + Math.floor(1.1 * attack) + Math.floor(0.9 * skillPower);
      return { ...skill, cost: 120, damage, executeThreshold: 0.4, executeMultiplier: 3, description: `${skill.name}: consome 120 MP e causa ${damage} de dano. Se o inimigo estiver abaixo de 40% da vida, o dano e triplicado.` };
    }
    if(skill.type === "archer_surprise"){
      const fromCamouflage = playerEffects.lastActionType === "archer_camouflage";
      const damage = fromCamouflage
        ? 80 + Math.floor(1.2 * attack) + Math.floor(0.9 * skillPower)
        : 60 + Math.floor(0.9 * attack) + Math.floor(0.7 * skillPower);
      return { ...skill, cost: 80, damage, empoweredFromCamouflage: fromCamouflage, description: `${skill.name}: consome 80 MP e causa ${damage} de dano.${fromCamouflage ? " Como sua ultima acao foi Camuflagem, esta versao saiu fortalecida." : ""}` };
    }
    if(skill.type === "archer_tranquilizer"){
      const damage = 60 + Math.floor(0.8 * attack) + Math.floor(0.6 * skillPower);
      return { ...skill, cost: 80, damage, enemyAttackDownPercent: 0.3, enemyAttackDownTurns: 3, description: `${skill.name}: consome 80 MP, causa ${damage} de dano e reduz em 30% o dano do inimigo por 3 turnos.` };
    }
    if(skill.type === "archer_overcharge"){
      const currentMana = player.mp;
      const damage = 80 + Math.floor(1.6 * skillPower) + Math.floor(0.6 * currentMana);
      return { ...skill, cost: currentMana, damage, description: `${skill.name}: gasta toda a mana atual (${currentMana}) e causa ${damage} de dano.` };
    }
    if(skill.type === "archer_weak_spot"){
      const enemyCurrentHp = enemy ? enemy.hp : 0;
      const damage = 100 + Math.floor(0.4 * attack) + Math.floor(0.3 * skillPower) + Math.floor(0.25 * enemyCurrentHp);
      return { ...skill, cost: 120, damage, description: `${skill.name}: consome 120 MP e causa ${damage} de dano, explorando a vida atual do alvo.` };
    }
    if(skill.type === "archer_aim_leg"){
      const damage = 80 + Math.floor(0.6 * skillPower) + Math.floor(0.5 * attack);
      return { ...skill, cost: 100, damage, enemyAttackDownPercent: 0.15, enemyAttackDownTurns: 3, enemyArmorDownPercent: 0.5, enemyArmorDownTurns: 3, skipChance: 0.1, description: `${skill.name}: consome 100 MP, causa ${damage} de dano, reduz em 15% o dano do inimigo, corta 50% da armadura por 3 turnos e tem 10% de chance de fazer o alvo perder o proximo turno.` };
    }
    if(skill.type === "archer_cutting_shot"){
      const totalDamage = 120 + Math.floor(1.2 * attack) + Math.floor(1.2 * skillPower);
      const dotDamage = Math.floor(totalDamage / 3);
      return { ...skill, cost: 80, damage: 0, totalDamage, dotDamage, dotTurns: 3, description: `${skill.name}: consome 80 MP e faz o alvo sofrer ${dotDamage} de dano por rodada durante 3 rodadas (${dotDamage * 3} no total).` };
    }
    if(skill.type === "nature_living_seed"){
      const markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3;
      const markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0;
      const enemyDamageDown = subclassState.tier30 === "espirito_da_floresta" && player.level >= 30 ? 0.08 * markTurns : 0;
      const cost = 20 + Math.floor(0.5 * player.level);
      const damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower);
      return { ...skill, cost, damage, markTurns, markDamage, enemyDamageDown, description: `${skill.name}: consome ${cost} MP, causa ${damage} de dano e marca o alvo por ${markTurns} turnos.${markDamage ? ` A marca tambem causa ${markDamage} por turno.` : ""}${enemyDamageDown ? ` A marca reduz o dano do inimigo em ${Math.floor(enemyDamageDown * 100)}%.` : ""}` };
    }
    if(skill.type === "nature_roots"){
      const rootChance = subclassState.tier30 === "druida" && player.level >= 30 ? 0.6 : 0.45;
      const armorDownPercent = subclassState.tier30 === "espirito_da_floresta" && player.level >= 30 ? 0.5 : 0;
      const cost = 30 + Math.floor(0.6 * player.level);
      const damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower);
      return { ...skill, cost, damage, rootChance, armorDownPercent, description: `${skill.name}: consome ${cost} MP, causa ${damage} de dano e tem ${Math.floor(rootChance * 100)}% de chance de enraizar.${armorDownPercent ? " Se enraizar, tambem reduz 50% da armadura." : ""}` };
    }
    if(skill.type === "nature_swamp_flower"){
      const isAvatar = subclassState.tier60 === "avatar_da_natureza" && player.level >= 60;
      const poisonTurns = isAvatar ? 3 : subclassState.tier60 === "druida_sombrio" && player.level >= 60 ? 7 : 4;
      const cost = 20 + Math.floor(0.4 * player.level);
      const damage = 10 + Math.floor((isAvatar ? 1.3 : 0.8) * attack) + Math.floor(0.8 * skillPower);
      return { ...skill, cost, damage, poisonTurns, poisonDamage: Math.floor(0.4 * skillPower), description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano. Se o alvo estiver enraizado, aplica veneno de ${Math.floor(0.4 * skillPower)} por ${poisonTurns} turnos.` };
    }
    if(skill.type === "nature_breeze_charm"){
      const isMonarch = subclassState.tier60 === "fada_monarca" && player.level >= 60;
      const skipChance = (isMonarch ? 0.3 : 0.2) + (playerEffects.natureCrownedTurns > 0 ? 0.2 : 0);
      const rootChance = (isMonarch ? 0.3 : 0.2) + (playerEffects.natureCrownedTurns > 0 ? 0.2 : 0);
      const cost = 30 + Math.floor(0.3 * player.level);
      const damage = 20 + Math.floor(1.1 * skillPower);
      return { ...skill, cost, damage, skipChance, rootChance, shieldFromDamagePercent: subclassState.tier60 === "protetor_da_floresta" && player.level >= 60 ? 1 : 0, description: `${skill.name}: consome ${cost} MP, causa ${damage} de dano e tem ${Math.floor(skipChance * 100)}% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar.` };
    }
    if(skill.type === "nature_harvest"){
      const cost = 40 + Math.floor(0.3 * player.level);
      const damage = 30 + Math.floor(1.2 * attack);
      return { ...skill, cost, damage, description: `${skill.name}: consome ${cost} MP, causa ${damage} de dano e consome efeitos naturais ativos para explodir o dano restante.` };
    }
    if(skill.type === "nature_ancestral_song"){
      const rooted = enemy?.rootedTurns > 0;
      const cost = 40 + Math.floor(0.4 * player.level);
      const heal = Math.floor((rooted ? 2 : 1.4) * skillPower);
      const shield = subclassState.tier60 === "protetor_da_floresta" && player.level >= 60 ? Math.floor((rooted ? 2.2 : 1.6) * skillPower) : 0;
      return { ...skill, cost, heal, shield, enemyDamageDownPercent: subclassState.tier60 === "fada_monarca" && player.level >= 60 ? 0.12 : 0, description: `${skill.name}: consome ${cost} MP e cura ${heal}.${shield ? ` Tambem concede ${shield} de escudo.` : ""}` };
    }
    if(skill.type === "nature_decay"){
      const cost = 40 + Math.floor(0.5 * player.level);
      const damage = 50 + Math.floor(1.2 * attack);
      return { ...skill, cost, damage, decayTurns: 5, decayDamage: enemy ? Math.max(1, Math.floor(enemy.maxHp * 0.015)) : 0, description: `${skill.name}: consome ${cost} MP, causa ${damage} de dano e aplica apodrecimento por 5 turnos.` };
    }
    if(skill.type === "nature_true_form"){
      return { ...skill, cost: maxMp, turns: 5, attackPercent: 0.26, damageReductionPercent: 0.18, description: `${skill.name}: consome toda a mana maxima, aumenta ataque em 26%, reduz dano sofrido em 18% e fortalece ataques basicos por 5 turnos.` };
    }
    if(skill.type === "nature_queen_decree"){
      const factor = (playerEffects.natureCadence || 0) >= 3 ? 2.9 : 2;
      const damage = Math.floor(factor * skillPower);
      return { ...skill, cost: 90, damage, description: `${skill.name}: consome 90 MP e causa ${damage} de dano. Com 3 Cadencias, o fator sobe para 2.9.` };
    }
    if(skill.type === "nature_vine_cocoon"){
      const cost = 60 + Math.floor(0.6 * player.level);
      const shield = Math.floor(1.4 * attack + 1.4 * skillPower);
      return { ...skill, cost, shield, description: `${skill.name}: consome ${cost} MP e concede ${shield} de escudo.` };
    }
    if(skill.type === "nature_swamp_collapse"){
      const cost = Math.floor(maxMp * 0.85);
      const damage = Math.floor(1.8 * attack + 1.8 * skillPower);
      return { ...skill, cost, damage, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano. Se o alvo nao tiver DOT natural, aplica marca, veneno e apodrecimento por 4 turnos.` };
    }
    if(skill.type === "nature_crush_invader"){
      const cost = 300 + Math.floor(0.8 * player.level);
      let damage = Math.floor(2 * attack);
      if(enemy?.rootedTurns > 0){ damage += Math.floor(0.6 * attack); }
      if(playerEffects.natureTrueFormTurns > 0){ damage += Math.floor(attack); }
      return { ...skill, cost, damage, description: `${skill.name}: consome ${cost} MP e causa ${damage} de dano, com bonus contra alvo enraizado e na Forma Verdadeira.` };
    }
    if(skill.type === "nature_crown"){
      const cost = 300 + Math.floor(2 * player.level);
      return { ...skill, cost, turns: 5, skillPercent: 0.3, healPercent: 0.2, chanceBonus: 0.2, description: `${skill.name}: consome ${cost} MP e fica coroada por 5 turnos, com +30% poder de habilidade, +20% curas e +20% nas chances de controle.` };
    }
    if(skill.type === "nature_throw_thorns"){
      const cost = Math.floor(4 * player.level);
      const shield = playerEffects.shieldValue || 0;
      const damage = Math.floor(shield * 2);
      return { ...skill, cost, hpCostPercent: 0.2, damage, consumeShield: true, ignoreArmor: true, ignoreShield: true, description: `${skill.name}: consome ${cost} MP, 20% da vida maxima e todo seu escudo atual para causar ${damage} de dano ignorando armadura e escudo.` };
    }
    return { ...skill, cost: 0, description: skill.name };
  });
}

function getCampEntries(){
  const classTrees = getClassTrees();
  const unlockedActiveNames = new Set(getUnlockedActiveSkills().map(skill => skill.name));
  const activeDetails = new Map(getSkillInfo().map(skill => [skill.name, skill]));
  const activeEntries = (classTrees.activeSkills || []).map(skill => {
    const activeDetail = activeDetails.get(skill.name);
    const unlocked = unlockedActiveNames.has(skill.name);
    return {
      name: skill.name,
      level: skill.level,
      unlocked,
      isNext: !unlocked && skill.level === Math.min(...(classTrees.activeSkills || []).filter(entry => player.level < entry.level).map(entry => entry.level), Infinity),
      status: unlocked ? "Disponivel" : `Desbloqueia no nivel ${skill.level}`,
      statusClass: unlocked ? "status-on" : "status-off",
      description: activeDetail?.description || getActiveSkillPreviewDescription(skill)
    };
  });
  const passiveEntries = (classTrees.passiveSkills || []).map(skill => {
    const unlocked = player.level >= skill.level;
    return {
      name: skill.name,
      level: skill.level,
      unlocked,
      isNext: !unlocked && skill.level === Math.min(...(classTrees.passiveSkills || []).filter(entry => player.level < entry.level).map(entry => entry.level), Infinity),
      status: unlocked ? "Sempre ativa" : `Desbloqueia no nivel ${skill.level}`,
      statusClass: unlocked ? "status-on" : "status-off",
      description: unlocked ? getPassiveStatusDescription(skill) : getPassivePreviewDescription(skill)
    };
  });
  return { activeEntries, passiveEntries };
}

function getActiveSkillPreviewDescription(skill){
  const previews = {
    warrior_second_wind: "Recupera vida com base na vida maxima e, em alguns ramos, tambem fortalece seu proximo ciclo ofensivo.",
    warrior_shove: "Golpe de impacto baseado na sua vida maxima, com variacoes ofensivas conforme a rota escolhida.",
    warrior_stagger: "Ataque pesado de controle que pode travar o ritmo do inimigo em rotas defensivas.",
    warrior_swift_strikes: "Sequencia de ataques basicos; em rotas avancadas pode aplicar sangramento ou ganhar golpes extras.",
    warrior_warcry: "Buff ofensivo ou de furia, dependendo da subclasse escolhida.",
    warrior_deep_cut: "Corte forte com dano direto e efeito continuo no alvo.",
    warrior_judgement: "Golpe de alto peso baseado em vida, ataque e dano de habilidade.",
    warrior_valhalla: "Estado de furia extrema que troca seguranca por dano esmagador.",
    warrior_armor_pierce: "Ataque especializado em atravessar escudos, armadura ou resistencias.",
    warrior_smoke_bomb: "Ferramenta de evasao ofensiva para preparar o proximo golpe.",
    warrior_faith_shield: "Tecnica suprema de defesa total, seguida de explosao do dano armazenado.",
    warrior_unstoppable: "Postura final de agressao contínua para dominar turnos decisivos.",
    warrior_ultrasonic_cuts: "Entrar em modo de cortes puros, focando apenas no ataque basico por alguns turnos.",
    warrior_giant_slayer: "Finalizador brutal contra alvos com muita vida atual.",
    mage_mana_burst: "Explosao arcana que mistura dano de habilidade com mana maxima e ainda drena mana do alvo para ampliar o impacto.",
    mage_fireball: "Magia elemental que aplica efeito persistente no inimigo, mudando de fogo para gelo conforme a rota.",
    mage_freeze: "Feitico de controle ou dano elemental que evolui junto da subclasse.",
    mage_sacred_phoenix: "Invocacao incendiaria de alto custo e alto impacto.",
    mage_blizzard: "Pressao de controle por varios turnos em volta do inimigo.",
    mage_discharge: "Consome cargas arcanas para transformar preparacao em burst imediato.",
    mage_mana_shield: "Converte mana em escudo e sustentacao defensiva.",
    mage_concentration: "Buff arcano de dano total e regeneracao de mana.",
    mage_corruption: "Golpe ofensivo que destroi armadura e bloqueia escudos do alvo.",
    mage_overcharge: "Canaliza quase toda a mana em uma descarga suprema.",
    mage_demon_form: "Modo de risco extremo: muito dano extra, mas tambem muita vulnerabilidade.",
    mage_explode: "Feitico sacrificial devastador que consome mana e vida.",
    mage_avalanche: "Magia de avalanche com dano pesado e enfraquecimento prolongado.",
    archer_focus: "Buff de precisão e dano que prepara seus tiros mais importantes por varios turnos.",
    archer_camouflage: "Ferramenta de esquiva e preparação ofensiva, excelente para jogadas taticas.",
    archer_headshot: "Disparo tecnico de alto dano, com chance de critico ou marcacao.",
    archer_barrage: "Sequencia de disparos basicos, com evolucoes diferentes para cada rota do cacador.",
    archer_piercing_shot: "Tiro direto para atravessar escudo e armadura.",
    archer_trap: "Ferramenta de controle que pode travar o turno do inimigo e criar vantagem.",
    archer_arcane_shot: "Emergencia Arcana transforma mana faltante em dano, perfeita quando o Atirador Arcano esta pressionado.",
    archer_execute: "Finalizador de alvo unico que escala muito contra inimigos enfraquecidos.",
    archer_surprise: "Ataque oportunista que cresce bastante se voce veio de camuflagem.",
    archer_tranquilizer: "Tiro utilitario que causa dano e reduz o potencial ofensivo do inimigo.",
    archer_overcharge: "Explosao arcana de custo alto para fechar lutas rapidamente.",
    archer_weak_spot: "Ataque preciso que explora a vida atual do inimigo para causar burst.",
    archer_aim_leg: "Controle fino que reduz ataque, corta armadura e ainda pode travar o alvo.",
    archer_cutting_shot: "Disparo em dano ao longo do tempo, excelente para lutas compridas.",
    nature_living_seed: "Ataque natural que marca o alvo e prepara bonus de dano, mana e efeitos de rota.",
    nature_roots: "Controle de raiz com dano hibrido; em algumas rotas tambem quebra armadura.",
    nature_swamp_flower: "Golpe venenoso que fica mais perigoso contra alvo enraizado.",
    nature_breeze_charm: "Magia feerica de dano e controle, com chance de pular turno e enraizar alvo marcado.",
    nature_harvest: "Consome efeitos naturais no inimigo para concentrar o dano restante.",
    nature_ancestral_song: "Cura principal do Espirito da Floresta, melhorada contra alvos enraizados.",
    nature_decay: "Aplica apodrecimento, um dano ao longo do tempo baseado na vida maxima do inimigo.",
    nature_true_form: "Forma de combate que troca toda a mana por ataque, reducao de dano e ataques basicos fortalecidos.",
    nature_queen_decree: "Dano de habilidade puro que cresce muito quando a Fada esta com Cadencia cheia.",
    nature_vine_cocoon: "Escudo direto baseado em ataque e poder de habilidade.",
    nature_swamp_collapse: "Explode o alvo e, se ele estiver limpo, aplica varios efeitos naturais de uma vez.",
    nature_crush_invader: "Ataque pesado do Avatar que cresce contra alvo enraizado e durante a Forma Verdadeira.",
    nature_crown: "Buff supremo da Fada Monarca para poder de habilidade, cura e controle.",
    nature_throw_thorns: "Converte todo o escudo atual em dano que atravessa defesas."
  };
  return previews[skill.type] || "Habilidade importante da sua progressao. Quando desbloqueada, a descricao completa aparece aqui com valores atualizados.";
}

function getPassivePreviewDescription(skill){
  const previews = {
    warrior_flat_reduction: "Passiva defensiva que reduz dano recebido e, em algumas rotas, tambem melhora sua sustentacao por turno.",
    warrior_enemy_miss: "Passiva voltada para evasao e ritmo ofensivo.",
    warrior_reflect: "Passiva reativa: pode devolver dano ou responder com contra-ataques.",
    warrior_counter_on_dodge: "Passiva de resposta ao esquivar, melhorando sua pressao sem gastar turno.",
    warrior_aura_shield: "Passiva de escudo constante, ideal para lutas longas.",
    warrior_last_stand: "Passiva de sobrevivencia extrema para aguentar um golpe fatal.",
    warrior_first_strike_echo: "Passiva que fortalece o primeiro ataque do combate.",
    warrior_execute_bonus: "Passiva ofensiva para encerrar inimigos ja enfraquecidos.",
    mage_last_resort: "Passiva defensiva que troca mana por sobrevivencia em golpes fatais.",
    mage_mana_to_life: "Passiva de conversao entre mana e vida maxima.",
    mage_overflowing: "Passiva que transforma mana em dano, mas tambem aumenta o custo das habilidades.",
    mage_hellfire: "Passiva que deixa queimaduras muito mais perigosas.",
    mage_frostburn: "Passiva hibrida que mistura frio e fogo no mesmo controle.",
    mage_charge_damage: "Passiva que recompensa manter cargas arcanas ativas.",
    mage_glass_cannon: "Passiva de burst inicial extremo com risco elevado.",
    archer_dodge_level_scaling: "Passiva base de esquiva do arqueiro, escalando com o nivel.",
    archer_dodge_double_bonus: "Passiva mista de esquiva com chance extra de critico.",
    archer_dodge_coin_bonus: "Passiva de esquiva com foco economico.",
    archer_attack_level_bonus: "Passiva central da rota ofensiva, aumentando ataque base e dano de habilidade por nivel.",
    archer_dodge_damage_buff: "Passiva reativa que transforma esquiva em vantagem ofensiva ou sustentacao.",
    archer_mana_to_skill_bonus: "Passiva que converte mana maxima em dano de habilidade.",
    archer_sniper_bonus_crit: "Passiva de critico avancado, fazendo o excedente acima de 100% virar dano critico.",
    archer_enemy_skip_chance: "Passiva de pressão que pode fazer o inimigo perder o turno.",
    archer_flat_reduction_level: "Passiva defensiva de redução fixa por nivel.",
    coin_bonus: "Passiva voltada para aumentar suas recompensas em moedas.",
    nature_cycle: "Passiva que recompensa bater em alvos marcados pela Semente Viva.",
    nature_sap: "Passiva de sustentacao que transforma danos naturais recorrentes em cura.",
    nature_fairy_aura: "Passiva de Cadencia: curas e escudos empilham poder de habilidade.",
    nature_dot_mastery: "Passiva que aumenta todos os danos ao longo do tempo naturais.",
    nature_ancestral_bark: "Passiva defensiva de resistencia fixa, melhorada durante a Forma Verdadeira.",
    nature_royal_wings: "Passiva de esquiva da Fada Monarca, muito mais forte quando coroada.",
    nature_forest_oath: "Passiva de escudo do Protetor, aumentando escudos e refletindo dano absorvido."
  };
  return previews[skill.type] || "Passiva importante da rota escolhida. Quando desbloqueada, o texto aqui passa a mostrar o efeito real no seu nivel atual.";
}

function renderSubclassSpoilers(){
  const chosen = getChosenSubclassDefs();
  const tier30Choices = subclassChoicesByClass[player.class]?.tier30 || [];
  const tier30Spoiler = tier30Choices.length
    ? `<div class="inventory-item"><strong>Subclasses de nivel 30</strong><br><span class="lock-note">${tier30Choices.map(option => option.name).join(" | ")}</span></div>`
    : "";
  const tier60Source = chosen[0]?.id
    ? (subclassChoicesByClass[player.class]?.tier60?.[chosen[0].id] || [])
    : tier30Choices.flatMap(option => (subclassChoicesByClass[player.class]?.tier60?.[option.id] || []));
  const uniqueTier60 = [...new Map(tier60Source.map(option => [option.id, option])).values()];
  const tier60Spoiler = uniqueTier60.length
    ? `<div class="inventory-item"><strong>Subclasses de nivel 60</strong><br><span class="lock-note">${uniqueTier60.map(option => option.name).join(" | ")}</span></div>`
    : "";
  return `${tier30Spoiler}${tier60Spoiler}`;
}

function getPassiveStatusDescription(skill){
  const subclassState = getPlayerSubclassState();
  if(skill.type === "warrior_flat_reduction"){
    const regenText = subclassState.tier30 === "cavaleiro" && player.level >= 30 ? ` Alem disso, recupera ${Math.floor(getCurrentCaps().maxHp * 0.03)} de vida por turno.` : "";
    return `${skill.name}: reduz ${Math.floor(0.6 * player.level)} de dano por ataque recebido.${regenText}`;
  }
  if(skill.type === "warrior_enemy_miss"){
    return `${skill.name}: concede 20% de chance do inimigo errar ao atacar voce.`;
  }
  if(skill.type === "warrior_reflect"){
    if(subclassState.tier60 === "berserker" && player.level >= 60){
      return `${skill.name}: ao sofrer dano, tem 50% de chance de responder com um ataque basico.`;
    }
    return `${skill.name}: reflete ${Math.floor(getPassiveModifiers().reflectPercent * 100)}% do dano recebido para o inimigo.`;
  }
  if(skill.type === "warrior_counter_on_dodge"){
    if(subclassState.tier60 === "samurai" && player.level >= 60){
      return `${skill.name}: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria.`;
    }
    if(subclassState.tier60 === "ninja" && player.level >= 60){
      return `${skill.name}: ao desviar, executa um ataque basico de contra-ataque ignorando armadura e escudo.`;
    }
    return `${skill.name}: ao desviar de um ataque, executa um contra-ataque com seu ataque basico.`;
  }
  if(skill.type === "warrior_aura_shield"){
    return `${skill.name}: a cada turno, ganha um escudo persistente de ${Math.floor(getCurrentCaps().maxHp * 0.02)}.`;
  }
  if(skill.type === "warrior_last_stand"){
    return `${skill.name}: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer.`;
  }
  if(skill.type === "warrior_first_strike_echo"){
    return `${skill.name}: o primeiro ataque do combate acerta duas vezes, com o segundo golpe causando 50% do dano, mas repetindo os efeitos.`;
  }
  if(skill.type === "warrior_execute_bonus"){
    return `${skill.name}: causa 50% de dano total adicional contra inimigos abaixo de 50% da vida.`;
  }
  if(skill.type === "mage_last_resort"){
    return `${skill.name}: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe.`;
  }
  if(skill.type === "mage_mana_to_life"){
    const factor = subclassState.tier60 === "mago_frigido" && player.level >= 60 ? 0.65 : 0.5;
    const extraSkill = subclassState.tier60 === "mago_incendiario" && player.level >= 60 ? ` Alem disso, concede ${Math.floor(getPreviewStats().maxMp * 0.18)} de dano de habilidade.` : "";
    return `${skill.name}: converte ${Math.floor(factor * 100)}% da mana maxima em vida maxima.${extraSkill}`;
  }
  if(skill.type === "mage_overflowing"){
    const damageFactor = subclassState.tier60 === "arquimago" && player.level >= 60 ? 0.45 : 0.3;
    const costFactor = subclassState.tier60 === "arquimago" && player.level >= 60 ? 0.2 : 0.1;
    return `${skill.name}: concede ${Math.floor(getPreviewStats().maxMp * damageFactor)} de dano adicional em ataques e habilidades e aumenta os custos das habilidades em ${Math.floor(getPreviewStats().maxMp * costFactor)}.`;
  }
  if(skill.type === "mage_hellfire"){
    return `${skill.name}: aumenta o dano da queimadura de 3% para 5% da vida maxima do inimigo por turno.`;
  }
  if(skill.type === "mage_frostburn"){
    return `${skill.name}: sempre que aplicar resfriamento, tambem causa queimadura de 3% da vida maxima por 1 turno.`;
  }
  if(skill.type === "mage_charge_damage"){
    return `${skill.name}: cada carga arcana aumenta o dano total em 5%. Atualmente: ${Math.floor((playerEffects.arcaneCharges || 0) * 5)}%.`;
  }
  if(skill.type === "mage_glass_cannon"){
    return `${skill.name}: o primeiro ataque do combate causa o dobro de dano, mas voce sofre 50% de dano adicional nos 2 primeiros turnos do combate.`;
  }
  if(skill.id === "mana_e_vida"){
    return `${skill.name}: converte ${Math.floor(getPreviewStats().maxMp * 0.1)} de mana maxima em vida maxima.`;
  }
  if(skill.type === "archer_dodge_level_scaling"){
    return `${skill.name}: concede ${Math.floor((0.05 + 0.005 * player.level) * 100)}% de chance do inimigo errar o ataque contra voce.`;
  }
  if(skill.type === "archer_dodge_double_bonus"){
    return `${skill.name}: concede ${Math.floor((0.05 + 0.005 * player.level) * 100)}% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade.`;
  }
  if(skill.type === "archer_dodge_coin_bonus"){
    return `${skill.name}: concede ${Math.floor((0.05 + 0.005 * player.level) * 100)}% de chance do inimigo errar o ataque contra voce e aumenta em 10% as moedas recebidas dos inimigos.`;
  }
  if(skill.type === "archer_attack_level_bonus"){
    const attackBonus = Math.floor(0.9 * player.level);
    const skillBonus = Math.floor((subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 1.3 : 0.9) * player.level);
    return `${skill.name}: concede ${attackBonus} de dano de ataque basico e ${skillBonus} de dano de habilidade no nivel atual.${subclassState.tier60 === "sniper" && player.level >= 60 ? " Alem disso, seus ataques e habilidades ganham 15% de chance adicional de critico." : ""}`;
  }
  if(skill.type === "archer_dodge_damage_buff"){
    if(subclassState.tier60 === "espreitador" && player.level >= 60){
      return `${skill.name}: ao esquivar de um ataque, seu proximo dano causado fica 50% mais forte.`;
    }
    if(subclassState.tier60 === "guarda_florestal" && player.level >= 60){
      return `${skill.name}: ao esquivar de um ataque, voce recupera ${Math.floor(getCurrentCaps().maxHp * 0.13)} de vida.`;
    }
    return `${skill.name}: ao esquivar de um ataque, voce ganha 10% de dano total por 2 turnos.`;
  }
  if(skill.type === "archer_mana_to_skill_bonus"){
    return `${skill.name}: converte ${Math.floor((player.maxMp + getPassiveModifiers().bonusMp) * 0.05)} de mana maxima em dano de habilidade.`;
  }
  if(skill.type === "archer_sniper_bonus_crit"){
    return `${skill.name}: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional.`;
  }
  if(skill.type === "archer_enemy_skip_chance"){
    return `${skill.name}: concede 7% de chance do inimigo perder o turno sem atacar.`;
  }
  if(skill.type === "archer_flat_reduction_level"){
    return `${skill.name}: reduz ${Math.floor(0.2 * player.level)} de dano por ataque recebido.`;
  }
  if(skill.type === "coin_bonus"){
    return `${skill.name}: aumenta as moedas obtidas em 15%.`;
  }
  if(skill.type === "nature_cycle"){
    const damageBonus = getPlayerSubclassState().tier30 === "druida" && player.level >= 30 ? 16 : 10;
    const extra = getPlayerSubclassState().tier30 === "espirito_da_floresta" && player.level >= 30 ? " Tambem converte 30% do ataque basico em poder de habilidade." : "";
    return `${skill.name}: alvos marcados recebem ${damageBonus}% a mais de dano e devolvem 10% do custo da habilidade usada contra eles.${extra}`;
  }
  if(skill.type === "nature_sap"){
    return `${skill.name}: dano de marca e veneno cura 8% do dano causado.${getPlayerSubclassState().tier60 === "avatar_da_natureza" ? " Tambem aumenta sua vida maxima em 12%." : ""}${getPlayerSubclassState().tier60 === "druida_sombrio" ? " Tambem considera apodrecimento." : ""}`;
  }
  if(skill.type === "nature_fairy_aura"){
    const stackPower = getPlayerSubclassState().tier60 === "fada_monarca" ? 6 : 4;
    const healBonus = getPlayerSubclassState().tier60 === "fada_monarca" ? 10 : 5;
    return `${skill.name}: curar ou ganhar escudo concede Cadencia. Cada acumulo da ${stackPower}% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam ${healBonus}%.`;
  }
  if(skill.type === "nature_dot_mastery"){
    return `${skill.name}: aumenta marca, veneno e apodrecimento em 30%.`;
  }
  if(skill.type === "nature_ancestral_bark"){
    const reduction = Math.floor(4 + (playerEffects.natureTrueFormTurns > 0 ? 0.7 : 0.5) * player.level);
    return `${skill.name}: reduz ${reduction} de dano recebido por ataque${playerEffects.natureTrueFormTurns > 0 ? " durante a Forma Verdadeira" : ""}.`;
  }
  if(skill.type === "nature_royal_wings"){
    return `${skill.name}: concede ${playerEffects.natureCrownedTurns > 0 ? 60 : 20}% de chance de esquiva${playerEffects.natureCrownedTurns > 0 ? " enquanto coroada" : ""}.`;
  }
  if(skill.type === "nature_forest_oath"){
    return `${skill.name}: aumenta escudos em 6% e reflete 30% do dano absorvido enquanto houver escudo.`;
  }
  return skill.description;
}

function getActiveBuffs(){
  const buffs = [];
  if(playerEffects.shieldValue > 0){
    buffs.push(`Escudo ${playerEffects.shieldValue}${playerEffects.shieldTurns > 0 ? ` | ${playerEffects.shieldTurns} turno(s)` : ""}`);
  }
  if(playerEffects.invulnerableTurns > 0){
    buffs.push(`Invulneravel | ${playerEffects.invulnerableTurns} turno(s)`);
  }
  if(playerEffects.percentReductionTurns > 0 && playerEffects.percentReduction > 0){
    buffs.push(`Dano sofrido -${Math.floor(playerEffects.percentReduction * 100)}% | ${playerEffects.percentReductionTurns} turno(s)`);
  }
  if(playerEffects.enemyMaxHpBonusTurns > 0 && playerEffects.enemyMaxHpBonusDamagePercent > 0){
    buffs.push(`Dano extra por vida do alvo | ${playerEffects.enemyMaxHpBonusTurns} turno(s)`);
  }
  if(playerEffects.forcedBasicTurns > 0){
    buffs.push(`Somente ataque basico | ${playerEffects.forcedBasicTurns} turno(s)`);
  }
  if(playerEffects.attackBuffTurns > 0){
    if(playerEffects.attackBuffAmount > 0){
      buffs.push(`Ataque +${playerEffects.attackBuffAmount} | ${playerEffects.attackBuffTurns} turno(s)`);
    }
    if(playerEffects.attackBuffPercent > 0){
      buffs.push(`Ataque +${Math.floor(playerEffects.attackBuffPercent * 100)}% | ${playerEffects.attackBuffTurns} turno(s)`);
    }
  }
  if(playerEffects.skillBuffTurns > 0){
    if(playerEffects.skillBuffAmount > 0){
      buffs.push(`Habilidade +${playerEffects.skillBuffAmount} | ${playerEffects.skillBuffTurns} turno(s)`);
    }
    if(playerEffects.skillBuffPercent > 0){
      buffs.push(`Habilidade +${Math.floor(playerEffects.skillBuffPercent * 100)}% | ${playerEffects.skillBuffTurns} turno(s)`);
    }
  }
  if(playerEffects.guaranteedHitTurns > 0){
    buffs.push(`Acerto garantido | ${playerEffects.guaranteedHitTurns} turno(s)`);
  }
  if(playerEffects.enemyMissBonusTurns > 0 && playerEffects.enemyMissBonus > 0){
    buffs.push(`Esquiva +${Math.floor(playerEffects.enemyMissBonus * 100)}% | ${playerEffects.enemyMissBonusTurns} turno(s)`);
  }
  if(playerEffects.regenTurns > 0 && playerEffects.regenPercent > 0){
    buffs.push(`Regeneracao ${Math.floor(playerEffects.regenPercent * 100)}% | ${playerEffects.regenTurns} turno(s)`);
  }
  if(playerEffects.finalDamageBuffTurns > 0 && playerEffects.finalDamageBuffPercent > 0){
    buffs.push(`Dano total +${Math.floor(playerEffects.finalDamageBuffPercent * 100)}% | ${playerEffects.finalDamageBuffTurns} turno(s)`);
  }
  if(playerEffects.manaRegenBuffTurns > 0 && playerEffects.manaRegenBuffPercent > 0){
    buffs.push(`Regen de mana +${Math.floor(playerEffects.manaRegenBuffPercent * 100)}% | ${playerEffects.manaRegenBuffTurns} turno(s)`);
  }
  if(playerEffects.arcaneCharges > 0){
    buffs.push(`Cargas arcanas ${playerEffects.arcaneCharges} | ${playerEffects.arcaneChargeTurns} turno(s)`);
  }
  if(playerEffects.natureCadence > 0){
    buffs.push(`Cadencia ${playerEffects.natureCadence}/3`);
  }
  if(playerEffects.natureTrueFormTurns > 0){
    buffs.push(`Forma Verdadeira | ${playerEffects.natureTrueFormTurns} turno(s)`);
  }
  if(playerEffects.natureCrownedTurns > 0){
    buffs.push(`Coroada | ${playerEffects.natureCrownedTurns} turno(s)`);
  }
  if(playerEffects.nextDamageBonusPercent > 0){
    buffs.push(`Proximo dano +${Math.floor(playerEffects.nextDamageBonusPercent * 100)}%`);
  }
  if(playerEffects.damageDownTurns > 0 && playerEffects.damageDownPercent > 0){
    buffs.push(`Seu dano -${Math.floor(playerEffects.damageDownPercent * 100)}% | ${playerEffects.damageDownTurns} turno(s)`);
  }
  if(playerEffects.healReductionTurns > 0 && playerEffects.healReductionPercent > 0){
    buffs.push(`Cura recebida -${Math.floor(playerEffects.healReductionPercent * 100)}% | ${playerEffects.healReductionTurns} turno(s)`);
  }
  if(playerEffects.burnTurns > 0 && playerEffects.burnDamagePerTurn > 0){
    buffs.push(`Queimadura ${playerEffects.burnDamagePerTurn}/turno | ${playerEffects.burnTurns} turno(s)`);
  }
  if(playerEffects.skipNextTurn){
    buffs.push("Perdera o proximo turno");
  }
  if(playerEffects.nextBarrageDamageBonusPercent > 0){
    buffs.push(`Proxima rajada +${Math.floor(playerEffects.nextBarrageDamageBonusPercent * 100)}%`);
  }
  return buffs;
}

function getBasicAttackLabel(){
  return player.class === "Mago" ? "Misseis Magicos" : "Atacar";
}

function getBasicAttackTooltip(){
  if(player.class === "Mago"){
    const missiles = Math.floor(3 + 0.1 * player.level);
    const manaCost = missiles * 3;
    const subclassState = getPlayerSubclassState();
    const elementalistaBonus = subclassState.tier30 === "elementalista" && player.level >= 30 ? Math.floor(0.1 * getSkillPowerBonus()) : 0;
    const minPerMissile = 5 + Math.floor(getActiveAttack() * 0.2) + elementalistaBonus + getUniversalDamageFlatBonus();
    const maxPerMissile = 5 + Math.floor(getActiveAttack() * 0.5) + elementalistaBonus + getUniversalDamageFlatBonus();
    if(subclassState.tier30 === "arcanista" && player.level >= 30){
      return `Missel Magico: consome ${manaCost} MP, dispara ${missiles} misseis e cada um causa entre ${minPerMissile} e ${maxPerMissile} de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.`;
    }
    return `Missel Magico: consome ${manaCost} MP, dispara ${missiles} misseis e cada um causa entre ${minPerMissile} e ${maxPerMissile} de dano.`;
  }
  const attackMin = getActiveAttack();
  const attackMax = getActiveAttack() + 5;
  if(player.class === "Arqueiro"){
    return `Ataque basico. Dano entre ${attackMin} e ${attackMax}. Chance de acerto: ${Math.floor(getHitChance("basic") * 100)}%.`;
  }
  return `Ataque basico. Dano entre ${attackMin} e ${attackMax}.`;
}

function resetCombatEffects(){
  const subclassState = getPlayerSubclassState();
  playerEffects = createDefaultPlayerEffects();
  playerEffects.accessoryFatalSaveUsed = false;
  playerEffects.firstSkillFreeAvailable = false;
  playerEffects.firstAttackDoubleAvailable = player.class === "Mago" && subclassState.tier60 === "corrompido" && player.level >= 70;
  playerEffects.incomingDamageBonusTurns = playerEffects.firstAttackDoubleAvailable ? 2 : 0;
  playerEffects.incomingDamageBonusPercent = playerEffects.firstAttackDoubleAvailable ? 0.5 : 0;
  playerEffects.berserkerLastStandAvailable = player.class === "Guerreiro" && subclassState.tier60 === "berserker" && player.level >= 70;
  playerEffects.berserkerLastStandPending = false;
  playerEffects.samuraiEchoAvailable = player.class === "Guerreiro" && subclassState.tier60 === "samurai" && player.level >= 70;
}

function applyEnemyArmor(rawDamage, ignoreArmor = false){
  let damage = Math.max(0, Math.floor(rawDamage));
  if(!enemy || ignoreArmor){ return damage; }
  const armorReduction = enemy.armorDownTurns > 0 ? (enemy.armorDownPercent || 0) : 0;
  const armor = Math.max(0, Math.floor((enemy.armor || 0) * (1 - armorReduction)));
  if(armor > 0 && damage > 0){
    const absorbed = Math.min(armor, damage);
    damage = Math.max(0, damage - absorbed);
    log(`${enemy.baseName} absorveu ${absorbed} de dano com a armadura.`);
  }
  return damage;
}

function applyDamageToEnemy(rawDamage, options = {}){
  if(!enemy){ return 0; }
  let damage = applyEnemyArmor(rawDamage, !!options.ignoreArmor);
  if(damage > 0 && player.class === "Adepto da Natureza" && enemy.natureMarkTurns > 0){
    const markBonus = getPlayerSubclassState().tier30 === "druida" && player.level >= 30 ? 0.16 : 0.1;
    const bonusDamage = Math.floor(damage * markBonus);
    damage += bonusDamage;
    if(bonusDamage > 0){
      log(`Ciclo Natural adicionou ${bonusDamage} de dano contra o alvo marcado.`);
    }
    if(options.skillCost > 0){
      const refund = Math.floor(options.skillCost * 0.1);
      if(refund > 0){
        player.mp = Math.min(getCurrentCaps().maxMp, player.mp + refund);
        log(`Ciclo Natural restaurou ${refund} de mana.`);
      }
    }
  }
  if(damage > 0 && playerEffects.enemyMaxHpBonusTurns > 0 && playerEffects.enemyMaxHpBonusDamagePercent > 0){
    damage += Math.floor(enemy.maxHp * playerEffects.enemyMaxHpBonusDamagePercent);
  }
  if(damage > 0 && player.class === "Guerreiro" && getPlayerSubclassState().tier60 === "ninja" && player.level >= 70 && enemy.hp <= Math.floor(enemy.maxHp * 0.5)){
    damage += Math.floor(damage * 0.5);
  }
  const passivePercentBonus = getUniversalDamagePercentBonus();
  if(damage > 0 && passivePercentBonus > 0){
    damage += Math.floor(damage * passivePercentBonus);
  }
  if(damage > 0 && playerEffects.finalDamageBuffTurns > 0 && playerEffects.finalDamageBuffPercent > 0){
    damage += Math.floor(damage * playerEffects.finalDamageBuffPercent);
  }
  if(damage > 0 && playerEffects.nextDamageBonusPercent > 0){
    const ambushBonus = Math.floor(damage * playerEffects.nextDamageBonusPercent);
    damage += ambushBonus;
    playerEffects.nextDamageBonusPercent = 0;
    log(`Seu proximo golpe recebeu +${ambushBonus} de dano bonus.`);
  }
  if(damage > 0 && (enemy.nextDamageTakenPercent || 0) > 0){
    const markedBonus = Math.floor(damage * enemy.nextDamageTakenPercent);
    damage += markedBonus;
    log(`${enemy.baseName} sofreu +${markedBonus} de dano por estar marcado.`);
    enemy.nextDamageTakenPercent = 0;
  }
  if(damage > 0 && (enemy.frozenDamageBonusPercent || 0) > 0){
    const frozenBonus = Math.floor(damage * enemy.frozenDamageBonusPercent);
    damage += frozenBonus;
    log(`Congelamento adicionou ${frozenBonus} de dano ao proximo golpe.`);
    enemy.frozenDamageBonusPercent = 0;
  }
  if(damage > 0 && playerEffects.damageDownTurns > 0 && playerEffects.damageDownPercent > 0){
    const reducedAmount = Math.floor(damage * playerEffects.damageDownPercent);
    damage = Math.max(0, damage - reducedAmount);
  }
  if(damage > 0 && enemy.shieldValue > 0 && !options.ignoreShield){
    const absorbedByShield = Math.min(enemy.shieldValue, damage);
    enemy.shieldValue -= absorbedByShield;
    damage -= absorbedByShield;
    log(`${enemy.baseName} absorveu ${absorbedByShield} de dano com o escudo.`);
    if(enemy.shieldValue <= 0){
      enemy.shieldValue = 0;
      enemy.shieldTurns = 0;
      log(`O escudo de ${enemy.baseName} se partiu.`);
    }
  }
  enemy.hp -= damage;
  return damage;
}

function applyIncomingDamage(baseDamage, options = {}){
  let damage = Math.max(0, Math.floor(baseDamage));
  if(playerEffects.invulnerableTurns > 0){
    playerEffects.storedFaithDamage += damage;
    return { damage: 0, missed: false, absorbed: damage, manaAbsorbed: 0 };
  }
  if(playerEffects.basicOnlyUntouchableTurns > 0){
    return { damage: 0, missed: true, absorbed: 0, manaAbsorbed: 0 };
  }
  if(playerEffects.incomingDamageBonusTurns > 0 && playerEffects.incomingDamageBonusPercent > 0){
    damage += Math.floor(damage * playerEffects.incomingDamageBonusPercent);
  }
  if(playerEffects.percentReductionTurns > 0 && playerEffects.percentReduction > 0){
    damage = Math.max(0, damage - Math.floor(damage * playerEffects.percentReduction));
  }
  const missChance = getEnemyMissChance();
  const autoMiss = playerEffects.nextIncomingAutoMiss;
  if(autoMiss || (missChance > 0 && Math.random() < missChance)){
    playerEffects.nextIncomingAutoMiss = false;
    if(getUnlockedPassiveSkills().some(skill => skill.type === "archer_dodge_damage_buff")){
      const subclassState = getPlayerSubclassState();
      if(subclassState.tier60 === "espreitador" && player.level >= 60){
        playerEffects.nextDamageBonusPercent = Math.max(playerEffects.nextDamageBonusPercent, 0.5);
      }else if(subclassState.tier60 === "guarda_florestal" && player.level >= 60){
        const heal = Math.floor(getCurrentCaps().maxHp * 0.13);
        const healed = healPlayer(heal);
        log(`Errou ativou e restaurou ${healed} de vida.`);
      }else{
        playerEffects.finalDamageBuffTurns = Math.max(playerEffects.finalDamageBuffTurns, 2);
        playerEffects.finalDamageBuffPercent = Math.max(playerEffects.finalDamageBuffPercent, 0.1);
      }
    }
    if(player.class === "Guerreiro" && getUnlockedPassiveSkills().some(skill => skill.type === "warrior_counter_on_dodge") && enemy){
      const wouldDeal = Math.max(1, baseDamage);
      let counterDamage = getActiveAttack() + Math.floor(Math.random() * 6);
      if(getPlayerSubclassState().tier60 === "ninja" && player.level >= 60){
        counterDamage = applyDamageToEnemy(counterDamage, { ignoreArmor: true, ignoreShield: true });
      }else{
        counterDamage = applyDamageToEnemy(counterDamage);
      }
      log(`Contra-Ataque respondeu com ${counterDamage} de dano.`);
      if(getPlayerSubclassState().tier60 === "samurai" && player.level >= 60){
        const heal = Math.floor(wouldDeal * 0.3);
        const healed = healPlayer(heal);
        log(`Contra-Ataque restaurou ${healed} de vida.`);
      }
    }
    return { damage: 0, missed: true, absorbed: 0, manaAbsorbed: 0 };
  }
  const flatReduction = getPassiveModifiers().flatReduction;
  if(flatReduction > 0 && !options.ignoreFlatReduction){
    damage = Math.max(0, damage - flatReduction);
  }
  let absorbed = 0;
  if(playerEffects.shieldValue > 0 && damage > 0 && !options.ignoreShield){
    absorbed = Math.min(damage, playerEffects.shieldValue);
    playerEffects.shieldValue -= absorbed;
    damage -= absorbed;
    if(absorbed > 0 && player.class === "Adepto da Natureza" && hasUnlockedPassiveType("nature_forest_oath") && enemy){
      const reflectDamage = Math.floor(absorbed * 0.3);
      if(reflectDamage > 0){
        applyDamageToEnemy(reflectDamage);
        log(`Juramento do Bosque refletiu ${reflectDamage} de dano pelo escudo.`);
      }
    }
  }
  let manaAbsorbed = 0;
  const passiveModifiers = getPassiveModifiers();
  const lastResortManaCost = damage * 2;
  if(!options.ignorePreciousMana && passiveModifiers.preciousMana && damage >= player.hp && damage > 0 && player.mp >= lastResortManaCost){
    manaAbsorbed = lastResortManaCost;
    player.mp = Math.max(0, player.mp - lastResortManaCost);
    damage = 0;
    if(getPlayerSubclassState().tier30 === "arcanista" && player.level >= 30){
      addArcaneCharges(Math.floor(manaAbsorbed / 100));
    }
    const subclassState = getPlayerSubclassState();
    if(subclassState.tier30 === "elementalista" && player.level >= 30 && enemy){
      enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, Math.max(1, Math.floor(enemy.maxHp * 0.03)));
      enemy.dotTurns = Math.max(enemy.dotTurns || 0, 3);
      enemy.dotSourceName = "Ultimo Recurso";
      enemy.healReductionPercent = Math.max(enemy.healReductionPercent || 0, 0.3);
      enemy.healReductionTurns = Math.max(enemy.healReductionTurns || 0, 3);
    }
  }
  if(damage > 0){
    if(damage >= player.hp && passiveModifiers.fatalSaveHealPercent > 0 && !playerEffects.accessoryFatalSaveUsed){
      playerEffects.accessoryFatalSaveUsed = true;
      damage = 0;
      const healAmount = Math.max(1, Math.floor(getCurrentCaps().maxHp * passiveModifiers.fatalSaveHealPercent));
      const healed = healPlayer(healAmount);
      log(`O acessorio salvou sua vida e restaurou ${healed} de vida.`);
    }
  }
  if(damage > 0){
    player.hp -= damage;
    if(getPlayerSubclassState().tier60 === "corrompido" && player.level >= 60 && getUnlockedPassiveSkills().some(passive => passive.type === "mage_overflowing")){
      playerEffects.shieldValue += damage;
      playerEffects.shieldTurns = 0;
      log(`Transbordando converteu ${damage} de dano recebido em escudo.`);
    }
    if(player.class === "Guerreiro" && getPassiveModifiers().reflectPercent > 0 && enemy){
      const reflectDamage = Math.floor(damage * getPassiveModifiers().reflectPercent);
      if(reflectDamage > 0){
        applyDamageToEnemy(reflectDamage);
        log(`Refletir devolveu ${reflectDamage} de dano ao inimigo.`);
      }
    }
    if(player.class === "Guerreiro" && getPlayerSubclassState().tier60 === "berserker" && player.level >= 60 && getUnlockedPassiveSkills().some(passive => passive.type === "warrior_reflect") && enemy && Math.random() < 0.5){
      const counterDamage = applyDamageToEnemy(getActiveAttack() + Math.floor(Math.random() * 6));
      log(`Refletir desencadeou um contra-ataque de ${counterDamage} de dano.`);
    }
  }
  if(getPlayerSubclassState().tier60 === "corrompido" && player.level >= 60 && playerEffects.shieldReactiveWeakening && (absorbed > 0 || damage > 0) && enemy){
    enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, 0.5);
    enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, 1);
  }
  if(player.class === "Guerreiro" && getPlayerSubclassState().tier60 === "berserker" && player.level >= 70 && player.hp <= 0 && playerEffects.berserkerLastStandAvailable){
    playerEffects.berserkerLastStandAvailable = false;
    playerEffects.berserkerLastStandPending = true;
    player.hp = 1;
    log("Voce Nao e Digno impediu sua queda fatal.");
  }
  player.hp = Math.max(0, player.hp);
  return { damage, missed: false, absorbed, manaAbsorbed };
}

function getBasicAttackResult(namePrefix = "Voce", applyToTarget = true){
  if(player.class === "Mago"){
    const missiles = Math.floor(3 + 0.1 * player.level);
    const manaCost = missiles * 3;
    if(player.mp < manaCost){
      return { blocked: true, message: "Mana insuficiente para usar Missel Magico." };
    }
    player.mp -= manaCost;
    const elementalistaBonus = getPlayerSubclassState().tier30 === "elementalista" && player.level >= 30 ? Math.floor(0.1 * getSkillPowerBonus()) : 0;
    const minPerMissile = 5 + Math.floor(getActiveAttack() * 0.2) + elementalistaBonus + getUniversalDamageFlatBonus();
    const maxPerMissile = 5 + Math.floor(getActiveAttack() * 0.5) + elementalistaBonus + getUniversalDamageFlatBonus();
    const hitDamages = [];
    let chargeGains = 0;
    const openingDouble = playerEffects.firstAttackDoubleAvailable;
    if(openingDouble){
      playerEffects.firstAttackDoubleAvailable = false;
    }
    if(applyToTarget){
      for(let missile = 0; missile < missiles; missile++){
        let rolledDamage = minPerMissile + Math.floor(Math.random() * (Math.max(1, maxPerMissile - minPerMissile + 1)));
        if(openingDouble){ rolledDamage *= 2; }
        const finalRolledDamage = Math.floor(rolledDamage * (1 + getUniversalDamagePercentBonus()));
        hitDamages.push(applyDamageToEnemy(finalRolledDamage));
        if(getPlayerSubclassState().tier30 === "arcanista" && player.level >= 30 && Math.random() < 0.15){
          chargeGains += addArcaneCharges(1);
        }
      }
    }else{
      for(let missile = 0; missile < missiles; missile++){
        let rolledDamage = minPerMissile + Math.floor(Math.random() * (Math.max(1, maxPerMissile - minPerMissile + 1)));
        if(openingDouble){ rolledDamage *= 2; }
        hitDamages.push(Math.floor(rolledDamage * (1 + getUniversalDamagePercentBonus())));
        if(getPlayerSubclassState().tier30 === "arcanista" && player.level >= 30 && Math.random() < 0.15){
          chargeGains += addArcaneCharges(1);
        }
      }
    }
    const finalDamage = hitDamages.reduce((sum, damage) => sum + damage, 0);
    return { damage: finalDamage, missiles, hitDamages, message: `${namePrefix} lançou ${missiles} misseis magicos e causou ${finalDamage} de dano.${chargeGains > 0 ? ` Voce ganhou ${chargeGains} carga(s) arcana(s).` : ""}` };
  }
  if(player.class === "Arqueiro" && !rollHit("basic")){
    return { damage: 0, message: `${namePrefix} errou o ataque.` };
  }
  let damage = getActiveAttack() + Math.floor(Math.random() * 6);
  if(player.class === "Adepto da Natureza" && playerEffects.natureTrueFormTurns > 0){
    damage = Math.floor(getActiveAttack() * 1.7) + Math.floor(Math.random() * 6);
  }
  let criticalText = "";
  if(player.class === "Arqueiro"){
    const criticalHit = rollArcherCriticalOutcome(0);
    if(criticalHit.didCrit){
      damage = Math.floor(damage * criticalHit.multiplier);
      criticalText = ` Critico com ${Math.floor(criticalHit.critDamageBonus * 100)}% de dano critico.`;
    }
  }
  let finalDamage = applyToTarget ? applyDamageToEnemy(damage) : damage;
  let extraText = "";
  if(player.class === "Guerreiro" && getPlayerSubclassState().tier60 === "samurai" && player.level >= 70 && playerEffects.samuraiEchoAvailable){
    playerEffects.samuraiEchoAvailable = false;
    const echoDamage = Math.floor((applyToTarget ? damage : finalDamage) * 0.5);
    const dealtEcho = applyToTarget ? applyDamageToEnemy(echoDamage) : echoDamage;
    finalDamage += dealtEcho;
    extraText = ` Mente Limpa adicionou um segundo corte de ${dealtEcho} de dano.`;
  }
  return { damage: finalDamage, message: `${namePrefix} causou ${finalDamage} de dano.${criticalText}${extraText}` };
}

function applyFirstDamageSkillBonus(damage, isDamageSkill){
  if(damage > 0 && playerEffects.firstAttackDoubleAvailable){
    playerEffects.firstAttackDoubleAvailable = false;
    return Math.floor(damage * 2);
  }
  return damage;
}

function useSkillCost(skillInfo){
  return playerEffects.firstSkillFreeAvailable ? 0 : skillInfo.cost;
}

function applySkillLocally(skillInfo, actorName = "Voce", applyToTarget = true){
  const cost = useSkillCost(skillInfo);
  if(player.mp < cost){
    return { blocked: true, message: "Mana insuficiente!" };
  }
  if(skillInfo.hpCostPercent){
    const hpCost = Math.floor(getCurrentCaps().maxHp * skillInfo.hpCostPercent);
    if(player.hp <= hpCost){
      return { blocked: true, message: "Vida insuficiente para usar essa habilidade!" };
    }
  }
  if(playerEffects.firstSkillFreeAvailable){
    playerEffects.firstSkillFreeAvailable = false;
  }
  player.mp -= cost;
  if(skillInfo.hpCostPercent){
    player.hp -= Math.floor(getCurrentCaps().maxHp * skillInfo.hpCostPercent);
  }
  let damage = 0;
  let message = `${actorName} usou ${skillInfo.name}.`;
  let freeTurn = false;
  let freezeApplied = false;
  if(["mage_mana_burst", "mage_fireball", "mage_freeze", "mage_sacred_phoenix", "mage_avalanche", "warrior_shove", "warrior_stagger", "warrior_judgment", "warrior_armor_piercer", "warrior_giant_slayer", "warrior_deep_cut"].includes(skillInfo.type)){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    if(!applyToTarget){
      damage = Math.floor(damage * (1 + getUniversalDamagePercentBonus()));
    }
    damage = applyToTarget ? applyDamageToEnemy(damage, { ignoreArmor: skillInfo.ignoreArmor }) : damage;
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.`;
    if(skillInfo.type === "mage_mana_burst" && applyToTarget && enemy && skillInfo.enemyManaBurnAmount > 0){
      enemy.mp = Math.max(0, (enemy.mp || 0) - skillInfo.enemyManaBurnAmount);
      message += ` A explosao consumiu ${skillInfo.enemyManaBurnAmount} de mana do alvo e converteu isso em dano extra.`;
    }
    if(skillInfo.type === "mage_fireball" && applyToTarget && enemy){
      if(skillInfo.appliesBurn){
        enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, skillInfo.burnDamage || 0);
        enemy.dotTurns = Math.max(enemy.dotTurns || 0, skillInfo.burnTurns || 0);
        enemy.dotSourceName = skillInfo.name;
        enemy.healReductionPercent = Math.max(enemy.healReductionPercent || 0, skillInfo.healReductionPercent || 0);
        enemy.healReductionTurns = Math.max(enemy.healReductionTurns || 0, skillInfo.burnTurns || 0);
        message += " O inimigo ficou queimando.";
      }
      if(skillInfo.appliesChill){
        enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.chillAttackDownPercent || 0);
        enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, skillInfo.chillTurns || 0);
        message += " O inimigo ficou resfriado.";
        if(getUnlockedPassiveSkills().some(passive => passive.type === "mage_frostburn")){
          enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, Math.max(1, Math.floor(enemy.maxHp * 0.03)));
          enemy.dotTurns = Math.max(enemy.dotTurns || 0, 1);
          enemy.dotSourceName = "Gelo Queima";
        }
      }
    }
    if(skillInfo.type === "mage_freeze" && Math.random() < skillInfo.freezeChance){
      if(applyToTarget && enemy){
        enemy.skipNextAttack = true;
      }
      freezeApplied = true;
      message += " O inimigo foi congelado e pode perder o proximo ataque.";
    }else if(skillInfo.type === "mage_freeze" && applyToTarget && enemy){
      if(skillInfo.burnTurns > 0){
        enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, skillInfo.burnDamage || 0);
        enemy.dotTurns = Math.max(enemy.dotTurns || 0, skillInfo.burnTurns || 0);
        enemy.dotSourceName = skillInfo.name;
        enemy.healReductionPercent = Math.max(enemy.healReductionPercent || 0, 0.3);
        enemy.healReductionTurns = Math.max(enemy.healReductionTurns || 0, skillInfo.burnTurns || 0);
        message += " O alvo ficou incendiado.";
      }
      if(skillInfo.chillTurns > 0){
        const alreadyChilled = enemy.attackDownTurns > 0 && enemy.attackDownPercent > 0;
        if(skillInfo.freezeVulnerabilityPercent > 0 && alreadyChilled){
          enemy.frozenDamageBonusPercent = Math.max(enemy.frozenDamageBonusPercent || 0, skillInfo.freezeVulnerabilityPercent);
          message += " O inimigo ficou congelado e sofrera 50% a mais no proximo dano.";
        }else{
          enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.chillAttackDownPercent || 0);
          enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, skillInfo.chillTurns || 0);
          message += " O inimigo ficou resfriado.";
        }
        if(getUnlockedPassiveSkills().some(passive => passive.type === "mage_frostburn")){
          enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, Math.max(1, Math.floor(enemy.maxHp * 0.03)));
          enemy.dotTurns = Math.max(enemy.dotTurns || 0, 1);
          enemy.dotSourceName = "Gelo Queima";
        }
      }
    }
    if(skillInfo.type === "mage_sacred_phoenix" && applyToTarget && enemy){
      enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, skillInfo.burnDamage || 0);
      enemy.dotTurns = Math.max(enemy.dotTurns || 0, skillInfo.burnTurns || 0);
      enemy.dotSourceName = skillInfo.name;
      enemy.healReductionPercent = Math.max(enemy.healReductionPercent || 0, skillInfo.healReductionPercent || 0);
      enemy.healReductionTurns = Math.max(enemy.healReductionTurns || 0, skillInfo.burnTurns || 0);
    }
    if(skillInfo.type === "mage_avalanche" && applyToTarget && enemy){
      enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.chillAttackDownPercent || 0);
      enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, skillInfo.chillTurns || 0);
      if(getUnlockedPassiveSkills().some(passive => passive.type === "mage_frostburn")){
        enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, Math.max(1, Math.floor(enemy.maxHp * 0.03)));
        enemy.dotTurns = Math.max(enemy.dotTurns || 0, 1);
        enemy.dotSourceName = "Gelo Queima";
      }
    }
    if(["warrior_shove", "warrior_stagger"].includes(skillInfo.type) && applyToTarget && enemy && skillInfo.enemyAttackDownPercent){
      enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.enemyAttackDownPercent);
      enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, skillInfo.enemyAttackDownTurns || 0);
    }
    if(skillInfo.type === "warrior_stagger" && applyToTarget && enemy && skillInfo.skipChance > 0 && Math.random() < skillInfo.skipChance){
      enemy.skipNextAttack = true;
      freezeApplied = true;
      message += " O inimigo perdeu o equilibrio e pode perder o proximo turno.";
    }
    if(skillInfo.type === "warrior_deep_cut" && applyToTarget && enemy){
      const bleedPerTurn = Math.max(enemy.dotDamagePerTurn || 0, Math.floor((damage * skillInfo.bleedPercent) / Math.max(1, skillInfo.bleedTurns)));
      enemy.dotDamagePerTurn = bleedPerTurn;
      enemy.dotTurns = Math.max(enemy.dotTurns || 0, skillInfo.bleedTurns);
      enemy.dotSourceName = skillInfo.name;
    }
  }
  if(skillInfo.type === "warrior_second_wind"){
    const healed = healPlayer(skillInfo.heal);
    if(skillInfo.damageBuff > 0){
      playerEffects.finalDamageBuffTurns = Math.max(playerEffects.finalDamageBuffTurns, skillInfo.turns);
      playerEffects.finalDamageBuffPercent = Math.max(playerEffects.finalDamageBuffPercent, skillInfo.damageBuff);
    }
    message = `${actorName} usou ${skillInfo.name} e recuperou ${healed} de vida.${skillInfo.damageBuff > 0 ? " O dano total aumentou por 3 turnos." : ""}`;
  }
  if(skillInfo.type === "warrior_swift_strikes"){
    let totalDamage = 0;
    for(let i = 0; i < skillInfo.hits; i++){
      const hit = getActiveAttack() + Math.floor(Math.random() * 6);
      totalDamage += applyToTarget ? applyDamageToEnemy(hit) : hit;
    }
    damage = totalDamage;
    if(applyToTarget && enemy && skillInfo.bleedPercent > 0){
      const bleedPerTurn = Math.max(enemy.dotDamagePerTurn || 0, Math.floor((damage * skillInfo.bleedPercent) / 3));
      enemy.dotDamagePerTurn = bleedPerTurn;
      enemy.dotTurns = Math.max(enemy.dotTurns || 0, 3);
      enemy.dotSourceName = skillInfo.name;
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano em ${skillInfo.hits} golpes.`;
  }
  if(skillInfo.type === "warrior_warcry"){
    if(skillInfo.hpCostPercent){
      playerEffects.finalDamageBuffTurns = Math.max(playerEffects.finalDamageBuffTurns, skillInfo.turns);
      playerEffects.finalDamageBuffPercent = Math.max(playerEffects.finalDamageBuffPercent, skillInfo.totalDamagePercent);
      message = `${actorName} entrou em ${skillInfo.name} por ${skillInfo.turns} turnos.`;
    }else{
      playerEffects.attackBuffTurns = Math.max(playerEffects.attackBuffTurns, skillInfo.turns);
      playerEffects.attackBuffPercent = Math.max(playerEffects.attackBuffPercent, skillInfo.attackPercent);
      if(skillInfo.damageReductionPercent > 0){
        playerEffects.percentReductionTurns = Math.max(playerEffects.percentReductionTurns, skillInfo.turns);
        playerEffects.percentReduction = Math.max(playerEffects.percentReduction, skillInfo.damageReductionPercent);
      }
      message = `${actorName} usou ${skillInfo.name} e fortaleceu o ataque por ${skillInfo.turns} turnos.`;
    }
  }
  if(skillInfo.type === "warrior_valhalla"){
    playerEffects.incomingDamageBonusTurns = Math.max(playerEffects.incomingDamageBonusTurns, skillInfo.turns);
    playerEffects.incomingDamageBonusPercent = Math.max(playerEffects.incomingDamageBonusPercent, skillInfo.incomingDamagePercent);
    playerEffects.enemyMaxHpBonusTurns = Math.max(playerEffects.enemyMaxHpBonusTurns, skillInfo.turns);
    playerEffects.enemyMaxHpBonusDamagePercent = Math.max(playerEffects.enemyMaxHpBonusDamagePercent, skillInfo.enemyMaxHpBonusDamagePercent);
    message = `${actorName} usou ${skillInfo.name} e entrou em furia por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "warrior_smoke_bomb"){
    playerEffects.nextIncomingAutoMiss = true;
    playerEffects.nextDamageBonusPercent = Math.max(playerEffects.nextDamageBonusPercent, skillInfo.nextDamageBonus);
    message = `${actorName} usou ${skillInfo.name} e preparou uma esquiva perfeita com golpe fortalecido.`;
  }
  if(skillInfo.type === "warrior_faith_shield"){
    playerEffects.invulnerableTurns = Math.max(playerEffects.invulnerableTurns, skillInfo.turns);
    playerEffects.storedFaithDamage = 0;
    message = `${actorName} usou ${skillInfo.name} e ficou intocavel por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "warrior_unstoppable"){
    playerEffects.attackBuffTurns = Math.max(playerEffects.attackBuffTurns, skillInfo.turns);
    playerEffects.attackBuffAmount = Math.max(playerEffects.attackBuffAmount, skillInfo.attackBuffAmount);
    message = `${actorName} usou ${skillInfo.name} e ficou imparavel por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "warrior_ultrasonic_cuts"){
    playerEffects.forcedBasicTurns = Math.max(playerEffects.forcedBasicTurns, skillInfo.turns);
    playerEffects.basicOnlyUntouchableTurns = Math.max(playerEffects.basicOnlyUntouchableTurns, skillInfo.turns);
    message = `${actorName} usou ${skillInfo.name} e agora so pode atacar normalmente por ${skillInfo.turns} turnos, sem ser atingido.`;
  }
  if(skillInfo.type === "mage_discharge"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    if(!applyToTarget){
      damage = Math.floor(damage * (1 + getUniversalDamagePercentBonus()));
    }
    damage = applyToTarget ? applyDamageToEnemy(damage) : damage;
    if(getPlayerSubclassState().tier60 === "corrompido" && player.level >= 60){
      playerEffects.nextDamageBonusPercent = Math.max(playerEffects.nextDamageBonusPercent, 0.3);
    }
    playerEffects.arcaneCharges = 0;
    playerEffects.arcaneChargeTurns = 0;
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano, consumindo todas as cargas arcanas.`;
  }
  if(skillInfo.type === "mage_blizzard"){
    if(applyToTarget && enemy){
      enemy.blizzardSkipChance = Math.max(enemy.blizzardSkipChance || 0, skillInfo.enemySkipChance || 0);
      enemy.blizzardTurns = Math.max(enemy.blizzardTurns || 0, skillInfo.turns || 0);
    }
    message = `${actorName} usou ${skillInfo.name} e envolveu o inimigo em uma tempestade por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "mage_corruption"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    if(!applyToTarget){
      damage = Math.floor(damage * (1 + getUniversalDamagePercentBonus()));
    }
    damage = applyToTarget ? applyDamageToEnemy(damage, { ignoreArmor: true }) : damage;
    if(applyToTarget && enemy){
      enemy.armorDownPercent = Math.max(enemy.armorDownPercent || 0, skillInfo.armorBreakPercent || 1);
      enemy.armorDownTurns = Math.max(enemy.armorDownTurns || 0, skillInfo.armorBreakTurns || 5);
      enemy.noShieldTurns = Math.max(enemy.noShieldTurns || 0, skillInfo.noShieldTurns || 5);
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano, corrompendo as defesas do alvo.`;
  }
  if(skillInfo.type === "mage_overcharge"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    if(!applyToTarget){
      damage = Math.floor(damage * (1 + getUniversalDamagePercentBonus()));
    }
    damage = applyToTarget ? applyDamageToEnemy(damage) : damage;
    playerEffects.arcaneCharges = 0;
    playerEffects.arcaneChargeTurns = 0;
    message = `${actorName} usou ${skillInfo.name} e liberou ${damage} de dano arcano.`;
  }
  if(skillInfo.type === "mage_demon_form"){
    playerEffects.finalDamageBuffTurns = Math.max(playerEffects.finalDamageBuffTurns, skillInfo.turns);
    playerEffects.finalDamageBuffPercent = Math.max(playerEffects.finalDamageBuffPercent, skillInfo.damagePercent);
    playerEffects.incomingDamageBonusTurns = Math.max(playerEffects.incomingDamageBonusTurns, skillInfo.turns);
    playerEffects.incomingDamageBonusPercent = Math.max(playerEffects.incomingDamageBonusPercent, skillInfo.vulnerabilityPercent);
    message = `${actorName} usou ${skillInfo.name} e foi tomado por um poder demoniaco por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "archer_headshot"){
    damage = skillInfo.damage;
    const criticalHit = rollArcherCriticalOutcome(skillInfo.critChance);
    const shouldMarkTarget = !criticalHit.didCrit && skillInfo.marksOnNonCrit && applyToTarget && !!enemy;
    damage = Math.floor(damage * criticalHit.multiplier);
    damage = applyToTarget ? applyDamageToEnemy(damage) : damage;
    if(shouldMarkTarget && enemy){
      enemy.nextDamageTakenPercent = Math.max(enemy.nextDamageTakenPercent || 0, 0.15);
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.${criticalHit.didCrit ? ` Critico com ${Math.floor(criticalHit.critDamageBonus * 100)}% de dano critico.` : ""}${shouldMarkTarget ? " O alvo ficou marcado para o proximo golpe." : ""}`;
  }
  if(skillInfo.type === "archer_barrage"){
    let totalDamage = 0;
    let hits = 0;
    let missedShots = 0;
    const totalShots = skillInfo.hits + (skillInfo.extraShotChance > 0 && Math.random() < skillInfo.extraShotChance ? 1 : 0);
    const barrageBonusPercent = playerEffects.nextBarrageDamageBonusPercent || 0;
    if(barrageBonusPercent > 0){
      playerEffects.nextBarrageDamageBonusPercent = 0;
    }
    for(let i = 0; i < totalShots; i++){
      if(rollHit("basic")){
        let hitDamage = getActiveAttack() + Math.floor(Math.random() * 6);
        if(barrageBonusPercent > 0){
          hitDamage += Math.floor(hitDamage * barrageBonusPercent);
        }
        const criticalHit = rollArcherCriticalOutcome(0);
        hitDamage = Math.floor(hitDamage * criticalHit.multiplier);
        totalDamage += applyToTarget ? applyDamageToEnemy(hitDamage) : hitDamage;
        hits++;
      }else{
        missedShots++;
      }
    }
    if(missedShots > 0 && getPlayerSubclassState().tier60 === "espreitador" && player.level >= 60){
      playerEffects.finalDamageBuffTurns = Math.max(playerEffects.finalDamageBuffTurns, 2);
      playerEffects.finalDamageBuffPercent = Math.max(playerEffects.finalDamageBuffPercent, 0.1);
    }
    damage = totalDamage;
    message = hits ? `${actorName} usou ${skillInfo.name} e acertou ${hits} disparo(s), causando ${damage} de dano.` : `${actorName} usou ${skillInfo.name}, mas nao acertou nenhum disparo.`;
  }
  if(["archer_piercing_shot", "archer_arcane_shot", "archer_surprise", "archer_tranquilizer", "archer_overcharge", "archer_weak_spot"].includes(skillInfo.type)){
    damage = skillInfo.damage;
    const criticalHit = rollArcherCriticalOutcome(0);
    damage = Math.floor(damage * criticalHit.multiplier);
    damage = applyToTarget ? applyDamageToEnemy(damage, { ignoreArmor: !!skillInfo.ignoreArmor, ignoreShield: !!skillInfo.ignoreShield }) : damage;
    if(applyToTarget && enemy && skillInfo.shattersShield){
      enemy.shieldValue = 0;
      enemy.shieldTurns = 0;
    }
    if(applyToTarget && enemy && skillInfo.enemyAttackDownPercent){
      enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.enemyAttackDownPercent);
      enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, skillInfo.enemyAttackDownTurns || 0);
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.${criticalHit.didCrit ? ` Critico com ${Math.floor(criticalHit.critDamageBonus * 100)}% de dano critico.` : ""}`;
  }
  if(skillInfo.type === "archer_execute"){
    damage = skillInfo.damage;
    if(enemy && enemy.hp <= Math.floor(enemy.maxHp * skillInfo.executeThreshold)){
      damage *= skillInfo.executeMultiplier;
    }
    const criticalHit = rollArcherCriticalOutcome(0);
    damage = Math.floor(damage * criticalHit.multiplier);
    damage = applyToTarget ? applyDamageToEnemy(damage) : damage;
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.${criticalHit.didCrit ? ` Critico com ${Math.floor(criticalHit.critDamageBonus * 100)}% de dano critico.` : ""}`;
  }
  if(skillInfo.type === "archer_trap"){
    damage = applyToTarget ? applyDamageToEnemy(skillInfo.damage) : skillInfo.damage;
    if(applyToTarget && enemy && Math.random() < skillInfo.skipChance){
      enemy.skipNextAttack = true;
      freezeApplied = true;
      if(skillInfo.nextBarrageBonus){
        playerEffects.nextBarrageDamageBonusPercent = Math.max(playerEffects.nextBarrageDamageBonusPercent, skillInfo.nextBarrageBonus);
      }
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.${freezeApplied ? " O inimigo ficou preso e pode perder o proximo turno." : ""}`;
  }
  if(skillInfo.type === "archer_aim_leg"){
    damage = skillInfo.damage;
    const criticalHit = rollArcherCriticalOutcome(0);
    damage = Math.floor(damage * criticalHit.multiplier);
    damage = applyToTarget ? applyDamageToEnemy(damage) : damage;
    if(applyToTarget && enemy){
      enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.enemyAttackDownPercent);
      enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, skillInfo.enemyAttackDownTurns || 0);
      enemy.armorDownPercent = Math.max(enemy.armorDownPercent || 0, skillInfo.enemyArmorDownPercent);
      enemy.armorDownTurns = Math.max(enemy.armorDownTurns || 0, skillInfo.enemyArmorDownTurns || 0);
      if(Math.random() < skillInfo.skipChance){
        enemy.skipNextAttack = true;
        freezeApplied = true;
      }
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.${criticalHit.didCrit ? ` Critico com ${Math.floor(criticalHit.critDamageBonus * 100)}% de dano critico.` : ""}${freezeApplied ? " O inimigo perdeu o equilibrio e pode perder o proximo turno." : ""}`;
  }
  if(skillInfo.type === "archer_cutting_shot"){
    if(applyToTarget && enemy){
      enemy.dotDamagePerTurn = Math.max(enemy.dotDamagePerTurn || 0, skillInfo.dotDamage);
      enemy.dotTurns = Math.max(enemy.dotTurns || 0, skillInfo.dotTurns);
      enemy.dotSourceName = skillInfo.name;
    }
    message = `${actorName} usou ${skillInfo.name} e deixou o alvo sangrando por ${skillInfo.dotTurns} rodadas.`;
  }
  if(skillInfo.type === "mage_mana_shield"){
    playerEffects.shieldValue = skillInfo.shield;
    playerEffects.shieldTurns = skillInfo.turns || 0;
    playerEffects.shieldReactiveWeakening = player.class === "Mago" && getPlayerSubclassState().tier60 === "corrompido" && player.level >= 60;
    message = `${actorName} usou ${skillInfo.name} e ganhou ${skillInfo.shield} de escudo.`;
  }
  if(skillInfo.type === "mage_concentration"){
    playerEffects.skillBuffTurns = skillInfo.turns;
    playerEffects.finalDamageBuffTurns = Math.max(playerEffects.finalDamageBuffTurns, skillInfo.turns);
    playerEffects.finalDamageBuffPercent = Math.max(playerEffects.finalDamageBuffPercent, skillInfo.percent);
    playerEffects.manaRegenBuffTurns = skillInfo.turns;
    playerEffects.manaRegenBuffPercent = Math.max(playerEffects.manaRegenBuffPercent, skillInfo.manaRegenPercent || 0);
    message = `${actorName} usou ${skillInfo.name} e aumentou o dano total e a regeneracao de mana por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "archer_focus"){
    playerEffects.attackBuffTurns = skillInfo.turns;
    playerEffects.attackBuffAmount = Math.max(playerEffects.attackBuffAmount, skillInfo.attackBonus);
    playerEffects.guaranteedHitTurns = skillInfo.turns;
    message = `${actorName} usou ${skillInfo.name} e ficou com acerto garantido por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "archer_camouflage"){
    playerEffects.enemyMissBonusTurns = skillInfo.turns;
    playerEffects.enemyMissBonus = skillInfo.dodge;
    if(skillInfo.nextDamageBonus){
      playerEffects.nextDamageBonusPercent = Math.max(playerEffects.nextDamageBonusPercent, skillInfo.nextDamageBonus);
    }
    message = `${actorName} usou ${skillInfo.name} e ganhou ${Math.floor(skillInfo.dodge * 100)}% de esquiva adicional por ${skillInfo.turns} turnos.${skillInfo.nextDamageBonus ? " O proximo dano causado sera fortalecido." : ""}`;
  }
  if(skillInfo.type === "nature_living_seed"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    if(applyToTarget && enemy){
      applyNatureMark(skillInfo.markTurns, skillInfo.markDamage, skillInfo.enemyDamageDown);
    }
    message = `${actorName} usou ${skillInfo.name}, causou ${damage} de dano e marcou o alvo por ${skillInfo.markTurns} turnos.`;
  }
  if(skillInfo.type === "nature_roots"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    if(applyToTarget && enemy && Math.random() < skillInfo.rootChance){
      applyNatureRoot(3, skillInfo.armorDownPercent || 0);
      message = `${actorName} usou ${skillInfo.name}, causou ${damage} de dano e enraizou o inimigo.`;
    }else{
      message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.`;
    }
  }
  if(skillInfo.type === "nature_swamp_flower"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    const targetRooted = applyToTarget && enemy?.rootedTurns > 0;
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    if(targetRooted){
      applyNaturePoison(skillInfo.poisonDamage, skillInfo.poisonTurns);
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.${targetRooted ? ` O veneno causara ${skillInfo.poisonDamage} por ${skillInfo.poisonTurns} turnos.` : ""}`;
  }
  if(skillInfo.type === "nature_breeze_charm"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    const targetMarked = applyToTarget && enemy?.natureMarkTurns > 0;
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    if(applyToTarget && enemy && Math.random() < skillInfo.skipChance){
      enemy.skipNextAttack = true;
      freezeApplied = true;
    }
    if(targetMarked && Math.random() < skillInfo.rootChance){
      applyNatureRoot(3, 0);
      message = `${actorName} usou ${skillInfo.name}, causou ${damage} de dano e enraizou o alvo marcado.`;
    }else{
      message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.`;
    }
    if(skillInfo.shieldFromDamagePercent > 0 && targetMarked){
      const shield = grantPlayerShield(Math.floor(damage * skillInfo.shieldFromDamagePercent));
      if(shield > 0){ message += ` Voce recebeu ${shield} de escudo.`; }
    }
    if(freezeApplied){ message += " O inimigo pode perder o proximo turno."; }
  }
  if(skillInfo.type === "nature_harvest"){
    const includeAllDots = getPlayerSubclassState().tier60 === "druida_sombrio" && player.level >= 60;
    let extraDotDamage = 0;
    if(applyToTarget && enemy){
      if(enemy.natureMarkTurns > 0){
        extraDotDamage += includeAllDots && enemy.natureMarkDamage > 0
          ? Math.floor(enemy.natureMarkDamage * enemy.natureMarkTurns)
          : Math.floor(0.3 * getSkillPowerBonus() * enemy.natureMarkTurns);
        enemy.natureMarkTurns = 0;
        enemy.natureMarkDamage = 0;
      }
      if(includeAllDots){
        extraDotDamage += Math.floor((enemy.naturePoisonDamage || 0) * (enemy.naturePoisonTurns || 0));
        extraDotDamage += Math.floor((enemy.natureDecayDamage || 0) * (enemy.natureDecayTurns || 0));
        enemy.naturePoisonTurns = 0;
        enemy.naturePoisonDamage = 0;
        enemy.natureDecayTurns = 0;
        enemy.natureDecayDamage = 0;
      }
      extraDotDamage = Math.floor(extraDotDamage * getNatureDotMultiplier());
    }
    damage = applyFirstDamageSkillBonus(skillInfo.damage + extraDotDamage, true);
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    if(getPlayerSubclassState().tier60 === "avatar_da_natureza" && player.level >= 60){
      const shield = grantPlayerShield(Math.floor(damage * 0.7));
      message = `${actorName} usou ${skillInfo.name}, colheu os efeitos naturais e causou ${damage} de dano, ganhando ${shield} de escudo.`;
    }else{
      message = `${actorName} usou ${skillInfo.name}, colheu os efeitos naturais e causou ${damage} de dano.`;
    }
  }
  if(skillInfo.type === "nature_ancestral_song"){
    const healed = healPlayer(skillInfo.heal);
    let shield = 0;
    if(skillInfo.shield > 0){
      shield = grantPlayerShield(skillInfo.shield);
    }
    if(applyToTarget && enemy && skillInfo.enemyDamageDownPercent > 0){
      enemy.attackDownPercent = Math.max(enemy.attackDownPercent || 0, skillInfo.enemyDamageDownPercent);
      enemy.attackDownTurns = Math.max(enemy.attackDownTurns || 0, 3);
    }
    message = `${actorName} usou ${skillInfo.name} e recuperou ${healed} de vida.${shield ? ` Tambem recebeu ${shield} de escudo.` : ""}${skillInfo.enemyDamageDownPercent ? " O dano do inimigo foi reduzido por 3 turnos." : ""}`;
  }
  if(skillInfo.type === "nature_decay"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    if(applyToTarget && enemy){
      applyNatureDecay(skillInfo.decayDamage, skillInfo.decayTurns);
    }
    message = `${actorName} usou ${skillInfo.name}, causou ${damage} de dano e aplicou apodrecimento.`;
  }
  if(skillInfo.type === "nature_true_form"){
    playerEffects.natureTrueFormTurns = Math.max(playerEffects.natureTrueFormTurns, skillInfo.turns);
    playerEffects.attackBuffTurns = Math.max(playerEffects.attackBuffTurns, skillInfo.turns);
    playerEffects.attackBuffPercent = Math.max(playerEffects.attackBuffPercent, skillInfo.attackPercent);
    playerEffects.percentReductionTurns = Math.max(playerEffects.percentReductionTurns, skillInfo.turns);
    playerEffects.percentReduction = Math.max(playerEffects.percentReduction, skillInfo.damageReductionPercent);
    message = `${actorName} assumiu a ${skillInfo.name} por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "nature_queen_decree"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.`;
  }
  if(skillInfo.type === "nature_vine_cocoon"){
    const shield = grantPlayerShield(skillInfo.shield);
    message = `${actorName} usou ${skillInfo.name} e recebeu ${shield} de escudo.`;
  }
  if(skillInfo.type === "nature_swamp_collapse"){
    const hadDot = enemyHasNatureDot();
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    if(applyToTarget && enemy && !hadDot){
      applyNatureMark(4, Math.floor(0.2 * getSkillPowerBonus() * 4), 0);
      applyNaturePoison(Math.floor(0.4 * getSkillPowerBonus()), 4);
      applyNatureDecay(Math.max(1, Math.floor(enemy.maxHp * 0.015)), 4);
    }
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.${!hadDot ? " O alvo recebeu marca, veneno e apodrecimento." : ""}`;
  }
  if(skillInfo.type === "nature_crush_invader"){
    damage = applyFirstDamageSkillBonus(skillInfo.damage, true);
    damage = applyToTarget ? applyDamageToEnemy(damage, { skillCost: cost }) : damage;
    message = `${actorName} usou ${skillInfo.name} e causou ${damage} de dano.`;
  }
  if(skillInfo.type === "nature_crown"){
    playerEffects.natureCrownedTurns = Math.max(playerEffects.natureCrownedTurns, skillInfo.turns);
    message = `${actorName} usou ${skillInfo.name} e ficou coroada por ${skillInfo.turns} turnos.`;
  }
  if(skillInfo.type === "nature_throw_thorns"){
    const consumedShield = playerEffects.shieldValue || 0;
    damage = applyFirstDamageSkillBonus(Math.floor(consumedShield * 2), true);
    playerEffects.shieldValue = 0;
    playerEffects.shieldTurns = 0;
    damage = applyToTarget ? applyDamageToEnemy(damage, { ignoreArmor: true, ignoreShield: true, skillCost: cost }) : damage;
    message = `${actorName} consumiu ${consumedShield} de escudo com ${skillInfo.name} e causou ${damage} de dano.`;
  }
  playerEffects.lastActionType = skillInfo.type;
  return { blocked: false, message, damage, freeTurn, freezeApplied };
}

function getRarityStat(statKey, rarity){
  return rarityStats[statKey]?.[rarity] || 0;
}

function applyEquipmentRarityStats(item, baseStats){
  for(const bonusKey of ["bonusHp", "bonusMp", "bonusAttack", "skillPower", "reflectPercent", "coinBonus", "xpBonus", "turnHealPercent", "burnDamageReductionPercent", "flatReduction", "bonusMpPercent", "bonusHpPercent", "totalDamagePercent", "fatalSaveHealPercent", "critChanceBonus"]){
    delete item[bonusKey];
  }
  const rarityMultiplier = rarityMultipliers[item.rarity] || 1;
  for(const [bonusKey, baseValue] of Object.entries(baseStats || {})){
    const isDecimalStat = ["reflectPercent", "coinBonus", "xpBonus", "turnHealPercent", "burnDamageReductionPercent", "bonusMpPercent", "bonusHpPercent", "totalDamagePercent", "fatalSaveHealPercent", "critChanceBonus"].includes(bonusKey);
    const rawValue = baseValue * rarityMultiplier;
    const value = isDecimalStat ? Math.round(rawValue * 10000) / 10000 : Math.ceil(rawValue);
    if(value > 0){
      item[bonusKey] = value;
    }
  }
}

function normalizeEquipmentMetadata(item){
  if(!item || item.type !== "equipment"){ return item; }
  if(!item.baseItemId){
    const raritySuffix = item.rarity ? `_${item.rarity}` : "";
    item.baseItemId = item.id?.endsWith(raritySuffix) ? item.id.slice(0, -raritySuffix.length) : item.id;
  }
  const legacyDrop = legacyDropByBaseId[item.baseItemId];
  if(legacyDrop){
    item.enemyName = item.enemyName || legacyDrop.enemyName;
    item.regionName = item.regionName || getRegionFromEnemy(legacyDrop.enemyName);
    item.slot = item.slot || legacyDrop.slot;
    item.classRestriction = item.slot === "weapon" ? (item.classRestriction || legacyDrop.classRestriction) : null;
  }
  if(item.enemyName && !item.regionName){
    item.regionName = getRegionFromEnemy(item.enemyName);
  }
  if(!["weapon"].includes(item.slot)){
    item.classRestriction = null;
  }
  if(item.regionName && item.slot !== "accessory"){
    item.setId = `${slugify(item.regionName)}_set`;
    item.setName = getRegionSetLabel(item.regionName);
    const refreshedTemplate = getRegionSetTemplate(item.regionName, item.slot, item.classRestriction || player?.class || "Guerreiro");
    if(refreshedTemplate){
      item.baseItemId = refreshedTemplate.id;
      item.id = `${refreshedTemplate.id}_${item.rarity}`;
      applyEquipmentRarityStats(item, refreshedTemplate.baseStats);
      item.name = `${refreshedTemplate.name} ${getRarityInfo(item.rarity).label}`;
    }
  }else if(item.regionName && item.slot === "accessory"){
    item.setId = null;
    item.setName = null;
    const accessoryTemplate = getBossAccessoryTemplate(item.regionName);
    if(accessoryTemplate){
      item.baseItemId = accessoryTemplate.id;
      item.id = `${accessoryTemplate.id}_${item.rarity}`;
      applyEquipmentRarityStats(item, accessoryTemplate.baseStats);
      item.name = `${accessoryTemplate.name} ${getRarityInfo(item.rarity).label}`;
    }
  }
  return item;
}

function buildEquipmentDescription(item){
  item = normalizeEquipmentMetadata(item);
  const lines = [];
  const statText = formatStatBonusList(item);
  if(statText){ lines.push(statText); }
  if(item.slot === "accessory" && item.regionName){
    lines.push(`Acessorio raro do chefao de ${item.regionName}`);
  }
  if(item.setId && item.setName){
    const setPieces = getEquippedSetCount(item.setId);
    const setBonus = getSetBonusValues(item.regionName);
    lines.push(`${item.setName} (${setPieces}/5)`);
    lines.push(`Bonus do set completo: ${formatStatBonusList(setBonus)}`);
  }
  lines.push(item.classRestriction ? `Equipavel apenas por ${item.classRestriction}.` : "Equipavel por qualquer classe.");
  return lines.join(". ");
}

function getEquipmentTooltip(item){
  if(!item){
    return "Espaco vazio.";
  }
  return `${buildEquipmentDescription(item)} Clique com o botao direito para desequipar.`;
}

function getItemToneClass(item){
  const toneSource = item?.regionName || item?.region || "neutral";
  return `tone-${toCssToken(toneSource) || "neutral"}`;
}

function getItemRarityVisualClass(item){
  return `item-rarity-${toCssToken(item?.rarity || "comum")}`;
}

function getWeaponVisualKind(item){
  if(item?.classRestriction === "Arqueiro"){ return "weapon-bow"; }
  if(item?.classRestriction === "Mago"){ return "weapon-staff"; }
  return "weapon-sword";
}

function getPotionVisualKind(item){
  if(item?.id === "health_potion"){ return "health"; }
  if(item?.id === "mana_potion"){ return "mana"; }
  if(item?.id === "skill_tonic"){ return "skill"; }
  return "attack";
}

function getInventoryItemSymbol(item){
  if(!item){ return "🎒"; }
  if(item.type === "consumable"){
    if(item.id === "health_potion"){ return "🧪"; }
    if(item.id === "mana_potion"){ return "🔵"; }
    if(item.id === "skill_tonic"){ return "✨"; }
    return "⚔️";
  }
  if(item.type === "chest"){
    return "📦";
  }
  if(item.type === "material"){
    return "🦴";
  }
  if(item.type === "equipment"){
    if(item.slot === "accessory"){ return "📿"; }
    if(item.slot === "weapon"){
      if(item.classRestriction === "Arqueiro"){ return "🏹"; }
      if(item.classRestriction === "Mago"){ return "🪄"; }
      return "🗡️";
    }
    if(item.slot === "head"){ return "🪖"; }
    if(item.slot === "chest"){ return "🛡️"; }
    if(item.slot === "legs"){ return "👖"; }
    if(item.slot === "feet"){ return "🥾"; }
    if(item.slot === "accessory"){ return "📿"; }
  }
  return "📦";
}

function getItemSpriteMarkup(item){
  if(!item){
    return `<div class="item-sprite chest"><span class="item-part body"></span><span class="item-part lid"></span><span class="item-part lock"></span></div>`;
  }
  if(item.type === "consumable"){
    const kind = getPotionVisualKind(item);
    return `<div class="item-sprite potion ${kind}"><span class="item-part cork"></span><span class="item-part bottle"></span><span class="item-part liquid"></span></div>`;
  }
  if(item.type === "chest"){
    return `<div class="item-sprite chest"><span class="item-part lid"></span><span class="item-part body"></span><span class="item-part lock"></span><span class="item-part band-left"></span><span class="item-part band-right"></span></div>`;
  }
  if(item.type === "equipment"){
    if(item.slot === "weapon"){
      const kind = getWeaponVisualKind(item);
      if(kind === "weapon-bow"){
        return `<div class="item-sprite ${kind}"><span class="item-part bow"></span><span class="item-part string"></span><span class="item-part arrow"></span></div>`;
      }
      if(kind === "weapon-staff"){
        return `<div class="item-sprite ${kind}"><span class="item-part shaft"></span><span class="item-part orb"></span><span class="item-part rune"></span></div>`;
      }
      return `<div class="item-sprite ${kind}"><span class="item-part blade"></span><span class="item-part guard"></span><span class="item-part hilt"></span><span class="item-part pommel"></span></div>`;
    }
    if(item.slot === "head"){
      return `<div class="item-sprite armor-head"><span class="item-part helm"></span><span class="item-part visor"></span><span class="item-part crest"></span></div>`;
    }
    if(item.slot === "chest"){
      return `<div class="item-sprite armor-chest"><span class="item-part pauldron-left"></span><span class="item-part pauldron-right"></span><span class="item-part plate"></span><span class="item-part emblem"></span></div>`;
    }
    if(item.slot === "legs"){
      return `<div class="item-sprite armor-legs"><span class="item-part belt"></span><span class="item-part leg-left"></span><span class="item-part leg-right"></span></div>`;
    }
    if(item.slot === "feet"){
      return `<div class="item-sprite armor-feet"><span class="item-part boot-left"></span><span class="item-part boot-right"></span><span class="item-part sole-left"></span><span class="item-part sole-right"></span></div>`;
    }
  }
  return `<div class="item-sprite chest"><span class="item-part lid"></span><span class="item-part body"></span><span class="item-part lock"></span></div>`;
}

function getInventoryItemCardMarkup(item, description, actionButton = "", compact = false){
  const rarityInfo = item?.rarity ? getRarityInfo(item.rarity) : null;
  const rarityLine = rarityInfo ? `<span class="inventory-tag ${rarityInfo.cssClass}">${rarityInfo.label}</span>` : "";
  const quantityLine = item?.qty ? `<span class="inventory-qty-badge">x${item.qty}</span>` : "";
  const regionLine = item?.regionName ? `<span class="inventory-tag">${item.regionName}</span>` : item?.region ? `<span class="inventory-tag">${item.region}</span>` : "";
  const tooltipText = description || "";
  const tooltipAttrs = tooltipText ? ` class="inventory-item has-tooltip" data-tooltip="${tooltipText}"` : ` class="inventory-item"`;
  const shouldShowInlineDescription = !["equipment", "material"].includes(item?.type);
  return `<div${tooltipAttrs}>
    <div class="simple-item-line">
      <div class="simple-item-symbol">
        ${getInventoryItemSymbol(item)}
      </div>
      <div class="simple-item-copy">
        <div class="inventory-title-row">
          <strong>${item?.name || "Item"}</strong>
          ${quantityLine}
        </div>
        <div class="inventory-meta">${rarityLine}${regionLine}</div>
        ${shouldShowInlineDescription ? `<span class="lock-note inventory-subtext">${description || ""}</span>` : ""}
        ${actionButton}
      </div>
    </div>
  </div>`;
}

function createEquipmentItem(dropTemplate, rarity){
  const rarityInfo = getRarityInfo(rarity);
  const baseStats = dropTemplate.baseStats || dropTemplate.stats || {};
  const item = {
    id: `${dropTemplate.id}_${rarity}`,
    baseItemId: dropTemplate.id,
    name: `${dropTemplate.name} ${rarityInfo.label}`,
    type: "equipment",
    slot: dropTemplate.slot,
    classRestriction: dropTemplate.classRestriction,
    rarity,
    rarityLabel: rarityInfo.label,
    regionName: dropTemplate.regionName || null,
    setId: dropTemplate.setId || null,
    setName: dropTemplate.setName || null
  };
  applyEquipmentRarityStats(item, baseStats);
  item.description = buildEquipmentDescription(item);
  return item;
}

function getDropTemplateFromItem(item){
  item = normalizeEquipmentMetadata(item);
  if(item?.slot === "accessory" && item?.regionName){
    return getBossAccessoryTemplate(item.regionName);
  }
  if(item?.regionName){
    return getRegionSetTemplate(item.regionName, item.slot, item.classRestriction || player?.class || "Guerreiro");
  }
  const legacyDrop = legacyDropByBaseId[item?.baseItemId];
  if(legacyDrop){
    return getRegionSetTemplate(getRegionFromEnemy(legacyDrop.enemyName), item.slot || legacyDrop.slot, item.classRestriction || legacyDrop.classRestriction || player?.class || "Guerreiro");
  }
  return null;
}

function canEquipItem(item){
  item = normalizeEquipmentMetadata(item);
  return !item.classRestriction || item.classRestriction === player.class;
}

function getSellPrice(item){
  if(item.type === "consumable"){
    const price = consumableCatalog[item.id]?.price || 20;
    return Math.max(8, Math.floor(price * 0.5));
  }
  if(item.type === "chest"){
    return 35;
  }
  if(item.type === "material"){
    return 12;
  }
  if(item.type === "equipment"){
    return Math.max(
      18,
      Math.floor(
        10
        + (item.bonusHp || 0) * 0.8
        + (item.bonusMp || 0) * 1
        + (item.bonusAttack || 0) * 7
        + (item.skillPower || 0) * 6
        + Math.floor((item.reflectPercent || 0) * 600)
        + Math.floor((item.coinBonus || 0) * 600)
        + Math.floor((item.xpBonus || 0) * 800)
        + Math.floor((item.turnHealPercent || 0) * 2600)
        + Math.floor((item.burnDamageReductionPercent || 0) * 700)
        + (item.flatReduction || 0) * 18
        + Math.floor((item.bonusMpPercent || 0) * 900)
        + Math.floor((item.bonusHpPercent || 0) * 900)
        + Math.floor((item.totalDamagePercent || 0) * 1200)
        + Math.floor((item.fatalSaveHealPercent || 0) * 2200)
        + Math.floor((item.critChanceBonus || 0) * 900)
      )
    );
  }
  return 8;
}

function getForgeUpgradeCost(item){
  const rarityRank = getRarityRank(item.rarity);
  const baseCost = 70 + rarityRank * 95;
  return item.slot === "accessory" ? Math.floor(baseCost * 12) : baseCost;
}

function getForgeUpgradeChance(item){
  const rarityRank = getRarityRank(item.rarity);
  const chances = [0.8, 0.58, 0.36, 0.18];
  return chances[rarityRank] || 0;
}

function createConsumableItem(id, qty = 1){
  const data = consumableCatalog[id];
  if(!data){ return null; }
  return {
    id,
    name: data.name,
    qty,
    type: "consumable",
    description: data.description
  };
}

function removeInventoryUnit(itemIndex){
  const item = player.inventory[itemIndex];
  if(!item){ return; }
  if((item.qty || 1) > 1){
    item.qty--;
  }else{
    player.inventory.splice(itemIndex, 1);
  }
}

function getEquipmentDisplayName(item){
  if(!item){
    return `<span class="slot-empty">Espaco vazio</span>`;
  }
  const rarityInfo = getRarityInfo(item.rarity);
  return `<span class="simple-item-symbol" style="width:30px;height:30px;font-size:16px;margin:0 auto 6px;">${getInventoryItemSymbol(item)}</span><span class="${rarityInfo.cssClass}">${item.name}</span>`;
}

function getEquipmentSlotClass(item){
  return item ? "filled" : "empty";
}

function renderEquipmentShowcase(){
  return `
    <div class="equipment-layout">
      <div class="equipment-stack">
        <div class="equip-slot action-btn equip-weapon ${getEquipmentSlotClass(player.equipment.weapon)}" data-tooltip="${getEquipmentTooltip(player.equipment.weapon)}" oncontextmenu="return unequipItem('weapon', event)"><strong>${slotLabels.weapon}</strong>${getEquipmentDisplayName(player.equipment.weapon)}</div>
        <div class="equip-slot action-btn equip-accessory ${getEquipmentSlotClass(player.equipment.accessory)}" data-tooltip="${getEquipmentTooltip(player.equipment.accessory)}" oncontextmenu="return unequipItem('accessory', event)"><strong>${slotLabels.accessory}</strong>${getEquipmentDisplayName(player.equipment.accessory)}</div>
      </div>
      <div class="equipment-body">
        <div class="hero-silhouette">${classIcons[player.class] || "&#x2726;"}</div>
        <div class="equipment-stack">
          <div class="equip-slot action-btn equip-head ${getEquipmentSlotClass(player.equipment.head)}" data-tooltip="${getEquipmentTooltip(player.equipment.head)}" oncontextmenu="return unequipItem('head', event)"><strong>${slotLabels.head}</strong>${getEquipmentDisplayName(player.equipment.head)}</div>
          <div class="equip-slot action-btn equip-chest ${getEquipmentSlotClass(player.equipment.chest)}" data-tooltip="${getEquipmentTooltip(player.equipment.chest)}" oncontextmenu="return unequipItem('chest', event)"><strong>${slotLabels.chest}</strong>${getEquipmentDisplayName(player.equipment.chest)}</div>
          <div class="equip-slot action-btn equip-legs ${getEquipmentSlotClass(player.equipment.legs)}" data-tooltip="${getEquipmentTooltip(player.equipment.legs)}" oncontextmenu="return unequipItem('legs', event)"><strong>${slotLabels.legs}</strong>${getEquipmentDisplayName(player.equipment.legs)}</div>
          <div class="equip-slot action-btn equip-feet ${getEquipmentSlotClass(player.equipment.feet)}" data-tooltip="${getEquipmentTooltip(player.equipment.feet)}" oncontextmenu="return unequipItem('feet', event)"><strong>${slotLabels.feet}</strong>${getEquipmentDisplayName(player.equipment.feet)}</div>
        </div>
      </div>
    </div>`;
}

function renderForgePanel(){
  const equippedItems = equipmentSlots
    .map(slot => ({ slot, label: slotLabels[slot], item: normalizeEquipmentMetadata(player.equipment?.[slot]) }))
    .filter(entry => entry.item);
  if(!equippedItems.length){
    return `<div class="inventory-item"><div class="panel-header"><strong>Ferreiro</strong><span class="coin-badge">${player.coins} moedas</span></div><span class="lock-note">Equipe um item no acampamento para tentar aprimora-lo aqui.</span></div>`;
  }
  return `<div class="inventory-item"><div class="panel-header"><strong>Ferreiro</strong><span class="coin-badge">${player.coins} moedas</span></div><span class="lock-note">Tente elevar a raridade dos seus equipamentos equipados. Cada novo grau fica mais caro e mais dificil.</span><div class="inventory-list">${equippedItems.map(entry => {
    const chance = Math.floor(getForgeUpgradeChance(entry.item) * 100);
    const cost = getForgeUpgradeCost(entry.item);
    const atMax = getRarityRank(entry.item.rarity) >= rarityOrder.length - 1;
    const feedbackClass = forgeFeedback.slot === entry.slot ? (forgeFeedback.result === "success" ? "forge-feedback-success" : forgeFeedback.result === "fail" ? "forge-feedback-fail" : "") : "";
    return `<div class="${feedbackClass}">${getInventoryItemCardMarkup(entry.item, `${entry.label}. ${atMax ? "Raridade maxima alcancada." : `Tentativa: ${cost} moedas | Chance: ${chance}%`}`, `<div class="button-row"><button onclick="tryUpgradeEquippedItem('${entry.slot}')" ${atMax ? "disabled" : ""}>Aprimorar</button></div>`, true)}</div>`;
  }).join("")}</div></div>`;
}

function getEnemyStatusEffects(targetEnemy){
  if(!targetEnemy){ return []; }
  const effects = [];
  if(targetEnemy.bossBuffTurns > 0){
    effects.push({ kind: "buff", text: `Buff do boss | ${targetEnemy.bossBuffTurns} turno(s)` });
  }
  if(targetEnemy.attackDownTurns > 0 && targetEnemy.attackDownPercent > 0){
    effects.push({ kind: "debuff", text: `Ataque -${Math.floor(targetEnemy.attackDownPercent * 100)}% | ${targetEnemy.attackDownTurns} turno(s)` });
  }
  if(targetEnemy.armorDownTurns > 0 && targetEnemy.armorDownPercent > 0){
    effects.push({ kind: "debuff", text: `Armadura -${Math.floor(targetEnemy.armorDownPercent * 100)}% | ${targetEnemy.armorDownTurns} turno(s)` });
  }
  if(targetEnemy.healReductionTurns > 0 && targetEnemy.healReductionPercent > 0){
    effects.push({ kind: "debuff", text: `Cura -${Math.floor(targetEnemy.healReductionPercent * 100)}% | ${targetEnemy.healReductionTurns} turno(s)` });
  }
  if(targetEnemy.noShieldTurns > 0){
    effects.push({ kind: "debuff", text: `Sem escudo | ${targetEnemy.noShieldTurns} turno(s)` });
  }
  if(targetEnemy.skipNextAttack){
    effects.push({ kind: "control", text: "Proximo turno bloqueado" });
  }
  if(targetEnemy.rootedTurns > 0){
    effects.push({ kind: "control", text: `Enraizado | ${targetEnemy.rootedTurns} turno(s)` });
  }
  if(targetEnemy.natureMarkTurns > 0){
    effects.push({ kind: "debuff", text: `Marca | ${targetEnemy.natureMarkTurns} turno(s)` });
  }
  if(targetEnemy.naturePoisonTurns > 0 && targetEnemy.naturePoisonDamage > 0){
    effects.push({ kind: "debuff", text: `Veneno ${targetEnemy.naturePoisonDamage}/t | ${targetEnemy.naturePoisonTurns} turno(s)` });
  }
  if(targetEnemy.natureDecayTurns > 0 && targetEnemy.natureDecayDamage > 0){
    effects.push({ kind: "debuff", text: `Apodrecimento ${targetEnemy.natureDecayDamage}/t | ${targetEnemy.natureDecayTurns} turno(s)` });
  }
  if(targetEnemy.dotTurns > 0 && targetEnemy.dotDamagePerTurn > 0){
    effects.push({ kind: "debuff", text: `${targetEnemy.dotSourceName || "DOT"} ${targetEnemy.dotDamagePerTurn}/t | ${targetEnemy.dotTurns} turno(s)` });
  }
  if(targetEnemy.frozenDamageBonusPercent > 0){
    effects.push({ kind: "control", text: `Congelado | +${Math.floor(targetEnemy.frozenDamageBonusPercent * 100)}% no proximo dano` });
  }
  return effects;
}

function renderAlchemistPanel(){
  return `<div class="inventory-item"><div class="panel-header"><strong>Alquimista</strong><span class="coin-badge">${player.coins} moedas</span></div><span class="lock-note">Misturas raras e reforcos temporarios para a aventura.</span><div class="inventory-list">${Object.entries(consumableCatalog).map(([id, item]) => getInventoryItemCardMarkup({ id, type: "consumable", name: item.name }, item.description, `<div class="button-row"><button onclick="buyConsumable('${id}')">Comprar (${item.price} moedas)</button></div>`, true)).join("")}</div></div>`;
}

function renderArtisanPanel(){
  const selectedRegion = artisanRegionFilter && regions[artisanRegionFilter] ? artisanRegionFilter : currentRegion;
  const recipes = getRegionCraftRecipes(selectedRegion, player.class);
  const regionData = regions[selectedRegion];
  if(!regionData){
    return `<div class="inventory-item"><div class="panel-header"><strong>Artesao</strong><span class="coin-badge">${player.coins} moedas</span></div><span class="lock-note">Selecione uma regiao valida para montar pecas.</span></div>`;
  }
  return `<div class="inventory-item">
    <div class="panel-header"><strong>Artesao</strong><span class="coin-badge">${player.coins} moedas</span></div>
    <span class="lock-note">Escolha a regiao do set que voce quer montar. Cada receita usa pelo menos 1 parte de cada inimigo da regiao, com variacoes extras por tipo de equipamento.</span>
    <div class="tabs" style="margin:12px 0 16px;">${Object.keys(regions).map(regionName => `<button class="tab-btn ${selectedRegion === regionName ? "active" : ""}" onclick="setArtisanRegion('${regionName}')">${regionName}</button>`).join("")}</div>
    <div class="inventory-list" style="margin-top:12px;">${recipes.map(recipe => {
      const requirementsText = Object.entries(recipe.requirements).map(([itemId, qty]) => {
        const materialName = (player.inventory.find(item => item.id === itemId)?.name) || Object.values(enemyMaterialDrops || {}).find(entry => entry.id === itemId)?.name || itemId;
        return `${materialName} x${qty}`;
      }).join(" | ");
      const craftTooltip = `Custo: ${recipe.cost} moedas | Materiais: ${requirementsText}`;
      return getInventoryItemCardMarkup(
        { ...recipe.template, type: "equipment", rarity: "comum", name: recipe.template.name },
        `${buildEquipmentDescription(createEquipmentItem(recipe.template, "comum"))} Custo: ${recipe.cost} moedas. Materiais: ${requirementsText}.`,
        `<div class="button-row"><div class="has-tooltip" data-tooltip="${craftTooltip}"><button class="action-btn" onclick="craftRegionEquipment('${selectedRegion}','${recipe.slot}')" ${canCraftRecipe(recipe) ? "" : "disabled"}>Craftar</button></div></div>`,
        true
      );
    }).join("")}</div>
  </div>`;
}

function renderVillagePanel(){
  const tabs = `
    <div class="tabs" style="margin:12px 0 16px;">
      <button class="tab-btn ${villageTab === "inn" ? "active" : ""}" onclick="setVillageTab('inn')">Pousada</button>
      <button class="tab-btn ${villageTab === "alchemist" ? "active" : ""}" onclick="setVillageTab('alchemist')">Alquimista</button>
      <button class="tab-btn ${villageTab === "forge" ? "active" : ""}" onclick="setVillageTab('forge')">Ferreiro</button>
      <button class="tab-btn ${villageTab === "artisan" ? "active" : ""}" onclick="setVillageTab('artisan')">Artesao</button>
    </div>`;
  if(villageTab === "alchemist"){
    return `${tabs}${renderAlchemistPanel()}`;
  }
  if(villageTab === "forge"){
    return `${tabs}${renderForgePanel()}`;
  }
  if(villageTab === "artisan"){
    return `${tabs}${renderArtisanPanel()}`;
  }
  return `${tabs}
    <div class="inventory-list">
      <div class="inventory-item">
        <strong>Pousada</strong><br>
        <span class="lock-note">Recupera toda a sua vida atual por ${getHealCost()} moedas.</span>
        <div class="button-row"><button onclick="healAtVillage()">Curar Vida (${getHealCost()} moedas)</button></div>
      </div>
      <div class="inventory-item">
        <strong>Recuperacao de mana</strong><br>
        <span class="lock-note">Recupera toda a sua mana atual por ${getManaHealCost()} moedas.</span>
        <div class="button-row"><button onclick="restoreManaAtVillage()">Curar Mana (${getManaHealCost()} moedas)</button></div>
      </div>
    </div>`;
}

function getModeShortcutMap(){
  return {
    Digit1: "battle",
    Digit2: "village",
    Digit3: "camp",
    Digit4: "trophies",
    Digit5: "bestiary",
    Digit6: "dungeon"
  };
}

function shouldIgnoreShortcutTarget(target){
  if(!target){ return false; }
  const tagName = (target.tagName || "").toUpperCase();
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(tagName);
}

function handleModeShortcut(event){
  if(!player || shouldIgnoreShortcutTarget(event.target) || event.ctrlKey || event.altKey || event.metaKey){
    return;
  }
  const shortcutMode = getModeShortcutMap()[event.code];
  if(!shortcutMode){ return; }
  event.preventDefault();
  if(IS_DUNGEON_PAGE){
    if(shortcutMode === "battle"){
      returnToMainPage("battle");
    }
    return;
  }
  setMode(shortcutMode);
}

window.addEventListener("keydown", handleModeShortcut);

function getBaseEnemyName(enemyName){
  return enemyName.replace(/ Lv\.\d+$/, "");
}

function getRarityInfo(rarity){
  return rarityData[rarity] || rarityData.comum;
}

function getRarityRank(rarity){
  return rarityOrder.indexOf(rarity);
}

function getEnemyRarity(region, enemyName, isBoss = false){
  if(isBoss){
    return { key: "ultra_rara", label: "Chefao", cssClass: "rarity-ultra-rara" };
  }
  const regionData = region === "Dungeon" ? dungeonData : regions[region];
  if(!regionData || !regionData.enemies){
    return { key: "comum", label: "Comum", cssClass: "rarity-comum" };
  }
  const orderedEnemies = [...regionData.enemies].sort((a, b) => b.weight - a.weight);
  const index = orderedEnemies.findIndex(enemyData => enemyData.name === enemyName);
  const rarityByIndex = ["comum", "incomum", "rara"];
  const rarityKey = rarityByIndex[index] || "comum";
  const rarityInfo = getRarityInfo(rarityKey);
  return { key: rarityKey, label: rarityInfo.label, cssClass: rarityInfo.cssClass };
}

function getEnemyPossibleDrop(enemyName, region, isBoss = false){
  if(isBoss){
    const accessoryName = getBossAccessoryTemplate(region)?.name;
    return accessoryName ? `Bau da ${region} | 3%: ${accessoryName}` : `Bau da ${region}`;
  }
  if(region === "Dungeon"){
    return "Tesouros da expedicao ainda nao catalogados";
  }
  const slots = getRegionDropSlots(region, enemyName);
  if(!slots.length){ return "Sem drop conhecido"; }
  const gearText = slots.map(slot => getRegionSetTemplate(region, slot, player?.class || "Guerreiro")?.name).join(" ou ");
  const materialName = getEnemyMaterialTemplate(enemyName, region).name;
  return `${gearText} | 20%: ${materialName}`;
}

function getSelectedBestiaryRegion(){
  if(bestiaryRegionFilter && regions[bestiaryRegionFilter] && isRegionUnlockedForBattle(bestiaryRegionFilter)){
    return bestiaryRegionFilter;
  }
  if(regions[currentRegion] && isRegionUnlockedForBattle(currentRegion)){
    return currentRegion;
  }
  return Object.keys(regions).find(regionName => isRegionUnlockedForBattle(regionName)) || Object.keys(regions)[0];
}

function setBestiaryRegion(regionName){
  if(!regions[regionName] || !isRegionUnlockedForBattle(regionName)){ return; }
  bestiaryRegionFilter = regionName;
  updateUI();
}

function getBossAbilityDetailText(ability){
  const details = [];
  if(Number.isFinite(ability.power)){ details.push(`Dano base ${ability.power}`); }
  if(ability.maxHpPercent){ details.push(`+${Math.floor(ability.maxHpPercent * 100)}% da vida maxima do alvo`); }
  if(ability.targetBurnPercent && ability.targetBurnTurns){ details.push(`Queimadura de ${Math.floor(ability.targetBurnPercent * 100)}% da vida maxima por ${ability.targetBurnTurns} turnos`); }
  if(ability.targetHealReductionPercent && ability.targetHealReductionTurns){ details.push(`Corta cura em ${Math.floor(ability.targetHealReductionPercent * 100)}% por ${ability.targetHealReductionTurns} turnos`); }
  if(ability.targetDamageDownPercent && ability.targetDamageDownTurns){ details.push(`Reduz seu dano em ${Math.floor(ability.targetDamageDownPercent * 100)}% por ${ability.targetDamageDownTurns} turnos`); }
  if(ability.targetSkipChance){ details.push(`${Math.floor(ability.targetSkipChance * 100)}% de chance de pular seu proximo turno`); }
  if(ability.ignoreShield){ details.push("Ignora escudo"); }
  if(ability.ignoreFlatReduction){ details.push("Ignora resistencia fixa"); }
  if(ability.bonusIfShield){ details.push(`Ganha +${ability.bonusIfShield} se o alvo tiver escudo`); }
  if(ability.bonusIfNoShield){ details.push(`Ganha +${ability.bonusIfNoShield} se o alvo estiver sem escudo`); }
  if(ability.attackPercent){ details.push(`Buffa o proprio dano em ${Math.floor(ability.attackPercent * 100)}%${ability.turns ? ` por ${ability.turns} turnos` : ""}`); }
  if(ability.flatDamageBonus){ details.push(`Recebe +${ability.flatDamageBonus} de dano bruto${ability.turns ? ` por ${ability.turns} turnos` : ""}`); }
  if(ability.pierceBonus){ details.push(`Ganha ${Math.floor(ability.pierceBonus * 100)}% de perfuracao adicional${ability.turns ? ` por ${ability.turns} turnos` : ""}`); }
  if(ability.regenPercent){ details.push(`Regenera ${Math.floor(ability.regenPercent * 100)}% da vida por turno${ability.turns ? ` por ${ability.turns} turnos` : ""}`); }
  if(ability.selfShieldPercent || ability.selfShieldFlat){
    const shieldText = ability.selfShieldPercent ? `${Math.floor(ability.selfShieldPercent * 100)}% da propria vida` : `${ability.selfShieldFlat} de escudo`;
    details.push(`Cria escudo de ${shieldText}${ability.shieldTurns ? ` por ${ability.shieldTurns} turnos` : ""}`);
  }
  return details.join(" | ");
}

const beastRigEnemies = new Set(["Lobo Sombrio", "Sapo Colossal", "Quimera Solar"]);
const humanoidRigEnemies = new Set(["Goblin", "Cultista Perdido", "Bruxa do Brejo", "Maga da Muralha", "Feiticeira Morta", "Oraculo Radiante", "Oraculo do Zero"]);
const armoredRigEnemies = new Set(["Sentinela Quebrada", "Cavaleiro Abissal", "Escudeiro de Ferro", "Carrasco de Guerra", "Guardiao Funebre", "Executor Astral", "Guardiao Aureo", "Arauto do Cataclismo", "Guardiao Temporal", "Troll das Profundezas", "General de Aco", "Carcereiro Abissal"]);
const arachnidRigEnemies = new Set(["Aranha Gigante", "Aracnida Rainha"]);
const slimeRigEnemies = new Set(["Slime Toxico"]);
const serpentRigEnemies = new Set(["Serpente do Lodo", "Lamia do Eclipse", "Hidra do Lodo"]);
const wingedRigEnemies = new Set(["Morcego de Pedra", "Salamandra Rubra", "Fenix Sombria", "Drake Celeste", "Anjo Caido", "Serafim do Fim", "Draco Magmatico", "Imperador do Eclipse", "Avatar do Zenith"]);
const specterRigEnemies = new Set(["Fantasma Antigo", "Rei Espectral", "Arauto do Vazio", "Lorde da Cripta", "Soberano do Paradoxo"]);
const reaperRigEnemies = new Set(["Ceifador de Ossos", "Devorador de Eras", "Devorador do Eco"]);
const colossusRigEnemies = new Set(["Golem de Brasa", "Colosso do Vazio", "Titan Rachado", "Deus da Ruina"]);
const entRigEnemies = new Set(["Ent Ancestral"]);

function getEnemyRigArchetype(enemyName = ""){
  if(entRigEnemies.has(enemyName)){ return "ent"; }
  if(arachnidRigEnemies.has(enemyName)){ return "arachnid"; }
  if(slimeRigEnemies.has(enemyName)){ return "slime"; }
  if(serpentRigEnemies.has(enemyName)){ return "serpent"; }
  if(wingedRigEnemies.has(enemyName)){ return "winged"; }
  if(specterRigEnemies.has(enemyName)){ return "specter"; }
  if(reaperRigEnemies.has(enemyName)){ return "reaper"; }
  if(colossusRigEnemies.has(enemyName)){ return "colossus"; }
  if(armoredRigEnemies.has(enemyName)){ return "armored"; }
  if(humanoidRigEnemies.has(enemyName)){ return "humanoid"; }
  if(beastRigEnemies.has(enemyName)){ return "beast"; }
  return "humanoid";
}

function getEnemyRigTokenClass(targetEnemy){
  return `enemy-${toCssToken(targetEnemy?.baseName || targetEnemy?.name || "desconhecido")}`;
}

function getEnemyRigWrapperClass(targetEnemy){
  const archetype = getEnemyRigArchetype(targetEnemy?.baseName || targetEnemy?.name || "");
  return `combat-entity enemy-entity enemy-${archetype}-entity ${getEnemyRigTokenClass(targetEnemy)}${targetEnemy?.isBoss ? " enemy-boss" : ""}`;
}

function getEnemySpriteMarkup(targetEnemy){
  const className = `${getEnemyRigTokenClass(targetEnemy)}${targetEnemy?.isBoss ? " enemy-boss" : ""}`;
  return `<div id="enemySprite" class="sprite-figure emoji-sprite ${className}">${getEnemySpriteIcon(targetEnemy)}</div>`;
}

function getHeroCombatFxMarkup(){
  return `
    <span class="combat-fx fx-hit-burst"></span>
    <span class="combat-fx fx-buff-ring"></span>
    <span class="combat-fx fx-sword-slash"></span>
    <span class="combat-fx fx-arrow-shot"></span>
    <span class="combat-fx fx-magic-tail"></span>
    <span class="combat-fx fx-magic-orb"></span>`;
}

function getEnemyCombatFxMarkup(){
  return `
    <span class="combat-fx fx-hit-burst"></span>
    <span class="combat-fx fx-enemy-slash"></span>
    <span class="combat-fx fx-enemy-shot"></span>
    <span class="combat-fx fx-enemy-cast"></span>
    <span class="combat-fx fx-enemy-buff"></span>`;
}

function getSceneBackdropMarkup(regionName){
  const token = toCssToken(regionName);
  return `
    <div class="scene-atmosphere scene-atmosphere-${token}">
      <span class="scene-haze back"></span>
      <span class="scene-haze front"></span>
      <span class="scene-glow one"></span>
      <span class="scene-glow two"></span>
    </div>
    <div class="scene-props scene-props-${token}">
      <span class="scene-prop-ground"></span>
      <span class="scene-prop left"></span>
      <span class="scene-prop mid"></span>
      <span class="scene-prop right"></span>
    </div>`;
}

function renderCombatScene(activeEnemy = null, regionName = currentRegion){
  const sceneEnemy = activeEnemy || null;
  const heroClass = getHeroSpriteClass();
  const sceneClass = getRegionSpriteClass(regionName);
  const displayedClassName = getDisplayedClassName();
  const heroClassLine = displayedClassName !== player.class
    ? `<div class="scene-subclass-line"><span class="scene-subclass-glyph">${getHeroSpriteIcon()}</span><span>${displayedClassName} | Base ${player.class}</span></div>`
    : `<div class="scene-subclass-line"><span class="scene-subclass-glyph">${getHeroSpriteIcon()}</span><span>${player.class}</span></div>`;
  const enemySide = sceneEnemy
    ? `<div class="${getEnemyRigWrapperClass(sceneEnemy)}" id="enemySpriteBox">
        <div class="entity-aura"></div>
        <div class="entity-shadow"></div>
        <div class="sprite-fx">${getEnemyCombatFxMarkup()}</div>
        ${getEnemySpriteMarkup(sceneEnemy)}
      </div>
      <div class="scene-nameplate enemy-nameplate">
        <strong>${sceneEnemy.baseName || sceneEnemy.name}</strong>
        <span>${activeEnemy ? `${activeEnemy.isBoss ? "Chefao" : "Inimigo"} | Nv.${activeEnemy.level}` : "Chance atual mais alta"}</span>
      </div>`
    : `<div class="scene-preview-pill">${getRegionBattleEmblem(regionName)}</div>`;
  return `
    <div class="battle-scene ${sceneClass}${activeEnemy ? " has-enemy" : " preview-scene"}">
      <div class="battle-scene-overlay"></div>
      ${getSceneBackdropMarkup(regionName)}
      <div class="scene-region-tag">${regionName}</div>
      ${enemySide}
      <div id="heroSpriteBox" class="combat-entity hero-entity ${heroClass}">
        <div class="entity-aura"></div>
        <div class="entity-shadow"></div>
        <div class="sprite-fx">${getHeroCombatFxMarkup()}</div>
        ${getHeroSpriteMarkup()}
      </div>
      <div class="scene-nameplate hero-nameplate">
        <strong>${displayedClassName}</strong>
        ${heroClassLine}
      </div>
    </div>`;
}

function renderBattleRegionPreviewCard(){
  const regionData = regions[currentRegion];
  const spawnPreview = getRegionSpawnPreview(currentRegion);
  return `
    <div class="combat-arena-card enemy-card">
      <div class="combat-scene-header">
        <div>
          <h3>${currentRegion}</h3>
          <p class="enemy-subtitle">Nenhum inimigo ativo. Explore a area e procure seu proximo combate.</p>
        </div>
        <div class="enemy-badges">
          <span class="enemy-badge">Nivel medio ${getRegionAverageLevel(currentRegion)}</span>
          <span class="enemy-badge">${currentRegion}</span>
        </div>
      </div>
      <div class="simple-combat-banner">
        <div class="simple-combat-avatar region-focus-avatar"><span class="combat-avatar-fallback">${getRegionBattleEmblem(currentRegion)}</span></div>
        <div class="simple-combat-copy">
          <strong>${currentRegion}</strong>
          <span>${regionData.description}</span>
          <span>${getBossUnlockText(currentRegion)}</span>
        </div>
      </div>
      <div class="combat-detail-grid">
        <div class="combat-detail-card">
          <strong>Chances atuais de encontro</strong>
          <div class="scene-preview-grid">
            ${spawnPreview.map(entry => `<div class="spawn-preview-pill"><strong>${entry.name}</strong><span>Nv.${entry.level} | ${entry.chance.toFixed(1)}%</span></div>`).join("")}
          </div>
        </div>
      </div>
    </div>`;
}

function renderEnemyCombatCard(targetEnemy, shownEnemyHp = targetEnemy.hp){
  const statusEffects = getEnemyStatusEffects(targetEnemy);
  return `
    <div class="combat-arena-card enemy-card">
      <div class="combat-scene-header">
        <div>
          <h3>${targetEnemy.name}</h3>
          <p class="enemy-subtitle">${targetEnemy.isBoss ? "Chefao da regiao" : "Inimigo encontrado"} em ${targetEnemy.region}</p>
        </div>
        <div class="enemy-badges">
          <span class="enemy-badge">Nivel ${targetEnemy.level}</span>
          <span class="enemy-badge ${targetEnemy.rarityClass}">${targetEnemy.rarityLabel}</span>
          <span class="enemy-badge">${targetEnemy.region}</span>
        </div>
      </div>
      <div class="simple-combat-banner">
        <div class="simple-combat-avatar enemy-focus-avatar">${renderCombatAvatar("enemies", toCssToken(targetEnemy.baseName || targetEnemy.name || "inimigo"), getEnemySpriteIcon(targetEnemy), targetEnemy.baseName || targetEnemy.name)}</div>
        <div class="simple-combat-copy">
          <strong>${targetEnemy.baseName || targetEnemy.name}</strong>
          <span>${targetEnemy.isBoss ? "Chefao da regiao" : "Inimigo encontrado"} | Nivel ${targetEnemy.level}</span>
          <span>${targetEnemy.possibleDrop}</span>
        </div>
      </div>
      <div class="combat-detail-grid">
        <div class="combat-detail-card">
          ${targetEnemy.shieldValue > 0 ? `<div class="shield-row"><div class="shield-label">Escudo: ${targetEnemy.shieldValue}</div><div class="bar small"><div class="shield-fill" style="width:${Math.min(100, targetEnemy.shieldValue / Math.max(1, targetEnemy.maxHp) * 100)}%"></div></div></div>` : ""}
          <span class="lock-note">Vida ${Math.max(0, shownEnemyHp)}/${targetEnemy.maxHp}</span>
          <div class="bar"><div id="enemyHpFill" class="fill hp" style="width:${Math.max(0, shownEnemyHp) / targetEnemy.maxHp * 100}%"></div></div>
          ${targetEnemy.isBoss ? `<span class="lock-note">Mana ${targetEnemy.mp}/${targetEnemy.maxMp}</span><div class="bar"><div class="fill mp" style="width:${targetEnemy.mp / targetEnemy.maxMp * 100}%"></div></div>` : ""}
        </div>
        <div class="combat-detail-card">
          <strong>Perigos</strong>
          ${targetEnemy.armor > 0 ? `<span class="lock-note">Armadura: ${targetEnemy.armor}</span>` : `<span class="lock-note">Sem armadura adicional.</span>`}
          ${targetEnemy.maxHpStrikePercent > 0 ? `<span class="lock-note">Impacto brutal: +${Math.floor(targetEnemy.maxHpStrikePercent * 100)}% da sua vida maxima</span>` : ""}
          ${(targetEnemy.bossAbilities || []).length ? `<div class="boss-ability-list">${targetEnemy.bossAbilities.map(ability => `<div class="boss-ability-item"><strong>${ability.name}</strong><span class="lock-note">${ability.description}</span><br><span class="lock-note">${getBossAbilityDetailText(ability)}</span></div>`).join("")}</div>` : `${targetEnemy.isBoss ? `<span class="lock-note">Este chefao ainda nao revelou habilidades extras.</span>` : ""}`}
          ${targetEnemy.bossBuffTurns > 0 ? `<span class="status-on">Buff ativo por ${targetEnemy.bossBuffTurns} turno(s)</span>` : ""}
        </div>
        <div class="combat-detail-card">
          <strong>Estados</strong>
          ${statusEffects.length ? `<div class="enemy-status-list">${statusEffects.map(effect => `<span class="enemy-status-pill ${effect.kind}">${effect.text}</span>`).join("")}</div>` : `<span class="lock-note">Nenhum buff ou debuff ativo no momento.</span>`}
        </div>
        <div class="combat-detail-card">
          <strong>${targetEnemy.isBoss ? "Recompensa possivel" : "Possivel drop"}</strong>
          <span class="lock-note">${targetEnemy.possibleDrop}</span>
        </div>
      </div>
    </div>`;
}

function renderBestiary(){
  const selectedRegion = getSelectedBestiaryRegion();
  const regionData = regions[selectedRegion];
  const unlockProgress = getBossUnlockProgress(selectedRegion);
  const enemyCards = regionData.enemies.map(template => {
    const stats = getEnemyStats(template, selectedRegion, false);
    const rarity = getEnemyRarity(selectedRegion, template.name, false);
    return `<div class="inventory-item"><div class="simple-item-line"><div class="simple-combat-avatar" style="width:64px;height:96px;border-radius:14px;">${renderCombatAvatar("enemies", toCssToken(template.name), getEnemySpriteIcon({ name: template.name, baseName: template.name }), template.name)}</div><div class="simple-item-copy"><strong>${template.name} Lv.${template.level}</strong><br><span class="${rarity.cssClass}">${rarity.label}</span><br><span class="lock-note">Vida: ${stats.maxHp} | Ataque: ${stats.attack} | Armadura: ${stats.armor}${stats.maxHpStrikePercent > 0 ? ` | Impacto: +${Math.floor(stats.maxHpStrikePercent * 100)}% da vida maxima` : ""}</span><br><span class="lock-note">Drop possivel: ${getEnemyPossibleDrop(template.name, selectedRegion, false)}</span><br><span class="lock-note">${getRegionSetLabel(selectedRegion)} | Bonus do set completo: ${formatStatBonusList(getSetBonusValues(selectedRegion))}</span></div></div></div>`;
  }).join("");
  const bossStats = getEnemyStats(regionData.boss, selectedRegion, true);
  const bossProfile = getBossDifficultyProfile(selectedRegion, true);
  const bossMana = Math.floor(regionData.boss.mp * bossProfile.manaMultiplier);
  const bossKit = getBossAbilitySet(regionData.boss.name, selectedRegion);
  return `
    <div class="bestiary-filter-row">${Object.keys(regions).map(regionName => `<button class="region-chip action-btn ${selectedRegion === regionName ? "active" : ""}" onclick="setBestiaryRegion('${regionName}')" ${isRegionUnlockedForBattle(regionName) ? "" : "disabled"}>${regionName}</button>`).join("")}</div>
    <div class="inventory-item">
      <strong>${selectedRegion}</strong><br>
      <span class="lock-note">${regionData.description}</span><br>
      <span class="lock-note">${getBossUnlockText(selectedRegion)}</span>
      <div class="inventory-list">${enemyCards}</div>
      <div class="inventory-item" style="margin-top:12px;">
        <div class="simple-item-line"><div class="simple-combat-avatar" style="width:72px;height:108px;border-radius:14px;">${renderCombatAvatar("enemies", toCssToken(regionData.boss.name), getEnemySpriteIcon({ name: regionData.boss.name, baseName: regionData.boss.name, isBoss: true }), regionData.boss.name)}</div><div class="simple-item-copy"><strong>${regionData.boss.name} Lv.${regionData.boss.level} | Chefao</strong><br>
        <span class="lock-note">Vida: ${bossStats.maxHp} | Ataque: ${bossStats.attack} | Armadura: ${bossStats.armor}${bossStats.maxHpStrikePercent > 0 ? ` | Impacto: +${Math.floor(bossStats.maxHpStrikePercent * 100)}% da vida maxima` : ""}</span><br>
        <span class="lock-note">Mana: ${bossMana} | Recompensa: ${getEnemyPossibleDrop(regionData.boss.name, selectedRegion, true)} | Progresso: ${unlockProgress.defeated}/${unlockProgress.total}</span></div></div>
        <div class="boss-ability-list">${bossKit.map(ability => `<div class="boss-ability-item"><strong>${ability.name}</strong><span class="lock-note">${ability.description}</span><br><span class="lock-note">${getBossAbilityDetailText(ability)}</span></div>`).join("")}</div>
      </div>
    </div>`;
}

function rollWeightedRarity(){
  const total = rarityOrder.reduce((sum, rarity) => sum + getRarityInfo(rarity).weight, 0);
  let roll = Math.random() * total;
  for(const rarity of rarityOrder){
    roll -= getRarityInfo(rarity).weight;
    if(roll <= 0){
      return rarity;
    }
  }
  return "comum";
}

function addInventoryItem(item){
  const normalizedItem = normalizeEquipmentMetadata({ ...item, uid: item.uid || `${item.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}` });
  const stackable = ["equipment", "consumable", "chest", "material"].includes(normalizedItem.type);
  if(stackable){
    const existing = player.inventory.find(entry =>
      entry.type === normalizedItem.type
      && entry.id === normalizedItem.id
      && (entry.rarity || "") === (normalizedItem.rarity || "")
      && (entry.region || "") === (normalizedItem.region || "")
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
  player.inventory.push(normalizedItem);
}

function tryEnemyDrop(defeatedEnemy){
  const enemyBaseName = getBaseEnemyName(defeatedEnemy.name);
  const dropTemplate = getEnemyDropTemplate(enemyBaseName, defeatedEnemy.region, player.class);
  if(!dropTemplate){ return; }
  if(Math.random() > 0.1){ return; }
  const rarity = rollWeightedRarity();
  const item = createEquipmentItem(dropTemplate, rarity);
  addInventoryItem(item);
  log(`O ${enemyBaseName} deixou ${item.name}!`);
}

function tryEnemyMaterialDrop(defeatedEnemy){
  if(defeatedEnemy?.isBoss){ return; }
  const enemyBaseName = getBaseEnemyName(defeatedEnemy.name);
  if(Math.random() > 0.2){ return; }
  const material = getEnemyMaterialTemplate(enemyBaseName, defeatedEnemy.region);
  addInventoryItem(material);
  log(`Voce coletou ${material.name}.`);
}

function getBossChestItem(region){
  const regionData = regions[region];
  if(!regionData){ return null; }
  const possibleDrops = regionData.enemies.filter(enemyData => !!getEnemyDropTemplate(enemyData.name, region, player.class));
  if(!possibleDrops.length){ return null; }
  const chosenEnemy = chooseWeightedEnemy(possibleDrops, { regionName: region, applyLevelAdjustment: false });
  const dropTemplate = getEnemyDropTemplate(chosenEnemy.name, region, player.class);
  return createEquipmentItem(dropTemplate, rollWeightedRarity());
}

function getBossAccessoryItem(region){
  const template = getBossAccessoryTemplate(region);
  if(!template){ return null; }
  return createEquipmentItem(template, rollWeightedRarity());
}

function createRegionChest(region){
  return {
    id: `bau_${region.toLowerCase()}`,
    name: `Bau da ${region}`,
    type: "chest",
    region,
    description: `Contem 1 peca aleatoria do ${getRegionSetLabel(region)}.`
  };
}

function craftRegionEquipment(regionName, slot){
  if(currentMode !== "village"){ return; }
  const recipe = getRegionCraftRecipes(regionName, player.class).find(entry => entry.slot === slot);
  if(!recipe){
    log("O artesao nao encontrou essa receita.");
    return;
  }
  if(player.coins < recipe.cost){
    log(`Moedas insuficientes. O artesao cobra ${recipe.cost} moedas nessa montagem.`);
    return;
  }
  for(const [itemId, qty] of Object.entries(recipe.requirements)){
    if(getInventoryCountById(itemId) < qty){
      log("Voce ainda nao tem todos os materiais necessarios para essa peca.");
      return;
    }
  }
  Object.entries(recipe.requirements).forEach(([itemId, qty]) => consumeInventoryById(itemId, qty));
  player.coins -= recipe.cost;
  const craftedItem = createEquipmentItem(recipe.template, "comum");
  addInventoryItem(craftedItem);
  log(`O artesao montou ${craftedItem.name} para voce.`);
  updateUI();
}

function grantBossChest(region){
  addInventoryItem(createRegionChest(region));
  log(`Voce recebeu um Bau da ${region}!`);
}

function tryBossAccessoryDrop(region){
  const accessory = getBossAccessoryItem(region);
  if(!accessory){ return; }
  if(Math.random() > 0.03){ return; }
  addInventoryItem(accessory);
  log(`O chefao deixou ${accessory.name}!`);
}

function openChest(itemUid){
  const itemIndex = player.inventory.findIndex(entry => entry.uid === itemUid && entry.type === "chest");
  if(itemIndex < 0){ return; }
  const chest = player.inventory[itemIndex];
  const chestItem = getBossChestItem(chest.region);
  removeInventoryUnit(itemIndex);
  if(!chestItem){
    log("O bau estava vazio.");
    updateUI();
    return;
  }
  addInventoryItem(chestItem);
  log(`Voce abriu ${chest.name} e encontrou ${chestItem.name}.`);
  updateUI();
}

async function useManaPotion(){
  if(isDead || currentMode === "trophies" || isProcessingTurn){ return; }
  if(currentMode === "battle" && enemy){
    isProcessingTurn = true;
    if(await handlePlayerTurnStartEffects()){
      return;
    }
  }
  const item = player.inventory.find(entry => entry.id === "mana_potion" && entry.qty > 0);
  if(!item){
    if(currentMode === "battle" && enemy){
      isProcessingTurn = false;
    }
    log("Voce nao tem Pocao de Mana no inventario.");
    return;
  }
  const itemIndex = player.inventory.findIndex(entry => entry.uid === item.uid);
  removeInventoryUnit(itemIndex);
  const maxMp = getPreviewStats().maxMp;
  const manaBefore = player.mp;
  const recovered = Math.max(1, Math.floor(maxMp * 0.35));
  player.mp = Math.min(maxMp, player.mp + recovered);
  displayState.playerMp = player.mp;
  log(`Voce usou uma Pocao de Mana e recuperou ${player.mp - manaBefore} de mana.`);
  updateUI();
  if(currentMode === "dungeon" && isDungeonConnected()){
    syncDungeonProfile();
    return;
  }
  if(currentMode === "battle" && enemy){
    await wait(220);
    await enemyTurn();
  }
}

async function useConsumable(itemId){
  if(itemId === "mana_potion"){
    await useManaPotion();
    return;
  }
  if(isDead || currentMode === "trophies" || isProcessingTurn){ return; }
  if(currentMode === "battle" && enemy){
    isProcessingTurn = true;
    if(await handlePlayerTurnStartEffects()){
      return;
    }
  }
  const item = player.inventory.find(entry => entry.id === itemId && entry.qty > 0);
  const config = consumableCatalog[itemId];
  if(!item || !config){
    if(currentMode === "battle" && enemy){
      isProcessingTurn = false;
    }
    log("Esse consumivel nao esta disponivel.");
    return;
  }
  const itemIndex = player.inventory.findIndex(entry => entry.uid === item.uid);
  removeInventoryUnit(itemIndex);

  if(config.effectType === "restore_hp"){
    const healed = healPlayer(config.value);
    log(`Voce usou ${config.name} e recuperou ${healed} de vida.`);
  }
  if(config.effectType === "restore_hp_percent"){
    const maxHp = getCurrentCaps().maxHp;
    const healAmount = Math.floor(maxHp * config.value);
    const healed = healPlayer(healAmount);
    log(`Voce usou ${config.name} e recuperou ${healed} de vida.`);
  }
  if(config.effectType === "restore_mana_percent"){
    const maxMp = getCurrentCaps().maxMp;
    const mpBefore = player.mp;
    const restored = Math.max(1, Math.floor(maxMp * config.value));
    player.mp = Math.min(maxMp, player.mp + restored);
    displayState.playerMp = player.mp;
    log(`Voce usou ${config.name} e recuperou ${player.mp - mpBefore} de mana.`);
  }
  if(config.effectType === "buff_skill"){
    playerEffects.skillBuffTurns = Math.max(playerEffects.skillBuffTurns, config.turns);
    if(config.isPercent){
      playerEffects.skillBuffPercent = Math.max(playerEffects.skillBuffPercent, config.value);
      log(`Voce usou ${config.name} e ganhou +${Math.floor(config.value * 100)}% de dano de habilidade por ${config.turns} turnos.`);
    }else{
      playerEffects.skillBuffAmount = Math.max(playerEffects.skillBuffAmount, config.value);
      log(`Voce usou ${config.name} e ganhou +${config.value} de dano de habilidade por ${config.turns} turnos.`);
    }
  }
  if(config.effectType === "buff_attack"){
    playerEffects.attackBuffTurns = Math.max(playerEffects.attackBuffTurns, config.turns);
    if(config.isPercent){
      playerEffects.attackBuffPercent = Math.max(playerEffects.attackBuffPercent, config.value);
      log(`Voce usou ${config.name} e ganhou +${Math.floor(config.value * 100)}% de dano de ataque por ${config.turns} turnos.`);
    }else{
      playerEffects.attackBuffAmount = Math.max(playerEffects.attackBuffAmount, config.value);
      log(`Voce usou ${config.name} e ganhou +${config.value} de dano de ataque por ${config.turns} turnos.`);
    }
  }

  updateUI();
  if(["buff_skill", "buff_attack"].includes(config.effectType)) {
    await playSpriteAttackAnimation("hero", "buff", false);
  }
  if(currentMode === "dungeon" && isDungeonConnected()){
    syncDungeonProfile();
    return;
  }
  if(currentMode === "battle" && enemy){
    updateUI();
    await wait(220);
    await enemyTurn();
  }
}

function equipItem(itemUid){
  const itemIndex = player.inventory.findIndex(entry => entry.uid === itemUid);
  if(itemIndex < 0){ return; }
  const item = player.inventory[itemIndex];
  if(item.type !== "equipment"){ return; }
  if(!canEquipItem(item)){
    log(`Somente a classe ${item.classRestriction} pode equipar ${item.name}.`);
    return;
  }
  const equipped = player.equipment?.[item.slot] || null;
  removeInventoryUnit(itemIndex);
  if(equipped){
    addInventoryItem(equipped);
  }
  player.equipment[item.slot] = item;
  player.hp = Math.min(getCurrentCaps().maxHp, player.hp);
  player.mp = Math.min(getCurrentCaps().maxMp, player.mp);
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  log(`${item.name} foi equipada.`);
  updateUI();
}

function unequipItem(slot, event = null){
  if(event){
    event.preventDefault();
  }
  if(currentMode !== "camp" || isProcessingTurn || isDead){
    return false;
  }
  const equippedItem = normalizeEquipmentMetadata(player.equipment?.[slot]);
  if(!equippedItem){
    return false;
  }
  addInventoryItem(equippedItem);
  player.equipment[slot] = null;
  player.hp = Math.min(getCurrentCaps().maxHp, player.hp);
  player.mp = Math.min(getCurrentCaps().maxMp, player.mp);
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  log(`${equippedItem.name} foi removido do equipamento e voltou para o inventario.`);
  updateUI();
  return false;
}

function sellItem(itemUid){
  if(currentMode !== "village"){ return; }
  const itemIndex = player.inventory.findIndex(entry => entry.uid === itemUid);
  if(itemIndex < 0){ return; }
  const item = player.inventory[itemIndex];
  const value = getSellPrice(item);
  if(item.qty && item.qty > 1){
    item.qty--;
  }else{
    player.inventory.splice(itemIndex, 1);
  }
  player.coins += value;
  log(`Voce vendeu ${item.name} por ${value} moedas.`);
  updateUI();
}

function getFleeCost(){
  return 2 + 3 * player.level;
}

function fleeBattle(){
  if(currentMode !== "battle" || !enemy || isProcessingTurn || levelUpPoints > 0 || isDead){ return; }
  const cost = getFleeCost();
  if(player.coins < cost){
    log(`Voce precisa de ${cost} moedas para fugir.`);
    return;
  }
  player.coins -= cost;
  enemy = null;
  needsNewEnemy = true;
  displayState.enemyHp = null;
  isProcessingTurn = false;
  log(`Voce fugiu da batalha e pagou ${cost} moedas.`);
  updateUI();
}

function createEnemyFromTemplate(template, isBoss = false, originOverride = null){
  const origin = originOverride || (isDungeonMode() ? "Dungeon" : currentRegion);
  const stats = getEnemyStats(template, origin, isBoss);
  const bossProfile = getBossDifficultyProfile(origin, isBoss);
  const rarity = getEnemyRarity(origin, template.name, isBoss);
  const bossAbilities = isBoss ? getBossAbilitySet(template.name, origin) : [];
  const signatureAbility = bossAbilities[0] || null;
  const bossMana = isBoss ? Math.floor(template.mp * bossProfile.manaMultiplier) : 0;
  const bossSkillDamage = isBoss ? Math.floor(template.skillDamage * bossProfile.skillMultiplier) : 0;
  return {
    name: template.name + " Lv." + template.level,
    baseName: template.name,
    region: origin,
    level: template.level,
    maxHp: stats.maxHp,
    hp: stats.maxHp,
    attack: stats.attack,
    armor: isDungeonMode() && !originOverride ? 0 : stats.armor,
    maxHpStrikePercent: isDungeonMode() && !originOverride ? 0 : stats.maxHpStrikePercent,
    isBoss,
    rarityKey: rarity.key,
    rarityLabel: rarity.label,
    rarityClass: rarity.cssClass,
    possibleDrop: getEnemyPossibleDrop(template.name, origin, isBoss),
    maxMp: bossMana,
    mp: bossMana,
    skillName: isBoss ? (signatureAbility?.name || template.skillName) : "",
    skillDamage: isBoss ? (signatureAbility?.power || bossSkillDamage) : 0,
    skillCost: isBoss ? (signatureAbility?.cost || template.skillCost) : 0,
    bossAbilities,
    nextDamageTakenPercent: 0,
    armorDownPercent: 0,
    armorDownTurns: 0,
    attackDownPercent: 0,
    attackDownTurns: 0,
    dotDamagePerTurn: 0,
    dotTurns: 0,
    dotSourceName: "",
    natureMarkTurns: 0,
    natureMarkDamage: 0,
    naturePoisonTurns: 0,
    naturePoisonDamage: 0,
    natureDecayTurns: 0,
    natureDecayDamage: 0,
    rootedTurns: 0,
    shieldValue: 0,
    shieldTurns: 0,
    healReductionPercent: 0,
    healReductionTurns: 0,
    blizzardSkipChance: 0,
    blizzardTurns: 0,
    noShieldTurns: 0,
    bossBuffTurns: 0,
    bossAttackBuffPercent: 0,
    bossFlatDamageBonus: 0,
    bossPierceBonus: 0,
    bossRegenPercent: 0
  };
}

function spawnEnemy(isBoss = false){
  const regionData = isDungeonMode() ? dungeonData : regions[currentRegion];
  const template = isBoss
    ? regionData.boss
    : enemiesSpawned < 3
      ? (!isDungeonMode() ? regionData.enemies.find(enemyData => enemyData.name === "Lobo Sombrio") : null) || chooseWeightedEnemy(regionData.enemies, { regionName: isDungeonMode() ? "Dungeon" : currentRegion })
      : chooseWeightedEnemy(regionData.enemies, { regionName: isDungeonMode() ? "Dungeon" : currentRegion });
  enemy = createEnemyFromTemplate(template, isBoss);
  resetCombatEffects();
  if(!isBoss){
    enemiesSpawned++;
  }
  needsNewEnemy = false;
  displayState.enemyHp = enemy.hp;
  log(
    isDungeonMode()
      ? `Um ${enemy.name} surgiu nas profundezas da Dungeon!`
      : isBoss
        ? `O chefao ${enemy.name} surgiu na ${currentRegion}!`
        : `Um ${enemy.name} apareceu na ${currentRegion}!`
  );
  saveCampaign();
}

function ensureEnemy(){
  if(!["battle", "dungeon"].includes(currentMode) || levelUpPoints > 0 || isProcessingTurn || isDead){ return; }
  if(!enemy || needsNewEnemy){
    spawnEnemy();
    updateUI();
  }
}

function challengeBoss(){
  if(currentMode !== "battle" || levelUpPoints > 0 || isProcessingTurn || isDead || !!enemy){ return; }
  if(!isRegionUnlockedForBattle(currentRegion)){
    log(`A regiao ${currentRegion} exige ${getRegionRequirement(currentRegion)}.`);
    return;
  }
  const unlockProgress = getBossUnlockProgress(currentRegion);
  if(!unlockProgress.unlocked){
    log(`O chefao de ${currentRegion} ainda nao pode ser enfrentado. Falta derrotar: ${unlockProgress.missing.join(", ")}.`);
    return;
  }
  enemy = null;
  needsNewEnemy = false;
  spawnEnemy(true);
  updateUI();
}

function setMode(mode){
  if(IS_DUNGEON_PAGE && mode !== "dungeon"){
    if(isProcessingTurn || isDead || player.hp <= 0){ return; }
    returnToMainPage(mode);
    return;
  }
  if(isProcessingTurn || isDead || player.hp <= 0 || !["battle", "village", "trophies", "camp", "dungeon", "bestiary"].includes(mode)){ return; }
  if((levelUpPoints > 0 || needsSubclassChoice()) && mode !== "battle"){
    log("Finalize sua evolucao antes de sair da batalha.");
    updateUI();
    return;
  }
  if((mode === "village" || mode === "trophies" || mode === "camp" || mode === "dungeon" || mode === "bestiary") && enemy){
    log(
      mode === "village" ? "Voce so pode ir ao vilarejo fora de combate."
      : mode === "trophies" ? "A sala de trofeus so pode ser acessada fora de combate."
      : mode === "camp" ? "O acampamento so pode ser acessado fora de combate."
      : mode === "dungeon" ? "A dungeon so pode ser acessada fora de combate."
      : "O bestiario so pode ser acessado fora de combate."
    );
    updateUI();
    return;
  }
  if(currentMode === "dungeon" && mode !== "dungeon" && isDungeonConnected()){
    leaveDungeonRoom(true);
  }
  currentMode = mode;
  syncRegionMusic();
  updateUI();
}

function getHealCost(){
  return Math.max(0, Math.ceil((getPreviewStats().maxHp - player.hp) / 7));
}

function getManaHealCost(){
  return Math.max(0, Math.ceil((getPreviewStats().maxMp - player.mp) / 7));
}

function healAtVillage(){
  if(currentMode !== "village"){ return; }
  const { maxHp } = getCurrentCaps();
  if(player.hp >= maxHp){
    log("Voce ja esta com a vida cheia.");
    return;
  }
  const cost = getHealCost();
  if(player.coins < cost){
    log(`Moedas insuficientes. Cura custa ${cost} moedas.`);
    return;
  }
  player.coins -= cost;
  player.hp = maxHp;
  displayState.playerHp = player.hp;
  log(`Voce descansou no vilarejo e recuperou toda a vida por ${cost} moedas.`);
  updateUI();
}

function restoreManaAtVillage(){
  if(currentMode !== "village"){ return; }
  const { maxMp } = getCurrentCaps();
  if(player.mp >= maxMp){
    log("Voce ja esta com a mana cheia.");
    return;
  }
  const cost = getManaHealCost();
  if(player.coins < cost){
    log(`Moedas insuficientes. Recuperar mana custa ${cost} moedas.`);
    return;
  }
  player.coins -= cost;
  player.mp = maxMp;
  displayState.playerMp = player.mp;
  log(`Voce descansou a mente no vilarejo e recuperou toda a mana por ${cost} moedas.`);
  updateUI();
}

function buyConsumable(itemId){
  if(currentMode !== "village"){ return; }
  const data = consumableCatalog[itemId];
  if(!data){ return; }
  const cost = data.price;
  if(player.coins < cost){
    log(`Voce nao tem moedas suficientes para comprar ${data.name}.`);
    return;
  }
  player.coins -= cost;
  const existing = player.inventory.find(item => item.id === itemId);
  if(existing){
    existing.qty++;
  }else{
    addInventoryItem(createConsumableItem(itemId));
  }
  log(`Voce comprou ${data.name}.`);
  updateUI();
}

function tryUpgradeEquippedItem(slot){
  if(currentMode !== "village"){ return; }
  const item = normalizeEquipmentMetadata(player.equipment?.[slot]);
  if(!item){
    log("Nao ha item equipado nesse espaco.");
    return;
  }
  const currentRank = getRarityRank(item.rarity);
  if(currentRank >= rarityOrder.length - 1){
    log("Esse item ja esta na raridade maxima.");
    return;
  }
  const cost = getForgeUpgradeCost(item);
  if(player.coins < cost){
    log(`Moedas insuficientes. O ferreiro cobra ${cost} moedas nessa tentativa.`);
    return;
  }
  player.coins -= cost;
  const chance = getForgeUpgradeChance(item);
  if(Math.random() > chance){
    triggerForgeFeedback(slot, "fail");
    log(`O ferreiro falhou em aprimorar ${item.name}. Chance da tentativa: ${Math.floor(chance * 100)}%.`);
    updateUI();
    return;
  }
  const nextRarity = rarityOrder[currentRank + 1];
  const baseDrop = getDropTemplateFromItem(item);
  if(!baseDrop){
    log("O ferreiro nao conseguiu identificar a origem do equipamento.");
    updateUI();
    return;
  }
  const upgradedItem = createEquipmentItem(baseDrop, nextRarity);
  upgradedItem.uid = item.uid;
  player.equipment[slot] = upgradedItem;
  player.hp = Math.min(getCurrentCaps().maxHp, player.hp);
  player.mp = Math.min(getCurrentCaps().maxMp, player.mp);
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  triggerForgeFeedback(slot, "success");
  log(`O ferreiro aprimorou ${item.name} para ${upgradedItem.name}!`);
  updateUI();
}

function getRespawnSeconds(){
  if(uiSettings?.disableRespawnTimer){
    return 0;
  }
  return 6 + player.level * 2;
}

function handleDeath(message = "Voce caiu em batalha."){
  isProcessingTurn = false;
  if(currentMode === "dungeon" || isDungeonConnected()){
    leaveDungeonRoom(true);
  }
  if(isDead){
    player.hp = 0;
    displayState.playerHp = 0;
    currentMode = "battle";
    log(message);
    updateUI();
    return;
  }
  isDead = true;
  deadUntil = Date.now() + getRespawnSeconds() * 1000;
  player.stats.deaths++;
  player.hp = 0;
  displayState.playerHp = 0;
  enemy = null;
  needsNewEnemy = true;
  currentMode = "battle";
  log(message);
  updateUI();
}

function respawnPlayer(){
  if(!isDead || (deadUntil && Date.now() < deadUntil)){ return; }
  const { maxHp, maxMp } = getCurrentCaps();
  isDead = false;
  deadUntil = null;
  player.hp = maxHp;
  player.mp = maxMp;
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  log("Voce renasceu e retornou a aventura.");
  updateUI();
}

function resetAdventure(){
  if(!confirm("Tem certeza que deseja reiniciar a campanha? Todo o progresso atual sera apagado.")){
    return;
  }
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

function saveCampaign(){
  if(!player){
    localStorage.removeItem(SAVE_KEY);
    renderSavedCampaign();
    return;
  }
  const state = {
    player,
    enemy: currentMode === "dungeon" ? null : enemy,
    pendingLevelUps,
    levelUpPoints,
    allocation,
    isProcessingTurn: false,
    currentRegion,
    needsNewEnemy: currentMode === "dungeon" ? true : needsNewEnemy,
    currentMode: currentMode === "dungeon" ? "battle" : currentMode,
    enemiesSpawned,
    isDead,
    deadUntil,
    isLogHidden,
    playerEffects
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  renderSavedCampaign();
}

function continueCampaign(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw){ return; }
  const state = JSON.parse(raw);
  player = state.player;
  enemy = state.enemy;
  pendingLevelUps = state.pendingLevelUps;
  levelUpPoints = state.levelUpPoints;
  allocation = state.allocation;
  currentRegion = state.currentRegion;
  needsNewEnemy = state.needsNewEnemy;
  currentMode = state.currentMode;
  enemiesSpawned = state.enemiesSpawned;
  isDead = state.isDead;
  deadUntil = state.deadUntil;
  isLogHidden = !!state.isLogHidden;
  playerEffects = { ...createDefaultPlayerEffects(), ...(state.playerEffects || {}) };
  if(player?.hp <= 0){
    isDead = true;
    deadUntil = deadUntil || Date.now();
    player.hp = 0;
  }
  if(!["battle", "village", "trophies", "camp", "bestiary"].includes(currentMode)){
    currentMode = "battle";
  }
  if(IS_DUNGEON_PAGE){
    currentMode = "dungeon";
  }else{
    const queuedMode = consumeQueuedPageMode();
    if(["battle", "village", "trophies", "camp", "bestiary"].includes(queuedMode)){
      currentMode = queuedMode;
    }
  }
  isProcessingTurn = false;
  normalizePlayerState();
  if(enemy){
    const enemyTemplate = getEnemyTemplateByName(enemy.baseName || getBaseEnemyName(enemy.name));
    if(enemyTemplate){
      const rebuiltEnemy = createEnemyFromTemplate(enemyTemplate, !!enemyTemplate.isBoss);
      rebuiltEnemy.hp = Math.min(rebuiltEnemy.maxHp, enemy.hp);
      rebuiltEnemy.mp = rebuiltEnemy.maxMp ? Math.min(rebuiltEnemy.maxMp, enemy.mp ?? rebuiltEnemy.maxMp) : 0;
      rebuiltEnemy.skipNextAttack = !!enemy.skipNextAttack;
      rebuiltEnemy.shieldValue = enemy.shieldValue || 0;
      rebuiltEnemy.shieldTurns = enemy.shieldTurns || 0;
      rebuiltEnemy.attackDownPercent = enemy.attackDownPercent || 0;
      rebuiltEnemy.attackDownTurns = enemy.attackDownTurns || 0;
      rebuiltEnemy.armorDownPercent = enemy.armorDownPercent || 0;
      rebuiltEnemy.armorDownTurns = enemy.armorDownTurns || 0;
      rebuiltEnemy.dotDamagePerTurn = enemy.dotDamagePerTurn || 0;
      rebuiltEnemy.dotTurns = enemy.dotTurns || 0;
      rebuiltEnemy.dotSourceName = enemy.dotSourceName || "";
      rebuiltEnemy.rootedTurns = enemy.rootedTurns || 0;
      rebuiltEnemy.natureMarkTurns = enemy.natureMarkTurns || 0;
      rebuiltEnemy.natureMarkDamage = enemy.natureMarkDamage || 0;
      rebuiltEnemy.naturePoisonTurns = enemy.naturePoisonTurns || 0;
      rebuiltEnemy.naturePoisonDamage = enemy.naturePoisonDamage || 0;
      rebuiltEnemy.natureDecayTurns = enemy.natureDecayTurns || 0;
      rebuiltEnemy.natureDecayDamage = enemy.natureDecayDamage || 0;
      rebuiltEnemy.frozenDamageBonusPercent = enemy.frozenDamageBonusPercent || 0;
      rebuiltEnemy.healReductionPercent = enemy.healReductionPercent || 0;
      rebuiltEnemy.healReductionTurns = enemy.healReductionTurns || 0;
      rebuiltEnemy.noShieldTurns = enemy.noShieldTurns || 0;
      rebuiltEnemy.bossBuffTurns = enemy.bossBuffTurns || 0;
      rebuiltEnemy.bossAttackBuffPercent = enemy.bossAttackBuffPercent || 0;
      rebuiltEnemy.bossFlatDamageBonus = enemy.bossFlatDamageBonus || 0;
      rebuiltEnemy.bossPierceBonus = enemy.bossPierceBonus || 0;
      rebuiltEnemy.bossRegenPercent = enemy.bossRegenPercent || 0;
      enemy = rebuiltEnemy;
    }
  }
  displayState = { playerHp: player.hp, playerMp: player.mp, playerXp: player.xp, enemyHp: enemy ? enemy.hp : null };
  document.getElementById("classSelect").style.display = "none";
  document.getElementById("game").style.display = "block";
  if(isDead && deadUntil && Date.now() >= deadUntil){
    deadUntil = Date.now();
  }
  syncRegionMusic(true);
  log("Campanha retomada.");
  updateUI();
}

function renderSavedCampaign(){
  const saved = document.getElementById("savedCampaign");
  if(localStorage.getItem(SAVE_KEY)){
    saved.style.display = "block";
    saved.innerHTML = `
      <h3>Campanha em andamento</h3>
      <div class="button-row">
        <button onclick="continueCampaign()">Continuar campanha</button>
        <button onclick="resetAdventure()">Reiniciar aventura</button>
      </div>`;
  }else{
    saved.style.display = "none";
    saved.innerHTML = "";
  }
}

function changeRegion(region){
  if(isProcessingTurn || isDead || levelUpPoints > 0 || !regions[region] || currentRegion === region){ return; }
  if(enemy){
    log("Voce nao pode trocar de regiao durante um combate.");
    return;
  }
  if(!isRegionUnlockedForBattle(region)){
    log(`A regiao ${region} exige ${getRegionRequirement(region)}.`);
    return;
  }
  currentRegion = region;
  log(`Voce viajou para a ${region}.`);
  syncRegionMusic(true);
  needsNewEnemy = true;
  enemy = null;
  updateUI();
}

function updateUI(){
  const pointsLabel = levelUpPoints > 0
    ? `<p><strong>Pontos para distribuir:</strong> ${levelUpPoints}</p>`
    : "";
  const previewStats = getPreviewStats();
  const shownPlayerHp = displayState.playerHp ?? player.hp;
  const shownPlayerMp = displayState.playerMp ?? player.mp;
  const shownPlayerXp = displayState.playerXp ?? player.xp;
  const shownEnemyHp = enemy ? (displayState.enemyHp ?? enemy.hp) : 0;
  const shieldWidth = Math.min(100, (playerEffects.shieldValue || 0) / previewStats.maxHp * 100);
  const xpToNextLevel = getXpToNextLevel();
  const trophyCompletion = getTrophyCompletion();
  const activeBuffs = getActiveBuffs();
  const activeSetData = getActiveSetBonuses();
  const investedSummary = getInvestedSummary();
  const classBaseData = player.baseStats || classes[player.class];
  const subclassBonuses = getTotalSubclassBonuses();
  const bossUnlockProgress = getBossUnlockProgress(currentRegion);
  document.getElementById("heroPortraitPanel").innerHTML = `
    <h3>Seu heroi</h3>
    <div class="hero-portrait-card">
      <div class="hero-portrait-stage">${renderCombatAvatar("heroes", getHeroCombatAssetKey(), getHeroSpriteIcon(), getDisplayedClassName())}</div>
      <div class="hero-portrait-copy">
        <strong class="coin-badge" style="align-self:flex-start;">Nivel ${player.level}</strong>
      </div>
    </div>`;

  const campEntries = getCampEntries();
  document.getElementById("playerInfo").innerHTML = `
    <div class="player-header">
      <div class="player-title-wrap">
        <div><h3>${getDisplayedClassName()} - Nivel ${player.level}</h3>${getDisplayedClassName() !== player.class ? `<span class="lock-note">Classe base: ${player.class}</span>` : ""}</div>
      </div>
      <div class="coin-badge">${player.coins} moedas</div>
    </div>
    ${playerEffects.shieldValue > 0 ? `<div class="shield-row"><div class="shield-label">Escudo: ${playerEffects.shieldValue}</div><div class="bar small"><div id="playerShieldFill" class="shield-fill" style="width:${shieldWidth}%"></div></div></div>` : ""}
    Vida: ${player.hp}/${previewStats.maxHp}
    <div class="bar"><div id="playerHpFill" class="fill hp" style="width:${shownPlayerHp / previewStats.maxHp * 100}%"></div></div>
    Mana: ${player.mp}/${previewStats.maxMp}
    <div class="bar"><div id="playerMpFill" class="fill mp" style="width:${shownPlayerMp / previewStats.maxMp * 100}%"></div></div>
    XP: ${player.level >= MAX_LEVEL ? "MAX" : `${player.xp}/${xpToNextLevel}`}
    <div class="bar"><div id="playerXpFill" class="fill xp" style="width:${player.level >= MAX_LEVEL ? 100 : shownPlayerXp / xpToNextLevel * 100}%"></div></div>
    ${activeBuffs.length ? `<div class="buff-list">${activeBuffs.map(buff => `<span class="buff-pill">${buff}</span>`).join("")}</div>` : ""}
    ${pointsLabel}`;

  document.getElementById("modeTabs").innerHTML = IS_DUNGEON_PAGE
    ? `
      <button class="tab-btn active">Dungeon</button>
      <button class="tab-btn" data-tooltip="Atalho: tecla 1" onclick="returnToMainPage('battle')" ${isProcessingTurn ? "disabled" : ""}>Voltar para a campanha [1]</button>`
    : `
      <button class="tab-btn ${currentMode === "battle" ? "active" : ""}" data-tooltip="Atalho: tecla 1" onclick="setMode('battle')" ${isProcessingTurn ? "disabled" : ""}>Batalha [1]</button>
      <button class="tab-btn ${currentMode === "village" ? "active" : ""}" data-tooltip="Atalho: tecla 2" onclick="setMode('village')" ${isProcessingTurn || !!enemy || levelUpPoints > 0 || needsSubclassChoice() ? "disabled" : ""}>Vilarejo [2]</button>
      <button class="tab-btn ${currentMode === "camp" ? "active" : ""}" data-tooltip="Atalho: tecla 3" onclick="setMode('camp')" ${isProcessingTurn || !!enemy || levelUpPoints > 0 || needsSubclassChoice() ? "disabled" : ""}>Acampamento [3]</button>
      <button class="tab-btn ${currentMode === "trophies" ? "active" : ""}" data-tooltip="Atalho: tecla 4" onclick="setMode('trophies')" ${isProcessingTurn || !!enemy || levelUpPoints > 0 || needsSubclassChoice() ? "disabled" : ""}>Sala de trofeus [4]</button>
      <button class="tab-btn ${currentMode === "bestiary" ? "active" : ""}" data-tooltip="Atalho: tecla 5" onclick="setMode('bestiary')" ${isProcessingTurn || !!enemy || levelUpPoints > 0 || needsSubclassChoice() ? "disabled" : ""}>Bestiario [5]</button>
      <button class="tab-btn ${currentMode === "dungeon" ? "active" : ""}" data-tooltip="Atalho: tecla 6" onclick="setMode('dungeon')" ${isProcessingTurn || !!enemy || levelUpPoints > 0 || needsSubclassChoice() ? "disabled" : ""}>Dungeon [6]</button>`;

  document.getElementById("enemyInfo").innerHTML = ["battle", "dungeon"].includes(currentMode) && enemy
    ? renderEnemyCombatCard(enemy, shownEnemyHp)
    : ["battle", "dungeon"].includes(currentMode) ? `
    ${currentMode === "dungeon"
      ? IS_DUNGEON_PAGE
        ? `<h3>Entrada da Dungeon</h3><p>${isDungeonConnected() ? "Sua equipe esta reunida. Crie a sala, entre com o codigo e adentre a dungeon quando o grupo estiver pronto." : "Monte ou entre em uma sala para iniciar uma incursao cooperativa."}</p>`
        : `<h3>Portal da Dungeon</h3><p>Daqui voce organiza sua equipe e so entra na pagina da dungeon quando clicar em adentrar.</p>`
      : isDead
        ? `<h3>Voce foi derrotado</h3><p>Escolha entre reiniciar a aventura ou aguardar o renascimento.</p>`
        : levelUpPoints > 0
          ? `<h3>Distribua seus pontos</h3><p>Finalize sua evolucao para continuar.</p>`
          : renderBattleRegionPreviewCard()}`
    : currentMode === "trophies" ? `
    <h3>Sala de trofeus</h3>
    <div class="trophy-list">${renderTrophyGroups()}</div>`
    : currentMode === "camp" ? `
    <h3>Acampamento</h3>
    ${renderCampContent(campEntries, previewStats, investedSummary, classBaseData, subclassBonuses, activeSetData, xpToNextLevel)}`
    : currentMode === "bestiary" ? `
    <h3>Bestiario</h3>
    <div class="inventory-list">${renderBestiary()}</div>`
    : currentMode === "dungeon" ? `
    <h3>${IS_DUNGEON_PAGE ? "Quartel da Expedicao" : "Lobby da Dungeon"}</h3>
    <div class="inventory-list">
      <div class="inventory-item"><strong>${IS_DUNGEON_PAGE ? "Equipe" : "Como funciona"}</strong><br><span class="lock-note">${IS_DUNGEON_PAGE ? "Reuna ate 3 aventureiros, combine os codigos da sala e avance por toda a sequencia da dungeon em cooperativo." : "A dungeon fica em uma pagina separada. Aqui voce so prepara a entrada; o layout de incursao abre apenas quando voce escolher adentrar."}</span></div>
    </div>`
    : `
    <h3>Vilarejo</h3>
    <p>Um lugar seguro para se preparar antes da proxima aventura.</p>
    ${renderVillagePanel()}`;

  const regionButtons = Object.keys(regions).map(region => `
    <button class="region-chip action-btn ${region === currentRegion ? "active" : ""}" data-tooltip="Nivel medio dos inimigos: ${getRegionAverageLevel(region)} | Requer ${getRegionRequirement(region)}" onclick="changeRegion('${region}')" ${isProcessingTurn || levelUpPoints > 0 || !isRegionUnlockedForBattle(region) || !!enemy ? "disabled" : ""}>${region}</button>
  `).join("");
  document.getElementById("regionInfo").innerHTML = `
    <h3>${currentMode === "battle" ? `Regiao Atual: ${currentRegion}` : currentMode === "trophies" ? "Resumo da campanha" : currentMode === "camp" ? "Resumo do heroi" : currentMode === "bestiary" ? "Guia de criaturas" : currentMode === "dungeon" ? "Sala da Dungeon" : "Servicos do Vilarejo"}</h3>
    <p>${currentMode === "battle" ? `${regions[currentRegion].description} Requer ${getRegionRequirement(currentRegion)}. ${getBossUnlockText(currentRegion)}` : currentMode === "trophies" ? `Inimigos derrotados: ${player.stats.enemiesDefeated} | Chefes derrotados: ${player.stats.bossesDefeated} | Conquistas: ${trophyCompletion}%` : currentMode === "camp" ? "Aqui voce revisa sua rota de subclasse, bonus recebidos, proximos desbloqueios, equipamentos e conjuntos completos." : currentMode === "bestiary" ? "Escolha uma regiao ja desbloqueada na batalha para estudar inimigos, drops, set e o kit completo do chefao local." : currentMode === "dungeon" ? dungeonData.description : "Aqui ficam os servicos de descanso do vilarejo, para corpo e mente."}</p>
    ${currentMode === "battle" ? `<div class="button-row">${regionButtons}</div><div class="inventory-item" style="margin-top:12px;"><strong>Chefao da regiao</strong><br><span class="lock-note">${getBossUnlockText(currentRegion)}</span><div class="button-row" style="margin-top:10px;"><button class="boss-btn" onclick="challengeBoss()" ${isProcessingTurn || levelUpPoints > 0 || isDead || !!enemy || !bossUnlockProgress.unlocked ? "disabled" : ""}>Enfrentar chefao</button></div></div>` : currentMode === "village" ? `<div class="lock-note">Escolha um servico do vilarejo pelas abas: pousada para descanso, alquimista para consumiveis, ferreiro para aprimorar raridades e artesao para montar equipamentos com partes dos monstros.</div>` : currentMode === "camp" ? `<div class="lock-note">As habilidades ativas exigem mana. As passivas permanecem funcionando o tempo todo. A rota de subclasse mostra o que voce ja ganhou e o que ainda vai liberar.</div><div class="inventory-item" style="margin-top:12px;"><strong>Resumo dos atributos</strong><br><span class="lock-note">Base da classe: ${classBaseData.hp} HP | ${classBaseData.mp} MP | ${classBaseData.attack} ATQ</span><br><span class="lock-note">Subclasses: +${subclassBonuses.bonusHp} HP | +${subclassBonuses.bonusMp} MP | +${subclassBonuses.bonusAttack} ATQ | +${subclassBonuses.skillPower} poder de habilidade</span><br><span class="lock-note">Pontos ganhados por nivel ate agora: ${investedSummary.totalLevelPoints}</span></div><div class="inventory-item" style="margin-top:12px;"><strong>Pontos investidos atualmente</strong><br><span class="lock-note">Vitalidade: ${investedSummary.vitalityPoints} ponto(s) = +${investedSummary.hpGain} de vida maxima</span><br><span class="lock-note">Sabedoria: ${investedSummary.wisdomPoints} ponto(s) = +${investedSummary.mpGain} de mana maxima</span><br><span class="lock-note">Forca: ${investedSummary.strengthPoints} ponto(s) = +${investedSummary.attackGain} de dano basico e +${investedSummary.skillGain} de dano de habilidade</span>${investedSummary.untrackedPoints > 0 ? `<br><span class="status-off">Existem ${investedSummary.untrackedPoints} ponto(s) antigos sem rastreamento confiavel. Use o treinador para reconstruir a distribuicao.</span>` : ""}</div><div class="inventory-item" style="margin-top:12px;"><div class="panel-header"><strong>Treinador</strong><span class="coin-badge">${getTrainerRespecCost()} moedas</span></div><span class="lock-note">Agora ele refaz sua distribuicao completa com base no seu nivel atual. O custo e 30 x seu nivel.</span><div class="button-row" style="margin-top:10px;"><button id="trainerRespecBtn" type="button" onclick="resetInvestedStatsAtCamp()" ${player.level <= 1 || levelUpPoints > 0 || needsSubclassChoice() ? "disabled" : ""}>Pagar e redistribuir atributos</button></div></div><div class="button-row" style="margin-top:10px;"><button onclick="grantNextLevelForTest()">Teste: Proximo nivel</button></div>` : currentMode === "dungeon" ? (IS_DUNGEON_PAGE ? `<div class="lock-note">${dungeonMultiplayer.battleActive && enemy ? `Rodada ${dungeonMultiplayer.round} | Turno atual: ${(dungeonMultiplayer.party[getDungeonCurrentTurnId()] || {}).name || "..."}` : "Esta pagina e exclusiva da dungeon. Reuna o grupo, compartilhe o codigo da sala e so adentre quando todos estiverem prontos."}</div>${typeof renderDungeonRoomControls === "function" ? renderDungeonRoomControls() : `<div class="lock-note">Carregando sistemas da dungeon...</div>`}` : `<div class="lock-note">Escolha quando atravessar o portal. A pagina da dungeon so abre ao clicar em adentrar, com um layout proprio para a incursao cooperativa.</div>`) : currentMode === "bestiary" ? `<div class="lock-note">Cada regiao possui um set proprio. As roupas podem ser usadas por qualquer classe, mas a arma do set so pode ser equipada pela classe correspondente.</div>` : `<div class="lock-note">Cada conquista marca um passo importante da sua jornada.</div>`}`;

  const visibleInventory = hideArtisanMaterials ? player.inventory.filter(item => item.type !== "material") : player.inventory;
  document.getElementById("inventoryInfo").innerHTML = currentMode === "trophies"
    ? renderTrophySummaryPanel()
    : `
    <h3>Inventario</h3>
    <div class="button-row" style="margin-bottom:10px;">
      <button class="action-btn" onclick="toggleHideArtisanMaterials()">${hideArtisanMaterials ? "Mostrar itens de artesao" : "Esconder itens de artesao"}</button>
    </div>
    ${visibleInventory.length ? `<div class="inventory-list">${[...visibleInventory].sort((a, b) => {
      const getInventoryPriority = item => item.type === "consumable" ? 0 : item.type === "chest" ? 1 : item.type === "material" ? 2 : 3;
      const priorityDiff = getInventoryPriority(a) - getInventoryPriority(b);
      if(priorityDiff !== 0){ return priorityDiff; }
      return a.name.localeCompare(b.name, "pt-BR");
    }).map(item => {
      const useButton = item.type === "consumable"
        ? `<button onclick="useConsumable('${item.id}')">Usar</button>`
        : "";
      const equipButton = item.type === "equipment"
        ? `<button onclick="equipItem('${item.uid}')" ${canEquipItem(item) ? "" : "disabled"}>Equipar</button>`
        : "";
      const openButton = item.type === "chest"
        ? `<button onclick="openChest('${item.uid}')">Abrir</button>`
        : "";
      const sellButton = currentMode === "village"
        ? `<button onclick="sellItem('${item.uid}')">Vender (${getSellPrice(item)} moedas)</button>`
        : "";
      const actionButton = (useButton || equipButton || openButton || sellButton)
        ? `<div class="button-row">${useButton}${equipButton}${openButton}${sellButton}</div>`
        : "";
      return getInventoryItemCardMarkup(
        item,
        item.type === "equipment" ? buildEquipmentDescription(item) : (item.description || ""),
        actionButton
      );
    }).join("")}</div>` : `<p class="lock-note">${hideArtisanMaterials && player.inventory.length ? "Os itens visiveis acabaram. Desative o filtro para mostrar os materiais de artesao." : "Sua mochila esta vazia por enquanto."}</p>`}`;

  renderActions();
  renderLevelUpPanel();
  animateBars();
  const logBox = document.getElementById("log");
  const logToggle = document.querySelector(".panel-header button");
  const logPanel = document.getElementById("logPanel");
  const playerPanel = document.getElementById("playerInfo");
  const enemyPanel = document.getElementById("enemyInfo");
  const actionsRow = document.getElementById("actions");
  const levelPanel = document.getElementById("levelUpPanel");
  const inventoryPanel = document.getElementById("inventoryInfo");
  if(logBox){
    logBox.style.display = isLogHidden ? "none" : "block";
  }
  if(logToggle){
    logToggle.textContent = isLogHidden ? "Mostrar" : "Ocultar";
  }
  if(logPanel){
    logPanel.style.display = ["battle", "dungeon"].includes(currentMode) ? "block" : "none";
  }
  if(playerPanel){
    playerPanel.style.display = ["trophies", "bestiary"].includes(currentMode) ? "none" : "block";
    playerPanel.style.order = ["battle", "dungeon"].includes(currentMode) ? "3" : "1";
  }
  if(enemyPanel){
    enemyPanel.style.order = ["battle", "dungeon"].includes(currentMode) ? "1" : "2";
  }
  if(actionsRow){
    actionsRow.style.order = ["battle", "dungeon"].includes(currentMode) ? "2" : "3";
  }
  if(levelPanel){
    levelPanel.style.order = "5";
  }
  if(logPanel){
    logPanel.style.order = ["battle", "dungeon"].includes(currentMode) ? "5" : "4";
  }
  if(playerPanel && ["battle", "dungeon"].includes(currentMode)){
    playerPanel.style.order = "3";
  }
  if(inventoryPanel){
    inventoryPanel.style.display = "block";
  }
  saveCampaign();
}

function animateBars(){
  requestAnimationFrame(() => {
    const playerHpFill = document.getElementById("playerHpFill");
    const playerShieldFill = document.getElementById("playerShieldFill");
    const playerMpFill = document.getElementById("playerMpFill");
    const playerXpFill = document.getElementById("playerXpFill");
    const enemyHpFill = document.getElementById("enemyHpFill");

    if(playerHpFill){
      playerHpFill.style.width = `${player.hp / getPreviewStats().maxHp * 100}%`;
    }
    if(playerShieldFill){
      playerShieldFill.style.width = `${Math.min(100, (playerEffects.shieldValue || 0) / getPreviewStats().maxHp * 100)}%`;
    }
    if(playerMpFill){
      playerMpFill.style.width = `${player.mp / getPreviewStats().maxMp * 100}%`;
    }
    if(playerXpFill){
    playerXpFill.style.width = `${player.level >= MAX_LEVEL ? 100 : player.xp / getXpToNextLevel() * 100}%`;
    }
    if(enemy && enemyHpFill){
      const shownEnemyHp = displayState.enemyHp ?? enemy.hp;
      enemyHpFill.style.width = `${Math.max(0, shownEnemyHp) / enemy.maxHp * 100}%`;
    }

    displayState.playerHp = player.hp;
    displayState.playerMp = player.mp;
    displayState.playerXp = player.xp;
  });
}

function renderActions(){
  const actions = document.getElementById("actions");
  const skillInfo = getSkillInfo();
  if(isDead){
    const remaining = Math.max(0, Math.ceil((deadUntil - Date.now()) / 1000));
    actions.innerHTML = `
      <div class="death-actions">
        <button onclick="resetAdventure()">Reiniciar aventura</button>
        <button onclick="respawnPlayer()" ${remaining > 0 ? "disabled" : ""}>${remaining > 0 ? `Renascer em ${remaining}s` : "Renascer"}</button>
      </div>`;
    return;
  }
  if(currentMode === "trophies"){
    actions.innerHTML = `<button onclick="setMode('battle')">Voltar para a batalha</button>`;
    return;
  }
  if(currentMode === "village"){
    actions.innerHTML = `<button onclick="setMode('battle')">Voltar para a batalha</button>`;
    return;
  }
  if(currentMode === "camp"){
    actions.innerHTML = `<button onclick="setMode('battle')">Voltar para a batalha</button>`;
    return;
  }
  if(currentMode === "bestiary"){
    actions.innerHTML = `<button onclick="setMode('battle')">Voltar para a batalha</button>`;
    return;
  }
  if(currentMode === "dungeon"){
    if(!IS_DUNGEON_PAGE){
      actions.innerHTML = `<button onclick="openDungeonPage()">Adentrar na dungeon</button><button onclick="setMode('battle')">Voltar para a batalha</button>`;
      return;
    }
    if(player.hp <= 0){
      actions.innerHTML = `<button disabled>Aguardando seu renascimento...</button>`;
      return;
    }
    if(levelUpPoints > 0 || needsSubclassChoice()){
      actions.innerHTML = `<button disabled>Finalize sua evolucao antes de continuar a dungeon</button><button onclick="setMode('battle')">Voltar para a batalha</button>`;
      return;
    }
    if(!isDungeonConnected()){
      actions.innerHTML = `<button onclick="hostDungeonRoom()">Criar sala</button><button onclick="joinDungeonRoom()">Entrar na sala</button><button onclick="setMode('battle')">Voltar para a batalha</button>`;
      return;
    }
    if(!enemy){
      actions.innerHTML = `${isDungeonHost() ? `<button onclick="startDungeonRaid()" ${getDungeonRoomMembers().length >= 2 ? "" : "disabled"}>Iniciar dungeon</button>` : `<button disabled>Aguardando o host iniciar</button>`}<button onclick="leaveDungeonRoom()">Sair da sala</button>`;
      return;
    }
    if(!isMyDungeonTurn()){
      actions.innerHTML = `<button disabled>Aguarde o turno do grupo...</button><button onclick="leaveDungeonRoom()">Sair da sala</button>`;
      return;
    }
    const dungeonSkillButtons = skillInfo.length
      ? skillInfo.map((skill, index) => renderSkillActionButton(skill, index, `dungeonUseSkill(${index})`)).join("")
      : `<button disabled>Nenhuma habilidade ativa disponivel</button>`;
    actions.innerHTML = `<button class="action-btn" data-tooltip="${getBasicAttackTooltip()}" onclick="dungeonAttack()">${getBasicAttackLabel()}</button>${dungeonSkillButtons}<button onclick="leaveDungeonRoom()">Sair da sala</button>`;
    return false;
  }
  if(levelUpPoints > 0){
    actions.innerHTML = `<button disabled>Distribua seus atributos para continuar</button>`;
    return false;
  }
  if(needsSubclassChoice()){
    actions.innerHTML = `<button disabled>Escolha sua subclasse para continuar</button>`;
    return;
  }
  if(isProcessingTurn){
    actions.innerHTML = `<button disabled>Aguarde o fim do turno...</button>`;
    return;
  }

  if(!enemy){
    actions.innerHTML = `<button onclick="ensureEnemy()">Procurar inimigo</button>`;
    return;
  }
  const skillButtons = skillInfo.length
    ? skillInfo.map((skill, index) => renderSkillActionButton(skill, index, `useSkill(${index})`)).join("")
    : `<button disabled>Nenhuma habilidade ativa disponivel</button>`;
  actions.innerHTML = `
    ${renderBasicActionButton(getBasicAttackLabel(), getBasicAttackTooltip(), "attack()")}
    ${skillButtons}
    <button class="action-btn" data-tooltip="Encerra sua vez sem usar ataque nem habilidade." onclick="passTurn()">Passar turno</button>
    <button class="action-btn" data-tooltip="Foge da batalha atual sem receber recompensas. Custa ${getFleeCost()} moedas." onclick="fleeBattle()">Fugir</button>`;
}

function toggleLog(){
  isLogHidden = !isLogHidden;
  updateUI();
}

function getSkillActionState(skill, actor = player){
  const manaCost = Math.max(0, skill?.cost || 0);
  const canUse = (actor?.mp || 0) >= manaCost;
  return {
    canUse,
    manaCost,
    classes: `action-btn skill-action ${canUse ? "skill-ready" : "skill-oom"}`
  };
}

function renderSkillActionButton(skill, index, onClick, actor = player){
  const state = getSkillActionState(skill, actor);
  const forcedBasicLock = actor === player && playerEffects.forcedBasicTurns > 0;
  const canUse = state.canUse && !forcedBasicLock;
  const tooltip = forcedBasicLock ? `${skill.description} | Bloqueada enquanto Cortes Ultrasonicos estiver ativo.` : skill.description;
  return `<button class="${state.classes}${forcedBasicLock ? " skill-locked" : ""}" data-tooltip="${tooltip}" onclick="${onClick}" ${canUse ? "" : "disabled"}>${skill.name}<span class="skill-cost-tag">${state.manaCost} MP</span></button>`;
}

function renderBasicActionButton(label, tooltip, onClick){
  return `<button class="action-btn basic-action-btn" data-tooltip="${tooltip}" onclick="${onClick}">${label}</button>`;
}

function renderLevelUpPanel(){
  const panel = document.getElementById("levelUpPanel");
  if(needsSubclassChoice()){
    const subclassState = getPlayerSubclassState();
    const tierLabel = !subclassState.tier30 ? "primeira" : "segunda";
    panel.style.display = "block";
    panel.innerHTML = `
      <h3>Escolha sua subclasse</h3>
      <p>Escolha sua ${tierLabel} vertente para continuar evoluindo.</p>
      <div class="button-row">
        ${getSubclassChoices().map(subclass => `<button class="action-btn" data-tooltip="${subclass.description}" onclick="chooseSubclass('${subclass.id}')">${subclass.name}</button>`).join("")}
      </div>`;
    return;
  }
  if(levelUpPoints <= 0){
    panel.style.display = "none";
    panel.innerHTML = "";
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = `
    <h3>Subiu de nivel!</h3>
    <p>Distribua ${levelUpPoints} ponto(s) antes da proxima batalha.</p>
    <div class="attribute-row">
      <div><strong>Vitalidade</strong><br><small>+${getAttributePointGain("vitality")} HP maxima por ponto</small></div>
      <div class="attribute-controls">
        <button onclick="adjustAttribute('vitality', -1)" ${(allocation.vitality || 0) === 0 ? "disabled" : ""}>-</button>
        <span class="attribute-value">${allocation.vitality || 0}</span>
        <button onclick="adjustAttribute('vitality', 1)" ${levelUpPoints === 0 ? "disabled" : ""}>+</button>
      </div>
    </div>
    <div class="attribute-row">
      <div><strong>Sabedoria</strong><br><small>+${getAttributePointGain("wisdom")} MP maxima por ponto</small></div>
      <div class="attribute-controls">
        <button onclick="adjustAttribute('wisdom', -1)" ${(allocation.wisdom || 0) === 0 ? "disabled" : ""}>-</button>
        <span class="attribute-value">${allocation.wisdom || 0}</span>
        <button onclick="adjustAttribute('wisdom', 1)" ${levelUpPoints === 0 ? "disabled" : ""}>+</button>
      </div>
    </div>
    <div class="attribute-row">
      <div><strong>Forca</strong><br><small>+${getAttributePointGain("strength")} ATQ e +${getAttributePointGain("strength")} dano de habilidade por ponto</small></div>
      <div class="attribute-controls">
        <button onclick="adjustAttribute('strength', -1)" ${(allocation.strength || 0) === 0 ? "disabled" : ""}>-</button>
        <span class="attribute-value">${allocation.strength || 0}</span>
        <button onclick="adjustAttribute('strength', 1)" ${levelUpPoints === 0 ? "disabled" : ""}>+</button>
      </div>
    </div>
    <button onclick="finishLevelUp()" ${levelUpPoints > 0 ? "disabled" : ""}>Terminar distribuicao e continuar</button>`;
}

function getManaRegen(){
  const modifiers = getPassiveModifiers();
  const bonusPercent = playerEffects.manaRegenBuffTurns > 0 ? playerEffects.manaRegenBuffPercent : 0;
  const totalPercent = modifiers.manaRegenPercentSet ?? (0.1 + modifiers.manaRegenPercent + bonusPercent);
  return Math.max(1, Math.floor(getPreviewStats().maxMp * totalPercent) + modifiers.manaRegen);
}

function regenMana(){
  const manaBefore = player.mp;
  const regen = getManaRegen();
  player.mp = Math.min(getCurrentCaps().maxMp, player.mp + regen);
  return player.mp - manaBefore;
}

function applyTurnStartPassives(){
  if(player.class === "Guerreiro" && getUnlockedPassiveSkills().some(skill => skill.type === "warrior_aura_shield")){
    const gain = Math.floor(getCurrentCaps().maxHp * 0.02);
    if(gain > 0){
      playerEffects.shieldValue += gain;
      log(`Aura Divina concedeu ${gain} de escudo.`);
    }
  }
}

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getEnemyBarAnimationConfig(isMissileSequence = false){
  const speed = uiSettings.enemyBarSpeed || "rapida";
  const nonMageProfiles = {
    instantanea: { stepDelay: 2, minFrames: 1, frameDivisor: 120, startDelay: 0 },
    rapida: { stepDelay: 4, minFrames: 2, frameDivisor: 40, startDelay: 0 },
    media: { stepDelay: 8, minFrames: 4, frameDivisor: 18, startDelay: 4 },
    lenta: { stepDelay: 12, minFrames: 6, frameDivisor: 12, startDelay: 8 }
  };
  const mageProfiles = {
    instantanea: { stepDelay: 7, minFrames: 2, frameDivisor: 22, startDelay: 0, missileStartDelay: 30, missileHitDelay: 70 },
    rapida: { stepDelay: 11, minFrames: 4, frameDivisor: 14, startDelay: 6, missileStartDelay: 55, missileHitDelay: 100 },
    media: { stepDelay: 15, minFrames: 6, frameDivisor: 9, startDelay: 10, missileStartDelay: 80, missileHitDelay: 140 },
    lenta: { stepDelay: 19, minFrames: 8, frameDivisor: 6, startDelay: 14, missileStartDelay: 110, missileHitDelay: 180 }
  };
  const profiles = player?.class === "Mago" ? mageProfiles : nonMageProfiles;
  const config = profiles[speed] || profiles.rapida;
  if(!isMissileSequence){
    return config;
  }
  return {
    missileStartDelay: config.missileStartDelay ?? config.startDelay ?? 0,
    missileHitDelay: config.missileHitDelay ?? config.stepDelay ?? 80
  };
}

function setEnemyBarWidth(hpValue){
  const enemyHpFill = document.getElementById("enemyHpFill");
  if(!enemyHpFill || !enemy){ return; }
  enemyHpFill.style.transition = "none";
  enemyHpFill.style.width = `${Math.max(0, hpValue) / enemy.maxHp * 100}%`;
}

async function animateEnemyBarTo(targetHp, startHp = null, stepDelay = 16, minFrames = 8, frameDivisor = 3, startDelay = 12){
  if(!enemy){ return; }
  const initialHp = Math.max(0, Math.floor(startHp ?? displayState.enemyHp ?? enemy.hp));
  let shownHp = initialHp;
  const finalHp = Math.max(0, Math.floor(targetHp));
  const startWidth = enemy.maxHp > 0 ? Math.max(0, shownHp) / enemy.maxHp * 100 : 0;
  const finalWidth = enemy.maxHp > 0 ? Math.max(0, finalHp) / enemy.maxHp * 100 : 0;
  const totalFrames = Math.max(minFrames, Math.ceil(Math.abs(startWidth - finalWidth) / frameDivisor));
  displayState.enemyHp = shownHp;
  setEnemyBarWidth(shownHp);
  if(startDelay > 0){
    await wait(startDelay);
  }
  for(let frame = 1; frame <= totalFrames; frame++){
    const progress = frame / totalFrames;
    const interpolatedHp = Math.round(initialHp + (finalHp - initialHp) * progress);
    const nextHp = frame === totalFrames ? finalHp : interpolatedHp;
    if(nextHp > shownHp){
      continue;
    }
    shownHp = nextHp;
    displayState.enemyHp = shownHp;
    setEnemyBarWidth(shownHp);
    await wait(stepDelay);
  }
}

async function animateEnemyHitSequence(hitDamages){
  if(!enemy || !Array.isArray(hitDamages) || !hitDamages.length){ return; }
  const animationConfig = getEnemyBarAnimationConfig(true);
  const totalDamage = hitDamages.reduce((sum, damage) => sum + damage, 0);
  let shownHp = enemy.hp + totalDamage;
  displayState.enemyHp = shownHp;
  setEnemyBarWidth(shownHp);
  await wait(animationConfig.missileStartDelay);
  for(const damage of hitDamages){
    shownHp = Math.max(0, shownHp - damage);
    displayState.enemyHp = shownHp;
    setEnemyBarWidth(shownHp);
    pulseSpriteClass("enemySpriteBox", "hit", 180);
    await wait(animationConfig.missileHitDelay);
  }
}

async function attack(){
  if(levelUpPoints > 0 || isProcessingTurn || !enemy){ return; }
  isProcessingTurn = true;
  if(await handlePlayerTurnStartEffects()){
    return;
  }
  const enemyHpBeforeAttack = enemy.hp;
  const result = getBasicAttackResult("Voce");
  if(result.blocked){
    log(result.message);
    isProcessingTurn = false;
    updateUI();
    return;
  }
  applyTurnStartPassives();
  log(result.message);
  playerEffects.lastActionType = "basic_attack";
  if(player.class === "Mago" && result.hitDamages?.length){
    await playSpriteAttackAnimation("hero", "cast", false);
    await animateEnemyHitSequence(result.hitDamages);
  }else{
    await playSpriteAttackAnimation("hero", "attack", result.damage > 0);
    const animationConfig = getEnemyBarAnimationConfig(false);
    await animateEnemyBarTo(
      enemy.hp,
      enemyHpBeforeAttack,
      animationConfig.stepDelay,
      animationConfig.minFrames,
      animationConfig.frameDivisor,
      animationConfig.startDelay
    );
  }
  decayPlayerBuffs();
  applyEndOfTurnRecovery();
  updateUI();
  await wait(320);
  await afterTurn();
}

async function useSkill(index){
  if(levelUpPoints > 0 || isProcessingTurn || !enemy){ return; }
  if(playerEffects.forcedBasicTurns > 0){
    log("Voce so pode usar o ataque basico enquanto Cortes Ultrasonicos estiver ativo.");
    updateUI();
    return;
  }
  const skills = getSkillInfo();
  const skillInfo = skills[index];
  if(!skillInfo){
    log("Voce ainda nao desbloqueou uma habilidade.");
    return;
  }
  isProcessingTurn = true;
  if(await handlePlayerTurnStartEffects()){
    return;
  }
  const enemyHpBeforeSkill = enemy.hp;
  const result = applySkillLocally(skillInfo);
  if(result.blocked){
    log(result.message);
    isProcessingTurn = false;
    updateUI();
    return;
  }
  applyTurnStartPassives();
  log(result.message);
  displayState.playerMp = player.mp;
  updateUI();
  await wait(80);
  await playSpriteAttackAnimation("hero", getSkillAnimationStyle(skillInfo), result.damage > 0);
  if(result.damage > 0){
    const animationConfig = getEnemyBarAnimationConfig(false);
    await animateEnemyBarTo(
      enemy.hp,
      enemyHpBeforeSkill,
      animationConfig.stepDelay,
      animationConfig.minFrames,
      animationConfig.frameDivisor,
      animationConfig.startDelay
    );
  }
  decayPlayerBuffs();
  applyEndOfTurnRecovery();
  updateUI();
  await wait(320);
  await afterTurn();
}

async function passTurn(){
  if(levelUpPoints > 0 || isProcessingTurn || !enemy){ return; }
  isProcessingTurn = true;
  if(await handlePlayerTurnStartEffects()){
    return;
  }
  applyTurnStartPassives();
  log("Voce passou o turno.");
  playerEffects.lastActionType = "pass_turn";
  decayPlayerBuffs();
  applyEndOfTurnRecovery();
  updateUI();
  await wait(320);
  await afterTurn();
}

function handleEnemyDefeat(){
  const defeatedRegion = enemy?.region;
  const wasBoss = !!enemy?.isBoss;
  log("Inimigo derrotado!");
  tryEnemyDrop(enemy);
  tryEnemyMaterialDrop(enemy);
  const coinMultiplier = 1 + getPassiveModifiers().coinBonus;
  const coinsEarned = Math.floor(((enemy.isBoss ? 18 : 4) + enemy.level * 3 + Math.floor(Math.random() * 4)) * coinMultiplier);
  const baseXpEarned = (enemy.isBoss ? 40 : 22) + enemy.level * 8;
  const xpEarned = baseXpEarned + Math.floor(baseXpEarned * getPassiveModifiers().xpBonus);
  player.coins += coinsEarned;
  player.stats.coinsEarned += coinsEarned;
  if(enemy.isBoss){
    player.stats.bossesDefeated++;
    recordRegionBossKill(defeatedRegion);
  }else{
    recordRegionEnemyKill(defeatedRegion, enemy.baseName);
    player.stats.enemiesDefeated++;
  }
  log(`Voce encontrou ${coinsEarned} moedas.`);
  log(`Voce ganhou ${xpEarned} de XP.`);
  if(wasBoss && defeatedRegion){
    grantBossChest(defeatedRegion);
    tryBossAccessoryDrop(defeatedRegion);
  }
  gainXP(baseXpEarned);
  enemy = null;
  needsNewEnemy = true;
  displayState.enemyHp = null;
  isProcessingTurn = false;
  updateUI();
}

async function afterTurn(){
  if(enemy.hp <= 0){
    handleEnemyDefeat();
    return;
  }
  if(player.class === "Guerreiro" && playerEffects.berserkerLastStandPending){
    playerEffects.berserkerLastStandPending = false;
    handleDeath("Voce Nao e Digno lhe deu um ultimo golpe antes da queda.");
    return;
  }
  await enemyTurn();
}

function handleBossBuffUpkeep(){
  if(!enemy?.isBoss){ return; }
  if(enemy.shieldTurns > 0){
    enemy.shieldTurns--;
    if(enemy.shieldTurns <= 0 && enemy.shieldValue > 0){
      enemy.shieldValue = 0;
      log(`${enemy.baseName} perdeu o escudo temporario.`);
    }
  }
  if(enemy.bossBuffTurns > 0 && enemy.bossRegenPercent > 0){
    const baseHeal = Math.max(1, Math.floor(enemy.maxHp * enemy.bossRegenPercent));
    const heal = Math.max(0, Math.floor(baseHeal * (1 - (enemy.healReductionTurns > 0 ? (enemy.healReductionPercent || 0) : 0))));
    const previousHp = enemy.hp;
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
    if(enemy.hp > previousHp){
      log(`${enemy.baseName} recuperou ${enemy.hp - previousHp} de vida com o buff ativo.`);
    }
  }
}

function tickBossBuff(){
  if(!enemy?.isBoss || enemy.bossBuffTurns <= 0){ return; }
  enemy.bossBuffTurns--;
  if(enemy.bossBuffTurns <= 0){
    enemy.bossAttackBuffPercent = 0;
    enemy.bossFlatDamageBonus = 0;
    enemy.bossPierceBonus = 0;
    enemy.bossRegenPercent = 0;
    log(`${enemy.baseName} perdeu o efeito do proprio buff.`);
  }
}

function getBossTemporaryBuffState(extraBuff = {}){
  return {
    attackPercent: (enemy.bossAttackBuffPercent || 0) + (extraBuff.attackPercent || 0),
    flatDamageBonus: (enemy.bossFlatDamageBonus || 0) + (extraBuff.flatDamageBonus || 0),
    pierceBonus: (enemy.bossPierceBonus || 0) + (extraBuff.pierceBonus || 0)
  };
}

function estimateBossDamageAgainstHero(rawDamage, options = {}){
  let damage = Math.max(0, Math.floor(rawDamage));
  if(playerEffects.incomingDamageBonusTurns > 0 && playerEffects.incomingDamageBonusPercent > 0){
    damage += Math.floor(damage * playerEffects.incomingDamageBonusPercent);
  }
  if(enemy.maxHpStrikePercent > 0){
    damage += Math.floor(getCurrentCaps().maxHp * enemy.maxHpStrikePercent);
  }
  const passiveModifiers = getPassiveModifiers();
  if(!options.ignoreFlatReduction){
    damage = Math.max(0, damage - (passiveModifiers.flatReduction || 0));
  }
  if(playerEffects.percentReductionTurns > 0 && playerEffects.percentReduction > 0){
    damage = Math.max(0, damage - Math.floor(damage * playerEffects.percentReduction));
  }
  if(!options.ignoreShield){
    damage = Math.max(0, damage - (playerEffects.shieldValue || 0));
  }
  if(!options.ignorePreciousMana && passiveModifiers.preciousMana && damage >= player.hp && player.mp > damage){
    damage = 0;
  }
  const hitRate = Math.max(0.05, 1 - getEnemyMissChance());
  return Math.max(0, Math.floor(damage * hitRate));
}

function getBossAbilityDamageEstimate(ability, extraBuff = {}){
  const tempBuff = getBossTemporaryBuffState(extraBuff);
  let damage = (ability.power || enemy.attack) + Math.floor((ability.variance || 6) / 2);
  damage += tempBuff.flatDamageBonus || 0;
  if(tempBuff.attackPercent > 0){
    damage += Math.floor(damage * tempBuff.attackPercent);
  }
  if(ability.type === "execute_unshielded" && (playerEffects.shieldValue || 0) <= 0){
    damage += ability.bonusIfNoShield || 0;
  }
  if(ability.type === "shield_breaker" && (playerEffects.shieldValue || 0) > 0){
    damage += ability.bonusIfShield || 0;
  }
  if(ability.type === "max_hp" || ability.maxHpPercent){
    damage += Math.floor(getCurrentCaps().maxHp * (ability.maxHpPercent || 0));
  }
  if((ability.type === "pierce" || ability.type === "shield_breaker") && tempBuff.pierceBonus > 0){
    damage += Math.floor(damage * tempBuff.pierceBonus);
  }
  let totalEstimate = estimateBossDamageAgainstHero(damage, {
    ignoreShield: !!ability.ignoreShield,
    ignoreFlatReduction: !!ability.ignoreFlatReduction,
    ignorePreciousMana: !!ability.ignorePreciousMana
  });
  if(ability.targetBurnPercent && ability.targetBurnTurns){
    totalEstimate += Math.floor(getCurrentCaps().maxHp * ability.targetBurnPercent) * Math.min(2, ability.targetBurnTurns);
  }
  if(ability.targetDamageDownPercent && ability.targetDamageDownTurns){
    totalEstimate += Math.floor(getBossFallbackOnlyScore(enemy.mp, extraBuff) * ability.targetDamageDownPercent * Math.min(2, ability.targetDamageDownTurns));
  }
  if(ability.targetHealReductionPercent && player.hp < getCurrentCaps().maxHp){
    totalEstimate += Math.floor(18 * ability.targetHealReductionPercent);
  }
  if(ability.targetSkipChance){
    totalEstimate += Math.floor(getBossFallbackOnlyScore(enemy.mp, extraBuff) * ability.targetSkipChance * 0.75);
  }
  if((ability.selfShieldPercent || ability.selfShieldFlat) && (!enemy.shieldValue || enemy.shieldValue <= 0)){
    totalEstimate += Math.floor(getBossShieldValue(ability) * 0.35);
  }
  return totalEstimate;
}

function getBossBasicAttackScore(extraBuff = {}){
  const tempBuff = getBossTemporaryBuffState(extraBuff);
  let damage = enemy.attack + 2 + (tempBuff.flatDamageBonus || 0);
  if(tempBuff.attackPercent > 0){
    damage += Math.floor(damage * tempBuff.attackPercent);
  }
  return estimateBossDamageAgainstHero(damage);
}

function getBossFallbackSkillScore(manaBudget = enemy.mp, extraBuff = {}){
  if(!enemy.isBoss || enemy.skillCost <= 0 || manaBudget < enemy.skillCost){
    return -1;
  }
  const tempBuff = getBossTemporaryBuffState(extraBuff);
  let damage = enemy.skillDamage + 3 + (tempBuff.flatDamageBonus || 0);
  if(tempBuff.attackPercent > 0){
    damage += Math.floor(damage * tempBuff.attackPercent);
  }
  return estimateBossDamageAgainstHero(damage);
}

function getBossFallbackOnlyScore(manaBudget = enemy.mp, extraBuff = {}){
  return Math.max(getBossBasicAttackScore(extraBuff), getBossFallbackSkillScore(manaBudget, extraBuff));
}

function getBossActionScore(ability){
  const currentCaps = getCurrentCaps();
  const playerMaxHp = currentCaps.maxHp || 1;
  const playerHpRatio = player.hp / playerMaxHp;
  const playerShield = playerEffects.shieldValue || 0;
  const bossHpRatio = enemy.hp / Math.max(1, enemy.maxHp || enemy.hp || 1);
  const buffActive = enemy.bossBuffTurns > 0;
  const manaLeft = enemy.mp - (ability.cost || 0);
  if(manaLeft < 0){
    return -999;
  }

  if(ability.type === "buff"){
    if(buffActive){
      return -999;
    }
    const extraBuff = {
      attackPercent: ability.attackPercent || 0,
      flatDamageBonus: ability.flatDamageBonus || 0,
      pierceBonus: ability.pierceBonus || 0
    };
    const bestCurrentDirect = Math.max(
      getBossFallbackOnlyScore(enemy.mp, {}),
      ...((enemy.bossAbilities || [])
        .filter(entry => entry.type !== "buff" && enemy.mp >= (entry.cost || 0))
        .map(entry => getBossAbilityDamageEstimate(entry, {})))
    );
    const bestBuffedDirect = Math.max(
      getBossFallbackOnlyScore(manaLeft, extraBuff),
      ...((enemy.bossAbilities || [])
        .filter(entry => entry.type !== "buff" && manaLeft >= (entry.cost || 0))
        .map(entry => getBossAbilityDamageEstimate(entry, extraBuff)))
    );
    const payoffTurns = Math.min(2, ability.turns || 1);
    const bonusDamage = Math.max(0, bestBuffedDirect - bestCurrentDirect) * payoffTurns;
    const regenValue = Math.floor(enemy.maxHp * (ability.regenPercent || 0) * payoffTurns);
    const shieldValue = getBossShieldValue(ability);
    let score = bonusDamage
      + Math.floor(regenValue * (bossHpRatio <= 0.6 ? 0.8 : 0.45))
      + Math.floor(shieldValue * (bossHpRatio <= 0.45 ? 0.55 : 0.35))
      - Math.floor(bestCurrentDirect * 0.75);
    if((ability.pierceBonus || 0) > 0 && playerShield > 0){
      score += Math.floor(bestCurrentDirect * Math.min(0.2, ability.pierceBonus));
    }
    if((ability.attackPercent || 0) > 0 && playerHpRatio <= 0.3){
      score -= 10;
    }
    if(playerHpRatio <= 0.35){
      score -= 20;
    }
    if(manaLeft < Math.min(enemy.skillCost || manaLeft, 20)){
      score -= 8;
    }
    return score;
  }

  let score = getBossAbilityDamageEstimate(ability, {});
  if(score >= player.hp){
    score += 30;
  }
  if(ability.type === "pierce" && playerShield > 0){
    score += 14;
  }
  if(ability.type === "shield_breaker" && playerShield > 0){
    score += 18;
  }
  if(ability.type === "execute_unshielded" && playerShield <= 0){
    score += playerHpRatio <= 0.45 ? 24 : 10;
  }
  if((ability.type === "max_hp" || ability.maxHpPercent) && playerMaxHp >= 700){
    score += 12;
  }
  if(manaLeft < Math.min(enemy.skillCost || 999, 24)){
    score -= 5;
  }
  return score;
}

function chooseBossAction(){
  const availableAbilities = (enemy.bossAbilities || []).filter(ability => enemy.mp >= (ability.cost || 0));
  if(!availableAbilities.length){
    return null;
  }
  const ranked = availableAbilities
    .map(ability => ({ ability, score: getBossActionScore(ability) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.ability || availableAbilities[0] || null;
}

function resolveBossAction(ability){
  enemy.mp = Math.max(0, enemy.mp - (ability.cost || 0));
  const shieldValue = getBossShieldValue(ability);
  if(ability.type === "buff"){
    enemy.bossBuffTurns = ability.turns || 3;
    enemy.bossAttackBuffPercent = ability.attackPercent || 0;
    enemy.bossFlatDamageBonus = ability.flatDamageBonus || 0;
    enemy.bossPierceBonus = ability.pierceBonus || 0;
    enemy.bossRegenPercent = ability.regenPercent || 0;
    if(shieldValue > 0 && enemy.noShieldTurns <= 0){
      enemy.shieldValue = Math.max(enemy.shieldValue || 0, shieldValue);
      enemy.shieldTurns = Math.max(enemy.shieldTurns || 0, ability.shieldTurns || ability.turns || 3);
    }
    log(`${enemy.baseName} usou ${ability.name} e fortaleceu a propria ofensiva.${shieldValue > 0 ? ` Ganhou ${shieldValue} de escudo.` : ""}`);
    return { type: "buff", animation: "buff", connectHit: false, damage: 0, options: {} };
  }
  let damage = (ability.power || enemy.attack) + Math.floor(Math.random() * ((ability.variance || 6) + 1));
  damage += enemy.bossFlatDamageBonus || 0;
  if(enemy.bossAttackBuffPercent > 0){
    damage += Math.floor(damage * enemy.bossAttackBuffPercent);
  }
  const options = {
    ignoreShield: !!ability.ignoreShield,
    ignoreFlatReduction: !!ability.ignoreFlatReduction,
    ignorePreciousMana: !!ability.ignorePreciousMana
  };
  if(ability.type === "execute_unshielded" && playerEffects.shieldValue <= 0){
    damage += ability.bonusIfNoShield || 0;
    log(`${ability.name} encontrou voce desprotegido e ficou mais forte.`);
  }
  if(ability.type === "shield_breaker" && playerEffects.shieldValue > 0){
    damage += ability.bonusIfShield || 0;
    log(`${ability.name} foi potencializada pelo seu escudo ativo.`);
  }
  if(ability.type === "max_hp" || ability.maxHpPercent){
    const maxHpDamage = Math.floor(getCurrentCaps().maxHp * (ability.maxHpPercent || 0));
    damage += maxHpDamage;
    if(maxHpDamage > 0){
      log(`${ability.name} drenou ${maxHpDamage} com base na sua vida maxima.`);
    }
  }
  if((ability.type === "pierce" || ability.type === "shield_breaker") && enemy.bossPierceBonus > 0){
    damage += Math.floor(damage * enemy.bossPierceBonus);
  }
  if(shieldValue > 0 && enemy.noShieldTurns <= 0){
    enemy.shieldValue = Math.max(enemy.shieldValue || 0, shieldValue);
    enemy.shieldTurns = Math.max(enemy.shieldTurns || 0, ability.shieldTurns || 2);
  }
  if(ability.targetBurnPercent && ability.targetBurnTurns){
    const burnDamage = Math.max(1, Math.floor(getCurrentCaps().maxHp * ability.targetBurnPercent));
    playerEffects.burnDamagePerTurn = Math.max(playerEffects.burnDamagePerTurn, burnDamage);
    playerEffects.burnTurns = Math.max(playerEffects.burnTurns, ability.targetBurnTurns);
    log(`${enemy.baseName} incendiou voce por ${ability.targetBurnTurns} turnos.`);
  }
  if(ability.targetHealReductionPercent && ability.targetHealReductionTurns){
    playerEffects.healReductionPercent = Math.max(playerEffects.healReductionPercent, ability.targetHealReductionPercent);
    playerEffects.healReductionTurns = Math.max(playerEffects.healReductionTurns, ability.targetHealReductionTurns);
    log(`${enemy.baseName} reduziu sua cura em ${Math.floor(ability.targetHealReductionPercent * 100)}% por ${ability.targetHealReductionTurns} turnos.`);
  }
  if(ability.targetDamageDownPercent && ability.targetDamageDownTurns){
    playerEffects.damageDownPercent = Math.max(playerEffects.damageDownPercent, ability.targetDamageDownPercent);
    playerEffects.damageDownTurns = Math.max(playerEffects.damageDownTurns, ability.targetDamageDownTurns);
    log(`${enemy.baseName} reduziu seu dano em ${Math.floor(ability.targetDamageDownPercent * 100)}% por ${ability.targetDamageDownTurns} turnos.`);
  }
  if(ability.targetSkipChance && Math.random() < ability.targetSkipChance){
    playerEffects.skipNextTurn = true;
    log(`${enemy.baseName} desestabilizou voce. Seu proximo turno sera perdido.`);
  }
  log(`${enemy.baseName} usou ${ability.name}.`);
  return { type: ability.type, animation: ability.animation || (ability.type === "nuke" ? "cast" : "attack"), connectHit: true, damage, options };
}

async function enemyTurn(){
  handleBossBuffUpkeep();
  if(enemy.dotTurns > 0 && enemy.dotDamagePerTurn > 0){
    enemy.hp -= enemy.dotDamagePerTurn;
    log(`${enemy.baseName} sofreu ${enemy.dotDamagePerTurn} de dano continuo${enemy.dotSourceName ? ` por ${enemy.dotSourceName}` : ""}.`);
    enemy.dotTurns--;
    if(enemy.dotTurns <= 0){
      enemy.dotDamagePerTurn = 0;
      enemy.dotSourceName = "";
    }
    updateUI();
    await wait(220);
    if(enemy.hp <= 0){
      handleEnemyDefeat();
      return;
    }
  }
  if(await processNatureDotTicks()){
    return;
  }
  if(enemy.healReductionTurns > 0){
    enemy.healReductionTurns--;
    if(enemy.healReductionTurns <= 0){
      enemy.healReductionPercent = 0;
    }
  }
  if(enemy.blizzardTurns > 0){
    enemy.blizzardTurns--;
    if(enemy.blizzardTurns <= 0){
      enemy.blizzardSkipChance = 0;
    }
  }
  if(enemy.noShieldTurns > 0){
    enemy.noShieldTurns--;
  }
  if(enemy.rootedTurns > 0){
    enemy.rootedTurns--;
  }
  log(`${enemy.name} prepara um ataque!`);
  await wait(220);
  let dmg = 0;
  let maxHpImpactDamage = 0;
  let animationStyle = "attack";
  let connectHit = true;
  let incomingOptions = {};
  let bossActionUsed = null;
  if(enemy.isBoss){
    enemy.mp = Number.isFinite(enemy.mp) ? enemy.mp : 0;
    enemy.maxMp = Number.isFinite(enemy.maxMp) ? enemy.maxMp : 0;
    enemy.skillCost = Number.isFinite(enemy.skillCost) ? enemy.skillCost : 0;
    enemy.skillDamage = Number.isFinite(enemy.skillDamage) ? enemy.skillDamage : 0;
    if((enemy.bossAbilities || []).length > 0){
      bossActionUsed = chooseBossAction();
    }
  }
  if(bossActionUsed){
    const resolvedAction = resolveBossAction(bossActionUsed);
    animationStyle = resolvedAction.animation;
    connectHit = resolvedAction.connectHit;
    dmg = resolvedAction.damage;
    incomingOptions = resolvedAction.options;
    if(resolvedAction.type === "buff"){
      if(enemy.isBoss && enemy.maxMp > 0 && enemy.mp < enemy.maxMp){
        enemy.mp = Math.min(enemy.maxMp, enemy.mp + Math.max(4, Math.floor(enemy.maxMp / 8)));
      }
      await playSpriteAttackAnimation("enemy", "buff", false);
      if(playerEffects.shieldTurns > 0){
        playerEffects.shieldTurns--;
        if(playerEffects.shieldTurns <= 0){
          playerEffects.shieldValue = 0;
          playerEffects.shieldReactiveWeakening = false;
          log("Seu escudo se desfez.");
        }
      }
      tickBossBuff();
      updateUI();
      await wait(320);
      if(player.hp <= 0){
        handleDeath();
        return;
      }
      if(enemy.hp <= 0){
        handleEnemyDefeat();
        return;
      }
      isProcessingTurn = false;
      updateUI();
      return;
    }
  }else{
    const usesLegacyBossFallbackSkill = enemy.isBoss && (!enemy.bossAbilities || !enemy.bossAbilities.length);
    const canUseBossSkill = usesLegacyBossFallbackSkill && enemy.skillCost > 0 && enemy.mp >= enemy.skillCost;
    const shouldCastFallbackSkill = canUseBossSkill;
    if(shouldCastFallbackSkill){
      enemy.mp -= enemy.skillCost;
      dmg = enemy.skillDamage + Math.floor(Math.random() * 6);
      animationStyle = "cast";
      log(`${enemy.skillName} foi conjurada.`);
    }else{
      dmg = enemy.attack + Math.floor(Math.random() * 5);
      if(enemy.bossAttackBuffPercent > 0){
        dmg += Math.floor(dmg * enemy.bossAttackBuffPercent);
      }
      dmg += enemy.bossFlatDamageBonus || 0;
      if(enemy.isBoss && enemy.skillCost > 0 && enemy.mp < enemy.skillCost){
        log(`${enemy.name} ficou sem mana suficiente e partiu para um ataque basico.`);
      }else{
        log(`O inimigo atacou.`);
      }
    }
  }
  if(enemy.isBoss && enemy.maxMp > 0 && enemy.mp < enemy.maxMp){
    enemy.mp = Math.min(enemy.maxMp, enemy.mp + Math.max(4, Math.floor(enemy.maxMp / 8)));
  }
  const passiveEnemySkipChance = getPassiveModifiers().enemySkipChance || 0;
  if(enemy.skipNextAttack){
    enemy.skipNextAttack = false;
    log(`${enemy.name} perdeu o ataque desta rodada.`);
    dmg = 0;
  }else if(enemy.blizzardSkipChance > 0 && Math.random() < enemy.blizzardSkipChance){
    log(`${enemy.name} ficou preso na nevasca e perdeu o turno.`);
    dmg = 0;
  }else if(passiveEnemySkipChance > 0 && Math.random() < passiveEnemySkipChance){
    log(`${enemy.name} hesitou e perdeu o turno.`);
    dmg = 0;
  }
  if(dmg > 0){
    if(enemy.maxHpStrikePercent > 0){
      maxHpImpactDamage = Math.floor(getCurrentCaps().maxHp * enemy.maxHpStrikePercent);
      dmg += maxHpImpactDamage;
    }
    if(enemy.attackDownTurns > 0){
      dmg = Math.floor(dmg * (1 - (enemy.attackDownPercent || 0)));
    }
    const result = applyIncomingDamage(dmg, incomingOptions);
    await playSpriteAttackAnimation("enemy", animationStyle, connectHit && !result.missed);
    if(result.missed){
      log("O inimigo errou o ataque.");
      dmg = 0;
    }else{
      if(maxHpImpactDamage > 0){
        log(`${enemy.baseName} adicionou ${maxHpImpactDamage} de dano com um impacto brutal.`);
      }
      if((incomingOptions.ignoreShield || incomingOptions.ignoreFlatReduction) && dmg > 0){
        log(`${enemy.baseName} atravessou parte das suas defesas.`);
      }
      if(result.absorbed > 0){
        log(`Seu escudo absorveu ${result.absorbed} de dano.`);
      }
      if(result.manaAbsorbed > 0){
        log(`Ultimo Recurso absorveu ${result.manaAbsorbed} de dano com mana.`);
      }
      dmg = result.damage;
      if(dmg > 0){
        log(`Voce sofreu ${dmg} de dano.`);
      }
    }
  }
  tickBossBuff();
  if(enemy.attackDownTurns > 0){
    enemy.attackDownTurns--;
    if(enemy.attackDownTurns <= 0){
      enemy.attackDownPercent = 0;
    }
  }
  if(enemy.armorDownTurns > 0){
    enemy.armorDownTurns--;
    if(enemy.armorDownTurns <= 0){
      enemy.armorDownPercent = 0;
    }
  }
  if(playerEffects.shieldTurns > 0){
    playerEffects.shieldTurns--;
    if(playerEffects.shieldTurns <= 0){
      playerEffects.shieldValue = 0;
      playerEffects.shieldReactiveWeakening = false;
      log("Seu escudo se desfez.");
    }
  }
  updateUI();
  await wait(320);
  if(player.hp <= 0){
    handleDeath();
    return;
  }
  if(enemy.hp <= 0){
    handleEnemyDefeat();
    return;
  }
  isProcessingTurn = false;
  updateUI();
}

function gainXP(amount){
  const totalAmount = amount + Math.floor(amount * getPassiveModifiers().xpBonus);
  if(player.level >= MAX_LEVEL){
    player.xp = getXpToNextLevel();
    return;
  }
  player.xp += totalAmount;
  while(player.level < MAX_LEVEL && player.xp >= getXpToNextLevel()){
    player.xp -= getXpToNextLevel();
    player.level++;
    pendingLevelUps++;
    levelUpPoints++;
    log("Voce subiu de nivel! Distribua 1 ponto de atributo.");
  }
  if(player.level >= MAX_LEVEL){
    player.level = MAX_LEVEL;
    player.xp = getXpToNextLevel();
    log("Voce alcancou o nivel maximo!");
  }
}

function adjustAttribute(attribute, amount){
  if(amount > 0 && levelUpPoints <= 0){ return; }
  if(amount < 0 && allocation[attribute] <= 0){ return; }

  allocation[attribute] += amount;
  levelUpPoints -= amount;
  updateUI();
}

function getTotalInvestedPoints(){
  const invested = createDefaultInvestedStats(player?.stats?.invested || {});
  return (Number(invested.vitality) || 0) + (Number(invested.wisdom) || 0) + (Number(invested.strength) || 0);
}

function getTrainerRespecCost(){
  return Math.max(0, 30 * (player?.level || 0));
}

function syncInvestedStatsFromCurrentTotals(){
  if(!player || !player.stats){
    return;
  }
  const baseStats = player.baseStats || classes[player.class];
  if(!baseStats){
    return;
  }
  const invested = createDefaultInvestedStats(player.stats.invested || {});
  const hpGain = Math.max(0, (player.maxHp || baseStats.hp) - baseStats.hp);
  const mpGain = Math.max(0, (player.maxMp || baseStats.mp) - baseStats.mp);
  const attackGain = Math.max(0, (player.attack || baseStats.attack) - baseStats.attack);
  invested.hpGain = hpGain;
  invested.mpGain = mpGain;
  invested.attackGain = attackGain;
  invested.skillGain = attackGain;
  const vitalityValue = Math.max(1, getAttributePointGain("vitality"));
  const wisdomValue = Math.max(1, getAttributePointGain("wisdom"));
  const strengthValue = Math.max(1, getAttributePointGain("strength"));
  if((invested.vitality || 0) <= 0 && hpGain > 0){
    invested.vitality = Math.max(0, Math.round(hpGain / vitalityValue));
  }
  if((invested.wisdom || 0) <= 0 && mpGain > 0){
    invested.wisdom = Math.max(0, Math.round(mpGain / wisdomValue));
  }
  if((invested.strength || 0) <= 0 && attackGain > 0){
    invested.strength = Math.max(0, Math.round(attackGain / strengthValue));
  }
  const maxSpendable = Math.max(0, (player.level || 1) - 1);
  let totalTracked = (invested.vitality || 0) + (invested.wisdom || 0) + (invested.strength || 0);
  if(totalTracked > maxSpendable){
    let overflow = totalTracked - maxSpendable;
    for(const key of ["strength", "wisdom", "vitality"]){
      if(overflow <= 0){ break; }
      const reducible = Math.min(invested[key] || 0, overflow);
      invested[key] -= reducible;
      overflow -= reducible;
    }
  }
  player.stats.invested = invested;
}

function getInvestedSummary(){
  syncInvestedStatsFromCurrentTotals();
  const invested = createDefaultInvestedStats(player?.stats?.invested || {});
  const previewGains = getPendingAllocationGains();
  const vitalityPoints = (Number(invested.vitality) || 0) + (Number(allocation?.vitality) || 0);
  const wisdomPoints = (Number(invested.wisdom) || 0) + (Number(allocation?.wisdom) || 0);
  const strengthPoints = (Number(invested.strength) || 0) + (Number(allocation?.strength) || 0);
  const trackedTotal = vitalityPoints + wisdomPoints + strengthPoints;
  const totalLevelPoints = Math.max(0, (player?.level || 1) - 1);
  return {
    vitalityPoints,
    wisdomPoints,
    strengthPoints,
    hpGain: (Number(invested.hpGain) || 0) + (previewGains.hpGain || 0),
    mpGain: (Number(invested.mpGain) || 0) + (previewGains.mpGain || 0),
    attackGain: (Number(invested.attackGain) || 0) + (previewGains.attackGain || 0),
    skillGain: (Number(invested.skillGain ?? invested.attackGain) || 0) + (previewGains.skillGain || 0),
    trackedTotal,
    totalLevelPoints,
    untrackedPoints: Math.max(0, totalLevelPoints - trackedTotal)
  };
}

function resetInvestedStatsAtCamp(){
  if(!player || !player.stats){
    log("O treinador nao encontrou seus dados de progresso.");
    return false;
  }
  if(currentMode !== "camp"){
    log("O treinador so atende no acampamento.");
    return false;
  }
  if(isProcessingTurn || isDead){
    log("Voce nao pode reorganizar atributos agora.");
    return;
  }
  if(levelUpPoints > 0){
    log("Termine de distribuir seus pontos atuais antes de falar com o treinador.");
    return;
  }
  if(needsSubclassChoice()){
    log("Escolha sua subclasse antes de reorganizar atributos.");
    return;
  }
  const totalInvested = Math.max(0, player.level - 1);
  if(totalInvested <= 0){
    log("Voce ainda nao tem pontos investidos para redistribuir.");
    return false;
  }
  const cost = getTrainerRespecCost();
  if(player.coins < cost){
    log(`O treinador cobra ${cost} moedas para reorganizar seus pontos.`);
    return false;
  }
  const baseStats = player.baseStats || classes[player.class];
  player.coins -= cost;
  player.maxHp = baseStats?.hp || player.maxHp;
  player.maxMp = baseStats?.mp || player.maxMp;
  player.attack = baseStats?.attack || player.attack;
  player.stats.invested = createDefaultInvestedStats();
  levelUpPoints = totalInvested;
  allocation = { strength: 0, wisdom: 0, vitality: 0 };
  player.hp = Math.min(getCurrentCaps().maxHp, player.hp);
  player.mp = Math.min(getCurrentCaps().maxMp, player.mp);
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  currentMode = "camp";
  log(`O treinador reorganizou seus atributos por ${cost} moedas. Redistribua ${totalInvested} ponto(s) ganhos ate o seu nivel atual.`);
  updateUI();
  const panel = document.getElementById("levelUpPanel");
  if(panel){
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return true;
}

function finishLevelUp(){
  if(levelUpPoints > 0){ return; }

  player.stats.invested = createDefaultInvestedStats(player.stats.invested || {});
  const spentVitality = Number(allocation.vitality) || 0;
  const spentWisdom = Number(allocation.wisdom) || 0;
  const spentStrength = Number(allocation.strength) || 0;
  const vitalityGainPerPoint = getAttributePointGain("vitality");
  const wisdomGainPerPoint = getAttributePointGain("wisdom");
  const strengthGainPerPoint = getAttributePointGain("strength");
  const hpGain = spentVitality * vitalityGainPerPoint;
  const mpGain = spentWisdom * wisdomGainPerPoint;
  const attackGain = spentStrength * strengthGainPerPoint;
  player.stats.invested.vitality += spentVitality;
  player.stats.invested.wisdom += spentWisdom;
  player.stats.invested.strength += spentStrength;
  player.stats.invested.hpGain += hpGain;
  player.stats.invested.mpGain += mpGain;
  player.stats.invested.attackGain += attackGain;
  player.stats.invested.skillGain += attackGain;
  player.maxHp += hpGain;
  player.maxMp += mpGain;
  player.attack += attackGain;
  player.hp = Math.min(getCurrentCaps().maxHp, player.hp + hpGain);
  player.mp = Math.min(getCurrentCaps().maxMp, player.mp + mpGain);
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  displayState.playerXp = player.xp;
  pendingLevelUps = 0;
  allocation = { strength: 0, wisdom: 0, vitality: 0 };
  isProcessingTurn = false;
  log(`Atributos atualizados: +${hpGain} HP max, +${mpGain} MP max, +${attackGain} ATQ e +${attackGain} dano de habilidade.`);
  enemy = null;
  needsNewEnemy = true;
  currentMode = "battle";
  updateUI();
}

function chooseSubclass(subclassId){
  if(!needsSubclassChoice()){ return; }
  const subclass = getSubclassChoices().find(option => option.id === subclassId);
  if(!subclass){ return; }
  const subclassState = getPlayerSubclassState();
  if(!subclassState.tier30){
    subclassState.tier30 = subclass.id;
  }else{
    subclassState.tier60 = subclass.id;
  }
  player.activeSkills = getClassTrees().activeSkills;
  player.passiveSkills = getClassTrees().passiveSkills;
  player.hp = Math.min(getPreviewStats().maxHp, player.hp + (subclass.bonusHp || 0));
  player.mp = Math.min(getPreviewStats().maxMp, player.mp + (subclass.bonusMp || 0));
  displayState.playerHp = player.hp;
  displayState.playerMp = player.mp;
  currentMode = "camp";
  log(`Voce escolheu a subclasse ${subclass.name} e recebeu ${formatSubclassStatBonuses(subclass)}.`);
  updateUI();
}

function log(msg){
  const logBox = document.getElementById("log");
  logBox.innerHTML += `<p>${msg}</p>`;
  logBox.scrollTop = logBox.scrollHeight;
}

if(IS_DUNGEON_PAGE){
  renderSavedCampaign();
}else{
  let shouldResumeQueuedCampaign = false;
  try{
    shouldResumeQueuedCampaign = !!sessionStorage.getItem(PENDING_PAGE_MODE_KEY);
  }catch{}
  if(shouldResumeQueuedCampaign && localStorage.getItem(SAVE_KEY)){
    continueCampaign();
  }else{
    renderSavedCampaign();
  }
}
renderSettingsPanel();
setInterval(() => {
  if(isDead){
    updateUI();
  }
}, 1000);

