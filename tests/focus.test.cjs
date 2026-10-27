const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../focus-core.js');const data=vm.runInNewContext(fs.readFileSync('english-oral-hub/manifesto-data.js','utf8')+'\n'+fs.readFileSync('english-oral-hub/focus-data.js','utf8')+'\n({PARTIES,VOTERS})');
const {PARTIES,VOTERS}=data;assert.equal(VOTERS.length,8);for(const v of VOTERS){assert.ok(v.objection);assert.ok(v.followups.length===3);}
const all=C.blank();let previous=null;
for(const pi of [0,3]){
 const prior={main:'Our group idea',own:['Custom policy one','Custom policy two'],selected:[0,6,7],roles:['A','B','C']};const before=JSON.stringify(prior);const available=C.policies(PARTIES[pi],prior);assert.equal(available.length,8);const s=all.parties[pi];
 for(let n=0;n<4;n++){
 C.start(s,pi,VOTERS,previous);let r=s.current,v=VOTERS[r.voter_profile_id];assert.equal(r.stage,'listen');assert.notEqual(v.id,previous);assert.equal(r.objection,'');C.advance(r,'reveal',v);assert.equal(r.objection,'');
 C.advance(r,'listened',v);C.advance(r,'responded',v);assert.equal(r.stage,'respond');C.choose(r,available[6]);C.choose(r,available[7]);C.choose(r,available[0]);assert.equal(r.selected.length,2);assert.equal(r.selected[0].id,6);
 C.advance(r,'responded',v);assert.equal(r.objection,'');C.advance(r,'answered',v);assert.equal(r.stage,'objection');C.advance(r,'reveal',v);assert.equal(r.objection,v.objection);C.pressure(r,false);assert.equal(r.pressure,'');C.pressure(r,true);const once=r.pressure;C.pressure(r,true);assert.equal(r.pressure,once);
 C.advance(r,'answered',v);C.advance(r,'followed',v);assert.equal(r.stage,'followup');r.followup=v.followups[0];r.speaker='B';C.advance(r,'followed',v);r.verdict=C.VERDICTS[n%3];C.advance(r,'verdict',v);assert.equal(r.stage,'verdict');r.reason=C.REASONS[0];C.advance(r,'verdict',v);r.reflection='Use examples';previous=v.id;assert.ok(C.finish(s));
 const restored=C.cleanSession(JSON.parse(JSON.stringify(s)),pi,VOTERS);assert.equal(restored.rounds.length,n+1);
 }
 assert.equal(new Set(s.rounds.map(r=>r.voter_profile_id)).size,4);C.start(s,pi,VOTERS);assert.equal(s.current,null);const stats=C.report(s);assert.equal(stats.voters_met,4);assert.equal(Object.values(stats.verdicts).reduce((a,b)=>a+b,0),4);assert.equal(stats.policies.length,2);s.reflections.modify='Explain trade-offs';s.complete=true;assert.equal(C.cleanSession(s,pi,VOTERS).complete,true);assert.equal(JSON.stringify(prior),before);
}
assert.throws(()=>C.cleanSession({...all.parties[0],rounds:[...all.parties[0].rounds,all.parties[0].rounds[0]]},0,VOTERS));
assert.throws(()=>C.cleanSession({...all.parties[0],rounds:[all.parties[0].rounds[0],all.parties[0].rounds[0]]},0,VOTERS));
for(const f of ['focus-core.js','focus-groups.js','focus-teacher.js'])new vm.Script(fs.readFileSync('english-oral-hub/'+f,'utf8'));
const ui=fs.readFileSync('english-oral-hub/focus-groups.js','utf8'),teacher=fs.readFileSync('english-oral-hub/focus-teacher.js','utf8');assert.ok(!ui.includes("setItem('oral-manifesto"));assert.ok(!teacher.includes('setItem(OLD'));
console.log('PASS: two parties × four full rounds, unique voters, staged objections, policy limit, custom policies, pressure limit, verdict gating, restore validation, summaries, earlier data isolation and JavaScript syntax.');
