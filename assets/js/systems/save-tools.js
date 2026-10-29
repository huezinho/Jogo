function exportCharacterSave(){
  const state = player ? (() => { saveCampaign(); return getSavedCharacterState(player.characterId); })() : getSavedCharacterState();
  if(!state){ alert("Nenhum personagem para exportar."); return; }
  const file = new Blob([JSON.stringify({format:"rpg-turnos-character",version:2,state},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(file),link=document.createElement("a");
  link.href=url;link.download=`personagem-${String(state.characterName||"aventureiro").replace(/[^a-z0-9_-]/gi,"_")}.json`;
  link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function importCharacterSave(){
  if(isProcessingTurn || isDungeonConnected() || arenaMultiplayer?.peer){ alert("Saia da partida online antes de importar um personagem."); return; }
  const input=document.createElement("input");input.type="file";input.accept=".json,application/json";
  input.onchange=async()=>{
    const file=input.files?.[0];if(!file){return;}
    try{
      if(file.size>2000000){throw new Error("O arquivo excede o limite de 2 MB.");}
      const data=JSON.parse(await file.text());
      if(data.format!=="rpg-turnos-character" || !data.state){throw new Error("Formato de arquivo invalido.");}
      const state=normalizeSavedCharacterState(data.state);
      if(!state){throw new Error("Classe ou personagem invalido.");}
      if(getCharacterSaves().length>=MAX_CHARACTER_SAVES){throw new Error("Libere um espaco de personagem antes de importar.");}
      GameStorage.backup(CHARACTER_SAVES_KEY);
      state.characterId=createCharacterId();state.player.characterId=state.characterId;
      state.updatedAt=Date.now();state.schemaVersion=SAVE_SCHEMA_VERSION;
      upsertCharacterSave(state,{setActive:false});
      alert("Copia importada. Ela aparece na selecao de personagens.");
      if(!player){renderStartScreen();}
    }catch(error){alert(`Nao foi possivel importar: ${error.message}`);}
  };
  input.click();
}

function restoreSaveBackup(){
  if(isProcessingTurn || isDungeonConnected() || arenaMultiplayer?.peer){alert("Saia da partida online antes de restaurar.");return;}
  const raw=GameStorage.getItem(`${CHARACTER_SAVES_KEY}:backup`);
  if(!raw){alert("Nenhum backup de migracao disponivel.");return;}
  try{
    const saves=JSON.parse(raw);
    if(!Array.isArray(saves)||!saves.length||!saves.every(normalizeSavedCharacterState)){throw new Error("Backup invalido.");}
    if(!confirm("Restaurar a lista anterior de personagens? Exporte o progresso atual antes, se quiser conserva-lo.")){return;}
    const states=saves.map(normalizeSavedCharacterState);
    writeCharacterSaves(states);GameStorage.removeItem(SAVE_KEY);GameStorage.removeItem(ACTIVE_CHARACTER_KEY);
    player=null;enemy=null;document.getElementById("game").style.display="none";
    document.getElementById("classSelect").style.display="block";renderStartScreen();
  }catch(error){alert(`Nao foi possivel restaurar: ${error.message}`);}
}
