const TROPHY_CATEGORY_ASSET_VERSION = "trophy-categories-v1-20260520";

function getCollectedEquipmentCount(){
  return player.inventory.filter(item => item.type === "equipment").length + Object.values(player.equipment || {}).filter(Boolean).length;
}

function getLegendaryEquipmentCount(){
  return [...player.inventory, ...Object.values(player.equipment || {})].filter(Boolean).filter(item => item.type === "equipment" && item.rarity === "lendaria").length;
}

function getCompletedSetCount(){
  return getActiveSetBonuses().activeSets.length;
}

function getSubclassCount(){
  return getChosenSubclassDefs().length;
}

function getCraftedEquipmentCount(){
  return player.stats.craftedEquipment || 0;
}

function getItemsSoldCount(){
  return player.stats.itemsSold || 0;
}

function getArenaWinCount(){
  return player.stats.arenaWins || 0;
}

function getArenaDuelCount(){
  return player.stats.arenaDuels || 0;
}

function getTrophyCompletion(){
  const trophies = getTrophies();
  const done = trophies.filter(trophy => trophy.done).length;
  return Math.floor(done / trophies.length * 100);
}

function getTrophies(){
  const regionNames = Object.keys(regions);
  const discoveredBestiary = Object.keys(player.stats.bestiary || {}).length;
  const totalBestiary = regionNames.reduce((sum, regionName) => sum + (regions[regionName]?.enemies?.length || 0) + 1, 0);
  const bossRegionsCleared = regionNames.filter(region => (player.stats.regionBossKills?.[region] || 0) > 0).length;

  return [
    { category: "Campanha", name: "Primeiro Passo", done: player.level >= 2, description: "Alcance o nivel 2." },
    { category: "Campanha", name: "Trilha Aberta", done: player.level >= 10, description: "Alcance o nivel 10." },
    { category: "Campanha", name: "Alem do Vulcao", done: player.level >= 44, description: "Alcance o nivel 44." },
    { category: "Campanha", name: "Senhor da Necropole", done: player.level >= 60, description: "Alcance o nivel 60." },
    { category: "Campanha", name: "Peregrino do Panteao", done: player.level >= 68, description: "Alcance o nivel 68." },
    { category: "Campanha", name: "Fim do Mundo", done: player.level >= 76, description: "Alcance o nivel 76." },
    { category: "Campanha", name: "Alem do Cataclismo", done: player.level >= 84, description: "Alcance o nivel 84." },
    { category: "Campanha", name: "Mestre Supremo", done: player.level >= MAX_LEVEL, description: "Alcance o nivel maximo." },

    { category: "Combate", name: "Primeiro Sangue", done: player.stats.enemiesDefeated >= 1, description: "Derrote 1 inimigo." },
    { category: "Combate", name: "Limpador de Trilha", done: player.stats.enemiesDefeated >= 10, description: "Derrote 10 inimigos." },
    { category: "Combate", name: "Cacador Experiente", done: player.stats.enemiesDefeated >= 25, description: "Derrote 25 inimigos." },
    { category: "Combate", name: "Exterminador", done: player.stats.enemiesDefeated >= 100, description: "Derrote 100 inimigos." },

    { category: "Colecao", name: "Primeiro Registro", done: discoveredBestiary >= 1, description: "Registre uma criatura no bestiario." },
    { category: "Colecao", name: "Naturalista Regional", done: discoveredBestiary >= 12, description: "Registre 12 criaturas no bestiario." },
    { category: "Colecao", name: "Arquivo Vivo", done: discoveredBestiary >= Math.ceil(totalBestiary * 0.5), description: "Registre metade do bestiario." },
    { category: "Colecao", name: "Arsenal Completo", done: getCollectedEquipmentCount() >= 20, description: "Junte 20 equipamentos entre inventario e equipamento atual." },
    { category: "Colecao", name: "Lenda Reluzente", done: getLegendaryEquipmentCount() >= 3, description: "Obtenha 3 equipamentos lendarios." },

    { category: "Chefes", name: "Matador de Chefes", done: player.stats.bossesDefeated >= 1, description: "Derrote 1 chefao." },
    { category: "Chefes", name: "Lenda da Coroa", done: player.stats.bossesDefeated >= 5, description: "Derrote 5 chefes." },
    { category: "Chefes", name: "Mapa de Trofeus", done: bossRegionsCleared >= 4, description: "Derrote chefes de 4 regioes diferentes." },
    { category: "Chefes", name: "Dominador Regional", done: regionNames.every(region => (player.stats.regionBossKills?.[region] || 0) > 0), description: "Derrote o chefao de todas as regioes ao menos uma vez." },

    { category: "Dungeon", name: "Primeira Incursao", done: (player.stats.dungeonBestStep || 0) >= 1, description: "Derrote o primeiro inimigo da dungeon online." },
    { category: "Dungeon", name: "Meio Caminho", done: (player.stats.dungeonBestStep || 0) >= Math.floor(getDungeonSequence().length / 2), description: "Alcance metade da sequencia fixa da dungeon." },
    { category: "Dungeon", name: "Fim da Incursao", done: (player.stats.dungeonClears || 0) >= 1, description: "Conclua a dungeon inteira uma vez." },
    { category: "Dungeon", name: "Grupo Persistente", done: (player.stats.dungeonClears || 0) >= 3, description: "Conclua a dungeon inteira 3 vezes." },
    { category: "Dungeon", name: "Loja da Expediccao", done: (player.stats.dungeonShopPurchases || 0) >= 3, description: "Compre 3 itens na loja da dungeon." },
    { category: "Dungeon", name: "Agua Milagrosa", done: (player.stats.dungeonFountainUses || 0) >= 2, description: "Use a fonte da dungeon 2 vezes." },
    { category: "Dungeon", name: "Patrulhas Variadas", done: (player.stats.dungeonMultiEncounterWins || 0) >= 3, description: "Venca 3 batalhas da dungeon contra grupos com mais de um inimigo." },
    { category: "Dungeon", name: "Regioes Vencidas", done: (player.stats.dungeonRegionsCleared || 0) >= 3, description: "Derrote o chefao de 3 regioes diferentes dentro da dungeon." },

    { category: "Arena", name: "Portao da Arena", done: getArenaDuelCount() >= 1, description: "Participe de um duelo na arena." },
    { category: "Arena", name: "Primeira Vitoria", done: getArenaWinCount() >= 1, description: "Venca um duelo na arena." },
    { category: "Arena", name: "Sequencia de Campeao", done: getArenaWinCount() >= 5, description: "Venca 5 duelos na arena." },

    { category: "Economia", name: "Bolso Pesado", done: player.stats.coinsEarned >= 500, description: "Acumule 500 moedas ao longo da campanha." },
    { category: "Economia", name: "Magnata do Vilarejo", done: player.stats.coinsEarned >= 2500, description: "Acumule 2500 moedas ao longo da campanha." },
    { category: "Economia", name: "Cliente Frequente", done: getItemsSoldCount() >= 5, description: "Venda 5 itens." },
    { category: "Economia", name: "Forja em Movimento", done: getCraftedEquipmentCount() >= 3, description: "Crie 3 equipamentos no artesao." },

    { category: "Equipamentos", name: "Colecionador de Aco", done: getCollectedEquipmentCount() >= 8, description: "Junte 8 equipamentos entre inventario e equipamento atual." },
    { category: "Equipamentos", name: "Tesouro Lendario", done: getLegendaryEquipmentCount() >= 1, description: "Obtenha pelo menos 1 equipamento lendario." },
    { category: "Equipamentos", name: "Vestido para Guerra", done: ["head", "chest", "weapon", "legs", "feet"].every(slot => !!player.equipment?.[slot]), description: "Equipe os 5 slots de arma e armadura." },
    { category: "Equipamentos", name: "Mestre dos Sets", done: getCompletedSetCount() >= 1, description: "Ative um set completo de regiao." },

    { category: "Classes", name: "Caminho Escolhido", done: getSubclassCount() >= 1, description: "Escolha sua primeira subclasse." },
    { category: "Classes", name: "Forma Final", done: getSubclassCount() >= 2, description: "Escolha sua segunda subclasse." },

    { category: "Sobrevivencia", name: "Imortal por Teimosia", done: player.stats.deaths >= 1, description: "Caia em batalha e volte para lutar outra vez." },
    { category: "Sobrevivencia", name: "Veterano de Guerra", done: player.stats.deaths >= 5, description: "Caia 5 vezes e continue a jornada." }
  ];
}

