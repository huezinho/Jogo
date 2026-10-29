const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
let playwright;
try { playwright=require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright=require('C:/Users/pcvas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }
const { chromium } = playwright;
const root = path.resolve(__dirname, '../../..');
const out = __dirname;
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.json':'application/json'};
const server = http.createServer((req,res) => {
  const file = path.join(root,decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if(!file.startsWith(root + path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'Not found':data);});
});
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base = 'http://127.0.0.1:'+server.address().port;
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  const report={date:'2026-10-27',base,errors:[],badResponses:[],classes:[],pages:[]};
  for(const className of ['Guerreiro','Arqueiro','Mago','Adepto da Natureza']){
    const ctx=await browser.newContext({viewport:{width:1366,height:768}});
    const page=await ctx.newPage();
    page.on('pageerror',e=>report.errors.push({className,message:e.message,stack:e.stack}));
    page.on('response',r=>{if(r.status()>=400)report.badResponses.push({className,status:r.status(),url:r.url()});});
    await page.goto(base);await page.waitForTimeout(600);
    if(className==='Guerreiro')await page.screenshot({path:path.join(out,'01-selecao-desktop.png'),fullPage:true});
    await page.evaluate(name=>selectClass(name),className);
    await page.waitForTimeout(700);
    const initial=await page.evaluate(()=>({player:JSON.parse(JSON.stringify(player)),enemy:JSON.parse(JSON.stringify(enemy)),actions:document.getElementById('actions').innerText,buttons:[...document.querySelectorAll('#actions button')].map(e=>({text:e.innerText,handler:e.getAttribute('onclick'),disabled:e.disabled})),body:document.body.innerText}));
    if(className==='Guerreiro')await page.screenshot({path:path.join(out,'02-combate-desktop.png'),fullPage:true});
    report.classes.push({className,initial});
    // Exercise one real basic attack through the rendered control.
    const basic=page.locator('#actions button').first();
    await basic.click();await page.waitForTimeout(2500);
    report.classes.at(-1).afterAttack=await page.evaluate(()=>({hp:player.hp,mp:player.mp,enemyHp:enemy?.hp,processing:isProcessingTurn,log:document.getElementById('log').innerText}));
    await page.evaluate(()=>saveCampaign());await page.reload();
    await page.evaluate(()=>continueCampaign());
    report.classes.at(-1).afterReload=await page.evaluate(()=>({class:player.class,hp:player.hp,mp:player.mp,enemyHp:enemy?.hp}));
    await ctx.close();
  }
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push({message:e.message}));
  for(const file of ['index.html','dungeon.html','arena.html']){
    await page.goto(base+'/'+file);await page.waitForTimeout(400);
    await page.evaluate(()=>{if(!player) selectClass('Guerreiro');});
    await page.waitForTimeout(400);
    report.pages.push({file,...await page.evaluate(()=>({mode:currentMode,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.body.innerText,buttons:[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width).map(e=>({text:e.innerText,handler:e.getAttribute('onclick'),disabled:e.disabled}))}))});
    await page.screenshot({path:path.join(out,'mobile-'+file+'.png'),fullPage:true});
  }
  await ctx.close();await browser.close();server.close();
  fs.writeFileSync(path.join(out,'smoke-results.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({errors:report.errors,badResponses:report.badResponses,classes:report.classes.map(x=>({className:x.className,actions:x.initial.actions,afterAttack:x.afterAttack,afterReload:x.afterReload})),pages:report.pages.map(x=>({file:x.file,mode:x.mode,width:x.width,scrollWidth:x.scrollWidth}))},null,2));
}
module.exports={server,root,out,chromium};
if(require.main===module) main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
