/* Shared writing affordances. Passwords and file uploads are intentionally excluded. */
'use strict';
(()=>{
 const selector='textarea[maxlength="999"],input[maxlength="999"]';
 let nextId=0;
 const counters=new WeakMap();
 function enhance(el){
  if(counters.has(el))return;
  const count=document.createElement('small');
  count.className='character-count';count.id='character-count-'+(++nextId);
  el.insertAdjacentElement('afterend',count);
  el.setAttribute('aria-describedby',[el.getAttribute('aria-describedby'),count.id].filter(Boolean).join(' '));
  const update=()=>{const used=el.value.length;count.textContent=used+' / 999 characters'+(used===999?' · Limit reached':'');};
  counters.set(el,update);update();
 }
 function scan(node){if(node.nodeType!==1)return;if(node.matches(selector))enhance(node);node.querySelectorAll(selector).forEach(enhance);}
 scan(document.body);
 new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(scan))).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('input',e=>{if(e.target.matches(selector)){if(e.target.value.length>999)e.target.value=e.target.value.slice(0,999);counters.get(e.target)?.();}},true);
})();
