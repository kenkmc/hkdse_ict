const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const root=path.resolve(__dirname,'..');
function harness(name) {
 let now=0,nextId=0; const timers=new Map(), elements=new Map();
 class Elem {constructor(id){this.id=id;this.style={};this.dataset={};this.textContent='';this.innerText='';this.innerHTML='';this.value='www.example.com';this.children=[];this.disabled=false;const set=new Set();this.classList={add:(...x)=>x.forEach(s=>set.add(s)),remove:(...x)=>x.forEach(s=>set.delete(s)),contains:x=>set.has(x)};}appendChild(e){this.children.push(e)}addEventListener(){}setAttribute(){} }
 const doc={getElementById(id){if(!elements.has(id))elements.set(id,new Elem(id));return elements.get(id);},querySelectorAll(){return []},createElement(tag){return new Elem(tag)}};
 const c=vm.createContext({document:doc,lucide:{createIcons(){}},performance:{now:()=>now},setTimeout:(fn,ms)=>{const id=++nextId;timers.set(id,{fn,due:now+ms});return id},clearTimeout:id=>timers.delete(id),console,Math});
 const html=fs.readFileSync(path.join(root,name+'.html'),'utf8');
 // Select the functional lesson script by its public entry points. Page-level
 // configuration scripts may appear before it and are not part of this harness.
 const entryPoints={ pki_animation:['switchScenario','handleAction'] }[name];
 assert(entryPoints,'No functional-script selector configured for '+name);
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
   .filter(match=>! /\bsrc\s*=/i.test(match[1]))
   .map(match=>match[2])
   .filter(source=>entryPoints.every(fn=>new RegExp('\\bfunction\\s+'+fn+'\\s*\\(').test(source)));
 assert.equal(scripts.length,1,'Expected exactly one inline functional script for '+name+' containing '+entryPoints.join(', '));
 vm.runInContext(scripts[0],c,{filename:name+'.html:lesson-script'});
 return {c,doc,timers,run:s=>vm.runInContext(s,c),advance(ms){const until=now+ms;for(let i=0;i<10000;i++){const entry=[...timers].filter(([,v])=>v.due<=until).sort((a,b)=>a[1].due-b[1].due)[0];if(!entry)break;now=entry[1].due;timers.delete(entry[0]);entry[1].fn();}now=until;}};
}
// TCP and DNS now use the section-mounted topic models; their replacement
// handshake / ACK / retransmission / cache / TTL / invalid-input tests live in
// ../../tests/topic-network.cjs. The original PKI tool is retained here.
const pki=harness('pki_animation');pki.run("handleAction('bob-pub')");pki.doc.getElementById('send-btn').onclick();assert.equal(pki.timers.size,1);pki.run("switchScenario('authentication')");pki.advance(1000);assert.equal(pki.run('step'),1);assert.equal(pki.timers.size,0);pki.run("handleAction('alice-priv')");pki.doc.getElementById('send-btn').onclick();pki.advance(800);pki.run("handleAction('eve-priv')");assert.match(pki.doc.getElementById('toast').innerText,/可直接讀取明文/);pki.run("switchScenario('confidentiality')");assert.equal(pki.timers.size,0);
pki.run("switchScenario('authentication')");pki.run("handleAction('alice-priv')");pki.doc.getElementById('send-btn').onclick();pki.advance(800);pki.doc.getElementById('tamper-btn').onclick();assert.match(pki.doc.getElementById('sim-data').innerText,/已竄改/);pki.doc.getElementById('continue-btn').onclick();pki.advance(800);pki.run("handleAction('alice-pub')");assert.equal(pki.run('step'),4);assert.match(pki.doc.getElementById('guide-title').innerText,/驗證失敗/);pki.run("switchScenario('confidentiality')");assert.equal(pki.timers.size,0);
console.log('PASS retained PKI switch cancellation, signed plaintext semantics and tamper rejection; TCP/DNS replacement tests: tests/topic-network.cjs');
