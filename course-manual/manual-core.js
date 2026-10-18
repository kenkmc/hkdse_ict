(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ICTManualCore = api;
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  const storageKey = 'hkdse-ict-manual-v1';
  const electives = ['elective-a', 'elective-b', 'elective-c'];
  const plain = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const own = (x, k) => Object.prototype.hasOwnProperty.call(x, k);
  const escape = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fresh = () => ({schemaVersion:1, electives:[], checks:{}, responses:{}, evidence:{}, practical:{}, lastUnit:'cha-1'});
  function normalise(value) {
    const state = fresh();
    if (!plain(value)) return state;
    state.electives = [...new Set(Array.isArray(value.electives) ? value.electives : [])].filter(x => electives.includes(x)).slice(0,2);
    ['checks','responses','evidence','practical'].forEach(key => {
      if (!plain(value[key])) return;
      Object.entries(value[key]).slice(-3000).forEach(([id, record]) => {
        if (!/^[a-z0-9][a-z0-9:/-]{0,120}$/.test(id) || !plain(record)) return;
        if(key==='checks') {
          if(Number.isInteger(record.answer)&&record.answer>=0&&record.answer<4) state[key][id]={answer:record.answer,correct:record.correct===true,firstCorrect:record.firstCorrect===true,attempts:Math.min(1000,Math.max(1,Number(record.attempts)||1)),answeredAt:Number(record.answeredAt)||0,questionKey:String(record.questionKey||'').slice(0,10000)};
        } else if(key==='responses') state[key][id]={text:String(record.text||'').slice(0,30000),points:Array.isArray(record.points)?record.points.slice(0,100).map(x=>x===true):[],revealed:record.revealed===true,hintUsed:record.hintUsed===true,editedAt:Number(record.editedAt)||0};
        else state[key][id]={note:String(record.note||'').slice(0,key==='practical'?30000:10000),editedAt:Number(record.editedAt)||0};
      });
    });
    if (/^[a-z0-9-]{1,60}$/.test(value.lastUnit || '')) state.lastUnit = value.lastUnit;
    return state;
  }
  function read(storage) {
    try { return normalise(JSON.parse(storage.getItem(storageKey) || '{}')); }
    catch (_) { return fresh(); }
  }
  function save(storage, state) {
    try { storage.setItem(storageKey, JSON.stringify(normalise(state))); return true; }
    catch (_) { return false; }
  }
  function answerCheck(state, unitId, section, answer, now = Date.now()) {
    const q = section.check;
    if (!Number.isInteger(answer) || answer < 0 || answer >= q.options.length) return null;
    const id = unitId + '/' + section.id;
    const previous = checkRecord({id:unitId},section,state);
    const result = {answer, correct:answer === q.correct, firstCorrect:previous ? !!previous.firstCorrect : answer === q.correct,
      attempts:Math.min(1000,(Number(previous?.attempts) || 0)+1), answeredAt:now,questionKey:JSON.stringify([q.question,q.options,q.correct])};
    state.checks[id] = result;
    return result;
  }
  function checkRecord(unit,section,state) {
    const id=unit.id+'/'+section.id;
    if(!own(state.checks,id))return null;
    const r=state.checks[id],q=section.check;
    return r.questionKey===JSON.stringify([q.question,q.options,q.correct])?{...r,correct:r.answer===q.correct}:null;
  }
  function group(id) {
    if (/^ea-/.test(id)) return 'elective-a';
    if (/^eb-/.test(id)) return 'elective-b';
    if (/^ec-/.test(id)) return 'elective-c';
    return id === 'tool-sba-prep' ? 'sba' : 'core';
  }
  function route(units, state) { return units.filter(u => group(u.id) === 'core' || state.electives.includes(group(u.id))); }
  function summary(unit, state) {
    const checks = unit.sections.map(s => checkRecord(unit,s,state)).filter(Boolean);
    const responses = unit.practice.map(p => state.responses[unit.id+'/'+p.id]).filter(r => String(r?.text || '').trim());
    const reviewed = unit.practice.filter(p => {const r=state.responses[unit.id+'/'+p.id];return String(r?.text||'').trim()&&p.marking.every((_,i)=>r.points?.[i]===true);});
    const evidence = unit.mastery.filter((_,i) => String(state.evidence[unit.id+'/'+i]?.note || '').trim());
    return {answered:checks.length, correct:checks.filter(c => c.correct).length, total:unit.sections.length,
      attempted:responses.length, reviewed:reviewed.length, tasks:unit.practice.length, evidence:evidence.length,
      practical:!!String(state.practical[unit.id]?.note || '').trim()};
  }
  function next(units,state) {
    for (const unit of route(units,state)) {
      const section = unit.sections.find(s => !checkRecord(unit,s,state)?.correct);
      if (section) return {unit:unit.id,tab:'text',anchor:section.id,reason:'先做此節理解檢查；答錯可依回饋重讀例子。'};
      if (unit.practice.some(p => !String(state.responses[unit.id+'/'+p.id]?.text || '').trim())) return {unit:unit.id,tab:'practice',reason:'已有理解檢查紀錄，接着獨立完成尚未作答的練習。'};
      if (!String(state.practical[unit.id]?.note || '').trim()) return {unit:unit.id,tab:'practice',anchor:'practical',reason:'記錄實作成果及測試證據，再回課文核對。'};
    }
    return {unit:null,view:'exam',reason:'路徑內已有診斷、作答及實作紀錄；用陌生情境、限時模擬及教師批改檢查能否遷移。這些紀錄不是等級評定。'};
  }
  return Object.freeze({storageKey, electives, escape, fresh, normalise, read, save, answerCheck, checkRecord, group, route, summary, next});
});
