const regionMusicTracks = {
  Floresta: { src: "assets/audio/music/gossamer-cache.mp3", label: "Gossamer Cache" }
};

const rarityOrder = ["comum", "incomum", "rara", "ultra_rara", "lendaria"];
const rarityData = {
  comum: { label: "Comum", cssClass: "rarity-comum" },
  incomum: { label: "Incomum", cssClass: "rarity-incomum" },
  rara: { label: "Rara", cssClass: "rarity-rara" },
  ultra_rara: { label: "Ultra rara", cssClass: "rarity-ultra-rara" },
  lendaria: { label: "Lendaria", cssClass: "rarity-lendaria" }
};
const equipmentSlots = ["head", "chest", "weapon", "legs", "feet", "accessory"];
const slotLabels = { head: "Cabeca", chest: "Peito", weapon: "Arma", legs: "Pernas", feet: "Pes", accessory: "Acessorio" };
const classIcons = {
  Guerreiro: "&#x1F6E1;&#xFE0F;",
  Arqueiro: "&#x1F3F9;",
  Mago: "&#x1F52E;",
  "Adepto da Natureza": "&#x1F33F;"
};
const subclassIcons = {
  cavaleiro: "&#x1F6E1;&#xFE0F;",
  espadachim: "&#x2694;&#xFE0F;",
  paladino: "&#x2728;",
  berserker: "&#x1FA93;",
  samurai: "&#x1F5E1;&#xFE0F;",
  ninja: "&#x1F977;",
  elementalista: "&#x1F30A;",
  arcanista: "&#x2728;",
  mago_incendiario: "&#x1F525;",
  mago_frigido: "&#x2744;&#xFE0F;",
  arquimago: "&#x1F52E;",
  corrompido: "&#x1F47E;",
  atirador: "&#x1F3AF;",
  cacador: "&#x1F3F9;",
  atirador_arcano: "&#x2728;",
  sniper: "&#x1F4A5;",
  espreitador: "&#x1F576;&#xFE0F;",
  guarda_florestal: "&#x1F333;",
  druida: "&#x1F332;",
  espirito_da_floresta: "&#x1F9DA;",
  druida_sombrio: "&#x1F344;",
  avatar_da_natureza: "&#x1F343;",
  fada_monarca: "&#x1F338;",
  protetor_da_floresta: "&#x1F6E1;&#xFE0F;"
};
const combatArtAssets = {
  heroes: {},
  enemies: {}
};
const combatArtAliases = {
  enemies: {
    "devorador-do-eco": "devorador-de-eras"
  }
};
const regionSetBonusProfiles = {
  Floresta: { bonusMpPercent: 0.05 },
  Caverna: { bonusHpPercent: 0.05 },
  Ruinas: { totalDamagePercent: 0.03 },
  Pantano: { bonusMpPercent: 0.10 },
  Vulcao: { bonusHpPercent: 0.10 },
  Abismo: { totalDamagePercent: 0.06 },
  Fortaleza: { bonusMpPercent: 0.15 },
  Necropole: { bonusHpPercent: 0.15 },
  Citadela: { totalDamagePercent: 0.09 },
  Panteao: { bonusMpPercent: 0.20 },
  Cataclismo: { bonusHpPercent: 0.20 },
  Paradoxo: { totalDamagePercent: 0.12 }
};
const bossAccessoryProfiles = {
  Floresta: { id: "colar_de_raizes", name: "Colar de Raizes" },
  Caverna: { id: "geodo", name: "Geodo" },
  Ruinas: { id: "tabula_antiga", name: "Tabula Antiga" },
  Pantano: { id: "escama_da_hidra", name: "Escama da Hidra" },
  Vulcao: { id: "pedra_de_magma", name: "Pedra de Magma" },
  Abismo: { id: "anel_abismal", name: "Anel Abismal" },
  Fortaleza: { id: "alma_do_general", name: "Alma do General" },
  Necropole: { id: "pacto_do_lorde", name: "Pacto do Lorde" },
  Citadela: { id: "encanto_do_eclipse", name: "Encanto do Eclipse" },
  Panteao: { id: "colar_da_fe", name: "Colar da Fe" },
  Cataclismo: { id: "tesseract", name: "Tesseract" },
  Paradoxo: { id: "o_fim", name: "O Fim" }
};
const regionCombatProfiles = {
  Floresta: { armorScale: 0.1, armorFlat: 1, maxHpStrikePercent: 0, hpMultiplier: 1, attackMultiplier: 1, bossHpMultiplier: 1, bossAttackMultiplier: 1, bossSkillMultiplier: 1, bossManaMultiplier: 1, bossArmorBonus: 1 },
  Caverna: { armorScale: 0.14, armorFlat: 2, maxHpStrikePercent: 0, hpMultiplier: 1, attackMultiplier: 1, bossHpMultiplier: 1, bossAttackMultiplier: 1, bossSkillMultiplier: 1, bossManaMultiplier: 1, bossArmorBonus: 2 },
  Ruinas: { armorScale: 0.2, armorFlat: 3, maxHpStrikePercent: 0, hpMultiplier: 1, attackMultiplier: 1, bossHpMultiplier: 1.02, bossAttackMultiplier: 1.02, bossSkillMultiplier: 1.03, bossManaMultiplier: 1.02, bossArmorBonus: 3 },
  Pantano: { armorScale: 0.24, armorFlat: 5, maxHpStrikePercent: 0, hpMultiplier: 1, attackMultiplier: 1, bossHpMultiplier: 1.04, bossAttackMultiplier: 1.04, bossSkillMultiplier: 1.05, bossManaMultiplier: 1.03, bossArmorBonus: 4 },
  Vulcao: { armorScale: 0.46, armorFlat: 16, maxHpStrikePercent: 0.025, hpMultiplier: 1.62, attackMultiplier: 1.46, bossHpMultiplier: 1.42, bossAttackMultiplier: 1.36, bossSkillMultiplier: 1.4, bossManaMultiplier: 1.18, bossArmorBonus: 8 },
  Abismo: { armorScale: 0.58, armorFlat: 22, maxHpStrikePercent: 0.04, hpMultiplier: 1.92, attackMultiplier: 1.68, bossHpMultiplier: 1.58, bossAttackMultiplier: 1.5, bossSkillMultiplier: 1.56, bossManaMultiplier: 1.22, bossArmorBonus: 11 },
  Fortaleza: { armorScale: 0.72, armorFlat: 30, maxHpStrikePercent: 0.055, hpMultiplier: 2.28, attackMultiplier: 1.92, bossHpMultiplier: 1.78, bossAttackMultiplier: 1.68, bossSkillMultiplier: 1.74, bossManaMultiplier: 1.26, bossArmorBonus: 15 },
  Necropole: { armorScale: 0.86, armorFlat: 40, maxHpStrikePercent: 0.07, hpMultiplier: 2.7, attackMultiplier: 2.18, bossHpMultiplier: 2.0, bossAttackMultiplier: 1.88, bossSkillMultiplier: 1.96, bossManaMultiplier: 1.3, bossArmorBonus: 19 },
  Citadela: { armorScale: 1.02, armorFlat: 54, maxHpStrikePercent: 0.085, hpMultiplier: 3.16, attackMultiplier: 2.46, bossHpMultiplier: 2.24, bossAttackMultiplier: 2.08, bossSkillMultiplier: 2.18, bossManaMultiplier: 1.35, bossArmorBonus: 24 },
  Panteao: { armorScale: 1.22, armorFlat: 70, maxHpStrikePercent: 0.105, hpMultiplier: 3.7, attackMultiplier: 2.78, bossHpMultiplier: 2.52, bossAttackMultiplier: 2.32, bossSkillMultiplier: 2.42, bossManaMultiplier: 1.4, bossArmorBonus: 31 },
  Cataclismo: { armorScale: 1.46, armorFlat: 90, maxHpStrikePercent: 0.13, hpMultiplier: 4.34, attackMultiplier: 3.16, bossHpMultiplier: 2.86, bossAttackMultiplier: 2.62, bossSkillMultiplier: 2.72, bossManaMultiplier: 1.46, bossArmorBonus: 39 },
  Paradoxo: { armorScale: 1.68, armorFlat: 112, maxHpStrikePercent: 0.15, hpMultiplier: 4.94, attackMultiplier: 3.55, bossHpMultiplier: 3.14, bossAttackMultiplier: 2.88, bossSkillMultiplier: 3.02, bossManaMultiplier: 1.52, bossArmorBonus: 48 }
};
const consumableCatalog = {
  mana_potion: { name: "Pocao de Mana", price: 60, description: "Recupera 35% da mana maxima.", useLabel: "Usar", effectType: "restore_mana_percent", value: 0.35 },
  health_potion: { name: "Pocao de Vida", price: 42, description: "Recupera 35% da vida maxima.", useLabel: "Usar", effectType: "restore_hp_percent", value: 0.35 },
  skill_tonic: { name: "Tonico Arcano", price: 75, description: "Aumenta o dano de habilidade em 20% por 3 turnos.", useLabel: "Usar", effectType: "buff_skill", value: 0.2, turns: 3, isPercent: true },
  attack_tonic: { name: "Tonico de Guerra", price: 75, description: "Aumenta o dano de ataque em 20% por 3 turnos.", useLabel: "Usar", effectType: "buff_attack", value: 0.2, turns: 3, isPercent: true }
};
