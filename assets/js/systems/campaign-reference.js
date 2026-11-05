/* Read-only campaign descriptions. Values come from the same skill/recipe data as play. */
function getSkillReadout(skill){
  const action=getSkillActionState(skill),caps=getCurrentCaps(),lines=[];
  const route=getPlayerSubclassState();
  lines.push('Versão atual: '+getDisplayedClassName()+'.');
  lines.push('Custo agora: '+action.manaCost+' MP'+(skill.hpCostPercent?' + '+Math.floor(caps.maxHp*skill.hpCostPercent)+' HP':'')+'.');
  if(action.manaCost!==skill.cost)lines.push('Custo original: '+skill.cost+' MP; desconto ou gratuidade já aplicado ao custo atual.');
  if(Number.isFinite(skill.damage)&&skill.damage>0)lines.push('Dano base calculado: '+skill.damage+'.');
  if(skill.hits)lines.push(skill.hits+' ataques básicos; cada golpe usa o ataque básico da sua classe e sofre sua própria mitigação.');
  if(skill.heal)lines.push('Cura base: '+skill.heal+' HP; vida faltante agora: '+Math.max(0,caps.maxHp-player.hp)+'.');
  if(skill.shield)lines.push('Escudo base: '+skill.shield+'.');
  if(skill.turns)lines.push('Duração do efeito: '+skill.turns+' turnos.');
  if(skill.dotDamage&&skill.dotTurns)lines.push('Dano periódico base: '+skill.dotDamage+' por turno, durante '+skill.dotTurns+' turnos ('+skill.dotDamage*skill.dotTurns+' no total).');
  if(skill.markDamage)lines.push('Marca: '+skill.markDamage+' de dano base por turno.');
  if(skill.decayDamage)lines.push('Apodrecimento: '+skill.decayDamage+' de dano base por turno, por '+skill.decayTurns+' turnos.');
  const changes={
    cavaleiro:{warrior_second_wind:'Recuperar Fôlego passa de 12% para 19% da vida máxima e remove uma aplicação de dano periódico.',warrior_shove:'Esbarrão ganha escalamento maior e reduz o ataque inimigo em 30% por 3 turnos.'},
    espadachim:{warrior_second_wind:'Recuperar Fôlego também aumenta o dano final em 28% por 3 turnos.',warrior_shove:'Esbarrão vira Investida: muda a fórmula e pode romper perda de turno.'},
    paladino:{warrior_stagger:'Contundir passa de 30% para 45% de chance de impedir a próxima ação.',warrior_warcry:'Brado também reduz o dano recebido em 16%.'},
    berserker:{warrior_stagger:'Contundir troca o controle por uma fórmula de dano mais forte.',warrior_warcry:'Brado vira Ira: sacrifica vida para aumentar dano e conceder roubo de vida.'},
    samurai:{warrior_swift_strikes:'Golpes Velozes aplica sangramentos independentes.',warrior_deep_cut:'Corte Profundo ignora armadura.'},
    ninja:{warrior_swift_strikes:'Golpes Velozes passa de 2 para 3 golpes.',warrior_deep_cut:'Corte Profundo aumenta o peso do poder de habilidade e o sangramento.'},
    mago_frigido:{mage_fireball:'Bola de Fogo vira Bola de Neve: a queimadura dá lugar ao resfriamento.'},
    mago_incendiario:{mage_freeze:'Congelar vira Bafo de Fogo.'},
    atirador:{archer_focus:'Mirar também fortalece Headshot em 10% e concede 10% de chance de crítico.',archer_camouflage:'Camuflagem também fortalece o próximo dano em 30%.'},
    cacador:{archer_focus:'Mirar concede chance de disparo extra na Rajada.',archer_camouflage:'A esquiva de Camuflagem passa de 20% para 28%.'},
    sniper:{archer_headshot:'Headshot ganha uma fórmula mais forte e 60% de chance base de crítico.',archer_piercing_shot:'O disparo também destrói o escudo do alvo.'},
    atirador_arcano:{archer_headshot:'Headshot passa a escalar com mana máxima e marca o alvo se não critar.',archer_piercing_shot:'O coeficiente de poder de habilidade aumenta.'},
    guarda_florestal:{archer_barrage:'Rajada passa de 2 para 3 ataques básicos.',archer_trap:'Prender o alvo fortalece a próxima Rajada em 23% por disparo.'},
    espreitador:{archer_barrage:'Disparos que erram fortalecem o próximo dano.',archer_trap:'A armadilha também usa 6% da vida atual do alvo.'},
    druida:{nature_living_seed:'A marca dura 4 turnos e também causa dano periódico.',nature_roots:'A chance de enraizar passa de 45% para 60%.'},
    espirito_da_floresta:{nature_living_seed:'A marca também reduz o dano do inimigo.',nature_roots:'Enraizar também corta a armadura em 50%.'},
    avatar_da_natureza:{nature_swamp_flower:'A fórmula de dano aumenta; o veneno dura 3 turnos.'},
    druida_sombrio:{nature_swamp_flower:'O veneno passa a durar 7 turnos.'},
    protetor_da_floresta:{nature_ancestral_song:'A canção também concede escudo.'},
    fada_monarca:{nature_breeze_charm:'A chance base de controle aumenta para 30%.'}
  };
  for(const choice of [route.tier30,route.tier60])if(changes[choice]?.[skill.type])lines.push('Alteração de subclasse: '+changes[choice][skill.type]);
  lines.push('Efeitos: '+skill.description);
  const targetTypes=['mage_mana_burst','mage_fireball','mage_explode','mage_avalanche','warrior_giant_slayer','archer_weak_spot','nature_decay','nature_harvest','nature_crush_invader','nature_ancestral_song'];
  if(!enemy&&targetTypes.includes(skill.type))lines.push('Sem alvo: parcelas que dependem da vida, mana ou efeitos do inimigo serão recalculadas em combate.');
  if(Number.isFinite(skill.damage)||skill.hits||skill.heal||skill.shield)lines.push('Valores base, antes dos modificadores finais, crítico, defesas e limites de vida. Efeitos condicionais estão descritos acima.');
  if(action.reason)lines.push('Indisponível agora: '+action.reason+'.');
  return lines.join('\n');
}

