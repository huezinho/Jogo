/* Loaded before game.js: no player, DOM or storage is accessed until a method is called. */
const EquipmentSystem = (function(){
  const callbacks = new WeakMap();
  const ui = { region: "" };
  const statKeys = ["bonusHp", "bonusMp", "bonusAttack", "skillPower", "flatReduction", "shieldPowerPercent", "healPowerPercent"];
  const zeroBonuses = () => ({ bonusHp: 0, bonusMp: 0, bonusAttack: 0, skillPower: 0, bonusHpPercent: 0, bonusMpPercent: 0, totalDamagePercent: 0, bonusAttackPercent: 0, skillPowerPercent: 0, flatReductionPercent: 0, dotDamagePercent: 0, shieldPowerPercent: 0, healPowerPercent: 0, critChanceBonus: 0, critDamageBonus: 0, armorPenetrationPercent: 0 });
  const slug = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const copy = value => JSON.parse(JSON.stringify(value));
  const clampInt = (value, min, max) => Math.min(max, Math.max(min, Math.floor(Number(value) || 0)));
  const actorNow = actor => actor || (typeof player !== "undefined" ? player : null);
  const regionNames = () => Object.keys(regions);
  const rarityRank = rarity => Object.keys(EquipmentData.rarityFactors).indexOf(rarity);
  const notify = message => { if(typeof log === "function") log(message); };
  const changed = () => { if(typeof updateUI === "function") updateUI(); if(typeof saveCampaign === "function") saveCampaign(); };
  function unlockedRegions(actor){
    actor = actorNow(actor);
    return regionNames().filter((region, index, all) => index === 0 || Number(actor?.stats?.regionBossKills?.[all[index - 1]]) > 0);
  }
  function isRegionUnlocked(region, actor){ return unlockedRegions(actor).includes(region); }
  function getDefinition(region, slot, className){
    if(slot === "accessory" && EquipmentData.sets[region]) return { templateId: `v2_${slug(region)}_accessory`, slot, classRestriction: null, regionName: region, setId: null, setName: null, name: typeof bossAccessoryProfiles !== "undefined" ? bossAccessoryProfiles[region]?.name || `Reliquia de ${region}` : `Reliquia de ${region}` };
    if(!EquipmentData.sets[region] || !EquipmentData.slots.includes(slot)) return null;
    if(slot === "weapon" && !Object.prototype.hasOwnProperty.call(EquipmentData.weaponNames, className)) return null;
    const set = EquipmentData.sets[region];
    const restriction = slot === "weapon" ? className : null;
    return { templateId: `v2_${slug(region)}_${slot}_${restriction ? slug(restriction) : "all"}`, slot, classRestriction: restriction, regionName: region, setId: `${set.id}_v2`, setName: set.name, name: `${restriction ? EquipmentData.weaponNames[restriction] : EquipmentData.slotNames[slot]} - ${set.name}` };
  }
  function heroLevel(actor){ return clampInt(actorNow(actor)?.level || 1, 1, 100); }
  function budgetFor(region, weight, rarity, actor){
    return (1 + heroLevel(actor) * .5) * weight * EquipmentData.rarityFactors[rarity];
  }
  function statProfile(region, slot, className){
    const profile = EquipmentData.regionStats[region];
    if(slot !== "weapon") return profile;
    const damage = Object.fromEntries(Object.entries(profile).filter(([key]) => ["bonusAttack", "skillPower"].includes(key)));
    const total = Object.values(damage).reduce((sum, value) => sum + value, 0);
    return total ? Object.fromEntries(Object.entries(damage).map(([key, value]) => [key, value / total])) : EquipmentData.weaponFallback[className];
  }
  function createItem(region, slot, className, rarity = "comum", actor){
    if(slot === "accessory") return createBossAccessory(region, rarity, actor);
    const definition = getDefinition(region, slot, className);
    if(!definition || !EquipmentData.regionStats[region] || !Object.prototype.hasOwnProperty.call(EquipmentData.rarityFactors, rarity)) return null;
    const budget = budgetFor(region, EquipmentData.slotWeights[slot], rarity, actor);
    const stats = {};
    for(const [key, share] of Object.entries(statProfile(region, slot, className))){
      const value = budget * share * EquipmentData.statValues[key];
      if(value > 0) stats[key] = key.endsWith("Percent") ? Math.floor(value * 10000) / 10000 : Math.floor(value);
    }
    const label = typeof rarityData !== "undefined" ? rarityData[rarity]?.label : rarity;
    return { ...definition, id: `${definition.templateId}_${rarity}`, baseItemId: definition.templateId, type: "equipment", schemaVersion: 2, rarity, rarityLabel: label || rarity, name: `${definition.name} ${label || rarity}`, scaledHeroLevel: heroLevel(actor), stats: copy(stats), ...stats, budget: Math.floor(budget * 100) / 100 };
  }
  function createBossAccessory(region, rarity = "rara", actor){
    const definition = getDefinition(region, "accessory", null), factor = EquipmentData.rarityFactors[rarity];
    if(!definition || !Object.prototype.hasOwnProperty.call(EquipmentData.rarityFactors, rarity)) return null;
    const budget = budgetFor(region, .6, rarity, actor);
    // Forty percent of the accessory budget buys plain stats; the remainder is reserved for its bounded boss effect.
    const stats = { bonusHp: Math.floor(budget * .2 * EquipmentData.statValues.bonusHp), bonusMp: Math.floor(budget * .2 * EquipmentData.statValues.bonusMp) };
    for(const [key, base] of Object.entries(EquipmentData.accessoryEffects[region] || {})){
      const value = Math.min(EquipmentData.accessoryRegionEffectCaps[region]?.[key] ?? EquipmentData.accessoryEffectCaps[key], base * factor * 3);
      stats[key] = key === "flatReduction" ? Math.floor(value) : Math.floor(value * 10000) / 10000;
    }
    const label = typeof rarityData !== "undefined" ? rarityData[rarity]?.label : rarity;
    return { ...definition, id: `${definition.templateId}_${rarity}`, baseItemId: definition.templateId, type: "equipment", schemaVersion: 2, rarity, rarityLabel: label || rarity, uniqueEffectId: `boss_${slug(region)}`, name: `${definition.name} ${label || rarity}`, scaledHeroLevel: heroLevel(actor), stats: copy(stats), ...stats, budget: Math.floor(budget * 100) / 100 };
  }
  function normalizeItem(item, actor){
    if(!item || item.type !== "equipment") return null;
    const expected = createItem(item.regionName, item.slot, item.classRestriction || actorNow(actor)?.class, item.rarity, actor);
    if(!expected) return null;
    if(item.uid) expected.uid = String(item.uid).slice(0, 160);
    expected.qty = clampInt(item.qty || 1, 1, 9999);
    if(item.favorite) expected.favorite = true;
    return expected;
  }
  function sanitizeNetworkItem(item, className){
    const normalized = normalizeItem(item);
    if(!normalized || (normalized.slot === "weapon" && normalized.classRestriction !== className)) return null;
    return normalized;
  }
  function getMaterials(enemyName, region){
    const data = regions[region];
    if(!data) return [];
    const templates = [...data.enemies, data.boss];
    const index = templates.findIndex(entry => entry.name === enemyName);
    if(index < 0) return [];
    const material = typeof enemyMaterialDrops !== "undefined" ? enemyMaterialDrops[enemyName] : null;
    const common = { type: "material", enemyName, regionName: region, region, isBossMaterial: index === templates.length - 1 };
    const primary = { ...common, id: material?.id || `parte_${slug(enemyName)}`, name: material?.name || `Parte de ${enemyName}`, description: material?.description || `Componente de ${enemyName}, usado em equipamentos de ${region}.`, materialTier: "primary" };
    const secondary = { ...common, id: `componente_${slug(enemyName)}`, name: EquipmentData.secondaryMaterials[region]?.[index] || `Essencia de ${enemyName}`, description: `Segundo componente de ${enemyName}. Usado em receitas de ${region} e trocas do mercenario.`, materialTier: "secondary" };
    return [primary, secondary];
  }
  function allMaterials(){
    return regionNames().flatMap(region => [...regions[region].enemies, regions[region].boss].flatMap(enemy => getMaterials(enemy.name, region)));
  }
  function materialById(id){ return allMaterials().find(entry => entry.id === id) || null; }
  function rollDrops(enemy){
    if(!enemy?.region) return [];
    const name = enemy.baseName || String(enemy.name || "").replace(/ Lv\.\d+$/, "");
    const materials = getMaterials(name, enemy.region);
    const result = [];
    for(let index = 0; index < materials.length; index++){
      const chance = enemy.isBoss ? (index ? .55 : .65) : (index ? .24 : .4);
      if(Math.random() < chance){
        const roll = Math.random();
        result.push({ ...materials[index], qty: enemy.isBoss || index ? 1 : roll < .05 ? 3 : roll < .2 ? 2 : 1 });
      }
    }
    return result;
  }
  function inventoryCount(actor, id){ return (actor?.inventory || []).reduce((n, entry) => n + (entry.id === id ? clampInt(entry.qty || 1, 1, 999999) : 0), 0); }
  function recipeFor(region, slot, className, rarity, actor){
    const result = createItem(region, slot, className, rarity, actor);
    if(!result) return null;
    const names = regionNames(), rank = rarityRank(rarity);
    const weight = slot === "accessory" ? .6 : EquipmentData.slotWeights[slot];
    const premium = slot === "accessory" ? 2 : 1;
    const tier = slot === "accessory" ? 4 : ["feet", "head", "legs", "chest", "weapon"].indexOf(slot);
    const factor = EquipmentData.rarityFactors[rarity];
    // Ordered by encounter difficulty and material rarity; heavier pieces use later entries.
    const poolFor = r => {
      const enemies = [...regions[r].enemies, regions[r].boss];
      const pairs = enemies.map(enemy => getMaterials(enemy.name, r));
      return [pairs[0][0], pairs[1][0], pairs[0][1], pairs[2][0], pairs[1][1], pairs[2][1], pairs[3][0], pairs[3][1]];
    };
    const req = {}, localRequirements = {}, regionalRequirements = {};
    const add = (material, qty, group) => {
      group[material.id] = (group[material.id] || 0) + qty;
      req[material.id] = (req[material.id] || 0) + qty;
    };
    const local = poolFor(region), start = Math.min(6, tier + Math.floor(rank / 2));
    add(local[start], Math.ceil(8 * weight * factor * premium), localRequirements);
    add(local[start + 1], Math.ceil(5 * weight * factor * premium), localRequirements);
    if(rank > 0){
      const band = names.slice((rank - 1) * 3, rank * 3);
      for(const r of band){
        const pool = poolFor(r), preferred = Math.min(7, tier + rank - 1);
        // If the item region is inside the band, keep this extra component distinct from its two local components.
        const material = [...pool.slice(preferred), ...pool.slice(0, preferred).reverse()].find(entry => !req[entry.id]);
        add(material, Math.ceil(3 * weight * factor * premium), regionalRequirements);
      }
    }
    const id = `${result.templateId}|${rarity}`;
    return { id, region, slot, className: result.classRestriction, rarity, cost: Math.ceil(270 * [1, 6, 20, 60, 280][rank] * (slot === "accessory" ? 4 : 1) * (slot === "weapon" ? 1.25 : slot === "chest" ? 1.18 : 1)), requirements: req, localRequirements, regionalRequirements, result };
  }
  function getRecipes(actor, options = {}){
    actor = actorNow(actor);
    if(!actor) return [];
    const list = [];
    for(const region of unlockedRegions(actor)){
      if(options.region && options.region !== region) continue;
      for(const slot of EquipmentData.slots){
        if(options.slot && options.slot !== slot) continue;
        if(options.rarity && options.rarity !== "comum") continue;
        list.push(recipeFor(region, slot, actor.class, "comum", actor));
      }
    }
    return list;
  }
  function recipeById(id, actor){ return getRecipes(actor).find(recipe => recipe.id === id) || null; }
  function ownsRecipeItem(recipe, actor){
    actor = actorNow(actor);
    const template = recipe?.result?.templateId;
    return !!(actor && template && [...(actor.inventory || []), ...Object.values(actor.equipment || {})].some(item => item?.type === "equipment" && (item.templateId || item.baseItemId) === template));
  }
  function canCraft(recipe, actor){
    actor = actorNow(actor);
    return !!(actor && recipe && !ownsRecipeItem(recipe, actor) && isRegionUnlocked(recipe.region, actor) && actor.coins >= recipe.cost && Object.entries(recipe.requirements).every(([id, qty]) => inventoryCount(actor, id) >= qty));
  }
  function removeMaterials(actor, requirements){
    for(const [id, qty] of Object.entries(requirements)){
      let left = qty;
      for(let i = actor.inventory.length - 1; i >= 0 && left > 0; i--){
        const entry = actor.inventory[i]; if(entry.id !== id) continue;
        const count = entry.qty || 1, removed = Math.min(count, left); left -= removed;
        if(count === removed) actor.inventory.splice(i, 1); else entry.qty = count - removed;
      }
    }
  }
  function craft(id){
    const actor = actorNow();
    if(!actor || currentMode !== "village" || isProcessingTurn || isDead) return false;
    const recipe = recipeById(id, actor);
    if(ownsRecipeItem(recipe, actor)){ notify("Voce ja possui esta peca na bolsa ou equipada. Venda a peca para fabricar outra."); return false; }
    if(!canCraft(recipe, actor)){ notify("Receita indisponivel, moedas ou materiais insuficientes. Troque materiais de outras regioes com o mercenario."); return false; }
    // All checks precede mutation; material requirements are canonical, never accepted from the caller.
    removeMaterials(actor, recipe.requirements); actor.coins -= recipe.cost;
    const item = addInventoryItem(copy(recipe.result));
    actor.stats.craftedEquipment = (actor.stats.craftedEquipment || 0) + 1;
    notify(`O artesao criou ${item.name}.`);
    if(typeof triggerInventoryFlash === "function") triggerInventoryFlash(item, "success");
    changed(); return item;
  }
  function refreshEquipmentStats(actor){
    actor = actorNow(actor); if(!actor) return;
    for(const slot of Object.keys(actor.equipment || {})) if(actor.equipment[slot]) actor.equipment[slot] = normalizeItem(actor.equipment[slot], actor);
    actor.inventory = (actor.inventory || []).map(item => item.type === "equipment" ? normalizeItem(item, actor) || item : item);
  }
  function normalizePlayer(actor){
    if(!actor) return;
    actor.stats = actor.stats || {};
    actor.inventory = Array.isArray(actor.inventory) ? actor.inventory : [];
    actor.equipment = actor.equipment && typeof actor.equipment === "object" ? actor.equipment : {};
    normalizeMercenary(actor);
    refreshEquipmentStats(actor);
  }
  function getSetBonuses(actor){
    actor = actorNow(actor); const bonuses = zeroBonuses(), found = {}, seen = new Set();
    for(const slot of EquipmentData.slots){
      const item = actor?.equipment?.[slot];
      if(!item || item.slot !== slot || !item.setId || !EquipmentData.sets[item.regionName]) continue;
      if(item.uid && seen.has(item.uid)) continue;
      if(item.uid) seen.add(item.uid);
      const def = EquipmentData.sets[item.regionName];
      const validIds = [`${def.id}_v2`, `${slug(item.regionName)}_set`];
      if(!validIds.includes(item.setId)) continue;
      found[item.regionName] = (found[item.regionName] || 0) + 1;
    }
    const sets = [];
    for(const [region, count] of Object.entries(found)){
      const def = EquipmentData.sets[region];
      if(count >= 2) for(const [key, value] of Object.entries(def.bonuses2)) bonuses[key] = (bonuses[key] || 0) + value;
      if(count >= 4) for(const [key, value] of Object.entries(def.bonuses4)) bonuses[key] = (bonuses[key] || 0) + value;
      sets.push({ id: def.id, region, count, setName: def.name, name: def.name, text: `${count}/5 | 2: ${def.two} | 4: ${def.four} | 5: ${def.five}`, complete: count >= 5 });
    }
    return { bonuses, sets, activeSets: sets.filter(set => set.complete) };
  }
  function setCount(actor, region){ return getSetBonuses(actor).sets.find(set => set.region === region)?.count || 0; }
  function describe(item, actor){
    item = normalizeItem(item, actor);
    if(!item) return "Equipamento invalido.";
    const labels = { bonusHp: "vida", bonusMp: "mana", bonusAttack: "ataque", skillPower: "poder de habilidade", flatReduction: "reducao fixa de dano", shieldPowerPercent: "potencia de escudo", healPowerPercent: "potencia de cura" };
    const parts = statKeys.filter(key => item[key] > 0).map(key => `+${key.endsWith("Percent") ? `${Number((item[key] * 100).toFixed(2))}%` : item[key]} ${labels[key]}`);
    const set = EquipmentData.sets[item.regionName];
    if(item.slot === "accessory"){
      const effects = { reflectPercent: "reflexao", coinBonus: "moedas", xpBonus: "XP", turnHealPercent: "cura por turno", burnDamageReductionPercent: "resistencia a queimadura", flatReduction: "reducao fixa", bonusMpPercent: "mana maxima", bonusHpPercent: "vida maxima", totalDamagePercent: "dano total", fatalSaveHealPercent: "cura ao evitar um golpe fatal (1x por combate)", critChanceBonus: "critico" };
      for(const [key, label] of Object.entries(effects)) if(key !== "flatReduction" && item[key] > 0) parts.push(`+${key === "flatReduction" ? item[key] : `${Number((item[key] * 100).toFixed(2))}%`} ${label}`);
      parts.push(`Reliquia do chefe de ${item.regionName}; nao conta para o conjunto`);
    }else if(set){ parts.push(`${set.name} ${setCount(actorNow(actor), item.regionName)}/5`); parts.push(`2 pecas: ${set.two}; 4 pecas: ${set.four}; 5 pecas: ${set.five}`); }
    parts.push(`Escala com o heroi: nivel ${item.scaledHeroLevel}. ${item.classRestriction ? `Arma de ${item.classRestriction}` : "Qualquer classe"}.`);
    return parts.join(". ");
  }
  function setArtisanFilter(field, value){
    if(field === "region" && isRegionUnlocked(value)) ui.region = value;
    if(typeof updateUI === "function") updateUI();
  }
  function renderArtisan(){
    const actor = actorNow(), unlocked = unlockedRegions(actor);
    if(!actor || !unlocked.length) return "";
    if(!unlocked.includes(ui.region)) ui.region = unlocked.includes(typeof artisanRegionFilter !== "undefined" ? artisanRegionFilter : "") ? artisanRegionFilter : unlocked[0];
    const recipes = getRecipes(actor, { region: ui.region });
    const set = EquipmentData.sets[ui.region];
    return `<div class="equipment-workshop"><div class="panel-header"><strong>Artesao</strong><span class="coin-badge">${actor.coins} moedas</span></div><p class="lock-note">Fabrique pecas das regioes desbloqueadas. Receitas mais fortes usam componentes de outras regioes; o mercenario oferece esses materiais sem liberar a regiao.</p>
      <div class="region-map-frame crafting-region-map"><img class="region-map-image" src="assets/visual/maps/region-map.webp" alt="Mapa das regioes de equipamentos">${regionNames().map((region,index)=>{const marker=REGION_MAP_MARKERS[region]||{x:50,y:50};return `<button class="region-map-marker action-btn ${ui.region===region?'active':''}" style="--x:${marker.x}%;--y:${marker.y}%" aria-label="Equipamentos de ${escape(region)}" onclick="EquipmentSystem.setArtisanFilter('region','${region}')" ${unlocked.includes(region)?'':'disabled'}>${index+1}<span class="map-marker-label">${escape(region)}</span></button>`;}).join('')}</div><h3>${escape(ui.region)} — ${escape(set.name)}</h3><p>Os atributos sao proprios deste conjunto. Fabricacao sempre comum. Melhore no ferreiro: comum → incomum → rara → ultrarrara → lendaria.</p>
      <details class="equipment-set-detail"><summary>${escape(set.name)} â€” bonus de 2, 4 e 5 pecas</summary><p><strong>2:</strong> ${escape(set.two)}<br><strong>4:</strong> ${escape(set.four)}<br><strong>5:</strong> ${escape(set.five)}</p><p class="lock-note">Poder combinado = ataque + poder de habilidade. Acessorio nao conta como peca.</p></details>
      <div class="equipment-recipes">${recipes.map(recipe => `<article class="equipment-recipe"><strong>${escape(recipe.result.name)}</strong><p class="lock-note">${escape(describe(recipe.result, actor))}</p><ul class="recipe-materials">${Object.entries(recipe.requirements).map(([id, qty]) => { const material = materialById(id), owned = inventoryCount(actor, id), foreign = material?.regionName !== recipe.region; return `<li class="${owned >= qty ? "material-ready" : "material-missing"}"><span>${escape(material?.name || id)}${foreign ? ` <small>(${escape(material?.regionName)})</small>` : ""}</span><strong>${owned}/${qty}</strong></li>`; }).join("")}</ul><button onclick="EquipmentSystem.craft('${recipe.id}')" ${canCraft(recipe, actor) ? "" : "disabled"}>Fabricar â€” ${recipe.cost} moedas</button></article>`).join("")}</div></div>`;
  }
  function hash(value){ let result = 2166136261; for(const c of String(value)) result = Math.imul(result ^ c.charCodeAt(0), 16777619); return result >>> 0; }
  const validContractId = value => typeof value === "string" && /^contract_\d{1,12}_\d{1,10}_[0-5]$/.test(value);
  function contractRewards(quest, actor){
    actor = actorNow(actor);
    const unlocked = unlockedRegions(actor);
    const region = unlocked.includes(quest.payoutRegion) ? quest.payoutRegion : unlocked.includes(typeof currentRegion !== "undefined" ? currentRegion : "") ? currentRegion : quest.targetRegion;
    const rank = Math.max(1, regionNames().indexOf(region) + 1);
    const difficulty = quest.count >= 16 ? "Dificil" : quest.count >= 10 ? "Media" : "Simples";
    const factor = { Simples: 1, Media: 2, Dificil: 3 }[difficulty];
    return { payoutRegion: region, difficulty, rewardGold: Math.floor(120 * Math.pow(1.5, rank - 1) * factor), rewardXp: Math.floor(60 * Math.pow(1.5, rank - 1) * factor) };
  }
  function normalizeMercenary(actor){
    const saved = actor.mercenary && typeof actor.mercenary === "object" ? actor.mercenary : {};
    const claimed = Array.isArray(saved.claimed) ? [...new Set(saved.claimed.filter(validContractId))].slice(-256) : [];
    const active = [], seen = new Set();
    for(const quest of Array.isArray(saved.active) ? saved.active : []){
      if(!quest || !validContractId(quest.id) || seen.has(quest.id) || claimed.includes(quest.id) || !isRegionUnlocked(quest.targetRegion, actor) || !regions[quest.targetRegion]?.enemies?.some(enemy => enemy.name === quest.targetName)) continue;
      const reward = materialById(quest.rewardId);
      if(!reward || reward.regionName === quest.targetRegion) continue;
      const count = clampInt(quest.count, 1, 100);
      active.push({ ...contractRewards(quest, actor), id: quest.id, targetRegion: quest.targetRegion, targetName: quest.targetName, count, progress: clampInt(quest.progress, 0, count), rewardId: reward.id, rewardQty: clampInt(quest.rewardQty, 1, reward.isBossMaterial ? 1 : 5), acceptedAt: clampInt(quest.acceptedAt, 0, Number.MAX_SAFE_INTEGER) });
      seen.add(quest.id);
      if(active.length >= EquipmentData.maxActiveContracts) break;
    }
    // Offers are rebuilt from the catalogue and current rotation, never rendered from imported JSON.
    actor.mercenary = { version: 1, boardCycle: Number.isSafeInteger(saved.boardCycle) ? saved.boardCycle : -1, unlockSignature: "", offers: [], active, claimed, completed: clampInt(saved.completed, 0, 1000000000) };
    return actor.mercenary;
  }
  function refreshContracts(actor, now = Date.now()){
    actor = actorNow(actor); if(!actor) return null;
    const state = normalizeMercenary(actor), cycle = Math.floor(now / EquipmentData.boardIntervalMs), unlocked = unlockedRegions(actor);
    const signature = unlocked.join("|");
    if(state.boardCycle === cycle && state.unlockSignature === signature && state.offers.length) return state;
    state.boardCycle = cycle; state.unlockSignature = signature;
    const names = regionNames(), highest = Math.max(...unlocked.map(region => names.indexOf(region)));
    const targets = unlocked.flatMap(region => regions[region].enemies.map(enemy => ({ region, name: enemy.name })));
    const rewardRegions = [...new Set([names[highest + 1], names[highest + 2], ...unlocked.slice().reverse()].filter(Boolean))];
    const targetOffset = hash(`${actor.characterId || actor.class}:${cycle}:${signature}`) % targets.length;
    state.offers = Array.from({ length: 6 }, (_, index) => {
      const seed = hash(`${actor.characterId || actor.class}:${cycle}:${signature}:${index}`), target = targets[(targetOffset + index) % targets.length];
      const foreign = rewardRegions.filter(region => region !== target.region);
      const rewardRegion = foreign[index % foreign.length] || names.find(region => region !== target.region);
      const pool = [...regions[rewardRegion].enemies, regions[rewardRegion].boss].flatMap(enemy => getMaterials(enemy.name, rewardRegion));
      const reward = pool[seed % pool.length], targetDef=regions[target.region].enemies.find(e=>e.name===target.name);
      const gap=Math.max(0,names.indexOf(rewardRegion)-names.indexOf(target.region));
      const targetRank=regions[target.region].enemies.indexOf(targetDef);
      const count=4+targetRank*2+gap*3+(reward.isBossMaterial?8:reward.materialTier==='secondary'?3:0);
      const rewardQty=reward.isBossMaterial?1:Math.min(5,1+Math.floor((count*(1+targetRank*.35))/(6+gap*4)));
      return { ...contractRewards({ count, targetRegion: target.region }, actor), id: `contract_${cycle}_${hash(signature)}_${index}`, targetRegion: target.region, targetName: target.name, count, rewardRegion, rewardId:reward.id,rewardQty,difficulty:count>=16?'Dificil':count>=10?'Media':'Simples', offeredAt: cycle * EquipmentData.boardIntervalMs, expiresAt: (cycle + 1) * EquipmentData.boardIntervalMs };
    });
    return state;
  }
  function acceptContract(id){
    const actor = actorNow();
    if(!actor || currentMode !== "village" || isDead || isProcessingTurn) return false;
    const state = refreshContracts(actor), offer = state.offers.find(entry => entry.id === id);
    if(!offer || !isRegionUnlocked(offer.targetRegion, actor) || state.active.length >= EquipmentData.maxActiveContracts || state.active.some(entry => entry.id === id) || state.claimed.includes(id)) return false;
    state.active.push({ ...contractRewards(offer, actor), id: offer.id, targetRegion: offer.targetRegion, targetName: offer.targetName, count: offer.count, progress: 0, rewardId: offer.rewardId, rewardQty: offer.rewardQty, acceptedAt: Date.now() });
    notify(`Contrato aceito: derrote ${offer.count} ${offer.targetName} em ${offer.targetRegion}.`); changed(); return true;
  }
  function recordKill(enemy, actor){
    actor = actorNow(actor); if(!actor || !enemy) return;
    const name = enemy.baseName || String(enemy.name || "").replace(/ Lv\.\d+$/, ""), region = enemy.region || enemy.regionName;
    const state = normalizeMercenary(actor);
    for(const quest of state.active) if(quest.targetName === name && quest.targetRegion === region && isRegionUnlocked(region, actor) && quest.progress < quest.count) quest.progress++;
    collectCompletedContracts(actor);
  }
  function settleContract(id, actor){
    const state = normalizeMercenary(actor), index = state.active.findIndex(entry => entry.id === id);
    if(index < 0 || state.claimed.includes(id)) return false;
    const quest = state.active[index], material = materialById(quest.rewardId);
    if(quest.progress < quest.count || !material) return false;
    // Remove and mark before delivering. Repeated clicks cannot grant the same reward twice.
    state.active.splice(index, 1); state.claimed.push(id); state.claimed = state.claimed.slice(-256); state.completed++;
    let reward;
    if(actor === actorNow()) reward = addInventoryItem({ ...material, qty: quest.rewardQty });
    else{
      reward = actor.inventory.find(item => item.type === "material" && item.id === material.id);
      if(reward) reward.qty = (reward.qty || 1) + quest.rewardQty;
      else{ reward = { ...copy(material), qty: quest.rewardQty, uid: `${material.id}_${Date.now()}_${Math.floor(Math.random()*1000000)}` }; actor.inventory.push(reward); }
    }
    const payment = contractRewards(quest, actor);
    actor.coins = (actor.coins || 0) + payment.rewardGold;
    actor.stats.coinsEarned = (actor.stats.coinsEarned || 0) + payment.rewardGold;
    if(actor === actorNow() && typeof gainXP === "function") gainXP(payment.rewardXp);
    else actor.xp = (actor.xp || 0) + payment.rewardXp;
    actor.stats.mercenaryContracts = state.completed;
    if(actor === actorNow()){
      notify(`Contrato concluido: ${quest.targetName}. ${reward.name} x${quest.rewardQty}, ${payment.rewardGold} ouro e ${payment.rewardXp} XP base recebidos automaticamente.`);
      if(typeof showGameNotice === "function") showGameNotice("Contrato concluído!", `${quest.targetName}: ${quest.count} derrotados. Recebido: ${reward.name} ×${quest.rewardQty}, ${payment.rewardGold} ouro e ${payment.rewardXp} XP base.`);
      if(typeof queueCampaignSave === "function") queueCampaignSave();
    }
    return reward;
  }
  function collectCompletedContracts(actor){
    actor = actorNow(actor); if(!actor) return [];
    const ready = normalizeMercenary(actor).active.filter(quest => quest.progress >= quest.count).map(quest => quest.id);
    return ready.map(id => settleContract(id, actor)).filter(Boolean);
  }
  function claimContract(id){
    const actor = actorNow();
    if(!actor || currentMode !== "village" || isDead || isProcessingTurn) return false;
    const reward = settleContract(id, actor);
    if(reward) changed();
    return reward;
  }
  function abandonContract(id){
    const actor = actorNow(); if(!actor || currentMode !== "village" || isDead || isProcessingTurn) return false;
    const state = normalizeMercenary(actor), index = state.active.findIndex(entry => entry.id === id);
    if(index < 0) return false; state.active.splice(index, 1); changed(); return true;
  }
  function renderMercenary(){
    const actor = actorNow(), state = refreshContracts(actor); if(!state) return "";
    const remaining = Math.max(0, (state.boardCycle + 1) * EquipmentData.boardIntervalMs - Date.now());
    return `<div class="mercenary-panel"><div class="panel-header"><strong>Mercenario â€” Contratos de Caca</strong><span class="coin-badge">${state.active.length}/${EquipmentData.maxActiveContracts} ativos</span></div><p class="lock-note">Os alvos ficam apenas em regioes desbloqueadas. A recompensa e fixa e considera o alvo, a quantidade de abates e a origem do componente. Materiais recebidos nao desbloqueiam regioes ou receitas.</p><p class="mercenary-timer">Novas ofertas em <strong>${Math.ceil(remaining / 60000)} min</strong>. Contratos aceitos continuam ativos depois da troca do quadro.</p>
      <h4>Seus contratos</h4>${state.active.length ? state.active.map(quest => { const material = materialById(quest.rewardId); return `<article class="mercenary-contract"><strong>${escape(quest.targetName)} â€” ${escape(quest.targetRegion)}</strong><p>Derrotados: ${quest.progress}/${quest.count}</p><p>Pagamento: ${quest.rewardGold} ouro, ${quest.rewardXp} XP base e ${escape(material.name)} x${quest.rewardQty} <small>(${escape(material.regionName)})</small></p><div class="button-row"><span>Recompensa entregue automaticamente ao concluir.</span><button onclick="EquipmentSystem.abandonContract('${quest.id}')">Abandonar</button></div></article>`; }).join("") : '<p class="lock-note">Aceite um contrato abaixo para comecar.</p>'}
      <h4>Quadro de ofertas</h4><div class="mercenary-offers">${state.offers.filter(offer => !state.active.some(quest => quest.id === offer.id) && !state.claimed.includes(offer.id)).map(offer => `<article class="mercenary-contract"><strong>Cace ${offer.count} ${escape(offer.targetName)}</strong><p class="lock-note">Local: ${escape(offer.targetRegion)}. Pagamento de ${escape(offer.rewardRegion)}:</p><p>Recompensa: ${offer.rewardGold} ouro, ${offer.rewardXp} XP base e ${escape(materialById(offer.rewardId).name)} x${offer.rewardQty}</p><p class="lock-note">Dificuldade: ${escape(offer.difficulty)}</p><button onclick="EquipmentSystem.acceptContract('${offer.id}')" ${state.active.length >= EquipmentData.maxActiveContracts ? "disabled" : ""}>Aceitar contrato</button></article>`).join("") || '<p>Nenhuma oferta disponivel nesta rotacao.</p>'}</div></div>`;
  }

  function runtime(effects){
    if(!effects.equipmentRuntime || typeof effects.equipmentRuntime !== "object") effects.equipmentRuntime = {};
    const state = effects.equipmentRuntime;
    state.cooldowns = state.cooldowns || {}; state.turn = clampInt(state.turn, 0, 1000000000);
    return state;
  }
  function caps(actor, context){
    const active = actorNow() === actor;
    return { maxHp: context?.maxHp || (active && typeof getCurrentCaps === "function" ? getCurrentCaps().maxHp : actor.maxHp), maxMp: context?.maxMp || (active && typeof getCurrentCaps === "function" ? getCurrentCaps().maxMp : actor.maxMp), power: Math.max(1, context?.power || (active && typeof getActiveAttack === "function" && typeof getSkillPowerBonus === "function" ? getActiveAttack() + getSkillPowerBonus() : actor.attack + (actor.stats?.invested?.skillGain || 0))) };
  }
  function hasDot(target){ return !!target && ((target.burnTurns > 0 && target.burnDamagePerTurn > 0) || (target.poisonTurns > 0 && target.poisonDamagePerTurn > 0) || (target.bleedTurns > 0 && target.bleedDamagePerTurn > 0) || (target.dotTurns > 0 && target.dotDamagePerTurn > 0) || (target.natureMarkTurns > 0 && target.natureMarkDamage > 0) || (target.naturePoisonTurns > 0 && target.naturePoisonDamage > 0) || (target.natureDecayTurns > 0 && target.natureDecayDamage > 0)); }
  function beginAction(actor, effects, context = {}){
    const state = runtime(effects);
    state.turn++; state.dotHealUsed = 0;
    for(const key of Object.keys(state.cooldowns)) state.cooldowns[key] = Math.max(0, (state.cooldowns[key] || 0) - 1);
    if(context.callbacks) callbacks.set(effects, context.callbacks);
    const enemy = context.enemy;
    state.current = { actionId: context.actionId || `${state.turn}`, kind: context.kind || "skill", skillId: context.skill?.id || context.skill?.type || context.kind || "basic", skillType: context.skill?.type || "", damage: 0, healed: 0, shielded: 0, hpBefore: actor.hp, hpCost: 0, targetHadDot: hasDot(enemy), enemyRooted: (enemy?.rootedTurns || 0) > 0, enemyShieldBefore: enemy?.shieldValue || 0, enemyArmorDownBefore: enemy?.armorDownPercent || 0, critical: false, buffs: { ruin: state.ruinReady || 0, paradox: state.paradoxReady || 0, abyss: state.abyssReady || 0, support: state.supportReady || 0 }, penetrationReady: context.kind === "skill" && !!state.critPenReady, costReady: !!state.cycleReady, ...caps(actor, context) };
    return state.current;
  }
  function invoke(actor, effects, target, kind, amount, options = {}){
    amount = Math.max(0, Math.floor(amount)); if(!amount) return 0;
    if(kind === "shield" && actor.noShieldTurns > 0) return 0;
    const handler = callbacks.get(effects)?.[kind];
    if(handler) return handler(amount, { ...options, equipmentProc: true });
    if(kind === "damage" && target){ const damage = options.ignoreShield ? amount : Math.max(0, amount - Math.max(0, target.shieldValue || 0)); if(!options.ignoreShield && target.shieldValue > 0) target.shieldValue = Math.max(0, target.shieldValue - amount); target.hp = Math.max(0, target.hp - damage); return damage; }
    if(kind === "shield"){ effects.shieldValue = (effects.shieldValue || 0) + amount; return amount; }
    if(kind === "heal"){ const before = actor.hp; actor.hp = Math.min(caps(actor).maxHp, actor.hp + amount); return actor.hp - before; }
    return 0;
  }
  function markCritical(actor, effects){ const state = runtime(effects); if(state.current) state.current.critical = true; }
  function afterDamage(actor, effects, target, meta = {}){
    if(meta.equipmentProc || meta.source === "equipment_proc") return;
    const state = runtime(effects), amount = Math.max(0, Number(meta.damage) || 0);
    const periodic = meta.kind === "dot" || meta.source === "dot" || meta.kind === "periodic";
    if(periodic){
      if(setCount(actor, "Necropole") >= 4){ const limit = Math.floor(caps(actor).maxHp * .02), heal = Math.min(Math.floor(amount * .02), Math.max(0, limit - (state.dotHealUsed || 0))); state.dotHealUsed = (state.dotHealUsed || 0) + heal; invoke(actor, effects, target, "heal", heal); }
      return;
    }
    if(state.current){ state.current.damage += amount; if(meta.critical) state.current.critical = true; }
  }
  function afterIncoming(actor, effects, enemy, meta = {}){
    if(meta.equipmentProc || meta.periodic || meta.kind === "dot") return;
    const state = runtime(effects), values = caps(actor);
    if((meta.damage || 0) + (meta.absorbed || 0) <= 0) return;
    if(setCount(actor, "Caverna") >= 5){
      state.stoneHits = (state.stoneHits || 0) + 1;
      if(state.stoneHits >= 3 && !state.cooldowns.stone){ state.stoneHits = 0; state.cooldowns.stone = 3; invoke(actor, effects, enemy, "shield", Math.min(values.maxHp * .08, values.power)); }
    }
    const shieldAbsorbed = meta.shieldAbsorbed ?? (effects.invulnerableTurns > 0 ? 0 : meta.absorbed);
    if(setCount(actor, "Fortaleza") >= 5 && shieldAbsorbed > 0) state.retaliation = Math.min(values.power * .6, (state.retaliation || 0) + shieldAbsorbed * .25);
  }
  function modifyHealing(actor, effects, amount, options = {}){
    const state = runtime(effects), active = getSetBonuses(actor).bonuses;
    let bonus = active.healPowerPercent || 0;
    for(const slot of EquipmentData.slots) bonus += normalizeItem(actor?.equipment?.[slot], actor)?.healPowerPercent || 0;
    const canHeal = typeof options.canHeal === "boolean" ? options.canHeal : actor.hp < caps(actor).maxHp && !(effects.healReductionTurns > 0 && effects.healReductionPercent >= 1);
    if(state.forestReady && amount > 0 && canHeal){ bonus += .2; state.forestReady = false; }
    const result = Math.floor(amount * (1 + bonus)); if(state.current) state.current.healingRequested = result;
    return result;
  }
  function modifyShield(actor, effects, amount, options = {}){
    const state = runtime(effects), active = getSetBonuses(actor).bonuses;
    let bonus = active.shieldPowerPercent || 0;
    for(const slot of EquipmentData.slots) bonus += normalizeItem(actor?.equipment?.[slot], actor)?.shieldPowerPercent || 0;
    if(state.forestReady && amount > 0){ bonus += .2; state.forestReady = false; }
    const result = Math.floor(amount * (1 + bonus));
    if(options.track !== false) noteShield(actor, effects, result);
    return result;
  }
  function noteHealing(actor, effects, amount){ const state = runtime(effects); if(state.current?.kind === "skill" && effects.equipmentAction?.resolving !== false) state.current.healed += Math.max(0, amount); }
  function noteShield(actor, effects, amount){ const state = runtime(effects); if(state.current?.kind === "skill" && effects.equipmentAction?.resolving !== false) state.current.shielded += Math.max(0, amount); }
  function modifySkillCost(actor, effects, skill, cost){
    const state = runtime(effects);
    if(!state.cycleReady || setCount(actor, "Paradoxo") < 5 || !(cost > 0)) return cost;
    // Costs explicitly based on the entire resource are not discounted into a free resource loop.
    const fullResource = ["nature_true_form", "archer_overcharge", "mage_overcharge", "mage_corruption", "mage_demon_form"].includes(skill?.type);
    return fullResource ? cost : Math.max(1, Math.floor(cost * .85));
  }
  function getArmorPenetration(actor, effects){
    const state = runtime(effects), base = getSetBonuses(actor).bonuses.armorPenetrationPercent || 0;
    return Math.min(.95, base + (state.current?.penetrationReady ? .2 : 0));
  }
  function getDotDamageMultiplier(actor){ return 1 + (getSetBonuses(actor).bonuses.dotDamagePercent || 0); }
  function noteDotApplication(actor, effects, target, turnKeys, options = {}){
    if(!actor || !effects || !target) return false;
    const damageFields = { burnTurns: "burnDamagePerTurn", poisonTurns: "poisonDamagePerTurn", bleedTurns: "bleedDamagePerTurn", dotTurns: "dotDamagePerTurn", natureMarkTurns: "natureMarkDamage", naturePoisonTurns: "naturePoisonDamage", natureDecayTurns: "natureDecayDamage" };
    const owner = String(actor.characterId || actor.id || actor.class);
    let applied = false;
    for(const turnKey of Array.isArray(turnKeys) ? turnKeys : [turnKeys]){
      const damageKey = damageFields[turnKey];
      if(!damageKey || !(target[turnKey] > 0) || !(target[damageKey] > 0)) continue;
      target.equipmentDotOwners = target.equipmentDotOwners || {};
      target.equipmentDotExtensions = target.equipmentDotExtensions || {};
      target.equipmentDotOwners[turnKey] = owner;
      target.equipmentDotExtensions[turnKey] = 0;
      applied = true;
    }
    // The caller records an actual application, so a freeze or missed attack cannot steal an existing DOT.
    const state = runtime(effects);
    if(applied && state.current?.kind === "skill" && !options.equipmentProc) state.current.dotApplied = true;
    return applied;
  }
  function endAction(actor, effects, context = {}){
    const state = runtime(effects), current = state.current;
    if(!current) return;
    const target = context.enemy || (typeof enemy !== "undefined" ? enemy : null), counts = Object.fromEntries(getSetBonuses(actor).sets.map(set => [set.region, set.count]));
    const has = (region, n) => (counts[region] || 0) >= n;
    const skill = current.kind === "skill", damage = current.damage;
    const proc = amount => invoke(actor, effects, target, "damage", amount, { ignoreArmor: true });
    // Every direct bonus is budgeted once for the whole chosen action, never once per projectile.
    if(damage > 0){
      let bonus = 0;
      if(has("Ruinas", 4) && current.buffs.ruin){ bonus += damage * .08; state.ruinReady = 0; }
      if(has("Paradoxo", 4) && current.buffs.paradox){ bonus += damage * .08; state.paradoxReady = 0; }
      if(has("Vulcao", 4) && current.targetHadDot) bonus += damage * .08;
      if(has("Cataclismo", 4) && current.hpBefore < current.maxHp * .5) bonus += damage * .1;
      if(has("Abismo", 5) && current.buffs.abyss){ bonus += Math.min(damage * .15, current.power); state.abyssReady = 0; }
      if(has("Panteao", 5) && current.buffs.support){ bonus += current.power * .2; state.supportReady = 0; }
      if(has("Paradoxo", 5) && current.costReady){ bonus += Math.min(damage * .12, current.power); state.cycleReady = false; state.cooldowns.cycle = 4; }
      if(bonus > 0) proc(bonus);
      if(has("Ruinas", 5) && current.buffs.ruin && !state.cooldowns.echo){ proc(Math.min(damage * .25, current.power * .6)); state.cooldowns.echo = 3; }
      if(has("Fortaleza", 5) && state.retaliation > 0 && !state.cooldowns.retaliation){ proc(Math.min(state.retaliation, current.power * .6)); state.retaliation = 0; state.cooldowns.retaliation = 3; }
      if(has("Pantano", 5) && current.targetHadDot && !state.cooldowns.poison && target?.hp > 0){ applyNaturePoison(Math.floor(current.power * .12), 2, {equipmentProc:true}); noteDotApplication(actor, effects, target, ["naturePoisonTurns"], { equipmentProc: true }); state.cooldowns.poison = 3; }
      if(current.penetrationReady) state.critPenReady = false;
    }
    if(skill){
      const different = state.lastSkill && state.lastSkill !== current.skillId;
      if(different && has("Ruinas", 4)) state.ruinReady = 1;
      if(different && has("Paradoxo", 4)) state.paradoxReady = 1;
      if(has("Paradoxo", 5)){
        state.distinctSkills = Array.isArray(state.distinctSkills) ? state.distinctSkills : [];
        if(!state.distinctSkills.includes(current.skillId)) state.distinctSkills.push(current.skillId);
        if(state.distinctSkills.length >= 3 && !state.cooldowns.cycle){ state.cycleReady = true; state.distinctSkills = []; }
      }
      state.lastSkill = current.skillId;
    }
    if(has("Abismo", 5) && target && !state.cooldowns.abyss && ((current.enemyShieldBefore > 0 && !(target.shieldValue > 0)) || (target.armorDownPercent || 0) > current.enemyArmorDownBefore)){ state.abyssReady = 1; state.cooldowns.abyss = 3; }
    if(has("Citadela", 5) && current.critical && !state.cooldowns.critical){ state.critPenReady = true; state.cooldowns.critical = 2; }
    if(has("Panteao", 5) && skill && damage === 0 && current.healed + current.shielded > 0){ state.supportActions = (state.supportActions || 0) + 1; if(state.supportActions >= 3 && !state.cooldowns.support){ state.supportReady = 1; state.supportActions = 0; state.cooldowns.support = 2; } }
    if(has("Cataclismo", 5) && current.hpCost > 0 && !state.cooldowns.sacrifice){ invoke(actor, effects, target, "shield", Math.min(current.hpCost * .5, current.maxHp * .12, current.power * 1.2)); state.cooldowns.sacrifice = 3; }
    if(skill && current.dotApplied && has("Floresta", 5)){ state.dotActions = (state.dotActions || 0) + 1; if(state.dotActions >= 3){ state.forestReady = true; state.dotActions = 0; } }
    if(has("Vulcao", 5) && skill && damage > 0){ state.offensiveActions = (state.offensiveActions || 0) + 1; if(state.offensiveActions >= 3 && !state.cooldowns.burn && target?.hp > 0){ applyBurning(target, Math.floor(current.power * .15), 2, "Brasas Vivas", {equipmentProc:true}); state.offensiveActions = 0; state.cooldowns.burn = 3; } }
    if(has("Necropole", 5) && target && !state.cooldowns.extend){
      const owner = String(actor.characterId || actor.id || actor.class), own = [["burnTurns", "burnDamagePerTurn"], ["poisonTurns", "poisonDamagePerTurn"], ["bleedTurns", "bleedDamagePerTurn"], ["dotTurns", "dotDamagePerTurn"], ["natureMarkTurns", "natureMarkDamage"], ["naturePoisonTurns", "naturePoisonDamage"], ["natureDecayTurns", "natureDecayDamage"]].filter(([turnKey, damageKey]) => target[turnKey] > 0 && target[damageKey] > 0 && target.equipmentDotOwners?.[turnKey] === owner);
      if(own.length >= 3){ for(const [turnKey] of own) if((target.equipmentDotExtensions?.[turnKey] || 0) < 2){ if(turnKey === "bleedTurns"){ for(const stack of target.bleedStacks || []) if(stack.extensions < 2){ stack.turns++; stack.extensions++; } if(typeof syncBleeding === "function") syncBleeding(target); } else if(turnKey==="naturePoisonTurns" && target.naturePoisonStacks?.length){for(const stack of target.naturePoisonStacks)if(stack.extensions<2){stack.turns++;stack.extensions++;}syncNaturePoison(target);} else if(["burnTurns", "poisonTurns"].includes(turnKey)){ const kind = turnKey.replace("Turns", ""); for(const stack of target[kind + "Stacks"] || []) if(stack.extensions < 2){ stack.turns++; stack.extensions++; } syncPeriodicStacks(target, kind); } else target[turnKey]++; target.equipmentDotExtensions[turnKey] = (target.equipmentDotExtensions[turnKey] || 0) + 1; } state.cooldowns.extend = 3; }
    }
    if(skill && current.costReady && state.cycleReady){ state.cycleReady = false; state.cooldowns.cycle = 4; }
    state.current = null;
  }
  function noteHpCost(actor, effects, amount){ const state = runtime(effects); if(state.current) state.current.hpCost += Math.max(0, Number(amount) || 0); }
  function getUpgradeRequirements(item, actor){
    actor = actorNow(actor);
    const current = normalizeItem(item, actor), rank = current ? rarityRank(current.rarity) : -1;
    if(!current || rank < 0 || rank >= 4) return null;
    const nextRarity = Object.keys(EquipmentData.rarityFactors)[rank + 1];
    const priorRecipe = recipeFor(current.regionName, current.slot, current.classRestriction || actor?.class, current.rarity, actor);
    const nextRecipe = recipeFor(current.regionName, current.slot, current.classRestriction || actor?.class, nextRarity, actor);
    if(!priorRecipe || !nextRecipe) return null;
    // Each improvement pays its own complete stage recipe, not a difference from the previous stage.
    const requirements = copy(nextRecipe.requirements);
    const duplicate = current.slot === "accessory" && rank === 3 ? { regionName: current.regionName, rarity: "comum", qty: 1 } : null;
    return { requirements, localRequirements: copy(nextRecipe.localRequirements), regionalRequirements: copy(nextRecipe.regionalRequirements), duplicate, cost: Math.max(100, nextRecipe.cost - priorRecipe.cost), fromRarity: current.rarity, toRarity: nextRarity, nextItem: copy(nextRecipe.result), region: current.regionName };
  }
  function duplicateCount(actor, item, upgrade){
    if(!upgrade?.duplicate) return 0;
    return (actor.inventory || []).reduce((sum, entry) => sum + (entry.uid !== item.uid && entry.type === "equipment" && entry.slot === "accessory" && entry.regionName === item.regionName && entry.rarity === "comum" ? (entry.qty || 1) : 0), 0);
  }
  function canUpgrade(item, actor){
    actor = actorNow(actor);
    const upgrade = getUpgradeRequirements(item, actor);
    return !!(actor && upgrade && isRegionUnlocked(item.regionName, actor) && (!item.classRestriction || item.classRestriction === actor.class) && actor.coins >= upgrade.cost && Object.entries(upgrade.requirements).every(([id, qty]) => inventoryCount(actor, id) >= qty) && (!upgrade.duplicate || duplicateCount(actor, item, upgrade) >= 1));
  }
  function getUpgradeCost(item){ return getUpgradeRequirements(item)?.cost || 0; }
  function upgradeItem(item){
    if(!normalizeItem(item)) return null;
    const rank = rarityRank(item.rarity); if(rank < 0 || rank >= 4) return null;
    const next = createItem(item.regionName, item.slot, item.classRestriction, Object.keys(EquipmentData.rarityFactors)[rank + 1]); next.uid = item.uid; return next;
  }
  function tryUpgrade(uidOrSlot){
    const actor = actorNow();
    if(!actor || currentMode !== "village" || isDead || isProcessingTurn) return false;
    const equippedSlot = actor.equipment?.[uidOrSlot] ? uidOrSlot : Object.keys(actor.equipment || {}).find(slot => actor.equipment[slot]?.uid === uidOrSlot);
    const inventoryIndex = equippedSlot ? -1 : actor.inventory.findIndex(entry => entry.uid === uidOrSlot);
    const item = equippedSlot ? actor.equipment[equippedSlot] : actor.inventory[inventoryIndex];
    const upgrade = getUpgradeRequirements(item, actor);
    if(!upgrade || !isRegionUnlocked(item.regionName, actor) || (item.classRestriction && item.classRestriction !== actor.class)) return false;
    if(!canUpgrade(item, actor)){
      notify("A melhoria exige moedas e componentes; artefatos lendarios tambem consomem outra copia comum do mesmo acessorio na bolsa."); return false;
    }
    if(upgrade.duplicate){
      const index = actor.inventory.findIndex(entry => entry.uid !== item.uid && entry.type === "equipment" && entry.slot === "accessory" && entry.regionName === item.regionName && entry.rarity === "comum");
      if((actor.inventory[index].qty || 1) > 1) actor.inventory[index].qty--;
      else actor.inventory.splice(index, 1);
    }
    removeMaterials(actor, upgrade.requirements); actor.coins -= upgrade.cost;
    const improved = { ...upgrade.nextItem, uid: item.uid };
    if(equippedSlot) actor.equipment[equippedSlot] = improved;
    else{
      // Locate again because consuming material entries may have shifted inventory indices.
      const index = actor.inventory.findIndex(entry => entry.uid === item.uid);
      if((item.qty || 1) > 1){ actor.inventory[index].qty--; delete improved.uid; addInventoryItem(improved); }
      else actor.inventory[index] = improved;
    }
    notify(`Melhoria garantida: ${improved.name}.`);
    if(typeof triggerForgeFeedback === "function" && equippedSlot) triggerForgeFeedback(equippedSlot, "success");
    changed(); return improved;
  }
  return { contractRewards, refreshEquipmentStats, canUpgrade, duplicateCount, createItem, createBossAccessory, normalizeItem, sanitizeNetworkItem, getDefinition, getMaterials, materialById, allMaterials, rollDrops, getRecipes, recipeById, ownsRecipeItem, canCraft, craft, normalizePlayer, unlockedRegions, isRegionUnlocked, getSetBonuses, describe, setArtisanFilter, renderArtisan, refreshContracts, normalizeMercenary, acceptContract, recordKill, collectCompletedContracts, claimContract, abandonContract, renderMercenary, beginAction, afterDamage, afterIncoming, endAction, modifyHealing, modifyShield, modifySkillCost, getArmorPenetration, getDotDamageMultiplier, markCritical, noteHealing, noteShield, noteHpCost, noteDotApplication, getUpgradeRequirements, getUpgradeCost, upgradeItem, tryUpgrade };
})();
if(typeof window !== "undefined") window.EquipmentSystem = EquipmentSystem;
