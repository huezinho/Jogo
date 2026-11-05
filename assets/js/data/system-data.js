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
 invigorating_drink:{name:"Bebida Revigorante",price:45,description:"Recupera 5% da vida e da mana maximas.",useLabel:"Beber",effectType:"restore_both_percent",value:0.05},
 health_potion:{name:"Pocao de Vida",price:42,description:"Recupera 40 HP.",useLabel:"Usar",effectType:"restore_hp",value:40},
 mana_potion:{name:"Pocao de Mana",price:60,description:"Recupera 30 MP.",useLabel:"Usar",effectType:"restore_mana",value:30},
 attack_tonic:{name:"Tonico de Guerra",price:75,description:"Acrescenta 6 pontos de ataque por 3 turnos.",useLabel:"Usar",effectType:"buff_attack",value:6,turns:3,isPercent:false},
 skill_tonic:{name:"Tonico Arcano",price:75,description:"Acrescenta 8 pontos de poder de habilidade por 3 turnos.",useLabel:"Usar",effectType:"buff_skill",value:8,turns:3,isPercent:false}
};
// IDs issued before the dedicated potion qualities remain valid in older saves.
const legacyAlchemyQualities = [{id:"comum"},{id:"incomum"},{id:"rara"},{id:"ultra_rara"},{id:"lendaria"}];
const alchemyQualities = [
 {id:"instavel",name:"Instável",hp:40,mp:30,attack:3,skill:4,regen:3,manaRegen:2,armor:2,drain:3,dodges:1,turns:2},
 {id:"diluida",name:"Diluída",hp:120,mp:90,attack:8,skill:10,regen:8,manaRegen:6,armor:5,drain:8,dodges:1,turns:3},
 {id:"estavel",name:"Estável",hp:350,mp:260,attack:18,skill:25,regen:20,manaRegen:15,armor:12,drain:20,dodges:2,turns:4},
 {id:"concentrada",name:"Concentrada",hp:900,mp:700,attack:40,skill:60,regen:50,manaRegen:35,armor:30,drain:50,dodges:2,turns:5},
 {id:"refinada",name:"Refinada",hp:2200,mp:1700,attack:90,skill:130,regen:120,manaRegen:80,armor:60,drain:120,dodges:3,turns:6},
 {id:"potente",name:"Potente",hp:4500,mp:3500,attack:180,skill:260,regen:250,manaRegen:180,armor:110,drain:250,dodges:3,turns:7},
 {id:"magistral",name:"Magistral",hp:8000,mp:6500,attack:350,skill:500,regen:500,manaRegen:350,armor:200,drain:500,dodges:4,turns:8},
 {id:"transcendente",name:"Transcendente",hp:13000,mp:11000,attack:600,skill:850,regen:900,manaRegen:650,armor:350,drain:900,dodges:5,turns:10}
];
const alchemyTypes = [
 {id:"vida",name:"Poção de Vida",effect:"restore_hp",icon:"health_potion",pair:[0,1],stat:"hp",details:"Recupera {v} HP imediatamente."},
 {id:"mana",name:"Poção de Mana",effect:"restore_mana",icon:"mana_potion",pair:[1,0],stat:"mp",details:"Recupera {v} MP imediatamente."},
 {id:"vigor",name:"Elixir de Vigor",effect:"restore_both",icon:"health_potion",pair:[0,2],stat:"hp",details:"Recupera {v} HP e {m} MP imediatamente."},
 {id:"guerra",name:"Tônico de Guerra",effect:"buff_attack",icon:"attack_tonic",pair:[2,0],stat:"attack",details:"Acrescenta {v} pontos de ataque por {t} turnos."},
 {id:"arcano",name:"Tônico Arcano",effect:"buff_skill",icon:"skill_tonic",pair:[1,2],stat:"skill",details:"Acrescenta {v} pontos de poder de habilidade por {t} turnos."},
 {id:"agilidade",name:"Poção de Agilidade",effect:"buff_dodge",icon:"attack_tonic",pair:[2,1],stat:"dodges",turnField:"potionDodgeTurns",valueField:"potionDodgeCharges",details:"Esquiva automaticamente de {v} ataque(s), durante até {t} turnos."},
 {id:"protecao",name:"Poção de Proteção",effect:"buff_defense",icon:"skill_tonic",pair:[0,0],stat:"armor",turnField:"potionArmorTurns",valueField:"potionArmor",details:"Bloqueia {v} pontos de dano por golpe durante {t} turnos."},
 {id:"regeneracao",name:"Poção de Regeneração",effect:"buff_regeneration",icon:"health_potion",pair:[1,1],stat:"regen",turnField:"potionRegenTurns",valueField:"potionRegenAmount",details:"Recupera {v} HP por ação durante {t} turnos."},
 {id:"clareza",name:"Poção de Clareza",effect:"buff_mana_regeneration",icon:"mana_potion",pair:[2,2],stat:"manaRegen",turnField:"potionManaTurns",valueField:"potionManaAmount",details:"Recupera {v} MP adicionais por ação durante {t} turnos."},
 {id:"vampirismo",name:"Poção de Vampirismo",effect:"buff_lifesteal",icon:"attack_tonic",pair:[2,2],stat:"drain",turnField:"potionDrainTurns",valueField:"potionDrainAmount",details:"Rouba até {v} HP ao causar dano à vida do alvo, uma vez por ação, durante {t} turnos."}
];
// Region, material tier, quantity. These plans never depend on the selected map.
const alchemyRecipePlans = [
 [["Floresta",0,1],["Floresta",1,1]],
 [["Floresta",1,2],["Caverna",0,1]],
 [["Caverna",1,2],["Ruinas",0,2]],
 [["Ruinas",1,3],["Pantano",0,2]],
 [["Pantano",1,3],["Vulcao",0,3],["Abismo",1,1]],
 [["Fortaleza",1,4],["Necropole",0,3]],
 [["Citadela",1,4],["Panteao",0,4]],
 [["Cataclismo",1,5],["Paradoxo",0,5],["Paradoxo",1,2,3]]
];
function makeFixedAlchemyConsumable(type,quality){
 const temporary=type.effect.startsWith("buff_");
 const value=type.id==="vigor"?Math.floor(quality.hp/2):quality[type.stat];
 const manaValue=type.id==="vigor"?Math.floor(quality.mp/2):undefined;
 return {
  name:type.name+" - "+quality.name,quality:quality.id,typeId:type.id,baseItemId:type.icon,
  effectType:type.effect,value,manaValue,isPercent:false,turns:temporary?quality.turns:undefined,
  turnField:type.turnField,valueField:type.valueField,useLabel:"Usar",
  description:type.details.replace("{v}",value).replace("{m}",manaValue).replace("{t}",quality.turns)
 };
}
for(const quality of alchemyQualities){
 for(const type of alchemyTypes)consumableCatalog["alquimia_"+type.id+"_"+quality.id]=makeFixedAlchemyConsumable(type,quality);
}
// Existing bottles also receive fixed effects when an older save is loaded.
legacyAlchemyQualities.forEach((quality,index)=>{
 for(const type of alchemyTypes.slice(0,5)){
  consumableCatalog["alquimia_"+type.id+"_"+quality.id]=makeFixedAlchemyConsumable(type,alchemyQualities[[1,2,3,5,7][index]]);
 }
});
