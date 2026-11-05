function buildWarriorTrees(plannedState=null){
  const subclassState = plannedState || getPlayerSubclassState();
  const level = plannedState ? 100 : player.level;
  const tier30 = subclassState.tier30;
  const tier60 = subclassState.tier60;
  const activeSkills = [
    { level: 1, id: "recuperar_folego", name: "Recuperar Folego", type: "warrior_second_wind" },
    { level: 20, id: tier30 === "espadachim" ? "investida" : "esbarrao", name: tier30 === "espadachim" ? "Investida" : "Esbarrao", type: "warrior_shove" }
  ];
  if(tier30 === "cavaleiro" && level >= 30){
    activeSkills.push({ level: 30, id: "contundir", name: "Contundir", type: "warrior_stagger" });
    if(level >= 50){
      activeSkills.push({ level: 50, id: tier60 === "berserker" && level >= 60 ? "ira" : "brado", name: tier60 === "berserker" && level >= 60 ? "Ira" : "Brado", type: "warrior_warcry" });
    }
    if(tier60 === "paladino" && level >= 60){
      activeSkills.push({ level: 60, id: "julgamento", name: "Julgamento", type: "warrior_judgment" });
    }
    if(tier60 === "berserker" && level >= 60){
      activeSkills.push({ level: 60, id: "valhala", name: "Vallhala", type: "warrior_valhalla" });
    }
    if(tier60 === "paladino" && level >= 80){
      activeSkills.push({ level: 80, id: "escudo_de_fe", name: "Escudo de Fe", type: "warrior_faith_shield" });
    }
    if(tier60 === "berserker" && level >= 80){
      activeSkills.push({ level: 80, id: "voce_ira_me_parar", name: "Voce Ira Me Parar?", type: "warrior_unstoppable" });
    }
  }
  if(tier30 === "espadachim" && level >= 30){
    activeSkills.push({ level: 30, id: "golpes_velozes", name: "Golpes Velozes", type: "warrior_swift_strikes" });
    if(level >= 50){
      activeSkills.push({ level: 50, id: "corte_profundo", name: "Corte Profundo", type: "warrior_deep_cut" });
    }
    if(tier60 === "samurai" && level >= 60){
      activeSkills.push({ level: 60, id: "furar_blindagem", name: "Furar Blindagem", type: "warrior_armor_piercer" });
    }
    if(tier60 === "ninja" && level >= 60){
      activeSkills.push({ level: 60, id: "bomba_de_fumaca", name: "Bomba de Fumaca", type: "warrior_smoke_bomb" });
    }
    if(tier60 === "samurai" && level >= 80){
      activeSkills.push({ level: 80, id: "cortes_ultrasonicos", name: "Cortes Ultrasonicos", type: "warrior_ultrasonic_cuts" });
    }
    if(tier60 === "ninja" && level >= 80){
      activeSkills.push({ level: 80, id: "mata_gigantes", name: "Mata-Gigantes", type: "warrior_giant_slayer" });
    }
  }
  const passiveSkills = [
    { level: 10, id: tier30 === "espadachim" ? "veloz" : "vontade_de_ferro", name: tier30 === "espadachim" ? "Veloz" : "Vontade de Ferro", type: tier30 === "espadachim" ? "warrior_enemy_miss" : "warrior_flat_reduction" }
  ];
  if(tier30 === "cavaleiro" && level >= 40){
    passiveSkills.push({ level: 40, id: "refletir", name: "Refletir", type: "warrior_reflect" });
  }
  if(tier30 === "espadachim" && level >= 40){
    passiveSkills.push({ level: 40, id: "contra_ataque", name: "Contra-Ataque", type: "warrior_counter_on_dodge" });
  }
  if(tier60 === "paladino" && level >= 70){
    passiveSkills.push({ level: 70, id: "aura_divina", name: "Aura Divina", type: "warrior_aura_shield" });
  }
  if(tier60 === "berserker" && level >= 70){
    passiveSkills.push({ level: 70, id: "voce_nao_e_digno", name: "Voce Nao e Digno", type: "warrior_last_stand" });
  }
  if(tier60 === "samurai" && level >= 70){
    passiveSkills.push({ level: 70, id: "mente_limpa", name: "Mente Limpa", type: "warrior_first_strike_echo" });
  }
  if(tier60 === "ninja" && level >= 70){
    passiveSkills.push({ level: 70, id: "eliminar", name: "Eliminar", type: "warrior_execute_bonus" });
  }
  return { activeSkills, passiveSkills };
}

