const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path = require('path');
const repo = path.join(__dirname, '..');
class Element {
  constructor(tag='div') { this.tagName=tag; this.value=''; this.textContent=''; this.innerText=''; this.innerHTML=''; this.style={}; this.children=[]; this.disabled=false; this.checked=false; this.className=''; this.attributes={}; const values=new Set(); this.classList={add:(...a)=>a.forEach(v=>values.add(v)), remove:(...a)=>a.forEach(v=>values.delete(v)), contains:v=>values.has(v), toggle:v=>values.has(v)?(values.delete(v),false):(values.add(v),true)}; }
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.children.push(item); return item; }
  replaceChildren(...items) { this.children=items; this.textContent=''; }
  setAttribute(k,v) { this.attributes[k]=v; }
  addEventListener() {}
}
function context(page) {
  const elements=new Map();
  const get=id=>{ if(!elements.has(id))elements.set(id,new Element()); return elements.get(id); };
  const document={getElementById:get,createElement:tag=>new Element(tag),querySelectorAll:()=>[],querySelector:sel=>get(sel),addEventListener(){},body:{},documentElement:{}};
  const pending=new Map();let serial=0;
  const ctx=vm.createContext({document,console,TextEncoder,alert:text=>{ctx.lastAlert=text},matchMedia:()=>({matches:false}),setTimeout:(fn)=>{pending.set(++serial,fn);return serial},clearTimeout:id=>pending.delete(id)});
  ctx.window=ctx;ctx.window.addEventListener=()=>{};
  const html=fs.readFileSync(path.join(repo,`cha.${page}.html`),'utf8');
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('src='));
  scripts.forEach((m,i)=>new vm.Script(m[2],{filename:`cha.${page} inline ${i}`} ).runInContext(ctx));
  return {ctx,get,html,pending};
}
const labsContext=vm.createContext({window:{},document:{addEventListener(){}}});
vm.runInContext(fs.readFileSync(path.join(repo,'assets/core-a-labs.js'),'utf8'),labsContext);
let count=0,steps=0;
for(let i=1;i<=5;i++){
  const {html}=context(i);
  const labs=labsContext.window.ICT_TOPIC_LABS[`cha.${i}`];
  const targets=new Set(labs.map(l=>l.target));
  [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].forEach(m=>assert(targets.has('#'+m[1]),`missing lab for ${i} ${m[1]}`));
  labs.forEach(l=>{assert(l.steps.length>=3);assert(l.question.answer>=0&&l.question.answer<l.question.options.length);count++;steps+=l.steps.length;});
}
{
  const {ctx,get,pending}=context(2);
  ctx.validateForm();assert(get('validationResult').innerHTML.includes('年齡範圍錯誤'));assert(get('validationResult').innerHTML.includes('學號長度錯誤'));assert(get('validationResult').innerHTML.includes('電郵格式錯誤'));
  get('inputAge').value='24';get('inputID').value='S1001';get('inputEmail').value='student@example.com';ctx.validateForm();assert(get('validationResult').innerHTML.includes('不證明資料真確'));
  get('inputAge').value='24.5';ctx.validateForm();assert(get('validationResult').innerHTML.includes('年齡範圍錯誤'));
  get('hkidInput').value='A123456';ctx.calculateHKID();assert.equal(get('hkidDigit').textContent,'(3)');
  get('hkidInput').value='A123456<script>';ctx.calculateHKID();assert(ctx.lastAlert);
  get('parityInput').value='1000001';ctx.runParityCheck('even');ctx.runParityCheck('odd');assert.equal(pending.size,1);
  pending.forEach(fn=>fn());assert.equal(get('parityDisplay').children.at(-1).textContent,'1');
}
{
  const {ctx,get}=context(3);
  get('charInput').value='A中😀<';ctx.inspectText();const rows=get('char-table-body').children;assert.equal(rows.length,4);assert.equal(rows[2].children[0].textContent,'😀');assert.equal(rows[3].children[0].textContent,'<');assert(rows[2].children[3].textContent.includes('4 Bytes'));
  get('decimalInput').value='2.5';ctx.generateShortDivision();assert(ctx.lastAlert.includes('65535'));
  assert.equal(ctx.formatBytes(1024),'1 KiB');
  get('calcW').value='640';get('calcH').value='480';get('calcD').value='24';ctx.calcFileSize();assert(get('sizeResult').innerHTML.includes('7,372,800'));
  get('binA').value='1011';get('binB').value='0110';ctx.calcBinary('add');assert(get('calcDisplay').innerHTML.includes('10001'));
}
{
  const {ctx,get}=context(5);
  vm.runInContext(`currentSQL=['SELECT','*','FROM','Students','WHERE','Class',"=","'4A'"];runSQL()`,ctx);
  assert(get('sqlResultBox').children[0].textContent.includes('3 筆'));
  vm.runInContext(`currentSQL=['SELECT','Name','FROM','Students','WHERE','Class',"=","'4B'"];runSQL()`,ctx);
  assert(get('sqlResultBox').children[0].textContent.includes('1 筆'));assert.equal(get('sqlResultBox').children[1].children[1].children[0].textContent,'Wong Mei Ling');
  vm.runInContext(`currentSQL=['WHERE','Students','FROM','SELECT'];runSQL()`,ctx);assert(get('sqlResultBox').textContent.includes('請檢查次序'));
  get('inputPK').value='<img src=x>';get('inputName').value='<script>';ctx.addRecord();const row=get('pkDemoBody').children[0];assert.equal(row.children[0].textContent,'<img src=x>');assert.equal(row.children[1].textContent,'<script>');
  ctx.moveProduct(1);assert.equal(get('productFormID').value,'P002');ctx.moveProduct(-1);assert.equal(get('productFormID').value,'P001');
}
console.log(`PASS: five page scripts, ${count} labs / ${steps} steps, section coverage, validation, parity replay, HKID, Unicode safety, binary, sizes, SQL, keys, form navigation.`);
