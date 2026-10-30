const path=require('path');
const {server,chromium}=require('../../qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const b=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const p=await b.newPage({viewport:{width:1380,height:1000},reducedMotion:'reduce'});
  await p.goto('http://127.0.0.1:'+server.address().port+'/docs/hud/personagens/index.html');
  await p.evaluate(()=>Promise.all([...document.querySelectorAll('.effect')].map(el=>{
   const img=new Image();img.src=getComputedStyle(el).backgroundImage.slice(5,-2);return img.decode();
  })));
  await p.addStyleTag({content:'.toolbar{position:static!important}'});
  await p.evaluate(()=>{frame=3;draw();});
  await p.locator('.fxgrid').screenshot({path:path.join(__dirname,'efeitos.png')});
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
