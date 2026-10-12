const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
execFileSync(process.execPath, [path.join(__dirname, 'build_teacher_resources.js'), '--check']);
const html = read('google-apps-script/TeacherAdminUI.html');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
assert(!/localStorage|sessionStorage|<script[^>]+src=|<link[^>]+https:/.test(html), 'Private console must not persist roster or load third-party scripts.');
assert(html.includes('[hidden]{display:none!important}'));
assert(read('google-apps-script/Code.gs').includes('return teacherAdminPage_()'));

let email = 'teacher@jcmkec.edu.hk';
let uuid = 0;
let locks = 0;
const cache = new Map();
const sheets = new Map();
const properties = new Map();
const spreadsheet = { getSheetByName: name => sheets.get(name), getUrl: () => 'https://docs.google.com/spreadsheets/d/TEST/edit' };
const context = {
  Date, console,
  PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key) || '', setProperty: (key,value) => properties.set(key,value), deleteProperty: key => properties.delete(key) }) },
  Session: { getActiveUser: () => ({ getEmail: () => email }), getEffectiveUser: () => ({ getEmail: () => 'teacher@jcmkec.edu.hk' }) },
  Utilities: {
    getUuid: () => (++uuid).toString(16).padStart(12, '0') + 'abcdef0123456789abcd',
    DigestAlgorithm: { SHA_256: 'sha256' },
    computeDigest: (_, value) => crypto.createHash('sha256').update(value).digest(),
    base64EncodeWebSafe: value => Buffer.from(value).toString('base64url')
  },
  CacheService: { getScriptCache: () => ({ get: key => cache.get(key), put: (key, value) => cache.set(key, value), remove: key => cache.delete(key) }) },
  LockService: { getScriptLock: () => ({ waitLock: () => { locks++; }, releaseLock: () => { locks--; } }) },
  SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, flush() {} },
  ScriptApp: { getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/TEST/exec' }) }
};
vm.createContext(context);
vm.runInContext(read('google-apps-script/Code.gs') + '\n' + read('google-apps-script/GoogleAuth.gs') + '\n' + read('google-apps-script/TeacherResources.gs') + '\n' + read('google-apps-script/TeacherAdmin.gs') + '\nthis.definitions = SCHOOL_SYNC_SHEETS; this.resources = TEACHER_ADMIN_RESOURCES;', context);
class FakeSheet {
  constructor(headers, headerRow=1) { this.rows = Array.from({ length: headerRow-1 }, () => []); this.rows.push([...headers]); this.writes = 0; }
  getLastRow() { return this.rows.length; }
  getLastColumn() { return Math.max(...this.rows.map(row=>row.length)); }
  getRange(row, column, height=1, width=1) {
    if (typeof row !== 'number') throw new Error('Test uses numeric ranges only.');
    const sheet = this;
    return {
      getValues() { return Array.from({length:height}, (_, index) => Array.from({length:width}, (_, col) => sheet.rows[row-1+index]?.[column-1+col] ?? '')); },
      setValues(values) { values.forEach((cells,index) => cells.forEach((value,col) => { if (!sheet.rows[row-1+index]) sheet.rows[row-1+index]=[]; sheet.rows[row-1+index][column-1+col]=value; })); sheet.writes++; return this; },
      setValue(value) { return this.setValues([[value]]); }, setNumberFormat() { return this; }
    };
  }
  appendRow(values) { this.rows.push([...values]); this.writes++; }
  deleteRow(row) { this.rows.splice(row-1,1); this.writes++; }
}
Object.entries(context.definitions).forEach(([key, definition]) => sheets.set(definition.name, new FakeSheet(definition.headers, key==='dashboard'?5:1)));
const sheet = key => sheets.get(context.definitions[key].name);
const append = (key, object) => sheet(key).appendRow(context.definitions[key].headers.map(field => object[field] ?? ''));
append('students', {StudentId:'STU-1',Class:'4A',ClassNo:'01',ChineseName:'測試甲',EnglishName:'TEST A',AccountKey:'PRIVATE-HASH',Status:'ACTIVE',LastLoginAt:new Date('2026-10-12T01:00:00Z')});
append('students', {StudentId:'STU-2',Class:'5B',ClassNo:'02',ChineseName:'測試乙',EnglishName:'TEST B',Status:'ACTIVE',ActivationCode:'ABCDEFGH'});
append('groups', {GroupId:'GRP-1',GroupName:'中四補底',GroupType:'LEVEL',AcademicYear:'2026-2027',Active:true});
append('dashboard', {StudentId:'STU-1',Class:'4A',ClassNo:'01',ChineseName:'測試甲',ActiveMinutes:15});
append('pages', {RecordKey:'P-1',StudentId:'STU-1',PageId:'chc-1',ActiveSeconds:120});
const bootstrap = context.teacherAdminBootstrap();
const token = bootstrap.token;
const rpc = (name, payload={}) => context[name]({...payload,token});
const rows = key => rpc('teacherAdminRead',{table:key}).rows;
const save = (table, values, row) => rpc('teacherAdminSave',{table,values,key:row?row._key:'',revision:row?row._revision:''});
const writeCount = () => [...sheets.values()].reduce((sum,item)=>sum+item.writes,0);
const expectNoWrite = (callback, pattern) => {const before=writeCount();assert.throws(callback,pattern);assert.equal(writeCount(),before);assert.equal(locks,0);};

