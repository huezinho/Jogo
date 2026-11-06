const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server,chromium}=require('../docs/qa/2026-10-27/smoke.cjs');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
  const data=await page.evaluate(()=>{
   selectClass('Guerreiro');const E=EquipmentSystem,rows=[];
   const materials=req=>Object.entries(req||{}).map(([id,n])=>`${E.materialById(id).name} (${E.materialById(id).regionName}) × ${n}`).join('; ');
   for(const region of Object.keys(regions))for(const slot of [...EquipmentData.slots,'accessory'])for(const cls of slot==='weapon'?Object.keys(classes):['Guerreiro']){
    const actor={...player,class:cls},recipe=slot==='accessory'?null:E.getRecipes(actor,{region,slot})[0];
    for(const rarity of Object.keys(EquipmentData.rarityFactors)){
     const item=E.createItem(region,slot,cls,rarity,actor),upgrade=E.getUpgradeRequirements(item,actor);
     let profile=EquipmentData.regionStats[region];
     if(slot==='weapon'){
      profile=Object.fromEntries(Object.entries(profile).filter(([k])=>['bonusAttack','skillPower'].includes(k)));
      const total=Object.values(profile).reduce((a,b)=>a+b,0);
      profile=total?Object.fromEntries(Object.entries(profile).map(([k,v])=>[k,v/total])):EquipmentData.weaponFallback[cls];
     }
     rows.push({region,slot,cls:slot==='weapon'?cls:'Todas',name:item.name,rarity,profile,stats:item.stats,description:E.describe(item,actor),cost:recipe?.cost,materials:materials(recipe?.requirements),upgrade:upgrade?{cost:upgrade.cost,materials:materials(upgrade.requirements),duplicate:!!upgrade.duplicate,to:upgrade.toRarity}:null});
    }
   }
   return {rows,config:EquipmentData};
  });
  assert.equal(data.rows.length,540);
  const labels={bonusHp:'Vida máxima',bonusMp:'Mana máxima',bonusAttack:'Ataque',skillPower:'Poder de habilidade',flatReduction:'Redução fixa',shieldPowerPercent:'Potência de escudo',healPowerPercent:'Potência de cura',reflectPercent:'Reflexão',coinBonus:'Moedas',xpBonus:'XP',turnHealPercent:'Cura por turno',burnDamageReductionPercent:'Resistência à queimadura',bonusMpPercent:'Mana máxima',bonusHpPercent:'Vida máxima',totalDamagePercent:'Dano total',fatalSaveHealPercent:'Cura ao evitar morte',critChanceBonus:'Chance de crítico'};
  const number=n=>Number(n.toFixed(8)).toLocaleString('pt-BR',{maximumFractionDigits:8});
  const lines=['# Referência atual de equipamentos','',
   'L = nível atual do herói, limitado a 1–100. R = multiplicador da raridade. B = (1 + 0,5L) × peso da peça × R. Os atributos são recalculados ao subir de nível. Arredondar para baixo cada atributo; percentuais usam quatro casas decimais na fração antes da conversão para %.','',
   'Raridades: '+Object.entries(data.config.rarityFactors).map(([r,v])=>`${r}: R = ${number(v)}`).join('; ')+'.','',
   'Pesos: '+Object.entries(data.config.slotWeights).map(([s,v])=>`${s}: ${number(v)}`).join('; ')+'; acessório: 0,6. head = capacete; chest = peitoral; legs = calça; feet = botas; weapon = arma.','',
   'Fabricação produz a peça comum; as demais raridades são obtidas por aprimoramento sequencial. Acessórios comuns caem do chefe da região, com chance base de 3% (afetada por Sorte). Cada aprimoramento consome os materiais e gold indicados; o aprimoramento de acessório para lendário também exige uma cópia comum adicional do mesmo acessório. Acessórios não contam para conjuntos.','',
   'Os bônus de 2, 4 e 5 peças acumulam. Poder combinado = ataque + poder de habilidade. Bônus percentuais de conjuntos são adicionais aos atributos das peças.',''];
  for(const region of Object.keys(data.config.sets)){
   const set=data.config.sets[region];lines.push(`## ${region} — ${set.name}`,'',`2 peças: ${set.two}`,``, `4 peças: ${set.four}`,'',`5 peças: ${set.five}`,'');
   const entries=data.rows.filter(x=>x.region===region);
   for(let i=0;i<entries.length;i+=5){
    const group=entries.slice(i,i+5),first=group[0];
    lines.push(`### ${first.name.replace(/ Comum$/,'')} — ${first.cls}`,'');
    if(first.slot==='accessory'){
     lines.push('Vida máxima = piso(B × 2,4); mana máxima = piso(B × 2,4).','');
     for(const [key,base]of Object.entries(data.config.accessoryEffects[region])){
      const cap=data.config.accessoryRegionEffectCaps[region]?.[key]??data.config.accessoryEffectCaps[key];
      lines.push(`${labels[key]||key} = mínimo(${number(base)} × R × 3; ${number(cap)})${key==='flatReduction'?' pontos, arredondados para baixo.':' na forma de fração; multiplicar por 100 para obter %. Truncar a fração em quatro casas decimais.'}`,'');
     }
    }else{
     lines.push(...Object.entries(first.profile).map(([key,share])=>`${labels[key]||key} = ${key.endsWith('Percent')?'100 × truncar4':'piso'}(B × ${number(share*data.config.statValues[key])})${key.endsWith('Percent')?'%.':'.'}`),'');
     lines.push(`Fabricação comum: ${first.cost} gold; ${first.materials}.`,'');
    }
    lines.push('| Raridade | Próxima raridade | Gold do aprimoramento | Materiais | Cópia comum adicional |','|---|---|---:|---|---|');
    for(const row of group)lines.push(`| ${row.rarity} | ${row.upgrade?.to||'Máxima'} | ${row.upgrade?.cost||'—'} | ${row.upgrade?.materials||'—'} | ${row.upgrade?.duplicate?'Sim':'Não'} |`);
    lines.push('');
   }
  }
  const target=path.resolve('docs/referencia_equipamentos_atual.md');fs.writeFileSync(target,lines.join('\n')+'\n');
  console.log('Generated equipment reference: 540 variants, 12 sets, all recipes, upgrades, accessories and scaling formulas.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
