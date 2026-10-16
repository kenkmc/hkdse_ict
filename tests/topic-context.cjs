const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');process.chdir(path.resolve(__dirname,'..'));let reducedMotion=true,rafId=0,cancelled=0;const queuedFrames=new Map();const c={window:{matchMedia:()=>({matches:reducedMotion})},requestAnimationFrame(fn){const id=++rafId;queuedFrames.set(id,fn);return id;},cancelAnimationFrame(id){cancelled++;queuedFrames.delete(id);}};vm.createContext(c);vm.runInContext(fs.readFileSync('assets/js/topic-context.js','utf8'),c);const m=c.window.ICTContextModels;
assert.equal(m.thresholdModel([[10,0],[20,0],[80,1],[90,1]]).errors,0);assert.equal(m.thresholdModel([[50,0],[50,1]]).errors,1);
assert(Math.abs(m.contrast('#000000','#ffffff')-21)<1e-10);assert.equal(m.contrast('#888888','#888888'),1);
assert.equal(m.licenseModel('BY',true,true,true).allowed,true);assert.equal(m.licenseModel('BY-ND',true,false,true).allowed,false);assert.equal(m.licenseModel('BY-NC',false,true,true).allowed,false);assert.equal(m.licenseModel('BY',false,false,false).allowed,false);
assert.equal(m.booking(12,14).conflict,false);assert.equal(m.booking(12,14,true).conflict,true);assert.equal(m.booking(9,11).conflict,true);assert.equal(m.booking(8,10).conflict,false);assert.equal(m.booking(14,12).valid,false);
assert.equal(m.printerCells('cube',0,4).length,36);assert.equal(m.printerCells('pyramid',3,4).length,9);assert.equal(m.printerCells('cube',4,4).length,0);
console.log('PASS context models: threshold learning, contrast, licensing conditions, booking boundary tests and layer slicing; '+c.window.ICT_TOPIC_SIMS.length+' bespoke scenes.');

