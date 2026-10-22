'use strict';
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='oral-manifesto-v1', TKEY='oral-manifesto-teacher-v1';
const blank=()=>({own:['',''],selected:[],main:'',contacts:'',case:{},roles:['','','','',''],final:'',listening:{},reflection:{}});
let party=0,step=0, teacher=false, state=PARTIES.map(blank), records=PARTIES.map(()=>[]), order=PARTIES.map((_,i)=>i), current=0,phase=0;
const short=(v,n=140)=>typeof v==='string'?v.slice(0,n):'';
const indicators=['Participation','Development','Interaction','Register','Fluency','Language','Team communication'];
function cleanRecords(value){
 if(!Array.isArray(value)||value.length!==7)throw Error('Invalid teacher record');
 return value.map(rows=>{if(!Array.isArray(rows)||rows.length>100)throw Error('Invalid student list');return rows.map(r=>{
 if(!r||typeof r!=='object')throw Error('Invalid student');
 const out={name:short(r.name,60),note:short(r.note,400)};
 for(const k of ['Presented','Asked','Answered'])out[k]=r[k]===true;
 for(const k of indicators)out[k]=['N/O','++','+','○','−'].includes(r[k])?r[k]:'N/O';
 return out;
 })});
}
function recover(key,read){try{const raw=localStorage.getItem(key);if(raw)read(JSON.parse(raw))}catch(e){
 try{const raw=localStorage.getItem(key);if(raw)localStorage.setItem(key+'-recovery-'+Date.now(),raw)}catch(_){}
 $('save-status').textContent='Some saved notes could not be loaded. The original was kept for recovery where browser storage is available. Import a valid backup.';
}}
recover(KEY,value=>{if(value?.version!==1||!Array.isArray(value.parties)||value.parties.length!==7)throw Error('Invalid notes');state=value.parties.map((data,party)=>cleanImport({type:'manifesto-party',version:1,party,data}))});
// Teacher records are loaded only after the local vault is unlocked.
let saveTimeout;
function save(kind='party'){
 try{
  if(kind==='teacher'){saveTeacherVault();return;}
  else localStorage.setItem(KEY,JSON.stringify({version:1,parties:state}));
  $('save-status').textContent='Saved on this browser · '+new Date().toLocaleTimeString();
 }catch(e){$('save-status').textContent='Browser storage unavailable or full. Download a backup before leaving.'}
}
function scheduleSave(kind='party'){clearTimeout(saveTimeout);saveTimeout=setTimeout(()=>save(kind),250)}
window.addEventListener('pagehide',()=>{clearTimeout(saveTimeout);save();if(teacher)save('teacher')});
const options=(selected,exclude=-1)=>PARTIES.map((p,i)=>i===exclude?'':`<option value="${i}" ${i===Number(selected)?'selected':''}>${esc(p.name)}</option>`).join('');
try{const chosen=Number(sessionStorage.getItem('manifesto-party'));if(Number.isInteger(chosen)&&chosen>=0&&chosen<7)party=chosen}catch(_){}
$('party-select').innerHTML=options(party);
const steps=['1 · Choose & justify','2 · Prepare launch','3 · Listen actively','4 · Reassess allies'];
$('step-tabs').innerHTML=steps.map((s,i)=>`<button data-step="${i}">${s}</button>`).join('');
const field=(label,key,value='',limit=140)=>`<label>${esc(label)}<input data-field="${esc(key)}" maxlength="${limit}" value="${esc(value)}" placeholder="Keywords only · ${limit} characters"></label>`;
function policies(i){return [...PARTIES[i].policies,...state[i].own]}
function render(){const p=PARTIES[party],s=state[party];$('identity').innerHTML=`<strong>${esc(p.name)}</strong> · ${esc(p.target)}<br><strong>Register:</strong> ${esc(p.register)}<br><small>${esc(p.style)}</small>`;document.querySelectorAll('[data-step]').forEach(b=>{b.classList.toggle('active',+b.dataset.step===step);b.setAttribute('aria-pressed',String(+b.dataset.step===step))});let html='';
if(step===0){html=`<h2>Choose your manifesto.</h2><p>Discuss your eight possible policies. Choose exactly THREE that represent your identity and audience. You may include one of your own ideas.</p><div class="banner warning"><strong>No full scripts.</strong> Keywords, bullet points and useful expressions only.</div>${field('Your main idea','main',s.main)}${field('Previous agreements, disagreements or possible allies','contacts',s.contacts)}<details><summary>Add the two policies you created in Campaign Hub</summary><p>Bring these from your previous session notes. They are not available automatically.</p>${field('Your own policy 1','own.0',s.own[0])}${field('Your own policy 2','own.1',s.own[1])}</details><p class="count" role="status">${s.selected.length}/3 selected</p><div class="grid">${policies(party).map((text,i)=>`<label class="policy"><input type="checkbox" data-policy="${i}" ${s.selected.includes(i)?'checked':''} ${!text.trim()||s.selected.length===3&&!s.selected.includes(i)?'disabled':''}><span>${esc(text||'Add your own policy above')}</span></label>`).join('')}</div><h2>Build your case.</h2><p>WHAT? WHY? WHO? CHALLENGE? Keep each answer under 140 characters.</p>${s.selected.map(i=>`<div class="card" data-case-policy="${i}"><h3>${esc(policies(party)[i])}</h3><div class="grid">${['WHAT','WHY','WHO','CHALLENGE'].map(k=>field(k+'?','case.'+i+'.'+k,s.case[i]?.[k])).join('')}</div></div>`).join('')}<button class="primary" data-next="1" ${s.selected.length!==3?'disabled':''}>Prepare the launch →</button>`}
if(step===1){html=`<h2>Build your manifesto launch.</h2><p>Two minutes. Every member must speak and know the whole manifesto. Combine roles if your group has three members.</p>${s.selected.length!==3?'<div class="banner warning">Return to step 1 and choose exactly three policies.</div>':''}<div class="card"><h3>1. Who are we?</h3><p>${esc(p.name)} · ${esc(p.target)}</p><h3>2. What do we stand for?</h3><p>${esc(s.main||'Add your main idea in step 1.')}</p><h3>3. Our three proposals</h3><ol>${s.selected.map(i=>`<li>${esc(policies(party)[i])}</li>`).join('')}</ol><h3>4. Final message</h3>${field('One idea to remember','final',s.final)}</div><div class="card"><h3>Share the speaking</h3>${['Introduce the party','Present Policy 1','Present Policy 2','Present Policy 3','Close'].map((t,i)=>field(t+' — speaker','roles.'+i,s.roles[i],60)).join('')}</div><div class="banner">Rehearse aloud. Do not write or memorise a full speech. Check that everybody speaks.</div>`}
if(step===2){html=`<h2>Listen to the other parties.</h2><p>Record one policy you support and one question or problem. Use these notes in the Q&A and future campaign sessions.</p>${PARTIES.map((p,i)=>i===party?'':`<details><summary>${esc(p.name)}</summary>${field('One policy we support','listening.'+i+'.support',s.listening[i]?.support)}${field('One question / problem','listening.'+i+'.question',s.listening[i]?.question)}</details>`).join('')}`}
if(step===3){html=`<h2>Back to party headquarters.</h2><p>Share reactions. Reconsider your alliances together.</p>${field('Which party surprised us?','reflection.surprise',s.reflection.surprise)}${field('Which party do we agree with most?','reflection.agree',s.reflection.agree)}${field('Main rival / biggest disagreement','reflection.rival',s.reflection.rival)}<label>Has our possible ally changed?<select data-field="reflection.changed"><option value="">Choose</option>${['Yes','No'].map(x=>`<option ${s.reflection.changed===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Our best possible ally now<select data-field="reflection.ally"><option value="">Choose another party</option>${options(s.reflection.ally===''||s.reflection.ally==null?-1:s.reflection.ally,party)}</select></label>${field('Why?','reflection.reason',s.reflection.reason)}${field('Which policy could we work on together?','reflection.shared',s.reflection.shared)}<div class="banner"><strong>Your manifesto and political map are saved on this browser.</strong> Download a party file below to keep them for the next campaign day.</div>`}
$('party-work').innerHTML=html;}
$('party-select').onchange=e=>{party=+e.target.value;try{sessionStorage.setItem('manifesto-party',String(party))}catch(_){}render()};$('step-tabs').onclick=e=>{if(e.target.dataset.step!==undefined){step=+e.target.dataset.step;render()}};
$('party-work').oninput=e=>{const key=e.target.dataset.field;if(!key)return;const parts=key.split('.');let obj=state[party];for(const k of parts.slice(0,-1))obj=obj[k]??=( {} );obj[parts.at(-1)]=e.target.value;if(key.startsWith('own.'))refreshPolicies();scheduleSave()};
$('party-work').onchange=e=>{if(e.target.dataset.policy!==undefined){const i=+e.target.dataset.policy,s=state[party];if(e.target.checked&&s.selected.length<3)s.selected.push(i);else s.selected=s.selected.filter(x=>x!==i);save();render()}};
$('party-work').onclick=e=>{if(e.target.dataset.next){step=+e.target.dataset.next;render();$('step-tabs').scrollIntoView({behavior:'smooth'})}};
const questionMap=[[1,4],[3,0],[4,6],[1,5],[0,2],[3,6],[2,5]];
const phases=[['Choose & justify',480],['Prepare the launch',420],['Manifesto presentation',120],['Questions & answers',120],['Back to headquarters',300],['Feedback / transitions',420]];
let seconds=480,remaining=480,deadline=0,ticking=null;
function stop(){clearInterval(ticking);ticking=null;$('start').textContent='Start / resume'}
function draw(){ $('timer').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');$('timer').classList.toggle('done',remaining===0)}
function tick(){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));draw();if(!remaining){stop();$('timer-message').textContent='Time is up. Finish your sentence.'}}
function setPhase(i){phase=i;stop();seconds=phases[i][1];remaining=seconds;$('timer-message').textContent='';$('speaker-prompt').textContent='';draw();renderStage()}
$('start').onclick=()=>{if(ticking){tick();stop()}else{if(!remaining)remaining=seconds;deadline=Date.now()+remaining*1000;ticking=setInterval(tick,200);$('start').textContent='Pause';$('timer-message').textContent='';draw()}};$('reset').onclick=()=>setPhase(phase);document.addEventListener('visibilitychange',()=>{if(ticking)tick()});
function renderStage(){const i=order[current];$('presenter').innerHTML=options(i);$('order').textContent='Order: '+order.map((n,j)=>(j===current?'▶ ':'')+PARTIES[n].name).join(' → ');$('next').disabled=current===6;$('stage-party').textContent=phase===2||phase===3?PARTIES[i].name:'All parties';$('phase-title').textContent=phases[phase][0];$('stage-policies').innerHTML=(phase===2||phase===3)?(state[i].selected.length?state[i].selected.map(n=>`<span class="pill">${esc(policies(i)[n])}</span>`).join(''):'<p>Manifesto not on this device yet. Import the party file or present orally.</p>'):'';$('questioners').textContent=phase===3?'Main questioners: '+questionMap[i].map(n=>PARTIES[n].name).join(' + ')+'. Ask a question now. Others may join if time allows.':'';$('stage-help').textContent=phase===2?'Who are you? What do you stand for? What are your THREE proposals? Why do they matter?':phase===3?'Ask about clarity, problems, fairness, consequences, disagreement or cooperation.':phase===4?'Which party surprised us? Has our possible ally changed? Which policy could we support?':phase===5?'Reflect on clear reasons, useful questions, appropriate register and spontaneous responses.':'Discuss together. Keywords only. Every member must speak.';$('different').hidden=phase!==3;document.querySelectorAll('[data-phase]').forEach(b=>b.classList.toggle('active',+b.dataset.phase===phase));renderRecords()}
$('phase-buttons').innerHTML=phases.map((p,i)=>`<button data-phase="${i}">${p[0]} · ${p[1]/60} min</button>`).join('');$('phase-buttons').onclick=e=>{if(e.target.dataset.phase!==undefined)setPhase(+e.target.dataset.phase)};
$('presenter').onchange=e=>{current=order.indexOf(+e.target.value);setPhase(2)};$('next').onclick=()=>{if(current<6){current++;setPhase(2)}};$('shuffle').onclick=()=>{for(let i=6;i>0;i--){let j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}current=0;setPhase(2)};
$('different').onclick=()=>{$('speaker-prompt').textContent='DIFFERENT SPEAKER — another member should answer. Build on your teammate’s idea.'};$('project').onclick=()=>document.body.classList.add('projection');$('exit-projection').onclick=()=>document.body.classList.remove('projection');document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('projection')});
function mode(t){if(t&&!vaultKey){openVault();return;}teacher=t;$('student').hidden=t;$('teacher').hidden=!t;$('student-mode').classList.toggle('active',!t);$('teacher-mode').classList.toggle('active',t);if(t)renderStage()}
$('teacher-mode').onclick=()=>mode(true);$('student-mode').onclick=()=>vaultKey?lockVault():mode(false);
function renderRecords(){let i=order[current];$('teacher-records').innerHTML=`<p><strong>${esc(PARTIES[i].name)}</strong> · ++ Very strong · + Positive · ○ Sufficient / neutral · − Weak · N/O Not observed</p>`+records[i].map((r,n)=>`<details><summary>${esc(r.name||'Student '+(n+1))}</summary><label>Name / initials<input data-student="${n}" data-key="name" maxlength="60" value="${esc(r.name)}"></label><div class="row">${['Presented','Asked','Answered'].map(k=>`<label><input type="checkbox" data-student="${n}" data-key="${k}" ${r[k]?'checked':''}>${k}</label>`).join('')}</div><div class="grid">${indicators.map(k=>`<label>${k}<select data-student="${n}" data-key="${k}">${['N/O','++','+','○','−'].map(v=>`<option ${r[k]===v?'selected':''}>${v}</option>`).join('')}</select></label>`).join('')}</div><label>Quick note<textarea data-student="${n}" data-key="note" maxlength="400">${esc(r.note)}</textarea></label></details>`).join('')}
$('add-student').onclick=()=>{if(!vaultKey)return;records[order[current]].push({name:'',note:''});save('teacher');renderRecords();$('teacher-records').lastElementChild.open=true};$('teacher-records').oninput=e=>{if(!vaultKey)return;if(e.target.dataset.student===undefined)return;const r=records[order[current]][+e.target.dataset.student];r[e.target.dataset.key]=e.target.type==='checkbox'?e.target.checked:e.target.value;save('teacher');if(e.target.dataset.key==='name')e.target.closest('details').querySelector('summary').textContent=e.target.value||'Student'};
function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('export-party').onclick=()=>download(PARTIES[party].name.toLowerCase().replaceAll(' ','-')+'-manifesto.json',{type:'manifesto-party',version:1,party,data:state[party]});$('export-teacher').onclick=()=>download('manifesto-teacher-evidence.json',{type:'manifesto-teacher',version:1,parties:PARTIES.map((p,i)=>({name:p.name,students:records[i]}))});
// Rebuild imports from an explicit allowlist. Teacher evidence is never imported or shared with a party file.
function cleanImport(file){if(!file||file.type!=='manifesto-party'||file.version!==1||!Number.isInteger(file.party)||file.party<0||file.party>6||!file.data||typeof file.data!=='object')throw Error('Invalid party file');const d=file.data,o=blank();o.main=short(d.main);o.contacts=short(d.contacts);o.final=short(d.final);o.own=[0,1].map(i=>short(d.own?.[i]));o.selected=[...new Set(Array.isArray(d.selected)?d.selected:[])].filter(i=>Number.isInteger(i)&&i>=0&&i<8&&(i<6||o.own[i-6].trim())).slice(0,3);o.roles=[0,1,2,3,4].map(i=>short(d.roles?.[i],60));for(let i=0;i<8;i++){o.case[i]={};for(const k of ['WHAT','WHY','WHO','CHALLENGE'])o.case[i][k]=short(d.case?.[i]?.[k])}for(let i=0;i<7;i++)o.listening[i]={support:short(d.listening?.[i]?.support),question:short(d.listening?.[i]?.question)};for(const k of ['surprise','agree','rival','changed','ally','reason','shared'])o.reflection[k]=short(d.reflection?.[k]);if(!['Yes','No'].includes(o.reflection.changed))o.reflection.changed='';if(!/^[0-6]$/.test(o.reflection.ally)||Number(o.reflection.ally)===file.party)o.reflection.ally='';return o}
$('import-party').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>100000)throw Error('File too large');const file=JSON.parse(await f.text()),clean=cleanImport(file);if(!confirm('Replace the saved notes for '+PARTIES[file.party].name+' on this browser?'))return;state[file.party]=clean;party=file.party;$('party-select').value=party;save();render();if(teacher)renderStage();$('save-status').textContent='Imported '+PARTIES[party].name+'. Teacher observations unchanged.'}catch(err){$('save-status').textContent='Could not import this file. Choose a party JSON exported from this page.'}finally{e.target.value=''}};
render();draw();

$("original-guide").onclick=()=>{const bytes=Uint8Array.from(atob(JSON.parse($("guide-data").textContent)),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}));const a=document.createElement("a");a.href=url;a.download="Manifesto_Launch.docx";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

function parseTeacherBackup(file){
 if(file?.type!=='manifesto-teacher'||file.version!==1||!Array.isArray(file.parties)||file.parties.length!==7)throw Error('Invalid teacher backup');
 if(file.parties.some((p,i)=>p?.name!==PARTIES[i].name))throw Error('Party list mismatch');
 return cleanRecords(file.parties.map(p=>p.students));
}
$('import-teacher').onchange=async e=>{if(!vaultKey)return;const file=e.target.files[0];if(!file)return;try{
 if(file.size>1000000)throw Error('File too large');
 const next=parseTeacherBackup(JSON.parse(await file.text()));
 if(!confirm('Replace teacher observations on this browser with this backup? Download the current record first if you need to keep it.'))return;
 records=next;save('teacher');renderRecords();
}catch(_){$('save-status').textContent='Could not restore this backup. Use a teacher JSON exported from this activity.'}finally{e.target.value=''}};
$('export-csv').onclick=()=>{
 const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
 const rows=[['Party','Student','Presented','Asked','Answered',...indicators,'Note']];
 records.forEach((list,i)=>list.forEach(r=>rows.push([PARTIES[i].name,r.name,...['Presented','Asked','Answered'].map(k=>r[k]?'Yes':'No'),...indicators.map(k=>r[k]||'N/O'),r.note])));
 const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='manifesto-teacher-evidence.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};

const VKEY='oral-manifesto-vault-v1';
let vaultKey=null,vaultSalt=null,vaultQueue=Promise.resolve(),idleTimer=null,vaultSaving=0;
const to64=bytes=>{let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text)};
const from64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function deriveVaultKey(password,salt){
 const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function sealVault(text,key,salt){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(text));return {version:1,salt:to64(salt),iv:to64(iv),data:to64(new Uint8Array(encrypted))}}
async function unsealVault(envelope,key){if(envelope?.version!==1)throw Error('Invalid vault');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(envelope.iv)},key,from64(envelope.data)))}
function touchVault(){if(!vaultKey)return;clearTimeout(idleTimer);idleTimer=setTimeout(()=>lockVault(),15*60*1000)}
function saveTeacherVault(){
 if(!vaultKey)return;
 const snapshot=JSON.stringify(records),key=vaultKey,salt=vaultSalt;vaultSaving++;
 vaultQueue=vaultQueue.catch(()=>{}).then(async()=>{const sealed=await sealVault(snapshot,key,salt);localStorage.setItem(VKEY,JSON.stringify(sealed));$('save-status').textContent='Teacher notes saved and encrypted on this browser.'}).catch(()=>{$('save-status').textContent='Teacher notes could not be saved. Download a backup before locking or leaving.';throw Error('Vault save failed')}).finally(()=>{vaultSaving--});
 // Avoid unhandled rejection; callers can still await vaultQueue and handle failure.
 vaultQueue.catch(()=>{});touchVault();return vaultQueue;
}
function openVault(){
 if(!crypto?.subtle){$('save-status').textContent='Secure teacher storage requires HTTPS and a browser with Web Crypto support.';return;}
 let exists;try{exists=!!localStorage.getItem(VKEY)}catch(_){$('save-status').textContent='Enable browser storage to use the protected teacher notebook.';return;}
 $('vault-title').textContent=exists?'Unlock your teacher notebook':'Protect your teacher notebook';
 $('vault-repeat-label').hidden=exists;$('vault-repeat').required=!exists;
 $('vault-password').autocomplete=exists?'current-password':'new-password';
 $('vault-submit').textContent=exists?'Unlock':'Create local password';$('vault-message').textContent='';
 $('vault-form').reset();$('vault-dialog').showModal();$('vault-password').focus();
}
$('vault-cancel').onclick=()=>$('vault-dialog').close();
$('vault-form').onsubmit=async e=>{
 e.preventDefault();const password=$('vault-password').value;$('vault-submit').disabled=true;
 try{
  const raw=localStorage.getItem(VKEY);let next,key,salt;
  if(raw){const envelope=JSON.parse(raw);salt=from64(envelope.salt);key=await deriveVaultKey(password,salt);next=cleanRecords(JSON.parse(await unsealVault(envelope,key)))}
  else{
   if(password.length<12)throw Error('Use at least 12 characters.');
   if(password!==$('vault-repeat').value)throw Error('The passwords do not match.');
   salt=crypto.getRandomValues(new Uint8Array(16));key=await deriveVaultKey(password,salt);
   const legacy=localStorage.getItem(TKEY);next=legacy?cleanRecords(JSON.parse(legacy)):PARTIES.map(()=>[]);
   const envelope=await sealVault(JSON.stringify(next),key,salt);localStorage.setItem(VKEY,JSON.stringify(envelope));
   // Verify the encrypted copy before replacing the old plaintext storage.
   cleanRecords(JSON.parse(await unsealVault(JSON.parse(localStorage.getItem(VKEY)),key)));
   if(legacy)localStorage.removeItem(TKEY);
  }
  vaultKey=key;vaultSalt=salt;records=next;$('vault-form').reset();$('vault-dialog').close();touchVault();mode(true);
 }catch(err){$('vault-message').textContent=localStorage.getItem(VKEY)?'Could not unlock. Check your password. If the saved file is damaged, keep it and use your backup.':(err.message.startsWith('Use ')||err.message.startsWith('The passwords')?err.message:'Could not create the notebook. Existing records have been kept. Check browser storage.');}
 finally{$('vault-submit').disabled=false;}
};
async function lockVault(){
 if(!vaultKey)return;
 try{await saveTeacherVault()}catch(_){return;}
 clearTimeout(idleTimer);vaultKey=null;vaultSalt=null;records=PARTIES.map(()=>[]);$('teacher-records').innerHTML='';stop();document.body.classList.remove('projection');mode(false);$('save-status').textContent='Teacher notebook locked.';
}
$('lock-teacher').onclick=lockVault;
document.addEventListener('pointerdown',touchVault);document.addEventListener('keydown',touchVault);
window.addEventListener('beforeunload',e=>{if(vaultSaving){e.preventDefault();e.returnValue=''}});

function refreshPolicies(){
 const s=state[party],list=policies(party);s.selected=s.selected.filter(i=>list[i].trim());
 document.querySelectorAll('[data-policy]').forEach(box=>{const i=Number(box.dataset.policy);box.checked=s.selected.includes(i);box.disabled=!list[i].trim()||(s.selected.length===3&&!box.checked);box.nextElementSibling.textContent=list[i]||'Add your own policy above'});
 document.querySelectorAll('[data-case-policy]').forEach(card=>{const i=Number(card.dataset.casePolicy);if(!s.selected.includes(i))card.remove();else card.querySelector('h3').textContent=list[i]});
 document.querySelector('.count').textContent=s.selected.length+'/3 selected';document.querySelector('[data-next]').disabled=s.selected.length!==3;
}
