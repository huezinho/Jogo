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
 const tip=document.createElement('div');tip.id='rpgActionTooltip';tip.role='tooltip';tip.hidden=true;document.body.append(tip);
 let owner=null;
 function hide(){if(owner){owner.removeAttribute('aria-describedby');owner=null;}tip.hidden=true;}
 function show(event){const b=event.target.closest('[data-hud-description],[data-hud="flee"],.region-map-boss-btn');if(!b){hide();return;}owner=b;tip.dataset.kind=b.matches('.region-map-boss-btn')?'boss':b.matches('.rpg-coins')?'balance':'action';tip.textContent=b.dataset.hudDescription||b.dataset.tooltip;currency(tip);tip.hidden=false;b.setAttribute('aria-describedby',tip.id);
  const r=b.getBoundingClientRect(),t=tip.getBoundingClientRect(),side=b.matches('.region-map-boss-btn,.rpg-coins');tip.style.left=Math.max(8,Math.min(innerWidth-t.width-8,side?r.left-t.width-12:r.left+r.width/2-t.width/2))+'px';tip.style.top=Math.max(8,Math.min(innerHeight-t.height-8,side?r.top+(r.height-t.height)/2:r.top-t.height-12))+'px';
 }
 document.addEventListener('mouseover',show);document.addEventListener('focusin',show);
 document.addEventListener('mouseout',e=>{if(owner&&!owner.contains(e.relatedTarget))hide();});
 document.addEventListener('focusout',hide);document.addEventListener('click',hide);window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
 const root=document.getElementById('game');
 if(root){const observer=new MutationObserver(()=>{observer.disconnect();if(owner&&!owner.isConnected)hide();currency(root);observer.observe(root,{subtree:true,childList:true,characterData:true});});currency(root);observer.observe(root,{subtree:true,childList:true,characterData:true});}
})();