function buildMageTrees(plannedState=null){
  const subclassState = plannedState || getPlayerSubclassState();
  const level = plannedState ? 100 : player.level;
  const tier30 = subclassState.tier30;
  const tier60 = subclassState.tier60;
  const activeSkills = [
    { level: 20, id: "explosao_de_mana", name: "Explosao de Mana", type: "mage_mana_burst" }
  ];
  if(tier30 === "elementalista"){
    if(level >= 30){
      const isFrigido = tier60 === "mago_frigido" && level >= 60;
      activeSkills.push({ level: 30, id: isFrigido ? "bola_de_neve" : "bola_de_fogo", name: isFrigido ? "Bola de Neve" : "Bola de Fogo", type: "mage_fireball" });
    }
    if(level >= 50){
      const isIncendiario = tier60 === "mago_incendiario" && level >= 60;
      activeSkills.push({ level: 50, id: isIncendiario ? "bafo_de_fogo" : "congelar", name: isIncendiario ? "Bafo de Fogo" : "Congelar", type: "mage_freeze" });
    }
    if(tier60 === "mago_incendiario" && level >= 60){
      activeSkills.push({ level: 60, id: "fenix_sagrada", name: "Fenix Sagrada", type: "mage_sacred_phoenix" });
    }
    if(tier60 === "mago_frigido" && level >= 60){
      activeSkills.push({ level: 60, id: "nevasca", name: "Nevasca", type: "mage_blizzard" });
    }
    if(tier60 === "mago_incendiario" && level >= 80){
      activeSkills.push({ level: 80, id: "explodir", name: "Explodir", type: "mage_explode" });
    }
    if(tier60 === "mago_frigido" && level >= 80){
      activeSkills.push({ level: 80, id: "avalanche", name: "Avalanche", type: "mage_avalanche" });
    }
  }
  if(tier30 === "arcanista"){
    if(level >= 30){
      activeSkills.push({ level: 30, id: "descarregar", name: "Descarregar", type: "mage_discharge" });
    }
    if(level >= 50){
      activeSkills.push({ level: 50, id: "escudo_de_mana", name: "Escudo de Mana", type: "mage_mana_shield" });
    }
    if(tier60 === "arquimago" && level >= 60){
      activeSkills.push({ level: 60, id: "concentracao", name: "Concentracao", type: "mage_concentration" });
    }
    if(tier60 === "corrompido" && level >= 60){
      activeSkills.push({ level: 60, id: "corrupcao", name: "Corrupcao", type: "mage_corruption" });
    }
    if(tier60 === "arquimago" && level >= 80){
      activeSkills.push({ level: 80, id: "sobrecarregar", name: "Sobrecarregar", type: "mage_overcharge" });
    }
    if(tier60 === "corrompido" && level >= 80){
      activeSkills.push({ level: 80, id: "incorporar_demonio", name: "Incorporar Demonio", type: "mage_demon_form" });
    }
  }
  return {
    activeSkills,
    passiveSkills: [
      { level: 10, id: "ultimo_recurso", name: "Ultimo Recurso", type: "mage_last_resort" },
      ...(tier30 === "elementalista" && level >= 40 ? [{ level: 40, id: "mana_e_vida", name: "Mana e Vida", type: "mage_mana_to_life" }] : []),
      ...(tier30 === "arcanista" && level >= 40 ? [{ level: 40, id: "transbordando", name: "Transbordando", type: "mage_overflowing" }] : []),
      ...(tier60 === "mago_incendiario" && level >= 70 ? [{ level: 70, id: "fogo_do_inferno", name: "Fogo do Inferno", type: "mage_hellfire" }] : []),
      ...(tier60 === "mago_frigido" && level >= 70 ? [{ level: 70, id: "gelo_queima", name: "Gelo Queima", type: "mage_frostburn" }] : []),
      ...(tier60 === "arquimago" && level >= 70 ? [{ level: 70, id: "carregar", name: "Carregar", type: "mage_charge_damage" }] : []),
      ...(tier60 === "corrompido" && level >= 70 ? [{ level: 70, id: "canhao_de_vidro", name: "Canhao de Vidro", type: "mage_glass_cannon" }] : [])
    ]
  };
}

