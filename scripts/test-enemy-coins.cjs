const assert=require('node:assert/strict');
const {server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  const checks=await page.evaluate(()=>{
   selectClass('Guerreiro');updateUI=()=>{};queueCampaignSave=()=>{};gainXP=()=>{};
   tryEnemyMaterialDrop=()=>{};EquipmentSystem.recordKill=()=>{};grantBossChest=()=>{};tryBossAccessoryDrop=()=>{};
   const modifiers=getPassiveModifiers;let checks=0;
   for(const isBoss of [false,true])for(const level of [1,20,50,100])for(const bonus of [0,.18,.42])for(const [roll,factor]of [[0,1],[.5,1.2],[1-Number.EPSILON,1.4]]){
    getPassiveModifiers=()=>({...modifiers(),coinBonus:bonus});
    enemy=createEnemyFromTemplate({...regions.Floresta.enemies[0],level},isBoss,'Floresta');
    const coins=player.coins,total=player.stats.coinsEarned;Math.random=()=>roll;
    handleEnemyDefeat();
    const expected=Math.floor(((isBoss?18:5)+3*level)*factor*(1+bonus));
    if(player.coins-coins!==expected||player.stats.coinsEarned-total!==expected)throw Error(JSON.stringify({isBoss,level,bonus,roll,expected,actual:player.coins-coins}));
    checks++;
   }
   return checks;
  });
  assert.deepEqual(errors,[]);assert.equal(checks,72);console.log(`PASS ${checks} native enemy coin rewards: bases, random multiplier, bonuses and rounding`);
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
