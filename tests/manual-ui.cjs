'use strict';
// Pure DOM fixtures with synthetic local records. No browser, network or school account.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require(process.env.MANUAL_JSDOM_MODULE||'jsdom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const units=['data','network','programming','context'].flatMap(n=>JSON.parse(read('course-manual/data/'+n+'.json')).units);
assert.equal(units.length,27,'Complete data packs are required before the UI regression');
const errors=[];
async function mount(query='',saved){
  const console=new VirtualConsole();console.on('jsdomError',e=>errors.push(String(e)));console.on('error',e=>errors.push(String(e)));
  const dom=new JSDOM(read('course-manual/index.html'),{url:'https://example.test/course-manual/index.html'+query,runScripts:'outside-only',virtualConsole:console,pretendToBeVisual:true});
  const w=dom.window;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.print=()=>{w.__printMode=w.document.body.dataset.print;};
  w.fetch=async url=>{const p=String(url).split('?')[0];assert(/^data\/(data|network|programming|context|integrated)\.json$/.test(p));return{ok:true,json:async()=>JSON.parse(read('course-manual/'+p))};};
  if(saved)w.localStorage.setItem('hkdse-ict-manual-v1',saved);
  ['course_data.js','assets/js/progress_store.js','course-manual/manual-core.js'].forEach(p=>w.eval(read(p)));
  await w.eval(read('course-manual/manual.js'));
  assert(!w.document.querySelector('#manual-main').textContent.includes('暫時未能載入'));
  return{dom,w,d:w.document};
}
function input(w,el,value){el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));}
function change(w,el,checked){el.checked=checked;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
let pageCount=0;
(async()=>{
 for(const u of units){for(const tab of ['text','practice','teacher','mastery']){
   const {dom,d}=await mount('?unit='+u.id+'&tab='+tab);
   assert.equal(d.querySelector('#screen-content h1').textContent,u.title);assert.equal(d.querySelectorAll('#unit-list a').length,27);
   const ids=Array.from(d.querySelectorAll('[id]'),e=>e.id);assert.equal(ids.length,new Set(ids).size,'Duplicate DOM IDs '+u.id+'/'+tab);
   assert.equal(d.querySelector('.unit-tabs [aria-current=page]').getAttribute('href'),'?unit='+u.id+'&tab='+tab);
   if(tab==='text'){assert.equal(d.querySelectorAll('.chapter[id]').length,u.sections.length);assert.equal(d.querySelectorAll('.check').length,u.sections.length);}
   if(tab==='practice'){assert.equal(d.querySelectorAll('#screen-content .task').length,u.practice.length);assert.equal(d.querySelectorAll('#screen-content .task-solution:not([hidden])').length,0);}
   for(const a of d.querySelectorAll('a[href^="#"]'))assert(d.getElementById(decodeURIComponent(a.hash.slice(1))),'Missing manual anchor '+a.href);
   pageCount++;dom.window.close();
 }}
 for(const view of ['start','path','teacher','exam']){const{dom,d}=await mount('?view='+view);assert(d.querySelector('#screen-content h1'));assert(d.querySelector('#screen-content').textContent.length>200);pageCount++;dom.window.close();}
 let p=await mount('?unit=cha-1');const first=units.find(u=>u.id==='cha-1').sections[0];
 let q=p.d.querySelector('[data-check="'+first.id+'"]');
 q.querySelector('[data-choice="'+((first.check.correct+1)%4)+'"]').click();assert(q.querySelector('.feedback').classList.contains('incorrect'));
 q.querySelector('[data-choice="'+first.check.correct+'"]').click();assert(q.querySelector('.feedback').classList.contains('correct'));assert(q.querySelector('.feedback').textContent.includes(first.check.feedback[first.check.correct]));
 let saved=p.w.localStorage.getItem('hkdse-ict-manual-v1');p.dom.window.close();p=await mount('?unit=cha-1',saved);
 q=p.d.querySelector('[data-check="'+first.id+'"]');assert(q.querySelector('[data-choice="'+first.check.correct+'"]').getAttribute('aria-pressed')==='true');p.dom.window.close();
 p=await mount('?unit=cha-1&tab=practice',saved);let task=p.d.querySelector('#screen-content .task'),reveal=task.querySelector('[data-reveal]');
 reveal.click();assert(task.querySelector('.task-solution').hidden,'Do not reveal before an attempt');
 input(p.w,task.querySelector('textarea'),'My attempt <img src=x onerror=alert(1)>');reveal.click();assert(!task.querySelector('.task-solution').hidden);
 assert.equal(p.d.querySelectorAll('img[onerror]').length,0,'Saved text must never become markup');
 let rubric=task.querySelector('[data-point]');change(p.w,rubric,true);let hints=task.querySelector('[data-hints]');hints.open=true;hints.dispatchEvent(new p.w.Event('toggle'));
 input(p.w,task.querySelector('textarea'),'Revised independent attempt');assert(!task.querySelector('[data-point]').checked,'Editing invalidates previous self-assessment');change(p.w,task.querySelector('[data-point]'),true);
 input(p.w,p.d.querySelector('[data-practical]'),'artifact-v2.csv; boundary passed');
 p.d.querySelector('[data-print=student]').click();assert.equal(p.w.__printMode,'student');assert(p.d.querySelector('.student-sheet').textContent.includes(first.title));assert.equal(p.d.querySelectorAll('.student-sheet .solution,.student-sheet .rubric,.student-sheet textarea').length,0,'Student sheet excludes exercise solutions, self marks and private notes');
 p.d.querySelector('[data-print=teacher]').click();assert.equal(p.w.__printMode,'teacher');assert(p.d.querySelector('.teacher-sheet').textContent.includes(units.find(u=>u.id==='cha-1').practice[0].answer));
 saved=p.w.localStorage.getItem('hkdse-ict-manual-v1');p.dom.window.close();p=await mount('?unit=cha-1&tab=practice',saved);
 task=p.d.querySelector('#screen-content .task');assert(task.querySelector('textarea').value.includes('Revised independent'));assert(!task.querySelector('.task-solution').hidden);assert(task.querySelector('[data-point]').checked);assert(p.d.querySelector('[data-practical]').value.includes('artifact-v2'));
 const restored=p.w.localStorage.getItem('hkdse-ict-manual-v1');p.w.localStorage.removeItem('hkdse-ict-manual-v1');p.w.dispatchEvent(new p.w.StorageEvent('storage',{key:'hkdse-ict-manual-v1',newValue:null}));assert.equal(p.d.querySelector('#screen-content .task textarea').value,'');assert.equal(p.w.localStorage.getItem('hkdse-ict-manual-v1'),null,'A different tab clearing records must not resurrect them');p.w.localStorage.setItem('hkdse-ict-manual-v1',restored);p.w.dispatchEvent(new p.w.StorageEvent('storage',{key:'hkdse-ict-manual-v1',newValue:restored}));assert(p.d.querySelector('#screen-content .task textarea').value.includes('Revised independent'));
 p.dom.window.close();p=await mount('?unit=cha-1&tab=mastery',saved);input(p.w,p.d.querySelector('[data-evidence]'),'My independent explanation file');saved=p.w.localStorage.getItem('hkdse-ict-manual-v1');p.dom.window.close();
 p=await mount('?view=path',saved);let boxes=p.d.querySelectorAll('[data-elective]');change(p.w,boxes[0],true);boxes=p.d.querySelectorAll('[data-elective]');change(p.w,boxes[1],true);boxes=p.d.querySelectorAll('[data-elective]');change(p.w,boxes[2],true);assert.equal(p.d.querySelectorAll('[data-elective]:checked').length,2);saved=p.w.localStorage.getItem('hkdse-ict-manual-v1');p.dom.window.close();
 p=await mount('?view=exam',saved);assert(p.d.querySelector('#screen-content').textContent.includes('選修 A＋B'));assert(!p.d.querySelector('#screen-content').textContent.includes('選修 A＋C'));assert(!p.d.querySelector('#screen-content').textContent.includes('選修 B＋C'));p.dom.window.close();
 p=await mount('?unit=does-not-exist');assert(p.d.querySelector('#screen-content').textContent.includes('找不到此課題'));p.dom.window.close();
 const importDom=new JSDOM(read('progress.html'),{url:'https://example.test/progress.html',runScripts:'outside-only'}),iw=importDom.window;
 ['course_data.js','assets/js/progress_store.js','assets/js/progress_dashboard.js'].forEach(file=>iw.eval(read(file)));
 const picker=iw.document.getElementById('progress-import');let pickerValue='';
 Object.defineProperty(picker,'value',{configurable:true,get:()=>pickerValue,set:value=>{pickerValue=value;}});
 const backupText=JSON.stringify({format:'hkdse-ict-progress-backup',progress:{events:[]},legacy:{'hkdse-ict-manual-v1':{schemaVersion:1,responses:{q:{text:'saved note'}}}}});
 async function selectBackup(text,size=1024){pickerValue='selected-backup.json';Object.defineProperty(picker,'files',{configurable:true,value:[{size,text:async()=>text}]});picker.dispatchEvent(new iw.Event('change',{bubbles:true}));await new Promise(resolve=>setImmediate(resolve));assert.equal(pickerValue,'','File input must reset after asynchronous success or failure');}
 await selectBackup(backupText);assert(iw.document.getElementById('progress-data-status').textContent.includes('已匯入'));
 await selectBackup('{');assert(iw.document.getElementById('progress-data-status').style.color);
 await selectBackup(backupText,33*1024*1024);assert(iw.document.getElementById('progress-data-status').textContent.includes('32 MiB'));
 await selectBackup(backupText);assert(iw.document.getElementById('progress-data-status').textContent.includes('已匯入'));importDom.window.close();
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',domViews:pageCount,tests:['all 27 units / four tabs','anchors and unique IDs','MCQ wrong/correct and reload','attempt before answer','escape saved HTML','rubric and notes persist','student/teacher print separation','two-elective limit and integrated filtering','unknown unit fallback','backup input resets after success, malformed file and size rejection; same file can be selected again'],limitation:'Pure DOM fixture; not a real-browser geometry or visual audit'},null,2));
})().catch(e=>{console.error(e);process.exit(1);});
