'use strict';
// Pure state transitions shared by the browser and acceptance tests. Day 1 is read-only.
const FocusCore=(()=>{
 const KEY='oral-focus-groups-v1',STAGES=['listen','respond','objection','followup','verdict','summary'];
 const VERDICTS=['Convinced','Partly convinced','Not convinced'];
 const REASONS=['They understood our concern.','Their policy could actually help us.','Their explanation was clear.','They answered our objection well.','They did not answer our objection.','Their policy did not really solve our problem.','Their explanation was unclear.','Other.'];
 const PRESSURES=['The voter does not understand your explanation.','The voter strongly disagrees.','The voter asks for a concrete example.','The voter says another party has a better proposal.','The voter politely interrupts.','The voter asks you to explain your policy more simply.'];
 const short=(s,n=120)=>typeof s==='string'?s.slice(0,n):'';
 const fresh=()=>({rounds:[],current:null,deck:[],reflections:{liked:'',difficult:'',modify:'',hardest:''},complete:false});
 const blank=()=>({version:1,parties:Array.from({length:7},fresh),sources:Array(7).fill(null),pressure:false,lastVoter:null});
 function source(d){return {main:short(d?.main,140),own:[0,1].map(i=>short(d?.own?.[i],140)),selected:[...new Set(Array.isArray(d?.selected)?d.selected:[])].filter(i=>Number.isInteger(i)&&i>=0&&i<8).slice(0,3),roles:[0,1,2,3,4].map(i=>short(d?.roles?.[i],60))};}
 function policies(p,d){return [...p.policies,...source(d).own].map((text,id)=>({id,text})).filter(p=>p.text.trim());}
 function shuffle(xs,random=Math.random){xs=[...xs];for(let i=xs.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[xs[i],xs[j]]=[xs[j],xs[i]];}return xs;}
 function start(s,party,voters,exclude=null){if(s.current||s.rounds.length===4)return;let used=s.rounds.map(r=>r.voter_profile_id);let pool=voters.map(v=>v.id).filter(id=>!used.includes(id));let eligible=pool.filter(id=>id!==exclude);let id=shuffle(eligible.length?eligible:pool)[0];s.deck=[...used,id];s.current=round(party,voters[id]);}
 function round(party,v){return {party_id:party,voter_profile_id:v.id,stage:'listen',selected:[],voter_concerns:[...v.concerns],verdict:'',reason:'',objection:'',pressure:'',reflection:'',followup:'',speaker:''};}
 function choose(r,p){if(r.stage!=='respond')return;if(r.selected.some(x=>x.id===p.id))r.selected=r.selected.filter(x=>x.id!==p.id);else if(r.selected.length<2)r.selected.push({id:p.id,text:p.text});}
 function advance(r,action,v){
 if(action==='listened'&&r.stage==='listen')r.stage='respond';
 else if(action==='responded'&&r.stage==='respond'&&r.selected.length>=1&&r.selected.length<=2)r.stage='objection';
 else if(action==='reveal'&&r.stage==='objection'&&!r.objection)r.objection=v.objection;
 else if(action==='answered'&&r.stage==='objection'&&r.objection)r.stage='followup';
 else if(action==='followed'&&r.stage==='followup'&&r.followup)r.stage='verdict';
 else if(action==='verdict'&&r.stage==='verdict'&&VERDICTS.includes(r.verdict)&&REASONS.includes(r.reason))r.stage='summary';
 }
 function finish(s){if(s.current?.stage!=='summary'||!s.current.verdict||!s.current.reason||s.rounds.length>=4)return false;s.rounds.push(s.current);s.current=null;return true;}
 function pressure(r,enabled){if(enabled&&r&&!r.pressure&&['respond','objection','followup'].includes(r.stage))r.pressure=PRESSURES[Math.floor(Math.random()*PRESSURES.length)];}
 function report(s){const concerns={},used={};const verdicts=Object.fromEntries(VERDICTS.map(v=>[v,0]));for(const r of s.rounds){verdicts[r.verdict]++;for(const c of r.voter_concerns)concerns[c]=(concerns[c]||0)+1;for(const p of r.selected){let x=used[p.id]??={text:p.text,uses:0,convinced:0,questioned:0};x.uses++;if(r.verdict==='Convinced')x.convinced++;else x.questioned++;}}
 const enough=Object.values(used).filter(p=>p.uses>=2);
 return {voters_met:s.rounds.length,verdicts,concerns:Object.entries(concerns).sort((a,b)=>b[1]-a[1]),policies:Object.values(used),successful:enough.filter(x=>x.convinced>0).sort((a,b)=>b.convinced-a.convinced)[0]||null,questioned:enough.filter(x=>x.questioned>0).sort((a,b)=>b.questioned-a.questioned)[0]||null,difficult_objections:s.rounds.filter(r=>r.verdict!=='Convinced').map(r=>r.objection),campaign_learning:{...s.reflections}};}
 function cleanSession(input,party,voters){if(!input||!Array.isArray(input.rounds)||input.rounds.length>4)throw Error('Invalid session');const s=fresh();
 function cleanRound(r,finished){if(!r||r.party_id!==party||!Number.isInteger(r.voter_profile_id)||!voters[r.voter_profile_id]||!STAGES.includes(r.stage)||!Array.isArray(r.selected)||r.selected.length>2)throw Error('Invalid round');let v=voters[r.voter_profile_id],out=round(party,v);out.stage=r.stage;out.selected=r.selected.map(p=>{if(!Number.isInteger(p.id)||p.id<0||p.id>7||!short(p.text,140).trim())throw Error('Invalid policy');return {id:p.id,text:short(p.text,140)}});if(new Set(out.selected.map(p=>p.id)).size!==out.selected.length)throw Error('Duplicate policy');out.objection=r.objection?v.objection:'';out.followup=short(r.followup,180);out.speaker=short(r.speaker,60);out.reflection=short(r.reflection);out.pressure=PRESSURES.includes(r.pressure)?r.pressure:'';out.verdict=VERDICTS.includes(r.verdict)?r.verdict:'';out.reason=REASONS.includes(r.reason)?r.reason:'';
 if(out.stage!=='listen'&&out.stage!=='respond'&&!out.selected.length)throw Error('Missing selection');if(['followup','verdict','summary'].includes(out.stage)&&!out.objection)throw Error('Missing objection');if(['verdict','summary'].includes(out.stage)&&!out.followup)throw Error('Missing follow-up');if((finished||out.stage==='summary')&&(!out.verdict||!out.reason||out.stage!=='summary'))throw Error('Incomplete round');return out;}
 s.rounds=input.rounds.map(r=>cleanRound(r,true));s.current=input.current?cleanRound(input.current,false):null;if(s.rounds.length===4&&s.current)throw Error('Too many rounds');const ids=[...s.rounds,...(s.current?[s.current]:[])].map(r=>r.voter_profile_id);if(new Set(ids).size!==ids.length)throw Error('Repeated voter');s.deck=ids;for(const k of Object.keys(s.reflections))s.reflections[k]=short(input.reflections?.[k],k==='hardest'?240:120);s.complete=input.complete===true&&s.rounds.length===4;return s;}
 return {KEY,STAGES,VERDICTS,REASONS,PRESSURES,short,fresh,blank,source,policies,start,round,choose,advance,finish,pressure,report,cleanSession};
})();
if(typeof module!=='undefined')module.exports=FocusCore;
