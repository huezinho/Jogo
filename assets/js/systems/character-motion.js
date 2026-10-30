/* Painted character atlases and ability-specific animated effect sheets. */
const CharacterMotion=(()=>{
 'use strict';const running=new WeakMap();const events=[];const loaded=new Map();const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const emit=(phase,info)=>{const entry={phase,...info};events.push(entry);if(events.length>160)events.shift();window.dispatchEvent(new CustomEvent('rpg-motion',{detail:entry}));};
 const support=new Set(['warrior_second_wind','warrior_warcry','warrior_smoke_bomb','warrior_faith_shield','warrior_unstoppable','warrior_valhalla','warrior_ultrasonic_cuts','mage_concentration','mage_mana_shield','mage_demon_form','archer_focus','archer_camouflage','archer_overheat','nature_ancestral_song','nature_true_form','nature_vine_cocoon','nature_crown']);
 function preload(key){if(!key)return Promise.resolve();if(!loaded.has(key)){const image=new Image();image.src=`assets/visual/skill-fx/${key}.webp?v=20261029-motion`;loaded.set(key,image.decode().then(()=>true).catch(()=>false));}return loaded.get(key);}
 function prepare(skills){for(const skill of [null,...skills])preload(profile(skill).key);}
 function profile(skill,style='attack'){
  const self=skill?support.has(skill.type):style==='buff';const hits=Math.max(1,Math.min(4,Number(skill?.hits)||1));
  return {key:skill?slugify(player.class)+'_'+slugify(skill.id||skill.type||skill.name):style==='buff'?null:slugify(player.class)+'_basic',pose:skill?(self||player.class==='Mago'||player.class==='Adepto da Natureza'?'cast':'attack'):(style==='buff'?'cast':'attack'),target:self?'hero':'enemy',ground:!self&&/trap|root|swamp|seed/.test(skill?.type||''),travel:!self&&player.class!=='Guerreiro',hits,duration:reduced()?100:900+(hits-1)*120};
 }
 function frames(el,row,duration,sequence=[0,1,2,3]){
  if(!el)return Promise.resolve();const previous=running.get(el);if(previous){cancelAnimationFrame(previous.raf);previous.finish(false);}
  if(reduced()){el.dataset.motion='idle';el.dataset.frame='0';el.style.removeProperty('background-position');return pause(100);}
  return new Promise(resolve=>{const start=performance.now();const token={raf:0,finish};running.set(el,token);el.dataset.motion=row===3?'hurt':row===2?'cast':'attack';
   function finish(restore=true){if(running.get(el)===token){running.delete(el);if(restore){el.dataset.motion='idle';el.dataset.frame='0';el.style.removeProperty('background-position');}}resolve();}
   function step(now){if(!el.isConnected||running.get(el)!==token){finish();return;}const t=Math.min(1,(now-start)/duration);const col=sequence[Math.min(sequence.length-1,Math.floor(t*sequence.length))];el.style.backgroundPosition=`${col*100/3}% ${row*100/3}%`;el.dataset.frame=String(row*4+col);if(t>=1){finish();return;}token.raf=requestAnimationFrame(step);}
   token.raf=requestAnimationFrame(step);
  });
 }
 function hurt(){const el=document.querySelector('#heroSpriteBox .hero-v2');emit('hurt',{pose:'hurt',target:'hero'});return frames(el,3,reduced()?100:500);}
 function effect(profile){
  const scene=document.querySelector('.rpg-battle .battle-scene');if(!scene||!profile.key||reduced())return Promise.resolve();
  const target=document.getElementById(profile.target==='hero'?'heroSpriteBox':'enemySpriteBox'),source=document.getElementById('heroSpriteBox');if(!target||!source)return Promise.resolve();
  const bounds=scene.getBoundingClientRect(),a=(source.querySelector('.sheet-sprite')||source).getBoundingClientRect(),b=(target.querySelector('.sheet-sprite')||target).getBoundingClientRect();const node=document.createElement('div');node.className='painted-action-fx';node.dataset.skill=profile.key;node.setAttribute('aria-hidden','true');node.style.backgroundImage=`url('assets/visual/skill-fx/${profile.key}.webp?v=20261029-motion')`;scene.append(node);
  return new Promise(resolve=>{const start=performance.now();function tick(now){if(!node.isConnected){resolve();return;}const t=Math.min(1,(now-start)/profile.duration),frame=Math.min(7,Math.floor(t*8));node.dataset.frame=String(frame);node.style.backgroundPosition=`${(frame%4)*100/3}% ${Math.floor(frame/4)*100}%`;const travel=profile.travel?Math.min(1,t/((profile.impactAt??profile.duration*.45)/profile.duration)):1;const x=(a.x+a.width*.68)*(1-travel)+(b.x+b.width/2)*travel-bounds.x;const y=(a.y+a.height*.4)*(1-travel)+(b.y+b.height*(profile.ground ? .82 : .45))*travel-bounds.y;node.style.left=`${x}px`;node.style.top=`${y}px`;if(t>=1){node.remove();resolve();return;}requestAnimationFrame(tick);}requestAnimationFrame(tick);});
 }
 async function action({style='attack',skill=null,connectHit=true,hitRepeats=1,hitDelay=null,betweenHits=null}={}){
  const p=profile(skill,style),box=document.getElementById('heroSpriteBox'),el=box?.querySelector('.hero-v2');if(!el)return;
  const repeats=Math.max(1,hitRepeats);if(!reduced()&&repeats>1){p.duration=Math.max(p.duration,(hitDelay??450)+(repeats-1)*(betweenHits??120)+250);p.impactAt=hitDelay??450;}
  await preload(p.key);if(!el.isConnected)return;
  const cls=p.pose==='cast'?'casting':'attacking';box.classList.add(cls);box.dataset.ability=p.key||'support';emit('start',p);
  let sequence=[0,1,2,3];if(p.pose==='attack'&&p.hits>1)sequence=[0,...Array.from({length:p.hits},()=>[1,2]).flat(),3];
  else if(repeats>1&&!reduced())sequence=[0,1,...Array.from({length:Math.max(2,Math.ceil(p.duration/225)-3)},()=>2),3];
  try{await Promise.all([frames(el,p.pose==='cast'?2:1,p.duration,sequence),effect(p),(async()=>{let marks;if(p.pose==='attack'&&p.hits>1)marks=sequence.flatMap((frame,i)=>frame===2?[p.duration*i/sequence.length]:[]);else marks=Array.from({length:Math.max(1,hitRepeats)},(_,i)=>(reduced()?30:hitDelay??Math.round(p.duration*.5))+i*(betweenHits??120));let elapsed=0;for(let i=0;i<marks.length;i++){await pause(Math.max(0,marks[i]-elapsed));elapsed=marks[i];emit('impact',{...p,hit:i});if(connectHit)pulseSpriteClass('enemySpriteBox','hit',reduced()?100:500);}})()]);}finally{box.classList.remove(cls);delete box.dataset.ability;emit('end',p);}
 }
 return {profile,action,hurt,prepare,ready:(skill,style)=>preload(profile(skill,style).key),portraitTop:key=>typeof HERO_ART_LAYOUT!=='undefined'?HERO_ART_LAYOUT[key]?.portraitTop??-24:-24,impactDelay:(skill,style)=>{const p=profile(skill,style);return p.duration*(p.pose==='attack'&&p.hits>1?1/(p.hits+1):.5);},history:()=>events.slice(),heroPath:key=>`assets/visual/heroes-v2/${key}.webp?v=20261029-motion`};
})();
