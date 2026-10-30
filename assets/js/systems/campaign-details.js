/* Contextual descriptions and the shared currency artwork. */
(()=>{
 'use strict';
 const coin=()=>{const img=document.createElement('img');img.src='assets/visual/hud/icon-coin.webp';img.alt='';img.className='rpg-coin-icon';img.setAttribute('aria-hidden','true');return img;};
 function currency(root){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode()){const n=walker.currentNode;if(/\bmoedas?\b/i.test(n.textContent)&&!n.parentElement.closest('script,style,textarea,option,[contenteditable]'))nodes.push(n);}
  for(const n of nodes){if(n.previousSibling?.classList?.contains('rpg-coin-icon')||n.parentElement.closest('.rpg-coins,.rpg-materials li')?.querySelector('img.rpg-coin-icon'))continue;
   const parts=n.textContent.split(/(\bmoedas?\b)/gi),fragment=document.createDocumentFragment();for(const part of parts){if(/^moedas?$/i.test(part))fragment.append(coin());fragment.append(document.createTextNode(part));}n.replaceWith(fragment);
  }
 }
 const tip=document.createElement('div');tip.id='rpgActionTooltip';tip.role='tooltip';tip.popover='manual';tip.hidden=true;document.body.append(tip);
 let owner=null;
 let previousDescription=null;
 function hide(){if(owner){if(previousDescription)owner.setAttribute('aria-describedby',previousDescription);else owner.removeAttribute('aria-describedby');owner=null;}if(tip.matches(':popover-open'))tip.hidePopover();tip.hidden=true;}
 function show(event){const b=event.target.closest?.('[data-hud-description],[data-hud="flee"],.region-map-boss-btn,.region-map-marker,.location-map-marker,[data-trophy-tooltip]');if(!b){hide();return;}if(owner!==b){hide();owner=b;previousDescription=b.getAttribute('aria-describedby');}
  const map=b.matches('.region-map-marker,.location-map-marker,[data-trophy-tooltip]');
  tip.dataset.kind=b.dataset.hud==='find'?'spawn':b.dataset.hud==='quick-use'?'item':b.matches('.region-map-boss-btn')?'boss':map?'map':b.matches('.rpg-coins')?'balance':'action';tip.textContent=b.dataset.hudDescription||b.dataset.tooltip||b.dataset.trophyTooltip||b.getAttribute('aria-label')||b.textContent;currency(tip);tip.hidden=false;if(!tip.matches(':popover-open'))tip.showPopover();b.setAttribute('aria-describedby',tip.id);
  const r=b.getBoundingClientRect(),t=tip.getBoundingClientRect(),side=map||b.matches('.region-map-boss-btn,.rpg-coins');
  let left=side?r.left-t.width-12:r.left+r.width/2-t.width/2;if(side&&left<8)left=r.right+12;
  tip.style.left=Math.max(8,Math.min(innerWidth-t.width-8,left))+'px';tip.style.top=Math.max(8,Math.min(innerHeight-t.height-8,side?r.top+(r.height-t.height)/2:r.top-t.height-12))+'px';
 }
 document.addEventListener('pointerover',show);document.addEventListener('focusin',show);
 document.addEventListener('pointermove',event=>{if(tip.hidden)show(event);});
 document.addEventListener('mouseout',e=>{if(owner&&!owner.contains(e.relatedTarget))hide();});
 document.addEventListener('focusout',()=>{if(!owner?.matches(':hover'))hide();});document.addEventListener('click',hide);
 window.addEventListener('scroll',()=>{const r=owner?.isConnected?owner.getBoundingClientRect():null;if(r&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth)show({target:owner});else hide();},true);window.addEventListener('resize',hide);
 const root=document.getElementById('game');
 if(root){const observer=new MutationObserver(()=>{observer.disconnect();if(owner&&!owner.isConnected)hide();currency(root);observer.observe(root,{subtree:true,childList:true,characterData:true});});currency(root);observer.observe(root,{subtree:true,childList:true,characterData:true});}
})();