assert(!JSON.stringify(bootstrap).includes('PRIVATE-HASH'));
assert(bootstrap.tables.find(item=>item.key==='students').columns.every(field=>field!=='AccountKey'));
assert.equal(rows('students')[0].LastLoginAt,'2026-10-12T01:00:00.000Z');
assert.equal(rows('students')[0]._linked,true);
assert(!JSON.stringify(rows('students')).includes('PRIVATE-HASH'));
assert.equal(rows('dashboard')[0].ActiveMinutes,15);
assert.equal(rpc('teacherAdminRead',{table:'students',className:'4A'}).total,1);
assert.equal(rpc('teacherAdminRead',{table:'pages',search:'測試甲'}).total,1);
assert.equal(rpc('teacherAdminRead',{table:'pages',studentId:'STU-2'}).total,0);
expectNoWrite(()=>rpc('teacherAdminSave',{table:'topics',values:{Score:99}}),/只供檢視/);
expectNoWrite(()=>rpc('teacherAdminRead',{table:'__proto__'}),/不支援/);
expectNoWrite(()=>context.teacherAdminRead({table:'students',token:'not-a-token'}),/過期/);

const publicNames=['teacherAdminBootstrap','teacherAdminRead','teacherAdminSave','teacherAdminAddMembers','teacherAdminImportStudents','teacherAdminGenerateCodes','teacherAdminRefresh','teacherAdminDeleteItem','teacherAdminUndo'];
email='student@jcmkec.edu.hk';
publicNames.forEach(name=>expectNoWrite(()=>context[name]({token,table:'students'}),/只有部署/));
email='outsider@gmail.com';
publicNames.forEach(name=>expectNoWrite(()=>context[name]({token}),/Workspace/));
email='teacher@jcmkec.edu.hk';

const first = rows('students')[0];
save('students',{Class:'4A',ClassNo:'01',ChineseName:'測試甲修訂',EnglishName:'TEST A',Status:'ACTIVE',AccountKey:'ATTACK',ActivationCode:'ATTACK'},first);
assert.equal(sheet('students').rows[1][5],'PRIVATE-HASH');
assert.equal(sheet('students').rows[1][2],'01');
assert.equal(sheet('students').rows[1][9].toISOString(),'2026-10-12T01:00:00.000Z');
expectNoWrite(()=>save('students',{ChineseName:'舊分頁修改'},first),/另一個頁面/);
expectNoWrite(()=>save('students',{Class:'4A',ClassNo:'1',ChineseName:'重複',EnglishName:'DUP',Status:'ACTIVE'}),/已存在/);
expectNoWrite(()=>save('groups',{GroupName:'=IMPORTXML("x")',GroupType:'CUSTOM',AcademicYear:'2026-2027',Active:true}),/公式/);
expectNoWrite(()=>rpc('teacherAdminImportStudents',{rows:[{Class:'6C',ClassNo:'01',ChineseName:'新增',EnglishName:'NEW'},{Class:'4A',ClassNo:'01',ChineseName:'重複',EnglishName:'DUP'}]}),/已存在/);
expectNoWrite(()=>rpc('teacherAdminImportStudents',{rows:[{Class:'6C',ClassNo:'01',ChineseName:'新增',EnglishName:'NEW'},{Class:'6C',ClassNo:'1',ChineseName:'重複',EnglishName:'DUP'}]}),/已存在/);
rpc('teacherAdminImportStudents',{rows:[{Class:'6C',ClassNo:'03',ChineseName:'新增',EnglishName:'NEW'}]});
assert.equal(rows('students').length,3);
rpc('teacherAdminAddMembers',{groupId:'GRP-1',studentIds:['STU-1','STU-2','STU-1']});
assert.equal(rows('groupMembers').length,2);
const member=rows('groupMembers')[0];save('groupMembers',{StudentId:'STU-1',GroupId:'GRP-1',Active:false},member);
rpc('teacherAdminAddMembers',{groupId:'GRP-1',studentIds:['STU-1']});
assert.equal(rows('groupMembers').length,2);assert.equal(rows('groupMembers')[0].Active,true);
expectNoWrite(()=>rpc('teacherAdminAddMembers',{groupId:'GRP-1',studentIds:['STU-1','missing']}),/不存在/);

