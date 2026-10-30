/* Paid campaign hunts. Stored with the character; never changes bosses or dungeon encounters. */
const CreatureTracking = (() => {
  const durationMs = 15 * 60 * 1000;
  const targetChance = .9;
  function offer(name, region = currentRegion){
    const creature = regions[region]?.enemies.find(e => e.name === name);
    return creature ? { region, name, level: creature.level, cost: 30 + creature.level * 8, durationMs, targetChance } : null;
  }
  function active(actor = player, now = Date.now()){
    const hunt = actor?.creatureTracking;
    if(!hunt || !(actor.stats?.regionBossKills?.[hunt.region] > 0) || !offer(hunt.name, hunt.region)) return null;
    if(!Number.isSafeInteger(hunt.startedAt) || !Number.isSafeInteger(hunt.expiresAt) || hunt.startedAt > now || hunt.expiresAt <= now || hunt.expiresAt - hunt.startedAt !== durationMs) return null;
    return hunt;
  }
  function normalize(actor){ actor.creatureTracking = active(actor) ? { ...active(actor) } : null; }
  function purchase(name){
    if(!player || currentMode !== 'battle' || IS_DUNGEON_PAGE || IS_ARENA_PAGE || enemy || isDead || isProcessingTurn || levelUpPoints > 0 || needsSubclassChoice()) return false;
    const chosen = offer(name);
    if(!chosen || !(player.stats?.regionBossKills?.[currentRegion] > 0) || player.coins < chosen.cost) return false;
    const now = Date.now();
    player.coins -= chosen.cost;
    player.creatureTracking = { region: currentRegion, name, startedAt: now, expiresAt: now + durationMs };
    log(`Rastreamento contratado: ${name} em ${currentRegion} por 15 minutos. Chance de encontro: pelo menos 90%.`);
    updateUI(); queueCampaignSave();
    return true;
  }
  function inRegion(region){ return !IS_DUNGEON_PAGE && !IS_ARENA_PAGE && active()?.region === region; }
  function weights(entries, region){
    if(!inRegion(region)) return entries;
    const hunt = active(), target = entries.find(e => e.enemyData.name === hunt.name);
    if(!target) return entries;
    const others = entries.reduce((sum,e) => sum + (e === target ? 0 : e.weight), 0);
    return entries.map(e => e === target ? { ...e, weight: Math.max(e.weight, others * targetChance / (1 - targetChance)) } : e);
  }
  return { offer, active, normalize, purchase, inRegion, weights, durationMs, targetChance };
})();
