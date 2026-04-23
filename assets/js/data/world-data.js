const classes = {
  Guerreiro: {
    hp: 120,
    mp: 60,
    attack: 18
  },
  Arqueiro: {
    hp: 100,
    mp: 80,
    attack: 16
  },
  Mago: {
    hp: 80,
    mp: 100,
    attack: 14
  },
  "Adepto da Natureza": {
    hp: 100,
    mp: 100,
    attack: 12
  }
};

const regions = {
  Floresta: {
    minLevel: 1,
    description: "Criaturas selvagens e emboscadas leves.",
    boss: { name: "Ent Ancestral", level: 10, hp: 170, attack: 15, mp: 60, skillName: "Raizes Esmagadoras", skillDamage: 36, skillCost: 18 },
    enemies: [
      { name: "Lobo Sombrio", level: 1, weight: 78, hp: 70, attack: 8 },
      { name: "Goblin", level: 3, weight: 16, hp: 82, attack: 9 },
      { name: "Aranha Gigante", level: 8, weight: 6, hp: 96, attack: 11 }
    ]
  },
  Caverna: {
    minLevel: 10,
    description: "Passagens estreitas cheias de monstros resistentes.",
    boss: { name: "Troll das Profundezas", level: 20, hp: 250, attack: 22, mp: 70, skillName: "Eco de Pedra", skillDamage: 54, skillCost: 22 },
    enemies: [
      { name: "Morcego de Pedra", level: 11, weight: 78, hp: 90, attack: 10 },
      { name: "Esqueleto Mineiro", level: 13, weight: 16, hp: 102, attack: 11 },
      { name: "Slime Toxico", level: 18, weight: 6, hp: 120, attack: 12 }
    ]
  },
  Ruinas: {
    minLevel: 18,
    description: "Restos antigos guardados por inimigos mais agressivos.",
    boss: { name: "Rei Espectral", level: 30, hp: 340, attack: 30, mp: 90, skillName: "Lamento Real", skillDamage: 78, skillCost: 28 },
    enemies: [
      { name: "Sentinela Quebrada", level: 21, weight: 78, hp: 128, attack: 13 },
      { name: "Cultista Perdido", level: 23, weight: 16, hp: 140, attack: 15 },
      { name: "Fantasma Antigo", level: 28, weight: 6, hp: 165, attack: 16 }
    ]
  },
  Pantano: {
    minLevel: 26,
    description: "Neblina espessa, criaturas venenosas e terreno traiçoeiro.",
    boss: { name: "Hidra do Lodo", level: 40, hp: 470, attack: 36, mp: 120, skillName: "Sopro Corrosivo", skillDamage: 96, skillCost: 32 },
    enemies: [
      { name: "Sapo Colossal", level: 31, weight: 78, hp: 176, attack: 19 },
      { name: "Bruxa do Brejo", level: 33, weight: 16, hp: 190, attack: 21 },
      { name: "Serpente do Lodo", level: 38, weight: 6, hp: 228, attack: 25 }
    ]
  },
  Vulcao: {
    minLevel: 33,
    description: "Um reino de cinzas, magma e monstros forjados no fogo.",
    boss: { name: "Draco Magmatico", level: 50, hp: 610, attack: 48, mp: 150, skillName: "Explosao Vulcanica", skillDamage: 124, skillCost: 38 },
    enemies: [
      { name: "Salamandra Rubra", level: 41, weight: 78, hp: 236, attack: 27 },
      { name: "Golem de Brasa", level: 43, weight: 16, hp: 255, attack: 30 },
      { name: "Fenix Sombria", level: 48, weight: 6, hp: 300, attack: 34 }
    ]
  },
  Abismo: {
    minLevel: 42,
    description: "Um dominio de ecos sombrios, aco amaldiçoado e criaturas do vazio.",
    boss: { name: "Arauto do Vazio", level: 60, hp: 760, attack: 58, mp: 180, skillName: "Dilacerar Realidade", skillDamage: 156, skillCost: 44 },
    enemies: [
      { name: "Cavaleiro Abissal", level: 51, weight: 78, hp: 312, attack: 35 },
      { name: "Lamia do Eclipse", level: 53, weight: 16, hp: 330, attack: 38 },
      { name: "Colosso do Vazio", level: 58, weight: 6, hp: 388, attack: 42 }
    ]
  },
  Fortaleza: {
    minLevel: 51,
    description: "Uma muralha esquecida repleta de elite armadurada e horrores de guerra.",
    boss: { name: "General de Aco", level: 70, hp: 920, attack: 68, mp: 210, skillName: "Marcha de Ferro", skillDamage: 188, skillCost: 48 },
    enemies: [
      { name: "Escudeiro de Ferro", level: 61, weight: 78, hp: 390, attack: 45 },
      { name: "Maga da Muralha", level: 63, weight: 16, hp: 410, attack: 48 },
      { name: "Carrasco de Guerra", level: 68, weight: 6, hp: 470, attack: 54 }
    ]
  },
  Necropole: {
    minLevel: 60,
    description: "Criptas antigas, magia necrotica e guerreiros que se recusam a descansar.",
    boss: { name: "Lorde da Cripta", level: 80, hp: 1100, attack: 79, mp: 240, skillName: "Sentenca Funebre", skillDamage: 220, skillCost: 52 },
    enemies: [
      { name: "Guardiao Funebre", level: 71, weight: 78, hp: 490, attack: 56 },
      { name: "Feiticeira Morta", level: 73, weight: 16, hp: 520, attack: 59 },
      { name: "Ceifador de Ossos", level: 78, weight: 6, hp: 590, attack: 65 }
    ]
  },
  Citadela: {
    minLevel: 69,
    description: "Torres elevadas acima das nuvens, feras celestes e juizes do eclipse.",
    boss: { name: "Imperador do Eclipse", level: 90, hp: 1320, attack: 92, mp: 280, skillName: "Ruptura Estelar", skillDamage: 260, skillCost: 60 },
    enemies: [
      { name: "Anjo Caido", level: 81, weight: 78, hp: 620, attack: 69 },
      { name: "Drake Celeste", level: 83, weight: 16, hp: 655, attack: 72 },
      { name: "Executor Astral", level: 88, weight: 6, hp: 735, attack: 79 }
    ]
  },
  Panteao: {
    minLevel: 78,
    description: "Templos celestes onde criaturas solares guardam reliquias do auge do mundo.",
    boss: { name: "Avatar do Zenith", level: 100, hp: 1540, attack: 108, mp: 320, skillName: "Julgamento Solar", skillDamage: 305, skillCost: 66 },
    enemies: [
      { name: "Guardiao Aureo", level: 91, weight: 78, hp: 760, attack: 84 },
      { name: "Oraculo Radiante", level: 93, weight: 16, hp: 805, attack: 88 },
      { name: "Quimera Solar", level: 98, weight: 6, hp: 900, attack: 95 }
    ]
  },
  Cataclismo: {
    minLevel: 87,
    description: "A fronteira do fim do mundo, com monstros que esmagam ate os herois mais resistentes.",
    boss: { name: "Deus da Ruina", level: 110, hp: 1820, attack: 130, mp: 360, skillName: "Colapso Final", skillDamage: 360, skillCost: 74 },
    enemies: [
      { name: "Arauto do Cataclismo", level: 101, weight: 78, hp: 930, attack: 102 },
      { name: "Titan Rachado", level: 103, weight: 16, hp: 980, attack: 107 },
      { name: "Serafim do Fim", level: 108, weight: 6, hp: 1090, attack: 116 }
    ]
  },
  Paradoxo: {
    minLevel: 96,
    description: "Uma dobra final da realidade onde tempo, mana e carne se rompem ao mesmo tempo.",
    boss: { name: "Soberano do Paradoxo", level: 120, hp: 2120, attack: 148, mp: 410, skillName: "Ruptura Temporal", skillDamage: 398, skillCost: 82 },
    enemies: [
      { name: "Guardiao Temporal", level: 111, weight: 78, hp: 1120, attack: 124 },
      { name: "Oraculo do Zero", level: 113, weight: 16, hp: 1180, attack: 129 },
      { name: "Devorador de Eras", level: 118, weight: 6, hp: 1310, attack: 139 }
    ]
  }
};

