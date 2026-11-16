'use strict';
const AllianceCore=(()=>{
 const KEY='oral-alliance-v1',labels=['Natural ally','Possible partner','Unlikely ally'];
 const blankParty=()=>({meetings:Array.from({length:3},()=>({party:'',agreement:'',disagreement:'',cooperation:''})),classification:{},ally:'',shared:'',project:'',rival:'',difference:''});
 const blank=()=>({version:1,party:0,step:0,parties:Array.from({length:7},blankParty)});
 const text=v=>typeof v==='string'?v.slice(0,999):'';
 const other=(v,i)=>/^[0-6]$/.test(String(v))&&+v!==i?String(v):'';
 function clean(x){if(x?.version!==1||!Array.isArray(x.parties)||x.parties.length!==7)throw Error('Invalid backup');const s=blank();s.party=Number.isInteger(x.party)&&x.party>=0&&x.party<7?x.party:0;s.step=Number.isInteger(x.step)&&x.step>=0&&x.step<=3?x.step:0;s.parties=x.parties.map((p,i)=>{if(!p||!Array.isArray(p.meetings)||p.meetings.length!==3)throw Error('Invalid meetings');const n=blankParty(),used=new Set();n.meetings=p.meetings.map(m=>{if(!m)throw Error('Invalid meeting');const id=other(m.party,i);if(id!==''&&used.has(id))throw Error('Repeated party');if(id!=='')used.add(id);return {party:id,agreement:text(m.agreement),disagreement:text(m.disagreement),cooperation:['YES','MAYBE','NO'].includes(m.cooperation)?m.cooperation:''};});for(let j=0;j<7;j++)if(j!==i&&labels.includes(p.classification?.[j]))n.classification[j]=p.classification[j];n.ally=other(p.ally,i);n.rival=other(p.rival,i);if(n.rival!==''&&n.rival===n.ally)n.rival='';for(const k of ['shared','project','difference'])n[k]=text(p[k]);return n;});return s;}
 return {KEY,labels,blankParty,blank,text,clean};
})();
if(typeof module!=='undefined')module.exports=AllianceCore;
