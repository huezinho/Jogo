/* Dungeon-only decisions. Skill numbers come from the current campaign combat kernel. */
const DungeonRules = (() => {
  const targets={
    warrior_second_wind:'ally',warrior_shove:'enemy',warrior_stagger:'enemy',warrior_swift_strikes:'enemy',warrior_warcry:'party',warrior_deep_cut:'enemy',warrior_judgment:'enemy',warrior_valhalla:'self',warrior_armor_piercer:'enemy',warrior_smoke_bomb:'ally',warrior_faith_shield:'ally',warrior_unstoppable:'self',warrior_ultrasonic_cuts:'self',warrior_giant_slayer:'enemy',
    mage_mana_burst:'enemy',mage_fireball:'enemy',mage_freeze:'enemy',mage_concentration:'party',mage_mana_shield:'ally',mage_discharge:'enemies',mage_sacred_phoenix:'enemies',mage_blizzard:'enemies',mage_corruption:'enemy',mage_overcharge:'enemies',mage_demon_form:'self',mage_explode:'enemies',mage_avalanche:'enemies',
    archer_focus:'self',archer_headshot:'enemy',archer_camouflage:'self',archer_barrage:'enemies',archer_piercing_shot:'enemy',archer_trap:'enemy',archer_arcane_shot:'enemy',archer_execute:'enemy',archer_surprise:'enemy',archer_tranquilizer:'enemy',archer_overcharge:'enemies',archer_weak_spot:'enemy',archer_aim_leg:'enemy',archer_cutting_shot:'enemy',
    nature_living_seed:'enemy',nature_roots:'enemies',nature_swamp_flower:'enemy',nature_breeze_charm:'enemy',nature_harvest:'enemy',nature_ancestral_song:'party',nature_decay:'enemy',nature_true_form:'self',nature_queen_decree:'enemies',nature_vine_cocoon:'ally',nature_swamp_collapse:'enemies',nature_crush_invader:'enemy',nature_crown:'self',nature_throw_thorns:'enemies'
  };
  const labels={enemy:'Inimigo único',ally:'Aliado à escolha',party:'Toda a equipe',enemies:'Todos os inimigos',self:'Uso próprio'};
  const boons=[
    {id:'vigor',name:'Vigor de pedra',description:'Mais vida máxima e recuperação imediata.',mod:'hp',base:35,scale:5},
    {id:'clarity',name:'Fonte interior',description:'Mais mana máxima e recuperação imediata.',mod:'mp',base:30,scale:5},
    {id:'blade',name:'Fio ancestral',description:'Aumenta o ataque de todos os seus golpes.',mod:'attack',base:4,scale:.65},
    {id:'spell',name:'Inscrição arcana',description:'Aumenta o poder das suas habilidades.',mod:'power',base:4,scale:.65},
    {id:'guard',name:'Pele de ferro',description:'Redução fixa de dano recebida.',mod:'armor',base:2,scale:.12},
    {id:'luck',name:'Olhar preciso',description:'+3% de chance de crítico nesta expedição.',mod:'crit',amount:.03},
    {id:'flow',name:'Fluxo sereno',description:'+8 de regeneração de mana por turno.',mod:'manaRegen',amount:8},
    {id:'fury',name:'Voto de conquista',description:'+6% de dano direto nesta expedição.',mod:'damage',amount:.06}
  ];
  const relics=[
    {id:'none',name:'Sem relíquia',cost:0,description:'Comece sem uma relíquia inicial.',mods:{}},
    {id:'ember',name:'Brasa do viajante',cost:0,description:'+20 de vida máxima.',mods:{hp:20}},
    {id:'ink',name:'Tinta da memória',cost:8,description:'+35 de mana máxima.',mods:{mp:35}},
    {id:'fang',name:'Presa talhada',cost:12,description:'+5 de ataque.',mods:{attack:5}},
    {id:'lens',name:'Lente do destino',cost:16,description:'+4% de chance de crítico.',mods:{crit:.04}},
    {id:'rune',name:'Runa do eco',cost:20,description:'+8 de poder de habilidade.',mods:{power:8}},
    {id:'spring',name:'Gota perene',cost:24,description:'+6 de regeneração de mana por turno.',mods:{manaRegen:6}}
  ];
  const rooms={
    battle:{name:'Confronto',description:'Enfrente criaturas e receba ouro e uma bênção.',art:'battle'},
    elite:{name:'Caçada perigosa',description:'Inimigos mais fortes. Mais ouro e equipamento garantido.',art:'battle'},
    rest:{name:'Santuário',description:'Recupere o grupo ou resgate um companheiro caído.',art:'sanctuary'},
    event:{name:'Altar esquecido',description:'Uma escolha entre risco, recursos e poder.',art:'sanctuary'},
    treasure:{name:'Tesouro selado',description:'Abra um cofre de ouro e equipamento ou preserve recursos.',art:'battle'},
    merchant:{name:'Mercador errante',description:'Use o ouro da expedição para comprar provisões e equipamento.',art:'merchant'},
    boss:{name:'Guardião',description:'O guardião encerra este trecho da expedição.',art:'battle'}
  };
  function target(skill){
    if(skill.type==='warrior_warcry'&&skill.hpCostPercent)return 'self';
    if(skill.type==='mage_freeze'&&skill.name==='Bafo de Fogo')return 'enemies';
    return targets[skill.type]||'enemy';
  }
  function targetDescription(skill){
    const mode=target(skill),extra={warrior_second_wind:'A cura usa a vida máxima do conjurador; purificação e buff vão para o aliado escolhido.',mage_mana_shield:'Usa a mana máxima do conjurador e substitui o escudo atual do aliado.',nature_vine_cocoon:'Usa o ataque e poder do conjurador e soma ao escudo do aliado.',nature_ancestral_song:'Cura os aliados vivos; versões especializadas também protegem o grupo ou enfraquecem a linha inimiga.'}[skill.type];
    return labels[mode]+'. '+(extra||'')+(mode==='enemies'?' 70% do dano direto por alvo; DOTs e controles mantêm seus valores. Custo único.':'');
  }
  function enemySkills(e){
    const name=e.baseName,region=regions[e.region];
    const healers=new Set(['Ent Ancestral','Bruxa do Brejo','Serpente do Lodo','Hidra do Lodo','Fenix Sombria','Maga da Muralha','Feiticeira Morta','Oraculo Radiante','Oraculo do Zero']);
    const buffers=new Set(['Esqueleto Mineiro','Sentinela Quebrada','Cultista Perdido','Golem de Brasa','Cavaleiro Abissal','Escudeiro de Ferro','Guardiao Funebre','Anjo Caido','Guardiao Aureo','Guardiao Temporal']);
    const areas=new Set(['Slime Toxico','Sapo Colossal','Bruxa do Brejo','Fenix Sombria','Lamia do Eclipse','Colosso do Vazio','Maga da Muralha','Feiticeira Morta','Drake Celeste','Oraculo Radiante','Quimera Solar','Arauto do Cataclismo','Titan Rachado','Serafim do Fim','Oraculo do Zero']);
    const venom=/Aranha|Toxico|Pantano|Lodo|Brejo/.test(name+' '+e.region),burn=/Vulcao|Solar|Zenith|Ruina/.test(name+' '+e.region);
    const original=CampaignEnemyCombat.kit(name),signatureMove=original.find(x=>x.power!==undefined||x.basicAttack||x.haunt||x.deathmark||x.doom)||{},signature=e.isBoss?region.boss.skillName:original.find(x=>x.power!==undefined||x.basicAttack)?.name;
    const attack={kind:e.isBoss||areas.has(name)?'area':'attack',name:signature||(venom?'Presa venenosa':burn?'Chama errante':'Golpe preciso'),target:e.isBoss||areas.has(name)?'party':'hero',cost:20,multiplier:e.isBoss?.9:areas.has(name)?.7:1.1,dot:venom?'poison':burn?'burn':null,debuffs:Object.fromEntries(['haunt','deathmark','doom','damageDown','healDown','skip','turns'].filter(k=>signatureMove[k]).map(k=>[k,signatureMove[k]]))};
    const out=[attack];
    if(healers.has(name))out.push({kind:'heal',name:original.find(x=>x.regen||x.heal||x.fullHeal)?.name||'Ritual restaurador',target:'ally',cost:24});
    if(buffers.has(name)||e.isBoss)out.push({kind:'buff',name:original.find(x=>x.shield||x.shieldFlat||x.attackBonus)?.name||'Clamor ancestral',target:'allies',cost:22});
    if(e.isBoss)out.push({kind:'charge',name:signature+' · ruptura',target:'party',cost:30});
    return out;
  }
  return Object.freeze({version:3,maxParty:3,acts:12,roomsPerAct:7,levelsPerRoom:0,areaScale:.7,targets,labels,boons,relics,rooms,target,targetDescription,enemySkills});
})();
