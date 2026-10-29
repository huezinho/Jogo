const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {server,chromium}=require('../2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const records=[],errors=[];
 for(const className of ['Guerreiro','Arqueiro','Mago','Adepto da Natureza']){
  const context=await browser.newContext({reducedMotion:'reduce'}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.stack));
  await p.goto('http://127.0.0.1:'+server.address().port);
  await p.evaluate(className=>{selectClass(className);player.level=40;player.subclassChoices={tier30:subclassChoicesByClass[className].tier30[0].id,tier60:null};normalizePlayerState();player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;updateUI();},className);
  for(const level of [40,100]){
   if(level===100)await p.evaluate(()=>{player.level=100;const choices=getSubclassChoices();if(choices[0])player.subclassChoices.tier60=choices[0].id;normalizePlayerState();player.hp=getCurrentCaps().maxHp;player.mp=getCurrentCaps().maxMp;updateUI();});
   for(const width of [1366,390,320]){
    await p.setViewportSize({width,height:844});await p.evaluate(()=>document.fonts.ready);
    const result=await p.evaluate(()=>{
     const clipped=[];for(const e of document.querySelectorAll('.rpg-ability strong,.rpg-ability small,.rpg-mainnav button>span,#rpgTitle')){
      const range=document.createRange();range.selectNodeContents(e);const r=range.getBoundingClientRect(),box=(e.closest('button')||(e.id==='rpgTitle'?e.parentElement:e)).getBoundingClientRect();
      if(r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1)clipped.push({text:e.textContent,range:{x:r.x,y:r.y,w:r.width,h:r.height},box:{x:box.x,y:box.y,w:box.width,h:box.height}});
     }
     return{overflow:document.documentElement.scrollWidth>innerWidth,clipped,abilityCount:document.querySelectorAll('.rpg-ability').length,loaded:[...document.fonts].some(f=>f.family==='Campaign Garamond'&&f.status==='loaded'),costSize:getComputedStyle(document.querySelector('.rpg-ability small')).fontSize};
    });
    records.push({className,level,width,...result});assert.equal(result.overflow,false);assert.deepEqual(result.clipped,[],`${className} level ${level} at ${width}`);assert(result.loaded);assert(parseFloat(result.costSize)>=15);
   }
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'typography-results.json'),JSON.stringify({records,errors},null,2));console.log('PASS typography: '+records.length+' class/level/viewport combinations, no clipped labels or fallback fonts');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
