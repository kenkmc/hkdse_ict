const assert = require('node:assert/strict');
require('../assets/js/topic-network.js');
const m = globalThis.ICTNetworkModels;
assert.equal(m.route('server', 0, true).available, false);
assert.equal(m.route('p2p', 0, true).available, true);
assert.equal(m.route('p2p', 2, true).destination, 0);
const loss = m.tcpFrames(true), normal = m.tcpFrames(false);
assert.equal(loss.length, normal.length + 2);
assert.equal(loss.filter(f => f.type === 'timeout').length, 1);
assert.deepEqual(loss.filter(f => f.type === 'ack').map(f => f.ack), [1500, 2000, 2500]);
assert.equal(loss.filter(f => f.type === 'data' && f.seq === 1500).length, 2);
let b = { capacity: 24, buffer: 12, stalled: false, elapsed: 0, played: 0 };
for(let i=0;i<20;i++) { b=m.bufferTick(b, 1, 4); assert.ok(b.buffer >= 0 && b.buffer <= 24); }
assert.ok(b.played < b.elapsed); b=m.bufferTick({...b,buffer:0,stalled:true},4,4); assert.equal(b.stalled,true); b=m.bufferTick(b,4,4); assert.equal(b.stalled,false);
const tree = m.parseHTML('<main><p>A<strong>B</strong></p></main>');
assert.equal(tree.tree.children[0].children[0].children[1].tag, 'strong');
assert.equal(tree.errors.length, 0);
assert.ok(m.parseHTML('<script>alert(1)</script><p onclick="x">bad</p>').errors.length > 0);
assert.ok(m.parseHTML('<p>x</strong>').errors.length > 0);
const access = {port:443,allow443:true,allow22:false,authenticated:true,role:'student',action:'write'};
assert.equal(m.access(access).stage,3); assert.equal(m.access({...access,authenticated:false}).stage,2); assert.equal(m.access({...access,allow443:false}).stage,1); assert.equal(m.access({...access,role:'teacher'}).allowed,true);
assert.equal(m.hash('message'), m.hash('message')); assert.notEqual(m.hash('message'), m.hash('message!'));
assert.ok(m.http('GET','a b').url.endsWith('?q=a%20b')); assert.equal(m.http('POST','a b').body,'q=a%20b'); assert.ok(!m.http('POST','a b').url.includes('?'));
assert.equal(m.dhcp(['192.0.2.21']).offered,'192.0.2.22'); assert.equal(m.dhcp(['192.0.2.21','192.0.2.22','192.0.2.23']).offered,null); assert.equal(m.dhcp(['192.0.2.21'],'192.0.2.21').granted,false);
assert.equal(m.permission('viewer','write'),false); assert.equal(m.permission('editor','write'),true); assert.equal(m.permission('editor','delete'),false);
assert.equal(m.cascade({inherited:'red',tag:true,klass:true,id:true,inline:false}).winner.name,'#message'); assert.equal(m.cascade({inherited:'red'}).winner.value,'red');
assert.equal(m.webResult('5',true,true).client,true); assert.equal(m.webResult('5',true,true).server,false); assert.equal(m.webResult('16',false,false).cookie,null); assert.equal(m.webResult('16',false,true,'old-session').cookie,'old-session');
assert.deepEqual(m.ipv4('192.0.2.254'),[192,0,2,254]);assert.equal(m.ipv4('192.0.2.256'),null);assert.equal(m.ipv4('192.0.2'),null);
assert.equal(m.localRoute('192.0.2.30').local,true);assert.equal(m.localRoute('198.51.100.40').nextHop,'192.0.2.1');
const cache={'portal.school.example':{ip:'192.0.2.80',expires:60}};
assert.equal(m.dnsLookup(cache,'portal.school.example',0).hit,true);assert.equal(m.dnsLookup(cache,'portal.school.example',59).ttl,1);assert.equal(m.dnsLookup(cache,'portal.school.example',60).hit,false);assert.equal(m.dnsLookup(cache,'other.example',0).hit,false);
assert.equal(m.urlParts('https://school.example/a?q=1#section').fragment,'#section');assert.equal(m.urlParts('https://school.example/a').port,'443');assert.equal(m.urlParts('javascript:alert(1)'),null);assert.equal(m.urlParts('https://user:pass@school.example/'),null);
assert.equal(m.resource('https://school.example/events/open.html','../images/hall.jpg',['/images/hall.jpg']).ok,true);assert.equal(m.resource('https://school.example/events/open.html','../images/Hall.jpg',['/images/hall.jpg']).ok,false);assert.ok(m.resource('https://school.example/','C:\\Users\\image.jpg',[]).error);
const cert={host:'school.example',subject:'school.example',valid:true,signature:true,trusted:true};assert.equal(m.certificate(cert).allowed,true);for(const key of ['valid','signature','trusted'])assert.equal(m.certificate({...cert,[key]:false}).allowed,false);assert.equal(m.certificate({...cert,subject:'fake.example'}).allowed,false);
assert.equal(m.shareAccess(['read','write'],['read'],'write'),false);assert.equal(m.shareAccess(['read'],['read'],'read'),true);
const session={sid:'abc',active:true,expires:60};assert.equal(m.cookieAccess('abc',session,59),true);assert.equal(m.cookieAccess('abc',session,60),false);assert.equal(m.cookieAccess('abc',{...session,active:false},1),false);assert.equal(m.cookieAccess('other',session,1),false);
assert.deepEqual(m.wormStep([0],[]),[0,1]);assert.deepEqual(m.wormStep([0,1],[2]),[0,1]);
assert.equal(globalThis.ICT_TOPIC_SIMS.length, 22);
// DOM lifecycle smoke: run every lesson through its controls, then reset.
// This supplements the pure model checks; browser visual QA remains separate.
class FakeElement {
  constructor(tag) { this.tagName=tag; this.children=[]; this.attributes={}; this.className=''; this.dataset={}; this.listeners={}; this.style={setProperty(k,v){this[k]=v;}}; this._text=''; this.value=''; }
  set textContent(v){ this._text=String(v); this.children=[]; }
  get textContent(){ return this._text+this.children.map(c=>c.textContent).join(''); }
  append(...nodes){ this.children.push(...nodes); }
  replaceChildren(...nodes){ this.children=nodes; this._text=''; }
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);}
  getAttribute(k){return this.attributes[k]??null;}
  addEventListener(k,fn){this.listeners[k]=fn;}
  get classList(){const self=this;return {add(c){self.className+=' '+c;},remove(c){self.className=self.className.split(' ').filter(x=>x!==c).join(' ');},toggle(c,yes){this.remove(c);if(yes)this.add(c);}};}
  querySelectorAll(q){const result=[];function walk(n){n.children.forEach(c=>{if(q[0]==='.'&&c.className.split(' ').includes(q.slice(1)))result.push(c);walk(c);});}walk(this);return result;}
}
global.document={createElement:t=>new FakeElement(t),createElementNS:(ns,t)=>new FakeElement(t),createTextNode:t=>{const n=new FakeElement('#text');n.textContent=t;return n;}};
function descendants(n){return n.children.flatMap(c=>[c,...descendants(c)]);}
for (const sim of globalThis.ICT_TOPIC_SIMS) {
  const host=new FakeElement('div'), cleanup=[];
  sim.mount(host,{onCleanup:fn=>cleanup.push(fn)});
  const controls=descendants(host).filter(n=>n.tagName==='button');
  if(sim.id==='network-request-topology') controls.filter(b=>b.textContent.includes('索取檔案')).forEach(b=>b.listeners.click());
  const next=controls.find(b=>b.textContent==='下一步 →');
  for(let i=0;i<25&&next;i++)next.listeners.click();
  if(sim.id==='dns-cache-resolution'){
    const reset=controls.find(b=>b.textContent==='↺ 重設');reset.listeners.click();
    for(let i=0;i<4;i++)next.listeners.click();assert.match(host.textContent,/TTL 60 秒/);
    next.listeners.click();assert.match(host.textContent,/快取命中/);
    controls.find(b=>b.textContent==='時間前進 61 秒').listeners.click();assert.match(host.textContent,/已到期/);
    const input=descendants(host).find(n=>n.tagName==='input');input.value='<img src=x onerror=alert(1)>';input.oninput();next.listeners.click();assert.match(host.textContent,/有效域名/);
  }
  const reset=controls.find(b=>b.textContent==='↺ 重設');if(reset)reset.listeners.click();
  cleanup.forEach(fn=>fn());
  assert.ok(host.textContent.length>50,sim.id+' has visible explanation and controls');
}
delete global.document;
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const repo=path.resolve(__dirname,'..'),context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(repo,'assets/js/lesson-plan-network.js'),'utf8'),context);
for(const name of ['new-lessons','programming-lessons','programming-supplements'])vm.runInContext(fs.readFileSync(path.join(repo,'animations/assets/'+name+'.js'),'utf8'),context);
const plans=context.window.ICT_LESSON_PLANS;
assert.equal(Object.keys(plans).length,20);
for(const [page,entries] of Object.entries(plans)){
 const html=fs.readFileSync(path.join(repo,page+'.html'),'utf8');
 const metadataName=(html.match(/data-lesson="([^"]+)"/)||[])[1];
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
 if(metadataName)context.window.ICT_NEW_LESSONS[metadataName].sections.forEach((s,i)=>ids.add(s.id||'topic-'+i));
 assert.equal(new Set(entries.map(e=>e.sim)).size,entries.length,page+' should mount each mechanism once');
 for(const entry of entries){assert.ok(globalThis.ICT_TOPIC_SIMS.some(s=>s.id===entry.sim),page+' missing model '+entry.sim);assert.ok(ids.has(entry.target.slice(1)),page+' missing target '+entry.target);}
 for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi))if(!/\bsrc\s*=/.test(script[1]))new Function(script[2]);
}
for(const page of ['chc.2','animations/chc.2']){const html=fs.readFileSync(path.join(repo,page+'.html'),'utf8');assert.ok(!html.includes('function startTransmission('));assert.ok(!html.includes('function simulateDNS('));assert.ok(html.includes('function runIpconfig('));assert.ok(html.includes('function playEmailAnim('));assert.ok(html.includes('function playHttpAnim('));}
assert.equal(plans.pki_animation.length,0);assert.equal(plans['animations/pki_animation'].length,0);
assert.ok(!fs.readFileSync(path.join(repo,'chc.3.html'),'utf8').includes('data-stream-lab'));
assert.ok(!fs.readFileSync(path.join(repo,'chc.4.html'),'utf8').includes('data-code-lab'));
console.log('Network topics: models and 22 scene lifecycle checks passed; DNS cache / TTL / invalid input; 20 per-section plans, unique mounts, real section selectors and removed duplicates verified.');
