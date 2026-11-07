/* This page never reads or writes campaign character keys, including through core helpers. */
(() => {
  'use strict';
  const original = {get:GameStorage.getItem.bind(GameStorage),set:GameStorage.setItem.bind(GameStorage),remove:GameStorage.removeItem.bind(GameStorage)};
  window.DungeonStore = Object.freeze({
    read(key,fallback){try{return JSON.parse(original.get('dungeon_journey_v3_'+key))??fallback;}catch{return fallback;}},
    write(key,value){return original.set('dungeon_journey_v3_'+key,JSON.stringify(value));},
    remove(key){return original.remove('dungeon_journey_v3_'+key);}
  });
  const scratch=new Map();
  GameStorage.getItem=key=>scratch.get(key)??null;
  GameStorage.setItem=(key,value)=>{scratch.set(key,String(value));return true;};
  GameStorage.removeItem=key=>scratch.delete(key);
  GameStorage.backup=()=>{};
})();
