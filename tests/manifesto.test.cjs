const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const data=fs.readFileSync('english-oral-hub/manifesto-data.js','utf8');const app=fs.readFileSync('english-oral-hub/manifesto-v3.js','utf8');
function boot(saved={}){const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',hidden:false,value:'',classList:{toggle(){},add(){},remove(){}},setAttribute(){},reset(){},focus(){},showModal(){},close(){},addEventListener(){},scrollIntoView(){},lastElementChild:{}});return elements.get(id)};const storage=new Map(Object.entries(saved));const context=vm.createContext({document:{getElementById:element,querySelectorAll:()=>[],addEventListener(){},body:{classList:{toggle(){},add(){},remove(){}}}},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null,setItem(){}},Date,JSON,Number,Array,String,Set,Object,Math,Error,console,crypto:require('node:crypto').webcrypto,TextEncoder,TextDecoder,btoa,atob,setTimeout,clearTimeout,setInterval,clearInterval,Uint8Array,Blob,URL});vm.runInContext(data+'\n'+app,context);return {run:s=>vm.runInContext(s,context),storage,elements}}
const t=boot();assert.equal(t.run('PARTIES.length'),7);assert.equal(t.run('PARTIES.every(p=>p.policies.length===6)'),true);
assert.equal(t.run(`cleanImport({type:'manifesto-party',version:1,party:0,data:{selected:[0,0,1,2,3,99],main:'x'.repeat(300),reflection:{ally:'0'}}}).selected.length`),3);
assert.equal(t.run(`cleanImport({type:'manifesto-party',version:1,party:0,data:{main:'x'.repeat(1000)}}).main.length`),999);
assert.equal(t.run(`cleanImport({type:'manifesto-party',version:1,party:0,data:{reflection:{ally:'0'}}}).reflection.ally`),'');
assert.throws(()=>t.run('cleanImport(null)'));
assert.throws(()=>t.run(`cleanImport({type:'manifesto-teacher',version:1,party:0,data:{}})`));
assert.equal(t.run(`cleanRecords([[{name:'Test',Interaction:'bogus',Asked:true}],[],[],[],[],[],[]])[0][0].Interaction`),'N/O');
assert.equal(t.run('questionMap.every((qs,i)=>qs.length===2&&!qs.includes(i)&&new Set(qs).size===2)'),true);
assert.equal(t.run('PARTIES.every((_,i)=>questionMap.flat().filter(q=>q===i).length===2)'),true);
const invalid=boot({'oral-manifesto-v1':'{invalid','oral-manifesto-teacher-v1':'[{},[],[],[],[],[],[]]'});assert.equal(invalid.run('state.length'),7);assert.ok([...invalid.storage.keys()].some(k=>k.startsWith('oral-manifesto-v1-recovery-')));
const recover=boot({'oral-manifesto-v1':JSON.stringify({version:1,parties:Array.from({length:7},()=>({main:'kept',selected:[0,1,2,3]}))})});assert.equal(recover.run('state[0].main'),'kept');assert.equal(recover.run('state[0].selected.length'),3);
assert.equal(t.run(`parseTeacherBackup({type:'manifesto-teacher',version:1,parties:PARTIES.map(p=>({name:p.name,students:[]}))}).length`),7);
assert.throws(()=>t.run(`parseTeacherBackup({type:'manifesto-teacher',version:1,parties:[]})`));
t.run(`localStorage.setItem(TKEY,'do not overwrite');save()`);assert.equal(t.storage.get('oral-manifesto-teacher-v1'),'do not overwrite');
assert.equal(t.run(`esc('<img onerror="bad">')`),'&lt;img onerror=&quot;bad&quot;&gt;');
console.log('PASS: 16 assertions — data recovery, import validation, selection limits, teacher backup, balanced questioners, escaping, isolated saves.');

(async()=>{const c=boot({'oral-manifesto-teacher-v1':JSON.stringify([[{name:'Private'}],[],[],[],[],[],[]])});assert.equal(c.run('records[0].length'),0);await c.run(`(async()=>{const salt=crypto.getRandomValues(new Uint8Array(16));const key=await deriveVaultKey('test-fixture-only-123',salt);const plain=JSON.stringify({notes:'Private test '.repeat(20000)});const sealed=await sealVault(plain,key,salt);if(await unsealVault(sealed,key)!==plain)throw Error('Round trip failed');const wrong=await deriveVaultKey('different-test-secret',salt);let rejected=false;try{await unsealVault(sealed,wrong)}catch(_){rejected=true}if(!rejected)throw Error('Wrong password accepted');const bytes=from64(sealed.data);bytes[0]^=1;sealed.data=to64(bytes);try{await unsealVault(sealed,key)}catch(_){return}throw Error('Tampering accepted')})()`);console.log('PASS: encrypted round trip, large payload, wrong password, tamper rejection, legacy records stay locked.');})().catch(e=>{console.error(e);process.exitCode=1});

(async()=>{const c=boot({'oral-manifesto-teacher-v1':JSON.stringify([[{name:'Migration fixture',Asked:true}],[],[],[],[],[],[]])});
c.run(`$('vault-password').value='synthetic-fixture-123';$('vault-repeat').value='synthetic-fixture-123'`);
await c.run(`$('vault-form').onsubmit({preventDefault(){}})`);
assert.equal(c.storage.has('oral-manifesto-teacher-v1'),false);assert.ok(c.storage.has('oral-manifesto-vault-v1'));
assert.equal(c.run('records[0][0].name'),'Migration fixture');assert.equal(c.run('teacher'),true);
await c.run('lockVault()');assert.equal(c.run('vaultKey'),null);assert.equal(c.run('records[0].length'),0);assert.equal(c.run('teacher'),false);
c.elements.get('vault-password').value='synthetic-fixture-123';await c.run(`$('vault-form').onsubmit({preventDefault(){}})`);assert.equal(c.run('records[0][0].Asked'),true);await c.run('lockVault()');
console.log('PASS: legacy migration, encrypted persistence, lock clears memory, unlock restores records.');})().catch(e=>{console.error(e);process.exitCode=1});

const longNotes=boot({'oral-manifesto-v1':JSON.stringify({version:1,parties:Array.from({length:7},()=>({main:'x'.repeat(999),own:['y'.repeat(999),''],roles:['z'.repeat(999)]}))})});assert.equal(longNotes.run('state[0].main.length'),999);assert.equal(longNotes.run('state[0].own[0].length'),999);assert.equal(longNotes.run('state[0].roles[0].length'),999);longNotes.run('save()');assert.equal(JSON.parse(longNotes.storage.get('oral-manifesto-v1')).parties[0].main.length,999);
