// Storage failures keep the session playable and are always visible to the player.
const GameStorage = (() => {
  const memory = new Map();
  let failed = false;
  function announce(){
    if(!failed || !document.body){ return; }
    let notice = document.getElementById("saveStorageNotice");
    if(!notice){
      notice = document.createElement("div");
      notice.id = "saveStorageNotice";
      notice.setAttribute("role", "alert");
      document.body.appendChild(notice);
    }
    notice.textContent = "Nao foi possivel salvar neste navegador. Seu progresso continua nesta sessao. Exporte uma copia em Configuracao antes de fechar.";
  }
  return {
    getItem(key){
      if(memory.has(key)){ return memory.get(key); }
      try{ return localStorage.getItem(key); }catch{ failed = true; announce(); return null; }
    },
    setItem(key, value){
      value = String(value);
      try{ localStorage.setItem(key, value); memory.delete(key); return true; }catch{ memory.set(key, value); failed = true; announce(); return false; }
    },
    removeItem(key){
      try{ localStorage.removeItem(key); memory.delete(key); return true; }catch{ memory.set(key, null); failed = true; announce(); return false; }
    },
    backup(key){
      const raw = this.getItem(key);
      if(!raw){ return; }
      // A failed backup cannot prevent saving the current character.
      try{ localStorage.setItem(`${key}:backup`, raw); }catch{}
    },
    get available(){ return !failed; },
    announce
  };
})();
