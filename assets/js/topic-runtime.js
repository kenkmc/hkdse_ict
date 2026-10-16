/* Mount subject-specific mechanisms; shared code handles access and transport only. */
(function(){'use strict';
const cleanups=[];
const E=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const S=(tag,attrs={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));return e;};
function field(parent,label,type,value,options){const wrap=E('label',label,'topic-field'),input=E(type==='select'?'select':'input');if(type!=='select')input.type=type;input.setAttribute('aria-label',label);(options||[]).forEach(pair=>{const option=E('option',pair[1]);option.value=pair[0];input.append(option);});input.value=value;wrap.append(input);parent.append(wrap);return input;}
function button(parent,text,fn){const b=E('button',text);b.type='button';b.addEventListener('click',fn);parent.append(b);return b;}
function playback(parent,{step,reset,period=700}){const row=E('div',undefined,'topic-transport');parent.append(row);let timer=null,done=false;
function stop(){if(timer!==null)clearTimeout(timer);timer=null;play.textContent='播放';play.setAttribute('aria-pressed','false');}
function tick(){timer=null;const result=step();if(result===false)finish(true);if(!done&&play.getAttribute('aria-pressed')==='true')schedule();}
function schedule(){timer=setTimeout(tick,Math.max(40,period*Number(speed.value)));}
const play=button(row,'播放',()=>{if(timer!==null){stop();return;}if(done)return;play.textContent='暫停';play.setAttribute('aria-pressed','true');schedule();});play.setAttribute('aria-pressed','false');
const next=button(row,'單步',()=>{stop();if(!done){const result=step();if(result===false)finish(true);}});
button(row,'重設',()=>{stop();finish(false);reset();});const speed=field(row,'播放速度','select','1',[['2','慢'],['1','標準'],['0.5','快']]);speed.addEventListener('change',()=>{if(timer!==null){stop();play.textContent='暫停';play.setAttribute('aria-pressed','true');schedule();}});
function finish(value){done=Boolean(value);if(done)stop();play.disabled=next.disabled=done;}
cleanups.push(stop);return {stop,finish};}
const hostMap={
'cha.1':['information'],'cha.2':['validation','parity','access'],'cha.3':['twos','binary-place','media'],'cha.4':['spreadsheet'],'cha.5':['databasequery','keys-index'],
'chb.1':['hardwareinput','cpu-memory'],'chb.2':['os-scheduler'],'chc.1':['client-server'],'chc.2':['tcp-dns','http-request'],'chc.3':['streaming'],'chc.4':['web-dom','css-cascade'],'chc.5':['security-flow','crypto-pki'],
'chd.1':['problem-decompose'],'chd.2':['flowchart','trace-machine'],'chd.3':['python-memory','linearsearch'],'chd.4':['boundary-debugger','numericprecision'],
'che.1':['ai-classifier','3dprinter'],'che.2':['accessibility'],'che.3':['license-flow'],
'ea.1':['keys-index','transaction'],'ea.2':['databasequery','sql-group','join'],'ea.3':['normalization'],'eb.1':['client-server','dhcp-permissions','http-request'],'eb.2':['web-dom','css-cascade','webapp'],
'ec.1':['linearsearch','sorting','datastruct','nestedloops','callstack','filewrite','numericprecision'],'ec.2':['sensor'],'sba':['testcycle'],
'db_simulator':['databasequery','sql-group','join','transaction'],'pki_animation':['crypto-pki'],'python_converter':['flowchart','trace-machine','python-memory']};
const libraryMap={
'cha.1':['information'],'cha.2':['validation','parity','access'],'cha.3':['twos','binary-place','media'],'cha.4':['spreadsheet'],'cha.5':['databasequery','keys-index'],
'chb.1':['hardwareinput'],'chb.2':['cpu-memory'],'chb.3':['os-scheduler'],'chc.1':['client-server'],'chc.2':['tcp-dns','http-request'],'chc.3':['streaming'],'chc.4':['web-dom'],'chc.5':['security-flow'],'chc.6':['crypto-pki','security-flow'],
'chd.1':['problem-decompose'],'chd.2':['flowchart'],'chd.3':['trace-machine'],'chd.4':['python-memory'],'chd.5':['linearsearch'],'chd.6':['boundary-debugger'],
'che.1':['ai-classifier','3dprinter'],'che.2':['accessibility'],'che.3':['license-flow'],
'eleca.1':['transaction'],'eleca.2':['sql-group'],'eleca.3':['join'],'eleca.4':['keys-index'],'eleca.5':['normalization'],
'elecb.1':['http-request','client-server'],'elecb.2':['dhcp-permissions'],'elecb.3':['css-cascade','web-dom'],'elecb.4':['webapp'],'elecb.5':['webapp','client-server'],
'elecc.1':['python-memory'],'elecc.2':['numericprecision'],'elecc.3':['nestedloops'],'elecc.4':['callstack'],'elecc.5':['datastruct'],'elecc.6':['sorting','linearsearch'],'elecc.7':['filewrite'],'elecc.8':['sensor'],'sba.1':['testcycle'],
'db_simulator':['databasequery','sql-group','join','transaction'],'pki_animation':['crypto-pki'],'python_converter':['flowchart','trace-machine','python-memory']};
function init(){
 const path=location.pathname,id=path.split('/').pop().replace(/[.]html$/,''),library=path.includes('/animations/'),key=(library?'animations/':'')+id;
 const plans=window.ICT_LESSON_PLANS||{},hasPlan=Object.prototype.hasOwnProperty.call(plans,key);
 const topics=(library?libraryMap:hostMap)[id];if(!hasPlan&&!topics)return;
 const registry=window.ICT_TOPIC_SIMS||[],main=document.querySelector('main')||document.getElementById('root')?.parentElement||document.body;
 const entries=hasPlan?plans[key]:registry.filter(sim=>sim.topics.some(t=>(topics||[]).includes(t))).map(sim=>({sim:sim.id}));
 if(typeof window.ICT_LESSON_SETUP?.[key]==='function')window.ICT_LESSON_SETUP[key]();
 const mounted=new Set();let first=null;
 for(const entry of entries){
  const sim=registry.find(s=>s.id===entry.sim);
  if(!sim){console.error('Unknown lesson mechanism',key,entry.sim);continue;}
  if(mounted.has(sim.id)){console.error('Repeated lesson mechanism',key,sim.id);continue;}
  const slot=document.querySelector('[data-topic-sim="'+sim.id+'"]');
  let target=slot;
  if(!target&&entry.target){try{target=document.querySelector(entry.target);}catch(error){console.error('Invalid lesson placement',key,entry.target,error);}}
  if(!target){if(hasPlan){console.error('Missing lesson section',key,sim.id,entry.target);continue;}target=main;}
  const section=E('section',undefined,'topic-simulation topic-inline');section.id='sim-'+sim.id;section.dataset.simId=sim.id;section.setAttribute('aria-labelledby',section.id+'-title');
  if(id==='python_converter')section.classList.add('topic-on-dark');
  const heading=E(entry.headingLevel||'h3',entry.title||sim.title,'topic-sim-title');heading.id=section.id+'-title';section.append(heading);
  if(entry.description!==false)section.append(E('p',entry.description||sim.description,'topic-sim-description'));
  const stage=E('div',undefined,'topic-sim-stage');section.append(stage);
  if(slot)slot.replaceChildren(section);
  else if(entry.position==='before')target.before(section);
  else if(entry.position==='after')target.after(section);
  else if(entry.position==='prepend')target.prepend(section);
  else{const quiz=Array.from(target.children).find(n=>n.classList?.contains('ict-section-check'));if(quiz)target.insertBefore(section,quiz);else target.append(section);}
  try{sim.mount(stage,{E,S,field,button,playback,onCleanup:fn=>cleanups.push(fn)});mounted.add(sim.id);first??=section;}catch(error){section.append(E('p','此部分未能載入，請重新載入頁面。','topic-error'));console.error(sim.id,error);}
 }
 document.body.dataset.topicSimCount=String(mounted.size);
 if(first){const anchor=E('span');anchor.id='topic-laboratory';anchor.setAttribute('aria-hidden','true');first.prepend(anchor);}
 if(location.hash){requestAnimationFrame(()=>{let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{return;}if(hash==='topic-laboratory'||hash.startsWith('sim-'))document.getElementById(hash)?.scrollIntoView();});}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanups.forEach(fn=>fn());});window.addEventListener('pagehide',()=>cleanups.forEach(fn=>fn()));
window.ICTTopicRuntime={hostMap,libraryMap};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
