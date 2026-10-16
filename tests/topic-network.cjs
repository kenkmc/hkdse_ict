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
assert.equal(globalThis.ICT_TOPIC_SIMS.length, 10);
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
  const reset=controls.find(b=>b.textContent==='↺ 重設');if(reset)reset.listeners.click();
  cleanup.forEach(fn=>fn());
  assert.ok(host.textContent.length>50,sim.id+' has visible explanation and controls');
}
delete global.document;
console.log('Network topics: model assertions and 10 mount / step / reset lifecycle smoke checks passed.');
