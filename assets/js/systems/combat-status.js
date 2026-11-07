/* Skill names are the visible labels; complete effects remain in hover descriptions. */
function recordCombatEffectSources(effects,before,source){
  effects.effectSources||={};
  for(const[key,value]of Object.entries(effects))if((typeof value==='number'&&value>0||value===true)&&value!==before[key]&&!['equipmentAction','lastActionType'].includes(key))effects.effectSources[key]=source;
}
function getHeroStatusEffects(){
  const rows=getActiveBuffs(),f=playerEffects,skills=getSkillInfo();
  if(f.incomingDamageBonusTurns>0)rows.push(`Dano recebido +${Math.round(f.incomingDamageBonusPercent*100)}% | ${f.incomingDamageBonusTurns} turno(s)`);
  if(f.controlImmuneTurns>0)rows.push(`Imunidade a controle | ${f.controlImmuneTurns} turno(s)`);
  if(f.nextIncomingAutoMiss)rows.push('Esquiva garantida do próximo ataque');
  if(f.natureShieldBonusTurns>0)rows.push(`Potência de escudo +${Math.round(f.natureShieldBonusPercent*100)}% | ${f.natureShieldBonusTurns} turno(s)`);
  const mappings=[[/^Dano recebido/,'incomingDamageBonusTurns','warrior_valhalla'],[/^Imunidade a controle/,'controlImmuneTurns','warrior_unstoppable'],[/^Esquiva garantida/,'nextIncomingAutoMiss','warrior_smoke_bomb'],[/^Potência de escudo/,'natureShieldBonusTurns'],
    [/^Escudo /,'shieldValue','mage_mana_shield'],[/^Invulneravel/,'invulnerableTurns','warrior_faith_shield'],
    [/^Dano sofrido/,'percentReductionTurns','warrior_warcry'],[/^Dano extra por vida/,'enemyMaxHpBonusTurns','warrior_valhalla'],
    [/^Esquivas restantes/,'potionDodgeTurns'],[/^Protecao fixa/,'potionArmorTurns'],[/^Regeneracao HP/,'potionRegenTurns'],[/^Clareza MP/,'potionManaTurns'],[/^Vampirismo HP/,'potionDrainTurns'],
    [/^Roubo de vida/,'lifeStealTurns','warrior_warcry'],[/^Cortes Ultrasonicos/,'ultrasonicRecoveryTurns','warrior_ultrasonic_cuts'],[/^Somente ataque/,'forcedBasicTurns','warrior_ultrasonic_cuts'],
    [/^Ataque /,'attackBuffTurns','archer_focus'],[/^Habilidade /,'skillBuffTurns','mage_concentration'],[/^Acerto garantido/,'guaranteedHitTurns','archer_focus'],[/^Esquiva /,'enemyMissBonusTurns','archer_camouflage'],
    [/^Regeneracao /,'regenTurns'],[/^Dano total /,'finalDamageBuffTurns','warrior_warcry'],[/^Regen de mana/,'manaRegenBuffTurns','mage_concentration'],[/^Cargas arcanas/,'arcaneChargeTurns'],[/^Cadencia/,'natureCadence'],
    [/^Forma Verdadeira/,'natureTrueFormTurns','nature_true_form'],[/^Coroada/,'natureCrownedTurns','nature_crown'],[/^Proximo dano/,'nextDamageBonusPercent','warrior_smoke_bomb'],
    [/^Seu dano/,'damageDownTurns'],[/^Cura recebida/,'healReductionTurns'],[/^Perdera/,'skipNextTurn'],[/^Proxima rajada/,'nextBarrageDamageBonusPercent'],[/^Canhao de Vidro/,'glassCannonActions']
  ];
  const result=[];
  for(const details of rows){
    if(/^(Queimadura|Veneno|Sangramento)/.test(details)&&['burn','poison','bleed'].some(k=>f[k+'Stacks']?.length))continue;
    const map=mappings.find(([re])=>re.test(details)),source=map&&(f.effectSources?.[map[1]]||skills.find(k=>k.type===map[2])?.name);
    const text=source||details.split(/[|:]/)[0].replace(/\s+\d.*$/,'').trim();
    result.push({text,details,kind:/^-|^Seu dano|^Cura recebida|^Perdera|Assombrar|Marca da Morte|Ceifar|Dominio|Inadiavel|Clarao/.test(details)?'debuff':'buff'});
  }
  for(const[k,label]of[['burn','Queimadura'],['poison','Veneno'],['bleed','Sangramento']])for(const stack of f[k+'Stacks']||[])if(stack.turns>0)result.push({text:stack.source||label,kind:'debuff',details:`${label}: ${stack.damage} de dano após sua ação · ${stack.turns} turno(s).`});
  for(const d of f.pendingEnemyDebuffs||[])result.push({text:d.source,kind:'debuff',details:d.type==='haunt'?`Fuga forçada após ${d.left} ação(ões), se o inimigo continuar vivo.`:d.type==='deathmark'?`Execução após ${d.left} ação(ões), se o inimigo continuar vivo.`:`${d.percent}% da vida máxima após sua ação.`});
  const groups=new Map();for(const e of result){const key=e.text;if(!groups.has(key))groups.set(key,{...e,details:[]});groups.get(key).details.push(e.details);}
  return [...groups.values()].map(e=>({...e,details:[...new Set(e.details)].join('\n')}));
}
