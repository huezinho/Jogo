const fs=require('node:fs'),path=require('node:path');const {server,chromium,root}=require('../2026-10-27/smoke.cjs');
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.route(/\.(png|webp|mp3|svg)(\?|$)/,r=>r.abort());await p.route(/\/character-motion\.js(\?|$)/,r=>r.fulfill({body:'',contentType:'text/javascript'}));await p.goto('http://127.0.0.1:'+server.address().port);await p.addScriptTag({content:fs.readFileSync(path.join(root,'docs/qa/2026-10-27/class-lab-engine.js'),'utf8')});
 const rows=await p.evaluate(async()=>{
  const cases=[['paladino','warrior_warcry','warrior_judgment'],['samurai','warrior_second_wind','warrior_shove'],['berserker','warrior_warcry','warrior_stagger'],['berserker','warrior_valhalla','warrior_stagger'],['arquimago','mage_concentration','basic'],['sniper','archer_focus','archer_headshot'],['atirador_arcano','archer_focus','archer_headshot'],['guarda_florestal','archer_focus','archer_barrage'],['espreitador','archer_camouflage','archer_surprise'],['avatar_da_natureza','nature_true_form','basic'],['fada_monarca','nature_crown','nature_queen_decree'],['corrompido','mage_demon_form','mage_corruption']];
  const out=[];
  for(const[id,buff,attackType]of cases)for(const level of [70,80,100])for(const build of ['equilibrada','arcana'])for(const horizon of [2,4,6]){
   const form=ClassLab.forms.find(f=>f.id===id);ClassLab.make(form,level,build,'dummy',1);if(!getSkillInfo().some(s=>s.type===buff))continue;
   const sides=[];for(const prepare of [false,true]){
    const runs=[];for(let seed=1;seed<=16;seed++){
     ClassLab.make(form,level,build,'dummy',seed);enemy.hp=enemy.maxHp=1000000;enemy.armor=0;enemy.attack=0;enemy.maxHpStrikePercent=0;
     const hp=player.hp,mp=player.mp;let blocked=0,turns=0;
     for(;turns<horizon&&player.hp>0&&enemy.hp>0&&!isDead;turns++){
      const type=prepare&&turns===0?buff:attackType,index=getSkillInfo().findIndex(s=>s.type===type);
      if(type==='basic')await attack();else if(index>=0&&getSkillActionState(getSkillInfo()[index]).canUse)await useSkill(index);else{blocked++;await attack();}
     }
     runs.push({damage:1000000-enemy.hp,hpLost:hp-player.hp,mp:player.mp,startMp:mp,blocked,turns});
    }
    const mean=k=>runs.reduce((n,r)=>n+r[k],0)/runs.length;sides.push({prepare,...Object.fromEntries(['damage','hpLost','mp','startMp','blocked','turns'].map(k=>[k,mean(k)]))});
   }
   out.push({id,level,build,horizon,buff,attackType,baseline:sides[0],prepared:sides[1],ratio:sides[1].damage/Math.max(1,sides[0].damage)});
  }return out;
 });if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(path.join(__dirname,'windows.json'),JSON.stringify({rows,errors}));console.log(JSON.stringify({windows:rows.length,runs:rows.length*32,errors}));
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
