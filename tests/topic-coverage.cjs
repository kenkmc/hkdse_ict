'use strict';
// Execute the actual section router against DOM fixtures parsed from each real page.
// Scene mounts are spies: individual module tests exercise the actual mechanisms.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,'assets/js',name),'utf8');
const modules=['topic-data.js','topic-network.js','topic-algorithms.js','topic-context.js'];
const planFiles=['lesson-plan-data.js','lesson-plan-network.js','lesson-plan-algorithms.js','lesson-plan-context.js'];
const styles=['topic-runtime.css',...modules.map(n=>n.replace(/\.js$/,'.css'))];
const runtime=source('topic-runtime.js');
class Element{
 constructor(tag){this.tagName=tag.toLowerCase();this.children=[];this.parentElement=null;this.attributes={};this.dataset={};this.style={};this.className='';this.id='';this._text='';this.listeners=new Map();this.scrolled=false;}
 set textContent(v){this._text=String(v);this.children.forEach(n=>n.parentElement=null);this.children=[];}
 get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
 get firstElementChild(){return this.children[0]||null;}
 get classList(){const n=this;return {contains:c=>n.className.split(/\s+/).includes(c),add(...cs){n.className=[...new Set([...n.className.split(/\s+/),...cs])].join(' ');},remove(...cs){n.className=n.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' ');}};}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='id')this.id=String(v);if(k==='class')this.className=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);}
 getAttribute(k){return this.attributes[k]??null;}
 detach(n){if(n.parentElement){const a=n.parentElement.children;a.splice(a.indexOf(n),1);}n.parentElement=this;return n;}
 append(...ns){ns.forEach(n=>this.children.push(this.detach(n)));}
 prepend(...ns){this.children.unshift(...ns.map(n=>this.detach(n)));}
 insertBefore(n,ref){assert.equal(ref.parentElement,this);this.detach(n);this.children.splice(this.children.indexOf(ref),0,n);}
 before(n){const p=this.parentElement;assert.ok(p);p.insertBefore(n,this);}
 after(n){const p=this.parentElement;assert.ok(p);p.detach(n);p.children.splice(p.children.indexOf(this)+1,0,n);}
 replaceChildren(...ns){this.children.forEach(n=>n.parentElement=null);this.children=[];this._text='';this.append(...ns);}
 remove(){if(this.parentElement){const p=this.parentElement;p.children.splice(p.children.indexOf(this),1);this.parentElement=null;}}
 matches(selector){
  if(selector==='*')return true;
  const attr=selector.match(/^\[([^=\]]+)(?:=["']([^"']*)["'])?\]$/);
  if(attr)return this.getAttribute(attr[1])!==null&&(attr[2]===undefined||this.getAttribute(attr[1])===attr[2]);
  if(selector.startsWith('#'))return this.id===selector.slice(1);
  if(selector.startsWith('.'))return selector.slice(1).split('.').every(c=>this.classList.contains(c));
  const compound=selector.match(/^([a-z][\w-]*)(\.[\w.-]+)?$/i);return !!compound&&this.tagName===compound[1].toLowerCase()&&(!compound[2]||compound[2].slice(1).split('.').every(c=>this.classList.contains(c)));
 }
 querySelectorAll(selector){
  if((selector.includes('[')&&!selector.includes(']'))||selector.includes('???'))throw new Error('Invalid selector');
  const alternatives=selector.split(',').map(x=>x.trim());
  const result=[];const walk=n=>n.children.forEach(c=>{if(alternatives.some(q=>{const parts=q.split(/\s+(?![^\[]*\])/);if(!c.matches(parts.pop()))return false;let parent=c.parentElement;while(parts.length){const next=parts.pop();while(parent&&!parent.matches(next))parent=parent.parentElement;if(!parent)return false;parent=parent.parentElement;}return true;}))result.push(c);walk(c);});walk(this);return result;
 }
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 contains(n){return n===this||this.children.some(c=>c.contains(n));}
 addEventListener(k,fn,o){const a=this.listeners.get(k)||[];a.push({fn,once:!!o?.once});this.listeners.set(k,a);}
 dispatch(k){const a=this.listeners.get(k)||[];a.forEach(h=>h.fn());this.listeners.set(k,a.filter(h=>!h.once));}
 scrollIntoView(){this.scrolled=true;}
}
function documentFixture(html){
 const document=new Element('document'),stack=[document],voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
 // Do not interpret tags embedded in JavaScript, JSX, CSS or comments as page DOM.
 const markup=html.replace(/<!--[^]*?-->/g,'').replace(/<(script|style)\b[^>]*>[^]*?<\/\1\s*>/gi,'');
 for(const token of markup.matchAll(/<(?:(?:[^>"'])|"[^"]*"|'[^']*')*>/g)){
  const text=token[0];if(/^<!/.test(text))continue;
  const close=text.match(/^<\/\s*([\w-]+)/);if(close){for(let i=stack.length-1;i>0;i--)if(stack[i].tagName===close[1].toLowerCase()){stack.length=i;break;}continue;}
  const opening=text.match(/^<\s*([\w-]+)/);if(!opening)continue;const node=new Element(opening[1]);
  const attributes=text.slice(opening[0].length,-1);for(const a of attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))node.setAttribute(a[1],a[2]??a[3]??a[4]??'');
  stack.at(-1).append(node);if(!voids.has(node.tagName)&&!text.endsWith('/>'))stack.push(node);
 }
 document.body=document.querySelector('body');if(!document.body){document.body=new Element('body');document.append(document.body);}
 document.readyState='loading';document.hidden=false;document.createElement=t=>new Element(t);document.createElementNS=(_,t)=>new Element(t);document.createTextNode=t=>{const n=new Element('#text');n.textContent=t;return n;};document.getElementById=id=>document.querySelector('#'+id);
 return document;
}
const baseContext=()=>({window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}},location:{pathname:'/index.html'},console});
const inventory=baseContext();vm.createContext(inventory);
const perModule={};for(const module of modules){const before=inventory.window.ICT_TOPIC_SIMS?.length||0;vm.runInContext(source(module),inventory,{filename:module});perModule[module]=inventory.window.ICT_TOPIC_SIMS.length-before;assert.ok(perModule[module]>0,module+' must register real scenes');}
for(const name of ['new-lessons','programming-lessons','programming-supplements'])vm.runInContext(fs.readFileSync(path.join(root,'animations/assets/'+name+'.js'),'utf8'),inventory,{filename:name});
planFiles.forEach(name=>vm.runInContext(source(name),inventory,{filename:name}));
vm.runInContext(runtime,inventory,{filename:'topic-runtime.js'});
const descriptors=Array.from(inventory.window.ICT_TOPIC_SIMS),ids=descriptors.map(s=>s.id),plans=inventory.window.ICT_LESSON_PLANS;
assert.equal(descriptors.length,Object.values(perModule).reduce((a,b)=>a+b,0));
assert.equal(new Set(ids).size,ids.length,'registry IDs must be globally unique');
for(const d of descriptors){assert.ok(d.id&&d.title&&d.description&&Array.isArray(d.topics)&&d.topics.length&&typeof d.mount==='function','incomplete descriptor '+d.id);assert.equal(new Set(Array.from(d.topics)).size,d.topics.length);}
const {hostMap,libraryMap}=inventory.window.ICTTopicRuntime;
assert.equal(Object.keys(hostMap).length,30);assert.equal(Object.keys(libraryMap).length,45);
const published=[...Object.keys(hostMap),...Object.keys(libraryMap).map(id=>'animations/'+id)];
assert.equal(Object.keys(plans).length,75,'every published lesson/tool needs an explicit placement plan, including intentional []');
assert.deepEqual(Object.keys(plans).sort(),published.slice().sort(),'plans must match the 75 actual lesson paths exactly');
const descriptorById=new Map(descriptors.map(d=>[d.id,d]));
for(const [key,entries] of Object.entries(plans)){
 assert.ok(Array.isArray(entries),key+' plan must be an array');assert.equal(new Set(Array.from(entries,e=>e.sim)).size,entries.length,key+' repeats a mechanism');
 for(const e of entries){assert.ok(descriptorById.has(e.sim),key+' unknown model '+e.sim);assert.ok(e.target||e.slot,key+' must specify a section or explicit slot');assert.ok([undefined,'append','prepend','before','after'].includes(e.position),key+' invalid position');}
}
function generatedSections(document){
 const main=document.querySelector('#ict-lesson');if(!main)return;
 const metadata=inventory.window.ICT_NEW_LESSONS[main.dataset.lesson];assert.ok(metadata,'missing real metadata '+main.dataset.lesson);
 const heading=new Element('h1');heading.textContent=metadata.title;main.append(heading);
 for(const [i,s] of Array.from(metadata.sections).entries()){
  const section=new Element('section');section.id=s.id||'topic-'+i;section.className='ict-lesson-section';const h=new Element('h2');h.textContent=s.title;section.append(h);
  for(const paragraph of Array.from(s.paragraphs||[])){const p=new Element('p');p.textContent=paragraph;section.append(p);}
  if(s.lab?.question){const quiz=new Element('fieldset');quiz.className='ict-section-check';quiz.textContent=s.lab.question.text;section.append(quiz);}
  main.append(section);
 }
}
function execute(key,{ready=false,hash='',overridePlans=plans,html,throws=false,mutate,setup}={}){
 const filename=key+'.html',real=html??fs.readFileSync(path.join(root,filename),'utf8');const document=documentFixture(real);if(html===undefined)generatedSections(document);mutate?.(document);
 const body=document.body,main=document.querySelector('main')||document.getElementById('root')?.parentElement||body;
 const originals=[document,...document.querySelectorAll('*')].map(n=>({node:n,children:[...n.children]}));
 const mounted=[],errors=[],cleaned=[],frames=[],window=new Element('window');
 // The real E3 setup builds a licence table, covered in that lesson's tests.
 // Here setup hooks can be supplied to isolate the router's hook ordering.
 window.ICT_LESSON_PLANS=overridePlans;window.ICT_LESSON_SETUP=setup?{[key]:()=>setup(document)}:{};
 window.ICT_TOPIC_SIMS=descriptors.map(sim=>({...sim,mount(stage,api){assert.ok(document.contains(stage),'stage must be inserted before mount');['E','S','field','button','playback','onCleanup'].forEach(n=>assert.equal(typeof api[n],'function'));mounted.push(sim.id);if(throws)throw new Error('deliberate mount failure');stage.append(api.E('output',sim.id,'fixture-mounted'));api.onCleanup(()=>cleaned.push(sim.id));}}));
 const context={window,document,location:{pathname:'/hkdse_ict/'+filename,hash},console:{error:(...a)=>errors.push(a)},requestAnimationFrame:fn=>frames.push(fn),setTimeout(){throw new Error('router must not start timers');},clearTimeout(){}};
 document.readyState=ready?'complete':'loading';vm.createContext(context);vm.runInContext(runtime,context,{filename:'topic-runtime.js'});
 if(!ready){assert.equal(mounted.length,0,'loading document must defer routing');document.dispatch('DOMContentLoaded');}
 frames.forEach(fn=>fn());return {key,document,body,main,originals,mounted,errors,cleaned,window,context};
}
function verifyOriginalOrder(run){
 for(const {node,children} of run.originals){const still=node.children.filter(n=>children.includes(n));assert.deepEqual(still,children,run.key+' altered original content order');}
}
function verifyPositions(run,entries){
 const sections=run.document.querySelectorAll('.topic-simulation');assert.equal(sections.length,entries.length,run.key+' unexpected scene DOM count');
 for(const e of entries){
  const scene=run.document.getElementById('sim-'+e.sim);assert.ok(scene,run.key+' missing '+e.sim+' (including actual .html suffix routing)');assert.equal(scene.dataset.simId,e.sim);
  const heading=scene.querySelector('h3')||scene.querySelector('h2')||scene.querySelector('h4');assert.ok(heading);assert.equal(scene.getAttribute('aria-labelledby'),heading.id);assert.ok(scene.querySelector('.topic-sim-stage').querySelector('output'));
  const slot=run.document.querySelector('[data-topic-sim="'+e.sim+'"]'),target=slot||run.document.querySelector(e.target);assert.ok(target,run.key+' missing actual section '+e.target);
  const position=e.position||'append';
  if(slot)assert.equal(scene.parentElement,slot,run.key+' did not replace its explicit slot');
  else if(position==='append'||position==='prepend'){
   assert.equal(scene.parentElement,target,run.key+' scene escaped its intended section');
   const siblings=entries.filter(x=>(x.position||'append')===position&&x.target===e.target).map(x=>run.document.getElementById('sim-'+x.sim));
   const indexes=siblings.map(n=>target.children.indexOf(n));for(let i=1;i<indexes.length;i++)assert.ok(indexes[i]>indexes[i-1],run.key+' changed planned scene order');
   const quiz=target.children.find(n=>n.classList.contains('ict-section-check'));
   if(position==='append'&&quiz)assert.equal(target.children.indexOf(siblings.at(-1)),target.children.indexOf(quiz)-1,run.key+' appended scenes must immediately precede the section quiz');
   if(position==='append'&&!quiz)assert.equal(target.children.at(-1),siblings.at(-1));
   if(position==='prepend')assert.ok(target.children.indexOf(scene)<target.children.findIndex(n=>!n.classList.contains('topic-simulation')));
  }else{assert.equal(scene.parentElement,target.parentElement);const a=target.parentElement.children;assert.ok(position==='before'?a.indexOf(scene)<a.indexOf(target):a.indexOf(scene)>a.indexOf(target));}
 }
 assert.equal(run.document.querySelectorAll('.topic-intro').length,0,'no global showcase introduction');assert.equal(run.document.querySelectorAll('.topic-jump').length,0,'no global animation menu');
 const anchor=run.document.getElementById('topic-laboratory');if(entries.length){assert.ok(anchor);assert.ok(anchor.parentElement.classList.contains('topic-simulation'),'legacy deep-link anchor must be inside first scene, not a top wrapper');}else assert.equal(anchor,null,'intentional [] must not insert old topic-map scenes');
 assert.equal(run.body.dataset.topicSimCount,String(entries.length));verifyOriginalOrder(run);
}
let checked=0;const assetErrors=[];
for(const key of published){
 const absolute=path.join(root,key+'.html'),html=fs.readFileSync(absolute,'utf8');
 const scriptPaths=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m=>m[1].split(/[?#]/)[0]);
 const links=[...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/gi)].map(m=>m[1].split(/[?#]/)[0]);
 function checkAsset(name,paths){const matches=paths.filter(p=>path.basename(p)===name);if(matches.length!==1){assetErrors.push(key+': expected exactly one '+name+', got '+matches.length);return -1;}if(!fs.existsSync(path.resolve(path.dirname(absolute),matches[0])))assetErrors.push(key+': missing '+matches[0]);return paths.indexOf(matches[0]);}
 const modulePositions=modules.map(n=>checkAsset(n,scriptPaths)),planPositions=planFiles.map(n=>checkAsset(n,scriptPaths)),runtimePosition=checkAsset('topic-runtime.js',scriptPaths);styles.forEach(n=>checkAsset(n,links));
 if([...modulePositions,...planPositions,runtimePosition].every(n=>n>=0)){assert.ok(Math.max(...modulePositions)<Math.min(...planPositions),key+' must load registries before placement plans');assert.ok(Math.max(...planPositions)<runtimePosition,key+' must load all plans before runtime');}
 const entries=Array.from(plans[key]),run=execute(key,{ready:checked%2===1});assert.deepEqual(run.errors,[],key+' runtime placement errors');assert.deepEqual(run.mounted,entries.map(e=>e.sim),key+' wrong or duplicate mounts');verifyPositions(run,entries);
 if(checked%2===0){run.document.dispatch('DOMContentLoaded');assert.equal(run.document.querySelectorAll('.topic-simulation').length,entries.length,'DOMContentLoaded must run once');}
 run.document.hidden=false;run.document.dispatch('visibilitychange');assert.deepEqual(run.cleaned,[]);run.document.hidden=true;run.document.dispatch('visibilitychange');assert.deepEqual(run.cleaned,entries.map(e=>e.sim));run.window.dispatch('pagehide');assert.deepEqual(run.cleaned,[...entries,...entries].map(e=>e.sim));checked++;
}
// Exercise the router's non-catalogue branches and malformed plans explicitly.
const firstId=descriptors[0].id,one=[{sim:firstId,target:'#actual'}];
const shell='<html><body><main><h1 id="original">Lesson</h1><section id="actual"><p>Prose</p><fieldset class="ict-section-check">Question</fieldset></section></main></body></html>';
const custom=(entries,opts={})=>execute('fixture',{html:shell,overridePlans:{fixture:entries},...opts});
verifyPositions(custom(one),one);
const setupEntries=[{sim:firstId,target:'#created-by-setup'}];
const setupRun=custom(setupEntries,{setup(document){const target=document.createElement('section');target.id='created-by-setup';document.querySelector('main').append(target);}});
assert.deepEqual(setupRun.errors,[]);verifyPositions(setupRun,setupEntries);
const slot=custom([{sim:firstId,target:'#missing'}],{html:shell.replace('<p>Prose</p>','<div data-topic-sim="'+firstId+'"></div><p>Prose</p>')});assert.deepEqual(slot.errors,[]);assert.equal(slot.document.getElementById('sim-'+firstId).parentElement.getAttribute('data-topic-sim'),firstId);
for(const position of ['prepend','before','after']){const entries=[{sim:firstId,target:'#actual',position}],run=custom(entries);verifyPositions(run,entries);}
const missing=custom([{sim:firstId,target:'#missing'}]);assert.equal(missing.mounted.length,0);assert.equal(missing.errors[0][0],'Missing lesson section');assert.equal(missing.document.querySelectorAll('.topic-simulation').length,0);
const duplicate=custom([...one,...one]);assert.equal(duplicate.mounted.length,1);assert.equal(duplicate.errors[0][0],'Repeated lesson mechanism');
const unknownModel=custom([{sim:'not-registered',target:'#actual'}]);assert.equal(unknownModel.mounted.length,0);assert.equal(unknownModel.errors[0][0],'Unknown lesson mechanism');
const invalid=custom([{sim:firstId,target:'[broken'}]);assert.equal(invalid.mounted.length,0);assert.ok(invalid.errors.some(e=>e[0]==='Invalid lesson placement'));
const failed=custom(one,{throws:true});assert.equal(failed.errors.length,1);assert.equal(failed.body.dataset.topicSimCount,'0');assert.equal(failed.document.querySelectorAll('.topic-error').length,1);
const hash=custom(one,{hash:'#sim-'+firstId});assert.equal(hash.document.getElementById('sim-'+firstId).scrolled,true);
const legacyAnchor=custom(one,{hash:'#topic-laboratory'});assert.equal(legacyAnchor.document.getElementById('topic-laboratory').scrolled,true);
const foreign=custom(one,{hash:'#original'});assert.equal(foreign.document.getElementById('original').scrolled,false);
const malformed=custom(one,{hash:'#sim-%E0%A4%A'});assert.deepEqual(malformed.errors,[]);
const unknown=execute('index',{html:shell});assert.deepEqual(unknown.mounted,[]);assert.deepEqual(unknown.errors,[]);assert.equal(unknown.document.querySelectorAll('.topic-simulation').length,0);
for(const [container,html] of [['main','<body><main id="fallback"></main></body>'],['root-parent','<body><article id="fallback"><div id="root"></div></article></body>'],['body','<body id="fallback"><p>Original</p></body>']]){
 const run=execute('chd.2',{html,overridePlans:{}}),expected=descriptors.filter(s=>s.topics.some(t=>hostMap['chd.2'].includes(t))).map(s=>s.id);assert.deepEqual(run.mounted,expected,container+' fallback failed');assert.deepEqual(run.errors,[]);run.document.querySelectorAll('.topic-simulation').forEach(s=>assert.equal(s.parentElement,run.document.getElementById('fallback')));
}
assert.equal(assetErrors.length,0,'Topic asset integration errors ('+assetErrors.length+'):\n'+assetErrors.slice(0,24).join('\n'));
console.log('PASS actual section-router coverage: '+checked+' page plans; '+descriptors.length+' unique descriptors ('+Object.entries(perModule).map(([m,n])=>m+':'+n).join(', ')+'); real selectors, assets/order, per-section placement, quiz order, slots, empty plans, routing, errors, anchors and cleanup.');
