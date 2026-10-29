// Equipment schema v2: character skill coefficients deliberately remain outside this catalogue.
const EquipmentData = Object.freeze({
  version: 2,
  boardIntervalMs: 30 * 60 * 1000,
  maxActiveContracts: 3,
  slots: ["head", "chest", "weapon", "legs", "feet"],
  rarityFactors: { comum: 1, incomum: 1.1, rara: 1.2, ultra_rara: 1.3, lendaria: 1.4 },
  slotWeights: { weapon: 1.4, chest: 1.2, head: 0.8, legs: 0.9, feet: 0.7 },
  regionStats: {
    Floresta:{bonusHp:.30,bonusMp:.40,skillPower:.30}, Caverna:{bonusHp:.45,equipmentRating:.35,bonusAttack:.20},
    Ruinas:{skillPower:.50,bonusMp:.30,bonusHp:.20}, Pantano:{bonusMp:.35,skillPower:.35,bonusHp:.30},
    Vulcao:{skillPower:.55,bonusAttack:.30,bonusHp:.15}, Abismo:{bonusAttack:.40,skillPower:.40,bonusMp:.20},
    Fortaleza:{bonusHp:.45,equipmentRating:.40,shieldPowerPercent:.15}, Necropole:{bonusMp:.30,skillPower:.40,bonusHp:.30},
    Citadela:{bonusAttack:.55,skillPower:.25,bonusMp:.20}, Panteao:{bonusMp:.35,bonusHp:.30,healPowerPercent:.20,shieldPowerPercent:.15},
    Cataclismo:{bonusAttack:.55,bonusHp:.30,equipmentRating:.15}, Paradoxo:{bonusAttack:.30,skillPower:.35,bonusMp:.35}
  },
  statValues: { bonusHp: 15, bonusMp: 12, bonusAttack: 2, skillPower: 2, equipmentRating: 12, healPowerPercent: 1 / 300, shieldPowerPercent: 1 / 300 },
  accessoryEffects: {
    Floresta: { reflectPercent: .02 }, Caverna: { coinBonus: .02 }, Ruinas: { xpBonus: .02 },
    Pantano: { turnHealPercent: .003 }, Vulcao: { burnDamageReductionPercent: .084 }, Abismo: { flatReduction: 5 },
    Fortaleza: { bonusMpPercent: .01 }, Necropole: { bonusHpPercent: .01 }, Citadela: { totalDamagePercent: .01 },
    Panteao: { fatalSaveHealPercent: .05 }, Cataclismo: { critChanceBonus: .05 }, Paradoxo: { totalDamagePercent: .10 }
  },
  accessoryEffectCaps: { reflectPercent: .10, coinBonus: .10, xpBonus: .10, turnHealPercent: .01, burnDamageReductionPercent: .25, flatReduction: 15, bonusMpPercent: .06, bonusHpPercent: .06, totalDamagePercent: .15, fatalSaveHealPercent: .10, critChanceBonus: .10 },
  slotNames: { head: "Capuz", chest: "Armadura", legs: "Perneiras", feet: "Botas" },
  weaponNames: { Guerreiro: "Espada", Arqueiro: "Arco", Mago: "Cajado", "Adepto da Natureza": "Ramo Vivo" },
  secondaryMaterials: {
    Floresta: ["Presa Sombria", "Moeda Goblin Lascada", "Fio de Seda Gigante", "Seiva Ancestral"],
    Caverna: ["Fragmento de Rocha Alada", "Poeira de Ferro", "Muco Toxico", "Sangue Petrificado"],
    Ruinas: ["Nucleo da Sentinela", "Tinta Ritual", "Ectoplasma Antigo", "Coroa Espectral Quebrada"],
    Pantano: ["Glandula Pantanosa", "Erva do Brejo", "Veneno do Lodo", "Coracao da Hidra"],
    Vulcao: ["Brasa Rubra", "Nucleo de Magma", "Cinza da Fenix", "Escama Magmatica"],
    Abismo: ["Aco Abissal", "Sangue do Eclipse", "Poeira do Vazio", "Lagrima do Arauto"],
    Fortaleza: ["Placa de Escudeiro", "Runas da Muralha", "Correia de Guerra", "Insignia do General"],
    Necropole: ["Osso Funebre", "Po da Feiticeira", "Medula do Ceifador", "Selo da Cripta"],
    Citadela: ["Fragmento de Halo", "Pena Celeste", "Poeira Astral", "Sangue do Imperador"],
    Panteao: ["Ouro Vivo", "Cristal Radiante", "Essencia Solar", "Luz do Zenith"],
    Cataclismo: ["Cinza do Cataclismo", "Fragmento da Ruina", "Residuo do Fim", "Centelha Divina"],
    Paradoxo: ["Areia Temporal", "Espiral do Zero", "Eco de Outra Era", "Fio do Paradoxo"]
  },
  sets: {
    Floresta: { id: "raizes_vivas", name: "Raizes Vivas", two: "+6% de mana maxima", four: "+8% de dano periodico", five: "Aplicar DOT em 3 acoes prepara +20% na proxima cura ou escudo.", bonuses2: { bonusMpPercent: .06 }, bonuses4: { dotDamagePercent: .08 } },
    Caverna: { id: "pedra_guardia", name: "Pedra Guardia", two: "+6% de vida maxima", four: "+8% no rating de resistencia dos equipamentos", five: "Apos 3 golpes diretos, recebe escudo limitado a 8% da vida ou 1x poder combinado. Recarga: 3 turnos.", bonuses2: { bonusHpPercent: .06 }, bonuses4: { equipmentRatingPercent: .08 } },
    Ruinas: { id: "eco_antigo", name: "Eco Antigo", two: "+6% de poder de habilidade", four: "Duas habilidades diferentes preparam +8% no proximo dano direto", five: "O golpe preparado ecoa 25% do dano, limitado a 0,6x poder combinado. Recarga: 3 turnos.", bonuses2: { skillPowerPercent: .06 }, bonuses4: {} },
    Pantano: { id: "seiva_toxica", name: "Seiva Toxica", two: "+6% de mana maxima", four: "+10% de dano periodico", five: "Acertar alvo com DOT aplica veneno de 12% do poder combinado por 2 turnos. Recarga: 3 turnos.", bonuses2: { bonusMpPercent: .06 }, bonuses4: { dotDamagePercent: .10 } },
    Vulcao: { id: "brasas_vivas", name: "Brasas Vivas", two: "+6% de poder de habilidade", four: "+8% de dano direto contra alvos com DOT", five: "A terceira habilidade ofensiva aplica queimadura de 15% do poder combinado por 2 turnos. Recarga: 3 turnos.", bonuses2: { skillPowerPercent: .06 }, bonuses4: {} },
    Abismo: { id: "corte_do_vazio", name: "Corte do Vazio", two: "+3% de ataque e poder de habilidade", four: "Ignora 15% da armadura", five: "Quebrar escudo ou reduzir armadura prepara +15% no proximo dano, limitado ao poder combinado. Recarga: 3 turnos.", bonuses2: { bonusAttackPercent: .03, skillPowerPercent: .03 }, bonuses4: { armorPenetrationPercent: .15 } },
    Fortaleza: { id: "bastiao", name: "Bastiao", two: "+6% de vida maxima", four: "+10% de potencia de escudo", five: "25% do dano absorvido prepara retaliacao no proximo ataque escolhido, limitada a 0,6x poder combinado. Recarga: 3 turnos.", bonuses2: { bonusHpPercent: .06 }, bonuses4: { shieldPowerPercent: .10 } },
    Necropole: { id: "ceifa_lenta", name: "Ceifa Lenta", two: "+8% de dano periodico", four: "Cura 2% do dano periodico causado, ate 2% da vida maxima por turno", five: "Com 3 DOTs proprios, prolonga cada um em 1 turno, no maximo 2 vezes por aplicacao. Recarga: 3 turnos.", bonuses2: { dotDamagePercent: .08 }, bonuses4: {} },
    Citadela: { id: "eclipse_preciso", name: "Eclipse Preciso", two: "+4 pontos percentuais de critico", four: "+10% ao bonus de dano critico", five: "Um critico prepara 20% de penetracao de armadura na proxima habilidade. Recarga: 2 turnos.", bonuses2: { critChanceBonus: .04 }, bonuses4: { critDamageBonus: .10 } },
    Panteao: { id: "farol_do_grupo", name: "Farol do Grupo", two: "+6% de mana maxima", four: "+10% de cura e escudo", five: "Tres acoes de suporte efetivo preparam dano extra de 20% do poder combinado na proxima ofensiva. Recarga: 2 turnos.", bonuses2: { bonusMpPercent: .06 }, bonuses4: { healPowerPercent: .10, shieldPowerPercent: .10 } },
    Cataclismo: { id: "furia_contida", name: "Furia Contida", two: "+6% de ataque", four: "+10% de dano direto abaixo de 50% da vida", five: "Pagar vida por uma habilidade gera escudo de 50% do custo, ate 12% da vida ou 1,2x poder combinado. Recarga: 3 turnos.", bonuses2: { bonusAttackPercent: .06 }, bonuses4: {} },
    Paradoxo: { id: "ruptura_do_ciclo", name: "Ruptura do Ciclo", two: "+3% de ataque e poder de habilidade", four: "Alternar habilidades prepara +8% no proximo dano direto", five: "Apos 3 habilidades diferentes, a proxima custa 15% menos mana e causa +12% de dano direto, limitado ao poder combinado. Recarga: 4 turnos.", bonuses2: { bonusAttackPercent: .03, skillPowerPercent: .03 }, bonuses4: {} }
  }
});