const dungeonData = {
  minLevel: 0,
  description: "Uma investida online para ate 3 jogadores, seguindo a ordem completa dos inimigos e chefes do jogo."
};

const advancedBossRegions = ["Ruinas", "Pantano", "Vulcao", "Abismo", "Fortaleza", "Necropole", "Citadela", "Panteao", "Cataclismo", "Paradoxo"];
const bossAbilityCatalog = {
  "Ent Ancestral": [
    { id: "raizes_esmagadoras", name: "Raizes Esmagadoras", type: "max_hp", chance: 0.28, cost: 18, power: 34, variance: 6, maxHpPercent: 0.04, targetDamageDownPercent: 0.15, targetDamageDownTurns: 2, animation: "cast", description: "Raizes esmagam o alvo e enfraquecem o seu dano." }
  ],
  "Troll das Profundezas": [
    { id: "eco_de_pedra", name: "Eco de Pedra", type: "shield_breaker", chance: 0.28, cost: 22, power: 54, variance: 8, ignoreShield: true, bonusIfShield: 26, selfShieldPercent: 0.12, shieldTurns: 2, animation: "cast", description: "Golpe sismico que quebra escudos e reforca a propria guarda." }
  ],
  "Rei Espectral": [
    { id: "lamento_real", name: "Lamento Real", type: "nuke", chance: 0.28, cost: 28, power: 78, variance: 8, targetHealReductionPercent: 0.4, targetHealReductionTurns: 3, targetDamageDownPercent: 0.12, targetDamageDownTurns: 2, animation: "cast", description: "Uma lamentacao maldita que corta cura e vontade de lutar." }
  ],
  "Hidra do Lodo": [
    { id: "sopro_corrosivo", name: "Sopro Corrosivo", type: "nuke", chance: 0.24, cost: 32, power: 96, variance: 10, targetBurnPercent: 0.03, targetBurnTurns: 3, targetHealReductionPercent: 0.5, targetHealReductionTurns: 3, animation: "cast", description: "Baba corrosiva que fere e impede sua recuperacao." },
    { id: "pele_viscosa", name: "Pele Viscosa", type: "buff", chance: 0.2, cost: 18, turns: 4, attackPercent: 0.18, flatDamageBonus: 10, regenPercent: 0.05, selfShieldPercent: 0.1, shieldTurns: 4, description: "Lodo condensado fortalece a hidra e forma uma camada protetora." }
  ],
  "Draco Magmatico": [
    { id: "explosao_vulcanica", name: "Explosao Vulcanica", type: "nuke", chance: 0.22, cost: 38, power: 124, variance: 12, targetBurnPercent: 0.04, targetBurnTurns: 4, targetHealReductionPercent: 0.25, targetHealReductionTurns: 3, animation: "cast", description: "Uma detonacao de magma que incendeia e sufoca a cura do heroi." },
    { id: "escamas_ardentes", name: "Escamas Ardentes", type: "buff", chance: 0.2, cost: 24, turns: 4, attackPercent: 0.22, flatDamageBonus: 14, pierceBonus: 0.06, selfShieldPercent: 0.14, shieldTurns: 3, description: "O calor do draco endurece as escamas e torna seus golpes mais letais." }
  ],
  "Arauto do Vazio": [
    { id: "dilacerar_realidade", name: "Dilacerar Realidade", type: "pierce", chance: 0.22, cost: 44, power: 156, variance: 14, maxHpPercent: 0.05, ignoreShield: true, ignoreFlatReduction: true, targetDamageDownPercent: 0.15, targetDamageDownTurns: 2, animation: "cast", description: "Rasga a realidade para atingir ate herois protegidos." },
    { id: "manto_do_vazio", name: "Manto do Vazio", type: "buff", chance: 0.18, cost: 24, turns: 4, attackPercent: 0.24, flatDamageBonus: 14, pierceBonus: 0.14, selfShieldPercent: 0.12, shieldTurns: 4, description: "A energia do vazio torna o arauto mais dificil de parar." }
  ],
  "General de Aco": [
    { id: "marcha_de_ferro", name: "Marcha de Ferro", type: "nuke", chance: 0.22, cost: 48, power: 188, variance: 16, targetDamageDownPercent: 0.25, targetDamageDownTurns: 3, animation: "cast", description: "A pressao militar do general reduz o dano do heroi." },
    { id: "ordem_de_guerra", name: "Ordem de Guerra", type: "buff", chance: 0.2, cost: 26, turns: 4, attackPercent: 0.28, flatDamageBonus: 22, selfShieldPercent: 0.14, shieldTurns: 4, description: "Tropa cerrada, postura de guarda e mais agressao." },
    { id: "estocada_rasga_aco", name: "Estocada Rasga-Aco", type: "shield_breaker", chance: 0.18, cost: 28, power: 108, variance: 10, ignoreShield: true, bonusIfShield: 46, targetSkipChance: 0.12, description: "Golpe de elite que pune escudos e pode travar o seu ritmo." }
  ],
  "Lorde da Cripta": [
    { id: "sentenca_funebre", name: "Sentenca Funebre", type: "nuke", chance: 0.22, cost: 52, power: 220, variance: 18, targetHealReductionPercent: 0.5, targetHealReductionTurns: 4, targetDamageDownPercent: 0.15, targetDamageDownTurns: 2, animation: "cast", description: "Condena o heroi e enfraquece sua recuperacao." },
    { id: "pacto_funebre", name: "Pacto Funebre", type: "buff", chance: 0.18, cost: 28, turns: 4, attackPercent: 0.22, flatDamageBonus: 18, regenPercent: 0.07, selfShieldPercent: 0.16, shieldTurns: 4, description: "A necromancia prolonga a luta com escudo e regeneracao." },
    { id: "ceifa_do_desprotegido", name: "Ceifa do Desprotegido", type: "execute_unshielded", chance: 0.16, cost: 30, power: 116, variance: 12, bonusIfNoShield: 54, targetBurnPercent: 0.04, targetBurnTurns: 3, description: "A ceifa cresce quando o heroi esta sem escudo e deixa uma maldicao dolorosa." }
  ],
  "Imperador do Eclipse": [
    { id: "ruptura_estelar", name: "Ruptura Estelar", type: "nuke", chance: 0.22, cost: 60, power: 260, variance: 20, targetSkipChance: 0.18, targetDamageDownPercent: 0.18, targetDamageDownTurns: 2, animation: "cast", description: "A explosao astral pode quebrar o ritmo ofensivo do heroi." },
    { id: "dominio_crepuscular", name: "Dominio Crepuscular", type: "buff", chance: 0.18, cost: 32, turns: 4, attackPercent: 0.3, flatDamageBonus: 20, pierceBonus: 0.16, selfShieldPercent: 0.18, shieldTurns: 4, description: "O eclipse fortalece o imperador e o envolve em uma muralha sombria." },
    { id: "lamina_umbra", name: "Lamina Umbra", type: "pierce", chance: 0.15, cost: 32, power: 136, variance: 14, ignoreShield: true, ignoreFlatReduction: true, targetHealReductionPercent: 0.35, targetHealReductionTurns: 3, description: "Uma lamina de eclipse que fura defesas e corta a sua cura." }
  ],
  "Avatar do Zenith": [
    { id: "julgamento_solar", name: "Julgamento Solar", type: "nuke", chance: 0.22, cost: 66, power: 305, variance: 22, targetBurnPercent: 0.05, targetBurnTurns: 3, targetHealReductionPercent: 0.35, targetHealReductionTurns: 3, animation: "cast", description: "O Zenith incendeia o heroi e pressiona sua sobrevivencia." },
    { id: "aurea_divina", name: "Aurea Divina", type: "buff", chance: 0.18, cost: 34, turns: 4, attackPercent: 0.26, flatDamageBonus: 22, regenPercent: 0.06, selfShieldPercent: 0.2, shieldTurns: 4, description: "Energia sagrada em forma de escudo, regeneracao e poder." },
    { id: "prisma_do_zenith", name: "Prisma do Zenith", type: "shield_breaker", chance: 0.16, cost: 36, power: 152, variance: 16, ignoreShield: true, bonusIfShield: 56, targetDamageDownPercent: 0.25, targetDamageDownTurns: 2, description: "Um feixe perfeito que desmonta a defesa do heroi." },
    { id: "clarao_absoluto", name: "Clarao Absoluto", type: "nuke", chance: 0.14, cost: 34, power: 128, variance: 14, targetSkipChance: 0.35, targetDamageDownPercent: 0.15, targetDamageDownTurns: 2, animation: "cast", description: "Luz extrema que pode roubar o seu proximo turno." }
  ],
  "Deus da Ruina": [
    { id: "colapso_final", name: "Colapso Final", type: "max_hp", chance: 0.2, cost: 74, power: 360, variance: 24, maxHpPercent: 0.08, targetHealReductionPercent: 0.5, targetHealReductionTurns: 4, animation: "cast", description: "A ruina atinge tanto sua vida atual quanto sua estrutura maxima." },
    { id: "manto_da_ruina", name: "Manto da Ruina", type: "buff", chance: 0.18, cost: 40, turns: 4, attackPercent: 0.34, flatDamageBonus: 34, pierceBonus: 0.2, regenPercent: 0.04, selfShieldPercent: 0.22, shieldTurns: 4, description: "A entidade do fim se cobre de devastacao e um enorme escudo." },
    { id: "aniquilacao_perfurante", name: "Aniquilacao Perfurante", type: "pierce", chance: 0.15, cost: 40, power: 186, variance: 18, ignoreShield: true, ignoreFlatReduction: true, targetDamageDownPercent: 0.3, targetDamageDownTurns: 3, description: "Perfura qualquer defesa e ainda reduz drasticamente o dano do heroi." },
    { id: "fim_dos_fracos", name: "Fim dos Fracos", type: "execute_unshielded", chance: 0.12, cost: 42, power: 170, variance: 18, bonusIfNoShield: 70, targetSkipChance: 0.3, targetBurnPercent: 0.06, targetBurnTurns: 3, description: "A punicao final castiga alvos expostos e pode quebrar o seu proximo turno." }
  ],
  "Soberano do Paradoxo": [
    { id: "ruptura_temporal", name: "Ruptura Temporal", type: "nuke", chance: 0.2, cost: 82, power: 398, variance: 24, targetSkipChance: 0.28, targetDamageDownPercent: 0.2, targetDamageDownTurns: 3, description: "Fende o fluxo do tempo e deixa o heroi descompassado." },
    { id: "armadura_de_eras", name: "Armadura de Eras", type: "buff", chance: 0.18, cost: 44, turns: 4, attackPercent: 0.36, flatDamageBonus: 38, pierceBonus: 0.18, regenPercent: 0.05, selfShieldPercent: 0.24, shieldTurns: 4, description: "Camadas de eras condensadas reforcam seu corpo e seus golpes." },
    { id: "colapso_do_zero", name: "Colapso do Zero", type: "pierce", chance: 0.16, cost: 46, power: 214, variance: 18, ignoreShield: true, ignoreFlatReduction: true, targetHealReductionPercent: 0.45, targetHealReductionTurns: 4, description: "Apaga protecoes, atravessa resistencias e sabota qualquer cura." },
    { id: "fim_inadiavel", name: "Fim Inadiavel", type: "execute_unshielded", chance: 0.14, cost: 48, power: 184, variance: 16, maxHpPercent: 0.1, bonusIfNoShield: 80, targetBurnPercent: 0.05, targetBurnTurns: 3, targetSkipChance: 0.18, description: "Forca o destino do heroi com dano pesado, ferida persistente e pressao brutal." }
  ]
};

