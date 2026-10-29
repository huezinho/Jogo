const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage({viewport:{width:1200,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.stack));
 const base='http://127.0.0.1:'+server.address().port;
 await p.goto(base+'/docs/hud/fontes/comparacao.html');await p.evaluate(async()=>{await document.fonts.ready;await Promise.all(['../artes/combate-rpg-v1.png','../artes/oficina-rpg-v1.png','/assets/visual/hud/button-normal.webp','/assets/visual/hud/panel-parchment.webp'].map(url=>{const i=new Image();i.src=url;return i.decode();}));});
 const fonts=await p.evaluate(()=>[...document.fonts].map(f=>({family:f.family,status:f.status})));assert(fonts.every(f=>f.status==='loaded'));
 await p.screenshot({path:path.join(__dirname,'comparacao-fontes.png'),fullPage:true});
 await p.setViewportSize({width:1366,height:768});await p.goto(base);await p.evaluate(()=>{selectClass('Guerreiro');player.level=40;player.subclassChoices={tier30:'cavaleiro',tier60:null};normalizePlayerState();player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;enemy=createEnemyFromTemplate(regions.Floresta.enemies[0]);displayState={playerHp:player.hp,playerMp:player.mp,playerXp:0,enemyHp:enemy.hp};updateUI();});
 await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#campaignHud img')].map(i=>i.decode().catch(()=>{})));await Promise.all([...document.querySelectorAll('.sheet-sprite')].map(e=>{const src=getComputedStyle(e).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];if(!src)return;const i=new Image();i.src=src;return i.decode();}));});
 await p.screenshot({path:path.join(__dirname,'layout-restaurado.png'),fullPage:true});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({fonts,errors},null,2));console.log('PASS font samples and restored-layout capture');
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
