const regionMusicTracks = {
  Floresta: { src: "assets/audio/music/gossamer-cache.mp3", label: "Gossamer Cache" }
};

const rarityOrder = ["comum", "incomum", "rara", "ultra_rara", "lendaria"];
const rarityData = {
  comum: { label: "Comum", cssClass: "rarity-comum", weight: 62 },
  incomum: { label: "Incomum", cssClass: "rarity-incomum", weight: 20 },
  rara: { label: "Rara", cssClass: "rarity-rara", weight: 10 },
  ultra_rara: { label: "Ultra rara", cssClass: "rarity-ultra-rara", weight: 5 },
  lendaria: { label: "Lendaria", cssClass: "rarity-lendaria", weight: 3 }
};
const rarityStats = {
  hp: { comum: 28, incomum: 48, rara: 74, ultra_rara: 108, lendaria: 156 },
  mp: { comum: 20, incomum: 34, rara: 52, ultra_rara: 76, lendaria: 108 },
  attack: { comum: 7, incomum: 12, rara: 18, ultra_rara: 26, lendaria: 38 },
  skill: { comum: 8, incomum: 14, rara: 21, ultra_rara: 31, lendaria: 45 }
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
const legacyEnemyDrops = {
  "Lobo Sombrio": { id: "sandalia_mago", name: "Sandalia de Mago", slot: "feet", classRestriction: "Mago", stats: { bonusHp: "hp" } },
  Goblin: { id: "calca_esfarrapada", name: "Calca Esfarrapada", slot: "legs", classRestriction: "Arqueiro", stats: { bonusHp: "hp" } },
  "Aranha Gigante": { id: "colete_de_presas", name: "Colete de Presas", slot: "chest", classRestriction: "Guerreiro", stats: { bonusHp: "hp" } },
  "Morcego de Pedra": { id: "botas_petricas", name: "Botas Petricas", slot: "feet", classRestriction: "Guerreiro", stats: { bonusHp: "hp" } },
  "Esqueleto Mineiro": { id: "arco_de_ossos", name: "Arco de Ossos", slot: "weapon", classRestriction: "Arqueiro", stats: { bonusAttack: "attack", skillPower: "skill" } },
  "Slime Toxico": { id: "coroa_de_slime", name: "Coroa de Slime", slot: "head", classRestriction: "Mago", stats: { bonusHp: "hp", bonusMp: "mp" } },
  "Sentinela Quebrada": { id: "sapatos_focados", name: "Sapatos Focados", slot: "feet", classRestriction: "Arqueiro", stats: { bonusMp: "mp" } },
  "Cultista Perdido": { id: "manto_do_culto", name: "Manto do Culto", slot: "chest", classRestriction: "Mago", stats: { bonusMp: "mp" } },
  "Fantasma Antigo": { id: "calca_do_espectro", name: "Calca do Espectro", slot: "legs", classRestriction: "Mago", stats: { bonusHp: "hp", bonusMp: "mp" } },
  "Sapo Colossal": { id: "calca_viscosa", name: "Calca Viscosa", slot: "legs", classRestriction: "Guerreiro", stats: { bonusHp: "hp" } },
  "Bruxa do Brejo": { id: "varinha_da_bruxa", name: "Varinha da Bruxa", slot: "weapon", classRestriction: "Mago", stats: { skillPower: "skill", bonusMp: "mp" } },
  "Serpente do Lodo": { id: "capuz_de_escamas", name: "Capuz de Escamas", slot: "head", classRestriction: "Arqueiro", stats: { bonusHp: "hp" } },
  "Salamandra Rubra": { id: "casaco_escarlate", name: "Casaco Escarlate", slot: "chest", classRestriction: "Arqueiro", stats: { bonusHp: "hp", bonusMp: "mp" } },
  "Golem de Brasa": { id: "capacete_em_brasa", name: "Capacete em Brasa", slot: "head", classRestriction: "Guerreiro", stats: { bonusHp: "hp" } },
  "Fenix Sombria": { id: "espada_flamejante", name: "Espada Flamejante", slot: "weapon", classRestriction: "Guerreiro", stats: { bonusAttack: "attack", skillPower: "skill" } }
};
const legacyDropByBaseId = Object.fromEntries(
  Object.entries(legacyEnemyDrops).map(([enemyName, drop]) => [drop.id, { enemyName, ...drop }])
);
const regionArticleMap = {
  Floresta: "da Floresta",
  Caverna: "da Caverna",
  Ruinas: "das Ruinas",
  Pantano: "do Pantano",
  Vulcao: "do Vulcao",
  Abismo: "do Abismo",
  Fortaleza: "da Fortaleza",
  Necropole: "da Necropole",
  Citadela: "da Citadela",
  Panteao: "do Panteao",
  Cataclismo: "do Cataclismo",
  Paradoxo: "do Paradoxo"
};
const rarityMultipliers = {
  comum: 1,
  incomum: 2.4,
  rara: 4.2,
  ultra_rara: 7.2,
  lendaria: 12
};
const regionArmorPieceNames = {
  head: "Capuz",
  chest: "Traje",
  legs: "Perneiras",
  feet: "Botas"
};
const regionWeaponPieceNames = {
  Guerreiro: "Espada",
  Arqueiro: "Arco",
  Mago: "Cajado"
};
const regionEquipmentBaseProfiles = {
  Floresta: { armor: { bonusHp: 1, bonusMp: 3 }, weapon: { bonusAttack: 1, skillPower: 1 } },
  Caverna: { armor: { bonusHp: 3, bonusMp: 1 }, weapon: { bonusAttack: 1, skillPower: 1 } },
  Ruinas: { armor: { bonusHp: 2, bonusMp: 2 }, weapon: { bonusAttack: 2, skillPower: 2 } },
  Pantano: { armor: { bonusHp: 2, bonusMp: 6 }, weapon: { bonusAttack: 2, skillPower: 2 } },
  Vulcao: { armor: { bonusHp: 6, bonusMp: 2 }, weapon: { bonusAttack: 2, skillPower: 2 } },
  Abismo: { armor: { bonusHp: 4, bonusMp: 4 }, weapon: { bonusAttack: 4, skillPower: 4 } },
  Fortaleza: { armor: { bonusHp: 4, bonusMp: 12 }, weapon: { bonusAttack: 4, skillPower: 4 } },
  Necropole: { armor: { bonusHp: 12, bonusMp: 4 }, weapon: { bonusAttack: 4, skillPower: 4 } },
  Citadela: { armor: { bonusHp: 8, bonusMp: 8 }, weapon: { bonusAttack: 8, skillPower: 8 } },
  Panteao: { armor: { bonusHp: 8, bonusMp: 24 }, weapon: { bonusAttack: 8, skillPower: 8 } },
  Cataclismo: { armor: { bonusHp: 24, bonusMp: 8 }, weapon: { bonusAttack: 8, skillPower: 8 } },
  Paradoxo: { armor: { bonusHp: 16, bonusMp: 16 }, weapon: { bonusAttack: 16, skillPower: 16 } }
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
  Floresta: { id: "colar_de_raizes", name: "Colar de Raizes", baseStats: { reflectPercent: 0.02 } },
  Caverna: { id: "geodo", name: "Geodo", baseStats: { coinBonus: 0.02 } },
  Ruinas: { id: "tabula_antiga", name: "Tabula Antiga", baseStats: { xpBonus: 0.02 } },
  Pantano: { id: "escama_da_hidra", name: "Escama da Hidra", baseStats: { turnHealPercent: 0.003 } },
  Vulcao: { id: "pedra_de_magma", name: "Pedra de Magma", baseStats: { burnDamageReductionPercent: 0.084 } },
  Abismo: { id: "anel_abismal", name: "Anel Abismal", baseStats: { flatReduction: 5 } },
  Fortaleza: { id: "alma_do_general", name: "Alma do General", baseStats: { bonusMpPercent: 0.01 } },
  Necropole: { id: "pacto_do_lorde", name: "Pacto do Lorde", baseStats: { bonusHpPercent: 0.01 } },
  Citadela: { id: "encanto_do_eclipse", name: "Encanto do Eclipse", baseStats: { totalDamagePercent: 0.01 } },
  Panteao: { id: "colar_da_fe", name: "Colar da Fe", baseStats: { fatalSaveHealPercent: 0.05 } },
  Cataclismo: { id: "tesseract", name: "Tesseract", baseStats: { critChanceBonus: 0.05 } },
  Paradoxo: { id: "o_fim", name: "O Fim", baseStats: { totalDamagePercent: 1 } }
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
const enemyDropSlotGroups = [
  ["feet", "chest"],
  ["head", "legs"],
  ["weapon"]
];
const consumableCatalog = {
  mana_potion: { name: "Pocao de Mana", price: 60, description: "Recupera 35% da mana maxima.", useLabel: "Usar", effectType: "restore_mana_percent", value: 0.35 },
  health_potion: { name: "Pocao de Vida", price: 42, description: "Recupera 35% da vida maxima.", useLabel: "Usar", effectType: "restore_hp_percent", value: 0.35 },
  skill_tonic: { name: "Tonico Arcano", price: 75, description: "Aumenta o dano de habilidade em 20% por 3 turnos.", useLabel: "Usar", effectType: "buff_skill", value: 0.2, turns: 3, isPercent: true },
  attack_tonic: { name: "Tonico de Guerra", price: 75, description: "Aumenta o dano de ataque em 20% por 3 turnos.", useLabel: "Usar", effectType: "buff_attack", value: 0.2, turns: 3, isPercent: true }
};