function buildArcherTrees(plannedState=null){
  const subclassState = plannedState || getPlayerSubclassState();
  const level = plannedState ? 100 : player.level;
  const tier30 = subclassState.tier30;
  const tier60 = subclassState.tier60;
  const activeSkills = [
    { level: 1, id: "mirar", name: "Mirar", type: "archer_focus" },
    { level: 20, id: "camuflagem", name: "Camuflagem", type: "archer_camouflage" }
  ];
  if(tier30 === "atirador"){
    activeSkills.push({ level: 30, id: "headshot", name: "Headshot", type: "archer_headshot" });
    if(level >= 50){
      activeSkills.push({ level: 50, id: "tiro_perfurante", name: "Tiro Perfurante", type: "archer_piercing_shot" });
    }
    if(tier60 === "atirador_arcano" && level >= 60){
      activeSkills.push({ level: 60, id: "emergencia_arcana", name: "Emergencia Arcana", type: "archer_arcane_shot" });
    }
    if(tier60 === "sniper" && level >= 60){
      activeSkills.push({ level: 60, id: "executar", name: "Executar", type: "archer_execute" });
    }
    if(tier60 === "atirador_arcano" && level >= 80){
      activeSkills.push({ level: 80, id: "sobreaquecer", name: "Sobreaquecer", type: "archer_overcharge" });
    }
    if(tier60 === "sniper" && level >= 80){
      activeSkills.push({ level: 80, id: "ponto_fraco", name: "Ponto Fraco", type: "archer_weak_spot" });
    }
  }
  if(tier30 === "cacador"){
    activeSkills.push({ level: 30, id: "rajada_de_flechas", name: "Rajada de Flechas", type: "archer_barrage" });
    if(level >= 50){
      activeSkills.push({ level: 50, id: "armadilha", name: "Armadilha", type: "archer_trap" });
    }
    if(tier60 === "espreitador" && level >= 60){
      activeSkills.push({ level: 60, id: "surpresa", name: "Surpresa", type: "archer_surprise" });
    }
    if(tier60 === "guarda_florestal" && level >= 60){
      activeSkills.push({ level: 60, id: "tranquilizante", name: "Tranquilizante", type: "archer_tranquilizer" });
    }
    if(tier60 === "espreitador" && level >= 80){
      activeSkills.push({ level: 80, id: "mirar_no_pe", name: "Mirar no Pe", type: "archer_aim_leg" });
    }
    if(tier60 === "guarda_florestal" && level >= 80){
      activeSkills.push({ level: 80, id: "tiro_cortante", name: "Tiro Cortante", type: "archer_cutting_shot" });
    }
  }
  const passiveSkills = [
    {
      level: 10,
      id: "passos_leves",
      name: "Passos Leves",
      type: tier30 === "atirador"
        ? "archer_dodge_double_bonus"
        : tier30 === "cacador"
          ? "archer_dodge_coin_bonus"
          : "archer_dodge_level_scaling"
    }
  ];
  if(tier30 === "atirador"){
    passiveSkills.push({ level: 40, id: "pulso_firme", name: "Pulso Firme", type: "archer_attack_level_bonus" });
    if(tier60 === "atirador_arcano" && level >= 70){
      passiveSkills.push({ level: 70, id: "cristalizar_mana", name: "Cristalizar Mana", type: "archer_mana_to_skill_bonus" });
    }
    if(tier60 === "sniper" && level >= 70){
      passiveSkills.push({ level: 70, id: "olhos_de_falcao", name: "Olhos de Falcao", type: "archer_sniper_bonus_crit" });
    }
  }
  if(tier30 === "cacador"){
    passiveSkills.push({ level: 40, id: "errou", name: "Errou", type: "archer_dodge_damage_buff" });
    if(tier60 === "espreitador" && level >= 70){
      passiveSkills.push({ level: 70, id: "passos_silenciosos", name: "Passos Silenciosos", type: "archer_enemy_skip_chance" });
    }
    if(tier60 === "guarda_florestal" && level >= 70){
      passiveSkills.push({ level: 70, id: "resistencia_florestal", name: "Resistencia Florestal", type: "archer_flat_reduction_level" });
    }
  }
  return { activeSkills, passiveSkills };
}

