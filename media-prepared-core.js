'use strict';
const PreparedMedia=(()=>{
 const KEY='oral-media-prepared-v1';
 const blank=()=>({version:1,party:0,view:'brief',parties:Array.from({length:7},()=>({stage:'prep',question:0,notes:['','',''],questions:[]}))});
 function clean(x){if(x?.version!==1||!Array.isArray(x.parties)||x.parties.length!==7)throw Error('Invalid session');const s=blank();s.party=Number.isInteger(x.party)&&x.party>=0&&x.party<7?x.party:0;s.view=['brief','prep','conference'].includes(x.view)?x.view:'brief';s.parties=x.parties.map(p=>{if(!p||!['prep','questions','done'].includes(p.stage))throw Error('Invalid party');return {stage:p.stage,question:Number.isInteger(p.question)&&p.question>=0&&p.question<3?p.question:0,questions:Array.isArray(p.questions)?p.questions.filter(q=>typeof q==='string').slice(0,3).map(q=>q.slice(0,999)):[],notes:[0,1,2].map(i=>typeof p.notes?.[i]==='string'?p.notes[i].slice(0,999):'')}});return s;}
 function start(s){const p=s.parties[s.party];if(p.stage==='prep'){p.stage='questions';p.question=0;}s.view='conference';}
 function next(s){const p=s.parties[s.party];if(p.stage!=='questions')return;if(p.question<2)p.question++;else p.stage='done';}
 function nextParty(s){for(let n=1;n<=7;n++){const i=(s.party+n)%7;if(s.parties[i].stage!=='done'){s.party=i;s.view='prep';return true;}}return false;}
 return {KEY,blank,clean,start,next,nextParty};
})();
if(typeof module!=='undefined')module.exports=PreparedMedia;
