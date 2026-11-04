/* Visual pilot: only Avatar do Zenith. Authored poses + individual spell atlases. */
const ZenithMotion=(()=>{
 'use strict';
 const version='20261104-zenith-pilot',active=new WeakMap(),cache=new Map(),history=[];
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const supports=key=>key==='avatar-do-zenith';
 const path=key=>`assets/visual/enemy-fx/zenith-${key}.webp?v=${version}`;
 const emit=(phase,profile)=>{history.push({phase,...profile});if(history.length>100)history.shift();window.dispatchEvent(new CustomEvent('zenith-motion',{detail:{phase,...profile}}));};
 function load(url){if(!cache.has(url)){const im=new Image();im.src=url;cache.set(url,im.decode().then(()=>true).catch(()=>false));}return cache.get(url);}
 function prepare(){return Promise.all(['judgment','glare','prism','aura'].map(key=>load(path(key))));}
 function profile(skill,style='attack'){
  const id=skill?.id||'basic',charge=skill?.visualPhase==='charge';
  const key=id==='glare'?'glare':id==='prism'?'prism':id==='aura'?'aura':'judgment';
  const self=id==='aura'||charge;
  return{id,key,charge,self,pose:id==='basic'?1:id==='aura'?0:2,frames:charge?[0,1,2,3]:id==='prism'?[4,5,6,7]:[0,1,2,3,4,5,6,7],duration:reduced()?90:id==='prism'&&!charge?1400:id==='glare'?1050:id==='aura'?700:id==='basic'?720:1100};
 }
 function reset(el){el.dataset.motion='idle';el.dataset.frame=el.classList.contains('zenith-charging')?'9':'0';el.style.removeProperty('background-position');}
 function body(el,row,duration,sequence=[0,1,2,3]){
  if(!el)return Promise.resolve();const old=active.get(el);if(old)old.cancel();
  if(reduced()){reset(el);return new Promise(r=>setTimeout(r,90));}
  return new Promise(resolve=>{
   const start=performance.now(),token={raf:0,cancel:()=>{cancelAnimationFrame(token.raf);finish();}};active.set(el,token);el.dataset.motion=['idle','attack','cast','hurt'][row];
   function finish(){if(active.get(el)===token){active.delete(el);reset(el);}resolve();}
   function step(now){if(!el.isConnected||active.get(el)!==token){finish();return;}const t=Math.min(1,(now-start)/duration),col=sequence[Math.min(sequence.length-1,Math.floor(t*sequence.length))];el.dataset.frame=String(row*4+col);el.style.backgroundPosition=`${col*100/3}% ${row*100/3}%`;if(t===1){finish();return;}token.raf=requestAnimationFrame(step);}
   token.raf=requestAnimationFrame(step);
  });
 }
 function effect(p){
  const scene=document.querySelector('.rpg-battle .battle-scene'),from=document.getElementById('enemySpriteBox'),to=document.getElementById(p.self?'enemySpriteBox':'heroSpriteBox');
  if(!scene||!from||!to||reduced())return Promise.resolve();
  const node=document.createElement('div');node.className=`zenith-spell-fx zenith-fx-${p.id}${p.charge?' is-charging':''}`;node.dataset.zenithEffect=p.id;node.setAttribute('aria-hidden','true');node.style.backgroundImage=`url('${path(p.key)}')`;scene.append(node);
  return new Promise(resolve=>{
   const start=performance.now();let hit=false;
   function tick(now){
    if(!node.isConnected||!from.isConnected||!to.isConnected){node.remove();resolve();return;}
    const t=Math.min(1,(now-start)/p.duration),frame=p.frames[Math.min(p.frames.length-1,Math.floor(t*p.frames.length))];
    const bounds=scene.getBoundingClientRect(),a=(from.querySelector('.sheet-sprite')||from).getBoundingClientRect(),b=(to.querySelector('.sheet-sprite')||to).getBoundingClientRect();
    const travel=p.self?1:p.id==='glare'?Math.min(1,t*2):Math.min(1,t/.48);
    node.style.left=`${(a.x+a.width*.5)*(1-travel)+(b.x+b.width*.5)*travel-bounds.x}px`;
    node.style.top=`${(a.y+a.height*.55)*(1-travel)+(b.y+b.height*(p.id==='aura'?.62:.48))*travel-bounds.y}px`;
    node.style.backgroundPosition=`${frame%4*100/3}% ${Math.floor(frame/4)*100}%`;node.dataset.frame=String(frame);
    if(t>=.48&&!hit){hit=true;emit('impact',p);if(!p.self&&p.connectHit){if(typeof CharacterMotion!=='undefined')CharacterMotion.hurt();else to.animate([{filter:'brightness(1)'},{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{duration:300});}}
    if(t===1){node.remove();resolve();return;}requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
  });
 }
 async function action({style='attack',skill=null,connectHit=true}={}){
  const box=document.getElementById('enemySpriteBox'),el=box?.querySelector('.sheet-sprite.zenith-painted');if(!el)return;
  const p={...profile(skill,style),connectHit};await load(path(p.key));if(!el.isConnected)return;
  emit('start',p);box.classList.add('zenith-performing');
  try{await Promise.all([body(el,p.pose,p.duration),effect(p)]);}finally{box.classList.remove('zenith-performing');emit('end',p);}
 }
 function hurt(){const el=document.querySelector('#enemySpriteBox .sheet-sprite.zenith-painted');if(!el)return Promise.resolve();emit('hurt',{id:'hurt'});return body(el,3,reduced()?90:340);}
 function passive(){return action({style:'buff',skill:{id:'aura'},connectHit:false});}
 return{supports,action,hurt,passive,prepare,profile,history:()=>history.slice(),spritePath:()=>`assets/visual/enemies-v3/avatar-do-zenith.webp?v=${version}`};
})();