function buildNatureTrees(plannedState=null){
  const subclassState = plannedState || getPlayerSubclassState();
  const level = plannedState ? 100 : player.level;
  const tier30 = subclassState.tier30;
  const tier60 = subclassState.tier60;
  const activeSkills = [
    { level: 1, id: "semente_viva", name: "Semente Viva", type: "nature_living_seed" },
    { level: 20, id: "raizes", name: "Raizes", type: "nature_roots" }
  ];
  if(tier30 === "druida" && level >= 30){
    activeSkills.push({ level: 30, id: "flor_do_pantano", name: "Flor do Pantano", type: "nature_swamp_flower" });
    if(level >= 50){
      activeSkills.push({ level: 50, id: "colheita", name: "Colheita", type: "nature_harvest" });
    }
    if(tier60 === "druida_sombrio" && level >= 60){
      activeSkills.push({ level: 60, id: "apodrecer", name: "Apodrecer", type: "nature_decay" });
    }
    if(tier60 === "avatar_da_natureza" && level >= 60){
      activeSkills.push({ level: 60, id: "forma_verdadeira", name: "Forma Verdadeira", type: "nature_true_form" });
    }
    if(tier60 === "druida_sombrio" && level >= 80){
      activeSkills.push({ level: 80, id: "colapso_do_brejo", name: "Colapso do Brejo", type: "nature_swamp_collapse" });
    }
    if(tier60 === "avatar_da_natureza" && level >= 80){
      activeSkills.push({ level: 80, id: "esmagar_invasor", name: "Esmagar Invasor", type: "nature_crush_invader" });
    }
  }
  if(tier30 === "espirito_da_floresta" && level >= 30){
    activeSkills.push({ level: 30, id: "encanto_da_brisa", name: "Encanto da Brisa", type: "nature_breeze_charm" });
    if(level >= 50){
      activeSkills.push({ level: 50, id: "cancao_ancestral", name: "Cancao Ancestral", type: "nature_ancestral_song" });
    }
    if(tier60 === "fada_monarca" && level >= 60){
      activeSkills.push({ level: 60, id: "decreto_da_rainha", name: "Decreto da Rainha", type: "nature_queen_decree" });
    }
    if(tier60 === "protetor_da_floresta" && level >= 60){
      activeSkills.push({ level: 60, id: "casulo_de_vinhas", name: "Casulo de Vinhas", type: "nature_vine_cocoon" });
    }
    if(tier60 === "fada_monarca" && level >= 80){
      activeSkills.push({ level: 80, id: "coroar", name: "Coroar", type: "nature_crown" });
    }
    if(tier60 === "protetor_da_floresta" && level >= 80){
      activeSkills.push({ level: 80, id: "jogar_espinhos", name: "Jogar Espinhos", type: "nature_throw_thorns" });
    }
  }
  const passiveSkills = [
    { level: 10, id: "ciclo_natural", name: "Ciclo Natural", type: "nature_cycle" }
  ];
  if(tier30 === "druida" && level >= 40){
    passiveSkills.push({ level: 40, id: "seiva", name: "Seiva", type: "nature_sap" });
  }
  if(tier30 === "espirito_da_floresta" && level >= 40){
    passiveSkills.push({ level: 40, id: "aura_feerica", name: "Aura Feerica", type: "nature_fairy_aura" });
  }
  if(tier60 === "druida_sombrio" && level >= 70){
    passiveSkills.push({ level: 70, id: "podridao", name: "Podridao", type: "nature_dot_mastery" });
  }
  if(tier60 === "avatar_da_natureza" && level >= 70){
    passiveSkills.push({ level: 70, id: "casca_ancestral", name: "Casca Ancestral", type: "nature_ancestral_bark" });
  }
  if(tier60 === "fada_monarca" && level >= 70){
    passiveSkills.push({ level: 70, id: "asas_da_realeza", name: "Asas da Realeza", type: "nature_royal_wings" });
  }
  if(tier60 === "protetor_da_floresta" && level >= 70){
    passiveSkills.push({ level: 70, id: "juramento_do_bosque", name: "Juramento do Bosque", type: "nature_forest_oath" });
  }
  return { activeSkills, passiveSkills };
}

function getClassTrees(){
  if(!player){ return { activeSkills: [], passiveSkills: [] }; }
  let trees;
  if(player.class === "Guerreiro"){
    trees = buildWarriorTrees();
  }else if(player.class === "Mago"){
    trees = buildMageTrees();
  }else if(player.class === "Arqueiro"){
    trees = buildArcherTrees();
  }else if(player.class === "Adepto da Natureza"){
    trees = buildNatureTrees();
  }else{
    trees = { activeSkills: [], passiveSkills: [] };
  }
  trees.activeSkills.sort((a, b) => a.level - b.level);
  trees.passiveSkills.sort((a, b) => a.level - b.level);
  return trees;
}

function getPlannedClassTrees(className,tier30=null,tier60=null){
  const build={Guerreiro:buildWarriorTrees,Mago:buildMageTrees,Arqueiro:buildArcherTrees,"Adepto da Natureza":buildNatureTrees}[className];
  return build?build({tier30,tier60}):{activeSkills:[],passiveSkills:[]};
}