// Exercise the real mounts/listeners in a small DOM, with controlled RAF time.
class Node {
 constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.style={};this.listeners={};this.className='';this.value='';this.disabled=false;this._text='';this.classList={add:(...v)=>{this.className+=' '+v.join(' ');}};}
 get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
 set textContent(v){this._text=v==null?'':String(v);this.children=[];}
 append(...nodes){nodes.forEach(n=>{n.parentElement=this;this.children.push(n);});}
 replaceChildren(...nodes){this._text='';this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attributes[k]=String(v);}
 addEventListener(name,fn){(this.listeners[name]||=[]).push(fn);}
 dispatch(name){(this.listeners[name]||[]).forEach(fn=>fn({target:this}));}
 click(){if(!this.disabled)this.dispatch('click');}
}
const walk=n=>[n,...n.children.flatMap(walk)];
const E=(tag,text,cls)=>{const n=new Node(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const S=(tag,attrs={})=>{const n=E(tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};
c.document={createElement:E,createElementNS:(_,tag)=>E(tag)};
const descriptors=c.window.ICT_TOPIC_SIMS,mounted=new Set();assert.equal(descriptors.length,7);
function mount(id){
 const descriptor=descriptors.find(d=>d.id===id);assert.ok(descriptor,id);const host=E('div'),cleanups=[],players=[];
 descriptor.mount(host,{E,S,field(parent,label,type,value,options=[]){const wrap=E('label',label),input=E(type==='select'?'select':'input');input.type=type;input.value=String(value);input.setAttribute('aria-label',label);options.forEach(([key,text])=>{const option=E('option',text);option.value=key;input.append(option);});wrap.append(input);parent.append(wrap);return input;},button(parent,text,fn){const b=E('button',text);b.addEventListener('click',fn);parent.append(b);return b;},playback(parent,actions){const player={actions,done:false,stops:0,stop(){this.stops++;},finish(value){this.done=Boolean(value);}};players.push(player);return player;},onCleanup(fn){cleanups.push(fn);}});mounted.add(id);
 return{host,players,field(label){const n=walk(host).find(n=>n.attributes['aria-label']===label);assert.ok(n,`${id}: ${label}`);return n;},change(label,value,event='input'){const n=this.field(label);n.value=String(value);n.dispatch(event);return n;},button(text){const n=walk(host).find(n=>n.tagName==='button'&&n.textContent===text);assert.ok(n,`${id}: button ${text}`);return n;},byClass(cls){const n=walk(host).find(n=>n.className.split(/\s+/).includes(cls));assert.ok(n,`${id}: .${cls}`);return n;},tag(tag){const n=walk(host).find(n=>n.tagName===tag);assert.ok(n,`${id}: <${tag}>`);return n;},get status(){return this.byClass('tc-status').textContent;},cleanup(){cleanups.forEach(fn=>fn());}};
}
function runFrame(time){const batch=[...queuedFrames.values()];queuedFrames.clear();batch.forEach(fn=>fn(time));}

// Abstraction preserves the answer; a changed goal or threshold recomputes it.
{
 const s=mount('problem-workbench');
 assert.equal(s.byClass('tc-spec-result').textContent,'(40 + 70 + 90) / 3 = 66.67');
 assert.equal(walk(s.tag('table')).filter(n=>n.tagName==='th').length,4);
 s.change('資料視圖','abstract');assert.equal(walk(s.tag('table')).filter(n=>n.tagName==='th').length,1);
 assert.equal(s.byClass('tc-spec-result').textContent,'(40 + 70 + 90) / 3 = 66.67');
 s.change('要解決的問題','pass');assert.equal(s.byClass('tc-spec-result').textContent,'李同學、黃同學');
 s.change('合格界線',80);assert.equal(s.byClass('tc-spec-result').textContent,'黃同學');
 s.change('合格界線',101);assert.match(s.status,/界線須為0–100/);s.cleanup();
}
// Reduced motion completes learning synchronously, without any animation task.
{
 reducedMotion=true;const s=mount('classifier-training');assert.match(s.byClass('tc-class-result').textContent,/界線 50/);
 const before=rafId;s.button('訓練分類器').click();assert.equal(rafId,before);
 assert.match(s.byClass('tc-class-result').textContent,/界線 36.*訓練誤判 0\/6/);assert.match(s.status,/訓練完成/);
 s.change('新樣本特徵值',20);assert.match(s.byClass('tc-class-result').textContent,/新樣本 20 → 類別 0/);
 s.change('訓練資料','biased','change');s.button('訓練分類器').click();assert.match(s.byClass('tc-class-result').textContent,/界線 16/);
 s.button('重設界線').click();assert.match(s.byClass('tc-class-result').textContent,/界線 50/);s.cleanup();
}
// Dataset changes, reset and page cleanup cancel an in-flight RAF chain.
{
 reducedMotion=false;const s=mount('classifier-training');s.button('訓練分類器').click();assert.equal(queuedFrames.size,1);
 runFrame(0);runFrame(450);assert.match(s.byClass('tc-class-result').textContent,/界線 43/);assert.equal(queuedFrames.size,1);
 const before=cancelled;s.change('訓練資料','noisy','change');assert.equal(queuedFrames.size,0);assert.equal(cancelled,before+1);
 assert.match(s.byClass('tc-class-result').textContent,/界線 50/);runFrame(1000);assert.match(s.byClass('tc-class-result').textContent,/界線 50/);
 s.button('訓練分類器').click();s.button('重設界線').click();assert.equal(queuedFrames.size,0);assert.match(s.status,/目前界線為50/);
 s.change('訓練資料','clean','change');s.button('訓練分類器').click();runFrame(0);runFrame(900);
 assert.equal(queuedFrames.size,0);assert.match(s.status,/訓練完成/);assert.match(s.byClass('tc-class-result').textContent,/界線 36/);
 s.button('訓練分類器').click();assert.equal(queuedFrames.size,1);s.cleanup();assert.equal(queuedFrames.size,0);reducedMotion=true;
}
// Complete all material deposits, then reset and change slicing parameters.
{
 const s=mount('layer-printer'),p=s.players[0];assert.match(s.status,/已鋪設 0\/144/);let steps=0;
 while(!p.done&&steps<200){p.actions.step();steps++;}assert.equal(steps,144);assert.equal(p.done,true);assert.match(s.status,/完成：共鋪設144格材料/);
 p.actions.reset();assert.equal(p.done,false);assert.match(s.status,/已鋪設 0\/144/);assert.ok(p.stops>0);
 s.change('物件形狀','pyramid');assert.match(s.status,/已鋪設 0\/86/);
 s.change('層數',1);assert.match(s.status,/已鋪設 0\/36/);steps=0;while(!p.done&&steps<50){p.actions.step();steps++;}
 assert.equal(steps,36);assert.equal(p.done,true);p.actions.reset();assert.equal(p.done,false);assert.match(s.status,/0\/36/);
 s.change('層數',0);assert.equal(p.done,true);assert.match(s.status,/層數須為1–6整數/);
 s.change('層數',2);assert.equal(p.done,false);assert.match(s.status,/0\/61/);s.cleanup();
}
// The actual display changes contrast, text sizing and redundant status labels.
{
 const s=mount('accessibility-lens');s.change('字體大小',24);assert.equal(s.byClass('tc-reader-screen').style.fontSize,'24px');
 s.change('文字顏色','#000000');s.change('背景顏色','#ffffff');assert.match(s.status,/對比值 21\.00/);
 s.change('狀態提示','text');assert.equal(s.button('相機 ✕ 已借出').disabled,true);
 s.button('投影機 ✓ 可借用').click();assert.match(s.status,/已選擇投影機/);
 const before=s.status;s.button('相機 ✕ 已借出').click();assert.equal(s.status,before);s.cleanup();
}
// The licensing route must change its verdict and reason as uses change.
{
 const s=mount('license-routing');assert.match(s.byClass('tc-license-verdict').textContent,/均已滿足/);
 s.change('作品許可','BY-ND');s.change('分享形式','adapted');assert.match(s.byClass('tc-license-verdict').textContent,/未滿足/);assert.match(s.status,/ND條款/);
 s.change('分享形式','original');assert.match(s.byClass('tc-license-verdict').textContent,/均已滿足/);
 s.change('作品許可','BY-NC');s.change('用途','commercial');assert.match(s.status,/NC條款/);
 s.change('作品許可','BY');s.change('署名','no');assert.match(s.status,/BY條件署名/);
 s.change('作品許可','reserved');assert.match(s.status,/需先取得適用許可/);s.cleanup();
}
// Unsent input and processing reset cannot silently issue an actuator command.
{
 const s=mount('sensor-greenhouse'),p=s.players[0];
 const lamp=()=>walk(s.host).find(n=>n.tagName==='circle'&&n.attributes.cx==='745'&&n.attributes.cy==='150');
 const fan=()=>walk(s.host).find(n=>n.tagName==='g'&&n.attributes.transform==='translate(745 260)');
 const on=()=>lamp().attributes.fill==='#ffdb64';assert.equal(on(),false);
 const code=s.tag('pre').textContent;assert.ok(code.includes('\n    if reading < 40:\n'),'rendered event-handler code must contain actual line breaks');assert.ok(!code.includes('\\n'),'rendered code must not display literal backslash-n escapes');
 s.change('待傳送光線讀數',30);s.button('傳送新事件').click();assert.equal(on(),false);assert.match(s.status,/事件載有光線讀數30/);
 p.actions.step();assert.equal(on(),false);assert.match(s.status,/30 < 40 為 True/);
 p.actions.step();assert.equal(on(),true);assert.equal(p.done,true);assert.match(s.status,/燈亮起/);
 assert.equal(fan().children[0].style.animation,'tc-fan 1.2s linear infinite');assert.equal(fan().attributes.transform,'translate(745 260)','rotate only the inner fan blades');
 s.change('開燈界線',20);assert.equal(on(),true,'threshold edits preserve the last actuator output');assert.equal(p.done,false);
 s.change('待傳送光線讀數',90);assert.equal(on(),true,'unsent input must not change the lamp');assert.match(s.status,/待傳送值 90/);
 p.actions.reset();assert.equal(on(),true,'reset preserves the last command');
 s.button('傳送新事件').click();assert.equal(on(),true);p.actions.step();assert.equal(on(),true);assert.match(s.status,/90 < 20 為 False/);
 p.actions.step();assert.equal(on(),false);assert.match(s.status,/燈熄滅/);assert.equal(fan().children[0].style.animation,'none');assert.ok(p.stops>0);s.cleanup();
}
// The rendered boundary regression changes from two failures to all successes.
{
 const s=mount('booking-testbench');assert.match(s.status,/預期接受，實際拒絕/);assert.equal(walk(s.tag('table')).filter(n=>n.className==='is-fail').length,2);
 s.change('實作版本','fixed');assert.match(s.status,/預期接受，實際接受/);assert.equal(walk(s.tag('table')).filter(n=>n.className==='is-fail').length,0);
 s.change('新預約開始',9);s.change('新預約結束',11);assert.match(s.status,/預期拒絕，實際拒絕/);
 s.change('新預約開始',14);s.change('新預約結束',12);assert.match(s.status,/開始早於結束/);
 s.button('測試相接時段12–14').click();assert.equal(s.field('新預約開始').value,'12');assert.equal(s.field('新預約結束').value,'14');assert.match(s.status,/預期接受，實際接受/);s.cleanup();
}
assert.equal(mounted.size,7);assert.equal(queuedFrames.size,0,'no classifier animation survives cleanup');
console.log('PASS all 7 context mounts/interactions: classifier motion/cancellation, printer completion/reset, persisted sensor output, readable code and booking boundary regression.');