save('assignments',{Title:'入門任務',Instructions:'閱讀及練習',StartAt:'2020-10-12T08:00:00+08:00',DueAt:'2026-10-19T23:59:00+08:00',Status:'DRAFT'});
const task=rows('assignments')[0];
assert.equal(task.StartAt,'2020-10-12T00:00:00.000Z');
expectNoWrite(()=>save('assignments',{Status:'PUBLISHED'},task),/派發對象/);
save('assignmentTargets',{AssignmentId:task.AssignmentId,TargetType:'GROUP',TargetId:'GRP-1',Active:true});
const requirement={AssignmentId:task.AssignmentId,ItemOrder:1,RequirementType:'VISIT_PAGE',ResourceId:'chc-1',TargetValue:1,MinimumPercentage:0,Required:true,DirectUrl:''};
save('assignmentItems',requirement);
assert.equal(rows('assignmentItems')[0].DirectUrl,'chc.1.html');
expectNoWrite(()=>save('assignmentItems',{...requirement,ResourceId:'nonexistent'}),/目錄/);
expectNoWrite(()=>save('assignmentItems',{...requirement,DirectUrl:'https://evil.example/x'}),/本網站/);
expectNoWrite(()=>save('assignmentItems',{...requirement,RequirementType:'COMPLETE_GAME',ResourceId:'cha-1'}),/沒有.*遊戲/);
expectNoWrite(()=>save('assignmentItems',{...requirement,RequirementType:'PRACTICE_ATTEMPTS',ResourceId:''}),/一個課題/);
expectNoWrite(()=>save('assignmentItems',{...requirement,MinimumPercentage:80}),/只適用/);
save('assignmentItems',{...requirement,ItemOrder:2,RequirementType:'MIN_ACCURACY',MinimumPercentage:60});
save('assignmentItems',{...requirement,ItemOrder:3,RequirementType:'COMPLETE_LAYER',ResourceId:'cha-1'});
save('assignments',{Status:'PUBLISHED'},rows('assignments')[0]);
expectNoWrite(()=>save('assignmentItems',requirement),/草稿/);
expectNoWrite(()=>rpc('teacherAdminDeleteItem',{key:rows('assignmentItems')[0]._key,revision:rows('assignmentItems')[0]._revision}),/草稿/);
assert.equal(context.buildSchoolData_(spreadsheet,'STU-1').assignments.length,1);
save('groups',{GroupName:'中四補底',GroupType:'LEVEL',AcademicYear:'2026-2027',Active:false},rows('groups')[0]);
assert.equal(context.buildSchoolData_(spreadsheet,'STU-1').assignments.length,0,'Inactive groups must not continue to receive assignments.');
save('assignments',{Status:'DRAFT'},rows('assignments')[0]);
const item=rows('assignmentItems')[0];
const removed=rpc('teacherAdminDeleteItem',{table:'students',key:item._key,revision:item._revision});
assert.equal(rows('students').length,3,'Delete endpoint must not accept a different table.');
assert.equal(rows('assignmentItems').length,2);
rpc('teacherAdminUndo',{undo:removed.undo});assert.equal(rows('assignmentItems').length,3);
expectNoWrite(()=>rpc('teacherAdminUndo',{undo:removed.undo}),/時限/);
assert.equal(locks,0);
assert.equal(context.resources.filter(resource=>resource.game).length,7);
assert.equal(context.resources.filter(resource=>resource.layers).length,26);
console.log('Teacher admin validation passed: owner-only RPC, privacy, all 13 schemas, CRUD, roster import, references, concurrency, publishing, inactive groups and undo.');
