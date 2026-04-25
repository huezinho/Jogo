const IS_DUNGEON_PAGE = !!window.IS_DUNGEON_PAGE;
const IS_ARENA_PAGE = !!window.IS_ARENA_PAGE;
const MAIN_PAGE_PATH = "index.html";
const DUNGEON_PAGE_PATH = "dungeon.html";
const ARENA_PAGE_PATH = "arena.html";
const PENDING_PAGE_MODE_KEY = "rpg_turnos_pending_page_mode_v1";

function queuePageMode(mode){
  try{
    sessionStorage.setItem(PENDING_PAGE_MODE_KEY, mode);
  }catch{}
}

function consumeQueuedPageMode(){
  try{
    const mode = sessionStorage.getItem(PENDING_PAGE_MODE_KEY);
    if(mode){
      sessionStorage.removeItem(PENDING_PAGE_MODE_KEY);
    }
    return mode || "";
  }catch{
    return "";
  }
}

function navigateToGamePage(mode){
  queuePageMode(mode);
  if(["dungeon", "dungeon_run"].includes(mode)){
    location.href = DUNGEON_PAGE_PATH;
    return;
  }
  if(["arena", "arena_run"].includes(mode)){
    location.href = ARENA_PAGE_PATH;
    return;
  }
  location.href = MAIN_PAGE_PATH;
}

function openDungeonPage(){
  navigateToGamePage("dungeon");
}

function openArenaPage(){
  navigateToGamePage("arena");
}

function returnToMainPage(mode = "battle"){
  navigateToGamePage(mode);
}