const subclassChoicesByClass = {
  Guerreiro: {
    tier30: [
      { id: "cavaleiro", name: "Cavaleiro", description: "Defesa robusta, tecnica de impacto e sustentacao em combate.", bonusHp: 140, bonusAttack: 8, skillPower: 8 },
      { id: "espadachim", name: "Espadachim", description: "Tecnica veloz, esquiva e ofensiva refinada com a espada.", bonusHp: 0, bonusAttack: 25, skillPower: 15 }
    ],
    tier60: {
      cavaleiro: [
        { id: "paladino", name: "Paladino", description: "Guardiao sagrado de grande vida maxima e retaliacao pesada.", bonusHp: 1000, bonusAttack: 10, skillPower: 8 },
        { id: "berserker", name: "Berserker", description: "Furia brutal que troca seguranca por agressao extrema.", bonusHp: 0, bonusAttack: 70, skillPower: 0 }
      ],
      espadachim: [
        { id: "samurai", name: "Samurai", description: "Disciplina, cortes precisos e sustentacao em duelos longos.", bonusHp: 500, bonusAttack: 35, skillPower: 15 },
        { id: "ninja", name: "Ninja", description: "Mobilidade extrema, evasao e assassinato oportunista.", bonusHp: 0, bonusAttack: 40, skillPower: 30 }
      ]
    }
  },
  Mago: {
    tier30: [
      { id: "elementalista", name: "Elementalista", description: "Manipula fogo e reforca o poder bruto das magias.", bonusHp: 0, bonusMp: 40, bonusAttack: 0, skillPower: 30 },
      { id: "arcanista", name: "Arcanista", description: "Acumula cargas arcanas e transforma mana em dano bruto.", bonusHp: 0, bonusMp: 100, bonusAttack: 10, skillPower: 15 }
    ],
    tier60: {
      elementalista: [
        { id: "mago_incendiario", name: "Mago Incendiario", description: "Canaliza fogo puro em cada feitiço.", bonusHp: 0, bonusMp: 0, bonusAttack: 0, skillPower: 60 },
        { id: "mago_frigido", name: "Mago Frigido", description: "Frio absoluto com grande reserva arcana.", bonusHp: 0, bonusMp: 400, bonusAttack: 0, skillPower: 40 }
      ],
      arcanista: [
        { id: "arquimago", name: "Arquimago", description: "Mestria suprema entre mana, ataque e poder arcano.", bonusHp: 0, bonusMp: 800, bonusAttack: 10, skillPower: 10 },
        { id: "corrompido", name: "Corrompido", description: "Poder instavel que mistura mana, arma e sacrificio.", bonusHp: 0, bonusMp: 300, bonusAttack: 25, skillPower: 25 }
      ]
    }
  },
  Arqueiro: {
    tier30: [
      { id: "atirador", name: "Atirador", description: "Especialista em tiros tecnicos, precisao e burst em alvo unico.", bonusHp: 0, bonusMp: 50, bonusAttack: 15, skillPower: 15 },
      { id: "cacador", name: "Cacador", description: "Predador oportunista focado em rajadas, esquiva e recompensas.", bonusHp: 100, bonusMp: 0, bonusAttack: 20, skillPower: 0 }
    ],
    tier60: {
      atirador: [
        { id: "atirador_arcano", name: "Atirador Arcano", description: "Transforma mana em disparos tecnicos e marcas arcanas.", bonusHp: 0, bonusMp: 400, bonusAttack: 0, skillPower: 50 },
        { id: "sniper", name: "Sniper", description: "Concentra cada disparo em execucao letal de alvo unico.", bonusHp: 0, bonusMp: 0, bonusAttack: 70, skillPower: 0 }
      ],
      cacador: [
        { id: "espreitador", name: "Espreitador", description: "Predador furtivo com equilibrio entre mana e dano oportunista.", bonusHp: 0, bonusMp: 100, bonusAttack: 30, skillPower: 15 },
        { id: "guarda_florestal", name: "Guarda Florestal", description: "Sentinela resistente que domina tiros de controle e sobrevivencia.", bonusHp: 500, bonusMp: 0, bonusAttack: 25, skillPower: 0 }
      ]
    }
  },
  "Adepto da Natureza": {
    tier30: [
      { id: "druida", name: "Druida", description: "Rota ancestral ligada a formas naturais, vigor e controle vivo.", bonusHp: 100, bonusMp: 0, bonusAttack: 10, skillPower: 5 },
      { id: "espirito_da_floresta", name: "Espirito da Floresta", description: "Rota eterea da mata, focada em magia natural, ritmo e encanto.", bonusHp: 0, bonusMp: 100, bonusAttack: 5, skillPower: 15 }
    ],
    tier60: {
      druida: [
        { id: "druida_sombrio", name: "Druida Sombrio", description: "Canaliza o lado decadente da natureza e da corrupcao viva.", bonusHp: 0, bonusMp: 200, bonusAttack: 20, skillPower: 30 },
        { id: "avatar_da_natureza", name: "Avatar da Natureza", description: "Manifestacao do ciclo natural em forma de poder bruto e resiliencia.", bonusHp: 400, bonusMp: 0, bonusAttack: 20, skillPower: 15 }
      ],
      espirito_da_floresta: [
        { id: "fada_monarca", name: "Fada Monarca", description: "Soberania feerica, magia refinada e dominio dos encantos da floresta.", bonusHp: 0, bonusMp: 400, bonusAttack: 0, skillPower: 35 },
        { id: "protetor_da_floresta", name: "Protetor da Floresta", description: "Guardiao espiritual da mata, firmeza viva e defesa natural.", bonusHp: 400, bonusMp: 0, bonusAttack: 15, skillPower: 20 }
      ]
    }
  }
};