function getMaterialRecipeIndex(){
  const index=new Map();
  const add=(id,entry)=>{if(!index.has(id))index.set(id,[]);index.get(id).push(entry);};
  for(const recipe of EquipmentSystem.getRecipeCatalog(player)){
    // Accessories drop from bosses; they are only upgraded, never crafted.
    if(recipe.slot==='accessory'&&recipe.rarity==='comum')continue;
    for(const [id,qty] of Object.entries(recipe.requirements))add(id,{
      name:recipe.result.name,qty,kind:recipe.rarity==='comum'?'Fabricar':'Aprimorar para',region:recipe.region,
      locked:!EquipmentSystem.isRegionUnlocked(recipe.region,player)
    });
  }
  for(const quality of alchemyQualities)for(const type of alchemyTypes){
    const id='alquimia_'+type.id+'_'+quality.id,recipe=getAlchemyRecipe(id);
    if(!recipe)continue;
    for(const material of recipe.ingredients)add(material.id,{name:consumableCatalog[id].name,qty:material.qty,kind:'Alquimia',region:recipe.region,locked:false});
  }
  return index;
}

function renderBestiaryMaterials(name,region,isBoss,index){
  return '<section class="bestiary-materials"><h4>Materiais e receitas</h4>'+EquipmentSystem.getMaterials(name,region).map((material,i)=>{
    const uses=index.get(material.id)||[],owned=getInventoryCountById(material.id),chance=isBoss?(i?55:65):(i?24:40);
    return `<article class="bestiary-material"><strong>${escapeHtml(material.name)}</strong><p>Origem: ${escapeHtml(name)} · ${escapeHtml(region)} · ${chance}% por vitória · ${owned} na bolsa</p><details><summary>Usado em ${uses.length} receitas / etapas</summary><ul>${uses.map(use=>`<li><span>${escapeHtml(use.kind)}: ${escapeHtml(use.name)}</span><small>${escapeHtml(use.region)}${use.locked?' · região bloqueada':''}</small><strong class="${owned>=use.qty?'status-on':'status-off'}">${owned} / ${use.qty}</strong></li>`).join('')||'<li>Sem receita cadastrada para sua classe.</li>'}</ul><small>Quantidades por fabricação ou etapa de aprimoramento. Consulte o serviço para moedas e demais ingredientes.</small></details></article>`;
  }).join('')+'</section>';
}

function filterBestiaryEntries(value){
  const normalize=text=>String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const query=normalize(value).trim();
  for(const card of document.querySelectorAll('.bestiary-search-entry'))card.hidden=!!query&&!normalize(card.textContent).includes(query);
}
