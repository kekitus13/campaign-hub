'use strict';
const RivalCore=(()=>{
const KEY='oral-rival-v1';
const presets=[
{parties:[0,1],motion:'Who should receive priority when resources are limited: younger or older citizens?'},
{parties:[3,1],motion:'Should public services become mainly digital?'},
{parties:[3,5],motion:'Should governments invest more in digital infrastructure or physical community spaces?'},
{parties:[4,2],motion:'Should schools focus more on academic education or preparation for working life?'},
{parties:[0,6],motion:'Should some age groups receive special benefits, or should policies apply equally to everyone?'},
{parties:[0,1],motion:''}
];
const fields=['position','argument1','argument2','example','weakness','question'];
const speaker=()=>({turns:0,argument:false,reaction:false,qa:false});
const notes=()=>Object.fromEntries(fields.map(k=>[k,'']));
const blank=()=>({version:1,selected:0,view:'setup',party:0,observer:2,debates:presets.map(p=>({parties:[...p.parties],motion:p.motion,turn:0,done:false,notes:Array.from({length:7},notes),observers:Array.from({length:7},()=>({argument:'',rebuttal:'',compromise:''})),speakers:Array.from({length:7},()=>Array.from({length:4},speaker))}))});
const text=v=>typeof v==='string'?v.slice(0,999):'';
function turns(ids){const out=[];const add=(kind,who,against=null)=>out.push({kind,who,against});ids.forEach(i=>add('opening',i));ids.forEach(i=>{add('argument',i);ids.filter(j=>j!==i).forEach(j=>add('response',j,i));});ids.forEach((i,n)=>{const target=ids[(n+1)%ids.length];add('question',i,target);add('answer',target,i);});ids.forEach(i=>add('rebuttal',i));ids.forEach(i=>add('compromise',i));return out;}
function clean(x){if(x?.version!==1||!Array.isArray(x.debates)||x.debates.length!==presets.length)throw Error('Invalid session');const s=blank();s.selected=Number.isInteger(x.selected)&&x.selected>=0&&x.selected<presets.length?x.selected:0;s.view=['setup','prep','live','observers'].includes(x.view)?x.view:'setup';s.party=Number.isInteger(x.party)&&x.party>=0&&x.party<7?x.party:0;s.observer=Number.isInteger(x.observer)&&x.observer>=0&&x.observer<7?x.observer:2;s.debates=x.debates.map(d=>{if(!d||!Array.isArray(d.parties)||d.parties.length<2||d.parties.length>3||new Set(d.parties).size!==d.parties.length||d.parties.some(i=>!Number.isInteger(i)||i<0||i>6))throw Error('Invalid participants');const n={parties:[...d.parties],motion:text(d.motion),turn:0,done:d.done===true,notes:[],observers:[],speakers:[]};n.turn=Number.isInteger(d.turn)?Math.max(0,Math.min(turns(n.parties).length-1,d.turn)):0;for(let i=0;i<7;i++){n.notes[i]=Object.fromEntries(fields.map(k=>[k,text(d.notes?.[i]?.[k])]));n.observers[i]=Object.fromEntries(['argument','rebuttal','compromise'].map(k=>[k,text(d.observers?.[i]?.[k])]));const people=d.speakers?.[i];n.speakers[i]=Array.isArray(people)&&people.length>=1&&people.length<=8?people.map(p=>({turns:Number.isInteger(p?.turns)?Math.max(0,Math.min(99,p.turns)):0,argument:p?.argument===true,reaction:p?.reaction===true,qa:p?.qa===true})):Array.from({length:4},speaker);}return n;});return s;}
return {KEY,presets,fields,speaker,blank,text,turns,clean};
})();
if(typeof module!=='undefined')module.exports=RivalCore;