function getTrophyCategories(){
  const grouped = {};
  for(const trophy of getTrophies()){
    const category = trophy.category || "Geral";
    grouped[category] = grouped[category] || [];
    grouped[category].push(trophy);
  }
  return grouped;
}

function getTrophyCategorySummary(){
  return Object.entries(getTrophyCategories()).map(([category, trophies]) => {
    const completed = trophies.filter(trophy => trophy.done).length;
    return {
      category,
      completed,
      total: trophies.length,
      percent: Math.floor((completed / Math.max(1, trophies.length)) * 100)
    };
  });
}

function setTrophyCategory(category){
  selectedTrophyCategory = category || "Todas";
  updateUI();
}

function getVisibleTrophyCategories(){
  const grouped = getTrophyCategories();
  if(selectedTrophyCategory === "Todas" || !grouped[selectedTrophyCategory]){
    return grouped;
  }
  return { [selectedTrophyCategory]: grouped[selectedTrophyCategory] };
}

function getTrophyMapLayout(entries){
  const byCategory = Object.fromEntries(entries.map(entry => [entry.category, entry]));
  const rows = [
    ["Campanha", "Combate"],
    ["Colecao", "Chefes"],
    ["Dungeon", "Arena"],
    ["Economia", "Equipamentos"],
    ["Classes", "Sobrevivencia"]
  ];
  const hotspots = rows.flatMap((row, rowIndex) => row.map((category, sideIndex) => ({
    entry: byCategory[category],
    className: `pos-${sideIndex === 0 ? "left" : "right"}-${rowIndex + 1}`
  }))).filter(item => item.entry);
  return { rows, hotspots, byCategory };
}

