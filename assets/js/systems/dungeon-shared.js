function isDungeonMode(){
  return currentMode === "dungeon" || currentMode === "dungeon_run";
}

function getDungeonRequirement(){
  return dungeonData.minLevel;
}

function getDungeonSequence(){
  return Object.entries(regions).flatMap(([regionName, regionData]) =>
    Array.from({ length: 7 }, (_, encounterIndex) => ({
      regionName,
      encounterIndex,
      isBoss: encounterIndex === 6,
      template: encounterIndex === 6 ? regionData.boss : regionData.enemies[0]
    }))
  );
}

function getDungeonStepEntry(stepIndex = dungeonMultiplayer?.dungeonStepIndex || 0){
  const sequence = getDungeonSequence();
  return sequence[Math.min(Math.max(0, stepIndex), Math.max(0, sequence.length - 1))] || null;
}

function getDungeonProgressText(){
  const sequence = getDungeonSequence();
  const currentStep = Math.min((dungeonMultiplayer?.dungeonStepIndex || 0) + 1, sequence.length);
  const entry = getDungeonStepEntry();
  if(!entry){
    return "Sequencia completa.";
  }
  return `Etapa ${currentStep}/${sequence.length}: ${entry.template.name} (${entry.regionName})`;
}

function isDungeonConnected(){
  return !!(dungeonMultiplayer?.peer && (dungeonMultiplayer.isHost || dungeonMultiplayer.hostConnection?.open));
}

function isDungeonHost(){
  return !!(dungeonMultiplayer?.peer && dungeonMultiplayer.isHost);
}

function getDungeonRoomMembers(){
  return Object.values(dungeonMultiplayer?.party || {});
}

function getDungeonCurrentTurnId(){
  return dungeonMultiplayer?.turnOrder?.[dungeonMultiplayer.turnIndex] || null;
}

function isMyDungeonTurn(){
  return isDungeonConnected() && !!dungeonMultiplayer?.battleActive && getDungeonCurrentTurnId() === dungeonMultiplayer.peer?.id;
}

function getRegionRequirement(region){
  const regionNames = Object.keys(regions);
  const index = regionNames.indexOf(region);
  if(index <= 0){ return "nenhum requisito"; }
  const previousRegion = regionNames[index - 1];
  return `derrotar ${regions[previousRegion].boss.name}`;
}

function isRegionUnlockedForBattle(region){
  const regionNames = Object.keys(regions);
  const index = regionNames.indexOf(region);
  if(index < 0){ return false; }
  if(index <= 0){ return true; }
  const previousRegion = regionNames[index - 1];
  return !!player?.stats?.regionBossKills?.[previousRegion];
}
