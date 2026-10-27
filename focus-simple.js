'use strict';
const byId=id=>document.getElementById(id),safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let encounter=0,revealed=false,firstVoter=0;
function draw(){const finished=encounter===4,v=VOTERS[(firstVoter+encounter)%VOTERS.length];byId('counter').textContent=finished?'FINAL REFLECTION':`VOTER ${encounter+1} OF 4`;
byId('voter').hidden=finished;byId('closing').hidden=!finished;byId('actions').hidden=finished;
if(!finished){byId('name').textContent=v.name+', '+v.age;byId('role').textContent=v.role;byId('background').innerHTML=v.background.map(x=>`<li>${safe(x)}</li>`).join('');byId('concerns').textContent=v.concerns.join(' · ');byId('objection').hidden=!revealed;byId('quote').textContent='“'+v.objection+'”';byId('followup').textContent=v.followups[0];byId('reveal').disabled=revealed;byId('reveal').textContent=revealed?'Objection revealed':'Show objection';byId('next').disabled=!revealed;byId('next').textContent=encounter===3?'Finish & reflect':'Next voter';} }
byId('reveal').onclick=()=>{revealed=true;draw();byId('objection').scrollIntoView({behavior:'smooth',block:'nearest'});};
byId('next').onclick=()=>{if(!revealed)return;encounter++;revealed=false;draw();byId('main').focus();window.scrollTo(0,0);};
byId('restart').onclick=()=>{encounter=0;revealed=false;firstVoter=(firstVoter+4)%VOTERS.length;draw();window.scrollTo(0,0);};
byId('start-with').innerHTML=VOTERS.map((v,i)=>`<option value="${i}">${safe(v.name)}, ${v.age}</option>`).join('');
byId('apply-voter').onclick=()=>{firstVoter=+byId('start-with').value;encounter=0;revealed=false;draw();byId('teacher-help').open=false;window.scrollTo(0,0);};
byId('party').innerHTML=PARTIES.map((p,i)=>`<option value="${i}">${safe(p.name)}</option>`).join('');
function policies(){const i=+byId('party').value,p=PARTIES[i];let d={};try{const focus=JSON.parse(localStorage.getItem('oral-focus-groups-v1'));const manifesto=JSON.parse(localStorage.getItem('oral-manifesto-v1'));d=focus?.sources?.[i]||manifesto?.parties?.[i]||{};}catch(_){}
byId('policy-identity').textContent=p.target+' · '+p.register;byId('policies').innerHTML=[...p.policies,...(Array.isArray(d.own)?d.own.slice(0,2):[])].filter(x=>typeof x==='string'&&x.trim()).map(x=>`<li>${safe(x)}</li>`).join('');}
byId('party').onchange=policies;policies();draw();
