/* Authored campaign enemy poses and skill effects. Contains no combat calculations. */
const EnemyMotion = (() => {
  'use strict';
  const version = '20261104-phased-art';
  const active = new WeakMap(), cache = new Map(), events = [];
  const eggSeen = new WeakSet();
  // Defensive gestures never play the breath/sword release painted in the same sheet.
  const skillPoses = {
    'hidra-do-lodo': {breath:[8,9,10,8],viscous:[8,11,11,8]},
    'draco-magmatico': {scales:[8,9,9,8],eruption:[8,9,10,11]},
    'arauto-do-vazio': {mantle:[8,9,9,8]},
    'general-de-aco': {order:[8,9,9,8],steel:[4,5,6,7]},
    'lorde-da-cripta': {sentence:[8,9,10,8],pact:[8,11,11,8],unprotected:[8,9,10,8]},
    'imperador-do-eclipse': {dominion:[8,9,9,8],umbra:[4,5,6,7]},
    'deus-da-ruina': {collapse:[8,9,9,8],annihilate:[8,9,10,11]},
    'soberano-do-paradoxo': {time:[8,9,10,8],doom:[8,9,9,8],zeroCollapse:[8,11,11,8]}
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const catalogue = key => typeof EnemyArt !== 'undefined' ? EnemyArt[key] : null;
  const supports = key => !!catalogue(key) && key !== 'avatar-do-zenith';
  const spritePath = key => `assets/visual/enemies-v3/${key}.webp?v=${version}`;
  const effectPath = key => `assets/visual/enemy-fx/${key}.webp?v=${version}`;
  const emit = (phase, detail) => {
    const entry = {phase, ...detail}; events.push(entry);
    if(events.length > 180) events.shift();
    window.dispatchEvent(new CustomEvent('enemy-motion', {detail: entry}));
  };
  function load(url){
    if(!cache.has(url)){
      const im = new Image(); im.src = url;
      cache.set(url, im.decode().then(() => true).catch(() => false));
    }
    return cache.get(url);
  }
  function style(key){
    const art = catalogue(key);
    return art ? `--enemy-sheet-height:${art.rows * 100}%;--enemy-width:${art.boss ? 320 : 256}px;--enemy-height:${art.boss ? 400 : 320}px;` : '';
  }
  function resolveKey(target, key){
    return key === 'fenix-sombria' && target?.campaignState?.timers?.rest > 0 ? 'fenix-sombria-ovo' : key;
  }
  function profile(key, skill){
    const art = catalogue(key), id = skill?.id || 'basic';
    const spec = art?.skills[id] || art?.passives[id];
    const charge = !!spec?.charge && skill?.visualPhase === 'charge';
    // A passive is never a casting pose. An enemy without a real skill cannot cast.
    const authored = spec && art?.skills[id] ? skillPoses[key]?.[id] : null;
    const row = authored ? Math.floor(authored[0]/4) : spec && art?.skills[id] ? (art.rows === 4 ? 2 : 1) : 0;
    return {enemy: key, id, key: spec?.key || null, self: !!spec?.self || charge,
      ground: !!spec?.ground, charge, row, passive: !!art?.passives[id],
      sequence: authored || (spec ? [row*4, row*4+1, row*4+2, row*4+3] : [0,1,2,0]),
      effectFrames: charge ? [0,1,2,3] : spec?.charge ? [4,5,6,7] : [0,1,2,3,4,5,6,7],
      duration: reduced() ? 90 : spec ? (spec.charge && !charge ? 1350 : 1000) : 680};
  }
  function frame(el, number){
    const rows = catalogue(el.dataset.enemyArt)?.rows || 1;
    el.dataset.frame = String(number);
    el.style.backgroundPosition = `${number % 4 * 100/3}% ${rows > 1 ? Math.floor(number/4)*100/(rows-1) : 0}%`;
  }
  function idle(el){
    if(!el?.isConnected || active.has(el)) return;
    const art = catalogue(el.dataset.enemyArt);
    el.dataset.motion = 'idle'; frame(el,0);
    if(el.classList.contains('enemy-art-charging')){frame(el,9);return;}
    if(reduced() || !art || (!art.boss && !art.egg)) return;
    let start = performance.now();
    const token = {raf:0, cancel:() => {cancelAnimationFrame(token.raf); if(active.get(el)===token)active.delete(el);}};
    active.set(el, token);
    function step(now){
      if(!el.isConnected || active.get(el) !== token){token.cancel();return;}
      frame(el, Math.floor((now-start)/330)%4);
      token.raf = requestAnimationFrame(step);
    }
    token.raf = requestAnimationFrame(step);
  }
  function poses(el, sequence, duration, motion){
    if(!el) return Promise.resolve();
    active.get(el)?.cancel();
    if(reduced()){frame(el,0);return new Promise(resolve => setTimeout(resolve,90));}
    return new Promise(resolve => {
      const start = performance.now();
      const token = {raf:0,cancel:() => {cancelAnimationFrame(token.raf);finish(false);}};
      active.set(el,token);el.dataset.motion=motion;
      function finish(restore=true){
        if(active.get(el)===token){active.delete(el);if(restore)idle(el);}
        resolve();
      }
      function tick(now){
        if(!el.isConnected || active.get(el)!==token){finish(false);return;}
        const t=Math.min(1,(now-start)/duration);
        frame(el,sequence[Math.min(sequence.length-1,Math.floor(t*sequence.length))]);
        if(t===1){finish();return;}token.raf=requestAnimationFrame(tick);
      }
      token.raf=requestAnimationFrame(tick);
    });
  }
  function effect(p){
    const scene=document.querySelector('.rpg-battle .battle-scene');
    const from=document.getElementById('enemySpriteBox'),to=document.getElementById(p.self?'enemySpriteBox':'heroSpriteBox');
    if(!p.key || !scene || !from || !to || reduced()) return Promise.resolve();
    const node=document.createElement('div');
    node.className=`enemy-painted-fx${p.self?' is-self':''}${p.ground?' is-ground':''}`;
    node.dataset.enemyEffect=p.key;node.setAttribute('aria-hidden','true');
    node.style.backgroundImage=`url('${effectPath(p.key)}')`;scene.append(node);
    return new Promise(resolve => {
      const start=performance.now();let impact=false;
      function tick(now){
        if(!node.isConnected || !from.isConnected || !to.isConnected){node.remove();resolve();return;}
        const t=Math.min(1,(now-start)/p.duration),f=p.effectFrames[Math.min(p.effectFrames.length-1,Math.floor(t*p.effectFrames.length))];
        const bounds=scene.getBoundingClientRect(),a=(from.querySelector('.sheet-sprite')||from).getBoundingClientRect(),b=(to.querySelector('.sheet-sprite')||to).getBoundingClientRect();
        const travel=p.self?1:Math.min(1,t/.46);
        node.style.left=`${(a.x+a.width*.5)*(1-travel)+(b.x+b.width*.5)*travel-bounds.x}px`;
        node.style.top=`${(a.y+a.height*.5)*(1-travel)+(b.y+b.height*(p.ground?.86:.48))*travel-bounds.y}px`;
        node.style.backgroundPosition=`${f%4*100/3}% ${Math.floor(f/4)*100}%`;node.dataset.frame=String(f);
        if(!impact && t>=.46){impact=true;emit('impact',p);if(p.connectHit&&!p.self&&typeof CharacterMotion!=='undefined')CharacterMotion.hurt();}
        if(t===1){node.remove();resolve();return;}requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  async function action({skill=null,connectHit=true}={}){
    const box=document.getElementById('enemySpriteBox'),el=box?.querySelector('.sheet-sprite.enemy-painted');
    if(!el || catalogue(el.dataset.enemyArt)?.egg) return;
    const p={...profile(el.dataset.enemyArt,skill),connectHit};
    if(p.key)await load(effectPath(p.key));if(!el.isConnected)return;
    if(p.charge)el.classList.add('enemy-art-charging');
    else if(skill?.id==='reality'){el.classList.remove('enemy-art-charging');box.querySelector('.enemy-charge-fx')?.remove();}
    emit('start',p);box.classList.add('enemy-performing');
    const sequence=p.passive?[0]:p.id==='basic'&&catalogue(p.enemy).rows===4?[4,5,6,7]:p.sequence;
    try{
      await Promise.all([poses(el,sequence,p.duration,p.row?'cast':'attack'),effect(p),
        !p.key&&connectHit?new Promise(resolve=>setTimeout(()=>{if(el.isConnected&&typeof CharacterMotion!=='undefined')CharacterMotion.hurt();resolve();},p.duration*.48)):Promise.resolve()]);
    }finally{box.classList.remove('enemy-performing');if(p.charge&&!box.querySelector('.enemy-charge-fx'))box.insertAdjacentHTML('beforeend',chargeMarkup({baseName:catalogue(p.enemy).name,campaignState:{charge:{ability:skill}}}));emit('end',p);}
  }
  function hurt(){
    const el=document.querySelector('#enemySpriteBox .sheet-sprite.enemy-painted');if(!el)return Promise.resolve();
    const art=catalogue(el.dataset.enemyArt);if(art.egg)return Promise.resolve();
    emit('hurt',{enemy:el.dataset.enemyArt});
    return poses(el,art.rows===4?[12,13,14,15]:[3,3,0],reduced()?90:340,'hurt');
  }
  async function passive(id){
    const el=document.querySelector('#enemySpriteBox .sheet-sprite.enemy-painted');
    if(!el)return;
    const actor=typeof enemy!=='undefined'?enemy:null;
    const key=el.dataset.enemyArt.replace(/-ovo$/,''),p={...profile(key,{id}),connectHit:false};
    if(!p.key)return;
    await load(effectPath(p.key));
    // Combat refreshes its markup after calculating a hit. Follow the same enemy into its new node.
    if(actor&&typeof enemy!=='undefined'&&enemy!==actor)return;
    const current=document.querySelector('#enemySpriteBox .sheet-sprite.enemy-painted');
    if(!current||current.dataset.enemyArt.replace(/-ovo$/,'')!==key)return;
    emit('passive',p);await effect(p);
  }
  async function sync(){
    const el=document.querySelector('#enemySpriteBox .sheet-sprite.enemy-painted');
    if(!el || !el.dataset.enemyArt || typeof enemy==='undefined' || !enemy)return;
    const raw=el.dataset.enemyArt.replace(/-ovo$/,''),key=resolveKey(enemy,raw);
    if(key===el.dataset.enemyArt)return;
    active.get(el)?.cancel();await load(spritePath(key));if(!el.isConnected)return;
    el.dataset.enemyArt=key;el.style.cssText+=style(key);el.style.setProperty('--sprite-url',`url('${new URL(spritePath(key),document.baseURI).href}')`);
    if(key.endsWith('-ovo')){idle(el);showEgg(enemy);}
    else{
      // The hatching drawings belong to the egg atlas, followed by the living phoenix.
      el.dataset.enemyArt='fenix-sombria-ovo';el.style.setProperty('--sprite-url',`url('${new URL(spritePath('fenix-sombria-ovo'),document.baseURI).href}')`);
      await poses(el,[4,5,6,7],reduced()?90:1000,'hatch');
      if(!el.isConnected)return;
      active.get(el)?.cancel();el.dataset.enemyArt=raw;el.style.cssText+=style(raw);el.style.setProperty('--sprite-url',`url('${new URL(spritePath(raw),document.baseURI).href}')`);idle(el);emit('form',{enemy:raw,form:'phoenix'});
    }
  }
  function showEgg(target){
    if(!target||eggSeen.has(target))return;
    eggSeen.add(target);passive('rebirth');emit('form',{enemy:'fenix-sombria',form:'egg'});
  }
  function prepare(key){
    const art=catalogue(key);if(!art)return Promise.resolve();
    return Promise.all([load(spritePath(key)),...Object.values({...art.skills,...art.passives}).map(s=>load(effectPath(s.key)))]);
  }
  function chargeMarkup(target){
    const skill=target?.campaignState?.charge?.ability;if(!skill)return '';
    const key=target.baseName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const p=profile(key,{...skill,visualPhase:'charge'});if(!p.charge)return '';
    return `<span class="enemy-charge-fx" style="background-image:url('${new URL(effectPath(p.key),document.baseURI).href}')" aria-hidden="true"></span>`;
  }
  function watch(){
    const initialized=new WeakSet();
    const attach=()=>{
      document.querySelectorAll('.sheet-sprite.enemy-painted').forEach(idle);
      if(typeof enemy!=='undefined'&&enemy?.baseName==='Fenix Sombria'&&document.querySelector('#enemySpriteBox [data-enemy-art="fenix-sombria-ovo"]'))showEgg(enemy);
      if(typeof enemy!=='undefined'&&enemy&&!initialized.has(enemy)){
        const el=document.querySelector('#enemySpriteBox .sheet-sprite.enemy-painted');
        if(el&&catalogue(el.dataset.enemyArt)?.name===enemy.baseName){initialized.add(enemy);prepare(el.dataset.enemyArt);if(el.dataset.enemyArt==='titan-rachado'&&enemy.shieldValue>0)passive('stoneguard');}
        else if(enemy.baseName==='Avatar do Zenith'&&document.querySelector('#enemySpriteBox .sheet-sprite.zenith-painted')&&typeof ZenithMotion!=='undefined'){initialized.add(enemy);ZenithMotion.prepare();}
      }
    };
    attach();new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
  return {supports,spritePath,style,resolveKey,profile,action,hurt,passive,sync,prepare,chargeMarkup,history:()=>events.slice()};
})();
