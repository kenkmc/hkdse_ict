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
function init(){const path=location.pathname,id=path.split('/').pop().replace(/\.html$/,''),library=path.includes('/animations/');const topics=(library?libraryMap:hostMap)[id];if(!topics)return;
const sims=(window.ICT_TOPIC_SIMS||[]).filter(sim=>sim.topics.some(t=>topics.includes(t)));
const main=document.querySelector('main')||document.getElementById('root')?.parentElement||document.body;
const target=E('div',undefined,'topic-laboratory');target.id='topic-laboratory';const nav=E('nav',undefined,'topic-jump');nav.setAttribute('aria-label','本課專用動畫');
const lead=E('p','操作本課的概念模型：改變輸入，觀察位元、數據、設備或程式狀態實際如何改變。','topic-intro');target.append(lead,nav);
// Place primary mechanisms before the lesson prose; preserve the existing lesson shell.
if(library){const first=main.querySelector('.ict-objectives');if(first)first.after(target);else main.prepend(target);}else {const first=main.firstElementChild;if(first)first.after(target);else main.append(target);}
sims.forEach(sim=>{const section=E('section',undefined,'topic-simulation');section.id='sim-'+sim.id;section.dataset.simId=sim.id;section.setAttribute('aria-labelledby',section.id+'-title');const h=E('h2',sim.title,'topic-sim-title');h.id=section.id+'-title';section.append(h,E('p',sim.description,'topic-sim-description'));const stage=E('div',undefined,'topic-sim-stage');section.append(stage);target.append(section);const link=E('a',sim.title);link.href='#'+section.id;nav.append(link);
try{sim.mount(stage,{E,S,field,button,playback,onCleanup:fn=>cleanups.push(fn)});}catch(error){section.append(E('p','此模型未能初始化，請重新載入頁面。','topic-error'));console.error(sim.id,error);}
});
target.dataset.simCount=String(sims.length);
if(location.hash){requestAnimationFrame(()=>{const anchor=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(anchor&&target.contains(anchor))anchor.scrollIntoView();});}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanups.forEach(fn=>fn());});window.addEventListener('pagehide',()=>cleanups.forEach(fn=>fn()));
window.ICTTopicRuntime={hostMap,libraryMap};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
