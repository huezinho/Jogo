/* Dungeon-only decisions. Skill numbers come from the current campaign combat kernel. */
const DungeonRules = (() => {
  const targets={
    warrior_second_wind:'self',warrior_shove:'enemy',warrior_stagger:'enemy',warrior_swift_strikes:'enemy',warrior_warcry:'party',warrior_deep_cut:'enemy',warrior_judgment:'enemy',warrior_valhalla:'self',warrior_armor_piercer:'enemy',warrior_smoke_bomb:'ally',warrior_faith_shield:'ally',warrior_unstoppable:'self',warrior_ultrasonic_cuts:'self',warrior_giant_slayer:'enemy',
    mage_mana_burst:'enemy',mage_fireball:'enemy',mage_freeze:'enemy',mage_concentration:'self',mage_mana_shield:'ally',mage_discharge:'enemies',mage_sacred_phoenix:'enemies',mage_blizzard:'enemies',mage_corruption:'enemy',mage_overcharge:'enemies',mage_demon_form:'self',mage_explode:'enemies',mage_avalanche:'enemies',
    archer_focus:'self',archer_headshot:'enemy',archer_camouflage:'self',archer_barrage:'enemy',archer_piercing_shot:'enemy',archer_trap:'enemy',archer_arcane_shot:'enemy',archer_execute:'enemy',archer_surprise:'enemy',archer_tranquilizer:'enemy',archer_overcharge:'enemies',archer_weak_spot:'enemy',archer_aim_leg:'enemy',archer_cutting_shot:'enemy',
    nature_living_seed:'enemy',nature_roots:'enemies',nature_swamp_flower:'enemy',nature_breeze_charm:'enemy',nature_harvest:'enemy',nature_ancestral_song:'party',nature_decay:'enemy',nature_true_form:'self',nature_queen_decree:'enemies',nature_vine_cocoon:'ally',nature_swamp_collapse:'enemies',nature_crush_invader:'enemy',nature_crown:'self',nature_throw_thorns:'enemies'
  };
  const labels={enemy:'Inimigo único',ally:'Aliado à escolha',party:'Toda a equipe',enemies:'Todos os inimigos',self:'Uso próprio'};
  function target(skill){
    if(skill.type==='warrior_warcry'&&skill.hpCostPercent)return 'self';
    if(skill.type==='mage_freeze'&&skill.name==='Bafo de Fogo')return 'enemies';
    return targets[skill.type]||'enemy';
  }
  function needsPrimary(skill){return ['mage_blizzard','nature_roots'].includes(skill.type)||target(skill)==='enemies'&&(!!skill.shattersShield||!!skill.freezeChance);}
  function targetDescription(skill){
    if(skill.type==='archer_barrage')return 'Escolha todos os disparos em um inimigo ou um disparo por inimigo vivo, com dano integral em ambos os modos.';
    const mode=target(skill),extra={warrior_second_wind:'A cura usa a vida máxima do conjurador; purificação e buff são pessoais.',mage_mana_shield:'Usa a mana máxima do conjurador e substitui o escudo atual do aliado.',nature_vine_cocoon:'Usa o ataque e poder do conjurador e soma ao escudo do aliado.',nature_ancestral_song:'Cura os aliados vivos; versões especializadas também protegem o grupo ou enfraquecem a linha inimiga.'}[skill.type];
    return labels[mode]+'. '+(extra||'')+(mode==='enemies'?' Com múltiplos alvos: 70% do dano e 60% dos debuffs numéricos por alvo; controle de perda de turno fica no alvo principal. Custo único.':mode==='party'?' Com múltiplos alvos: 60% da cura, escudo ou bônus por aliado.':'');
  }
  return Object.freeze({maxParty:3,areaScale:.7,supportScale:.6,target,needsPrimary,targetDescription});
})();
