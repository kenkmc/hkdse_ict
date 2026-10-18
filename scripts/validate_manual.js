'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const C=require('../course-manual/manual-core.js');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(read('course_data.js'),ctx);
const platform=ctx.window.HKDSE_ICT;
const planContext={window:{},location:{pathname:'/index.html'},document:{readyState:'loading',addEventListener(){}},console};vm.createContext(planContext);
['data','network','algorithms','context'].forEach(name=>vm.runInContext(read('assets/js/lesson-plan-'+name+'.js'),planContext));
const packs=['data','network','programming','context'].map(n=>JSON.parse(read('course-manual/data/'+n+'.json')));
packs.forEach(p=>assert.equal(p.schemaVersion,1));
const units=packs.flatMap(p=>p.units),ids=new Set(units.map(u=>u.id));
assert.equal(ids.size,units.length,'Unit IDs must be unique');
assert.equal(units.length,27,'26 lessons plus SBA');
for(const item of platform.getItems().filter(i=>i.type==='lesson'||i.id==='tool-sba-prep'))assert(ids.has(item.id),'Missing manual: '+item.id);
const text=(s,msg,min=1)=>assert(typeof s==='string'&&s.trim().length>=min,msg);
const rows=obj=>{assert(Array.isArray(obj.headers)&&obj.headers.length>0);obj.rows.forEach(row=>assert.equal(row.length,obj.headers.length,'Table column count'));};
const allTaskIds=new Set();let sectionCount=0,taskCount=0,linkCount=0;
function task(t,key){
  assert(/^[a-z0-9-]+$/.test(t.id),'Task ID '+t.id);assert(!allTaskIds.has(key+'/'+t.id),'Duplicate task');allTaskIds.add(key+'/'+t.id);
  assert(['foundation','exam','transfer'].includes(t.level));text(t.question,'Question');text(t.answer,'Substantive answer',25);
  assert(t.hints.length>0);assert(t.marking.length>0);t.marking.forEach(m=>{text(m.point,'Marking point');assert(Number.isInteger(m.marks)&&m.marks>0);});
  if(t.table)rows(t.table);if(t.code){text(t.code.language,'Code language');text(t.code.text,'Code');}taskCount++;
}
for(const u of units){
  assert(platform.getItemById(u.id),'Unknown catalog ID '+u.id);text(u.title,'Unit title');text(u.intro,'Unit introduction',30);text(u.syllabusRef,'Syllabus ref');
  assert(u.outcomes.length>=4);assert(u.sections.length>=4);assert(u.vocabulary.length>=5);
  text(u.readiness.question,'Readiness question');text(u.readiness.answer,'Readiness answer');
  u.prerequisites.forEach(id=>{assert(ids.has(id),'Unknown prerequisite '+id);assert.notEqual(id,u.id);});
  const sids=new Set();
  for(const s of u.sections){
    assert(/^[a-z0-9-]+$/.test(s.id),'Section ID '+s.id);assert(!sids.has(s.id),'Duplicate section');sids.add(s.id);
    text(s.title,'Section title');assert(s.explanation.length>=2,'Continuous explanation required: '+u.id+'/'+s.id);
    assert(s.explanation.join('').length>=180,'Too little teaching prose: '+u.id+'/'+s.id);
    text(s.worked.question,'Worked question');assert(s.worked.steps.length>=2);text(s.worked.answer,'Worked answer');
    const q=s.check;text(q.question,'Check question');assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.feedback.length,4);assert.equal(new Set(q.feedback).size,4,'Option-specific feedback');
    assert(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);q.feedback.forEach(f=>text(f,'Check feedback',5));
    if(s.table)rows(s.table);
    for(const l of s.links||[]){text(l.label,'Link label');text(l.href,'Link URL');assert(!/^(?:javascript:|data:|\/\/)/i.test(l.href));
      if(!/^https?:/.test(l.href)){const file=l.href.split(/[?#]/)[0];assert(fs.existsSync(path.join(root,file)),u.id+' broken reference '+l.href);
        const anchor=l.href.split('#')[1];if(anchor){if(anchor.startsWith('sim-'))assert((planContext.window.ICT_LESSON_PLANS[file.replace(/\.html$/,'')]||[]).some(p=>'sim-'+p.sim===anchor),'Simulation is not mounted on target page: '+l.href);
          else{const safe=anchor.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');assert(new RegExp('\\bid\\s*(?:=|:)\\s*[\'\"]'+safe+'[\'\"]').test(read(file)),'Missing lesson anchor '+l.href);}}
      }
      linkCount++;
    }
    sectionCount++;
  }
  assert(u.practice.length>=6,'Six differentiated tasks: '+u.id);
  for(const level of ['foundation','exam','transfer'])assert(u.practice.some(t=>t.level===level),'Missing level '+u.id+'/'+level);
  u.practice.forEach(t=>task(t,u.id));
  const p=u.practical;assert(p.tools.length&&p.steps.length>=3&&p.deliverables.length&&p.tests.length>=2&&p.answerNotes.length);p.tests.forEach(t=>{text(t.input,'Test input');text(t.expected,'Expected result');text(t.reason,'Test purpose');});
  const t=u.teacher;assert(t.periods.length>=2,'Teacher sequence '+u.id);
  for(const period of t.periods){assert.equal(period.activities.reduce((s,a)=>s+a.minutes,0),period.minutes,'Teacher activity minutes');text(period.objective,'Teaching objective');period.activities.forEach(a=>{assert(a.minutes>0);text(a.action,'Concrete activity');text(a.evidence,'Learning evidence');});}
  text(t.diagnostic.question,'Diagnostic');text(t.diagnostic.expected,'Diagnostic answer');text(t.diagnostic.ifWrong,'Remediation');text(t.differentiation.support,'Support');text(t.differentiation.stretch,'Stretch');text(t.exitTicket.question,'Exit question');text(t.exitTicket.answer,'Exit answer');assert(u.mastery.length>=3);
  u.mastery.forEach(m=>{text(m.skill,'Skill');text(m.evidence,'Evidence');text(m.remediation,'Remediation');});
}
const visiting=new Set(),done=new Set();function visit(id){assert(!visiting.has(id),'Prerequisite cycle '+id);if(done.has(id))return;visiting.add(id);units.find(u=>u.id===id).prerequisites.forEach(visit);visiting.delete(id);done.add(id);}units.forEach(u=>visit(u.id));
const cases=JSON.parse(read('course-manual/data/integrated.json')).cases;assert.equal(cases.length,5);cases.forEach(c=>{assert(c.tasks.length>=3);c.electives.forEach(e=>assert(C.electives.includes(e)));c.tasks.forEach(t=>task(t,'case/'+c.id));});
const storageValues=new Map(),storage={getItem:k=>storageValues.get(k)||null,setItem:(k,v)=>storageValues.set(k,v),removeItem:k=>storageValues.delete(k)};
let state=C.read(storage);assert.equal(state.electives.length,0);assert.equal(C.route(units,state).length,19);
state.electives=['elective-a','elective-c'];assert.equal(C.route(units,state).length,24);
const a1=units.find(u=>u.id==='cha-1'),section=a1.sections[0],wrong=(section.check.correct+1)%4;
assert.equal(C.answerCheck(state,a1.id,section,wrong,1000).correct,false);
assert.equal(C.answerCheck(state,a1.id,section,section.check.correct,2000).firstCorrect,false,'A corrected answer is not an independent first success');
assert.equal(state.checks[a1.id+'/'+section.id].attempts,2);assert.equal(C.answerCheck(state,a1.id,section,-1),null);
assert.equal(C.checkRecord(a1,{...section,check:{...section.check,question:section.check.question+' revised'}},state),null,'Changed questions invalidate stale diagnostic evidence');
assert.equal(C.save(storage,state),true);assert.equal(C.read(storage).checks[a1.id+'/'+section.id].firstCorrect,false);
assert.equal(C.read({getItem(){throw Error('blocked');}}).lastUnit,'cha-1');assert.equal(C.save({setItem(){throw Error('full');}},state),false);
assert(C.escape('<script>"&').includes('&lt;script&gt;'));
assert.equal(C.normalise({electives:['elective-a','elective-a','bad','elective-b','elective-c']}).electives.length,2);
const firstTask=a1.practice[0];state.responses[a1.id+'/'+firstTask.id]={text:'My answer',points:[true]};
if(firstTask.marking.length>1)assert.equal(C.summary(a1,state).reviewed,0,'One rubric point cannot complete the task');
let next=C.next(units,C.fresh());assert(next.unit&&next.tab==='text');
for(const u of C.route(units,state)){for(const s of u.sections)C.answerCheck(state,u.id,s,s.check.correct,3000);for(const p of u.practice)state.responses[u.id+'/'+p.id]={text:'attempt'};state.practical[u.id]={note:'artifact and results'};}
assert.equal(C.next(units,state).view,'exam');assert(C.next(units,state).reason.includes('不是等級評定'));
const pc={window:{location:{},localStorage:storage,sessionStorage:storage,dispatchEvent(){},CustomEvent:function(){}} ,console,Date,Math};pc.CustomEvent=pc.window.CustomEvent;vm.createContext(pc);vm.runInContext(read('assets/js/progress_store.js'),pc);
const backup=pc.window.HKDSEProgress.exportData();assert(backup.legacy[C.storageKey]);pc.window.HKDSEProgress.clear();assert.equal(storageValues.has(C.storageKey),false);pc.window.HKDSEProgress.importData(backup);assert(storageValues.has(C.storageKey),'Manual answers survive central backup/restore');
const css=read('course-manual/manual.css'),js=read('course-manual/manual.js');assert(css.includes('body[data-print=student] .student-sheet'));assert(css.includes('.task-solution'));assert(js.includes('function studentSheet'));assert(js.includes('if(!String(r.text'));
console.log(JSON.stringify({status:'PASS',units:units.length,sections:sectionCount,tasks:taskCount,integratedCases:cases.length,teachingLinks:linkCount,checks:'coverage, prerequisites, examples, option feedback, teacher timing, state, route, backup, print separation'},null,2));