function getTrophyEntryTooltip(entry){
  if(!entry){ return ""; }
  const label = entry.category === "Todas" ? "Total geral" : entry.category;
  return `${label}: ${entry.completed}/${entry.total} conquistas (${entry.percent}%)`;
}

function getTrophyHoverAttrs(entry){
  const tooltip = getTrophyEntryTooltip(entry);
  return `data-trophy-tooltip="${escapeHtml(tooltip)}"`;
}

function getTrophyPopupElement(){
  let popup = document.getElementById("trophyCategoryPopup");
  if(!popup){
    popup = document.createElement("div");
    popup.id = "trophyCategoryPopup";
    popup.className = "trophy-hover-popup";
    document.body.appendChild(popup);
  }
  return popup;
}

function moveTrophyCategoryPopup(event){
  const popup = document.getElementById("trophyCategoryPopup");
  if(!popup || popup.hidden){ return; }
  const gap = 12;
  const rect = popup.getBoundingClientRect();
  const left = Math.min(window.innerWidth - rect.width - gap, Math.max(gap, event.clientX - (rect.width / 2)));
  const top = Math.max(gap, event.clientY - rect.height - gap);
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function showTrophyCategoryPopup(event, text){
  const popup = getTrophyPopupElement();
  popup.textContent = text;
  popup.hidden = false;
  popup.classList.add("visible");
  moveTrophyCategoryPopup(event);
}

function hideTrophyCategoryPopup(){
  const popup = document.getElementById("trophyCategoryPopup");
  if(!popup){ return; }
  popup.hidden = true;
  popup.classList.remove("visible");
}

function renderTrophyGroups(){
  return Object.entries(getVisibleTrophyCategories()).map(([category, trophies]) => {
    const completed = trophies.filter(trophy => trophy.done).length;
    return `<div class="trophy-category"><div class="panel-header"><strong>${category}</strong><span class="coin-badge">${completed}/${trophies.length}</span></div><div class="trophy-list">${trophies.map(trophy => `<div class="trophy-item ${trophy.done ? "" : "locked"}"><strong>${trophy.name}</strong><br><span class="lock-note">${trophy.description}</span></div>`).join("")}</div></div>`;
  }).join("");
}

function renderTrophyCategorySelector(categorySummary, overall){
  const entries = [
    {
      category: "Todas",
      completed: getTrophies().filter(trophy => trophy.done).length,
      total: getTrophies().length,
      percent: overall
    },
    ...categorySummary
  ];
  const layout = getTrophyMapLayout(entries);
  const allEntry = entries.find(entry => entry.category === "Todas");
  return `
    <div class="trophy-category-map">
      <img class="trophy-category-map-image" src="assets/visual/maps/trophy-categories.webp?v=${TROPHY_CATEGORY_ASSET_VERSION}" alt="Mapa visual das categorias de trofeus" />
      <div class="trophy-category-hotspots">
        ${layout.hotspots.map(({ entry, className }) => `
          <button class="trophy-category-hotspot ${className} ${selectedTrophyCategory === entry.category ? "active" : ""}" ${getTrophyHoverAttrs(entry)} onclick="setTrophyCategory('${escapeJsString(entry.category)}')" aria-label="Filtrar ${escapeHtml(entry.category)}"></button>`).join("")}
        ${allEntry ? `<button class="trophy-category-hotspot pos-all ${selectedTrophyCategory === allEntry.category ? "active" : ""}" ${getTrophyHoverAttrs(allEntry)} onclick="setTrophyCategory('Todas')" aria-label="Filtrar todas as conquistas"></button>` : ""}
      </div>
      ${allEntry ? `<button class="trophy-overall-percent ${selectedTrophyCategory === allEntry.category ? "active" : ""}" ${getTrophyHoverAttrs(allEntry)} onclick="setTrophyCategory('Todas')" aria-label="Filtrar todas as conquistas"><strong>${allEntry.percent}%</strong></button>` : ""}
      <div class="trophy-category-percent-list">
        ${layout.hotspots.map(({ entry, className }) => `
          <button class="trophy-category-percent pct-${className.replace("pos-", "")} ${selectedTrophyCategory === entry.category ? "active" : ""}" ${getTrophyHoverAttrs(entry)} onclick="setTrophyCategory('${escapeJsString(entry.category)}')" aria-label="Filtrar ${escapeHtml(entry.category)}"><strong>${entry.percent}%</strong></button>`).join("")}
      </div>
    </div>`;
}

function renderTrophySummaryPanel(){
  const categorySummary = getTrophyCategorySummary();
  const overall = getTrophyCompletion();
  return `
    <h3>Resumo das conquistas</h3>
    ${renderTrophyCategorySelector(categorySummary, overall)}`;
}
