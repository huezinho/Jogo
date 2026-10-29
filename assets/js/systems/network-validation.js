(function(){
  "use strict";
  const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);
  function plain(value){ return !!value && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
  function safeText(value, max = 80){ return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max) : ""; }
  function boundedNumber(value, min, max, fallback = min){ return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : fallback; }
  function validPeerId(value){ return typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value) && !FORBIDDEN_KEYS.has(value); }
  function safeTree(value, depth = 0){
    if(depth > 12){ return false; }
    if(value === null || typeof value === "boolean"){ return true; }
    if(typeof value === "number"){ return Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER; }
    if(typeof value === "string"){ return value.length <= 4096; }
    if(Array.isArray(value)){ return value.length <= 512 && value.every(entry => safeTree(entry, depth + 1)); }
    if(!plain(value)){ return false; }
    const keys = Object.keys(value);
    return keys.length <= 256 && keys.every(key => !FORBIDDEN_KEYS.has(key) && key.length < 100 && safeTree(value[key], depth + 1));
  }
  function isMessage(value){
    if(!plain(value) || typeof value.type !== "string" || value.type.length > 60 || !safeTree(value)){ return false; }
    try { return JSON.stringify(value).length <= 250000; } catch { return false; }
  }
  function cleanEquipment(item, className, expectedSlot){
    if(item === null || item === undefined){ return null; }
    if(!plain(item) || item.type !== "equipment" || item.slot !== expectedSlot || !equipmentSlots.includes(item.slot) || !rarityOrder.includes(item.rarity)){ return null; }
    const sanitized = JSON.parse(JSON.stringify(item));
    if(sanitized.classRestriction && sanitized.classRestriction !== className){ return null; }
    // Registered equipment templates, not incoming stat totals, define network equipment.
    if(window.EquipmentSystem?.sanitizeNetworkItem){
      const normalized = window.EquipmentSystem.sanitizeNetworkItem(sanitized, className);
      if(normalized && normalized.type === "equipment"){ return normalized; }
    }
    if(sanitized.slot === "accessory" && regions[sanitized.regionName]){
      const template = getBossAccessoryTemplate(sanitized.regionName);
      if(template){
        const canonical = createEquipmentItem(template, sanitized.rarity);
        canonical.uid = safeText(sanitized.uid, 120);
        return canonical;
      }
    }
    return null;
  }
  function sanitizeHero(input, options = {}){
    if(!plain(input) || !safeTree(input) || !classes[input.class]){ return null; }
    const level = boundedNumber(input.level, 1, MAX_LEVEL, 0);
    if(!Number.isInteger(level) || !level){ return null; }
    const base = classes[input.class];
    const invested = input.stats?.invested;
    if(!plain(invested)){ return null; }
    const counts = {};
    let spent = 0;
    for(const key of ["strength", "wisdom", "vitality"]){
      const count = boundedNumber(invested[key], 0, level - 1, -1);
      if(!Number.isInteger(count) || count < 0){ return null; }
      counts[key] = count;
      spent += count;
    }
    if(spent > level - 1){ return null; }
    const gains = {};
    for(const [key, attribute] of [["hpGain", "vitality"], ["mpGain", "wisdom"], ["attackGain", "strength"]]){
      const count = counts[attribute];
      const max = count * getAttributePointGain(attribute, level);
      const min = count ? count * getAttributePointGain(attribute, 2) : 0;
      const gain = boundedNumber(invested[key], min, max, -1);
      if(gain < 0 || !Number.isInteger(gain)){ return null; }
      gains[key] = gain;
    }
    if(input.maxHp !== base.hp + gains.hpGain || input.maxMp !== base.mp + gains.mpGain || input.attack !== base.attack + gains.attackGain){ return null; }
    const choices = input.subclassChoices || {};
    const tier30 = level >= 30 && getTier30ChoiceDef(input.class, choices.tier30) ? choices.tier30 : null;
    const tier60 = level >= 60 && tier30 && getTier60ChoiceDef(input.class, tier30, choices.tier60) ? choices.tier60 : null;
    if((choices.tier30 && !tier30) || (choices.tier60 && !tier60)){ return null; }
    const hero = {
      characterId: safeText(input.characterId, 120),
      characterName: safeText(input.characterName || input.class, 50),
      class: input.class, level,
      xp: boundedNumber(input.xp, 0, 1000000, 0),
      coins: boundedNumber(input.coins, 0, 100000000, 0),
      baseStats: { hp: base.hp, mp: base.mp, attack: base.attack },
      maxHp: base.hp + gains.hpGain,
      maxMp: base.mp + gains.mpGain,
      attack: base.attack + gains.attackGain,
      baseAttack: base.attack,
      hp: boundedNumber(input.hp, 0, 1000000, 0),
      mp: boundedNumber(input.mp, 0, 1000000, 0),
      subclassChoices: { tier30, tier60 },
      activeSkills: [], passiveSkills: [], inventory: [],
      equipment: {},
      stats: {
        enemiesDefeated: 0, bossesDefeated: 0, deaths: 0, coinsEarned: 0,
        dungeonClears: 0, dungeonBestStep: 0, arenaDuels: 0, arenaWins: 0,
        regionKills: {}, regionBossKills: {},
        invested: { ...counts, ...gains, skillGain: gains.attackGain }
      }
    };
    for(const slot of equipmentSlots){ hero.equipment[slot] = cleanEquipment(input.equipment?.[slot], input.class, slot); }
    if(options.allowEffects){
      const defaults = createDefaultPlayerEffects();
      hero.effects = { ...defaults };
      for(const key of Object.keys(defaults)){
        const value = input.effects?.[key];
        if(typeof defaults[key] === "boolean"){ hero.effects[key] = value === true; }
        else if(typeof defaults[key] === "number"){ hero.effects[key] = boundedNumber(value, 0, 1000000, defaults[key]); }
        else { hero.effects[key] = safeText(value, 80); }
      }
    }
    return hero;
  }
  window.NetworkValidation = Object.freeze({ safeText, boundedNumber, validPeerId, isMessage, sanitizeHero, safeTree });
})();
