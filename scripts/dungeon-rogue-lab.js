/* Browser-only fixtures for references; not loaded by the game. */
window.DungeonLab=(()=>{
 const E=DungeonRogue,forms=Object.entries(subclassChoicesByClass).flatMap(([className,d])=>[{className,id:className,level:20,tier30:null,tier60:null},...d.tier30.flatMap(a=>[{className,id:a.id,level:50,tier30:a.id,tier60:null},...d.tier60[a.id].map(b=>({className,id:b.id,level:100,tier30:a.id,tier60:b.id}))])]);
 function fixture(id){const f=forms.find(f=>f.id===id);let s=E.lobby('reference');const h=E.addHero(s,{className:f.className,owner:'local'});E.start(s);h.ready=true;s=E.transition(s,'local',{kind:'hunt'});const p=s.party[0];p.level=f.level;p.stats.investedAtLevel=p.level;p.subclassChoices={tier30:f.tier30,tier60:f.tier60};p.rogueMods={hp:10000,mp:10000,power:800,attack:500};p.hp=E.stats(s,p).maxHp;p.mp=E.stats(s,p).maxMp;p.effects.arcaneCharges=3;p.effects.natureCadence=3;p.effects.shieldValue=1000;s.enemies[0].hp=s.enemies[0].maxHp=1000000;return s;}
 return {forms,fixture};
})();
